// LocalStorage-based Workspace Storage
import { WorkspaceState, WorkspaceProject, DEFAULT_CRISP_DM_PHASES, CrispDmPhaseId } from '../types';

const STORAGE_KEYS = {
  onboardingDone: 'ds-werkstatt-onboarding-done',
  mode: 'ds-werkstatt-mode',
  projects: 'ds-werkstatt-projects',
};

/** Check if a project ID belongs to an example template */
export function isExampleProject(id: string): boolean {
  return id.startsWith('demo-') || id.startsWith('example-');
}

// 10 Example project templates (static, never stored in LocalStorage)
const EXAMPLE_PROJECTS: WorkspaceProject[] = [
  // --- Echte Daten: Berlin Open Data (4) ---
  {
    id: 'example-berlin-kfz',
    name: 'Kfz-Diebstahl Berlin',
    description: 'Klassifikation: Wird ein Kfz-Aufbruch vollendet oder bleibt es beim Versuch? Echte Polizeidaten, täglich aktualisiert.',
    type: 'klassifikation',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    currentPhase: 'business-understanding',
    phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
    features: [
      { id: 'f1', name: 'VERSUCH', type: 'kategorial', description: 'Ja = nur Versuch, Nein = Diebstahl vollendet', isTarget: true },
      { id: 'f2', name: 'TATZEIT_ANFANG_STUNDE', type: 'kategorial', description: 'Stunde des Tatbeginns (00:00–23:00)' },
      { id: 'f3', name: 'WOCHENTAG', type: 'kategorial', description: 'Wochentag (Montag–Sonntag)' },
      { id: 'f4', name: 'MONAT', type: 'numerisch', description: 'Monat (1–12)' },
      { id: 'f5', name: 'BEZIRK', type: 'kategorial', description: 'Berliner Bezirk' },
      { id: 'f6', name: 'DELIKT', type: 'kategorial', description: 'Einfacher oder Schwerer Diebstahl' },
      { id: 'f7', name: 'EINDRINGEN_IN_KFZ', type: 'kategorial', description: 'Einbruchsmethode (Seitenscheibe, Aufhebeln, etc.)' },
      { id: 'f8', name: 'ERLANGTES_GUT', type: 'kategorial', description: 'Was wurde gestohlen (Kennzeichen, Werkzeug, etc.)' },
      { id: 'f9', name: 'SCHADENSHOEHE', type: 'numerisch', description: 'Geschätzter Schaden in Euro' },
    ],
    businessGoal: 'Vorhersagen, ob ein Kfz-Aufbruch vollendet wird oder beim Versuch bleibt – basierend auf Tatzeit, Ort und Methode. Echte Polizeidaten aus Berlin.',
    successCriteria: 'Accuracy > 75%, Precision für "Versuch" > 60%',
    hasDemoData: true,
    selectedDataset: 'berlin-kfz-diebstahl',
  },
  {
    id: 'example-berlin-kriminalitaet',
    name: 'Kriminalitätsatlas Berlin',
    description: 'Clustering: Berliner Kieze nach Kriminalitätsprofil gruppieren – 138 Bezirksregionen, 17 Deliktsarten.',
    type: 'clustering',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    currentPhase: 'business-understanding',
    phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
    features: [
      { id: 'f1', name: 'Bezeichnung', type: 'text', description: 'Name der Bezirksregion' },
      { id: 'f2', name: 'Straftaten_insgesamt', type: 'numerisch', description: 'Alle Straftaten' },
      { id: 'f3', name: 'Raub', type: 'numerisch', description: 'Raubdelikte' },
      { id: 'f4', name: 'Strassenraub', type: 'numerisch', description: 'Straßenraub, Handtaschenraub' },
      { id: 'f5', name: 'Koerperverletzung_insgesamt', type: 'numerisch', description: 'Alle Körperverletzungen' },
      { id: 'f6', name: 'Gefaehrliche_KV', type: 'numerisch', description: 'Gefährliche und schwere KV' },
      { id: 'f7', name: 'Wohnungseinbruch', type: 'numerisch', description: 'Wohnungseinbruchdiebstahl' },
      { id: 'f8', name: 'Kfz_Diebstahl', type: 'numerisch', description: 'Diebstahl von Kraftfahrzeugen' },
      { id: 'f9', name: 'Fahrrad_Diebstahl', type: 'numerisch', description: 'Fahrraddiebstahl' },
      { id: 'f10', name: 'Taschendiebstahl', type: 'numerisch', description: 'Taschendiebstahl' },
      { id: 'f11', name: 'Sachbeschaedigung_Kfz', type: 'numerisch', description: 'Sachbeschädigung an Kfz' },
    ],
    businessGoal: 'Berliner Bezirksregionen nach ihrem Kriminalitätsprofil gruppieren, um Hotspots und ähnliche Kieze zu identifizieren.',
    successCriteria: 'Silhouette Score > 0.35, 3-6 interpretierbare Cluster',
    hasDemoData: true,
    selectedDataset: 'berlin-kriminalitaetsatlas',
  },
  {
    id: 'example-berlin-abwasser',
    name: 'Viruslast im Abwasser Berlin',
    description: 'Regression: Influenza-Viruslast im Berliner Abwasser vorhersagen – Frühwarnsystem für Grippewellen.',
    type: 'regression',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    currentPhase: 'business-understanding',
    phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
    features: [
      { id: 'f1', name: 'Klaerwerk', type: 'kategorial', description: 'Klärwerk (Ruhleben, Schönerlinde, Waßmannsdorf)' },
      { id: 'f2', name: 'Durchfluss', type: 'numerisch', description: 'Durchfluss im Klärwerk (m³)' },
      { id: 'f3', name: 'Temperatur', type: 'numerisch', description: 'Abwassertemperatur (°C)' },
      { id: 'f4', name: 'pH', type: 'numerisch', description: 'pH-Wert des Abwassers' },
      { id: 'f5', name: 'Viruslast_Influenza_A', type: 'numerisch', description: 'Influenza A Genkopien/Liter', isTarget: true },
      { id: 'f6', name: 'Viruslast_Influenza_B', type: 'numerisch', description: 'Influenza B Genkopien/Liter' },
      { id: 'f7', name: 'Viruslast_RSV', type: 'numerisch', description: 'RSV Genkopien/Liter' },
      { id: 'f8', name: 'Monat', type: 'numerisch', description: 'Monat (1–12)' },
      { id: 'f9', name: 'Kalenderwoche', type: 'numerisch', description: 'Kalenderwoche' },
    ],
    businessGoal: 'Influenza-Viruslast im Berliner Abwasser vorhersagen, um Grippewellen frühzeitig zu erkennen. Echte Messdaten von 3 Klärwerken.',
    successCriteria: 'R² > 0.60, RMSE deutlich unter Standardabweichung der Viruslast',
    hasDemoData: true,
    selectedDataset: 'berlin-abwasser-viruslast',
  },
  {
    id: 'example-berlin-rad',
    name: 'Radzähldaten Berlin',
    description: 'Regression: Radverkehr an Berliner Zählstellen vorhersagen – stündliche Messdaten mit saisonalen Mustern.',
    type: 'regression',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    currentPhase: 'business-understanding',
    phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
    features: [
      { id: 'f1', name: 'Zaehlstelle', type: 'kategorial', description: 'Name der Dauerzählstelle' },
      { id: 'f2', name: 'Anzahl', type: 'numerisch', description: 'Gezählte Fahrräder in dieser Stunde', isTarget: true },
      { id: 'f3', name: 'Stunde', type: 'numerisch', description: 'Stunde des Tages (0–23)' },
      { id: 'f4', name: 'Wochentag', type: 'kategorial', description: 'Wochentag (Montag–Sonntag)' },
      { id: 'f5', name: 'Monat', type: 'numerisch', description: 'Monat (1–12)' },
      { id: 'f6', name: 'Ist_Wochenende', type: 'kategorial', description: 'Samstag/Sonntag = Ja' },
    ],
    businessGoal: 'Radverkehrsaufkommen an Berliner Dauerzählstellen vorhersagen – basierend auf Tageszeit, Wochentag und Jahreszeit.',
    successCriteria: 'R² > 0.65, MAE < 50 Fahrräder pro Stunde',
    hasDemoData: true,
    selectedDataset: 'berlin-radzaehldaten',
  },
  // --- Echte Daten: Klassische Datensätze (2) ---
  {
    id: 'example-titanic',
    name: 'Titanic – Wer überlebt?',
    description: 'Klassifikation: Überlebensvorhersage der Titanic-Passagiere – ein Klassiker für Entscheidungsbäume',
    type: 'klassifikation',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    currentPhase: 'business-understanding',
    phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
    features: [
      { id: 'f1', name: 'Pclass', type: 'kategorial', description: 'Passagierklasse (1 = Erste, 2 = Zweite, 3 = Dritte)' },
      { id: 'f2', name: 'Sex', type: 'kategorial', description: 'Geschlecht (male/female)' },
      { id: 'f3', name: 'Age', type: 'numerisch', description: 'Alter in Jahren (Achtung: ~20% fehlende Werte!)' },
      { id: 'f4', name: 'SibSp', type: 'numerisch', description: 'Anzahl Geschwister oder Ehepartner an Bord' },
      { id: 'f5', name: 'Parch', type: 'numerisch', description: 'Anzahl Eltern oder Kinder an Bord' },
      { id: 'f6', name: 'Fare', type: 'numerisch', description: 'Ticketpreis in britischen Pfund' },
      { id: 'f7', name: 'Embarked', type: 'kategorial', description: 'Einschiffungshafen (C = Cherbourg, Q = Queenstown, S = Southampton)' },
      { id: 'f8', name: 'Survived', type: 'kategorial', description: 'Überlebt? (0 = Nein, 1 = Ja)', isTarget: true },
    ],
    businessGoal: 'Vorhersagen, welche Passagiere die Titanic-Katastrophe überlebt haben – basierend auf Merkmalen wie Klasse, Geschlecht und Alter. Ideal zum Lernen von Entscheidungsbäumen.',
    successCriteria: 'Accuracy > 78%, Entscheidungsbaum soll interpretierbar sein (max_depth ≤ 5)',
    hasDemoData: true,
    selectedDataset: 'titanic',
  },
  {
    id: 'example-iris',
    name: 'Iris – Blumenarten klassifizieren',
    description: 'Klassifikation: Schwertlilien anhand von Blütenmerkmalen der richtigen Art zuordnen – der Klassiker für Entscheidungsbäume',
    type: 'klassifikation',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    currentPhase: 'business-understanding',
    phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
    features: [
      { id: 'f1', name: 'SepalLength', type: 'numerisch', description: 'Länge des Kelchblatts in cm' },
      { id: 'f2', name: 'SepalWidth', type: 'numerisch', description: 'Breite des Kelchblatts in cm' },
      { id: 'f3', name: 'PetalLength', type: 'numerisch', description: 'Länge des Blütenblatts in cm' },
      { id: 'f4', name: 'PetalWidth', type: 'numerisch', description: 'Breite des Blütenblatts in cm' },
      { id: 'f5', name: 'Species', type: 'kategorial', description: 'Blumenart (setosa, versicolor, virginica)', isTarget: true },
    ],
    businessGoal: 'Schwertlilien (Iris) anhand ihrer Blütenmerkmale automatisch der richtigen Art zuordnen. Perfekt zum Lernen von Entscheidungsbäumen und explorativer Datenvisualisierung.',
    successCriteria: 'Accuracy > 90%, Entscheidungsbaum soll interpretierbar sein (max_depth ≤ 4)',
    hasDemoData: true,
    selectedDataset: 'iris',
  },
  // --- Synthetische Szenarien (4) ---
  {
    id: 'example-churn',
    name: 'Kundenabwanderung vorhersagen',
    description: 'Klassifikationsmodell zur Vorhersage von Kundenabwanderung (Churn) in der Telekommunikationsbranche',
    type: 'klassifikation',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    currentPhase: 'business-understanding',
    phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
    features: [
      { id: 'f1', name: 'Alter', type: 'numerisch', description: 'Alter des Kunden in Jahren' },
      { id: 'f2', name: 'Vertragslaufzeit_Monate', type: 'numerisch', description: 'Vertragsdauer in Monaten' },
      { id: 'f3', name: 'Monatliche_Kosten', type: 'numerisch', description: 'Monatliche Gebühren in EUR' },
      { id: 'f4', name: 'Support_Tickets', type: 'numerisch', description: 'Anzahl Support-Anfragen im letzten Jahr' },
      { id: 'f5', name: 'Churn', type: 'kategorial', description: 'Hat der Kunde gekündigt? (Ja/Nein)', isTarget: true },
    ],
    businessGoal: 'Kunden identifizieren, die wahrscheinlich kündigen werden, um rechtzeitig Retentionsmaßnahmen einzuleiten.',
    successCriteria: 'Precision > 70%, Recall > 60% für die Klasse "Churn = Ja"',
    hasDemoData: true,
  },
  // --- Regression (2) ---
  {
    id: 'example-housing',
    name: 'Immobilienpreise schätzen',
    description: 'Regressionsmodell zur Schätzung von Immobilienpreisen basierend auf Objektmerkmalen',
    type: 'regression',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    currentPhase: 'business-understanding',
    phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
    features: [
      { id: 'f1', name: 'Wohnflaeche_qm', type: 'numerisch', description: 'Wohnfläche in Quadratmetern' },
      { id: 'f2', name: 'Anzahl_Zimmer', type: 'numerisch', description: 'Anzahl der Zimmer' },
      { id: 'f3', name: 'Baujahr', type: 'numerisch', description: 'Baujahr der Immobilie' },
      { id: 'f4', name: 'Entfernung_Zentrum_km', type: 'numerisch', description: 'Entfernung zum Stadtzentrum in km' },
      { id: 'f5', name: 'Hat_Garten', type: 'kategorial', description: 'Verfügt die Immobilie über einen Garten? (Ja/Nein)' },
      { id: 'f6', name: 'Preis_EUR', type: 'numerisch', description: 'Verkaufspreis in EUR', isTarget: true },
    ],
    businessGoal: 'Marktgerechte Preisschätzungen für Immobilien liefern, um Käufern und Verkäufern fundierte Entscheidungen zu ermöglichen.',
    successCriteria: 'R² > 0.75, RMSE < 50.000 EUR',
    hasDemoData: true,
  },
  {
    id: 'example-sales',
    name: 'Umsatzprognose',
    description: 'Regressionsmodell zur Vorhersage des Filialumsatzes im Einzelhandel',
    type: 'regression',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    currentPhase: 'business-understanding',
    phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
    features: [
      { id: 'f1', name: 'Werbebudget_EUR', type: 'numerisch', description: 'Monatliches Werbebudget in EUR' },
      { id: 'f2', name: 'Jahreszeit', type: 'kategorial', description: 'Jahreszeit (Frühling/Sommer/Herbst/Winter)' },
      { id: 'f3', name: 'Filialgroesse_qm', type: 'numerisch', description: 'Verkaufsfläche der Filiale in qm' },
      { id: 'f4', name: 'Mitarbeiteranzahl', type: 'numerisch', description: 'Anzahl der Mitarbeiter in der Filiale' },
      { id: 'f5', name: 'Kundenfrequenz', type: 'numerisch', description: 'Durchschnittliche Kundenbesuche pro Tag' },
      { id: 'f6', name: 'Umsatz_EUR', type: 'numerisch', description: 'Monatlicher Filialumsatz in EUR', isTarget: true },
    ],
    businessGoal: 'Monatliche Umsätze pro Filiale prognostizieren, um Personalplanung und Wareneinsatz zu optimieren.',
    successCriteria: 'R² > 0.70, MAE < 10.000 EUR',
    hasDemoData: true,
  },
  // --- Clustering (1) ---
  {
    id: 'example-segments',
    name: 'Kundensegmentierung',
    description: 'Clustering-Analyse zur Identifikation von Kundengruppen im E-Commerce',
    type: 'clustering',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    currentPhase: 'business-understanding',
    phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
    features: [
      { id: 'f1', name: 'Jahresumsatz_EUR', type: 'numerisch', description: 'Gesamtumsatz des Kunden im letzten Jahr in EUR' },
      { id: 'f2', name: 'Bestellhaeufigkeit', type: 'numerisch', description: 'Anzahl der Bestellungen pro Jahr' },
      { id: 'f3', name: 'Durchschn_Warenkorb', type: 'numerisch', description: 'Durchschnittlicher Warenkorbwert in EUR' },
      { id: 'f4', name: 'Kundenalter_Jahre', type: 'numerisch', description: 'Alter des Kunden in Jahren' },
      { id: 'f5', name: 'Retourenquote', type: 'numerisch', description: 'Anteil retournierter Bestellungen (0-1)' },
    ],
    businessGoal: 'Homogene Kundengruppen identifizieren, um gezielte Marketingkampagnen und personalisierte Angebote zu erstellen.',
    successCriteria: 'Silhouette Score > 0.4, 3-6 interpretierbare Cluster',
    hasDemoData: true,
  },
];

