import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";
import { ScenarioSelector } from "@/components/canvas/ScenarioSelector";
import { StarterDocumentPreview } from "@/components/werkzeuge/StarterDocumentPreview";
import { ExportButtons } from "@/components/werkzeuge/ExportButtons";
import { problemTypes, industries, getScenarioContext } from "@/data/canvasData";
import { getStarterContent } from "@/data/starterKitData";
import { exportElementToPdf } from "@/lib/pdfExport";
import { exportStarterKitToWord } from "@/lib/wordExport";

type Step = "scenario" | "name" | "document";

export default function ProjektStarter() {
  const [step, setStep] = useState<Step>("scenario");
  const [selectedProblemType, setSelectedProblemType] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScenarioSelect = (problemType: string | null, industry: string | null) => {
    setSelectedProblemType(problemType);
    setSelectedIndustry(industry);
  };

  const handleScenarioConfirm = () => {
    setStep("name");
  };

  const handleNameConfirm = () => {
    setStep("document");
  };

  const handleBack = () => {
    if (step === "document") {
      setStep("name");
    } else if (step === "name") {
      setStep("scenario");
    }
  };

  const handleReset = () => {
    setStep("scenario");
    setSelectedProblemType(null);
    setSelectedIndustry(null);
    setProjectName("");
  };

  const generateClipboardContent = (): string => {
    if (!selectedProblemType || !selectedIndustry) return "";

    const problem = problemTypes.find(p => p.id === selectedProblemType);
    const industry = industries.find(i => i.id === selectedIndustry);
    const context = getScenarioContext(selectedProblemType, selectedIndustry);
    const content = getStarterContent(selectedProblemType, selectedIndustry);

    if (!problem || !industry || !context) return "";

    let text = `# ${projectName || "Projekt-Starter Kit"}\n\n`;
    text += `## Szenario: ${problem.emoji} ${problem.name} × ${industry.emoji} ${industry.name}\n\n`;
    text += `### Kontext\n${context.context}\n\n`;
    text += `Typische KPIs: ${context.typischeKPIs}\n`;
    text += `Typische Intervention: ${context.typischeIntervention}\n\n`;

    text += `## Checklisten\n\n`;
    const phases = ["business", "data", "preparation", "modeling", "evaluation", "deployment"];
    const phaseNames: Record<string, string> = {
      business: "Business Understanding",
      data: "Data Understanding", 
      preparation: "Data Preparation",
      modeling: "Modeling",
      evaluation: "Evaluation",
      deployment: "Deployment"
    };

    phases.forEach(phase => {
      text += `### ${phaseNames[phase]}\n`;
      content.checklists[phase as keyof typeof content.checklists].forEach(item => {
        text += `- [ ] ${item}\n`;
      });
      text += "\n";
    });

    if (content.dataSources.length > 0) {
      text += `## Typische Datenquellen (${industry.name})\n`;
      content.dataSources.forEach(source => {
        text += `- ${source}\n`;
      });
      text += "\n";
    }

    if (content.pitfalls.length > 0) {
      text += `## Typische Stolperfallen (${problem.name})\n`;
      content.pitfalls.forEach(pitfall => {
        text += `⚠️ **${pitfall.title}**: ${pitfall.description}\n`;
      });
      text += "\n";
    }

    return text;
  };

  const handleCopyToClipboard = async () => {
    const content = generateClipboardContent();
    await navigator.clipboard.writeText(content);
  };

  const handleExportPdf = async () => {
    if (!contentRef.current || !selectedProblemType || !selectedIndustry) return;
    await exportElementToPdf(contentRef.current, {
      filename: `starter-kit-${selectedProblemType}-${selectedIndustry}.pdf`,
    });
  };

  const handleExportWord = async () => {
    if (!selectedProblemType || !selectedIndustry) return;

    const problem = problemTypes.find(p => p.id === selectedProblemType);
    const industry = industries.find(i => i.id === selectedIndustry);
    const context = getScenarioContext(selectedProblemType, selectedIndustry);
    const content = getStarterContent(selectedProblemType, selectedIndustry);

    if (!problem || !industry || !context) return;

    await exportStarterKitToWord({
      projectName,
      problemType: problem,
      industry: industry,
      context: context,
      checklists: content.checklists,
      pitfalls: content.pitfalls,
      dataSources: content.dataSources,
    });
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">

      <div className="mb-4 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Projekt-Starter Kit</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Generiere ein Starter-Dokument mit Checklisten, Stolperfallen und Fragen für dein Szenario.
        </p>
      </div>

      {/* Step 1: Scenario Selection */}
      {step === "scenario" && (
        <ScenarioSelector
          selectedProblemType={selectedProblemType}
          selectedIndustry={selectedIndustry}
          onSelect={handleScenarioSelect}
          onConfirm={handleScenarioConfirm}
        />
      )}

      {/* Step 2: Project Name */}
      {step === "name" && (
        <div className="space-y-6">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>

          <div className="max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Projektname (optional)</h2>
            <p className="text-muted-foreground">
              Gib deinem Projekt einen Namen, um das Dokument zu personalisieren.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="project-name">Projektname</Label>
              <Input
                id="project-name"
                placeholder="z.B. Churn-Prediction Q1 2026"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>

            <Button onClick={handleNameConfirm} className="w-full">
              Dokument generieren
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Document Preview */}
      {step === "document" && selectedProblemType && selectedIndustry && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Zurück
            </Button>
            <ExportButtons
              onExportPdf={handleExportPdf}
              onExportWord={handleExportWord}
              onCopyToClipboard={handleCopyToClipboard}
            />
          </div>

          <div ref={contentRef}>
            <StarterDocumentPreview
              problemTypeId={selectedProblemType}
              industryId={selectedIndustry}
              projectName={projectName}
            />
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={handleReset}>
              Neues Kit erstellen
            </Button>
            <ExportButtons
              onExportPdf={handleExportPdf}
              onExportWord={handleExportWord}
              onCopyToClipboard={handleCopyToClipboard}
            />
          </div>
        </div>
      )}
    </div>
  );
}
