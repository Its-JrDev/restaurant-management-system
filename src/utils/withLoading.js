import Skeleton from "../components/ui/Skeleton.js";

/**
 * withLoading — wraps a view with a skeleton loading state.
 * Shows skeleton immediately, then swaps to real content as soon as the
 * view's render() resolves (sync or async). No artificial delay.
 * Also defers init() until after render completes.
 *
 * Usage:
 *   export default withLoading(DashboardView, Skeletons.dashboard());
 */
function withLoading(view, skeletonHtml) {
  const originalRender = view.render;
  const originalInit = view.init;
  const originalDestroy = view.destroy;

  return {
    render: function (el) {
      el.innerHTML = skeletonHtml;
      const result = originalRender.call(view, el);
      const done = function () {
        if (typeof window.createIcons === "function") {
          window.createIcons();
        }
        if (originalInit) {
          originalInit.call(view);
        }
      };
      if (result && typeof result.then === "function") {
        result.then(done);
      } else {
        done();
      }
    },
    init: function () {
      // init is handled inside render after content is ready
    },
    destroy: function () {
      if (originalDestroy) {
        originalDestroy.call(view);
      }
    },
  };
}

function _pill(w) {
  return Skeleton({ variant: "rect", width: w || "70px", height: 30, class: "rounded-full" });
}

function _searchBar() {
  return (
    '<div class="flex items-center gap-2 border border-brand-200 rounded-lg px-3 py-2 bg-white">' +
    Skeleton({ variant: "circle", size: 16, class: "text-brand-400 shrink-0" }) +
    Skeleton({ variant: "text", width: "60%" }) +
    "</div>"
  );
}

function _badge(w) {
  return Skeleton({ variant: "rect", width: w || "72px", height: 20, class: "rounded-full" });
}

function _btn(w) {
  return Skeleton({ variant: "rect", width: w || "100px", height: 36, class: "rounded-lg" });
}

function _inputField(labelW) {
  return (
    '<div class="flex flex-col gap-1">' +
    Skeleton({ variant: "text", width: labelW || "40%" }) +
    Skeleton({ variant: "rect", width: "100%", height: 40, class: "rounded-md" }) +
    "</div>"
  );
}

/* â”€â”€ Tier 2 â€” Mid-level composites â”€â”€ */

/**
 * _pageHeader â€” Back button + title + optional right-side elements.
 * opts: { backWidth?, titleWidth, badge?, rightButtons?, noBetween? }
 */
function _pageHeader(opts) {
  opts = opts || {};
  const backW = opts.backWidth === null ? null : opts.backWidth || "80px";
  const titleW = opts.titleWidth || "120px";
  const html = [];
  html.push(
    '<div class="flex items-center' + (opts.noBetween ? " gap-3" : " justify-between") + '">'
  );
  html.push('<div class="flex items-center gap-3">');
  if (backW) html.push(_btn(backW));
  html.push(Skeleton({ variant: "text", width: titleW }));
  html.push("</div>");
  if (opts.badge || (opts.rightButtons && opts.rightButtons.length)) {
    html.push('<div class="flex items-center gap-2">');
    if (opts.badge) html.push(_badge("80px"));
    if (opts.rightButtons) {
      opts.rightButtons.forEach(function (w) {
        html.push(_btn(w));
      });
    }
    html.push("</div>");
  }
  html.push("</div>");
  return html.join("");
}

/**
 * _sectionCard â€” White card with brand-50 header bar + content area.
 * titleW: skeleton width for the title, or an HTML string to use as-is.
 * body: HTML string for the content area inside <div class="p-5">.
 * opts: { shadow?, headerRight?, bodyClass? }
 */
function _sectionCard(titleW, body, opts) {
  opts = opts || {};
  const shadowClass = opts.shadow ? " shadow-[0_2px_6px_rgba(114,49,23,0.08)]" : "";
  let headerContent = "";
  if (typeof titleW === "string" && titleW.charAt(0) === "<") {
    headerContent = titleW;
  } else {
    headerContent = Skeleton({ variant: "text", width: titleW || "100px" });
  }
  let html =
    '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden' + shadowClass + '">';
  html += '<div class="px-5 py-4 border-b border-brand-100 bg-brand-50">';
  if (opts.headerRight) {
    html += '<div class="flex items-center justify-between">';
    html += headerContent;
    html += '<div class="flex items-center gap-2">' + opts.headerRight + "</div>";
    html += "</div>";
  } else {
    html += headerContent;
  }
  html += "</div>";
  html += '<div class="p-5' + (opts.bodyClass ? " " + opts.bodyClass : "") + '">' + body + "</div>";
  html += "</div>";
  return html;
}

/**
 * _infoCardGrid â€” Grid of centered stat/info cards.
 * items: array of { valueW, subW?, labelW? }
 * cols: grid class (default "grid-cols-2 md:grid-cols-4")
 */
function _infoCardGrid(items, cols) {
  cols = cols || "grid-cols-2 md:grid-cols-4";
  let html = '<div class="grid ' + cols + ' gap-4">';
  items.forEach(function (item) {
    html += '<div class="bg-white border border-brand-200 rounded-lg p-4 text-center">';
    if (item.labelW) {
      html +=
        '<div class="text-[11px] font-bold uppercase text-secondary-500 mb-1">' +
        Skeleton({ variant: "text", width: item.labelW }) +
        "</div>";
    }
    html += Skeleton({ variant: "text", width: item.valueW || "60px" });
    if (item.subW) {
      html += Skeleton({ variant: "text", width: item.subW });
    }
    html += "</div>";
  });
  html += "</div>";
  return html;
}

/**
 * _dataTable â€” Table skeleton with thead + zebra tbody.
 * opts: { columns: [{ width, type }], rows?, zebra?, padding? }
 *   type: "text" | "badge" | "actions" | "progress" | "circle-text"
 */
