import * as paymentsStore from "../../store/payments.js";
import * as paymentService from "../../services/paymentService.js";
import { allOrders, loadOrders } from "../../store/posData.js";
import { currentUser } from "../../store/auth.js";
import { hasAnyRole } from "../../utils/roleContext.js";
import { paymentModal } from "../../components/ui/PaymentModal.js";
import { confirmModal } from "../../components/ui/ConfirmModal.js";
import { toast } from "../../components/ui/ToastManager.js";
import { withLoading, Skeletons } from "../../utils/withLoading.js";

const STATUS_LABELS = {
  pending: "Pending",
  completed: "Completed",
  refunded: "Refunded",
  failed: "Failed",
};

const STATUS_COLORS = {
  pending: { bg: "bg-info-100", text: "text-info-700", dot: "bg-info-500" },
  completed: { bg: "bg-success-100", text: "text-success-700", dot: "bg-success-500" },
  refunded: { bg: "bg-accent-100", text: "text-accent-700", dot: "bg-accent-500" },
  failed: { bg: "bg-error-100", text: "text-error-700", dot: "bg-error-500" },
};

const PAYMENT_METHODS = [
  { id: "cash", name: "Cash", icon: "banknote" },
  { id: "card", name: "Card", icon: "credit-card" },
  { id: "transfer", name: "Transfer", icon: "banknote" },
];

let subView = "list";
let selectedId = null;
let activeFilter = "all";
let searchQuery = "";
let dateFilter = "";

const enabledMethods = {
  cash: true,
  card: true,
  transfer: true,
};

function statusBadge(status) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const label = STATUS_LABELS[status] || status;
  return (
    '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ' +
    colors.bg +
    " " +
    colors.text +
    '">' +
    '<span class="w-1.5 h-1.5 rounded-full ' +
    colors.dot +
    '"></span>' +
    label +
    "</span>"
  );
}

function getFiltered() {
  const all = paymentsStore.getState().payments;
  let filtered = all;

  if (activeFilter !== "all") {
    filtered = filtered.filter(function (p) {
      return p.status === activeFilter;
    });
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(function (p) {
      return (
        p.id.toLowerCase().includes(q) ||
        String(p.order_id).includes(q) ||
        (p.method && p.method.toLowerCase().includes(q))
      );
    });
  }

  if (dateFilter) {
    filtered = filtered.filter(function (p) {
      return p.payment_date.startsWith(dateFilter);
    });
  }

  return filtered;
}

function getOrderById(orderId) {
  return allOrders.find(function (o) {
    return o.id === orderId;
  });
}

