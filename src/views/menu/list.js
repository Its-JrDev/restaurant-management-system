import * as menuStore from "../../store/menu.js";
import * as menuService from "../../services/menuService.js";
import { initMockCategories, initMockProducts } from "../../services/menuService.js";
import { currentUser } from "../../store/auth.js";
import { hasAnyRole } from "../../utils/roleContext.js";
import { productModal } from "../../components/ui/ProductModal.js";
import { confirmModal } from "../../components/ui/ConfirmModal.js";
import { toast } from "../../components/ui/ToastManager.js";
import { withLoading, Skeletons } from "../../utils/withLoading.js";
import CheckboxField from "../../components/forms/CheckboxField.js";

initMockCategories();
initMockProducts();

let subView = "list";
let selectedId = null;
let activeCategoryFilter = "";
let activeAvailableFilter = "";
let searchQuery = "";

function getCategoryEmoji() {
  return "🍽️";
}

function availabilityBadge(available) {
  if (available) {
    return '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-100 text-success-700"><span class="w-1.5 h-1.5 rounded-full bg-success-500"></span>Available</span>';
  }
  return '<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600"><span class="w-1.5 h-1.5 rounded-full bg-neutral-500"></span>Unavailable</span>';
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

function getFiltered() {
  const all = menuStore.getState().products;
  let filtered = all;

  if (activeCategoryFilter) {
    filtered = filtered.filter(function (p) {
      return p.category_id === activeCategoryFilter;
    });
  }

  if (activeAvailableFilter !== "") {
    const isAvailable = activeAvailableFilter === "available";
    filtered = filtered.filter(function (p) {
      return p.available === isAvailable;
    });
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(function (p) {
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    });
  }

  return filtered;
}

async function renderList(el) {
  const products = getFiltered();
  const categories = await menuService.getAllCategories();

  let html = '<div class="space-y-5">';

  html += '<div class="flex items-center justify-between">';
  html += '<div><h2 class="text-xl font-semibold text-brand-900 font-display">Menu Management</h2>';
  html +=
    '<p class="text-sm text-secondary-500 mt-0.5">' +
    products.length +
    " product" +
    (products.length !== 1 ? "s" : "") +
    "</p></div>";
  if (hasAnyRole("admin")) {
    html +=
      '<button data-action="create-product" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="plus" class="w-4 h-4"></i> Add Product</button>';
  }
  html += "</div>";

  html += '<div class="flex flex-wrap gap-3 items-center">';
  html +=
    '<div class="flex items-center gap-2 border border-brand-200 rounded-lg px-3 py-2 bg-white">';
  html += '<i data-lucide="search" class="w-4 h-4 text-brand-400 shrink-0"></i>';
  html +=
    '<input type="text" id="menu-search" value="' +
    searchQuery +
    '" placeholder="Search products..." class="flex-1 text-sm text-neutral-900 outline-none border-none bg-transparent placeholder:text-secondary-400" />';
  if (searchQuery) {
    html +=
      '<button data-action="clear-search" class="text-secondary-400 hover:text-secondary-600 cursor-pointer bg-transparent border-none p-0"><i data-lucide="x" class="w-4 h-4"></i></button>';
  }
  html += "</div>";

  html +=
    '<select id="menu-category-filter" class="border border-brand-200 rounded-lg px-3 py-2 text-sm text-neutral-700 bg-white cursor-pointer">';
  html += '<option value="">All Categories</option>';
  categories.forEach(function (cat) {
    html +=
      '<option value="' +
      cat.id +
      '" ' +
      (activeCategoryFilter === String(cat.id) ? "selected" : "") +
      ">" +
      cat.name +
      "</option>";
  });
  html += "</select>";

  html +=
    '<select id="menu-available-filter" class="border border-brand-200 rounded-lg px-3 py-2 text-sm text-neutral-700 bg-white cursor-pointer">';
  html += '<option value="">All Status</option>';
  html +=
    '<option value="available" ' +
    (activeAvailableFilter === "available" ? "selected" : "") +
    ">Available</option>";
  html +=
    '<option value="unavailable" ' +
    (activeAvailableFilter === "unavailable" ? "selected" : "") +
    ">Unavailable</option>";
  html += "</select>";

  if (searchQuery || activeCategoryFilter || activeAvailableFilter) {
    html +=
      '<button data-action="clear-filters" class="text-sm text-brand-600 hover:text-brand-700 cursor-pointer">Clear filters</button>';
  }

  html += "</div>";

  html += '<div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">';

  if (products.length === 0) {
    html += '<div class="col-span-full flex flex-col items-center justify-center py-12">';
    html += '<i data-lucide="utensils" class="w-12 h-12 text-brand-300 mb-3"></i>';
    html += '<p class="text-sm text-secondary-500">No products found</p>';
    if (searchQuery || activeCategoryFilter || activeAvailableFilter) {
      html +=
        '<button data-action="clear-filters" class="mt-2 text-sm text-brand-600 hover:text-brand-700 cursor-pointer">Clear filters</button>';
    }
    html += "</div>";
  } else {
    for (const product of products) {
      const category = await menuService.getCategoryById(product.category_id);
      const categoryName = category ? category.name : "Unknown";
      const emoji = product.image_url || getCategoryEmoji(product.category_id);

      html +=
        '<div class="bg-white border border-brand-300 rounded-xl p-4 flex flex-col items-center text-center hover:border-brand-500 hover:shadow-[var(--shadow-brand-hover)] transition-all">';

      if (product.image_url) {
        html +=
          '<img src="' +
          product.image_url +
          '" alt="' +
          product.name +
          '" class="w-20 h-20 rounded-lg object-cover mb-3 bg-brand-50" />';
      } else {
        html +=
          '<div class="w-20 h-20 rounded-lg flex items-center justify-center text-3xl mb-3 bg-brand-50">' +
          emoji +
          "</div>";
      }

      html += '<div class="text-sm font-semibold text-brand-900 mb-0.5">' + product.name + "</div>";
      html +=
        '<div class="text-[15px] font-bold text-brand-600 mb-1">$' +
        product.price.toFixed(2) +
        "</div>";
      html += '<div class="text-xs text-secondary-500 mb-2">' + categoryName + "</div>";
      html += '<div class="mb-3">' + availabilityBadge(product.available) + "</div>";

      html += '<div class="flex gap-2 w-full">';
      html +=
        '<button data-action="view-detail" data-product-id="' +
        product.id +
        '" class="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-md bg-brand-50 text-brand-700 hover:bg-brand-100 border-0 cursor-pointer transition-colors"><i data-lucide="eye" class="w-3 h-3"></i> View</button>';
      if (hasAnyRole("admin")) {
        html +=
          '<button data-action="edit-product" data-product-id="' +
          product.id +
          '" class="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold rounded-md bg-primary-50 text-primary-700 hover:bg-primary-100 border-0 cursor-pointer transition-colors"><i data-lucide="edit" class="w-3 h-3"></i> Edit</button>';
      }
      html += "</div>";
      html += "</div>";
    }
  }

  html += "</div>";
  html += "</div>";

  el.innerHTML = html;
  setupListEvents(el);
  window.createIcons();
}

async function renderDetail(el, productId) {
  const product = await menuService.getProductById(productId);
  if (!product) {
    renderList(el);
    return;
  }

  const category = await menuService.getCategoryById(product.category_id);
  const categoryName = category ? category.name : "Unknown";
  const emoji = product.image_url || getCategoryEmoji(product.category_id);
  const canDelete = currentUser && currentUser.role === "admin";

  let html = '<div class="space-y-5">';

  html += '<div class="flex items-center justify-between">';
  html +=
    '<button data-action="back-to-list" class="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 cursor-pointer transition-colors"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back</button>';
  html += '<div class="flex items-center gap-3">';
  html += availabilityBadge(product.available);
  html += "</div></div>";

  html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
  html += '<div class="p-6">';

  if (product.image_url) {
    html +=
      '<img src="' +
      product.image_url +
      '" alt="' +
      product.name +
      '" class="w-32 h-32 rounded-lg object-cover mx-auto mb-4 bg-brand-50" />';
  } else {
    html +=
      '<div class="w-32 h-32 rounded-lg flex items-center justify-center text-5xl mx-auto mb-4 bg-brand-50">' +
      emoji +
      "</div>";
  }

  html +=
    '<h2 class="text-2xl font-bold text-brand-900 text-center mb-2">' + product.name + "</h2>";
  html +=
    '<div class="text-center mb-4"><span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-brand-100 text-brand-700">' +
    categoryName +
    "</span></div>";

  if (product.description) {
    html +=
      '<p class="text-sm text-secondary-600 text-center mb-4">' + product.description + "</p>";
  }

  html +=
    '<div class="text-center text-3xl font-bold text-brand-600 mb-6">$' +
    product.price.toFixed(2) +
    "</div>";

  html += '<div class="grid grid-cols-2 gap-4 text-sm">';
  html += '<div class="bg-brand-50 rounded-lg p-3">';
  html +=
    '<div class="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">Created</div>';
  html += '<div class="font-semibold text-brand-900">' + formatDate(product.created_at) + "</div>";
  html += "</div>";
  html += '<div class="bg-brand-50 rounded-lg p-3">';
  html +=
    '<div class="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-1">Updated</div>';
  html += '<div class="font-semibold text-brand-900">' + formatDate(product.updated_at) + "</div>";
  html += "</div>";
  html += "</div>";

  html += "</div></div>";

  html +=
    '<div class="bg-brand-50 border border-brand-200 rounded-xl p-4 flex items-center gap-3">';
  if (hasAnyRole("admin")) {
    html +=
      '<button data-action="edit-product" data-product-id="' +
      product.id +
      '" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="edit" class="w-4 h-4"></i> Edit</button>';
  }

  if (product.available && hasAnyRole("admin")) {
    html +=
      '<button data-action="toggle-availability" data-product-id="' +
      product.id +
      '" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 cursor-pointer transition-colors"><i data-lucide="eye-off" class="w-4 h-4"></i> Disable</button>';
  } else if (!product.available && hasAnyRole("admin")) {
    html +=
      '<button data-action="toggle-availability" data-product-id="' +
      product.id +
      '" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-success-600 hover:bg-success-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="eye" class="w-4 h-4"></i> Enable</button>';
  }

  html += '<div class="flex-1"></div>';

  if (canDelete) {
    html +=
      '<button data-action="delete-product" data-product-id="' +
      product.id +
      '" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-error-600 hover:bg-error-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i> Delete</button>';
  }

  html += "</div>";

  html += "</div>";

  el.innerHTML = html;
  setupDetailEvents(el);
  window.createIcons();
}

async function renderForm(el, productId) {
  const isEdit = !!productId;
  const product = isEdit ? await menuService.getProductById(productId) : null;
  const categories = await menuService.getAllCategories();

  let html = '<div class="space-y-5">';

  html += '<div class="flex items-center justify-between">';
  html +=
    '<button data-action="back-to-list" class="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 cursor-pointer transition-colors"><i data-lucide="arrow-left" class="w-4 h-4"></i> Back</button>';
  html +=
    '<h2 class="text-xl font-semibold text-brand-900 font-display">' +
    (isEdit ? "Edit Product" : "New Product") +
    "</h2>";
  html += "</div>";

  html += '<div class="bg-white border border-brand-300 rounded-xl overflow-hidden">';
  html += '<div class="px-5 py-4 border-b border-brand-100 bg-brand-50">';
  html +=
    '<h3 class="text-sm font-bold text-brand-800 uppercase tracking-wider">Product Information</h3>';
  html += "</div>";
  html += '<div class="p-5">';
  html += '<div class="space-y-4 max-w-md">';

  html += "<div>";
  html += '<label class="block text-sm font-semibold text-secondary-600 mb-1">Name *</label>';
  html +=
    '<input type="text" id="product-name" value="' +
    (product ? product.name : "") +
    '" placeholder="e.g. Grilled Chicken" class="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm text-neutral-900 bg-white" />';
  html += "</div>";

  html += "<div>";
  html += '<label class="block text-sm font-semibold text-secondary-600 mb-1">Category *</label>';
  html +=
    '<select id="product-category" class="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm text-neutral-900 bg-white cursor-pointer">';
  html += '<option value="">Select a category...</option>';
  categories.forEach(function (cat) {
    html +=
      '<option value="' +
      cat.id +
      '" ' +
      (product && product.category_id === cat.id ? "selected" : "") +
      ">" +
      cat.name +
      "</option>";
  });
  html += "</select>";
  html += "</div>";

  html += "<div>";
  html += '<label class="block text-sm font-semibold text-secondary-600 mb-1">Description</label>';
  html +=
    '<textarea id="product-description" rows="3" placeholder="Product description..." class="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm text-neutral-900 bg-white resize-y">' +
    (product ? product.description || "" : "") +
    "</textarea>";
  html += "</div>";

  html += "<div>";
  html += '<label class="block text-sm font-semibold text-secondary-600 mb-1">Price *</label>';
  html +=
    '<input type="number" id="product-price" step="0.01" min="0.01" value="' +
    (product ? product.price : "") +
    '" placeholder="0.00" class="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm text-neutral-900 bg-white" />';
  html += "</div>";

  html += "<div>";
  html += '<label class="block text-sm font-semibold text-secondary-600 mb-1">Image URL</label>';
  html +=
    '<input type="text" id="product-image-url" value="' +
    (product ? product.image_url || "" : "") +
    '" placeholder="https://example.com/image.jpg" class="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm text-neutral-900 bg-white" />';
  html += "</div>";

  html += CheckboxField({
    id: "product-available",
    label: "Available",
    checked: product && product.available,
  });

  html += "</div></div></div>";

  html += '<div class="flex items-center gap-3">';
  html +=
    '<button data-action="save-product" data-product-id="' +
    (productId || "") +
    '" class="flex items-center gap-2 px-6 py-2 text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white border-0 cursor-pointer transition-colors"><i data-lucide="check" class="w-4 h-4"></i> ' +
    (isEdit ? "Save Changes" : "Create Product") +
    "</button>";
  html +=
    '<button data-action="back-to-list" class="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white border border-brand-300 text-brand-700 hover:bg-brand-50 cursor-pointer transition-colors">Cancel</button>';
  html += "</div>";

  html += "</div>";

  el.innerHTML = html;
  setupFormEvents(el);
  window.createIcons();
}

function setupListEvents(el) {
  el.addEventListener("click", async function (e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === "create-product") {
      e.stopPropagation();
      const data = await productModal.show();
      if (data) {
        await menuService.createProduct({
          category_id: data.category_id,
          name: data.name,
          description: data.description || null,
          price: data.price,
          image_url: data.image_url || null,
          available: data.available,
        });
        await menuStore.refreshProducts();
        renderList(el);
      }
    } else if (action === "view-detail") {
      selectedId = btn.dataset.productId;
      subView = "detail";
      renderDetail(el, selectedId);
    } else if (action === "edit-product") {
      selectedId = btn.dataset.productId;
      subView = "edit";
      renderForm(el, selectedId);
    } else if (action === "clear-search") {
      searchQuery = "";
      renderList(el);
    } else if (action === "clear-filters") {
      activeCategoryFilter = "";
      activeAvailableFilter = "";
      searchQuery = "";
      renderList(el);
    }
  });

  const searchInput = el.querySelector("#menu-search");
  if (searchInput) {
    searchInput.addEventListener("input", function (e) {
      searchQuery = e.target.value;
      renderList(el);
    });
  }

  const categoryFilter = el.querySelector("#menu-category-filter");
  if (categoryFilter) {
    categoryFilter.addEventListener("change", function (e) {
      activeCategoryFilter = e.target.value;
      renderList(el);
    });
  }

  const availableFilter = el.querySelector("#menu-available-filter");
  if (availableFilter) {
    availableFilter.addEventListener("change", function (e) {
      activeAvailableFilter = e.target.value;
      renderList(el);
    });
  }
}

