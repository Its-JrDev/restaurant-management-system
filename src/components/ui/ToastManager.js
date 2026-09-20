import { createToast } from "./Toast.js";

class ToastManager {
  constructor() {
    this.toasts = [];
    this.container = null;
    this.maxToasts = 5;
    this.defaultDuration = 3000;
    this.counter = 0;
  }

  _getContainer() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className =
        "fixed top-[80px] right-5 z-[9999] flex flex-col gap-3 pointer-events-none";
      this.container.setAttribute("aria-label", "Notifications");
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  _generateId() {
    return `toast-${Date.now()}-${++this.counter}`;
  }

  show(options = {}) {
    const {
      type = "info",
      title = "",
      message = "",
      duration = this.defaultDuration,
      dismissible = true,
    } = options;

    const id = this._generateId();
    const container = this._getContainer();

    while (this.toasts.length >= this.maxToasts) {
      const oldest = this.toasts[0];
      this.dismiss(oldest.id);
    }

    const toast = createToast({ id, type, title, message, duration, dismissible });

    const wrapper = document.createElement("div");
    wrapper.innerHTML = toast.html;
    const toastEl = wrapper.firstElementChild;
    container.appendChild(toastEl);

    toast.init();

    this.toasts.push({ id, el: toastEl, timer: null });

    if (dismissible) {
      toastEl.addEventListener("click", (e) => {
        if (e.target.closest(`[data-toast-dismiss="${id}"]`)) {
          this.dismiss(id);
        }
      });
    }

    const timer = setTimeout(() => {
      this.dismiss(id);
    }, duration);

    const toastEntry = this.toasts.find((t) => t.id === id);
    if (toastEntry) {
      toastEntry.timer = timer;
    }

    return id;
  }

  success(title, message, options = {}) {
    return this.show({ type: "success", title, message, ...options });
  }

  error(title, message, options = {}) {
    return this.show({ type: "error", title, message, ...options });
  }

  warning(title, message, options = {}) {
    return this.show({ type: "warning", title, message, ...options });
  }

  info(title, message, options = {}) {
    return this.show({ type: "info", title, message, ...options });
  }

  dismiss(id) {
    const index = this.toasts.findIndex((t) => t.id === id);
    if (index === -1) return;

    const toast = this.toasts[index];

    if (toast.timer) {
      clearTimeout(toast.timer);
    }

    toast.el.classList.remove("animate-toast-in");
    toast.el.classList.add("animate-toast-out");

    toast.el.addEventListener("animationend", () => {
      toast.el.remove();
    });

    this.toasts.splice(index, 1);
  }

  dismissAll() {
    [...this.toasts].forEach((t) => this.dismiss(t.id));
  }
}

export const toast = new ToastManager();
