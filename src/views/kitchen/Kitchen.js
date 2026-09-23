import {
  kitchenOrders,
  loadKitchenOrders,
  loadOrders,
  updateAllKitchenOrderStatuses,
  allOrders,
} from "../../store/posData.js";
import { hasAnyRole } from "../../utils/roleContext.js";
import { withLoading, Skeletons } from "../../utils/withLoading.js";

const KITCHEN_STATUS_MAP = {
  new: "pending",
  preparing: "preparing",
  ready: "ready",
  served: "delivered",
};

let kitchenActiveTab = "new";

const FROM_STATUS_MAP = {
  preparing: "pending",
  ready: "preparing",
  served: "ready",
};

async function moveOrder(id, newStatus) {
  if (newStatus === "served" && !hasAnyRole("admin", "waiter")) return;

  const order = kitchenOrders.find(function (o) {
    return o.id === id || o.fullId === id;
  });
  if (!order) return;

  const backendStatus = KITCHEN_STATUS_MAP[newStatus];
  if (backendStatus && order.kitchenIds && order.kitchenIds.length > 0) {
    const expectedCurrent = FROM_STATUS_MAP[newStatus]
      ? KITCHEN_STATUS_MAP[FROM_STATUS_MAP[newStatus]]
      : null;
    await updateAllKitchenOrderStatuses(order.kitchenIds, backendStatus, expectedCurrent);
  }
  const el = document.getElementById("current-view");
  if (el) {
    await KitchenView.render(el);
    window.createIcons();
  }
}

function renderColumn(col, isActive) {
  const orders = kitchenOrders.filter(function (o) {
    return o.status === col.key;
  });

  let html = '<div class="flex-col rounded-xl overflow-hidden ' + (isActive ? 'flex' : 'hidden lg:flex') + ' ' + col.colBg + '">';
  html += '<div class="flex items-center justify-between px-5 py-4">';
  html += '<span class="text-[15px] font-bold ' + col.headerColor + '">' + col.label + "</span>";
  html +=
    '<span class="text-xs font-bold px-2 py-0.5 rounded-full ' +
    col.countBg +
    " " +
    col.countColor +
    '">' +
    orders.length +
    "</span>";
  html += "</div>";
  html += '<div class="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-3">';

  if (orders.length === 0) {
    html += '<div class="text-center py-6 text-secondary-400 text-[13px]">Sin órdenes</div>';
  } else {
    orders.forEach(function (order) {
      html += renderCard(order, col);
    });
  }

  html += "</div></div>";
  return html;
}

function renderCard(order, col) {
  const actionLabel =
    col.key === "new"
      ? "Iniciar preparación"
      : col.key === "preparing"
        ? "Marcar como listo"
        : "Servido";
  const actionBg =
    col.key === "new"
      ? "bg-brand-600 hover:bg-brand-700"
      : col.key === "preparing"
        ? "bg-primary-600 hover:bg-primary-700"
        : "bg-brand-600 hover:bg-brand-700";
  const isUrgent = order.time > 15;

  let html =
    '<div class="bg-white border border-brand-300 rounded-lg p-4 shadow-[0_2px_6px_rgba(114,49,23,0.08)]">';

  html += '<div class="flex items-center justify-between mb-3">';
  html += '<span class="text-sm font-bold text-brand-800">Mesa ' + order.table + "</span>";
  html +=
    '<span class="inline-flex items-center gap-1 text-xs ' +
    (isUrgent ? "text-error-600 font-semibold" : "text-secondary-500") +
    '">';
  html += '<i data-lucide="clock" class="w-3.5 h-3.5"></i> ' + order.time + " min</span>";
  html += "</div>";

  html += '<div class="flex flex-col gap-1 mb-3">';
  order.items.forEach(function (item) {
    html += '<div class="text-[13px] text-neutral-600 flex items-center gap-2">';
    html +=
      '<span class="font-bold text-brand-700 min-w-[20px]">' + item.qty + "x</span> " + item.name;
    html += "</div>";
  });
  html += "</div>";

  if (order.note) {
    html +=
      '<div class="text-xs text-accent-700 italic p-2 mb-3 rounded bg-accent-50 border-l-[3px] border-accent-400">' +
      order.note +
      "</div>";
  }

  html += '<div class="flex gap-2">';
  html +=
    '<button data-kitchen-action="details" data-order-id="' +
    order.id +
    '" class="flex-1 h-8 px-3 text-xs font-semibold rounded-lg bg-transparent text-primary-600 hover:bg-primary-50 border border-primary-300 cursor-pointer transition-colors">Detalles</button>';
  const allowed = col.key === "ready" ? hasAnyRole("admin", "waiter") : hasAnyRole("admin", "chef");
  if (allowed) {
    html +=
      '<button data-kitchen-action="move" data-order-id="' +
      order.id +
      '" data-from-status="' +
      col.key +
      '" data-next-status="' +
      col.next +
      '" class="flex-1 h-8 px-3 text-xs font-semibold rounded-lg text-white border-0 cursor-pointer transition-colors ' +
      actionBg +
      '">' +
      actionLabel +
      "</button>";
  }
  html += "</div></div>";

  return html;
}

