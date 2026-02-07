import { describe, it, expect, beforeEach } from 'vitest';
import { WorkspaceStorage } from '../WorkspaceStorage';
import { WorkspaceProject } from '../../types';

// Simple localStorage mock for jsdom
beforeEach(() => {
  localStorage.clear();
});

describe('WorkspaceStorage', () => {
  describe('onboarding', () => {
    it('should return false when onboarding is not done', () => {
      expect(WorkspaceStorage.getOnboardingDone()).toBe(false);
    });

    it('should persist onboarding state', () => {
      WorkspaceStorage.setOnboardingDone(true);
      expect(WorkspaceStorage.getOnboardingDone()).toBe(true);
    });
  });

  describe('mode', () => {
    it('should default to local mode', () => {
      expect(WorkspaceStorage.getMode()).toBe('local');
    });

    it('should persist mode', () => {
      WorkspaceStorage.setMode('sync');
      expect(WorkspaceStorage.getMode()).toBe('sync');
    });
  });

  describe('projects CRUD', () => {
    it('should start with empty projects', () => {
      expect(WorkspaceStorage.getProjects()).toEqual([]);
    });

    it('should create a project with generated id and timestamps', () => {
      const project = WorkspaceStorage.createProject({
        name: 'Test Projekt',
        description: 'Ein Test',
        type: 'klassifikation',
        currentPhase: 'business-understanding',
        features: [],
      });

      expect(project.id).toBeTruthy();
      expect(project.name).toBe('Test Projekt');
      expect(project.createdAt).toBeTruthy();
      expect(project.updatedAt).toBeTruthy();
      expect(project.phases).toHaveLength(6);
    });

    it('should retrieve a created project by id', () => {
      const created = WorkspaceStorage.createProject({
        name: 'Lookup Test',
        description: 'Desc',
        type: 'regression',
        currentPhase: 'business-understanding',
        features: [],
      });

      const found = WorkspaceStorage.getProject(created.id);
      expect(found).toBeDefined();
      expect(found!.name).toBe('Lookup Test');
    });

    it('should return undefined for non-existent project', () => {
      expect(WorkspaceStorage.getProject('non-existent')).toBeUndefined();
    });

    it('should update an existing project', () => {
      const created = WorkspaceStorage.createProject({
        name: 'Original',
        description: 'Desc',
        type: 'clustering',
        currentPhase: 'business-understanding',
        features: [],
      });

      const updated = WorkspaceStorage.updateProject(created.id, {
        name: 'Updated Name',
      });

      expect(updated).toBeDefined();
      expect(updated!.name).toBe('Updated Name');
      // updatedAt is refreshed (may be same ms in fast tests, so just check it exists)
      expect(updated!.updatedAt).toBeTruthy();
    });

    it('should return undefined when updating non-existent project', () => {
      const result = WorkspaceStorage.updateProject('non-existent', { name: 'X' });
      expect(result).toBeUndefined();
    });

    it('should delete an existing project', () => {
      const created = WorkspaceStorage.createProject({
        name: 'To Delete',
        description: 'Desc',
        type: 'klassifikation',
        currentPhase: 'business-understanding',
        features: [],
      });

      expect(WorkspaceStorage.deleteProject(created.id)).toBe(true);
      expect(WorkspaceStorage.getProject(created.id)).toBeUndefined();
    });

    it('should return false when deleting non-existent project', () => {
      expect(WorkspaceStorage.deleteProject('non-existent')).toBe(false);
    });
  });

  describe('phase status', () => {
    it('should update phase status for a project', () => {
      const project = WorkspaceStorage.createProject({
        name: 'Phase Test',
        description: 'Desc',
        type: 'klassifikation',
        currentPhase: 'business-understanding',
        features: [],
      });

      WorkspaceStorage.updatePhaseStatus(project.id, 'business-understanding', 'completed');

      const updated = WorkspaceStorage.getProject(project.id);
      const buPhase = updated!.phases.find(p => p.id === 'business-understanding');
      expect(buPhase!.status).toBe('completed');
      expect(buPhase!.completedAt).toBeTruthy();
    });
  });

  describe('demo initialization', () => {
    it('should add demo project when projects are empty', () => {
      WorkspaceStorage.initializeWithDemo();
      const projects = WorkspaceStorage.getProjects();
      expect(projects).toHaveLength(1);
      expect(projects[0].id).toBe('demo-churn-prediction');
    });

    it('should not duplicate demo if projects already exist', () => {
      WorkspaceStorage.createProject({
        name: 'Existing',
        description: 'Desc',
        type: 'regression',
        currentPhase: 'business-understanding',
        features: [],
      });

      WorkspaceStorage.initializeWithDemo();
      expect(WorkspaceStorage.getProjects()).toHaveLength(1);
    });
  });

  describe('getState', () => {
    it('should return complete workspace state', () => {
      WorkspaceStorage.setOnboardingDone(true);
      WorkspaceStorage.setMode('local');

      const state = WorkspaceStorage.getState();
      expect(state.onboardingDone).toBe(true);
      expect(state.mode).toBe('local');
      expect(Array.isArray(state.projects)).toBe(true);
    });
  });

  describe('clear', () => {
    it('should reset all workspace data', () => {
      WorkspaceStorage.setOnboardingDone(true);
      WorkspaceStorage.setMode('sync');
      WorkspaceStorage.createProject({
        name: 'Will be cleared',
        description: 'Desc',
        type: 'klassifikation',
        currentPhase: 'business-understanding',
        features: [],
      });

      WorkspaceStorage.clear();

      expect(WorkspaceStorage.getOnboardingDone()).toBe(false);
      expect(WorkspaceStorage.getMode()).toBe('local');
      expect(WorkspaceStorage.getProjects()).toEqual([]);
    });
  });
});
