import {
  allOrders,
  menuItems,
  tables,
  draftOrders,
  deleteDraft,
  getDraftById,
  LIFECYCLE,
  canTransition,
  recalcOrder,
  loadOrders,
  loadMenuItems,
  loadTables,
  createOrder,
  addOrderItem,
  updateOrderStatus,
  deleteOrder,
} from "../../store/posData.js";
import CartPanel, { loadDraftItems } from "../../components/pos/CartPanel.js";
import { paymentModal } from "../../components/ui/PaymentModal.js";
import * as paymentService from "../../services/paymentService.js";
import { exportToCSV } from "../../utils/csvExport.js";
import { hasAnyRole, getRole } from "../../utils/roleContext.js";
import { confirmModal } from "../../components/ui/ConfirmModal.js";
import { toast } from "../../components/ui/ToastManager.js";
import { withLoading, Skeletons } from "../../utils/withLoading.js";

let subView = "orders";
let activeFilter = "all";
let selectedOrderId = null;
let editingOrder = null;
let _lastContainer = null;

function getFilteredOrders() {
  if (activeFilter === "active")
    return allOrders.filter(function (o) {
      return o.status !== "completed" && o.status !== "cancelled";
    });
  if (activeFilter === "closed")
    return allOrders.filter(function (o) {
      return o.status === "completed" || o.status === "cancelled";
    });
  return allOrders;
}

function statusBadge(status) {
  const map = {
    draft: { bg: "bg-neutral-100", text: "text-neutral-600", dot: "bg-neutral-500" },
    completed: { bg: "bg-success-100", text: "text-success-700", dot: "bg-success-500" },
    preparing: { bg: "bg-warning-100", text: "text-warning-700", dot: "bg-warning-500" },
    ready: { bg: "bg-brand-100", text: "text-brand-700", dot: "bg-brand-500" },
    served: { bg: "bg-accent-100", text: "text-accent-700", dot: "bg-accent-500" },
    new: { bg: "bg-info-100", text: "text-info-700", dot: "bg-info-500" },
    cancelled: { bg: "bg-error-100", text: "text-error-700", dot: "bg-error-500" },
  };
  const s = map[status] || map.draft;
  return (
    '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ' +
    s.bg +
    " " +
    s.text +
    '"><span class="w-1.5 h-1.5 rounded-full ' +
    s.dot +
    '"></span>' +
    status +
    "</span>"
  );
}

function resetContainerStyles(el) {
  el.style.display = "";
  el.style.flexDirection = "";
  el.style.height = "";
  el.style.overflow = "";
}

