# Primitives — Actual CSS Custom Properties

Source of truth: `frontend/src/styles/app.css` `@theme` block.

Two themes: **Light** (default) and **Dark** (`[data-theme="dark"]`). Dark overrides are listed in a separate column.

---

## Color Scales

### brand

**Light** — copper/terracotta (the warm identity of the fogón).
**Dark** — oxidized pot with bluish Caribbean patina (brand-50..400 = cool dark backgrounds, brand-500 = oxidized teal sidebar, brand-700..900 = light text).

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-brand-50` | `#fef7ee` | `#0d1b2a` | Input bg |
| `--color-brand-100` | `#fcedd7` | `#132b35` | Main surface bg |
| `--color-brand-200` | `#f8d7ae` | `#1c3d49` | Elevated surface |
| `--color-brand-300` | `#f2ba7a` | `#29505d` | Borders |
| `--color-brand-400` | `#eb9344` | `#376675` | Hover borders |
| `--color-brand-500` | `#e57722` | `#4a7d8d` | Sidebar bg / primary accent |
| `--color-brand-600` | `#d65e18` | `#5a90a0` | Hover accent |
| `--color-brand-700` | `#b14616` | `#7ab0c0` | Active nav text (on white) |
| `--color-brand-800` | `#8d3919` | `#a0ccd8` | Headings |
| `--color-brand-900` | `#723117` | `#c8e4ec` | Bright text |

### primary

**Light** — green (interactive actions).
**Dark** — Caribbean blue (bright waves on dark background). Inverted: low = dark, high = bright.

| Token | Light | Dark |
|-------|-------|------|
| `--color-primary-50` | `#effcf6` | `#082e3f` |
| `--color-primary-100` | `#d9f7e8` | `#0d465f` |
| `--color-primary-200` | `#b5edd4` | `#115f81` |
| `--color-primary-300` | `#7eddb8` | `#157ea6` |
| `--color-primary-400` | `#40c597` | `#1e9fc8` |
| `--color-primary-500` | `#1faa7d` | `#38badb` |
| `--color-primary-600` | `#138964` | `#6fd3ea` |
| `--color-primary-700` | `#126e52` | `#a8e8f5` |
| `--color-primary-800` | `#135843` | `#d5f5fb` |
| `--color-primary-900` | `#114838` | `#eefcff` |

### neutral

**Light** — standard grays.
**Dark** — nocturnal bluish grays. Inverted: low = dark, high = light (text).

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--color-neutral-0` | `#ffffff` | `#04090f` | |
| `--color-neutral-50` | `#f9fafb` | `#0a1520` | |
| `--color-neutral-100` | `#f3f4f6` | `#132030` | |
| `--color-neutral-200` | `#e5e7eb` | `#1e2e40` | |
| `--color-neutral-300` | `#d1d5db` | `#2a3e52` | |
| `--color-neutral-400` | `#9ca3af` | `#4a5e72` | |
| `--color-neutral-500` | `#6b7280` | `#6a7e92` | |
| `--color-neutral-600` | `#4b5563` | `#8a9eb2` | Secondary text |
| `--color-neutral-700` | `#374151` | `#a8b8cc` | Primary text |
| `--color-neutral-800` | `#1f2937` | `#c8d4e0` | Bright text |
| `--color-neutral-900` | `#111827` | `#e4ecf2` | Headings |
| `--color-neutral-950` | `#030712` | `#f4f8fb` | |

### secondary

**Light** — warm grays.
**Dark** — Petroleum blue (depth of the pot).

| Token | Light | Dark |
|-------|-------|------|
| `--color-secondary-50` | `#f8f7f6` | `#132b35` |
| `--color-secondary-100` | `#efede9` | `#1c3d49` |
| `--color-secondary-200` | `#ddd9d1` | `#29505d` |
| `--color-secondary-300` | `#c5beb2` | `#376675` |
| `--color-secondary-400` | `#aa9f8f` | `#4a7d8d` |
| `--color-secondary-500` | `#958877` | `#649ba9` |
| `--color-secondary-600` | `#88796b` | `#8db9c4` |
| `--color-secondary-700` | `#716559` | `#b7d6dd` |
| `--color-secondary-800` | `#5e544b` | `#d8eaee` |
| `--color-secondary-900` | `#4f473f` | `#eef6f8` |

### accent

**Light** — amber.
**Dark** — moonlight (nocturnal silver).

| Token | Light | Dark |
|-------|-------|------|
| `--color-accent-50` | `#fffbeb` | `#1a2530` |
| `--color-accent-100` | `#fef3c7` | `#2a3a48` |
| `--color-accent-200` | `#fde68a` | `#3a4f60` |
| `--color-accent-300` | `#fcd34d` | `#4a6478` |
| `--color-accent-400` | `#fbbf24` | `#6a8498` |
| `--color-accent-500` | `#f59e0b` | `#8aa4b8` |
| `--color-accent-600` | `#d97706` | `#a8c0d0` |
| `--color-accent-700` | `#b45309` | `#c4d8e4` |
| `--color-accent-800` | `#92400e` | `#dce8f0` |
| `--color-accent-900` | `#78350f` | `#f0f6fa` |

