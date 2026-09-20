import { getCollection, insertItem, updateItem as dbUpdateItem, deleteItem as dbDeleteItem } from "./data/db.js";
import { currentUser } from "./auth.js";

export let menuItems = [];
export let allOrders = [];
export let kitchenOrders = [];
export let draftOrders = [];
let draftCounter = 1;
const _userMap = {};
let _usersLoaded = false;
let _menuLoaded = false;

export const areas = [
  { id: 1, name: "Main Hall", icon: "home" },
  { id: 2, name: "Terrace", icon: "sun" },
  { id: 3, name: "Seaside Pier", icon: "waves" },
];

export let tables = [];

export const LIFECYCLE = ["draft", "new", "preparing", "ready", "served", "completed"];

const STATUS_MAP_TO_BACKEND = {
  draft: null,
  new: "pending",
  preparing: "in_progress",
  ready: "ready",
  served: "served",
  completed: "completed",
  cancelled: "cancelled",
};

const STATUS_MAP_TO_FRONTEND = {
  pending: "new",
  in_progress: "preparing",
  ready: "ready",
  served: "served",
  completed: "completed",
  cancelled: "cancelled",
};

export async function loadUsers() {
  if (_usersLoaded) return;
  try {
    const users = getCollection("users");
    users.forEach(function (u) {
      _userMap[u.id] = u.full_name || u.username;
    });
    _usersLoaded = true;
  } catch {
    // ignore
  }
}

export async function loadMenuItems() {
  const products = getCollection("menu_items");
  const categories = getCollection("categories");
  menuItems = products
    .map(function (product) {
      const category = categories.find(function (c) {
        return c.id === product.category_id;
      });
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        available: product.available !== false && product.is_available !== false,
        cat: category ? category.name : "Other",
        emoji: product.image_url || null,
      };
    })
    .filter(function (item) {
      return item.available;
    });
  _menuLoaded = true;
}

export async function loadOrders() {
  try {
    await loadUsers();
    if (!_menuLoaded) await loadMenuItems();
    const orders = getCollection("orders");
    const orderItems = getCollection("order_items");
    const tablesColl = getCollection("tables");
    allOrders = orders.map(function (o) {
      const serverName = _userMap[o.waiter_id] || o.waiter_id || "";
      const oItems = orderItems.filter(oi => oi.order_id === o.id);
      const matchedTable = tablesColl.find(function (t) {
        return String(t.id) === String(o.table_id);
      });
      return {
        id: typeof o.id === "string" ? o.id.slice(0, 8) : o.id,
        fullId: o.id,
        table: o.table_id,
        tableNumber: matchedTable ? matchedTable.number : null,
        items: oItems.map(function (oi) {
          const matched = menuItems.find(function (m) {
            return String(m.id) === String(oi.menu_item_id);
          });
          return {
            name: matched ? matched.name : oi.menu_item_id,
            qty: oi.quantity,
            price: parseFloat(oi.unit_price),
          };
        }),
        total: parseFloat(o.total),
        status: STATUS_MAP_TO_FRONTEND[o.status] || o.status,
        time: formatTimeAgo(o.created_at),
        note: null,
        server: serverName,
        createdBy: serverName,
        reservationId: o.reservation_id || null,
        placedAt: o.created_at
          ? new Date(o.created_at).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })
          : "",
      };
    });
  } catch {
    allOrders = [];
  }
}

export async function loadKitchenOrders() {
  try {
    const orders = getCollection("kitchen_orders");
    const parentStatuses = {};
    allOrders.forEach(function (o) {
      parentStatuses[o.fullId] = o.status;
    });
    const grouped = {};
    orders.forEach(function (o) {
      const key = o.order_id;
      const parentStatus = parentStatuses[key];
      if (parentStatus === "cancelled" || parentStatus === "completed") return;
      if (!grouped[key]) {
        grouped[key] = {
          fullId: key,
          kitchenIds: [],
          items: [],
          statuses: [],
          created_at: o.created_at,
          notes: null,
        };
      }
      grouped[key].kitchenIds.push(o.id);
      grouped[key].items.push({ name: o.menu_item_name, qty: o.quantity });
      grouped[key].statuses.push(o.status);
      if (o.notes) grouped[key].notes = o.notes;
      if (o.created_at && (!grouped[key].created_at || o.created_at < grouped[key].created_at)) {
        grouped[key].created_at = o.created_at;
      }
    });
    kitchenOrders = Object.keys(grouped).map(function (key) {
      const g = grouped[key];
      const matchedOrder = allOrders.find(function (o) {
        return o.fullId === key;
      });
      const tableNum = matchedOrder ? matchedOrder.table : 0;
      let status = "new";
      if (g.statuses.indexOf("preparing") !== -1) status = "preparing";
      if (
        g.statuses.every(function (s) {
          return s === "ready";
        })
      )
        status = "ready";
      return {
        id: typeof key === "string" ? key.slice(0, 8) : key,
        fullId: g.fullId,
        kitchenIds: g.kitchenIds,
        table: tableNum,
        status: status,
        time: g.created_at
          ? Math.floor((Date.now() - new Date(g.created_at).getTime()) / 60000)
          : 0,
        items: g.items,
        note: g.notes,
      };
    });
  } catch {
    kitchenOrders = [];
  }
}

