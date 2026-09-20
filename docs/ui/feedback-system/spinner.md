# Spinner

## File

`components/ui/Spinner.js`

## API

```js
Spinner(opts?)
```

| Option | Default | Description |
|--------|---------|-------------|
| `size` | `16` | Width and height in px |
| `class` | `""` | Additional CSS classes (e.g. `"text-white"`) |

Returns an inline SVG (Lucide `Loader2` icon with Tailwind `animate-spin`).

Also available as `Spinner.html()` (alias) and on `window.Spinner`.

## SubmitButton Integration

`components/forms/SubmitButton.js` imports Spinner and provides the loading-button pattern:

```js
// 1. Render the button
submitContainer.innerHTML = SubmitButton({ text: "Sign In", id: "signInBtn" });

// 2. Attach loading behavior
initSubmitButton("signInBtn", { loadingText: "Signing in..." });

// 3. Toggle loading state
signInBtn._setLoading(true);   // Shows: [Spinner 18px white] "Signing in..."
signInBtn._setLoading(false);  // Restores original text
```

**`initSubmitButton(id, options)`** attaches `_setLoading(loading)` to a button element. When `true`: disables button, replaces innerHTML with Spinner + loading text. When `false`: restores original text, re-enables button.

## Views Using Spinner

| View | Usage |
|------|-------|
| `views/auth/Login.js` | `initSubmitButton("signInBtn", { loadingText: "Signing in..." })` — spinner shown during auth |
| `views/auth/register.js` | **Not used** — no loading indicator on register form |
