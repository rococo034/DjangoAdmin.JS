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
    if getattr(settings, "DEBUG", False):
        return True
        
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
    
    # Check 2FA setup status
    if not getattr(settings, "DEBUG", False):
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
    if not is_shell_enabled() and not is_file_manager_enabled():
        raise Http404("Web shell/File manager is disabled.")
    
    if not request.user.is_authenticated or not request.user.is_superuser:
        return HttpResponseForbidden("Access denied. Only superusers are allowed.")
        
    tfa = get_2fa_status(request.user)
    if not tfa or not tfa.is_confirmed:
        return redirect(reverse("admin:index"))
        
    # Already verified and valid
    if is_2fa_session_valid(request):
        next_url = request.session.pop("2fa_next_url", reverse("admin:web_shell") if is_shell_enabled() else reverse("admin:file_manager"))
        return redirect(next_url)
        
    from django.contrib import admin
    
    error_msg = None
    if request.method == "POST":
        token = request.POST.get("token", "").strip()
        if verify_totp(tfa.secret_key, token):
            request.session["web_shell_verified"] = True
            request.session["web_shell_verified_at"] = time.time()
            next_url = request.session.pop("2fa_next_url", reverse("admin:web_shell") if is_shell_enabled() else reverse("admin:file_manager"))
            return redirect(next_url)
        else:
            error_msg = "Codice 2FA non valido. Riprova."
            
    context = {
        **admin.site.each_context(request),
        "title": "Verifica 2FA - Strumenti Amministrativi",
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


import os

def is_file_manager_enabled():
    config = getattr(settings, "DJANGO_ADMIN_JS", {})
    return config.get("DJANGO_FILE_MANAGER", False)

def get_file_manager_root():
    config = getattr(settings, "DJANGO_ADMIN_JS", {})
    root = config.get("DJANGO_FILE_MANAGER_ROOT", None)
    if not root:
        root = getattr(settings, "BASE_DIR", None)
    if not root:
        root = os.getcwd()
    return os.path.abspath(root)

def is_path_in_sandbox(path):
    sandbox_dir = get_file_manager_root()
    abs_path = os.path.abspath(path)
    sandbox_dir_with_sep = sandbox_dir if sandbox_dir.endswith(os.sep) else sandbox_dir + os.sep
    return abs_path == sandbox_dir or abs_path.startswith(sandbox_dir_with_sep)

def file_manager_view(request):
    if not is_file_manager_enabled():
        raise Http404("File manager is disabled.")
    
    # Check 2FA setup status
    if not getattr(settings, "DEBUG", False):
        tfa = get_2fa_status(request.user)
        if not tfa or not tfa.is_confirmed:
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
        
    # Check if session is verified and hasn't expired for the file manager
    if not is_2fa_session_valid(request):
        request.session["2fa_next_url"] = reverse("admin:file_manager")
        return redirect(reverse("admin:web_shell_2fa_verify"))
    
    from django.contrib import admin
    context = {
        **admin.site.each_context(request),
        "title": "",
        "subtitle": "",
        "has_permission": True,
        "is_popup": False,
        "is_nav_sidebar_enabled": True,
    }
    return render(request, "admin/file_manager.html", context)

@csrf_protect
def file_manager_api(request):
    if not is_file_manager_enabled():
        return JsonResponse({"error": "File manager is disabled."}, status=404)
    
    if not request.user.is_authenticated or not request.user.is_superuser:
        return JsonResponse({"error": "Access denied. Only superusers are allowed."}, status=403)
        
    if not is_2fa_session_valid(request):
        return JsonResponse({"error": "Autenticazione 2FA richiesta o scaduta."}, status=403)
    
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=400)
    
    action = request.POST.get("action")
    if not action:
        return JsonResponse({"error": "Missing action parameter."}, status=400)
    
    sandbox_root = get_file_manager_root()
    
    if action == "list":
        target_dir = request.POST.get("path", "")
        if not target_dir:
            target_dir = sandbox_root
        else:
            target_dir = os.path.abspath(target_dir)
            if not is_path_in_sandbox(target_dir):
                return JsonResponse({"error": "Accesso negato: percorso esterno alla sandbox."}, status=403)
        
        if not os.path.isdir(target_dir):
            return JsonResponse({"error": "La directory specificata non esiste."}, status=404)
        
        items = []
        try:
            for entry in os.scandir(target_dir):
                # Ignore hidden directories like .git, .venv, etc. to clean up and protect system configs
                if entry.name.startswith(".") and entry.name != ".env":
                    continue
                try:
                    stat = entry.stat()
                    is_dir = entry.is_dir()
                    items.append({
                        "name": entry.name,
                        "path": entry.path,
                        "is_dir": is_dir,
                        "size": stat.st_size if not is_dir else 0,
                        "modified": stat.st_mtime
                    })
                except OSError:
                    # Ignore entry if permission denied or file not found during scan
                    continue
        except Exception as e:
            return JsonResponse({"error": f"Impossibile leggere la directory: {str(e)}"}, status=500)
            
        items.sort(key=lambda x: (not x["is_dir"], x["name"].lower()))
        
        parent_dir = None
        resolved_parent = os.path.abspath(os.path.join(target_dir, ".."))
        if is_path_in_sandbox(resolved_parent):
            parent_dir = resolved_parent
            
        return JsonResponse({
            "current_path": target_dir,
            "parent_path": parent_dir,
            "items": items,
            "sandbox_root": sandbox_root
        })
        
    elif action == "read":
        target_file = request.POST.get("path", "")
        if not target_file:
            return JsonResponse({"error": "Missing path parameter."}, status=400)
            
        target_file = os.path.abspath(target_file)
        if not is_path_in_sandbox(target_file):
            return JsonResponse({"error": "Accesso negato: percorso esterno alla sandbox."}, status=403)
            
        if not os.path.isfile(target_file):
            return JsonResponse({"error": "Il file specificato non esiste o è una directory."}, status=404)
            
        try:
            with open(target_file, "r", encoding="utf-8", errors="strict") as f:
                content = f.read()
            return JsonResponse({
                "path": target_file,
                "content": content
            })
        except UnicodeDecodeError:
            return JsonResponse({"error": "Impossibile leggere: il file potrebbe essere binario o non codificato in UTF-8."}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Errore durante la lettura del file: {str(e)}"}, status=500)
            
    elif action == "write":
        target_file = request.POST.get("path", "")
        content = request.POST.get("content", "")
        if not target_file:
            return JsonResponse({"error": "Missing path parameter."}, status=400)
            
        target_file = os.path.abspath(target_file)
        if not is_path_in_sandbox(target_file):
            return JsonResponse({"error": "Accesso negato: percorso esterno alla sandbox."}, status=403)
            
        try:
            parent_dir = os.path.dirname(target_file)
            if not os.path.exists(parent_dir):
                return JsonResponse({"error": "La cartella di destinazione del file non esiste."}, status=400)
            
            with open(target_file, "w", encoding="utf-8") as f:
                f.write(content)
                
            return JsonResponse({"success": True, "path": target_file})
        except Exception as e:
            return JsonResponse({"error": f"Errore durante il salvataggio del file: {str(e)}"}, status=500)
            
    elif action == "create_dir":
        parent_path = request.POST.get("parent_path", "")
        dir_name = request.POST.get("name", "").strip()
        if not parent_path or not dir_name:
            return JsonResponse({"error": "Missing parameters."}, status=400)
            
        dir_name = os.path.basename(dir_name)
        if not dir_name or dir_name in (".", ".."):
            return JsonResponse({"error": "Nome cartella non valido."}, status=400)
            
        target_dir = os.path.abspath(os.path.join(parent_path, dir_name))
        if not is_path_in_sandbox(target_dir):
            return JsonResponse({"error": "Accesso negato: percorso esterno alla sandbox."}, status=403)
            
        try:
            os.makedirs(target_dir, exist_ok=False)
            return JsonResponse({"success": True, "path": target_dir})
        except FileExistsError:
            return JsonResponse({"error": "La cartella esiste già."}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Errore durante la creazione della cartella: {str(e)}"}, status=500)
            
    elif action == "create_file":
        parent_path = request.POST.get("parent_path", "")
        file_name = request.POST.get("name", "").strip()
        if not parent_path or not file_name:
            return JsonResponse({"error": "Missing parameters."}, status=400)
            
        file_name = os.path.basename(file_name)
        if not file_name or file_name in (".", ".."):
            return JsonResponse({"error": "Nome file non valido."}, status=400)
            
        target_file = os.path.abspath(os.path.join(parent_path, file_name))
        if not is_path_in_sandbox(target_file):
            return JsonResponse({"error": "Accesso negato: percorso esterno alla sandbox."}, status=403)
            
        try:
            with open(target_file, "x", encoding="utf-8") as f:
                pass
            return JsonResponse({"success": True, "path": target_file})
        except FileExistsError:
            return JsonResponse({"error": "Il file esiste già."}, status=400)
        except Exception as e:
            return JsonResponse({"error": f"Errore durante la creazione del file: {str(e)}"}, status=500)
            
    elif action == "download":
        target_path = request.POST.get("path", "")
        if not target_path:
            return JsonResponse({"error": "Missing path parameter."}, status=400)
            
        target_path = os.path.abspath(target_path)
        if not is_path_in_sandbox(target_path):
            return JsonResponse({"error": "Accesso negato: percorso esterno alla sandbox."}, status=403)
            
        if not os.path.isfile(target_path):
            return JsonResponse({"error": "Il file specificato non esiste o è una directory."}, status=404)
            
        try:
            from django.http import FileResponse
            import mimetypes
            
            content_type, _ = mimetypes.guess_type(target_path)
            if not content_type:
                content_type = 'application/octet-stream'
                
            response = FileResponse(open(target_path, 'rb'), content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(target_path)}"'
            # Prevent mime type sniffing
            response['X-Content-Type-Options'] = 'nosniff'
            return response
        except Exception as e:
            return JsonResponse({"error": f"Errore durante il download del file: {str(e)}"}, status=500)
            
    elif action == "delete":
        target_path = request.POST.get("path", "")
        if not target_path:
            return JsonResponse({"error": "Missing path parameter."}, status=400)
            
        target_path = os.path.abspath(target_path)
        if not is_path_in_sandbox(target_path):
            return JsonResponse({"error": "Accesso negato: percorso esterno alla sandbox."}, status=403)
            
        if target_path == sandbox_root:
            return JsonResponse({"error": "Impossibile eliminare la directory root della sandbox."}, status=403)
            
        try:
            if os.path.isdir(target_path):
                import shutil
                shutil.rmtree(target_path)
                return JsonResponse({"success": True, "message": "Cartella eliminata con successo."})
            elif os.path.isfile(target_path):
                os.remove(target_path)
                return JsonResponse({"success": True, "message": "File eliminato con successo."})
            else:
                return JsonResponse({"error": "L'elemento specificato non esiste."}, status=404)
        except Exception as e:
            return JsonResponse({"error": f"Errore durante l'eliminazione: {str(e)}"}, status=500)
            
    return JsonResponse({"error": "Unsupported action."}, status=400)

