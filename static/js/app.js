import * as api from "./api.js";
import * as utils from "./utils.js";

const form = document.getElementById("contact-form");
const contactIdInput = document.getElementById("contact-id");
const fullNameInput = document.getElementById("full-name");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");
const notesInput = document.getElementById("notes");
const submitBtnLabel = document.getElementById("submit-btn-label");
const resetBtn = document.getElementById("reset-btn");
const refreshBtn = document.getElementById("refresh-btn");
const formError = document.getElementById("form-error");
const listStatus = document.getElementById("list-status");
const table = document.getElementById("contacts-table");
const tbody = document.getElementById("contacts-body");
const formTitle = document.getElementById("form-title");
const searchInput = document.getElementById("contact-search");
const toastContainer = document.getElementById("toast-container");

/** Cached contacts from API; filtering is client-side. */
let allContacts = [];

/** Hydrate Lucide icons (static markup + rows after load). */
function refreshIcons() {
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = !message;
}

function showToast(message, type = "info") {
  if (!toastContainer || !message) return;
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.setAttribute("role", "status");
  el.textContent = message;
  toastContainer.appendChild(el);
  requestAnimationFrame(() => el.classList.add("toast--visible"));
  const hide = () => {
    el.classList.remove("toast--visible");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 400);
  };
  setTimeout(hide, 3800);
}

