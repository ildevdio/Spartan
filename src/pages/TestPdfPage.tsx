import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { mockCompanies, mockSectors, mockWorkstations, mockAnalyses, mockPosturePhotos } from "@/lib/mock-data";
import { generateReportHTML } from "@/lib/report-templates";
import { generateAndDownloadPdf, type DocxReportContext } from "@/lib/docx-report-generator";
import type { ReportType } from "@/lib/types";

const REPORT_TYPES: ReportType[] = ["AET", "PGR", "APR", "PCMSO", "LTCAT", "Insalubridade", "Periculosidade", "PCA", "PPR"];

export default function TestPdfPage() {
  const [selectedType, setSelectedType] = useState<ReportType>("AET");
  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  const company = mockCompanies[2]; // Empresa Teste Ltda
  const sectors = mockSectors.filter((s) => s.company_id === company.id);
  const workstations = mockWorkstations.filter((w) => sectors.some((s) => s.id === w.sector_id));
  const analyses = mockAnalyses.filter((a) => workstations.some((w) => w.id === a.workstation_id));
  const photos = mockPosturePhotos.filter((p) => workstations.some((w) => w.id === p.workstation_id));

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const buildCtx = (): DocxReportContext => ({
    company,
    workstations,
    sectors,
    analyses,
    photos,
    reportType: selectedType,
  });

  const handlePreview = () => {
    const html = generateReportHTML({
      company,
      workstations,
      analyses,
      photos,
      reportType: selectedType,
    });
    setPreviewHtml(html);
    addLog(`Preview gerado para ${selectedType}: ${html.length} chars de HTML`);
  };

  const handleGeneratePdf = async () => {
    setStatus("generating");
    setLogs([]);
    addLog(`Iniciando geração de PDF: ${selectedType} para ${company.name}`);

    // Intercept console.log to capture [PDF] messages
    const origLog = console.log;
    console.log = (...args: unknown[]) => {
      origLog(...args);
      const msg = args.map(String).join(" ");
      if (msg.includes("[PDF]")) {
        addLog(msg);
      }
    };

    try {
      const ctx = buildCtx();
      addLog(`Contexto: ${workstations.length} postos, ${analyses.length} análises, ${photos.length} fotos`);

      const start = performance.now();
      await generateAndDownloadPdf(ctx);
      const elapsed = ((performance.now() - start) / 1000).toFixed(1);

      addLog(`✅ PDF gerado com sucesso em ${elapsed}s`);
      setStatus("success");
    } catch (err: any) {
      addLog(`❌ ERRO: ${err.message}`);
      setStatus("error");
    } finally {
      console.log = origLog;
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Teste de Geração de PDF</h1>
      <p className="text-sm text-muted-foreground">
        Página de teste usando dados mock da "{company.name}" ({workstations.length} postos, {sectors.length} setores)
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ReportType)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handlePreview}>
              <FileText className="h-4 w-4 mr-2" /> Preview HTML
            </Button>

            <Button onClick={handleGeneratePdf} disabled={status === "generating"}>
              {status === "generating" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Gerar PDF
            </Button>

            {status === "success" && (
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Sucesso
              </Badge>
            )}
            {status === "error" && (
              <Badge className="bg-red-100 text-red-800">
                <XCircle className="h-3 w-3 mr-1" /> Erro
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Logs de Diagnóstico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-xs max-h-60 overflow-auto space-y-0.5">
              {logs.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* HTML Preview */}
      {previewHtml && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview do HTML ({previewHtml.length} chars)</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="report-preview-content border rounded bg-white p-6 max-h-[500px] overflow-auto"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