function setupDetailEvents(el) {
  el.addEventListener("click", async function (e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === "back-to-list") {
      subView = "list";
      selectedId = null;
      renderList(el);
    } else if (action === "edit-product") {
      subView = "edit";
      renderForm(el, selectedId);
    } else if (action === "toggle-availability") {
      await menuService.toggleProductAvailability(selectedId);
      await menuStore.refreshProducts();
      renderDetail(el, selectedId);
    } else if (action === "delete-product") {
      if (
        await confirmModal.show({
          title: "Delete Product",
          message: "Are you sure you want to delete this product?",
        })
      ) {
        await menuService.deleteProduct(selectedId);
        await menuStore.refreshProducts();
        subView = "list";
        selectedId = null;
        renderList(el);
      }
    }
  });
}

function setupFormEvents(el) {
  el.addEventListener("click", async function (e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;

    const action = btn.dataset.action;

    if (action === "back-to-list") {
      subView = "list";
      selectedId = null;
      renderList(el);
    } else if (action === "save-product") {
      const productId = btn.dataset.productId || null;
      const nameInput = el.querySelector("#product-name");
      const categorySelect = el.querySelector("#product-category");
      const descInput = el.querySelector("#product-description");
      const priceInput = el.querySelector("#product-price");
      const imageInput = el.querySelector("#product-image-url");
      const availableInput = el.querySelector("#product-available");

      const name = nameInput.value.trim();
      const categoryId = categorySelect.value;
      const description = descInput.value.trim();
      const price = parseFloat(priceInput.value);
      const imageUrl = imageInput.value.trim() || null;
      const available = availableInput.checked;

      if (!name) {
        toast.warning("Missing Name", "Please enter a product name");
        return;
      }
      if (!categoryId) {
        toast.warning("Missing Category", "Please select a category");
        return;
      }
      if (!price || price <= 0) {
        toast.warning("Invalid Price", "Please enter a valid price");
        return;
      }

      const data = {
        category_id: categoryId,
        name: name,
        description: description,
        price: price,
        image_url: imageUrl,
        available: available,
      };

      if (productId) {
        await menuService.updateProduct(productId, data);
      } else {
        await menuService.createProduct(data);
      }

      await menuStore.refreshProducts();
      subView = "list";
      selectedId = null;
      renderList(el);
    }
  });
}

export function renderMenu(el) {
  menuStore.loadProducts();
  menuStore.loadCategories();

  if (subView === "detail" && selectedId) {
    renderDetail(el, selectedId);
  } else if (subView === "edit" && selectedId) {
    renderForm(el, selectedId);
  } else {
    subView = "list";
    renderList(el);
  }
}

const MenuView = { render: renderMenu, init: function () {}, destroy: function () {} };

export default withLoading(MenuView, Skeletons.menuCards());
