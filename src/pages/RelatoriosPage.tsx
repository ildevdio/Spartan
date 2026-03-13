import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCompany } from "@/lib/company-context";
import { MIN_PHOTOS_REQUIRED, type Report, type ReportType } from "@/lib/types";
import { FileText, Eye, CheckCircle2, AlertTriangle, Pencil } from "lucide-react";
import { CompanySelector } from "@/components/CompanySelector";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateReportHTML } from "@/lib/report-templates";
import { ReportEditor } from "@/components/ReportEditor";

const REPORT_TYPES: { type: ReportType; label: string; description: string }[] = [
  { type: "AEP", label: "AEP", description: "Avaliação Ergonômica Preliminar" },
  { type: "AET", label: "AET", description: "Análise Ergonômica do Trabalho" },
  { type: "PGR", label: "PGR", description: "Programa de Gerenciamento de Riscos" },
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
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editContent, setEditContent] = useState("");

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
    if (!ws || !selectedCompany) return;

    const wsPhotos = posturePhotos.filter((p) => p.workstation_id === ws.id);
    const wsAnalyses = companyAnalyses.filter((a) => a.workstation_id === ws.id);

    const html = generateReportHTML({
      company: selectedCompany,
      sector: sector || undefined,
      workstation: ws,
      workstations: [ws],
      analyses: wsAnalyses,
      photos: wsPhotos,
      reportType: type,
    });

    const newReport: Report = {
      id: `rp${Date.now()}`,
      type,
      title: `${type} - ${ws.name}`,
      content: html,
      sector_id: sector?.id,
      workstation_id: ws.id,
      created_at: new Date().toISOString().split("T")[0],
    };
    setReports([...reports, newReport]);
    toast.success(`Relatório ${type} gerado para ${ws.name}!`);
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setEditContent(report.content);
  };

  const handleSaveEdit = () => {
    if (!editingReport) return;
    setReports(reports.map((r) => r.id === editingReport.id ? { ...r, content: editContent } : r));
    toast.success("Relatório salvo!");
    setEditingReport(null);
  };

  const handleExportPdf = () => {
    window.print();
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

      {/* Editor view */}
      {editingReport && (
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Editando: {editingReport.title}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingReport(null)}>Cancelar</Button>
              <Button size="sm" onClick={handleSaveEdit}>Salvar Alterações</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ReportEditor
              content={editContent}
              onUpdate={setEditContent}
              onExportPdf={handleExportPdf}
            />
          </CardContent>
        </Card>
      )}

      {!editingReport && (
        <>
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
                        <Button size="sm" variant="outline" onClick={() => handleAutoGenerate(ws.id, "PGR")}>Gerar PGR</Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <Button variant="outline" size="sm" onClick={() => setSelectedReport(r)}>
                      <Eye className="h-3.5 w-3.5 mr-1" />Visualizar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditReport(r)}>
                      <Pencil className="h-3.5 w-3.5 mr-1" />Editar
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* Quick view dialog */}
      <Dialog open={!!selectedReport} onOpenChange={(v) => { if (!v) setSelectedReport(null); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedReport?.title}</DialogTitle></DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: selectedReport.content }} />
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => { handleEditReport(selectedReport); setSelectedReport(null); }}>
                  <Pencil className="h-4 w-4 mr-2" />Editar Relatório
                </Button>
                <Button onClick={() => window.print()}>Exportar PDF</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
