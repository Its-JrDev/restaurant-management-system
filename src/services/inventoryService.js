import { getCollection, insertItem, updateItem as dbUpdateItem, deleteItem as dbDeleteItem } from "../store/data/db.js";
import { notify } from "../store/notifications.js";

function notifyLowStock(item) {
  if (parseFloat(item.quantity) > parseFloat(item.min_stock)) return;
  notify({
    type: "warning",
    title: "Stock bajo",
    message:
      'El ingrediente "' +
      item.name +
      '" está por debajo del mínimo (' +
      item.quantity +
      " " +
      (item.unit || "") +
      ").",
    roles: ["admin", "chef"],
    refType: "low_stock",
    refId: item.id,
    dedupe: true,
  });
}

function mapItem(item) {
  return {
    id: item.id,
    name: item.name,
    unit: item.unit,
    quantity: parseFloat(item.quantity),
    min_stock: parseFloat(item.min_stock),
    is_active: item.is_active !== false,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

function mapMovement(m) {
  return {
    id: m.id,
    item_id: m.item_id,
    type: m.type,
    quantity: parseFloat(m.quantity),
    reason: m.reason || "",
    created_at: m.created_at,
  };
}

export async function getAllItems() {
  return getCollection("inventory_items").map(mapItem);
}

export async function getItemById(id) {
  const found = getCollection("inventory_items").find((i) => i.id === id);
  return found ? mapItem(found) : null;
}

export async function getLowStockItems() {
  return getCollection("inventory_items")
    .filter((i) => i.quantity <= i.min_stock)
    .map(mapItem);
}

export async function createItem(data) {
  const newItem = {
    id: "inv-" + Date.now(),
    name: data.name,
    unit: data.unit,
    quantity: parseFloat(data.quantity) || 0,
    min_stock: parseFloat(data.min_stock) || 0,
    is_active: true,
    created_at: new Date().toISOString(),
  };
  insertItem("inventory_items", newItem);
  return { success: true, item: mapItem(newItem) };
}

export async function updateItem(id, data) {
  const updated = dbUpdateItem("inventory_items", id, {
    name: data.name,
    unit: data.unit,
    quantity: parseFloat(data.quantity),
    min_stock: parseFloat(data.min_stock),
    updated_at: new Date().toISOString(),
  });
  if (updated) {
    notifyLowStock(updated);
    return { success: true, item: mapItem(updated) };
  }
  return { success: false, error: "Artículo no encontrado" };
}

export async function registerMovement(itemId, data) {
  const items = getCollection("inventory_items");
  const item = items.find((i) => i.id === itemId);
  if (!item) return { success: false, error: "Artículo no encontrado" };

  const newQuantity =
    data.type === "in" ? item.quantity + data.quantity : item.quantity - data.quantity;
  const updated = dbUpdateItem("inventory_items", itemId, {
    quantity: newQuantity,
    updated_at: new Date().toISOString(),
  });

  const movement = {
    id: "mov-" + Date.now(),
    item_id: itemId,
    type: data.type,
    quantity: parseFloat(data.quantity),
    reason: data.reason || "",
    created_at: new Date().toISOString(),
  };
  insertItem("inventory_movements", movement);

  if (updated) notifyLowStock(updated);

  return { success: true, movement: mapMovement(movement), item: mapItem(updated) };
}

export async function deleteItem(id) {
  dbDeleteItem("inventory_items", id);
  return { success: true };
}

export async function getMovementsByItem(itemId) {
  return getCollection("inventory_movements")
    .filter((m) => m.item_id === itemId)
    .map(mapMovement)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}
