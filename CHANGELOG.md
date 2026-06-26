# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-beta.8] - 2026-06-26
### Added
- Capsule-style pill container layout for breadcrumbs, complete with a FontAwesome home icon, angle-right chevron separators, and distinct styles for active/hover states.
- Color-coded solid button styling and FontAwesome icons for Choose all (green with check icon) and Clear all (red with trash-can icon) actions in selectors.
- General style overrides for `.button` class links (e.g. password resets), designed as fallbacks to allow Tailwind utility overrides.

### Fixed
- Django template block inheritance bug by inlining the breadcrumbs structure in `base.html`, enabling child templates to successfully override the full breadcrumbs path (e.g. Home > App > Model > Detail).
- Cloned and rebound events for `.selector-add` and `.selector-remove` buttons in the custom drag-and-drop selector widget (`drag_drop_selector.js`), allowing them to dynamically toggle active/disabled states and execute move commands.

## [1.0.0-beta.7] - 2026-06-26
### Added
- CSS styling for validation errors (`.errorlist` list formatting and red/soft-red border/focus ring styles for invalid inputs, selects, and textareas) in change forms and inline formsets.
- Automatic smooth-scrolling to the top of the main content container (`#content-start`) when validation errors are present on both traditional page reloads and AJAX/fetch form submissions.

### Fixed
- Date and time inputs value discarding issue: parsed and converted localized date/time strings (like Italian `DD/MM/YYYY` or `12h AM/PM`) into ISO format (`YYYY-MM-DD` / `HH:MM:SS`) before converting HTML input types to `date`/`time`, avoiding data loss on page initialization and form submit.
- Missing "Add" button on the change list view by restoring the standard `object-tools` block rendering in the page header.

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