function _dataTable(opts) {
  opts = opts || {};
  const columns = opts.columns || [];
  const rowCount = opts.rows || 5;
  const padding = opts.padding || "px-5 py-3";
  let html = '<div class="overflow-x-auto"><table class="w-full">';
  html +=
    '<thead><tr class="text-xs font-bold text-brand-700 uppercase tracking-wide border-b-2 border-brand-200 bg-brand-50">';
  columns.forEach(function () {
    html +=
      '<th class="' +
      padding +
      ' text-left">' +
      Skeleton({ variant: "text", width: "60%" }) +
      "</th>";
  });
  html += "</tr></thead><tbody>";
  for (let r = 0; r < rowCount; r++) {
    const zebra = opts.zebra !== false && r % 2 !== 0 ? " bg-brand-50/50" : "";
    html += '<tr class="border-b border-brand-100' + zebra + '">';
    columns.forEach(function (col) {
      const t = col.type || "text";
      if (t === "badge") {
        html += '<td class="' + padding + '">' + _badge(col.width || "70px") + "</td>";
      } else if (t === "actions") {
        html += '<td class="' + padding + '"><div class="flex gap-1">';
        for (let a = 0; a < (col.count || 1); a++) {
          html += Skeleton({ variant: "rect", width: 28, height: 28, class: "rounded-md" });
        }
        html += "</div></td>";
      } else if (t === "progress") {
        html +=
          '<td class="' +
          padding +
          '"><div class="flex items-center gap-2">' +
          Skeleton({
            variant: "rect",
            width: col.width || "80px",
            height: 8,
            class: "rounded-full",
          }) +
          Skeleton({ variant: "text", width: "30px" }) +
          "</div></td>";
      } else if (t === "circle-text") {
        html +=
          '<td class="' +
          padding +
          '"><div class="flex items-center gap-2">' +
          Skeleton({ variant: "circle", size: 16 }) +
          Skeleton({ variant: "text", width: col.width || "50px" }) +
          "</div></td>";
      } else {
        html +=
          '<td class="' +
          padding +
          '">' +
          Skeleton({ variant: "text", width: col.width || "60%" }) +
          "</td>";
      }
    });
    html += "</tr>";
  }
  html += "</tbody></table></div>";
  return html;
}

/**
 * _actionBar â€” Button row with optional left/right split and footer style.
 * opts: { left?: [widths], right?: [widths], footer? }
 */
function _actionBar(opts) {
  opts = opts || {};
  const left = opts.left || [];
  const right = opts.right || [];
  const allBtns = left.concat(right);
  if (allBtns.length === 0) return "";
  let html = "";
  if (opts.footer) {
    html +=
      '<div class="flex items-center gap-3 p-5 bg-brand-50 border-t border-brand-200 rounded-b-xl">';
  } else {
    html += '<div class="flex items-center gap-3">';
  }
  left.forEach(function (w) {
    html.push && (html += _btn(w));
  });
  if (left.length && right.length) html += '<div class="flex-1"></div>';
  right.forEach(function (w) {
    html += _btn(w);
  });
  html += "</div>";
  return html;
}

/**
 * _tabRow â€” Row of pill-shaped tab buttons.
 * widths: array of string widths for each pill.
 */
function _tabRow(widths) {
  let html = '<div class="flex flex-wrap gap-2">';
  (widths || []).forEach(function (w) {
    html += _pill(w);
  });
  html += "</div>";
  return html;
}

/**
 * _keyValueRow â€” Single key-value row with fixed-width label.
 * labelW: width for the label skeleton.
 * valueW: width for the value skeleton.
 */
function _keyValueRow(labelW, valueW) {
  return (
    '<div class="flex items-center gap-3 text-sm">' +
    '<span class="font-semibold text-secondary-500 w-28">' +
    Skeleton({ variant: "text", width: labelW || "55px" }) +
    "</span>" +
    '<span class="text-brand-700">' +
    Skeleton({ variant: "text", width: valueW || "100px" }) +
    "</span></div>"
  );
}

