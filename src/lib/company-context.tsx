import { createContext, useContext, useState, type ReactNode } from "react";
import type { Company } from "./types";
import { mockCompanies } from "./mock-data";

interface CompanyContextType {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  selectedCompany: Company | undefined;
}

const CompanyContext = createContext<CompanyContextType | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(mockCompanies[0]?.id || "");

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <CompanyContext.Provider value={{ companies, setCompanies, selectedCompanyId, setSelectedCompanyId, selectedCompany }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}
