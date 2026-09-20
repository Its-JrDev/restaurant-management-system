function TableStatusCard() {
  const statusCounts = { available: 4, occupied: 6, reserved: 2 };
  const total = 12;

  const occupiedPct = ((statusCounts.occupied / total) * 100).toFixed(0);
  const reservedPct = ((statusCounts.reserved / total) * 100).toFixed(0);
  const availablePct = ((statusCounts.available / total) * 100).toFixed(0);

  let html = '<div class="bg-white border border-brand-300 rounded-xl shadow-sm p-5 h-full">';
  html +=
    '<h3 class="text-base font-semibold text-primary-700 font-display mb-4">Table Status</h3>';

  html += '<div class="flex flex-col gap-4">';

  html += '<div class="flex items-center justify-between">';
  html += '<div class="flex items-center gap-3">';
  html += '<span class="w-2.5 h-2.5 rounded-full bg-success-500"></span>';
  html += '<span class="text-sm">Available</span>';
  html += "</div>";
  html += '<span class="text-sm font-semibold">' + statusCounts.available + " tables</span>";
  html += "</div>";

  html += '<div class="flex items-center justify-between">';
  html += '<div class="flex items-center gap-3">';
  html += '<span class="w-2.5 h-2.5 rounded-full bg-error-500"></span>';
  html += '<span class="text-sm">Occupied</span>';
  html += "</div>";
  html += '<span class="text-sm font-semibold">' + statusCounts.occupied + " tables</span>";
  html += "</div>";

  html += '<div class="flex items-center justify-between">';
  html += '<div class="flex items-center gap-3">';
  html += '<span class="w-2.5 h-2.5 rounded-full bg-accent-500"></span>';
  html += '<span class="text-sm">Reserved</span>';
  html += "</div>";
  html += '<span class="text-sm font-semibold">' + statusCounts.reserved + " tables</span>";
  html += "</div>";

  html += '<div class="mt-2">';
  html += '<div class="h-2 rounded-full overflow-hidden flex bg-neutral-100">';
  html += '<div class="bg-error-500" style="width:' + occupiedPct + '%"></div>';
  html += '<div class="bg-accent-500" style="width:' + reservedPct + '%"></div>';
  html += '<div class="bg-success-500" style="width:' + availablePct + '%"></div>';
  html += "</div>";
  html += "</div>";

  html += "</div></div>";
  return html;
}

export default TableStatusCard;
