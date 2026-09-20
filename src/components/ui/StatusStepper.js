const LIFECYCLE = ["draft", "new", "preparing", "ready", "served", "completed"];

function StatusStepper(opts) {
  opts = opts || {};
  const current = opts.status || "new";
  const cancelled = opts.cancelled || false;

  const ci = LIFECYCLE.indexOf(current);

  let html = '<div class="flex items-center w-full">';

  if (cancelled) {
    html += '<div class="w-full text-center py-3">';
    html +=
      '<span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-error-100 text-error-700 font-semibold text-sm">';
    html += '<i data-lucide="x-circle" class="w-4 h-4"></i> Cancelled';
    html += "</span>";
    html += "</div>";
    html += "</div>";
    return html;
  }

  LIFECYCLE.forEach(function (step, i) {
    const isDone = i < ci;
    const isCurrent = i === ci;
    const isConnector = i < LIFECYCLE.length - 1;

    const dotClass = isDone
      ? "bg-success-500 text-white"
      : isCurrent
        ? "bg-primary-600 text-white ring-4 ring-primary-200"
        : "bg-brand-200 text-brand-400";

    html += '<div class="flex items-center' + (isConnector ? " flex-1" : "") + '">';
    html += '<div class="flex flex-col items-center">';
    html +=
      '<div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ' +
      dotClass +
      '">';
    if (isDone) {
      html += '<i data-lucide="check" class="w-4 h-4"></i>';
    } else {
      html += i + 1;
    }
    html += "</div>";
    html +=
      '<span class="text-[10px] font-semibold mt-1 text-center capitalize whitespace-nowrap ' +
      (isCurrent ? "text-primary-700" : "text-brand-500") +
      '">' +
      step +
      "</span>";
    html += "</div>";

    if (isConnector) {
      html +=
        '<div class="h-0.5 flex-1 mx-2 mt-[-14px] ' +
        (i < ci ? "bg-success-500" : "bg-brand-200") +
        '"></div>';
    }

    html += "</div>";
  });

  html += "</div>";
  return html;
}

StatusStepper.LIFECYCLE = LIFECYCLE;
export default StatusStepper;
