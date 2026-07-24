# Django Web Shell

La **Web Shell** integrata in `DjangoAdmin.JS` consente ai superuser dell'amministratore di sistema di eseguire codice Python interattivo direttamente dal browser all'interno del contesto dell'applicazione Django.

Per prevenire abusi e accessi illeciti, la Web Shell è blindata di default tramite **Autenticazione a due fattori (2FA)** obbligatoria ed esclusione del setup via web.

---

## 1. Abilitazione
Per abilitare la Web Shell:

1. Aggiungi `"django_admin_js.web_shell"` all'interno delle tue `INSTALLED_APPS` (subito dopo `"django_admin_js"`):

```python
# settings.py

INSTALLED_APPS = [
    "django_admin_js",
    "django_admin_js.web_shell",  # Aggiungi questa riga
    # ...
]
```

2. Esegui le migrazioni per creare la tabella del database per i codici 2FA:

```bash
python manage.py migrate
```

3. Attiva il flag `DJANGO_WEB_SHELL` all'interno del dizionario delle impostazioni `DJANGO_ADMIN_JS`:

```python
# settings.py

DJANGO_ADMIN_JS = {
    # ... altre impostazioni ...
    "DJANGO_WEB_SHELL": True,
}
```

---

## 2. Autenticazione a Due Fattori (2FA)
A causa della natura estremamente sensibile di uno strumento di esecuzione del codice arbitrario, **l'accesso è protetto da un secondo fattore di autenticazione temporaneo (TOTP)**.

### Configurazione via Terminale (Setup)
Per motivi di sicurezza, la 2FA non può essere inizializzata da web. Deve essere configurata da un amministratore direttamente sulla console del server eseguendo il comando di management:

```bash
python manage.py setup_web_shell_2fa <username>
```

Sostituisci `<username>` con il nome del superuser che desidera accedere alla shell. Il comando:
1. Genererà una chiave segreta univoca e la salverà nel database.
2. Disegnerà un **QR Code in formato ASCII** direttamente sulla console.
3. Mostrerà la chiave testuale per l'inserimento manuale.

Scansiona il QR Code visualizzato con la tua app di autenticazione preferita (es. Google Authenticator, Microsoft Authenticator o 1Password).

### Verifica dell'Accesso (Verify)
Una volta abilitato via terminale:
1. Clicca sull'icona della shell nella topbar dell'admin o digita `/shell` nella palette di comando.
2. Inserisci il codice OTP corrente a 6 cifre generato dalla tua app.
3. La sessione rimarrà verificata e autorizzata per tutta la durata del lifespan configurato.

---

## 3. Durata della sessione (Lifespan)
Di default, una volta inserito il codice 2FA valido, la sessione rimane autorizzata per **1 ora (3600 secondi)**.

Puoi personalizzare la durata della sessione modificando la chiave `DJANGO_WEB_SHELL_2FA_LIFESPAN` (in secondi) nei settings di `DJANGO_ADMIN_JS`:

```python
# settings.py

DJANGO_ADMIN_JS = {
    "DJANGO_WEB_SHELL": True,
    # Imposta la durata a 2 ore (7200 secondi)
    "DJANGO_WEB_SHELL_2FA_LIFESPAN": 7200, 
}
```

---

## 4. Gestione Amministratori & Revoca
Di default, il modello `WebShell2FA` non viene registrato nel pannello admin di Django per evitare interrogazioni non necessarie al database se la funzionalità non è in uso.

Puoi abilitare la visualizzazione e gestione delle chiavi attive registrate nel database impostando il flag `DJANGO_WEB_SHELL_ADMIN` su `True` nei settings:

```python
# settings.py

DJANGO_ADMIN_JS = {
    "DJANGO_WEB_SHELL": True,
    # Abilita la visualizzazione del modello nell'admin classico
    "DJANGO_WEB_SHELL_ADMIN": True,
}
```

Quando abilitato, nel pannello di amministrazione classico di Django, sotto la voce **Web Shell 2FA**, sarà possibile:
* Visualizzare quali superuser hanno configurato l'accesso 2FA attivo.
* **Revocare l'accesso**: Eliminando il record dell'utente dal database, l'accesso alla shell verrà immediatamente revocato. L'utente dovrà attendere che l'amministratore esegua nuovamente il comando `setup_web_shell_2fa` per configurare un nuovo Authenticator.
