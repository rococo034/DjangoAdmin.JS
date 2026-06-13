from django.apps import AppConfig


class DjangoAdminJSConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "django_admin_js"
    verbose_name = "Django Admin JS"

    def ready(self):
        from django.conf import settings
        # Set X_FRAME_OPTIONS to SAMEORIGIN to allow the popup iframe modal to load admin pages
        if not hasattr(settings, 'X_FRAME_OPTIONS') or settings.X_FRAME_OPTIONS == 'DENY':
            settings.X_FRAME_OPTIONS = 'SAMEORIGIN'
