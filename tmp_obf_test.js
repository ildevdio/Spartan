const obfuscate = (text) => {
  if (!text) return "";
  try {
    const encoded = btoa(unescape(encodeURIComponent(text)));
    return encoded.split("").reverse().join("");
  } catch (e) {
    return text;
  }
};

console.log("Obfuscated 'SPARTAN-2024-MGCONSULT':", obfuscate("SPARTAN-2024-MGCONSULT"));
