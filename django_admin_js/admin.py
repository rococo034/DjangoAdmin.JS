from django.contrib import admin
from django.urls import path
from django.conf import settings
from django_admin_js.views import web_shell_view, web_shell_execute, web_shell_2fa_verify
from django_admin_js.web_shell.models import WebShell2FA

config = getattr(settings, "DJANGO_ADMIN_JS", {})
shell_enabled = config.get("DJANGO_WEB_SHELL", False)
shell_admin_enabled = config.get("DJANGO_WEB_SHELL_ADMIN", False)

# Register model in admin only if both shell and shell admin panel settings are explicitly True
if shell_enabled and shell_admin_enabled:
    @admin.register(WebShell2FA)
    class WebShell2FAAdmin(admin.ModelAdmin):
        list_display = ("user", "is_confirmed", "created_at")
        list_filter = ("is_confirmed", "created_at")
        search_fields = ("user__username", "user__email")
        readonly_fields = ("secret_key", "created_at")

# Hook Django Web Shell URLs into Django Admin Site (only if shell is enabled)
if shell_enabled:
    original_get_urls = admin.site.get_urls

    def new_get_urls():
        urls = original_get_urls()
        custom_urls = [
            path("web-shell/", admin.site.admin_view(web_shell_view), name="web_shell"),
            path("web-shell/execute/", admin.site.admin_view(web_shell_execute), name="web_shell_execute"),
            path("web-shell/2fa/verify/", admin.site.admin_view(web_shell_2fa_verify), name="web_shell_2fa_verify"),
        ]
        return custom_urls + urls

    admin.site.get_urls = new_get_urls
