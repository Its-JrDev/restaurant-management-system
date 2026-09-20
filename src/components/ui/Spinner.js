/**
 * Spinner — reusable loading indicator using Lucide Loader2.
 *
 * Usage:
 *   Spinner()                → default 16px, currentColor
 *   Spinner({ size: 20 })    → 20×20
 *   Spinner({ class: "text-white" }) → white spinner
 *   Spinner.html({ size: 20 }) → raw HTML string (for inline templates)
 */
function Spinner(opts = {}) {
  const size = opts.size || 16;
  const cls = opts.class || "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-loader-2 animate-spin ${cls}" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>`;
}

Spinner.html = Spinner;

window.Spinner = Spinner;

export default Spinner;
