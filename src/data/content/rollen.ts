// Rollen im Data Science Projekt

export const rollen = [
  {
    id: "data-scientist",
    name: "Data Scientist",
    icon: "FlaskConical",
    beschreibung: "Identifiziert Use Cases, trainiert Modelle, kommuniziert Ergebnisse",
    aufgaben: [
      "Abstimmung mit Domänenexperten",
      "Identifikation und Ausarbeitung von datenbasierten Use Cases",
      "Explorative Datenanalyse",
      "Trainieren, Testen und Validieren von ML-Modellen",
      "Kommunikation der Ergebnisse"
    ],
    hinweis: "Anforderungen: Statistik, Programmierung, Business Knowledge, Kommunikationsfähigkeit. Es ist schwer, in allen Bereichen gut zu sein – Teams ergänzen sich gegenseitig.",
    kernaufgabe: "Use Cases entwickeln & Modelle trainieren",
    typischerEinwand: "\"Bevor ich anfange – sind die Anforderungen wirklich klar?\""
  },
  {
    id: "data-engineer",
    name: "Data Engineer",
    icon: "Cog",
    beschreibung: "Baut Pipelines, pflegt Infrastruktur, sorgt für stabilen Betrieb",
    aufgaben: [
      "Aufbau und Pflege von Daten-Infrastruktur und Cloud-Lösungen",
      "Bereitstellung von Data Pipelines",
      "Vereinheitlichung von Datenstrukturen",
      "Überwachung und Betrieb der Anwendungen",
      "Machine Learning Model Deployment"
    ],
    hinweis: "Vergleich: Wie Chemiker früher auch Labortechniker sein mussten, sind Data Engineers die \"Labortechniker\" in der Data Science.",
    kernaufgabe: "Pipelines & Infrastruktur",
    typischerEinwand: "\"Die Daten kommen aus 3 Systemen mit unterschiedlichen IDs. So ist das nicht stabil betreibbar.\""
  },
  {
    id: "data-analyst",
    name: "Data Analyst / BI Analyst",
    icon: "BarChart3",
    beschreibung: "Analysiert Daten, erstellt Dashboards, ist nah am Business",
    aufgaben: [
      "Identifikation und deskriptive Analyse von strukturierten Daten",
      "Visualisierung und Dashboarding",
      "Nutzung von BI-Tools wie Tableau",
      "Näher am Business, präsentiert häufiger Erkenntnisse"
    ],
    hinweis: "Abgrenzung: Wird oft mit Data Scientist verwechselt. Grenzen sind fließend, aber BI Analysts erstellen in der Regel keine Prognosemodelle.",
    kernaufgabe: "Reporting & Visualisierung",
    typischerEinwand: "\"Wie tracken wir das im Dashboard? Die Messbarkeit fehlt noch.\""
  },
  {
    id: "business-stakeholder",
    name: "Business Stakeholder",
    icon: "Briefcase",
    beschreibung: "Definiert Use Cases, bewertet Erfolg, stellt Nutzung sicher",
    aufgaben: [
      "Definition und Priorisierung von Anwendungsfällen",
      "Evaluierung des Erfolgs von Data Science Projekten",
      "Stellt sicher, dass Projektergebnisse auch genutzt werden"
    ],
    hinweis: "Typische Frage: \"Hilft das der Entscheidung?\"",
    kernaufgabe: "Use Cases definieren & priorisieren",
    typischerEinwand: "\"Schöne Metrik – aber hilft das wirklich unserer Entscheidung?\""
  },
  {
    id: "fachexperte",
    name: "Fachexperte",
    icon: "GraduationCap",
    beschreibung: "Kennt Prozesse im Detail, gibt Feedback zu Prototypen",
    aufgaben: [
      "Stellt dem Data Scientist notwendige Informationen zur Verfügung",
      "Kennt die Prozesse und Edge-Cases im Detail",
      "Gibt Feedback zu Prototypen"
    ],
    hinweis: "Wichtig: Frühzeitige Einbeziehung für Prototypen und Feedback. Direkte Zusammenarbeit ist nicht immer gern gesehen, da Kollegen oft ausgelastet sind.",
    kernaufgabe: "Prozesswissen einbringen",
    typischerEinwand: "\"Vorsicht, so läuft der Prozess in der Praxis nicht!\""
  },
  {
    id: "abteilungsleiter",
    name: "Abteilungsleiter",
    icon: "UserCheck",
    beschreibung: "Klärt Kapazitäten, Ownership und langfristigen Betrieb",
    aufgaben: [
      "Kapazitätsplanung für neue Projekte",
      "Klärung der langfristigen Ownership",
      "Ressourcen-Allokation im Team"
    ],
    hinweis: "Denkt an Nachhaltigkeit: Wer betreibt das Modell, wenn das Projekt vorbei ist?",
    kernaufgabe: "Kapazität & Ownership klären",
    typischerEinwand: "\"Wer betreibt das später, wenn ihr zum nächsten Projekt weiterzieht?\""
  }
];
