const API_BASE = "";

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

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

/** Hydrate Lucide icons (static markup + rows after load). */
function refreshIcons() {
  if (typeof lucide !== "undefined" && lucide.createIcons) {
    lucide.createIcons();
  }
}

function iconEl(name) {
  const i = document.createElement("i");
  i.setAttribute("data-lucide", name);
  i.className = "btn-icon";
  i.setAttribute("aria-hidden", "true");
  return i;
}

function spanLabel(text) {
  const s = document.createElement("span");
  s.textContent = text;
  return s;
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

async function parseError(response) {
  try {
    const data = await response.json();
    if (data && typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
    }
  } catch {
    /* ignore */
  }
  return response.statusText || `Ошибка ${response.status}`;
}

function normalizeQuery(q) {
  return String(q || "")
    .trim()
    .toLowerCase();
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
  const q = normalizeQuery(searchInput?.value);
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
    phoneBody.textContent = formatPhoneRu(c.phone || "") || "—";
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
    createdBody.textContent = formatDate(c.created_at);
    createdTd.appendChild(createdBody);

    const actionsTd = document.createElement("td");
    actionsTd.setAttribute("data-label", "Действия");
    actionsTd.className = "cell-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn ghost sm";
    editBtn.append(iconEl("pencil"), spanLabel("Изменить"));
    editBtn.addEventListener("click", () => startEdit(c));

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn danger sm";
    delBtn.append(iconEl("trash-2"), spanLabel("Удалить"));
    delBtn.addEventListener("click", () => removeContact(c.id, c.full_name));

    actionsTd.append(editBtn, delBtn);

    tr.append(nameTd, phoneTd, emailTd, createdTd, actionsTd);
    tbody.appendChild(tr);
  }
}

function updateListStatus() {
  const q = normalizeQuery(searchInput?.value);
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
  const q = normalizeQuery(searchInput?.value);
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
    const res = await fetch(apiUrl("/api/contacts"));
    if (!res.ok) {
      allContacts = [];
      tbody.replaceChildren();
      listStatus.textContent = await parseError(res);
      table.hidden = true;
      return;
    }

    const items = await res.json();
    allContacts = Array.isArray(items) ? items : [];
    applyFilterAndRender();
  } finally {
    refreshIcons();
  }
}

/**
 * Маска российского мобильного: +7 (XXX) XXX-XX-XX.
 * 8… → 7…; 10 цифр с 9… → 7…; иначе — группы цифр.
 */
function formatPhoneRu(input) {
  let d = String(input).replace(/\D/g, "");
  if (d.length === 0) return "";
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (d.length === 10 && d[0] === "9") d = "7" + d;
  d = d.slice(0, 11);
  if (d[0] !== "7") {
    return d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  }
  const rest = d.slice(1);
  let out = "+7";
  if (rest.length === 0) return out;
  out += " (" + rest.slice(0, Math.min(3, rest.length));
  if (rest.length < 3) return out;
  if (rest.length === 3) return out + ")";
  out += ") " + rest.slice(3, Math.min(6, rest.length));
  if (rest.length <= 6) return out;
  const tail = rest.slice(6);
  if (tail.length <= 2) return out + "-" + tail;
  return out + "-" + tail.slice(0, 2) + "-" + tail.slice(2, 4);
}

function formatDate(iso) {
  if (!iso) return "—";
  const s = String(iso).trim();
  const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    const [, y, m, d] = ymd;
    return `${d}.${m}.${y}`;
  }
  const parsed = new Date(s.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return s;
  const d = String(parsed.getDate()).padStart(2, "0");
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const y = parsed.getFullYear();
  return `${d}.${m}.${y}`;
}

function startEdit(c) {
  contactIdInput.value = String(c.id);
  fullNameInput.value = c.full_name;
  phoneInput.value = formatPhoneRu(c.phone || "");
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

  const res = await fetch(apiUrl(`/api/contacts/${id}`), { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    const msg = await parseError(res);
    showToast(msg, "error");
    return;
  }
  showToast(`Контакт «${name}» удалён`, "success");
  await loadContacts();
  if (contactIdInput.value === String(id)) resetForm();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  showFormError("");

  const id = contactIdInput.value.trim();
  const payload = {
    full_name: fullNameInput.value.trim(),
    phone: phoneInput.value.trim(),
    email: emailInput.value.trim(),
    notes: notesInput.value.trim(),
  };

  let res;
  if (id) {
    res = await fetch(apiUrl(`/api/contacts/${id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } else {
    res = await fetch(apiUrl("/api/contacts"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  if (!res.ok) {
    showFormError(await parseError(res));
    return;
  }

  showToast(id ? "Контакт обновлён" : "Контакт сохранён", "success");
  resetForm();
  await loadContacts();
});

resetBtn.addEventListener("click", resetForm);
refreshBtn.addEventListener("click", () => loadContacts());

phoneInput.addEventListener("input", () => {
  const formatted = formatPhoneRu(phoneInput.value);
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
