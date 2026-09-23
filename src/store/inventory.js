import { createStore } from "./index.js";
import { getCollection, insertItem, updateItem as dbUpdateItem } from "./data/db.js";

const inventoryStore = createStore({
  items: [],
  lowStock: [],
});

export async function loadItems() {
  const items = getCollection("inventory_items");
  inventoryStore.setState({ items });
}

export async function loadLowStock() {
  const items = getCollection("inventory_items");
  const lowStock = items.filter(item => item.quantity <= item.min_stock);
  inventoryStore.setState({ lowStock });
}

export async function refreshItems() {
  const items = getCollection("inventory_items");
  inventoryStore.setState({ items });
}

export async function createItem(data) {
  try {
    const newItem = {
      id: "inv-" + Date.now(),
      ...data
    };
    insertItem("inventory_items", newItem);
    await refreshItems();
    return { success: true, item: newItem };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateItem(id, data) {
  try {
    const item = dbUpdateItem("inventory_items", id, data);
    if (item) {
      await refreshItems();
      return { success: true, item };
    }
    return { success: false, error: "Artículo no encontrado" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function registerMovement(itemId, data) {
  try {
    const items = getCollection("inventory_items");
    const item = items.find(i => i.id === itemId);
    if (!item) return { success: false, error: "Artículo no encontrado" };

    const newQuantity = data.type === 'in' ? item.quantity + data.quantity : item.quantity - data.quantity;
    const updated = dbUpdateItem("inventory_items", itemId, { quantity: newQuantity });
    await refreshItems();
    return { success: true, item: updated };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function getState() {
  return inventoryStore.getState();
}

export function subscribe(listener) {
  return inventoryStore.subscribe(listener);
}
