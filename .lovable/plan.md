

# DS Werkstatt - Phase 1: UI-Gerüst

## Zusammenfassung

Die **DS Werkstatt** ist ein neuer Hauptbereich in der DataPilot App, in dem Lernende den kompletten CRISP-DM-Zyklus interaktiv durchlaufen können. In Phase 1 bauen wir nur das **UI-Gerüst** mit Mock-Daten - die eigentliche ML-Engine (Pyodide, sklearn) wird später integriert.

Der zentrale Vorteil: Die DS Werkstatt nutzt das bestehende Glossar mit 100+ Begriffen. Fachbegriffe werden als klickbare Links zum Nachschlagen-Bereich dargestellt.

## Was wird gebaut

```text
┌─────────────────────────────────────────────────────────────┐
│                      DS Werkstatt                           │
├─────────────────────────────────────────────────────────────┤
│  • Onboarding-Screen (Lokal vs. Sync)                       │
│  • Projektliste mit CRUD-Funktionen                         │
│  • Projekt-Wizard (2 Schritte)                             │
│  • CRISP-DM Stepper (6 Phasen)                             │
│  • Phasen-UI (1× voll, 5× Placeholder)                     │
│  • Export/Import Modal                                      │
│  • GlossaryLink-Komponente                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementierungs-Schritte

### 1. TypeScript-Interfaces und Engine-Struktur erstellen

**Neue Dateien:**
- `src/engine/types.ts` - Alle Interfaces (WorkspaceProject, CrispDmPhase, etc.)
- `src/engine/workspace/WorkspaceStorage.ts` - LocalStorage Mock-Implementation
- `src/engine/workspace/WorkspaceExporter.ts` - Export/Import Mock
- `src/engine/workspace/hashUtils.ts` - SHA-256 Hash Placeholder
- `src/engine/pyodide/PyodideWorker.ts` - Interface (Mock)
- `src/engine/data/DataGenerator.ts` - Interface (Mock)
- `src/engine/tutor/TutorService.ts` - Interface (Mock)
- `src/types/index.ts` - Re-Export

### 2. Custom Hooks erstellen

**Neue Dateien:**
- `src/hooks/useWorkspace.ts` - Projektverwaltung (LocalStorage CRUD)
- `src/hooks/useProject.ts` - Aktives Projekt, Phasen-Navigation

### 3. GlossaryLink-Komponente

**Neue Datei:** `src/components/werkstatt/GlossaryLink.tsx`

```text
Beispiel: 
"Hier behandelst du [fehlende Werte] und wendest [Feature Engineering] an."
                     ↳ klickbar, führt zu /nachschlagen/begriffe
```

Styling: `text-orange-500 hover:text-orange-600 underline decoration-dotted`

### 4. Werkstatt-Komponenten

**Neue Dateien in `src/components/werkstatt/`:**

| Komponente | Beschreibung |
|------------|--------------|
| `OnboardingScreen.tsx` | Lokal vs. Sync Auswahl (einmalig) |
| `ProjectList.tsx` | Übersicht aller Projekte |
| `ProjectCard.tsx` | Einzelne Projektkarte mit Dropdown |
| `NewProjectWizard.tsx` | 2-Schritt-Wizard |
| `DataImportZone.tsx` | Drag & Drop für CSV/Excel |
| `CrispDmStepper.tsx` | Horizontaler/vertikaler Phasen-Stepper |
| `CrispDmPhaseWrapper.tsx` | Container mit Tutor-Tipp, Glossar-Links |
| `ExportModal.tsx` | Export-Optionen Dialog |
| `WorkspaceStatusBar.tsx` | Status-Leiste unten |

### 5. CRISP-DM Phasen-Komponenten

**Neue Dateien in `src/components/werkstatt/phases/`:**

| Phase | Komponente | Status |
|-------|------------|--------|
| Business Understanding | `BusinessUnderstanding.tsx` | Voll funktional |
| Data Understanding | `DataUnderstanding.tsx` | Placeholder |
| Data Preparation | `DataPreparation.tsx` | Placeholder |
| Modeling | `Modeling.tsx` | Placeholder |
| Evaluation | `Evaluation.tsx` | Placeholder |
| Deployment | `Deployment.tsx` | Placeholder |

Die **Business Understanding** Phase enthält:
- Use Case Zusammenfassung
- Feature-Tabelle (editierbar)
- GlossaryLinks zu relevanten Begriffen

Alle **Placeholder** enthalten:
- Icon + Beschreibung
- "Kommt bald" Badge
- Relevante Glossar-Links

### 6. Seiten erstellen

**Neue Dateien in `src/pages/`:**
- `werkstatt/WerkstattPage.tsx` - Hauptseite (Onboarding oder Projektliste)
- `werkstatt/ProjectPage.tsx` - Einzelnes Projekt mit CRISP-DM

### 7. Navigation erweitern

**Änderungen:**
- `src/components/layout/AppSidebar.tsx` - Neuer Eintrag "DS Werkstatt" mit FlaskConical Icon
- `src/components/layout/MobileBottomNav.tsx` - Neues Tab "Werkstatt"
- `src/App.tsx` - Neue Routen `/werkstatt`, `/werkstatt/neu`, `/werkstatt/:projectId`
- `src/pages/Index.tsx` - Neuer Bereich in der Übersicht

### 8. Mock-Daten

Ein Demo-Projekt wird beim ersten Besuch automatisch erstellt:
- Name: "Kundenabwanderung vorhersagen"
- Typ: Klassifikation
- Phase: Data Preparation (2 Phasen abgeschlossen)

---

## Technische Details

### Ordnerstruktur

```text
src/
├── engine/                    ← NEU: Engine-Interfaces + Mocks
│   ├── types.ts
│   ├── workspace/
│   │   ├── WorkspaceStorage.ts
│   │   ├── WorkspaceExporter.ts
│   │   └── hashUtils.ts
│   ├── pyodide/
│   │   └── PyodideWorker.ts
│   ├── data/
│   │   └── DataGenerator.ts
│   └── tutor/
│       └── TutorService.ts
├── components/werkstatt/      ← NEU: UI-Komponenten
│   ├── OnboardingScreen.tsx
│   ├── ProjectList.tsx
│   ├── ProjectCard.tsx
│   ├── NewProjectWizard.tsx
│   ├── DataImportZone.tsx
│   ├── CrispDmStepper.tsx
│   ├── CrispDmPhaseWrapper.tsx
│   ├── GlossaryLink.tsx
│   ├── ExportModal.tsx
│   ├── WorkspaceStatusBar.tsx
│   └── phases/
│       ├── BusinessUnderstanding.tsx
│       ├── DataUnderstanding.tsx
│       ├── DataPreparation.tsx
│       ├── Modeling.tsx
│       ├── Evaluation.tsx
│       └── Deployment.tsx
├── pages/werkstatt/           ← NEU: Seiten
│   ├── WerkstattPage.tsx
│   └── ProjectPage.tsx
└── hooks/
    ├── useWorkspace.ts        ← NEU
    └── useProject.ts          ← NEU
