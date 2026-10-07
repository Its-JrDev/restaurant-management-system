function StatCard(opts) {
  opts = opts || {};
  const label = opts.label || "";
  const value = opts.value || "0";
  const change = opts.change || "";
  const icon = opts.icon || "activity";
  const iconBg = opts.iconBg || "";
  const changeNeutral = opts.changeNeutral || false;

  const isPositive = change && !change.startsWith("-") && !changeNeutral;
  const changeClass = changeNeutral
    ? "bg-neutral-100 text-neutral-600"
    : isPositive
      ? "bg-success-100 text-success-700"
      : "bg-error-100 text-error-700";
  const arrowIcon = changeNeutral ? null : isPositive ? "trending-up" : "trending-down";

  let html =
    '<div class="bg-white border border-brand-300 rounded-xl p-4 sm:p-5 shadow-sm flex items-start gap-3 sm:gap-4 min-w-0">';
  html +=
    '<div class="w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] rounded-lg flex items-center justify-center shrink-0 ' +
    iconBg +
    '">';
  html += '<i data-lucide="' + icon + '" class="w-5 h-5 sm:w-6 sm:h-6"></i>';
  html += "</div>";
  html += '<div class="flex-1 min-w-0">';
  html += '<p class="text-[13px] font-medium mb-1 text-secondary-500 truncate">' + label + "</p>";
  html +=
    '<p class="text-[22px] sm:text-[28px] font-bold leading-tight font-display text-brand-900 truncate">' +
    value +
    "</p>";
  if (change) {
    html +=
      '<div class="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ' +
      changeClass +
      '">';
    if (arrowIcon) html += '<i data-lucide="' + arrowIcon + '" class="w-3 h-3"></i>';
    html += change;
    html += "</div>";
  }
  html += "</div></div>";

  return html;
}

export default StatCard;
