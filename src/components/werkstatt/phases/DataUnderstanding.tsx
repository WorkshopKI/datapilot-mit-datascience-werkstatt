// Data Understanding Phase – CSV-Import + Analyse via Pyodide
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import {
  Database, Upload, FlaskConical,
  Info, Loader2, AlertTriangle, RefreshCw, SlidersHorizontal,
} from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';
import { GlossaryTermsCard } from '../shared/GlossaryTermsCard';
import { LernbereichLink } from '../shared/LernbereichLink';
import { getCorrelationColor } from '../shared/formatUtils';
import { DataPreviewTable } from '../shared/DataPreviewTable';
import { CorrelationHeatmap } from './understanding/CorrelationHeatmap';
import { StatisticsTables } from './understanding/StatisticsTables';
import { MissingValuesSummary, MissingValuesBars } from './understanding/MissingValuesCard';
import { DataImportZone } from '../DataImportZone';
import { usePyodide } from '@/hooks/usePyodide';
import { DataAnalyzer } from '@/engine/data/DataAnalyzer';
import { DataGenerator } from '@/engine/data/DataGenerator';
import type { DataAnalysisResult } from '@/engine/data/DataAnalyzer';
import type { WorkspaceProject } from '@/engine/types';
import { isExampleProject } from '@/engine/workspace/WorkspaceStorage';

interface DataUnderstandingProps {
  project: WorkspaceProject;
  onUpdateProject: (updates: Partial<WorkspaceProject>) => void;
}

type ViewState = 'no-data' | 'loading-pyodide' | 'analyzing' | 'ready' | 'error';

