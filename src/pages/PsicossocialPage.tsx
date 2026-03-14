import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCompany } from "@/lib/company-context";
import { CompanySelector } from "@/components/CompanySelector";
import type { PsychosocialAnalysis } from "@/lib/types";
import { mockPsychosocialAnalyses } from "@/lib/mock-data";
import { Plus, Brain, BarChart3, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function ScoreSlider({ label, value, onChange, max = 100, step = 5 }: {
  label: string; value: number; onChange: (v: number) => void; max?: number; step?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-foreground">{label}</label>
        <span className="text-xs font-bold text-accent">{value}</span>
      </div>
      <Slider value={[value]} onValueChange={(v) => onChange(v[0])} max={max} step={step} className="w-full" />
    </div>
  );
}

function classifyNasaTlx(score: number): { label: string; color: string } {
  if (score <= 30) return { label: "Baixa", color: "bg-success/15 text-success" };
  if (score <= 50) return { label: "Moderada", color: "bg-warning/15 text-warning" };
  if (score <= 70) return { label: "Alta", color: "bg-high/15 text-high" };
  return { label: "Muito Alta", color: "bg-critical/15 text-critical" };
}

function classifyHseIt(score: number): { label: string; color: string } {
  if (score >= 4) return { label: "Bom", color: "bg-success/15 text-success" };
  if (score >= 3) return { label: "Moderado", color: "bg-warning/15 text-warning" };
  if (score >= 2) return { label: "Ruim", color: "bg-high/15 text-high" };
  return { label: "Crítico", color: "bg-critical/15 text-critical" };
}

export default function PsicossocialPage() {
  const { selectedCompany, companyWorkstations, selectedCompanyId } = useCompany();
  const [analyses, setAnalyses] = useState<PsychosocialAnalysis[]>(mockPsychosocialAnalyses);
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<PsychosocialAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState("nasa-tlx");

  // Form state
  const [wsId, setWsId] = useState("");
  const [evaluator, setEvaluator] = useState("");
  const [observations, setObservations] = useState("");

  // NASA-TLX
  const [mentalDemand, setMentalDemand] = useState(50);
  const [physicalDemand, setPhysicalDemand] = useState(50);
  const [temporalDemand, setTemporalDemand] = useState(50);
  const [performance, setPerformance] = useState(50);
  const [effort, setEffort] = useState(50);
  const [frustration, setFrustration] = useState(50);

  // HSE-IT
  const [demands, setDemands] = useState(3);
  const [control, setControl] = useState(3);
  const [support, setSupport] = useState(3);
  const [relationships, setRelationships] = useState(3);
  const [role, setRole] = useState(3);
  const [change, setChange] = useState(3);

  // Copenhagen
  const [quantDemands, setQuantDemands] = useState(50);
  const [workPace, setWorkPace] = useState(50);
  const [cogDemands, setCogDemands] = useState(50);
  const [emoDemands, setEmoDemands] = useState(50);
  const [influence, setInfluence] = useState(50);
  const [possDev, setPossDev] = useState(50);
  const [meaningWork, setMeaningWork] = useState(50);
  const [commitment, setCommitment] = useState(50);
  const [predictability, setPredictability] = useState(50);
  const [socialSupport, setSocialSupport] = useState(50);

  const companyAnalyses = analyses.filter(a => a.company_id === selectedCompanyId);

  const handleSave = () => {
    if (!evaluator.trim()) { toast.error("Informe o avaliador."); return; }
    const nasaScore = Math.round((mentalDemand + physicalDemand + temporalDemand + performance + effort + frustration) / 6);
    const hseScore = Math.round(((demands + control + support + relationships + role + change) / 6) * 10) / 10;
    const copenhagenScore = Math.round((quantDemands + workPace + cogDemands + emoDemands + influence + possDev + meaningWork + commitment + predictability + socialSupport) / 10);

    const newAnalysis: PsychosocialAnalysis = {
      id: `psa${Date.now()}`,
      company_id: selectedCompanyId,
      workstation_id: wsId || undefined,
      evaluator_name: evaluator,
      nasa_tlx_score: nasaScore,
      nasa_tlx_details: { mental_demand: mentalDemand, physical_demand: physicalDemand, temporal_demand: temporalDemand, performance, effort, frustration },
      hse_it_score: hseScore,
      hse_it_details: { demands, control, support, relationships, role, change },
      copenhagen_score: copenhagenScore,
      copenhagen_details: { quantitative_demands: quantDemands, work_pace: workPace, cognitive_demands: cogDemands, emotional_demands: emoDemands, influence, possibilities_development: possDev, meaning_work: meaningWork, commitment, predictability, social_support: socialSupport },
      observations,
      created_at: new Date().toISOString().split("T")[0],
    };
    setAnalyses([...analyses, newAnalysis]);
    toast.success("Avaliação psicossocial registrada!");
    setOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Análise Psicossocial</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">NASA-TLX, HSE-IT e Copenhagen</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <CompanySelector />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Nova Avaliação</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Nova Avaliação Psicossocial</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <Input placeholder="Nome do avaliador" value={evaluator} onChange={e => setEvaluator(e.target.value)} />
                <Select value={wsId} onValueChange={setWsId}>
                  <SelectTrigger><SelectValue placeholder="Posto de trabalho (opcional)" /></SelectTrigger>
                  <SelectContent>
                    {companyWorkstations.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="nasa-tlx" className="text-xs">NASA-TLX</TabsTrigger>
                    <TabsTrigger value="hse-it" className="text-xs">HSE-IT</TabsTrigger>
                    <TabsTrigger value="copenhagen" className="text-xs">Copenhagen</TabsTrigger>
                  </TabsList>

                  <TabsContent value="nasa-tlx" className="space-y-3 pt-2">
                    <p className="text-xs text-muted-foreground">Índice de Carga de Trabalho (0-100)</p>
                    <ScoreSlider label="Demanda Mental" value={mentalDemand} onChange={setMentalDemand} />
                    <ScoreSlider label="Demanda Física" value={physicalDemand} onChange={setPhysicalDemand} />
                    <ScoreSlider label="Demanda Temporal" value={temporalDemand} onChange={setTemporalDemand} />
                    <ScoreSlider label="Performance" value={performance} onChange={setPerformance} />
                    <ScoreSlider label="Esforço" value={effort} onChange={setEffort} />
                    <ScoreSlider label="Frustração" value={frustration} onChange={setFrustration} />
                  </TabsContent>

                  <TabsContent value="hse-it" className="space-y-3 pt-2">
                    <p className="text-xs text-muted-foreground">Indicadores de Estresse Ocupacional (1-5)</p>
                    <ScoreSlider label="Demandas" value={demands} onChange={setDemands} max={5} step={0.5} />
                    <ScoreSlider label="Controle" value={control} onChange={setControl} max={5} step={0.5} />
                    <ScoreSlider label="Suporte" value={support} onChange={setSupport} max={5} step={0.5} />
                    <ScoreSlider label="Relacionamentos" value={relationships} onChange={setRelationships} max={5} step={0.5} />
                    <ScoreSlider label="Papel" value={role} onChange={setRole} max={5} step={0.5} />
                    <ScoreSlider label="Mudança" value={change} onChange={setChange} max={5} step={0.5} />
                  </TabsContent>

                  <TabsContent value="copenhagen" className="space-y-3 pt-2">
                    <p className="text-xs text-muted-foreground">Questionário Psicossocial (0-100)</p>
                    <ScoreSlider label="Demandas Quantitativas" value={quantDemands} onChange={setQuantDemands} />
                    <ScoreSlider label="Ritmo de Trabalho" value={workPace} onChange={setWorkPace} />
                    <ScoreSlider label="Demandas Cognitivas" value={cogDemands} onChange={setCogDemands} />
                    <ScoreSlider label="Demandas Emocionais" value={emoDemands} onChange={setEmoDemands} />
                    <ScoreSlider label="Influência no Trabalho" value={influence} onChange={setInfluence} />
                    <ScoreSlider label="Possibilidades de Desenvolvimento" value={possDev} onChange={setPossDev} />
                    <ScoreSlider label="Significado do Trabalho" value={meaningWork} onChange={setMeaningWork} />
                    <ScoreSlider label="Compromisso" value={commitment} onChange={setCommitment} />
                    <ScoreSlider label="Previsibilidade" value={predictability} onChange={setPredictability} />
                    <ScoreSlider label="Suporte Social" value={socialSupport} onChange={setSocialSupport} />
                  </TabsContent>
                </Tabs>

                <Textarea placeholder="Observações gerais" value={observations} onChange={e => setObservations(e.target.value)} />
                <Button onClick={handleSave} className="w-full">Registrar Avaliação</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{companyAnalyses.length}</p>
            <p className="text-xs text-muted-foreground">Avaliações Realizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            {companyAnalyses.length > 0 ? (
              <>
                <p className="text-2xl font-bold">{Math.round(companyAnalyses.reduce((s, a) => s + (a.nasa_tlx_score || 0), 0) / companyAnalyses.length)}</p>
                <p className="text-xs text-muted-foreground">NASA-TLX Médio</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-muted-foreground">NASA-TLX Médio</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            {companyAnalyses.length > 0 ? (
              <>
                <p className="text-2xl font-bold">{(companyAnalyses.reduce((s, a) => s + (a.hse_it_score || 0), 0) / companyAnalyses.length).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">HSE-IT Médio</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold">—</p>
                <p className="text-xs text-muted-foreground">HSE-IT Médio</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card>
        <CardHeader><CardTitle className="text-sm sm:text-base">Avaliações Psicossociais</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {companyAnalyses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhuma avaliação psicossocial registrada.</p>
            </div>
          )}
          {companyAnalyses.map(a => {
            const ws = companyWorkstations.find(w => w.id === a.workstation_id);
            const nasaClass = classifyNasaTlx(a.nasa_tlx_score || 0);
            const hseClass = classifyHseIt(a.hse_it_score || 0);
            return (
              <div key={a.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-secondary/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {ws ? ws.name : "Avaliação Geral"} — {a.evaluator_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{a.created_at}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] ${nasaClass.color}`}>
                    NASA-TLX: {a.nasa_tlx_score} ({nasaClass.label})
                  </Badge>
                  <Badge variant="outline" className={`text-[10px] ${hseClass.color}`}>
                    HSE-IT: {a.hse_it_score} ({hseClass.label})
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewing(a)}>
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={v => { if (!v) setViewing(null); }}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Detalhes da Avaliação Psicossocial</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Avaliador</p>
                  <p className="text-sm font-medium">{viewing.evaluator_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Data</p>
                  <p className="text-sm font-medium">{viewing.created_at}</p>
                </div>
              </div>

              {viewing.nasa_tlx_details && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">NASA-TLX</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries({
                      "Demanda Mental": viewing.nasa_tlx_details.mental_demand,
                      "Demanda Física": viewing.nasa_tlx_details.physical_demand,
                      "Demanda Temporal": viewing.nasa_tlx_details.temporal_demand,
                      "Performance": viewing.nasa_tlx_details.performance,
                      "Esforço": viewing.nasa_tlx_details.effort,
                      "Frustração": viewing.nasa_tlx_details.frustration,
                    }).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs">
                        <span>{k}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${v}%` }} />
                          </div>
                          <span className="font-bold w-8 text-right">{v}</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t flex justify-between text-sm font-bold">
                      <span>Score Geral</span>
                      <span>{viewing.nasa_tlx_score}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {viewing.hse_it_details && (
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-sm">HSE-IT</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries({
                      "Demandas": viewing.hse_it_details.demands,
                      "Controle": viewing.hse_it_details.control,
                      "Suporte": viewing.hse_it_details.support,
                      "Relacionamentos": viewing.hse_it_details.relationships,
                      "Papel": viewing.hse_it_details.role,
                      "Mudança": viewing.hse_it_details.change,
                    }).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs">
                        <span>{k}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-accent rounded-full" style={{ width: `${(v / 5) * 100}%` }} />
                          </div>
                          <span className="font-bold w-8 text-right">{v}</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t flex justify-between text-sm font-bold">
                      <span>Score Geral</span>
                      <span>{viewing.hse_it_score}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {viewing.observations && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm">{viewing.observations}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
