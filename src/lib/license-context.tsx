import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface LicenseContextType {
  isFullVersion: boolean;
  licenseKey: string | null;
  activateLicense: (key: string) => boolean;
  deactivateLicense: () => void;
}

const LicenseContext = createContext<LicenseContextType | null>(null);

const VALID_LICENSE_KEY = "SPARTAN-2024-MGCONSULT";
const DEV_LICENSE_KEY = "SPARTAN-DEV-DIOGO-2024";
const STORAGE_KEY = "spartan_license_key";

export function LicenseProvider({ children }: { children: React.ReactNode }) {
  const [licenseKey, setLicenseKey] = useState<string | null>(localStorage.getItem(STORAGE_KEY));
  const [isFullVersion, setIsFullVersion] = useState(false);

  useEffect(() => {
    if (licenseKey === VALID_LICENSE_KEY || licenseKey === DEV_LICENSE_KEY) {
      setIsFullVersion(true);
    } else {
      setIsFullVersion(false);
    }
  }, [licenseKey]);

  const activateLicense = (key: string) => {
    if (key === VALID_LICENSE_KEY || key === DEV_LICENSE_KEY) {
      localStorage.setItem(STORAGE_KEY, key);
      setLicenseKey(key);
      toast.success(key === DEV_LICENSE_KEY ? "Modo Desenvolvedor Ativado!" : "Licença Spartan Pro Ativada!", {
        description: "Agora você tem acesso total a todas as funcionalidades e ao banco de dados oficial.",
      });
      return true;
    } else {
      toast.error("Chave de Licença Inválida", {
        description: "Verifique o código ou entre em contato com o suporte.",
      });
      return false;
    }
  };

  const deactivateLicense = () => {
    localStorage.removeItem(STORAGE_KEY);
    setLicenseKey(null);
    window.location.reload(); // Refresh to clean states
  };

  return (
    <LicenseContext.Provider value={{ isFullVersion, licenseKey, activateLicense, deactivateLicense }}>
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
