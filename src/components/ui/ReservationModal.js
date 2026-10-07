import { formModal } from "./FormModal.js";
import { tables } from "../../store/posData.js";

class ReservationModal {
  async show({ title = "Nueva reserva", preset = {} } = {}) {
    const now = new Date();
    const dateDefault = preset.date || now.toISOString().split("T")[0];
    const timeDefault = preset.time || now.toTimeString().slice(0, 5);

    const tableOptions = [
      { value: "", label: "-- Opcional --" },
      ...tables.map((t) => ({
        value: t.id,
        label: `Mesa ${t.number} (${t.seats} lugares)`,
      })),
    ];

    return formModal.show({
      title,
      width: 420,
      confirmText: "Guardar",
      fields: [
        {
          id: "guestName",
          label: "Nombre del huésped",
          type: "text",
          required: true,
          value: preset.guestName || "",
          placeholder: "Ej. Juan Pérez",
          fullWidth: false,
        },
        {
          id: "guestPhone",
          label: "Teléfono",
          type: "text",
          value: preset.guestPhone || "",
          placeholder: "+52 55 1234 5678",
          fullWidth: false,
        },
        {
          id: "date",
          label: "Fecha",
          type: "date",
          required: true,
          value: dateDefault,
          fullWidth: false,
        },
        {
          id: "time",
          label: "Hora",
          type: "time",
          required: true,
          value: timeDefault,
          fullWidth: false,
        },
        {
          id: "partySize",
          label: "Número de personas",
          type: "number",
          required: true,
          value: preset.partySize || 2,
          min: 1,
          fullWidth: false,
        },
        {
          id: "tableId",
          label: "Mesa",
          type: "select",
          value: preset.tableId || "",
          options: tableOptions,
          fullWidth: false,
        },
        {
          id: "notes",
          label: "Notas",
          type: "textarea",
          value: preset.notes || "",
          placeholder: "Algún pedido especial...",
          fullWidth: true,
        },
      ],
    });
  }
}

export const reservationModal = new ReservationModal();
