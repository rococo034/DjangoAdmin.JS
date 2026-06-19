from django import template
from django.contrib.auth import get_user_model
from django.contrib.admin.models import LogEntry
from django.utils import timezone
import datetime

from django.conf import settings

register = template.Library()


import json
import django_admin_js

@register.simple_tag
def django_admin_js_version():
    return getattr(django_admin_js, "__version__", "1.0.0b1")

@register.simple_tag
def django_admin_js_settings():

    config = getattr(settings, "DJANGO_ADMIN_JS", {})
    default_themes = [
        {
            "id": "indigo",
            "name": "Classic Indigo",
            "primary": "#6366f1",
            "hover": "#4f46e5",
            "bg_light": "#f8fafc",
            "bg_dark": "#090d16",
            "card_light": "#ffffff",
            "card_dark": "#111827",
        },
        {
            "id": "emerald",
            "name": "Forest Emerald",
            "primary": "#10b981",
            "hover": "#059669",
            "bg_light": "#f4fbf7",
            "bg_dark": "#06130d",
            "card_light": "#ffffff",
            "card_dark": "#0d1a14",
        },
        {
            "id": "amber",
            "name": "Sunset Amber",
            "primary": "#f59e0b",
            "hover": "#d97706",
            "bg_light": "#fefaf3",
            "bg_dark": "#130f06",
            "card_light": "#ffffff",
            "card_dark": "#1a160d",
        },
        {
            "id": "rose",
            "name": "Velvet Rose",
            "primary": "#f43f5e",
            "hover": "#e11d48",
            "bg_light": "#fff5f6",
            "bg_dark": "#140608",
            "card_light": "#ffffff",
            "card_dark": "#1a0b0d",
        },
        {
            "id": "violet",
            "name": "Royal Violet",
            "primary": "#8b5cf6",
            "hover": "#7c3aed",
            "bg_light": "#faf5ff",
            "bg_dark": "#0f071a",
            "card_light": "#ffffff",
            "card_dark": "#150d21",
        },
        {
            "id": "ocean",
            "name": "Ocean Blue",
            "primary": "#0ea5e9",
            "hover": "#0284c7",
            "bg_light": "#f0f9ff",
            "bg_dark": "#031017",
            "card_light": "#ffffff",
            "card_dark": "#081821",
        }
    ]
    themes = config.get("THEMES", default_themes)
    languages_config = config.get("LANGUAGES", getattr(settings, "LANGUAGES", []))
    formatted_languages = []
    for item in languages_config:
        if isinstance(item, (list, tuple)) and len(item) >= 2:
            icon = item[2] if len(item) >= 3 else None
            formatted_languages.append({"code": item[0], "name": item[1], "icon": icon})

    from django.utils import translation
    current_lang_code = translation.get_language()
    current_lang_icon = None
    for lang in formatted_languages:
        if lang["code"] == current_lang_code:
            current_lang_icon = lang["icon"]
            break

    return {
        "live_search": config.get("LIVE_SEARCH", True),
        "live_search_min_chars": config.get("LIVE_SEARCH_MIN_CHARS", 3),
        "live_search_debounce_ms": config.get("LIVE_SEARCH_DEBOUNCE_MS", 300),
        "theme_picker": config.get("THEME_PICKER", False),
        "language_switcher": config.get("LANGUAGE_SWITCHER", False),
        "languages": formatted_languages,
        "current_language_icon": current_lang_icon,
        "themes": themes,
        "themes_json": json.dumps(themes),
        "default_theme": config.get("DEFAULT_THEME", "indigo"),
        "theme_style": config.get("THEME_STYLE", "default"),
        "sidebar_collapsible": config.get("SIDEBAR_COLLAPSIBLE", True),
        "sidebar_collapsed_default": config.get("SIDEBAR_COLLAPSED_DEFAULT", False),
        "site_header": config.get("SITE_HEADER", None),
        "site_logo": config.get("SITE_LOGO", None),
    }








