# UI Feedback System

Three vanilla JS systems for loading states and user feedback, now merged into `develop`.

| System | Purpose | Files |
|--------|---------|-------|
| [Toast](toast.md) | Notification popups (success, error, warning, info) | `Toast.js`, `ToastManager.js` |
| [Skeleton](skeleton.md) | Placeholder loading screens for views and sub-views | `Skeleton.js`, `withLoading.js` |
| [Spinner](spinner.md) | Inline loading indicator for buttons | `Spinner.js`, `SubmitButton.js` |

## When to use what

| Scenario | System | Example |
|----------|--------|---------|
| Page initial load | Skeleton (via `withLoading`) | Navigating to Dashboard |
| Sub-view navigation | Skeleton (via `renderWithSkeleton`) | Clicking "New Order" in POS |
| Form submission feedback | Spinner (via `_setLoading`) | Login button while authenticating |
| CRUD success/error | Toast | "Item saved" after creating a menu item |
| Validation warning | Toast | "Please enter a name" before saving |

## File Reference

| File | Lines | Purpose |
|------|-------|---------|
| `components/ui/Toast.js` | 112 | Toast HTML factory + color/icon maps |
| `components/ui/ToastManager.js` | 116 | Singleton: show/dismiss/stack/auto-hide |
| `components/ui/Skeleton.js` | 46 | Base skeleton primitive (text/circle/rect) |
| `components/ui/Spinner.js` | 20 | Inline SVG spinner (Lucide Loader2) |
| `components/forms/SubmitButton.js` | 48 | Submit button factory + `initSubmitButton` with spinner |
| `utils/withLoading.js` | ~1012 | `withLoading()`, `renderWithSkeleton()`, 17 `Skeletons.*` builders |
| `styles/app.css` | ~311 | Toast animation keyframes |
