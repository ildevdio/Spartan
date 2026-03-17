import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCompany } from "@/lib/company-context";
import { MIN_PHOTOS_REQUIRED, type ReportType, riskLevelLabel, type RiskLevel } from "@/lib/types";
import { FileText, CheckCircle2, AlertTriangle, Download, Loader2, BarChart3, ShieldAlert, Users, Target, Layers, Eye } from "lucide-react";
import { CompanySelector } from "@/components/CompanySelector";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { generateAndDownloadDocx, type DocxReportContext } from "@/lib/docx-report-generator";
import { generateReportHTML } from "@/lib/report-templates";
import { Progress } from "@/components/ui/progress";
import { ReportPreviewDialog } from "@/components/ReportPreviewDialog";

const REPORT_TYPES: { type: ReportType; label: string; description: string }[] = [
  { type: "AET", label: "AET", description: "Análise Ergonômica do Trabalho (inclui AEP como anexo)" },
  { type: "PGR", label: "PGR", description: "Programa de Gerenciamento de Riscos" },
  { type: "APR", label: "APR", description: "Avaliação Preliminar de Riscos Psicossociais" },
  { type: "PCMSO", label: "PCMSO", description: "Programa de Controle Médico de Saúde Ocupacional" },
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
    selectedCompany, selectedCompanyId,
    riskAssessments, actionPlans, psychosocialAnalyses,
  } = useCompany();
  const [generating, setGenerating] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewDownload, setPreviewDownload] = useState<(() => void) | null>(null);

  const wsReadyForReport = companyWorkstations.filter((ws) => {
    const photoCount = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
    return photoCount >= MIN_PHOTOS_REQUIRED;
  });

  const wsNotReady = companyWorkstations.filter((ws) => {
    const photoCount = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
    return photoCount < MIN_PHOTOS_REQUIRED;
  });

  const companyRisks = riskAssessments.filter((r) => companyAnalyses.some((a) => a.id === r.analysis_id));
  const companyActions = actionPlans.filter((ap) => companyRisks.some((r) => r.id === ap.risk_assessment_id));
  const companyPsychosocial = psychosocialAnalyses.filter((p) => p.company_id === selectedCompanyId);
  const completedAnalyses = companyAnalyses.filter((a) => a.analysis_status === "completed").length;
  const totalPhotos = posturePhotos.filter((p) => companyWorkstations.some((w) => w.id === p.workstation_id)).length;
  const riskDist: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
  companyRisks.forEach((r) => riskDist[r.risk_level]++);

  const buildCtxForWs = (wsId: string, type: ReportType): DocxReportContext | null => {
    const ws = companyWorkstations.find((w) => w.id === wsId);
    const sector = companySectors.find((s) => s.id === ws?.sector_id);
    if (!ws || !selectedCompany) return null;
    return {
      company: selectedCompany,
      sector: sector || undefined,
      workstation: ws,
      workstations: [ws],
      sectors: companySectors,
      analyses: companyAnalyses.filter((a) => a.workstation_id === ws.id),
      photos: posturePhotos.filter((p) => p.workstation_id === ws.id),
      reportType: type,
    };
  };

  const buildCtxForAll = (type: ReportType): DocxReportContext | null => {
    if (!selectedCompany) return null;
    return {
      company: selectedCompany,
      workstations: companyWorkstations,
      sectors: companySectors,
      analyses: companyAnalyses,
      photos: posturePhotos.filter((p) => companyWorkstations.some((w) => w.id === p.workstation_id)),
      reportType: type,
    };
  };

  const handleDownloadDocx = async (ctx: DocxReportContext) => {
    setGenerating("download");
    try {
      await generateAndDownloadDocx(ctx);
      toast.success(`Relatório ${ctx.reportType} baixado como .docx!`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar relatório.");
    } finally {
      setGenerating(null);
    }
  };

  const handlePreview = (ctx: DocxReportContext, label: string) => {
    const html = generateReportHTML({
      company: ctx.company,
      sector: ctx.sector,
      workstation: ctx.workstation,
      workstations: ctx.workstations,
      analyses: ctx.analyses,
      photos: ctx.photos,
      reportType: ctx.reportType,
    });
    setPreviewHtml(html);
    setPreviewTitle(label);
    setPreviewDownload(() => () => handleDownloadDocx(ctx));
  };

  const handlePreviewAll = (type: ReportType) => {
    const ctx = buildCtxForAll(type);
    if (!ctx) return;
    handlePreview(ctx, `${type} — ${selectedCompany?.name}`);
  };

  const handlePreviewWs = (wsId: string, type: ReportType) => {
    const ctx = buildCtxForWs(wsId, type);
    if (!ctx) return;
    const ws = companyWorkstations.find((w) => w.id === wsId);
    handlePreview(ctx, `${type} — ${ws?.name}`);
  };

  const handleDownloadAll = async (type: ReportType) => {
    const ctx = buildCtxForAll(type);
    if (!ctx) return;
    await handleDownloadDocx(ctx);
  };

  const handleDownloadWs = async (wsId: string, type: ReportType) => {
    const ctx = buildCtxForWs(wsId, type);
    if (!ctx) return;
    await handleDownloadDocx(ctx);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Relatórios</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Visualize ou exporte documentos técnicos (.docx)
          </p>
        </div>
        <CompanySelector />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {[
          { icon: Layers, value: companySectors.length, label: "Setores", color: "text-accent" },
          { icon: BarChart3, value: companyWorkstations.length, label: "Postos", color: "text-accent" },
          { icon: CheckCircle2, value: wsReadyForReport.length, label: "Prontos", color: "text-success" },
          { icon: ShieldAlert, value: companyRisks.length, label: "Riscos", color: "text-high" },
          { icon: Target, value: companyActions.length, label: "Ações", color: "text-warning" },
          { icon: Users, value: companyPsychosocial.length, label: "Psicossocial", color: "text-accent" },
        ].map(({ icon: Icon, value, label, color }) => (
          <Card key={label}>
            <CardContent className="p-3 text-center">
              <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
              <p className="text-lg font-bold">{value}</p>
              <p className="text-[9px] text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Readiness */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Cobertura para Relatórios</span>
            <span className="text-sm font-bold">
              {companyWorkstations.length > 0 ? Math.round((wsReadyForReport.length / companyWorkstations.length) * 100) : 0}%
            </span>
          </div>
          <Progress value={companyWorkstations.length > 0 ? (wsReadyForReport.length / companyWorkstations.length) * 100 : 0} className="h-2 mb-2" />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{wsReadyForReport.length} postos prontos</span>
            <span>{totalPhotos} fotos totais</span>
            <span>{completedAnalyses} análises concluídas</span>
          </div>
        </CardContent>
      </Card>

      {/* Company-wide reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-accent" />
            Relatório Completo da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            {companyWorkstations.length} postos, {companyAnalyses.length} análises e {companyRisks.length} avaliações de risco.
          </p>
          <div className="flex gap-2 flex-wrap">
            {["AET", "PGR"].map((type) => (
              <div key={type} className="flex gap-1">
                <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => handlePreviewAll(type as ReportType)}>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  {type}
                </Button>
                <Button size="sm" variant="ghost" className="text-xs h-8 px-2" onClick={() => handleDownloadAll(type as ReportType)} disabled={!!generating}>
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            {(["low", "medium", "high", "critical"] as RiskLevel[]).map((level) => riskDist[level] > 0 && (
              <Badge key={level} variant="outline" className={`text-[10px] ${
                level === "critical" ? "bg-critical/10 text-critical" :
                level === "high" ? "bg-high/10 text-high" :
                level === "medium" ? "bg-warning/10 text-warning" :
                "bg-success/10 text-success"
              }`}>
                {riskDist[level]} {riskLevelLabel(level)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ready workstations */}
      {wsReadyForReport.length > 0 && (
        <Card className="border-success/30">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Postos Prontos para Relatório ({wsReadyForReport.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {wsReadyForReport.map((ws) => {
              const sector = companySectors.find((s) => s.id === ws.sector_id);
              const photoCount = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
              const wsAnalyses = companyAnalyses.filter((a) => a.workstation_id === ws.id);
              const wsRisks = riskAssessments.filter((r) => wsAnalyses.some((a) => a.id === r.analysis_id));
              const worstRisk = wsRisks.sort((a, b) => b.risk_score - a.risk_score)[0];
              return (
                <div key={ws.id} className="p-3 rounded-lg bg-success/5 border border-success/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ws.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sector?.name} — {photoCount} fotos — {wsAnalyses.length} análise(s)
                      </p>
                    </div>
                    {worstRisk && (
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${
                        worstRisk.risk_level === "critical" ? "bg-critical/10 text-critical" :
                        worstRisk.risk_level === "high" ? "bg-high/10 text-high" :
                        "bg-warning/10 text-warning"
                      }`}>
                        {riskLevelLabel(worstRisk.risk_level)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(["AEP", "AET", "PGR"] as ReportType[]).map((type) => (
                      <div key={type} className="flex gap-1">
                        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handlePreviewWs(ws.id, type)}>
                          <Eye className="h-3 w-3 mr-1" />
                          {type}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-xs h-7 px-1.5" onClick={() => handleDownloadWs(ws.id, type)} disabled={!!generating}>
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
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
              Fotos Insuficientes ({wsNotReady.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {wsNotReady.map((ws) => {
              const photoCount = posturePhotos.filter((p) => p.workstation_id === ws.id).length;
              const sector = companySectors.find((s) => s.id === ws.sector_id);
              return (
                <div key={ws.id} className="flex items-center justify-between p-2 rounded bg-secondary/50 text-sm">
                  <div className="min-w-0">
                    <span className="truncate mr-2 text-sm">{ws.name}</span>
                    <span className="text-[10px] text-muted-foreground"> — {sector?.name}</span>
                  </div>
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
          <Card key={rt.type} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handlePreviewAll(rt.type)}>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-accent shrink-0" />
                <span className="font-bold text-xs sm:text-sm">{rt.label}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 line-clamp-2">{rt.description}</p>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-[10px]">
                  <Eye className="h-2.5 w-2.5 mr-1" /> Visualizar
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview dialog */}
      <ReportPreviewDialog
        open={!!previewHtml}
        onOpenChange={(open) => { if (!open) { setPreviewHtml(null); setPreviewDownload(null); } }}
        html={previewHtml || ""}
        title={previewTitle}
        onDownloadDocx={previewDownload || undefined}
      />
    </div>
  );
}
