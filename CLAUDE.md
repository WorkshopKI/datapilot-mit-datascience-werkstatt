# CLAUDE.md – DS Werkstatt Projekt

> Diese Datei wird automatisch von Claude Code gelesen. Sie enthält alle Konventionen,
> Architektur-Entscheidungen und den Feature-Plan für das Projekt.
> **Zuletzt aktualisiert:** 2026-02-08 – Design System & UI/UX Patterns, Zuständigkeitsregeln aktualisiert.

---

## Projektübersicht

Dies ist die **DataPilot** App – eine interaktive Data Science Lern-App (React + TypeScript + Vite + Tailwind CSS), gehostet über Lovable. Die App enthält bereits umfangreiche Lern-Inhalte, Challenge Cards, ein Quiz und einen großen **Begriffe & Übersetzungen**-Bereich (Glossar mit 100+ Data-Science-Begriffen).

Der neue Hauptbereich **DS Werkstatt** ermöglicht es Lernenden, den kompletten CRISP-DM-Zyklus im Browser durchzuführen – mit synthetischen oder eigenen Daten, vollständig lokal via Pyodide (Python/sklearn im Browser).

Die DS Werkstatt nutzt das bestehende Glossar aktiv: Fachbegriffe in Tutor-Tipps und Phasen-Erklärungen sind als klickbare Links zum Glossar implementiert (`GlossaryLink`-Komponente).

