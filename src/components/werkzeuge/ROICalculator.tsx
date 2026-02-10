import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Copy, Check, Info, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { ROIResultCard } from "./ROIResultCard";
import { type ROICalculatorDefinition, type ScenarioPreset } from "@/data/roiCalculatorData";
import { getROITypeIcon } from "@/data/icons";

// Generische Typen für Ergebnis-Formatierung
export interface ROIMainResult {
  label: string;
  value: string;
  sublabel: string;
}

export interface ROIComparisonRow {
  label: string;
  withoutModel: string;
  withModel: string;
}

export interface ROIFormattedResult {
  mainResult: ROIMainResult;
  comparisonRows: ROIComparisonRow[];
  interpretation: string;
  assumptions: string[];
}

interface ROICalculatorProps<TInput, TOutput> {
  definition: ROICalculatorDefinition;
  defaultInputs: TInput;
  calculateFn: (inputs: TInput) => TOutput;
  formatResult: (inputs: TInput, result: TOutput) => ROIFormattedResult;
}

const formatSliderValue = (value: number, unit?: string): string => {
  if (unit === "€") {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} Mio. €`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}k €`;
    return `${value.toFixed(value < 1 ? 2 : 0)} €`;
  }
  if (unit === "%") return `${value.toFixed(value < 1 ? 2 : value < 10 ? 1 : 0)}%`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} Mio.`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
  return value.toFixed(0);
};

export function ROICalculator<TInput extends object, TOutput>({
  definition,
  defaultInputs,
  calculateFn,
  formatResult,
}: ROICalculatorProps<TInput, TOutput>) {
  const [inputs, setInputs] = useState<TInput>(defaultInputs);
  const { toast } = useToast();
  const exportRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const result = useMemo(() => calculateFn(inputs), [inputs, calculateFn]);
  const formatted = useMemo(() => formatResult(inputs, result), [inputs, result, formatResult]);

  const TypeIcon = getROITypeIcon(definition.id);

  const handleSliderChange = (id: string, value: number[]) => {
    setInputs((prev) => ({ ...prev, [id]: value[0] }));
  };

  const applyScenario = (scenario: ScenarioPreset) => {
    setInputs((prev) => ({ ...prev, ...scenario.values } as TInput));
  };

  const isActiveScenario = (scenario: ScenarioPreset): boolean =>
    Object.entries(scenario.values).every(
      ([key, val]) => (inputs as Record<string, number>)[key] === val
    );

  const handleCopyNumbers = async () => {
    const textContent = [
      definition.title,
      "",
      `Hauptergebnis: ${formatted.mainResult.label}`,
      formatted.mainResult.value,
      formatted.mainResult.sublabel ? `(${formatted.mainResult.sublabel})` : "",
      "",
      "Vergleich:",
      ...formatted.comparisonRows.map(
        (row) => `${row.label}: Ohne Modell: ${row.withoutModel} | Mit Modell: ${row.withModel}`
      ),
      "",
      `Interpretation: ${formatted.interpretation}`,
    ]
      .filter(Boolean)
      .join("\n");

    await navigator.clipboard.writeText(textContent);
    setCopied(true);
    toast({ title: "Zahlen kopiert", description: "Du kannst sie jetzt einfügen." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSlide = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `roi-${definition.id}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast({ title: "Slide exportiert", description: "PNG-Datei wurde heruntergeladen." });
    } catch {
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
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <TypeIcon className="h-6 w-6 text-primary" />
          {definition.title}
        </h3>
        <p className="text-muted-foreground mt-1">{definition.description}</p>
      </div>

      {/* Side-by-side layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Inputs */}
        <div className="space-y-5">
          {/* Scenario presets */}
          {definition.scenarios && definition.scenarios.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Szenario wählen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {definition.scenarios.map((scenario) => (
                    <Button
                      key={scenario.label}
                      variant={isActiveScenario(scenario) ? "default" : "outline"}
                      size="sm"
                      onClick={() => applyScenario(scenario)}
                      className="gap-1.5"
                    >
                      <span>{scenario.emoji}</span>
                      {scenario.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Slider sections */}
          {definition.sections.map((section) => (
            <Card key={section.title}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {section.fields.map((field) => {
                  const currentValue = (inputs as Record<string, number>)[field.id];
                  const effectiveMin = field.min ?? 0;
                  const effectiveMax = field.max ?? (
                    field.unit === "€" ? field.defaultValue * 5 :
                    field.defaultValue * 3
                  );
                  const effectiveStep = field.step ?? (
                    effectiveMax > 100000 ? Math.pow(10, Math.floor(Math.log10(effectiveMax)) - 2) :
                    effectiveMax > 1000 ? 10 :
                    effectiveMax > 100 ? 1 :
                    0.1
                  );

                  return (
                    <div key={field.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">{field.label}</label>
                        <span className="text-sm font-semibold text-primary tabular-nums">
                          {formatSliderValue(currentValue, field.unit)}
                        </span>
                      </div>
                      <Slider
                        value={[currentValue]}
                        onValueChange={(val) => handleSliderChange(field.id, val)}
                        min={effectiveMin}
                        max={effectiveMax}
                        step={effectiveStep}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatSliderValue(effectiveMin, field.unit)}</span>
                        <span>{formatSliderValue(effectiveMax, field.unit)}</span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* RIGHT: Live Results */}
        <div className="lg:sticky lg:top-4 self-start space-y-4">
          {/* Main result */}
          <div className="bg-gradient-to-br from-green-600 to-emerald-500 text-white rounded-xl p-6 text-center">
            <div className="flex justify-center mb-2">
              <TypeIcon className="h-8 w-8" />
            </div>
            <div className="text-sm opacity-90 mb-1">{formatted.mainResult.label}</div>
            <div className="text-3xl md:text-4xl font-bold">{formatted.mainResult.value}</div>
            {formatted.mainResult.sublabel && (
              <div className="text-sm opacity-80 mt-1">{formatted.mainResult.sublabel}</div>
            )}
          </div>

          {/* Comparison table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Vergleich: Ohne vs. Mit Modell</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Metrik</TableHead>
                    <TableHead className="text-xs text-right">Ohne Modell</TableHead>
                    <TableHead className="text-xs text-right">Mit Modell</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formatted.comparisonRows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium py-2">{row.label}</TableCell>
                      <TableCell className="text-sm text-right text-muted-foreground py-2">
                        {row.withoutModel}
                      </TableCell>
                      <TableCell className="text-sm text-right font-medium text-green-600 py-2">
                        {row.withModel}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Interpretation */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">{formatted.interpretation}</p>
            </div>
          </div>

          {/* Assumptions */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 space-y-1">
                <p className="font-medium">Annahmen</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {formatted.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Export buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSlide}
              disabled={exporting}
              className="flex-1 gap-1.5"
            >
              <Download className="h-4 w-4" />
              {exporting ? "Exportiere..." : "Als Slide"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyNumbers}
              className="flex-1 gap-1.5"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Kopiert!" : "Zahlen kopieren"}
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden ROIResultCard for PNG export */}
      <div className="fixed -left-[9999px] top-0" aria-hidden="true">
        <div ref={exportRef}>
          <ROIResultCard
            title={definition.title}
            icon={TypeIcon}
            mainResult={formatted.mainResult}
            comparisonRows={formatted.comparisonRows}
            interpretation={formatted.interpretation}
            assumptions={formatted.assumptions}
            onReset={() => {}}
          />
        </div>
      </div>
    </div>
  );
}

// Hilfsfunktionen für Formatierung
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number, decimals = 0) => {
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: decimals,
  }).format(value);
};
