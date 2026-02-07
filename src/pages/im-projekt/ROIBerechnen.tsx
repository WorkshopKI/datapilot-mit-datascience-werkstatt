import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calculator } from "lucide-react";
import { roiCalculators } from "@/data/roiCalculatorData";
import { IconBox } from "@/components/ui/IconBox";
import { getROITypeIcon } from "@/data/icons";
import { 
  ChurnCalculator, 
  FraudCalculator, 
  ConversionCalculator, 
  DemandCalculator 
} from "@/components/werkzeuge/roiConfigs";

type CalculatorType = "churn" | "fraud" | "conversion" | "demand" | null;

export default function ROICalculator() {
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorType>(null);

  const renderCalculator = () => {
    switch (selectedCalculator) {
      case "churn":
        return <ChurnCalculator />;
      case "fraud":
        return <FraudCalculator />;
      case "conversion":
        return <ConversionCalculator />;
      case "demand":
        return <DemandCalculator />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">

      {/* Header */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Calculator className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">ROI-Rechner</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Berechne den Business Value deines Data-Science-Projekts mit konkreten Zahlen.
        </p>
      </div>

      {!selectedCalculator ? (
        <>
          {/* Calculator Selection */}
          <div className="grid gap-4 md:grid-cols-2">
            {roiCalculators.map((calc) => (
              <Card
                key={calc.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5"
                onClick={() => setSelectedCalculator(calc.id as CalculatorType)}
              >
                <CardHeader>
                  <IconBox icon={getROITypeIcon(calc.id)} size="lg" className="mb-2" />
                  <CardTitle className="text-xl">{calc.title}</CardTitle>
                  <CardDescription>{calc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-primary font-medium">
                    Rechner starten →
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Note */}
          <div className="mt-6 md:mt-8 p-3 md:p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
            <p>
              💡 <strong>Tipp:</strong> Diese Rechner helfen dir, den Business Case für dein 
              Data-Science-Projekt zu quantifizieren. Die Ergebnisse eignen sich gut für 
              Stakeholder-Präsentationen und Go/No-Go-Entscheidungen.
            </p>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* Back to Calculator Selection */}
          <button
            onClick={() => setSelectedCalculator(null)}
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Anderen Rechner wählen
          </button>

          {/* Selected Calculator */}
          {renderCalculator()}
        </div>
      )}
    </div>
  );
}