**App-Name:** DataPilot (ehemals „DS PM Tutor")
**Zielgruppe:** Data Science Einsteiger, Workshop-Teilnehmer, Studierende
**Sprache:** Alle UI-Texte, Kommentare und Variablennamen in UI-Komponenten auf Deutsch. Code-Interfaces und Engine-Internals auf Englisch.
**Betreiber:** Thomas – entwickelt DS-Lern-Tools für Workshops und Schulungen.

---

## Tech-Stack

```
Framework:      React 18 + TypeScript
Build:          Vite
Styling:        Tailwind CSS
UI-Basis:       shadcn/ui
Icons:          Lucide React
State:          React Hooks + LocalStorage (kein Redux, kein Zustand)
ML-Engine:      Pyodide (CPython via WebAssembly) mit sklearn, pandas, numpy
Testing:        Vitest + jsdom + @testing-library
Auth (optional): Supabase Auth (Magic Link, kein Google/Social)
DB (optional):  Supabase Postgres (nur wenn User Sync aktiviert)
```

---

## Bestehende App-Struktur (DataPilot)

Die DataPilot App hat bereits diese Bereiche – NICHT verändern:

```
DataPilot
├── Lernen              ← CRISP-DM Theorie, Lektionen
├── Üben                ← Challenge Cards, Quiz
├── KI-Assistenten      ← Tutor + Copilot Startrampen
├── Planen              ← Projekt planen, Checkliste
├── Im Projekt          ← Meeting, Stakeholder, ROI
├── Nachschlagen        ← Begriffe & Übersetzungen (100+ Glossar-Einträge)
└── DS Werkstatt        ← CRISP-DM Zyklus im Browser (NEU)
```

Der Glossar ist besonders wertvoll: Er enthält fast alle Begriffe die in der DS Werkstatt vorkommen. Die `GlossaryLink`-Komponente verknüpft Fachbegriffe in der Werkstatt direkt mit den Glossar-Einträgen.

---

## Ordnerstruktur & Zuständigkeiten (tatsächlich)

```
src/
├── components/              ← ⚠️ Lovable-Domäne (Ausnahmen: werkstatt/phases/)
│   ├── ui/                  ← shadcn/ui Basis-Komponenten
│   ├── layout/              ← Navigation, Sidebar, Bottom-Nav
│   ├── lernen/              ← Lern-Inhalte
│   ├── nachschlagen/        ← Begriffe & Übersetzungen (Glossar)
│   └── werkstatt/           ← DS Werkstatt UI-Shells
│       ├── OnboardingScreen.tsx
│       ├── ProjectList.tsx
│       ├── ProjectCard.tsx
│       ├── NewProjectWizard.tsx
│       ├── DataImportZone.tsx
│       ├── CrispDmStepper.tsx
│       ├── CrispDmPhaseWrapper.tsx
│       ├── GlossaryLink.tsx     ← Wiederverwendbare Glossar-Link-Komponente
│       ├── ExportModal.tsx
│       ├── WorkspaceStatusBar.tsx
│       └── phases/              ← UI für CRISP-DM Phasen
│           ├── BusinessUnderstanding.tsx
│           ├── DataUnderstanding.tsx
│           ├── DataPreparation.tsx
│           ├── Modeling.tsx
│           ├── Evaluation.tsx
│           └── Deployment.tsx
│
├── engine/                  ← ✅ CLAUDE CODE DOMÄNE
│   ├── types.ts             ← Shared Interfaces (Vertrag mit UI)
│   ├── workspace/           ← Storage, Export/Import, Hashing
│   │   ├── WorkspaceStorage.ts   ← LocalStorage CRUD (implementiert)
│   │   ├── WorkspaceExporter.ts  ← .datapilot Export/Import mit Validierung
│   │   ├── hashUtils.ts          ← SHA-256 Hash (String + File)
│   │   └── __tests__/            ← Unit Tests
│   │       ├── WorkspaceStorage.test.ts
│   │       ├── WorkspaceExporter.test.ts
│   │       └── hashUtils.test.ts
│   ├── data/                ← Datengeneratoren + Analyse + Preparation + Synthetic Twin
│   │   ├── DataGenerator.ts      ← Synthetische Daten via Pyodide (sklearn)
│   │   ├── DataAnalyzer.ts       ← CSV-Parsing + Analyse via Pyodide (pandas)
│   │   ├── DataPreparator.ts     ← Pipeline-Engine: Code-Builder + Step-Execution
│   │   ├── SyntheticTwinGenerator.ts ← Gaussian Copula + KS-Test via Pyodide (Feature 8)
│   │   └── __tests__/
│   │       ├── DataGenerator.test.ts
│   │       ├── DataAnalyzer.test.ts
│   │       ├── DataPreparator.test.ts
│   │       └── SyntheticTwinGenerator.test.ts
│   ├── modeling/            ← ML-Training + Evaluation (Feature 6)
│   │   ├── ModelTrainer.ts       ← Training + Metriken via Pyodide
│   │   └── __tests__/
│   │       └── ModelTrainer.test.ts
│   ├── deployment/          ← Prediction + Code-Export (Feature 7)
│   │   ├── ModelDeployer.ts      ← Predict, Script/Notebook Export, Download
│   │   └── __tests__/
│   │       └── ModelDeployer.test.ts
│   ├── pyodide/             ← Pyodide WebWorker (implementiert)
│   │   ├── messageTypes.ts       ← Typisiertes Message-Protokoll
│   │   ├── pyodide.worker.ts     ← Worker-Script (lädt Pyodide von CDN)
│   │   ├── PyodideManager.ts     ← Main-Thread Singleton (Promise-API)
│   │   ├── PyodideWorker.ts      ← Re-Exports für Backward-Compat
│   │   └── __tests__/
│   │       └── PyodideManager.test.ts
│   └── tutor/               ← Lern-Guidance pro CRISP-DM Phase
│       └── TutorService.ts       ← Phasen-Hinweise + Glossar-Term-Referenzen
│
├── hooks/                   ← ⚠️ VORSICHTIG (geteilt)
│   ├── useWorkspace.ts      ← Workspace CRUD + Export/Import Hook
│   ├── usePyodide.ts        ← Pyodide Status, Progress, runPython Hook
│   ├── useProject.ts        ← Einzelprojekt + Phasen-Navigation + Tutor
│   ├── useCanvasState.ts    ← Bestehend, nicht anfassen
│   ├── useChallengeProgress.ts ← Bestehend, nicht anfassen
│   ├── useProgress.ts       ← Bestehend, nicht anfassen
│   ├── useScrollSpy.ts      ← Bestehend, nicht anfassen
│   ├── use-mobile.tsx       ← Bestehend, nicht anfassen
│   └── use-toast.ts         ← Bestehend, nicht anfassen
│
├── pages/
│   ├── werkstatt/
│   │   ├── WerkstattPage.tsx    ← Hauptseite (Onboarding oder Projektliste)
│   │   ├── ProjectPage.tsx      ← Einzelprojekt mit CRISP-DM Stepper
│   │   └── NewProjectPage.tsx   ← Neues Projekt erstellen
│   └── ...                  ← Bestehende Seiten nicht anfassen
│
├── test/
│   └── setup.ts             ← Vitest Setup (jsdom, matchMedia Mock)
│
└── types/
    └── index.ts             ← Re-Export aus engine/types.ts
```

### Regeln

1. **`components/ui/`, `components/layout/`, `components/lernen/`, `components/nachschlagen/`** gehören Lovable. Claude Code darf diese Dateien NICHT ändern.
2. **`components/werkstatt/phases/`** darf Claude Code erstellen und anpassen – alle 6 Phasen-Komponenten wurden von Claude Code geschrieben.
3. **`components/werkstatt/*.tsx`** (außer `phases/`) ist geteilt. Änderungen nur nach Absprache mit Thomas.
4. **`engine/`** gehört Claude Code. Hier wird die gesamte Logik implementiert.
5. **`hooks/useWorkspace.ts`**, **`hooks/usePyodide.ts`**, **`hooks/useProject.ts`** darf Claude Code implementieren und anpassen.
6. **Bestehende Hooks** (`useCanvasState`, `useChallengeProgress`, `useProgress`, `useScrollSpy`, `use-mobile`, `use-toast`) NICHT anfassen.
7. **`engine/types.ts`** ist der Vertrag. Änderungen hier erfordern Koordination mit Lovable. Vor Änderungen Thomas fragen.
8. **Neue Dateien** im `engine/`-Ordner können jederzeit erstellt werden.
9. **Neue npm-Pakete** dürfen installiert werden. Erwähne kurz was und warum.
10. **Bestehende DataPilot-Bereiche** (Lernen, Üben, Nachschlagen) NIEMALS anfassen.

---

## Tatsächliche Interfaces (engine/types.ts)

### Core Types

```typescript
type CrispDmPhaseId =
  | 'business-understanding'
  | 'data-understanding'
  | 'data-preparation'
  | 'modeling'
  | 'evaluation'
  | 'deployment';

interface CrispDmPhase {
  id: CrispDmPhaseId;
  name: string;
  shortName: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: string;
}

type ProjectType = 'klassifikation' | 'regression' | 'clustering';

interface Feature {
  id: string;
  name: string;
  type: 'numerisch' | 'kategorial' | 'text' | 'datum';
  description: string;
  isTarget?: boolean;
}

interface WorkspaceProject {
  id: string;
  name: string;
  description: string;
  type: ProjectType;
  createdAt: string;
  updatedAt: string;
  currentPhase: CrispDmPhaseId;
  phases: CrispDmPhase[];
  features: Feature[];
  businessGoal?: string;
  successCriteria?: string;
  dataSource?: string;
  rowCount?: number;
  hasDemoData?: boolean;
}

interface WorkspaceState {
  onboardingDone: boolean;
  mode: 'local' | 'sync';
  projects: WorkspaceProject[];
  activeProjectId?: string;
}

type ExportMode = 'reference' | 'embedded' | 'synthetic-twin';

interface ExportData {
  version: string;
  exportedAt: string;
  project: WorkspaceProject;
  hash?: string;
  exportMode: ExportMode;
  encrypted: boolean;
  fileManifest?: FileManifest;
}

interface FileManifest {
  fileName: string;
  fileSize: number;
  fileHash: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
}
```

### Noch fehlende Interfaces (werden bei späteren Features ergänzt)

- `DataSourceConfig` – wird bei Feature 2 (Pyodide WebWorker) ergänzt
- `PipelineStep` – ✅ implementiert in Feature 5
- `TrainedModel` – ✅ implementiert in Feature 6
- `ModelMetrics` – ✅ implementiert in Feature 6
- `AlgorithmType`, `AlgorithmConfig`, `FeatureImportance` – ✅ implementiert in Feature 6
- `SyntheticTwinConfig`, `SyntheticTwinValidation`, `SyntheticTwinData` – ✅ implementiert in Feature 8

### Aktuell implementierte Engine-Module

```typescript
// engine/workspace/hashUtils.ts
generateHash(data: string): Promise<string>        // SHA-256 Hex-String
verifyHash(data: string, expected: string): Promise<boolean>
computeFileHash(file: File): Promise<string>        // SHA-256 über File API

// engine/workspace/WorkspaceStorage.ts (statische Klasse)
WorkspaceStorage.getProjects(): WorkspaceProject[]
WorkspaceStorage.createProject(data): WorkspaceProject
WorkspaceStorage.updateProject(id, updates): WorkspaceProject | undefined
WorkspaceStorage.deleteProject(id): boolean
WorkspaceStorage.updatePhaseStatus(projectId, phaseId, status): void
WorkspaceStorage.initializeWithDemo(): void
WorkspaceStorage.getState(): WorkspaceState
WorkspaceStorage.clear(): void

// engine/workspace/WorkspaceExporter.ts (statische Klasse)
WorkspaceExporter.exportProject(project, exportMode?): Promise<ExportData>
WorkspaceExporter.exportToFile(project, exportMode?): Promise<void>  // Download .datapilot
WorkspaceExporter.importFromFile(file): Promise<WorkspaceProject>    // Validiert + importiert
WorkspaceExporter.validateFile(file): Promise<ImportValidationResult>

// engine/data/DataGenerator.ts (Synthetische Daten via Pyodide)
DataGenerator.generate(config): GeneratedDataset
DataGenerator.getPreviewData(projectType): GeneratedDataset

// engine/data/DataAnalyzer.ts (CSV-Parsing + Analyse via Pyodide)
DataAnalyzer.analyzeCSV(csvContent): Promise<DataAnalysisResult>
DataAnalyzer.analyzeDataFrame(rows, columns): Promise<DataAnalysisResult>
DataAnalyzer.buildAnalyzeCSVCode(csvContent): string
DataAnalyzer.buildAnalyzeDataFrameCode(dataJson, columns): string

// engine/data/DataPreparator.ts (Pipeline-Engine via Pyodide)
DataPreparator.initializePipeline(): Promise<PreparedDataSummary>
DataPreparator.applyStep(step): Promise<StepExecutionResult>
DataPreparator.replayPipeline(steps): Promise<StepExecutionResult>
DataPreparator.getDataSummary(): Promise<PreparedDataSummary>
DataPreparator.buildStepCode(step): string
DataPreparator.buildMissingValuesCode(config): string
DataPreparator.buildOutlierRemovalCode(config): string
DataPreparator.buildEncodingCode(config): string
DataPreparator.buildScalingCode(config): string
DataPreparator.buildFeatureSelectionCode(config): string
DataPreparator.buildTrainTestSplitCode(config): string

// engine/data/SyntheticTwinGenerator.ts (Statische Klasse, Gaussian Copula via Pyodide)
SyntheticTwinGenerator.generate(config): Promise<SyntheticTwinData>
SyntheticTwinGenerator.extractProfile(): Promise<DataProfile>
SyntheticTwinGenerator.buildGenerationCode(config): string
SyntheticTwinGenerator.buildValidationCode(): string

// engine/pyodide/PyodideManager.ts (Singleton, echtes Pyodide via WebWorker)
PyodideManager.getInstance(): PyodideManager
PyodideManager.resetInstance(): void
manager.initialize(cdnUrl?, packages?): Promise<void>
manager.runPython(code): Promise<PyodideExecutionResult>
manager.loadPackages(packages): Promise<void>
manager.healthCheck(): Promise<boolean>
manager.terminate(): void
manager.onProgress(listener): () => void  // Returns cleanup fn
manager.getState(): PyodideState

// engine/pyodide/PyodideWorker.ts (Re-Exports für Backward-Compat)
// PyodideWorker = PyodideManager, getPyodideWorker() = getInstance()

// engine/modeling/ModelTrainer.ts (Statische Klasse, ML-Training via Pyodide)
ModelTrainer.trainModel(config, targetColumn, projectType): Promise<TrainingResult>
ModelTrainer.trainClusteringModel(config): Promise<TrainingResult>
ModelTrainer.getAvailableAlgorithms(projectType): AlgorithmInfo[]
ModelTrainer.getDefaultHyperparameters(algorithmType): HyperparameterDef[]
ModelTrainer.getAlgorithmLabel(algorithmType): string
ModelTrainer.buildTrainingCode(config, targetColumn, projectType): string
ModelTrainer.buildClusteringCode(config): string

// engine/deployment/ModelDeployer.ts (Statische Klasse, Prediction + Export)
ModelDeployer.predict(inputValues, targetColumn, projectType): Promise<PredictionResult>
ModelDeployer.buildPythonScript(project, model): string
ModelDeployer.buildNotebook(project, model): string
ModelDeployer.downloadFile(content, filename, mimeType): void
ModelDeployer.buildPredictionCode(inputValues, targetColumn, projectType): string

// engine/tutor/TutorService.ts
TutorService.getPhaseGuidance(phaseId): PhaseGuidance
TutorService.getContextualHints(project): TutorHint[]
TutorService.getNextSteps(phaseId): string[]
```

---

## Design System & UI/UX Patterns

### Grundregel

**Bevor du eine UI-Komponente in `components/werkstatt/phases/` erstellst oder änderst, lies ZUERST diese Referenz-Dateien:**

1. `src/pages/lernen/Grundlagen.tsx` – Beste Referenz für Seitenstruktur, Card-Layouts, Info-Boxen
2. `src/pages/nachschlagen/MetrikenReferenz.tsx` – Beste Referenz für Tabs, Formel-Boxen, Warnungen
3. `src/pages/nachschlagen/BegriffeUebersetzungen.tsx` – Beste Referenz für Suche, Zwei-Spalten-Layout
4. `src/pages/ki-assistenten/copilot/CopilotStartrampe.tsx` – Beste Referenz für Feature-Grids, Vergleichstabellen
5. `src/components/werkstatt/GlossaryLink.tsx` – Immer für Fachbegriffe nutzen

**Ziel:** Jede Werkstatt-Phase soll visuell nicht von den Lovable-Seiten zu unterscheiden sein. Wenn eine Phase "flacher" oder "technischer" wirkt als die Grundlagen-Seite, fehlen Patterns.

---

### Farben (Tailwind Klassen)

```
Primary:        bg-orange-500 text-white / text-orange-500 (Text/Links)
Primary Hover:  hover:bg-orange-600 / hover:text-orange-600
Primary Light:  bg-orange-50 border-orange-200 text-orange-800

Cards:          bg-white rounded-xl border border-gray-200
Interactive:    hover:shadow-md hover:border-orange-200 cursor-pointer transition-all

Status Erfolg:  bg-green-50 border-green-200 text-green-800
Status Warnung: bg-amber-50 border-amber-200 text-amber-800
Status Fehler:  bg-red-50 border-red-200 text-red-800
Status Info:    bg-blue-50 border-blue-200 text-blue-800

Text Heading:   text-gray-900 font-bold
Text Body:      text-gray-600 / text-muted-foreground
Text Muted:     text-gray-500

Glossar-Links:  text-primary hover:text-primary/80 underline decoration-dotted
```

---

### UI-Komponentenpatterns (PFLICHT)

Claude Code muss diese Patterns verwenden. Jede Werkstatt-Phase braucht MINDESTENS:
- 1× Didaktischen Einstieg (Tutor-Tipp oder Info-Box)
- 1× Visuelle Hierarchie (Cards mit Icon-Headers, nicht plain text)
- 1× GlossaryLinks zu relevanten Begriffen
- Klares Spacing: `space-y-6` zwischen Hauptabschnitten, `space-y-4` innerhalb

#### Pattern 1: Info-Box / Tutor-Tipp (orange)

Verwende bei: Phasen-Einstiege, didaktische Hinweise, "Was passiert hier?"

```tsx
<div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
  <div className="flex gap-3">
    <Info className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
    <div className="text-sm">
      <p className="font-medium text-orange-800 mb-1">Was passiert in dieser Phase?</p>
      <p className="text-orange-700">
        Du führst eine <GlossaryLink term="Explorative Datenanalyse" /> durch...
      </p>
    </div>
  </div>
</div>
```

#### Pattern 2: Warnungs-Banner (amber/gelb)

Verwende bei: Wichtige Hinweise, häufige Fehler, Einschränkungen

```tsx
<div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
  <div className="flex gap-3">
    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
    <p className="text-sm text-amber-800">
      R² steigt IMMER wenn Variablen hinzugefügt werden – auch nutzlose!
    </p>
  </div>
</div>
```

#### Pattern 3: Erfolgs-Box (grün)

Verwende bei: Ergebnisse, "Wann verwenden?", positive Hinweise, Erkenntnisse

```tsx
<div className="bg-green-50 border border-green-200 rounded-xl p-4">
  <div className="flex gap-3">
    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
    <div className="text-sm text-green-800">
      <p className="font-medium mb-1">Erkenntnis</p>
      <p>Dein Modell hat einen Accuracy von 87% – das ist ein guter Start.</p>
    </div>
  </div>
</div>
```

#### Pattern 4: Card mit Icon-Header

Verwende bei: Jeden inhaltlichen Abschnitt. NIEMALS plain `<h3>` ohne Card drumherum.

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <BarChart3 className="h-5 w-5 text-primary" />
      Deskriptive Statistik
    </CardTitle>
    <CardDescription>Überblick über deine numerischen Features</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Inhalt */}
  </CardContent>
