let _bound = false;

function escapeHtml(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderDropdown(opts) {
  opts = opts || {};
  const id = opts.id || "dd-" + Math.random().toString(36).slice(2, 8);
  const options = opts.options || [];
  const value = opts.value != null ? String(opts.value) : "";
  const placeholder = opts.placeholder || "Seleccionar...";
  const fullWidth = opts.fullWidth !== false;
  const triggerCls =
    opts.triggerCls ||
    "w-full h-10 px-3 pr-8 text-sm rounded-md border border-brand-300 bg-brand-50 text-brand-900 outline-none focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(229,119,34,0.1)] transition-colors hover:border-brand-400 cursor-pointer";
  const selected = options.find(function (o) {
    return String(o.value) === value;
  });

  let html = '<div class="relative ' + (fullWidth ? "w-full" : "w-auto") + '" data-dropdown>';
  html += '<input type="hidden" id="' + id + '" name="' + id + '" value="' + escapeHtml(value) + '" />';
  html +=
    '<button type="button" data-dropdown-trigger="' + id + '" class="' + triggerCls +
    ' flex items-center justify-between gap-2 text-left">';
  html +=
    '<span data-dropdown-label class="truncate ' +
    (selected ? "text-brand-900" : "text-secondary-400") +
    '">' +
    (selected ? escapeHtml(selected.label) : placeholder) +
    "</span>";
  html += '<i data-lucide="chevron-down" class="w-4 h-4 shrink-0 text-secondary-500"></i>';
  html += "</button>";
  html += '<div data-dropdown-menu="' + id + '" class="absolute z-[100] mt-1 min-w-full w-full shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-brand-200 rounded-xl bg-white overflow-hidden hidden">';
  html += '<div class="max-h-64 overflow-y-auto py-1 scrollbar-none">';
  options.forEach(function (opt) {
    const isSel = String(opt.value) === value;
    html +=
      '<button type="button" data-dropdown-option="' + id + '" data-dropdown-value="' +
      escapeHtml(opt.value) + '" data-dropdown-label="' + escapeHtml(opt.label) +
      '" class="w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors cursor-pointer border-0 ' +
      (isSel
        ? "bg-brand-50 text-brand-700 font-semibold"
        : "text-brand-800 hover:bg-brand-50") +
      '">';
    if (opt.icon) html += '<i data-lucide="' + opt.icon + '" class="w-4 h-4 shrink-0"></i>';
    html += '<span class="truncate">' + escapeHtml(opt.label) + "</span>";
    if (isSel) html += '<i data-lucide="check" class="w-4 h-4 shrink-0 ml-auto"></i>';
    html += "</button>";
  });
  html += "</div></div></div>";

  return html;
}

function closeAllDropdowns() {
  document.querySelectorAll("[data-dropdown-menu]").forEach(function (menu) {
    menu.classList.add("hidden");
  });
}

function bindDropdownEvents() {
  if (_bound) return;
  _bound = true;

  document.addEventListener("click", function (e) {
    const trigger = e.target.closest("[data-dropdown-trigger]");
    if (trigger) {
      e.stopPropagation();
      const id = trigger.getAttribute("data-dropdown-trigger");
      const menu = document.querySelector('[data-dropdown-menu="' + id + '"]');
      const wasHidden = menu ? menu.classList.contains("hidden") : true;
      closeAllDropdowns();
      if (menu && wasHidden) menu.classList.remove("hidden");
      return;
    }

    const option = e.target.closest("[data-dropdown-option]");
    if (option) {
      e.stopPropagation();
      const did = option.getAttribute("data-dropdown-option");
      const input = document.getElementById(did);
      if (input) {
        input.value = option.getAttribute("data-dropdown-value") || "";
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      closeAllDropdowns();
      return;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAllDropdowns();
  });
}

bindDropdownEvents();

export { renderDropdown, closeAllDropdowns };
export default renderDropdown;