function renderOrderList(container) {
  resetContainerStyles(container);
  const orders = getFilteredOrders();

  let html = "";

  html += '<div class="flex items-center justify-between mb-6">';
  html += '<h2 class="text-xl font-bold text-brand-900">Orders</h2>';
  html += '<div class="flex gap-2">';
  if (hasAnyRole("admin")) {
    html +=
      '<button data-action="export-orders-csv" class="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-lg border bg-white text-brand-700 border-brand-300 hover:bg-brand-50 cursor-pointer transition-colors"><i data-lucide="download" class="w-4 h-4"></i><span>Export CSV</span></button>';
  }
  if (hasAnyRole("admin", "waiter")) {
    html +=
      '<button data-action="new-order" class="inline-flex items-center gap-2 h-10 px-4 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white border-0 cursor-pointer">';
    html += '<i data-lucide="plus" class="w-4 h-4"></i><span>New Order</span></button>';
  }
  html += "</div>";
  html += "</div>";

  html += '<div class="flex gap-2 mb-5">';
  ["all", "active", "closed"].forEach(function (f) {
    const isActive = activeFilter === f;
    html +=
      '<button data-filter="' +
      f +
      '" class="px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer transition-colors ' +
      (isActive
        ? "bg-brand-500 text-white border-brand-500"
        : "bg-white text-secondary-700 border-brand-200 hover:border-brand-300 hover:bg-brand-50") +
      '">' +
      f.charAt(0).toUpperCase() +
      f.slice(1) +
      "</button>";
  });
  html += "</div>";

  html +=
    '<div class="bg-white border border-brand-300 rounded-xl shadow-sm overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm text-left">';
  html +=
    '<thead><tr class="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border-b-2 border-brand-300">';
  html +=
    '<th class="px-4 py-3">Order</th><th class="px-4 py-3">Table</th><th class="px-4 py-3">Server</th><th class="px-4 py-3">Items</th><th class="px-4 py-3">Total</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Time</th><th class="px-4 py-3">Actions</th>';
  html += '</tr></thead><tbody class="divide-y divide-brand-200">';

  draftOrders.forEach(function (draft) {
    const st = statusBadge("draft");
    const tableNum = draft.table
      ? tables.find(function (t) {
          return t.id === draft.table;
        })
      : null;
    const tableLabel = tableNum ? "Table " + tableNum.number : "No table";
    html += '<tr class="bg-neutral-50/80 hover:bg-neutral-100 transition-colors">';
    html += '<td class="px-4 py-3 font-semibold text-neutral-600">#' + draft.id + "</td>";
    html += '<td class="px-4 py-3">' + tableLabel + "</td>";
    html += '<td class="px-4 py-3">' + (draft.server || "—") + "</td>";
    html += '<td class="px-4 py-3">' + draft.items.length + " items</td>";
    html +=
      '<td class="px-4 py-3 font-semibold text-neutral-700">$' + draft.total.toFixed(2) + "</td>";
    html += '<td class="px-4 py-3">' + st + "</td>";
    html += '<td class="px-4 py-3 text-secondary-500">' + draft.time + "</td>";
    html += '<td class="px-4 py-3"><div class="flex items-center gap-2">';
    html +=
      '<button data-action="edit-draft" data-draft-id="' +
      draft.id +
      '" class="w-7 h-7 inline-flex items-center justify-center rounded-md bg-transparent text-brand-600 hover:bg-brand-100 hover:text-brand-700 border-0 cursor-pointer" title="Edit"><i data-lucide="pencil" class="w-4 h-4"></i></button>';
    html +=
      '<button data-action="send-draft" data-draft-id="' +
      draft.id +
      '" class="w-7 h-7 inline-flex items-center justify-center rounded-md bg-transparent text-success-600 hover:bg-success-50 hover:text-success-700 border-0 cursor-pointer" title="Send to Kitchen"><i data-lucide="send" class="w-4 h-4"></i></button>';
    html +=
      '<button data-action="delete-draft" data-draft-id="' +
      draft.id +
      '" class="w-7 h-7 inline-flex items-center justify-center rounded-md bg-transparent text-error-600 hover:text-error-800 hover:bg-error-50 border-0 cursor-pointer" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>';
    html += "</div></td>";
    html += "</tr>";
  });

  orders.forEach(function (order, i) {
    const bg = i % 2 === 0 ? "bg-white" : "bg-brand-50/50";
    const st = statusBadge(order.status);
    const canCancel = canTransition(getRole(), order.status, "cancelled");
    const canDelete =
      getRole() === "admin" && (order.status === "completed" || order.status === "cancelled");
    const canDropDraft =
      order.status === "draft" && (getRole() === "admin" || order.createdBy === getRole());
    html += '<tr class="' + bg + ' hover:bg-brand-50 transition-colors">';
    html += '<td class="px-4 py-3 font-semibold text-primary-700">#' + order.id + "</td>";
    const orderTable = order.table
      ? tables.find(function (t) {
          return String(t.id) === String(order.table);
        })
      : null;
    html += '<td class="px-4 py-3">' + (orderTable ? "Table " + orderTable.number : "—") + "</td>";
    html += '<td class="px-4 py-3">' + (order.server || "—") + "</td>";
    html += '<td class="px-4 py-3">' + order.items.length + " items</td>";
    html +=
      '<td class="px-4 py-3 font-semibold text-primary-700">$' + order.total.toFixed(2) + "</td>";
    html += '<td class="px-4 py-3">' + st + "</td>";
    html += '<td class="px-4 py-3 text-secondary-500">' + order.time + "</td>";
    html += '<td class="px-4 py-3"><div class="flex items-center gap-2">';
    html +=
      '<button data-action="view-detail" data-order-id="' +
      order.id +
      '" class="w-7 h-7 inline-flex items-center justify-center rounded-md bg-transparent text-brand-600 hover:bg-brand-100 hover:text-brand-700 border-0 cursor-pointer" title="View"><i data-lucide="eye" class="w-4 h-4"></i></button>';
    if (canCancel) {
      html +=
        '<button data-action="cancel-order" data-order-id="' +
        order.id +
        '" class="w-7 h-7 inline-flex items-center justify-center rounded-md bg-transparent text-error-600 hover:text-error-800 hover:bg-error-50 border-0 cursor-pointer" title="Cancel"><i data-lucide="x-circle" class="w-4 h-4"></i></button>';
    }
    if (canDelete || canDropDraft) {
      html +=
        '<button data-action="delete-order" data-order-id="' +
        order.id +
        '" class="w-7 h-7 inline-flex items-center justify-center rounded-md bg-transparent text-error-600 hover:text-error-800 hover:bg-error-50 border-0 cursor-pointer" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>';
    }
    html += "</div></td>";
    html += "</tr>";
  });

  html += "</tbody></table></div></div>";

  container.innerHTML = html;
  setupOrderListEvents(container);
}

function renderNewOrder(container) {
  const categories = ["All"].concat(
    Array.from(new Set(menuItems.map(function (i) { return i.cat; })))
  );
  const activeCat = "All";

  let html = "";

  html += '<div class="flex items-center justify-between mb-6 shrink-0">';
  html +=
    '<button data-action="back-to-orders" class="inline-flex items-center justify-center gap-2 font-semibold bg-transparent text-brand-700 border border-transparent hover:bg-brand-100 h-8 px-3 text-[13px] rounded-md transition-all cursor-pointer"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back</button>';
  html += '<h2 class="text-xl font-bold text-brand-900">New Order</h2>';
  html += '<div class="flex items-center gap-3">';
  html += '<span class="text-sm text-secondary-600">Table:</span>';
  html +=
    '<select id="table-select" class="inline-flex items-center gap-2 h-8 px-3 rounded-md bg-white text-brand-700 border border-brand-300 hover:bg-brand-50 text-sm font-semibold cursor-pointer">';
  html += '<option value="">-- Select Table --</option>';
  tables.forEach(function (t) {
    html += '<option value="' + t.id + '">Table ' + t.number + "</option>";
  });
  html += "</select>";
  html += "</div></div>";

  html += '<div class="flex gap-6 flex-1 min-h-0">';

  html += '<div class="flex-1 min-w-0 min-h-0 flex flex-col gap-4">';
  html += '<div class="flex gap-2 flex-wrap shrink-0">';
  categories.forEach(function (cat) {
    html +=
      '<button data-cat="' +
      cat +
      '" class="px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer transition-colors ' +
      (cat === activeCat
        ? "bg-brand-500 text-white border-brand-500"
        : "bg-white text-brand-600 border-brand-300 hover:bg-brand-50") +
      '">' +
      cat +
      "</button>";
  });
  html += "</div>";

  html +=
    '<div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] overflow-y-auto min-h-0">';
  menuItems.forEach(function (item) {
    html +=
      '<div data-action="add-to-cart" data-item-id="' +
      item.id +
      '" class="bg-white border border-brand-300 rounded-xl p-4 cursor-pointer transition-all flex flex-col items-center text-center hover:border-brand-500 hover:shadow-[var(--shadow-brand-hover)]">';
    html +=
      '<div class="w-20 h-20 rounded-lg flex items-center justify-center text-3xl mb-3 bg-brand-50">' +
      (item.emoji || "\uD83C\uDF7D\uFE0F") +
      "</div>";
    html += '<div class="text-sm font-semibold text-brand-900 mb-0.5">' + item.name + "</div>";
    html +=
      '<div class="text-[15px] font-bold text-brand-600">$' + item.price.toFixed(2) + "</div>";
    html += '<div class="text-xs text-secondary-500 mt-1">' + item.cat + "</div>";
    html += "</div>";
  });
  html += "</div></div>";

  html += '<div class="lg:w-[340px] lg:shrink-0 lg:h-full lg:overflow-y-auto w-0">';
  html += CartPanel();
  html += "</div></div>";

  container.innerHTML = html;
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.height = "100%";
  container.style.overflow = "hidden";
  setupNewOrderEvents(container);
}

