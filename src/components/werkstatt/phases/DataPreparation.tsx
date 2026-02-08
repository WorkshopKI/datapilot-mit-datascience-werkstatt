// Data Preparation Phase – Pipeline Builder
import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Settings2, Plus, Trash2, Play, Loader2, AlertTriangle,
  Info, Code, Eye, ListOrdered, AlertCircle,
} from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';
import { DataPreparator } from '@/engine/data/DataPreparator';
import type { StepExecutionResult } from '@/engine/data/DataPreparator';
import type {
  WorkspaceProject, PipelineStep, PipelineStepType, PreparedDataSummary,
  MissingValuesConfig, OutlierRemovalConfig, EncodingConfig,
  ScalingConfig, FeatureSelectionConfig, TrainTestSplitConfig,
} from '@/engine/types';
import { usePyodide } from '@/hooks/usePyodide';

interface DataPreparationProps {
  project: WorkspaceProject;
  onUpdateProject: (updates: Partial<WorkspaceProject>) => void;
}

type ViewState = 'no-data' | 'initializing' | 'ready' | 'applying-step' | 'error';

// Step type labels in German
const STEP_TYPE_LABELS: Record<PipelineStepType, string> = {
  'missing-values': 'Fehlende Werte behandeln',
  'outlier-removal': 'Ausreißer entfernen',
  'encoding': 'Encoding (Kategorial → Numerisch)',
  'scaling': 'Skalierung',
  'feature-selection': 'Feature-Auswahl',
  'train-test-split': 'Train-Test-Split',
};

let stepCounter = 0;
function nextStepId(): string {
  return `step-${Date.now()}-${++stepCounter}`;
}

