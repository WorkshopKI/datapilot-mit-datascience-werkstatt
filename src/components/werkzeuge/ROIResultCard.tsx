import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Copy, RotateCcw, Check, AlertTriangle, type LucideIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { useState } from "react";

interface ComparisonRow {
  label: string;
  withoutModel: string;
  withModel: string;
  unit?: string;
}

interface ROIResultCardProps {
  title: string;
  icon: LucideIcon;
  mainResult: {
    label: string;
    value: string;
    sublabel?: string;
  };
  comparisonRows: ComparisonRow[];
  interpretation: string;
  assumptions: string[];
  onReset: () => void;
}

export function ROIResultCard({
  title,
  icon: Icon,
  mainResult,
  comparisonRows,
  interpretation,
  assumptions,
  onReset,
}: ROIResultCardProps) {
  const { toast } = useToast();
  const resultRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const formatNumber = (value: string) => {
    // Keep as is if already formatted
    return value;
  };

  const handleCopyNumbers = async () => {
    const textContent = [
      `${title}`,
      ``,
      `Hauptergebnis: ${mainResult.label}`,
      `${mainResult.value}`,
      mainResult.sublabel ? `(${mainResult.sublabel})` : "",
      ``,
      `Vergleich:`,
      ...comparisonRows.map(
        (row) => `${row.label}: Ohne Modell: ${row.withoutModel}${row.unit || ""} | Mit Modell: ${row.withModel}${row.unit || ""}`
      ),
      ``,
      `Interpretation: ${interpretation}`,
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(textContent);
    setCopied(true);
    toast({ title: "Zahlen kopiert", description: "Du kannst sie jetzt einfügen." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSlide = async () => {
    if (!resultRef.current) return;
    
    setExporting(true);
    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `roi-${title.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast({ title: "Slide exportiert", description: "PNG-Datei wurde heruntergeladen." });
    } catch (error) {
      toast({ 
        title: "Export fehlgeschlagen", 
        description: "Bitte versuche es erneut.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div ref={resultRef} className="space-y-4 p-4 bg-background rounded-lg">
        {/* Main Result Box */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-500 text-white rounded-xl p-6 text-center">
          <div className="flex justify-center mb-2">
            <Icon className="h-10 w-10" />
          </div>
          <div className="text-sm opacity-90 mb-1">{mainResult.label}</div>
          <div className="text-3xl md:text-4xl font-bold">{mainResult.value}</div>
          {mainResult.sublabel && (
            <div className="text-sm opacity-80 mt-1">{mainResult.sublabel}</div>
          )}
        </div>

        {/* Comparison Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vergleich: Ohne vs. Mit Modell</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Metrik</TableHead>
                    <TableHead className="text-right">Ohne Modell</TableHead>
                    <TableHead className="text-right">Mit Modell</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonRows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{row.label}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatNumber(row.withoutModel)}{row.unit || ""}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                        {formatNumber(row.withModel)}{row.unit || ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Interpretation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Interpretation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{interpretation}</p>
          </CardContent>
        </Card>

        {/* Assumptions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Annahmen & Einschränkungen</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              {assumptions.map((assumption, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  {assumption}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={handleExportSlide} disabled={exporting}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? "Exportiere..." : "Als Slide (PNG)"}
        </Button>
        <Button variant="outline" onClick={handleCopyNumbers}>
          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
          {copied ? "Kopiert!" : "Zahlen kopieren"}
        </Button>
        <Button variant="ghost" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Neu berechnen
        </Button>
      </div>
    </div>
  );
}