@register.simple_tag
def get_admin_stats():
    User = get_user_model()

    # 1. User Stats
    total_users = User.objects.count()
    new_users_24h = User.objects.filter(
        date_joined__gte=timezone.now() - datetime.timedelta(days=1)
    ).count()

    # 2. Activity Stats
    actions_24h = LogEntry.objects.filter(
        action_time__gte=timezone.now() - datetime.timedelta(days=1)
    ).count()

    # 3. Model Stats (heuristic)
    from django.apps import apps

    total_models = sum(len(list(app.get_models())) for app in apps.get_app_configs())

    # History for sparklines (last 7 days - simplified)
    def get_history(model_class, date_field):
        history = []
        for i in range(7):
            date = timezone.now() - datetime.timedelta(days=i)
            count = model_class.objects.filter(
                **{f"{date_field}__date": date.date()}
            ).count()
            history.append(count)
        return list(reversed(history))

    def generate_path(history):
        if not history or max(history) == 0:
            return "M0 15 L100 15"
        max_val = max(history)
        min_val = min(history)
        range_val = max_val - min_val if max_val != min_val else 1

        points = []
        for i, val in enumerate(history):
            x = (i / (len(history) - 1)) * 100
            y = 18 - ((val - min_val) / range_val) * 16
            points.append(f"{x},{y}")

        return "M " + " L ".join(points)

    user_history = get_history(User, "date_joined")
    action_history = get_history(LogEntry, "action_time")

    return [
        {
            "label": "Total Users",
            "value": total_users,
            "change": f"+{new_users_24h}" if new_users_24h > 0 else "0",
            "trend": "up" if new_users_24h > 0 else "neutral",
            "icon": "users",
            "path": generate_path(user_history),
        },
        {
            "label": "Recent Actions",
            "value": actions_24h,
            "change": "Last 24h",
            "trend": "up" if actions_24h > 5 else "neutral",
            "icon": "activity",
            "path": generate_path(action_history),
        },
        {
            "label": "Total Models",
            "value": total_models,
            "change": "Registered",
            "trend": "neutral",
            "icon": "database",
            "path": generate_path([10, 12, 12, 12, 15, 15, total_models]),
        },
        {
            "label": "System Status",
            "value": "Online",
            "change": "All systems nominal",
            "trend": "up",
            "icon": "check",
            "path": generate_path([1, 1, 1, 1, 1, 1, 1]),
        },
    ]


@register.simple_tag
def get_admin_charts_data():
    User = get_user_model()
    labels = []
    user_data = []
    action_data = []
    
    for i in range(7):
        date = timezone.now() - datetime.timedelta(days=i)
        labels.append(date.strftime("%a"))
        
        user_count = User.objects.filter(date_joined__date=date.date()).count()
        user_data.append(user_count)
        
        action_count = LogEntry.objects.filter(action_time__date=date.date()).count()
        action_data.append(action_count)
        
    return {
        "labels": list(reversed(labels)),
        "users": list(reversed(user_data)),
        "actions": list(reversed(action_data)),
    }


from django.utils.safestring import mark_safe

@register.simple_tag
def get_model_icon(app_label, model_name):
    config = getattr(settings, "DJANGO_ADMIN_JS", {})
    model_icons = config.get("MODEL_ICONS", {})
    
    lookup_keys = [
        f"{app_label}.{model_name}".lower(),
        model_name.lower(),
    ]
    
    icon_val = None
    for key in lookup_keys:
        for conf_key, val in model_icons.items():
            if conf_key.lower() == key:
                icon_val = val
                break
        if icon_val:
            break
            
    if icon_val:
        if icon_val.strip().startswith("<svg"):
            return mark_safe(icon_val)
        if any(prefix in icon_val for prefix in ["fa-", "fa ", "fas ", "far ", "fab ", "fa-solid", "fa-regular"]):
            return mark_safe(f'<i class="{icon_val} w-4 h-4 shrink-0 text-center flex items-center justify-center"></i>')
        
        heroicons = {
            "user": '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>',
            "users": '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>',
            "group": '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>',
            "site": '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.004 9.004 0 018.716 2.253M12 3a9.004 9.004 0 00-8.716 2.253m0 0A9.001 9.001 0 003 12c0 2.457.983 4.684 2.58 6.3M18.716 5.253A9.001 9.001 0 0121 12c0 2.457-.983 4.684-2.58 6.3m0 0A9.004 9.004 0 0112 21" /></svg>',
            "cog": '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827a1.125 1.125 0 0 1 .26 1.43l-1.297 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>',
            "database": '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0v3.75m-16.5-3.75v3.75" /></svg>',
            "key": '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z" /></svg>',
            "shield": '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>',
            "tag": '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 0 0 1.592 0l4.318-4.318a1.125 1.125 0 0 0 0-1.592L9.568 4.591A2.25 2.25 0 0 0 8.568 3Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" /></svg>',
            "folder": '<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-19.5 0A2.25 2.25 0 0 0 4.5 15h15a2.25 2.25 0 0 0 2.25-2.25m-19.5 0v.25C2.25 12.012 2.25 12 2.25 12m19.5 0c0 .012 0 .012 0 0M12 3v2.25m0-2.25H5.25A2.25 2.25 0 0 0 3 5.25v2.25C3 8.012 3.012 8 3.25 8h17.5c.238 0 .25.012.25.25V5.25A2.25 2.25 0 0 0 18.75 3H12Z" /></svg>',
        }
        if icon_val.lower() in heroicons:
            return mark_safe(heroicons[icon_val.lower()])
            
    model_name_lower = model_name.lower()
    if "user" in model_name_lower:
        return mark_safe('<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>')
    elif "group" in model_name_lower:
        return mark_safe('<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>')
    elif "site" in model_name_lower:
        return mark_safe('<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9s2.015-9 4.5-9m0 0a9.004 9.004 0 018.716 2.253M12 3a9.004 9.004 0 00-8.716 2.253m0 0A9.001 9.001 0 003 12c0 2.457.983 4.684 2.58 6.3M18.716 5.253A9.001 9.001 0 0121 12c0 2.457-.983 4.684-2.58 6.3m0 0A9.004 9.004 0 0112 21" /></svg>')
    else:
        return mark_safe('<svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>')