function showDetailsModal(order) {
  const existing = document.getElementById("kitchen-order-modal");
  if (existing) existing.remove();

  const matchedOrder = allOrders.find(function(o) {
    return o.fullId === order.fullId || o.id === order.id;
  });

  const isUrgent = order.time > 15;
  const statusLabels = {
    new: "Orden nueva",
    preparing: "En preparación",
    ready: "Lista para servir",
    served: "Servida",
  };
  const statusColors = {
    new: "bg-info-100 text-info-700",
    preparing: "bg-accent-100 text-accent-700",
    ready: "bg-success-100 text-success-700",
    served: "bg-neutral-100 text-neutral-600",
  };

  const modalEl = document.createElement("div");
  modalEl.id = "kitchen-order-modal";
  modalEl.className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-backdrop-in";

  let itemsHtml = "";
  order.items.forEach(function(item) {
    itemsHtml += '<div class="flex items-center justify-between py-2 border-b border-brand-100 last:border-0">' +
      '<div class="flex items-center gap-3">' +
        '<span class="flex items-center justify-center w-6 h-6 rounded-md bg-brand-100 text-brand-700 font-bold text-xs">' + item.qty + 'x</span>' +
        '<span class="text-sm font-semibold text-neutral-800">' + item.name + '</span>' +
      '</div>' +
    '</div>';
  });

  const nextAction = order.status === "new"
    ? { next: "preparing", label: "Iniciar preparación", cls: "bg-brand-600 hover:bg-brand-700 text-white" }
    : order.status === "preparing"
      ? { next: "ready", label: "Marcar como listo", cls: "bg-primary-600 hover:bg-primary-700 text-white" }
      : null;

  modalEl.innerHTML =
    '<div class="bg-white rounded-2xl shadow-2xl border border-brand-300 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">' +
      '<div class="flex items-center justify-between px-6 py-4 border-b border-brand-100 bg-brand-50">' +
        '<div>' +
          '<div class="flex items-center gap-2">' +
            '<h3 class="text-lg font-bold text-brand-900 font-display">Orden #' + order.id + '</h3>' +
            '<span class="text-xs font-bold px-2.5 py-0.5 rounded-full ' + (statusColors[order.status] || "bg-brand-100 text-brand-700") + '">' + (statusLabels[order.status] || order.status) + '</span>' +
          '</div>' +
          '<p class="text-xs text-secondary-500 mt-0.5">Mesa ' + order.table + ' • ' + (matchedOrder && matchedOrder.server ? 'Mesero: ' + matchedOrder.server : 'Ticket de cocina') + '</p>' +
        '</div>' +
        '<button id="closeKitchenModal" class="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-brand-100 transition-colors cursor-pointer border-none bg-transparent">' +
          '<i data-lucide="x" class="w-5 h-5"></i>' +
        '</button>' +
      '</div>' +
      '<div class="p-6 overflow-y-auto space-y-4">' +
        '<div class="grid grid-cols-2 gap-3">' +
          '<div class="p-3 bg-brand-50/70 rounded-xl border border-brand-200">' +
            '<span class="text-[11px] font-bold text-secondary-500 uppercase tracking-wider block">Tiempo transcurrido</span>' +
            '<span class="text-sm font-bold ' + (isUrgent ? 'text-error-600' : 'text-brand-800') + ' flex items-center gap-1 mt-0.5">' +
              '<i data-lucide="clock" class="w-4 h-4"></i> ' + order.time + ' min ' + (isUrgent ? '(Urgente)' : '') +
            '</span>' +
          '</div>' +
          '<div class="p-3 bg-brand-50/70 rounded-xl border border-brand-200">' +
            '<span class="text-[11px] font-bold text-secondary-500 uppercase tracking-wider block">Cantidad de artículos</span>' +
            '<span class="text-sm font-bold text-brand-800 flex items-center gap-1 mt-0.5">' +
              '<i data-lucide="utensils" class="w-4 h-4"></i> ' + order.items.length + ' artículo(s)' +
            '</span>' +
          '</div>' +
        '</div>' +
        (order.note ? (
          '<div class="p-3 bg-accent-50 border-l-4 border-accent-500 rounded-r-xl text-accent-900">' +
            '<span class="text-xs font-bold uppercase tracking-wider block text-accent-700 mb-0.5">Nota de cocina</span>' +
            '<p class="text-sm font-medium italic">' + order.note + '</p>' +
          '</div>'
        ) : '') +
        '<div class="border border-brand-200 rounded-xl p-4 bg-white">' +
          '<h4 class="text-xs font-bold uppercase tracking-wider text-brand-700 mb-3">Artículos de la orden</h4>' +
          '<div class="divide-y divide-brand-100">' + itemsHtml + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="px-6 py-4 bg-brand-50 border-t border-brand-100 flex items-center justify-between gap-3">' +
        '<button id="viewPosOrderBtn" class="text-xs font-semibold text-primary-600 hover:text-primary-800 hover:underline flex items-center gap-1 bg-transparent border-0 cursor-pointer">' +
          '<i data-lucide="external-link" class="w-3.5 h-3.5"></i> Ver orden completa en POS' +
        '</button>' +
        '<div class="flex items-center gap-2">' +
          '<button id="closeKitchenModalBtn" class="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-brand-300 text-neutral-700 hover:bg-brand-50 cursor-pointer transition-colors">Cerrar</button>' +
          (nextAction ? (
            '<button id="modalActionMoveBtn" class="px-4 py-2 text-xs font-semibold rounded-lg border-0 cursor-pointer transition-colors ' + nextAction.cls + '">' +
              nextAction.label +
            '</button>'
          ) : '') +
        '</div>' +
      '</div>' +
    '</div>';

  document.body.appendChild(modalEl);
  if (typeof window.createIcons === "function") window.createIcons();

  function closeModal() {
    modalEl.remove();
  }

  modalEl.querySelector("#closeKitchenModal").addEventListener("click", closeModal);
  modalEl.querySelector("#closeKitchenModalBtn").addEventListener("click", closeModal);
  modalEl.addEventListener("click", function(e) {
    if (e.target === modalEl) closeModal();
  });

  const posBtn = modalEl.querySelector("#viewPosOrderBtn");
  if (posBtn) {
    posBtn.addEventListener("click", function() {
      closeModal();
      window._openOrderId = order.fullId || order.id;
      window.location.hash = "#/orders";
    });
  }

  const actionBtn = modalEl.querySelector("#modalActionMoveBtn");
  if (actionBtn && nextAction) {
    actionBtn.addEventListener("click", async function() {
      closeModal();
      await moveOrder(order.id, nextAction.next);
    });
  }
}

