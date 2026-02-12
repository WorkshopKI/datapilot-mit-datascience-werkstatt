/**
 * Berlin Open Data Datensatz-Registry.
 * Metadaten und Konfiguration für alle verfügbaren Beispieldatensätze.
 */

export type DatasetId =
  | 'titanic'
  | 'iris'
  | 'berlin-kfz-diebstahl'
  | 'berlin-kriminalitaetsatlas'
  | 'berlin-radzaehldaten'
  | 'berlin-abwasser-viruslast';

export type ProjectType = 'klassifikation' | 'regression' | 'clustering';

export interface DatasetInfo {
  id: DatasetId;
  name: string;
  emoji: string;
  description: string;
  /** Einzeiler für die Business-Frage */
  businessQuestion: string;
  source: string;
  sourceUrl: string;
  license: string;
  updateFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'static';
  /** Pfad zur gebündelten CSV in public/data/ */
  bundledCsvPath: string;
  /** URL zum Live-Download (falls User aktuelle Version will) */
  liveDownloadUrl?: string;
  /** Datum des gebündelten Snapshots */
  bundledDate: string;
  mlType: ProjectType;
  /** Erwartete Anzahl Zeilen (ungefähr) */
  approxRows: number;
  columns: number;
  /** Vorgeschlagene Ziel-Variable */
  suggestedTarget: string;
  /** Vorgeschlagene Features */
  suggestedFeatures: string[];
  /** Feature-Definitionen für automatische Projekterstellung */
  featureDefinitions: FeatureDefinition[];
  /** Besondere Hinweise für Data Understanding */
  dataHints: string[];
  /** Braucht LOR-Lookup? */
  requiresLorLookup: boolean;
  /** CSV-Parsing-Optionen */
  csvOptions?: {
    delimiter?: string;
    encoding?: string;
    skipRows?: number;
  };
  /** Tags für Kategorisierung */
  tags: string[];
  /** Ist Berlin Open Data? */
  isBerlinOpenData: boolean;
}

export interface FeatureDefinition {
  name: string;
  type: 'numerical' | 'categorical' | 'datetime' | 'text';
  isTarget: boolean;
  description: string;
}

// ────────────────────────────────────────────────────────────────
// Datensatz-Definitionen
// ────────────────────────────────────────────────────────────────

