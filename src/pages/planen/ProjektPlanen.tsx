import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, LayoutGrid } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCanvasState } from '@/hooks/useCanvasState';
import { ScenarioSelector } from '@/components/canvas/ScenarioSelector';
import { CanvasPhaseCard } from '@/components/canvas/CanvasPhaseCard';
import { CanvasProgress } from '@/components/canvas/CanvasProgress';
import { exportCanvasToPdf } from '@/components/canvas/CanvasPdfExport';
import { IconBox } from '@/components/ui/IconBox';
import { getProblemTypeIcon, getIndustryIcon } from '@/data/icons';
import { 
  phases, 
  problemTypes, 
  industries, 
  getScenarioContext 
} from '@/data/canvasData';

const Canvas = () => {
  const isMobile = useIsMobile();
  const {
    state,
    setScenario,
    setNote,
    toggleCheck,
    getProgress,
    reset,
    hasScenario
  } = useCanvasState();

  const [showCanvas, setShowCanvas] = useState(hasScenario);
  const [openPhases, setOpenPhases] = useState<Set<string>>(new Set([phases[0].id]));

  const togglePhase = (phaseId: string) => {
    setOpenPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  const selectedProblem = problemTypes.find(p => p.id === state.problemType);
  const selectedIndustry = industries.find(i => i.id === state.industry);
  const context = state.problemType && state.industry 
    ? getScenarioContext(state.problemType, state.industry)
    : null;

  const progress = getProgress();

  const handleConfirmScenario = () => {
    setShowCanvas(true);
  };

  const handleChangeScenario = () => {
    setShowCanvas(false);
  };

  const handleExportPdf = () => {
    exportCanvasToPdf(state);
  };

  const handleReset = () => {
    reset();
    setShowCanvas(false);
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      {/* Header */}
      <section className="mb-4 md:mb-8">
        <div className="flex items-center gap-3 mb-3">
          <LayoutGrid className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-4xl font-bold">CRISP-DM Canvas</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Plane dein Data-Science-Projekt Schritt für Schritt. 
          Wähle ein Szenario, mache dir Notizen und prüfe mit der Checkliste, 
          ob du an alles gedacht hast.
        </p>
      </section>

      {/* Main Content */}
      {!showCanvas ? (
        <ScenarioSelector
          selectedProblemType={state.problemType}
          selectedIndustry={state.industry}
          onSelect={setScenario}
          onConfirm={handleConfirmScenario}
        />
      ) : (
        <div className="space-y-6">
          {/* Scenario Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="secondary" className="text-base px-3 py-1 flex items-center gap-2">
                {selectedProblem && (() => {
                  const ProblemIcon = getProblemTypeIcon(selectedProblem.id);
                  return <ProblemIcon className="h-4 w-4 text-primary" strokeWidth={1.5} />;
                })()}
                {selectedProblem?.name}
              </Badge>
              <span className="text-muted-foreground">×</span>
              <Badge variant="secondary" className="text-base px-3 py-1 flex items-center gap-2">
                {selectedIndustry && (() => {
                  const IndustryIcon = getIndustryIcon(selectedIndustry.id);
                  return <IndustryIcon className="h-4 w-4 text-primary" strokeWidth={1.5} />;
                })()}
                {selectedIndustry?.name}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleChangeScenario}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Szenario ändern
            </Button>
          </div>

          {/* Phase Cards */}
          <div className="space-y-3">
            {phases.map((phase, index) => (
              <CanvasPhaseCard
                key={phase.id}
                phase={phase}
                phaseIndex={index}
                context={context!}
                note={state.notes[phase.id] || ''}
                checks={state.checks}
                onNoteChange={(note) => setNote(phase.id, note)}
                onCheckToggle={toggleCheck}
                isOpen={openPhases.has(phase.id)}
                onToggle={() => togglePhase(phase.id)}
              />
            ))}
          </div>

          {/* Progress & Actions */}
          <CanvasProgress
            completed={progress.completed}
            total={progress.total}
            percentage={progress.percentage}
            onExportPdf={handleExportPdf}
            onReset={handleReset}
          />
        </div>
      )}
    </div>
  );
};

export default Canvas;
