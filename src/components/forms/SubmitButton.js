import Spinner from "../ui/Spinner.js";

function SubmitButton(opts) {
  const text = opts.text || "Submit";
  const id = opts.id || "submitBtn";
  const disabled = opts.disabled || false;

  const html =
    '<button type="submit" id="' +
    id +
    '" ' +
    'class="w-full h-11 flex items-center justify-center gap-2 ' +
    "text-button font-semibold leading-relaxed text-white " +
    "bg-primary-600 border-none rounded-md cursor-pointer " +
    "transition-colors duration-100 " +
    "hover:bg-primary-700 active:bg-primary-800 " +
    'disabled:opacity-60 disabled:cursor-not-allowed"' +
    (disabled ? " disabled" : "") +
    ">" +
    text +
    "</button>";
  return html;
}

function initSubmitButton(id, options = {}) {
  const btn = document.getElementById(id);
  if (!btn) return;

  const originalText = btn.textContent.trim();
  const loadingText = options.loadingText || "Loading...";

  btn._setLoading = (loading) => {
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = originalText;
      btn.innerHTML = Spinner({ size: 18, class: "text-white" }) + ` <span>${loadingText}</span>`;
    } else {
      btn.disabled = false;
      btn.innerHTML = btn.dataset.originalText || originalText;
      delete btn.dataset.originalText;
    }
  };
}

window.SubmitButton = SubmitButton;
window.initSubmitButton = initSubmitButton;

export default SubmitButton;
