import { getLogoPath, toggleTheme, isDark } from "../../utils/theme.js";
import { isRouteAllowed } from "../../utils/routeGuard.js";

let sidebarOpen = false;

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      {
        icon: "layout-dashboard",
        label: "Dashboard",
        path: "/dashboard",
        badge: "",
        roles: ["admin"],
      },
      {
        icon: "shopping-cart",
        label: "POS / Orders",
        path: "/pos",
        badge: "3",
        roles: ["admin", "waiter", "chef"],
      },
      {
        icon: "chef-hat",
        label: "Kitchen",
        path: "/kitchen",
        badge: "5",
        roles: ["admin", "chef"],
      },
      { icon: "square", label: "Tables", path: "/tables", badge: "", roles: ["admin", "waiter"] },
    ],
  },
  {
    label: "Management",
    items: [
      {
        icon: "calendar",
        label: "Reservations",
        path: "/reservations",
        badge: "",
        roles: ["admin"],
      },
      { icon: "utensils", label: "Menu", path: "/menu", badge: "", roles: ["*"] },
      { icon: "package", label: "Inventory", path: "/inventory", badge: "", roles: ["admin"] },
      {
        icon: "credit-card",
        label: "Payments",
        path: "/payments",
        badge: "",
        roles: ["admin", "cashier"],
      },
      { icon: "bar-chart-3", label: "Reports", path: "/reports", badge: "", roles: ["admin"] },
    ],
  },
  {
    label: "System",
    items: [
      { icon: "settings", label: "Settings", path: "/settings", badge: "", roles: ["admin"] },
    ],
  },
];

const BOTTOM_NAV_ITEMS = [
  { icon: "layout-dashboard", label: "Dashboard", path: "/dashboard" },
  { icon: "shopping-cart", label: "POS", path: "/pos" },
  { icon: "square", label: "Tables", path: "/tables" },
  { icon: "credit-card", label: "Payments", path: "/payments" },
  { icon: "chef-hat", label: "Kitchen", path: "/kitchen" },
  { icon: "utensils", label: "Menu", path: "/menu" },
  { icon: "calendar", label: "Reserv.", path: "/reservations" },
  { icon: "package", label: "Inventory", path: "/inventory" },
  { icon: "bar-chart-3", label: "Reports", path: "/reports" },
  { icon: "settings", label: "Settings", path: "/settings" },
];

function getBottomNavItems(role) {
  const visible = BOTTOM_NAV_ITEMS.filter(function (item) {
    return isRouteAllowed(item.path, role);
  });
  return visible.slice(0, 5);
}

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  applySidebarState();
}

function closeSidebar() {
  sidebarOpen = false;
  applySidebarState();
}

function applySidebarState() {
  const sidebar = document.querySelector("[data-app-shell] aside");
  const overlay = document.getElementById("sidebarOverlay");
  if (!sidebar) return;
  if (sidebarOpen) {
    sidebar.classList.add("translate-x-0");
    sidebar.classList.remove("-translate-x-full");
    if (overlay) {
      overlay.classList.remove("hidden");
      overlay.classList.add("animate-backdrop-in");
    }
  } else {
    sidebar.classList.remove("translate-x-0");
    sidebar.classList.add("-translate-x-full");
    if (overlay) {
      overlay.classList.add("hidden");
      overlay.classList.remove("animate-backdrop-in");
    }
  }
}

