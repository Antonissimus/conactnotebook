/**
 * Utility functions for formatting and DOM helpers.
 */

export function iconEl(name) {
  const i = document.createElement("i");
  i.setAttribute("data-lucide", name);
  i.className = "btn-icon";
  i.setAttribute("aria-hidden", "true");
  return i;
}

export function spanLabel(text) {
  const s = document.createElement("span");
  s.textContent = text;
  return s;
}

export function normalizeQuery(q) {
  return String(q || "")
    .trim()
    .toLowerCase();
}

/**
 * Mask for Russian mobile: +7 (XXX) XXX-XX-XX.
 */
export function formatPhoneRu(input) {
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

export function formatDate(iso) {
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
