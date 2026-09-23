import {
  getVisible,
  getUnreadCount,
  getIcon,
  markAsRead,
  markAllRead,
  deleteNotification,
  clearRead,
  formatRelativeTime,
} from "../../store/notifications.js";
import { withLoading, Skeletons } from "../../utils/withLoading.js";

const TYPE_CHIP = {
  success: "bg-success-100 text-success-700",
  error: "bg-error-100 text-error-700",
  warning: "bg-warning-100 text-warning-700",
  info: "bg-info-100 text-info-700",
};

let activeFilter = "all";
let activeEl = null;

function currentRole() {
  return window.currentRole || "admin";
}

function render(el) {
  activeEl = el;
  const role = currentRole();
  const all = getVisible(role);
  const unread = getUnreadCount(role);

  const filtered = all.filter(function (n) {
    if (activeFilter === "unread") return !n.read;
    if (activeFilter === "read") return n.read;
    return true;
  });

  let html = '<div class="space-y-5">';

  html += '<div class="flex items-center justify-between flex-wrap gap-3">';
  html += "<div>";
  html += '<h2 class="text-xl font-semibold text-brand-900 font-display">Notificaciones</h2>';
  html +=
    '<p class="text-sm text-secondary-500 mt-0.5">' +
    (unread > 0
      ? unread +
        (unread === 1 ? " notificación sin leer" : " notificaciones sin leer")
      : "No tienes notificaciones sin leer") +
    "</p>";
  html += "</div>";
  html += '<div class="flex items-center gap-3">';
  html +=
    '<button data-action="mark-all" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="check-check" class="w-4 h-4"></i> Marcar todas como leídas</button>';
  html +=
    '<button data-action="clear-read" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 cursor-pointer transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i> Eliminar leídas</button>';
  html += "</div>";
  html += "</div>";

  html += '<div class="flex flex-wrap gap-2">';
  const filters = [
    { key: "all", label: "Todas" },
    { key: "unread", label: "No leídas" },
    { key: "read", label: "Leídas" },
  ];
  filters.forEach(function (f) {
    const active = activeFilter === f.key;
    html +=
      '<button data-filter="' +
      f.key +
      '" class="px-3 py-1.5 text-xs font-semibold rounded-full cursor-pointer transition-colors border ' +
      (active
        ? "bg-primary-600 text-white border-primary-600"
        : "bg-white text-brand-700 border-brand-300 hover:bg-brand-50") +
      '">' +
      f.label +
      "</button>";
  });
  html += "</div>";

  if (filtered.length === 0) {
    html += '<div class="bg-white border border-brand-300 rounded-xl py-14">';
    html += '<div class="flex flex-col items-center justify-center gap-3 text-center px-4">';
    html += '<i data-lucide="bell-off" class="w-12 h-12 text-brand-300"></i>';
    html += '<p class="text-sm font-semibold text-brand-800">No hay notificaciones</p>';
    html +=
      '<p class="text-sm text-secondary-500">' +
      (activeFilter !== "all"
        ? "No se encontraron notificaciones en este filtro."
        : "Aquí aparecerán las alertas de órdenes, cocina, reservas, inventario y pagos.") +
      "</p>";
    html += "</div>";
    html += "</div>";
  } else {
    html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
    filtered.forEach(function (n) {
      const chip = TYPE_CHIP[n.type] || TYPE_CHIP.info;
      const icon = getIcon(n.type);
      html +=
        '<div class="flex items-start gap-3 px-4 py-3.5 border-b border-brand-100 last:border-b-0 ' +
        (n.read ? "" : "bg-brand-50/40") +
        '">';
      html +=
        '<span class="mt-0.5 w-9 h-9 shrink-0 rounded-full flex items-center justify-center ' +
        chip +
        '"><i data-lucide="' +
        icon +
        '" class="w-[18px] h-[18px]"></i></span>';
      html += '<div class="flex-1 min-w-0">';
      html += '<div class="flex items-center justify-between gap-3">';
      html +=
        '<p class="text-sm font-semibold text-brand-900 truncate">' +
        n.title +
        "</p>";
      html +=
        '<span class="text-xs text-secondary-400 shrink-0">' +
        formatRelativeTime(n.created_at) +
        "</span>";
      html += "</div>";
      if (n.message) {
        html += '<p class="text-[13px] text-secondary-600 mt-0.5">' + n.message + "</p>";
      }
      html += "</div>";
      html += '<div class="flex items-center gap-1.5 shrink-0">';
      if (!n.read) {
        html +=
          '<button data-action="mark-read" data-id="' +
          n.id +
          '" class="flex items-center justify-center w-8 h-8 rounded-md bg-brand-50 text-brand-700 hover:bg-brand-100 border-0 cursor-pointer transition-colors" aria-label="Marcar como leída" title="Marcar como leída"><i data-lucide="check" class="w-4 h-4"></i></button>';
      }
      html +=
        '<button data-action="delete" data-id="' +
        n.id +
        '" class="flex items-center justify-center w-8 h-8 rounded-md bg-transparent text-secondary-400 hover:text-error-600 hover:bg-error-50 border-0 cursor-pointer transition-colors" aria-label="Eliminar notificación" title="Eliminar"><i data-lucide="trash-2" class="w-4 h-4"></i></button>';
      html += "</div>";
      html += "</div>";
    });
    html += "</div>";
  }

  html += "</div>";

  el.innerHTML = html;
  window.createIcons();

  el.onclick = function (e) {
    const btn = e.target.closest("[data-action], [data-filter]");
    if (!btn) return;
    if (btn.hasAttribute("data-filter")) {
      activeFilter = btn.getAttribute("data-filter");
      render(el);
      return;
    }
    const action = btn.getAttribute("data-action");
    if (action === "mark-all") {
      markAllRead(role);
    } else if (action === "clear-read") {
      clearRead(role);
    } else if (action === "mark-read") {
      markAsRead(btn.getAttribute("data-id"));
    } else if (action === "delete") {
      deleteNotification(btn.getAttribute("data-id"));
    }
  };
}

function onNotificationsUpdated() {
  if (activeEl) render(activeEl);
}

const NotificationsView = {
  render: render,
  init: function () {
    window.addEventListener("notifications:updated", onNotificationsUpdated);
    window.addEventListener("dev-role-changed", onNotificationsUpdated);
  },
  destroy: function () {
    window.removeEventListener("notifications:updated", onNotificationsUpdated);
    window.removeEventListener("dev-role-changed", onNotificationsUpdated);
    activeEl = null;
  },
};

export default withLoading(NotificationsView, Skeletons.notifications());