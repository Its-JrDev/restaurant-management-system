# Restaurant Management System — Design System

## Architecture

Tailwind CSS v4 with CSS-first configuration. All design tokens live in `frontend/src/styles/app.css` inside the `@theme` block. No `tailwind.config.js` — Tailwind v4 reads CSS custom properties directly.

```
app.css (@theme) ──> Tailwind utilities ──> Components
```

### What's defined in `@theme`

| Category | Variables | Count |
|----------|-----------|-------|
| Colors | `--color-brand-*`, `--color-primary-*`, `--color-neutral-*`, `--color-secondary-*`, `--color-accent-*`, `--color-success-*`, `--color-warning-*`, `--color-error-*`, `--color-info-*` | ~80 per theme |
| Spacing | `--spacing-sp-0` through `--spacing-sp-32` | 16 |
| Radius | `--radius-radius-none` through `--radius-radius-full` | 9 |
| Typography | `--font-sans`, `--font-display`, `--text-text-label/button/heading` | 5 |
| Layout | `--topbar-height`, `--sidebar-width`, `--sidebar-collapsed` | 3 |
| Duration | `--duration-fast/normal/slow`, `--animate-duration-*` | 6 |
| Effects | `--ring-brand`, `--ring-error`, `--ring-primary`, `--shadow-brand-hover` | 4 per theme |

**Total: ~131 CSS custom properties** (light theme) + dark theme overrides.

### Theming

Two themes are defined via CSS custom property overrides:

| Theme | Selector | Colors |
|-------|----------|--------|
| **Light** | default (no selector) | Cobre/terracota brand, green primary, warm grays |
| **Dark** | `[data-theme="dark"]` | Oxidized pot (teal blue with patina), Caribbean blue primary, nocturnal bluish grays |

Theme state is managed by `frontend/src/utils/theme.js` — persisted in `localStorage` under key `fogon-theme`. Toggle applies `data-theme="dark"` to `<html>`.

### Dark Mode — Scale Inversion

The dark theme **inverts the scale direction** for `brand`, `neutral`, and `primary` so existing Tailwind utility classes produce correct dark mode colors without component changes:

| Class | Light value | Dark value | Semantic role |
|-------|-------------|------------|---------------|
| `bg-brand-100` | `#fcedd7` (light peach) | `#132b35` (azul petróleo) | Main surface bg |
| `bg-brand-50` | `#fef7ee` (warm cream) | `#0d1b2a` (negro azulado) | Input bg |
| `bg-brand-500` | `#e57722` (cobre naranja) | `#4a7d8d` (teal oxidado) | Sidebar bg |
| `text-neutral-900` | `#111827` (dark text) | `#e4ecf2` (light text) | Primary text |
| `text-neutral-600` | `#4b5563` (muted text) | `#8a9eb2` (medium-light) | Secondary text |
| `border-brand-300` | `#f2ba7a` (warm border) | `#29505d` (dark border) | Input/card border |

### Tailwind Usage Pattern

Components use Tailwind utility classes that map to `@theme` variables:

```html
<!-- Color: bg-{scale}-{shade} -->
<div class="bg-brand-50 text-neutral-900">

<!-- Spacing: p-{sp-{n}} or standard Tailwind spacing -->
<div class="p-4 gap-2">

<!-- Radius: rounded-{radius-*} -->
<div class="rounded-lg">

<!-- Typography: font-display, font-sans -->
<h1 class="font-display text-heading font-semibold">
```

### What's NOT in the codebase

The following are documented in the old token docs but **do not exist as actual tokens**:

- Semantic layer (`text.color.default`, `bg.color.primary`, `surface.color.*`, etc.)
- Component-scoped tokens (`button.color.primaryBg`, `input.color.bg`, `toast.color.*`, etc.)
- Penpot token export/import pipeline

These were part of an initial design system plan. The actual implementation uses Tailwind utility classes directly.

## Files

| File | Contents |
|------|----------|
| `app.css` | Source of truth — all `@theme` variables, base styles, dark theme overrides, animations |
| [primitives.md](primitives.md) | Actual CSS custom properties defined in `@theme` (light + dark) |
| [theme.md](theme.md) | Night mode architecture, logo/scene variants, theme utility API |