export function DataUnderstanding({ project, onUpdateProject }: DataUnderstandingProps) {
  const { isReady, isLoading, progress, progressMessage, initialize, error: pyodideError } = usePyodide();

  const [analysisResult, setAnalysisResult] = useState<DataAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [dataSourceLabel, setDataSourceLabel] = useState<string>('');
  const [genRowCount, setGenRowCount] = useState(300);
  const [genNoiseFactor, setGenNoiseFactor] = useState(0.1);

  const showSyntheticHint = isExampleProject(project.id) || project.hasDemoData;

  // Detect real dataset (Titanic/Iris) for auto-load
  const hasRealDataset = useMemo(
    () => isExampleProject(project.id) && DataGenerator.hasRealDataset(project.features),
    [project.id, project.features]
  );
  const autoLoadAttempted = useRef(false);

  // Determine current view state
  const viewState: ViewState = (() => {
    if (analysisError) return 'error';
    if (analysisResult) return 'ready';
    if (isAnalyzing) return 'analyzing';
    if (isLoading) return 'loading-pyodide';
    // Auto-load projects: show loading immediately, no "no-data" flash
    if (hasRealDataset && !project.dataSource && !autoLoadAttempted.current) return 'loading-pyodide';
    return 'no-data';
  })();

  const ensurePyodide = useCallback(async () => {
    if (!isReady) {
      await initialize();
    }
  }, [isReady, initialize]);

  // Auto-restore analysis when remounting with existing data
  const restorationAttempted = useRef(false);
  useEffect(() => {
    if (
      project.dataSource &&
      !analysisResult &&
      !isAnalyzing &&
      !analysisError &&
      !restorationAttempted.current
    ) {
      restorationAttempted.current = true;
      setIsAnalyzing(true);
      setDataSourceLabel(project.dataSource);

      const restore = async () => {
        try {
          await ensurePyodide();
          const result = await DataAnalyzer.analyzeExistingDataFrame();
          setAnalysisResult(result);
        } catch {
          setAnalysisError('Bitte Daten erneut laden.');
        } finally {
          setIsAnalyzing(false);
        }
      };
      restore();
    }
  }, [project.dataSource, analysisResult, isAnalyzing, analysisError, ensurePyodide]);

  // Auto-load real datasets (Titanic/Iris) on first visit
  useEffect(() => {
    if (
      hasRealDataset &&
      !project.dataSource &&
      !analysisResult &&
      !isAnalyzing &&
      !analysisError &&
      !autoLoadAttempted.current
    ) {
      autoLoadAttempted.current = true;
      const datasetLabel = DataGenerator.getRealDatasetLabel(project.features) ?? 'Kursdaten';
      setDataSourceLabel(datasetLabel);
      setIsAnalyzing(true);

      const loadRealData = async () => {
        try {
          await ensurePyodide();
          const generated = await DataGenerator.generate({
            type: project.type,
            rowCount: 99999,
            features: project.features,
            randomSeed: 42,
          });
          const result = await DataAnalyzer.analyzeDataFrame(generated.rows, generated.columns);
          setAnalysisResult(result);
          onUpdateProject({
            dataSource: datasetLabel,
            rowCount: result.rowCount,
            hasDemoData: true,
          });
        } catch (err) {
          setAnalysisError(err instanceof Error ? err.message : 'Unbekannter Fehler');
        } finally {
          setIsAnalyzing(false);
        }
      };
      loadRealData();
    }
  }, [hasRealDataset, project.dataSource, project.type, project.features,
      analysisResult, isAnalyzing, analysisError, ensurePyodide, onUpdateProject]);

  const handleCSVImport = useCallback(async (file: File) => {
    setAnalysisError(null);
    setIsAnalyzing(true);
    setDataSourceLabel(file.name);

    try {
      await ensurePyodide();
      const csvContent = await file.text();
      const result = await DataAnalyzer.analyzeCSV(csvContent);
      setAnalysisResult(result);
      onUpdateProject({
        dataSource: file.name,
        rowCount: result.rowCount,
      });
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setIsAnalyzing(false);
    }
  }, [ensurePyodide, onUpdateProject]);

  const handleSyntheticData = useCallback(async () => {
    setAnalysisError(null);
    setIsAnalyzing(true);
    const datasetLabel = DataGenerator.getRealDatasetLabel(project.features) ?? 'Synthetische Daten';
    setDataSourceLabel(datasetLabel);

    try {
      await ensurePyodide();
      const generated = await DataGenerator.generate({
        type: project.type,
        rowCount: hasRealDataset ? 99999 : genRowCount,
        features: project.features,
        noiseFactor: hasRealDataset ? undefined : genNoiseFactor,
        randomSeed: 42,
      });
      const result = await DataAnalyzer.analyzeDataFrame(generated.rows, generated.columns);
      setAnalysisResult(result);
      onUpdateProject({
        dataSource: datasetLabel,
        rowCount: result.rowCount,
        hasDemoData: true,
      });
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setIsAnalyzing(false);
    }
  }, [ensurePyodide, project.type, project.features, onUpdateProject, genRowCount, genNoiseFactor, hasRealDataset]);

  const handleReset = useCallback(() => {
    setAnalysisResult(null);
    setAnalysisError(null);
    setDataSourceLabel('');
  }, []);

  // --- Render: No Data ---
  if (viewState === 'no-data') {
    return (
      <div className="space-y-4">
        {/* Empfehlung für Beispielprojekte */}
        {hasRealDataset ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex gap-3">
              <Database className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800 mb-1">Echte Daten verfügbar</p>
                <p className="text-green-700">
                  Für dieses Kursprojekt stehen echte Daten bereit ({DataGenerator.getRealDatasetLabel(project.features)}). Klicke auf „Daten laden", um sie direkt zu analysieren.
                </p>
              </div>
            </div>
          </div>
        ) : showSyntheticHint ? (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex gap-3">
              <FlaskConical className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-1">Empfehlung: Synthetische Daten generieren</p>
                <p className="text-blue-700">
                  Für dieses Projekt kannst du passende Beispieldaten automatisch erzeugen lassen – ideal, um den kompletten CRISP-DM-Zyklus kennenzulernen.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Zwei Optionen */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* CSV-Import */}
          <Card className="hover:shadow-md hover:border-orange-200 transition-all">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50">
                  <Upload className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="font-semibold text-base">Eigene Daten importieren</p>
                  <p className="text-sm text-muted-foreground">
                    Lade eine CSV-Datei hoch, um deine eigenen Daten zu analysieren.
                  </p>
                </div>
              </div>
              <DataImportZone onImport={handleCSVImport} accept=".csv" />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3" />
                Daten bleiben lokal im Browser – kein Upload.
              </p>
            </CardContent>
          </Card>

          {/* Daten generieren / laden */}
          {hasRealDataset ? (
            <Card className="hover:shadow-md transition-all border-primary border-2">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-base">Kursdaten laden</p>
                    <Badge className="bg-primary text-primary-foreground">Empfohlen</Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {DataGenerator.getRealDatasetLabel(project.features)} – echte Daten für den CRISP-DM-Zyklus.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{project.type}</Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Echte Daten
                  </Badge>
                </div>
                <Button
                  onClick={handleSyntheticData}
                  className="w-full gap-2"
                >
                  <Database className="h-4 w-4" />
                  Daten laden
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className={`hover:shadow-md transition-all ${showSyntheticHint ? 'border-primary border-2' : 'hover:border-orange-200'}`}>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <FlaskConical className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-base">Synthetische Daten generieren</p>
                    {showSyntheticHint && (
                      <Badge className="bg-primary text-primary-foreground">Empfohlen</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Erzeuge realistische Beispieldaten passend zu deinem Projekttyp – ideal zum Lernen und Ausprobieren.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{project.type}</Badge>
                  <span className="text-xs text-muted-foreground">{genRowCount} Zeilen</span>
                </div>

                {/* Konfiguration */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <SlidersHorizontal className="h-4 w-4" />
                    Daten konfigurieren
                  </div>

                  {/* Anzahl Datensätze */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-muted-foreground">Anzahl Datensätze</label>
                      <Badge variant="outline">{genRowCount}</Badge>
                    </div>
                    <Slider
                      value={[genRowCount]}
                      onValueChange={([v]) => setGenRowCount(v)}
                      min={100}
                      max={2000}
                      step={100}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>100</span>
                      <span>2000</span>
                    </div>
                  </div>

                  {/* Rauschfaktor */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm text-muted-foreground">Rauschfaktor</label>
                      <Badge variant="outline">{genNoiseFactor.toFixed(2)}</Badge>
                    </div>
                    <Slider
                      value={[genNoiseFactor * 100]}
                      onValueChange={([v]) => setGenNoiseFactor(v / 100)}
                      min={0}
                      max={50}
                      step={5}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0.00</span>
                      <span>0.50</span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3 shrink-0" />
                      Mehr Rauschen = schwierigere Daten für dein Modell
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleSyntheticData}
                  className="w-full gap-2"
                >
                  <FlaskConical className="h-4 w-4" />
                  Daten generieren
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Relevante Begriffe inline */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="font-medium">Relevante Begriffe:</span>
          <GlossaryLink term="Deskriptive Statistik" termId="mittelwert" />
          <span>·</span>
          <GlossaryLink term="Fehlende Werte" termId="fehlende-werte" />
          <span>·</span>
          <GlossaryLink term="Ausreißer" termId="ausreisser" />
          <span>·</span>
          <GlossaryLink term="Korrelation" />
          <span>·</span>
          <GlossaryLink term="Verteilung" termId="normalverteilung" />
        </div>
      </div>
    );
  }

  // --- Render: Loading Pyodide ---
  if (viewState === 'loading-pyodide') {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <FlaskConical className="h-12 w-12 text-orange-500 animate-pulse mx-auto" />
          <h3 className="font-semibold text-lg">ML-Engine wird geladen...</h3>
          <Progress value={progress} className="max-w-md mx-auto" />
          <p className="text-sm text-muted-foreground">{progressMessage || 'Bitte warten...'}</p>
          {pyodideError && (
            <p className="text-sm text-red-600">{pyodideError}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // --- Render: Analyzing ---
  if (viewState === 'analyzing') {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-4">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin mx-auto" />
          <h3 className="font-semibold text-lg">Daten werden analysiert...</h3>
          <p className="text-sm text-muted-foreground">
            {dataSourceLabel ? `Quelle: ${dataSourceLabel}` : 'Bitte warten...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // --- Render: Error ---
  if (viewState === 'error') {
    return (
      <Card className="border-red-200">
        <CardContent className="py-8 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto" />
          <h3 className="font-semibold text-lg text-red-700">Analyse fehlgeschlagen</h3>
          <p className="text-sm text-red-600 max-w-md mx-auto">{analysisError}</p>
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    );
  }

  // --- Render: Ready (analysis result available) ---
  const result = analysisResult!;

  return (
    <div className="space-y-4">
      {/* Header with data source info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-orange-500" />
          <span className="font-medium">{dataSourceLabel}</span>
          <Badge variant="secondary">{result.rowCount} Zeilen</Badge>
          <Badge variant="secondary">{result.columnCount} Spalten</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="gap-1 text-muted-foreground">
          <RefreshCw className="h-3 w-3" />
          Andere Daten
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="uebersicht">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="uebersicht">Übersicht</TabsTrigger>
          <TabsTrigger value="vorschau">Datenvorschau</TabsTrigger>
          <TabsTrigger value="statistiken">Statistiken</TabsTrigger>
          <TabsTrigger value="korrelationen">Korrelationen</TabsTrigger>
        </TabsList>

        {/* Tab 1: Übersicht */}
        <TabsContent value="uebersicht">
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{result.rowCount}</div>
                    <div className="text-sm text-muted-foreground">Zeilen</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{result.columnCount}</div>
                    <div className="text-sm text-muted-foreground">Spalten</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{result.numericColumns.length}</div>
                    <div className="text-sm text-muted-foreground">Numerisch</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{result.categoricalColumns.length}</div>
                    <div className="text-sm text-muted-foreground">Kategorial</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Missing values summary */}
            <MissingValuesSummary columns={result.columns} />

          </div>
        </TabsContent>

        {/* Tab 2: Datenvorschau */}
        <TabsContent value="vorschau">
          <DataPreviewTable
            data={result.preview}
            columns={result.columnNames}
            numericColumns={result.numericColumns}
            getColumnBadge={(col, isNumeric) => {
              if (isNumeric) return 'num';
              const colInfo = result.columns.find(c => c.name === col);
              return colInfo?.dtype === 'object' ? 'text' : colInfo?.dtype ?? '?';
            }}
            hasMissingValues={result.columns.some(c => c.missing > 0)}
            checkboxId="du-show-all-rows"
          />
        </TabsContent>

        {/* Tab 3: Statistiken */}
        <TabsContent value="statistiken">
          <div className="space-y-4">
            <StatisticsTables
              columns={result.columns}
              numericColumns={result.numericColumns}
              categoricalColumns={result.categoricalColumns}
            />
            <MissingValuesBars columns={result.columns} />
          </div>
        </TabsContent>

        {/* Tab 4: Korrelationen */}
        <TabsContent value="korrelationen">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <GlossaryLink term="Korrelation">Korrelationsmatrix</GlossaryLink>
              </h3>

              {/* Methoden-Erklärung */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800 mb-1">
                      Methode: <GlossaryLink term="Korrelation (Pearson)" termId="korrelation-statistik">Pearson-Korrelation</GlossaryLink>
                    </p>
                    <p className="text-orange-700">
                      Die Werte zeigen die Stärke des <strong>linearen</strong> Zusammenhangs
                      zwischen zwei Variablen – von -1 (perfekt gegenläufig) über 0 (kein Zusammenhang)
                      bis +1 (perfekt gleichläufig).
                    </p>
                  </div>
                </div>
              </div>

              {result.numericColumns.length < 2 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                  <Info className="h-4 w-4 inline mr-2" />
                  Es müssen mindestens 2 numerische Spalten vorhanden sein, um eine Korrelationsmatrix zu berechnen.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <CorrelationHeatmap
                      correlations={result.correlations}
                      columns={result.numericColumns}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: getCorrelationColor(-1) }} />
                      <span>-1 (negativ)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: getCorrelationColor(0) }} />
                      <span>0 (keine)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: getCorrelationColor(1) }} />
                      <span>+1 (positiv)</span>
                    </div>
                  </div>

                  {/* Interpretationshilfe */}
                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                    <span><strong>|r| &gt; 0.7</strong> → stark</span>
                    <span><strong>0.3 – 0.7</strong> → mittel</span>
                    <span><strong>&lt; 0.3</strong> → schwach</span>
                  </div>

                  {/* Kausalitäts-Warnung */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
                    <div className="flex gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        <strong>Achtung:</strong> Korrelation ≠ Kausalität – ein hoher Wert bedeutet
                        nicht, dass eine Variable die andere <em>verursacht</em>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Relevante Begriffe (Pattern 11) */}
      <GlossaryTermsCard terms={[
        { term: 'Explorative Datenanalyse', termId: 'eda' },
        { term: 'Deskriptive Statistik', termId: 'mittelwert' },
        { term: 'Fehlende Werte', termId: 'fehlende-werte' },
        { term: 'Ausreißer', termId: 'ausreisser' },
        { term: 'Korrelation' },
        { term: 'Verteilung', termId: 'normalverteilung' },
      ]} />

      {/* Lernbereich-Link (Pattern 12) */}
      <LernbereichLink />
    </div>
  );
}
