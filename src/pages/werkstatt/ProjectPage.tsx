// DS Werkstatt Project Page - CRISP-DM Navigation
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/useProject';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronLeft, ChevronRight, FlaskConical } from 'lucide-react';
import { CrispDmStepper } from '@/components/werkstatt/CrispDmStepper';
import { CrispDmPhaseWrapper } from '@/components/werkstatt/CrispDmPhaseWrapper';
import { BusinessUnderstanding } from '@/components/werkstatt/phases/BusinessUnderstanding';
import { DataUnderstanding } from '@/components/werkstatt/phases/DataUnderstanding';
import { DataPreparation } from '@/components/werkstatt/phases/DataPreparation';
import { Modeling } from '@/components/werkstatt/phases/Modeling';
import { Evaluation } from '@/components/werkstatt/phases/Evaluation';
import { Deployment } from '@/components/werkstatt/phases/Deployment';
import { WorkspaceStorage } from '@/engine/workspace/WorkspaceStorage';
import { WorkspaceProject, Feature } from '@/engine/types';

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const {
    project,
    isLoading,
    currentPhase,
    currentPhaseIndex,
    phases,
    phaseGuidance,
    tutorHints,
    progressPercent,
    goToPhase,
    goToNextPhase,
    goToPreviousPhase,
    addFeature,
    updateFeature,
    removeFeature,
    refreshProject,
  } = useProject(projectId);

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
    WorkspaceStorage.updateProject(project.id, updates);
    refreshProject();
  };

  const handleAddFeature = (feature: Omit<Feature, 'id'>) => {
    addFeature(feature);
  };

  const handleUpdateFeature = (featureId: string, updates: Partial<Feature>) => {
    updateFeature(featureId, updates);
  };

  const handleRemoveFeature = (featureId: string) => {
    removeFeature(featureId);
  };

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
        return <DataUnderstanding />;
      case 'data-preparation':
        return <DataPreparation />;
      case 'modeling':
        return <Modeling />;
      case 'evaluation':
        return <Evaluation />;
      case 'deployment':
        return <Deployment />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/werkstatt')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold">{project.name}</h1>
            {project.hasDemoData && (
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

      {/* CRISP-DM Stepper */}
      <div className="mb-8 overflow-x-auto">
        <CrispDmStepper
          phases={phases}
          currentPhase={currentPhase}
          onPhaseClick={goToPhase}
          orientation="horizontal"
        />
      </div>

      {/* Phase Content with Tutor Panel */}
      {phaseGuidance && (
        <CrispDmPhaseWrapper
          guidance={phaseGuidance}
          hints={tutorHints}
          showTutorPanel={true}
        >
          {renderPhaseContent()}
        </CrispDmPhaseWrapper>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t">
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
  );
}
