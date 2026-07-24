import traceback
from django.conf import settings
from django.http import JsonResponse

class DjangoAdminJSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

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