export async function loadTables() {
  try {
    const items = getCollection("tables");
    const locs = getCollection("locations");
    tables = items.map(function (t, index) {
      const loc = locs.find(l => l.id === t.location_id);
      return {
        id: t.id,
        number: t.number || index + 1,
        seats: t.capacity,
        area: t.location_id || null,
        areaName: loc ? loc.name : "",
        status: t.status || "available",
        info: t.status === "available" ? "Free" : t.status === "reserved" ? "Reserved" : "Occupied",
        timer: null,
      };
    });
  } catch {
    tables = [];
  }
}

export async function loadAreas() {
  const locs = getCollection("locations");
  areas.length = 0;
  locs.forEach(function (loc) {
    areas.push({ id: loc.id, name: loc.name, icon: "map-pin" });
  });
}

export async function createTable(tableData) {
  try {
    const newTable = {
      id: "table-" + Date.now(),
      number: tableData.number,
      capacity: tableData.capacity,
      location_id: tableData.location_id || null,
      status: "available"
    };
    insertItem("tables", newTable);
    await loadTables();
    return { success: true, table: newTable };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateTable(tableId, data) {
  try {
    const updated = dbUpdateItem("tables", tableId, {
      capacity: data.capacity,
      status: data.status,
      location_id: data.location_id,
    });
    await loadTables();
    return { success: true, table: updated };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteTable(tableId) {
  try {
    dbDeleteItem("tables", tableId);
    await loadTables();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function createArea(areaData) {
  try {
    const newLoc = { id: "loc-" + Date.now(), name: areaData.name };
    insertItem("locations", newLoc);
    await loadAreas();
    return { success: true, area: newLoc };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateArea(areaId, areaData) {
  try {
    const updated = dbUpdateItem("locations", areaId, areaData);
    await loadAreas();
    return { success: true, area: updated };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteArea(areaId) {
  try {
    dbDeleteItem("locations", areaId);
    await loadAreas();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function createOrder(tableId, reservationId) {
  try {
    const order = {
      id: "order-" + Date.now(),
      table_id: tableId,
      reservation_id: reservationId || null,
      status: "pending",
      total: 0,
      created_at: new Date().toISOString()
    };
    insertItem("orders", order);
    if (tableId) {
      const tables = getCollection("tables");
      const table = tables.find(t => String(t.id) === String(tableId));
      if (table && table.status === "available") {
        dbUpdateItem("tables", table.id, { status: "occupied" });
      }
    }
    await loadOrders();
    await loadTables();
    return { success: true, order: order };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function addOrderItem(orderId, menuItemId, quantity, notes) {
  try {
    const mi = getCollection("menu_items").find(m => m.id === menuItemId);
    const orderItem = {
      id: "oi-" + Date.now(),
      order_id: orderId,
      menu_item_id: menuItemId,
      quantity: quantity || 1,
      unit_price: mi ? mi.price : 0,
      subtotal: (mi ? mi.price : 0) * (quantity || 1),
      notes: notes || null
    };
    insertItem("order_items", orderItem);
    
    // Update order total
    const order = getCollection("orders").find(o => o.id === orderId);
    if (order) {
      dbUpdateItem("orders", orderId, { total: order.total + orderItem.subtotal });
    }

    // Add to kitchen orders
    if (mi) {
      insertItem("kitchen_orders", {
        id: "ko-" + Date.now(),
        order_id: orderId,
        menu_item_name: mi.name,
        quantity: quantity || 1,
        status: "pending",
        notes: notes || null,
        created_at: new Date().toISOString()
      });
    }

    await loadOrders();
    await loadKitchenOrders();
    return { success: true, order: order };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateOrderStatus(orderId, frontendStatus) {
  const backendStatus = STATUS_MAP_TO_BACKEND[frontendStatus];
  if (!backendStatus) return { success: false, error: "Cannot persist status: " + frontendStatus };
  try {
    const result = dbUpdateItem("orders", orderId, { status: backendStatus });
    if (backendStatus === "completed" || backendStatus === "cancelled") {
      const order = getCollection("orders").find(o => o.id === orderId);
      if (order && order.table_id) {
        const tables = getCollection("tables");
        const table = tables.find(t => String(t.id) === String(order.table_id));
        if (table && table.status !== "maintenance") {
          dbUpdateItem("tables", table.id, { status: "available" });
        }
      }
    }
    await loadOrders();
    await loadTables();
    await loadKitchenOrders();
    window.dispatchEvent(new CustomEvent("orders:updated"));
    return { success: true, order: result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteOrder(orderId) {
  try {
    const order = getCollection("orders").find(o => o.id === orderId);
    dbDeleteItem("orders", orderId);
    if (order && order.table_id && order.status !== "completed" && order.status !== "cancelled") {
      const tables = getCollection("tables");
      const table = tables.find(t => String(t.id) === String(order.table_id));
      if (table && table.status === "occupied") {
        dbUpdateItem("tables", table.id, { status: "available" });
      }
    }
    await loadOrders();
    await loadTables();
    await loadKitchenOrders();
    window.dispatchEvent(new CustomEvent("orders:updated"));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function deriveParentStatus(kitchenItems) {
  if (!kitchenItems.length) return null;
  const statuses = new Set(kitchenItems.map((k) => k.status));
  if (statuses.size === 1 && statuses.has("delivered")) return "served";
  if (!statuses.has("pending") && !statuses.has("preparing")) return "ready";
  if (!statuses.has("pending")) return "preparing";
  return "new";
}

export async function updateKitchenOrderStatus(kitchenOrderId, newStatus) {
  try {
    const result = dbUpdateItem("kitchen_orders", kitchenOrderId, {
      status: newStatus,
    });
    if (result && result.order_id) {
      const siblings = getCollection("kitchen_orders").filter(
        (k) => k.order_id === result.order_id
      );
      const derived = deriveParentStatus(siblings);
      const parent = getCollection("orders").find((o) => o.id === result.order_id);
      if (derived && parent && parent.status !== "completed" && parent.status !== "cancelled") {
        dbUpdateItem("orders", parent.id, { status: derived });
      }
    }
    await loadOrders();
    await loadTables();
    await loadKitchenOrders();
    window.dispatchEvent(new CustomEvent("orders:updated"));
    return { success: true, order: result };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateAllKitchenOrderStatuses(kitchenIds, newStatus, _expectedCurrent) {
  let lastResult;
  for (const kid of kitchenIds) {
    lastResult = await updateKitchenOrderStatus(kid, newStatus);
  }
  return lastResult || { success: false, error: "No kitchen order IDs provided" };
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return mins + " min ago";
  const hours = Math.floor(mins / 60);
  return hours + "h ago";
}

export function setKitchenOrders(arr) {
  kitchenOrders.length = 0;
  arr.forEach(function (o) {
    kitchenOrders.push(o);
  });
}

export function canTransition(role, from, to) {
  if (to === "cancelled") return role === "admin";
  if (role === "admin") return true;
  if (role === "waiter") {
    const fi = LIFECYCLE.indexOf(from);
    const ti = LIFECYCLE.indexOf(to);
    if (fi === -1 || ti === -1) return false;
    return ti === fi + 1 && fi === 3;
  }
  if (role === "chef") {
    const fi2 = LIFECYCLE.indexOf(from);
    const ti2 = LIFECYCLE.indexOf(to);
    if (fi2 === -1 || ti2 === -1) return false;
    return ti2 === fi2 + 1 && fi2 >= 1 && ti2 <= 3;
  }
  return false;
}

export function recalcOrder(order) {
  const subtotal = order.items.reduce(function (sum, i) {
    return sum + (i.price || 0) * i.qty;
  }, 0);
  order.total = Math.round(subtotal * 1.1 * 100) / 100;
}



export function saveDraft(cartItems, tableId) {
  const user = currentUser();
  const draft = {
    id: "draft-" + draftCounter++,
    table: tableId || null,
    items: cartItems.map(function (c) {
      return { name: c.name, qty: c.qty, price: c.price, id: c.id };
    }),
    total: 0,
    status: "draft",
    time: "Just now",
    note: null,
    server: user ? user.name || user.username : "Admin",
    createdBy: user ? user.role : "admin",
    placedAt: new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
  };
  recalcOrder(draft);
  draftOrders.unshift(draft);
  return draft;
}

export function deleteDraft(draftId) {
  draftOrders = draftOrders.filter(function (d) {
    return d.id !== draftId;
  });
}

export function getDraftById(draftId) {
  return (
    draftOrders.find(function (d) {
      return d.id === draftId;
    }) || null
  );
}
