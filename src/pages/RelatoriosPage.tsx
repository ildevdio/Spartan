import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCompany } from "@/lib/company-context";
import { mockRiskAssessments, mockActionPlans } from "@/lib/mock-data";
import { riskLevelLabel, statusLabel, MIN_PHOTOS_REQUIRED, type Report, type ReportType } from "@/lib/types";
import { FileText, Eye, Download, CheckCircle2, AlertTriangle } from "lucide-react";
import { CompanySelector } from "@/components/CompanySelector";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const REPORT_TYPES: { type: ReportType; label: string; description: string }[] = [
  { type: "AEP", label: "AEP", description: "Avaliação Ergonômica Preliminar" },
  { type: "AET", label: "AET", description: "Análise Ergonômica do Trabalho" },
  { type: "PCMSO", label: "PCMSO", description: "Programa de Controle Médico de Saúde Ocupacional" },
  { type: "LTCAT", label: "LTCAT", description: "Laudo Técnico das Condições Ambientais de Trabalho" },
  { type: "Insalubridade", label: "Insalubridade", description: "Laudo de Insalubridade" },
  { type: "Periculosidade", label: "Periculosidade", description: "Laudo de Periculosidade" },
  { type: "PCA", label: "PCA", description: "Programa de Conservação Auditiva" },
  { type: "PPR", label: "PPR", description: "Programa de Proteção Respiratória" },
];