</Card>
```

#### Pattern 5: Feature-Grid (3er)

Verwende bei: Optionsauswahl (Algorithmen, Schritte, Modi), Übersichten

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {items.map(item => (
    <Card
      key={item.id}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        selected === item.id
          ? "border-orange-500 bg-orange-50"
          : "hover:border-orange-200"
      )}
      onClick={() => setSelected(item.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <item.icon className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">{item.label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{item.description}</p>
      </CardContent>
    </Card>
  ))}
</div>
```

#### Pattern 6: Formel-Box / Code-Box

Verwende bei: Python-Code Anzeige, mathematische Formeln, technische Details

```tsx
<div className="bg-muted rounded-lg p-4">
  <p className="text-xs text-muted-foreground mb-1">Python-Code:</p>
  <pre className="text-sm font-mono whitespace-pre-wrap">
    {generatedCode}
  </pre>
</div>
```

#### Pattern 7: Vergleichstabelle

Verwende bei: Modellvergleich, Metriken-Übersicht, Vor/Nachteile

```tsx
<Card>
  <CardContent className="pt-6">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Modell</TableHead>
          <TableHead className="text-right">Accuracy</TableHead>
          <TableHead className="text-right">F1</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models.map(m => (
          <TableRow key={m.id} className={m.isBest ? "bg-green-50" : ""}>
            <TableCell className="font-medium">{m.label}</TableCell>
            <TableCell className="text-right font-mono">
              {(m.accuracy * 100).toFixed(1)}%
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </CardContent>
</Card>
```

