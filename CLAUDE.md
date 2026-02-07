# CLAUDE.md – DS Werkstatt Projekt

> Diese Datei wird automatisch von Claude Code gelesen. Sie enthält alle Konventionen,
> Architektur-Entscheidungen und den Feature-Plan für das Projekt.
> **Zuletzt aktualisiert:** 2026-02-07 – an tatsächliche Codebasis angepasst.

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
├── components/              ← 🚫 NICHT ANFASSEN (Lovable-Domäne)
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
│   │   ├── WorkspaceExporter.ts  ← .mltutor Export/Import mit Validierung
│   │   ├── hashUtils.ts          ← SHA-256 Hash (String + File)
│   │   └── __tests__/            ← Unit Tests
│   │       ├── WorkspaceStorage.test.ts
│   │       ├── WorkspaceExporter.test.ts
│   │       └── hashUtils.test.ts
│   ├── data/                ← Datengeneratoren
│   │   └── DataGenerator.ts      ← Mock-Daten (Phase 1), wird zu Pyodide
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

1. **`components/`** gehört Lovable. Claude Code darf diese Dateien NICHT ändern, es sei denn Thomas bittet explizit darum.
2. **`engine/`** gehört Claude Code. Hier wird die gesamte Logik implementiert.
3. **`hooks/`** ist geteilt. Claude Code implementiert die Logik, ändert aber nicht die Hook-Signaturen.
4. **`engine/types.ts`** ist der Vertrag. Änderungen hier erfordern Koordination mit Lovable. Vor Änderungen Thomas fragen.
5. **Neue Dateien** im `engine/`-Ordner können jederzeit erstellt werden.
6. **Neue npm-Pakete** dürfen installiert werden. Erwähne kurz was und warum.
7. **Bestehende DataPilot-Bereiche** (Lernen, Üben, Nachschlagen) NIEMALS anfassen.

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
- `PipelineStep` – wird bei Feature 5 (Data Preparation) ergänzt
- `TrainedModel` – wird bei Feature 6 (Modeling) ergänzt
- `ModelMetrics` – wird bei Feature 6 (Evaluation) ergänzt
- `SyntheticTwinConfig` – wird bei Feature 8 (Synthetischer Zwilling) ergänzt

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
WorkspaceExporter.exportToFile(project, exportMode?): Promise<void>  // Download .mltutor
WorkspaceExporter.importFromFile(file): Promise<WorkspaceProject>    // Validiert + importiert
WorkspaceExporter.validateFile(file): Promise<ImportValidationResult>

// engine/data/DataGenerator.ts (Mock für Phase 1)
DataGenerator.generate(config): GeneratedDataset
DataGenerator.getPreviewData(projectType): GeneratedDataset

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

// engine/tutor/TutorService.ts
TutorService.getPhaseGuidance(phaseId): PhaseGuidance
TutorService.getContextualHints(project): TutorHint[]
TutorService.getNextSteps(phaseId): string[]
```

---

## Design System (für eventuelle UI-Anpassungen)

Falls Claude Code UI-Elemente anpassen muss (z.B. Visualisierungen einbetten):

```css
/* Primary */
bg-orange-500, hover:bg-orange-600, text-orange-500

/* Cards */
bg-white rounded-xl border border-gray-200 p-6

/* Interactive Card */
hover:shadow-md hover:border-orange-200 cursor-pointer transition-all

/* Highlight Box (Tutor-Tipps etc.) */
bg-orange-50 border border-orange-200 rounded-xl p-4

/* Primary Button */
px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl

/* Text */
Heading: text-gray-900 font-bold
Body: text-gray-600
Muted: text-gray-500

/* Glossar-Links in der Werkstatt */
text-orange-500 hover:text-orange-600 underline decoration-dotted underline-offset-2

