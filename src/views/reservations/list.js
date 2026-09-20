import * as reservationStore from "../../store/reservations.js";
import * as reservationService from "../../services/reservationService.js";
import { tables, loadTables } from "../../store/posData.js";
import { hasAnyRole } from "../../utils/roleContext.js";
import { reservationModal } from "../../components/ui/ReservationModal.js";
import { confirmModal } from "../../components/ui/ConfirmModal.js";
import { toast } from "../../components/ui/ToastManager.js";
import { withLoading, Skeletons } from "../../utils/withLoading.js";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  completed: "Completed",
};

const STATUS_COLORS = {
  pending: { bg: "bg-accent-100", text: "text-accent-700", dot: "bg-accent-500" },
  confirmed: { bg: "bg-success-100", text: "text-success-700", dot: "bg-success-500" },
  cancelled: { bg: "bg-error-100", text: "text-error-700", dot: "bg-error-500" },
  completed: { bg: "bg-secondary-100", text: "text-secondary-700", dot: "bg-secondary-500" },
};

let subView = "list";
let selectedId = null;
let activeFilter = "all";
let searchQuery = "";
let selectedTableId = null;

function statusBadge(status, size) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.pending;
  const label = STATUS_LABELS[status] || status;
  const sizeClasses = size === "lg" ? "px-3 py-1 text-sm" : "px-2.5 py-0.5 text-xs";
  const dotSize = size === "lg" ? "h-2 w-2" : "h-1.5 w-1.5";
  return (
    '<span class="inline-flex items-center gap-1.5 rounded-full font-semibold ' +
    sizeClasses +
    " " +
    colors.bg +
    " " +
    colors.text +
    '">' +
    '<span class="' +
    dotSize +
    " rounded-full " +
    colors.dot +
    '"></span>' +
    label +
    "</span>"
  );
}

function getFiltered() {
  const all = reservationStore.getState().reservations;
  let filtered = all;

  if (activeFilter !== "all") {
    filtered = filtered.filter(function (r) {
      return r.status === activeFilter;
    });
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(function (r) {
      return (
        r.code.toLowerCase().includes(q) ||
        r.guestName.toLowerCase().includes(q) ||
        (r.guestPhone && r.guestPhone.includes(q))
      );
    });
  }

  return filtered;
}