const AppShell = {
  render: function (el) {
    if (el.querySelector("[data-app-shell]")) return;

    const user = window.userData || {
      name: "Maria Castillo",
      initials: "MC",
      role: "Administrator",
    };

    el.innerHTML =
      '<div data-app-shell class="grid h-screen overflow-hidden grid-cols-1 lg:grid-cols-[var(--sidebar-width)_1fr] grid-rows-[var(--topbar-height)_1fr]">' +
      '<div id="sidebarOverlay" class="fixed inset-0 bg-black/50 z-40 hidden lg:hidden"></div>' +
      '<aside class="bg-brand-500 text-white flex flex-col overflow-y-auto overflow-x-hidden fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] -translate-x-full transition-transform duration-300 ease-in-out will-change-transform lg:relative lg:translate-x-0 lg:z-auto row-start-1 row-end-[-1] border-r-0">' +
      '<header class="flex items-center gap-4 px-4 py-2 shrink-0 border-b border-white/20"></header>' +
      '<nav class="flex-1 px-3 flex flex-col overflow-y-auto gap-1"></nav>' +
      '<footer class="flex items-center gap-3 px-5 py-4 shrink-0 border-t border-white/20"></footer>' +
      "</aside>" +
      '<header class="bg-brand-50 border-b-2 border-brand-300 z-10 flex items-center px-4 lg:px-6 gap-3 col-start-1 lg:col-start-2 row-start-1"></header>' +
      '<main id="main-content" class="p-4 lg:p-6 overflow-auto bg-brand-100 col-start-1 lg:col-start-2 row-start-2 pb-20 lg:pb-0"></main>' +
      "</div>" +
      '<nav id="bottomNav" class="fixed bottom-0 inset-x-0 z-30 lg:hidden bg-white border-t border-brand-200 flex items-stretch justify-around pb-[env(safe-area-inset-bottom,0px)]"></nav>';

    const header = el.querySelector("aside > header");
    const nav = el.querySelector("aside > nav");
    const footer = el.querySelector("aside > footer");
    const topbar = el.querySelector("[data-app-shell] > header");

    AppShell.renderSidebarHeader(header);
    AppShell.renderSidebarNav(nav);
    AppShell.renderSidebarFooter(footer, user);
    AppShell.renderTopbar(topbar);
    AppShell.renderBottomNav();

    const overlay = document.getElementById("sidebarOverlay");
    if (overlay) {
      overlay.addEventListener("click", closeSidebar);
    }

    const themeBtn = document.getElementById("appShellThemeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", function () {
        toggleTheme();
        const icon = themeBtn.querySelector("[data-lucide]");
        const nextTheme = isDark() ? "dark" : "light";
        if (icon) {
          icon.setAttribute("data-lucide", isDark() ? "moon" : "sun");
          window.createIcons();
        }
        const sidebarHeader = el.querySelector("aside > header");
        if (sidebarHeader) {
          AppShell.renderSidebarHeader(sidebarHeader);
        }
        window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: nextTheme } }));
        // hashchange removed to avoid destructive re-rendering
      });
    }
  },

  renderSidebarHeader: function (el) {
    el.innerHTML =
      '<div class="flex items-center gap-3">' +
      '<img src="' +
      getLogoPath("logo-01") +
      '" alt="El Fogón" draggable="false" class="h-[46px] w-auto">' +
      '<img src="' +
      getLogoPath("logo-03") +
      '" alt="El Fogón Caribeño" draggable="false" class="w-[120px] h-auto">' +
      "</div>";
  },

  renderSidebarNav: function (el) {
    const userRole = window.currentRole || "admin";
    const currentPath = window.location.hash.slice(1) || "/dashboard";

    let html = "";
    NAV_SECTIONS.forEach(function (section) {
      const visibleItems = section.items.filter(function (item) {
        if (!item.roles || item.roles.includes("*")) return true;
        return item.roles.includes(userRole);
      });
      if (visibleItems.length === 0) return;
      html +=
        '<p class="text-[11px] font-bold uppercase mb-2 px-3 pt-4 tracking-[0.08em] text-white/50">' +
        section.label +
        "</p>";
      visibleItems.forEach(function (item) {
        const isActive = currentPath === item.path;
        const stateClasses = isActive
          ? "bg-white text-brand-700 font-semibold"
          : "bg-transparent text-white font-medium hover:bg-white/15 hover:text-white";
        const iconClasses = isActive ? "opacity-100 text-brand-500" : "opacity-70";
        const bar = isActive
          ? '<span class="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-400 rounded-r-full"></span>'
          : "";
        const badge = item.badge
          ? '<span class="ml-auto bg-accent-400 text-white text-[11px] font-bold px-[7px] py-0.5 rounded-full min-w-[20px] text-center">' +
            item.badge +
            "</span>"
          : "";
        html +=
          '<a href="#' +
          item.path +
          '" class="relative flex items-center gap-3 px-3 py-3 w-full text-left rounded-md transition-all duration-100 no-underline ' +
          stateClasses +
          '">';
        html += bar;
        html +=
          '<i data-lucide="' + item.icon + '" class="w-5 h-5 shrink-0 ' + iconClasses + '"></i>';
        html += '<span class="flex-1">' + item.label + "</span>";
        html += badge;
        html += "</a>";
      });
    });

    el.innerHTML = html;
    window.createIcons();
  },

  renderSidebarFooter: function (el, user) {
    el.innerHTML =
      '<div class="bg-white flex items-center justify-center font-bold text-brand-600 font-display shrink-0 w-[38px] h-[38px] rounded-full text-[13px]">' +
      user.initials +
      "</div>" +
      '<div class="flex-1 flex flex-col leading-tight">' +
      '<span class="text-[13px] font-semibold text-white">' +
      user.name +
      "</span>" +
      '<span class="text-xs text-white/70">' +
      user.role +
      "</span>" +
      "</div>" +
      '<button id="appShellLogout" class="flex items-center justify-center transition-colors bg-transparent border-none text-white cursor-pointer p-1" aria-label="Logout">' +
      '<i data-lucide="log-out" class="w-[18px] h-[18px]"></i>' +
      "</button>";
  },

  renderTopbar: function (el) {
    const title = AppShell.getRouteTitle(window.location.hash.slice(1));
    el.innerHTML =
      '<button id="sidebarToggle" class="lg:hidden w-10 h-10 rounded-full border border-brand-300 bg-white text-brand-600 hover:bg-brand-100 hover:border-brand-400 flex items-center justify-center transition-colors duration-100 shrink-0" aria-label="Toggle menu">' +
      '<i data-lucide="menu" class="w-[18px] h-[18px]"></i>' +
      "</button>" +
      '<h1 id="topbarTitle" class="text-[16px] lg:text-[18px] font-bold text-brand-800 font-display tracking-tight truncate">' +
      title +
      "</h1>" +
      '<div class="flex-1"></div>' +
      '<div class="hidden md:flex items-center border border-brand-300 rounded-full gap-2 h-10 px-4 w-[240px] focus-within:border-brand-500 focus-within:shadow-[var(--ring-brand)] transition-all duration-100">' +
      '<i data-lucide="search" class="w-4 h-4 text-brand-500 shrink-0"></i>' +
      '<input type="text" placeholder="Search orders, tables..." class="bg-transparent border-none outline-none flex-1 text-[13px] text-neutral-900 placeholder:text-brand-400" />' +
      "</div>" +
      '<div class="hidden md:block w-px h-6 bg-brand-300"></div>' +
      '<button class="relative w-10 h-10 rounded-full border border-brand-300 bg-white text-brand-600 hover:bg-brand-100 hover:border-brand-400 hover:text-brand-700 flex items-center justify-center transition-colors duration-100">' +
      '<i data-lucide="bell" class="w-[18px] h-[18px]"></i>' +
      '<span class="absolute w-2 h-2 rounded-full bg-error-500 top-2 right-2 border-2 border-white"></span>' +
      "</button>" +
      '<div id="demo-role-switcher-container" class="relative"></div>' +
      '<button id="appShellThemeToggle" class="w-10 h-10 rounded-full border border-brand-300 bg-white text-brand-600 hover:bg-brand-100 hover:border-brand-400 hover:text-brand-700 flex items-center justify-center transition-colors duration-100" aria-label="Toggle theme">' +
      '<i data-lucide="' +
      (isDark() ? "moon" : "sun") +
      '" class="w-[18px] h-[18px]"></i>' +
      "</button>";

    const toggleBtn = document.getElementById("sidebarToggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", toggleSidebar);
    }
  },

  renderBottomNav: function () {
    const bottomNav = document.getElementById("bottomNav");
    if (!bottomNav) return;

    const role = window.currentRole || "admin";
    const items = getBottomNavItems(role);
    let currentPath = window.location.hash.slice(1) || "/dashboard";
    if (currentPath === "/orders") currentPath = "/pos";
    if (currentPath === "/admin") currentPath = "/dashboard";

    let html = "";
    items.forEach(function (item) {
      const isActive = currentPath === item.path;
      const stateClasses = isActive
        ? "text-brand-600 font-semibold bg-brand-50"
        : "text-neutral-500";
      const accentBar = isActive
        ? '<span class="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-600 rounded-b-full"></span>'
        : "";
      html +=
        '<a href="#' +
        item.path +
        '" class="relative flex-1 flex flex-col items-center justify-center py-2 no-underline ' +
        stateClasses +
        '">';
      html += accentBar;
      html += '<i data-lucide="' + item.icon + '" class="w-5 h-5 mb-0.5"></i>';
      html += '<span class="text-[10px] leading-tight">' + item.label + "</span>";
      html += "</a>";
    });

    bottomNav.innerHTML = html;
    window.createIcons();
  },

  getRouteTitle: function (path) {
    const titles = {
      "/dashboard": "Dashboard",
      "/pos": "POS / Orders",
      "/kitchen": "Kitchen Dashboard",
      "/tables": "Table Management",
      "/reservations": "Reservations",
      "/payments": "Payments",
      "/menu": "Menu Management",
      "/inventory": "Inventory",
      "/reports": "Reports",
      "/settings": "Settings",
      "/admin": "Admin",
      "/orders": "POS / Orders",
    };
    return titles[path] || "Dashboard";
  },

  updateTopbarTitle: function (path) {
    const titleEl = document.getElementById("topbarTitle");
    if (titleEl) {
      titleEl.textContent = AppShell.getRouteTitle(path);
    }
    const nav = document.querySelector("[data-app-shell] aside > nav");
    if (nav) {
      AppShell.renderSidebarNav(nav);
    }
    AppShell.renderBottomNav();
    closeSidebar();
  },
};

export default AppShell;
