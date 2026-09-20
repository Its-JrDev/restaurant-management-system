const ROLES = [
  { id: "admin", label: "Admin", color: "#dc2626" },
  { id: "waiter", label: "Waiter", color: "#7329e1" },
  { id: "chef", label: "Chef", color: "#c77c2c" },
  { id: "cashier", label: "Cashier", color: "#16a34a" },
];

let expanded = false;

function getCurrentRole() {
  return window.currentRole || "admin";
}

function renderFloatingButton() {
  const existing = document.getElementById("dev-role-switcher");
  if (existing) existing.remove();

  if (window.location.hash === "#/login" || window.location.hash === "" || window.location.pathname.includes("/login")) {
    return;
  }

  const role = getCurrentRole();
  const roleMeta =
    ROLES.find(function (r) {
      return r.id === role;
    }) || ROLES[0];

  const wrapper = document.createElement("div");
  wrapper.id = "dev-role-switcher";

  // Always floating in bottom right
  wrapper.style.cssText = "position:fixed;bottom:calc(4.5rem + env(safe-area-inset-bottom, 20px));right:20px;z-index:9999;font-family:system-ui,sans-serif;";
  
  // Tailwind handles the desktop override (bottom-8 instead of 4.5rem if we could, but cssText inline overrides tailwind. We'll leave it as is or use a class)
  wrapper.className = "max-md:bottom-[calc(4.5rem+20px)] md:bottom-8 right-4 md:right-8";
  wrapper.style.position = "fixed";
  wrapper.style.zIndex = "9999";
  wrapper.style.fontFamily = "system-ui, sans-serif";

  document.body.appendChild(wrapper);

  if (expanded) {
    let html =
      '<div class="absolute right-0 bottom-full mb-3 bg-brand-100 border border-brand-300 rounded-xl p-2 shadow-2xl min-w-[180px] z-[100000] dark:bg-brand-200 dark:border-brand-400">';
    html +=
      '<div class="px-2 py-1 text-[10px] font-bold text-brand-600 dark:text-brand-700 uppercase tracking-wider">Demo Role Switcher</div>';
    ROLES.forEach(function (r) {
      const isActive = r.id === role;
      const bgClass = isActive ? "bg-brand-500 text-white" : "text-brand-900 hover:bg-brand-200 dark:text-brand-900 dark:hover:bg-brand-300";
      html +=
        '<button data-role="' +
        r.id +
        '" class="flex items-center gap-2 w-full px-3 py-2 border-none rounded-lg text-[13px] font-semibold cursor-pointer text-left transition-colors ' +
        bgClass +
        '">';
      html +=
        '<span style="width:8px;height:8px;border-radius:50%;background:' +
        (isActive ? "#fff" : r.color) +
        ';flex-shrink:0;"></span>';
      html += r.label;
      if (isActive) {
        html += '<span class="ml-auto text-[10px] opacity-70">&#10003;</span>';
      }
      html += "</button>";
    });
    html += "</div>";
    wrapper.innerHTML = html;
  } else {
    wrapper.innerHTML =
      '<button id="dev-role-toggle" class="flex items-center gap-2 h-10 px-4 rounded-full border border-brand-400 bg-brand-600 hover:bg-brand-700 text-white text-[12px] font-bold cursor-pointer shadow-lg shadow-brand-hover uppercase tracking-wide transition-all">' +
      '<span style="width:8px;height:8px;border-radius:50%;background:' + roleMeta.color + ';box-shadow:0 0 0 1px rgba(255,255,255,0.3);"></span>' +
      '<span class="hidden md:inline">Demo: </span>' + (roleMeta ? roleMeta.label : role) +
      "</button>";
  }

  if (expanded) {
    wrapper.querySelectorAll("[data-role]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchRole(this.getAttribute("data-role"));
      });
    });
  } else {
    const toggleBtn = document.getElementById("dev-role-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        expanded = true;
        renderFloatingButton();
      });
    }
  }

  setTimeout(function () {
    document.addEventListener("click", function handleOutside(e) {
      if (!wrapper.contains(e.target)) {
        expanded = false;
        renderFloatingButton();
        document.removeEventListener("click", handleOutside);
      }
    });
  }, 0);
}

function switchRole(newRole) {
  const auth = window._devAuthModule;
  if (!auth) return;

  const user = auth.currentUser();
  if (!user) return;

  auth.setRole(newRole);
  window.currentRole = newRole;

  const roleLabels = {
    admin: "Administrator",
    waiter: "Waiter",
    chef: "Chef",
    cashier: "Cashier",
  };
  const username = user.displayName || user.username || "Admin";
  const initials = username
    .split(" ")
    .map(function (w) {
      return w[0];
    })
    .join("")
    .toUpperCase()
    .slice(0, 2);
  window.userData = {
    name: username,
    initials: initials,
    role: roleLabels[newRole] || newRole,
  };

  expanded = false;
  renderFloatingButton();

  window.dispatchEvent(new CustomEvent("dev-role-changed", { detail: { role: newRole } }));
}

export function initRoleSwitcher(authModule) {
  // Removed dev only check to ensure it works in production
  window._devAuthModule = authModule;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      renderFloatingButton();
    });
  } else {
    renderFloatingButton();
  }
  
  window.addEventListener("hashchange", function () {
    renderFloatingButton();
  });
}

export default { initRoleSwitcher };
