// Data Understanding Phase – CSV-Import + Analyse via Pyodide
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Database, Upload, FlaskConical, BarChart3,
  Info, Loader2, AlertTriangle, RefreshCw, BookOpen, SlidersHorizontal,
  ArrowUpDown, ChevronUp, ChevronDown, Search, Hash,
} from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';
import { GlossaryTermsCard } from '../shared/GlossaryTermsCard';
import { LernbereichLink } from '../shared/LernbereichLink';
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

  // Data preview table state
  const [previewCount, setPreviewCount] = useState(10);
  const [showAllRows, setShowAllRows] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

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
        {/* Didaktischer Einstieg */}
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-orange-800 mb-1">Was passiert in dieser Phase?</p>
              <p className="text-orange-700">
                Du führst eine{' '}
                <GlossaryLink term="Explorative Datenanalyse" termId="eda">explorative Datenanalyse (EDA)</GlossaryLink>{' '}
                durch: Datentypen prüfen,{' '}
                <GlossaryLink term="Verteilung" termId="normalverteilung">Verteilungen</GlossaryLink>{' '}
                anschauen,{' '}
                <GlossaryLink term="Korrelation">Korrelationen</GlossaryLink>{' '}
                untersuchen und die Datenqualität bewerten.
              </p>
            </div>
          </div>
        </div>

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
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50">
                  <Upload className="h-5 w-5 text-orange-500" />
                </div>
                <CardTitle className="text-base">Eigene Daten importieren</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Lade eine CSV-Datei hoch, um deine eigenen Daten zu analysieren.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
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
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-50">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <CardTitle className="text-base">Kursdaten laden</CardTitle>
                  <Badge className="bg-primary text-primary-foreground">Empfohlen</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {DataGenerator.getRealDatasetLabel(project.features)} – echte Daten für den CRISP-DM-Zyklus.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
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
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-50">
                    <FlaskConical className="h-5 w-5 text-orange-500" />
                  </div>
                  <CardTitle className="text-base">Synthetische Daten generieren</CardTitle>
                  {showSyntheticHint && (
                    <Badge className="bg-primary text-primary-foreground">Empfohlen</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Erzeuge realistische Beispieldaten passend zu deinem Projekttyp – ideal zum Lernen und Ausprobieren.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
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
  const totalMissing = result.columns.reduce((sum, col) => sum + col.missing, 0);
  const columnsWithMissing = result.columns.filter(c => c.missing > 0).length;

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
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <GlossaryLink term="Fehlende Werte" termId="fehlende-werte" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                {totalMissing === 0 ? (
                  <p className="text-green-700 bg-green-50 border border-green-200 rounded-xl p-3 text-sm">
                    Keine fehlenden Werte gefunden – der Datensatz ist vollständig.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm">
                      {totalMissing} fehlende Werte in {columnsWithMissing} Spalte{columnsWithMissing > 1 ? 'n' : ''} gefunden.
                    </p>
                    {result.columns
                      .filter(c => c.missing > 0)
                      .sort((a, b) => b.missingPercent - a.missingPercent)
                      .map(col => (
                        <div key={col.name} className="flex items-center gap-3">
                          <span className="text-sm w-32 truncate font-mono">{col.name}</span>
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getMissingBarColor(col.missingPercent)}`}
                              style={{ width: `${Math.max(col.missingPercent, 2)}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-16 text-right">
                            {col.missingPercent.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tutor tip */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800 mb-1">Tipp: Datenverständnis</p>
                  <p className="text-orange-700">
                    In dieser Phase geht es darum, die Daten zu verstehen. Schau dir die{' '}
                    <GlossaryLink term="Deskriptive Statistik" termId="mittelwert">deskriptive Statistik</GlossaryLink>{' '}
                    an, prüfe auf <GlossaryLink term="Fehlende Werte" termId="fehlende-werte">fehlende Werte</GlossaryLink>{' '}
                    und <GlossaryLink term="Ausreißer" termId="ausreisser">Ausreißer</GlossaryLink>, und untersuche die{' '}
                    <GlossaryLink term="Korrelation">Korrelationen</GlossaryLink> zwischen den Features.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Datenvorschau */}
        <TabsContent value="vorschau">
          <DataPreviewTable
            result={result}
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

        {/* Tab 3: Statistiken */}
        <TabsContent value="statistiken">
          <div className="space-y-4">
            {/* Numeric columns */}
            {result.numericColumns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Numerische Spalten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Spalte</TableHead>
                          <TableHead className="text-right">Anzahl</TableHead>
                          <TableHead className="text-right">Fehlend</TableHead>
                          <TableHead className="text-right">
                            <GlossaryLink term="Mittelwert">Mittelwert</GlossaryLink>
                          </TableHead>
                          <TableHead className="text-right">
                            <GlossaryLink term="Standardabweichung">Std</GlossaryLink>
                          </TableHead>
                          <TableHead className="text-right">Min</TableHead>
                          <TableHead className="text-right">
                            <GlossaryLink term="Median" termId="median">Q50</GlossaryLink>
                          </TableHead>
                          <TableHead className="text-right">Max</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.columns
                          .filter(c => result.numericColumns.includes(c.name))
                          .map(col => (
                            <TableRow key={col.name}>
                              <TableCell className="font-mono font-medium">{col.name}</TableCell>
                              <TableCell className="text-right">{col.count}</TableCell>
                              <TableCell className="text-right">
                                <span className={col.missing > 0 ? 'text-amber-600 font-medium' : ''}>
                                  {col.missingPercent.toFixed(1)}%
                                </span>
                              </TableCell>
                              <TableCell className="text-right font-mono">{formatNumber(col.mean)}</TableCell>
                              <TableCell className="text-right font-mono">{formatNumber(col.std)}</TableCell>
                              <TableCell className="text-right font-mono">{formatNumber(col.min)}</TableCell>
                              <TableCell className="text-right font-mono">{formatNumber(col.q50)}</TableCell>
                              <TableCell className="text-right font-mono">{formatNumber(col.max)}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categorical columns */}
            {result.categoricalColumns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Kategoriale Spalten</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Spalte</TableHead>
                          <TableHead className="text-right">Anzahl</TableHead>
                          <TableHead className="text-right">Fehlend</TableHead>
                          <TableHead className="text-right">Eindeutige</TableHead>
                          <TableHead>Häufigster Wert</TableHead>
                          <TableHead className="text-right">Häufigkeit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.columns
                          .filter(c => result.categoricalColumns.includes(c.name))
                          .map(col => (
                            <TableRow key={col.name}>
                              <TableCell className="font-mono font-medium">{col.name}</TableCell>
                              <TableCell className="text-right">{col.count}</TableCell>
                              <TableCell className="text-right">
                                <span className={col.missing > 0 ? 'text-amber-600 font-medium' : ''}>
                                  {col.missingPercent.toFixed(1)}%
                                </span>
                              </TableCell>
                              <TableCell className="text-right">{col.unique}</TableCell>
                              <TableCell className="font-mono">{col.topValue ?? '–'}</TableCell>
                              <TableCell className="text-right">{col.topFrequency ?? '–'}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Missing values bars */}
            {result.columns.some(c => c.missing > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Fehlende Werte pro Spalte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.columns
                    .sort((a, b) => b.missingPercent - a.missingPercent)
                    .map(col => (
                      <div key={col.name} className="flex items-center gap-3">
                        <span className="text-sm w-36 truncate font-mono">{col.name}</span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${getMissingBarColor(col.missingPercent)}`}
                            style={{ width: `${Math.max(col.missingPercent, col.missing > 0 ? 2 : 0)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          {col.missing} ({col.missingPercent.toFixed(1)}%)
                        </span>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab 4: Korrelationen */}
        <TabsContent value="korrelationen">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GlossaryLink term="Korrelation">Korrelationsmatrix</GlossaryLink>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Methoden-Erklärung */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
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

// --- DataPreviewTable (interactive data preview with sort, search, slider) ---

function DataPreviewTable({
  result,
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
  result: DataAnalysisResult;
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
  // 1. Filter by search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return result.preview;
    const q = searchQuery.toLowerCase();
    return result.preview.filter(row =>
      result.columnNames.some(col =>
        String(row[col] ?? '').toLowerCase().includes(q)
      )
    );
  }, [result.preview, result.columnNames, searchQuery]);

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

  const hasMissingValues = result.columns.some(c => c.missing > 0);
  const needsScroll = showAllRows || previewCount > 25;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Datenvorschau
          <span className="text-sm font-normal text-muted-foreground ml-1">
            · {displayedRows.length} von {result.preview.length} Zeilen
            {searchQuery.trim() && ` (gefiltert aus ${result.preview.length})`}
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
              id="show-all-rows"
              checked={showAllRows}
              onCheckedChange={(checked) => setShowAllRows(checked === true)}
            />
            <label htmlFor="show-all-rows" className="text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
              Alle
            </label>
          </div>
        </div>

        {/* Table with scroll constraint when showing all rows */}
        <div className={cn(
          "overflow-x-auto",
          needsScroll && "max-h-[600px] overflow-y-auto"
        )}>
          <DataTable
            result={result}
            displayedRows={displayedRows}
            sortColumn={sortColumn}
            handleSort={handleSort}
            SortIcon={SortIcon}
          />
        </div>

        {/* Missing values hint */}
        {hasMissingValues && (
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

// --- DataTable (inner table component) ---

function DataTable({
  result,
  displayedRows,
  sortColumn,
  handleSort,
  SortIcon,
}: {
  result: DataAnalysisResult;
  displayedRows: Record<string, unknown>[];
  sortColumn: string | null;
  handleSort: (col: string) => void;
  SortIcon: React.ComponentType<{ col: string }>;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {/* Row number column */}
          <TableHead className="py-1.5 px-2 w-10 text-right sticky top-0 bg-white z-10">
            <Hash className="h-3 w-3 text-muted-foreground inline" />
          </TableHead>
          {result.columnNames.map(col => {
            const colInfo = result.columns.find(c => c.name === col);
            const isNumeric = result.numericColumns.includes(col);
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
                    {isNumeric ? 'num' : colInfo?.dtype === 'object' ? 'text' : colInfo?.dtype ?? '?'}
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
            <TableCell colSpan={result.columnNames.length + 1} className="text-center py-8 text-muted-foreground">
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
              {result.columnNames.map(col => {
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
  );
}

// --- Correlation Heatmap (pure CSS grid) ---

function CorrelationHeatmap({
  correlations,
  columns,
}: {
  correlations: Record<string, Record<string, number>>;
  columns: string[];
}) {
  const size = columns.length;

  return (
    <div
      className="inline-grid gap-px"
      style={{
        gridTemplateColumns: `auto repeat(${size}, minmax(3rem, 1fr))`,
        gridTemplateRows: `auto repeat(${size}, minmax(2.5rem, 1fr))`,
      }}
    >
      {/* Top-left empty cell */}
      <div />
      {/* Column headers */}
      {columns.map(col => (
        <div
          key={`h-${col}`}
          className="text-xs font-mono text-center truncate px-1 flex items-end justify-center pb-1"
          title={col}
        >
          {col.length > 8 ? col.slice(0, 7) + '…' : col}
        </div>
      ))}
      {/* Rows */}
      {columns.map((rowCol, rowIdx) => (
        <>
          {/* Row label */}
          <div
            key={`r-${rowCol}`}
            className="text-xs font-mono truncate pr-2 flex items-center justify-end"
            title={rowCol}
          >
            {rowCol.length > 10 ? rowCol.slice(0, 9) + '…' : rowCol}
          </div>
          {/* Cells */}
          {columns.map((colCol, colIdx) => {
            // Upper triangle: empty cell
            if (colIdx > rowIdx) {
              return <div key={`${rowCol}-${colCol}`} />;
            }

            // Diagonal: dimmed self-correlation
            if (colIdx === rowIdx) {
              return (
                <div
                  key={`${rowCol}-${colCol}`}
                  className="flex items-center justify-center rounded text-xs font-mono bg-muted text-muted-foreground"
                  title={`${rowCol}: Selbstkorrelation`}
                >
                  1.00
                </div>
              );
            }

            // Lower triangle: normal colored cell
            const value = correlations[rowCol]?.[colCol] ?? 0;
            return (
              <div
                key={`${rowCol}-${colCol}`}
                className="flex items-center justify-center rounded text-xs font-mono cursor-default"
                style={{ backgroundColor: getCorrelationColor(value) }}
                title={`${rowCol} × ${colCol}: ${value.toFixed(4)}`}
              >
                <span className={Math.abs(value) > 0.5 ? 'text-white' : 'text-gray-700'}>
                  {value.toFixed(2)}
                </span>
              </div>
            );
          })}
        </>
      ))}
    </div>
  );
}

// --- Helpers ---

function getCorrelationColor(value: number): string {
  // -1 → red, 0 → white/gray, +1 → blue
  const clamped = Math.max(-1, Math.min(1, value));
  if (clamped >= 0) {
    // 0→white, 1→blue
    const intensity = Math.round(clamped * 200);
    return `rgb(${220 - intensity}, ${220 - intensity * 0.5}, 255)`;
  }
  // -1→red, 0→white
  const intensity = Math.round(Math.abs(clamped) * 200);
  return `rgb(255, ${220 - intensity * 0.7}, ${220 - intensity})`;
}

function getMissingBarColor(percent: number): string {
  if (percent === 0) return 'bg-green-400';
  if (percent <= 10) return 'bg-amber-400';
  if (percent <= 50) return 'bg-orange-500';
  return 'bg-red-500';
}

function formatNumber(value: number | undefined): string {
  if (value === undefined || value === null) return '–';
  if (Math.abs(value) >= 1000) return value.toLocaleString('de-DE', { maximumFractionDigits: 2 });
  return value.toFixed(4);
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return '–';
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toString();
    return value.toFixed(4);
  }
  return String(value);
}