@register.simple_tag
def get_custom_links(app_label):
    config = getattr(settings, "DJANGO_ADMIN_JS", {})
    custom_links = config.get("CUSTOM_LINKS", {})
    for key, val in custom_links.items():
        if key.lower() == app_label.lower():
            return val
    return []


@register.simple_tag
def get_extra_custom_apps(app_list):
    config = getattr(settings, "DJANGO_ADMIN_JS", {})
    custom_links = config.get("CUSTOM_LINKS", {})
    existing_app_labels = {app["app_label"].lower() for app in app_list}
    
    extra_apps = []
    for key, val in custom_links.items():
        if key.lower() not in existing_app_labels:
            extra_apps.append({
                "app_label": key.lower(),
                "name": key.replace("_", " ").replace("-", " ").capitalize(),
                "app_url": "#",
                "models": [],
                "custom_links": val
            })
    return extra_apps


@register.simple_tag
def get_custom_model_actions(app_label, model_name):
    config = getattr(settings, "DJANGO_ADMIN_JS", {})
    custom_actions = config.get("CUSTOM_MODEL_ACTIONS", {})
    
    lookup_keys = [
        f"{app_label}.{model_name}".lower(),
        model_name.lower(),
    ]
    
    for key in lookup_keys:
        for conf_key, val in custom_actions.items():
            if conf_key.lower() == key:
                # Ensure it's safe if HTML/svg is used
                for action in val:
                    if "icon" in action and action["icon"] and action["icon"].strip().startswith("<svg"):
                        action["icon"] = mark_safe(action["icon"])
                return val
    return []


@register.filter
def get_inline_field_display(instance, field_name):
    if not instance or not field_name:
        return ""
    
    # Check if field_name is direct attribute
    if not hasattr(instance, field_name):
        return ""
        
    # Check if there is a get_FOO_display method for ChoiceFields
    display_method = getattr(instance, f"get_{field_name}_display", None)
    if display_method:
        return display_method()
        
    value = getattr(instance, field_name)
    if value is None:
        return ""
        
    # Handle relationships/related managers
    if hasattr(value, "all"):
        return ", ".join(str(obj) for obj in value.all())
        
    # Format boolean
    if isinstance(value, bool):
        return "Yes" if value else "No"
        
    return str(value)


@register.filter
def get_model_meta(opts_or_model):
    if hasattr(opts_or_model, "model"):
        return opts_or_model.model._meta
    if hasattr(opts_or_model, "_meta"):
        return opts_or_model._meta
    return opts_or_model


from django.urls import reverse

@register.simple_tag
def get_inline_add_url(inline_admin_formset, parent_pk):
    try:
        opts = inline_admin_formset.opts.model._meta
        url_name = f"admin:{opts.app_label}_{opts.model_name}_add"
        fk_name = inline_admin_formset.opts.fk_name
        if not fk_name:
            parent_model = inline_admin_formset.opts.parent_model
            for field in opts.get_fields():
                if field.is_relation and field.many_to_one and field.related_model == parent_model:
                    fk_name = field.name
                    break
        base_url = reverse(url_name)
        return f"{base_url}?_popup=1&{fk_name}={parent_pk}"
    except Exception as e:
        return "#"

@register.simple_tag
def get_inline_change_url(inline_admin_form):
    try:
        opts = inline_admin_form.model_admin.model._meta
        url_name = f"admin:{opts.app_label}_{opts.model_name}_change"
        pk = inline_admin_form.original.pk
        base_url = reverse(url_name, args=[pk])
        return f"{base_url}?_popup=1"
    except Exception as e:
        return "#"