#### Pattern 8: Tabs für Unterbereiche

Verwende bei: Mehr als 3 inhaltliche Bereiche in einer Phase

```tsx
<Tabs defaultValue="uebersicht">
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="uebersicht" className="gap-1">
      <Eye className="h-3.5 w-3.5" /> Übersicht
    </TabsTrigger>
    <TabsTrigger value="details" className="gap-1">
      <BarChart3 className="h-3.5 w-3.5" /> Details
    </TabsTrigger>
    <TabsTrigger value="code" className="gap-1">
      <Code className="h-3.5 w-3.5" /> Python-Code
    </TabsTrigger>
  </TabsList>
  <TabsContent value="uebersicht">...</TabsContent>
</Tabs>
```

#### Pattern 9: Badge-Chips für Status/Typ

Verwende bei: Feature-Typen, Phasen-Status, Algorithmus-Typ, Metriken-Werte

```tsx
<Badge variant="secondary">Numerisch</Badge>
<Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
  87.3%
</Badge>
<Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
  In Arbeit
</Badge>
```

#### Pattern 10: Leerer Zustand

Verwende bei: Wenn noch keine Daten/Modelle/Ergebnisse vorhanden

```tsx
<Card className="border-dashed">
  <CardHeader className="text-center">
    <div className="mx-auto p-4 rounded-full bg-muted w-fit">
      <Database className="h-10 w-10 text-muted-foreground" />
    </div>
    <CardTitle>Noch keine Daten</CardTitle>
    <CardDescription>
      Lade eine CSV-Datei hoch oder generiere synthetische Daten.
    </CardDescription>
  </CardHeader>
</Card>
```

