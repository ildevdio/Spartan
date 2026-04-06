import { createContext, useContext, useState, useEffect } from "react";
import { masterSupabase, updateSupabaseConfig } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { obfuscate, deobfuscate } from "./crypto";

interface LicenseContextType {
  isFullVersion: boolean;
  isDeveloper: boolean;
  licenseKey: string | null;
  showUpgradeDialog: boolean;
  setShowUpgradeDialog: (show: boolean) => void;
  activateLicense: (key: string) => Promise<boolean>;
  deactivateLicense: () => void;
}

export const LicenseContext = createContext<LicenseContextType | null>(null);

const MGCONSULT_KEY = deobfuscate(import.meta.env.VITE_SPARTAN_MGCONSULT_LICENSE_KEY || "");
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
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  useEffect(() => {
    // Check for auto-open flag from an earlier logout
    const shouldOpen = localStorage.getItem("spartan_open_activation");
    if (shouldOpen === "true") {
      setTimeout(() => {
        setShowUpgradeDialog(true);
        localStorage.removeItem("spartan_open_activation");
      }, 300);
    }
  }, []);

  useEffect(() => {
    const checkPersistedLicense = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      const isDev = DEV_KEYS.includes(stored);
      
      if (isDev) {
        setIsDeveloper(true);
        setIsFullVersion(true);
        setLicenseKey(stored);
      } else {
        // It's a customer instance (obfuscated or plain key stored)
        const deobfuscatedStored = deobfuscate(stored);
        
        // 1. Check if it's the internal MG_Consult fallback
        if (deobfuscatedStored === MGCONSULT_KEY) {
          setLicenseKey(deobfuscatedStored);
          setIsFullVersion(true);
          return;
        }

        // 2. We always verify with master DB to get config
        const { data: masterLicense } = await masterSupabase
          .from('master_licenses')
          .select('*')
          .or(`license_id.eq.${stored},license_id.eq.${deobfuscatedStored}`)
          .eq('is_active', true)
          .maybeSingle();

        if (masterLicense) {
          if (masterLicense.target_supabase_url) {
            updateSupabaseConfig(
              masterLicense.target_supabase_url, 
              masterLicense.target_supabase_anon_key
            );
          }
          setLicenseKey(masterLicense.license_id);
          setIsFullVersion(true);
        } else {
          // Key no longer valid or deactivated
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    };
    
    checkPersistedLicense();
  }, []);


  const activateLicense = async (inputKey: string) => {
    try {
      // 1. Check if it's a Developer key first
      const isDev = DEV_KEYS.includes(inputKey);
      
      // 2. Lookup in Master Database for private instances
      const { data: masterLicense, error: masterError } = await masterSupabase
        .from('master_licenses')
        .select('*')
        .eq('license_id', inputKey)
        .eq('is_active', true)
        .maybeSingle();

      if (masterError) {
         console.error("Master DB lookup error:", masterError);
      }

      const isMGConsult = inputKey === MGCONSULT_KEY;

      if (isDev || masterLicense || isMGConsult) {
        // If it's a private instance, switch the database!
        if (masterLicense && masterLicense.target_supabase_url) {
          updateSupabaseConfig(
            masterLicense.target_supabase_url, 
            masterLicense.target_supabase_anon_key
          );
        }

        const isCustomer = !isDev;
        const storageValue = isCustomer ? obfuscate(inputKey) : inputKey;
        
        localStorage.setItem(STORAGE_KEY, storageValue);
        setLicenseKey(inputKey);
        setIsDeveloper(isDev);
        setIsFullVersion(true);
        
        toast.success(isDev ? "Modo Desenvolvedor Ativado!" : `Acesso Pro: ${masterLicense?.client_name || "Spartan Pro"}`);
        
        // Reload to ensure all contexts (CompanyContext) refresh their queries with the NEW client
        setTimeout(() => window.location.reload(), 1000);
        return true;
      } else {
        toast.error("Chave de Acesso Inválida ou Expirada");
        return false;
      }
    } catch (err) {
      console.error("Activation error:", err);
      toast.error("Erro na ativação da licença");
      return false;
    }
  };

  const deactivateLicense = () => {
    localStorage.removeItem(STORAGE_KEY);
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase') || key.includes('auth-token')) {
        localStorage.removeItem(key);
      }
    });

    localStorage.setItem("spartan_open_activation", "true");
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
      showUpgradeDialog,
      setShowUpgradeDialog,
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
