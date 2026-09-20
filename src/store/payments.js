import { createStore } from "./index.js";
import { getCollection } from "./data/db.js";

const paymentsStore = createStore({
  payments: [],
  filteredPayments: [],
  filters: { status: "", search: "", date: "" },
  selectedPayment: null,
  error: null,
});

export async function loadPayments() {
  const all = getCollection("payments");
  paymentsStore.setState({ payments: all, filteredPayments: all });
}

export async function applyFilters({ status, search, date } = {}) {
  const current = paymentsStore.getState().filters;
  const filters = {
    status: status !== undefined ? status : current.status,
    search: search !== undefined ? search : current.search,
    date: date !== undefined ? date : current.date,
  };

  const all = getCollection("payments");
  let filtered = all;

  if (filters.status) {
    filtered = filtered.filter(p => p.status === filters.status);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(p => p.id.toLowerCase().includes(q) || (p.order_id && p.order_id.toLowerCase().includes(q)));
  }
  if (filters.date) {
    // exact date match ignoring time
    filtered = filtered.filter(p => p.created_at && p.created_at.startsWith(filters.date));
  }

  paymentsStore.setState({ filters, filteredPayments: filtered });
}

export function clearFilters() {
  const all = paymentsStore.getState().payments;
  paymentsStore.setState({
    filters: { status: "", search: "", date: "" },
    filteredPayments: all,
  });
}

export function getFilteredPayments() {
  return paymentsStore.getState().filteredPayments;
}

export async function getPaymentById(id) {
  const all = getCollection("payments");
  return all.find(p => p.id === id) || null;
}

export async function refreshPayments() {
  const all = getCollection("payments");
  paymentsStore.setState({ payments: all });
  await applyFilters();
}

export function getState() {
  return paymentsStore.getState();
}

export function subscribe(listener) {
  return paymentsStore.subscribe(listener);
}

export default {
  loadPayments,
  applyFilters,
  clearFilters,
  getFilteredPayments,
  getPaymentById,
  refreshPayments,
  getState,
  subscribe,
};