#### Pattern 11: Glossar-Begriffsbox am Ende einer Phase

Verwende bei: Jede Phase – am Ende eine Box mit relevanten Glossar-Begriffen

```tsx
<Card className="bg-muted/30">
  <CardHeader className="pb-2">
    <CardTitle className="text-base flex items-center gap-2">
      <BookOpen className="h-4 w-4" />
      Relevante Begriffe
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex flex-wrap gap-2">
      <GlossaryLink term="Overfitting" />
      <GlossaryLink term="Cross-Validation" />
      <GlossaryLink term="Bias-Variance Trade-off" />
    </div>
  </CardContent>
</Card>
```

#### Pattern 12: Lernbereich-Link

Verwende bei: Jede Phase – Verweis auf die CRISP-DM Theorie

```tsx
<a
  href="/lernen/grundlagen#crisp-dm"
  className="text-sm text-primary hover:underline flex items-center gap-1"
>
  <BookOpen className="h-3.5 w-3.5" />
  Mehr zu dieser Phase im Lernbereich →
</a>
```

---

### Layout-Regeln

1. **Max-Width:** `max-w-4xl` für Lese-Seiten (Phasen), `max-w-6xl` für Dashboard-Seiten (Projektseite)
2. **Container:** `container mx-auto px-4 py-6`
3. **Hauptabschnitte:** `space-y-6` zwischen Cards/Sektionen
4. **Innerhalb Cards:** `space-y-4` zwischen Elementen
5. **Grid:** `grid grid-cols-1 md:grid-cols-2 gap-4` für 2-spaltig, `md:grid-cols-3` für 3-spaltig
6. **Responsive:** Mobile-first. Grids werden auf Mobile zu `grid-cols-1`, Tabs zu vertikalem Scroll

### Didaktische Regeln

1. **Jede Phase beginnt mit einem Tutor-Tipp** (Pattern 1) der erklärt WAS der User hier tut und WARUM
2. **Fachbegriffe immer als GlossaryLink** – nicht als plain text
3. **Ergebnisse immer in Kontext setzen** – nicht nur Zahlen zeigen, sondern erklären was sie bedeuten (Pattern 3)
4. **Warnungen bei häufigen Anfänger-Fehlern** einfügen (Pattern 2)
5. **Jede Phase endet mit Glossar-Box** (Pattern 11) und Lernbereich-Link (Pattern 12)
6. **Python-Code immer in Formel-Box** (Pattern 6) zeigen, nicht als plain `<pre>`
7. **Keine nackte Tabellen** – immer in Card wrappen (Pattern 7)
8. **Leere Zustände** immer visuell ansprechend (Pattern 10), nie nur Text

### Verbotene Muster

Diese Patterns kommen in den guten Seiten NICHT vor und sollten NIEMALS in Werkstatt-Phasen auftauchen:

- `<h3>` oder `<h4>` direkt im Flow ohne Card-Wrapper
- Plain `<ul><li>` Listen – stattdessen Cards oder Check-Listen mit Icons
- `text-muted-foreground` als Haupttext – nur für Beschreibungen und Hilfstext
- `<pre>` ohne `bg-muted rounded-lg p-4` Wrapper
- Buttons ohne Icon (jeder Button braucht ein Lucide-Icon links oder rechts)
- Mehr als 2 Buttons nebeneinander ohne klare Hierarchie (1 Primary + N Secondary/Ghost)
- Tabellen ohne Zebra-Striping oder Hover-Effekt
- Leere Zustände als plain Text ("Keine Daten vorhanden")
- Fehlermeldungen ohne `AlertTriangle`-Icon und rote Alert-Box

