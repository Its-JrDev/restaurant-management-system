import { createStore } from "./index.js";
import { getCollection } from "./data/db.js";

const reservationsStore = createStore({
  reservations: [],
  filteredReservations: [],
  filters: { date: "", status: "", search: "" },
  selectedReservation: null,
  error: null,
});

export async function loadReservations() {
  const all = getCollection("reservations");
  reservationsStore.setState({ reservations: all, filteredReservations: all });
}

export async function applyFilters({ date, status, search } = {}) {
  const current = reservationsStore.getState().filters;
  const filters = {
    date: date !== undefined ? date : current.date,
    status: status !== undefined ? status : current.status,
    search: search !== undefined ? search : current.search,
  };

  const all = getCollection("reservations");
  let filtered = all;

  if (filters.date) {
    filtered = filtered.filter(r => r.reservation_date && r.reservation_date.startsWith(filters.date));
  }
  if (filters.status) {
    filtered = filtered.filter(r => r.status === filters.status);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    filtered = filtered.filter(r => 
      (r.guest_name && r.guest_name.toLowerCase().includes(q)) || 
      (r.id && r.id.toLowerCase().includes(q)) ||
      (r.guest_phone && r.guest_phone.toLowerCase().includes(q))
    );
  }

  reservationsStore.setState({ filters, filteredReservations: filtered });
}

export function clearFilters() {
  const all = reservationsStore.getState().reservations;
  reservationsStore.setState({
    filters: { date: "", status: "", search: "" },
    filteredReservations: all,
  });
}

export function getFilteredReservations() {
  return reservationsStore.getState().filteredReservations;
}

export async function getReservationByCode(code) {
  const all = getCollection("reservations");
  return all.find(r => r.id === code) || null;
}

export async function getReservationsByUser(userId) {
  const all = getCollection("reservations");
  return all.filter(r => r.customer_id === userId);
}

export async function refreshReservations() {
  const all = getCollection("reservations");
  reservationsStore.setState({ reservations: all });
  await applyFilters();
}

export function getState() {
  return reservationsStore.getState();
}

export function subscribe(listener) {
  return reservationsStore.subscribe(listener);
}

export default {
  loadReservations,
  applyFilters,
  clearFilters,
  getFilteredReservations,
  getReservationByCode,
  getReservationsByUser,
  refreshReservations,
  getState,
  subscribe,
};
