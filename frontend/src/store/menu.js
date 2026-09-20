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

export async function loadProducts() {
  const all = getCollection("menu_items");
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

  const all = getCollection("menu_items");
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
    filtered = filtered.filter(p => p.is_available === isAvail || p.available === isAvail);
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
  const all = getCollection("menu_items");
  return all.find(p => p.id === id) || null;
}

export async function refreshProducts() {
  const all = getCollection("menu_items");
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
