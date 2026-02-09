// Data Preparation Phase – Pipeline Builder
import { useState, useCallback, useEffect, useMemo } from 'react';
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
  Info, Code, Eye, ListOrdered, AlertCircle, BookOpen, CheckCircle2, Lightbulb,
  Hash, Filter, Shuffle, BarChart3, Search, ArrowUpDown, ChevronUp, ChevronDown,
  Copy, Check,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlossaryLink } from '../GlossaryLink';
import { DataPreparator } from '@/engine/data/DataPreparator';
import { TutorService } from '@/engine/tutor/TutorService';
import type { PipelineRecommendation } from '@/engine/tutor/TutorService';
import type { StepExecutionResult } from '@/engine/data/DataPreparator';
import type {
  WorkspaceProject, PipelineStep, PipelineStepType, PreparedDataSummary,
  MissingValuesConfig, OutlierRemovalConfig, EncodingConfig,
  ScalingConfig, FeatureSelectionConfig, TrainTestSplitConfig,
} from '@/engine/types';
import { usePyodide } from '@/hooks/usePyodide';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const [viewState, setViewState] = useState<ViewState>('no-data');
  const [codeCopied, setCodeCopied] = useState(false);
  const [dataSummary, setDataSummary] = useState<PreparedDataSummary | null>(null);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(project.pipelineSteps ?? []);
  const [preview, setPreview] = useState<Record<string, unknown>[]>([]);
  const [fullPreview, setFullPreview] = useState<Record<string, unknown>[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preview table interactive state
  const [previewCount, setPreviewCount] = useState(10);
  const [showAllRows, setShowAllRows] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

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

  const loadFullPreview = useCallback(async () => {
    try {
      const rows = await DataPreparator.getPreviewRows();
      setFullPreview(rows);
    } catch {
      // Non-critical: full preview is a nice-to-have, keep the 5-row preview as fallback
    }
  }, []);

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

      // Load full preview for the interactive table
      await loadFullPreview();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unbekannter Fehler');
      setViewState('error');
    }
  }, [isReady, initialize, project.pipelineSteps, loadFullPreview]);

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

      // Refresh full preview
      await loadFullPreview();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
    setViewState('ready');
  }, [pipelineSteps, onUpdateProject, loadFullPreview]);

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

      // Refresh full preview
      await loadFullPreview();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unbekannter Fehler');
    }
    setViewState('ready');
  }, [pipelineSteps, onUpdateProject, loadFullPreview]);

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
        <LernbereichLink />
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

      {/* Empfohlener Pfad – kompakter horizontaler Stepper */}
      <RecommendedPathCard
        projectType={project.type}
        appliedStepTypes={pipelineSteps.map(s => s.type)}
        dataSummary={dataSummary}
      />

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
                  <Label className="mb-2 block">Schritt-Typ wählen</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {STEP_TYPE_CARDS.map((card) => {
                      const isDisabled = (card.type === 'train-test-split' && hasSplit) || isApplying;
                      const isSelected = selectedStepType === card.type;
                      const Icon = card.icon;
                      return (
                        <div
                          key={card.type}
                          className={cn(
                            'rounded-xl border p-3 transition-all',
                            isDisabled
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer',
                            isSelected
                              ? 'border-orange-500 bg-orange-50'
                              : isDisabled ? '' : 'hover:border-orange-200 hover:shadow-sm'
                          )}
                          onClick={() => !isDisabled && setSelectedStepType(card.type)}
                        >
                          <div className="flex items-start gap-2.5">
                            <Icon className={cn(
                              'h-5 w-5 shrink-0 mt-0.5',
                              isSelected ? 'text-orange-500' : 'text-muted-foreground'
                            )} />
                            <div className="min-w-0">
                              <p className={cn(
                                'font-medium text-sm',
                                isSelected ? 'text-orange-800' : ''
                              )}>
                                {card.label}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                {card.description}
                              </p>
                              {card.type === 'train-test-split' && hasSplit && (
                                <p className="text-xs text-amber-600 mt-1">Bereits vorhanden</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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

            <GlossaryTermsCard />
            <LernbereichLink />
          </div>
        </TabsContent>

        {/* Tab 2: Datenvorschau */}
        <TabsContent value="vorschau">
          <PrepPreviewTable
            dataSummary={dataSummary}
            fullPreview={fullPreview}
            fallbackPreview={preview}
            previewCount={previewCount}
            setPreviewCount={setPreviewCount}
            showAllRows={showAllRows}
            setShowAllRows={setShowAllRows}
            sortColumn={sortColumn}
            setSortColumn={setSortColumn}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </TabsContent>

        {/* Tab 3: Python-Code */}
        <TabsContent value="code">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Generierter Python-Code
                </CardTitle>
                {pipelineSteps.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      const codeStr = `import pandas as pd\nfrom sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder\nfrom sklearn.model_selection import train_test_split\n\n# Daten laden (df ist bereits vorhanden)\n`
                        + pipelineSteps.map((step, i) =>
                          `\n# Schritt ${i + 1}: ${step.label}\n${step.pythonCode || DataPreparator.buildStepCode(step)}\n`
                        ).join('');
                      navigator.clipboard.writeText(codeStr);
                      setCodeCopied(true);
                      toast({ title: 'Code kopiert', description: 'Der Python-Code wurde in die Zwischenablage kopiert.' });
                      setTimeout(() => setCodeCopied(false), 2000);
                    }}
                  >
                    {codeCopied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {codeCopied ? 'Kopiert!' : 'Kopieren'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {pipelineSteps.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Dieser Code zeigt, was die Pipeline-Schritte in Python tun – ideal zum Lernen!
                  </p>
                  <pre className="bg-muted rounded-lg p-4 overflow-x-auto overflow-y-auto max-h-[400px] text-sm font-mono whitespace-pre-wrap">
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
        <p className="text-sm text-muted-foreground mb-2">
          Die Behandlung fehlender Werte heißt <GlossaryLink term="Imputation" termId="imputation" />.
        </p>
        <Label className="mb-2 block">Strategie</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <MethodCard
            value="drop-rows"
            selected={strategy === 'drop-rows'}
            label="Zeilen entfernen"
            description="Löscht alle Zeilen mit fehlenden Werten. Einfach, aber es gehen Daten verloren – nur bei wenigen Lücken sinnvoll."
            onSelect={(v) => setStrategy(v as MissingValuesConfig['strategy'])}
          />
          <MethodCard
            value="fill-mean"
            selected={strategy === 'fill-mean'}
            label="Mit Mittelwert füllen"
            description="Ersetzt Lücken durch den Durchschnitt der Spalte. Gut für normalverteilte numerische Daten."
            onSelect={(v) => setStrategy(v as MissingValuesConfig['strategy'])}
          />
          <MethodCard
            value="fill-median"
            selected={strategy === 'fill-median'}
            label="Mit Median füllen"
            description="Ersetzt Lücken durch den mittleren Wert. Robuster als der Mittelwert bei Ausreißern."
            onSelect={(v) => setStrategy(v as MissingValuesConfig['strategy'])}
          />
          <MethodCard
            value="fill-mode"
            selected={strategy === 'fill-mode'}
            label="Mit häufigstem Wert"
            description="Ersetzt Lücken durch den häufigsten Wert (Modus). Die einzige Option für kategoriale Spalten."
            onSelect={(v) => setStrategy(v as MissingValuesConfig['strategy'])}
          />
          <MethodCard
            value="fill-constant"
            selected={strategy === 'fill-constant'}
            label="Mit Konstante füllen"
            description={"Ersetzt Lücken durch einen festen Wert (z.B. 0 oder 'Unbekannt'). Nützlich wenn Fehlen selbst eine Information ist."}
            onSelect={(v) => setStrategy(v as MissingValuesConfig['strategy'])}
          />
        </div>
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
        <Label className="mb-2 block">Methode</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <MethodCard
            value="zscore"
            selected={method === 'zscore'}
            label="Z-Score"
            description="Misst, wie viele Standardabweichungen ein Wert vom Mittelwert entfernt ist. Werte mit |z| > Schwellenwert werden entfernt. Setzt annähernd normalverteilte Daten voraus."
            glossaryTerm="Ausreißer"
            glossaryTermId="ausreisser"
            onSelect={(v) => handleMethodChange(v as OutlierRemovalConfig['method'])}
          />
          <MethodCard
            value="iqr"
            selected={method === 'iqr'}
            label="IQR (Interquartilsabstand)"
            description="Nutzt den Abstand zwischen dem 25%- und 75%-Quantil. Werte außerhalb von Q1 − k×IQR bis Q3 + k×IQR gelten als Ausreißer. Robust bei schiefen Verteilungen."
            glossaryTerm="Ausreißer"
            glossaryTermId="ausreisser"
            onSelect={(v) => handleMethodChange(v as OutlierRemovalConfig['method'])}
          />
        </div>
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
        <Label className="mb-2 block">Methode</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <MethodCard
            value="one-hot"
            selected={method === 'one-hot'}
            label="One-Hot Encoding"
            description="Erstellt pro Kategorie eine neue 0/1-Spalte. Ideal wenn keine Rangfolge existiert (z.B. Farbe, Stadt). Erhöht die Spaltenanzahl."
            glossaryTerm="One-Hot Encoding"
            glossaryTermId="one-hot-encoding"
            onSelect={(v) => setMethod(v as EncodingConfig['method'])}
          />
          <MethodCard
            value="label"
            selected={method === 'label'}
            label="Label Encoding"
            description="Ersetzt Kategorien durch Zahlen (0, 1, 2, …). Nur sinnvoll bei ordinalen Daten mit natürlicher Reihenfolge (z.B. klein < mittel < groß)."
            onSelect={(v) => setMethod(v as EncodingConfig['method'])}
          />
        </div>
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
        <Label className="mb-2 block">Methode</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <MethodCard
            value="standard"
            selected={method === 'standard'}
            label="StandardScaler"
            description="Transformiert auf Mittelwert = 0 und Standardabweichung = 1. Standard-Wahl für die meisten ML-Algorithmen."
            glossaryTerm="Normalisierung"
            glossaryTermId="normalisierung"
            onSelect={(v) => setMethod(v as ScalingConfig['method'])}
          />
          <MethodCard
            value="minmax"
            selected={method === 'minmax'}
            label="MinMaxScaler"
            description="Skaliert alle Werte in den Bereich 0 bis 1. Gut wenn die Originalverteilung erhalten bleiben soll."
            glossaryTerm="Normalisierung"
            glossaryTermId="normalisierung"
            onSelect={(v) => setMethod(v as ScalingConfig['method'])}
          />
        </div>
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
        <Label className="mb-2 block">Methode</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <MethodCard
            value="drop-columns"
            selected={method === 'drop-columns'}
            label="Spalten entfernen"
            description="Wähle Spalten aus, die entfernt werden sollen (z.B. IDs, irrelevante Features)."
            onSelect={(v) => setMethod(v as FeatureSelectionConfig['method'])}
          />
          <MethodCard
            value="keep-columns"
            selected={method === 'keep-columns'}
            label="Nur ausgewählte behalten"
            description="Wähle gezielt die Spalten, die du behalten möchtest. Alle anderen werden entfernt."
            onSelect={(v) => setMethod(v as FeatureSelectionConfig['method'])}
          />
        </div>
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
  const [stratify, setStratify] = useState('__none__');

  const handleApply = () => {
    const config: TrainTestSplitConfig = {
      testSize,
      randomState,
      ...(stratify && stratify !== '__none__' ? { stratify } : {}),
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
            <SelectItem value="__none__">Keine</SelectItem>
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

// --- Step Type Card Grid Data ---

interface StepTypeInfo {
  type: PipelineStepType;
  label: string;
  description: string;
  icon: LucideIcon;
}

const STEP_TYPE_CARDS: StepTypeInfo[] = [
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

// --- Reusable MethodCard component ---

function MethodCard<T extends string>({
  value,
  selected,
  label,
  description,
  glossaryTerm,
  glossaryTermId,
  disabled,
  onSelect,
}: {
  value: T;
  selected: boolean;
  label: string;
  description: string;
  glossaryTerm?: string;
  glossaryTermId?: string;
  disabled?: boolean;
  onSelect: (value: T) => void;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border p-3 transition-all',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'cursor-pointer',
        selected
          ? 'border-orange-500 bg-orange-50'
          : disabled ? '' : 'hover:border-orange-200 hover:shadow-sm'
      )}
      onClick={() => !disabled && onSelect(value)}
    >
      <div className="flex items-start gap-2.5">
        <div className={cn(
          'mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center',
          selected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
        )}>
          {selected && (
            <div className="h-1.5 w-1.5 rounded-full bg-white" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-medium text-sm">{label}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
          {glossaryTerm && (
            <div className="mt-1.5">
              <GlossaryLink term={glossaryTerm} termId={glossaryTermId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Short labels for the horizontal stepper */
const SHORT_LABELS: Record<PipelineStepType, string> = {
  'missing-values': 'Fehlende Werte',
  'outlier-removal': 'Ausreißer',
  'encoding': 'Encoding',
  'scaling': 'Skalierung',
  'feature-selection': 'Features',
  'train-test-split': 'Split',
};

function RecommendedPathCard({
  projectType,
  appliedStepTypes,
  dataSummary,
}: {
  projectType: WorkspaceProject['type'];
  appliedStepTypes: PipelineStepType[];
  dataSummary: PreparedDataSummary | null;
}) {
  const recommendations = TutorService.getPipelineRecommendations(projectType);
  if (recommendations.length === 0) return null;

  /** Determine if a step is actually needed based on data */
  const isStepNeeded = (stepType: PipelineStepType): boolean => {
    if (!dataSummary) return true;
    if (stepType === 'missing-values') return dataSummary.missingValueCount > 0;
    if (stepType === 'encoding') return dataSummary.categoricalColumns.length > 0;
    return true;
  };

  // Only show steps that are relevant to the data
  const neededSteps = recommendations.filter(r => !r.optional && isStepNeeded(r.stepType));
  const doneCount = neededSteps.filter(r => appliedStepTypes.includes(r.stepType)).length;

  // Hide when all needed steps are done
  if (neededSteps.length > 0 && doneCount >= neededSteps.length) return null;

  // Find the first not-done step
  const firstUndone = neededSteps.find(r => !appliedStepTypes.includes(r.stepType))?.stepType;

  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      <Lightbulb className="h-4 w-4 text-blue-600 shrink-0" />
      <span className="text-xs font-medium text-blue-700 mr-1">Empfohlener Pfad</span>

      <div className="flex items-center gap-0">
        {neededSteps.map((rec, index) => {
          const isDone = appliedStepTypes.includes(rec.stepType);
          const isNext = rec.stepType === firstUndone;

          return (
            <div key={rec.stepType} className="flex items-center">
              {/* Connector line */}
              {index > 0 && (
                <div className={cn(
                  'w-4 h-0.5 shrink-0',
                  isDone ? 'bg-green-400' : 'bg-gray-200'
                )} />
              )}
              {/* Step circle + label */}
              <div className="flex items-center gap-1.5">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : isNext ? (
                  <div className="h-4 w-4 rounded-full border-2 border-orange-400 bg-orange-50 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <span className={cn(
                  'text-xs whitespace-nowrap',
                  isDone ? 'text-muted-foreground line-through' : isNext ? 'font-medium text-orange-700' : 'text-muted-foreground'
                )}>
                  {SHORT_LABELS[rec.stepType]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Badge variant="outline" className="text-xs ml-auto bg-white">
        {doneCount}/{neededSteps.length} erledigt
      </Badge>
    </div>
  );
}

function GlossaryTermsCard() {
  return (
    <Card className="bg-muted/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Relevante Begriffe
        </CardTitle>
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

function LernbereichLink() {
  return (
    <a
      href="/lernen/grundlagen#crisp-dm"
      className="text-sm text-primary hover:underline flex items-center gap-1"
    >
      <BookOpen className="h-3.5 w-3.5" />
      Mehr zu dieser Phase im Lernbereich →
    </a>
  );
}

// --- PrepPreviewTable (interactive data preview with sort, search, slider) ---

function PrepPreviewTable({
  dataSummary,
  fullPreview,
  fallbackPreview,
  previewCount,
  setPreviewCount,
  showAllRows,
  setShowAllRows,
  sortColumn,
  setSortColumn,
  sortDirection,
  setSortDirection,
  searchQuery,
  setSearchQuery,
}: {
  dataSummary: PreparedDataSummary | null;
  fullPreview: Record<string, unknown>[];
  fallbackPreview: Record<string, unknown>[];
  previewCount: number;
  setPreviewCount: (v: number) => void;
  showAllRows: boolean;
  setShowAllRows: (v: boolean) => void;
  sortColumn: string | null;
  setSortColumn: (v: string | null) => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (v: 'asc' | 'desc') => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}) {
  // Use full preview when available, fall back to the 5-row preview
  const rows = fullPreview.length > 0 ? fullPreview : fallbackPreview;
  const columns = dataSummary?.columnNames ?? [];

  // 1. Filter by search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(row =>
      columns.some(col =>
        String(row[col] ?? '').toLowerCase().includes(q)
      )
    );
  }, [rows, columns, searchQuery]);

  // 2. Sort
  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const va = a[sortColumn];
      const vb = b[sortColumn];
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDirection === 'asc' ? va - vb : vb - va;
      }
      const cmp = String(va).localeCompare(String(vb), 'de');
      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [filteredRows, sortColumn, sortDirection]);

  // 3. Slice to desired count
  const displayedRows = showAllRows
    ? sortedRows
    : sortedRows.slice(0, previewCount);

  const handleSort = (col: string) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ col }: { col: string }) => {
    if (sortColumn !== col) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/50" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="h-3 w-3 text-primary" />
      : <ChevronDown className="h-3 w-3 text-primary" />;
  };

  const needsScroll = showAllRows || previewCount > 25;

  if (!dataSummary || rows.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 rounded-full bg-muted w-fit">
            <Eye className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle>Noch keine Vorschau verfügbar</CardTitle>
          <p className="text-muted-foreground text-sm">
            Führe einen Pipeline-Schritt aus, um die Datenvorschau zu sehen.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Datenvorschau
          <span className="text-sm font-normal text-muted-foreground ml-1">
            · {displayedRows.length} von {rows.length} Zeilen
            {searchQuery.trim() && ` (gefiltert aus ${rows.length})`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative max-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Suche..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Row count slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Zeilen:</span>
            <Slider
              value={[previewCount]}
              onValueChange={([v]) => {
                setPreviewCount(v);
                if (showAllRows) setShowAllRows(false);
              }}
              min={10}
              max={100}
              step={10}
              disabled={showAllRows}
              className="w-24"
            />
            <Badge variant="outline" className="text-xs min-w-[3rem] text-center">
              {showAllRows ? 'Alle' : previewCount}
            </Badge>
          </div>

          {/* Show all toggle */}
          <div className="flex items-center gap-1.5">
            <Checkbox
              id="prep-show-all-rows"
              checked={showAllRows}
              onCheckedChange={(checked) => setShowAllRows(checked === true)}
            />
            <label htmlFor="prep-show-all-rows" className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
              Alle
            </label>
          </div>
        </div>

        {/* Table with scroll constraint when showing many rows */}
        <div className={cn(
          "overflow-x-auto",
          needsScroll && "max-h-[600px] overflow-y-auto"
        )}>
          <Table>
            <TableHeader>
              <TableRow>
                {/* Row number column */}
                <TableHead className="py-1.5 px-2 w-10 text-right sticky top-0 bg-white z-10">
                  <Hash className="h-3 w-3 text-muted-foreground inline" />
                </TableHead>
                {columns.map(col => {
                  const isNumeric = dataSummary.numericColumns.includes(col);
                  const isSorted = sortColumn === col;
                  return (
                    <TableHead
                      key={col}
                      className={`py-1.5 px-2 cursor-pointer select-none transition-colors hover:bg-muted/50 sticky top-0 bg-white z-10 ${isSorted ? 'bg-muted/30' : ''}`}
                      onClick={() => handleSort(col)}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-xs">{col}</span>
                          <SortIcon col={col} />
                        </div>
                        <Badge variant="outline" className="w-fit text-[10px] px-1 py-0">
                          {isNumeric ? 'num' : 'kat'}
                        </Badge>
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                    <Search className="h-5 w-5 mx-auto mb-2 opacity-50" />
                    Keine Zeilen gefunden.
                  </TableCell>
                </TableRow>
              ) : (
                displayedRows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="py-1 px-2 text-xs text-muted-foreground text-right w-10 font-mono">
                      {i + 1}
                    </TableCell>
                    {columns.map(col => {
                      const value = row[col];
                      const isMissing = value === null || value === undefined ||
                        (typeof value === 'number' && isNaN(value));
                      return (
                        <TableCell
                          key={col}
                          className={`py-1 px-2 text-xs font-mono ${isMissing ? 'bg-red-50 text-red-400' : ''}`}
                        >
                          {isMissing ? '–' : formatCellValue(value)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Missing values hint */}
        {rows.some(row => columns.some(col => {
          const v = row[col];
          return v === null || v === undefined || (typeof v === 'number' && isNaN(v));
        })) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3 shrink-0" />
            <span>
              Fehlende Werte sind <span className="bg-red-50 text-red-400 px-1 rounded">rot hervorgehoben</span>.
            </span>
          </div>
        )}
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
