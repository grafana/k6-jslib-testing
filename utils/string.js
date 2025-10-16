export function normalizeWhiteSpace(value) {
  return value
    .replace(/[\u200B\u00AD]/g, "") // Remove zero-width space and soft hyphen
    .replace(/\s+/g, " ").trim();
}