function renderList(el) {
  const reservations = getFiltered();
  const allRes = reservationStore.getState().reservations;
  const counts = { all: allRes.length };
  ["pending", "confirmed", "cancelled", "completed"].forEach(function (s) {
    counts[s] = allRes.filter(function (r) {
      return r.status === s;
    }).length;
  });

  let html = '<div class="space-y-5">';

  html += '<div class="flex items-center justify-between">';
  html += '<div><h2 class="text-xl font-semibold text-primary-700 font-display">Reservations</h2>';
  html +=
    '<p class="text-sm text-secondary-500 mt-0.5">' +
    reservations.length +
    " reservation" +
    (reservations.length !== 1 ? "s" : "") +
    "</p></div>";
  if (hasAnyRole("admin", "waiter")) {
    html +=
      '<button data-action="new-reservation" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="plus" class="w-4 h-4"></i> New Reservation</button>';
  }
  html += "</div>";

  html += '<div class="flex flex-wrap gap-2">';
  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "cancelled", label: "Cancelled" },
    { key: "completed", label: "Completed" },
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
    '<input type="text" id="res-search" value="' +
    searchQuery +
    '" placeholder="Search by code, guest, or phone..." class="flex-1 text-sm text-neutral-900 outline-none border-none bg-transparent placeholder:text-secondary-400" />';
  if (searchQuery) {
    html +=
      '<button data-action="clear-search" class="text-secondary-400 hover:text-secondary-600 cursor-pointer bg-transparent border-none p-0"><i data-lucide="x" class="w-4 h-4"></i></button>';
  }
  html += "</div>";
  html +=
    '<input type="date" id="res-date-filter" class="border border-brand-200 rounded-lg px-3 py-2 text-sm text-neutral-700 bg-white cursor-pointer" />';
  html += "</div>";
  html += "</div>";

  html += '<div class="overflow-x-auto">';
  html += '<table class="w-full">';
  html += '<thead><tr class="border-b-2 border-brand-100">';
  const cols = ["Code", "Guest", "Date", "Time", "Party", "Table", "Status", "Actions", ""];
  cols.forEach(function (c) {
    html +=
      '<th class="px-5 py-3 text-left text-xs font-bold text-brand-700 uppercase tracking-wider bg-brand-50">' +
      c +
      "</th>";
  });
  html += "</tr></thead>";
  html += "<tbody>";

  if (reservations.length === 0) {
    html += '<tr><td colspan="9" class="px-5 py-12 text-center">';
    html += '<div class="flex flex-col items-center gap-2">';
    html += '<i data-lucide="calendar-x" class="w-10 h-10 text-secondary-300"></i>';
    html +=
      '<p class="text-sm text-secondary-400">' +
      (searchQuery ? "No reservations match your search" : "No reservations found") +
      "</p>";
    if (searchQuery) {
      html +=
        '<button data-action="clear-search" class="text-sm text-primary-600 hover:text-primary-700 font-semibold cursor-pointer bg-transparent border-none">Clear search</button>';
    }
    html += "</div></td></tr>";
  } else {
    reservations.forEach(function (r) {
      html +=
        '<tr class="border-b border-brand-100 hover:bg-brand-50/50 transition-colors" data-reservation-id="' +
        r.id +
        '">';
      html += '<td class="px-5 py-3.5 text-sm font-semibold text-brand-700">' + r.code + "</td>";
      html += '<td class="px-5 py-3.5">';
      html += '<div class="text-sm font-medium text-neutral-800">' + r.guestName + "</div>";
      if (r.guestPhone)
        html += '<div class="text-xs text-secondary-400">' + r.guestPhone + "</div>";
      html += "</td>";
      html += '<td class="px-5 py-3.5 text-sm text-neutral-700">' + r.date + "</td>";
      html += '<td class="px-5 py-3.5 text-sm text-neutral-700">' + r.time + "</td>";
      html +=
        '<td class="px-5 py-3.5 text-sm text-neutral-700 text-center">' + r.partySize + "</td>";
      html +=
        '<td class="px-5 py-3.5 text-sm text-neutral-700 text-center">' +
        (r.tableNumber || "\u2014") +
        "</td>";
      html += '<td class="px-5 py-3.5">' + statusBadge(r.status) + "</td>";
      html +=
        '<td class="px-5 py-3.5"><button data-action="view-detail" data-id="' +
        r.id +
        '" class="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-transparent text-brand-500 hover:bg-brand-100 border border-brand-300 cursor-pointer transition-colors"><i data-lucide="eye" class="w-3.5 h-3.5"></i> View</button></td>';
      if ((r.status === "pending" || r.status === "confirmed") && hasAnyRole("admin", "waiter")) {
        html +=
          '<td class="px-5 py-3.5"><button data-action="cancel" data-id="' +
          r.id +
          '" class="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-transparent text-error-600 hover:bg-error-50 border border-error-300 cursor-pointer transition-colors"><i data-lucide="x" class="w-3.5 h-3.5"></i></button></td>';
      } else {
        html += '<td class="px-5 py-3.5"></td>';
      }
      html += "</tr>";
    });
  }

  html += "</tbody></table></div></div>";
  html += "</div>";
  el.innerHTML = html;
  window.createIcons();

  const searchInput = document.getElementById("res-search");
  if (searchInput) {
    searchInput.focus();
    if (searchQuery) searchInput.setSelectionRange(searchQuery.length, searchQuery.length);
  }
}