export const DATASET_REGISTRY: Record<DatasetId, DatasetInfo> = {

  // === Klassische Datensätze ===

  'titanic': {
    id: 'titanic',
    name: 'Titanic',
    emoji: '🚢',
    description: 'Passagierdaten der Titanic (1912). Wer überlebt die Katastrophe?',
    businessQuestion: 'Welche Passagiere überleben mit welcher Wahrscheinlichkeit?',
    source: 'Kaggle / Public Domain',
    sourceUrl: 'https://www.kaggle.com/c/titanic',
    license: 'Public Domain',
    updateFrequency: 'static',
    bundledCsvPath: '/data/titanic.csv',
    bundledDate: '2024-01-01',
    mlType: 'klassifikation',
    approxRows: 891,
    columns: 12,
    suggestedTarget: 'Survived',
    suggestedFeatures: ['Pclass', 'Sex', 'Age', 'SibSp', 'Parch', 'Fare', 'Embarked'],
    featureDefinitions: [
      { name: 'Survived', type: 'categorical', isTarget: true, description: 'Überlebt (1) oder nicht (0)' },
      { name: 'Pclass', type: 'categorical', isTarget: false, description: 'Passagierklasse (1, 2, 3)' },
      { name: 'Sex', type: 'categorical', isTarget: false, description: 'Geschlecht' },
      { name: 'Age', type: 'numerical', isTarget: false, description: 'Alter in Jahren' },
      { name: 'SibSp', type: 'numerical', isTarget: false, description: 'Geschwister/Partner an Bord' },
      { name: 'Parch', type: 'numerical', isTarget: false, description: 'Eltern/Kinder an Bord' },
      { name: 'Fare', type: 'numerical', isTarget: false, description: 'Ticketpreis' },
      { name: 'Embarked', type: 'categorical', isTarget: false, description: 'Einschiffungshafen' },
    ],
    dataHints: [
      'Age hat 177 fehlende Werte (19,9%) → Imputation nötig',
      'Embarked hat 2 fehlende Werte',
      'Name und Ticket enthalten als Text-Features wenig Info für einfache Modelle',
    ],
    requiresLorLookup: false,
    tags: ['klassisch', 'klassifikation', 'einsteiger'],
    isBerlinOpenData: false,
  },

  'iris': {
    id: 'iris',
    name: 'Iris Blumen',
    emoji: '🌺',
    description: 'Messungen von 150 Iris-Blüten (3 Arten). Klassischer ML-Datensatz.',
    businessQuestion: 'Welche Iris-Art liegt vor basierend auf Blütenmaßen?',
    source: 'UCI ML Repository / Public Domain',
    sourceUrl: 'https://archive.ics.uci.edu/ml/datasets/Iris',
    license: 'Public Domain',
    updateFrequency: 'static',
    bundledCsvPath: '/data/iris.csv',
    bundledDate: '2024-01-01',
    mlType: 'klassifikation',
    approxRows: 150,
    columns: 5,
    suggestedTarget: 'Species',
    suggestedFeatures: ['SepalLength', 'SepalWidth', 'PetalLength', 'PetalWidth'],
    featureDefinitions: [
      { name: 'SepalLength', type: 'numerical', isTarget: false, description: 'Kelchblattlänge (cm)' },
      { name: 'SepalWidth', type: 'numerical', isTarget: false, description: 'Kelchblattbreite (cm)' },
      { name: 'PetalLength', type: 'numerical', isTarget: false, description: 'Blütenblattlänge (cm)' },
      { name: 'PetalWidth', type: 'numerical', isTarget: false, description: 'Blütenblattbreite (cm)' },
      { name: 'Species', type: 'categorical', isTarget: true, description: 'Iris-Art (Setosa, Versicolor, Virginica)' },
    ],
    dataHints: [
      'Keine fehlenden Werte – ideal zum Einstieg',
      'Setosa ist linear separierbar, Versicolor/Virginica überlappen',
    ],
    requiresLorLookup: false,
    tags: ['klassisch', 'klassifikation', 'clustering', 'einsteiger'],
    isBerlinOpenData: false,
  },

  // === Berlin Open Data ===

  'berlin-kfz-diebstahl': {
    id: 'berlin-kfz-diebstahl',
    name: 'Kfz-Diebstahl Berlin',
    emoji: '🚗',
    description: 'Polizeilich registrierte Diebstähle an und aus Kraftfahrzeugen in Berlin. Einzelfälle mit Tatzeit, Ort, Einbruchsmethode und Schadenshöhe.',
    businessQuestion: 'Wird ein Kfz-Aufbruch vollendet oder bleibt es beim Versuch? Welche Faktoren machen einen erfolgreichen Diebstahl wahrscheinlicher?',
    source: 'Polizei Berlin LKA St 14',
    sourceUrl: 'https://daten.berlin.de/datensaetze/diebstahl-an-aus-kfz',
    license: 'CC-BY',
    updateFrequency: 'daily',
    bundledCsvPath: '/data/berlin-kfz-diebstahl.csv',
    liveDownloadUrl: 'https://www.polizei-berlin.eu/Kfzdiebstahl/Kfzdiebstahl.csv',
    bundledDate: '2026-02-11',
    mlType: 'klassifikation',
    approxRows: 35000,
    columns: 11,
    suggestedTarget: 'VERSUCH',
    suggestedFeatures: ['TATZEIT_ANFANG_STUNDE', 'WOCHENTAG', 'MONAT', 'BEZIRK', 'DELIKT', 'EINDRINGEN_IN_KFZ', 'ERLANGTES_GUT'],
    featureDefinitions: [
      { name: 'VERSUCH', type: 'categorical', isTarget: true, description: 'Ja = nur Versuch, Nein = Diebstahl vollendet' },
      { name: 'TATZEIT_ANFANG_STUNDE', type: 'categorical', isTarget: false, description: 'Stunde des Tatbeginns (00:00–23:00)' },
      { name: 'WOCHENTAG', type: 'categorical', isTarget: false, description: 'Wochentag (Montag–Sonntag) – aus Datum berechnet' },
      { name: 'MONAT', type: 'numerical', isTarget: false, description: 'Monat (1–12) – aus Datum berechnet' },
      { name: 'BEZIRK', type: 'categorical', isTarget: false, description: 'Berliner Bezirk – aus LOR-Code abgeleitet' },
      { name: 'DELIKT', type: 'categorical', isTarget: false, description: 'Einfacher oder Schwerer Diebstahl' },
      { name: 'EINDRINGEN_IN_KFZ', type: 'categorical', isTarget: false, description: 'Einbruchsmethode (Seitenscheibe, Aufhebeln, etc.)' },
      { name: 'ERLANGTES_GUT', type: 'categorical', isTarget: false, description: 'Was wurde gestohlen (Kennzeichen, Werkzeug, etc.)' },
      { name: 'SCHADENSHOEHE', type: 'numerical', isTarget: false, description: 'Geschätzter Schaden in Euro' },
    ],
    dataHints: [
      'CSV nutzt Pipe (|) als Delimiter und Latin-1 Encoding',
      'TATZEIT_ENDE_DATUM und TATZEIT_ENDE_STUNDE oft leer → sinnvoll droppen',
      'LOR-Code (8-stellig) → ersten 2 Ziffern = Bezirk (01=Mitte, 02=Friedrichshain-Kreuzberg, ...)',
      'ERLANGTES_GUT kann Mehrfachwerte enthalten (mit Semikolon getrennt)',
      'SCHADENSHOEHE oft 0 → Bedeutung: unbekannt oder kein Schaden',
      '13% Versuch vs. 87% Vollendung → leichtes Klassenungleichgewicht',
    ],
    requiresLorLookup: true,
    csvOptions: { delimiter: '|', encoding: 'latin-1' },
    tags: ['berlin', 'polizei', 'klassifikation', 'tagesaktuell', 'kriminalität'],
    isBerlinOpenData: true,
  },

  'berlin-kriminalitaetsatlas': {
    id: 'berlin-kriminalitaetsatlas',
    name: 'Kriminalitätsatlas Berlin',
    emoji: '🔒',
    description: 'Fallzahlen für 17 Deliktsbereiche auf Ebene der 138 Berliner Bezirksregionen. Häufigkeitszahlen (pro 100.000 Einwohner) ermöglichen fairen Vergleich.',
    businessQuestion: 'Welche Berliner Kieze haben ein ähnliches Kriminalitätsprofil? Wie lassen sich Bezirksregionen sinnvoll gruppieren?',
    source: 'Polizei Berlin',
    sourceUrl: 'https://daten.berlin.de/datensaetze/kriminalitatsatlas-berlin',
    license: 'CC-BY-SA',
    updateFrequency: 'yearly',
    bundledCsvPath: '/data/berlin-kriminalitaetsatlas-2024.csv',
    bundledDate: '2024-03-27',
    mlType: 'clustering',
    approxRows: 138,
    columns: 19,
    suggestedTarget: '',
    suggestedFeatures: [
      'Straftaten_insgesamt', 'Raub', 'Strassenraub',
      'Koerperverletzung_insgesamt', 'Gefaehrliche_KV',
      'Noetigung_Bedrohung', 'Wohnungseinbruch',
      'Kfz_Diebstahl', 'Fahrrad_Diebstahl', 'Taschendiebstahl',
      'Brandstiftung', 'Sachbeschaedigung_Kfz', 'Rauschgiftkriminalitaet',
    ],
    featureDefinitions: [
      { name: 'LOR_Schluessel', type: 'categorical', isTarget: false, description: 'LOR-Bezirksregions-Code' },
      { name: 'Bezeichnung', type: 'text', isTarget: false, description: 'Name der Bezirksregion' },
      { name: 'Straftaten_insgesamt', type: 'numerical', isTarget: false, description: 'Alle Straftaten' },
      { name: 'Raub', type: 'numerical', isTarget: false, description: 'Raubdelikte' },
      { name: 'Strassenraub', type: 'numerical', isTarget: false, description: 'Straßenraub, Handtaschenraub' },
      { name: 'Koerperverletzung_insgesamt', type: 'numerical', isTarget: false, description: 'Alle Körperverletzungen' },
      { name: 'Gefaehrliche_KV', type: 'numerical', isTarget: false, description: 'Gefährliche und schwere Körperverletzung' },
      { name: 'Noetigung_Bedrohung', type: 'numerical', isTarget: false, description: 'Freiheitsberaubung, Nötigung, Bedrohung' },
      { name: 'Wohnungseinbruch', type: 'numerical', isTarget: false, description: 'Wohnungseinbruchdiebstahl' },
      { name: 'Kfz_Diebstahl', type: 'numerical', isTarget: false, description: 'Diebstahl von Kraftfahrzeugen' },
      { name: 'Fahrrad_Diebstahl', type: 'numerical', isTarget: false, description: 'Fahrraddiebstahl' },
      { name: 'Taschendiebstahl', type: 'numerical', isTarget: false, description: 'Taschendiebstahl' },
      { name: 'Brandstiftung', type: 'numerical', isTarget: false, description: 'Brandstiftung' },
      { name: 'Sachbeschaedigung_Kfz', type: 'numerical', isTarget: false, description: 'Sachbeschädigung an Kfz' },
      { name: 'Rauschgiftkriminalitaet', type: 'numerical', isTarget: false, description: 'Rauschgiftkriminalität' },
    ],
    dataHints: [
      'Aus XLSX konvertiert (Sheet: Fallzahlen_2024, Header ab Zeile 5)',
      'Alexanderplatz (011003) ist ein extremer Outlier → spannend für die Analyse',
      'Skalierung essentiell: Straftaten_insgesamt (Tausende) vs. Brandstiftung (Dutzende)',
      'Alternative: Häufigkeitszahlen (HZ_2024 Sheet) statt Fallzahlen → bereits normalisiert pro 100k EW',
    ],
    requiresLorLookup: false,
    tags: ['berlin', 'polizei', 'clustering', 'kriminalität', 'bezirksregion'],
    isBerlinOpenData: true,
  },

  'berlin-radzaehldaten': {
    id: 'berlin-radzaehldaten',
    name: 'Radzähldaten Berlin',
    emoji: '🚴',
    description: 'Stündliche Zählungen an 35 Dauerzählstellen für Fahrräder in Berlin. Inklusive GPS-Koordinaten der Zählstellen.',
    businessQuestion: 'Wie viele Fahrräder werden morgen an einer bestimmten Zählstelle gezählt? Welche Faktoren beeinflussen den Radverkehr?',
    source: 'Senatsverwaltung für Mobilität, Verkehr, Klimaschutz und Umwelt',
    sourceUrl: 'https://daten.berlin.de/datensaetze/radzahldaten-in-berlin',
    license: 'dl-de-zero-2.0 (frei)',
    updateFrequency: 'yearly',
    bundledCsvPath: '/data/berlin-radzaehldaten-2024.csv',
    bundledDate: '2025-02-06',
    mlType: 'regression',
    approxRows: 8700,
    columns: 7,
    suggestedTarget: 'Anzahl',
    suggestedFeatures: ['Stunde', 'Wochentag', 'Monat', 'Ist_Wochenende', 'Zaehlstelle'],
    featureDefinitions: [
      { name: 'Datum', type: 'datetime', isTarget: false, description: 'Datum und Stunde der Messung' },
      { name: 'Zaehlstelle', type: 'categorical', isTarget: false, description: 'Name der Dauerzählstelle' },
      { name: 'Anzahl', type: 'numerical', isTarget: true, description: 'Gezählte Fahrräder in dieser Stunde' },
      { name: 'Stunde', type: 'numerical', isTarget: false, description: 'Stunde des Tages (0–23)' },
      { name: 'Wochentag', type: 'categorical', isTarget: false, description: 'Wochentag (Montag–Sonntag)' },
      { name: 'Monat', type: 'numerical', isTarget: false, description: 'Monat (1–12)' },
      { name: 'Ist_Wochenende', type: 'categorical', isTarget: false, description: 'Samstag/Sonntag = Ja' },
    ],
    dataHints: [
      'Aus XLSX konvertiert: Originaldatei hat 1 Sheet pro Jahr, Spalten = Zählstellen',
      'Viele Nullwerte → Zählstellen-Ausfälle oder echte Null (Nacht)?',
      'Für die gebündelte CSV wird nur EINE Zählstelle (Jannowitzbrücke Nord) verwendet',
      'Saisonale Muster: Sommer >> Winter, Werktag >> Wochenende, Rush Hour Peaks',
      'Optionale Erweiterung: DWD-Wetterdaten als zusätzliche Features',
    ],
    requiresLorLookup: false,
    tags: ['berlin', 'verkehr', 'regression', 'zeitreihe', 'fahrrad'],
    isBerlinOpenData: true,
  },

  'berlin-abwasser-viruslast': {
    id: 'berlin-abwasser-viruslast',
    name: 'Viruslast im Abwasser Berlin',
    emoji: '🦠',
    description: 'Messung von Influenza A, Influenza B und RSV im Berliner Abwasser. 3 Klärwerke, 2–3× pro Woche, mit Temperatur- und pH-Messwerten.',
    businessQuestion: 'Wie entwickelt sich die Influenza-Viruslast in den nächsten Wochen? Kann man Grippewellen im Abwasser vorhersagen?',
    source: 'LAGeSo Berlin & Berliner Wasserbetriebe',
    sourceUrl: 'https://daten.berlin.de/datensaetze/abwassermonitoring-berlin',
    license: 'dl-de-by-2.0',
    updateFrequency: 'weekly',
    bundledCsvPath: '/data/berlin-abwasser-viruslast.csv',
    liveDownloadUrl: 'https://data.lageso.de/infektionsschutz/opendata/abwassermonitoring/BEWAC_abwassermonitoring_berlin.csv',
    bundledDate: '2026-02-08',
    mlType: 'regression',
    approxRows: 280,
    columns: 9,
    suggestedTarget: 'Viruslast_Influenza_A',
    suggestedFeatures: ['Klaerwerk', 'Monat', 'Kalenderwoche', 'Temperatur', 'pH', 'Durchfluss', 'Viruslast_Influenza_B', 'Viruslast_RSV'],
    featureDefinitions: [
      { name: 'Datum', type: 'datetime', isTarget: false, description: 'Datum der Probennahme' },
      { name: 'Klaerwerk', type: 'categorical', isTarget: false, description: 'Klärwerk (Ruhleben, Schönerlinde, Waßmannsdorf)' },
      { name: 'Durchfluss', type: 'numerical', isTarget: false, description: 'Durchfluss im Klärwerk (m³)' },
      { name: 'Temperatur', type: 'numerical', isTarget: false, description: 'Abwassertemperatur (°C)' },
      { name: 'pH', type: 'numerical', isTarget: false, description: 'pH-Wert des Abwassers' },
      { name: 'Viruslast_Influenza_A', type: 'numerical', isTarget: true, description: 'Influenza A Genkopien/Liter (dPCR)' },
      { name: 'Viruslast_Influenza_B', type: 'numerical', isTarget: false, description: 'Influenza B Genkopien/Liter (dPCR)' },
      { name: 'Viruslast_RSV', type: 'numerical', isTarget: false, description: 'RSV Genkopien/Liter (dPCR)' },
      { name: 'Monat', type: 'numerical', isTarget: false, description: 'Monat (1–12) – aus Datum berechnet' },
      { name: 'Kalenderwoche', type: 'numerical', isTarget: false, description: 'Kalenderwoche – aus Datum berechnet' },
    ],
    dataHints: [
      'Original-CSV hat Semikolon-Delimiter und deutsche Dezimalkommas (z.B. "217860,0000")',
      'Originaldaten sind im Long-Format (1 Zeile pro Erreger) → wurden pivotiert',
      'RSV-Daten erst ab November 2024 verfügbar → fehlende Werte davor',
      'Viruslast = 0 im Sommer (keine Grippesaison) → stark saisonales Muster',
      'Messwerte schwanken stark (Spikes) → Moving Average als Feature sinnvoll',
      'Kleine Datenmenge (~280 Zeilen) → guter Test für Overfitting-Bewusstsein',
      '3 Klärwerke decken ~84% der Berliner Haushalte ab',
    ],
    requiresLorLookup: false,
    csvOptions: { delimiter: ';', encoding: 'utf-8' },
    tags: ['berlin', 'gesundheit', 'regression', 'zeitreihe', 'epidemiologie'],
    isBerlinOpenData: true,
  },
};

