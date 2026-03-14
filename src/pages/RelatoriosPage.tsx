import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/lib/company-context";
import { MIN_PHOTOS_REQUIRED, type ReportType } from "@/lib/types";
import { FileText, CheckCircle2, AlertTriangle, Download, Loader2 } from "lucide-react";
import { CompanySelector } from "@/components/CompanySelector";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateAndDownloadDocx, type DocxReportContext } from "@/lib/docx-report-generator";

const REPORT_TYPES: { type: ReportType; label: string; description: string }[] = [
  { type: "AEP", label: "AEP", description: "Avaliação Ergonômica Preliminar" },
  { type: "AET", label: "AET", description: "Análise Ergonômica do Trabalho" },
  { type: "PGR", label: "PGR", description: "Programa de Gerenciamento de Riscos" },
  { type: "PCMSO", label: "PCMSO", description: "Programa de Controle Médico" },
  { type: "LTCAT", label: "LTCAT", description: "Laudo Técnico Condições Ambientais" },
  { type: "Insalubridade", label: "Insalubridade", description: "Laudo de Insalubridade" },
  { type: "Periculosidade", label: "Periculosidade", description: "Laudo de Periculosidade" },
  { type: "PCA", label: "PCA", description: "Programa Conservação Auditiva" },
  { type: "PPR", label: "PPR", description: "Programa Proteção Respiratória" },
];

export default function RelatoriosPage() {
  const {
    companyWorkstations, companySectors,
    companyAnalyses, posturePhotos,
    selectedCompany,
  } = useCompany();
  const [generating, setGenerating] = useState<string | null>(null);

  const wsReadyForReport = companyWorkstations.filter((ws) => {
    const photoCount = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
    return photoCount >= MIN_PHOTOS_REQUIRED;
  });

  const wsNotReady = companyWorkstations.filter((ws) => {
    const photoCount = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
    return photoCount < MIN_PHOTOS_REQUIRED;
  });

  const handleGenerateDocx = async (wsId: string, type: ReportType) => {
    const ws = companyWorkstations.find((w) => w.id === wsId);
    const sector = companySectors.find((s) => s.id === ws?.sector_id);
    if (!ws || !selectedCompany) return;

    const key = `${wsId}-${type}`;
    setGenerating(key);

    try {
      const wsPhotos = posturePhotos.filter((p) => p.workstation_id === ws.id);
      const wsAnalyses = companyAnalyses.filter((a) => a.workstation_id === ws.id);

      const ctx: DocxReportContext = {
        company: selectedCompany,
        sector: sector || undefined,
        workstation: ws,
        workstations: [ws],
        sectors: companySectors,
        analyses: wsAnalyses,
        photos: wsPhotos,
        reportType: type,
      };

      await generateAndDownloadDocx(ctx);
      toast.success(`Relatório ${type} baixado como .docx!`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar relatório.");
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerateAll = async (type: ReportType) => {
    if (!selectedCompany) return;

    setGenerating(`all-${type}`);
    try {
      const allPhotos = posturePhotos.filter((p) =>
        companyWorkstations.some((w) => w.id === p.workstation_id)
      );

      const ctx: DocxReportContext = {
        company: selectedCompany,
        workstations: companyWorkstations,
        sectors: companySectors,
        analyses: companyAnalyses,
        photos: allPhotos,
        reportType: type,
      };

      await generateAndDownloadDocx(ctx);
      toast.success(`Relatório ${type} completo baixado como .docx!`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar relatório.");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Relatórios</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Documentos técnicos exportados em Word (.docx)
          </p>
        </div>
        <CompanySelector />
      </div>

      {/* Quick generate for entire company */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <Download className="h-4 w-4 text-accent" />
            Gerar Relatório Completo da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Gera um documento .docx contendo todos os postos e análises da empresa.
          </p>
          <div className="flex gap-2 flex-wrap">
            {["AEP", "AET", "PGR"].map((type) => {
              const isGen = generating === `all-${type}`;
              return (
                <Button
                  key={type}
                  size="sm"
                  onClick={() => handleGenerateAll(type as ReportType)}
                  disabled={!!generating}
                  className="text-xs h-8"
                >
                  {isGen ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-1" />}
                  {type} (.docx)
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ready workstations */}
      {wsReadyForReport.length > 0 && (
        <Card className="border-success/30">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
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
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ws.name}</p>
                      <p className="text-xs text-muted-foreground">{sector?.name} — {photoCount} fotos</p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(["AEP", "AET", "PGR"] as ReportType[]).map((type) => {
                      const key = `${ws.id}-${type}`;
                      const isGen = generating === key;
                      return (
                        <Button
                          key={type}
                          size="sm"
                          variant="outline"
                          className="text-xs h-7"
                          onClick={() => handleGenerateDocx(ws.id, type)}
                          disabled={!!generating}
                        >
                          {isGen ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
                          {type}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Not ready */}
      {wsNotReady.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Fotos Insuficientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {wsNotReady.map((ws) => {
              const photoCount = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
              return (
                <div key={ws.id} className="flex items-center justify-between p-2 rounded bg-secondary/50 text-sm">
                  <span className="truncate mr-2">{ws.name}</span>
                  <Badge variant="outline" className="bg-warning/10 text-warning shrink-0 text-xs">
                    {photoCount}/{MIN_PHOTOS_REQUIRED}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Report type cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {REPORT_TYPES.map((rt) => (
          <Card key={rt.type} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleGenerateAll(rt.type)}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-accent shrink-0" />
                <span className="font-bold text-xs sm:text-sm">{rt.label}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 line-clamp-2">{rt.description}</p>
              <Badge variant="secondary" className="text-[10px]">
                <Download className="h-2.5 w-2.5 mr-1" /> .docx
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
