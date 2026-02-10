// Data Preparation Phase – Pipeline Builder
import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Settings2, Plus, Trash2, Loader2, AlertTriangle,
  Code, Eye, ListOrdered, AlertCircle,
  Copy, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlossaryTermsCard } from '../shared/GlossaryTermsCard';
import { LernbereichLink } from '../shared/LernbereichLink';
import { DataPreviewTable } from '../shared/DataPreviewTable';
import { StepConfigForm } from './preparation/StepConfigForm';
import { RecommendedPathCard } from './preparation/RecommendedPathCard';
import { STEP_TYPE_CARDS } from './preparation/stepTypes';
import { DataPreparator } from '@/engine/data/DataPreparator';
import type { WorkspaceProject, PipelineStep, PipelineStepType, PreparedDataSummary } from '@/engine/types';
import { usePyodide } from '@/hooks/usePyodide';
import { useToast } from '@/hooks/use-toast';

interface DataPreparationProps {
  project: WorkspaceProject;
  onUpdateProject: (updates: Partial<WorkspaceProject>) => void;
}

type ViewState = 'no-data' | 'initializing' | 'ready' | 'applying-step' | 'error';

const GLOSSARY_TERMS = [
  { term: 'Feature Engineering', termId: 'feature-engineering' },
  { term: 'Imputation', termId: 'imputation' },
  { term: 'One-Hot Encoding', termId: 'one-hot-encoding' },
  { term: 'Normalisierung', termId: 'normalisierung' },
  { term: 'Train-Test-Split', termId: 'train-test-split' },
  { term: 'Ausreißer', termId: 'ausreisser' },
  { term: 'Skalierung', termId: 'standardisierung' },
];

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
        <GlossaryTermsCard terms={GLOSSARY_TERMS} />
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

            <GlossaryTermsCard terms={GLOSSARY_TERMS} />
            <LernbereichLink />
          </div>
        </TabsContent>

        {/* Tab 2: Datenvorschau */}
        <TabsContent value="vorschau">
          <DataPreviewTable
            data={fullPreview.length > 0 ? fullPreview : preview}
            columns={dataSummary?.columnNames ?? []}
            numericColumns={dataSummary?.numericColumns ?? []}
            checkboxId="prep-show-all-rows"
            emptyState={
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
            }
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
