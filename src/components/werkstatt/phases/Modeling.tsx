// Modeling Phase – Algorithm Selection + Training
import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Brain, Loader2, AlertTriangle, Play, Trash2,
  Info, AlertCircle, Settings2, Clock, CheckCircle2, BookOpen,
} from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';
import { GlossaryTermsCard } from '../shared/GlossaryTermsCard';
import { ModelTrainer } from '@/engine/modeling/ModelTrainer';
import type { AlgorithmInfo, HyperparameterDef } from '@/engine/modeling/ModelTrainer';
import type {
  WorkspaceProject, AlgorithmType, AlgorithmConfig, TrainedModel,
} from '@/engine/types';

interface ModelingProps {
  project: WorkspaceProject;
  onUpdateProject: (updates: Partial<WorkspaceProject>) => void;
}

type ViewState = 'no-data' | 'ready' | 'training' | 'error';

const GLOSSARY_TERMS = [
  { term: 'Machine Learning', termId: 'machine-learning' },
  { term: 'Hyperparameter' },
  { term: 'Cross-Validation', termId: 'cross-validation' },
  { term: 'Overfitting' },
  { term: 'Baseline' },
];

export function Modeling({ project, onUpdateProject }: ModelingProps) {
  const [viewState, setViewState] = useState<ViewState>(
    project.dataSource ? 'ready' : 'no-data',
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trainedModels, setTrainedModels] = useState<TrainedModel[]>(project.trainedModels ?? []);

  // Target column state
  const [targetColumn, setTargetColumn] = useState<string>(project.targetColumn ?? '');

  // Algorithm selection
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType | ''>('');
  const [hyperparams, setHyperparams] = useState<Record<string, number | string | boolean>>({});

  const isClustering = project.type === 'clustering';
  const hasSplit = project.preparedDataSummary?.hasSplit ?? false;
  const availableAlgorithms = ModelTrainer.getAvailableAlgorithms(project.type);
  const availableColumns = project.preparedDataSummary?.columnNames ?? [];

  // Guard: detect unencoded categorical columns
  const categoricalCols = project.preparedDataSummary?.categoricalColumns ?? [];
  const unencodedCols = isClustering
    ? categoricalCols
    : categoricalCols.filter(c => c !== targetColumn);
  const hasUnencodedCols = unencodedCols.length > 0;

  const handleAlgorithmSelect = useCallback((algType: AlgorithmType) => {
    setSelectedAlgorithm(algType);
    // Set default hyperparameters
    const defs = ModelTrainer.getDefaultHyperparameters(algType);
    const defaults: Record<string, number | string | boolean> = {};
    for (const def of defs) {
      defaults[def.name] = def.default;
    }
    setHyperparams(defaults);
  }, []);

  const handleTrain = useCallback(async () => {
    if (!selectedAlgorithm) return;
    if (!isClustering && !targetColumn) return;
    if (!isClustering && !hasSplit) return;

    if (hasUnencodedCols) {
      setErrorMessage(
        `Kategoriale Spalten müssen vor dem Training encodiert werden: ${unencodedCols.join(', ')}. ` +
        `Gehe zurück zur Data Preparation und wende "Encoding" an.`
      );
      return;
    }

    setViewState('training');
    setErrorMessage(null);

    try {
      const config: AlgorithmConfig = {
        type: selectedAlgorithm,
        hyperparameters: hyperparams,
      };

      const result = isClustering
        ? await ModelTrainer.trainClusteringModel(config)
        : await ModelTrainer.trainModel(config, targetColumn, project.type);

      if (!result.success) {
        setErrorMessage(result.error ?? 'Training fehlgeschlagen');
        setViewState('ready');
        return;
      }

      const newModels = [...trainedModels, result.model!];
      setTrainedModels(newModels);

      onUpdateProject({
        trainedModels: newModels,
        targetColumn: isClustering ? '' : targetColumn,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
    setViewState('ready');
  }, [selectedAlgorithm, targetColumn, hyperparams, isClustering, hasSplit, hasUnencodedCols, unencodedCols, trainedModels, project.type, onUpdateProject]);

  const handleRemoveModel = useCallback((modelId: string) => {
    const newModels = trainedModels.filter(m => m.id !== modelId);
    setTrainedModels(newModels);
    const updates: Partial<WorkspaceProject> = { trainedModels: newModels };
    if (project.selectedModelId === modelId) {
      updates.selectedModelId = undefined;
    }
    onUpdateProject(updates);
  }, [trainedModels, project.selectedModelId, onUpdateProject]);

  // --- No Data state ---
  if (viewState === 'no-data') {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 rounded-full bg-muted w-fit">
              <Brain className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle>Modeling</CardTitle>
            <p className="text-muted-foreground">
              Bitte lade zuerst Daten in der{' '}
              <span className="font-medium">Data Understanding</span>-Phase
              {!isClustering && ' und führe einen Train-Test-Split in der Data Preparation-Phase durch'}
              , bevor du mit dem Modelltraining beginnst.
            </p>
          </CardHeader>
        </Card>
        <GlossaryTermsCard terms={GLOSSARY_TERMS} />
      </div>
    );
  }

  // --- Prerequisite check ---
  if (!isClustering && !hasSplit) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-8 text-center space-y-3">
            <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
            <h3 className="font-semibold text-lg text-amber-800">Train-Test-Split erforderlich</h3>
            <p className="text-sm text-amber-700 max-w-md mx-auto">
              Bevor du ein Modell trainieren kannst, musst du in der{' '}
              <span className="font-medium">Data Preparation</span>-Phase einen{' '}
              <GlossaryLink term="Train-Test-Split" termId="train-test-split">Train-Test-Split</GlossaryLink>{' '}
              durchführen.
            </p>
          </CardContent>
        </Card>
        <GlossaryTermsCard terms={GLOSSARY_TERMS} />
      </div>
    );
  }

  const isTraining = viewState === 'training';
  const hyperparamDefs = selectedAlgorithm ? ModelTrainer.getDefaultHyperparameters(selectedAlgorithm) : [];

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {errorMessage && viewState === 'ready' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Target Column Selection (not for clustering) */}
      {!isClustering && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Zielvariable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm">
              <Label>Zielspalte auswählen</Label>
              <Select value={targetColumn} onValueChange={setTargetColumn} disabled={isTraining}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Spalte auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map(col => (
                    <SelectItem key={col} value={col}>{col}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Die Spalte, die das Modell vorhersagen soll.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unencoded categorical columns warning */}
      {hasUnencodedCols && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">Kategoriale Spalten nicht encodiert</p>
              <p className="text-amber-700">
                Dein Datensatz enthält noch nicht-numerische Spalten:{' '}
                <span className="font-mono font-medium">{unencodedCols.join(', ')}</span>.
                {' '}Sklearn-Algorithmen können nur mit Zahlen arbeiten. Gehe zurück zur{' '}
                <span className="font-medium">Data Preparation</span> und wende ein{' '}
                <GlossaryLink term="Encoding" termId="encoding">Encoding</GlossaryLink>{' '}
                (One-Hot oder Label) an.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Algorithm Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Algorithmus auswählen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableAlgorithms.map((algo) => (
              <button
                key={algo.type}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedAlgorithm === algo.type
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-200 hover:shadow-sm'
                } ${isTraining ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={() => !isTraining && handleAlgorithmSelect(algo.type)}
                disabled={isTraining}
              >
                <div className="font-medium text-sm text-gray-900">{algo.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{algo.description}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hyperparameters */}
      {selectedAlgorithm && hyperparamDefs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <GlossaryLink term="Hyperparameter" termId="hyperparameter">Hyperparameter</GlossaryLink>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hyperparamDefs.map((def) => (
              <HyperparameterSlider
                key={def.name}
                definition={def}
                value={hyperparams[def.name] as number}
                onChange={(val) => setHyperparams({ ...hyperparams, [def.name]: val })}
                disabled={isTraining}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Train Button */}
      {selectedAlgorithm && (
        <div className="flex justify-center">
          <Button
            onClick={handleTrain}
            disabled={isTraining || (!isClustering && !targetColumn)}
            className="gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-600"
            size="lg"
          >
            {isTraining ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Modell wird trainiert...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Modell trainieren
              </>
            )}
          </Button>
        </div>
      )}

      {/* Trained Models List */}
      {trainedModels.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Trainierte Modelle ({trainedModels.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trainedModels.map((model) => (
              <TrainedModelCard
                key={model.id}
                model={model}
                projectType={project.type}
                isSelected={project.selectedModelId === model.id}
                onRemove={() => handleRemoveModel(model.id)}
                disabled={isTraining}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tutor Tip */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-orange-800 mb-1">Tipp: Modeling</p>
            <p className="text-orange-700">
              Trainiere mehrere Modelle mit verschiedenen Algorithmen und{' '}
              <GlossaryLink term="Hyperparameter" termId="hyperparameter">Hyperparametern</GlossaryLink>,
              um zu sehen, welches am besten funktioniert. Beginne mit einem einfachen{' '}
              <GlossaryLink term="Baseline" termId="baseline">Baseline</GlossaryLink>-Modell
              und steigere dann die Komplexität.
              Achte auf <GlossaryLink term="Overfitting" termId="overfitting">Overfitting</GlossaryLink> –
              wenn das Modell auf den Trainingsdaten viel besser ist als auf den Testdaten.
            </p>
          </div>
        </div>
      </div>

      <GlossaryTermsCard terms={GLOSSARY_TERMS} />

      {/* Lernbereich-Link (Pattern 12) */}
      <a
        href="/lernen/grundlagen#crisp-dm"
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        <BookOpen className="h-3.5 w-3.5" />
        Mehr zu dieser Phase im Lernbereich →
      </a>

      {/* Training overlay */}
      {isTraining && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <Card className="p-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            <span className="font-medium">Modell wird trainiert...</span>
          </Card>
        </div>
      )}
    </div>
  );
}

// =============================================
// Sub-Components
// =============================================

function HyperparameterSlider({ definition, value, onChange, disabled }: {
  definition: HyperparameterDef;
  value: number;
  onChange: (val: number) => void;
  disabled: boolean;
}) {
  const displayValue = definition.step && definition.step < 1
    ? value.toFixed(2)
    : value.toString();

  return (
    <div>
      <Label>{definition.label}: {displayValue}</Label>
      <Slider
        className="mt-2"
        min={definition.min}
        max={definition.max}
        step={definition.step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        disabled={disabled}
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>{definition.min}</span>
        <span>{definition.max}</span>
      </div>
    </div>
  );
}

function TrainedModelCard({ model, projectType, isSelected, onRemove, disabled }: {
  model: TrainedModel;
  projectType: string;
  isSelected: boolean;
  onRemove: () => void;
  disabled: boolean;
}) {
  const mainMetric = projectType === 'klassifikation'
    ? `Accuracy: ${((model.metrics.accuracy ?? 0) * 100).toFixed(1)}%`
    : projectType === 'regression'
    ? `R²: ${(model.metrics.r2 ?? 0).toFixed(4)}`
    : `Silhouette: ${(model.metrics.silhouetteScore ?? 0).toFixed(4)}`;

  const secondaryMetric = projectType === 'klassifikation'
    ? `F1: ${((model.metrics.f1Score ?? 0) * 100).toFixed(1)}%`
    : projectType === 'regression'
    ? `RMSE: ${(model.metrics.rmse ?? 0).toFixed(4)}`
    : `Cluster: ${model.metrics.nClusters ?? '?'}`;

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      isSelected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Brain className="h-5 w-5 text-orange-500 shrink-0" />
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">{model.algorithmLabel}</div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{mainMetric}</span>
            <span>{secondaryMetric}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {model.trainingDurationMs < 1000
                ? `${model.trainingDurationMs}ms`
                : `${(model.trainingDurationMs / 1000).toFixed(1)}s`}
            </span>
          </div>
        </div>
      </div>
      {isSelected && (
        <Badge className="bg-green-100 text-green-700 border-green-200 shrink-0 mr-2">
          Ausgewählt
        </Badge>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0"
        onClick={onRemove}
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

