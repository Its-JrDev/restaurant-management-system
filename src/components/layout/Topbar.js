import AppShell from "./AppShell.js";

const Topbar = {
  render: function (el, title) {
    AppShell.renderTopbar(el);
    if (title) {
      const titleEl = el.querySelector("#topbarTitle");
      if (titleEl) titleEl.textContent = title;
    }
  },
  updateTitle: function (path) {
    AppShell.updateTopbarTitle(path);
  },
};

export default Topbar;
