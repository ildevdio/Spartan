/**
 * Utility for simple obfuscation of license keys.
 */

export const obfuscate = (text: string): string => {
  if (!text) return "";
  try {
    const encoded = btoa(unescape(encodeURIComponent(text)));
    return encoded.split("").reverse().join("");
  } catch (e) {
    console.error("Obfuscation error:", e);
    return text;
  }
};

export const deobfuscate = (encoded: string): string => {
  if (!encoded || typeof encoded !== "string") return "";
  try {
    const reversed = encoded.split("").reverse().join("");
    return decodeURIComponent(escape(atob(reversed)));
  } catch (e) {
    return encoded;
  }
};
