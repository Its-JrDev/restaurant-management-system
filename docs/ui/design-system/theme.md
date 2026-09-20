# Night Mode — Theme System

## Overview

El Fogón Caribeño ships with two themes that mirror the visual identity of the logo:

| Theme | Selector | Inspiration |
|------|----------|-------------|
| **Light** | default | Caribbean sun, copper/terracotta of the fogón, warm tones |
| **Dark** | `[data-theme="dark"]` | Crescent moon, oxidized pot with bluish patina, teal waves |

## Architecture

```
localStorage('fogon-theme') ──> theme.js ──> data-theme="dark" on <html> ──> CSS custom properties override ──> Tailwind utilities
```

- Theme is persisted in `localStorage` under key `fogon-theme`.
- `initTheme()` runs in `main.js` before `renderView()` to prevent a flash of un-themed content.
- Toggle buttons live on the Login screen (top-right corner) and the AppShell top bar.

## Assets — Logo and Scene Variants

All assets live in `frontend/public/logos/`:

### Logos

| File | Theme | Usage |
|---------|------|-----|
| `logo-00.png` | Light | Login mobile |
| `logo-00-night.png` | Dark | Login mobile |
| `logo-01.png` | Light | Sidebar header, Login desktop |
| `logo-01-night.png` | Dark | Sidebar header, Login desktop |
| `logo-02.png` | Light | Login brand panel (desktop) |
| `logo-02-night.png` | Dark | Login brand panel (desktop) |
| `logo-03.png` | Light | Sidebar header (with name), Login tablet |
| `logo-03-night.png` | Dark | Sidebar header (with name), Login tablet |

### Scenes (Login brand panel backgrounds)

| File | Theme | Description |
|---------|------|-------------|
| `sun-scene.svg` | Light | Sun, warm sky, sea |
| `moon-scene.svg` | Dark | Crescent moon, night sky, oxidized blue pot, teal waves |

### Naming convention

Night logos follow the `{basename}-night.png` pattern. The `getLogoPath('logo-01')` utility resolves to the correct file automatically based on the active theme.

## Theme Utility API

`frontend/src/utils/theme.js`

| Function | Returns | Description |
|---------|---------|-------------|
| `getTheme()` | `'light' \| 'dark'` | Reads the current theme from localStorage. |
| `setTheme(theme)` | `void` | Persists and applies the theme. |
| `toggleTheme()` | `'light' \| 'dark'` | Toggles and returns the new theme. |
| `isDark()` | `boolean` | Shortcut for `getTheme() === 'dark'`. |
| `initTheme()` | `void` | Applies the persisted theme to `<html>` on load. |
| `getLogoPath(basename)` | `string` | Returns `/logos/{basename}[-night].png`. |
| `getScenePath()` | `string` | Returns `/logos/{sun\|moon}-scene.svg`. |

## Dark Mode — Scale Inversion

The dark theme **inverts the direction** of the `brand`, `neutral`, `primary` and `secondary` scales so existing Tailwind utility classes keep working:

- **Low indices (50–200)** → dark colors → backgrounds, inputs, surfaces.
- **Mid indices (300–500)** → mid tones → borders, sidebar bg.
- **High indices (600–900)** → light colors → text, headings, accents.

This means `bg-brand-100` is light in light mode (`#fcedd7`) and dark in dark mode (`#132b35`) **without changing the components**.

## Effects — CSS Variables

Ring and shadow tokens use CSS custom properties to avoid hardcoding colors:

| Variable | Light | Dark |
|----------|-------|------|
| `--ring-brand` | `rgba(229,119,34,0.15)` | `rgba(74,125,141,0.3)` |
| `--ring-error` | `rgba(239,68,68,0.15)` | `rgba(160,96,96,0.3)` |
| `--ring-primary` | `rgba(31,170,125,0.15)` | `rgba(56,186,219,0.3)` |
| `--shadow-brand-hover` | `rgba(229,119,34,0.18)` | `rgba(74,125,141,0.25)` |

**Rule:** never hardcode brand `rgba()` values in components. Always use `var(--ring-brand)` or `var(--shadow-brand-hover)`.

## Visual Inspiration

| Element | Light | Dark |
|----------|-------|------|
| Sky | Radiant sun | Crescent moon with stars |
| Pot | Shiny terracotta clay | Dark blue ceramic with oxidized patina |
| Waves | Bright turquoise blue | Deep teal with silvery reflections |
| Fire | Orange/copper | Cyan/blue (cold flame) |
| Base palette | Warm copper (`#e57722`) | Oxidized teal (`#4a7d8d`) |
