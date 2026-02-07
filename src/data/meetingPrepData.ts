// Meeting Preparation Data: 5 Meeting-Typen mit Checklisten und Fragen

export interface CheckItem {
  id: string;
  label: string;
}

export interface QuestionGroup {
  category: string;
  items: string[];
}

export interface MeetingType {
  id: string;
  name: string;
  emoji: string;
  goal: string;
  description: string;
  participants: string[];
  beforeMeeting: CheckItem[];
  questions: QuestionGroup[];
  redFlags: string[];
  afterMeeting: CheckItem[];
}

export const meetingTypes: MeetingType[] = [
  {
    id: "kickoff",
    name: "Projekt-Kickoff",
    emoji: "🚀",
    goal: "Problem verstehen, Scope definieren, Erwartungen klären",
    description: "Das erste Meeting mit den Stakeholdern – hier wird die Grundlage für das gesamte Projekt gelegt.",
    participants: [
      "Business Stakeholder / Sponsor",
      "Data Scientist / ML Engineer",
      "Product Manager / PM",
      "Optional: Data Engineer, Fachexperte, Legal",
    ],
    beforeMeeting: [
      { id: "k1", label: "Business Owner / Sponsor identifiziert" },
      { id: "k2", label: "Grundlegendes Problem-Verständnis (aus Vorab-Infos)" },
      { id: "k3", label: "Teilnehmer und ihre Rollen bekannt" },
      { id: "k4", label: "Agenda vorbereitet und geteilt" },
      { id: "k5", label: "Zeitrahmen und Meilensteine grob überlegt" },
    ],
    questions: [
      {
        category: "Problemverständnis",
        items: [
          "Können Sie mir ein konkretes Beispiel geben, wo das Problem aufgetreten ist?",
          "Was passiert, wenn wir das Problem nicht lösen?",
          "Wie wird das Problem heute gelöst (ohne ML)?",
          "Wie groß ist der Impact (€, Zeit, Kunden)?",
        ],
      },
      {
        category: "Entscheidung & Aktion",
        items: [
          "Wer trifft die Entscheidung auf Basis der Vorhersage?",
          "Wie oft wird diese Entscheidung getroffen?",
          "Was genau würde sich ändern, wenn wir gute Vorhersagen hätten?",
          "Gibt es Kapazitätsgrenzen (z.B. Team kann nur 100 Fälle/Woche bearbeiten)?",
        ],
      },
      {
        category: "Erfolgsmessung",
        items: [
          "Welchen Business-KPI wollen wir verbessern?",
          "Welche Verbesserung wäre ein Erfolg (z.B. +10% Conversion)?",
          "Wie messen wir den Erfolg der Intervention?",
          "Was ist die Baseline (heutiger Wert)?",
        ],
      },
      {
        category: "Scope & Timeline",
        items: [
          "Was ist explizit NICHT Teil des Projekts?",
          "Gibt es Deadlines oder externe Abhängigkeiten?",
          "Welche Ressourcen stehen zur Verfügung?",
          "Wer muss überzeugt werden für ein Go?",
        ],
      },
    ],
    redFlags: [
      "Zu vage Ziele: 'Wir wollen KI nutzen' → Nachhaken: 'Wofür genau?'",
      "Kein klarer Sponsor/Owner: 'Das ist ein IT-Projekt' → Business-Owner finden",
      "Unrealistische Erwartungen: '100% Accuracy' → Früh Erwartungen managen",
      "Keine Zeit für Fragen: Meeting dominiert von Präsentationen → Interaktion einfordern",
      "Zu viele Stakeholder ohne klare Rollen → Rollen klären, Folgemeeting klein halten",
    ],
    afterMeeting: [
      { id: "k-after1", label: "Problem-Statement schriftlich festhalten" },
      { id: "k-after2", label: "Erfolgs-KPI definiert und kommuniziert" },
      { id: "k-after3", label: "Scope dokumentiert (inkl. Out-of-Scope)" },
      { id: "k-after4", label: "Nächste Schritte und Verantwortlichkeiten verteilt" },
      { id: "k-after5", label: "Folgetermine vereinbart (Data Review, Check-ins)" },
    ],
  },
  {
    id: "data-review",
    name: "Data Review",
    emoji: "🔍",
    goal: "Daten verstehen, Qualität prüfen, Risiken identifizieren",
    description: "Tiefes Eintauchen in die verfügbaren Daten – was haben wir, was fehlt, was ist kritisch?",
    participants: [
      "Data Scientist / ML Engineer",
      "Data Engineer",
      "Fachexperte (Domain Expert)",
      "Optional: Data Owner, IT-Security",
    ],
    beforeMeeting: [
      { id: "d1", label: "Erste explorative Analyse durchgeführt" },
      { id: "d2", label: "Datenquellen identifiziert und Zugang geklärt" },
      { id: "d3", label: "Grundlegende Statistiken vorbereitet (Zeilen, Spalten, Missing Values)" },
      { id: "d4", label: "Fragen zur Datenqualität notiert" },
      { id: "d5", label: "Label-Definition mit Business abgestimmt" },
    ],
    questions: [
      {
        category: "Datenquellen",
        items: [
          "Welche Systeme liefern diese Daten?",
          "Wie aktuell sind die Daten (Echtzeit, täglich, wöchentlich)?",
          "Wer ist Data Owner für jede Quelle?",
          "Gibt es bekannte Datenqualitätsprobleme?",
        ],
      },
      {
        category: "Label & Features",
        items: [
          "Was genau ist das Label (Zielvariable)?",
          "Wann ist das Label bekannt (Label Delay)?",
          "Welche Features sind zum Vorhersagezeitpunkt verfügbar?",
          "Gibt es Features, die auf das Label 'leaken'?",
        ],
      },
      {
        category: "Datenqualität",
        items: [
          "Warum fehlen diese Werte (MCAR, MAR, MNAR)?",
          "Was bedeuten die Ausreißer – echte Werte oder Fehler?",
          "Wie werden Kategorien codiert (IDs, Texte, ...)?",
          "Gibt es Duplikate oder Inkonsistenzen?",
        ],
      },
      {
        category: "Risiken & Einschränkungen",
        items: [
          "Gibt es Datenschutz-Einschränkungen?",
          "Wurden die Daten in der Vergangenheit geändert (Schema-Changes)?",
          "Gibt es saisonale oder zeitliche Muster zu beachten?",
          "Wie repräsentativ sind die historischen Daten für die Zukunft?",
        ],
      },
    ],
    redFlags: [
      "Kein Zugang zu Rohdaten: 'Wir liefern nur aggregierte Reports' → Granularität einfordern",
      "Label nicht klar: 'Das wissen wir noch nicht genau' → Definition vor Modellierung klären",
      "Massive Missing Values: >50% fehlen → Ursache klären, ggf. Feature verwerfen",
      "Daten zu alt: 'Die letzten 5 Jahre' → Aber Muster von vor 5 Jahren noch relevant?",
      "Keine Domain-Expertise: Niemand kann erklären, was die Spalten bedeuten → Fachexperten einbeziehen",
    ],
    afterMeeting: [
      { id: "d-after1", label: "Datenquellen und Owner dokumentiert" },
      { id: "d-after2", label: "Label-Definition schriftlich festgehalten" },
      { id: "d-after3", label: "Datenqualitätsprobleme und Lösungen dokumentiert" },
      { id: "d-after4", label: "Feature-Liste mit Verfügbarkeit erstellt" },
      { id: "d-after5", label: "Risiken und Mitigationsstrategien notiert" },
    ],
  },
  {
    id: "model-review",
    name: "Model Review",
    emoji: "🔬",
    goal: "Modell-Performance bewerten, Fehleranalyse, nächste Schritte",
    description: "Technische Überprüfung des Modells – funktioniert es, wo versagt es, was können wir verbessern?",
    participants: [
      "Data Scientists / ML Engineers",
      "Technical Lead / Senior DS",
      "Optional: Data Engineer, PM",
    ],
    beforeMeeting: [
      { id: "m1", label: "Baseline-Ergebnisse dokumentiert" },
      { id: "m2", label: "Modell-Ergebnisse reproduzierbar (Code, Daten, Config)" },
      { id: "m3", label: "Metriken auf Train, Validation, Test berechnet" },
      { id: "m4", label: "Fehleranalyse vorbereitet (wo versagt das Modell?)" },
      { id: "m5", label: "Feature Importance / SHAP Values berechnet" },
    ],
    questions: [
      {
        category: "Performance",
        items: [
          "Wie performt das Modell vs. Baseline?",
          "Wie vergleichen sich Train, Validation, Test Metriken (Overfitting)?",
          "Welche Metrik ist für das Business am wichtigsten?",
          "Wie stabil sind die Ergebnisse (Varianz über Folds)?",
        ],
      },
      {
        category: "Fehleranalyse",
        items: [
          "Welche Fälle werden falsch vorhergesagt (Error Analysis)?",
          "Gibt es Muster in den Fehlern (bestimmte Segmente, Zeiträume)?",
          "Wie sind False Positives vs. False Negatives verteilt?",
          "Was sagen die wichtigsten Features über die Fehler?",
        ],
      },
      {
        category: "Fairness & Robustheit",
        items: [
          "Wie performt das Modell auf verschiedenen Subgruppen?",
          "Gibt es Bias in den Vorhersagen?",
          "Wie sensitiv ist das Modell auf Input-Änderungen?",
          "Wurden Adversarial Cases getestet?",
        ],
      },
      {
        category: "Nächste Schritte",
        items: [
          "Welche Features könnten noch hinzugefügt werden?",
          "Lohnt sich ein komplexeres Modell?",
          "Sind die Ergebnisse gut genug für einen Piloten?",
          "Was sind die größten Verbesserungshebel?",
        ],
      },
    ],
    redFlags: [
      "Nur Train-Metriken: 'Accuracy 99%!' → Wo ist Test? Overfitting prüfen",
      "Keine Baseline: 'Besser als vorher' → Vorher was genau? Quantifizieren",
      "Black Box: 'Wir wissen nicht, warum' → Erklärbarkeit wichtig für Stakeholder",
      "Cherry-Picking: 'Funktioniert super für diesen einen Fall' → Generalisierung prüfen",
      "Keine Reproduzierbarkeit: 'Das war auf meinem Laptop' → Dokumentation und Versionierung",
    ],
    afterMeeting: [
      { id: "m-after1", label: "Modell-Performance dokumentiert (inkl. Baseline-Vergleich)" },
      { id: "m-after2", label: "Fehleranalyse-Erkenntnisse festgehalten" },
      { id: "m-after3", label: "Entscheidung: Weitermachen, Pivot, oder Stop" },
      { id: "m-after4", label: "Konkrete nächste Experimente definiert" },
      { id: "m-after5", label: "Timeline für nächsten Review festgelegt" },
    ],
  },
  {
    id: "go-nogo",
    name: "Go/No-Go Entscheidung",
    emoji: "🚦",
    goal: "Entscheidung treffen: Pilotphase starten oder nicht",
    description: "Das entscheidende Meeting – geht das Modell in den Piloten oder brauchen wir mehr Iteration?",
    participants: [
      "Business Stakeholder / Sponsor",
      "Data Science Lead",
      "Product Manager",
      "Optional: IT, Legal, Operations",
    ],
    beforeMeeting: [
      { id: "g1", label: "Go/No-Go Kriterien (vorher definiert) überprüft" },
      { id: "g2", label: "Modell-Performance vs. Kriterien dokumentiert" },
      { id: "g3", label: "Business-Case-Rechnung vorbereitet (ROI)" },
      { id: "g4", label: "Pilotplan skizziert (Scope, Dauer, Metriken)" },
      { id: "g5", label: "Risiken und Mitigationen dokumentiert" },
    ],
    questions: [
      {
        category: "Performance vs. Kriterien",
        items: [
          "Erfüllt das Modell die vorab definierten Kriterien?",
          "Wenn nicht: Wie weit entfernt sind wir?",
          "Welche Trade-offs (Precision vs. Recall) haben wir gemacht?",
          "Wie vergleicht sich die Performance mit der Baseline?",
        ],
      },
      {
        category: "Business Impact",
        items: [
          "Wie übersetzt sich die Modell-Performance in Business-Wert?",
          "Was ist der erwartete ROI des Piloten?",
          "Welche Kosten entstehen durch False Positives / Negatives?",
          "Was sind die Opportunitätskosten von 'Nicht machen'?",
        ],
      },
      {
        category: "Pilotplan",
        items: [
          "Wie groß ist der Pilot (Nutzer, Region, Zeitraum)?",
          "Wie messen wir den Erfolg im Pilot?",
          "Was ist der Fallback, wenn der Pilot scheitert?",
          "Wer ist verantwortlich für den Pilot?",
        ],
      },
      {
        category: "Risiken",
        items: [
          "Was sind die größten Risiken des Piloten?",
          "Wie können wir diese Risiken mitigieren?",
          "Was passiert bei einem PR-Desaster (false positives öffentlich)?",
          "Gibt es regulatorische Risiken?",
        ],
      },
    ],
    redFlags: [
      "Keine vordefinierten Kriterien: 'Sieht gut aus' → Objektive Kriterien nachholen",
      "Nur technische Metriken: 'AUC 0.85' → Business-Impact übersetzen",
      "Kein Pilotplan: 'Einfach live schalten' → Kontrollierte Einführung planen",
      "Sponsor absent: Entscheidung ohne Budget-Owner → Termin verschieben",
      "Gruppendenken: Alle dafür, keiner fragt kritisch → Devil's Advocate benennen",
    ],
    afterMeeting: [
      { id: "g-after1", label: "Entscheidung dokumentiert und kommuniziert" },
      { id: "g-after2", label: "Bei Go: Pilotplan finalisiert und geteilt" },
      { id: "g-after3", label: "Bei No-Go: Nächste Schritte (Iteration, Stop) definiert" },
      { id: "g-after4", label: "Verantwortlichkeiten für Pilot/Iteration zugewiesen" },
      { id: "g-after5", label: "Stakeholder informiert (inkl. Nicht-Anwesende)" },
    ],
  },
  {
    id: "retrospective",
    name: "Retrospektive",
    emoji: "🔄",
    goal: "Lernen aus dem Projekt – was lief gut, was verbessern?",
    description: "Nach Abschluss des Projekts oder Piloten: Was haben wir gelernt, was machen wir beim nächsten Mal anders?",
    participants: [
      "Gesamtes Projektteam",
      "Optional: Stakeholder, Sponsor",
    ],
    beforeMeeting: [
      { id: "r1", label: "Projekt-Timeline und Meilensteine zusammengestellt" },
      { id: "r2", label: "Erfolge und Misserfolge gesammelt" },
      { id: "r3", label: "Anonymes Feedback eingeholt (optional)" },
      { id: "r4", label: "Daten zum Projekt-Verlauf (Zeit, Aufwand, Ergebnisse)" },
      { id: "r5", label: "Vorherige Retrospektiven-Erkenntnisse (falls vorhanden)" },
    ],
    questions: [
      {
        category: "Was lief gut?",
        items: [
          "Was waren die größten Erfolge des Projekts?",
          "Was sollten wir unbedingt wiederholen?",
          "Wer hat besonders gut beigetragen?",
          "Welche Praktiken haben sich bewährt?",
        ],
      },
      {
        category: "Was lief nicht gut?",
        items: [
          "Wo haben wir Zeit verloren?",
          "Welche Annahmen waren falsch?",
          "Wo gab es Kommunikationsprobleme?",
          "Was hätten wir früher wissen müssen?",
        ],
      },
      {
        category: "Was können wir verbessern?",
        items: [
          "Was würden wir beim nächsten Mal anders machen?",
          "Welche Prozesse sollten wir ändern?",
          "Welche Tools oder Skills fehlen uns?",
          "Wie können wir Stakeholder besser einbinden?",
        ],
      },
      {
        category: "Nächste Schritte",
        items: [
          "Welche konkreten Action Items nehmen wir mit?",
          "Wer ist verantwortlich für jedes Action Item?",
          "Bis wann sollen die Verbesserungen umgesetzt sein?",
          "Wie teilen wir die Learnings mit anderen Teams?",
        ],
      },
    ],
    redFlags: [
      "Blame Game: 'XY hat versagt' → Fokus auf Prozesse, nicht Personen",
      "Nur Positives: 'Alles super gelaufen' → Kritische Reflexion einfordern",
      "Keine Action Items: 'War interessant' → Konkrete nächste Schritte festlegen",
      "Abwesende Teammitglieder: Key Player fehlen → Termin verschieben",
      "Keine Vorbereitung: 'Was war nochmal das Projekt?' → Vorher Infos teilen",
    ],
    afterMeeting: [
      { id: "r-after1", label: "Retrospektive-Ergebnisse dokumentiert" },
      { id: "r-after2", label: "Action Items mit Verantwortlichen und Deadlines" },
      { id: "r-after3", label: "Learnings für zukünftige Projekte archiviert" },
      { id: "r-after4", label: "Erfolge gefeiert und kommuniziert" },
      { id: "r-after5", label: "Follow-up für Action Items geplant" },
    ],
  },
];

// Funktion: Meeting-Typ nach ID finden
export function getMeetingType(id: string): MeetingType | undefined {
  return meetingTypes.find(m => m.id === id);
}
