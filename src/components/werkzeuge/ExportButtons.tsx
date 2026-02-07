import { Button } from "@/components/ui/button";
import { FileDown, FileText, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ExportButtonsProps {
  onExportPdf: () => void | Promise<void>;
  onExportWord: () => void | Promise<void>;
  onCopyToClipboard: () => Promise<void>;
  pdfLabel?: string;
  wordLabel?: string;
  copyLabel?: string;
}

export function ExportButtons({ 
  onExportPdf, 
  onExportWord,
  onCopyToClipboard,
  pdfLabel = "Als PDF",
  wordLabel = "Als Word",
  copyLabel = "Kopieren"
}: ExportButtonsProps) {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "word" | null>(null);

  const handleExportPdf = async () => {
    setExporting("pdf");
    try {
      await onExportPdf();
      toast({
        title: "PDF erstellt!",
        description: "Das PDF wurde heruntergeladen.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "PDF-Export fehlgeschlagen.",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  const handleExportWord = async () => {
    setExporting("word");
    try {
      await onExportWord();
      toast({
        title: "Word-Dokument erstellt!",
        description: "Das Dokument wurde heruntergeladen.",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Word-Export fehlgeschlagen.",
        variant: "destructive",
      });
    } finally {
      setExporting(null);
    }
  };

  const handleCopy = async () => {
    try {
      await onCopyToClipboard();
      setCopied(true);
      toast({
        title: "Kopiert!",
        description: "Inhalt wurde in die Zwischenablage kopiert.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Kopieren fehlgeschlagen. Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExportPdf}
        disabled={exporting !== null}
      >
        <FileDown className="h-4 w-4 mr-1.5" />
        {exporting === "pdf" ? "Exportiere..." : pdfLabel}
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExportWord}
        disabled={exporting !== null}
      >
        <FileText className="h-4 w-4 mr-1.5" />
        {exporting === "word" ? "Exportiere..." : wordLabel}
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleCopy}
        disabled={exporting !== null}
      >
        {copied ? (
          <Check className="h-4 w-4 mr-1.5 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 mr-1.5" />
        )}
        {copyLabel}
      </Button>
    </div>
  );
}
