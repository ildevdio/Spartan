import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockReports, mockSectors, mockWorkstations, mockAnalyses, mockRiskAssessments, mockActionPlans } from "@/lib/mock-data";
import { riskLevelLabel, statusLabel, type Report, type ReportType } from "@/lib/types";
import { FileText, Eye, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [fullView, setFullView] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Relatórios de Conformidade</h1>
        <p className="text-sm text-muted-foreground">Documentos técnicos de segurança e saúde ocupacional</p>
      </div>

      {/* Report type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REPORT_TYPES.map((rt) => {
          const reports = mockReports.filter((r) => r.type === rt.type);
          return (
            <Card key={rt.type} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => reports[0] && setSelectedReport(reports[0])}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-accent" />
                  <span className="font-bold text-sm">{rt.label}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{rt.description}</p>
                <Badge variant="secondary">{reports.length} documento(s)</Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Existing reports */}
      <Card>
        <CardHeader><CardTitle className="text-base">Documentos Existentes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {mockReports.map((r) => (
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
                  Visualizar relatório completo
                </Button>
              </div>
            </div>
          ))}</CardContent>
      </Card>

      {/* Full report view dialog */}
      <Dialog open={fullView && !!selectedReport} onOpenChange={(v) => { if (!v) setFullView(false); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
          </DialogHeader>
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
            <Button className="w-full mt-4" onClick={() => setFullView(true)}>
              Visualizar relatório completo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function FullReportView({ report }: { report: Report }) {
  const sector = report.sector_id ? mockSectors.find((s) => s.id === report.sector_id) : null;
  const workstations = sector ? mockWorkstations.filter((w) => w.sector_id === sector.id) : mockWorkstations;
  const wsIds = workstations.map((w) => w.id);
  const analyses = mockAnalyses.filter((a) => wsIds.includes(a.workstation_id));
  const risks = mockRiskAssessments.filter((r) => analyses.some((a) => a.id === r.analysis_id));
  const actions = mockActionPlans.filter((ap) => risks.some((r) => r.id === ap.risk_assessment_id));

  return (
    <div className="space-y-6 print:text-sm" id="report-content">
      {/* Header */}
      <div className="text-center border-b pb-4">
        <h1 className="text-xl font-bold">{report.title}</h1>
        <p className="text-sm text-muted-foreground">{report.type} — Emitido em {report.created_at}</p>
        {sector && <p className="text-sm">Setor: {sector.name}</p>}
      </div>

      {/* 1. Introdução */}
      <section>
        <h2 className="text-lg font-bold mb-2">1. Introdução</h2>
        <p className="text-sm text-muted-foreground">{report.content}</p>
      </section>

      <Separator />

      {/* 2. Postos Avaliados */}
      <section>
        <h2 className="text-lg font-bold mb-2">2. Postos de Trabalho Avaliados</h2>
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

      {/* 3. Análises */}
      <section>
        <h2 className="text-lg font-bold mb-2">3. Análises Ergonômicas</h2>
        <div className="space-y-2">
          {analyses.map((a) => {
            const ws = mockWorkstations.find((w) => w.id === a.workstation_id);
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

      {/* 4. Riscos */}
      <section>
        <h2 className="text-lg font-bold mb-2">4. Avaliação de Riscos</h2>
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
        </div>
      </section>

      <Separator />

      {/* 5. Plano de Ação */}
      <section>
        <h2 className="text-lg font-bold mb-2">5. Plano de Ação</h2>
        <div className="space-y-2">
          {actions.map((ap) => (
            <div key={ap.id} className="p-3 rounded bg-secondary/50">
              <p className="text-sm font-medium">{ap.description}</p>
              <p className="text-xs text-muted-foreground">Responsável: {ap.responsible} | Prazo: {ap.deadline} | Status: {statusLabel(ap.status)}</p>
            </div>
          ))}
          {actions.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma ação registrada.</p>}
        </div>
      </section>

      <Separator />

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground pt-4 border-t">
        <p>Documento gerado pelo sistema ErgoSafety</p>
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
