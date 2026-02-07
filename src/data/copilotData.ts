// Copilot-bezogene Inhalte

// Chatbot URLs für Copilot-Start (kein Gemini, da Code-Ausführung nötig)
export const copilotChatbotUrls = {
  claude: "https://claude.ai/new",
  chatgpt: "https://chatgpt.com/",
};

export const copilotInfo = {
  beschreibung: "Der DS Copilot ist dein KI-Arbeitspartner für Datenanalyse und Machine Learning. Er arbeitet mit dir auf Augenhöhe: Er analysiert, du entscheidest.",
  funktionsweise: [
    "Du bringst die Daten oder wählst einen Use Case",
    "Der Copilot macht die technische Arbeit: analysieren, visualisieren, modellieren",
    "Du triffst die Entscheidungen, er führt aus",
    "Am Ende hast du ein Dashboard und alle Ergebnisse zum Mitnehmen"
  ],
  arbeitsstile: [
    {
      id: "gefuehrt",
      name: "Geführt",
      beschreibung: "Erklärt jeden Schritt, gibt Praxis-Tipps",
      empfohlen: true
    },
    {
      id: "effizient",
      name: "Effizient",
      beschreibung: "Ergebnisse + Entscheidungen, weniger Erklärung"
    },
    {
      id: "expert",
      name: "Expert",
      beschreibung: "Code + Output, minimale Erklärung"
    }
  ],
  useCases: [
    { id: 1, name: "Kundenabwanderung vorhersagen (Churn)", typ: "Klassifikation", empfohlen: true },
    { id: 2, name: "Nachfrage & Lagerbestand planen", typ: "Regression" },
    { id: 3, name: "Betrugsfälle erkennen", typ: "Klassifikation" },
    { id: 4, name: "Maschinenausfälle vorhersagen", typ: "Klassifikation" },
    { id: 5, name: "Kundengruppen bilden", typ: "Clustering" }
  ]
};

export const copilotStartWege = [
  {
    id: "eigene-daten",
    icon: "Upload",
    titel: "Eigene Daten",
    beschreibung: "CSV oder Excel hochladen und sofort analysieren."
  },
  {
    id: "use-case",
    icon: "Target",
    titel: "Use Case wählen",
    beschreibung: "Fertige Szenarien mit Beispieldaten wählen."
  },
  {
    id: "eigener-case",
    icon: "Lightbulb",
    titel: "Eigener Use Case",
    beschreibung: "Beschreibe dein Problem – der Copilot erstellt passende Daten."
  }
];

export const copilotPhasen = [
  { 
    nr: 1,
    phase: "Data Understanding", 
    icon: "Search",
    kurzbeschreibung: "Daten erkunden, Muster erkennen, Qualität prüfen",
    copilotMacht: [
      "Automatische Datenübersicht (Shape, Typen, Head)",
      "Statistische Zusammenfassung",
      "Missing-Value-Analyse mit Visualisierung",
      "Korrelationsanalyse zum Target",
      "2-3 aussagekräftige Plots"
    ],
    duEntscheidest: [
      "Welche Features sind relevant?",
      "Welche Probleme priorisieren?"
    ],
    deliverable: "EDA-Report mit Visualisierungen"
  },
  { 
    nr: 2,
    phase: "Data Preparation", 
    icon: "Wrench",
    kurzbeschreibung: "Bereinigen, transformieren, aufbereiten",
    copilotMacht: [
      "Missing Values identifizieren & Strategie vorschlagen",
      "Kategorische Variablen encodieren",
      "Ausreißer erkennen und visualisieren",
      "Feature Engineering (wenn sinnvoll)",
      "Train/Test Split"
    ],
    duEntscheidest: [
      "Wie mit fehlenden Werten umgehen?",
      "Ausreißer behalten oder entfernen?"
    ],
    deliverable: "Aufbereiteter Datensatz"
  },
  { 
    nr: 3,
    phase: "Modeling", 
    icon: "Cpu",
    kurzbeschreibung: "Baseline & Modelle trainieren, vergleichen",
    copilotMacht: [
      "Baseline definieren (häufigste Klasse / Mittelwert)",
      "2 Modelle trainieren (einfach + etwas komplexer)",
      "Metriken vergleichen (Tabelle)",
      "Feature Importance berechnen und plotten",
      "Ergebnisse einordnen"
    ],
    duEntscheidest: [
      "Welches Modell in die Evaluation?",
      "Welche Metriken sind am wichtigsten?"
    ],
    deliverable: "Modellvergleich + Feature Importance"
  },
  { 
    nr: 4,
    phase: "Evaluation", 
    icon: "CheckCircle",
    kurzbeschreibung: "Ergebnisse bewerten, Dashboard erstellen",
    copilotMacht: [
      "Detaillierte Metriken auf Testdaten",
      "Confusion Matrix / Residuenplot",
      "Fehleranalyse (wo liegt das Modell falsch?)",
      "Business-Übersetzung der Ergebnisse",
      "Interaktives Stakeholder-Dashboard (HTML)"
    ],
    duEntscheidest: [
      "Go oder No-Go?",
      "Nächste Schritte?"
    ],
    deliverable: "Dashboard + Stakeholder-Zusammenfassung"
  }
];

