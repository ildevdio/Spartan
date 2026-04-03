const obfuscate = (text) => {
  if (!text) return "";
  try {
    const encoded = btoa(unescape(encodeURIComponent(text)));
    return encoded.split("").reverse().join("");
  } catch (e) {
    return text;
  }
};

const deobfuscate = (encoded) => {
  if (!encoded || typeof encoded !== "string") return "";
  try {
    const reversed = encoded.split("").reverse().join("");
    return decodeURIComponent(escape(atob(reversed)));
  } catch (e) {
    return encoded;
  }
};

const envKey = "fmlzdW5vYy1nbS00MjAyLW5hdHJhcHM=";
console.log("Deobfuscated:", deobfuscate(envKey));
