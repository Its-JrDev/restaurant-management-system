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

  const role = getCurrentRole();
  const roleMeta =
    ROLES.find(function (r) {
      return r.id === role;
    }) || ROLES[0];

  const wrapper = document.createElement("div");
  wrapper.id = "dev-role-switcher";

  // Check if we can inject into topbar
  const topbarContainer = document.getElementById("demo-role-switcher-container");
  
  if (topbarContainer) {
    wrapper.style.cssText = "position:relative;font-family:system-ui,sans-serif;";
    topbarContainer.appendChild(wrapper);
  } else {
    wrapper.style.cssText = "position:fixed;bottom:calc(4.5rem + env(safe-area-inset-bottom, 20px));right:20px;z-index:9999;font-family:system-ui,sans-serif;";
    document.body.appendChild(wrapper);
  }

  if (expanded) {
    let html =
      '<div style="position:absolute;right:0;top:' + (topbarContainer ? 'calc(100% + 8px)' : 'auto') + ';bottom:' + (topbarContainer ? 'auto' : '100%') + ';margin-bottom:' + (topbarContainer ? '0' : '8px') + ';background:#1e1e1e;border-radius:12px;padding:8px;box-shadow:0 8px 32px rgba(0,0,0,0.35);min-width:180px;z-index:100000;">';
    html +=
      '<div style="padding:4px 8px 6px;font-size:10px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.05em;">Demo Role Switcher</div>';
    ROLES.forEach(function (r) {
      const isActive = r.id === role;
      const bg = isActive ? r.color : "transparent";
      const textColor = isActive ? "#fff" : "#ccc";
      const hoverBg = isActive
        ? ""
        : "onmouseover=\"this.style.background='#333'\" onmouseout=\"this.style.background='transparent'\"";
      html +=
        '<button data-role="' +
        r.id +
        '" style="display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;border:none;border-radius:8px;background:' +
        bg +
        ";color:" +
        textColor +
        ";font-size:13px;font-weight:600;cursor:pointer;text-align:left;" +
        (isActive ? "" : hoverBg) +
        '">';
      html +=
        '<span style="width:8px;height:8px;border-radius:50%;background:' +
        (isActive ? "#fff" : r.color) +
        ';flex-shrink:0;"></span>';
      html += r.label;
      if (isActive) {
        html += '<span style="margin-left:auto;font-size:10px;opacity:0.7;">&#10003;</span>';
      }
      html += "</button>";
    });
    html += "</div>";
    wrapper.innerHTML = html;
  } else {
    wrapper.innerHTML =
      '<button id="dev-role-toggle" style="display:flex;align-items:center;gap:6px;height:40px;padding:0 16px;border-radius:9999px;border:1px solid rgba(0,0,0,0.1);' +
      'background:#1e1e1e;color:#fff;font-size:12px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-family:inherit;text-transform:uppercase;letter-spacing:0.03em;transition:all 0.2s;">' +
      '<span style="width:8px;height:8px;border-radius:50%;background:' + roleMeta.color + ';"></span>' +
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
}

export default { initRoleSwitcher };
