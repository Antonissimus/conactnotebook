/**
 * API communication module.
 */

const API_BASE = "";

function apiUrl(path) {
  return `${API_BASE}${path}`;
}

export async function parseError(response) {
  try {
    const data = await response.json();
    // Handle our new standard error format
    if (data && data.error && typeof data.error.message === "string") {
        return data.error.message;
    }
    if (data && typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((d) => d.msg || JSON.stringify(d)).join("; ");
    }
  } catch {
    /* ignore */
  }
  return response.statusText || `Ошибка ${response.status}`;
}

export async function fetchContacts() {
  const res = await fetch(apiUrl("/api/contacts"));
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json();
}

export async function createContact(payload) {
  const res = await fetch(apiUrl("/api/contacts"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json();
}

export async function updateContact(id, payload) {
  const res = await fetch(apiUrl(`/api/contacts/${id}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  return res.json();
}

export async function deleteContact(id) {
  const res = await fetch(apiUrl(`/api/contacts/${id}`), { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    throw new Error(await parseError(res));
  }
}
