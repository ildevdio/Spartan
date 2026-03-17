import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Printer } from "lucide-react";
import { useRef } from "react";

interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  html: string;
  title: string;
  onDownloadDocx?: () => void;
}

export function ReportPreviewDialog({ open, onOpenChange, html, title, onDownloadDocx }: ReportPreviewDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);

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
        @media print { body { padding: 20px; } }
      </style></head><body>${html}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="flex flex-row items-center justify-between p-3 sm:p-4 border-b border-border shrink-0">
          <DialogTitle className="text-sm sm:text-base truncate pr-2">{title}</DialogTitle>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handlePrint}>
              <Printer className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            {onDownloadDocx && (
              <Button size="sm" className="h-7 text-xs" onClick={onDownloadDocx}>
                <Download className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">Baixar HTML</span>
                <span className="sm:hidden">HTML</span>
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-white">
          <div
            ref={contentRef}
            className="report-preview-content p-6 sm:p-10 max-w-[210mm] mx-auto"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
