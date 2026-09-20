import { createStore } from "./index.js";
import { getCollection, saveCollection } from "./data/db.js";

const defaults = {
  restaurant_name: "El Fogón Caribeño",
  address: "",
  phone: "",
  email: "",
  tax_rate: 11.5,
  currency: "USD",
};

const settingsStore = createStore({
  settings: defaults,
  loaded: false,
});

function mapSetting(s) {
  return {
    restaurant_name: s.restaurant_name || defaults.restaurant_name,
    address: s.address || defaults.address,
    phone: s.phone || defaults.phone,
    email: s.email || defaults.email,
    tax_rate: s.tax_rate || defaults.tax_rate,
    currency: s.currency || defaults.currency,
  };
}

export async function loadSettings() {
  try {
    const data = getCollection("settings");
    settingsStore.setState({ settings: mapSetting(data || defaults), loaded: true });
  } catch {
    settingsStore.setState({ loaded: true });
  }
}

export function getSettings() {
  return settingsStore.getState().settings;
}

export async function updateSettings(data) {
  try {
    saveCollection("settings", data);
    settingsStore.setState({ settings: mapSetting(data) });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function resetSettings() {
  saveCollection("settings", defaults);
  settingsStore.setState({ settings: defaults });
}

export function getState() {
  return settingsStore.getState();
}

export function subscribe(listener) {
  return settingsStore.subscribe(listener);
}
