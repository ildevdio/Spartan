import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import type { Company, Sector, Workstation, Analysis, PosturePhoto, Report } from "./types";
import { mockCompanies, mockSectors, mockWorkstations, mockAnalyses, mockPosturePhotos, mockReports } from "./mock-data";

interface CompanyContextType {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  selectedCompany: Company | undefined;

  // All data
  sectors: Sector[];
  setSectors: React.Dispatch<React.SetStateAction<Sector[]>>;
  workstations: Workstation[];
  setWorkstations: React.Dispatch<React.SetStateAction<Workstation[]>>;
  analyses: Analysis[];
  setAnalyses: React.Dispatch<React.SetStateAction<Analysis[]>>;
  posturePhotos: PosturePhoto[];
  setPosturePhotos: React.Dispatch<React.SetStateAction<PosturePhoto[]>>;
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;

  // Filtered by selected company
  companySectors: Sector[];
  companyWorkstations: Workstation[];
  companyAnalyses: Analysis[];
  companyPhotos: PosturePhoto[];
  companyReports: Report[];
}

const CompanyContext = createContext<CompanyContextType | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(mockCompanies[0]?.id || "");
  const [sectors, setSectors] = useState<Sector[]>(mockSectors);
  const [workstations, setWorkstations] = useState<Workstation[]>(mockWorkstations);
  const [analyses, setAnalyses] = useState<Analysis[]>(mockAnalyses);
  const [posturePhotos, setPosturePhotos] = useState<PosturePhoto[]>(mockPosturePhotos);
  const [reports, setReports] = useState<Report[]>(mockReports);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  const companySectors = useMemo(
    () => sectors.filter((s) => s.company_id === selectedCompanyId),
    [sectors, selectedCompanyId]
  );

  const companySectorIds = useMemo(() => companySectors.map((s) => s.id), [companySectors]);

  const companyWorkstations = useMemo(
    () => workstations.filter((w) => companySectorIds.includes(w.sector_id)),
    [workstations, companySectorIds]
  );

  const companyWsIds = useMemo(() => companyWorkstations.map((w) => w.id), [companyWorkstations]);

  const companyAnalyses = useMemo(
    () => analyses.filter((a) => companyWsIds.includes(a.workstation_id)),
    [analyses, companyWsIds]
  );

  const companyPhotos = useMemo(
    () => posturePhotos.filter((p) => companyWsIds.includes(p.workstation_id)),
    [posturePhotos, companyWsIds]
  );

  const companyReports = useMemo(
    () => reports.filter((r) => {
      if (r.workstation_id) return companyWsIds.includes(r.workstation_id);
      if (r.sector_id) return companySectorIds.includes(r.sector_id);
      return true;
    }),
    [reports, companyWsIds, companySectorIds]
  );

  return (
    <CompanyContext.Provider value={{
      companies, setCompanies,
      selectedCompanyId, setSelectedCompanyId,
      selectedCompany,
      sectors, setSectors,
      workstations, setWorkstations,
      analyses, setAnalyses,
      posturePhotos, setPosturePhotos,
      reports, setReports,
      companySectors, companyWorkstations, companyAnalyses, companyPhotos, companyReports,
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used within CompanyProvider");
  return ctx;
}
