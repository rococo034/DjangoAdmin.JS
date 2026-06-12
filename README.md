# DjangoAdmin.JS

[![PyPI version](https://img.shields.io/pypi/v/django-admin-js.svg)](https://pypi.org/project/django-admin-js/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/rocco/DjangoAdmin.JS/workflows/build/badge.svg)](https://github.com/rocco/DjangoAdmin.JS/actions)

A modern Django Admin experience built with Tailwind CSS and progressive JavaScript enhancements. Features a redesigned UI, improved UX, asynchronous interactions, and a foundation for a faster, more responsive administration panel.

---

## 📸 Screenshots

![Dashboard Placeholder](https://via.placeholder.com/800x450?text=DjangoAdmin.JS+Dashboard)
*Modern, clean, and responsive dashboard.*

![Detail View Placeholder](https://via.placeholder.com/800x450?text=DjangoAdmin.JS+Detail+View)
*Refined form layouts and tabs.*

---

## ✨ Features

- **Tailwind CSS Driven**: Clean, modern aesthetics using the latest utility-first CSS.
- **Responsive Layout**: Optimized for mobile, tablet, and desktop.
- **Dark Mode Support**: Built-in support for dark themes.
- **Enhanced UX**: Improved navigation, breadcrumbs, and interactive components.
- **No JS Bloat**: Uses progressive enhancements with minimal dependencies.

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

### 3. Usage

That's it! Your Django Admin will now use the new theme automatically.

---

## 📊 Compatibility

- **Django**: 5.0, 5.1, 5.2+
- **Python**: 3.10, 3.11, 3.12+

---

## 🛠 Roadmap

- [ ] **Tailwind UI**: Full implementation of all admin components.
- [ ] **Dark Mode**: Refinement of dark mode transitions.
- [ ] **Async Actions**: Perform admin actions without page reloads.
- [ ] **Fetch API**: Modernize all data interactions.
- [ ] **REST-powered interactions**: Better integration with API-driven data.
- [ ] **Modal CRUD**: Create and edit related objects in modals.
- [ ] **Inline Editing**: Quick edit fields directly in the list view.

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
