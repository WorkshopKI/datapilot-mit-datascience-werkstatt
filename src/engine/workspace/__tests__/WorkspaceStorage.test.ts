import { describe, it, expect, beforeEach } from 'vitest';
import { WorkspaceStorage, isExampleProject } from '../WorkspaceStorage';
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

  describe('initializeWithDemo (backward compat)', () => {
    it('should be a no-op that does not throw', () => {
      expect(() => WorkspaceStorage.initializeWithDemo()).not.toThrow();
      // No projects created - example projects are static templates now
      expect(WorkspaceStorage.getProjects()).toEqual([]);
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

  describe('isExampleProject', () => {
    it('should return true for example- prefixed IDs', () => {
      expect(isExampleProject('example-churn')).toBe(true);
      expect(isExampleProject('example-housing')).toBe(true);
      expect(isExampleProject('example-segments')).toBe(true);
    });

    it('should return true for demo- prefixed IDs', () => {
      expect(isExampleProject('demo-churn-prediction')).toBe(true);
    });

    it('should return false for user project IDs', () => {
      expect(isExampleProject('project-1234567890')).toBe(false);
      expect(isExampleProject('my-project')).toBe(false);
    });
  });

  describe('getExampleProjects', () => {
    it('should return 6 example projects', () => {
      const examples = WorkspaceStorage.getExampleProjects();
      expect(examples).toHaveLength(6);
    });

    it('should include 3 classification, 2 regression, 1 clustering', () => {
      const examples = WorkspaceStorage.getExampleProjects();
      const types = examples.map(p => p.type);
      expect(types.filter(t => t === 'klassifikation')).toHaveLength(3);
      expect(types.filter(t => t === 'regression')).toHaveLength(2);
      expect(types.filter(t => t === 'clustering')).toHaveLength(1);
    });

    it('should have all example IDs starting with example-', () => {
      const examples = WorkspaceStorage.getExampleProjects();
      for (const proj of examples) {
        expect(proj.id).toMatch(/^example-/);
        expect(isExampleProject(proj.id)).toBe(true);
      }
    });

    it('should have businessGoal and successCriteria for all examples', () => {
      const examples = WorkspaceStorage.getExampleProjects();
      for (const proj of examples) {
        expect(proj.businessGoal).toBeTruthy();
        expect(proj.successCriteria).toBeTruthy();
      }
    });

    it('should have 5-6 features for each example', () => {
      const examples = WorkspaceStorage.getExampleProjects();
      for (const proj of examples) {
        expect(proj.features.length).toBeGreaterThanOrEqual(5);
        expect(proj.features.length).toBeLessThanOrEqual(6);
      }
    });

    it('should have hasDemoData=true for all examples', () => {
      const examples = WorkspaceStorage.getExampleProjects();
      for (const proj of examples) {
        expect(proj.hasDemoData).toBe(true);
      }
    });

    it('should have fresh phases (all pending)', () => {
      const examples = WorkspaceStorage.getExampleProjects();
      for (const proj of examples) {
        expect(proj.phases).toHaveLength(6);
        for (const phase of proj.phases) {
          expect(phase.status).toBe('pending');
        }
      }
    });

    it('should return deep copies (modifying one does not affect others)', () => {
      const examples1 = WorkspaceStorage.getExampleProjects();
      examples1[0].name = 'Modified';
      const examples2 = WorkspaceStorage.getExampleProjects();
      expect(examples2[0].name).not.toBe('Modified');
    });

    it('should not be stored in LocalStorage', () => {
      WorkspaceStorage.getExampleProjects();
      expect(WorkspaceStorage.getProjects()).toEqual([]);
    });
  });

  describe('cloneExampleProject', () => {
    it('should create a copy with a new project ID', () => {
      const clone = WorkspaceStorage.cloneExampleProject('example-churn');
      expect(clone.id).toMatch(/^project-/);
      expect(clone.id).not.toBe('example-churn');
    });

    it('should prefix the name with "Kopie: "', () => {
      const clone = WorkspaceStorage.cloneExampleProject('example-churn');
      expect(clone.name).toBe('Kopie: Kundenabwanderung vorhersagen');
    });

    it('should set hasDemoData to false', () => {
      const clone = WorkspaceStorage.cloneExampleProject('example-churn');
      expect(clone.hasDemoData).toBe(false);
    });

    it('should store the clone in LocalStorage', () => {
      const clone = WorkspaceStorage.cloneExampleProject('example-housing');
      const stored = WorkspaceStorage.getProject(clone.id);
      expect(stored).toBeDefined();
      expect(stored!.name).toBe('Kopie: Immobilienpreise schätzen');
    });

    it('should preserve features from the example', () => {
      const clone = WorkspaceStorage.cloneExampleProject('example-segments');
      expect(clone.features.length).toBe(5);
      expect(clone.features[0].name).toBe('Jahresumsatz_EUR');
    });

    it('should preserve businessGoal and successCriteria', () => {
      const clone = WorkspaceStorage.cloneExampleProject('example-credit-risk');
      expect(clone.businessGoal).toBeTruthy();
      expect(clone.successCriteria).toBeTruthy();
    });

    it('should have fresh timestamps', () => {
      const clone = WorkspaceStorage.cloneExampleProject('example-churn');
      expect(clone.createdAt).not.toBe('2025-01-01T00:00:00.000Z');
    });

    it('should have fresh phases (all pending)', () => {
      const clone = WorkspaceStorage.cloneExampleProject('example-churn');
      for (const phase of clone.phases) {
        expect(phase.status).toBe('pending');
      }
    });

    it('should throw for non-existent example ID', () => {
      expect(() => WorkspaceStorage.cloneExampleProject('example-nonexistent'))
        .toThrow('Example project not found');
    });

    it('should not modify the original example when clone is updated', () => {
      const clone = WorkspaceStorage.cloneExampleProject('example-churn');
      WorkspaceStorage.updateProject(clone.id, { name: 'My Custom Name' });

      const examples = WorkspaceStorage.getExampleProjects();
      const original = examples.find(p => p.id === 'example-churn');
      expect(original!.name).toBe('Kundenabwanderung vorhersagen');
    });
  });

  describe('setProjects dispatches custom event', () => {
    it('should dispatch werkstatt-projects-changed event', () => {
      let eventFired = false;
      window.addEventListener('werkstatt-projects-changed', () => {
        eventFired = true;
      });

      WorkspaceStorage.createProject({
        name: 'Event Test',
        description: 'Desc',
        type: 'klassifikation',
        currentPhase: 'business-understanding',
        features: [],
      });

      expect(eventFired).toBe(true);
    });
  });
});
