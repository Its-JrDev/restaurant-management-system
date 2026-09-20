import { getDailySales } from "../../services/reportService.js";
import { isDark } from "../../utils/theme.js";

let chartInstance = null;

function chartTokens() {
  const cs = getComputedStyle(document.documentElement);
  const v = function (name) {
    return cs.getPropertyValue(name).trim();
  };
  return {
    thisWeek: v("--color-brand-500") || "#E57722",
    lastWeek: v("--color-brand-300") || "#F2BA7A",
    axisTick: v("--color-secondary-500") || "#958877",
    tooltipBg: v("--color-neutral-900") || "#1E1B16",
    tooltipTitle: v("--color-brand-50") || "#FEFAF5",
    tooltipBody: v("--color-neutral-100") || "#E8E3DA",
    tooltipBorder: v("--color-brand-300") || "#3D352A",
    grid: isDark() ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  };
}

function onThemeChange() {
  SalesChart.destroy();
  SalesChart.init();
}

const SalesChart = {
  renderLegend: function () {
    let html = '<div class="flex gap-2 mb-4">';
    html +=
      '<span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-100 text-brand-700"><span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span> This Week</span>';
    html +=
      '<span class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500">Last Week</span>';
    html += "</div>";
    return html;
  },

  init: async function () {
    const canvas = document.getElementById("salesChart");
    if (!canvas || !window.Chart) return;

    const now = new Date();
    const thisWeekStart = new Date();
    thisWeekStart.setDate(now.getDate() - 6);
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekEnd = new Date(thisWeekStart);
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
    lastWeekEnd.setHours(23, 59, 59, 999);
    const lastWeekStart = new Date(lastWeekEnd);
    lastWeekStart.setDate(lastWeekStart.getDate() - 6);
    lastWeekStart.setHours(0, 0, 0, 0);

    let thisWeekData = [];
    let lastWeekData = [];

    try {
      thisWeekData = await getDailySales(thisWeekStart.toISOString(), now.toISOString());
    } catch {
      /* silent */
    }

    try {
      lastWeekData = await getDailySales(lastWeekStart.toISOString(), lastWeekEnd.toISOString());
    } catch {
      /* silent */
    }

    const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const thisWeekRevenue = thisWeekData.map((d) => d.revenue || 0);
    const lastWeekRevenue = lastWeekData.map((d) => d.revenue || 0);

    while (thisWeekRevenue.length < 7) thisWeekRevenue.push(0);
    while (lastWeekRevenue.length < 7) lastWeekRevenue.push(0);

    const tokens = chartTokens();

    const ctx = canvas.getContext("2d");
    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "This Week",
            data: thisWeekRevenue.slice(0, 7),
            backgroundColor: tokens.thisWeek,
            borderRadius: 6,
            barPercentage: 0.6,
          },
          {
            label: "Last Week",
            data: lastWeekRevenue.slice(0, 7),
            backgroundColor: tokens.lastWeek,
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
            backgroundColor: tokens.tooltipBg,
            titleColor: tokens.tooltipTitle,
            bodyColor: tokens.tooltipBody,
            borderColor: tokens.tooltipBorder,
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function (ctx) {
                return ctx.dataset.label + ": $" + ctx.parsed.y.toLocaleString();
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: tokens.axisTick, font: { size: 12, weight: 500 } },
            border: { display: false },
          },
          y: {
            grid: { color: tokens.grid, drawBorder: false },
            ticks: {
              color: tokens.axisTick,
              font: { size: 11 },
              callback: function (v) {
                return "$" + (v / 1000).toFixed(0) + "k";
              },
            },
            border: { display: false },
          },
        },
      },
    });

    window.addEventListener("themechange", onThemeChange);
  },

  destroy: function () {
    window.removeEventListener("themechange", onThemeChange);
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  },
};

export default SalesChart;