function renderOrderDetail(container, orderId) {
  resetContainerStyles(container);
  const order = allOrders.find(function (o) {
    return o.id === orderId;
  });
  if (!order) {
    subView = "orders";
    renderOrderList(container);
    return;
  }

  const isEditing = editingOrder && editingOrder.id === order.id;
  const displayOrder = isEditing ? editingOrder : order;
  const isCancelled = displayOrder.status === "cancelled";
  const isDraft = displayOrder.status === "draft";
  const isClosed = displayOrder.status === "completed" || displayOrder.status === "cancelled";
  const isActive =
    ["draft", "new", "preparing", "ready", "served"].indexOf(displayOrder.status) !== -1;
  const canEditItems =
    isDraft &&
    (getRole() === "admin" || displayOrder.createdBy === getRole()) &&
    getRole() !== "chef";
  const canDropDraft =
    isDraft &&
    (getRole() === "admin" || displayOrder.createdBy === getRole()) &&
    getRole() !== "chef";
  const canCancelOrder = isActive && !isDraft && getRole() === "admin";
  const canDelete = isClosed && getRole() === "admin";
  const canEditNote = getRole() !== "chef";
  const canCharge =
    displayOrder.status === "served" &&
    (getRole() === "admin" || getRole() === "cashier");

  const lifecycleIdx = LIFECYCLE.indexOf(displayOrder.status);

  const steps = LIFECYCLE.map(function (s, i) {
    if (isCancelled) return { label: s, cls: "" };
    let cls = "";
    if (i < lifecycleIdx) cls = "done";
    else if (i === lifecycleIdx) cls = "current";
    return { label: s, cls: cls };
  });

  const transitions = [];
  if (!isClosed && !isCancelled) {
    if (getRole() === "admin") {
      if (lifecycleIdx > 0 && !isDraft)
        transitions.push({
          to: LIFECYCLE[lifecycleIdx - 1],
          label: "\u2190 Back",
          btnCls: "bg-white text-brand-700 border border-brand-300 hover:bg-brand-50",
        });
      if (lifecycleIdx < LIFECYCLE.length - 1)
        transitions.push({
          to: LIFECYCLE[lifecycleIdx + 1],
          label: "Next \u2192",
          btnCls: "bg-primary-600 text-white border border-primary-600 hover:bg-primary-700",
        });
      transitions.push({
        to: "cancelled",
        label: "Cancel",
        btnCls: "bg-error-600 text-white border border-error-600 hover:bg-error-700",
      });
    } else if (getRole() === "waiter") {
      const from = displayOrder.status;
      const nextStatus = LIFECYCLE[lifecycleIdx + 1];
      if (nextStatus && canTransition(getRole(), from, nextStatus)) {
        transitions.push({
          to: nextStatus,
          label: "Next \u2192",
          btnCls: "bg-primary-600 text-white border border-primary-600 hover:bg-primary-700",
        });
      }
    } else if (getRole() === "chef") {
      if (lifecycleIdx < LIFECYCLE.length - 1 && lifecycleIdx >= 1 && lifecycleIdx + 1 <= 3) {
        const tLabels = { 1: "Start Preparing", 2: "Mark Ready", 3: "Served" };
        transitions.push({
          to: LIFECYCLE[lifecycleIdx + 1],
          label: tLabels[lifecycleIdx] || "Next \u2192",
          btnCls: "bg-primary-600 text-white border border-primary-600 hover:bg-primary-700",
        });
      }
    }
  }

  let html = "";

  html += '<div class="flex items-center justify-between mb-6">';
  html +=
    '<button data-action="back-to-orders" class="inline-flex items-center justify-center gap-2 font-semibold bg-transparent text-brand-700 border border-transparent hover:bg-brand-100 h-8 px-3 text-[13px] rounded-md transition-all cursor-pointer"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back</button>';
  html += '<h2 class="text-xl font-bold text-brand-900">Order #' + displayOrder.id + "</h2>";
  html += '<div class="flex gap-3">';
  html += statusBadge(displayOrder.status);
  if (isCancelled)
    html +=
      '<span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold bg-error-100 text-error-700"><i data-lucide="x-circle" class="w-4 h-4"></i> Cancelled</span>';
  html += "</div></div>";

  html += '<div class="grid grid-cols-3 gap-4 mb-6">';
  const summaryCells = [
    {
      label: "Table",
      value: (function () {
        const ot = displayOrder.table
          ? tables.find(function (t) {
              return String(t.id) === String(displayOrder.table);
            })
          : null;
        return ot ? "Table " + ot.number : "—";
      })(),
    },
    { label: "Server", value: displayOrder.server || "\u2014" },
    { label: "Placed", value: displayOrder.placedAt || displayOrder.time },
    { label: "Items", value: displayOrder.items.length },
    { label: "Created By", value: displayOrder.createdBy || "\u2014" },
    { label: "Total", value: "$" + displayOrder.total.toFixed(2) },
  ];
  summaryCells.forEach(function (c) {
    html += '<div class="bg-white border border-brand-200 rounded-lg p-4">';
    html +=
      '<div class="text-[11px] font-bold uppercase tracking-widest text-secondary-500 mb-1">' +
      c.label +
      "</div>";
    html +=
      '<div class="text-[15px] font-semibold text-brand-900' +
      (c.label === "Total" ? " text-lg" : "") +
      '">' +
      c.value +
      "</div>";
    html += "</div>";
  });
  html += "</div>";

  html +=
    '<div class="bg-white border border-brand-300 rounded-xl shadow-sm overflow-hidden mb-5">';
  html += '<div class="flex items-center gap-1 px-5 py-4 bg-white border-b border-brand-100">';
  steps.forEach(function (s, i) {
    const dotBg =
      s.cls === "done"
        ? "bg-primary-600 border-primary-600 text-white"
        : s.cls === "current"
          ? "bg-brand-500 border-brand-500 text-white shadow-[0_0_0_3px_var(--color-brand-100)]"
          : "bg-white border-brand-200 text-brand-400";
    const labelColor =
      s.cls === "done" || s.cls === "current" ? "text-brand-800" : "text-secondary-500";
    html += '<div class="flex items-center gap-2">';
    html +=
      '<div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 ' +
      dotBg +
      '">' +
      (i + 1) +
      "</div>";
    html +=
      '<span class="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ' +
      labelColor +
      '">' +
      s.label +
      "</span>";
    html += "</div>";
    if (i < steps.length - 1) {
      const connBg = s.cls === "done" ? "bg-primary-500" : "bg-brand-200";
      html += '<div class="flex-1 h-0.5 min-w-3 ' + connBg + '"></div>';
    }
  });
  if (isCancelled)
    html +=
      '<span class="inline-flex items-center gap-2 px-3 py-2 rounded-full text-[13px] font-bold bg-error-100 text-error-700 ml-auto"><i data-lucide="x-circle" class="w-4 h-4"></i> Cancelled</span>';
  html += "</div></div>";

  html +=
    '<div class="bg-white border border-brand-300 rounded-xl shadow-sm overflow-hidden mb-5">';
  html +=
    '<div class="flex items-center justify-between px-5 py-4 border-b border-brand-100 bg-brand-50"><h3 class="text-sm font-bold text-brand-800">Items</h3>';
  if (canEditItems && !isEditing)
    html +=
      '<button data-action="start-edit" data-order-id="' +
      displayOrder.id +
      '" class="inline-flex items-center justify-center gap-2 font-semibold bg-white text-brand-700 border border-brand-300 hover:bg-brand-50 h-8 px-3 text-[13px] rounded-md transition-all cursor-pointer"><i data-lucide="edit" class="w-4 h-4"></i> Edit Items</button>';
  html += "</div>";
  html += '<div class="px-5 py-4" id="detail-items-body">';

  if (isEditing) {
    displayOrder.items.forEach(function (item, idx) {
      const sub = (item.price * item.qty).toFixed(2);
      html += '<div class="flex items-center gap-3 py-3 border-b border-brand-100">';
      html += '<span class="flex-1 text-sm font-medium text-neutral-700">' + item.name + "</span>";
      html +=
        '<span class="text-[13px] text-secondary-600 min-w-[64px] text-right">$' +
        (item.price || 0).toFixed(2) +
        "</span>";
      html += '<div class="flex items-center gap-2">';
      html +=
        '<button class="w-6 h-6 inline-flex items-center justify-center rounded bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 cursor-pointer text-xs" data-action="edit-item-qty" data-idx="' +
        idx +
        '" data-delta="-1" title="Remove one"><i data-lucide="minus" class="w-3 h-3"></i></button>';
      html +=
        '<span class="min-w-[20px] text-center font-bold text-brand-800">' + item.qty + "</span>";
      html +=
        '<button class="w-6 h-6 inline-flex items-center justify-center rounded bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 cursor-pointer text-xs" data-action="edit-item-qty" data-idx="' +
        idx +
        '" data-delta="1" title="Add one"><i data-lucide="plus" class="w-3 h-3"></i></button>';
      html += "</div>";
      html +=
        '<span class="text-sm font-semibold text-brand-800 min-w-[72px] text-right">$' +
        sub +
        "</span>";
      html +=
        '<button data-action="remove-edit-item" data-idx="' +
        idx +
        '" class="w-7 h-7 flex items-center justify-center border-none bg-transparent text-error-500 rounded-md cursor-pointer hover:bg-error-50" title="Remove item"><i data-lucide="trash-2" class="w-4 h-4"></i></button>';
      html += "</div>";
    });

    const editCats = ["All"].concat(
      Array.from(new Set(menuItems.map(function (i) { return i.cat; })))
    );
    html += '<div class="mt-4 pt-4 border-t-2 border-dashed border-brand-200">';
    html +=
      '<h4 class="text-[13px] font-bold text-brand-700 mb-3"><i data-lucide="plus-circle" class="w-4 h-4 inline-block align-middle mr-1"></i> Add Items</h4>';
    html += '<div class="flex gap-2 flex-wrap mb-3">';
    editCats.forEach(function (cat, i) {
      html +=
        '<button data-detail-cat="' +
        cat +
        '" class="px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors ' +
        (i === 0
          ? "bg-brand-500 text-white border-brand-500"
          : "bg-white text-brand-600 border-brand-300 hover:bg-brand-50") +
        '">' +
        cat +
        "</button>";
    });
    html += "</div>";
    html +=
      '<div class="grid gap-3 grid-cols-[repeat(auto-fill,minmax(160px,1fr))] id="detailMenuGrid">';
    menuItems.forEach(function (item) {
      html +=
        '<div data-action="add-to-edit-order" data-item-id="' +
        item.id +
        '" class="bg-white border border-brand-300 rounded-xl p-3 cursor-pointer transition-all flex flex-col items-center text-center hover:border-brand-500 hover:shadow-[var(--shadow-brand-hover)]">';
      html +=
        '<div class="w-14 h-14 rounded-lg flex items-center justify-center text-2xl mb-2 bg-brand-50">' +
        (item.emoji || "\uD83C\uDF7D\uFE0F") +
        "</div>";
      html += '<div class="text-xs font-semibold text-brand-900 mb-0.5">' + item.name + "</div>";
      html +=
        '<div class="text-[13px] font-bold text-brand-600">$' + item.price.toFixed(2) + "</div>";
      html += '<div class="text-[10px] text-secondary-500 mt-0.5">' + item.cat + "</div>";
      html += "</div>";
    });
    html += "</div></div>";

    html += '<div class="flex justify-end gap-3 mt-4">';
    html +=
      '<button data-action="cancel-edit" class="inline-flex items-center justify-center gap-2 font-semibold bg-white text-brand-700 border border-brand-300 hover:bg-brand-50 h-8 px-3 text-[13px] rounded-md transition-all cursor-pointer">Cancel</button>';
    html +=
      '<button data-action="save-edit" class="inline-flex items-center justify-center gap-2 font-semibold bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 h-8 px-3 text-[13px] rounded-md transition-all cursor-pointer"><i data-lucide="check" class="w-4 h-4"></i> Done</button>';
    html += "</div>";
  } else {
    html += '<div class="overflow-x-auto">';
    html += '<table class="w-full border-collapse min-w-[300px]">';
    html += "<thead><tr>";
    html +=
      '<th class="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-brand-700 border-b-2 border-brand-200 bg-brand-50">Item</th>';
    html +=
      '<th class="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-brand-700 border-b-2 border-brand-200 bg-brand-50">Price</th>';
    html +=
      '<th class="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-brand-700 border-b-2 border-brand-200 bg-brand-50">Qty</th>';
    html +=
      '<th class="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-brand-700 border-b-2 border-brand-200 bg-brand-50">Subtotal</th>';
    html += "</tr></thead><tbody>";
    displayOrder.items.forEach(function (item) {
      html += "<tr>";
      html +=
        '<td class="px-4 py-3 text-sm border-b border-brand-100 font-medium">' +
        item.name +
        "</td>";
      html +=
        '<td class="px-4 py-3 text-sm border-b border-brand-100 text-right text-secondary-600">$' +
        (item.price || 0).toFixed(2) +
        "</td>";
      html +=
        '<td class="px-4 py-3 text-sm border-b border-brand-100 text-center">' + item.qty + "</td>";
      html +=
        '<td class="px-4 py-3 text-sm border-b border-brand-100 text-right font-semibold text-brand-800">$' +
        ((item.price || 0) * item.qty).toFixed(2) +
        "</td>";
      html += "</tr>";
    });
    html += "</tbody></table></div>";
    const sub = displayOrder.total / 1.1;
    const tax = displayOrder.total - sub;
    html += '<div class="flex justify-end gap-6 mt-4 pt-4 border-t border-brand-200">';
    html += '<span class="text-[13px] text-secondary-600">Subtotal</span>';
    html += '<span class="font-semibold text-sm">$' + sub.toFixed(2) + "</span></div>";
    html += '<div class="flex justify-end gap-6 mt-1">';
    html += '<span class="text-[13px] text-secondary-600">Tax (10%)</span>';
    html += '<span class="font-semibold text-sm">$' + tax.toFixed(2) + "</span></div>";
    html += '<div class="flex justify-end gap-6 mt-2 pt-2 border-t-2 border-brand-300">';
    html += '<span class="text-[15px] font-bold text-brand-900">Total</span>';
    html +=
      '<span class="text-lg font-bold text-brand-900">$' +
      displayOrder.total.toFixed(2) +
      "</span></div>";
  }
  html += "</div></div>";

  html +=
    '<div class="bg-white border border-brand-300 rounded-xl shadow-sm overflow-hidden mb-5">';
  html +=
    '<div class="flex items-center justify-between px-5 py-4 border-b border-brand-100 bg-brand-50"><h3 class="text-sm font-bold text-brand-800">Kitchen Note</h3></div>';
  html += '<div class="px-5 py-4">';
  html +=
    '<div class="text-[13px] text-accent-700 italic p-3 bg-accent-50 rounded-md border-l-[3px] border-accent-400">';
  if (canEditNote) {
    html +=
      '<textarea id="detailNoteInput" class="w-full border border-brand-300 rounded-md p-3 text-[13px] resize-y min-h-[60px] mb-3 text-neutral-700 bg-white focus:outline-none focus:border-brand-500 focus:shadow-[var(--ring-brand)]" placeholder="Add a note for the kitchen (e.g. allergy, substitution)...">' +
      (displayOrder.note || "") +
      "</textarea>";
    html +=
      '<button data-action="save-note" data-order-id="' +
      displayOrder.id +
      '" class="inline-flex items-center justify-center gap-2 font-semibold bg-white text-brand-700 border border-brand-300 hover:bg-brand-50 h-8 px-3 text-[13px] rounded-md transition-all cursor-pointer"><i data-lucide="save" class="w-4 h-4"></i> Save Note</button>';
  } else {
    html += '<p class="text-[13px] text-neutral-500 mb-2">Read-only</p>';
    html +=
      '<div class="bg-neutral-50 border border-neutral-200 rounded-sm p-3 text-[13px] text-neutral-700 min-h-[60px]">';
    html += displayOrder.note || '<span class="text-neutral-400">No note</span>';
    html += "</div>";
  }
  html += "</div></div></div>";

  const hasActions =
    transitions.length > 0 || canDropDraft || canCancelOrder || canDelete || canCharge;
  if (hasActions) {
    html += '<div class="flex gap-3 p-5 bg-brand-50 border-t border-brand-200">';
    if (canCharge)
      html +=
        '<button data-action="charge-order" data-order-id="' +
        displayOrder.fullId +
        '" class="inline-flex items-center justify-center gap-2 font-semibold bg-success-600 text-white border border-success-600 hover:bg-success-700 h-8 px-3 text-[13px] rounded-md transition-all cursor-pointer"><i data-lucide="credit-card" class="w-4 h-4"></i> Charge Order</button>';
    if (canDropDraft)
      html +=
        '<button data-action="drop-draft" data-order-id="' +
        displayOrder.id +
        '" class="inline-flex items-center justify-center gap-2 font-semibold bg-error-600 text-white border border-error-600 hover:bg-error-700 h-8 px-3 text-[13px] rounded-md transition-all cursor-pointer"><i data-lucide="trash-2" class="w-4 h-4"></i> Drop Draft</button>';
    if (canDelete)
      html +=
        '<button data-action="delete-order" data-order-id="' +
        displayOrder.id +
        '" class="inline-flex items-center justify-center gap-2 font-semibold bg-error-600 text-white border border-error-600 hover:bg-error-700 h-8 px-3 text-[13px] rounded-md transition-all cursor-pointer"><i data-lucide="trash-2" class="w-4 h-4"></i> Delete</button>';
    if (
      canCancelOrder &&
      !transitions.some(function (t) {
        return t.to === "cancelled";
      })
    ) {
      html +=
        '<button data-action="cancel-order" data-order-id="' +
        displayOrder.id +
        '" class="inline-flex items-center justify-center gap-2 font-semibold bg-error-600 text-white border border-error-600 hover:bg-error-700 h-8 px-3 text-[13px] rounded-md transition-all cursor-pointer"><i data-lucide="x-circle" class="w-4 h-4"></i> Cancel</button>';
    }
    html += '<div class="flex-1"></div>';
    transitions.forEach(function (t) {
      html +=
        '<button data-action="transition" data-target="' +
        t.to +
        '" data-order-id="' +
        displayOrder.id +
        '" class="inline-flex items-center justify-center gap-2 font-semibold h-8 px-3 text-[13px] rounded-md transition-all cursor-pointer ' +
        t.btnCls +
        '">' +
        t.label +
        "</button>";
    });
    html += "</div>";
  }

  container.innerHTML = html;
  setupOrderDetailEvents(container, order);
}