function renderDetail(el) {
  const r = reservationStore.getState().reservations.find(function (x) {
    return x.id === selectedId;
  });
  if (!r) {
    subView = "list";
    selectedId = null;
    renderList(el);
    return;
  }

  let html = '<div class="space-y-5">';

  html += '<div class="flex items-center justify-between">';
  html += '<div class="flex items-center gap-3">';
  html +=
    '<button data-action="back" class="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-lg bg-transparent text-brand-600 hover:bg-brand-50 border border-brand-300 cursor-pointer"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back</button>';
  html +=
    '<h2 class="text-xl font-semibold text-primary-700 font-display">Reservation ' +
    r.code +
    "</h2>";
  html += "</div>";
  html += '<div class="flex items-center gap-3">' + statusBadge(r.status, "lg");
  if ((r.status === "pending" || r.status === "confirmed") && hasAnyRole("admin", "waiter")) {
    html += '<div class="flex gap-2">';
    if (r.status === "pending") {
      html +=
        '<button data-action="confirm" data-id="' +
        r.id +
        '" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-success-600 hover:bg-success-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="check" class="w-3.5 h-3.5"></i> Confirm</button>';
    }
    if (r.status === "confirmed") {
      html +=
        '<button data-action="complete" data-id="' +
        r.id +
        '" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Complete</button>';
    }
    html +=
      '<button data-action="cancel" data-id="' +
      r.id +
      '" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-transparent text-error-600 hover:bg-error-50 border border-error-300 cursor-pointer transition-colors"><i data-lucide="x" class="w-3.5 h-3.5"></i> Cancel</button>';
    html += "</div>";
  }
  if (hasAnyRole("admin")) {
    html +=
      '<button data-action="delete-reservation" data-id="' +
      r.id +
      '" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-error-600 hover:bg-error-700 text-white border-0 cursor-pointer transition-colors ml-auto"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete</button>';
  }
  html += "</div></div>";

  html += '<div class="grid grid-cols-4 gap-4">';
  html += renderInfoCard(
    "Guest",
    '<span class="text-lg font-bold text-brand-900">' +
      r.guestName +
      "</span>" +
      (r.guestPhone
        ? '<span class="block text-sm text-secondary-500 mt-0.5">' + r.guestPhone + "</span>"
        : "")
  );
  html += renderInfoCard(
    "Date & Time",
    '<span class="text-lg font-bold text-brand-900">' +
      r.date +
      '</span><span class="block text-sm text-secondary-500 mt-0.5">' +
      r.time +
      "</span>"
  );
  html += renderInfoCard(
    "Party",
    '<span class="text-lg font-bold text-brand-900">' +
      r.partySize +
      '</span><span class="block text-sm text-secondary-500 mt-0.5">guests</span>'
  );
  html += renderInfoCard(
    "Table",
    '<span class="text-lg font-bold text-brand-900">' + (r.tableNumber || "\u2014") + "</span>"
  );
  html += "</div>";

  html +=
    '<div class="bg-white border border-brand-300 rounded-xl shadow-[0_2px_6px_rgba(114,49,23,0.08)] overflow-hidden">';
  html +=
    '<div class="flex items-center justify-between px-5 py-4 border-b border-brand-100 bg-brand-50">';
  html += '<h3 class="text-sm font-bold text-brand-800">Details</h3>';
  html += "</div>";
  html += '<div class="px-5 py-4 space-y-3">';
  html +=
    '<div class="flex items-center gap-3 text-sm"><span class="font-semibold text-secondary-500 w-28">Created</span><span class="text-neutral-700">' +
    new Date(r.createdAt).toLocaleDateString() +
    " at " +
    new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
    "</span></div>";
  html +=
    '<div class="flex items-center gap-3 text-sm"><span class="font-semibold text-secondary-500 w-28">Status</span>' +
    statusBadge(r.status) +
    "</div>";
  if (r.notes) {
    html +=
      '<div class="flex items-start gap-3 text-sm"><span class="font-semibold text-secondary-500 w-28 shrink-0">Notes</span><span class="text-neutral-700 italic">' +
      r.notes +
      "</span></div>";
  }
  html += "</div></div>";

  html += "</div>";
  el.innerHTML = html;
  window.createIcons();
}

function renderInfoCard(label, valueHtml) {
  return (
    '<div class="bg-white border border-brand-200 rounded-lg p-4 text-center">' +
    '<div class="text-[11px] font-bold uppercase text-secondary-500 mb-1">' +
    label +
    "</div>" +
    valueHtml +
    "</div>"
  );
}

