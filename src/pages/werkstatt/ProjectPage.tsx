// DS Werkstatt Project Page - CRISP-DM Navigation
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/useProject';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronLeft, ChevronRight, FlaskConical, Info } from 'lucide-react';
import { CrispDmStepper } from '@/components/werkstatt/CrispDmStepper';
import { CrispDmPhaseWrapper } from '@/components/werkstatt/CrispDmPhaseWrapper';
import { BusinessUnderstanding } from '@/components/werkstatt/phases/BusinessUnderstanding';
import { DataUnderstanding } from '@/components/werkstatt/phases/DataUnderstanding';
import { DataPreparation } from '@/components/werkstatt/phases/DataPreparation';
import { Modeling } from '@/components/werkstatt/phases/Modeling';
import { Evaluation } from '@/components/werkstatt/phases/Evaluation';
import { Deployment } from '@/components/werkstatt/phases/Deployment';
import { WorkspaceStorage, isExampleProject } from '@/engine/workspace/WorkspaceStorage';
import { WorkspaceProject, Feature, CrispDmPhaseId } from '@/engine/types';

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    project,
    isLoading,
    currentPhase,
    currentPhaseIndex,
    phases,
    phaseGuidance,
    tutorHints,
    progressPercent,
    phasePrerequisites,
    goToPhase,
    goToNextPhase,
    goToPreviousPhase,
    addFeature,
    updateFeature,
    removeFeature,
    refreshProject,
    replaceProject,
  } = useProject(projectId);

  const isExample = project ? isExampleProject(project.id) : false;

  /** Clone example project, apply updates, and swap in-place (no remount) */
  const cloneAndApply = (updates: Partial<WorkspaceProject>): void => {
    if (!project) return;

    const copy = WorkspaceStorage.cloneExampleProject(project.id);

    // Preserve current phase + phase status from session state
    const mergedUpdates = {
      currentPhase: project.currentPhase,
      phases: project.phases.map(p => ({ ...p })),
      ...updates,
    };
    const updatedClone = WorkspaceStorage.updateProject(copy.id, mergedUpdates);

    // Update URL via React Router so location.pathname updates (sidebar reacts)
    navigate(`/werkstatt/${copy.id}`, { replace: true });

    // Swap project in-place (no remount → component state preserved)
    if (updatedClone) {
      replaceProject(updatedClone);
    }

    // Clean up session state for the old example project
    try { sessionStorage.removeItem(`ds-werkstatt-example-${project.id}`); } catch { /* ignore */ }

    toast({
      title: 'Eigene Kopie angelegt',
      description: "Das Beispielprojekt wurde unter 'Meine Projekte' kopiert.",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <FlaskConical className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Projekt wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Projekt nicht gefunden</h1>
        <p className="text-muted-foreground mb-4">Das angeforderte Projekt existiert nicht.</p>
        <Button onClick={() => navigate('/werkstatt')}>Zurück zur Übersicht</Button>
      </div>
    );
  }

  const handleUpdateProject = (updates: Partial<WorkspaceProject>) => {
    if (isExample) {
      cloneAndApply(updates);
      return;
    }
    WorkspaceStorage.updateProject(project.id, updates);
    refreshProject();
  };

  const handleAddFeature = (feature: Omit<Feature, 'id'>) => {
    if (isExample) {
      const newFeature: Feature = { ...feature, id: `feature-${Date.now()}` };
      cloneAndApply({ features: [...project.features, newFeature] });
      return;
    }
    addFeature(feature);
  };

  const handleUpdateFeature = (featureId: string, updates: Partial<Feature>) => {
    if (isExample) {
      const features = project.features.map(f =>
        f.id === featureId ? { ...f, ...updates } : f
      );
      cloneAndApply({ features });
      return;
    }
    updateFeature(featureId, updates);
  };

  const handleRemoveFeature = (featureId: string) => {
    if (isExample) {
      const features = project.features.filter(f => f.id !== featureId);
      cloneAndApply({ features });
      return;
    }
    removeFeature(featureId);
  };

  // Compute warnings for phases with unmet prerequisites
  const phaseWarnings: Partial<Record<CrispDmPhaseId, string>> = {};
  if (phasePrerequisites) {
    for (const [phaseId, prereq] of Object.entries(phasePrerequisites)) {
      if (!prereq.met && prereq.warning) {
        phaseWarnings[phaseId as CrispDmPhaseId] = prereq.warning;
      }
    }
  }

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'business-understanding':
        return (
          <BusinessUnderstanding
            project={project}
            onUpdateProject={handleUpdateProject}
            onAddFeature={handleAddFeature}
            onUpdateFeature={handleUpdateFeature}
            onRemoveFeature={handleRemoveFeature}
          />
        );
      case 'data-understanding':
        return (
          <DataUnderstanding
            project={project}
            onUpdateProject={handleUpdateProject}
          />
        );
      case 'data-preparation':
        return (
          <DataPreparation
            project={project}
            onUpdateProject={handleUpdateProject}
          />
        );
      case 'modeling':
        return (
          <Modeling
            project={project}
            onUpdateProject={handleUpdateProject}
          />
        );
      case 'evaluation':
        return (
          <Evaluation
            project={project}
            onUpdateProject={handleUpdateProject}
          />
        );
      case 'deployment':
        return (
          <Deployment
            project={project}
            onUpdateProject={handleUpdateProject}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Example project info banner */}
      {isExample && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Dies ist ein Beispielprojekt</p>
            <p className="text-sm text-blue-600">
              Änderungen werden automatisch als eigene Kopie unter „Meine Projekte" gespeichert.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/werkstatt')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold">{project.name}</h1>
            {isExample && (
              <Badge variant="secondary">Beispiel</Badge>
            )}
            {!isExample && project.hasDemoData && (
              <Badge variant="secondary">Demo</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {project.description || 'Keine Beschreibung'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:flex">
            {progressPercent}% abgeschlossen
          </Badge>
        </div>
      </div>

      {/* Phase Content with Tutor Panel (Stepper inside left column) */}
      {phaseGuidance && (
        <CrispDmPhaseWrapper
          guidance={phaseGuidance}
          hints={tutorHints}
          showTutorPanel={true}
          stepper={
            <CrispDmStepper
              phases={phases}
              currentPhase={currentPhase}
              onPhaseClick={goToPhase}
              orientation="horizontal"
              phaseWarnings={phaseWarnings}
            />
          }
        >
          {renderPhaseContent()}
        </CrispDmPhaseWrapper>
      )}

      {/* Sticky Bottom Navigation Bar */}
      <div className="sticky bottom-0 z-20 mt-6 -mx-4 px-4 border-t bg-background/80 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center py-3 max-w-6xl mx-auto">
          <Button
            variant="outline"
            onClick={goToPreviousPhase}
            disabled={currentPhaseIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Zurück
          </Button>

          <span className="text-sm text-muted-foreground">
            Phase {currentPhaseIndex + 1} von {phases.length}
          </span>

          <Button
            onClick={goToNextPhase}
            disabled={currentPhaseIndex === phases.length - 1}
            className="gap-2"
          >
            Weiter
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
