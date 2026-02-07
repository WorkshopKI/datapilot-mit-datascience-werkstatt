// Starter Kit Data: Stolperfallen, erweiterte Checklisten, Stakeholder-Fragen

export interface Pitfall {
  title: string;
  description: string;
}

export interface RoleObjection {
  role: string;
  objections: string[];
}

// Stolperfallen pro Problemtyp
export const pitfallsByProblemType: Record<string, Pitfall[]> = {
  churn: [
    { title: "Label Leakage", description: "Kündigungsdatum oder -grund als Feature verwendet" },
    { title: "Interventions-Leakage", description: "Retention-Kontakt oder Rabatt als Feature (kommt erst nach Vorhersage)" },
    { title: "Label Delay", description: "Wann ist Kündigung final? Widerrufsfrist beachten" },
    { title: "Saisonalität", description: "Mehr Churn zu bestimmten Zeiten (Vertragsende, Jahreswechsel)" },
    { title: "Offline ≠ Online", description: "Modell-Metrik ≠ echte Retention – A/B-Test vor Rollout" },
  ],
  conversion: [
    { title: "Survivorship Bias", description: "Nur Kunden betrachtet, die noch da sind" },
    { title: "Attribution", description: "Hätte der Kunde auch ohne Kampagne gekauft?" },
    { title: "Self-Selection", description: "Wer auf Rabatt reagiert, hätte evtl. auch so gekauft" },
    { title: "Zeitfenster", description: "Wann gilt Conversion als 'durch Kampagne verursacht'?" },
    { title: "Kannibalisierung", description: "Upselling senkt evtl. andere Käufe" },
  ],
  risk: [
    { title: "Class Imbalance", description: "Betrug ist selten – 99% Accuracy sagt nichts" },
    { title: "Concept Drift", description: "Betrüger ändern Verhalten nach Modell-Rollout" },
    { title: "False Positive Kosten", description: "Legitime Kunden sperren = hoher Schaden" },
    { title: "Label-Qualität", description: "Nicht jeder Betrug wird erkannt – Training auf biased Labels" },
    { title: "Echtzeit-Anforderung", description: "Latenz kritisch bei Transaktions-Scoring" },
  ],
  demand: [
    { title: "Promotions-Effekte", description: "Aktionen verzerren Nachfrage-Muster" },
    { title: "Kannibalisierung", description: "Produkt A substituiert Produkt B" },
    { title: "Stockouts", description: "Historische Nachfrage unterschätzt (war ausverkauft)" },
    { title: "Externe Faktoren", description: "Wetter, Feiertage, Events nicht im Modell" },
    { title: "Aggregationslevel", description: "Filiale vs. Region vs. Gesamt – unterschiedliche Muster" },
  ],
  maintenance: [
    { title: "Sensor-Drift", description: "Sensoren altern, Messwerte verändern sich" },
    { title: "Rare Events", description: "Wenige echte Ausfälle im Training" },
    { title: "Lead Time", description: "Wie früh muss Warnung kommen für sinnvolle Reaktion?" },
    { title: "Interventions-Bias", description: "Wartung verhindert Ausfall – Label verschwindet" },
    { title: "Multivariate Abhängigkeiten", description: "Ausfall hängt von Kombination mehrerer Faktoren ab" },
  ],
  segmentation: [
    { title: "Segment-Stabilität", description: "Kunden wechseln Segmente – wie oft neu clustern?" },
    { title: "Interpretierbarkeit", description: "Technische Cluster ≠ business-relevante Gruppen" },
    { title: "Anzahl Segmente", description: "Zu viele = nicht handhabbar, zu wenige = nicht hilfreich" },
    { title: "Feature-Auswahl", description: "Welche Merkmale definieren relevante Unterschiede?" },
    { title: "Actionability", description: "Was macht man anders pro Segment?" },
  ],
  recommendation: [
    { title: "Cold Start", description: "Keine Empfehlung möglich für neue User/Items" },
    { title: "Popularity Bias", description: "Beliebte Items werden noch beliebter empfohlen" },
    { title: "Filter Bubble", description: "User sehen nur Ähnliches, keine Exploration" },
    { title: "Implicit vs. Explicit", description: "Klick ≠ Gefallen, Kauf ≠ Zufriedenheit" },
    { title: "Position Bias", description: "Obere Empfehlungen werden häufiger geklickt" },
  ],
};

