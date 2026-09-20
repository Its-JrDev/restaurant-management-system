import { apiGet, apiPost, apiPut, apiDelete } from "./api.js";

function mapPayment(p) {
  return {
    id: p.id,
    order_id: p.order_id,
    amount: parseFloat(p.amount),
    method: p.method,
    status: p.status,
    payment_method: p.method,
    payment_date: p.created_at,
    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

export async function getAllPayments() {
  try {
    const items = await apiGet("/api/v1/payments/");
    return items.map(mapPayment);
  } catch {
    return [];
  }
}

export async function getPaymentById(id) {
  try {
    const item = await apiGet(`/api/v1/payments/${id}`);
    return mapPayment(item);
  } catch {
    return null;
  }
}

export async function getPaymentsByOrderId(orderId) {
  try {
    const item = await apiGet(`/api/v1/payments/order/${orderId}`);
    return item ? [mapPayment(item)] : [];
  } catch {
    return [];
  }
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
  try {
    const item = await apiPost("/api/v1/payments/", {
      order_id: data.order_id,
      amount: data.amount,
      method: data.method || data.payment_method || "cash",
    });
    return { success: true, payment: mapPayment(item) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updatePaymentStatus(id, newStatus) {
  try {
    const item = await apiPut(`/api/v1/payments/${id}`, { status: newStatus });
    return { success: true, payment: mapPayment(item) };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function refundPayment(id) {
  return updatePaymentStatus(id, "refunded");
}

export async function deletePayment(id) {
  try {
    await apiDelete(`/api/v1/payments/${id}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
