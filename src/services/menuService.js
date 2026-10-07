import { getCollection, insertItem, updateItem as dbUpdateItem, deleteItem as dbDeleteItem } from "../store/data/db.js";

function mapMenuItem(item) {
  return {
    id: item.id,
    category_id: item.category_id,
    name: item.name,
    description: item.description || "",
    price: parseFloat(item.price),
    available: item.is_available !== undefined ? item.is_available !== false : true,
    image_url: item.image_url || null,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

function mapCategory(cat) {
  return {
    id: cat.id,
    name: cat.name,
    description: cat.description || "",
  };
}

export async function getAllProducts() {
  return getCollection("menu_items").map(mapMenuItem);
}

export async function getProductById(id) {
  const found = getCollection("menu_items").find((p) => p.id === id);
  return found ? mapMenuItem(found) : null;
}

export async function getProductsByCategory(categoryId) {
  return getCollection("menu_items")
    .filter((p) => p.category_id === categoryId)
    .map(mapMenuItem);
}

export async function getAvailableProducts() {
  return getCollection("menu_items")
    .filter((p) => p.is_available !== false)
    .map(mapMenuItem);
}

export async function getAllCategories() {
  return getCollection("categories").map(mapCategory);
}

export async function getCategoryById(id) {
  const found = getCollection("categories").find((c) => c.id === id);
  return found ? mapCategory(found) : null;
}

export async function filterProducts({ category, available, search }) {
  let results = await getAllProducts();

  if (category) {
    results = results.filter((p) => p.category_id === category);
  }

  if (available !== "" && available !== undefined && available !== null) {
    const isAvailable = available === "available" || available === true;
    results = results.filter((p) => p.available === isAvailable);
  }

  if (search) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }

  return results;
}

export async function createProduct(data) {
  const newItem = {
    id: "mi-" + Date.now(),
    name: data.name,
    description: data.description || "",
    price: parseFloat(data.price),
    category_id: data.category_id,
    is_available: data.available !== false,
    image_url: data.image_url || null,
    created_at: new Date().toISOString(),
  };
  insertItem("menu_items", newItem);
  return { success: true, product: mapMenuItem(newItem) };
}

export async function updateProduct(id, data) {
  const updated = dbUpdateItem("menu_items", id, {
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    category_id: data.category_id,
    is_available: data.available,
    image_url: data.image_url || null,
    updated_at: new Date().toISOString(),
  });
  if (updated) {
    return { success: true, product: mapMenuItem(updated) };
  }
  return { success: false, error: "Producto no encontrado" };
}

export async function toggleProductAvailability(id) {
  const product = await getProductById(id);
  if (!product) return { success: false, error: "Producto no encontrado" };
  return updateProduct(id, { ...product, available: !product.available });
}

export async function deleteProduct(id) {
  dbDeleteItem("menu_items", id);
  return { success: true };
}

export function initMockProducts() {}
export function initMockCategories() {}