function formatPaymentDate(dateStr) {
  const date = new Date(dateStr);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

function getPaymentMethodName(methodId) {
  const method = PAYMENT_METHODS.find(function (m) {
    return m.id === methodId;
  });
  return method ? method.name : methodId;
}

function getPaymentMethodIcon(methodId) {
  const method = PAYMENT_METHODS.find(function (m) {
    return m.id === methodId;
  });
  return method ? method.icon : "credit-card";
}

function renderList(el) {
  const payments = getFiltered();
  const allPay = paymentsStore.getState().payments;
  const counts = { all: allPay.length };
  ["pending", "completed", "refunded", "failed"].forEach(function (s) {
    counts[s] = allPay.filter(function (p) {
      return p.status === s;
    }).length;
  });

  let html = '<div class="space-y-5">';

  html += '<div class="flex items-center justify-between">';
  html += '<div><h2 class="text-xl font-semibold text-brand-900 font-display">Payments</h2>';
  html +=
    '<p class="text-sm text-secondary-500 mt-0.5">' +
    payments.length +
    " payment" +
    (payments.length !== 1 ? "s" : "") +
    "</p></div>";
  html += '<div class="flex gap-2">';
  if (hasAnyRole("admin", "cashier")) {
    html +=
      '<button data-action="new-payment" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="plus" class="w-4 h-4"></i> New Payment</button>';
  }
  if (hasAnyRole("admin")) {
    html +=
      '<button data-action="config-methods" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 cursor-pointer transition-colors"><i data-lucide="settings" class="w-4 h-4"></i> Methods</button>';
  }
  html += "</div></div>";

  html += '<div class="flex flex-wrap gap-2">';
  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
    { key: "refunded", label: "Refunded" },
    { key: "failed", label: "Failed" },
  ];
  tabs.forEach(function (tab) {
    const isActive = activeFilter === tab.key;
    html +=
      '<button data-filter="' +
      tab.key +
      '" class="px-4 py-2 rounded-full text-sm font-semibold border cursor-pointer transition-colors ' +
      (isActive
        ? "bg-brand-500 text-white border-brand-500"
        : "bg-white text-brand-600 border-brand-300 hover:bg-brand-50") +
      '">' +
      tab.label +
      ' <span class="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ' +
      (isActive ? "bg-white/20 text-white" : "bg-brand-200 text-brand-700") +
      '">' +
      (counts[tab.key] || 0) +
      "</span></button>";
  });
  html += "</div>";

  html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
  html += '<div class="px-5 py-3 border-b border-brand-100">';
  html += '<div class="flex items-center gap-3">';
  html +=
    '<div class="flex items-center gap-2 flex-1 border border-brand-200 rounded-lg px-3 py-2 bg-white">';
  html += '<i data-lucide="search" class="w-4 h-4 text-brand-400 shrink-0"></i>';
  html +=
    '<input type="text" id="pay-search" value="' +
    searchQuery +
    '" placeholder="Search by payment ID, order, or reference..." class="flex-1 text-sm text-neutral-900 outline-none border-none bg-transparent placeholder:text-secondary-400" />';
  if (searchQuery) {
    html +=
      '<button data-action="clear-search" class="text-secondary-400 hover:text-secondary-600 cursor-pointer bg-transparent border-none p-0"><i data-lucide="x" class="w-4 h-4"></i></button>';
  }
  html += "</div>";
  html +=
    '<input type="date" id="pay-date-filter" value="' +
    dateFilter +
    '" class="border border-brand-200 rounded-lg px-3 py-2 text-sm text-neutral-700 bg-white cursor-pointer" />';
  html += "</div>";
  html += "</div>";

  html += '<div class="overflow-x-auto">';
  html += '<table class="w-full">';
  html += '<thead><tr class="border-b-2 border-brand-100">';
  const cols = [
    "Payment ID",
    "Order",
    "Table",
    "Cashier",
    "Amount",
    "Method",
    "Status",
    "Date",
    "Actions",
  ];
  cols.forEach(function (c) {
    html +=
      '<th class="px-5 py-3 text-left text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50">' +
      c +
      "</th>";
  });
  html += "</tr></thead>";
  html += "<tbody>";

  if (payments.length === 0) {
    html += '<tr><td colspan="9" class="px-5 py-12 text-center">';
    html += '<div class="flex flex-col items-center justify-center">';
    html += '<i data-lucide="credit-card" class="w-12 h-12 text-brand-300 mb-3"></i>';
    html += '<p class="text-sm text-secondary-500">No payments found</p>';
    if (searchQuery || dateFilter || activeFilter !== "all") {
      html +=
        '<button data-action="clear-all-filters" class="mt-2 text-sm text-brand-600 hover:text-brand-700 cursor-pointer">Clear filters</button>';
    }
    html += "</div></td></tr>";
  } else {
    payments.forEach(function (payment) {
      const order = getOrderById(payment.order_id);
      const table = order ? order.table : "—";
      const canRefund = payment.status === "completed";
      const canDelete = currentUser && currentUser.role === "admin";

      html +=
        '<tr class="border-b border-brand-100 hover:bg-brand-50 transition-colors cursor-pointer" data-action="view-detail" data-payment-id="' +
        payment.id +
        '">';
      html +=
        '<td class="px-5 py-3 font-semibold text-primary-700">' + payment.id.slice(0, 8) + "</td>";
      html += '<td class="px-5 py-3">#' + payment.order_id.slice(0, 8) + "</td>";
      html += '<td class="px-5 py-3">Table ' + table + "</td>";
      html += '<td class="px-5 py-3">—</td>';
      html +=
        '<td class="px-5 py-3 font-semibold text-brand-900">$' +
        payment.amount.toFixed(2) +
        "</td>";
      html +=
        '<td class="px-5 py-3"><span class="inline-flex items-center gap-1.5 text-sm text-brand-700"><i data-lucide="' +
        getPaymentMethodIcon(payment.payment_method) +
        '" class="w-4 h-4"></i>' +
        getPaymentMethodName(payment.payment_method) +
        "</span></td>";
      html += '<td class="px-5 py-3">' + statusBadge(payment.status) + "</td>";
      html +=
        '<td class="px-5 py-3 text-sm text-secondary-500">' +
        formatPaymentDate(payment.payment_date) +
        "</td>";
      html += '<td class="px-5 py-3"><div class="flex items-center gap-2">';
      html +=
        '<button data-action="view-detail" data-payment-id="' +
        payment.id +
        '" class="w-7 h-7 inline-flex items-center justify-center rounded-md bg-transparent text-brand-600 hover:bg-brand-100 hover:text-brand-700 border-0 cursor-pointer" title="View"><i data-lucide="eye" class="w-4 h-4"></i></button>';
      if (canRefund && hasAnyRole("admin", "cashier")) {
        html +=
          '<button data-action="refund-payment" data-payment-id="' +
          payment.id +
          '" class="w-7 h-7 inline-flex items-center justify-center rounded-md bg-transparent text-accent-600 hover:text-accent-800 hover:bg-accent-50 border-0 cursor-pointer" title="Refund"><i data-lucide="rotate-ccw" class="w-4 h-4"></i></button>';
      }
      if (canDelete) {
        html +=
          '<button data-action="delete-payment" data-payment-id="' +
          payment.id +
          '" class="w-7 h-7 inline-flex items-center justify-center rounded-md bg-transparent text-error-600 hover:text-error-800 hover:bg-error-50 border-0 cursor-pointer" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>';
      }
      html += "</div></td>";
      html += "</tr>";
    });
  }

  html += "</tbody></table></div></div>";
  html += "</div>";

  el.innerHTML = html;
  setupListEvents(el);
  window.createIcons();
}

