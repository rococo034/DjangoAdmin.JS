from django.db import models
from django.conf import settings

class WebShell2FA(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="web_shell_2fa",
        verbose_name="User"
    )
    secret_key = models.CharField(max_length=32, verbose_name="Secret Key")
    is_confirmed = models.BooleanField(default=False, verbose_name="Confirmed")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")

    class Meta:
        verbose_name = "Web Shell 2FA"
        verbose_name_plural = "Web Shell 2FA Records"

    def __str__(self):
        return f"2FA for {self.user.get_username()}"
