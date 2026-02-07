// Data Science und CRISP-DM Grundlagen

export const dataScience = {
  definition: "Data Science bedeutet, aus Daten Wissen zu generieren und daraus einen Mehrwert zu schaffen.",
  dienstleister: "Der Data Scientist nimmt eine Dienstleister-Rolle innerhalb des Unternehmens ein. Seine Aufgabe ist es, Mehrwert für andere Geschäftsbereiche wie Sales, Marketing oder Produktion zu schaffen.",
  herausforderung: "Die größte Herausforderung in einem Data-Science-Projekt ist häufig nicht das Trainieren und Optimieren eines Modells, sondern vielmehr zu verstehen, worum es eigentlich geht und wie tatsächlich ein Mehrwert generiert werden kann."
};

export const crispDmPhasen = [
  {
    id: 1,
    name: "Business Understanding",
    icon: "Target",
    description: "Welches Problem soll gelöst werden? Verstehen der Geschäftsziele und Anforderungen. Hier werden die Weichen für den Projekterfolg gestellt.",
    kernfrage: "Was ist das Geschäftsproblem?",
    ergebnis: "Projektziel, KPIs, Scope, Abnahmekriterien",
    beispiel: "z.B. \"Churn-Rate von 12% auf 10% senken\""
  },
  {
    id: 2,
    name: "Data Understanding",
    icon: "Database",
    description: "Welche Daten gibt es? Daten identifizieren, sammeln und erste Analysen durchführen. Oft zeigt sich hier, dass passende Daten erst noch beschafft werden müssen.",
    kernfrage: "Welche Daten gibt es?",
    ergebnis: "Dateninventar, Qualitätsrisiken, Label-Definition",
    beispiel: "z.B. \"CRM + Billing, Label = aktive Kündigung\""
  },
  {
    id: 3,
    name: "Data Preparation",
    icon: "Wrench",
    description: "Daten aufbereiten, bereinigen und in ein Format bringen, das für die Modellierung geeignet ist. Dieser Schritt nimmt oft 60-80% der Projektzeit ein.",
    kernfrage: "Wie bereiten wir die Daten auf?",
    ergebnis: "Feature-Set, Train/Test Split, Datenregeln",
    beispiel: "z.B. \"12-Monate-Fenster, 80/20 Split\""
  },
  {
    id: 4,
    name: "Modeling",
    icon: "Brain",
    description: "Auswahl und Anwendung verschiedener Modellierungstechniken. Training, Testen und Optimieren von Machine-Learning-Modellen.",
    kernfrage: "Welches Modell passt?",
    ergebnis: "Trainiertes Modell, Baseline-Vergleich",
    beispiel: "z.B. \"Gradient Boosting schlägt regelbasierte Baseline um 30%\""
  },
  {
    id: 5,
    name: "Evaluation",
    icon: "CheckCircle",
    description: "Bewertung der Ergebnisse: Erfüllt das Modell die Geschäftsanforderungen? Go/No-Go Entscheidung für das Deployment.",
    kernfrage: "Funktioniert es?",
    ergebnis: "Go/No-Go Entscheidung, Fehleranalyse, Pilotplan",
    beispiel: "z.B. \"Go für 8-Wochen A/B-Test\""
  },
  {
    id: 6,
    name: "Deployment",
    icon: "Rocket",
    description: "Das Modell in den produktiven Betrieb überführen. Monitoring einrichten, Verantwortlichkeiten klären, Wartung sicherstellen.",
    kernfrage: "Wie kommt es in Produktion?",
    ergebnis: "Integration, Monitoring, Owner, Fallback",
    beispiel: "z.B. \"Wöchentlicher Batch, DS-Team als Owner\""
  }
];
