from django.test import TestCase, RequestFactory, override_settings
from django.contrib.auth import get_user_model
from django.contrib.sessions.middleware import SessionMiddleware
from django.contrib.messages.storage.fallback import FallbackStorage
from django.urls import reverse
from django.http import HttpResponse
from django.contrib.auth.models import AnonymousUser
from django_admin_js.middleware import DjangoAdminJSMiddleware, get_impersonated_user
from django_admin_js.views import impersonate_start, impersonate_stop

User = get_user_model()

@override_settings(DJANGO_ADMIN_JS={"IMPERSONIFICATION": True})
class ImpersonationTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.superuser = User.objects.create_superuser(
            username="admin", email="admin@test.com", password="password"
        )
        self.regular_user = User.objects.create_user(
            username="regular", email="regular@test.com", password="password"
        )

    def _setup_request_session_and_messages(self, request):
        # Attach session and messages middleware compatibility to RequestFactory request
        middleware = SessionMiddleware(lambda r: None)
        middleware.process_request(request)
        request.session.save()
        
        # Attach fallback message storage
        messages = FallbackStorage(request)
        setattr(request, '_messages', messages)

    def test_impersonate_start_requires_superuser(self):
        request = self.factory.get(reverse("admin:impersonate_start", args=[self.regular_user.pk]))
        request.user = self.regular_user
        self._setup_request_session_and_messages(request)

        # Regular user should receive PermissionDenied
        from django.core.exceptions import PermissionDenied
        with self.assertRaises(PermissionDenied):
            impersonate_start(request, self.regular_user.pk)

    def test_impersonate_start_success(self):
        request = self.factory.get(reverse("admin:impersonate_start", args=[self.regular_user.pk]))
        request.user = self.superuser
        self._setup_request_session_and_messages(request)

        response = impersonate_start(request, self.regular_user.pk)
        
        # Should redirect to admin index
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse("admin:index"))
        
        # Check session keys
        self.assertEqual(request.session["impersonator_user_id"], self.superuser.pk)
        self.assertEqual(request.session["impersonate_user_id"], self.regular_user.pk)

    def test_impersonate_stop(self):
        request = self.factory.get(reverse("admin:impersonate_stop"))
        request.user = self.regular_user
        self._setup_request_session_and_messages(request)
        
        # Pre-set impersonation keys
        request.session["impersonator_user_id"] = self.superuser.pk
        request.session["impersonate_user_id"] = self.regular_user.pk

        response = impersonate_stop(request)
        
        # Should redirect to user admin changelist
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, reverse("admin:auth_user_changelist"))
        
        # Session keys should be cleared
        self.assertNotIn("impersonator_user_id", request.session)
        self.assertNotIn("impersonate_user_id", request.session)

    def test_middleware_applies_impersonation(self):
        # Create a mock request
        request = self.factory.get("/admin/")
        request.user = self.superuser
        self._setup_request_session_and_messages(request)
        
        # Pre-set impersonation keys
        request.session["impersonator_user_id"] = self.superuser.pk
        request.session["impersonate_user_id"] = self.regular_user.pk
        request.session.save()

        # Run middleware
        def get_response(req):
            # Assert user is impersonated inside the view/downstream
            self.assertEqual(req.user.pk, self.regular_user.pk)
            self.assertEqual(req.original_user.pk, self.superuser.pk)
            self.assertTrue(getattr(req, "is_impersonated", False))
            return HttpResponse("<html><body>Admin Content</body></html>", content_type="text/html")

        middleware = DjangoAdminJSMiddleware(get_response)
        response = middleware(request)

        # Assert HUD banner is injected in the HTML response
        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        self.assertIn("django-impersonation-hud", content)
        self.assertIn("Personifying <strong>regular</strong>", content)

    @override_settings(DJANGO_ADMIN_JS={"IMPERSONIFICATION": True, "IMPERSONIFICATION_REDIRECT": "/custom-dashboard/"})
    def test_impersonate_start_custom_redirect(self):
        request = self.factory.get(reverse("admin:impersonate_start", args=[self.regular_user.pk]))
        request.user = self.superuser
        self._setup_request_session_and_messages(request)
        
        response = impersonate_start(request, self.regular_user.pk)
        self.assertEqual(response.status_code, 302)
        self.assertEqual(response.url, "/custom-dashboard/")
