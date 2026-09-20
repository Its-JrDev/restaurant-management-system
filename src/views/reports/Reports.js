import { getSalesReport, getTopProducts, getDailySales } from "../../services/reportService.js";
import { exportToCSV } from "../../utils/csvExport.js";
import { withLoading, Skeletons } from "../../utils/withLoading.js";
import { isDark } from "../../utils/theme.js";

function chartColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = function (name) {
    return cs.getPropertyValue(name).trim();
  };
  return {
    revenue: v("--color-brand-500") || "#e57722",
    orders: v("--color-brand-300") || "#f2ba7a",
    axisTick: v("--color-secondary-500") || "#958877",
    tooltipBg: v("--color-neutral-900") || "#1e1b16",
    tooltipTitle: v("--color-brand-50") || "#fefaf5",
    tooltipBody: v("--color-neutral-100") || "#e8e3da",
    tooltipBorder: v("--color-brand-300") || "#3d352a",
    grid: isDark() ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  };
}

let startDate = "";
let endDate = "";
let chartInstance = null;
let eventsAttached = false;

function getDefaultDates() {
  const now = new Date();
  const end = now.toISOString().split("T")[0];
  const start = new Date(now);
  start.setDate(start.getDate() - 6);
  return { start: start.toISOString().split("T")[0], end: end };
}

function renderBarChart(data) {
  const canvas = document.getElementById("reportsChart");
  if (!canvas || !window.Chart) return;

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  const colors = chartColors();

  const ctx = canvas.getContext("2d");
  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map(function (d) {
        return d.label;
      }),
      datasets: [
        {
          label: "Revenue",
          data: data.map(function (d) {
            return d.revenue;
          }),
          backgroundColor: colors.revenue,
          borderRadius: 6,
          barPercentage: 0.6,
        },
        {
          label: "Orders",
          data: data.map(function (d) {
            return d.orders * 50;
          }),
          backgroundColor: colors.orders,
          borderRadius: 6,
          barPercentage: 0.6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: colors.tooltipBg,
          titleColor: colors.tooltipTitle,
          bodyColor: colors.tooltipBody,
          borderColor: colors.tooltipBorder,
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: function (ctx) {
              if (ctx.datasetIndex === 0) {
                return (
                  "Revenue: $" +
                  ctx.parsed.y.toLocaleString(undefined, { minimumFractionDigits: 2 })
                );
              }
              return "Orders: " + Math.round(ctx.parsed.y / 50);
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: colors.axisTick, font: { size: 12, weight: 500 } },
          border: { display: false },
        },
        y: {
          grid: { color: colors.grid, drawBorder: false },
          ticks: {
            color: colors.axisTick,
            font: { size: 11 },
            callback: function (v) {
              return "$" + (v / 1000).toFixed(1) + "k";
            },
          },
          border: { display: false },
        },
      },
    },
  });
}

function setupEvents(el) {
  if (eventsAttached) return;
  eventsAttached = true;

  el.addEventListener("click", async function (e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");

    if (action === "generate-report") {
      const s = (document.getElementById("report-start") || {}).value;
      const en = (document.getElementById("report-end") || {}).value;
      if (s) startDate = s;
      if (en) endDate = en;
      await render(el);
    }

    if (action === "export-sales-csv") {
      let sales = { total_revenue: 0, total_orders: 0 };
      try {
        sales = await getSalesReport(startDate, endDate);
      } catch {
        /* silent */
      }
      const totalRev = parseFloat(sales.total_revenue) || 0;
      const avgOrder = sales.total_orders > 0 ? totalRev / sales.total_orders : 0;
      const salesData = [
        {
          "Start Date": startDate,
          "End Date": endDate,
          "Total Revenue": totalRev,
          "Total Orders": sales.total_orders,
          "Avg Order Value": avgOrder,
        },
      ];
      exportToCSV(salesData, "sales-report-" + startDate + "-" + endDate, [
        { key: "Start Date", label: "Start Date" },
        { key: "End Date", label: "End Date" },
        { key: "Total Revenue", label: "Total Revenue" },
        { key: "Total Orders", label: "Total Orders" },
        { key: "Avg Order Value", label: "Avg Order Value" },
      ]);
    }

    if (action === "export-products-csv") {
      let topProducts = [];
      try {
        topProducts = await getTopProducts(startDate, endDate, 5);
      } catch {
        /* silent */
      }
      let totalRevForProducts = 0;
      try {
        const sForP = await getSalesReport(startDate, endDate);
        totalRevForProducts = parseFloat(sForP.total_revenue) || 0;
      } catch {
        /* silent */
      }
      const productsData = topProducts.map(function (p, i) {
        return {
          Rank: i + 1,
          Product: p.menu_item_name,
          Quantity: p.total_quantity,
          Revenue: p.total_revenue,
          "Percent of Total":
            totalRevForProducts > 0
              ? ((p.total_revenue / totalRevForProducts) * 100).toFixed(1) + "%"
              : "0%",
        };
      });
      exportToCSV(productsData, "top-products-" + startDate + "-" + endDate, [
        { key: "Rank", label: "Rank" },
        { key: "Product", label: "Product" },
        { key: "Quantity", label: "Quantity Sold" },
        { key: "Revenue", label: "Revenue" },
        { key: "Percent of Total", label: "% of Total" },
      ]);
    }
  });
}

