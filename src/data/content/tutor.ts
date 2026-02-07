// Tutor-bezogene Inhalte

// Chatbot URLs für Tutor-Start
export const chatbotUrls = {
  claude: "https://claude.ai/new",
  chatgpt: "https://chat.openai.com/",
  gemini: "https://gemini.google.com/",
};

export const tutorInfo = {
  beschreibung: "Der Tutor ist ein interaktives Rollenspiel, das dich durch ein komplettes Data-Science-Projekt führt – Schritt für Schritt nach dem CRISP-DM Prozess.",
  funktionsweise: [
    "Du bist der Data Scientist",
    "Der Tutor spielt verschiedene Rollen: Business Stakeholder, Data Engineer, Fachexperte und mehr",
    "Du durchläufst alle Projektphasen und triffst Entscheidungen",
    "Am Ende hast du einen \"Projektbrief\" mit deinen Entscheidungen"
  ],
  schwierigkeiten: [
    {
      name: "Einsteiger",
      beschreibung: "Nur Business Stakeholder + Mentor mit Lerntipps"
    },
    {
      name: "Praxis",
      beschreibung: "Zusätzlich Data Engineer & Fachexperte"
    },
    {
      name: "Realistisch",
      beschreibung: "Alle Rollen, knappe Kommunikation wie im echten Meeting"
    }
  ],
  szenarien: [
    { id: 1, name: "Kundenabwanderung vorhersagen (Churn)", empfohlen: true },
    { id: 2, name: "Lagerbestand & Nachfrage planen", empfohlen: false },
    { id: 3, name: "Betrugsfälle erkennen", empfohlen: false },
    { id: 4, name: "Maschinenausfälle vorhersagen", empfohlen: false },
    { id: 5, name: "Kundengruppen bilden", empfohlen: false },
    { id: 6, name: "Eigener Use Case", empfohlen: false }
  ]
};

export const beispielDialog = {
  stakeholder: {
    rolle: "Business Stakeholder (Vertriebsleitung)",
    nachricht: `„Guten Tag! Wir verlieren jährlich 12% unserer Bestandskunden im Telekom-Vertrag. Das kostet uns erheblich, weil Neukundengewinnung 5-mal teurer ist als Bestandskundenpflege. Wir wollen gefährdete Kunden 4–8 Wochen vor der Kündigung erkennen, damit unser Retention-Team sie gezielt ansprechen kann – etwa 200 Fälle pro Woche.

Intervention: Das Retention-Team ruft Top-Risiko-Kunden an und bietet individuelle Lösungen (Tarif-Upgrade, Rabatt, technischer Support).

Baseline heute: Wir reagieren nur auf Beschwerden oder wenn Kunden bereits kündigen – viel zu spät."`
  },
  mentor: "In DS-Projekten scheitern 60% schon am Start, weil unklar ist, WER WAS WANN mit dem Modell tun soll. Intervention + Baseline sind deine Ankerpunkte!",
  folgefrage: "\"Welche 2 Punkte sind dir unklar oder erscheinen riskant?\" – und du entscheidest, wie es weitergeht."
};

// Beispiel-Projektbrief für TutorBeispiel
export const beispielProjektbrief = {
  titel: "Churn-Vorhersage Telekom",
  geschaeftsziel: "Churn von 12% auf unter 10% senken durch proaktive Retention",
  entscheidung: "Retention-Team erhält wöchentlich Top-200 Risikokunden",
  kpis: [
    "Retention-Rate (Ziel: 90%)",
    "Precision@200 (Ziel: >50%)"
  ],
  phasenEntscheidungen: [
    { phase: "BU", entscheidung: "Fokus auf Privatkunden mit Laufzeitvertrag" },
    { phase: "DU", entscheidung: "CRM + Billing + Nutzungsdaten, Label = aktive Kündigung" },
    { phase: "DP", entscheidung: "12-Monats-Fenster, 80/20 Split, Leakage-Check auf Tarifwechsel" },
    { phase: "Modeling", entscheidung: "Logistic Regression als Baseline, Gradient Boosting als Kandidat" },
    { phase: "Evaluation", entscheidung: "8-Wochen A/B-Test mit Kontrollgruppe" },
    { phase: "Deployment", entscheidung: "Wöchentlicher Batch, Data Science Team als Owner, Fallback auf alte Liste" }
  ],
  risiken: [
    "Label Delay (2 Wochen)",
    "Datenqualität bei Nutzungsdaten",
    "Team-Kapazität"
  ],
  naechsteSchritte: [
    "Datenextraktion starten",
    "A/B-Test-Design finalisieren"
  ]
};

