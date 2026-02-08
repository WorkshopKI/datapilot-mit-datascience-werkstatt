import { describe, it, expect } from 'vitest';
import { TutorService } from '../TutorService';
import type { PipelineRecommendation } from '../TutorService';
import type { PipelineStepType, ProjectType } from '../../types';

const VALID_STEP_TYPES: PipelineStepType[] = [
  'missing-values', 'outlier-removal', 'encoding',
  'scaling', 'feature-selection', 'train-test-split',
];

describe('TutorService.getPipelineRecommendations', () => {
  it('returns recommendations for klassifikation', () => {
    const recs = TutorService.getPipelineRecommendations('klassifikation');
    expect(recs.length).toBeGreaterThan(0);
    expect(recs.every(r => r.label && r.reason)).toBe(true);
  });

  it('returns recommendations for regression', () => {
    const recs = TutorService.getPipelineRecommendations('regression');
    expect(recs.length).toBeGreaterThan(0);
  });

  it('returns recommendations for clustering', () => {
    const recs = TutorService.getPipelineRecommendations('clustering');
    expect(recs.length).toBeGreaterThan(0);
  });

  it('all stepType values are valid PipelineStepType', () => {
    const allTypes: ProjectType[] = ['klassifikation', 'regression', 'clustering'];
    for (const type of allTypes) {
      const recs = TutorService.getPipelineRecommendations(type);
      for (const rec of recs) {
        expect(VALID_STEP_TYPES).toContain(rec.stepType);
      }
    }
  });

  it('clustering has NO train-test-split', () => {
    const recs = TutorService.getPipelineRecommendations('clustering');
    const stepTypes = recs.map(r => r.stepType);
    expect(stepTypes).not.toContain('train-test-split');
  });

  it('klassifikation includes train-test-split', () => {
    const recs = TutorService.getPipelineRecommendations('klassifikation');
    const stepTypes = recs.map(r => r.stepType);
    expect(stepTypes).toContain('train-test-split');
  });

  it('regression includes train-test-split', () => {
    const recs = TutorService.getPipelineRecommendations('regression');
    const stepTypes = recs.map(r => r.stepType);
    expect(stepTypes).toContain('train-test-split');
  });

  it('all recommendations have optional flag set', () => {
    const allTypes: ProjectType[] = ['klassifikation', 'regression', 'clustering'];
    for (const type of allTypes) {
      const recs = TutorService.getPipelineRecommendations(type);
      for (const rec of recs) {
        expect(typeof rec.optional).toBe('boolean');
      }
    }
  });

  it('klassifikation has no optional steps', () => {
    const recs = TutorService.getPipelineRecommendations('klassifikation');
    expect(recs.every(r => !r.optional)).toBe(true);
  });

  it('regression has some optional steps', () => {
    const recs = TutorService.getPipelineRecommendations('regression');
    expect(recs.some(r => r.optional)).toBe(true);
  });

  it('clustering recommendations include scaling', () => {
    const recs = TutorService.getPipelineRecommendations('clustering');
    const stepTypes = recs.map(r => r.stepType);
    expect(stepTypes).toContain('scaling');
  });
});

describe('TutorService.getPhaseGuidance', () => {
  it('returns guidance for each CRISP-DM phase', () => {
    const phaseIds = [
      'business-understanding', 'data-understanding', 'data-preparation',
      'modeling', 'evaluation', 'deployment',
    ] as const;
    for (const id of phaseIds) {
      const guidance = TutorService.getPhaseGuidance(id);
      expect(guidance).toBeDefined();
      expect(guidance.phaseId).toBe(id);
      expect(guidance.introduction).toBeTruthy();
      expect(guidance.objectives.length).toBeGreaterThan(0);
    }
  });
});
