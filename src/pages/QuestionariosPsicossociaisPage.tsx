import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompany } from "@/lib/company-context";
import { CompanySelector } from "@/components/CompanySelector";
import { Printer, FileText, Building2, Link2, Copy, Eye, Trash2, BarChart3, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QUESTIONNAIRE_DEFS, calculateScores, type QuestionnaireType } from "@/lib/questionnaire-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

const QUESTIONNAIRES = Object.values(QUESTIONNAIRE_DEFS).map((q) => ({
  type: q.type,
  label: q.label,
  description: q.description,
}));

interface QuestionnaireResponse {
  id: string;
  company_id: string;
  workstation_id: string | null;
  questionnaire_type: string;
  respondent_name: string;
  responses: Record<string, number>;
  scores: Record<string, number>;
  total_score: number;
  created_at: string;
}

// ─── Print HTML generators ────────────────────
function generatePrintHTML(
  type: QuestionnaireType,
  companyName: string,
  evaluator: string,
  workstationName: string,
  date: string
): string {
  const headerStyle = `
    body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1e293b; line-height: 1.5; margin: 30px; }
    .header { text-align: center; border-bottom: 3px solid #0A1F44; padding-bottom: 15px; margin-bottom: 20px; }
    .header h1 { font-size: 18px; color: #0A1F44; margin: 0; }
    .header h2 { font-size: 14px; color: #1565C0; margin: 4px 0 0; }
    .header .logo { height: 40px; margin-bottom: 8px; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; border: 1px solid #ccc; padding: 10px; border-radius: 6px; }
    .meta div { flex: 1; }
    .meta label { font-weight: bold; color: #0A1F44; display: block; font-size: 10px; text-transform: uppercase; margin-bottom: 2px; }
    .section { background: #0A1F44; color: white; padding: 8px 14px; margin: 20px 0 10px; border-radius: 4px; font-size: 13px; font-weight: bold; }
    .instructions { background: #E3F2FD; border-left: 4px solid #1565C0; padding: 10px 14px; margin: 10px 0 15px; font-size: 11px; color: #0A1F44; border-radius: 0 4px 4px 0; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th { background: #0A1F44; color: white; padding: 8px 10px; font-size: 11px; text-align: center; border: 1px solid #0A1F44; }
    td { padding: 8px 10px; font-size: 12px; border: 1px solid #B0BEC5; }
    tr:nth-child(even) td { background: #f8fafc; }
    .scale-header { background: #1565C0; color: white; font-size: 10px; text-align: center; padding: 6px; }
    .radio-col { text-align: center; width: 50px; }
    .radio-col input { width: 16px; height: 16px; }
    .score-box { border: 2px solid #0A1F44; padding: 15px; margin: 20px 0; border-radius: 6px; }
    .score-box h3 { margin: 0 0 10px; color: #0A1F44; }
    .score-line { display: flex; align-items: center; gap: 10px; margin: 5px 0; }
    .score-line label { flex: 1; font-size: 12px; }
    .score-line .blank { border-bottom: 1px solid #333; width: 80px; height: 20px; }
    .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    .sig { text-align: center; margin-top: 40px; }
    .sig-line { border-top: 1px solid #333; width: 250px; margin: 0 auto 5px; }
    @media print { body { margin: 15mm; } .no-print { display: none !important; } }
    @page { margin: 15mm; }
  `;

  const metaBlock = `
    <div class="header">
      <img src="/mg-consult-logo.png" alt="MG Consult" class="logo" onerror="this.style.display='none'" />
      <h1>${getTitle(type)}</h1>
      <h2>MG Consultoria — Ergonomia & Segurança do Trabalho</h2>
    </div>
    <div class="meta">
      <div><label>Empresa</label>${companyName}</div>
      <div><label>Posto/Setor</label>${workstationName || "Geral"}</div>
      <div><label>Avaliador</label>${evaluator || "_______________"}</div>
      <div><label>Data</label>${date}</div>
    </div>
  `;

  const def = QUESTIONNAIRE_DEFS[type];
  let body = "";

  const scaleRow = (question: string, scaleLabels: string[], name: string) =>
    `<tr><td style="width: 45%;">${question}</td>${scaleLabels.map(() => `<td class="radio-col"><input type="radio" name="${name}" /></td>`).join("")}</tr>`;

  for (const dim of def.dimensions) {
    body += `<div class="section">${dim.label}</div><table><tr><th style="text-align:left;">Afirmação</th>${def.scales.map((s, i) => `<th class="scale-header" style="width:70px;">${s.value}</th>`).join("")}</tr>`;
    for (let qi = 0; qi < dim.questions.length; qi++) {
      body += scaleRow(dim.questions[qi].text, def.scales.map((s) => s.label), `${dim.label}_${qi}`);
    }
    body += "</table>";
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${getTitle(type)}</title><style>${headerStyle}</style></head><body>${metaBlock}
    <div class="instructions"><strong>Instruções:</strong> ${def.instructions}</div>
    ${body}
    <div class="sig"><div class="sig-line"></div><p style="font-size: 12px;">Assinatura do Avaliado</p></div>
    <div class="footer">Documento gerado pelo sistema Focus Spartan — MG Consultoria | ${date}</div>
  </body></html>`;
}

function getTitle(type: QuestionnaireType): string {
  return QUESTIONNAIRE_DEFS[type].label + " — " + QUESTIONNAIRE_DEFS[type].description;
}

export default function QuestionariosPsicossociaisPage() {
  const { selectedCompany, companyWorkstations, selectedCompanyId } = useCompany();
  const [evaluator, setEvaluator] = useState("");
  const [wsId, setWsId] = useState("");
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [detailResponse, setDetailResponse] = useState<QuestionnaireResponse | null>(null);
  
  // Manual Entry State
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualType, setManualType] = useState<QuestionnaireType>("nasa-tlx");
  const [manualWsId, setManualWsId] = useState("");
  const [manualAnswers, setManualAnswers] = useState<Record<string, number>>({});

  const fetchResponses = async () => {
    if (!selectedCompanyId) return;
    setLoadingResponses(true);
    const { data } = await supabase
      .from("questionnaire_responses")
      .select("*")
      .eq("company_id", selectedCompanyId)
      .order("created_at", { ascending: false });
    setResponses((data as QuestionnaireResponse[] | null) || []);
    setLoadingResponses(false);
  };

  useEffect(() => {
    fetchResponses();
  }, [selectedCompanyId]);

  const handlePrint = (type: QuestionnaireType) => {
    if (!selectedCompany) {
      toast.error("Selecione uma empresa primeiro.");
      return;
    }
    const ws = companyWorkstations.find((w) => w.id === wsId);
    const html = generatePrintHTML(type, selectedCompany.trade_name || selectedCompany.name, evaluator, ws?.name || "Geral", new Date().toLocaleDateString("pt-BR"));
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const getFormLink = (type: QuestionnaireType) => {
    if (!selectedCompanyId) return "";
    return `${window.location.origin}/formulario/${selectedCompanyId}/${type}`;
  };

  const copyLink = (type: QuestionnaireType) => {
    if (!selectedCompany) {
      toast.error("Selecione uma empresa primeiro.");
      return;
    }
    const link = getFormLink(type);
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const deleteResponse = async (id: string) => {
    const { error } = await supabase.from("questionnaire_responses").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir resposta.");
      return;
    }
    setResponses((prev) => prev.filter((r) => r.id !== id));
    toast.success("Resposta excluída.");
  };

  const getWsName = (wsId: string | null) => {
    if (!wsId) return "—";
    const ws = companyWorkstations.find((w) => w.id === wsId);
    return ws?.name || "—";
  };

  const handleManualSave = async () => {
    const def = QUESTIONNAIRE_DEFS[manualType];
    const totalQuestions = def.dimensions.reduce((s, d) => s + d.questions.length, 0);
    const answeredCount = Object.keys(manualAnswers).length;

    if (!manualWsId) {
      toast.error("Selecione o posto de trabalho.");
      return;
    }
    if (answeredCount < totalQuestions) {
      toast.error("Responda todas as perguntas do questionário.");
      return;
    }

    const { dimensionScores, totalScore } = calculateScores(manualType, manualAnswers);

    const { error } = await supabase.from("questionnaire_responses").insert({
      company_id: selectedCompanyId,
      workstation_id: manualWsId,
      questionnaire_type: manualType,
      respondent_name: "Impresso (Manual)",
      responses: manualAnswers as any,
      scores: dimensionScores as any,
      total_score: totalScore,
    } as any);

    if (error) {
      toast.error("Erro ao salvar respostas manuais.");
      console.error(error);
      return;
    }

    toast.success("Resposta manual registrada com sucesso!");
    setManualDialogOpen(false);
    setManualAnswers({});
    fetchResponses();
  };

  const allResponses = responses;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Questionários Psicossociais</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Formulários online e impressos para aplicação em campo
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CompanySelector />
          <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Adicionar Manual</Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>Lançamento Manual de Questionário</DialogTitle>
                <CardDescription>Insira as respostas coletadas fisicamente em campo.</CardDescription>
              </DialogHeader>
              
              <div className="p-6 pt-2 space-y-4 flex-1 overflow-hidden flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Tipo de Questionário</Label>
                    <Select value={manualType} onValueChange={(v: QuestionnaireType) => {setManualType(v); setManualAnswers({});}}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {QUESTIONNAIRES.map(q => <SelectItem key={q.type} value={q.type}>{q.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Posto de Trabalho</Label>
                    <Select value={manualWsId} onValueChange={setManualWsId}>
                      <SelectTrigger><SelectValue placeholder="Selecione o posto..." /></SelectTrigger>
                      <SelectContent>
                        {companyWorkstations.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden border rounded-lg bg-secondary/20">
                  <ScrollArea className="h-full p-4">
                    <div className="space-y-6">
                      {QUESTIONNAIRE_DEFS[manualType].dimensions.map(dim => (
                        <div key={dim.label} className="space-y-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-accent border-b pb-1">{dim.label}</h3>
                          <div className="space-y-4">
                            {dim.questions.map(q => (
                              <div key={q.id} className="space-y-2">
                                <p className="text-[13px] text-foreground/90 font-medium leading-tight">{q.text}</p>
                                <RadioGroup 
                                  value={manualAnswers[q.id]?.toString()} 
                                  onValueChange={(v) => setManualAnswers(prev => ({...prev, [q.id]: parseInt(v)}))}
                                  className="flex flex-wrap gap-x-4 gap-y-2"
                                >
                                  {QUESTIONNAIRE_DEFS[manualType].scales.map(scale => (
                                    <div key={scale.value} className="flex items-center space-x-1.5">
                                      <RadioGroupItem value={scale.value.toString()} id={`${q.id}-${scale.value}`} className="h-3.5 w-3.5" />
                                      <Label htmlFor={`${q.id}-${scale.value}`} className="text-[11px] cursor-pointer">{scale.label}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <DialogFooter className="p-6 pt-2 bg-secondary/30">
                <Button variant="outline" size="sm" onClick={() => setManualDialogOpen(false)}>Cancelar</Button>
                <Button size="sm" onClick={handleManualSave}><Save className="h-4 w-4 mr-2" /> Salvar Resposta</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="online" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="online">Formulários</TabsTrigger>
          <TabsTrigger value="print">Impressão</TabsTrigger>
          <TabsTrigger value="respostas">Respostas</TabsTrigger>
        </TabsList>

        {/* ─── Online forms tab ─── */}
        <TabsContent value="online" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Link2 className="h-4 w-4 text-accent" />
                Links para Formulários Online
              </CardTitle>
              <CardDescription className="text-xs">
                Compartilhe os links abaixo. As respostas serão registradas de forma **totalmente anônima**.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedCompany ? (
                <p className="text-xs text-muted-foreground">Selecione uma empresa para gerar os links.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {QUESTIONNAIRES.map((q) => (
                    <div key={q.type} className="border rounded-lg p-4 space-y-3">
                      <div>
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <FileText className="h-4 w-4 text-accent" />
                          {q.label}
                        </h3>
                        <p className="text-xs text-muted-foreground">{q.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => copyLink(q.type)}>
                          <Copy className="h-3 w-3 mr-1" /> Copiar Link
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => window.open(getFormLink(q.type), "_blank")}>
                          <Eye className="h-3 w-3 mr-1" /> Abrir
                        </Button>
                      </div>
                      <Input readOnly value={getFormLink(q.type)} className="text-xs h-7 bg-muted" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Print tab ─── */}
        <TabsContent value="print" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-accent" />
                Configuração para Impressão
              </CardTitle>
              <CardDescription className="text-xs">
                Preencha os campos abaixo antes de gerar o questionário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input placeholder="Nome do avaliador" value={evaluator} onChange={(e) => setEvaluator(e.target.value)} />
                <Select value={wsId} onValueChange={setWsId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Posto de trabalho (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyWorkstations.map((w) => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {QUESTIONNAIRES.map((q) => (
              <Card key={q.type} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent" />
                    {q.label}
                  </CardTitle>
                  <CardDescription className="text-xs">{q.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button size="sm" className="w-full" onClick={() => handlePrint(q.type)}>
                    <Printer className="h-4 w-4 mr-2" />
                    Gerar para Impressão
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Unified Responses tab ─── */}
        <TabsContent value="respostas" className="space-y-4 mt-4">
          <ResponsesTable 
            data={allResponses} 
            loading={loadingResponses} 
            onView={setDetailResponse} 
            onDelete={deleteResponse} 
            getWsName={getWsName} 
          />
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={!!detailResponse} onOpenChange={() => setDetailResponse(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Detalhes da Resposta Anônima
            </DialogTitle>
          </DialogHeader>
          {detailResponse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="font-semibold">Questionário:</span> {QUESTIONNAIRE_DEFS[detailResponse.questionnaire_type as QuestionnaireType]?.label}</div>
                <div><span className="font-semibold">Posto:</span> {getWsName(detailResponse.workstation_id)}</div>
                <div><span className="font-semibold">Data:</span> {new Date(detailResponse.created_at).toLocaleDateString("pt-BR")}</div>
                <div><span className="font-semibold">Score Total:</span> <span className="font-bold text-primary">{detailResponse.total_score}</span></div>
              </div>
              <div className="pt-2 border-t">
                <h4 className="text-xs font-semibold mb-2">Scores por Dimensão</h4>
                <div className="space-y-2">
                  {Object.entries(detailResponse.scores as Record<string, number>).map(([dim, score]) => (
                    <div key={dim} className="flex items-center gap-2">
                      <span className="text-xs flex-1">{dim}</span>
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(score, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold w-8 text-right">{score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ResponsesTable({ data, loading, onView, onDelete, getWsName }: {
  data: QuestionnaireResponse[];
  loading: boolean;
  onView: (r: QuestionnaireResponse) => void;
  onDelete: (id: string) => void;
  getWsName: (wsId: string | null) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent" />
          Registros
        </CardTitle>
        <CardDescription className="text-xs">
          {data.length} resposta(s) encontrada(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-xs text-muted-foreground">Carregando...</p>
        ) : data.length === 0 ? (
          <p className="text-xs text-muted-foreground">Nenhuma resposta encontrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Origem</TableHead>
                  <TableHead className="text-xs">Questionário</TableHead>
                  <TableHead className="text-xs">Posto</TableHead>
                  <TableHead className="text-xs">Score</TableHead>
                  <TableHead className="text-xs">Data</TableHead>
                  <TableHead className="text-xs w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      {r.respondent_name === "Impresso (Manual)" ? (
                        <Badge variant="outline" className="text-[10px] border-orange-200 text-orange-700 bg-orange-50">Manual</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-700 bg-blue-50">Online</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {QUESTIONNAIRE_DEFS[r.questionnaire_type as QuestionnaireType]?.label || r.questionnaire_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{getWsName(r.workstation_id)}</TableCell>
                    <TableCell className="text-xs font-semibold">{r.total_score}</TableCell>
                    <TableCell className="text-xs">{new Date(r.created_at).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onView(r)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => {
                          if (confirm("Deseja excluir esta resposta anônima?")) onDelete(r.id);
                        }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
