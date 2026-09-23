import { getCollection, insertItem, updateItem as dbUpdateItem, deleteItem as dbDeleteItem } from "./data/db.js";
import { toast } from "../components/ui/ToastManager.js";

const TYPE_ICONS = {
  success: "check-circle",
  error: "x-circle",
  warning: "alert-triangle",
  info: "info",
};

let notifications = [];
let loaded = false;
let scanStarted = false;

function ensureLoaded() {
  if (loaded) return;
  notifications = getCollection("notifications");
  loaded = true;
}

function getCurrentRole() {
  return window.currentRole || "admin";
}

function isVisibleToRole(n, role) {
  if (!n.roles || n.roles.length === 0) return true;
  return n.roles.includes("*") || n.roles.includes(role);
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora mismo";
  if (mins < 60) return "hace " + mins + " min";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return "hace " + hours + " h";
  const days = Math.floor(hours / 24);
  if (days === 1) return "ayer";
  return "hace " + days + " d";
}

function hasNotification(refType, refId) {
  if (refType == null || refId == null) return false;
  return notifications.some(function (n) {
    return n.refType === refType && String(n.refId) === String(refId);
  });
}

export function getVisible(role) {
  ensureLoaded();
  const r = role || getCurrentRole();
  return notifications
    .filter(function (n) {
      return isVisibleToRole(n, r);
    })
    .sort(function (a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    });
}

export function getUnreadCount(role) {
  const r = role || getCurrentRole();
  return getVisible(r).filter(function (n) {
    return !n.read;
  }).length;
}

export function getIcon(type) {
  return TYPE_ICONS[type] || "info";
}

export function dispatchUpdated() {
  window.dispatchEvent(
    new CustomEvent("notifications:updated", { detail: { count: getUnreadCount() } })
  );
}

export function notify(options) {
  ensureLoaded();
  const type = options.type || "info";
  const title = options.title || "";
  const message = options.message || "";
  const roles = options.roles || ["*"];
  const refType = options.refType || null;
  const refId = options.refId != null ? options.refId : null;

  if (options.dedupe && hasNotification(refType, refId)) return null;

  const notification = {
    id: "notif-" + Date.now() + "-" + (notifications.length + 1),
    type: type,
    title: title,
    message: message,
    roles: roles,
    read: false,
    refType: refType,
    refId: refId,
    created_at: new Date().toISOString(),
  };
  insertItem("notifications", notification);
  notifications.push(notification);
  dispatchUpdated();

  if (isVisibleToRole(notification, getCurrentRole())) {
    const show = toast[type] || toast.info;
    show(title, message);
  }
  return notification;
}

export function markAsRead(id) {
  ensureLoaded();
  const found = notifications.find(function (n) {
    return n.id === id;
  });
  if (!found || found.read) return;
  dbUpdateItem("notifications", id, { read: true });
  found.read = true;
  dispatchUpdated();
}

export function markAllRead(role) {
  ensureLoaded();
  const r = role || getCurrentRole();
  let changed = false;
  notifications.forEach(function (n) {
    if (isVisibleToRole(n, r) && !n.read) {
      dbUpdateItem("notifications", n.id, { read: true });
      n.read = true;
      changed = true;
    }
  });
  if (changed) dispatchUpdated();
}

export function deleteNotification(id) {
  ensureLoaded();
  dbDeleteItem("notifications", id);
  notifications = notifications.filter(function (n) {
    return n.id !== id;
  });
  dispatchUpdated();
}

export function clearRead(role) {
  ensureLoaded();
  const r = role || getCurrentRole();
  const toDelete = notifications.filter(function (n) {
    return isVisibleToRole(n, r) && n.read;
  });
  toDelete.forEach(function (n) {
    dbDeleteItem("notifications", n.id);
  });
  notifications = notifications.filter(function (n) {
    return toDelete.indexOf(n) === -1;
  });
  dispatchUpdated();
}

export function initNotificationScans() {
  if (scanStarted) return;
  scanStarted = true;

  getCollection("inventory_items").forEach(function (item) {
    if (parseFloat(item.quantity) <= parseFloat(item.min_stock)) {
      notify({
        type: "warning",
        title: "Stock bajo",
        message:
          'El ingrediente "' +
          item.name +
          '" está por debajo del mínimo (' +
          item.quantity +
          " " +
          (item.unit || "") +
          ").",
        roles: ["admin", "chef"],
        refType: "low_stock",
        refId: item.id,
        dedupe: true,
      });
    }
  });

  const now = Date.now();
  const inTwoHours = now + 2 * 60 * 60 * 1000;
  getCollection("reservations").forEach(function (r) {
    const date = new Date(r.reservation_date);
    if (date.getTime() >= now && date.getTime() <= inTwoHours) {
      notify({
        type: "info",
        title: "Reserva próxima",
        message:
          "Reserva de " +
          (r.guest_name || "huésped") +
          " en " +
          date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) +
          " (" +
          (r.guest_count || 1) +
          " personas).",
        roles: ["admin", "waiter"],
        refType: "reservation_upcoming",
        refId: r.id,
        dedupe: true,
      });
    }
  });
}