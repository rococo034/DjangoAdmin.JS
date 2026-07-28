import traceback
from django.conf import settings
from django.http import JsonResponse
from django.utils.functional import SimpleLazyObject
from django.contrib.auth import get_user_model
from django.utils.translation import gettext as _

def get_impersonated_user(request):
    if not hasattr(request, '_real_user'):
        from django.contrib.auth.middleware import get_user
        request._real_user = get_user(request)
        
    real_user = request._real_user
    if not real_user.is_authenticated:
        return real_user
        
    # Access session (guaranteed to be set when this lazy function is evaluated)
    session = getattr(request, "session", None)
    if session is None:
        return real_user
        
    impersonator_id = session.get("impersonator_user_id")
    impersonate_id = session.get("impersonate_user_id")
    
    if impersonator_id and impersonate_id:
        User = get_user_model()
        try:
            original_user = User.objects.get(pk=impersonator_id, is_active=True, is_superuser=True)
            impersonated_user = User.objects.get(pk=impersonate_id)
            
            request.original_user = original_user
            request.is_impersonated = True
            return impersonated_user
        except User.DoesNotExist:
            session.pop("impersonator_user_id", None)
            session.pop("impersonate_user_id", None)
            
    return real_user

class DjangoAdminJSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Wrap request.user lazily to handle impersonation
        config = getattr(settings, "DJANGO_ADMIN_JS", {})
        if config.get("IMPERSONIFICATION", True):
            # Capture pre-existing user if already set (like in tests)
            if hasattr(request, "user") and not isinstance(request.user, SimpleLazyObject):
                request._real_user = request.user
            request.user = SimpleLazyObject(lambda: get_impersonated_user(request))
            
        response = self.get_response(request)

        
        # Inject HUD banner if impersonation is active
        if getattr(request, "is_impersonated", False):
            response = self.inject_impersonation_hud(request, response)
            
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        config = getattr(settings, "DJANGO_ADMIN_JS", {})
        if config.get("IMPERSONIFICATION", True):
            # Re-wrap request.user after downstream middlewares (like AuthenticationMiddleware)
            # have finished their request phase processing.
            if hasattr(request, "user"):
                from django.utils.functional import SimpleLazyObject
                if isinstance(request.user, SimpleLazyObject):
                    from django.contrib.auth.middleware import get_user
                    request._real_user = get_user(request)
                else:
                    request._real_user = request.user
                request.user = SimpleLazyObject(lambda: get_impersonated_user(request))
        return None

    def inject_impersonation_hud(self, request, response):
        content_type = response.get("Content-Type", "")
        if "text/html" not in content_type:
            return response
            
        try:
            content = response.content.decode("utf-8", errors="ignore")
        except Exception:
            return response
            
        from django.urls import reverse
        stop_url = reverse("admin:impersonate_stop")
        
        hud_html = f"""
        <!-- DjangoAdmin.JS Impersonation HUD -->
        <div id="django-impersonation-hud" style="position: fixed; top: 24px; left: 24px; z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; gap: 10px; background: #0f172a; color: #f8fafc; padding: 8px 14px; border-radius: 14px; border: 1px solid #334155; box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 10px 20px -10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1); transition: all 0.2s ease;">
            <!-- Icon Indicator (Clickable to toggle) -->
            <div onclick="toggleImpersonationHUD()" style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 8px; background: rgba(99, 102, 241, 0.2); border: 1px solid rgba(99, 102, 241, 0.3); cursor: pointer; shrink: 0;">
                <i class="fa-solid fa-user-secret" style="font-size: 12px; color: #a5b4fc;"></i>
            </div>
            
            <!-- Collapsible Wrapper -->
            <div id="django-impersonation-hud-collapsible" style="display: flex; align-items: center; gap: 12px; transition: all 0.2s ease;">
                <span style="font-size: 12.5px; font-weight: 500; color: #e2e8f0; letter-spacing: -0.01em; white-space: nowrap;">
                    {_("Personifying")} <strong>{request.user.username}</strong>
                </span>
                <div style="height: 14px; width: 1px; background: rgba(255, 255, 255, 0.15); shrink: 0;"></div>
                <a href="{stop_url}" style="display: inline-flex; align-items: center; justify-content: center; height: 26px; padding: 0 12px; font-size: 11px; font-weight: 600; text-decoration: none; color: #ffffff; background: #ef4444; border-radius: 8px; cursor: pointer; transition: all 0.15s ease;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'" data-pjax="false">
                    {_("Stop")}
                </a>
            </div>
            
            <!-- Chevron Toggle Button -->
            <div onclick="toggleImpersonationHUD()" style="display: flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 4px; cursor: pointer; color: #94a3b8; transition: color 0.15s ease;" onmouseover="this.style.color='#f8fafc'" onmouseout="this.style.color='#94a3b8'">
                <i id="django-impersonation-hud-chevron" class="fa-solid fa-chevron-left" style="font-size: 10px;"></i>
            </div>
        </div>
        <script>
            function toggleImpersonationHUD() {{
                const hud = document.getElementById('django-impersonation-hud');
                const collapsible = document.getElementById('django-impersonation-hud-collapsible');
                const chevron = document.getElementById('django-impersonation-hud-chevron');
                
                const isCollapsed = hud.getAttribute('data-collapsed') === 'true';
                
                if (isCollapsed) {{
                    collapsible.style.display = 'flex';
                    chevron.className = 'fa-solid fa-chevron-left';
                    hud.style.padding = '8px 14px';
                    hud.setAttribute('data-collapsed', 'false');
                }} else {{
                    collapsible.style.display = 'none';
                    chevron.className = 'fa-solid fa-chevron-right';
                    hud.style.padding = '8px';
                    hud.setAttribute('data-collapsed', 'true');
                }}
            }}
        </script>
        """
        
        body_end = content.rfind("</body>")
        if body_end != -1:
            content = content[:body_end] + hud_html + content[body_end:]
            response.content = content.encode("utf-8")
            if "Content-Length" in response:
                response["Content-Length"] = str(len(response.content))
                
        return response


    def process_exception(self, request, exception):
        # Handle exceptions for admin paths
        if not request.path.startswith('/admin/'):
            return None

        # Detect AJAX/fetch requests
        is_ajax = (
            request.headers.get('x-requested-with') == 'XMLHttpRequest' or
            'application/json' in request.headers.get('accept', '') or
            request.headers.get('sec-fetch-mode') == 'cors'
        )
        if not is_ajax:
            return None

        config = getattr(settings, "DJANGO_ADMIN_JS", {})
        # Error levels: 'generic', 'title', 'stacktrace'
        error_level = config.get("ERROR_LEVEL", "title")

        tb = traceback.format_exc()

        if error_level == "stacktrace":
            response_data = {
                "error": str(exception),
                "stacktrace": tb.splitlines()
            }
        elif error_level == "title":
            response_data = {
                "error": str(exception)
            }
        else:  # generic
            response_data = {
                "error": "An error occurred during submission (500 Internal Server Error)"
            }

        return JsonResponse(response_data, status=500)
