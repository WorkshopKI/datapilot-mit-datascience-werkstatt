// Modeling Phase – Algorithm Selection + Training
import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Brain, Loader2, AlertTriangle, Play, Trash2,
  AlertCircle, Settings2, Clock, CheckCircle2, ChevronDown, Zap, Info,
} from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';
import { GlossaryTermsCard } from '../shared/GlossaryTermsCard';
import { LernbereichLink } from '../shared/LernbereichLink';
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

  // Auto-encoding info from training result
  const [autoEncodedColumns, setAutoEncodedColumns] = useState<string[]>([]);
  const [encodingOpen, setEncodingOpen] = useState(false);

  // Sampling state
  const [samplingEnabled, setSamplingEnabled] = useState(true);
  const [sampleSize, setSampleSize] = useState(5000);
  const [lastTrainingSamplingInfo, setLastTrainingSamplingInfo] = useState<{
    applied: boolean;
    originalRows: number;
    sampledRows: number;
  } | null>(null);

  // Ref for auto-scroll to trained models
  const modelListRef = useRef<HTMLDivElement>(null);

  const isClustering = project.type === 'clustering';
  const hasSplit = project.preparedDataSummary?.hasSplit ?? false;
  const availableAlgorithms = ModelTrainer.getAvailableAlgorithms(project.type);
  const availableColumns = project.preparedDataSummary?.columnNames ?? [];
  const numericColumns = project.preparedDataSummary?.numericColumns ?? [];
  const categoricalColumns = project.preparedDataSummary?.categoricalColumns ?? [];

  const rowCount = project.preparedDataSummary?.rowCount ?? 0;
  const isLargeDataset = rowCount > 10_000;
  const recommendedSampleSize = ModelTrainer.getRecommendedSampleSize(rowCount);

  const handleAlgorithmSelect = useCallback((algType: AlgorithmType) => {
    setSelectedAlgorithm(algType);
    // Set default hyperparameters
    const defs = ModelTrainer.getDefaultHyperparameters(algType);
    const defaults: Record<string, number | string | boolean> = {};
    for (const def of defs) {
      defaults[def.name] = def.default;
    }

    // Apply smart defaults for large datasets
    const smartDefaults = ModelTrainer.getSmartDefaults(algType, rowCount);
    if (smartDefaults) {
      Object.assign(defaults, smartDefaults);
    }

    setHyperparams(defaults);

    // Auto-set sampling for large datasets
    if (recommendedSampleSize) {
      setSamplingEnabled(true);
      setSampleSize(recommendedSampleSize);
    }
  }, [rowCount, recommendedSampleSize]);

  const handleTrain = useCallback(async () => {
    if (!selectedAlgorithm) return;
    if (!isClustering && !targetColumn) return;
    if (!isClustering && !hasSplit) return;

    setViewState('training');
    setErrorMessage(null);
    setAutoEncodedColumns([]);
    setLastTrainingSamplingInfo(null);

    const effectiveSampleSize = isLargeDataset && samplingEnabled ? sampleSize : undefined;

    try {
      const config: AlgorithmConfig = {
        type: selectedAlgorithm,
        hyperparameters: hyperparams,
      };

      const result = isClustering
        ? await ModelTrainer.trainClusteringModel(config, effectiveSampleSize)
        : await ModelTrainer.trainModel(config, targetColumn, project.type, effectiveSampleSize);

      if (!result.success) {
        let error = result.error ?? 'Training fehlgeschlagen';
        if (/timeout|zeitüberschreitung/i.test(error)) {
          error += ' Tipps: Reduziere die Max Tiefe, verringere die Anzahl Bäume, oder führe ein Feature-Selection in der Datenvorbereitung durch.';
        }
        setErrorMessage(error);
        setViewState('ready');
        return;
      }

      if (result.autoEncodedColumns?.length) {
        setAutoEncodedColumns(result.autoEncodedColumns);
      }

      if (result.samplingApplied) {
        setLastTrainingSamplingInfo({
          applied: true,
          originalRows: result.originalRowCount ?? 0,
          sampledRows: result.sampledRowCount ?? 0,
        });
      }

      const newModels = [...trainedModels, result.model!];
      setTrainedModels(newModels);

      onUpdateProject({
        trainedModels: newModels,
        targetColumn: isClustering ? '' : targetColumn,
      });

      // Auto-scroll to trained models list
      setTimeout(() => modelListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    } catch (err) {
      let message = err instanceof Error ? err.message : 'Unbekannter Fehler';
      if (/timeout|zeitüberschreitung/i.test(message)) {
        message += ' Tipps: Reduziere die Max Tiefe, verringere die Anzahl Bäume, oder führe ein Feature-Selection in der Datenvorbereitung durch.';
      }
      setErrorMessage(message);
    }
    setViewState('ready');
  }, [selectedAlgorithm, targetColumn, hyperparams, isClustering, hasSplit, trainedModels, project.type, onUpdateProject, isLargeDataset, samplingEnabled, sampleSize]);

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

  const getColumnType = (col: string): string => {
    if (numericColumns.includes(col)) return 'numerisch';
    if (categoricalColumns.includes(col)) return 'kategorial';
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {errorMessage && viewState === 'ready' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Auto-encoding info banner (collapsible) */}
      {autoEncodedColumns.length > 0 && (
        <Collapsible open={encodingOpen} onOpenChange={setEncodingOpen}>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <p className="text-sm font-medium text-amber-800 flex-1 text-left">
                  Automatisches Encoding: {autoEncodedColumns.length} kategoriale Spalte{autoEncodedColumns.length !== 1 ? 'n' : ''} umgewandelt
                </p>
                <ChevronDown className={`h-4 w-4 text-amber-600 transition-transform ${encodingOpen ? 'rotate-180' : ''}`} />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="text-sm text-amber-700 mt-3 ml-8">
                <p>
                  Kategoriale Spalten wurden automatisch per One-Hot Encoding umgewandelt:{' '}
                  <span className="font-mono font-medium">{autoEncodedColumns.join(', ')}</span>.
                </p>
                <p className="mt-1">
                  Tipp: In der <span className="font-medium">Data Preparation</span> kannst du die{' '}
                  <GlossaryLink term="Encoding" termId="encoding">Encoding</GlossaryLink>-Methode selbst wählen.
                </p>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Trained Models List (moved up for visibility) */}
      {trainedModels.length > 0 && (
        <Card ref={modelListRef}>
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

      {/* Sampling info banner (after training with sampling) */}
      {lastTrainingSamplingInfo?.applied && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Sampling aktiv: Modell wurde auf {lastTrainingSamplingInfo.sampledRows.toLocaleString('de-DE')} von{' '}
            {lastTrainingSamplingInfo.originalRows.toLocaleString('de-DE')} Trainingszeilen trainiert.
            Für ein Lern-Projekt liefert das vergleichbare Ergebnisse bei kürzerer Trainingszeit.
          </p>
        </div>
      )}

      {/* Algorithm Selection (now includes target column at top) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Algorithmus auswählen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Inline target column selector (not for clustering) */}
          {!isClustering && (
            <>
              <div className="flex items-center gap-3 max-w-sm">
                <Label className="shrink-0">Zielspalte:</Label>
                <Select value={targetColumn} onValueChange={setTargetColumn} disabled={isTraining}>
                  <SelectTrigger>
                    <SelectValue placeholder="Spalte auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns.map(col => {
                      const colType = getColumnType(col);
                      return (
                        <SelectItem key={col} value={col}>
                          {col}{colType ? ` (${colType})` : ''}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              {project.type === 'klassifikation' && (
                <p className="text-xs text-muted-foreground">
                  Tipp: Für Klassifikation eignet sich eine kategoriale Spalte als Ziel.
                </p>
              )}
              {project.type === 'regression' && (
                <p className="text-xs text-muted-foreground">
                  Tipp: Für Regression eignet sich eine numerische Spalte als Ziel.
                </p>
              )}
              <Separator />
            </>
          )}
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
            {ModelTrainer.getSmartDefaults(selectedAlgorithm, rowCount) && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3" />
                Hyperparameter wurden für den großen Datensatz angepasst.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sampling card for large datasets */}
      {isLargeDataset && selectedAlgorithm && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-600" />
              Intelligentes Sampling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-blue-800">
              Dein Datensatz hat <span className="font-medium">{rowCount.toLocaleString('de-DE')} Zeilen</span>.
              Für ein Lern-Projekt reicht ein repräsentatives Sample – das Training wird deutlich schneller.
            </p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={samplingEnabled}
                  onChange={(e) => setSamplingEnabled(e.target.checked)}
                  disabled={isTraining}
                  className="rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-blue-900">Sampling aktivieren</span>
              </label>
              {samplingEnabled && (
                <Select
                  value={String(sampleSize)}
                  onValueChange={(val) => setSampleSize(Number(val))}
                  disabled={isTraining}
                >
                  <SelectTrigger className="w-[160px] h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3000">3.000 Zeilen</SelectItem>
                    <SelectItem value="5000">5.000 Zeilen</SelectItem>
                    <SelectItem value="8000">8.000 Zeilen</SelectItem>
                    <SelectItem value="10000">10.000 Zeilen</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            {!samplingEnabled && (
              <p className="text-xs text-amber-700 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Ohne Sampling kann das Training bei großen Datensätzen deutlich länger dauern.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Train + Cancel buttons */}
      {selectedAlgorithm && (
        <div className="flex gap-3 justify-center">
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
          {isTraining && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => { setViewState('ready'); setErrorMessage(null); }}
              className="gap-2"
            >
              Abbrechen
            </Button>
          )}
        </div>
      )}

      <GlossaryTermsCard terms={GLOSSARY_TERMS} />

      {/* Lernbereich-Link (Pattern 12) */}
      <LernbereichLink />
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