const KitchenView = {
  render: async function (el) {
    await loadOrders();
    await loadKitchenOrders();
    const cols = [
      {
        key: "new",
        label: "Órdenes nuevas",
        next: "preparing",
        colBg: "bg-info-50",
        headerColor: "text-info-700",
        countBg: "bg-info-100",
        countColor: "text-info-700",
      },
      {
        key: "preparing",
        label: "Preparando",
        next: "ready",
        colBg: "bg-accent-50",
        headerColor: "text-accent-700",
        countBg: "bg-accent-100",
        countColor: "text-accent-700",
      },
      {
        key: "ready",
        label: "Listas para servir",
        next: "served",
        colBg: "bg-success-50",
        headerColor: "text-success-700",
        countBg: "bg-success-100",
        countColor: "text-success-700",
      },
    ];

    let html = '<div class="flex flex-col h-full">';

    html += '<div class="flex items-center justify-between mb-5">';
    html += '<h2 class="text-xl font-bold text-brand-900">Órdenes de cocina</h2>';
    html += '<div class="flex items-center gap-2 text-sm text-brand-600">';
    html += '<span class="w-3 h-3 rounded-full bg-error-500"></span> Urgente (&gt;15 min)';
    html += "</div></div>";

    html += '<div class="flex lg:hidden bg-brand-100 rounded-lg p-1 mb-4">';
    cols.forEach(function (col) {
      const isActive = kitchenActiveTab === col.key;
      const count = kitchenOrders.filter(function(o) { return o.status === col.key; }).length;
      html += '<button data-kitchen-tab="' + col.key + '" class="flex-1 py-2 text-[13px] font-bold rounded-md transition-colors ' + (isActive ? 'bg-white text-brand-800 shadow-sm' : 'text-brand-600') + '">' + col.label + ' (' + count + ')</button>';
    });
    html += '</div>';

    html += '<div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 min-h-0">';
    cols.forEach(function (col) {
      html += renderColumn(col, kitchenActiveTab === col.key);
    });
    html += "</div></div>";

    el.innerHTML = html;
  },

  init: function () {
    const el = document.getElementById("current-view");
    if (!el) return;
    this._clickHandler = async function (e) {
      const tabBtn = e.target.closest('[data-kitchen-tab]');
      if (tabBtn) {
        kitchenActiveTab = tabBtn.getAttribute('data-kitchen-tab');
        const currentEl = document.getElementById("current-view");
        if (currentEl) {
          await KitchenView.render(currentEl);
          window.createIcons();
        }
        return;
      }
      const moveBtn = e.target.closest('[data-kitchen-action="move"]');
      if (moveBtn) {
        const oid = moveBtn.getAttribute("data-order-id");
        const next = moveBtn.getAttribute("data-next-status");
        moveOrder(oid, next);
        return;
      }
      const detailsBtn = e.target.closest('[data-kitchen-action="details"]');
      if (detailsBtn) {
        const oid = detailsBtn.getAttribute("data-order-id");
        const order = kitchenOrders.find(function (o) {
          return o.id === oid || o.fullId === oid;
        });
        if (order) showDetailsModal(order);
      }
    };
    el.addEventListener("click", this._clickHandler);

    this._onOrdersUpdated = async function () {
      const currentEl = document.getElementById("current-view");
      if (currentEl) {
        await KitchenView.render(currentEl);
        window.createIcons();
      }
    };
    window.addEventListener("orders:updated", this._onOrdersUpdated);
  },
  destroy: function () {
    const el = document.getElementById("current-view");
    if (el && this._clickHandler) {
      el.removeEventListener("click", this._clickHandler);
      this._clickHandler = null;
    }
    if (this._onOrdersUpdated) {
      window.removeEventListener("orders:updated", this._onOrdersUpdated);
      this._onOrdersUpdated = null;
    }
  },
};

export default withLoading(KitchenView, Skeletons.kitchen());