---

### Checkliste für jede Phase-Komponente

Bevor du eine Phase-Komponente commitest, prüfe:

- [ ] Hat die Phase einen didaktischen Einstieg (Tutor-Tipp, Info-Box)?
- [ ] Sind alle Fachbegriffe als `<GlossaryLink>` verlinkt?
- [ ] Sind alle inhaltlichen Abschnitte in Cards mit Icon-Headers verpackt?
- [ ] Gibt es Tabs wenn mehr als 3 Unterbereiche existieren?
- [ ] Hat der leere Zustand ein Icon + beschreibenden Text (Pattern 10)?
- [ ] Gibt es am Ende eine Glossar-Box (Pattern 11)?
- [ ] Gibt es einen Lernbereich-Link (Pattern 12)?
- [ ] Haben alle Buttons ein Icon?
- [ ] Ist der Python-Code in einer Formel-Box (Pattern 6)?
- [ ] Sind Metriken/Ergebnisse mit Kontext-Erklärung versehen (Pattern 3)?
- [ ] Werden Warnungen bei häufigen Fehlern angezeigt (Pattern 2)?
- [ ] Nutzt die Seite `space-y-6` zwischen Hauptabschnitten?
- [ ] Sieht die Seite visuell gleichwertig aus wie `Grundlagen.tsx` oder `MetrikenReferenz.tsx`?

---

## Architektur-Entscheidungen

### Pyodide WebWorker (implementiert)

- Pyodide läuft in einem **Web Worker** (nicht im Main Thread).
- `PyodideManager` (Singleton) im Main Thread kommuniziert über typisiertes `postMessage`-Protokoll mit `pyodide.worker.ts`.
- Packages werden lazy geladen: Pyodide-Core zuerst, dann numpy/pandas/scikit-learn.
- CDN: `https://cdn.jsdelivr.net/pyodide/v0.27.4/full/`
- Hook `usePyodide(autoInit?)` für React-Integration (lazy, kein Download beim App-Start).

```typescript
// engine/pyodide/PyodideManager.ts (Singleton)
interface PyodideState {
  stage: 'downloading' | 'initializing' | 'loading-packages' | 'ready' | 'error';
  percent: number;
  message: string;
  isLoading: boolean;
  isReady: boolean;
  error?: string;
}

interface PyodideExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  stdout: string[];
  stderr: string[];
}

class PyodideManager {
  static getInstance(): PyodideManager;
  static resetInstance(): void;
  initialize(cdnUrl?, packages?): Promise<void>;
  runPython(code: string): Promise<PyodideExecutionResult>;
  loadPackages(packages: string[]): Promise<void>;
  healthCheck(): Promise<boolean>;
  terminate(): void;
  onProgress(listener): () => void;
  getState(): PyodideState;
}
```

### Workspace & Persistenz

**LocalStorage-basiertes Backend (implementiert):**

- `WorkspaceStorage`: Statische Klasse mit CRUD für Projekte, Phasen-Status, Demo-Initialisierung.
- `WorkspaceExporter`: Export als `.datapilot` (JSON) mit SHA-256 Integritäts-Hash und Validierung beim Import.
- Storage-Keys: `ds-werkstatt-onboarding-done`, `ds-werkstatt-mode`, `ds-werkstatt-projects`.
- Optional `SupabaseBackend` (Feature 9): Nur wenn User Sync aktiviert hat.

### Daten-Privatsphäre

- **Echte Daten (CSV/Excel)** werden NUR im Browser verarbeitet. Kein Upload an irgendeinen Server.
- **Projektdateien (.datapilot)** speichern standardmäßig KEINE Rohdaten, nur ein Manifest (`exportMode: 'reference'`).
- Verschlüsselung: AES-256-GCM über Web Crypto API, Passwort-basiert (optional, vorbereitet).

### Glossar-Integration

Die `GlossaryLink`-Komponente verknüpft Fachbegriffe in der DS Werkstatt mit dem bestehenden Nachschlagen-Bereich. Claude Code sollte beim Implementieren von Phasen-Inhalten die `GlossaryLink`-Komponente nutzen, um Begriffe wie „Overfitting", „Feature Engineering", „Confusion Matrix" etc. mit dem Glossar zu verlinken. Die Komponente importieren aus `components/werkstatt/GlossaryLink.tsx`.

---

## Feature-Roadmap (Reihenfolge beachten!)

Jedes Feature baut auf dem vorherigen auf. Nicht vorspringen.

### Feature 1: Workspace Manager ✅ IMPLEMENTIERT
**Ordner:** `engine/workspace/`
**Ziel:** Projekte speichern, laden, exportieren, importieren.

- [x] `WorkspaceStorage` implementieren (CRUD für Projekte via LocalStorage)
- [x] `WorkspaceExporter`: Projekt als `.datapilot` (JSON) Datei exportieren
- [x] Import mit Validierung (Version, Struktur, Pflichtfelder)
- [x] `hashUtils.ts`: SHA-256 Hash über Web Crypto API (String + File)
- [x] `FileManifest` Interface für CSV-Validierung beim Re-Import
- [x] Hook `useWorkspace.ts` mit WorkspaceStorage verbunden
- [x] Unit Tests (WorkspaceStorage, WorkspaceExporter, hashUtils)
- [ ] Optional: AES-256-GCM Verschlüsselung für Export mit Passwort
- [ ] `DataValidator`: Beim Re-Import CSV gegen gespeichertes Manifest prüfen

