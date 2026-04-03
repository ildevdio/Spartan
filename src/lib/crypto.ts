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
    // Reverse first, but handle potentially invalid base64 if it wasn't reversed initially
    const reversed = encoded.split("").reverse().join("");
    
    // Check if directly base64-able (some legacy keys might not be reversed)
    try {
      return decodeURIComponent(escape(atob(reversed)));
    } catch {
      // Fallback: try without reverse
      return decodeURIComponent(escape(atob(encoded)));
    }
  } catch (e) {
    return encoded;
  }
};

