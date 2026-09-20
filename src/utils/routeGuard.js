const ROLES = {
  ADMIN: "admin",
  WAITER: "waiter",
  CHEF: "chef",
  CASHIER: "cashier",
};

const ROLE_HOME = {
  [ROLES.ADMIN]: "/admin",
  [ROLES.WAITER]: "/orders",
  [ROLES.CHEF]: "/kitchen",
  [ROLES.CASHIER]: "/payments",
};

const ROLE_ACCESS = {
  "/admin": [ROLES.ADMIN],
  "/dashboard": [ROLES.ADMIN],
  "/orders": [ROLES.ADMIN, ROLES.WAITER, ROLES.CHEF],
  "/pos": [ROLES.ADMIN, ROLES.WAITER, ROLES.CHEF],
  "/kitchen": [ROLES.ADMIN, ROLES.CHEF],
  "/tables": [ROLES.ADMIN, ROLES.WAITER],
  "/payments": [ROLES.ADMIN, ROLES.CASHIER],
  "/reservations": [ROLES.ADMIN],
  "/inventory": [ROLES.ADMIN],
  "/reports": [ROLES.ADMIN],
  "/settings": [ROLES.ADMIN],
  "/menu": ["*"],
  "/": ["*"],
};

export function getHomeRoute(role) {
  return ROLE_HOME[role] || "/dashboard";
}

export function isRouteAllowed(path, userRole) {
  const allowed = ROLE_ACCESS[path];
  if (!allowed) return true;
  if (allowed.includes("*")) return true;
  return userRole ? allowed.includes(userRole) : false;
}

export function guard(user) {
  if (!user) {
    window.location.hash = "#/login";
    return false;
  }
  return true;
}

export function guardRole(user, allowedRoles) {
  if (!guard(user)) return false;
  if (allowedRoles.includes("*")) return true;
  if (!allowedRoles.includes(user.role)) {
    window.location.hash = "#/login";
    return false;
  }
  return true;
}