// Erweiterte Checklisten pro Phase (mehr Items als Canvas)
export const starterChecklists = {
  business: [
    "Wer trifft die Entscheidung auf Basis des Modells?",
    "Wie oft wird diese Entscheidung getroffen?",
    "Was ist der Business-KPI (nicht Modell-Metrik)?",
    "Was passiert heute ohne Modell (Baseline)?",
    "Was kostet ein False Positive / False Negative?",
    "Gibt es regulatorische Einschränkungen?",
    "Wer ist der Sponsor / Budget-Owner?",
    "Wie sieht Erfolg in 6 Monaten aus?",
  ],
  data: [
    "Welche Datenquellen sind verfügbar?",
    "Wer hat Zugang zu den Daten?",
    "Was genau ist das Label (Zielvariable)?",
    "Wie lange dauert es, bis das Label bekannt ist (Label Delay)?",
    "Gibt es bekannte Datenqualitätsprobleme?",
    "Wie aktuell sind die Daten?",
    "Gibt es Privacy- oder Datenschutz-Einschränkungen?",
    "Welche Features sind zum Vorhersagezeitpunkt verfügbar?",
  ],
  preparation: [
    "Wie viel Historie wird benötigt?",
    "Wie wird Train/Test/Validation aufgeteilt?",
    "Ist die zeitliche Reihenfolge wichtig (kein Leakage)?",
    "Welche Features werden konstruiert?",
    "Wie werden fehlende Werte behandelt?",
    "Gibt es Ausreißer, die behandelt werden müssen?",
    "Werden Daten aggregiert oder granular genutzt?",
    "Dokumentation der Transformationen?",
  ],
  modeling: [
    "Was ist die einfachste Baseline (z.B. Regelbasiert)?",
    "Welche Modellklasse passt zum Problem?",
    "Welche Metrik optimieren wir (Precision, Recall, MAE, ...)?",
    "Muss das Modell erklärbar sein?",
    "Hyperparameter-Tuning geplant?",
    "Cross-Validation-Strategie festgelegt?",
    "Rechenzeit und Ressourcen eingeplant?",
    "Model-Versioning und Experiment-Tracking?",
  ],
  evaluation: [
    "Was sind die Go/No-Go Kriterien?",
    "Wie werden False Positives behandelt?",
    "Wie wird Business-Impact gemessen (nicht nur Modell-Metrik)?",
    "Ist ein A/B-Test oder Pilotphase geplant?",
    "Wer entscheidet über Go-Live?",
    "Wie wird Fairness geprüft (Bias in Subgruppen)?",
    "Fehleranalyse: Welche Fälle werden falsch vorhergesagt?",
    "Vergleich mit Baseline dokumentiert?",
  ],
  deployment: [
    "Wohin gehen die Vorhersagen (CRM, Dashboard, API)?",
    "Wie oft muss das Modell neu trainiert werden?",
    "Wer überwacht die Modell-Performance (Monitoring)?",
    "Wie wird Model Drift erkannt?",
    "Wer ist nach Go-Live verantwortlich (Owner)?",
    "Was ist die Fallback-Lösung bei Modell-Ausfall?",
    "Wie werden Modell-Updates deployed?",
    "Dokumentation für Betrieb vorhanden?",
  ],
};

// Fragen an Stakeholder (für Kickoff und Discovery)
export const stakeholderQuestions = {
  business: [
    "Wie messen Sie heute den Erfolg der aktuellen Maßnahmen?",
    "Wie viele Fälle kann Ihr Team pro Woche bearbeiten?",
    "Welche Verbesserung wäre ein Erfolg für Sie?",
    "Was passiert, wenn wir das Problem nicht lösen?",
    "Gab es frühere Versuche, dieses Problem zu lösen?",
    "Wer sind die wichtigsten Stakeholder, die überzeugt werden müssen?",
    "Welche Entscheidungen würden sich durch bessere Vorhersagen ändern?",
  ],
  data: [
    "Welche Daten werden heute bereits erfasst?",
    "Wer ist Data Owner für die relevanten Systeme?",
    "Wie lange werden historische Daten aufbewahrt?",
    "Gibt es bekannte Datenqualitätsprobleme?",
    "Welche externen Daten könnten hilfreich sein?",
    "Gibt es Datenschutz- oder Compliance-Einschränkungen?",
    "Wie werden die Daten heute genutzt (Reports, Dashboards)?",
  ],
};