**Testen:** Projekt erstellen → exportieren → App-Daten löschen → importieren → alles da.

### Feature 2: Pyodide WebWorker ✅ IMPLEMENTIERT
**Ordner:** `engine/pyodide/`
**Ziel:** Python/sklearn im Browser lauffähig machen.

- [x] WebWorker Setup (echtes Pyodide statt Mock)
- [x] Pyodide laden mit Fortschrittsanzeige
- [x] sklearn, pandas, numpy als Pyodide built-in Packages laden
- [x] Promise-basiertes API für Main Thread (PyodideManager)
- [x] Wrapper-Hook `usePyodide.ts`
- [x] Fortschritts-Callbacks (stage, percent, message) für Lade-UI
- [x] Fehlerbehandlung: CDN-Fehler, Timeouts, Worker-Crash
- [ ] Smoke Test im Browser: `from sklearn.linear_model import LinearRegression`
- [ ] Ladebildschirm UI (Lovable-Domäne)

**Hinweis:** Pyodide ist ~15-20 MB. Caching via Service Worker.

### Feature 3: Synthetische Datengenerierung ✅ IMPLEMENTIERT
**Ordner:** `engine/data/`
**Ziel:** Basierend auf Use-Case-Definition realistische Daten erzeugen.

- [x] Wrapper um sklearn's `make_classification`, `make_regression`, `make_blobs`
- [x] Feature-Namen aus Projekt-Definition übernehmen
- [x] Slider-Parameter durchreichen (noiseFactor)
- [x] Reproduzierbarkeit über Random Seed

### Feature 4: CSV-Import + Data Understanding Phase ✅ IMPLEMENTIERT
**Ordner:** `engine/data/` + `components/werkstatt/phases/DataUnderstanding.tsx`
**Ziel:** Echte oder synthetische Daten erkunden.

- [x] CSV-Parser über Pyodide (pandas) – `DataAnalyzer.analyzeCSV()`
- [x] Automatische Typ-Erkennung (numerisch vs. kategorial)
- [x] Deskriptive Statistik (Mean, Std, Min, Max, Quartile, Top-Value)
- [x] Visualisierungen: Korrelationsmatrix (CSS-Grid Heatmap), Fehlende-Werte-Balken
- [x] Missing Values Übersicht (Gesamtanzahl, pro Spalte mit Farbkodierung)
- [x] Datentabelle (erste 10 Zeilen) mit Spaltentyp-Badges
- [x] GlossaryLinks zu relevanten Begriffen (EDA, Deskriptive Statistik, Korrelation, etc.)
- [x] Synthetische Daten via `DataGenerator.generate()` + Analyse
- [x] Unit Tests für DataAnalyzer (28 Tests)

**Ausnahme:** Hier darf Claude Code `DataUnderstanding.tsx` anpassen – den Placeholder durch echte Inhalte ersetzen.

### Feature 5: Data Preparation Phase ✅ IMPLEMENTIERT
**Ordner:** `engine/data/` + `components/werkstatt/phases/DataPreparation.tsx`
**Ziel:** Pipeline aus Vorbereitungsschritten mit generiertem Python-Code.

- [x] Missing Values Handling (entfernen, füllen mit Mean/Median/Mode/Konstante)
- [x] Outlier Entfernung (Z-Score, IQR)
- [x] Encoding (One-Hot, Label)
- [x] Scaling (StandardScaler, MinMaxScaler)
- [x] Feature Selection (drop/keep columns)
- [x] Train/Test Split (mit Stratifizierung)
- [x] Pipeline-Steps mit generiertem Code (Python-Code-Tab)
- [x] GlossaryLinks einbauen
- [x] Undo via Pipeline-Replay
- [x] Pipeline wird im Projekt gespeichert (LocalStorage)
- [x] Unit Tests für DataPreparator (~35 Tests)

**Ausnahme:** Claude Code darf `DataPreparation.tsx` anpassen.

### Feature 6: Modeling + Evaluation Phase ✅ IMPLEMENTIERT
**Ordner:** `engine/modeling/` + `components/werkstatt/phases/Modeling.tsx` + `Evaluation.tsx`
**Ziel:** Modelle trainieren, evaluieren und vergleichen.

- [x] Algorithmus-Auswahl (4 Klassifikation, 4 Regression, 2 Clustering)
- [x] Hyperparameter als Slider (dynamisch pro Algorithmus)
- [x] Training in Pyodide (ModelTrainer.trainModel / trainClusteringModel)
- [x] Metriken berechnen (Accuracy, F1, R², RMSE, Silhouette, etc.)
- [x] Confusion Matrix (CSS Grid Heatmap), Feature Importance (Balkendiagramm)
- [x] Modellvergleich (Tabelle mit allen Metriken, bestes Modell hervorgehoben)
- [x] Didaktische Hinweise + GlossaryLinks
- [x] Python-Code Tab (lesbarer Code pro Modell)
- [x] Modelle in Projekt persistiert (trainedModels in WorkspaceProject)
- [x] Unit Tests für ModelTrainer (46 Tests, 204 total)

**Ausnahme:** Claude Code hat `Modeling.tsx` und `Evaluation.tsx` ersetzt.

### Feature 7: Deployment Phase ✅ IMPLEMENTIERT
**Ordner:** `engine/deployment/` + `components/werkstatt/phases/Deployment.tsx`
**Ziel:** Modell testen, Code exportieren, Projektzusammenfassung.

