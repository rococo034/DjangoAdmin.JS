import sys
import traceback
from io import StringIO
from django.conf import settings
from django.http import Http404, HttpResponseForbidden, JsonResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.views.decorators.csrf import csrf_protect
from django.contrib import messages
from django_admin_js.web_shell.models import WebShell2FA
from django_admin_js.totp import generate_secret, verify_totp

def is_shell_enabled():
    config = getattr(settings, "DJANGO_ADMIN_JS", {})
    return config.get("DJANGO_WEB_SHELL", False)

def get_2fa_status(user):
    """Returns the user's WebShell2FA record or None."""
    try:
        return user.web_shell_2fa
    except WebShell2FA.DoesNotExist:
        return None

import time

def get_2fa_lifespan():
    config = getattr(settings, "DJANGO_ADMIN_JS", {})
    # Default 1 hour (3600 seconds)
    return config.get("DJANGO_WEB_SHELL_2FA_LIFESPAN", 3600)

def is_2fa_session_valid(request):
    """Checks if the 2FA verification session state is set and has not expired."""
    if not request.session.get("web_shell_verified", False):
        return False
    
    verified_at = request.session.get("web_shell_verified_at", 0)
    lifespan = get_2fa_lifespan()
    
    if time.time() - verified_at > lifespan:
        # Session expired, invalidate it
        request.session["web_shell_verified"] = False
        return False
        
    return True

def web_shell_view(request):
    if not is_shell_enabled():
        raise Http404("Web shell is disabled.")
    
    if not request.user.is_authenticated or not request.user.is_superuser:
        return HttpResponseForbidden("Access denied. Only superusers are allowed.")
    
    # Check 2FA setup status
    tfa = get_2fa_status(request.user)
    if not tfa or not tfa.is_confirmed:
        # Instead of redirecting to setup, render a "2FA Required/Not Configured" error screen
        from django.contrib import admin
        context = {
            **admin.site.each_context(request),
            "title": "2FA Richiesta",
            "subtitle": "Accesso bloccato",
            "has_permission": True,
            "is_popup": False,
            "is_nav_sidebar_enabled": True,
        }
        return render(request, "admin/web_shell_2fa_required.html", context)
        
    # Check if session is verified and hasn't expired for the shell
    if not is_2fa_session_valid(request):
        return redirect(reverse("admin:web_shell_2fa_verify"))
    
    from django.contrib import admin
    # Render the shell page
    context = {
        **admin.site.each_context(request),
        "title": "",
        "subtitle": "",
        "has_permission": True,
        "is_popup": False,
        "is_nav_sidebar_enabled": True,
        "py_version": sys.version.split()[0],
    }
    return render(request, "admin/web_shell.html", context)

@csrf_protect
def web_shell_2fa_verify(request):
    if not is_shell_enabled():
        raise Http404("Web shell is disabled.")
    
    if not request.user.is_authenticated or not request.user.is_superuser:
        return HttpResponseForbidden("Access denied. Only superusers are allowed.")
        
    tfa = get_2fa_status(request.user)
    if not tfa or not tfa.is_confirmed:
        return redirect(reverse("admin:web_shell"))
        
    # Already verified and valid
    if is_2fa_session_valid(request):
        return redirect(reverse("admin:web_shell"))
        
    from django.contrib import admin
    
    error_msg = None
    if request.method == "POST":
        token = request.POST.get("token", "").strip()
        if verify_totp(tfa.secret_key, token):
            request.session["web_shell_verified"] = True
            request.session["web_shell_verified_at"] = time.time()
            return redirect(reverse("admin:web_shell"))
        else:
            error_msg = "Codice 2FA non valido. Riprova."
            
    context = {
        **admin.site.each_context(request),
        "title": "Verifica 2FA - Web Shell",
        "subtitle": "Inserisci il codice di autenticazione",
        "error_msg": error_msg,
        "has_permission": True,
        "is_popup": False,
        "is_nav_sidebar_enabled": True,
    }
    return render(request, "admin/web_shell_2fa_verify.html", context)

@csrf_protect
def web_shell_execute(request):
    if not is_shell_enabled():
        return JsonResponse({"error": "Web shell is disabled."}, status=404)
    
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({"error": "Access denied. Only superusers are allowed."}, status=403)
        
    # Require 2FA verification session state (and check expiration)
    if not is_2fa_session_valid(request):
        return JsonResponse({"error": "Autenticazione 2FA richiesta o scaduta."}, status=403)
    
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=400)
    
    code = request.POST.get("code", "")
    if not code:
        return JsonResponse({"output": "", "error": ""})

    # Prepare execution context
    session_key = "_web_shell_globals"
    globals_dict = {}
    
    # Try loading variables from session
    serialized_globals = request.session.get(session_key, {})
    from django.apps import apps
    for app in apps.get_app_configs():
        for model in app.get_models():
            globals_dict[model.__name__] = model
            
    # Restore simple serialized values from previous runs
    for k, v in serialized_globals.items():
        globals_dict[k] = v

    # Redirect stdout and stderr
    old_stdout = sys.stdout
    old_stderr = sys.stderr
    redirected_output = StringIO()
    redirected_error = StringIO()
    sys.stdout = redirected_output
    sys.stderr = redirected_error

    exec_error = None
    try:
        try:
            compiled_code = compile(code, "<web-shell>", "eval")
            eval_res = eval(compiled_code, globals_dict)
            if eval_res is not None:
                print(repr(eval_res))
        except SyntaxError:
            compiled_code = compile(code, "<web-shell>", "exec")
            exec(compiled_code, globals_dict)
    except Exception as e:
        exec_error = traceback.format_exc()
    finally:
        sys.stdout = old_stdout
        sys.stderr = old_stderr

    # Clean up non-serializable objects from globals before saving to session
    serializable_globals = {}
    for k, v in globals_dict.items():
        if k.startswith("_") or k in ("apps", "sys", "traceback", "StringIO"):
            continue
        if isinstance(v, (int, float, str, bool, list, dict, type(None))):
            serializable_globals[k] = v

    request.session[session_key] = serializable_globals

    stdout_val = redirected_output.getvalue()
    stderr_val = redirected_error.getvalue()

    return JsonResponse({
        "output": stdout_val,
        "error": stderr_val or exec_error or ""
    })
