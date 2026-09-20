import { apiGet, apiPost, apiPut, apiDelete } from "./api.js";

function mapMenuItem(item) {
  return {
    id: item.id,
    category_id: item.category_id,
    name: item.name,
    description: item.description || "",
    price: parseFloat(item.price),
    available: item.is_available,
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
  try {
    const items = await apiGet("/api/v1/menu/");
    return items.map(mapMenuItem);
  } catch {
    return [];
  }
}

export async function getProductById(id) {
  try {
    const item = await apiGet(`/api/v1/menu/${id}`);
    return mapMenuItem(item);
  } catch {
    return null;
  }
}

export async function getProductsByCategory(categoryId) {
  try {
    const items = await apiGet(`/api/v1/menu/category/${categoryId}`);
    return items.map(mapMenuItem);
  } catch {
    return [];
  }
}

export async function getAvailableProducts() {
  try {
    const items = await apiGet("/api/v1/menu/available");
    return items.map(mapMenuItem);
  } catch {
    return [];
  }
}

export async function getAllCategories() {
  try {
    const cats = await apiGet("/api/v1/categories/");
    return cats.map(mapCategory);
  } catch {
    return [];
  }
}

export async function getCategoryById(id) {
  try {
    const cat = await apiGet(`/api/v1/categories/${id}`);
    return mapCategory(cat);
  } catch {
    return null;
  }
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
  try {
    const item = await apiPost("/api/v1/menu/", {
      name: data.name,
      description: data.description || "",
      price: data.price,
      category_id: data.category_id,
      image_url: data.image_url || null,
    });
    return { success: true, product: mapMenuItem(item) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateProduct(id, data) {
  try {
    const item = await apiPut(`/api/v1/menu/${id}`, {
      name: data.name,
      description: data.description,
      price: data.price,
      category_id: data.category_id,
      is_available: data.available,
      image_url: data.image_url,
    });
    return { success: true, product: mapMenuItem(item) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function toggleProductAvailability(id) {
  try {
    const product = await getProductById(id);
    if (!product) return { success: false, error: "Product not found" };
    return updateProduct(id, { ...product, available: !product.available });
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteProduct(id) {
  try {
    await apiDelete(`/api/v1/menu/${id}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function initMockProducts() {}
export function initMockCategories() {}