export const copilotBefehle = [
  { befehl: "weiter", beschreibung: "Nächster Schritt (Copilot wählt sinnvoll)" },
  { befehl: "dashboard", beschreibung: "Interaktives HTML-Dashboard erstellen" },
  { befehl: "status", beschreibung: "Aktueller Projektstand" },
  { befehl: "code", beschreibung: "Code des letzten Schritts zeigen/erklären" },
  { befehl: "erkläre", beschreibung: "Stakeholder-freundliche Zusammenfassung" },
  { befehl: "export", beschreibung: "Alle Ergebnisse herunterladen" },
  { befehl: "daten", beschreibung: "Zurück zur Datenübersicht" },
  { befehl: "modus", beschreibung: "Arbeitsstil ändern (geführt/effizient/expert)" },
  { befehl: "zurück", beschreibung: "Vorherige Phase wiederholen" },
  { befehl: "hilfe", beschreibung: "Alle Befehle anzeigen" }
];

export const beispielDialogCopilot = {
  nachrichten: [
    {
      rolle: "copilot",
      nachricht: `Hallo! Ich bin dein Data-Science Copilot. 🤝 Wie möchtest du starten?

1 → 📂 Eigene Daten hochladen
2 → 🎯 Use Case wählen
3 → 💡 Eigenen Use Case beschreiben`
    },
    {
      rolle: "user",
      nachricht: "2"
    },
    {
      rolle: "copilot",
      nachricht: `Use Case wählen:

1 → 📊 Kundenabwanderung vorhersagen (Churn) ⭐ Empfohlen
2 → 📈 Nachfrage & Lagerbestand planen
3 → 🔍 Betrugsfälle erkennen
4 → ⚙️ Maschinenausfälle vorhersagen
5 → 👥 Kundengruppen bilden`
    },
    {
      rolle: "user",
      nachricht: "1"
    },
    {
      rolle: "copilot",
      nachricht: `Alles klar, Churn-Vorhersage! Ich generiere einen realistischen Datensatz mit 1.000 Kunden...

📊 **Dein Datensatz auf einen Blick:**
• Umfang: 1.000 Zeilen, 10 Spalten (7 numerisch, 3 kategorisch)
• Target: Churn → 73% bleiben, 27% wandern ab
• Missing Values: Zahlungsmethode hat 4% fehlend
• Top-Korrelationen: Vertragstyp (0.65), Support-Tickets (0.48), Vertragsdauer (0.42)

💡 Die ungleiche Verteilung (73/27) ist typisch für Churn. Wir berücksichtigen das beim Modeling.

Sollen wir mit der Datenaufbereitung starten, oder möchtest du bestimmte Features genauer anschauen?`
    },
    {
      rolle: "user",
      nachricht: "weiter"
    },
    {
      rolle: "copilot",
      nachricht: `🔧 **Datenaufbereitung – mein Vorschlag:**

| Schritt | Was | Warum |
|---------|-----|-------|
| Missing Values | Zahlungsmethode – Modus-Imputation | Nur 4% fehlend |
| Encoding | Vertragstyp – One-Hot | 3 Kategorien |
| Ausreißer | 8 Extremwerte bei Umsatz | Behalten (Power-User) |
| Split | 80% Training, 20% Test | Standard |

Soll ich das so umsetzen?`
    },
    {
      rolle: "user",
      nachricht: "ja, mach das so"
    },
    {
      rolle: "copilot",
      nachricht: `✅ Daten aufbereitet! Weiter zum Modell.

📊 **Modellvergleich:**

| Modell | Accuracy | Recall | F1 |
|--------|----------|--------|-----|
| Baseline (häufigste) | 0.73 | 0.00 | 0.00 |
| Logistische Regression | 0.81 | 0.67 | 0.72 |
| Random Forest | 0.84 | 0.74 | 0.78 |

**Meine Einschätzung:** Random Forest ist deutlich besser, vor allem beim Recall – wir erkennen mehr Churner. Die wichtigsten Features: Vertragstyp, Support-Tickets, Vertragsdauer.

Soll ich ein Dashboard für Stakeholder erstellen?`
    },
    {
      rolle: "user",
      nachricht: "dashboard"
    },
    {
      rolle: "copilot",
      nachricht: `📈 Dashboard erstellt! Hier ist dein interaktives Stakeholder-Dashboard als HTML-Datei. Du kannst es im Browser öffnen oder herunterladen.

[Download: churn_dashboard.html]`
    }
  ]
};

export const copilotVsTutor = {
  headers: ["Aspekt", "PM Tutor", "DS Copilot"],
  rows: [
    ["Ziel", "DS-Projektmanagement lernen", "Daten analysieren & Modelle bauen"],
    ["Ansatz", "Rollenspiel: Du bist Data Scientist", "Teamarbeit: Copilot + Du"],
    ["Fokus", "Business Understanding → Deployment", "Data Understanding → Evaluation"],
    ["Du machst", "Entscheidungen treffen & begründen", "Entscheidungen treffen"],
    ["KI macht", "Stakeholder-Rollen spielen", "Technische Analyse & Code"],
    ["Output", "Projektbrief", "Dashboard + Modell + Code"]
  ]
};

export const copilotModusTipps = {
  hinweis: "Tippe modus im Copilot, um den Arbeitsstil zu wechseln.",
  eigeneAaten: "📂 Eigene Daten? Lade CSV oder Excel direkt im Chat hoch, nachdem du den Prompt eingefügt hast."
};