export function DataPreparation({ project, onUpdateProject }: DataPreparationProps) {
  const { isReady, isLoading, progress, progressMessage, initialize, error: pyodideError } = usePyodide();

  const [viewState, setViewState] = useState<ViewState>('no-data');
  const [dataSummary, setDataSummary] = useState<PreparedDataSummary | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(project.pipelineSteps ?? []);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New step form state
  const [selectedStepType, setSelectedStepType] = useState<PipelineStepType | ''>('');

  // Determine if data is available
  const hasData = !!project.dataSource;

  // Initialize pipeline when entering the phase with data
  useEffect(() => {
    if (!hasData) {
      setViewState('no-data');
      return;
    }
    if (viewState === 'no-data' && hasData) {
      initPipeline();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasData]);

  const initPipeline = useCallback(async () => {
    setViewState('initializing');
    setErrorMessage(null);
    try {
      if (!isReady) {
        await initialize();
      }
      const summary = await DataPreparator.initializePipeline();
      setDataSummary(summary);
      setViewState('ready');

      // If there are saved steps, replay them
      if (project.pipelineSteps && project.pipelineSteps.length > 0) {
        const result = await DataPreparator.replayPipeline(project.pipelineSteps);
        if (result.success) {
          setDataSummary(result.dataSummary);
          setPreview(result.preview);
          setPipelineSteps(project.pipelineSteps);
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setViewState('error');
    }
  }, [isReady, initialize, project.pipelineSteps]);

  const handleApplyStep = useCallback(async (step: PipelineStep) => {
    setViewState('applying-step');
    setErrorMessage(null);
    try {
      const result = await DataPreparator.applyStep(step);
      if (!result.success) {
        setErrorMessage(result.error ?? 'Schritt fehlgeschlagen');
        setViewState('ready');
        return;
      }

      const appliedStep: PipelineStep = {
        ...step,
        pythonCode: DataPreparator.buildStepCode(step),
        appliedAt: new Date().toISOString(),
        resultSummary: result.summary,
      };
      const newSteps = [...pipelineSteps, appliedStep];
      setPipelineSteps(newSteps);
      setDataSummary(result.dataSummary);
      setPreview(result.preview);
      setSelectedStepType('');

      onUpdateProject({
        pipelineSteps: newSteps,
        preparedDataSummary: result.dataSummary,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
    setViewState('ready');
  }, [pipelineSteps, onUpdateProject]);

  const handleRemoveStep = useCallback(async (stepIndex: number) => {
    setViewState('applying-step');
    setErrorMessage(null);
    try {
      const newSteps = pipelineSteps.filter((_, i) => i !== stepIndex);
      const result = await DataPreparator.replayPipeline(newSteps);

      if (!result.success) {
        setErrorMessage(result.error ?? 'Pipeline-Replay fehlgeschlagen');
        setViewState('ready');
        return;
      }

      setPipelineSteps(newSteps);
      setDataSummary(result.dataSummary);
      setPreview(result.preview);

      onUpdateProject({
        pipelineSteps: newSteps,
        preparedDataSummary: result.dataSummary,
      });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
    setViewState('ready');
  }, [pipelineSteps, onUpdateProject]);

  // --- No Data state ---
  if (viewState === 'no-data') {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 rounded-full bg-muted w-fit">
              <Settings2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <CardTitle>Data Preparation</CardTitle>
            <p className="text-muted-foreground">
              Bitte lade zuerst Daten in der{' '}
              <span className="font-medium">Data Understanding</span>-Phase, bevor du mit der Vorbereitung beginnst.
            </p>
          </CardHeader>
        </Card>
        <GlossaryTermsCard />
      </div>
    );
  }

  // --- Initializing state ---
  if (viewState === 'initializing') {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin mx-auto" />
          <h3 className="font-semibold text-lg">Pipeline wird initialisiert...</h3>
          {isLoading && (
            <div className="max-w-md mx-auto space-y-2">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-muted-foreground">{progressMessage || 'ML-Engine wird geladen...'}</p>
            </div>
          )}
          {pyodideError && <p className="text-sm text-red-600">{pyodideError}</p>}
        </CardContent>
      </Card>
    );
  }

  // --- Error state ---
  if (viewState === 'error') {
    return (
      <Card className="border-red-200">
        <CardContent className="py-8 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
          <h3 className="font-semibold text-lg text-red-700">Initialisierung fehlgeschlagen</h3>
          <p className="text-sm text-red-600 max-w-md mx-auto">{errorMessage}</p>
          <Button variant="outline" onClick={initPipeline} className="gap-2">
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- Ready / Applying-step state ---
  const isApplying = viewState === 'applying-step';
  const hasSplit = pipelineSteps.some(s => s.type === 'train-test-split');

  return (
    <div className="space-y-4">
      {/* Data summary header */}
      {dataSummary && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{dataSummary.rowCount}</div>
                <div className="text-sm text-muted-foreground">Zeilen</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dataSummary.columnCount}</div>
                <div className="text-sm text-muted-foreground">Spalten</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dataSummary.numericColumns.length}</div>
                <div className="text-sm text-muted-foreground">Numerisch</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{dataSummary.categoricalColumns.length}</div>
                <div className="text-sm text-muted-foreground">Kategorial</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{pipelineSteps.length}</div>
                <div className="text-sm text-muted-foreground">Schritte</div>
              </div>
            </div>
            {dataSummary.hasSplit && dataSummary.trainRows != null && dataSummary.testRows != null && (
              <div className="mt-3 flex justify-center gap-4">
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  Train: {dataSummary.trainRows} Zeilen
                </Badge>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                  Test: {dataSummary.testRows} Zeilen
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error banner */}
      {errorMessage && viewState === 'ready' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="pipeline">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipeline" className="gap-1">
            <ListOrdered className="h-3.5 w-3.5" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="vorschau" className="gap-1">
            <Eye className="h-3.5 w-3.5" />
            Datenvorschau
          </TabsTrigger>
          <TabsTrigger value="code" className="gap-1">
            <Code className="h-3.5 w-3.5" />
            Python-Code
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Pipeline */}
        <TabsContent value="pipeline">
          <div className="space-y-4">
            {/* Applied steps */}
            {pipelineSteps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Angewandte Schritte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pipelineSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0 text-xs">
                          {index + 1}
                        </Badge>
                        <div>
                          <div className="font-medium text-sm">{step.label}</div>
                          {step.resultSummary && (
                            <div className="text-xs text-muted-foreground">{step.resultSummary}</div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => handleRemoveStep(index)}
                        disabled={isApplying}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Add new step */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Schritt hinzufügen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Schritt-Typ</Label>
                  <Select
                    value={selectedStepType}
                    onValueChange={(v) => setSelectedStepType(v as PipelineStepType)}
                    disabled={isApplying}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Schritt auswählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(STEP_TYPE_LABELS) as [PipelineStepType, string][]).map(([type, label]) => {
                        const disabled = type === 'train-test-split' && hasSplit;
                        return (
                          <SelectItem key={type} value={type} disabled={disabled}>
                            {label}
                            {disabled && ' (bereits vorhanden)'}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedStepType && dataSummary && (
                  <StepConfigForm
                    stepType={selectedStepType}
                    dataSummary={dataSummary}
                    isApplying={isApplying}
                    hasSplit={hasSplit}
                    onApply={handleApplyStep}
                  />
                )}
              </CardContent>
            </Card>

            {/* Tutor tip */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800 mb-1">Tipp: Data Preparation</p>
                  <p className="text-orange-700">
                    Beginne mit der Behandlung{' '}
                    <GlossaryLink term="Fehlende Werte" termId="fehlende-werte">fehlender Werte</GlossaryLink>,
                    entferne dann <GlossaryLink term="Ausreißer" termId="ausreisser">Ausreißer</GlossaryLink>.
                    Danach kodiere kategoriale Spalten mit{' '}
                    <GlossaryLink term="One-Hot Encoding" termId="one-hot-encoding">One-Hot Encoding</GlossaryLink>{' '}
                    und skaliere numerische Features mit{' '}
                    <GlossaryLink term="Normalisierung" termId="normalisierung">Normalisierung</GlossaryLink>.
                    Der <GlossaryLink term="Train-Test-Split" termId="train-test-split">Train-Test-Split</GlossaryLink>{' '}
                    sollte als letzter Schritt erfolgen.
                  </p>
                </div>
              </div>
            </div>

            <GlossaryTermsCard />
          </div>
        </TabsContent>

        {/* Tab 2: Datenvorschau */}
        <TabsContent value="vorschau">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Aktuelle Datenvorschau (erste 5 Zeilen)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {preview.length > 0 && dataSummary ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {dataSummary.columnNames.map(col => {
                          const isNumeric = dataSummary.numericColumns.includes(col);
                          return (
                            <TableHead key={col}>
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">{col}</span>
                                <Badge variant="outline" className="w-fit text-xs">
                                  {isNumeric ? 'num' : 'kat'}
                                </Badge>
                              </div>
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.map((row, i) => (
                        <TableRow key={i}>
                          {dataSummary.columnNames.map(col => (
                            <TableCell key={col} className="font-mono text-xs">
                              {formatCellValue(row[col])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-6">
                  Noch keine Vorschau verfügbar. Führe einen Pipeline-Schritt aus.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Python-Code */}
        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="h-4 w-4" />
                Generierter Python-Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pipelineSteps.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Dieser Code zeigt, was die Pipeline-Schritte in Python tun – ideal zum Lernen!
                  </p>
                  <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                    <code>
                      {`import pandas as pd\nfrom sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder\nfrom sklearn.model_selection import train_test_split\n\n# Daten laden (df ist bereits vorhanden)\n`}
                      {pipelineSteps.map((step, i) => (
                        `\n# Schritt ${i + 1}: ${step.label}\n${step.pythonCode || DataPreparator.buildStepCode(step)}\n`
                      )).join('')}
                    </code>
                  </pre>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-6">
                  Noch keine Schritte vorhanden. Füge Pipeline-Schritte hinzu, um den generierten Code zu sehen.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Spinner overlay while applying */}
      {isApplying && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
          <Card className="p-6 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
            <span className="font-medium">Schritt wird ausgeführt...</span>
          </Card>
        </div>
      )}
    </div>
  );
}

// =============================================
// Step Config Forms
// =============================================

interface StepConfigFormProps {
  stepType: PipelineStepType;
  dataSummary: PreparedDataSummary;
  isApplying: boolean;
  hasSplit: boolean;
  onApply: (step: PipelineStep) => void;
}

function StepConfigForm({ stepType, dataSummary, isApplying, hasSplit, onApply }: StepConfigFormProps) {
  switch (stepType) {
    case 'missing-values':
      return <MissingValuesForm dataSummary={dataSummary} isApplying={isApplying} onApply={onApply} />;
    case 'outlier-removal':
      return <OutlierRemovalForm dataSummary={dataSummary} isApplying={isApplying} onApply={onApply} />;
    case 'encoding':
      return <EncodingForm dataSummary={dataSummary} isApplying={isApplying} onApply={onApply} />;
    case 'scaling':
      return <ScalingForm dataSummary={dataSummary} isApplying={isApplying} onApply={onApply} />;
    case 'feature-selection':
      return <FeatureSelectionForm dataSummary={dataSummary} isApplying={isApplying} onApply={onApply} />;
    case 'train-test-split':
      return <TrainTestSplitForm dataSummary={dataSummary} isApplying={isApplying} hasSplit={hasSplit} onApply={onApply} />;
    default:
      return null;
  }
}

// --- Missing Values Form ---

function MissingValuesForm({ dataSummary, isApplying, onApply }: {
  dataSummary: PreparedDataSummary; isApplying: boolean; onApply: (step: PipelineStep) => void;
}) {
  const [strategy, setStrategy] = useState<MissingValuesConfig['strategy']>('drop-rows');
  const [selectedCols, setSelectedCols] = useState<string[]>([]);
  const [fillValue, setFillValue] = useState('');

  const handleApply = () => {
    const config: MissingValuesConfig = {
      strategy,
      columns: selectedCols,
      ...(strategy === 'fill-constant' ? { fillValue } : {}),
    };
    const strategyLabels: Record<string, string> = {
      'drop-rows': 'Zeilen entfernen',
      'fill-mean': 'Mittelwert',
      'fill-median': 'Median',
      'fill-mode': 'Häufigster Wert',
      'fill-constant': 'Konstante',
    };
    onApply({
      id: nextStepId(),
      type: 'missing-values',
      label: `Fehlende Werte: ${strategyLabels[strategy]}`,
      config,
      pythonCode: '',
    });
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label>Strategie</Label>
        <Select value={strategy} onValueChange={(v) => setStrategy(v as MissingValuesConfig['strategy'])}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="drop-rows">Zeilen mit fehlenden Werten entfernen</SelectItem>
            <SelectItem value="fill-mean">Mit Mittelwert füllen</SelectItem>
            <SelectItem value="fill-median">Mit Median füllen</SelectItem>
            <SelectItem value="fill-mode">Mit häufigstem Wert füllen</SelectItem>
            <SelectItem value="fill-constant">Mit Konstante füllen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {strategy === 'fill-constant' && (
        <div>
          <Label>Füllwert</Label>
          <Input
            className="mt-1"
            value={fillValue}
            onChange={(e) => setFillValue(e.target.value)}
            placeholder="z.B. 0, Unbekannt"
          />
        </div>
      )}

      <ColumnCheckboxes
        label="Spalten (leer = alle betroffenen)"
        columns={dataSummary.columnNames}
        selected={selectedCols}
        onChange={setSelectedCols}
      />

      <Button onClick={handleApply} disabled={isApplying} className="gap-2">
        <Play className="h-4 w-4" /> Ausführen
      </Button>
    </div>
  );
}

// --- Outlier Removal Form ---

function OutlierRemovalForm({ dataSummary, isApplying, onApply }: {
  dataSummary: PreparedDataSummary; isApplying: boolean; onApply: (step: PipelineStep) => void;
}) {
  const [method, setMethod] = useState<OutlierRemovalConfig['method']>('zscore');
  const [threshold, setThreshold] = useState(method === 'zscore' ? 3 : 1.5);
  const [selectedCols, setSelectedCols] = useState<string[]>([]);

  const handleMethodChange = (m: OutlierRemovalConfig['method']) => {
    setMethod(m);
    setThreshold(m === 'zscore' ? 3 : 1.5);
  };

  const handleApply = () => {
    if (selectedCols.length === 0) return;
    const config: OutlierRemovalConfig = { method, threshold, columns: selectedCols };
    const label = method === 'zscore'
      ? `Ausreißer: Z-Score > ${threshold}`
      : `Ausreißer: IQR × ${threshold}`;
    onApply({ id: nextStepId(), type: 'outlier-removal', label, config, pythonCode: '' });
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label>Methode</Label>
        <Select value={method} onValueChange={(v) => handleMethodChange(v as OutlierRemovalConfig['method'])}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="zscore">Z-Score</SelectItem>
            <SelectItem value="iqr">IQR (Interquartilsabstand)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Schwellenwert: {threshold}</Label>
        <Slider
          className="mt-2"
          min={method === 'zscore' ? 1 : 0.5}
          max={method === 'zscore' ? 5 : 3}
          step={method === 'zscore' ? 0.5 : 0.25}
          value={[threshold]}
          onValueChange={([v]) => setThreshold(v)}
        />
      </div>

      <ColumnCheckboxes
        label="Numerische Spalten"
        columns={dataSummary.numericColumns}
        selected={selectedCols}
        onChange={setSelectedCols}
      />

      {selectedCols.length === 0 && (
        <p className="text-xs text-amber-600">Bitte mindestens eine Spalte auswählen.</p>
      )}

      <Button onClick={handleApply} disabled={isApplying || selectedCols.length === 0} className="gap-2">
        <Play className="h-4 w-4" /> Ausführen
      </Button>
    </div>
  );
}

// --- Encoding Form ---

function EncodingForm({ dataSummary, isApplying, onApply }: {
  dataSummary: PreparedDataSummary; isApplying: boolean; onApply: (step: PipelineStep) => void;
}) {
  const [method, setMethod] = useState<EncodingConfig['method']>('one-hot');
  const [dropFirst, setDropFirst] = useState(false);
  const [selectedCols, setSelectedCols] = useState<string[]>([]);

  const handleApply = () => {
    if (selectedCols.length === 0) return;
    const config: EncodingConfig = { method, columns: selectedCols, ...(method === 'one-hot' ? { dropFirst } : {}) };
    const label = method === 'one-hot'
      ? `One-Hot-Encoding${dropFirst ? ' (drop first)' : ''}`
      : 'Label-Encoding';
    onApply({ id: nextStepId(), type: 'encoding', label, config, pythonCode: '' });
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label>Methode</Label>
        <Select value={method} onValueChange={(v) => setMethod(v as EncodingConfig['method'])}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="one-hot">One-Hot Encoding</SelectItem>
            <SelectItem value="label">Label Encoding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {method === 'one-hot' && (
        <div className="flex items-center gap-2">
          <Switch checked={dropFirst} onCheckedChange={setDropFirst} id="drop-first" />
          <Label htmlFor="drop-first" className="text-sm">Erste Dummy-Spalte entfernen (drop first)</Label>
        </div>
      )}

      <ColumnCheckboxes
        label="Kategoriale Spalten"
        columns={dataSummary.categoricalColumns}
        selected={selectedCols}
        onChange={setSelectedCols}
      />

      {selectedCols.length === 0 && (
        <p className="text-xs text-amber-600">Bitte mindestens eine Spalte auswählen.</p>
      )}

      <Button onClick={handleApply} disabled={isApplying || selectedCols.length === 0} className="gap-2">
        <Play className="h-4 w-4" /> Ausführen
      </Button>
    </div>
  );
}

// --- Scaling Form ---

function ScalingForm({ dataSummary, isApplying, onApply }: {
  dataSummary: PreparedDataSummary; isApplying: boolean; onApply: (step: PipelineStep) => void;
}) {
  const [method, setMethod] = useState<ScalingConfig['method']>('standard');
  const [selectedCols, setSelectedCols] = useState<string[]>([]);

  const handleApply = () => {
    if (selectedCols.length === 0) return;
    const config: ScalingConfig = { method, columns: selectedCols };
    const label = method === 'standard' ? 'StandardScaler' : 'MinMaxScaler';
    onApply({ id: nextStepId(), type: 'scaling', label, config, pythonCode: '' });
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label>Methode</Label>
        <Select value={method} onValueChange={(v) => setMethod(v as ScalingConfig['method'])}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">StandardScaler (Mittelwert=0, Std=1)</SelectItem>
            <SelectItem value="minmax">MinMaxScaler (0-1)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ColumnCheckboxes
        label="Numerische Spalten"
        columns={dataSummary.numericColumns}
        selected={selectedCols}
        onChange={setSelectedCols}
      />

      {selectedCols.length === 0 && (
        <p className="text-xs text-amber-600">Bitte mindestens eine Spalte auswählen.</p>
      )}

      <Button onClick={handleApply} disabled={isApplying || selectedCols.length === 0} className="gap-2">
        <Play className="h-4 w-4" /> Ausführen
      </Button>
    </div>
  );
}

// --- Feature Selection Form ---

function FeatureSelectionForm({ dataSummary, isApplying, onApply }: {
  dataSummary: PreparedDataSummary; isApplying: boolean; onApply: (step: PipelineStep) => void;
}) {
  const [method, setMethod] = useState<FeatureSelectionConfig['method']>('drop-columns');
  const [selectedCols, setSelectedCols] = useState<string[]>([]);

  const handleApply = () => {
    if (selectedCols.length === 0) return;
    const config: FeatureSelectionConfig = { method, columns: selectedCols };
    const label = method === 'drop-columns'
      ? `${selectedCols.length} Spalte(n) entfernt`
      : `${selectedCols.length} Spalte(n) behalten`;
    onApply({ id: nextStepId(), type: 'feature-selection', label, config, pythonCode: '' });
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label>Methode</Label>
        <Select value={method} onValueChange={(v) => setMethod(v as FeatureSelectionConfig['method'])}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="drop-columns">Spalten entfernen</SelectItem>
            <SelectItem value="keep-columns">Nur ausgewählte behalten</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ColumnCheckboxes
        label={method === 'drop-columns' ? 'Zu entfernende Spalten' : 'Zu behaltende Spalten'}
        columns={dataSummary.columnNames}
        selected={selectedCols}
        onChange={setSelectedCols}
      />

      {selectedCols.length === 0 && (
        <p className="text-xs text-amber-600">Bitte mindestens eine Spalte auswählen.</p>
      )}

      <Button onClick={handleApply} disabled={isApplying || selectedCols.length === 0} className="gap-2">
        <Play className="h-4 w-4" /> Ausführen
      </Button>
    </div>
  );
}

// --- Train-Test-Split Form ---

function TrainTestSplitForm({ dataSummary, isApplying, hasSplit, onApply }: {
  dataSummary: PreparedDataSummary; isApplying: boolean; hasSplit: boolean;
  onApply: (step: PipelineStep) => void;
}) {
  const [testSize, setTestSize] = useState(0.2);
  const [randomState, setRandomState] = useState(42);
  const [stratify, setStratify] = useState('');

  const handleApply = () => {
    const config: TrainTestSplitConfig = {
      testSize,
      randomState,
      ...(stratify ? { stratify } : {}),
    };
    const pct = Math.round(testSize * 100);
    const label = `Train-Test-Split (${100 - pct}/${pct})`;
    onApply({ id: nextStepId(), type: 'train-test-split', label, config, pythonCode: '' });
  };

  if (hasSplit) {
    return (
      <div className="border-t pt-3">
        <p className="text-sm text-amber-600">
          Ein Train-Test-Split wurde bereits angewendet. Entferne ihn zuerst, um einen neuen zu erstellen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-t pt-3">
      <div>
        <Label>Test-Anteil: {Math.round(testSize * 100)}%</Label>
        <Slider
          className="mt-2"
          min={0.1}
          max={0.4}
          step={0.05}
          value={[testSize]}
          onValueChange={([v]) => setTestSize(v)}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>10%</span>
          <span>40%</span>
        </div>
      </div>

      <div>
        <Label>Random State</Label>
        <Input
          className="mt-1 w-32"
          type="number"
          value={randomState}
          onChange={(e) => setRandomState(parseInt(e.target.value) || 0)}
        />
      </div>

      <div>
        <Label>Stratifizierung (optional)</Label>
        <Select value={stratify} onValueChange={setStratify}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Keine" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Keine</SelectItem>
            {dataSummary.categoricalColumns.map(col => (
              <SelectItem key={col} value={col}>{col}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Sorgt dafür, dass das Klassenverhältnis in Train und Test gleich bleibt.
        </p>
      </div>

      <Button onClick={handleApply} disabled={isApplying} className="gap-2">
        <Play className="h-4 w-4" /> Ausführen
      </Button>
    </div>
  );
}

// =============================================
// Shared Components
// =============================================

function ColumnCheckboxes({ label, columns, selected, onChange }: {
  label: string;
  columns: string[];
  selected: string[];
  onChange: (cols: string[]) => void;
}) {
  const toggle = (col: string) => {
    if (selected.includes(col)) {
      onChange(selected.filter(c => c !== col));
    } else {
      onChange([...selected, col]);
    }
  };

  if (columns.length === 0) {
    return (
      <div>
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground mt-1">Keine passenden Spalten vorhanden.</p>
      </div>
    );
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {columns.map(col => (
          <label
            key={col}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md border cursor-pointer hover:bg-gray-50 text-sm"
          >
            <Checkbox
              checked={selected.includes(col)}
              onCheckedChange={() => toggle(col)}
            />
            <span className="font-mono text-xs">{col}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function GlossaryTermsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Relevante Begriffe für diese Phase</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <GlossaryLink term="Feature Engineering" termId="feature-engineering" />
          <GlossaryLink term="Imputation" termId="imputation" />
          <GlossaryLink term="One-Hot Encoding" termId="one-hot-encoding" />
          <GlossaryLink term="Normalisierung" termId="normalisierung" />
          <GlossaryLink term="Train-Test-Split" termId="train-test-split" />
          <GlossaryLink term="Ausreißer" termId="ausreisser" />
          <GlossaryLink term="Skalierung" termId="standardisierung" />
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================
// Helpers
// =============================================

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '–';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(4);
  }
  return String(value);
}
