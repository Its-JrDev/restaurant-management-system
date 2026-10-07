import { formModal } from "./FormModal.js";
import * as menuService from "../../services/menuService.js";

class ProductModal {
  async show({ title = "Nuevo producto", preset = {} } = {}) {
    const categories = await menuService.getAllCategories();

    const categoryOptions = [
      { value: "", label: "Seleccionar categoría..." },
      ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
    ];

    return formModal.show({
      title,
      width: 420,
      confirmText: "Guardar producto",
      fields: [
        {
          id: "name",
          label: "Nombre",
          type: "text",
          required: true,
          value: preset.name || "",
          placeholder: "Ej. Pollo a la parrilla",
        },
        {
          id: "category_id",
          label: "Categoría",
          type: "select",
          required: true,
          value: preset.category_id || "",
          options: categoryOptions,
        },
        {
          id: "description",
          label: "Descripción",
          type: "textarea",
          value: preset.description || "",
          placeholder: "Descripción del producto...",
          fullWidth: true,
        },
        {
          id: "price",
          label: "Precio",
          type: "number",
          required: true,
          value: preset.price || "",
          placeholder: "0.00",
          step: "0.01",
          min: "0.01",
        },
        {
          id: "image_url",
          label: "URL de imagen",
          type: "text",
          value: preset.image_url || "",
          placeholder: "https://example.com/image.jpg",
        },
        {
          id: "available",
          label: "Disponible",
          type: "checkbox",
          value: preset.available !== false,
          fullWidth: true,
        },
      ],
    });
  }
}

export const productModal = new ProductModal();
