import { createIcons, icons } from "lucide";
import * as authStore from "./store/auth.js";
import { getHomeRoute, isRouteAllowed } from "./utils/routeGuard.js";
import { initTheme } from "./utils/theme.js";
import AppShell from "./components/layout/AppShell.js";
import Dashboard from "./views/dashboard/Dashboard.js";
import PosView from "./views/orders/PosView.js";
import Kitchen from "./views/kitchen/Kitchen.js";
import TablesView from "./views/tables/Tables.js";
import Login from "./views/auth/Login.js";
import Reservations from "./views/reservations/list.js";
import Payments from "./views/payments/list.js";
import Menu from "./views/menu/list.js";
import Inventory from "./views/inventory/Inventory.js";
import Reports from "./views/reports/Reports.js";
import Settings from "./views/settings/Settings.js";
import { initRoleSwitcher } from "./components/dev/RoleSwitcher.js";

window.createIcons = function () {
  createIcons({ icons });
};

let currentView = null;

const routes = {
  "/login": { view: Login, shell: false, auth: false },
  "/dashboard": { view: Dashboard, shell: true, auth: true },
  "/pos": { view: PosView, shell: true, auth: true },
  "/kitchen": { view: Kitchen, shell: true, auth: true },
  "/tables": { view: TablesView, shell: true, auth: true },
  "/reservations": { view: Reservations, shell: true, auth: true },
  "/payments": { view: Payments, shell: true, auth: true },
  "/menu": { view: Menu, shell: true, auth: true },
  "/inventory": { view: Inventory, shell: true, auth: true },
  "/reports": { view: Reports, shell: true, auth: true },
  "/settings": { view: Settings, shell: true, auth: true },
  "/admin": { view: PosView, shell: true, auth: true },
  "/orders": { view: PosView, shell: true, auth: true },
};

function getRoute() {
  return window.location.hash.slice(1) || "/login";
}

function destroyView() {
  if (currentView && currentView.destroy) {
    currentView.destroy();
  }
  currentView = null;
}

function renderView() {
  try {
    const path = getRoute();
    const user = authStore.currentUser();

    if (path !== "/login") {
      if (!user) {
        window.location.hash = "#/login";
        return;
      }
    }

    if (path === "/login") {
      if (user) {
        const home = getHomeRoute(user.role);
        window.location.hash = "#" + home;
        return;
      }
    }

    const route = routes[path];
    if (!route) {
      if (user) {
        const defaultRoute = getHomeRoute(user.role);
        window.location.hash = "#" + defaultRoute;
      } else {
        window.location.hash = "#/login";
      }
      return;
    }

    if (route.auth && !user) {
      window.location.hash = "#/login";
      return;
    }

    if (user && !isRouteAllowed(path, user.role)) {
      const home = getHomeRoute(user.role);
      window.location.hash = "#" + home;
      return;
    }

    if (route.shell) {
      window.currentRole = user ? user.role : "admin";
      const roleLabels = {
        admin: "Administrator",
        waiter: "Waiter",
        chef: "Chef",
        cashier: "Cashier",
      };
      const username = user ? user.displayName || user.username || "Admin" : "Admin";
      const initials = username
        .split(" ")
        .map(function (w) {
          return w[0];
        })
        .join("")
        .toUpperCase()
        .slice(0, 2);
      const roleText = roleLabels[user ? user.role : "admin"] || "Administrator";
      window.userData = {
        name: username,
        initials: initials,
        role: roleText,
      };
      AppShell.render(document.getElementById("app"));
      AppShell.updateTopbarTitle(path);
      const logoutBtn = document.getElementById("appShellLogout");
      if (logoutBtn) {
        logoutBtn.onclick = function () {
          authStore.logout();
          window.location.hash = "#/login";
        };
      }
    }

    const container = route.shell
      ? document.getElementById("main-content")
      : document.getElementById("app");
    if (!container) return;

    destroyView();

    container.innerHTML = "";
    const viewEl = document.createElement("div");
    viewEl.id = "current-view";
    container.appendChild(viewEl);

    const renderResult = route.view.render(viewEl);
    if (renderResult && typeof renderResult.then === "function") {
      renderResult.then(function () {
        window.createIcons();
        if (route.view.init) {
          route.view.init();
        }
      });
    } else {
      window.createIcons();
      if (route.view.init) {
        route.view.init();
      }
    }
    currentView = route.view;
  } catch (err) {
    console.error("[app] renderView failed", err);
    const errorEl = document.getElementById("app");
    if (errorEl) {
      errorEl.innerHTML = '<pre style="color:red;padding:1rem;">' + err.stack + "</pre>";
    }
  }
}

window.addEventListener("hashchange", function () {
  renderView();
});

window.navigate = function (path) {
  window.location.hash = "#" + path;
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    renderView();
    initRoleSwitcher(authStore);
  });
} else {
  initTheme();
  renderView();
  initRoleSwitcher(authStore);
}

window.addEventListener("dev-role-changed", function () {
  renderView();
  window.createIcons();
});