```

### Routing

| Route | Komponente | Beschreibung |
|-------|------------|--------------|
| `/werkstatt` | WerkstattPage | Onboarding oder Projektliste |
| `/werkstatt/neu` | NewProjectWizard | Neues Projekt erstellen |
| `/werkstatt/:projectId` | ProjectPage | CRISP-DM Stepper + aktive Phase |

### LocalStorage Keys

| Key | Inhalt |
|-----|--------|
| `ds-werkstatt-onboarding-done` | Boolean - Onboarding abgeschlossen |
| `ds-werkstatt-mode` | `"local"` oder `"sync"` |
| `ds-werkstatt-projects` | JSON Array mit Projekten |

### Design System (bestehend)

```text
Primary:     Orange (orange-500)
Cards:       bg-white rounded-xl border border-gray-200 p-6
Highlights:  bg-orange-50 border border-orange-200
Buttons:     rounded-xl px-6 py-3
Icons:       Lucide React
```

---

## Dateien-Übersicht

**Neue Dateien (ca. 25):**

1. `src/engine/types.ts`
2. `src/engine/workspace/WorkspaceStorage.ts`
3. `src/engine/workspace/WorkspaceExporter.ts`
4. `src/engine/workspace/hashUtils.ts`
5. `src/engine/pyodide/PyodideWorker.ts`
6. `src/engine/data/DataGenerator.ts`
7. `src/engine/tutor/TutorService.ts`
8. `src/types/index.ts`
9. `src/hooks/useWorkspace.ts`
10. `src/hooks/useProject.ts`
11. `src/components/werkstatt/GlossaryLink.tsx`
12. `src/components/werkstatt/OnboardingScreen.tsx`
13. `src/components/werkstatt/ProjectList.tsx`
14. `src/components/werkstatt/ProjectCard.tsx`
15. `src/components/werkstatt/NewProjectWizard.tsx`
16. `src/components/werkstatt/DataImportZone.tsx`
17. `src/components/werkstatt/CrispDmStepper.tsx`
18. `src/components/werkstatt/CrispDmPhaseWrapper.tsx`
19. `src/components/werkstatt/ExportModal.tsx`
20. `src/components/werkstatt/WorkspaceStatusBar.tsx`
21. `src/components/werkstatt/phases/BusinessUnderstanding.tsx`
22. `src/components/werkstatt/phases/DataUnderstanding.tsx`
23. `src/components/werkstatt/phases/DataPreparation.tsx`
24. `src/components/werkstatt/phases/Modeling.tsx`
25. `src/components/werkstatt/phases/Evaluation.tsx`
26. `src/components/werkstatt/phases/Deployment.tsx`
27. `src/pages/werkstatt/WerkstattPage.tsx`
28. `src/pages/werkstatt/ProjectPage.tsx`

**Geänderte Dateien (4):**
1. `src/App.tsx` - Neue Routen
2. `src/components/layout/AppSidebar.tsx` - Neuer Nav-Eintrag
3. `src/components/layout/MobileBottomNav.tsx` - Neues Tab
4. `src/pages/Index.tsx` - Neuer Bereich

---

## Wichtige Hinweise

- **Nur UI-Gerüst** - keine echte ML-Logik
- **Mock-Daten** - alles ist klickbar und testbar
- **Deutsch** - alle Texte, Labels, Tooltips
- **Mobile-First** - Stepper vertikal auf Mobile
- **Bestehende App unverändert** - Lernen, Üben, Nachschlagen bleiben intakt
- **Glossar-Integration** - GlossaryLink-Komponente verknüpft Begriffe

