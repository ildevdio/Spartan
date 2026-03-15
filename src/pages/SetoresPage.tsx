import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompany } from "@/lib/company-context";
import { CompanySelector } from "@/components/CompanySelector";
import { mockRiskAssessments } from "@/lib/mock-data";
import type { Sector } from "@/lib/types";
import { MIN_PHOTOS_REQUIRED } from "@/lib/types";
import { Plus, Building2, Pencil, Trash2, Monitor, Camera, ClipboardCheck, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function SetoresPage() {
  const { companySectors, sectors, setSectors, selectedCompanyId, workstations, analyses, posturePhotos } = useCompany();
  const [open, setOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingSector) {
      setSectors(sectors.map((s) => (s.id === editingSector.id ? { ...s, name, description } : s)));
    } else {
      setSectors([...sectors, {
        id: `s${Date.now()}`,
        company_id: selectedCompanyId,
        name,
        description,
        created_at: new Date().toISOString().split("T")[0],
      }]);
    }
    resetForm();
  };

  const resetForm = () => { setName(""); setDescription(""); setEditingSector(null); setOpen(false); };

  const handleEdit = (sector: Sector) => {
    setEditingSector(sector); setName(sector.name); setDescription(sector.description); setOpen(true);
  };

  const handleDelete = (id: string) => { setSectors(sectors.filter((s) => s.id !== id)); };

  // Summary stats
  const totalWs = workstations.filter((w) => companySectors.some((s) => s.id === w.sector_id)).length;
  const totalAnalyses = analyses.filter((a) => workstations.filter((w) => companySectors.some((s) => s.id === w.sector_id)).some((w) => w.id === a.workstation_id)).length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Setores</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {companySectors.length} setor(es) — {totalWs} posto(s) — {totalAnalyses} análise(s)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CompanySelector />
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Novo Setor</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg">
              <DialogHeader><DialogTitle>{editingSector ? "Editar Setor" : "Novo Setor"}</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Input placeholder="Nome do setor" value={name} onChange={(e) => setName(e.target.value)} />
                <Textarea placeholder="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Button onClick={handleSave} className="w-full">{editingSector ? "Salvar" : "Criar Setor"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {companySectors.map((sector) => {
          const sectorWs = workstations.filter((w) => w.sector_id === sector.id);
          const wsIds = sectorWs.map((w) => w.id);
          const sectorAnalyses = analyses.filter((a) => wsIds.includes(a.workstation_id));
          const sectorPhotos = posturePhotos.filter((p) => wsIds.includes(p.workstation_id));
          const wsReady = sectorWs.filter((w) => sectorPhotos.filter((p) => p.workstation_id === w.id).length >= MIN_PHOTOS_REQUIRED).length;
          const completedAnalyses = sectorAnalyses.filter((a) => a.analysis_status === "completed").length;
          const sectorRisks = mockRiskAssessments.filter((r) => sectorAnalyses.some((a) => a.id === r.analysis_id));
          const criticalCount = sectorRisks.filter((r) => r.risk_level === "high" || r.risk_level === "critical").length;

          return (
            <Card key={sector.id}>
              <CardHeader className="pb-2 flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="h-4 w-4 text-accent shrink-0" />
                  <CardTitle className="text-sm truncate">{sector.name}</CardTitle>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(sector)}><Pencil className="h-3 w-3" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(sector.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground line-clamp-2">{sector.description}</p>

                <div className="grid grid-cols-3 gap-1.5">
                  <div className="text-center p-1.5 rounded bg-accent/10">
                    <Monitor className="h-3 w-3 text-accent mx-auto mb-0.5" />
                    <p className="text-xs font-bold">{sectorWs.length}</p>
                    <p className="text-[8px] text-muted-foreground">Postos</p>
                  </div>
                  <div className="text-center p-1.5 rounded bg-accent/10">
                    <Camera className="h-3 w-3 text-accent mx-auto mb-0.5" />
                    <p className="text-xs font-bold">{sectorPhotos.length}</p>
                    <p className="text-[8px] text-muted-foreground">Fotos</p>
                  </div>
                  <div className="text-center p-1.5 rounded bg-accent/10">
                    <ClipboardCheck className="h-3 w-3 text-accent mx-auto mb-0.5" />
                    <p className="text-xs font-bold">{sectorAnalyses.length}</p>
                    <p className="text-[8px] text-muted-foreground">Análises</p>
                  </div>
                </div>

                {sectorAnalyses.length > 0 && (
                  <div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Progresso das análises</span>
                      <span>{completedAnalyses}/{sectorAnalyses.length}</span>
                    </div>
                    <Progress value={(completedAnalyses / sectorAnalyses.length) * 100} className="h-1.5" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">{wsReady}/{sectorWs.length} prontos</Badge>
                  {criticalCount > 0 && (
                    <Badge variant="outline" className="bg-high/10 text-high border-high/20 text-[10px]">
                      <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />{criticalCount}
                    </Badge>
                  )}
                </div>

                {/* Workstation list */}
                {sectorWs.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-border">
                    {sectorWs.map((w) => {
                      const photoCount = sectorPhotos.filter((p) => p.workstation_id === w.id).length;
                      return (
                        <div key={w.id} className="flex items-center justify-between text-[10px] py-1">
                          <span className="text-muted-foreground truncate">{w.name}</span>
                          <span className={`${photoCount >= MIN_PHOTOS_REQUIRED ? "text-success" : "text-warning"}`}>
                            {photoCount}/{MIN_PHOTOS_REQUIRED}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        {companySectors.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              Nenhum setor cadastrado.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}