function renderConfirmTablePanel(el) {
  const r = reservationStore.getState().reservations.find(function (x) {
    return x.id === selectedId;
  });
  if (!r) {
    subView = "list";
    selectedId = null;
    renderList(el);
    return;
  }

  const availableTables = tables.filter(function (t) {
    return t.status === "available" && t.seats >= r.partySize;
  });

  let html = '<div class="space-y-5">';

  html += '<div class="flex items-center justify-between">';
  html += '<div class="flex items-center gap-3">';
  html +=
    '<button data-action="back-to-detail" class="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded-lg bg-transparent text-brand-600 hover:bg-brand-50 border border-brand-300 cursor-pointer"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back</button>';
  html +=
    '<h2 class="text-xl font-semibold text-primary-700 font-display">Select Table for ' +
    r.code +
    "</h2>";
  html += "</div>";
  html += "</div>";

  html +=
    '<div class="bg-white border border-brand-300 rounded-xl shadow-[0_2px_6px_rgba(114,49,23,0.08)] overflow-hidden">';
  html += '<div class="px-5 py-4 border-b border-brand-100 bg-brand-50">';
  html +=
    '<h3 class="text-sm font-bold text-brand-800">Available Tables <span class="font-normal text-secondary-500">(capacity ≥ ' +
    r.partySize +
    " guests)</span></h3>";
  html += "</div>";

  if (availableTables.length === 0) {
    html += '<div class="px-5 py-8 text-center">';
    html += '<i data-lucide="table" class="w-10 h-10 text-secondary-300 mx-auto mb-2"></i>';
    html += '<p class="text-sm text-secondary-400">No tables available with enough capacity</p>';
    html += "</div>";
  } else {
    html += '<div class="grid grid-cols-2 gap-3 p-5">';
    availableTables.forEach(function (t) {
      const isSelected = selectedTableId === t.id;
      html +=
        '<button data-action="select-table" data-table-id="' +
        t.id +
        '" class="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all text-left ' +
        (isSelected
          ? "border-primary-500 bg-primary-50 shadow-[var(--ring-brand)]"
          : "border-brand-200 bg-white hover:border-brand-400 hover:bg-brand-50") +
        '">';
      html +=
        '<div class="flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm ' +
        (isSelected ? "bg-primary-500 text-white" : "bg-brand-100 text-brand-700") +
        '">' +
        t.number +
        "</div>";
      html += '<div class="flex-1">';
      html +=
        '<div class="text-sm font-semibold ' +
        (isSelected ? "text-primary-700" : "text-neutral-800") +
        '">Table ' +
        t.number +
        "</div>";
      html += '<div class="text-xs text-secondary-500">' + t.seats + " seats";
      if (t.area) html += " · " + t.area;
      html += "</div>";
      html += "</div>";
      if (isSelected) {
        html += '<i data-lucide="check-circle" class="w-5 h-5 text-primary-500 shrink-0"></i>';
      }
      html += "</button>";
    });
    html += "</div>";
  }

  html += "</div>";

  html += '<div class="flex justify-end gap-3">';
  html +=
    '<button data-action="back-to-detail" class="px-4 py-2 text-sm font-semibold rounded-lg bg-transparent text-brand-600 hover:bg-brand-50 border border-brand-300 cursor-pointer transition-colors">Cancel</button>';
  html +=
    '<button data-action="confirm-with-table" data-id="' +
    r.id +
    '" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border-0 cursor-pointer transition-colors ' +
    (selectedTableId
      ? "bg-success-600 hover:bg-success-700 text-white"
      : "bg-secondary-200 text-secondary-400 cursor-not-allowed") +
    '"' +
    (!selectedTableId ? " disabled" : "") +
    '><i data-lucide="check" class="w-4 h-4"></i> Confirm Reservation</button>';
  html += "</div>";

  html += "</div>";
  el.innerHTML = html;
  window.createIcons();
}

async function handleAction(el, action, id) {
  if (action === "confirm") {
    selectedTableId = null;
    subView = "confirm-table";
    renderConfirmTablePanel(el);
    return;
  } else if (action === "complete") {
    await reservationService.updateReservationStatus(id, "completed");
  } else if (action === "cancel") {
    await reservationService.updateReservationStatus(id, "cancelled");
  }
  await reservationStore.refreshReservations();
  selectedId = id;
  subView = "detail";
  renderDetail(el);
}

