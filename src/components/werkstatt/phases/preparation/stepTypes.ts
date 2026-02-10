import {
  AlertCircle, AlertTriangle, Hash, Settings2, Filter, Shuffle,
  type LucideIcon,
} from 'lucide-react';
import type { PipelineStepType } from '@/engine/types';

export interface StepTypeInfo {
  type: PipelineStepType;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const STEP_TYPE_CARDS: StepTypeInfo[] = [
  {
    type: 'missing-values',
    label: 'Fehlende Werte behandeln',
    description: 'Lücken in den Daten füllen oder betroffene Zeilen entfernen',
    icon: AlertCircle,
  },
  {
    type: 'outlier-removal',
    label: 'Ausreißer entfernen',
    description: 'Extreme Werte erkennen und bereinigen',
    icon: AlertTriangle,
  },
  {
    type: 'encoding',
    label: 'Encoding',
    description: 'Kategoriale Spalten in Zahlen umwandeln',
    icon: Hash,
  },
  {
    type: 'scaling',
    label: 'Skalierung',
    description: 'Features auf einheitliche Skala bringen',
    icon: Settings2,
  },
  {
    type: 'feature-selection',
    label: 'Feature-Auswahl',
    description: 'Unwichtige Spalten entfernen',
    icon: Filter,
  },
  {
    type: 'train-test-split',
    label: 'Train-Test-Split',
    description: 'Daten in Trainings- und Testset teilen',
    icon: Shuffle,
  },
];

export const STEP_TYPE_LABELS: Record<PipelineStepType, string> = {
  'missing-values': 'Fehlende Werte behandeln',
  'outlier-removal': 'Ausreißer entfernen',
  'encoding': 'Encoding (Kategorial → Numerisch)',
  'scaling': 'Skalierung',
  'feature-selection': 'Feature-Auswahl',
  'train-test-split': 'Train-Test-Split',
};

let stepCounter = 0;
export function nextStepId(): string {
  return `step-${Date.now()}-${++stepCounter}`;
}

/** Short labels for the horizontal stepper */
export const SHORT_LABELS: Record<PipelineStepType, string> = {
  'missing-values': 'Fehlende Werte',
  'outlier-removal': 'Ausreißer',
  'encoding': 'Encoding',
  'scaling': 'Skalierung',
  'feature-selection': 'Features',
  'train-test-split': 'Split',
};