function setupOrderListEvents(container) {
  container.addEventListener("click", async function (e) {
    const filterBtn = e.target.closest("[data-filter]");
    if (filterBtn) {
      activeFilter = filterBtn.getAttribute("data-filter");
      renderOrderList(container);
      window.createIcons();
      return;
    }

    const newBtn = e.target.closest('[data-action="new-order"]');
    if (newBtn) {
      subView = "new";
      editingOrder = null;
      renderNewOrder(container);
      window.createIcons();
      return;
    }

    const detailBtn = e.target.closest('[data-action="view-detail"]');
    if (detailBtn) {
      const id = detailBtn.getAttribute("data-order-id");
      selectedOrderId = id;
      subView = "detail";
      editingOrder = null;
      renderOrderDetail(container, id);
      window.createIcons();
      return;
    }

    const cancelBtn = e.target.closest('[data-action="cancel-order"]');
    if (cancelBtn) {
      const cid = cancelBtn.getAttribute("data-order-id");
      const order = allOrders.find(function (o) {
        return o.id === cid;
      });
      if (order && canTransition(getRole(), order.status, "cancelled")) {
        if (order.fullId) {
          await updateOrderStatus(order.fullId, "cancelled");
        } else {
          order.status = "cancelled";
        }
        renderOrderList(container);
        window.createIcons();
      }
      return;
    }

    const delBtn = e.target.closest('[data-action="delete-order"]');
    if (delBtn) {
      const did = delBtn.getAttribute("data-order-id");
      if (getRole() === "admin") {
        const order = allOrders.find(function (o) {
          return o.id === did;
        });
        if (
          order &&
          (await confirmModal.show({
            title: "Delete Order",
            message: "Are you sure you want to delete this order?",
          }))
        ) {
          deleteOrder(order.fullId).then(function () {
            renderOrderList(container);
            window.createIcons();
          });
        }
      }
      return;
    }

    const editDraftBtn = e.target.closest('[data-action="edit-draft"]');
    if (editDraftBtn) {
      const draftId = editDraftBtn.getAttribute("data-draft-id");
      const draft = getDraftById(draftId);
      if (draft) {
        deleteDraft(draftId);
        subView = "new";
        editingOrder = null;
        renderNewOrder(container);
        loadDraftItems(draft.items);
        if (draft.table) {
          const tableSelect = document.getElementById("table-select");
          if (tableSelect) tableSelect.value = draft.table;
        }
        window.createIcons();
      }
      return;
    }

    const sendDraftBtn = e.target.closest('[data-action="send-draft"]');
    if (sendDraftBtn) {
      const draftId = sendDraftBtn.getAttribute("data-draft-id");
      const draft = getDraftById(draftId);
      if (draft && draft.table) {
        const result = await createOrder(draft.table);
        if (result.success && result.order) {
          const orderId = result.order.id;
          for (const item of draft.items) {
            await addOrderItem(orderId, item.id, item.qty);
          }
        }
        deleteDraft(draftId);
        renderOrderList(container);
        window.createIcons();
      } else {
        toast.warning("No Table", "Draft has no table assigned. Edit it first to assign a table.");
      }
      return;
    }

    const deleteDraftBtn = e.target.closest('[data-action="delete-draft"]');
    if (deleteDraftBtn) {
      const draftId = deleteDraftBtn.getAttribute("data-draft-id");
      if (await confirmModal.show({ title: "Delete Draft", message: "Delete this draft?" })) {
        deleteDraft(draftId);
        renderOrderList(container);
        window.createIcons();
      }
      return;
    }

    const exportBtn = e.target.closest('[data-action="export-orders-csv"]');
    if (exportBtn) {
      const orders = getFilteredOrders();
      const csvData = orders.map(function (o) {
        return {
          "Order ID": "#" + o.id,
          Table: "Table " + o.table,
          Server: o.server || "",
          Items: o.items.length,
          Total: o.total.toFixed(2),
          Status: o.status,
          Time: o.time,
        };
      });
      exportToCSV(csvData, "orders-" + activeFilter, [
        { key: "Order ID", label: "Order ID" },
        { key: "Table", label: "Table" },
        { key: "Server", label: "Server" },
        { key: "Items", label: "Items" },
        { key: "Total", label: "Total" },
        { key: "Status", label: "Status" },
        { key: "Time", label: "Time" },
      ]);
      return;
    }
  });
}