function setupEvents(el) {
  el.addEventListener("click", async function (e) {
    const target = e.target;

    const filterBtn = target.closest("[data-filter]");
    if (filterBtn) {
      e.stopPropagation();
      activeFilter = filterBtn.getAttribute("data-filter");
      subView = "list";
      renderList(el);
      return;
    }

    const clearSearch = target.closest('[data-action="clear-search"]');
    if (clearSearch) {
      e.stopPropagation();
      searchQuery = "";
      subView = "list";
      renderList(el);
      return;
    }

    const newRes = target.closest('[data-action="new-reservation"]');
    if (newRes) {
      e.stopPropagation();
      const data = await reservationModal.show({ title: "New Reservation" });
      if (data) {
        await reservationService.createReservation({
          guestName: data.guestName,
          guestPhone: data.guestPhone,
          date: data.date,
          time: data.time,
          partySize: data.partySize,
          tableId: data.tableId || null,
          notes: data.notes,
        });
        await reservationStore.refreshReservations();
        subView = "list";
        renderList(el);
      }
      return;
    }

    const viewDetail = target.closest('[data-action="view-detail"]');
    if (viewDetail) {
      e.stopPropagation();
      selectedId = viewDetail.getAttribute("data-id");
      subView = "detail";
      renderDetail(el);
      return;
    }

    const row = target.closest("[data-reservation-id]");
    if (row && !target.closest("[data-action]")) {
      e.stopPropagation();
      selectedId = row.getAttribute("data-reservation-id");
      subView = "detail";
      renderDetail(el);
      return;
    }

    const backBtn = target.closest('[data-action="back"]');
    if (backBtn) {
      e.stopPropagation();
      subView = "list";
      selectedId = null;
      renderList(el);
      return;
    }

    const confirmBtn = target.closest('[data-action="confirm"]');
    if (confirmBtn) {
      e.stopPropagation();
      handleAction(el, "confirm", confirmBtn.getAttribute("data-id"));
      return;
    }

    const completeBtn = target.closest('[data-action="complete"]');
    if (completeBtn) {
      e.stopPropagation();
      handleAction(el, "complete", completeBtn.getAttribute("data-id"));
      return;
    }

    const cancelBtn = target.closest('[data-action="cancel"]');
    if (cancelBtn) {
      e.stopPropagation();
      handleAction(el, "cancel", cancelBtn.getAttribute("data-id"));
      return;
    }

    const deleteBtn = target.closest('[data-action="delete-reservation"]');
    if (deleteBtn) {
      e.stopPropagation();
      const deleteId = deleteBtn.getAttribute("data-id");
      if (
        await confirmModal.show({
          title: "Delete Reservation",
          message: "Delete this reservation permanently?",
        })
      ) {
        const result = await reservationService.deleteReservation(deleteId);
        if (result.success) {
          await reservationStore.refreshReservations();
          subView = "list";
          selectedId = null;
          renderList(el);
        } else {
          toast.error("Error", result.error || "Error deleting reservation");
        }
      }
      return;
    }

    const selectTableBtn = target.closest('[data-action="select-table"]');
    if (selectTableBtn) {
      e.stopPropagation();
      selectedTableId = selectTableBtn.getAttribute("data-table-id");
      renderConfirmTablePanel(el);
      return;
    }

    const confirmWithTableBtn = target.closest('[data-action="confirm-with-table"]');
    if (confirmWithTableBtn) {
      e.stopPropagation();
      if (!selectedTableId) return;
      const resId = confirmWithTableBtn.getAttribute("data-id");
      await reservationService.confirmReservation(resId, selectedTableId);
      await reservationStore.refreshReservations();
      await loadTables();
      selectedId = resId;
      subView = "detail";
      selectedTableId = null;
      renderDetail(el);
      return;
    }

    const backToDetailBtn = target.closest('[data-action="back-to-detail"]');
    if (backToDetailBtn) {
      e.stopPropagation();
      selectedTableId = null;
      subView = "detail";
      renderDetail(el);
      return;
    }
  });

  el.addEventListener("input", function (e) {
    if (e.target.id === "res-search") {
      searchQuery = e.target.value;
      renderList(el);
    }
  });

  el.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      subView = "list";
      selectedId = null;
      renderList(el);
    }
  });
}

let _eventsEl = null;

export async function renderReservations(container) {
  reservationService.setTablesCache(tables);
  await reservationStore.loadReservations();

  if (_eventsEl !== container) {
    setupEvents(container);
    _eventsEl = container;
  }

  if (subView === "detail") {
    renderDetail(container);
  } else if (subView === "confirm-table") {
    renderConfirmTablePanel(container);
  } else {
    subView = "list";
    renderList(container);
  }
}

const ReservationsView = {
  render: renderReservations,
  init: function () {},
  destroy: function () {
    _eventsEl = null;
  },
};

export default withLoading(ReservationsView, Skeletons.reservationsTable());
