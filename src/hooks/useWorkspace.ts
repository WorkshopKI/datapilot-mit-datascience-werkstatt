// Workspace management hook for DS Werkstatt
import { useState, useEffect, useCallback } from 'react';
import { WorkspaceProject, WorkspaceState } from '@/engine/types';
import { WorkspaceStorage } from '@/engine/workspace/WorkspaceStorage';
import { WorkspaceExporter } from '@/engine/workspace/WorkspaceExporter';

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>(() => WorkspaceStorage.getState());
  const [isLoading, setIsLoading] = useState(false);

  // Sync state with localStorage
  const refreshState = useCallback(() => {
    setState(WorkspaceStorage.getState());
  }, []);

  // Initialize demo project on first visit
  useEffect(() => {
    if (state.onboardingDone && state.projects.length === 0) {
      WorkspaceStorage.initializeWithDemo();
      refreshState();
    }
  }, [state.onboardingDone, state.projects.length, refreshState]);

  // Onboarding
  const completeOnboarding = useCallback((mode: 'local' | 'sync') => {
    WorkspaceStorage.setOnboardingDone(true);
    WorkspaceStorage.setMode(mode);
    WorkspaceStorage.initializeWithDemo();
    refreshState();
  }, [refreshState]);

  // Project CRUD
  const createProject = useCallback((data: Omit<WorkspaceProject, 'id' | 'createdAt' | 'updatedAt' | 'phases'>) => {
    const project = WorkspaceStorage.createProject(data);
    refreshState();
    return project;
  }, [refreshState]);

  const updateProject = useCallback((id: string, updates: Partial<WorkspaceProject>) => {
    const updated = WorkspaceStorage.updateProject(id, updates);
    refreshState();
    return updated;
  }, [refreshState]);

  const deleteProject = useCallback((id: string) => {
    const success = WorkspaceStorage.deleteProject(id);
    refreshState();
    return success;
  }, [refreshState]);

  const getProject = useCallback((id: string) => {
    return WorkspaceStorage.getProject(id);
  }, []);

  // Export/Import
  const exportProject = useCallback(async (project: WorkspaceProject) => {
    setIsLoading(true);
    try {
      await WorkspaceExporter.exportToFile(project);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const importProject = useCallback(async (file: File) => {
    setIsLoading(true);
    try {
      const imported = await WorkspaceExporter.importFromFile(file);
      const projects = WorkspaceStorage.getProjects();
      projects.push(imported);
      WorkspaceStorage.setProjects(projects);
      refreshState();
      return imported;
    } finally {
      setIsLoading(false);
    }
  }, [refreshState]);

  // Reset workspace (for testing)
  const resetWorkspace = useCallback(() => {
    WorkspaceStorage.clear();
    refreshState();
  }, [refreshState]);

  return {
    // State
    onboardingDone: state.onboardingDone,
    mode: state.mode,
    projects: state.projects,
    isLoading,

    // Actions
    completeOnboarding,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    exportProject,
    importProject,
    resetWorkspace,
    refreshState,
  };
}
