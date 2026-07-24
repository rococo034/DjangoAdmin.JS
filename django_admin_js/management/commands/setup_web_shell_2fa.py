import sys
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django_admin_js.web_shell.models import WebShell2FA
from django_admin_js.totp import generate_secret

class Command(BaseCommand):
    help = "Inizializza o rigenera la chiave 2FA per l'accesso alla Web Shell di un superuser."

    def add_arguments(self, parser):
        parser.add_argument("username", type=str, help="Username del superuser da abilitare")

    def handle(self, *args, **options):
        username = options["username"]
        User = get_user_model()

        try:
            user = User.objects.get(**{User.USERNAME_FIELD: username})
        except User.DoesNotExist:
            raise CommandError(f"L'utente '{username}' non esiste nel database.")

        if not user.is_superuser:
            raise CommandError(f"L'utente '{username}' non è un superuser. Solo i superuser possono usare la Web Shell.")

        # Generate new secret
        secret = generate_secret()

        # Save or update record in DB
        tfa, created = WebShell2FA.objects.get_or_create(user=user)
        tfa.secret_key = secret
        tfa.is_confirmed = True
        tfa.save()

        # Generate standard OTP URI
        otp_uri = f"otpauth://totp/DjangoAdminJS:{username}?secret={secret}&issuer=DjangoAdminJS"

        self.stdout.write(self.style.SUCCESS(f"\n[OK] 2FA abilitata con successo per l'utente '{username}'!\n"))
        self.stdout.write(f"Chiave segreta (da inserire manualmente se necessario): {secret}\n")
        self.stdout.write("Scansiona il QR Code qui sotto con la tua app di autenticazione (Google Authenticator, Microsoft, ecc.):\n")

        # Draw ASCII QR Code in terminal to let the sysadmin scan it directly
        try:
            import qrcode
            qr = qrcode.QRCode(version=1, box_size=1, border=2)
            qr.add_data(otp_uri)
            qr.make(fit=True)
            
            # Print text-based QR Code to terminal
            # using output to stdout directly
            qr.print_ascii(out=sys.stdout, tty=True)
        except ImportError:
            self.stdout.write(self.style.WARNING(
                "\n[Nota] Il pacchetto 'qrcode' non è installato nel tuo ambiente virtuale.\n"
                "Installa 'qrcode' per visualizzare il QR Code direttamente nel terminale:\n"
                "  pip install qrcode\n"
                "In alternativa, puoi inserire manualmente la chiave segreta riportata sopra nell'app."
            ))
        
        self.stdout.write("\n")
