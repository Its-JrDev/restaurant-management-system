import { getCollection, insertItem, updateItem as dbUpdateItem, deleteItem as dbDeleteItem } from "../store/data/db.js";
import { notify } from "../store/notifications.js";

function mapPayment(p) {
  return {
    id: p.id,
    order_id: p.order_id,
    amount: parseFloat(p.amount),
    method: p.method || p.payment_method || "cash",
    status: p.status || "pending",
    payment_method: p.method || p.payment_method || "cash",
    payment_date: p.payment_date || p.created_at || new Date().toISOString(),
    created_at: p.created_at || new Date().toISOString(),
    updated_at: p.updated_at || null,
  };
}

export async function getAllPayments() {
  return getCollection("payments").map(mapPayment);
}

export async function getPaymentById(id) {
  const found = getCollection("payments").find((p) => p.id === id);
  return found ? mapPayment(found) : null;
}

export async function getPaymentsByOrderId(orderId) {
  return getCollection("payments")
    .filter((p) => p.order_id === orderId)
    .map(mapPayment);
}

export async function getPaymentsByStatus(status) {
  const all = await getAllPayments();
  return all.filter((p) => p.status === status);
}

export async function filterPayments({ status, search, date }) {
  let results = await getAllPayments();

  if (status) {
    results = results.filter((p) => p.status === status);
  }

  if (search) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        String(p.order_id).includes(q) ||
        (p.method && p.method.toLowerCase().includes(q))
    );
  }

  if (date) {
    results = results.filter((p) => p.created_at && p.created_at.startsWith(date));
  }

  return results;
}

export async function createPayment(data) {
  const newPay = {
    id: "pay-" + Date.now(),
    order_id: data.order_id,
    amount: parseFloat(data.amount),
    method: data.method || data.payment_method || "cash",
    status: "completed",
    created_at: new Date().toISOString(),
  };
  insertItem("payments", newPay);
  notify({
    type: "success",
    title: "Pago recibido",
    message:
      "$" +
      parseFloat(newPay.amount).toFixed(2) +
      " · Orden " +
      (newPay.order_id || "").slice(0, 8),
    roles: ["admin", "cashier"],
    refType: "payment_received",
    refId: newPay.id,
    dedupe: true,
  });
  // Update order status to completed
  const order = getCollection("orders").find(function (o) {
    return o.id === newPay.order_id;
  });
  if (order) {
    dbUpdateItem("orders", newPay.order_id, { status: "completed" });
    // Also update table status to available if table exists
    if (order.table_id) {
      const tables = getCollection("tables");
      const table = tables.find(function (t) {
        return String(t.id) === String(order.table_id);
      });
      if (table) {
        dbUpdateItem("tables", table.id, { status: "available" });
      }
    }
  }
  return { success: true, payment: mapPayment(newPay) };
}

export async function updatePaymentStatus(id, newStatus) {
  const updated = dbUpdateItem("payments", id, {
    status: newStatus,
    updated_at: new Date().toISOString(),
  });
  if (updated) {
    return { success: true, payment: mapPayment(updated) };
  }
  return { success: false, error: "Pago no encontrado" };
}

export async function refundPayment(id) {
  return updatePaymentStatus(id, "refunded");
}

export async function deletePayment(id) {
  dbDeleteItem("payments", id);
  return { success: true };
}