function setupNewOrderEvents(container) {
  container.addEventListener("click", function (e) {
    const addBtn = e.target.closest('[data-action="add-to-cart"]');
    if (addBtn) {
      const itemId = addBtn.getAttribute("data-item-id");
      const item = menuItems.find(function (m) {
        return m.id === itemId;
      });
      if (item) {
        window.dispatchEvent(new CustomEvent("cart:add", { detail: { item: item } }));
      }
      return;
    }

    const catBtn = e.target.closest("[data-cat]");
    if (catBtn) {
      const cat = catBtn.getAttribute("data-cat");
      container.querySelectorAll("[data-cat]").forEach(function (b) {
        b.className =
          "px-4 py-1.5 rounded-full text-[13px] font-semibold border cursor-pointer transition-colors " +
          (b.getAttribute("data-cat") === cat
            ? "bg-brand-500 text-white border-brand-500"
            : "bg-white text-brand-600 border-brand-300 hover:bg-brand-50");
      });
      const grid = container.querySelector(".grid");
      if (grid) {
        grid.querySelectorAll('[data-action="add-to-cart"]').forEach(function (card) {
          const catEls = card.querySelectorAll(".text-secondary-500");
          const cardCat = catEls.length > 0 ? catEls[catEls.length - 1] : null;
          if (cardCat) {
            card.style.display = cat === "All" || cardCat.textContent === cat ? "" : "none";
          }
        });
      }
      return;
    }

    const backBtn = e.target.closest('[data-action="back-to-orders"]');
    if (backBtn) {
      subView = "orders";
      renderOrderList(container);
      window.createIcons();
      return;
    }
  });
}

