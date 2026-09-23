import WelcomeBanner from "../../components/ui/WelcomeBanner.js";
import StatCard from "../../components/ui/StatCard.js";
import SalesChart from "../../components/dashboard/SalesChart.js";
import { allOrders, loadOrders, tables, loadTables } from "../../store/posData.js";
import { loadTodayStats, getState as getReportsState } from "../../store/reports.js";
import { hasAnyRole } from "../../utils/roleContext.js";
import { withLoading, Skeletons } from "../../utils/withLoading.js";

let currentEl = null;

function onDashboardClick(e) {
  const newOrderBtn = e.target.closest('[data-action="new-order"]');
  if (newOrderBtn) {
    window._openOrderTableId = "new";
    window.navigate("/pos");
    return;
  }
  const row = e.target.closest('[data-action="view-order"]');
  if (row) {
    window._openOrderId = row.getAttribute("data-order-id");
    window.navigate("/pos");
  }
}

const Dashboard = {
  render: async function (el) {
    const user = window.userData || { name: "Admin", initials: "MC" };

    await loadTodayStats();
    const stats = getReportsState().todayStats || {
      revenue: 0,
      orders: 0,
      active_tables: 0,
      total_tables: 0,
      reservations: 0,
    };

    await loadTables();
    const tableStatus = {
      available: tables.filter((t) => t.status === "available").length,
      occupied: tables.filter((t) => t.status === "occupied").length,
      reserved: tables.filter((t) => t.status === "reserved").length,
      total: tables.length,
    };

    await loadOrders();

    const recentOrders = allOrders.slice(0, 5);

    const statusMap = {
      draft:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500"><span class="w-1.5 h-1.5 rounded-full bg-neutral-500"></span> Borrador</span>',
      completed:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-success-100 text-success-700"><span class="w-1.5 h-1.5 rounded-full bg-success-500"></span> Completado</span>',
      preparing:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-accent-700"><span class="w-1.5 h-1.5 rounded-full bg-accent-500"></span> En preparación</span>',
      ready:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700"><span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Listo</span>',
      served:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-accent-800"><span class="w-1.5 h-1.5 rounded-full bg-accent-500"></span> Servido</span>',
      new: '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-info-100 text-info-700"><span class="w-1.5 h-1.5 rounded-full bg-info-500"></span> Nuevo</span>',
      pending:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-info-100 text-info-700"><span class="w-1.5 h-1.5 rounded-full bg-info-500"></span> Pendiente</span>',
      in_progress:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-accent-700"><span class="w-1.5 h-1.5 rounded-full bg-accent-500"></span> En curso</span>',
      cancelled:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-error-100 text-error-700"><span class="w-1.5 h-1.5 rounded-full bg-error-500"></span> Cancelado</span>',
    };

    let html = '<div class="space-y-0">';
    html += WelcomeBanner({ user: user, time: "morning" });

    html += '<div class="flex items-center justify-between flex-wrap gap-3 mb-6">';
    html += '<h2 class="text-[22px] font-bold text-brand-900">Resumen general</h2>';
    html += '<div class="flex gap-3 flex-wrap">';
    if (hasAnyRole("admin", "waiter")) {
      html +=
        '<button data-action="new-order" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border bg-primary-600 hover:bg-primary-700 text-white border-primary-600 cursor-pointer transition-colors shrink-0"><i data-lucide="plus" class="w-4 h-4"></i> Nuevo Pedido</button>';
    }
    html += "</div>";
    html += "</div>";

    html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">';
    if (hasAnyRole("admin", "cashier")) {
      html += StatCard({
        label: "Ingresos Totales",
        value:
          "$" +
          (stats.revenue || 0).toLocaleString("es-ES", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        change: "today",
        icon: "dollar-sign",
        iconBg: "bg-brand-100 text-brand-700",
      });
    }
    if (hasAnyRole("admin", "waiter", "cashier")) {
      html += StatCard({
        label: "Pedidos de Hoy",
        value: String(stats.orders || 0),
        change: "today",
        icon: "shopping-bag",
        iconBg: "bg-primary-100 text-primary-700",
      });
    }
    if (hasAnyRole("admin", "waiter")) {
      html += StatCard({
        label: "Mesas Activas",
        value: (stats.active_tables || 0) + " / " + (stats.total_tables || 0),
        change:
          stats.total_tables > 0
            ? Math.round((stats.active_tables / stats.total_tables) * 100) + "% de ocupación"
            : "N/D",
        icon: "users",
        iconBg: "bg-accent-100 text-accent-700",
        changeNeutral: true,
      });
      html += StatCard({
        label: "Reservaciones",
        value: String(stats.reservations || 0),
        change: "today",
        icon: "calendar-check",
        iconBg: "bg-success-100 text-success-700",
      });
    }
    html += "</div>";

    html += '<div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">';
    if (hasAnyRole("admin", "cashier")) {
      html += '<div class="bg-white border border-brand-300 rounded-xl shadow-sm p-5">';
      html += '<div class="flex items-center justify-between flex-wrap gap-3 mb-4">';
      html += '<h3 class="text-base font-semibold text-primary-700 font-display">Ventas de la semana</h3>';
      html += SalesChart.renderLegend();
      html += "</div>";
      html += '<div class="relative h-[200px]"><canvas id="salesChart"></canvas></div>';
      html += "</div>";
    }

    if (hasAnyRole("admin", "waiter")) {
      html += '<div class="bg-white border border-brand-300 rounded-xl shadow-sm p-5">';
      html +=
        '<h3 class="text-base font-semibold text-primary-700 font-display mb-4">Estado de las mesas</h3>';
      html += '<div class="flex flex-col gap-4">';
      html +=
        '<div class="flex items-center justify-between gap-3"><div class="flex items-center gap-3"><span class="w-2.5 h-2.5 rounded-full bg-success-500"></span><span class="text-sm">Disponible</span></div><span class="text-sm font-semibold">' +
        (tableStatus.available || 0) +
        " mesas</span></div>";
      html +=
        '<div class="flex items-center justify-between gap-3"><div class="flex items-center gap-3"><span class="w-2.5 h-2.5 rounded-full bg-error-500"></span><span class="text-sm">Ocupada</span></div><span class="text-sm font-semibold">' +
        (tableStatus.occupied || 0) +
        " mesas</span></div>";
      html +=
        '<div class="flex items-center justify-between gap-3"><div class="flex items-center gap-3"><span class="w-2.5 h-2.5 rounded-full bg-accent-500"></span><span class="text-sm">Reservada</span></div><span class="text-sm font-semibold">' +
        (tableStatus.reserved || 0) +
        " mesas</span></div>";
      const total = tableStatus.total || 1;
      const occPct = Math.round((tableStatus.occupied / total) * 100);
      const resPct = Math.round((tableStatus.reserved / total) * 100);
      const avPct = 100 - occPct - resPct;
      html +=
        '<div class="mt-2"><div class="h-2 rounded-full overflow-hidden flex bg-neutral-100"><div class="bg-error-500" style="width:' +
        occPct +
        '%"></div><div class="bg-accent-500" style="width:' +
        resPct +
        '%"></div><div class="bg-success-500" style="width:' +
        avPct +
        '%"></div></div></div>';
      html += "</div>";
      html += "</div>";
    }
    html += "</div>";
    html += "</div>";

    html += '<div class="bg-white border border-brand-300 rounded-xl shadow-sm overflow-hidden p-0">';
    html += '<div class="flex items-center justify-between flex-wrap gap-3 px-5 pt-5 pb-4">';
    html += '<h3 class="text-base font-semibold text-primary-700 font-display">Pedidos Recientes</h3>';
    html +=
      '<a href="#/pos" class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-100 text-brand-700 cursor-pointer">Ver todos</a>';
    html += "</div>";

    html += '<div class="hidden md:block">';
    html += '<table class="w-full">';
    html += '<thead><tr class="border-b-2 border-brand-100">';
    const recentCols = ["Pedido", "Mesa", "Mesero", "Artículos", "Total", "Estado", "Hora"];
    recentCols.forEach(function (c) {
      html +=
        '<th class="px-5 py-3 text-left text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50">' +
        c +
        "</th>";
    });
    html += "</tr></thead>";
    html += "<tbody>";

    if (recentOrders.length === 0) {
      html += '<tr><td colspan="7" class="px-5 py-12 text-center">';
      html += '<div class="flex flex-col items-center justify-center">';
      html += '<i data-lucide="shopping-bag" class="w-12 h-12 text-brand-300 mb-3"></i>';
      html += '<p class="text-sm text-secondary-500">No hay pedidos todavía</p>';
      html +=
        '<p class="text-sm text-secondary-400 mt-1">Crea tu primer pedido desde el POS.</p>';
      html += "</div></td></tr>";
    } else {
      recentOrders.forEach(function (o, i) {
        const zebra = i % 2 === 0 ? "bg-white" : "bg-brand-50/50";
        html +=
          '<tr class="' +
          zebra +
          ' border-b border-brand-100 hover:bg-brand-50 transition-colors cursor-pointer" data-action="view-order" data-order-id="' +
          (o.fullId || o.id) +
          '">';
        html +=
          '<td class="px-5 py-3 font-semibold text-primary-700">' + o.id + "</td>";
        html += '<td class="px-5 py-3">Mesa ' + (o.tableNumber || "—") + "</td>";
        html += '<td class="px-5 py-3">' + (o.server || "—") + "</td>";
        html +=
          '<td class="px-5 py-3">' + o.items.length + (o.items.length === 1 ? " artículo" : " artículos") + "</td>";
        html +=
          '<td class="px-5 py-3 font-semibold text-brand-900">$' + o.total.toFixed(2) + "</td>";
        html += '<td class="px-5 py-3">' + (statusMap[o.status] || "") + "</td>";
        html += '<td class="px-5 py-3 text-neutral-500">' + o.time + "</td>";
        html += "</tr>";
      });
    }
    html += "</tbody></table>";
    html += "</div>";

    html += '<div class="md:hidden p-4 space-y-3">';
    if (recentOrders.length === 0) {
      html += '<div class="flex flex-col items-center justify-center py-10 text-center">';
      html += '<i data-lucide="shopping-bag" class="w-10 h-10 text-brand-300 mb-3"></i>';
      html += '<p class="text-sm text-secondary-500">No hay pedidos todavía</p>';
      html += '<p class="text-xs text-secondary-400 mt-1">Crea tu primer pedido desde el POS.</p>';
      html += "</div>";
    } else {
      recentOrders.forEach(function (o) {
        html +=
          '<div class="bg-white border border-brand-300 rounded-xl p-4 shadow-sm space-y-3 cursor-pointer" data-action="view-order" data-order-id="' +
          (o.fullId || o.id) +
          '">';
        html += '<div class="flex items-center justify-between gap-2">';
        html += '<span class="font-semibold text-primary-700 text-sm min-w-0 truncate">' + o.id + "</span>";
        html += '<span class="shrink-0">' + (statusMap[o.status] || "") + "</span>";
        html += "</div>";
        html += '<div class="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">';
        html +=
          '<div class="min-w-0"><span class="block text-[11px] font-bold uppercase tracking-wider text-secondary-500">Mesa</span><span class="font-semibold text-brand-900">Mesa ' +
          (o.tableNumber || "—") +
          "</span></div>";
        html +=
          '<div class="min-w-0"><span class="block text-[11px] font-bold uppercase tracking-wider text-secondary-500">Mesero</span><span class="text-brand-900 truncate block">' +
          (o.server || "—") +
          "</span></div>";
        html +=
          '<div class="min-w-0"><span class="block text-[11px] font-bold uppercase tracking-wider text-secondary-500">Artículos</span><span class="font-semibold text-brand-900">' +
          o.items.length +
          (o.items.length === 1 ? " artículo" : " artículos") +
          "</span></div>";
        html +=
          '<div class="min-w-0"><span class="block text-[11px] font-bold uppercase tracking-wider text-secondary-500">Total</span><span class="font-semibold text-brand-900 tabular-nums">$' +
          o.total.toFixed(2) +
          "</span></div>";
        html += "</div>";
        html += '<div class="border-t border-brand-100 pt-3">';
        html += '<span class="text-xs text-secondary-500">' + o.time + "</span>";
        html += "</div>";
        html += "</div>";
      });
    }
    html += "</div>";
    html += "</div>";
    html += "</div>";

    el.innerHTML = html;
    window.createIcons && window.createIcons();

    currentEl = el;
    el.addEventListener("click", onDashboardClick);
  },

  init: function () {
    SalesChart.init();
  },

  destroy: function () {
    if (currentEl) currentEl.removeEventListener("click", onDashboardClick);
    currentEl = null;
    SalesChart.destroy();
  },
};

export default withLoading(Dashboard, Skeletons.dashboard());