function contactMatches(c, q) {
  if (!q) return true;
  const hay = [c.full_name, c.phone, c.email, c.notes]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function getFilteredContacts() {
  const q = utils.normalizeQuery(searchInput?.value);
  return allContacts.filter((c) => contactMatches(c, q));
}

function showSkeletonRows(count = 5) {
  tbody.replaceChildren();
  for (let i = 0; i < count; i++) {
    const tr = document.createElement("tr");
    tr.className = "skeleton-row";
    const widths = ["75%", "55%", "65%", "40%", "5.5rem"];
    for (let j = 0; j < 5; j++) {
      const td = document.createElement("td");
      const bar = document.createElement("div");
      bar.className = "skeleton skeleton-bar";
      bar.style.width = widths[j];
      td.appendChild(bar);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

function renderContactRows(contacts) {
  tbody.replaceChildren();
  for (const c of contacts) {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.setAttribute("data-label", "Имя");
    const nameBody = document.createElement("div");
    nameBody.className = "td-body";
    nameBody.append(document.createTextNode(c.full_name));
    if (c.notes) {
      const span = document.createElement("span");
      span.className = "notes-preview";
      span.textContent = c.notes;
      nameBody.appendChild(span);
    }
    nameTd.appendChild(nameBody);

    const phoneTd = document.createElement("td");
    phoneTd.setAttribute("data-label", "Телефон");
    const phoneBody = document.createElement("div");
    phoneBody.className = "td-body";
    phoneBody.textContent = utils.formatPhoneRu(c.phone || "") || "—";
    phoneTd.appendChild(phoneBody);

    const emailTd = document.createElement("td");
    emailTd.setAttribute("data-label", "Email");
    const emailBody = document.createElement("div");
    emailBody.className = "td-body";
    emailBody.textContent = c.email || "—";
    emailTd.appendChild(emailBody);

    const createdTd = document.createElement("td");
    createdTd.setAttribute("data-label", "Создан");
    const createdBody = document.createElement("div");
    createdBody.className = "td-body";
    createdBody.textContent = utils.formatDate(c.created_at);
    createdTd.appendChild(createdBody);

    const actionsTd = document.createElement("td");
    actionsTd.setAttribute("data-label", "Действия");
    actionsTd.className = "cell-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn ghost sm";
    editBtn.append(utils.iconEl("pencil"), utils.spanLabel("Изменить"));
    editBtn.addEventListener("click", () => startEdit(c));

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn danger sm";
    delBtn.append(utils.iconEl("trash-2"), utils.spanLabel("Удалить"));
    delBtn.addEventListener("click", () => removeContact(c.id, c.full_name));

    actionsTd.append(editBtn, delBtn);

    tr.append(nameTd, phoneTd, emailTd, createdTd, actionsTd);
    tbody.appendChild(tr);
  }
}

function updateListStatus() {
  const q = utils.normalizeQuery(searchInput?.value);
  if (allContacts.length === 0) {
    listStatus.textContent = "Контактов пока нет — добавьте первый.";
    table.hidden = true;
    return;
  }
  table.hidden = false;
  if (!q) {
    listStatus.textContent = `Всего: ${allContacts.length}`;
    return;
  }
  const filtered = getFilteredContacts();
  if (filtered.length === 0) {
    listStatus.textContent = `Ничего не найдено (в базе ${allContacts.length})`;
  } else {
    listStatus.textContent = `Найдено: ${filtered.length} из ${allContacts.length}`;
  }
}

function applyFilterAndRender() {
  const q = utils.normalizeQuery(searchInput?.value);
  if (allContacts.length === 0) {
    tbody.replaceChildren();
    updateListStatus();
    return;
  }
  const filtered = getFilteredContacts();
  if (filtered.length === 0 && q) {
    tbody.replaceChildren();
    updateListStatus();
    refreshIcons();
    return;
  }
  renderContactRows(filtered);
  updateListStatus();
  refreshIcons();
}

async function loadContacts() {
  listStatus.textContent = "Загрузка…";
  table.hidden = false;
  showSkeletonRows();

  try {
    const items = await api.fetchContacts();
    allContacts = Array.isArray(items) ? items : [];
    applyFilterAndRender();
  } catch (err) {
    allContacts = [];
    tbody.replaceChildren();
    listStatus.textContent = err.message;
    table.hidden = true;
  } finally {
    refreshIcons();
  }
}

function startEdit(c) {
  contactIdInput.value = String(c.id);
  fullNameInput.value = c.full_name;
  phoneInput.value = utils.formatPhoneRu(c.phone || "");
  emailInput.value = c.email || "";
  notesInput.value = c.notes || "";
  formTitle.textContent = "Редактирование";
  if (submitBtnLabel) submitBtnLabel.textContent = "Обновить";
  showFormError("");
  fullNameInput.focus();
}

function resetForm() {
  form.reset();
  contactIdInput.value = "";
  formTitle.textContent = "Новый контакт";
  if (submitBtnLabel) submitBtnLabel.textContent = "Сохранить";
  showFormError("");
}

async function removeContact(id, name) {
  const ok = confirm(`Удалить контакт «${name}»?`);
  if (!ok) return;

  try {
    await api.deleteContact(id);
    showToast(`Контакт «${name}» удалён`, "success");
    await loadContacts();
    if (contactIdInput.value === String(id)) resetForm();
  } catch (err) {
    showToast(err.message, "error");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showFormError("");

  const id = contactIdInput.value.trim();
  const payload = {
    full_name: fullNameInput.value.trim(),
    phone: phoneInput.value.trim(),
    email: emailInput.value.trim() || null,
    notes: notesInput.value.trim(),
  };

  try {
    if (id) {
      await api.updateContact(id, payload);
    } else {
      await api.createContact(payload);
    }
    showToast(id ? "Контакт обновлён" : "Контакт сохранён", "success");
    resetForm();
    await loadContacts();
  } catch (err) {
    showFormError(err.message);
  }
});

resetBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", () => loadContacts());

phoneInput.addEventListener("input", () => {
  const formatted = utils.formatPhoneRu(phoneInput.value);
  phoneInput.value = formatted;
  const len = formatted.length;
  phoneInput.setSelectionRange(len, len);
});

if (searchInput) {
  searchInput.addEventListener("input", () => {
    applyFilterAndRender();
  });
}

refreshIcons();
loadContacts().catch((err) => {
  const msg = err.message || String(err);
  listStatus.textContent = msg;
  showToast(msg, "error");
});
