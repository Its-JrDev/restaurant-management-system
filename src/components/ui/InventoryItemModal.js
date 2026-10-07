import { formModal } from "./FormModal.js";

const UNITS = [
  { id: "kg", name: "Kilogramos" },
  { id: "L", name: "Litros" },
  { id: "bunch", name: "Manojos" },
  { id: "unit", name: "Unidades" },
  { id: "g", name: "Gramos" },
  { id: "ml", name: "Mililitros" },
  { id: "oz", name: "Onzas" },
  { id: "lb", name: "Libras" },
];

class InventoryItemModal {
  async show({ title = "Nuevo artículo", preset = {} } = {}) {
    const unitOptions = [
      { value: "", label: "Seleccionar unidad..." },
      ...UNITS.map((u) => ({ value: u.id, label: `${u.name} (${u.id})` })),
    ];

    return formModal.show({
      title,
      width: 420,
      confirmText: "Guardar artículo",
      fields: [
        {
          id: "name",
          label: "Nombre",
          type: "text",
          required: true,
          value: preset.name || "",
          placeholder: "Ej. Aceite de oliva extra",
        },
        {
          id: "unit",
          label: "Unidad",
          type: "select",
          required: true,
          value: preset.unit || "",
          options: unitOptions,
        },
        {
          id: "quantity",
          label: "Cantidad",
          type: "number",
          required: true,
          value: preset.quantity || 0,
          step: "0.1",
          min: "0",
        },
        {
          id: "min_stock",
          label: "Stock mínimo",
          type: "number",
          required: true,
          value: preset.min_stock || 0,
          step: "0.1",
          min: "0",
        },
        {
          id: "is_active",
          label: "Activo",
          type: "checkbox",
          value: preset.is_active !== false,
          fullWidth: true,
        },
      ],
    });
  }
}

export const inventoryItemModal = new InventoryItemModal();
