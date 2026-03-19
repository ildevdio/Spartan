import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2 } from "lucide-react";
import { mockCompanies, mockSectors, mockWorkstations, mockAnalyses, mockPosturePhotos } from "@/lib/mock-data";
import { generateAndDownloadPdf, type DocxReportContext } from "@/lib/docx-report-generator";
import type { ReportType } from "@/lib/types";

const REPORT_TYPES: ReportType[] = ["AET", "PGR", "APR", "PCMSO", "LTCAT", "Insalubridade", "Periculosidade", "PCA", "PPR"];

export default function TestPdfPage() {
  const [selectedType, setSelectedType] = useState<ReportType>("AET");
  const [status, setStatus] = useState<"idle" | "generating">("idle");

  const company = mockCompanies[2];
  const sectors = mockSectors.filter((s) => s.company_id === company.id);
  const workstations = mockWorkstations.filter((w) => sectors.some((s) => s.id === w.sector_id));
  const analyses = mockAnalyses.filter((a) => workstations.some((w) => w.id === a.workstation_id));
  const photos = mockPosturePhotos.filter((p) => workstations.some((w) => w.id === p.workstation_id));

  const handleGeneratePdf = async () => {
    setStatus("generating");
    try {
      await generateAndDownloadPdf({
        company, workstations, sectors, analyses, photos, reportType: selectedType,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Teste de Geração de PDF</h1>
      <p className="text-sm text-muted-foreground">
        Empresa: "{company.name}" ({workstations.length} postos, {sectors.length} setores)
      </p>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gerar PDF com QA Automático</CardTitle>
        </CardHeader>
        <CardContent>
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

            <Button onClick={handleGeneratePdf} disabled={status === "generating"}>
              {status === "generating" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Gerar PDF
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            O sistema analisará cada página automaticamente, detectará áreas vazias e conteúdo cortado, e aplicará correções antes de salvar o PDF.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
