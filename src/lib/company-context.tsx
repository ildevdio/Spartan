import { createContext, useContext, useState, useMemo, useEffect, useCallback, type ReactNode } from "react";
import type { Company, Sector, Workstation, Analysis, PosturePhoto, Report, RiskAssessment, ActionPlan, PsychosocialAnalysis, PostureAnalysis, QuestionnaireResponse } from "./types";
import { masterSupabase, supabase } from "@/integrations/supabase/client";
import { useLicense } from "./license-context";
import { mockSupabase } from "./mock-db";
import { toast } from "sonner";
import { obfuscate } from "./crypto";

interface CompanyContextType {
  loading: boolean;
  companies: Company[];
  selectedCompanyId: string;
  setSelectedCompanyId: (id: string) => void;
  selectedCompany: Company | undefined;

  sectors: Sector[];
  workstations: Workstation[];
  analyses: Analysis[];
  posturePhotos: PosturePhoto[];
  reports: Report[];
  riskAssessments: RiskAssessment[];
  actionPlans: ActionPlan[];
  psychosocialAnalyses: PsychosocialAnalysis[];
  postureAnalyses: PostureAnalysis[];
  questionnaireResponses: QuestionnaireResponse[];

  // Filtered by selected company
  companySectors: Sector[];
  companyWorkstations: Workstation[];
  companyAnalyses: Analysis[];
  companyPhotos: PosturePhoto[];
  companyReports: Report[];
  companyQuestionnaireResponses: QuestionnaireResponse[];

