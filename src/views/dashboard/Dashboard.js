import WelcomeBanner from "../../components/ui/WelcomeBanner.js";
import StatCard from "../../components/ui/StatCard.js";
import SalesChart from "../../components/dashboard/SalesChart.js";
import { allOrders, loadOrders } from "../../store/posData.js";
import { apiGet } from "../../services/api.js";
import { hasAnyRole } from "../../utils/roleContext.js";
import { withLoading, Skeletons } from "../../utils/withLoading.js";

const Dashboard = {
  render: async function (el) {
    const user = window.userData || { name: "Admin", initials: "MC" };

    let stats = { revenue: 0, orders: 0, active_tables: 0, total_tables: 0, reservations: 0 };
    let tableStatus = { available: 0, occupied: 0, reserved: 0, total: 0 };

    try {
      stats = await apiGet("/api/v1/reports/today-stats");
    } catch {
      /* silent */
    }

    try {
      tableStatus = await apiGet("/api/v1/tables/status");
    } catch {
      /* silent */
    }

    await loadOrders();

    const recentOrders = allOrders.slice(0, 5);

    const statusMap = {
      draft:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500"><span class="w-1.5 h-1.5 rounded-full bg-neutral-500"></span> Draft</span>',
      completed:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-success-100 text-success-700"><span class="w-1.5 h-1.5 rounded-full bg-success-500"></span> Completed</span>',
      preparing:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-accent-700"><span class="w-1.5 h-1.5 rounded-full bg-accent-500"></span> Preparing</span>',
      ready:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700"><span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Ready</span>',
      served:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-accent-800"><span class="w-1.5 h-1.5 rounded-full bg-accent-500"></span> Served</span>',
      new: '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-info-100 text-info-700"><span class="w-1.5 h-1.5 rounded-full bg-info-500"></span> New</span>',
      pending:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-info-100 text-info-700"><span class="w-1.5 h-1.5 rounded-full bg-info-500"></span> Pending</span>',
      in_progress:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-accent-700"><span class="w-1.5 h-1.5 rounded-full bg-accent-500"></span> In Progress</span>',
      cancelled:
        '<span class="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-error-100 text-error-700"><span class="w-1.5 h-1.5 rounded-full bg-error-500"></span> Cancelled</span>',
    };

    let html = '<div class="space-y-0">';
    html += WelcomeBanner({ user: user, time: "morning" });

    html += '<div class="flex items-center justify-between mb-6">';
    html += '<h2 class="text-[22px] font-bold text-brand-900">Overview</h2>';
    html += '<div class="flex gap-3">';
    if (hasAnyRole("admin", "waiter")) {
      html +=
        '<button data-action="new-order" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border bg-primary-600 hover:bg-primary-700 text-white border-primary-600 cursor-pointer transition-colors"><i data-lucide="plus" class="w-4 h-4"></i> New Order</button>';
    }
    html += "</div>";
    html += "</div>";

    html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">';
    if (hasAnyRole("admin", "cashier")) {
      html += StatCard({
        label: "Total Revenue",
        value:
          "$" +
          (stats.revenue || 0).toLocaleString(undefined, {
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
        label: "Orders Today",
        value: String(stats.orders || 0),
        change: "today",
        icon: "shopping-bag",
        iconBg: "bg-primary-100 text-primary-700",
      });
    }
    if (hasAnyRole("admin", "waiter")) {
      html += StatCard({
        label: "Active Tables",
        value: (stats.active_tables || 0) + " / " + (stats.total_tables || 0),
        change:
          stats.total_tables > 0
            ? Math.round((stats.active_tables / stats.total_tables) * 100) + "% occupancy"
            : "N/A",
        icon: "users",
        iconBg: "bg-accent-100 text-accent-700",
        changeNeutral: true,
      });
      html += StatCard({
        label: "Reservations",
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
      html += '<div class="flex items-center justify-between mb-4">';
      html += '<h3 class="text-base font-semibold text-primary-700 font-display">Weekly Sales</h3>';
      html += SalesChart.renderLegend();
      html += "</div>";
      html += '<div class="relative h-[200px]"><canvas id="salesChart"></canvas></div>';
      html += "</div>";
    }

    if (hasAnyRole("admin", "waiter")) {
      html += '<div class="bg-white border border-brand-300 rounded-xl shadow-sm p-5">';
      html +=
        '<h3 class="text-base font-semibold text-primary-700 font-display mb-4">Table Status</h3>';
      html += '<div class="flex flex-col gap-4">';
      html +=
        '<div class="flex items-center justify-between"><div class="flex items-center gap-3"><span class="w-2.5 h-2.5 rounded-full bg-success-500"></span><span class="text-sm">Available</span></div><span class="text-sm font-semibold">' +
        (tableStatus.available || 0) +
        " tables</span></div>";
      html +=
        '<div class="flex items-center justify-between"><div class="flex items-center gap-3"><span class="w-2.5 h-2.5 rounded-full bg-error-500"></span><span class="text-sm">Occupied</span></div><span class="text-sm font-semibold">' +
        (tableStatus.occupied || 0) +
        " tables</span></div>";
      html +=
        '<div class="flex items-center justify-between"><div class="flex items-center gap-3"><span class="w-2.5 h-2.5 rounded-full bg-accent-500"></span><span class="text-sm">Reserved</span></div><span class="text-sm font-semibold">' +
        (tableStatus.reserved || 0) +
        " tables</span></div>";
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

    html += '<div class="bg-white border border-brand-300 rounded-xl shadow-sm p-0">';
    html += '<div class="flex items-center justify-between px-5 pt-5 pb-4">';
    html += '<h3 class="text-base font-semibold text-primary-700 font-display">Recent Orders</h3>';
    html +=
      '<a href="#/pos" class="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-100 text-brand-700 cursor-pointer">View All</a>';
    html += "</div>";
    html += '<div class="overflow-x-auto">';
    html += '<table class="w-full text-sm text-left">';
    html +=
      '<thead><tr class="text-xs font-bold text-brand-700 uppercase tracking-wide border-b-2 border-brand-300 bg-brand-50">';
    html +=
      '<th class="px-4 py-3">Order</th><th class="px-4 py-3">Table</th><th class="px-4 py-3">Server</th><th class="px-4 py-3">Items</th><th class="px-4 py-3">Total</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Time</th>';
    html += "</tr></thead>";
    html += "<tbody>";
    recentOrders.forEach(function (o, i) {
      const zebra = i % 2 === 0 ? "bg-white" : "bg-brand-50/50";
      html += '<tr class="' + zebra + ' cursor-pointer border-b border-brand-100">';
      html += '<td class="px-4 py-3 font-semibold text-brand-800">#' + o.id + "</td>";
      html += '<td class="px-4 py-3">Table ' + (o.table ? o.table.slice(0, 8) : "") + "</td>";
      html += '<td class="px-4 py-3">' + (o.server || "") + "</td>";
      html += '<td class="px-4 py-3">' + o.items.length + " items</td>";
      html += '<td class="px-4 py-3 font-semibold text-brand-800">$' + o.total.toFixed(2) + "</td>";
      html += '<td class="px-4 py-3">' + (statusMap[o.status] || "") + "</td>";
      html += '<td class="px-4 py-3 text-neutral-500">' + o.time + "</td>";
      html += "</tr>";
    });
    html += "</tbody></table>";
    html += "</div></div>";
    html += "</div>";

    el.innerHTML = html;
    window.createIcons && window.createIcons();

    const newOrderBtn = el.querySelector('[data-action="new-order"]');
    if (newOrderBtn) {
      newOrderBtn.addEventListener("click", function () {
        window._openOrderTableId = "new";
        window.navigate("/pos");
      });
    }
  },

  init: function () {
    SalesChart.init();
  },

  destroy: function () {
    SalesChart.destroy();
  },
};

export default withLoading(Dashboard, Skeletons.dashboard());
