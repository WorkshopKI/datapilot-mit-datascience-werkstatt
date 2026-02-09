// Tutor Service Interface (Mock Implementation for Phase 1)
// Provides contextual hints and guidance during CRISP-DM phases

import { CrispDmPhaseId, WorkspaceProject, PipelineStepType, ProjectType } from '../types';

export interface TutorHint {
  id: string;
  title: string;
  content: string;
  glossaryTerms: string[]; // Term IDs to link
  priority: 'info' | 'tip' | 'warning';
}

export interface PhaseGuidance {
  phaseId: CrispDmPhaseId;
  introduction: string;
  objectives: string[];
  hints: TutorHint[];
  nextSteps: string[];
}

export interface PipelineRecommendation {
  stepType: PipelineStepType;
  label: string;
  reason: string;
  optional: boolean;
}

const PIPELINE_RECOMMENDATIONS: Record<ProjectType, PipelineRecommendation[]> = {
  klassifikation: [
    { stepType: 'missing-values', label: 'Fehlende Werte behandeln', reason: 'Die meisten ML-Algorithmen können nicht mit fehlenden Werten umgehen.', optional: false },
    { stepType: 'encoding', label: 'Kategoriale Spalten kodieren', reason: 'Algorithmen benötigen numerische Eingaben – kategoriale Daten müssen kodiert werden.', optional: false },
    { stepType: 'scaling', label: 'Features skalieren', reason: 'Skalierung verbessert die Konvergenz bei vielen Algorithmen (z.B. Logistic Regression, KNN).', optional: false },
    { stepType: 'train-test-split', label: 'Train-Test-Split', reason: 'Aufteilen in Trainings- und Testdaten zur Bewertung der Modellgüte.', optional: false },
  ],
  regression: [
    { stepType: 'missing-values', label: 'Fehlende Werte behandeln', reason: 'Die meisten ML-Algorithmen können nicht mit fehlenden Werten umgehen.', optional: false },
    { stepType: 'outlier-removal', label: 'Ausreißer entfernen', reason: 'Ausreißer können Regressionsmodelle stark verzerren.', optional: true },
    { stepType: 'encoding', label: 'Kategoriale Spalten kodieren', reason: 'Algorithmen benötigen numerische Eingaben.', optional: false },
    { stepType: 'scaling', label: 'Features skalieren', reason: 'Hilft bei Ridge-Regression und verbessert die Vergleichbarkeit der Koeffizienten.', optional: true },
    { stepType: 'train-test-split', label: 'Train-Test-Split', reason: 'Aufteilen in Trainings- und Testdaten zur Bewertung der Modellgüte.', optional: false },
  ],
  clustering: [
    { stepType: 'missing-values', label: 'Fehlende Werte behandeln', reason: 'Clustering-Algorithmen benötigen vollständige Daten.', optional: false },
    { stepType: 'scaling', label: 'Features skalieren', reason: 'Clustering basiert auf Distanzmaßen – ohne Skalierung dominieren Features mit großen Werten.', optional: false },
  ],
};

