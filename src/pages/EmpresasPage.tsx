import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompany } from "@/lib/company-context";
import type { Company } from "@/lib/types";
import { MIN_PHOTOS_REQUIRED } from "@/lib/types";
import { Plus, Building2, Pencil, Trash2, Monitor, Layers, Camera, ClipboardCheck, AlertTriangle, MapPin, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

async function fetchAddressByCep(cep: string) {
  const cleanCep = cep.replace(/\D/g, "");
  if (cleanCep.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return {
      address: data.logradouro || "",
      neighborhood: data.bairro || "",
      city: data.localidade || "",
      state: data.uf || "",
    };
  } catch {
    return null;
  }
}

export default function EmpresasPage() {
  const { companies, addCompany, updateCompany, deleteCompany, sectors, workstations, analyses, posturePhotos, riskAssessments } = useCompany();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [name, setName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cnaePrincipal, setCnaePrincipal] = useState("");
  const [cnaeSecundario, setCnaeSecundario] = useState("");
  const [activityRisk, setActivityRisk] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);

  const handleCepLookup = async () => {
    setLoadingCep(true);
    const result = await fetchAddressByCep(cep);
    if (result) {
      setAddress(result.address);
      setNeighborhood(result.neighborhood);
      setCity(result.city);
      setState(result.state);
      toast.success("Endereço preenchido pelo CEP!");
    } else {
      toast.error("CEP não encontrado");
    }
    setLoadingCep(false);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const data = { name, trade_name: tradeName, cnpj, cnae_principal: cnaePrincipal, cnae_secundario: cnaeSecundario, activity_risk: activityRisk, cep, address, neighborhood, city, state, description };
    if (editing) {
      await updateCompany(editing.id, data);
    } else {
      await addCompany(data);
    }
    resetForm();
  };

  const resetForm = () => {
    setName(""); setTradeName(""); setCnpj(""); setCnaePrincipal(""); setCnaeSecundario("");
    setActivityRisk(""); setCep(""); setAddress(""); setNeighborhood(""); setCity(""); setState(""); setDescription("");
    setEditing(null); setOpen(false);
  };

  const handleEdit = (c: Company) => {
    setEditing(c); setName(c.name); setTradeName(c.trade_name || ""); setCnpj(c.cnpj);
    setCnaePrincipal(c.cnae_principal || ""); setCnaeSecundario(c.cnae_secundario || "");
    setActivityRisk(c.activity_risk || ""); setCep(c.cep || "");
    setAddress(c.address); setNeighborhood(c.neighborhood || ""); setCity(c.city); setState(c.state);
    setDescription(c.description); setOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Empresas</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Cadastre e gerencie as empresas — {companies.length} cadastrada(s)</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Empresa</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Razão Social *</Label>
                  <Input placeholder="Razão Social" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Nome Fantasia</Label>
                  <Input placeholder="Nome Fantasia" value={tradeName} onChange={(e) => setTradeName(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">CNPJ</Label>
                  <Input placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">Risco da Atividade (NR-04)</Label>
                  <Input placeholder="Ex: 02" value={activityRisk} onChange={(e) => setActivityRisk(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">CNAE Principal</Label>
                  <Input placeholder="Ex: 56.11-2-03" value={cnaePrincipal} onChange={(e) => setCnaePrincipal(e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">CNAE Secundário</Label>
                  <Input placeholder="Ex: 56.11-2-01" value={cnaeSecundario} onChange={(e) => setCnaeSecundario(e.target.value)} />
                </div>
              </div>

              <div className="border-t pt-3">
                <Label className="text-xs font-semibold text-muted-foreground">Endereço</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div className="col-span-2">
                    <Label className="text-xs">CEP</Label>
                    <Input placeholder="00000-000" value={cep} onChange={(e) => setCep(e.target.value)} />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleCepLookup} disabled={loadingCep}>
                      {loadingCep ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5 mr-1" />}
                      Buscar
                    </Button>
                  </div>
                </div>
                <div className="mt-2">
                  <Label className="text-xs">Logradouro</Label>
                  <Input placeholder="Endereço completo" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <Label className="text-xs">Bairro</Label>
                    <Input placeholder="Bairro" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">Cidade</Label>
                    <Input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs">UF</Label>
                    <Input placeholder="UF" value={state} onChange={(e) => setState(e.target.value)} />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs">Descrição da atividade</Label>
                <Textarea placeholder="Descrição da atividade da empresa" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <Button onClick={handleSave} className="w-full">{editing ? "Salvar" : "Criar Empresa"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {companies.map((company) => {
          const companySectors = sectors.filter((s) => s.company_id === company.id);
          const sectorIds = companySectors.map((s) => s.id);
          const companyWs = workstations.filter((w) => sectorIds.includes(w.sector_id));
          const wsIds = companyWs.map((w) => w.id);
          const companyAnalyses = analyses.filter((a) => wsIds.includes(a.workstation_id));
          const companyPhotos = posturePhotos.filter((p) => wsIds.includes(p.workstation_id));
          const wsReady = companyWs.filter((w) => companyPhotos.filter((p) => p.workstation_id === w.id).length >= MIN_PHOTOS_REQUIRED).length;
          const companyRisks = riskAssessments.filter((r) => companyAnalyses.some((a) => a.id === r.analysis_id));
          const criticalRisks = companyRisks.filter((r) => r.risk_level === "critical" || r.risk_level === "high").length;
          const completedAnalyses = companyAnalyses.filter((a) => a.analysis_status === "completed").length;

          return (
            <Card key={company.id} className="overflow-hidden">
              <CardHeader className="pb-2 flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="h-4 w-4 text-accent shrink-0" />
                  <CardTitle className="text-sm truncate">{company.trade_name || company.name}</CardTitle>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(company)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteCompany(company.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-[10px] text-muted-foreground">{company.name}</p>
                {company.cnpj && <p className="text-xs text-muted-foreground">CNPJ: {company.cnpj}</p>}
                {company.cnae_principal && <p className="text-[10px] text-muted-foreground">CNAE: {company.cnae_principal}</p>}
                {company.address && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{company.address}{company.neighborhood ? `, ${company.neighborhood}` : ""} — {company.city}/{company.state}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground line-clamp-2">{company.description}</p>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="text-center p-1.5 rounded bg-accent/10">
                    <Layers className="h-3 w-3 text-accent mx-auto mb-0.5" />
                    <p className="text-xs font-bold">{companySectors.length}</p>
                    <p className="text-[8px] text-muted-foreground">Setores</p>
                  </div>
                  <div className="text-center p-1.5 rounded bg-accent/10">
                    <Monitor className="h-3 w-3 text-accent mx-auto mb-0.5" />
                    <p className="text-xs font-bold">{companyWs.length}</p>
                    <p className="text-[8px] text-muted-foreground">Postos</p>
                  </div>
                  <div className="text-center p-1.5 rounded bg-accent/10">
                    <Camera className="h-3 w-3 text-accent mx-auto mb-0.5" />
                    <p className="text-xs font-bold">{companyPhotos.length}</p>
                    <p className="text-[8px] text-muted-foreground">Fotos</p>
                  </div>
                  <div className="text-center p-1.5 rounded bg-accent/10">
                    <ClipboardCheck className="h-3 w-3 text-accent mx-auto mb-0.5" />
                    <p className="text-xs font-bold">{companyAnalyses.length}</p>
                    <p className="text-[8px] text-muted-foreground">Análises</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                    <span>Análises concluídas</span>
                    <span>{completedAnalyses}/{companyAnalyses.length}</span>
                  </div>
                  <Progress value={companyAnalyses.length > 0 ? (completedAnalyses / companyAnalyses.length) * 100 : 0} className="h-1.5" />
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">{wsReady} posto(s) pronto(s)</Badge>
                  {criticalRisks > 0 && (
                    <Badge variant="outline" className="bg-critical/10 text-critical border-critical/20 text-[10px]">
                      <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />{criticalRisks} risco(s)
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
