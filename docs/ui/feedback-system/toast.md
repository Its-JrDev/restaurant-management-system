# Toast Notifications

## Architecture

Two-layer design:

| Layer | File | Role |
|-------|------|------|
| Factory | `components/ui/Toast.js` | `createToast()` — returns `{ html, init() }` for a single toast |
| Manager | `components/ui/ToastManager.js` | Singleton `toast` — manages container, stacking, timers, dismiss |

CSS animations live in `styles/app.css` (keyframes `toast-slide-in` / `toast-slide-out`).

## Import

```js
import { toast } from "../../components/ui/ToastManager.js";
```

## API

| Method | Signature | Returns |
|--------|-----------|---------|
| `show()` | `({ type, title, message, duration?, dismissible? })` | `id` (string) |
| `success()` | `(title, message, options?)` | `id` |
| `error()` | `(title, message, options?)` | `id` |
| `warning()` | `(title, message, options?)` | `id` |
| `info()` | `(title, message, options?)` | `id` |
| `dismiss()` | `(id)` | `void` |
| `dismissAll()` | `()` | `void` |

**Defaults:** `duration = 3000ms`, `dismissible = true`, `maxToasts = 5` (oldest auto-dismissed on overflow).

## Variants

| Type | Icon | Background | ARIA role | ARIA live |
|------|------|------------|-----------|-----------|
| `success` | `check-circle` | `bg-success-600` | `status` | `polite` |
| `error` | `x-circle` | `bg-error-600` | `alert` | `assertive` |
| `warning` | `alert-triangle` | `bg-warning-500` | `status` | `polite` |
| `info` | `info` | `bg-info-600` | `status` | `polite` |

## DOM Structure

```
div[data-toast-id]  fixed top-[80px] right-5 z-[9999]
  ├─ i[data-lucide]        icon (w-5 h-5)
  ├─ div                   title + optional divider + message
  │   ├─ p                 title (text-sm font-semibold, truncate)
  │   ├─ span              divider (w-px h-3.5 bg-white/30)
  │   └─ p                 message (text-xs font-medium, truncate)
  └─ button[data-toast-dismiss]  close (w-7 h-7, border-none)
      └─ i[data-lucide="x"]
```

## Animations

- **In:** `toast-slide-in` — 400ms, cubic-bezier(0.21, 1.02, 0.73, 1) — slides from right with bounce overshoot
- **Out:** `toast-slide-out` — 250ms, ease-in — slides right and fades

## Usage Examples

```js
// Validation warning
toast.warning("Validation", "Please enter a product name");

// Success after CRUD
toast.success("Stock Updated", "Inventory item updated successfully");

// Error on failure
toast.error("Login Failed", result.error);

// Custom duration
toast.info("Notice", "System maintenance at 3am", { duration: 5000 });

// Non-dismissible
toast.error("Critical", "Session expired", { dismissible: false });
```

## Views Using Toast

| View | Usage |
|------|-------|
| `views/auth/Login.js` | `success` on login, `error` on failure |
| `views/auth/register.js` | `error` on validation, `success`/`error` on create |
| `views/menu/list.js` | `warning` on empty fields before save |
| `views/inventory/Inventory.js` | `warning` on validation, `success` on CRUD, `success` on delete |
| `views/payments/list.js` | `warning` on validation before save |
| `views/settings/Settings.js` | `success` on save, `success` on reset |
