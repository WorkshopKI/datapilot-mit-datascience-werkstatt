# CLAUDE.md – DS Werkstatt Projekt

> Diese Datei wird automatisch von Claude Code gelesen. Sie enthält alle Konventionen,
> Architektur-Entscheidungen und den Feature-Plan für das Projekt.

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
Auth (optional): Supabase Auth (Magic Link, kein Google/Social)
DB (optional):  Supabase Postgres (nur wenn User Sync aktiviert)
```

---

## Bestehende App-Struktur (DataPilot)

Die DataPilot App hat bereits diese Bereiche – NICHT verändern:

```
🧭 DataPilot
├── 📚 Lernen              ← CRISP-DM Theorie, Lektionen
├── 🎮 Üben                ← Challenge Cards, Quiz
├── 📖 Nachschlagen        ← Begriffe & Übersetzungen (100+ Glossar-Einträge)
│                             Enthält u.a.: Overfitting, Feature Engineering,
│                             Confusion Matrix, CRISP-DM, Missing Values,
│                             One-Hot Encoding, Accuracy, Precision, Recall, ...
└── ⚙️ Einstellungen
```

Der Glossar ist besonders wertvoll: Er enthält fast alle Begriffe die in der DS Werkstatt vorkommen. Die `GlossaryLink`-Komponente verknüpft Fachbegriffe in der Werkstatt direkt mit den Glossar-Einträgen.

---

## Ordnerstruktur & Zuständigkeiten

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
│       ├── NewProjectWizard.tsx
│       ├── DataImportZone.tsx
│       ├── CrispDmStepper.tsx
│       ├── CrispDmPhaseWrapper.tsx
│       ├── GlossaryLink.tsx     ← Wiederverwendbare Glossar-Link-Komponente
│       ├── phases/              ← UI für CRISP-DM Phasen
│       ├── ExportModal.tsx
│       └── WorkspaceStatusBar.tsx
│
├── engine/                  ← ✅ CLAUDE CODE DOMÄNE
│   ├── types.ts             ← Shared Interfaces (Vertrag mit UI)
│   ├── pyodide/             ← Pyodide WebWorker + sklearn Pipeline
│   ├── workspace/           ← Storage, Export/Import, Hashing, Crypto
│   ├── data/                ← Datengeneratoren (synthetisch + Zwilling)
│   └── tutor/               ← Claude API Integration für Tutor-Tipps
│
├── hooks/                   ← ⚠️ VORSICHTIG (geteilt)
│   ├── useWorkspace.ts      ← Claude Code implementiert Logik
│   ├── useProject.ts        ← Claude Code implementiert Logik
│   └── ...                  ← Bestehende Hooks nicht anfassen
│
├── pages/
│   ├── WerkstattPage.tsx
│   ├── ProjectPage.tsx
│   └── ...                  ← Bestehende Seiten nicht anfassen
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

### Pyodide WebWorker

- Pyodide läuft in einem **Web Worker** (nicht im Main Thread).
- Kommunikation über `postMessage` mit strukturierten Nachrichten.
- Packages werden lazy geladen: Pyodide-Core zuerst, dann sklearn/pandas/numpy on demand.

```typescript
// engine/pyodide/PyodideWorker.ts
interface PyodideAPI {
  initialize(): Promise<void>;
  isReady(): boolean;
  runPython(code: string): Promise<any>;
  loadPackages(packages: string[]): Promise<void>;
  generateData(params: DataGenerationParams): Promise<DataFrame>;
  trainModel(algorithm: AlgorithmType, params: Record<string, any>): Promise<TrainedModel>;
  evaluate(modelId: string): Promise<ModelMetrics>;
  predict(modelId: string, input: Record<string, any>): Promise<any>;
}
```

### Workspace & Persistenz

**Zwei Storage-Backends mit identischem Interface:**

- `LocalStorageBackend`: Immer verfügbar, primärer Speicher.
- `SupabaseBackend`: Optional, nur wenn User Sync aktiviert hat und Supabase erreichbar ist.
- Auswahl über Strategy Pattern basierend auf `localStorage.getItem('ds-werkstatt-mode')`.

### Daten-Privatsphäre

- **Echte Daten (CSV/Excel)** werden NUR im Browser verarbeitet. Kein Upload an irgendeinen Server.
- **Projektdateien (.mltutor)** speichern standardmäßig KEINE Rohdaten, nur ein Manifest.
- Verschlüsselung: AES-256-GCM über Web Crypto API, Passwort-basiert.

### Glossar-Integration

Die `GlossaryLink`-Komponente verknüpft Fachbegriffe in der DS Werkstatt mit dem bestehenden Nachschlagen-Bereich. Claude Code sollte beim Implementieren von Phasen-Inhalten die `GlossaryLink`-Komponente nutzen, um Begriffe wie „Overfitting", „Feature Engineering", „Confusion Matrix" etc. mit dem Glossar zu verlinken. Die Komponente importieren aus `components/werkstatt/GlossaryLink.tsx`.

---

## Feature-Roadmap (Reihenfolge beachten!)

Jedes Feature baut auf dem vorherigen auf. Nicht vorspringen.

### Feature 1: Workspace Manager
**Ordner:** `engine/workspace/`
**Ziel:** Projekte speichern, laden, exportieren, importieren – echt, nicht mehr Mock.

- [ ] `LocalStorageBackend` implementieren (CRUD für Projekte)
- [ ] `WorkspaceExporter`: Projekt als `.mltutor` (JSON) Datei exportieren
- [ ] `WorkspaceImporter`: `.mltutor` Datei einlesen und validieren
- [ ] `hashUtils.ts`: SHA-256 Hash über File API + Web Crypto API
- [ ] `DataValidator`: Beim Re-Import CSV gegen gespeichertes Manifest prüfen
- [ ] Optional: AES-256-GCM Verschlüsselung für Export mit Passwort
- [ ] Hook `useWorkspace.ts` mit echtem LocalStorageBackend verbinden

**Testen:** Projekt erstellen → exportieren → App-Daten löschen → importieren → alles da.

### Feature 2: Pyodide WebWorker
**Ordner:** `engine/pyodide/`
**Ziel:** Python/sklearn im Browser lauffähig machen.

- [ ] WebWorker Setup
- [ ] Pyodide laden mit Fortschrittsanzeige
- [ ] sklearn, pandas, numpy als Micropip-Packages laden
- [ ] Promise-basiertes API für Main Thread
- [ ] Wrapper-Hook `usePyodide.ts`
- [ ] Ladebildschirm: Spinner + „ML-Engine wird geladen..." + Fortschritts-%
- [ ] Fehlerbehandlung: Was wenn Pyodide nicht lädt?
- [ ] Smoke Test: `from sklearn.linear_model import LinearRegression`

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