function setupOrderDetailEvents(container, order) {
  container.addEventListener("click", async function (e) {
    const backBtn = e.target.closest('[data-action="back-to-orders"]');
    if (backBtn) {
      subView = "orders";
      editingOrder = null;
      renderOrderList(container);
      window.createIcons();
      return;
    }

    const transBtn = e.target.closest('[data-action="transition"]');
    if (transBtn) {
      const target = transBtn.getAttribute("data-target");
      const oid = transBtn.getAttribute("data-order-id");
      const o = allOrders.find(function (ord) {
        return ord.id === oid;
      });
      if (o && canTransition(getRole(), o.status, target)) {
        if (o.fullId) {
          await updateOrderStatus(o.fullId, target);
        } else {
          o.status = target;
        }
        renderOrderDetail(container, oid);
        window.createIcons();
      }
      return;
    }

    const chargeBtn = e.target.closest('[data-action="charge-order"]');
    if (chargeBtn) {
      const data = await paymentModal.show();
      if (data) {
        const result = await paymentService.createPayment({
          order_id: data.orderId,
          amount: data.amount,
          method: data.method,
        });
        if (result.success) {
          toast.success("Payment received", "$" + data.amount + " via " + data.method);
          await updateOrderStatus(data.orderId, "completed");
          subView = "orders";
          renderOrderList(container);
          window.createIcons();
        } else {
          toast.error("Payment Failed", result.error || "Unknown error");
        }
      }
      return;
    }

    const cancelBtn = e.target.closest('[data-action="cancel-order"]');
    if (cancelBtn) {
      const cid = cancelBtn.getAttribute("data-order-id");
      const co = allOrders.find(function (ord) {
        return ord.id === cid;
      });
      if (co && canTransition(getRole(), co.status, "cancelled")) {
        if (co.fullId) {
          await updateOrderStatus(co.fullId, "cancelled");
        } else {
          co.status = "cancelled";
        }
        renderOrderDetail(container, cid);
        window.createIcons();
      }
      return;
    }

    const dropBtn = e.target.closest('[data-action="drop-draft"]');
    if (dropBtn) {
      const did = dropBtn.getAttribute("data-order-id");
      const didx = allOrders.findIndex(function (o) {
        return o.id === did;
      });
      if (didx > -1) {
        allOrders.splice(didx, 1);
        subView = "orders";
        renderOrderList(container);
        window.createIcons();
      }
      return;
    }

    const delBtn = e.target.closest('[data-action="delete-order"]');
    if (delBtn) {
      const delId = delBtn.getAttribute("data-order-id");
      if (getRole() === "admin") {
        const order = allOrders.find(function (o) {
          return o.id === delId;
        });
        if (
          order &&
          (await confirmModal.show({
            title: "Delete Order",
            message: "Are you sure you want to delete this order?",
          }))
        ) {
          deleteOrder(order.fullId).then(function () {
            subView = "orders";
            renderOrderList(container);
            window.createIcons();
          });
        }
      }
      return;
    }

    const editBtn = e.target.closest('[data-action="start-edit"]');
    if (editBtn) {
      const eid = editBtn.getAttribute("data-order-id");
      const eo = allOrders.find(function (o) {
        return o.id === eid;
      });
      if (eo) {
        editingOrder = JSON.parse(JSON.stringify(eo));
        renderOrderDetail(container, eid);
        window.createIcons();
      }
      return;
    }

    const saveBtn = e.target.closest('[data-action="save-edit"]');
    if (saveBtn) {
      if (editingOrder) {
        recalcOrder(editingOrder);
        const orig = allOrders.find(function (o) {
          return o.id === editingOrder.id;
        });
        if (orig) Object.assign(orig, editingOrder);
        editingOrder = null;
        renderOrderDetail(container, orig.id);
        window.createIcons();
      }
      return;
    }

    const cancelEditBtn = e.target.closest('[data-action="cancel-edit"]');
    if (cancelEditBtn) {
      editingOrder = null;
      renderOrderDetail(container, order.id);
      window.createIcons();
      return;
    }

    const removeItemBtn = e.target.closest('[data-action="remove-edit-item"]');
    if (removeItemBtn && editingOrder) {
      const ridx = parseInt(removeItemBtn.getAttribute("data-idx"));
      editingOrder.items.splice(ridx, 1);
      recalcOrder(editingOrder);
      renderOrderDetail(container, editingOrder.id);
      window.createIcons();
      return;
    }

    const qtyBtn = e.target.closest('[data-action="edit-item-qty"]');
    if (qtyBtn && editingOrder) {
      const qidx = parseInt(qtyBtn.getAttribute("data-idx"));
      const delta = parseInt(qtyBtn.getAttribute("data-delta"));
      const item = editingOrder.items[qidx];
      if (item) {
        item.qty += delta;
        if (item.qty <= 0) editingOrder.items.splice(qidx, 1);
        recalcOrder(editingOrder);
        renderOrderDetail(container, editingOrder.id);
        window.createIcons();
      }
      return;
    }

    const addEditBtn = e.target.closest('[data-action="add-to-edit-order"]');
    if (addEditBtn && editingOrder) {
      const itemId = addEditBtn.getAttribute("data-item-id");
      const menuItem = menuItems.find(function (m) {
        return m.id === itemId;
      });
      if (menuItem) {
        const existing = editingOrder.items.find(function (it) {
          return it.id === menuItem.id;
        });
        if (existing) {
          existing.qty++;
        } else {
          editingOrder.items.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            qty: 1,
          });
        }
        recalcOrder(editingOrder);
        renderOrderDetail(container, editingOrder.id);
        window.createIcons();
      }
      return;
    }

    const detailCatBtn = e.target.closest("[data-detail-cat]");
    if (detailCatBtn) {
      const cat = detailCatBtn.getAttribute("data-detail-cat");
      container.querySelectorAll("[data-detail-cat]").forEach(function (b) {
        b.className =
          "px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer transition-colors " +
          (b.getAttribute("data-detail-cat") === cat
            ? "bg-brand-500 text-white border-brand-500"
            : "bg-white text-brand-600 border-brand-300 hover:bg-brand-50");
      });
      const grid = container.querySelector("#detailMenuGrid");
      if (grid) {
        grid.querySelectorAll('[data-action="add-to-edit-order"]').forEach(function (card) {
          const catEls = card.querySelectorAll(".text-secondary-500");
          const cardCat = catEls.length > 0 ? catEls[catEls.length - 1] : null;
          if (cardCat) {
            card.style.display = cat === "All" || cardCat.textContent === cat ? "" : "none";
          }
        });
      }
      return;
    }

    const saveNoteBtn = e.target.closest('[data-action="save-note"]');
    if (saveNoteBtn) {
      const noteId = saveNoteBtn.getAttribute("data-order-id");
      const noteOrder = allOrders.find(function (o) {
        return o.id === noteId;
      });
      if (noteOrder) {
        const noteInput = document.getElementById("detailNoteInput");
        noteOrder.note = noteInput ? noteInput.value : null;
        renderOrderDetail(container, noteId);
        window.createIcons();
      }
      return;
    }
  });
}

