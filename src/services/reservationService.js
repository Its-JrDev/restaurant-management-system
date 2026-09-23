import { getCollection, insertItem, updateItem as dbUpdateItem, deleteItem as dbDeleteItem } from "../store/data/db.js";
import { notify } from "../store/notifications.js";

export function mapReservation(r) {
  const dt = r.reservation_date ? new Date(r.reservation_date) : null;
  let tableNum = r.table_number || r.tableNumber || null;
  if (!tableNum && r.table_id) {
    const tables = getCollection("tables");
    const found = tables.find(function (t) {
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

export async function setTablesCache(_tablesArr) {
  /* kept for API compatibility — table numbers now resolve from local db */
}

export async function getAllReservations() {
  return getCollection("reservations").map(mapReservation);
}

export async function getReservationById(id) {
  const found = getCollection("reservations").find((r) => r.id === id);
  return found ? mapReservation(found) : null;
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
  const reservationDateTime =
    data.date && data.time
      ? `${data.date}T${data.time}:00`
      : data.date
        ? `${data.date}T00:00:00`
        : new Date().toISOString();

  const newReservation = {
    id: "RES-" + Date.now(),
    guest_name: data.guestName || data.guest_name || null,
    guest_phone: data.guestPhone || data.guest_phone || null,
    table_id: data.tableId || data.table_id || null,
    reservation_date: reservationDateTime,
    guest_count: data.partySize || data.guest_count || 1,
    status: "pending",
    notes: data.notes || "",
    created_at: new Date().toISOString(),
  };
  insertItem("reservations", newReservation);
  const dt = new Date(reservationDateTime);
  notify({
    type: "info",
    title: "Nueva reservación",
    message:
      (newReservation.guest_name || "Huésped") +
      " · " +
      dt.toLocaleDateString("es-ES") +
      " " +
      dt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }) +
      " · " +
      (newReservation.guest_count || 1) +
      " personas",
    roles: ["admin", "waiter"],
    refType: "reservation_created",
    refId: newReservation.id,
    dedupe: true,
  });
  return { success: true, reservation: mapReservation(newReservation) };
}

export async function updateReservationStatus(id, newStatus) {
  const updated = dbUpdateItem("reservations", id, {
    status: newStatus,
    updated_at: new Date().toISOString(),
  });
  if (updated) {
    notifyReservationStatus(id, newStatus, updated);
    return { success: true, reservation: mapReservation(updated) };
  }
  return { success: false, error: "Reserva no encontrada" };
}

export async function deleteReservation(id) {
  dbDeleteItem("reservations", id);
  return { success: true };
}

export async function confirmReservation(id, tableId) {
  const updates = {
    status: "confirmed",
    updated_at: new Date().toISOString(),
  };
  if (tableId) {
    updates.table_id = tableId;
    const tables = getCollection("tables");
    const table = tables.find(function (t) {
      return String(t.id) === String(tableId);
    });
    if (table) {
      const currentStatus = table.status || "available";
      const newStatus = currentStatus === "available" ? "reserved" : currentStatus;
      dbUpdateItem("tables", table.id, { status: newStatus });
    }
  }
  const updated = dbUpdateItem("reservations", id, updates);
  if (updated) {
    notifyReservationStatus(id, "confirmed", updated);
    return { success: true, reservation: mapReservation(updated) };
  }
  return { success: false, error: "Reserva no encontrada" };
}

function notifyReservationStatus(id, newStatus, reservation) {
  const labels = {
    confirmed: { type: "success", title: "Reservación confirmada" },
    cancelled: { type: "warning", title: "Reservación cancelada" },
  };
  const entry = labels[newStatus];
  if (!entry) return;
  const guest = reservation.guest_name || (reservation.guestName || "Huésped");
  const dt = reservation.reservation_date
    ? new Date(reservation.reservation_date)
    : null;
  notify({
    type: entry.type,
    title: entry.title,
    message:
      guest +
      (dt
        ? " · " +
          dt.toLocaleDateString("es-ES") +
          " " +
          dt.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
        : ""),
    roles: ["admin", "waiter"],
    refType: "reservation_" + newStatus,
    refId: id,
    dedupe: true,
  });
}
