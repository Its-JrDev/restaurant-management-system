import { currentUser } from "../store/auth.js";

const ROLE_PERMISSIONS = {
  admin: [
    "view:dashboard",
    "view:pos",
    "view:orders",
    "view:kitchen",
    "view:tables",
    "view:reservations",
    "view:payments",
    "view:menu",
    "view:inventory",
    "view:reports",
    "view:settings",
    "manage:orders",
    "manage:tables",
    "manage:reservations",
    "manage:payments",
    "manage:menu",
    "manage:inventory",
    "manage:users",
    "manage:settings",
    "export:reports",
  ],
  waiter: [
    "view:dashboard",
    "view:pos",
    "view:orders",
    "view:tables",
    "view:menu",
    "manage:orders",
    "manage:tables",
  ],
  chef: ["view:kitchen", "view:pos", "view:orders", "view:menu", "manage:orders"],
  cashier: ["view:dashboard", "view:payments", "view:menu", "manage:payments"],
};

export function getRole() {
  const user = currentUser();
  return user ? user.role : null;
}

export function hasPermission(permission) {
  const role = getRole();
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role];
  return perms ? perms.includes(permission) : false;
}

export function hasAnyRole(...roles) {
  const role = getRole();
  return role ? roles.includes(role) : false;
}

export function isAdmin() {
  return hasAnyRole("admin");
}

export function isWaiter() {
  return hasAnyRole("waiter");
}

export function isChef() {
  return hasAnyRole("chef");
}

export function isCashier() {
  return hasAnyRole("cashier");
}

export function ifVisible(roles, html) {
  if (hasAnyRole(...roles)) return html;
  return "";
}

export function ifPermission(permission, html) {
  if (hasPermission(permission)) return html;
  return "";
}
