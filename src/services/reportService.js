import { apiGet } from "./api.js";

export function initMockReports() {}

export async function getSalesReport(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setUTCHours(23, 59, 59, 999);

  try {
    const params = new URLSearchParams({
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    });
    const data = await apiGet(`/api/v1/reports/sales?${params}`);
    return {
      total_revenue: parseFloat(data.total_revenue) || 0,
      total_orders: data.total_orders || 0,
      start_date: data.start_date,
      end_date: data.end_date,
    };
  } catch {
    return {
      total_revenue: 0,
      total_orders: 0,
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    };
  }
}

export async function getTopProducts(startDate, endDate, limit = 10) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setUTCHours(23, 59, 59, 999);

  try {
    const params = new URLSearchParams({
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      limit: String(limit),
    });
    const items = await apiGet(`/api/v1/reports/products?${params}`);
    return items.map((p) => ({
      menu_item_name: p.menu_item_name,
      total_quantity: p.total_quantity,
      total_revenue: parseFloat(p.total_revenue) || 0,
    }));
  } catch {
    return [];
  }
}

export async function getDailySales(startDate, endDate) {
  const start = startDate ? new Date(startDate) : new Date();
  if (!startDate) start.setDate(start.getDate() - 6);
  start.setUTCHours(0, 0, 0, 0);

  const end = endDate ? new Date(endDate) : new Date();
  end.setUTCHours(23, 59, 59, 999);

  try {
    const params = new URLSearchParams({
      start_date: start.toISOString(),
      end_date: end.toISOString(),
    });
    const items = await apiGet(`/api/v1/reports/daily-sales?${params}`);
    return items.map((d) => ({
      label: new Date(d.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" }),
      date: d.date,
      revenue: d.revenue,
      orders: d.orders,
    }));
  } catch {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: d.toISOString().split("T")[0],
        revenue: 0,
        orders: 0,
      });
    }
    return days;
  }
}

export async function getTodayStats() {
  try {
    return await apiGet("/api/v1/reports/today-stats");
  } catch {
    return { revenue: 0, orders: 0, active_tables: 0, total_tables: 0, reservations: 0 };
  }
}
