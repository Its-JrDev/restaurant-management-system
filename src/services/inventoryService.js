import { apiGet, apiPost, apiPut, apiDelete } from "./api.js";

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
  try {
    const items = await apiGet("/api/v1/inventory/");
    return items.map(mapItem);
  } catch {
    return [];
  }
}

export async function getItemById(id) {
  try {
    const item = await apiGet(`/api/v1/inventory/${id}`);
    return mapItem(item);
  } catch {
    return null;
  }
}

export async function getLowStockItems() {
  try {
    const items = await apiGet("/api/v1/inventory/low-stock");
    return items.map(mapItem);
  } catch {
    return [];
  }
}

export async function createItem(data) {
  try {
    const item = await apiPost("/api/v1/inventory/", {
      name: data.name,
      unit: data.unit,
      quantity: data.quantity || 0,
      min_stock: data.min_stock || 0,
    });
    return { success: true, item: mapItem(item) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateItem(id, data) {
  try {
    const item = await apiPut(`/api/v1/inventory/${id}`, {
      name: data.name,
      unit: data.unit,
      quantity: data.quantity,
      min_stock: data.min_stock,
    });
    return { success: true, item: mapItem(item) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function registerMovement(itemId, data) {
  try {
    const movement = await apiPost(`/api/v1/inventory/${itemId}/movements`, {
      type: data.type,
      quantity: data.quantity,
      reason: data.reason || "",
    });
    return { success: true, movement: mapMovement(movement) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteItem(id) {
  try {
    await apiDelete(`/api/v1/inventory/${id}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getMovementsByItem(itemId) {
  try {
    const items = await apiGet(`/api/v1/inventory/${itemId}/movements`);
    return items.map(mapMovement);
  } catch {
    return [];
  }
}