const PosView = {
  render: async function (el) {
    _lastContainer = el;
    await loadMenuItems();
    await loadOrders();
    await loadTables();
    const openTableId = window._openOrderTableId;
    if (openTableId) {
      window._openOrderTableId = null;
      subView = "new";
      editingOrder = null;
      selectedOrderId = null;
      renderNewOrder(el);
      const tableSelect = document.getElementById("table-select");
      if (tableSelect) {
        tableSelect.value = openTableId;
      }
      window.createIcons();
      return;
    }
    const openOrderId = window._openOrderId;
    if (openOrderId) {
      window._openOrderId = null;
      const matched = allOrders.find(function (o) {
        return o.fullId === openOrderId || o.id === openOrderId;
      });
      if (matched) {
        subView = "detail";
        selectedOrderId = matched.id;
        editingOrder = null;
        renderOrderDetail(el, matched.id);
        window.createIcons();
        return;
      }
    }
    if (subView === "new") {
      renderNewOrder(el);
    } else if (subView === "detail" && selectedOrderId) {
      renderOrderDetail(el, selectedOrderId);
    } else {
      subView = "orders";
      renderOrderList(el);
    }
  },
  init: function () {
    window.createIcons();
    this._onCartSent = async function () {
      if (_lastContainer) {
        subView = "orders";
        await loadOrders();
        renderOrderList(_lastContainer);
        window.createIcons();
      }
    };
    window.addEventListener("cart:sent", this._onCartSent);

    this._onOrdersUpdated = async function () {
      if (!_lastContainer) return;
      await loadOrders();
      if (subView === "detail" && selectedOrderId) {
        const stillExists = allOrders.find(function (o) {
          return o.id === selectedOrderId;
        });
        if (stillExists) {
          renderOrderDetail(_lastContainer, selectedOrderId);
        } else {
          subView = "orders";
          renderOrderList(_lastContainer);
        }
      } else {
        renderOrderList(_lastContainer);
      }
      window.createIcons();
    };
    window.addEventListener("orders:updated", this._onOrdersUpdated);
  },
  destroy: function () {
    editingOrder = null;
    if (this._onCartSent) {
      window.removeEventListener("cart:sent", this._onCartSent);
      this._onCartSent = null;
    }
    if (this._onOrdersUpdated) {
      window.removeEventListener("orders:updated", this._onOrdersUpdated);
      this._onOrdersUpdated = null;
    }
  },
};

export default withLoading(PosView, Skeletons.ordersTable());
