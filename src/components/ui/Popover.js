let _openEl = null;
let _outsideHandler = null;

function closePopover() {
  if (_openEl) {
    _openEl.remove();
    _openEl = null;
  }
  if (_outsideHandler) {
    document.removeEventListener("click", _outsideHandler, true);
    _outsideHandler = null;
  }
}

function openPopover(opts) {
  opts = opts || {};
  const anchor = opts.anchor;
  const content = opts.content || "";
  const className = opts.className || "";
  const gap = opts.gap != null ? opts.gap : 8;

  if (!anchor) return null;
  closePopover();

  const el = document.createElement("div");
  el.className = "fixed z-[100] " + className;
  el.innerHTML = content;
  const rect = anchor.getBoundingClientRect();

  document.body.appendChild(el);
  window.createIcons();

  const w = el.offsetWidth || 220;
  let left = rect.left;
  let top = rect.bottom + gap;
  if (left + w > window.innerWidth - 8) left = Math.max(8, window.innerWidth - w - 8);
  if (top + el.offsetHeight > window.innerHeight - 8) {
    top = Math.max(8, rect.top - el.offsetHeight - gap);
  }
  el.style.left = left + "px";
  el.style.top = top + "px";

  _openEl = el;
  _outsideHandler = function (e) {
    if (el && !el.contains(e.target) && !anchor.contains(e.target)) {
      closePopover();
    }
  };
  setTimeout(function () {
    document.addEventListener("click", _outsideHandler, true);
  }, 0);

  if (opts.onMount) opts.onMount(el);
  return el;
}

export { openPopover, closePopover };
export default openPopover;