async function renderDetail(el, paymentId) {
  const payment = await paymentService.getPaymentById(paymentId);
  if (!payment) {
    renderList(el);
    return;
  }

  const order = getOrderById(payment.order_id);
  const canRefund = payment.status === "completed";
  const canDelete = currentUser && currentUser.role === "admin";

  let html = '<div class="space-y-5">';

  html += '<div class="flex items-center justify-between">';
  html +=
    '<button data-action="back-to-list" class="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 cursor-pointer transition-colors"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back</button>';
  html += '<div class="flex items-center gap-3">';
  html += statusBadge(payment.status);
  html += "</div></div>";

  html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
  html += '<div class="px-5 py-4 border-b border-brand-100 bg-brand-50">';
  html +=
    '<h3 class="text-sm font-bold text-brand-800 uppercase tracking-wider">Payment Details</h3>';
  html += "</div>";
  html += '<div class="p-5">';
  html += '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">';

  html += '<div class="bg-brand-50 border border-brand-200 rounded-lg p-4 text-center">';
  html +=
    '<div class="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">Payment ID</div>';
  html += '<div class="text-lg font-bold text-brand-900">' + payment.id.slice(0, 8) + "</div>";
  html += "</div>";

  html += '<div class="bg-brand-50 border border-brand-200 rounded-lg p-4 text-center">';
  html +=
    '<div class="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">Order ID</div>';
  html +=
    '<div class="text-lg font-bold text-brand-900">#' + payment.order_id.slice(0, 8) + "</div>";
  html += "</div>";

  html += '<div class="bg-brand-50 border border-brand-200 rounded-lg p-4 text-center">';
  html +=
    '<div class="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">Table</div>';
  html +=
    '<div class="text-lg font-bold text-brand-900">' +
    (order ? "Table " + order.table : "—") +
    "</div>";
  html += "</div>";

  html += '<div class="bg-brand-50 border border-brand-200 rounded-lg p-4 text-center">';
  html +=
    '<div class="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">Cashier</div>';
  html += '<div class="text-lg font-bold text-brand-900">—</div>';
  html += "</div>";

  html += '<div class="bg-brand-50 border border-brand-200 rounded-lg p-4 text-center">';
  html +=
    '<div class="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">Amount</div>';
  html += '<div class="text-xl font-bold text-brand-900">$' + payment.amount.toFixed(2) + "</div>";
  html += "</div>";

  html += '<div class="bg-brand-50 border border-brand-200 rounded-lg p-4 text-center">';
  html +=
    '<div class="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">Method</div>';
  html +=
    '<div class="text-sm font-bold text-brand-900 flex items-center justify-center gap-2"><i data-lucide="' +
    getPaymentMethodIcon(payment.payment_method) +
    '" class="w-4 h-4"></i>' +
    getPaymentMethodName(payment.payment_method) +
    "</div>";
  html += "</div>";

  html += '<div class="bg-brand-50 border border-brand-200 rounded-lg p-4 text-center">';
  html +=
    '<div class="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">Reference</div>';
  html += '<div class="text-sm font-semibold text-brand-900">' + "—" + "</div>";
  html += "</div>";

  html += '<div class="bg-brand-50 border border-brand-200 rounded-lg p-4 text-center">';
  html +=
    '<div class="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">Date</div>';
  html +=
    '<div class="text-sm font-semibold text-brand-900">' +
    formatPaymentDate(payment.payment_date) +
    "</div>";
  html += "</div>";

  html += "</div></div></div>";

  if (order) {
    html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
    html += '<div class="px-5 py-4 border-b border-brand-100 bg-brand-50">';
    html +=
      '<h3 class="text-sm font-bold text-brand-800 uppercase tracking-wider">Order Information</h3>';
    html += "</div>";
    html += '<div class="p-5">';
    html += '<div class="overflow-x-auto">';
    html += '<table class="w-full">';
    html += '<thead><tr class="border-b-2 border-brand-100">';
    html +=
      '<th class="px-4 py-3 text-left text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50">Item</th>';
    html +=
      '<th class="px-4 py-3 text-center text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50">Qty</th>';
    html +=
      '<th class="px-4 py-3 text-right text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50">Subtotal</th>';
    html += "</tr></thead>";
    html += "<tbody>";
    order.items.forEach(function (item) {
      html += '<tr class="border-b border-brand-100">';
      html += '<td class="px-4 py-3 font-medium text-brand-900">' + item.name + "</td>";
      html += '<td class="px-4 py-3 text-center">' + item.qty + "</td>";
      html +=
        '<td class="px-4 py-3 text-right font-semibold text-brand-900">$' +
        ((item.price || 0) * item.qty).toFixed(2) +
        "</td>";
      html += "</tr>";
    });
    html += "</tbody>";
    html += "</table></div>";
    html += "</div></div>";
  }

  if (canRefund || canDelete) {
    html +=
      '<div class="bg-brand-50 border border-brand-200 rounded-xl p-4 flex items-center gap-3">';
    if (canRefund && hasAnyRole("admin", "cashier")) {
      html +=
        '<button data-action="refund-payment" data-payment-id="' +
        payment.id +
        '" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-accent-600 hover:bg-accent-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="rotate-ccw" class="w-4 h-4"></i> Refund</button>';
    }
    html += '<div class="flex-1"></div>';
    if (canDelete) {
      html +=
        '<button data-action="delete-payment" data-payment-id="' +
        payment.id +
        '" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-error-600 hover:bg-error-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i> Delete</button>';
    }
    html += "</div>";
  }

  html += "</div>";

  el.innerHTML = html;
  setupDetailEvents(el);
  window.createIcons();
}

