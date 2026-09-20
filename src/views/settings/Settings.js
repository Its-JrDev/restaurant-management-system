import * as settingsStore from "../../store/settings.js";
import { toast } from "../../components/ui/ToastManager.js";
import { confirmModal } from "../../components/ui/ConfirmModal.js";
import InputField from "../../components/forms/InputField.js";
import { withLoading, Skeletons } from "../../utils/withLoading.js";

function render(el) {
  const settings = settingsStore.getSettings();

  let html = '<div class="space-y-5 max-w-2xl">';

  html += '<div class="flex items-center justify-between">';
  html += '<div><h2 class="text-xl font-semibold text-brand-900 font-display">Settings</h2>';
  html +=
    '<p class="text-sm text-secondary-500 mt-0.5">Restaurant profile and preferences</p></div>';
  html += "</div>";

  html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
  html += '<div class="px-5 py-4 border-b border-brand-100 bg-brand-50">';
  html +=
    '<h3 class="text-sm font-bold text-brand-800 uppercase tracking-wider">Restaurant Profile</h3>';
  html += "</div>";
  html += '<div class="p-5">';
  html += '<div class="space-y-4">';

  html += InputField({
    id: "settings-name",
    label: "Restaurant Name",
    value: settings.restaurant_name || "",
  });
  html += InputField({ id: "settings-address", label: "Address", value: settings.address || "" });

  html += '<div class="grid grid-cols-2 gap-4">';
  html += InputField({
    id: "settings-phone",
    label: "Phone",
    type: "tel",
    value: settings.phone || "",
  });
  html += InputField({
    id: "settings-email",
    label: "Email",
    type: "email",
    value: settings.email || "",
  });
  html += "</div>";

  html += "</div></div></div>";

  html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
  html += '<div class="px-5 py-4 border-b border-brand-100 bg-brand-50">';
  html +=
    '<h3 class="text-sm font-bold text-brand-800 uppercase tracking-wider">Tax & Currency</h3>';
  html += "</div>";
  html += '<div class="p-5">';
  html += '<div class="grid grid-cols-3 gap-4">';

  html += InputField({
    id: "settings-tax",
    label: "Tax Rate (%)",
    type: "number",
    value: settings.tax_rate || 0,
    step: "0.1",
    min: "0",
    max: "100",
  });
  html += InputField({
    id: "settings-currency-symbol",
    label: "Currency Symbol",
    value: settings.currency_symbol || "$",
    maxlength: "3",
  });

  html += "<div>";
  html +=
    '<label class="block text-sm font-semibold text-secondary-600 mb-1">Currency Code</label>';
  html +=
    '<select id="settings-currency-code" class="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm text-neutral-900 bg-white cursor-pointer outline-none focus:border-brand-500 focus:shadow-[var(--ring-brand)] transition-all">';
  const codes = ["USD", "EUR", "GBP", "MXN", "CAD", "JPY"];
  codes.forEach(function (code) {
    html +=
      '<option value="' +
      code +
      '"' +
      (settings.currency_code === code ? " selected" : "") +
      ">" +
      code +
      "</option>";
  });
  html += "</select></div>";

  html += "</div></div></div>";

  html += '<div class="flex items-center gap-3">';
  html +=
    '<button data-action="save-settings" class="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="check" class="w-4 h-4"></i> Save Settings</button>';
  html +=
    '<button data-action="reset-settings" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 cursor-pointer transition-colors"><i data-lucide="rotate-ccw" class="w-4 h-4"></i> Reset to Defaults</button>';
  html += "</div>";

  html += "</div>";

  el.innerHTML = html;
  window.createIcons();

  el.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");

    if (action === "save-settings") {
      const data = {
        restaurant_name: (document.getElementById("settings-name") || {}).value || "",
        address: (document.getElementById("settings-address") || {}).value || "",
        phone: (document.getElementById("settings-phone") || {}).value || "",
        email: (document.getElementById("settings-email") || {}).value || "",
        tax_rate: parseFloat((document.getElementById("settings-tax") || {}).value) || 0,
        currency_symbol: (document.getElementById("settings-currency-symbol") || {}).value || "$",
        currency_code: (document.getElementById("settings-currency-code") || {}).value || "USD",
      };
      settingsStore.updateSettings(data);
      toast.success("Saved", "Settings updated successfully");
      render(el);
    } else if (action === "reset-settings") {
      confirmModal
        .show({
          title: "Reset Settings",
          message: "Reset all settings to defaults? This action cannot be undone.",
          confirmText: "Reset",
        })
        .then((confirmed) => {
          if (confirmed) {
            settingsStore.resetSettings();
            toast.success("Reset", "Settings restored to defaults");
            render(el);
          }
        });
    }
  });
}

const SettingsView = {
  render: render,
  init: function () {},
  destroy: function () {},
};

export default withLoading(SettingsView, Skeletons.settings());