### success / warning / error / info

Status scales. Dark mode: low values = dark tinted backgrounds, high values = light tints for text.

| Token | Light | Dark |
|-------|-------|------|
| `--color-success-500` | `#22c55e` | `#56a080` |
| `--color-success-700` | `#15803d` | `#a0d0b8` |
| `--color-warning-500` | `#f59e0b` | `#b87038` |
| `--color-warning-700` | `#b45309` | `#e0a070` |
| `--color-error-500` | `#ef4444` | `#a06060` |
| `--color-error-700` | `#b91c1c` | `#d0a0a0` |
| `--color-info-500` | `#3b82f6` | `#5070a4` |
| `--color-info-700` | `#1d4ed8` | `#98b0d0` |

Full 10-step scales for each are in `app.css` `[data-theme="dark"]` block.

---

## Effects

Ring and shadow tokens for focus states and hover effects. Use `var(--ring-brand)` instead of hardcoding `rgba()` values.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--ring-brand` | `0 0 0 3px rgba(229,119,34,0.15)` | `0 0 0 3px rgba(74,125,141,0.3)` | Input focus ring |
| `--ring-error` | `0 0 0 3px rgba(239,68,68,0.15)` | `0 0 0 3px rgba(160,96,96,0.3)` | Error field focus |
| `--ring-primary` | `0 0 0 3px rgba(31,170,125,0.15)` | `0 0 0 3px rgba(56,186,219,0.3)` | Primary focus |
| `--shadow-brand-hover` | `0 6px 16px rgba(229,119,34,0.18)` | `0 6px 16px rgba(74,125,141,0.25)` | Card hover shadow |

---

## Spacing (16 tokens)

| Token | Value | Tailwind class |
|-------|-------|----------------|
| `--spacing-sp-0` | 0px | `p-sp-0`, `m-sp-0`, `gap-sp-0` |
| `--spacing-sp-1` | 4px | `p-sp-1`, `gap-sp-1` |
| `--spacing-sp-2` | 8px | `p-sp-2`, `gap-sp-2` |
| `--spacing-sp-3` | 12px | `p-sp-3`, `gap-sp-3` |
| `--spacing-sp-4` | 16px | `p-sp-4`, `gap-sp-4` |
| `--spacing-sp-5` | 20px | `p-sp-5`, `gap-sp-5` |
| `--spacing-sp-6` | 24px | `p-sp-6`, `gap-sp-6` |
| `--spacing-sp-7` | 28px | `p-sp-7`, `gap-sp-7` |
| `--spacing-sp-8` | 32px | `p-sp-8`, `gap-sp-8` |
| `--spacing-sp-9` | 36px | `p-sp-9`, `gap-sp-9` |
| `--spacing-sp-10` | 40px | `p-sp-10`, `gap-sp-10` |
| `--spacing-sp-12` | 48px | `p-sp-12`, `gap-sp-12` |
| `--spacing-sp-14` | 56px | `p-sp-14`, `gap-sp-14` |
| `--spacing-sp-16` | 64px | `p-sp-16`, `gap-sp-16` |
| `--spacing-sp-20` | 80px | `p-sp-20`, `gap-sp-20` |
| `--spacing-sp-24` | 96px | `p-sp-24`, `gap-sp-24` |
| `--spacing-sp-32` | 128px | `p-sp-32`, `gap-sp-32` |

---

## Border Radius (9 tokens)

| Token | Value | Tailwind class |
|-------|-------|----------------|
| `--radius-radius-none` | 0px | `rounded-none` |
| `--radius-radius-xs` | 2px | `rounded-xs` |
| `--radius-radius-sm` | 4px | `rounded-sm` |
| `--radius-radius-md` | 6px | `rounded-md` |
| `--radius-radius-lg` | 8px | `rounded-lg` (cards, inputs) |
| `--radius-radius-xl` | 12px | `rounded-xl` (modals) |
| `--radius-radius-2xl` | 16px | `rounded-2xl` |
| `--radius-radius-3xl` | 24px | `rounded-3xl` |
| `--radius-radius-full` | 9999px | `rounded-full` (badges, pills, avatars) |

---

## Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `"Inter", system-ui, sans-serif` | Body text, UI elements |
| `--font-display` | `"Plus Jakarta Sans", "Inter", sans-serif` | Headings, display text |
| `--text-text-label` | 13px | Form labels |
| `--text-text-button` | 14px | Button text |
| `--text-text-heading` | 28px | Page headings |

---

## Layout

| Token | Value | Usage |
|-------|-------|-------|
| `--topbar-height` | 64px | Top navigation bar height |
| `--sidebar-width` | 256px | Sidebar expanded width |
| `--sidebar-collapsed` | 64px | Sidebar collapsed width |

---

## Animation Duration

| Token | Value | Tailwind class |
|-------|-------|----------------|
| `--duration-fast` | 100ms | `duration-fast` |
| `--duration-normal` | 200ms | `duration-normal` |
| `--duration-slow` | 300ms | `duration-slow` |