// Typische Datenquellen pro Branche
export const dataSourcesByIndustry: Record<string, string[]> = {
  telekom: ["CRM", "Billing-System", "Nutzungsdaten (Calls, Data)", "Support-Tickets", "Netzwerk-Logs", "Vertragshistorie"],
  ecommerce: ["Shop-Datenbank", "Clickstream", "Bestellhistorie", "Newsletter-Tracking", "Retouren", "Bewertungen"],
  saas: ["Produkt-Analytics", "Login-Logs", "Feature-Nutzung", "Support-Tickets", "Vertragsdaten", "Trial-Daten"],
  streaming: ["Watch-History", "Such-Logs", "Ratings", "Login-Muster", "Device-Daten", "Content-Katalog"],
  bank: ["Kontobewegungen", "Kredithistorie", "CRM", "Online-Banking-Logs", "Beratungsprotokolle", "Scoring-Daten"],
  versicherung: ["Vertragsbestand", "Schadensmeldungen", "CRM", "Beratungsprotokolle", "Zahlungshistorie", "Risikobewertungen"],
  einzelhandel: ["POS-Daten", "Kundenkarte", "Warenwirtschaft", "Coupon-Einlösungen", "Filial-Daten", "Lieferdaten"],
  gastro: ["Reservierungssystem", "POS", "Bewertungen", "Loyalty-Programm", "Buchungshistorie", "Event-Kalender"],
  energie: ["Zählerstände", "Vertragsdaten", "Kundenkontakte", "Beschwerden", "Tarifwechsel", "Smart-Meter-Daten"],
  gesundheit: ["Leistungsdaten", "Mitgliederbestand", "Kontakthistorie", "Präventionsprogramme", "Beschwerden", "Altersstruktur"],
  hr: ["Personalstammdaten", "Feedback-Systeme", "Zeiterfassung", "Gehaltshistorie", "Beförderungen", "Austritte"],
  fertigung: ["Sensordaten", "MES (Manufacturing Execution)", "Qualitätsprüfungen", "Wartungsprotokolle", "Produktionspläne", "Maschinenhistorie"],
  logistik: ["Sendungsdaten", "GPS-Tracking", "Fahrzeugtelemetrie", "Auftragshistorie", "Lagerbestände", "Lieferzeiten"],
  "it-security": ["SIEM-Logs", "Firewall-Logs", "User-Aktivitäten", "Endpoint-Daten", "Incident-Reports", "Netzwerk-Traffic"],
  jobportal: ["Nutzerprofile", "Suchhistorie", "Bewerbungen", "Stellenanzeigen", "Matching-History", "Arbeitgeber-Feedback"],
  immobilien: ["Objektdatenbank", "Suchprofile", "Kontaktanfragen", "Besichtigungen", "Vertragsabschlüsse", "Preisentwicklung"],
  automobil: ["Fahrzeugdaten", "Service-Historie", "Telematik", "Produktion", "Händler-Feedback", "Garantiefälle"],
  bildung: ["Lernfortschritt", "Login-Daten", "Quiz-Ergebnisse", "Kursabschlüsse", "Nutzer-Feedback", "Zahlungsdaten"],
  gebaeude: ["Gebäudetechnik (HVAC)", "Zutrittskontrollen", "Sensordaten", "Wartungsprotokolle", "Energieverbrauch", "Mieterdaten"],
};

// Typische Einwände von Rollen
export const roleObjections: RoleObjection[] = [
  {
    role: "Fachbereich / Business",
    objections: [
      "\"Das brauchen wir sofort!\" → Realistische Timeline kommunizieren",
      "\"Wir wollen 100% Accuracy\" → Erklären: Jedes Modell macht Fehler",
      "\"Warum so kompliziert?\" → Einfache Baseline erst, dann ML",
      "\"Das haben wir schon probiert\" → Was war anders?",
    ],
  },
  {
    role: "IT / Engineering",
    objections: [
      "\"Die Daten gehören uns nicht\" → Data Owner identifizieren",
      "\"Das System ist alt\" → Pragmatische Lösungen (Export, API)",
      "\"Wir haben keine Kapazität\" → Priorisierung mit Management",
      "\"Security-Bedenken\" → Frühzeitig einbinden, Compliance klären",
    ],
  },
  {
    role: "Management / Sponsor",
    objections: [
      "\"Was bringt uns das?\" → ROI in Business-Sprache (€, %, Zeit)",
      "\"Wie schnell sehen wir Ergebnisse?\" → Meilensteine definieren",
      "\"Wer ist verantwortlich?\" → Klare Ownership festlegen",
      "\"Was, wenn es nicht funktioniert?\" → Risiken und Exit-Kriterien",
    ],
  },
  {
    role: "Datenschutz / Legal",
    objections: [
      "\"Personenbezogene Daten!\" → Anonymisierung, Pseudonymisierung",
      "\"DSGVO-Bedenken\" → Zweckbindung, Einwilligung klären",
      "\"Profiling ist kritisch\" → Transparenz, Widerspruchsrecht",
      "\"Dokumentationspflicht\" → Von Anfang an dokumentieren",
    ],
  },
];

// Funktion: Starter-Inhalt für ein Szenario generieren
export function getStarterContent(problemTypeId: string, industryId: string) {
  return {
    checklists: starterChecklists,
    stakeholderQuestions,
    dataSources: dataSourcesByIndustry[industryId] || [],
    pitfalls: pitfallsByProblemType[problemTypeId] || [],
    roleObjections,
  };
}