function renderConfig(el) {
  let html = '<div class="space-y-5">';

  html += '<div class="flex items-center justify-between">';
  html +=
    '<button data-action="back-to-list" class="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 cursor-pointer transition-colors"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back</button>';
  html += '<h2 class="text-xl font-semibold text-brand-900 font-display">Payment Methods</h2>';
  html += "</div>";

  html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
  html += '<div class="px-5 py-4 border-b border-brand-100 bg-brand-50">';
  html +=
    '<h3 class="text-sm font-bold text-brand-800 uppercase tracking-wider">Available Methods</h3>';
  html += "</div>";
  html += '<div class="divide-y divide-brand-100">';

  PAYMENT_METHODS.forEach(function (method) {
    const isEnabled = enabledMethods[method.id];
    html +=
      '<div class="px-5 py-4 flex items-center justify-between hover:bg-brand-50 transition-colors">';
    html += '<div class="flex items-center gap-3">';
    html +=
      '<div class="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">';
    html += '<i data-lucide="' + method.icon + '" class="w-5 h-5"></i>';
    html += "</div>";
    html += "<div>";
    html += '<div class="text-sm font-semibold text-brand-900">' + method.name + "</div>";
    html +=
      '<div class="text-xs text-secondary-500">' + (isEnabled ? "Enabled" : "Disabled") + "</div>";
    html += "</div></div>";
    html += '<label class="relative inline-flex items-center cursor-pointer">';
    html +=
      '<input type="checkbox" data-method="' +
      method.id +
      '" class="sr-only peer" ' +
      (isEnabled ? "checked" : "") +
      " />";
    html +=
      '<div class="w-11 h-6 bg-secondary-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-brand-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[' +
      "'']" +
      ' after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>';
    html += "</label></div>";
  });

  html += "</div></div>";

  html += "</div>";

  el.innerHTML = html;
  setupConfigEvents(el);
  window.createIcons();
}

