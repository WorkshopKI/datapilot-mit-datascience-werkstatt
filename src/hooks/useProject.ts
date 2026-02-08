// Single project management hook for DS Werkstatt
import { useState, useEffect, useCallback, useMemo } from 'react';
import { WorkspaceProject, CrispDmPhaseId, Feature } from '@/engine/types';
import { WorkspaceStorage, isExampleProject } from '@/engine/workspace/WorkspaceStorage';
import { TutorService, PhaseGuidance } from '@/engine/tutor/TutorService';

export function useProject(projectId: string | undefined) {
  const [project, setProject] = useState<WorkspaceProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load project (LocalStorage first, then example templates)
  const loadProjectById = useCallback((id: string): WorkspaceProject | null => {
    return WorkspaceStorage.getProject(id)
      ?? WorkspaceStorage.getExampleProjects().find(p => p.id === id)
      ?? null;
  }, []);

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setIsLoading(false);
      return;
    }

    setProject(loadProjectById(projectId));
    setIsLoading(false);
  }, [projectId, loadProjectById]);

  // Refresh project data
  const refreshProject = useCallback(() => {
    if (!projectId) return;
    setProject(loadProjectById(projectId));
  }, [projectId, loadProjectById]);

  // Phase navigation
  const currentPhase = project?.currentPhase || 'business-understanding';
  const phases = project?.phases || [];

  const currentPhaseIndex = useMemo(() => {
    return phases.findIndex(p => p.id === currentPhase);
  }, [phases, currentPhase]);

  const goToPhase = useCallback((phaseId: CrispDmPhaseId) => {
    if (!project) return;
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
    WorkspaceStorage.updatePhaseStatus(project.id, currentPhase, 'completed');
    refreshProject();
  }, [project, currentPhase, refreshProject]);

  const markPhaseInProgress = useCallback((phaseId: CrispDmPhaseId) => {
    if (!project) return;
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
    
    // Refresh
    refreshProject,
  };
}
