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
    return {
        "live_search": config.get("LIVE_SEARCH", True),
        "theme_picker": config.get("THEME_PICKER", False),
        "themes": themes,
        "themes_json": json.dumps(themes),
        "default_theme": config.get("DEFAULT_THEME", "indigo"),
        "theme_style": config.get("THEME_STYLE", "default"),
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

