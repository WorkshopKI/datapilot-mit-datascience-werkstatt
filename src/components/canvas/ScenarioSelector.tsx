import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconBox } from '@/components/ui/IconBox';
import { getProblemTypeIcon, getIndustryIcon } from '@/data/icons';
import { 
  problemTypes, 
  industries, 
  getCompatibleIndustries, 
  getScenarioContext,
  hasScenarioContext,
  type ProblemType,
  type Industry
} from '@/data/canvasData';

interface ScenarioSelectorProps {
  selectedProblemType: string | null;
  selectedIndustry: string | null;
  onSelect: (problemType: string | null, industry: string | null) => void;
  onConfirm: () => void;
}

export function ScenarioSelector({ 
  selectedProblemType, 
  selectedIndustry, 
  onSelect,
  onConfirm 
}: ScenarioSelectorProps) {
  const [step, setStep] = useState<1 | 2 | 3>(
    selectedProblemType && selectedIndustry ? 3 : 
    selectedProblemType ? 2 : 1
  );

  const compatibleIndustries = selectedProblemType 
    ? getCompatibleIndustries(selectedProblemType) 
    : [];

  const selectedProblem = problemTypes.find(p => p.id === selectedProblemType);
  const selectedInd = industries.find(i => i.id === selectedIndustry);
  const context = selectedProblemType && selectedIndustry 
    ? getScenarioContext(selectedProblemType, selectedIndustry)
    : null;

  const handleProblemSelect = (problemType: ProblemType) => {
    onSelect(problemType.id, null);
    setStep(2);
  };

  const handleIndustrySelect = (industry: Industry) => {
    onSelect(selectedProblemType, industry.id);
    setStep(3);
  };

  const handleBack = () => {
    if (step === 3) {
      onSelect(selectedProblemType, null);
      setStep(2);
    } else if (step === 2) {
      onSelect(null, null);
      setStep(1);
    }
  };

  // Step 1: Problem Type Selection
  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Schritt 1: Was möchtest du vorhersagen?</h2>
          <p className="text-muted-foreground">Wähle den Problemtyp, der am besten zu deinem Projekt passt.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {problemTypes.map((problem) => (
            <Card
              key={problem.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
                "hover:scale-[1.02]",
                selectedProblemType === problem.id && "border-2 border-primary bg-primary/5"
              )}
              onClick={() => handleProblemSelect(problem)}
            >
              <CardContent className="p-5">
                <IconBox icon={getProblemTypeIcon(problem.id)} size="lg" className="mb-3" />
                <h3 className="font-semibold text-lg mb-1">{problem.name}</h3>
                <p className="text-sm text-muted-foreground">{problem.kernfrage}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Step 2: Industry Selection
  if (step === 2) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>
          <Badge variant="secondary" className="text-base px-3 py-1 flex items-center gap-2">
            {selectedProblem && <span className="text-primary"><IconBox icon={getProblemTypeIcon(selectedProblem.id)} size="sm" /></span>}
            {selectedProblem?.name}
          </Badge>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Schritt 2: In welcher Branche?</h2>
          <p className="text-muted-foreground">
            Passende Branchen für "{selectedProblem?.name}":
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {industries.map((industry) => {
            const isCompatible = compatibleIndustries.some(c => c.id === industry.id);
            const hasContext = selectedProblemType && hasScenarioContext(selectedProblemType, industry.id);
            
            return (
              <Button
                key={industry.id}
                variant={selectedIndustry === industry.id ? "default" : "outline"}
                className={cn(
                  "text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 h-auto flex items-center gap-1.5 sm:gap-2",
                  !isCompatible && "opacity-40 cursor-not-allowed",
                  isCompatible && !hasContext && "border-dashed",
                  selectedIndustry === industry.id && "ring-2 ring-primary ring-offset-2"
                )}
                disabled={!isCompatible}
                onClick={() => handleIndustrySelect(industry)}
              >
                {(() => {
                  const IndustryIcon = getIndustryIcon(industry.id);
                  return <IndustryIcon className="h-4 w-4 text-primary" strokeWidth={1.5} />;
                })()}
                {industry.name}
              </Button>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground">
          💡 Ausgegraut = nicht typisch für diesen Problemtyp
        </p>
      </div>
    );
  }

  // Step 3: Confirmation
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Andere Auswahl
        </Button>
      </div>

      <Card className="border-2 border-primary bg-primary/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">Dein Szenario</span>
          </div>

          <div className="flex items-center gap-3 text-xl flex-wrap">
            <div className="flex items-center gap-2">
              {selectedProblem && <IconBox icon={getProblemTypeIcon(selectedProblem.id)} size="sm" />}
              <span>{selectedProblem?.name}</span>
            </div>
            <span className="text-muted-foreground">×</span>
            <div className="flex items-center gap-2">
              {selectedInd && (() => {
                const IndustryIcon = getIndustryIcon(selectedInd.id);
                return <IndustryIcon className="h-5 w-5 text-primary" strokeWidth={1.5} />;
              })()}
              <span>{selectedInd?.name}</span>
            </div>
          </div>

          {context && (
            <>
              <p className="text-muted-foreground leading-relaxed">
                {context.context}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="font-medium">Typische KPIs:</span>{' '}
                  <span className="text-muted-foreground">{context.typischeKPIs}</span>
                </div>
                <div>
                  <span className="font-medium">Typische Intervention:</span>{' '}
                  <span className="text-muted-foreground">{context.typischeIntervention}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={onConfirm}>
          Canvas starten
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
