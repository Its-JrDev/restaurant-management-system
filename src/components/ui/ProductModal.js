import { formModal } from "./FormModal.js";
import * as menuService from "../../services/menuService.js";

class ProductModal {
  async show({ title = "New Product", preset = {} } = {}) {
    const categories = await menuService.getAllCategories();

    const categoryOptions = [
      { value: "", label: "Select a category..." },
      ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
    ];

    return formModal.show({
      title,
      width: 420,
      confirmText: "Save Product",
      fields: [
        {
          id: "name",
          label: "Name",
          type: "text",
          required: true,
          value: preset.name || "",
          placeholder: "e.g. Grilled Chicken",
        },
        {
          id: "category_id",
          label: "Category",
          type: "select",
          required: true,
          value: preset.category_id || "",
          options: categoryOptions,
        },
        {
          id: "description",
          label: "Description",
          type: "textarea",
          value: preset.description || "",
          placeholder: "Product description...",
          fullWidth: true,
        },
        {
          id: "price",
          label: "Price",
          type: "number",
          required: true,
          value: preset.price || "",
          placeholder: "0.00",
          step: "0.01",
          min: "0.01",
        },
        {
          id: "image_url",
          label: "Image URL",
          type: "text",
          value: preset.image_url || "",
          placeholder: "https://example.com/image.jpg",
        },
        {
          id: "available",
          label: "Available",
          type: "checkbox",
          value: preset.available !== false,
          fullWidth: true,
        },
      ],
    });
  }
}

export const productModal = new ProductModal();
