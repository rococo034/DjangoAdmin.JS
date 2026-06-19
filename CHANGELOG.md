# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-beta.6] - 2026-06-19
### Added
- Header Language Switcher widget (`LANGUAGE_SWITCHER`) with custom languages list support (`LANGUAGES`).
- Graphical flag icons integration in the language switcher using the `flag-icons` SVG library (via classes like `fi fi-*` or emojis).
- Interactive double-chevron sorting indicator (`⇅`) on unsorted table column headers, highlighting on hover.
- Custom settings `LIVE_SEARCH_MIN_CHARS` and `LIVE_SEARCH_DEBOUNCE_MS` to optimize live search queries.

### Fixed
- Stale search requests in live search when deleting characters rapidly by clearing pending timeouts immediately.
- ForeignKey widget wrapper action buttons styling, colors, and PJAX re-binding lifecycle (using warn/orange for change, primary/blue for view, green for add, and red for delete).
- Nested card border/background double nesting on the recent actions widget by removing the redundant `.module` class.
- Spacing leakage and horizontal scrollbar in custom select dropdowns by resetting `.custom-select-options` padding/margin styles.
- Tab layout preservation on form validation submit errors.

## [1.0.0-beta.5] - 2026-06-16
### Added
- Collapsible app sections/groups in the sidebar with collapsible state indicators.
- Customized dashboard settings `SIDEBAR_COLLAPSIBLE` and `SIDEBAR_COLLAPSED_DEFAULT` to control sidebar collapsible behavior.
- Support for custom branding text (`SITE_HEADER`) and custom brand logo URL (`SITE_LOGO`) in header and login card.
- Custom links integration (`CUSTOM_LINKS`) in the sidebar, allowing appending custom links to existing apps or creating entirely new app sections.
- Reworked site breadcrumbs into modern, clean floating capsule pills.
- Shared recent actions card component on both dashboard and app index pages.

### Fixed
- Horizontal scroll overflow-x-auto on TabularInline tables by overriding default browser min-width constraints on fieldsets.
- Tab headers width stretch issue.
- Sidebar active item left border indicator color style override conflict with Tailwind.
- Corrected breadcrumb separator chevron SVG path typo that drew a backslash character.

## [1.0.0-beta.4] - 2026-06-16
### Added
- Generic Client-side JavaScript API class `DjangoAdminJS` exposed globally.
- Support for triggering toast notifications programmatically via `DjangoAdminJS.showAlert()` with 4 severity levels (`INFO`, `SUCCESS`, `WARN`, `ERROR`).
- Support for `DjangoAdminJS` client API globally across all views including the login page.

## [1.0.0-beta.3] - 2026-06-16
### Added
- New Logo
- Logout page with automatic redirect to login page after 1 second.

## [1.0.0-beta.2] - 2026-06-13
### Added
- Comprehensive responsiveness across the entire Django Admin interface.
- Burger menu mobile navigation dropdown with entry animation.
- Restructured sticky header that hides non-essential user tools on mobile to maximize viewport area.
- Absolute positioning isolation rules for background decoration to completely eliminate horizontal scrolling and viewport stretching.
- Dynamic font-awesome model icon customizer logic based on user settings configuration.

## [1.0.0-beta.1] - 2026-06-13
### Added
- Redesigned Django Admin templates with Tailwind CSS and progressive enhancements.
- Spotlight/Raycast-style Command Palette (`Ctrl+K` / `Cmd+K`) for rapid navigation.
- Seamless AJAX navigation engine (PJAX) for sorting, searching, and pagination.
- Asynchronous form submissions and deletes with floating toast alerts.
- Three custom layouts (default cards, glassmorphism, minimalist) and built-in style customizer widget.
- Customizable color presets (Indigo, Emerald, Rose, Amber, Ocean, Violet).
- Unified global settings configuration within `settings.py`.
- Modern dashboard UI with active widgets and metrics.
