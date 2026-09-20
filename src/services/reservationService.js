import { apiGet, apiPost, apiPut, apiDelete } from "./api.js";

let _tablesCache = [];

function mapReservation(r) {
  const dt = r.reservation_date ? new Date(r.reservation_date) : null;
  let tableNum = r.table_number || r.tableNumber || null;
  if (!tableNum && r.table_id && _tablesCache.length) {
    const found = _tablesCache.find(function (t) {
      return t.id === r.table_id;
    });
    if (found) tableNum = found.number;
  }
  return {
    id: r.id,
    code: r.code || `RES-${String(r.id).slice(0, 8).toUpperCase()}`,
    guestName: r.guest_name || r.guestName || "",
    guestPhone: r.guest_phone || r.guestPhone || "",
    userId: r.user_id || r.userId || null,
    date: dt ? dt.toISOString().split("T")[0] : "",
    time: dt ? dt.toTimeString().slice(0, 5) : "",
    partySize: r.guest_count || r.partySize || 1,
    tableId: r.table_id || null,
    tableNumber: tableNum,
    status: r.status || "pending",
    notes: r.notes || "",
    createdAt: r.created_at || r.createdAt || null,
  };
}

export async function setTablesCache(tablesArr) {
  _tablesCache = tablesArr || [];
}

export async function getAllReservations() {
  try {
    const items = await apiGet("/api/v1/reservations/");
    return items.map(mapReservation);
  } catch {
    return [];
  }
}

export async function getReservationById(id) {
  try {
    const item = await apiGet(`/api/v1/reservations/${id}`);
    return mapReservation(item);
  } catch {
    return null;
  }
}

export async function getReservationByCode(code) {
  const all = await getAllReservations();
  return all.find((r) => r.code === code.trim().toUpperCase()) || null;
}

export async function getReservationsByUser(userId) {
  const all = await getAllReservations();
  return all.filter((r) => r.userId === userId);
}

export async function getReservationsByDate(date) {
  const all = await getAllReservations();
  return all.filter((r) => r.date === date);
}

export async function getReservationsByStatus(status) {
  const all = await getAllReservations();
  return all.filter((r) => r.status === status);
}

export async function filterReservations({ date, status, search }) {
  let results = await getAllReservations();

  if (date) {
    results = results.filter((r) => r.date === date);
  }

  if (status) {
    results = results.filter((r) => r.status === status);
  }

  if (search) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (r) =>
        r.code.toLowerCase().includes(q) ||
        r.guestName.toLowerCase().includes(q) ||
        r.guestPhone.includes(q)
    );
  }

  return results;
}

export async function createReservation(data) {
  try {
    const reservationDateTime =
      data.date && data.time
        ? `${data.date}T${data.time}:00`
        : data.date
          ? `${data.date}T00:00:00`
          : new Date().toISOString();

    const item = await apiPost("/api/v1/reservations/", {
      table_id: data.tableId || data.table_id || null,
      guest_name: data.guestName || data.guest_name || null,
      guest_phone: data.guestPhone || data.guest_phone || null,
      reservation_date: reservationDateTime,
      guest_count: data.partySize || data.guest_count || 1,
      notes: data.notes || "",
    });
    return { success: true, reservation: mapReservation(item) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateReservationStatus(id, newStatus) {
  try {
    const item = await apiPut(`/api/v1/reservations/${id}`, {
      status: newStatus,
    });
    return { success: true, reservation: mapReservation(item) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteReservation(id) {
  try {
    await apiDelete(`/api/v1/reservations/${id}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function confirmReservation(id, tableId) {
  try {
    const item = await apiPut(`/api/v1/reservations/confirm/${id}`, {
      table_id: tableId,
    });
    return { success: true, reservation: mapReservation(item) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
