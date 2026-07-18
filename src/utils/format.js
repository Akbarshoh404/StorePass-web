export const CURRENCY_SYMBOL = "$";

export function formatMoney(value) {
  // Fixed to en-US so amounts read consistently regardless of the viewer's locale.
  const amount = Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${CURRENCY_SYMBOL}${amount}`;
}

// Native <input type="number"> silently produces an empty value in locales that
// use "," as the decimal separator when a "." is typed (and vice versa), which
// made the amount field unusable for some employees. Using a plain text input
// with this parser sidesteps the browser's locale-sensitive number parsing.
export function parseAmount(raw) {
  if (typeof raw !== "string") return NaN;
  const normalized = raw.trim().replace(",", ".").replace(/[^0-9.]/g, "");
  if (normalized === "" || normalized === ".") return NaN;
  return Number(normalized);
}

export function formatDateTime(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTime(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