async function render(el) {
  const defaults = getDefaultDates();
  if (!startDate) startDate = defaults.start;
  if (!endDate) endDate = defaults.end;

  let sales = { total_revenue: 0, total_orders: 0 };
  let topProducts = [];
  let dailySales = [];

  try {
    sales = await getSalesReport(startDate, endDate);
  } catch {
    /* silent */
  }
  try {
    topProducts = await getTopProducts(startDate, endDate, 5);
  } catch {
    /* silent */
  }
  try {
    dailySales = await getDailySales(startDate, endDate);
  } catch {
    /* silent */
  }

  const totalRev = parseFloat(sales.total_revenue) || 0;
  const avgOrder = sales.total_orders > 0 ? totalRev / sales.total_orders : 0;

  let html = '<div class="space-y-5">';

  html += '<div class="flex items-center justify-between">';
  html += '<div><h2 class="text-xl font-semibold text-brand-900 font-display">Reports</h2>';
  html += '<p class="text-sm text-secondary-500 mt-0.5">Sales analytics and performance</p></div>';
  html += '<div class="flex gap-2">';
  html +=
    '<button data-action="export-sales-csv" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-brand-700 border-brand-300 cursor-pointer hover:bg-brand-50 transition-colors"><i data-lucide="download" class="w-4 h-4"></i> Export Sales CSV</button>';
  html +=
    '<button data-action="export-products-csv" class="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-brand-700 border-brand-300 cursor-pointer hover:bg-brand-50 transition-colors"><i data-lucide="download" class="w-4 h-4"></i> Export Products CSV</button>';
  html += "</div>";
  html += "</div>";

  html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
  html += '<div class="px-5 py-4 border-b border-brand-100 bg-brand-50">';
  html += '<h3 class="text-sm font-bold text-brand-800 uppercase tracking-wider">Date Range</h3>';
  html += "</div>";
  html += '<div class="px-5 py-4 flex items-end gap-4">';
  html +=
    '<label class="flex flex-col gap-1 text-xs font-semibold text-secondary-600">Start Date<input type="date" id="report-start" value="' +
    startDate +
    '" class="border border-brand-200 rounded-lg px-3 py-2 text-sm text-neutral-700 bg-white cursor-pointer outline-none focus:border-brand-500 focus:shadow-[var(--ring-brand)] transition-all" /></label>';
  html +=
    '<label class="flex flex-col gap-1 text-xs font-semibold text-secondary-600">End Date<input type="date" id="report-end" value="' +
    endDate +
    '" class="border border-brand-200 rounded-lg px-3 py-2 text-sm text-neutral-700 bg-white cursor-pointer outline-none focus:border-brand-500 focus:shadow-[var(--ring-brand)] transition-all" /></label>';
  html +=
    '<button data-action="generate-report" class="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="bar-chart-3" class="w-4 h-4"></i> Generate</button>';
  html += "</div></div>";

  html += '<div class="grid grid-cols-1 md:grid-cols-3 gap-5">';
  html += renderStatCard(
    "Total Revenue",
    "$" +
      totalRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "dollar-sign",
    "bg-brand-100 text-brand-700"
  );
  html += renderStatCard(
    "Total Orders",
    String(sales.total_orders),
    "shopping-bag",
    "bg-primary-100 text-primary-700"
  );
  html += renderStatCard(
    "Avg. Order Value",
    "$" +
      avgOrder.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    "receipt",
    "bg-success-100 text-success-700"
  );
  html += "</div>";

  html += '<div class="bg-white border border-brand-300 rounded-xl shadow-sm p-5">';
  html += '<div class="flex items-center justify-between mb-4">';
  html += '<h3 class="text-base font-semibold text-primary-700 font-display">Daily Revenue</h3>';
  html += '<div class="flex gap-2">';
  html +=
    '<span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-100 text-brand-700"><span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span> Revenue</span>';
  html +=
    '<span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500"><span class="w-1.5 h-1.5 rounded-full bg-[#F2BA7A]"></span> Orders (scaled)</span>';
  html += "</div></div>";
  html += '<div class="relative h-[240px]"><canvas id="reportsChart"></canvas></div>';
  html += "</div>";

  html += '<div class="bg-white border border-brand-300 rounded-xl shadow-sm p-0">';
  html += '<div class="px-5 pt-5 pb-4">';
  html += '<h3 class="text-base font-semibold text-primary-700 font-display">Top Products</h3>';
  html += "</div>";

  if (topProducts.length === 0) {
    html +=
      '<div class="px-5 py-8 text-center text-sm text-secondary-400">No product data available for this period</div>';
  } else {
    html += '<div class="overflow-x-auto">';
    html += '<table class="w-full text-sm text-left">';
    html +=
      '<thead><tr class="text-xs font-bold text-brand-700 uppercase tracking-wide border-b-2 border-brand-300 bg-brand-50">';
    html +=
      '<th class="px-5 py-3">Rank</th><th class="px-5 py-3">Product</th><th class="px-5 py-3 text-center">Quantity Sold</th><th class="px-5 py-3 text-right">Revenue</th><th class="px-5 py-3 text-right">% of Total</th>';
    html += "</tr></thead>";
    html += "<tbody>";
    topProducts.forEach(function (p, i) {
      const zebra = i % 2 === 0 ? "bg-white" : "bg-brand-50/50";
      const pct = totalRev > 0 ? ((p.total_revenue / totalRev) * 100).toFixed(1) : "0";
      html += '<tr class="' + zebra + ' border-b border-brand-100">';
      html +=
        '<td class="px-5 py-3.5"><span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">' +
        (i + 1) +
        "</span></td>";
      html += '<td class="px-5 py-3.5 font-semibold text-brand-800">' + p.menu_item_name + "</td>";
      html += '<td class="px-5 py-3.5 text-center text-neutral-600">' + p.total_quantity + "</td>";
      html +=
        '<td class="px-5 py-3.5 text-right font-semibold text-brand-800">$' +
        p.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2 }) +
        "</td>";
      html += '<td class="px-5 py-3.5 text-right text-secondary-500">' + pct + "%</td>";
      html += "</tr>";
    });
    html += "</tbody></table></div>";
  }

  html += "</div>";
  html += "</div>";

  el.innerHTML = html;
  window.createIcons && window.createIcons();

  renderBarChart(dailySales);

  setupEvents(el);
}

function renderStatCard(label, value, icon, iconBg) {
  return (
    '<div class="bg-white border border-brand-300 rounded-xl shadow-sm p-5"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ' +
    iconBg +
    '"><i data-lucide="' +
    icon +
    '" class="w-5 h-5"></i></div><div><p class="text-[11px] font-bold text-secondary-500 uppercase tracking-wider">' +
    label +
    '</p><p class="text-xl font-bold text-brand-900">' +
    value +
    "</p></div></div></div>"
  );
}

const ReportsView = {
  render: render,
  init: function () {
    this._onThemeChange = function () {
      eventsAttached = false;
      const el = document.querySelector("#current-view .space-y-5");
      if (el) render(el.parentElement || document.getElementById("current-view"));
    };
    window.addEventListener("themechange", this._onThemeChange);
  },
  destroy: function () {
    if (this._onThemeChange) {
      window.removeEventListener("themechange", this._onThemeChange);
      this._onThemeChange = null;
    }
    eventsAttached = false;
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  },
};

export default withLoading(ReportsView, Skeletons.reports());
