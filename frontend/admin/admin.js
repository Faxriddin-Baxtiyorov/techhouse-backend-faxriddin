  const BASE_URL = "http://localhost:3002";

const navLinks = document.querySelectorAll(".nav-link[data-section]");
const sections = document.querySelectorAll(".section");
const headerTitle = document.getElementById("headerTitle");
const productModalOverlay = document.getElementById("productModalOverlay");
const productForm = document.getElementById("productForm");
const productModalTitle = document.getElementById("productModalTitle");
const productModalSubmit = document.getElementById("productModalSubmit");
const deleteModalOverlay = document.getElementById("deleteModalOverlay");

let productCache = [];
let pendingDeleteId = null;

function showSection(name) {
  sections.forEach((section) => section.classList.remove("active"));
  navLinks.forEach((link) => link.classList.remove("active"));

  const target = document.getElementById("section-" + name);
  if (target) target.classList.add("active");

  const link = document.querySelector(`.nav-link[data-section="${name}"]`);
  if (link) link.classList.add("active");

  headerTitle.textContent = name.charAt(0).toUpperCase() + name.slice(1);

  if (name === "products") {
    loadProducts();
  }
}

function renderProducts(products) {
  const tbody = document.getElementById("products-tbody");

  if (!products.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No products found.</td></tr>`;
    return;
  }

  tbody.innerHTML = products
    .map(
      (product) => `
      <tr>
        <td title="${product.id}">${product.id}</td>
        <td>${product.name || "-"}</td>
        <td>${product.category || "-"}</td>
        <td>$${Number(product.price || 0).toFixed(2)}</td>
        <td>${product.stock ?? "-"}</td>
        <td class="actions-cell">
          <button class="btn btn-edit" onclick="openEditModal('${product.id}')">Edit</button>
          <button class="btn btn-danger" onclick="openDeleteModal('${product.id}', '${(product.name || "").replace(/'/g, "\\'")}')">Delete</button>
        </td>
      </tr>`,
    )
    .join("");
}

async function loadProducts() {
  const tbody = document.getElementById("products-tbody");
  tbody.innerHTML = `<tr><td colspan="6" class="empty-row">Loading...</td></tr>`;

  try {
    const response = await fetch(BASE_URL + "/api/products");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load products.");
    }

    productCache = Array.isArray(data) ? data : data.products || [];
    renderProducts(productCache);
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">${error.message}</td></tr>`;
  }
}

function openCreateModal() {
  productModalTitle.textContent = "Add Product";
  productModalSubmit.textContent = "Create Product";
  productForm.reset();
  clearFormErrors();
  document.getElementById("productId").value = "";
  productModalOverlay.classList.add("open");
}

async function openEditModal(id) {
  productModalTitle.textContent = "Edit Product";
  productModalSubmit.textContent = "Save Changes";
  clearFormErrors();
  document.getElementById("productId").value = id;

  try {
    const response = await fetch(BASE_URL + "/api/products/" + id);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load product.");
    }

    const product = data.product || data;

    if (!product) {
      throw new Error("Product not found.");
    }

    document.getElementById("productName").value = product.name || "";
    document.getElementById("productCategory").value = product.category || "";
    document.getElementById("productDescription").value =
      product.description || "";
    document.getElementById("productPrice").value = product.price ?? "";
    document.getElementById("productStock").value = product.stock ?? "";
    document.getElementById("productImageUrl").value = product.image_url || "";
    productModalOverlay.classList.add("open");
  } catch (error) {
    alert(error.message);
  }
}

function closeProductModal() {
  productModalOverlay.classList.remove("open");
  productForm.reset();
  clearFormErrors();
}

function clearFormErrors() {
  document
    .querySelectorAll(".field-error")
    .forEach((element) => (element.textContent = ""));
  document
    .querySelectorAll(".modal-form input, .modal-form textarea")
    .forEach((element) => element.classList.remove("invalid"));
}

function setFieldError(fieldId, errId, message) {
  const input = document.getElementById(fieldId);
  const error = document.getElementById(errId);

  if (input) input.classList.add("invalid");
  if (error) error.textContent = message;
}

