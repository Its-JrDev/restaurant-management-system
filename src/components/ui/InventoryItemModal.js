import { formModal } from "./FormModal.js";

const UNITS = [
  { id: "kg", name: "Kilograms" },
  { id: "L", name: "Liters" },
  { id: "bunch", name: "Bunches" },
  { id: "unit", name: "Units" },
  { id: "g", name: "Grams" },
  { id: "ml", name: "Milliliters" },
  { id: "oz", name: "Ounces" },
  { id: "lb", name: "Pounds" },
];

class InventoryItemModal {
  async show({ title = "New Item", preset = {} } = {}) {
    const unitOptions = [
      { value: "", label: "Select unit..." },
      ...UNITS.map((u) => ({ value: u.id, label: `${u.name} (${u.id})` })),
    ];

    return formModal.show({
      title,
      width: 420,
      confirmText: "Save Item",
      fields: [
        {
          id: "name",
          label: "Name",
          type: "text",
          required: true,
          value: preset.name || "",
          placeholder: "e.g. Extra Virgin Olive Oil",
        },
        {
          id: "unit",
          label: "Unit",
          type: "select",
          required: true,
          value: preset.unit || "",
          options: unitOptions,
        },
        {
          id: "quantity",
          label: "Quantity",
          type: "number",
          required: true,
          value: preset.quantity || 0,
          step: "0.1",
          min: "0",
        },
        {
          id: "min_stock",
          label: "Minimum Stock",
          type: "number",
          required: true,
          value: preset.min_stock || 0,
          step: "0.1",
          min: "0",
        },
        {
          id: "is_active",
          label: "Active",
          type: "checkbox",
          value: preset.is_active !== false,
          fullWidth: true,
        },
      ],
    });
  }
}

export const inventoryItemModal = new InventoryItemModal();