const Skeletons = {
  dashboard() {
    let html = '<div class="space-y-0">';
    html += Skeleton({ variant: "rect", width: "100%", height: 80, class: "rounded-xl mb-6" });
    html += _pageHeader({ backWidth: null, titleWidth: "120px", rightButtons: ["100px", "110px"] });
    html +=
      '<div class="mb-6">' +
      _infoCardGrid(
        [
          { valueW: "60%", subW: "40%" },
          { valueW: "60%", subW: "40%" },
          { valueW: "60%", subW: "40%" },
          { valueW: "60%", subW: "40%" },
        ],
        "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
      ) +
      "</div>";
    html += '<div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">';
    let chartBody = '<div class="flex items-center justify-between mb-4">';
    chartBody += Skeleton({ variant: "text", width: "100px" });
    chartBody += '<div class="flex gap-2">' + _badge("60px") + _badge("60px") + "</div>";
    chartBody += "</div>";
    chartBody += Skeleton({ variant: "rect", width: "100%", height: 200, class: "rounded" });
    html += _sectionCard("100px", chartBody);
    let statusBody = '<div class="flex flex-col gap-4">';
    for (let i = 0; i < 3; i++) {
      statusBody += '<div class="flex items-center justify-between">';
      statusBody +=
        '<div class="flex items-center gap-3">' +
        Skeleton({ variant: "circle", size: 10 }) +
        Skeleton({ variant: "text", width: "70px" }) +
        "</div>";
      statusBody += Skeleton({ variant: "text", width: "50px" });
      statusBody += "</div>";
    }
    statusBody += Skeleton({
      variant: "rect",
      width: "100%",
      height: 8,
      class: "rounded-full mt-2",
    });
    statusBody += "</div>";
    html += _sectionCard("90px", statusBody);
    html += "</div>";
    // Recent Orders (a medida, igual que la vista real).
    html +=
      '<div class="bg-white border border-brand-300 rounded-xl shadow-sm overflow-hidden p-0">';
    html += '<div class="flex items-center justify-between px-5 pt-5 pb-4">';
    html += Skeleton({ variant: "text", width: "110px" });
    html += _badge("70px");
    html += "</div>";
    let ordersTable =
      '<div class="overflow-x-auto"><table class="w-full table-fixed text-sm text-left">';
    ordersTable +=
      '<thead><tr class="text-xs font-bold text-brand-700 uppercase tracking-wide border-b-2 border-brand-300 bg-brand-50">';
    ["14%", "14%", "18%", "14%", "14%", "16%", "10%"].forEach(function (w) {
      ordersTable +=
        '<th class="px-4 py-3" style="width:' +
        w +
        '">' +
        Skeleton({ variant: "text", width: "100%" }) +
        "</th>";
    });
    ordersTable += "</tr></thead><tbody>";
    for (let r = 0; r < 5; r++) {
      const zebra = r % 2 !== 0 ? " bg-brand-50/50" : "";
      ordersTable += '<tr class="' + zebra + ' cursor-pointer border-b border-brand-100">';
      // Order
      ordersTable +=
        '<td class="px-4 py-3 font-semibold text-brand-800">' +
        Skeleton({ variant: "text", width: "100%" }) +
        "</td>";
      // Table
      ordersTable +=
        '<td class="px-4 py-3">' + Skeleton({ variant: "text", width: "100%" }) + "</td>";
      // Server
      ordersTable +=
        '<td class="px-4 py-3">' + Skeleton({ variant: "text", width: "100%" }) + "</td>";
      // Items
      ordersTable +=
        '<td class="px-4 py-3">' + Skeleton({ variant: "text", width: "100%" }) + "</td>";
      // Total
      ordersTable +=
        '<td class="px-4 py-3 font-semibold text-brand-800">' +
        Skeleton({ variant: "text", width: "100%" }) +
        "</td>";
      // Status badge
      ordersTable += '<td class="px-4 py-3">' + _badge("70px") + "</td>";
      // Time
      ordersTable +=
        '<td class="px-4 py-3 text-brand-600">' +
        Skeleton({ variant: "text", width: "100%" }) +
        "</td>";
      ordersTable += "</tr>";
    }
    ordersTable += "</tbody></table></div>";
    html += ordersTable + "</div>";
    html += "</div>";
    return html;
  },

  menuCards(count) {
    count = count || 8;
    let html = '<div class="space-y-5">';
    // Header: título + subtítulo a la izquierda; Add Product a la derecha.
    html += '<div class="flex items-center justify-between">';
    html += '<div><div class="h-7 rounded bg-brand-200 animate-pulse" style="width:120px"></div>';
    html +=
      '<div class="mt-1 h-4 rounded bg-brand-200 animate-pulse" style="width:90px"></div></div>';
    html += Skeleton({
      variant: "rect",
      width: "120px",
      height: 38,
      class: "rounded-lg bg-brand-200",
    });
    html += "</div>";
    // Fila de filtros: search + 2 selects + clear filters (igual que la real).
    html += '<div class="flex flex-wrap gap-3 items-center">';
    html +=
      '<div class="flex items-center gap-2 border border-brand-200 rounded-lg px-3 py-2 bg-white">';
    html += Skeleton({ variant: "circle", size: 16, class: "text-brand-400 shrink-0" });
    html += Skeleton({ variant: "text", width: "60%" });
    html += "</div>";
    html += Skeleton({ variant: "rect", width: "150px", height: 38, class: "rounded-lg" });
    html += Skeleton({ variant: "rect", width: "130px", height: 38, class: "rounded-lg" });
    html += Skeleton({ variant: "text", width: "90px" });
    html += "</div>";
    // Grid de cards.
    html += '<div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">';
    for (let i = 0; i < count; i++) {
      html +=
        '<div class="bg-white border border-brand-300 rounded-xl p-4 flex flex-col items-center text-center space-y-3">' +
        Skeleton({ variant: "rect", width: "80px", height: 80, class: "rounded-lg" }) +
        Skeleton({ variant: "text", width: "60%" }) +
        Skeleton({ variant: "text", width: "35%" }) +
        Skeleton({ variant: "text", width: "45%" }) +
        _badge("72px") +
        '<div class="flex gap-2 w-full">' +
        Skeleton({ variant: "rect", width: "100%", height: 32, class: "rounded-md" }) +
        Skeleton({ variant: "rect", width: "100%", height: 32, class: "rounded-md" }) +
        "</div></div>";
    }
    html += "</div></div>";
    return html;
  },

  inventoryTable() {
    let html = '<div class="space-y-5">';
    // Header: título + subtítulo a la izquierda; badge low stock + Add Item a la derecha.
    html += '<div class="flex items-center justify-between">';
    html += '<div><div class="h-7 rounded bg-brand-200 animate-pulse" style="width:120px"></div>';
    html +=
      '<div class="mt-1 h-4 rounded bg-brand-200 animate-pulse" style="width:80px"></div></div>';
    html += '<div class="flex gap-2">';
    html += Skeleton({ variant: "rect", width: "110px", height: 32, class: "rounded-lg" });
    html += Skeleton({
      variant: "rect",
      width: "100px",
      height: 38,
      class: "rounded-lg bg-brand-200",
    });
    html += "</div></div>";
    // Tabs con contadores (All / In Stock / Low Stock / Inactive).
    html += '<div class="flex flex-wrap gap-2">';
    ["60px", "70px", "80px", "70px"].forEach(function (w) {
      html +=
        '<div class="flex items-center gap-1.5 px-4 py-2 rounded-full border border-brand-300 bg-white">' +
        Skeleton({ variant: "text", width: w }) +
        '<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-200 animate-pulse"></span></div>';
    });
    html += "</div>";
    // Card con search en header (px-5 py-3 border-b border-brand-100), igual que la real.
    html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
    html += '<div class="px-5 py-3 border-b border-brand-100">';
    html +=
      '<div class="flex items-center gap-2 border border-brand-200 rounded-lg px-3 py-2 bg-white">';
    html += Skeleton({ variant: "circle", size: 16, class: "text-brand-400 shrink-0" });
    html += Skeleton({ variant: "text", width: "60%" });
    html += "</div></div>";
    // Tabla directa.
    let table = '<div class="overflow-x-auto"><table class="w-full">';
    table += '<thead><tr class="border-b-2 border-brand-100">';
    ["Item", "Unit", "Stock Level", "Min Stock", "Status", "Updated", "Actions"].forEach(
      function () {
        table +=
          '<th class="px-5 py-3 text-left text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50">' +
          Skeleton({ variant: "text", width: "70%" }) +
          "</th>";
      }
    );
    table += "</tr></thead><tbody>";
    for (let r = 0; r < 6; r++) {
      const zebra = r % 2 !== 0 ? " bg-brand-50/50" : "";
      table +=
        '<tr class="border-b border-brand-100 hover:bg-brand-50 transition-colors' + zebra + '">';
      // Item
      table +=
        '<td class="px-5 py-3.5"><div class="h-4 rounded bg-brand-200 animate-pulse" style="width:70%"></div></td>';
      // Unit
      table +=
        '<td class="px-5 py-3.5 text-sm text-brand-600">' +
        Skeleton({ variant: "text", width: "40px" }) +
        "</td>";
      // Stock Level: barra fina h-2 + número a la derecha (min-w-[160px]).
      table +=
        '<td class="px-5 py-3.5 min-w-[160px]"><div class="flex items-center gap-2">' +
        '<div class="flex-1 h-2 rounded-full bg-brand-100 overflow-hidden">' +
        '<div class="bg-brand-300 h-full rounded-full animate-pulse" style="width:100%"></div></div>' +
        '<span class="h-3 rounded bg-brand-200 animate-pulse min-w-[40px] text-right" style="width:40px"></span></div></td>';
      // Min Stock (centrado, "N kg")
      table +=
        '<td class="px-5 py-3.5 text-sm text-brand-600 text-center">' +
        Skeleton({ variant: "text", width: "48px" }) +
        "</td>";
      // Status badge
      table += '<td class="px-5 py-3.5">' + _badge("72px") + "</td>";
      // Updated
      table +=
        '<td class="px-5 py-3.5 text-sm text-secondary-500">' +
        Skeleton({ variant: "text", width: "90px" }) +
        "</td>";
      // Actions: 2 iconos w-7 h-7 en gap-2.
      table +=
        '<td class="px-5 py-3.5"><div class="flex items-center gap-2">' +
        Skeleton({ variant: "rect", width: 28, height: 28, class: "rounded-md" }) +
        Skeleton({ variant: "rect", width: 28, height: 28, class: "rounded-md" }) +
        "</div></td>";
      table += "</tr>";
    }
    table += "</tbody></table></div>";
    html += table + "</div></div>";
    return html;
  },

  ordersTable() {
    let html = '<div class="space-y-5">';
    // Header: título a la izquierda; New Order a la derecha.
    html += '<div class="flex items-center justify-between mb-6">';
    html += '<div class="h-7 rounded bg-brand-200 animate-pulse" style="width:80px"></div>';
    html += Skeleton({
      variant: "rect",
      width: "110px",
      height: 40,
      class: "rounded-md bg-brand-200",
    });
    html += "</div>";
    // 3 tabs simples (All / Active / Closed) sin contadores.
    html += '<div class="flex gap-2 mb-5">';
    ["50px", "60px", "55px"].forEach(function (w) {
      html +=
        '<div class="px-4 py-1.5 rounded-full border border-brand-200 bg-white">' +
        Skeleton({ variant: "text", width: w }) +
        "</div>";
    });
    html += "</div>";
    // Tabla directa (8 columnas).
    html +=
      '<div class="bg-white border border-brand-300 rounded-xl shadow-sm overflow-hidden"><div class="overflow-x-auto"><table class="w-full table-fixed text-sm text-left">';
    html +=
      '<thead><tr class="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 border-b-2 border-brand-300">';
    ["12%", "12%", "16%", "12%", "12%", "14%", "12%", "10%"].forEach(function (w) {
      html +=
        '<th class="px-4 py-3" style="width:' +
        w +
        '">' +
        Skeleton({ variant: "text", width: "100%" }) +
        "</th>";
    });
    html += "</tr></thead><tbody>";
    for (let r = 0; r < 6; r++) {
      const zebra = r % 2 !== 0 ? " bg-brand-50/50" : "";
      html +=
        '<tr class="' + zebra + ' border-b border-brand-100 hover:bg-brand-50 transition-colors">';
      // Order
      html +=
        '<td class="px-4 py-3 font-semibold text-brand-700">' +
        Skeleton({ variant: "text", width: "100%" }) +
        "</td>";
      // Table
      html += '<td class="px-4 py-3">' + Skeleton({ variant: "text", width: "100%" }) + "</td>";
      // Server
      html += '<td class="px-4 py-3">' + Skeleton({ variant: "text", width: "100%" }) + "</td>";
      // Items
      html += '<td class="px-4 py-3">' + Skeleton({ variant: "text", width: "100%" }) + "</td>";
      // Total
      html +=
        '<td class="px-4 py-3 font-semibold text-brand-700">' +
        Skeleton({ variant: "text", width: "100%" }) +
        "</td>";
      // Status badge
      html += '<td class="px-4 py-3">' + _badge("60px") + "</td>";
      // Time
      html +=
        '<td class="px-4 py-3 text-brand-600">' +
        Skeleton({ variant: "text", width: "100%" }) +
        "</td>";
      // Actions: 1-2 iconos w-7 h-7 en gap-2.
      html +=
        '<td class="px-4 py-3"><div class="flex items-center gap-2">' +
        Skeleton({ variant: "rect", width: 28, height: 28, class: "rounded-md" }) +
        Skeleton({ variant: "rect", width: 28, height: 28, class: "rounded-md" }) +
        "</div></td>";
      html += "</tr>";
    }
    html += "</tbody></table></div></div>";
    html += "</div>";
    return html;
  },

  paymentsTable() {
    let html = '<div class="space-y-5">';
    // Header: título + subtítulo a la izquierda; New Payment + Methods a la derecha.
    html += '<div class="flex items-center justify-between">';
    html += '<div><div class="h-7 rounded bg-brand-200 animate-pulse" style="width:100px"></div>';
    html +=
      '<div class="mt-1 h-4 rounded bg-brand-200 animate-pulse" style="width:90px"></div></div>';
    html += '<div class="flex gap-2">';
    html += Skeleton({
      variant: "rect",
      width: "120px",
      height: 38,
      class: "rounded-lg bg-brand-200",
    });
    html += Skeleton({ variant: "rect", width: "110px", height: 38, class: "rounded-lg" });
    html += "</div></div>";
    // Tabs con contadores (All / Pending / Completed / Refunded / Failed).
    html += '<div class="flex flex-wrap gap-2">';
    ["50px", "70px", "75px", "75px", "55px"].forEach(function (w) {
      html +=
        '<div class="flex items-center gap-1.5 px-4 py-2 rounded-full border border-brand-300 bg-white">' +
        Skeleton({ variant: "text", width: w }) +
        '<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-200 animate-pulse"></span></div>';
    });
    html += "</div>";
    // Card con search + date dentro (igual que la real).
    html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
    html += '<div class="px-5 py-3 border-b border-brand-100">';
    html += '<div class="flex items-center gap-3">';
    html +=
      '<div class="flex items-center gap-2 flex-1 border border-brand-200 rounded-lg px-3 py-2 bg-white">';
    html += Skeleton({ variant: "circle", size: 16, class: "text-brand-400 shrink-0" });
    html += Skeleton({ variant: "text", width: "60%" });
    html += "</div>";
    html += Skeleton({ variant: "rect", width: "160px", height: 38, class: "rounded-lg" });
    html += "</div></div>";
    // Tabla directa (9 columnas).
    let table = '<div class="overflow-x-auto"><table class="w-full table-fixed">';
    table += '<thead><tr class="border-b-2 border-brand-100">';
    ["12%", "12%", "12%", "14%", "12%", "12%", "12%", "12%", "12%"].forEach(function (w) {
      table +=
        '<th class="px-5 py-3 text-left text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50" style="width:' +
        w +
        '">' +
        Skeleton({ variant: "text", width: "100%" }) +
        "</th>";
    });
    table += "</tr></thead><tbody>";
    for (let r = 0; r < 6; r++) {
      const zebra = r % 2 !== 0 ? " bg-brand-50/50" : "";
      table +=
        '<tr class="border-b border-brand-100 hover:bg-brand-50 transition-colors' + zebra + '">';
      // Payment ID
      table +=
        '<td class="px-5 py-3 font-semibold text-brand-700">' +
        Skeleton({ variant: "text", width: "70%" }) +
        "</td>";
      // Order
      table += '<td class="px-5 py-3">' + Skeleton({ variant: "text", width: "45%" }) + "</td>";
      // Table
      table += '<td class="px-5 py-3">' + Skeleton({ variant: "text", width: "40%" }) + "</td>";
      // Cashier
      table += '<td class="px-5 py-3">' + Skeleton({ variant: "text", width: "45%" }) + "</td>";
      // Amount
      table +=
        '<td class="px-5 py-3 font-semibold text-brand-700">' +
        Skeleton({ variant: "text", width: "45%" }) +
        "</td>";
      // Method (icono + texto)
      table +=
        '<td class="px-5 py-3"><div class="flex items-center gap-2">' +
        Skeleton({ variant: "circle", size: 16 }) +
        Skeleton({ variant: "text", width: "50px" }) +
        "</div></td>";
      // Status badge
      table += '<td class="px-5 py-3">' + _badge("65px") + "</td>";
      // Date
      table +=
        '<td class="px-5 py-3 text-sm text-secondary-500">' +
        Skeleton({ variant: "text", width: "55%" }) +
        "</td>";
      // Actions: 1-2 iconos w-7 h-7 en gap-2.
      table +=
        '<td class="px-5 py-3"><div class="flex items-center gap-2">' +
        Skeleton({ variant: "rect", width: 28, height: 28, class: "rounded-md" }) +
        Skeleton({ variant: "rect", width: 28, height: 28, class: "rounded-md" }) +
        "</div></td>";
      table += "</tr>";
    }
    table += "</tbody></table></div>";
    html += table + "</div></div>";
    return html;
  },

  reservationsTable() {
    let html = '<div class="space-y-5">';
    html += _pageHeader({ backWidth: null, titleWidth: "130px", rightButtons: ["140px"] });
    html += _tabRow(["60px", "70px", "85px", "80px", "80px"]);
    html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
    let searchHeader = '<div class="px-5 py-3 border-b border-brand-100">';
    searchHeader += '<div class="flex items-center gap-3">';
    searchHeader += '<div class="flex-1">' + _searchBar() + "</div>";
    searchHeader += Skeleton({ variant: "rect", width: "140px", height: 36, class: "rounded-lg" });
    searchHeader += "</div></div>";
    html += searchHeader;
    let table = '<div class="overflow-x-auto"><table class="w-full">';
    table +=
      '<thead><tr class="text-xs font-bold text-brand-700 uppercase tracking-wide border-b-2 border-brand-100 bg-brand-50">';
    ["Code", "Guest", "Date", "Time", "Party", "Table", "Status", "Actions"].forEach(function () {
      table +=
        '<th class="px-5 py-3 text-left">' + Skeleton({ variant: "text", width: "60%" }) + "</th>";
    });
    table += "</tr></thead><tbody>";
    for (let r = 0; r < 6; r++) {
      table += '<tr class="border-b border-brand-100 hover:bg-brand-50/50">';
      ["45%", "70%", "50%", "35%", "30px", "30px", "65px", "50px"].forEach(function (w, i) {
        if (i === 7) {
          table += '<td class="px-5 py-3">' + _btn("50px") + "</td>";
        } else if (i === 6) {
          table += '<td class="px-5 py-3">' + _badge("70px") + "</td>";
        } else if (i === 1) {
          table +=
            '<td class="px-5 py-3"><div>' +
            Skeleton({ variant: "text", width: "70%" }) +
            '<div class="mt-1">' +
            Skeleton({ variant: "text", width: "50%" }) +
            "</div></div></td>";
        } else {
          table += '<td class="px-5 py-3">' + Skeleton({ variant: "text", width: w }) + "</td>";
        }
      });
      table += "</tr>";
    }
    table += "</tbody></table></div>";
    html += table + "</div>";
    html += "</div>";
    return html;
  },

  reports() {
    let html = '<div class="space-y-5 max-w-2xl" style="max-width:100%">';
    html += '<div class="flex items-center justify-between">';
    html += '<div><div class="h-7 rounded bg-brand-200 animate-pulse" style="width:100px"></div>';
    html +=
      '<div class="mt-1 h-4 rounded bg-brand-200 animate-pulse" style="width:180px"></div></div>';
    html += "</div>";
    let dateFields = '<div class="flex items-end gap-4">';
    dateFields += _inputField("60px") + _inputField("60px") + _btn("100px");
    dateFields += "</div>";
    html += _sectionCard("80px", dateFields);
    html += _infoCardGrid(
      [{ valueW: "60%" }, { valueW: "60%" }, { valueW: "60%" }],
      "grid-cols-1 md:grid-cols-3"
    );
    let chartBody = '<div class="flex items-center justify-between mb-4">';
    chartBody += Skeleton({ variant: "text", width: "100px" });
    chartBody += '<div class="flex gap-2">' + _badge("65px") + _badge("90px") + "</div>";
    chartBody += "</div>";
    chartBody += Skeleton({ variant: "rect", width: "100%", height: 240, class: "rounded" });
    html += _sectionCard("100px", chartBody, { shadow: true });
    const productsTable = _dataTable({
      columns: [
        { width: "28px" },
        { width: "60%" },
        { width: "50%" },
        { width: "45%" },
        { width: "40%" },
      ],
      rows: 5,
    });
    html += '<div class="bg-white border border-brand-300 rounded-xl shadow-sm p-0">';
    html +=
      '<div class="px-5 pt-5 pb-4">' + Skeleton({ variant: "text", width: "90px" }) + "</div>";
    html += productsTable + "</div>";
    html += "</div>";
    return html;
  },

  tables() {
    let html = '<div class="space-y-6">';
    html += _pageHeader({ backWidth: null, titleWidth: "160px", rightButtons: ["130px"] });
    html += _tabRow(["50px", "80px", "70px", "65px"]);
    html += '<div class="flex gap-3 text-xs">';
    html +=
      '<div class="flex items-center gap-1">' +
      Skeleton({ variant: "circle", size: 8 }) +
      Skeleton({ variant: "text", width: "60px" }) +
      "</div>";
    html +=
      '<div class="flex items-center gap-1">' +
      Skeleton({ variant: "circle", size: 8 }) +
      Skeleton({ variant: "text", width: "60px" }) +
      "</div>";
    html +=
      '<div class="flex items-center gap-1">' +
      Skeleton({ variant: "circle", size: 8 }) +
      Skeleton({ variant: "text", width: "60px" }) +
      "</div>";
    html += "</div>";
    html += '<div class="bg-white border border-brand-200 rounded-xl overflow-hidden">';
    html +=
      '<div class="px-5 py-4 bg-brand-50 border-b border-brand-200 flex items-center justify-between">';
    html +=
      '<div class="flex items-center gap-3">' +
      Skeleton({ variant: "circle", size: 20 }) +
      Skeleton({ variant: "text", width: "100px" }) +
      _badge("20px") +
      "</div>";
    html += Skeleton({ variant: "circle", size: 16 });
    html += "</div>";
    html +=
      '<div class="p-5"><div class="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-5">';
    const cardBorders = [
      "border-brand-200 bg-brand-50",
      "border-brand-300 bg-brand-50",
      "border-brand-200 bg-brand-50",
      "border-brand-200 bg-brand-50",
      "border-brand-300 bg-brand-50",
      "border-brand-200 bg-brand-50",
    ];
    for (let i = 0; i < 6; i++) {
      html +=
        '<div class="aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 ' +
        cardBorders[i] +
        '">';
      html += Skeleton({ variant: "text", width: "30px" });
      html += Skeleton({ variant: "text", width: "50px" });
      html += Skeleton({ variant: "text", width: "40px" });
      html += "</div>";
    }
    html += "</div></div></div></div>";
    return html;
  },

  kitchen() {
    let html = '<div class="flex flex-col h-full">';
    // Title row
    html += '<div class="flex items-center justify-between mb-5">';
    html += Skeleton({ variant: "text", width: "150px" });
    html +=
      '<div class="flex items-center gap-2">' +
      Skeleton({ variant: "circle", size: 8 }) +
      Skeleton({ variant: "text", width: "100px" }) +
      "</div>";
    html += "</div>";
    // 3-col kanban
    html += '<div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 min-h-0">';
    const colColors = ["bg-brand-50", "bg-brand-50", "bg-brand-50"];
    for (let col = 0; col < 3; col++) {
      html += '<div class="flex flex-col rounded-xl overflow-hidden ' + colColors[col] + '">';
      // Column header
      html += '<div class="px-4 py-3 flex items-center justify-between">';
      html += Skeleton({ variant: "text", width: "90px" });
      html += _badge("20px");
      html += "</div>";
      // Cards
      html += '<div class="flex-1 px-3 pb-3 flex flex-col gap-3">';
      for (let card = 0; card < 3; card++) {
        html += '<div class="bg-white border border-brand-300 rounded-lg p-4 shadow-sm space-y-3">';
        html +=
          '<div class="flex justify-between">' +
          Skeleton({ variant: "text", width: "50px" }) +
          Skeleton({ variant: "text", width: "40px" }) +
          "</div>";
        html += Skeleton({ variant: "text", lines: 2, width: "80%" });
        html +=
          '<div class="flex gap-2">' +
          Skeleton({ variant: "rect", width: "48%", height: 32, class: "rounded-md" }) +
          Skeleton({ variant: "rect", width: "48%", height: 32, class: "rounded-md" }) +
          "</div>";
        html += "</div>";
      }
      html += "</div></div>";
    }
    html += "</div></div>";
    return html;
  },

  settings() {
    let html = '<div class="space-y-5 max-w-2xl">';
    html += '<div class="flex items-center justify-between">';
    html += '<div><div class="h-7 rounded bg-brand-200 animate-pulse" style="width:80px"></div>';
    html +=
      '<div class="mt-1 h-4 rounded bg-brand-200 animate-pulse" style="width:200px"></div></div>';
    html += "</div>";
    let fields1 = '<div class="space-y-4">';
    fields1 += _inputField("100px") + _inputField("60px");
    fields1 +=
      '<div class="grid grid-cols-2 gap-4">' + _inputField("40px") + _inputField("35px") + "</div>";
    fields1 += "</div>";
    html += _sectionCard("130px", fields1);
    let fields2 = '<div class="grid grid-cols-3 gap-4">';
    fields2 += _inputField("60px") + _inputField("100px") + _inputField("90px");
    fields2 += "</div>";
    html += _sectionCard("100px", fields2);
    html += _actionBar({ left: ["130px", "140px"] });
    html += "</div>";
    return html;
  },

  /* â”€â”€ Sub-view skeletons â”€â”€ */

  menuDetail() {
    let html = '<div class="space-y-5">';
    html += _pageHeader({ titleWidth: "160px" });
    html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden p-6">';
    html += '<div class="flex flex-col items-center space-y-4">';
    html += Skeleton({ variant: "rect", width: "128px", height: 128, class: "rounded-lg" });
    html += Skeleton({ variant: "text", width: "200px" });
    html += _badge("100px");
    html += Skeleton({ variant: "text", width: "250px" });
    html += Skeleton({ variant: "text", width: "120px" });
    html += '<div class="grid grid-cols-2 gap-4 w-full">';
    html += '<div class="bg-brand-50 rounded-lg p-3">' + _keyValueRow("60px", "80px") + "</div>";
    html += '<div class="bg-brand-50 rounded-lg p-3">' + _keyValueRow("60px", "80px") + "</div>";
    html += "</div></div></div>";
    html += _actionBar({ left: ["80px", "100px"], right: ["80px"] });
    html += "</div>";
    return html;
  },

  menuForm() {
    let html = '<div class="space-y-5">';
    html += _pageHeader({ titleWidth: "140px" });
    let fields = '<div class="space-y-4 max-w-md">';
    fields +=
      _inputField("60px") +
      _inputField("80px") +
      _inputField("100px") +
      _inputField("50px") +
      _inputField("80px");
    fields +=
      '<div class="flex items-center gap-2">' +
      Skeleton({ variant: "rect", width: 18, height: 18, class: "rounded" }) +
      Skeleton({ variant: "text", width: "80px" }) +
      "</div>";
    fields += "</div>";
    html += _sectionCard("150px", fields);
    html += _actionBar({ left: ["120px", "80px"] });
    html += "</div>";
    return html;
  },

  inventoryDetail() {
    let html = '<div class="space-y-5">';
    html += _pageHeader({ titleWidth: "180px" });
    html += _infoCardGrid(
      [
        { valueW: "50px", subW: "60px" },
        { valueW: "50px", subW: "60px" },
        { valueW: "50px", subW: "60px" },
        { valueW: "50px", subW: "60px" },
      ],
      "grid-cols-2 md:grid-cols-4"
    );
    let stockBody = "";
    stockBody +=
      '<div class="flex justify-between">' +
      Skeleton({ variant: "text", width: "120px" }) +
      Skeleton({ variant: "text", width: "60px" }) +
      "</div>";
    stockBody += Skeleton({ variant: "rect", width: "100%", height: 16, class: "rounded-full" });
    stockBody +=
      '<div class="flex justify-between">' +
      Skeleton({ variant: "text", width: "40px" }) +
      Skeleton({ variant: "text", width: "80px" }) +
      Skeleton({ variant: "text", width: "50px" }) +
      "</div>";
    html += _sectionCard("100px", stockBody);
    html += _actionBar({ left: ["100px", "110px"], right: ["70px", "80px"] });
    const logTable = _dataTable({
      columns: [
        { width: "50px", type: "badge" },
        { width: "40px" },
        { width: "100px" },
        { width: "80px" },
      ],
      rows: 3,
    });
    html += _sectionCard("160px", logTable);
    html += "</div>";
    return html;
  },

  inventoryForm() {
    let html = '<div class="space-y-5">';
    html += _pageHeader({ titleWidth: "120px" });
    let fields = '<div class="space-y-4 max-w-md">';
    fields += _inputField("50px") + _inputField("50px");
    fields +=
      '<div class="grid grid-cols-2 gap-4">' + _inputField("70px") + _inputField("80px") + "</div>";
    fields +=
      '<div class="flex items-center gap-2">' +
      Skeleton({ variant: "rect", width: 18, height: 18, class: "rounded" }) +
      Skeleton({ variant: "text", width: "60px" }) +
      "</div>";
    fields += "</div>";
    html += _sectionCard("130px", fields);
    html += _actionBar({ left: ["120px", "80px"] });
    html += "</div>";
    return html;
  },

  orderDetail() {
    let html = '<div class="space-y-5">';
    html += _pageHeader({ titleWidth: "120px" });
    html += _infoCardGrid(
      [
        { valueW: "50px", subW: "70px" },
        { valueW: "50px", subW: "70px" },
        { valueW: "50px", subW: "70px" },
        { valueW: "50px", subW: "70px" },
        { valueW: "50px", subW: "70px" },
        { valueW: "50px", subW: "70px" },
      ],
      "grid-cols-3"
    );
    // Progress stepper
    html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
    html += '<div class="flex items-center gap-1 px-5 py-4 bg-white border-b border-brand-100">';
    for (let s = 0; s < 5; s++) {
      html +=
        '<div class="flex items-center gap-1">' +
        Skeleton({ variant: "circle", size: 28 }) +
        Skeleton({ variant: "text", width: "40px" }) +
        "</div>";
      if (s < 4) html += '<div class="flex-1 h-0.5 min-w-3 bg-brand-200"></div>';
    }
    html += "</div></div>";
    const itemsTable = _dataTable({
      columns: [{ width: "80%" }, { width: "50px" }, { width: "30px" }, { width: "50px" }],
      rows: 3,
      padding: "px-4 py-3",
    });
    html += _sectionCard("60px", itemsTable);
    html += _sectionCard(
      "80px",
      Skeleton({ variant: "rect", width: "100%", height: 60, class: "rounded-md" })
    );
    html += _actionBar({ left: ["100px", "80px"], right: ["80px", "100px"], footer: true });
    html += "</div>";
    return html;
  },

  newOrder() {
    let html = '<div class="flex flex-col h-full overflow-hidden">';
    // Header: Back + "New Order" + ("Table:" label + selector)
    html += '<div class="flex items-center justify-between mb-6 shrink-0">';
    html +=
      '<div class="flex items-center gap-3">' +
      _btn("80px") +
      Skeleton({ variant: "text", width: "110px" }) +
      "</div>";
    html +=
      '<div class="flex items-center gap-3">' +
      Skeleton({ variant: "text", width: "50px" }) +
      _btn("130px") +
      "</div>";
    html += "</div>";
    // Body 2 columnas
    html += '<div class="flex gap-6 flex-1 min-h-0">';
    // Left col: tabs + grid scrollable
    html += '<div class="flex-1 min-w-0 min-h-0 flex flex-col gap-4">';
    html += '<div class="flex gap-2 flex-wrap shrink-0">';
    ["50px", "110px", "60px", "65px", "70px", "95px", "80px", "65px"].forEach(function (w, i) {
      const bg = i === 0 ? "bg-brand-300" : "bg-brand-200 border border-brand-300";
      html +=
        '<div class="px-4 py-1.5 rounded-full animate-pulse ' +
        bg +
        '" style="width:' +
        w +
        ';height:33px;" aria-hidden="true"></div>';
    });
    html += "</div>";
    html +=
      '<div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] overflow-y-auto min-h-0">';
    for (let i = 0; i < 8; i++) {
      html +=
        '<div class="bg-white border border-brand-300 rounded-xl p-4 flex flex-col items-center text-center space-y-3">';
      html += Skeleton({ variant: "rect", width: 80, height: 80, class: "rounded-lg mb-1" });
      html += Skeleton({ variant: "text", width: "60%" });
      html += Skeleton({ variant: "text", width: "35%" });
      html += Skeleton({ variant: "text", width: "45%" });
      html += "</div>";
    }
    html += "</div></div>";
    // Right col: cart panel
    let cart = '<div class="w-[340px] shrink-0 overflow-y-auto">';
    cart += '<div class="bg-white border border-brand-300 rounded-xl shadow-sm p-5 flex flex-col">';
    cart += '<div class="flex items-center justify-between mb-4">';
    cart += Skeleton({ variant: "text", width: "130px" });
    cart += Skeleton({ variant: "rect", width: 24, height: 24, class: "rounded-full" });
    cart += "</div>";
    cart += '<div class="space-y-3 min-h-[200px]">';
    for (let i = 0; i < 3; i++) {
      cart += '<div class="flex items-center gap-3 p-3 bg-brand-50 rounded-lg">';
      cart += Skeleton({ variant: "rect", width: 28, height: 28, class: "rounded" });
      cart +=
        '<div class="flex-1 flex flex-col gap-1">' +
        Skeleton({ variant: "text", width: "70%" }) +
        Skeleton({ variant: "text", width: "40%" }) +
        "</div>";
      cart += Skeleton({ variant: "rect", width: 56, height: 24, class: "rounded" });
      cart += Skeleton({ variant: "text", width: "60px" });
      cart += "</div>";
    }
    cart += "</div>";
    cart += '<div class="border-t border-brand-200 pt-3 mt-3 space-y-2">';
    cart +=
      '<div class="flex justify-between">' +
      Skeleton({ variant: "text", width: "60px" }) +
      Skeleton({ variant: "text", width: "60px" }) +
      "</div>";
    cart +=
      '<div class="flex justify-between">' +
      Skeleton({ variant: "text", width: "60px" }) +
      Skeleton({ variant: "text", width: "60px" }) +
      "</div>";
    cart +=
      '<div class="flex justify-between">' +
      Skeleton({ variant: "text", width: "50px" }) +
      Skeleton({ variant: "text", width: "80px" }) +
      "</div>";
    cart += "</div>";
    cart += '<div class="flex gap-2 mt-4">';
    cart += Skeleton({ variant: "rect", width: "100%", height: 40, class: "rounded-md flex-1" });
    cart += Skeleton({ variant: "rect", width: "100%", height: 40, class: "rounded-md flex-1" });
    cart += "</div></div></div>";
    html += cart;
    html += "</div></div>";
    return html;
  },

  paymentDetail() {
    let html = '<div class="space-y-5">';
    html += _pageHeader({ titleWidth: null });
    let infoBody = '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">';
    for (let i = 0; i < 8; i++) {
      infoBody +=
        '<div class="bg-brand-50 border border-brand-200 rounded-lg p-4 text-center">' +
        Skeleton({ variant: "text", width: "55px" }) +
        Skeleton({ variant: "text", width: "65px" }) +
        "</div>";
    }
    infoBody += "</div>";
    html += _sectionCard("130px", infoBody);
    const itemsTable = _dataTable({
      columns: [{ width: "80%" }, { width: "30px" }, { width: "50px" }],
      rows: 3,
    });
    html += _sectionCard("130px", itemsTable);
    html += _actionBar({ left: ["100px"], right: ["80px"], footer: true });
    html += "</div>";
    return html;
  },

  newPayment() {
    let html = '<div class="space-y-5">';
    html += _pageHeader({ titleWidth: "120px" });
    let fields = '<div class="space-y-4 max-w-md">';
    fields +=
      _inputField("80px") + _inputField("110px") + _inputField("60px") + _inputField("80px");
    fields += "</div>";
    html += _sectionCard("130px", fields);
    html += _actionBar({ left: ["130px", "80px"] });
    html += "</div>";
    return html;
  },

  paymentConfig() {
    let html = '<div class="space-y-5">';
    html += _pageHeader({ titleWidth: "150px" });
    let toggles = '<div class="divide-y divide-brand-100">';
    for (let i = 0; i < 4; i++) {
      toggles += '<div class="px-5 py-4 flex items-center justify-between">';
      toggles += '<div class="flex items-center gap-3">';
      toggles += Skeleton({ variant: "rect", width: 40, height: 40, class: "rounded-lg" });
      toggles +=
        "<div>" +
        Skeleton({ variant: "text", width: "100px" }) +
        Skeleton({ variant: "text", width: "60px" }) +
        "</div>";
      toggles += "</div>";
      toggles += Skeleton({ variant: "rect", width: 44, height: 24, class: "rounded-full" });
      toggles += "</div>";
    }
    toggles += "</div>";
    html += _sectionCard("130px", toggles);
    html += "</div>";
    return html;
  },

  reservationDetail() {
    let html = '<div class="space-y-5">';
    html += _pageHeader({ titleWidth: "160px", badge: true, rightButtons: ["100px", "80px"] });
    html += _infoCardGrid(
      [
        { valueW: "70px", subW: "100px" },
        { valueW: "80px", subW: "60px" },
        { valueW: "60px", subW: "70px" },
        { valueW: "50px" },
      ],
      "grid-cols-4"
    );
    let detailsBody = "";
    for (let i = 0; i < 3; i++) {
      detailsBody += _keyValueRow("55px", i === 2 ? "120px" : "100px");
    }
    html += _sectionCard("50px", detailsBody, { shadow: true });
    html += "</div>";
    return html;
  },

  newReservation() {
    let html = '<div class="space-y-5">';
    html += _pageHeader({ titleWidth: "160px", noBetween: true });
    let fields = '<div class="grid grid-cols-2 gap-4">';
    ["100px", "50px", "40px", "40px", "80px", "100px"].forEach(function (w) {
      fields += _inputField(w);
    });
    fields += "</div>";
    fields += '<div class="mt-4">' + _inputField("50px") + "</div>";
    html += _sectionCard("130px", fields, { shadow: true });
    html += '<div class="flex justify-end gap-3 px-5 py-4 bg-brand-50 border-t border-brand-200">';
    html += _btn("80px") + _btn("140px");
    html += "</div></div>";
    return html;
  },

  tablesDetail() {
    let html = '<div class="space-y-5">';
    // Header: back + "Table X" + status badge
    html += '<div class="flex items-center justify-between">';
    html +=
      '<div class="flex items-center gap-3">' +
      _btn("80px") +
      Skeleton({ variant: "text", width: "90px" }) +
      "</div>";
    html +=
      '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-200 animate-pulse" style="width:60px;height:22px;" aria-hidden="true"></span>';
    html += "</div>";
    // Info grid: 3 cards bg-brand-50 rounded-lg p-3 con label + value
    html += '<div class="grid grid-cols-3 gap-3">';
    for (let i = 0; i < 3; i++) {
      html +=
        '<div class="bg-brand-50 rounded-lg p-3 text-center flex flex-col items-center gap-1">';
      html += Skeleton({ variant: "text", width: "50px" });
      html += Skeleton({ variant: "text", width: "40px" });
      html += "</div>";
    }
    html += "</div>";
    // Bloque central: icono circular + título + subtítulo + 2 botones centrados
    html += '<div class="text-center py-10">';
    html +=
      '<div class="mb-2 flex justify-center">' +
      Skeleton({ variant: "text", width: "120px" }) +
      "</div>";
    html +=
      '<div class="mb-6 flex justify-center">' +
      Skeleton({ variant: "text", width: "140px" }) +
      "</div>";
    html += '<div class="flex justify-center gap-3">' + _btn("110px") + _btn("90px") + "</div>";
    html += "</div>";
    html += "</div>";
    return html;
  },

  tablesManageAreas() {
    let html = '<div class="space-y-5">';
    html += _pageHeader({ titleWidth: "150px" });
    html += '<div class="flex gap-6 items-start">';
    html += '<div class="flex-1 min-w-0 space-y-4">';
    for (let a = 0; a < 2; a++) {
      html += '<div class="bg-white border border-brand-200 rounded-xl">';
      html += '<div class="flex items-center justify-between px-5 py-4">';
      html +=
        '<div class="flex items-center gap-3">' +
        Skeleton({ variant: "circle", size: 24 }) +
        Skeleton({ variant: "text", width: "100px" }) +
        _badge("20px") +
        "</div>";
      html += Skeleton({ variant: "circle", size: 20 });
      html += "</div></div>";
    }
    html += "</div>";
    html += '<div class="w-72 shrink-0 space-y-4">';
    for (let c = 0; c < 2; c++) {
      let cardBody = '<div class="flex flex-col gap-3 p-4">';
      cardBody += _inputField("40px");
      if (c === 1)
        cardBody += Skeleton({ variant: "rect", width: 40, height: 40, class: "rounded-lg" });
      cardBody += _btn("100px");
      cardBody += "</div>";
      html += _sectionCard(c === 0 ? "100px" : "110px", cardBody, { bodyClass: "!p-0" });
    }
    html += "</div></div></div>";
    return html;
  },
};

/**
 * renderWithSkeleton â€” wraps an inner sub-view render call with a skeleton.
 * Use inside a view's render() to show a skeleton while the sub-view loads.
 *
 * Usage:
 *   renderWithSkeleton(el, Skeletons.menuDetail(), function () {
 *     renderDetail(el, selectedId);
 *   }, 400);
 */
function renderWithSkeleton(el, skeletonHtml, renderFn) {
  el.innerHTML = skeletonHtml;
  const result = renderFn();
  const done = function () {
    if (typeof window.createIcons === "function") {
      window.createIcons();
    }
  };
  if (result && typeof result.then === "function") {
    result.then(done);
  } else {
    done();
  }
}

window.withLoading = withLoading;

export { withLoading, renderWithSkeleton, Skeletons };
