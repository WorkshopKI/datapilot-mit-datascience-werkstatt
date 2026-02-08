// Single project management hook for DS Werkstatt
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { WorkspaceProject, CrispDmPhaseId, CrispDmPhase, Feature } from '@/engine/types';
import { WorkspaceStorage, isExampleProject } from '@/engine/workspace/WorkspaceStorage';
import { TutorService, PhaseGuidance } from '@/engine/tutor/TutorService';

// --- SessionStorage helpers for example project progress ---

interface ExampleSessionState {
  currentPhase: CrispDmPhaseId;
  phases: { id: CrispDmPhaseId; status: CrispDmPhase['status']; completedAt?: string }[];
}

function getSessionKey(projectId: string): string {
  return `ds-werkstatt-example-${projectId}`;
}

function getExampleSessionState(projectId: string): ExampleSessionState | null {
  try {
    const raw = sessionStorage.getItem(getSessionKey(projectId));
    if (!raw) return null;
    return JSON.parse(raw) as ExampleSessionState;
  } catch {
    return null;
  }
}

function saveExampleSessionState(project: WorkspaceProject): void {
  const state: ExampleSessionState = {
    currentPhase: project.currentPhase,
    phases: project.phases.map(p => ({
      id: p.id,
      status: p.status,
      ...(p.completedAt ? { completedAt: p.completedAt } : {}),
    })),
  };
  try {
    sessionStorage.setItem(getSessionKey(project.id), JSON.stringify(state));
  } catch {
    // sessionStorage full or unavailable – ignore
  }
}

