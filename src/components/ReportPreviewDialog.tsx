import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Printer, FileText, ShieldCheck } from "lucide-react";
import { useRef, useState } from "react";
import { ReportSignatureDialog, type SignatureResult } from "./ReportSignatureDialog";

interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  html: string;
  title: string;
  onDownloadDocx?: () => void;
  onSigned?: (result: SignatureResult) => void;
}

const PRINT_STYLES = `
  @media print {
    body { margin: 0; padding: 0; }
    .rpt-cover { page-break-after: always !important; break-after: page !important; }
    .rpt-section { page-break-before: always !important; break-before: page !important; }
    .page-break { page-break-after: always !important; break-after: page !important; height: 0; overflow: hidden; }
    .rpt-table { page-break-inside: avoid !important; }
    .rpt-callout { page-break-inside: avoid !important; }
    .rpt-sig { page-break-inside: avoid !important; }
    .no-print { display: none !important; }
  }
  @page { size: A4; margin: 15mm 12mm; }
`;

export function ReportPreviewDialog({ open, onOpenChange, html, title, onDownloadDocx, onSigned }: ReportPreviewDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
  const [signatureResult, setSignatureResult] = useState<SignatureResult | null>(null);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${title}</title>
      <style>
        body { font-family: Calibri, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
        table { border-collapse: collapse; width: 100%; margin: 12px 0; }
        td, th { border: 1px solid #D1D5DB; padding: 8px; font-size: 13px; }
        th { background: #f1f5f9; font-weight: bold; }
        h1 { font-size: 22px; color: #1e293b; } h2 { font-size: 18px; color: #1e293b; margin-top: 24px; }
        h3 { font-size: 15px; color: #475569; } p { font-size: 13px; margin: 8px 0; }
        hr { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
        img { max-width: 100%; height: auto; }
        ${PRINT_STYLES}
      </style></head><body>${html}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSigned = (result: SignatureResult) => {
    setSignatureResult(result);
    onSigned?.(result);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSignatureResult(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="flex flex-row items-center justify-between p-3 sm:p-4 border-b border-border shrink-0">
            <DialogTitle className="text-sm sm:text-base truncate pr-2">{title}</DialogTitle>
            <div className="flex items-center gap-2 shrink-0">
              {/* Signature status */}
              {signatureResult && (
                <span className="flex items-center gap-1 text-[10px] text-success font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" /> Assinado
                </span>
              )}

              {/* Sign button */}
              <Button
                size="sm"
                variant={signatureResult ? "outline" : "default"}
                className="h-7 text-xs gap-1"
                onClick={() => setSignDialogOpen(true)}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{signatureResult ? "Reassinar" : "Assinar (A3)"}</span>
                <span className="sm:hidden">A3</span>
              </Button>

              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handlePrint}>
                <Printer className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
              <Button
                size="sm"
                variant="default"
                className="h-7 text-xs"
                onClick={handlePrint}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Baixar PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto bg-white">
            <div
              ref={contentRef}
              className="report-preview-content p-6 sm:p-10 max-w-[210mm] mx-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            {/* Signature block at the bottom */}
            {signatureResult && (
              <div className="max-w-[210mm] mx-auto px-6 sm:px-10 pb-10">
                <div className="border-t-2 border-success/30 pt-4 mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck className="h-5 w-5 text-success" />
                    <span className="text-sm font-bold text-success">DOCUMENTO ASSINADO DIGITALMENTE</span>
                  </div>
                  <div className="p-4 rounded-lg bg-success/5 border border-success/20 text-xs space-y-1">
                    <p><strong>Assinante:</strong> {signatureResult.certificateSubject}</p>
                    <p><strong>Emissor:</strong> {signatureResult.certificateIssuer}</p>
                    {signatureResult.pkiBrazil?.cpf && (
                      <p><strong>CPF:</strong> {signatureResult.pkiBrazil.cpf}</p>
                    )}
                    {signatureResult.pkiBrazil?.cnpj && (
                      <p><strong>CNPJ:</strong> {signatureResult.pkiBrazil.cnpj}</p>
                    )}
                    <p><strong>Data/Hora:</strong> {new Date(signatureResult.signedAt).toLocaleString("pt-BR")}</p>
                    <p className="font-mono text-[9px] text-muted-foreground break-all mt-2">
                      <strong>Hash da assinatura:</strong> {signatureResult.signature.substring(0, 64)}...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ReportSignatureDialog
        open={signDialogOpen}
        onOpenChange={setSignDialogOpen}
        reportTitle={title}
        reportHtml={html}
        onSigned={handleSigned}
      />
    </>
  );
}