function validateProductForm() {
  clearFormErrors();
  let valid = true;

  const name = document.getElementById("productName").value.trim();
  const category = document.getElementById("productCategory").value.trim();
  const price = document.getElementById("productPrice").value;
  const stock = document.getElementById("productStock").value;

  if (!name) {
    setFieldError("productName", "err-name", "Name is required.");
    valid = false;
  }

  if (!category) {
    setFieldError("productCategory", "err-category", "Category is required.");
    valid = false;
  }

  if (price === "" || Number.isNaN(Number(price)) || Number(price) < 0) {
    setFieldError("productPrice", "err-price", "Enter a valid price.");
    valid = false;
  }

  if (stock === "" || Number.isNaN(Number(stock)) || Number(stock) < 0) {
    setFieldError("productStock", "err-stock", "Enter a valid stock qty.");
    valid = false;
  }

  return valid;
}

function openDeleteModal(id, name) {
  pendingDeleteId = id;
  document.getElementById("deleteProductName").textContent =
    name || "this product";
  deleteModalOverlay.classList.add("open");
}

function closeDeleteModal() {
  deleteModalOverlay.classList.remove("open");
  pendingDeleteId = null;
}

async function onCreateProduct(data) {
  const response = await fetch(BASE_URL + "/api/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create product.");
  }

  return result;
}

async function onUpdateProduct(id, data) {
  const response = await fetch(BASE_URL + "/api/products/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  alert(result.message);
  if (!response.ok) {
    throw new Error(result.message || "Failed to update product.");
  }

  return result;
}

async function onDeleteProduct(id) {
  const response = await fetch(BASE_URL + "/api/products/" + id, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to delete product.");
  }

  return result;
}

document.getElementById("sidebarToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("collapsed");
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showSection(link.dataset.section);
  });
});

document
  .getElementById("addProductBtn")
  .addEventListener("click", openCreateModal);
document
  .getElementById("productModalClose")
  .addEventListener("click", closeProductModal);
document
  .getElementById("productModalCancel")
  .addEventListener("click", closeProductModal);

productModalOverlay.addEventListener("click", (event) => {
  if (event.target === productModalOverlay) {
    closeProductModal();
  }
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validateProductForm()) return;

  const id = document.getElementById("productId").value;
  const formData = {
    name: document.getElementById("productName").value.trim(),
    category: document.getElementById("productCategory").value.trim(),
    description: document.getElementById("productDescription").value.trim(),
    price: Number(document.getElementById("productPrice").value),
    stock: Number(document.getElementById("productStock").value),
    image_url: document.getElementById("productImageUrl").value.trim(),
  };

  productModalSubmit.disabled = true;
  productModalSubmit.textContent = "Saving...";

  try {
    if (id) {
      await onUpdateProduct(id, formData);
    } else {
      await onCreateProduct(formData);
    }

    closeProductModal();
    await loadProducts();
  } catch (error) {
    alert(error.message);
  } finally {
    productModalSubmit.disabled = false;
    productModalSubmit.textContent = id ? "Save Changes" : "Create Product";
  }
});

document
  .getElementById("deleteModalClose")
  .addEventListener("click", closeDeleteModal);
document
  .getElementById("deleteModalCancel")
  .addEventListener("click", closeDeleteModal);

deleteModalOverlay.addEventListener("click", (event) => {
  if (event.target === deleteModalOverlay) {
    closeDeleteModal();
  }
});

document
  .getElementById("deleteModalConfirm")
  .addEventListener("click", async () => {
    if (!pendingDeleteId) return;

    const button = document.getElementById("deleteModalConfirm");
    button.disabled = true;
    button.textContent = "Deleting...";

    try {
      await onDeleteProduct(pendingDeleteId);
      closeDeleteModal();
      await loadProducts();
    } catch (error) {
      alert(error.message);
    } finally {
      button.disabled = false;
      button.textContent = "Yes, Delete";
    }
  });

window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;

showSection("dashboard");