// Phase-specific guidance
const PHASE_GUIDANCE: Record<CrispDmPhaseId, PhaseGuidance> = {
  'business-understanding': {
    phaseId: 'business-understanding',
    introduction: 'In dieser Phase definierst du das Projektziel aus Business-Sicht.',
    objectives: [
      'Geschäftsziel klar formulieren',
      'Erfolgskriterien definieren',
      'Ressourcen und Risiken einschätzen',
    ],
    hints: [
      {
        id: 'bu-1',
        title: 'Definiere messbare Ziele',
        content: 'Ein gutes DS-Projekt hat klare, messbare Erfolgskriterien. "Kundenabwanderung reduzieren" ist vage – "Churn-Rate um 15% senken" ist messbar.',
        glossaryTerms: ['kpi', 'zielmetriken'],
        priority: 'tip',
      },
    ],
    nextSteps: [
      'Projektziel dokumentieren',
      'Erfolgskriterien festlegen',
      'Datenquellen identifizieren',
    ],
  },
  'data-understanding': {
    phaseId: 'data-understanding',
    introduction: 'Hier lernst du deine Daten kennen und prüfst die Datenqualität.',
    objectives: [
      'Datenquellen erkunden',
      'Datenqualität bewerten',
      'Erste Muster und Anomalien erkennen',
    ],
    hints: [
      {
        id: 'du-1',
        title: 'Prüfe auf fehlende Werte',
        content: 'Fehlende Werte können dein Modell stark beeinflussen. Dokumentiere, wie viele es gibt und warum.',
        glossaryTerms: ['fehlende-werte', 'missing-values'],
        priority: 'warning',
      },
    ],
    nextSteps: [
      'Deskriptive Statistik erstellen',
      'Korrelationen untersuchen',
      'Auf fehlende Werte und Ausreißer achten',
    ],
  },
  'data-preparation': {
    phaseId: 'data-preparation',
    introduction: 'Daten bereinigen und für das Modelltraining vorbereiten.',
    objectives: [
      'Fehlende Werte behandeln',
      'Feature Engineering durchführen',
      'Daten transformieren und skalieren',
    ],
    hints: [
      {
        id: 'dp-1',
        title: 'Feature Engineering',
        content: 'Oft sind abgeleitete Features wichtiger als die Rohdaten. Kombiniere Features oder erstelle neue aus Domänenwissen.',
        glossaryTerms: ['feature-engineering', 'feature'],
        priority: 'tip',
      },
    ],
    nextSteps: [
      'Fehlende Werte imputieren',
      'Kategoriale Variablen kodieren',
      'Features skalieren',
    ],
  },
  'modeling': {
    phaseId: 'modeling',
    introduction: 'ML-Modelle trainieren und optimieren.',
    objectives: [
      'Passende Algorithmen auswählen',
      'Modelle trainieren',
      'Hyperparameter optimieren',
    ],
    hints: [
      {
        id: 'm-1',
        title: 'Start simple',
        content: 'Beginne mit einem einfachen Baseline-Modell. Komplexere Modelle lohnen sich nur, wenn die Baseline nicht ausreicht.',
        glossaryTerms: ['baseline', 'modell-ml'],
        priority: 'tip',
      },
    ],
    nextSteps: [
      'Train-Test-Split durchführen',
      'Baseline-Modell erstellen',
      'Verschiedene Algorithmen vergleichen',
    ],
  },
  'evaluation': {
    phaseId: 'evaluation',
    introduction: 'Modellperformance bewerten und validieren.',
    objectives: [
      'Performance-Metriken berechnen',
      'Modell gegen Erfolgskriterien prüfen',
      'Entscheidung für Deployment treffen',
    ],
    hints: [
      {
        id: 'e-1',
        title: 'Wähle die richtige Metrik',
        content: 'Accuracy ist nicht immer die beste Wahl. Bei unbalancierten Klassen sind Precision, Recall und F1-Score aussagekräftiger.',
        glossaryTerms: ['accuracy', 'precision', 'recall', 'f1-score'],
        priority: 'warning',
      },
    ],
    nextSteps: [
      'Confusion Matrix analysieren',
      'Business-Impact abschätzen',
      'Deployment-Entscheidung dokumentieren',
    ],
  },
  'deployment': {
    phaseId: 'deployment',
    introduction: 'Modell in Produktion bringen und überwachen.',
    objectives: [
      'Deployment-Strategie festlegen',
      'Monitoring einrichten',
      'Wartungsplan erstellen',
    ],
    hints: [
      {
        id: 'd-1',
        title: 'Monitoring ist kritisch',
        content: 'Modelle können im Zeitverlauf schlechter werden (Concept Drift). Überwache die Performance kontinuierlich.',
        glossaryTerms: ['concept-drift', 'monitoring', 'deployment'],
        priority: 'warning',
      },
    ],
    nextSteps: [
      'Deployment-Pipeline aufsetzen',
      'Alerts für Performance-Drops',
      'Retraining-Strategie planen',
    ],
  },
};

export class TutorService {
  static getPhaseGuidance(phaseId: CrispDmPhaseId): PhaseGuidance {
    return PHASE_GUIDANCE[phaseId];
  }

  static getContextualHints(project: WorkspaceProject): TutorHint[] {
    const guidance = PHASE_GUIDANCE[project.currentPhase];
    return guidance?.hints || [];
  }

  static getNextSteps(phaseId: CrispDmPhaseId): string[] {
    return PHASE_GUIDANCE[phaseId]?.nextSteps || [];
  }

  static getPipelineRecommendations(projectType: ProjectType): PipelineRecommendation[] {
    return PIPELINE_RECOMMENDATIONS[projectType] ?? [];
  }

  static getAllPhaseIntros(): { phaseId: CrispDmPhaseId; intro: string }[] {
    return Object.values(PHASE_GUIDANCE).map(g => ({
      phaseId: g.phaseId,
      intro: g.introduction,
    }));
  }
}
