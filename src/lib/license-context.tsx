import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { obfuscate, deobfuscate } from "./crypto";

interface LicenseContextType {
  isFullVersion: boolean; // System Access
  isDeveloper: boolean;   // Dev Override
  licenseKey: string | null;
  activateLicense: (key: string) => boolean;
  deactivateLicense: () => void;
}

const LicenseContext = createContext<LicenseContextType | null>(null);

// Customer keys (stored obfuscated in .env)
const MGCONSULT_KEY = deobfuscate(import.meta.env.VITE_SPARTAN_MGCONSULT_LICENSE_KEY || "");

// Developer keys (stored plain in .env)
const DEV_KEYS = [
  import.meta.env.VITE_SPARTAN_DEV_DIOGO || "",
  import.meta.env.VITE_SPARTAN_DEV_SAMUEL || "",
  import.meta.env.VITE_SPARTAN_DEV_NICOLAS || "",
].filter(Boolean);

const STORAGE_KEY = "spartan_license_key";

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [isFullVersion, setIsFullVersion] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    // A key is valid if it's a dev key OR if its deobfuscated version matches a customer key
    const isDev = DEV_KEYS.includes(stored);
    const deobfuscatedStored = deobfuscate(stored);
    const isCustomer = deobfuscatedStored === MGCONSULT_KEY;

    if (isDev) {
      setIsDeveloper(true);
      setIsFullVersion(true);
      setLicenseKey(stored);
    } else if (isCustomer) {
      setIsDeveloper(false);
      setIsFullVersion(true);
      setLicenseKey(deobfuscatedStored);
    }
  }, []);

  const activateLicense = (inputKey: string) => {
    const isDev = DEV_KEYS.includes(inputKey);
    const isCustomer = inputKey === MGCONSULT_KEY;

    if (isDev || isCustomer) {
      // Store obfuscated if it's a customer key, plain if it's dev
      const storageValue = isCustomer ? obfuscate(inputKey) : inputKey;
      localStorage.setItem(STORAGE_KEY, storageValue);
      
      setLicenseKey(inputKey);
      setIsDeveloper(isDev);
      setIsFullVersion(true);

      toast.success(isDev ? "Modo Desenvolvedor Ativado!" : "Acesso MG Consult Ativado!", {
        description: "Você agora possui acesso ao banco de dados oficial.",
      });
      return true;
    } else {
      toast.error("Chave de Acesso Inválida", {
        description: "Verifique o código ou entre em contato com o suporte.",
      });
      return false;
    }
  };

  const deactivateLicense = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLicenseKey(null);
    setIsDeveloper(false);
    setIsFullVersion(false);
    window.location.reload(); 
  };

  return (
    <LicenseContext.Provider value={{ 
      isFullVersion, 
      isDeveloper, 
      licenseKey, 
      activateLicense, 
      deactivateLicense 
    }}>
      {children}
    </LicenseContext.Provider>
  );
}

export function useLicense() {
  const context = useContext(LicenseContext);
  if (!context) {
    throw new Error("useLicense must be used within a LicenseProvider");
  }
  return context;
}
