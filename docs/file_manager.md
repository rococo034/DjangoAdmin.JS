# Django File Manager

Il **File Manager** integrato in `DjangoAdmin.JS` consente ai superuser dell'amministratore di sistema di navigare, leggere, modificare, aggiungere, scaricare ed eliminare file e directory sul file system direttamente dal browser all'interno del contesto dell'applicazione Django.

Per prevenire abusi e accessi illeciti, il File Manager è blindato di default tramite **Autenticazione a due fattori (2FA)** obbligatoria (la stessa condivisa con la Web Shell) e un sistema di sandboxing che limita le operazioni all'interno di una cartella radice predefinita.

---

## 1. Abilitazione
Per abilitare il File Manager:

1. Attiva il flag `DJANGO_FILE_MANAGER` all'interno del dizionario delle impostazioni `DJANGO_ADMIN_JS` in `settings.py`:

```python
# settings.py

DJANGO_ADMIN_JS = {
    # ... altre impostazioni ...
    "DJANGO_FILE_MANAGER": True,
}
```

2. (Opzionale) Configura una directory radice personalizzata tramite `DJANGO_FILE_MANAGER_ROOT`. Di default, se non specificata, la cartella radice corrisponde a `settings.BASE_DIR`:

```python
# settings.py

DJANGO_ADMIN_JS = {
    "DJANGO_FILE_MANAGER": True,
    # Limita l'esplorazione alla cartella 'media'
    "DJANGO_FILE_MANAGER_ROOT": os.path.join(BASE_DIR, "media"),
}
```

---

## 2. Autenticazione a Due Fattori (2FA) & Sicurezza
L'accesso al File Manager è protetto dagli stessi meccanismi di sicurezza della Web Shell.

### Sandboxing & Path Traversal Protection
Tutti i percorsi inoltrati tramite richieste API vengono normalizzati in percorsi assoluti ed esaminati per garantire che risiedano rigorosamente all'interno della directory definita da `DJANGO_FILE_MANAGER_ROOT`. Qualsiasi tentativo di uscire dalla sandbox (es. tramite sequenze `../`) viene respinto con un errore HTTP 403 Forbidden.

### Integrità e Bypassing in Debug
* **Verifica 2FA**: Per accedere, l'utente deve aver configurato la 2FA (tramite il comando `setup_web_shell_2fa`).
* **Bypass in Sviluppo (Debug)**: Quando `settings.DEBUG = True`, il controllo 2FA e la richiesta di configurazione vengono saltati automaticamente per facilitare i test di sviluppo locale.

---

## 3. Funzionalità ed Interfaccia Utente

* **Navigazione & Icone dinamiche**: Visualizzazione ad albero dei file con icone dinamiche e colorate in base all'estensione del file (in stile VS Code).
* **Editor di Codice Monaco**: Visualizzazione e modifica dei file di testo integrando **Monaco Editor** (stesso motore di VS Code) con auto-rilevamento della sintassi e salvataggio rapido (anche tramite scorciatoia `Ctrl + S` o `Cmd + S`).
* **Gestione File Binari**: Se un file non può essere letto (perché binario o con codifica differente da UTF-8), l'editor mostra un avviso ma lascia intatta la possibilità di scaricarlo o eliminarlo.
* **Creazione di File/Cartelle**: Tramite pulsanti dedicati "+ File" e "+ Cartella" nella barra laterale.
* **Azioni in Riga (Inline)**: Scaricamento diretto ed eliminazione sicura (con prompt di conferma) disponibili al passaggio del mouse a fianco di ciascun elemento nella barra laterale.
* **Schermo Intero**: Pulsante dedicato in alto a destra per ingrandire l'esplora file occupando l'intero schermo del browser.