export default function RelatoriosPage() {
  const {
    companyReports, companyWorkstations, companySectors,
    companyAnalyses, posturePhotos, reports, setReports,
    selectedCompany,
  } = useCompany();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [fullView, setFullView] = useState(false);

  // Check which workstations can generate reports
  const wsReadyForReport = companyWorkstations.filter((ws) => {
    const photoCount = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
    return photoCount >= MIN_PHOTOS_REQUIRED;
  });

  const wsNotReady = companyWorkstations.filter((ws) => {
    const photoCount = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
    return photoCount < MIN_PHOTOS_REQUIRED;
  });

  const handleAutoGenerate = (wsId: string, type: ReportType) => {
    const ws = companyWorkstations.find((w) => w.id === wsId);
    const sector = companySectors.find((s) => s.id === ws?.sector_id);
    if (!ws) return;

    const newReport: Report = {
      id: `rp${Date.now()}`,
      type,
      title: `${type} - ${ws.name}`,
      content: `Relatório ${type} gerado automaticamente para o posto ${ws.name} do setor ${sector?.name || ""}. Empresa: ${selectedCompany?.name || ""}.`,
      sector_id: sector?.id,
      workstation_id: ws.id,
      created_at: new Date().toISOString().split("T")[0],
    };
    setReports([...reports, newReport]);
    toast.success(`Relatório ${type} gerado para ${ws.name}!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatórios de Conformidade</h1>
          <p className="text-sm text-muted-foreground">Documentos técnicos de segurança e saúde ocupacional</p>
        </div>
        <CompanySelector />
      </div>

      {/* Workstations ready for auto-generation */}
      {wsReadyForReport.length > 0 && (
        <Card className="border-success/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Postos Prontos para Relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wsReadyForReport.map((ws) => {
              const sector = companySectors.find((s) => s.id === ws.sector_id);
              const photoCount = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
              return (
                <div key={ws.id} className="p-3 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium">{ws.name}</p>
                      <p className="text-xs text-muted-foreground">{sector?.name} — {photoCount} fotos</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => handleAutoGenerate(ws.id, "AEP")}>Gerar AEP</Button>
                    <Button size="sm" variant="outline" onClick={() => handleAutoGenerate(ws.id, "AET")}>Gerar AET</Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Workstations NOT ready */}
      {wsNotReady.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Postos com Fotos Insuficientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {wsNotReady.map((ws) => {
              const photoCount = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
              return (
                <div key={ws.id} className="flex items-center justify-between p-2 rounded bg-secondary/50 text-sm">
                  <span>{ws.name}</span>
                  <Badge variant="outline" className="bg-warning/10 text-warning">
                    {photoCount}/{MIN_PHOTOS_REQUIRED} fotos
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Report type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TYPES.map((rt) => {
          const rtReports = companyReports.filter((r) => r.type === rt.type);
          return (
            <Card key={rt.type} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => rtReports[0] && setSelectedReport(rtReports[0])}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-accent" />
                  <span className="font-bold text-sm">{rt.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{rt.description}</p>
                <Badge variant="secondary">{rtReports.length} documento(s)</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Existing reports */}
      <Card>
        <CardHeader><CardTitle className="text-base">Documentos Existentes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {companyReports.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum relatório gerado para esta empresa.</p>
          )}
          {companyReports.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div>
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.type} — {r.created_at}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setSelectedReport(r); setFullView(false); }}>
                  <Eye className="h-3.5 w-3.5 mr-1" />Visualizar
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setSelectedReport(r); setFullView(true); }}>
                  Relatório completo
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Full report dialog */}
      <Dialog open={fullView && !!selectedReport} onOpenChange={(v) => { if (!v) setFullView(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedReport?.title}</DialogTitle></DialogHeader>
          {selectedReport && <FullReportView report={selectedReport} />}
        </DialogContent>
      </Dialog>

      {/* Quick view dialog */}
      <Dialog open={!fullView && !!selectedReport} onOpenChange={(v) => { if (!v) setSelectedReport(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedReport?.title}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Badge>{selectedReport?.type}</Badge>
            <p className="text-sm text-muted-foreground">{selectedReport?.content}</p>
            <Button className="w-full mt-4" onClick={() => setFullView(true)}>Visualizar relatório completo</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FullReportView({ report }: { report: Report }) {
  const {
    companySectors, companyWorkstations, companyAnalyses, posturePhotos, selectedCompany,
  } = useCompany();

  const sector = report.sector_id ? companySectors.find((s) => s.id === report.sector_id) : null;
  const workstations = report.workstation_id
    ? companyWorkstations.filter((w) => w.id === report.workstation_id)
    : sector
      ? companyWorkstations.filter((w) => w.sector_id === sector.id)
      : companyWorkstations;
  const wsIds = workstations.map((w) => w.id);
  const analyses = companyAnalyses.filter((a) => wsIds.includes(a.workstation_id));
  const analysisIds = analyses.map((a) => a.id);
  const risks = mockRiskAssessments.filter((r) => analysisIds.includes(r.analysis_id));
  const actions = mockActionPlans.filter((ap) => risks.some((r) => r.id === ap.risk_assessment_id));
  const photos = posturePhotos.filter((p) => wsIds.includes(p.workstation_id));

  return (
    <div className="space-y-6 print:text-sm" id="report-content">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-xl font-bold">{report.title}</h1>
        <p className="text-sm text-muted-foreground">{report.type} — Emitido em {report.created_at}</p>
        {selectedCompany && <p className="text-sm font-medium">Empresa: {selectedCompany.name}</p>}
        {sector && <p className="text-sm">Setor: {sector.name}</p>}
      </div>

      {/* 1. Introdução */}
      <section>
        <h2 className="text-lg font-bold mb-2">1. Introdução</h2>
        <p className="text-sm text-muted-foreground">{report.content}</p>
      </section>
      <Separator />

      {/* 2. Postos avaliados */}
      <section>
        <h2 className="text-lg font-bold mb-2">2. Descrição dos Postos de Trabalho</h2>
        <div className="space-y-2">
          {workstations.map((ws) => (
            <div key={ws.id} className="p-3 rounded bg-secondary/50">
              <p className="text-sm font-medium">{ws.name}</p>
              <p className="text-xs text-muted-foreground">{ws.description}</p>
              <p className="text-xs text-muted-foreground">Tarefas: {ws.tasks_performed}</p>
            </div>
          ))}
        </div>
      </section>
      <Separator />

      {/* 3. Metodologia */}
      <section>
        <h2 className="text-lg font-bold mb-2">3. Metodologia</h2>
        <p className="text-sm text-muted-foreground">
          As avaliações ergonômicas foram realizadas utilizando os seguintes métodos: {[...new Set(analyses.map((a) => a.method))].join(", ") || "N/A"}.
          Foram coletadas {photos.length} fotografias de posturas para documentação e análise.
        </p>
      </section>
      <Separator />

      {/* 4. Análise postural */}
      <section>
        <h2 className="text-lg font-bold mb-2">4. Análise Postural</h2>
        {photos.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Posturas Registradas:</p>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((p) => (
                <div key={p.id} className="p-2 rounded bg-secondary/50 text-center">
                  <div className="aspect-video bg-muted rounded mb-1 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">📷</span>
                  </div>
                  <p className="text-xs font-medium">{p.posture_type}</p>
                  <p className="text-[10px] text-muted-foreground">{p.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          {analyses.map((a) => {
            const ws = companyWorkstations.find((w) => w.id === a.workstation_id);
            return (
              <div key={a.id} className="p-3 rounded bg-secondary/50">
                <p className="text-sm font-medium">{ws?.name} — {a.method} (Score: {a.score})</p>
                <p className="text-xs text-muted-foreground">{a.notes}</p>
              </div>
            );
          })}
        </div>
      </section>
      <Separator />

      {/* 5. Classificação de risco */}
      <section>
        <h2 className="text-lg font-bold mb-2">5. Classificação de Risco</h2>
        <div className="space-y-2">
          {risks.map((r) => (
            <div key={r.id} className="p-3 rounded bg-secondary/50 flex justify-between items-center">
              <div>
                <p className="text-sm">{r.description}</p>
                <p className="text-xs text-muted-foreground">P={r.probability} × E={r.exposure} × C={r.consequence} = {r.risk_score}</p>
              </div>
              <Badge variant="outline">{riskLevelLabel(r.risk_level)}</Badge>
            </div>
          ))}
          {risks.length === 0 && <p className="text-sm text-muted-foreground">Nenhum risco avaliado.</p>}
        </div>
      </section>
      <Separator />

      {/* 6. Recomendações */}
      <section>
        <h2 className="text-lg font-bold mb-2">6. Recomendações</h2>
        <div className="space-y-2">
          {actions.map((ap) => (
            <div key={ap.id} className="p-3 rounded bg-secondary/50">
              <p className="text-sm font-medium">{ap.description}</p>
              <p className="text-xs text-muted-foreground">Responsável: {ap.responsible} | Prazo: {ap.deadline} | Status: {statusLabel(ap.status)}</p>
            </div>
          ))}
          {actions.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma recomendação registrada.</p>}
        </div>
      </section>
      <Separator />

      {/* 7. Conclusão */}
      <section>
        <h2 className="text-lg font-bold mb-2">7. Conclusão</h2>
        <p className="text-sm text-muted-foreground">
          Este relatório apresenta a avaliação ergonômica dos postos de trabalho analisados.
          Foram identificados {risks.length} risco(s) e propostas {actions.length} ação(ões) corretiva(s).
          As recomendações devem ser implementadas conforme os prazos estabelecidos.
        </p>
      </section>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        <p>Documento gerado pelo sistema Spartan</p>
        <p>Este relatório deve ser revisado pelo profissional responsável antes da validação.</p>
      </div>

      <div className="flex justify-center pt-4 print:hidden">
        <Button onClick={() => window.print()}>
          <Download className="h-4 w-4 mr-2" />Exportar PDF
        </Button>
      </div>
    </div>
  );
}
