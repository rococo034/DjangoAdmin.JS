# DjangoAdmin.JS

[![PyPI version](https://img.shields.io/pypi/v/django-admin-js.svg)](https://pypi.org/project/django-admin-js/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern Django Admin experience built with Tailwind CSS and progressive JavaScript enhancements. Features a redesigned UI, improved UX, asynchronous interactions, dynamic visual styles, and a spotlight-like command palette for a faster, more responsive administration panel.

---

## ✨ Features

- 🎨 **Tailwind CSS Driven**: Clean, premium aesthetics using the latest utility-first CSS configurations.
- 📱 **Responsive Layout**: Optimized for mobile, tablet, and desktop viewports.
- 🌗 **Dark Mode Support**: Built-in support for dark themes with instant toggle and preferences syncing.
- ⚡ **AJAX Navigation Engine (PJAX)**: Intercepts navigation, pagination, search, and sorting to update content instantly without page reloads.
- 📩 **Asynchronous Forms & Actions**: Form submissions and deletes happen in the background, complete with inline error handling and success toasts.
- ⚙️ **Unified Settings**: Configure all behaviors (like live-search, default themes, and styling modes) within a single global dictionary in your settings.
- 🎭 **Dynamic Layout Styles**: 
  - `default`: Sleek rounded card modules with subtle shadows (Apple/Tailwind style).
  - `glassmorphism`: Frosty translucent glass panels with real-time backdrop blur.
  - `minimalist`: Flat borderless layout with high contrast dark borders and focused input rings.
- 🛠️ **Theme & Style Picker**: Let admins customize color palettes and layout presets dynamically on the fly.
- 🔍 **Raycast-Style Command Palette (`Ctrl+K` / `Cmd+K`)**: Spotlight-like search launcher with categorized options, matching keyword highlighting, and live style command executions (e.g. `/style glassmorphism`, `/color emerald`, `/mode dark`).

---

## 🚀 Quick Start

### 1. Installation

Install via pip:

```bash
pip install django-admin-js
```

### 2. Configuration

Add `django_admin_js` to your `INSTALLED_APPS` **before** `django.contrib.admin`:

```python
INSTALLED_APPS = [
    "django_admin_js",  # Must be before admin
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # ... your apps
]
```

### 3. Customization Options (Optional)

You can customize behaviors, visual styles, and color themes of DjangoAdmin.JS by adding the `DJANGO_ADMIN_JS` settings dictionary in your `settings.py`:

```python
DJANGO_ADMIN_JS = {
    # Enable/Disable Live Search (As-You-Type instant filtering in list views)
    "LIVE_SEARCH": True,

    # Enable/Disable the Header Theme & Layout Switcher popover widget
    "THEME_PICKER": True,

    # Initial color theme preset (defaults to "indigo" if not specified)
    # Built-in presets: "indigo", "emerald", "amber", "rose", "violet", "ocean"
    "DEFAULT_THEME": "indigo",

    # Initial graphic layout style 
    # Options: "default", "glassmorphism", "minimalist"
    "THEME_STYLE": "default",
}
```

---

## 📊 Compatibility

- **Django**: 5.0, 5.1, 5.2+
- **Python**: 3.10, 3.11, 3.12+

---

## 🛠 Local Development & Demo

To test and develop `django-admin-js` locally, you can use the self-contained `example` project. It comes pre-configured with `django-browser-reload` to automatically refresh your browser whenever you modify the templates or static files in `django_admin_js`.

### 1. Set up the environment
Create a virtual environment and install the package in editable mode along with development requirements:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e . django-browser-reload
```

### 2. Run the Demo Project
Navigate to the `example` directory, apply migrations, and start the development server:
```bash
cd example
python manage.py migrate
python manage.py runserver
```

### 3. Log In to Admin
Open [http://127.0.0.1:8000/admin/](http://127.0.0.1:8000/admin/) in your browser and log in with the pre-created admin user:
- **Username**: `admin`
- **Password**: `admin`

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
