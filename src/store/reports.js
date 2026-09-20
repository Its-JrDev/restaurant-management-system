import { createStore } from "./index.js";
import { getCollection } from "./data/db.js";

const reportsStore = createStore({
  sales: null,
  topProducts: [],
  dailySales: [],
  todayStats: null,
});

export async function loadSalesReport(startDate, endDate) {
  const payments = getCollection("payments");
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setUTCHours(23, 59, 59, 999);

  const filtered = payments.filter(p => {
    const d = new Date(p.created_at);
    return d >= start && d <= end;
  });

  const totalRev = filtered.reduce((sum, p) => sum + p.amount, 0);

  const sales = {
    total_revenue: totalRev,
    total_orders: filtered.length,
    start_date: start.toISOString(),
    end_date: end.toISOString()
  };

  reportsStore.setState({ sales: sales });
}

export async function loadTopProducts(startDate, endDate, limit = 10) {
  const orderItems = getCollection("order_items");
  const menuItems = getCollection("menu_items");

  // simplified: all time top products
  const productMap = {};
  orderItems.forEach(oi => {
    if (!productMap[oi.menu_item_id]) {
      const mi = menuItems.find(m => m.id === oi.menu_item_id);
      productMap[oi.menu_item_id] = {
        menu_item_name: mi ? mi.name : oi.menu_item_id,
        total_quantity: 0,
        total_revenue: 0
      };
    }
    productMap[oi.menu_item_id].total_quantity += oi.quantity;
    productMap[oi.menu_item_id].total_revenue += oi.subtotal;
  });

  const sorted = Object.values(productMap).sort((a, b) => b.total_quantity - a.total_quantity).slice(0, limit);
  reportsStore.setState({ topProducts: sorted });
}

export async function loadDailySales(startDate, endDate) {
  const payments = getCollection("payments");
  const start = startDate ? new Date(startDate) : new Date();
  if (!startDate) start.setDate(start.getDate() - 6);
  start.setUTCHours(0, 0, 0, 0);

  const end = endDate ? new Date(endDate) : new Date();
  end.setUTCHours(23, 59, 59, 999);

  const dailyMap = {};
  for (let i = new Date(start); i <= end; i.setDate(i.getDate() + 1)) {
    const dateStr = i.toISOString().split('T')[0];
    dailyMap[dateStr] = {
      label: new Date(i).toLocaleDateString("en-US", { weekday: "short" }),
      date: dateStr,
      revenue: 0,
      orders: 0
    };
  }

  payments.forEach(p => {
    const d = new Date(p.created_at);
    if (d >= start && d <= end) {
      const dateStr = d.toISOString().split('T')[0];
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].revenue += p.amount;
        dailyMap[dateStr].orders += 1;
      }
    }
  });

  reportsStore.setState({ dailySales: Object.values(dailyMap) });
}

export async function loadTodayStats() {
  const orders = getCollection("orders");
  const payments = getCollection("payments");
  const tables = getCollection("tables");
  const reservations = getCollection("reservations");

  const today = new Date().toISOString().split('T')[0];
  
  const todaysPayments = payments.filter(p => p.created_at && p.created_at.startsWith(today));
  const rev = todaysPayments.reduce((s, p) => s + p.amount, 0);

  const todaysOrders = orders.filter(o => o.created_at && o.created_at.startsWith(today));
  
  const activeTables = tables.filter(t => t.status === 'occupied').length;
  
  const todaysReservations = reservations.filter(r => r.reservation_date && r.reservation_date.startsWith(today)).length;

  reportsStore.setState({ 
    todayStats: { 
      revenue: rev, 
      orders: todaysOrders.length, 
      active_tables: activeTables, 
      total_tables: tables.length, 
      reservations: todaysReservations 
    } 
  });
}

export function getState() {
  return reportsStore.getState();
}

export function subscribe(listener) {
  return reportsStore.subscribe(listener);
}