function setupListEvents(el) {
  el.addEventListener("click", async function (e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) {
      const filterBtn = e.target.closest("[data-filter]");
      if (filterBtn) {
        activeFilter = filterBtn.dataset.filter;
        renderList(el);
        return;
      }
      return;
    }

    const action = btn.dataset.action;

    if (action === "new-payment") {
      e.stopPropagation();
      const data = await paymentModal.show();
      if (data) {
        const result = await paymentService.createPayment({
          order_id: data.orderId,
          amount: data.amount,
          method: data.method,
        });
        if (result.success) {
          await paymentsStore.refreshPayments();
          await loadOrders();
          renderList(el);
        } else {
          toast.error("Error", result.error || "Error creating payment");
        }
      }
    } else if (action === "config-methods") {
      subView = "config";
      renderConfig(el);
    } else if (action === "view-detail") {
      selectedId = btn.dataset.paymentId;
      subView = "detail";
      await renderDetail(el, selectedId);
    } else if (action === "refund-payment") {
      e.stopPropagation();
      const refundId = btn.dataset.paymentId;
      await paymentService.refundPayment(refundId);
      await paymentsStore.refreshPayments();
      renderList(el);
    } else if (action === "delete-payment") {
      e.stopPropagation();
      const deleteId = btn.dataset.paymentId;
      if (
        await confirmModal.show({
          title: "Delete Payment",
          message: "Are you sure you want to delete this payment?",
        })
      ) {
        await paymentService.deletePayment(deleteId);
        await paymentsStore.refreshPayments();
        renderList(el);
      }
    } else if (action === "clear-search") {
      searchQuery = "";
      dateFilter = "";
      renderList(el);
    } else if (action === "clear-all-filters") {
      activeFilter = "all";
      searchQuery = "";
      dateFilter = "";
      renderList(el);
    }
  });

  const searchInput = el.querySelector("#pay-search");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      searchQuery = e.target.value;
      renderList(el);
    });
  }

  const dateInput = el.querySelector("#pay-date-filter");
  if (dateInput) {
    dateInput.addEventListener("change", function (e) {
      dateFilter = e.target.value;
      renderList(el);
    });
  }
}

function setupDetailEvents(el) {
  el.addEventListener("click", async function (e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === "back-to-list") {
      subView = "list";
      selectedId = null;
      renderList(el);
    } else if (action === "refund-payment") {
      const refundId = btn.dataset.paymentId;
      await paymentService.refundPayment(refundId);
      await paymentsStore.refreshPayments();
      renderList(el);
    } else if (action === "delete-payment") {
      const deleteId = btn.dataset.paymentId;
      if (
        await confirmModal.show({
          title: "Delete Payment",
          message: "Are you sure you want to delete this payment?",
        })
      ) {
        await paymentService.deletePayment(deleteId);
        await paymentsStore.refreshPayments();
        subView = "list";
        selectedId = null;
        renderList(el);
      }
    }
  });
}

function setupConfigEvents(el) {
  el.addEventListener("click", function (e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === "back-to-list") {
      subView = "list";
      renderList(el);
    }
  });

  el.addEventListener("change", function (e) {
    if (e.target.dataset.method) {
      enabledMethods[e.target.dataset.method] = e.target.checked;
    }
  });
}

export async function renderPayments(el) {
  await Promise.all([paymentsStore.loadPayments(), loadOrders()]);

  if (subView === "detail" && selectedId) {
    await renderDetail(el, selectedId);
  } else if (subView === "config") {
    renderConfig(el);
  } else {
    subView = "list";
    renderList(el);
  }
}

const PaymentsView = { render: renderPayments, init: function () {}, destroy: function () {} };

export default withLoading(PaymentsView, Skeletons.paymentsTable());
