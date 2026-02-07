import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";
import { ROIResultCard } from "./ROIResultCard";
import { type ROICalculatorDefinition } from "@/data/roiCalculatorData";
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

export function ROICalculator<TInput extends object, TOutput>({
  definition,
  defaultInputs,
  calculateFn,
  formatResult,
}: ROICalculatorProps<TInput, TOutput>) {
  const [inputs, setInputs] = useState<TInput>(defaultInputs);
  const [result, setResult] = useState<TOutput | null>(null);

  const handleInputChange = (id: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setInputs((prev) => ({ ...prev, [id]: numValue }));
  };

  const handleCalculate = () => {
    const output = calculateFn(inputs);
    setResult(output);
  };

  const handleReset = () => {
    setResult(null);
  };

  if (result) {
    const formatted = formatResult(inputs, result);
    const TypeIcon = getROITypeIcon(definition.id);
    return (
      <ROIResultCard
        title={definition.title}
        icon={TypeIcon}
        mainResult={formatted.mainResult}
        comparisonRows={formatted.comparisonRows}
        interpretation={formatted.interpretation}
        assumptions={formatted.assumptions}
        onReset={handleReset}
      />
    );
  }

  const TitleIcon = getROITypeIcon(definition.id);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <TitleIcon className="h-6 w-6 text-primary" />
          {definition.title}
        </h3>
        <p className="text-muted-foreground mt-1">
          {definition.description}
        </p>
      </div>

      {definition.sections.map((section) => (
        <Card key={section.title}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{section.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="text-sm">
                  {field.label}
                  {field.unit && <span className="text-muted-foreground ml-1">({field.unit})</span>}
                </Label>
                <Input
                  id={field.id}
                  type="number"
                  value={(inputs as Record<string, number>)[field.id]}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  min={field.min}
                  max={field.max}
                  step={field.step || 1}
                />
                {field.hint && (
                  <p className="text-xs text-muted-foreground">{field.hint}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Button onClick={handleCalculate} className="w-full" size="lg">
        <Calculator className="h-4 w-4 mr-2" />
        ROI berechnen
      </Button>
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