/* Status */
Erfolg: bg-green-50 text-green-700 border-green-200
Warnung: bg-amber-50 text-amber-700 border-amber-200
Fehler: bg-red-50 text-red-700 border-red-200
Info: bg-blue-50 text-blue-700 border-blue-200
```

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
- `WorkspaceExporter`: Export als `.mltutor` (JSON) mit SHA-256 Integritäts-Hash und Validierung beim Import.
- Storage-Keys: `ds-werkstatt-onboarding-done`, `ds-werkstatt-mode`, `ds-werkstatt-projects`.
- Optional `SupabaseBackend` (Feature 9): Nur wenn User Sync aktiviert hat.

### Daten-Privatsphäre

- **Echte Daten (CSV/Excel)** werden NUR im Browser verarbeitet. Kein Upload an irgendeinen Server.
- **Projektdateien (.mltutor)** speichern standardmäßig KEINE Rohdaten, nur ein Manifest (`exportMode: 'reference'`).
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
- [x] `WorkspaceExporter`: Projekt als `.mltutor` (JSON) Datei exportieren
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

### Feature 3: Synthetische Datengenerierung
**Ordner:** `engine/data/`
**Ziel:** Basierend auf Use-Case-Definition realistische Daten erzeugen.

- [ ] Wrapper um sklearn's `make_classification`, `make_regression`, `make_blobs`
- [ ] Feature-Namen aus Projekt-Definition übernehmen
- [ ] Slider-Parameter durchreichen
- [ ] Reproduzierbarkeit über Random Seed

### Feature 4: CSV-Import + Data Understanding Phase
**Ordner:** `engine/data/` + `components/werkstatt/phases/DataUnderstanding.tsx`
**Ziel:** Echte oder synthetische Daten erkunden.

- [ ] CSV/Excel-Parser über Pyodide (pandas)
- [ ] Automatische Typ-Erkennung
- [ ] Deskriptive Statistik
- [ ] Visualisierungen: Histogramme, Korrelationsmatrix, Boxplots
- [ ] Missing Values Übersicht
- [ ] Datentabelle (erste 10 Zeilen)
- [ ] GlossaryLinks zu relevanten Begriffen einbauen (EDA, Deskriptive Statistik, Outlier, etc.)

**Ausnahme:** Hier darf Claude Code `DataUnderstanding.tsx` anpassen – den Placeholder durch echte Inhalte ersetzen.

### Feature 5: Data Preparation Phase
**Ordner:** `engine/pyodide/` + `components/werkstatt/phases/DataPreparation.tsx`

- [ ] Missing Values Handling (entfernen, füllen)
- [ ] Outlier Entfernung (Z-Score, IQR)
- [ ] Encoding (One-Hot, Label)
- [ ] Scaling (StandardScaler, MinMaxScaler)
- [ ] Feature Selection
- [ ] Train/Test Split
- [ ] Pipeline-Steps mit generiertem Code
- [ ] GlossaryLinks einbauen

### Feature 6: Modeling + Evaluation Phase
**Ordner:** `engine/pyodide/` + Phasen-Komponenten

- [ ] Algorithmus-Auswahl (Regression/Klassifikation/Clustering)
- [ ] Hyperparameter als Slider
- [ ] Training in Pyodide
- [ ] Metriken berechnen
- [ ] Confusion Matrix, ROC-Kurve, Feature Importance
- [ ] Modellvergleich
- [ ] Didaktische Hinweise
- [ ] GlossaryLinks zu Metriken und Algorithmen

### Feature 7: Deployment Phase
- [ ] „Teste dein Modell" mit Eingabefeldern
- [ ] Notebook-Export (.ipynb)
- [ ] Python-Script-Export (.py)
- [ ] Zusammenfassung

### Feature 8: Synthetischer Zwilling
**Ordner:** `engine/data/`

- [ ] Statistische Profile extrahieren
- [ ] Verteilungsanpassung (numpy)
- [ ] Gaussian Copula für Korrelationen
- [ ] Validierung (KS-Test)
- [ ] Integration in Export

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