export const tutorPhasen = [
  { phase: "Einstieg", klaerung: "Briefing verstehen", deliverable: "Offene Fragen identifizieren" },
  { phase: "Business Understanding", klaerung: "Geschäftsproblem schärfen", deliverable: "Problemstatement, KPI, Scope, Abnahmekriterium" },
  { phase: "Data Understanding", klaerung: "Datenlandschaft erkunden", deliverable: "Dateninventar, Label-Definition, Leakage-Risiken" },
  { phase: "Data Preparation", klaerung: "Daten aufbereiten", deliverable: "Feature-Plan, Train/Test-Split, Datenregeln" },
  { phase: "Modeling", klaerung: "Modell entwickeln", deliverable: "Baseline, Modellwahl, Metrik, Threshold" },
  { phase: "Evaluation", klaerung: "Ergebnisse bewerten", deliverable: "Go/No-Go, Fehleranalyse, Pilotplan" },
  { phase: "Deployment", klaerung: "In Betrieb nehmen", deliverable: "Integration, Monitoring, Owner, Fallback" }
];

export const tutorBefehle = [
  { befehl: "weiter", beschreibung: "Nächster Schritt" },
  { befehl: "hilfe", beschreibung: "Alle Befehle anzeigen" },
  { befehl: "status", beschreibung: "Aktueller Stand des Projekts" },
  { befehl: "panel", beschreibung: "Komplexität ändern (einsteiger/praxis/realistisch)" },
  { befehl: "tiefer", beschreibung: "Ausführliche Erklärung + Beispiel" },
  { befehl: "zusammenfassung", beschreibung: "Projektbrief zum Mitnehmen" },
  { befehl: "quiz", beschreibung: "5 Fragen zu deinem Projekt" },
  { befehl: "challenge", beschreibung: "🎭 Stakeholder-Gespräch üben" },
  { befehl: "beispiel", beschreibung: "Musterantwort ohne fortzufahren" },
  { befehl: "0", beschreibung: "Vorschläge wenn unsicher" }
];

export const challengeRollen = [
  { id: "cfo", emoji: "💼", name: "Skeptischer CFO", zitat: "Was bringt das in Euro?" },
  { id: "sponsor", emoji: "😤", name: "Ungeduldiger Sponsor", zitat: "Wann ist das fertig?" },
  { id: "experte", emoji: "🤷", name: "Überforderter Experte", zitat: "Ich verstehe das nicht..." },
  { id: "security", emoji: "🛡️", name: "IT-Security", zitat: "Was ist mit DSGVO?" },
  { id: "widerstand", emoji: "😠", name: "Widerständler", zitat: "Das funktioniert nicht." },
];

export const modusTipps = {
  einzelmodus: [
    "Arbeite in deinem eigenen Tempo",
    "Ideal zum ersten Kennenlernen",
    "Nutze \"beispiel\" und \"0\" wenn du unsicher bist"
  ],
  gruppenmodus: [
    "Eine Person tippt, alle denken mit",
    "Diskutiert die Entscheidungen gemeinsam",
    "Der Tutor erkennt \"wir\" und \"unser Team\" automatisch und passt die Anrede an"
  ]
};