export class WorkspaceStorage {
  static getOnboardingDone(): boolean {
    return localStorage.getItem(STORAGE_KEYS.onboardingDone) === 'true';
  }

  static setOnboardingDone(done: boolean): void {
    localStorage.setItem(STORAGE_KEYS.onboardingDone, String(done));
  }

  static getMode(): 'local' | 'sync' {
    const mode = localStorage.getItem(STORAGE_KEYS.mode);
    return mode === 'sync' ? 'sync' : 'local';
  }

  static setMode(mode: 'local' | 'sync'): void {
    localStorage.setItem(STORAGE_KEYS.mode, mode);
  }

  static getProjects(): WorkspaceProject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.projects);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static setProjects(projects: WorkspaceProject[]): void {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('werkstatt-projects-changed'));
    }
  }

  static getProject(id: string): WorkspaceProject | undefined {
    return this.getProjects().find(p => p.id === id);
  }

  /** Get all 10 example project templates (static, never in LocalStorage) */
  static getExampleProjects(): WorkspaceProject[] {
    return EXAMPLE_PROJECTS.map(p => ({
      ...p,
      phases: DEFAULT_CRISP_DM_PHASES.map(ph => ({ ...ph })),
    }));
  }

  /** Clone an example project as a user project in LocalStorage */
  static cloneExampleProject(exampleId: string): WorkspaceProject {
    const example = EXAMPLE_PROJECTS.find(p => p.id === exampleId);
    if (!example) {
      throw new Error(`Example project not found: ${exampleId}`);
    }

    const now = new Date().toISOString();
    const clone: WorkspaceProject = {
      ...example,
      id: `project-${Date.now()}`,
      name: `Kopie: ${example.name}`,
      createdAt: now,
      updatedAt: now,
      hasDemoData: false,
      phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
      features: example.features.map(f => ({ ...f })),
    };

    const projects = this.getProjects();
    projects.push(clone);
    this.setProjects(projects);
    return clone;
  }

  /** Clone a user project (deep copy with new ID and timestamps) */
  static cloneUserProject(projectId: string): WorkspaceProject {
    const original = this.getProject(projectId);
    if (!original) {
      throw new Error(`User project not found: ${projectId}`);
    }

    const now = new Date().toISOString();
    const clone: WorkspaceProject = {
      ...original,
      id: `project-${Date.now()}-clone`,
      name: `Kopie: ${original.name}`,
      createdAt: now,
      updatedAt: now,
      phases: original.phases.map(p => ({ ...p })),
      features: original.features.map(f => ({ ...f })),
      pipelineSteps: original.pipelineSteps?.map(s => ({ ...s })),
      trainedModels: original.trainedModels?.map(m => ({
        ...m,
        metrics: { ...m.metrics, confusionMatrix: m.metrics.confusionMatrix?.map(row => [...row]) },
        featureImportances: m.featureImportances?.map(fi => ({ ...fi })),
        hyperparameters: { ...m.hyperparameters },
      })),
    };

    const projects = this.getProjects();
    projects.push(clone);
    this.setProjects(projects);
    return clone;
  }

  static createProject(project: Omit<WorkspaceProject, 'id' | 'createdAt' | 'updatedAt' | 'phases'>): WorkspaceProject {
    const newProject: WorkspaceProject = {
      ...project,
      id: `project-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      phases: DEFAULT_CRISP_DM_PHASES.map(p => ({ ...p })),
    };
    const projects = this.getProjects();
    projects.push(newProject);
    this.setProjects(projects);
    return newProject;
  }

  static updateProject(id: string, updates: Partial<WorkspaceProject>): WorkspaceProject | undefined {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index === -1) return undefined;

    projects[index] = {
      ...projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.setProjects(projects);
    return projects[index];
  }

  static deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    if (filtered.length === projects.length) return false;
    this.setProjects(filtered);
    return true;
  }

  static updatePhaseStatus(projectId: string, phaseId: CrispDmPhaseId, status: 'pending' | 'in-progress' | 'completed'): void {
    const project = this.getProject(projectId);
    if (!project) return;

    const phases = project.phases.map(p => {
      if (p.id === phaseId) {
        return {
          ...p,
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : undefined,
        };
      }
      return p;
    });

    this.updateProject(projectId, { phases });
  }

  static initializeWithDemo(): void {
    // No-op: example projects are now static templates, not stored in LocalStorage.
    // Kept for backward compatibility with useWorkspace hook.
  }

  static getState(): WorkspaceState {
    return {
      onboardingDone: this.getOnboardingDone(),
      mode: this.getMode(),
      projects: this.getProjects(),
    };
  }

  static clear(): void {
    localStorage.removeItem(STORAGE_KEYS.onboardingDone);
    localStorage.removeItem(STORAGE_KEYS.mode);
    localStorage.removeItem(STORAGE_KEYS.projects);
  }
}
