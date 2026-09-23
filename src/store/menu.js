import { createStore } from "./index.js";
import { getCollection } from "./data/db.js";

const menuStore = createStore({
  products: [],
  categories: [],
  filteredProducts: [],
  filters: { category: "", available: "", search: "" },
  selectedProduct: null,
  error: null,
});

function mapProduct(item) {
  return {
    ...item,
    available: item.is_available !== undefined ? item.is_available !== false : true,
  };
}

function getMappedProducts() {
  return getCollection("menu_items").map(mapProduct);
}

export async function loadProducts() {
  const all = getMappedProducts();
  menuStore.setState({ products: all, filteredProducts: all });
}

export async function loadCategories() {
  const cats = getCollection("categories");
  menuStore.setState({ categories: cats });
}

export async function applyFilters({ category, available, search } = {}) {
  const current = menuStore.getState().filters;
  const filters = {
    category: category !== undefined ? category : current.category,
    available: available !== undefined ? available : current.available,
    search: search !== undefined ? search : current.search,
  };

  const all = getMappedProducts();
  let filtered = all;

  if (filters.category) {
    filtered = filtered.filter(p => p.category_id === filters.category);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
  }
  // If there's an 'available' filter (boolean or string representation)
  if (filters.available !== "") {
    const isAvail = filters.available === true || filters.available === "true";
    filtered = filtered.filter(p => p.available === isAvail);
  }

  menuStore.setState({ filters, filteredProducts: filtered });
}

export function clearFilters() {
  const all = menuStore.getState().products;
  menuStore.setState({
    filters: { category: "", available: "", search: "" },
    filteredProducts: all,
  });
}

export function getFilteredProducts() {
  return menuStore.getState().filteredProducts;
}

export async function getProductById(id) {
  const all = getMappedProducts();
  return all.find(p => p.id === id) || null;
}

export async function refreshProducts() {
  const all = getMappedProducts();
  menuStore.setState({ products: all });
  await applyFilters();
}

export function getState() {
  return menuStore.getState();
}

export function subscribe(listener) {
  return menuStore.subscribe(listener);
}

export default {
  loadProducts,
  loadCategories,
  applyFilters,
  clearFilters,
  getFilteredProducts,
  getProductById,
  refreshProducts,
  getState,
  subscribe,
};
