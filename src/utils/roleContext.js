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
    "manage:kitchen",
    "manage:reservations",
    "manage:payments",
    "manage:menu",
    "manage:inventory",
    "manage:users",
    "manage:settings",
    "export:reports",
  ],
  waiter: [
    "view:tables",
    "manage:tables",
    "view:pos",
    "manage:orders",
    "view:reservations",
    "manage:reservations",
    "view:menu",
  ],
  chef: ["view:kitchen", "manage:kitchen", "view:menu", "view:inventory"],
  cashier: ["view:payments", "manage:payments", "view:pos", "view:menu"],
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