/**
 * Get datasets filtered by ML type.
 */
export function getDatasetsByType(type: ProjectType): DatasetInfo[] {
  return Object.values(DATASET_REGISTRY).filter(d => d.mlType === type);
}

/**
 * Get all Berlin Open Data datasets.
 */
export function getBerlinDatasets(): DatasetInfo[] {
  return Object.values(DATASET_REGISTRY).filter(d => d.isBerlinOpenData);
}

/**
 * LOR → Bezirk Mapping (erste 2 Ziffern des 8-stelligen LOR-Codes).
 */
export const LOR_BEZIRK_MAP: Record<string, string> = {
  '01': 'Mitte',
  '02': 'Friedrichshain-Kreuzberg',
  '03': 'Pankow',
  '04': 'Charlottenburg-Wilmersdorf',
  '05': 'Spandau',
  '06': 'Steglitz-Zehlendorf',
  '07': 'Tempelhof-Schöneberg',
  '08': 'Neukölln',
  '09': 'Treptow-Köpenick',
  '10': 'Marzahn-Hellersdorf',
  '11': 'Lichtenberg',
  '12': 'Reinickendorf',
};

/**
 * Derive Bezirk name from 8-digit LOR Planungsraum code.
 */
export function lorToBezirk(lorCode: string): string {
  const prefix = lorCode.substring(0, 2);
  return LOR_BEZIRK_MAP[prefix] ?? 'Unbekannt';
}
