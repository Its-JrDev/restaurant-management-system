import { formModal } from "./FormModal.js";
import { tables } from "../../store/posData.js";

class ReservationModal {
  async show({ title = "New Reservation", preset = {} } = {}) {
    const now = new Date();
    const dateDefault = preset.date || now.toISOString().split("T")[0];
    const timeDefault = preset.time || now.toTimeString().slice(0, 5);

    const tableOptions = [
      { value: "", label: "-- Optional --" },
      ...tables.map((t) => ({
        value: t.id,
        label: `Table ${t.number} (${t.seats} seats)`,
      })),
    ];

    return formModal.show({
      title,
      width: 420,
      confirmText: "Save",
      fields: [
        {
          id: "guestName",
          label: "Guest Name",
          type: "text",
          required: true,
          value: preset.guestName || "",
          placeholder: "e.g. Juan Pérez",
          fullWidth: false,
        },
        {
          id: "guestPhone",
          label: "Phone",
          type: "text",
          value: preset.guestPhone || "",
          placeholder: "+52 55 1234 5678",
          fullWidth: false,
        },
        {
          id: "date",
          label: "Date",
          type: "date",
          required: true,
          value: dateDefault,
          fullWidth: false,
        },
        {
          id: "time",
          label: "Time",
          type: "time",
          required: true,
          value: timeDefault,
          fullWidth: false,
        },
        {
          id: "partySize",
          label: "Party Size",
          type: "number",
          required: true,
          value: preset.partySize || 2,
          min: 1,
          fullWidth: false,
        },
        {
          id: "tableId",
          label: "Table",
          type: "select",
          value: preset.tableId || "",
          options: tableOptions,
          fullWidth: false,
        },
        {
          id: "notes",
          label: "Notes",
          type: "textarea",
          value: preset.notes || "",
          placeholder: "Any special requests...",
          fullWidth: true,
        },
      ],
    });
  }
}

export const reservationModal = new ReservationModal();