function mergeSessionState(project: WorkspaceProject): WorkspaceProject {
  const saved = getExampleSessionState(project.id);
  if (!saved) return project;
  const mergedPhases = project.phases.map(p => {
    const savedPhase = saved.phases.find(sp => sp.id === p.id);
    if (!savedPhase) return p;
    return { ...p, status: savedPhase.status, ...(savedPhase.completedAt ? { completedAt: savedPhase.completedAt } : {}) };
  });
  return { ...project, currentPhase: saved.currentPhase, phases: mergedPhases };
}

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<WorkspaceProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const effectiveIdRef = useRef<string | undefined>(projectId);

  // Load project (LocalStorage first, then example templates with session state merge)
  const loadProjectById = useCallback((id: string): WorkspaceProject | null => {
    const stored = WorkspaceStorage.getProject(id);
    if (stored) return stored;
    const example = WorkspaceStorage.getExampleProjects().find(p => p.id === id);
    if (!example) return null;
    return mergeSessionState(example);
  }, []);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setIsLoading(false);
      effectiveIdRef.current = undefined;
      return;
    }
    effectiveIdRef.current = projectId;
    setProject(loadProjectById(projectId));
    setIsLoading(false);
  }, [projectId, loadProjectById]);

  // Refresh project data
  const refreshProject = useCallback(() => {
    const id = effectiveIdRef.current;
    if (!id) return;
    setProject(loadProjectById(id));
  }, [loadProjectById]);

  // Replace project in-place (used for example→clone swap without remount)
  const replaceProject = useCallback((newProject: WorkspaceProject) => {
    effectiveIdRef.current = newProject.id;
    setProject(newProject);
  }, []);

  // Phase navigation
  const currentPhase = project?.currentPhase || 'business-understanding';
  const phases = project?.phases || [];

  const currentPhaseIndex = useMemo(() => {
    return phases.findIndex(p => p.id === currentPhase);
  }, [phases, currentPhase]);

  const goToPhase = useCallback((phaseId: CrispDmPhaseId) => {
    if (!project) return;
    if (isExampleProject(project.id)) {
      // Example projects: navigate in-memory only (no LocalStorage)
      setProject(prev => {
        if (!prev) return prev;
        const updated = { ...prev, currentPhase: phaseId };
        saveExampleSessionState(updated);
        return updated;
      });
      return;
    }
    WorkspaceStorage.updateProject(project.id, { currentPhase: phaseId });
    refreshProject();
  }, [project, refreshProject]);

  const goToNextPhase = useCallback(() => {
    if (!project || currentPhaseIndex >= phases.length - 1) return;
    const nextPhase = phases[currentPhaseIndex + 1];
    goToPhase(nextPhase.id);
  }, [project, currentPhaseIndex, phases, goToPhase]);

  const goToPreviousPhase = useCallback(() => {
    if (!project || currentPhaseIndex <= 0) return;
    const prevPhase = phases[currentPhaseIndex - 1];
    goToPhase(prevPhase.id);
  }, [project, currentPhaseIndex, phases, goToPhase]);

  // Phase status
  const completeCurrentPhase = useCallback(() => {
    if (!project) return;
    if (isExampleProject(project.id)) {
      setProject(prev => {
        if (!prev) return prev;
        const updatedPhases = prev.phases.map(p =>
          p.id === currentPhase ? { ...p, status: 'completed' as const, completedAt: new Date().toISOString() } : p
        );
        const updated = { ...prev, phases: updatedPhases };
        saveExampleSessionState(updated);
        return updated;
      });
      return;
    }
    WorkspaceStorage.updatePhaseStatus(project.id, currentPhase, 'completed');
    refreshProject();
  }, [project, currentPhase, refreshProject]);

  const markPhaseInProgress = useCallback((phaseId: CrispDmPhaseId) => {
    if (!project) return;
    if (isExampleProject(project.id)) {
      setProject(prev => {
        if (!prev) return prev;
        const updatedPhases = prev.phases.map(p =>
          p.id === phaseId ? { ...p, status: 'in-progress' as const } : p
        );
        const updated = { ...prev, phases: updatedPhases };
        saveExampleSessionState(updated);
        return updated;
      });
      return;
    }
    WorkspaceStorage.updatePhaseStatus(project.id, phaseId, 'in-progress');
    refreshProject();
  }, [project, refreshProject]);

  // Features management
  const addFeature = useCallback((feature: Omit<Feature, 'id'>) => {
    if (!project) return;
    const newFeature: Feature = {
      ...feature,
      id: `feature-${Date.now()}`,
    };
    const features = [...project.features, newFeature];
    WorkspaceStorage.updateProject(project.id, { features });
    refreshProject();
  }, [project, refreshProject]);

  const updateFeature = useCallback((featureId: string, updates: Partial<Feature>) => {
    if (!project) return;
    const features = project.features.map(f =>
      f.id === featureId ? { ...f, ...updates } : f
    );
    WorkspaceStorage.updateProject(project.id, { features });
    refreshProject();
  }, [project, refreshProject]);

  const removeFeature = useCallback((featureId: string) => {
    if (!project) return;
    const features = project.features.filter(f => f.id !== featureId);
    WorkspaceStorage.updateProject(project.id, { features });
    refreshProject();
  }, [project, refreshProject]);

  // Tutor guidance
  const phaseGuidance: PhaseGuidance | null = useMemo(() => {
    if (!project) return null;
    return TutorService.getPhaseGuidance(currentPhase);
  }, [project, currentPhase]);

  const tutorHints = useMemo(() => {
    if (!project) return [];
    return TutorService.getContextualHints(project);
  }, [project]);

  // Phase prerequisites (Lücke 4)
  const phasePrerequisites = useMemo((): Record<CrispDmPhaseId, { met: boolean; warning?: string }> => {
    const hasDataSource = !!project?.dataSource;
    const hasSplit = !!(project?.pipelineSteps?.some(s => s.type === 'train-test-split'));
    const hasModels = !!(project?.trainedModels && project.trainedModels.length > 0);
    const isClustering = project?.type === 'clustering';

    return {
      'business-understanding': { met: true },
      'data-understanding': { met: true },
      'data-preparation': {
        met: hasDataSource,
        ...(!hasDataSource ? { warning: 'Zuerst Daten in Phase 2 laden' } : {}),
      },
      'modeling': {
        met: isClustering ? hasDataSource : (hasDataSource && hasSplit),
        ...(!hasDataSource
          ? { warning: 'Zuerst Daten in Phase 2 laden' }
          : (!isClustering && !hasSplit)
            ? { warning: 'Zuerst Train-Test-Split in Phase 3 durchführen' }
            : {}),
      },
      'evaluation': {
        met: hasModels,
        ...(!hasModels ? { warning: 'Zuerst ein Modell in Phase 4 trainieren' } : {}),
      },
      'deployment': {
        met: hasModels,
        ...(!hasModels ? { warning: 'Zuerst ein Modell in Phase 4 trainieren' } : {}),
      },
    };
  }, [project]);

  // Progress calculation
  const completedPhasesCount = useMemo(() => {
    return phases.filter(p => p.status === 'completed').length;
  }, [phases]);

  const progressPercent = useMemo(() => {
    if (phases.length === 0) return 0;
    return Math.round((completedPhasesCount / phases.length) * 100);
  }, [phases.length, completedPhasesCount]);

  return {
    // State
    project,
    isLoading,
    
    // Phase navigation
    currentPhase,
    currentPhaseIndex,
    phases,
    goToPhase,
    goToNextPhase,
    goToPreviousPhase,
    
    // Phase status
    completeCurrentPhase,
    markPhaseInProgress,
    
    // Features
    addFeature,
    updateFeature,
    removeFeature,
    
    // Tutor
    phaseGuidance,
    tutorHints,
    
    // Progress
    completedPhasesCount,
    progressPercent,

    // Prerequisites
    phasePrerequisites,

    // Refresh
    refreshProject,
    replaceProject,
  };
}