  // CRUD helpers
  addCompany: (c: Omit<Company, "id" | "created_at">, dbConfig?: { url: string; key: string }) => Promise<void>;
  updateCompany: (id: string, c: Partial<Company>) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
  addSector: (s: Omit<Sector, "id" | "created_at">) => Promise<void>;
  updateSector: (id: string, s: Partial<Sector>) => Promise<void>;
  deleteSector: (id: string) => Promise<void>;
  addWorkstation: (w: Omit<Workstation, "id" | "created_at">) => Promise<void>;
  updateWorkstation: (id: string, w: Partial<Workstation>) => Promise<void>;
  deleteWorkstation: (id: string) => Promise<void>;
  addAnalysis: (a: Omit<Analysis, "id" | "created_at">) => Promise<void>;
  updateAnalysis: (id: string, a: Partial<Analysis>) => Promise<void>;
  deleteAnalysis: (id: string) => Promise<void>;
  addPosturePhoto: (p: Omit<PosturePhoto, "id" | "created_at">) => Promise<void>;
  addReport: (r: Omit<Report, "id" | "created_at">) => Promise<void>;
  updateReport: (id: string, r: Partial<Report>) => Promise<void>;
  addRiskAssessment: (r: Omit<RiskAssessment, "id" | "created_at">) => Promise<void>;
  updateRiskAssessment: (id: string, r: Partial<RiskAssessment>) => Promise<void>;
  addActionPlan: (a: Omit<ActionPlan, "id" | "created_at">) => Promise<void>;
  updateActionPlan: (id: string, a: Partial<ActionPlan>) => Promise<void>;
  addPsychosocialAnalysis: (p: Omit<PsychosocialAnalysis, "id" | "created_at">) => Promise<void>;
  deletePsychosocialAnalysis: (id: string) => Promise<void>;
  deletePosturePhoto: (id: string) => Promise<void>;
  refreshCompanies: () => Promise<void>;
  deleteQuestionnaireResponse: (id: string) => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [posturePhotos, setPosturePhotos] = useState<PosturePhoto[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [actionPlans, setActionPlans] = useState<ActionPlan[]>([]);
  const [psychosocialAnalyses, setPsychosocialAnalyses] = useState<PsychosocialAnalysis[]>([]);
  const [postureAnalyses, setPostureAnalyses] = useState<PostureAnalysis[]>([]);
  const [questionnaireResponses, setQuestionnaireResponses] = useState<QuestionnaireResponse[]>([]);

  const { isFullVersion } = useLicense();
  const db = isFullVersion ? supabase : mockSupabase;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: comp }, { data: sec }, { data: ws }, { data: an },
        { data: ph }, { data: rp }, { data: ra }, { data: ap },
        { data: psa }, { data: pa }, { data: qr }
      ] = await Promise.all([
        db.from("companies").select("*").order("created_at") as any,
        db.from("sectors").select("*").order("created_at") as any,
        db.from("workstations").select("*").order("created_at") as any,
        db.from("analyses").select("*").order("created_at") as any,
        db.from("posture_photos").select("*").order("created_at") as any,
        db.from("reports").select("*").order("created_at") as any,
        db.from("risk_assessments").select("*").order("created_at") as any,
        db.from("action_plans").select("*").order("created_at") as any,
        db.from("psychosocial_analyses").select("*").order("created_at") as any,
        db.from("posture_analyses").select("*").order("created_at") as any,
        db.from("questionnaire_responses").select("*").order("created_at") as any,
      ]);
      
      const mappedCompanies = (comp || []).map(c => ({ ...c, created_at: c.created_at?.split("T")[0] || "", trade_name: c.trade_name || "", cnae_principal: c.cnae_principal || "", cnae_secundario: c.cnae_secundario || "", activity_risk: c.activity_risk || "", cep: c.cep || "", neighborhood: c.neighborhood || "" })) as Company[];
      setCompanies(mappedCompanies);
      if (mappedCompanies.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(mappedCompanies[0].id);
      }
      setSectors((sec || []).map(s => ({ ...s, created_at: s.created_at?.split("T")[0] || "" })) as Sector[]);
      setWorkstations((ws || []).map(w => ({ ...w, created_at: w.created_at?.split("T")[0] || "" })) as Workstation[]);
      setAnalyses((an || []).map(a => ({
        ...a,
        body_parts: (a.body_parts && typeof a.body_parts === "object" ? a.body_parts : {}) as Record<string, number>,
        created_at: a.created_at?.split("T")[0] || "",
      })) as Analysis[]);
      setPosturePhotos((ph || []).map(p => ({ ...p, created_at: p.created_at?.split("T")[0] || "" })) as PosturePhoto[]);
      setReports((rp || []).map(r => ({ ...r, created_at: r.created_at?.split("T")[0] || "" })) as Report[]);
      setRiskAssessments((ra || []).map(r => ({
        ...r,
        created_at: r.created_at?.split("T")[0] || "",
      })) as RiskAssessment[]);
      setActionPlans((ap || []).map(a => ({ ...a, created_at: a.created_at?.split("T")[0] || "" })) as ActionPlan[]);
      setPsychosocialAnalyses((psa || []).map(p => ({
        ...p,
        nasa_tlx_details: p.nasa_tlx_details as PsychosocialAnalysis["nasa_tlx_details"],
        hse_it_details: p.hse_it_details as PsychosocialAnalysis["hse_it_details"],
        copenhagen_details: p.copenhagen_details as PsychosocialAnalysis["copenhagen_details"],
        created_at: p.created_at?.split("T")[0] || "",
      })) as PsychosocialAnalysis[]);
      setPostureAnalyses((pa || []).map(p => ({
        ...p,
        joint_angles: (p.joint_angles && typeof p.joint_angles === "object" ? p.joint_angles : {}) as Record<string, number>,
        ergonomic_scores: (p.ergonomic_scores && typeof p.ergonomic_scores === "object" ? p.ergonomic_scores : {}) as Record<string, number>,
        created_at: p.created_at?.split("T")[0] || "",
      })) as PostureAnalysis[]);
      setQuestionnaireResponses((qr || []).map(q => ({
        ...q,
        created_at: q.created_at?.split("T")[0] || "",
      })) as QuestionnaireResponse[]);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    fetchAll();

    // REAL-TIME SYNC: Listen for questionnaire responses from online forms
    const channel = db.channel('spartan-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'questionnaire_responses' 
      }, () => {
        console.log("[Spartan] Real-time update detected: questionnaire_responses");
        fetchAll();
      })
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, [fetchAll, db]);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  const companySectors = useMemo(() => sectors.filter((s) => s.company_id === selectedCompanyId), [sectors, selectedCompanyId]);
  const companySectorIds = useMemo(() => companySectors.map((s) => s.id), [companySectors]);
  const companyWorkstations = useMemo(() => workstations.filter((w) => companySectorIds.includes(w.sector_id)), [workstations, companySectorIds]);
  const companyWsIds = useMemo(() => companyWorkstations.map((w) => w.id), [companyWorkstations]);
  const companyAnalyses = useMemo(() => analyses.filter((a) => companyWsIds.includes(a.workstation_id)), [analyses, companyWsIds]);
  const companyPhotos = useMemo(() => posturePhotos.filter((p) => companyWsIds.includes(p.workstation_id)), [posturePhotos, companyWsIds]);
  const companyReports = useMemo(() => reports.filter((r) => {
    if (r.workstation_id) return companyWsIds.includes(r.workstation_id);
    if (r.sector_id) return companySectorIds.includes(r.sector_id);
    if (r.company_id) return r.company_id === selectedCompanyId;
    return false;
  }), [reports, companyWsIds, companySectorIds, selectedCompanyId]);

  const companyQuestionnaireResponses = useMemo(() => questionnaireResponses.filter(q => q.company_id === selectedCompanyId), [questionnaireResponses, selectedCompanyId]);

  // CRUD helpers
  const addCompany = async (c: Omit<Company, "id" | "created_at">, dbConfig?: { url: string; key: string }) => {
    try {
      const { logo_preview, ...cleanData } = c as any;
      let finalLicenseKey = cleanData.license_key;

      // Automated Database Registration Logic
      if (dbConfig?.url && dbConfig?.key) {
        const slug = (cleanData.trade_name || cleanData.name)
          .toUpperCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^A-Z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
        
        const licenseId = `SPARTAN-2024-${slug}`;
        
        // 1. Register in Master Database
        const { error: masterError } = await masterSupabase
          .from('master_licenses')
          .insert([{
            license_id: licenseId,
            client_name: cleanData.name,
            target_supabase_url: dbConfig.url,
            target_supabase_anon_key: dbConfig.key
          }]);

        if (masterError) {
          console.error("Master license creation error:", masterError);
          toast.error("Erro ao registrar instância mestre. A empresa será criada sem vínculo automático.");
        } else {
          finalLicenseKey = obfuscate(licenseId);
          toast.info(`Instância vinculada: ${licenseId}`);
        }
      }

      // 2. Save Company (with potentially new license key)
      const { error } = await db.from("companies").insert({
        ...cleanData,
        license_key: finalLicenseKey
      });

      if (error) {
        console.error("Add company error:", error);
        toast.error("Erro ao criar empresa: " + (error.message || "Erro desconhecido"));
        return;
      }

      toast.success("Novo cliente registrado com sucesso!");
      await fetchAll();
    } catch (err: any) {
      console.error("Add company exception:", err);
      toast.error("Falha no cadastro: " + (err.message || "Tente novamente"));
    }
  };
  const updateCompany = async (id: string, c: Partial<Company>) => {
    const { error } = await db.from("companies").update(c).eq("id", id);
    if (error) { toast.error("Erro ao atualizar empresa"); return; }
    await fetchAll();
  };
  const deleteCompany = async (id: string) => {
    const { error } = await db.from("companies").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir empresa"); return; }
    await fetchAll();
  };
  const addSector = async (s: Omit<Sector, "id" | "created_at">) => {
    const { error } = await db.from("sectors").insert(s);
    if (error) { toast.error("Erro ao criar setor"); return; }
    await fetchAll();
  };
  const updateSector = async (id: string, s: Partial<Sector>) => {
    const { error } = await db.from("sectors").update(s).eq("id", id);
    if (error) { toast.error("Erro ao atualizar setor"); return; }
    await fetchAll();
  };
  const deleteSector = async (id: string) => {
    const { error } = await db.from("sectors").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir setor"); return; }
    await fetchAll();
  };
  const addWorkstation = async (w: Omit<Workstation, "id" | "created_at">) => {
    const { error } = await db.from("workstations").insert(w);
    if (error) { toast.error("Erro ao criar posto"); return; }
    await fetchAll();
  };
  const updateWorkstation = async (id: string, w: Partial<Workstation>) => {
    const { error } = await db.from("workstations").update(w).eq("id", id);
    if (error) { toast.error("Erro ao atualizar posto"); return; }
    await fetchAll();
  };
  const deleteWorkstation = async (id: string) => {
    const { error } = await db.from("workstations").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir posto"); return; }
    await fetchAll();
  };
  const addAnalysis = async (a: Omit<Analysis, "id" | "created_at">) => {
    const { error } = await db.from("analyses").insert({
      workstation_id: a.workstation_id,
      method: a.method,
      score: a.score,
      notes: a.notes,
      body_parts: a.body_parts,
      analysis_status: a.analysis_status,
    });
    if (error) { toast.error("Erro ao criar análise"); return; }
    await fetchAll();
  };
  const updateAnalysis = async (id: string, a: Partial<Analysis>) => {
    const { error } = await db.from("analyses").update(a).eq("id", id);
    if (error) { toast.error("Erro ao atualizar análise"); return; }
    await fetchAll();
  };
  const deleteAnalysis = async (id: string) => {
    const { error } = await db.from("analyses").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir análise"); return; }
    await fetchAll();
  };
  const addPosturePhoto = async (p: Omit<PosturePhoto, "id" | "created_at">) => {
    const { error } = await db.from("posture_photos").insert(p);
    if (error) { toast.error("Erro ao adicionar foto"); return; }
    await fetchAll();
  };
  const addReport = async (r: Omit<Report, "id" | "created_at">) => {
    const { error } = await db.from("reports").insert(r);
    if (error) { toast.error("Erro ao criar relatório"); return; }
    await fetchAll();
  };
  const updateReport = async (id: string, r: Partial<Report>) => {
    const { error } = await db.from("reports").update(r).eq("id", id);
    if (error) { toast.error("Erro ao atualizar relatório"); return; }
    await fetchAll();
  };
  const addRiskAssessment = async (r: Omit<RiskAssessment, "id" | "created_at">) => {
    const { error } = await db.from("risk_assessments").insert(r);
    if (error) { toast.error("Erro ao criar avaliação de risco"); return; }
    await fetchAll();
  };
  const updateRiskAssessment = async (id: string, r: Partial<RiskAssessment>) => {
    const { error } = await db.from("risk_assessments").update(r).eq("id", id);
    if (error) { toast.error("Erro ao atualizar avaliação"); return; }
    await fetchAll();
  };
  const addActionPlan = async (a: Omit<ActionPlan, "id" | "created_at">) => {
    const { error } = await db.from("action_plans").insert(a);
    if (error) { toast.error("Erro ao criar ação"); return; }
    await fetchAll();
  };
  const updateActionPlan = async (id: string, a: Partial<ActionPlan>) => {
    const { error } = await db.from("action_plans").update(a).eq("id", id);
    if (error) { toast.error("Erro ao atualizar ação"); return; }
    await fetchAll();
  };
  const addPsychosocialAnalysis = async (p: Omit<PsychosocialAnalysis, "id" | "created_at">) => {
    const { error } = await db.from("psychosocial_analyses").insert({
      company_id: p.company_id,
      workstation_id: p.workstation_id || null,
      evaluator_name: p.evaluator_name,
      nasa_tlx_score: p.nasa_tlx_score,
      nasa_tlx_details: p.nasa_tlx_details as any,
      hse_it_score: p.hse_it_score,
      hse_it_details: p.hse_it_details as any,
      copenhagen_score: p.copenhagen_score,
      copenhagen_details: p.copenhagen_details as any,
      observations: p.observations,
    });
    if (error) { toast.error("Erro ao criar avaliação psicossocial"); return; }
    await fetchAll();
  };
  const deletePsychosocialAnalysis = async (id: string) => {
    const { error } = await db.from("psychosocial_analyses").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir avaliação psicossocial"); return; }
    await fetchAll();
  };
  const deletePosturePhoto = async (id: string) => {
    const { error } = await db.from("posture_photos").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir foto de postura"); return; }
    await fetchAll();
  };

  const deleteQuestionnaireResponse = async (id: string) => {
    const { error } = await db.from("questionnaire_responses").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir resposta"); return; }
    await fetchAll();
  };

  return (
    <CompanyContext.Provider value={{
      loading,
      companies, selectedCompanyId, setSelectedCompanyId, selectedCompany,
      sectors, workstations, analyses, posturePhotos, reports,
      riskAssessments, actionPlans, psychosocialAnalyses, postureAnalyses, questionnaireResponses,
      companySectors, companyWorkstations, companyAnalyses, companyPhotos, companyReports, companyQuestionnaireResponses,
      addCompany, updateCompany, deleteCompany,
      addSector, updateSector, deleteSector,
      addWorkstation, updateWorkstation, deleteWorkstation,
      addAnalysis, updateAnalysis, deleteAnalysis,
      addPosturePhoto, addReport, updateReport,
      addRiskAssessment, updateRiskAssessment,
      addActionPlan, updateActionPlan,
      addPsychosocialAnalysis, deletePsychosocialAnalysis,
      deletePosturePhoto,
      refreshCompanies: fetchAll,
      deleteQuestionnaireResponse,
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
