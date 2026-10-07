import {
  getVisible,
  getUnreadCount,
  getIcon,
  markAsRead,
  markAllRead,
  formatRelativeTime,
  initNotificationScans,
} from "../../store/notifications.js";

const TYPE_CHIP = {
  success: "bg-success-100 text-success-700",
  error: "bg-error-100 text-error-700",
  warning: "bg-warning-100 text-warning-700",
  info: "bg-info-100 text-info-700",
};

let rootEl = null;
let panelOpen = false;
let listenersBound = false;

function currentRole() {
  return window.currentRole || "admin";
}

function renderBadge() {
  const badge = rootEl ? rootEl.querySelector("#notifBadge") : null;
  if (!badge) return;
  const count = getUnreadCount(currentRole());
  if (count > 0) {
    badge.textContent = count > 9 ? "9+" : String(count);
    badge.classList.remove("hidden");
  } else {
    badge.textContent = "";
    badge.classList.add("hidden");
  }
}

function renderPanel() {
  const panel = rootEl ? rootEl.querySelector("#notifPanel") : null;
  if (!panel) return;
  const items = getVisible(currentRole()).slice(0, 8);

  let html =
    '<div class="flex items-center justify-between px-4 py-3 border-b border-brand-200 bg-brand-50">';
  html += '<h3 class="text-sm font-bold text-brand-900 font-display">Notificaciones</h3>';
  html +=
    '<button data-action="notif-mark-all" class="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer bg-transparent border-none p-0">Marcar todas como leídas</button>';
  html += "</div>";

  if (items.length === 0) {
    html +=
      '<div class="px-4 py-10 flex flex-col items-center justify-center gap-2 text-center">';
    html += '<i data-lucide="bell-off" class="w-8 h-8 text-brand-300"></i>';
    html +=
      '<p class="text-sm text-secondary-500">No tienes notificaciones</p>';
    html += "</div>";
  } else {
    html += '<div class="max-h-[320px] overflow-y-auto">';
    items.forEach(function (n) {
      const chip = TYPE_CHIP[n.type] || TYPE_CHIP.info;
      const icon = getIcon(n.type);
      html +=
        '<div data-action="notif-item" data-id="' +
        n.id +
        '" class="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-brand-50 transition-colors border-b border-brand-100 ' +
        (n.read ? "" : "bg-brand-50/40") +
        '">';
      html +=
        '<span class="mt-0.5 w-8 h-8 shrink-0 rounded-full flex items-center justify-center ' +
        chip +
        '"><i data-lucide="' +
        icon +
        '" class="w-4 h-4"></i></span>';
      html += '<div class="flex-1 min-w-0">';
      html += '<div class="flex items-center justify-between gap-2">';
      html +=
        '<p class="text-[13px] font-semibold text-brand-900 truncate">' + n.title + "</p>";
      html +=
        '<span class="text-[11px] text-secondary-400 shrink-0">' +
        formatRelativeTime(n.created_at) +
        "</span>";
      html += "</div>";
      if (n.message) {
        html += '<p class="text-xs text-secondary-500 line-clamp-2 mt-0.5">' + n.message + "</p>";
      }
      html += "</div>";
      html +=
        n.read
          ? ""
          : '<span class="mt-1.5 w-2 h-2 rounded-full bg-error-500 shrink-0"></span>';
      html += "</div>";
    });
    html += "</div>";
  }

  html +=
    '<div class="flex items-center justify-between px-4 py-2.5 border-t border-brand-200 bg-white">';
  html +=
    '<a href="#/notifications" class="text-xs font-semibold text-brand-600 hover:text-brand-700 no-underline flex items-center gap-1">Ver todas <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i></a>';
  html += "</div>";

  panel.innerHTML = html;
  window.createIcons();
}

function showPanel() {
  if (!rootEl) return;
  const panel = rootEl.querySelector("#notifPanel");
  if (!panel) return;
  renderPanel();
  panel.classList.remove("hidden");
  panelOpen = true;
}

function hidePanel() {
  if (!rootEl) return;
  const panel = rootEl.querySelector("#notifPanel");
  if (panel) panel.classList.add("hidden");
  panelOpen = false;
}

function togglePanel() {
  if (panelOpen) {
    hidePanel();
  } else {
    showPanel();
  }
}

function bindEvents() {
  if (listenersBound) return;
  listenersBound = true;

  document.addEventListener("click", function (e) {
    if (!rootEl) return;
    if (!rootEl.contains(e.target)) {
      hidePanel();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") hidePanel();
  });

  window.addEventListener("hashchange", function () {
    hidePanel();
  });

  window.addEventListener("notifications:updated", function () {
    renderBadge();
    if (panelOpen) renderPanel();
  });

  window.addEventListener("dev-role-changed", function () {
    renderBadge();
    renderPanel();
  });
}

export function mount(container) {
  if (!container) return;
  rootEl = container;

  container.innerHTML =
    '<div class="relative">' +
    '<button id="notifBellToggle" class="relative w-10 h-10 rounded-full border border-brand-300 bg-white text-brand-600 hover:bg-brand-100 hover:border-brand-400 hover:text-brand-700 flex items-center justify-center transition-colors duration-100" aria-label="Notificaciones">' +
    '<i data-lucide="bell" class="w-[18px] h-[18px]"></i>' +
    '<span id="notifBadge" class="absolute min-w-4 h-4 px-1 rounded-full bg-error-500 text-white text-[10px] font-bold flex items-center justify-center top-1 right-1 hidden"></span>' +
    "</button>" +
    '<div id="notifPanel" class="hidden absolute right-0 top-12 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-xl border border-brand-300 shadow-[0_12px_32px_rgba(0,0,0,0.18)] z-[9999] overflow-hidden"></div>' +
    "</div>";

  renderBadge();
  window.createIcons();

  container.querySelector("#notifBellToggle").addEventListener("click", function (e) {
    e.stopPropagation();
    togglePanel();
  });

  container.addEventListener("click", function (e) {
    const target = e.target.closest("[data-action]");
    if (!target) return;
    const action = target.getAttribute("data-action");
    if (action === "notif-item") {
      markAsRead(target.getAttribute("data-id"));
    } else if (action === "notif-mark-all") {
      markAllRead(currentRole());
    }
  });

  bindEvents();
  initNotificationScans();
}

export default { mount };