- [x] „Teste dein Modell" mit Eingabefeldern (pro Feature ein Input)
- [x] Vorhersage via Pyodide (predict mit _model + X_train/df)
- [x] Wahrscheinlichkeiten-Anzeige (Balkendiagramm für Klassifikation)
- [x] Notebook-Export (.ipynb) – Jupyter Notebook mit Markdown + Code-Zellen
- [x] Python-Script-Export (.py) – Standalone-Script mit Pipeline + Training + Predict
- [x] Zusammenfassung (Projekt-Steckbrief, CRISP-DM Fortschritt, Daten, Pipeline, Modell)
- [x] GlossaryLinks (Deployment, Monitoring, Data Drift, MLOps)
- [x] Unit Tests für ModelDeployer (45 Tests, 249 total)

**Ausnahme:** Claude Code hat `Deployment.tsx` ersetzt.

### Feature 8: Synthetischer Zwilling ✅ IMPLEMENTIERT
**Ordner:** `engine/data/`
**Ziel:** Privacy-preserving synthetische Kopie der Daten via Gaussian Copula.

- [x] Statistische Profile extrahieren (DataProfile, ColumnProfileInfo)
- [x] Gaussian Copula für korrelierte numerische Spalten (Cholesky + inverse empirische CDF)
- [x] Proportionales Resampling für kategorische Spalten
- [x] Validierung via KS-Test (scipy.stats.ks_2samp)
- [x] Integration in WorkspaceExporter (exportMode: 'synthetic-twin')
- [x] SyntheticTwinConfig, SyntheticTwinData, SyntheticTwinValidation Interfaces
- [x] Unit Tests für SyntheticTwinGenerator (28 Tests) + Exporter-Erweiterung (6 Tests, 283 total)

**Ausnahme:** Keine UI-Änderung – ExportModal gehört Lovable.

### Feature 9 (optional): Supabase Sync Backend
- [ ] `SupabaseBackend` implementiert `WorkspaceStorage`
- [ ] Firewall-Check beim App-Start
- [ ] Offline-Fallback
- [ ] Migration lokaler Projekte

### Feature 10 (optional): PWA + Offline
- [ ] Service Worker mit Pyodide-Caching
- [ ] manifest.json
- [ ] Offline-Banner

---

## Coding-Konventionen

### TypeScript
- Strict mode, keine `any` außer in Pyodide-Interop
- Interfaces über Types bevorzugen
- Alle Engine-Funktionen async

### Git
- Commit-Messages auf Englisch, Conventional Commits:
  - `feat: add Pyodide WebWorker with sklearn support`
  - `fix: hash calculation for large CSV files`
- Ein Feature = ein oder mehrere Commits, dann Push
- Branch: `main` (Lovable deployed von main)

### Kommentare
- JSDoc für public Interfaces und Funktionen
- TODO mit Feature-Name: `// TODO(pyodide): ...`

### Tests
- Framework: Vitest mit jsdom
- Testdateien: `__tests__/*.test.ts` neben den Source-Files
- `npm run test` (einmalig) oder `npm run test:watch` (watch mode)
- jsdom hat kein `File.text()` – bei Bedarf Polyfill in Tests verwenden

---

## Wichtige Einschränkungen

1. **Kein Server-Backend bauen.** Alles läuft im Browser.
2. **Keine Google-Services.** Kein Firebase, kein Google Auth.
3. **Firewall-kompatibel.** Externe Dienste sind optional und degraden graceful.
4. **Datenschutz.** User-Daten (CSV) nie an Server senden. Auch nicht an Claude API – der Tutor bekommt nur Metadaten.
5. **Performance.** Keine Datasets > 50.000 Zeilen – das ist eine Lern-App.
6. **Bestehende DataPilot App nicht brechen.** Lernen, Üben, Nachschlagen bleiben unverändert.

---

## Debugging-Tipps

### Pyodide
- Wenn nicht ladend: CDN-Erreichbarkeit prüfen. Hinter Firewalls ggf. geblockt.
- `micropip.install()` Fehler: Package evtl. nicht als pure Python Wheel verfügbar.
- Memory: WebAssembly Memory Limit bei sehr großen DataFrames.

### WebWorker
- `postMessage` serialisiert alles – keine Funktionen, keine Circular References.
- Chrome DevTools → Sources → Worker-Scripts zum Debuggen.

### LocalStorage
- Limit: ~5-10 MB. Deshalb Daten nur als Referenz, nicht eingebettet speichern.
- `JSON.parse` immer in try/catch.

---

## Häufige Aufgaben

### „Baue Feature X"
1. Lies diese Datei (passiert automatisch)
2. Prüfe Interfaces in `engine/types.ts`
3. Implementiere in `engine/`
4. Verbinde mit Hooks in `hooks/`
5. Teste lokal mit `npm run dev`
6. Committe und pushe

### „Ändere die UI von Phase Y"
1. Thomas hat erlaubt, Phasen-Komponenten in `components/werkstatt/phases/` anzupassen
2. Design System einhalten
3. `GlossaryLink`-Komponente nutzen für Fachbegriffe
4. Alle Texte auf Deutsch

### „Merge-Konflikt"
1. Lovable-Änderungen in `components/` haben Vorrang
2. Claude Code-Änderungen in `engine/` haben Vorrang
3. Bei Konflikten in `hooks/` oder `types/`: Thomas fragen

### „Erstelle oder verbessere eine Phase-Komponente"
1. Lies den Abschnitt „Design System & UI/UX Patterns" in dieser Datei
2. Lies die Referenz-Dateien (Grundlagen.tsx, MetrikenReferenz.tsx, CopilotStartrampe.tsx)
3. Prüfe die Checkliste am Ende des Design-Abschnitts
4. Alle Texte auf Deutsch, alle Fachbegriffe als GlossaryLink
5. Teste visuell im Browser – die Phase muss gleichwertig aussehen wie die Lovable-Seiten
