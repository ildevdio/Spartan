import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompany } from "@/lib/company-context";
import { mockRiskAssessments, mockActionPlans, mockPostureAnalyses } from "@/lib/mock-data";
import type { Company } from "@/lib/types";
import { MIN_PHOTOS_REQUIRED } from "@/lib/types";
import { Plus, Building2, Pencil, Trash2, Monitor, Layers, Camera, ClipboardCheck, AlertTriangle, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function EmpresasPage() {
  const { companies, setCompanies, sectors, workstations, analyses, posturePhotos } = useCompany();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    if (editing) {
      setCompanies(companies.map((c) => c.id === editing.id ? { ...c, name, cnpj, address, city, state, description } : c));
    } else {
      setCompanies([...companies, { id: `comp${Date.now()}`, name, cnpj, address, city, state, description, created_at: new Date().toISOString().split("T")[0] }]);
    }
    resetForm();
  };

  const resetForm = () => {
    setName(""); setCnpj(""); setAddress(""); setCity(""); setState(""); setDescription(""); setEditing(null); setOpen(false);
  };

  const handleEdit = (c: Company) => {
    setEditing(c); setName(c.name); setCnpj(c.cnpj); setAddress(c.address); setCity(c.city); setState(c.state); setDescription(c.description); setOpen(true);
  };

  const handleDelete = (id: string) => {
    setCompanies(companies.filter((c) => c.id !== id));
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
          <DialogContent className="max-w-[95vw] sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Nome da empresa" value={name} onChange={(e) => setName(e.target.value)} />
              <Input placeholder="CNPJ" value={cnpj} onChange={(e) => setCnpj(e.target.value)} />
              <Input placeholder="Endereço" value={address} onChange={(e) => setAddress(e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input placeholder="UF" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <Textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
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
          const companyRisks = mockRiskAssessments.filter((r) => companyAnalyses.some((a) => a.id === r.analysis_id));
          const criticalRisks = companyRisks.filter((r) => r.risk_level === "critical" || r.risk_level === "high").length;
          const completedAnalyses = companyAnalyses.filter((a) => a.analysis_status === "completed").length;

          return (
            <Card key={company.id} className="overflow-hidden">
              <CardHeader className="pb-2 flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="h-4 w-4 text-accent shrink-0" />
                  <CardTitle className="text-sm truncate">{company.name}</CardTitle>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(company)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(company.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {company.cnpj && <p className="text-xs text-muted-foreground">CNPJ: {company.cnpj}</p>}
                {company.address && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{company.address} — {company.city}/{company.state}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground line-clamp-2">{company.description}</p>

                {/* Stats grid */}
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

                {/* Progress */}
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