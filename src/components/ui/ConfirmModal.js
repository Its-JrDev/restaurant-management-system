class ConfirmModal {
  constructor() {
    this._resolve = null;
    this._container = null;
    this._closing = false;
  }

  show({
    title = "Confirmar",
    message = "¿Estás seguro?",
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = "danger",
  } = {}) {
    return new Promise((resolve) => {
      this._resolve = resolve;
      this._closing = false;

      if (this._container) {
        this._container.remove();
      }

      const ACCEPT_CLASSES = {
        danger: "bg-error-500 text-white hover:bg-error-600",
        warning: "bg-accent-600 text-white hover:bg-accent-700",
        brand: "bg-brand-500 text-white hover:bg-brand-600",
        primary: "bg-primary-600 text-white hover:bg-primary-700",
      };
      const acceptCls = ACCEPT_CLASSES[variant] || ACCEPT_CLASSES.danger;

      this._container = document.createElement("div");
      this._container.innerHTML = `
        <div
          data-confirm-overlay
          class="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center animate-backdrop-in p-4"
        >
          <div
            data-confirm-modal
            class="bg-white border border-brand-200 rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-modal-in"
          >
            <h3 class="text-lg font-semibold text-neutral-900">${title}</h3>
            <p class="text-sm text-neutral-600 break-words">${message}</p>
            <div class="flex items-center gap-3 justify-end flex-wrap">
              <button
                data-confirm-cancel
                class="px-4 py-2 rounded-lg border border-brand-300 text-brand-700 hover:bg-brand-50 text-sm font-medium cursor-pointer bg-white transition-colors"
              >
                ${cancelText}
              </button>
              <button
                data-confirm-accept
                class="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-none transition-colors ${acceptCls}"
              >
                ${confirmText}
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(this._container);

      const overlay = this._container.querySelector("[data-confirm-overlay]");
      const cancelBtn = this._container.querySelector("[data-confirm-cancel]");
      const acceptBtn = this._container.querySelector("[data-confirm-accept]");

      const close = (result) => {
        if (this._closing) return;
        this._closing = true;
        const modal = this._container.querySelector("[data-confirm-modal]");
        overlay.classList.remove("animate-backdrop-in");
        overlay.classList.add("animate-backdrop-out");
        if (modal) {
          modal.classList.remove("animate-modal-in");
          modal.classList.add("animate-modal-out");
        }
        overlay.addEventListener(
          "animationend",
          () => {
            if (this._container) {
              this._container.remove();
              this._container = null;
            }
          },
          { once: true }
        );
        if (this._resolve) {
          this._resolve(result);
          this._resolve = null;
        }
      };

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          close(false);
        }
      });

      cancelBtn.addEventListener("click", () => close(false));
      acceptBtn.addEventListener("click", () => close(true));

      const handleKey = (e) => {
        if (e.key === "Escape") {
          close(false);
          document.removeEventListener("keydown", handleKey);
        }
      };
      document.addEventListener("keydown", handleKey);

      acceptBtn.focus();
    });
  }
}

export const confirmModal = new ConfirmModal();
