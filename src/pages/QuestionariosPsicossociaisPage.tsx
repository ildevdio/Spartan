import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCompany } from "@/lib/company-context";
import { CompanySelector } from "@/components/CompanySelector";
import { Printer, FileText, Building2, Link2, Copy, Eye, Trash2, BarChart3, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { QUESTIONNAIRE_DEFS, type QuestionnaireType } from "@/lib/questionnaire-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ManualQuestionnaireForm } from "@/components/ManualQuestionnaireForm";

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

// ─── Print HTML generators (kept from original) ────────────────────
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
  const [manualFormType, setManualFormType] = useState<QuestionnaireType | null>(null);

  const onlineResponses = responses.filter((r) => !(r.responses as any)?.is_manual);
  const printedResponses = responses.filter((r) => (r.responses as any)?.is_manual);

  useEffect(() => {
    if (!selectedCompanyId) return;
    const fetchResponses = async () => {
      setLoadingResponses(true);
      const { data } = await supabase
        .from("questionnaire_responses")
        .select("*")
        .eq("company_id", selectedCompanyId)
        .order("created_at", { ascending: false });
      setResponses((data as QuestionnaireResponse[] | null) || []);
      setLoadingResponses(false);
    };
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

  const renderResponsesTable = (list: QuestionnaireResponse[], title: string, emptyMsg: string) => (
    <div className="space-y-3 mt-6 first:mt-0">
      <h3 className="text-sm font-semibold">{title}</h3>
      {list.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyMsg}</p>
      ) : (
        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Respondente</TableHead>
                <TableHead className="text-xs">Questionário</TableHead>
                <TableHead className="text-xs">Posto</TableHead>
                <TableHead className="text-xs">Score</TableHead>
                <TableHead className="text-xs">Data</TableHead>
                <TableHead className="text-xs w-20">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="text-xs font-medium">{r.respondent_name}</TableCell>
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
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setDetailResponse(r)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteResponse(r.id)}>
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
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Questionários Psicossociais</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Formulários online e impressos para aplicação em campo
          </p>
        </div>
        <CompanySelector />
      </div>

      <Tabs defaultValue="online" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="online">Formulário Online</TabsTrigger>
          <TabsTrigger value="print">Impressão</TabsTrigger>
          <TabsTrigger value="responses">Respostas</TabsTrigger>
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
                Compartilhe os links abaixo com os colaboradores. As respostas serão registradas automaticamente.
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
                <CardContent className="space-y-2">
                  <Button size="sm" className="w-full" onClick={() => handlePrint(q.type)}>
                    <Printer className="h-4 w-4 mr-2" />
                    Gerar para Impressão
                  </Button>
                  <Button size="sm" variant="outline" className="w-full" onClick={() => setManualFormType(q.type as QuestionnaireType)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Inserir Resposta Manual
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Responses tab ─── */}
        <TabsContent value="responses" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-accent" />
                Respostas Recebidas
              </CardTitle>
              <CardDescription className="text-xs">
                {responses.length} resposta(s) registrada(s) para esta empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingResponses ? (
                <p className="text-xs text-muted-foreground">Carregando...</p>
              ) : responses.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma resposta ainda. Compartilhe os links na aba "Formulário Online".</p>
              ) : (
                <div className="space-y-6">
                  {renderResponsesTable(onlineResponses, "Respostas de Questionário Online", "Nenhuma resposta online registrada.")}
                  {renderResponsesTable(printedResponses, "Respostas de Questionário Impresso", "Nenhuma resposta impressa registrada.")}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail dialog */}
      <Dialog open={!!detailResponse} onOpenChange={() => setDetailResponse(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Detalhes — {detailResponse?.respondent_name}
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
              <div>
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
 
       <ManualQuestionnaireForm 
         open={!!manualFormType} 
         onOpenChange={(open) => !open && setManualFormType(null)} 
         type={manualFormType} 
         onSuccess={() => {
           setManualFormType(null);
           if (selectedCompanyId) {
             setLoadingResponses(true);
             supabase
               .from("questionnaire_responses")
               .select("*")
               .eq("company_id", selectedCompanyId)
               .order("created_at", { ascending: false })
               .then(({ data }) => {
                 setResponses((data as QuestionnaireResponse[] | null) || []);
                 setLoadingResponses(false);
               });
           }
         }} 
       />
     </div>
   );
 }
