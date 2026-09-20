import CheckboxField from "../forms/CheckboxField.js";

class FormModal {
  constructor() {
    this._resolve = null;
    this._container = null;
    this._closing = false;
  }

  show({
    title = "Form",
    fields = [],
    confirmText = "Save",
    cancelText = "Cancel",
    width = 420,
  } = {}) {
    return new Promise((resolve) => {
      this._resolve = resolve;
      this._closing = false;

      if (this._container) {
        this._container.remove();
      }

      this._container = document.createElement("div");

      const fieldHtml = fields.map((f) => this._renderField(f)).join("");

      this._container.innerHTML = `
        <div data-form-overlay class="fixed inset-0 bg-black/50 z-[10000] flex items-center justify-center">
          <div data-form-modal class="bg-white rounded-xl shadow-xl w-[${width}px] max-h-[90vh] flex flex-col animate-modal-in">
            <div class="flex items-center justify-between px-5 py-4 border-b border-brand-100">
              <h3 class="text-base font-bold text-brand-800">${title}</h3>
              <button data-form-close class="text-brand-400 hover:text-brand-600 bg-transparent border-0 cursor-pointer"><i data-lucide="x" class="w-5 h-5"></i></button>
            </div>
            <div class="px-5 py-4 overflow-y-auto grid grid-cols-2 gap-4">
              ${fieldHtml}
            </div>
            <div class="px-5 py-3 border-t border-brand-100 flex justify-end gap-3">
              <button data-form-cancel class="h-9 px-4 text-sm font-semibold rounded-lg bg-white text-brand-700 border border-brand-300 hover:bg-brand-50 cursor-pointer transition-colors">${cancelText}</button>
              <button data-form-confirm class="h-9 px-4 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white border-0 cursor-pointer transition-colors">${confirmText}</button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(this._container);
      window.createIcons();

      const overlay = this._container.querySelector("[data-form-overlay]");
      const modal = this._container.querySelector("[data-form-modal]");
      const closeBtn = this._container.querySelector("[data-form-close]");
      const cancelBtn = this._container.querySelector("[data-form-cancel]");
      const confirmBtn = this._container.querySelector("[data-form-confirm]");

      const firstFocusable = this._container.querySelector("[data-field]:not([type='checkbox'])");
      if (firstFocusable) firstFocusable.focus();

      const close = (result) => {
        if (this._closing) return;
        this._closing = true;
        overlay.classList.add("animate-backdrop-out");
        if (modal) modal.classList.add("animate-modal-out");
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

      const gather = () => {
        const data = {};
        fields.forEach((f) => {
          const el = this._container.querySelector(`[data-field="${f.id}"]`);
          if (!el) return;
          if (f.type === "checkbox") {
            data[f.id] = el.checked;
          } else if (f.type === "number") {
            data[f.id] = el.value === "" ? null : Number(el.value);
          } else {
            data[f.id] = el.value;
          }
        });
        return data;
      };

      const setFieldValue = (fieldId, value) => {
        const el = this._container.querySelector(`[data-field="${fieldId}"]`);
        if (el) {
          if (el.type === "checkbox") {
            el.checked = !!value;
          } else {
            el.value = value != null ? value : "";
          }
        }
      };

      fields.forEach((f) => {
        const el = this._container.querySelector(`[data-field="${f.id}"]`);
        if (!el || !f.onChange) return;
        const event = f.type === "select" ? "change" : f.type === "checkbox" ? "change" : "input";
        el.addEventListener(event, () => f.onChange(el.value, gather(), setFieldValue));
      });

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close(null);
      });
      closeBtn.addEventListener("click", () => close(null));
      cancelBtn.addEventListener("click", () => close(null));

      confirmBtn.addEventListener("click", () => {
        const data = gather();
        const required = fields.find((f) => {
          if (!f.required) return false;
          const val = data[f.id];
          return val === null || val === undefined || val === "";
        });
        if (required) {
          const el = this._container.querySelector(`[data-field="${required.id}"]`);
          if (el) {
            el.classList.add("border-error-600");
            el.focus();
            setTimeout(() => el.classList.remove("border-error-600"), 2000);
          }
          return;
        }
        close(data);
      });

      const handleKey = (e) => {
        if (e.key === "Escape") {
          close(null);
          document.removeEventListener("keydown", handleKey);
        }
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
          confirmBtn.click();
        }
      };
      document.addEventListener("keydown", handleKey);
    });
  }

  _renderField(f) {
    const val = f.value != null ? f.value : "";
    const req = f.required ? " required" : "";
    const baseClass =
      "h-10 px-3 text-sm rounded-md border border-brand-300 bg-brand-50 outline-none focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(229,119,34,0.1)]";
    const fullClass = f.fullWidth ? "col-span-2" : "";

    if (f.type === "checkbox") {
      return `
        <div class="${fullClass}">
          ${CheckboxField({ id: f.id, label: f.label, checked: !!val, dataField: f.id })}
        </div>
      `;
    }

    if (f.type === "textarea") {
      return `
        <div class="flex flex-col gap-1 ${fullClass}">
          <label class="text-sm font-semibold text-brand-700" for="${f.id}">${f.label}${f.required ? " *" : ""}</label>
          <textarea data-field="${f.id}" id="${f.id}" rows="2" placeholder="${f.placeholder || ""}"${req} class="px-3 py-2 text-sm rounded-md border border-brand-300 bg-brand-50 outline-none focus:border-brand-500 resize-none">${val}</textarea>
        </div>
      `;
    }

    if (f.type === "select") {
      const opts = (f.options || [])
        .map((o) => {
          const sel = String(o.value) === String(val) ? " selected" : "";
          return `<option value="${o.value}"${sel}>${o.label}</option>`;
        })
        .join("");
      const ph = f.placeholder
        ? `<option value="" disabled${!val ? " selected" : ""}>${f.placeholder}</option>`
        : "";
      return `
        <div class="flex flex-col gap-1 ${fullClass}">
          <label class="text-sm font-semibold text-brand-700" for="${f.id}">${f.label}${f.required ? " *" : ""}</label>
          <select data-field="${f.id}" id="${f.id}"${req} class="${baseClass}">
            ${ph}${opts}
          </select>
        </div>
      `;
    }

    const type = f.type || "text";
    const step = f.step ? ` step="${f.step}"` : "";
    const min = f.min != null ? ` min="${f.min}"` : "";
    const max = f.max != null ? ` max="${f.max}"` : "";
    const ph = f.placeholder ? ` placeholder="${f.placeholder}"` : "";

    return `
      <div class="flex flex-col gap-1 ${fullClass}">
        <label class="text-sm font-semibold text-brand-700" for="${f.id}">${f.label}${f.required ? " *" : ""}</label>
        <input data-field="${f.id}" id="${f.id}" type="${type}" value="${val}"${step}${min}${max}${ph}${req} class="${baseClass}" />
      </div>
    `;
  }
}

export const formModal = new FormModal();
