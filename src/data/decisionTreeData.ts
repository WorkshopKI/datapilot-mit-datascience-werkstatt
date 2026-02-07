export interface DecisionOption {
  text: string;
  nextNodeId: string;
}

export interface DiagnosisStep {
  title: string;
  detail: string;
}

export interface DiagnosisLink {
  text: string;
  href: string;
}

export interface Diagnosis {
  title: string;
  description: string;
  causes: string[];
  steps: DiagnosisStep[];
  relatedLinks: DiagnosisLink[];
}

export interface DecisionNode {
  id: string;
  type: "question" | "diagnosis";
  text: string;
  options?: DecisionOption[];
  diagnosis?: Diagnosis;
}

export interface DecisionTree {
  id: string;
  title: string;
  emoji: string;
  description: string;
  startNodeId: string;
  nodes: DecisionNode[];
}

export const decisionTrees: DecisionTree[] = [
  {
    id: "performance",
    title: "Modell-Performance sinkt",
    emoji: "📉",
    description: "Das Modell liefert schlechtere Ergebnisse als erwartet oder die Performance ist über die Zeit gesunken.",
    startNodeId: "perf-1",
    nodes: [
      {
        id: "perf-1",
        type: "question",
        text: "Wann ist die Performance gesunken?",
        options: [
          { text: "Plötzlich / nach einem Event", nextNodeId: "perf-2" },
          { text: "Langsam über Wochen/Monate", nextNodeId: "perf-3" },
          { text: "War von Anfang an schlecht", nextNodeId: "perf-4" },
        ],
      },
      {
        id: "perf-2",
        type: "question",
        text: "Gab es kürzlich Änderungen?",
        options: [
          { text: "Neue Datenquelle / Schema-Änderung", nextNodeId: "diag-data-schema" },
          { text: "Neues Modell-Deployment", nextNodeId: "diag-deploy-error" },
          { text: "Business-Änderung (Produkt, Markt)", nextNodeId: "diag-concept-drift" },
          { text: "Keine bekannten Änderungen", nextNodeId: "perf-5" },
        ],
      },
      {
        id: "perf-3",
        type: "question",
        text: "Wie zeigt sich der Verfall?",
        options: [
          { text: "Alle Metriken sinken gleichmäßig", nextNodeId: "diag-data-drift" },
          { text: "Nur bestimmte Segmente betroffen", nextNodeId: "diag-segment-drift" },
          { text: "Precision sinkt, Recall stabil", nextNodeId: "diag-threshold-drift" },
        ],
      },
      {
        id: "perf-4",
        type: "question",
        text: "Was könnte die Ursache sein?",
        options: [
          { text: "Zu wenig Trainingsdaten", nextNodeId: "diag-insufficient-data" },
          { text: "Falsche Zieldefinition", nextNodeId: "diag-wrong-target" },
          { text: "Datenqualitätsprobleme", nextNodeId: "diag-data-quality" },
        ],
      },
      {
        id: "perf-5",
        type: "question",
        text: "Sind Input-Daten korrekt?",
        options: [
          { text: "Ja, Daten sehen normal aus", nextNodeId: "diag-hidden-drift" },
          { text: "Nein, es gibt Anomalien", nextNodeId: "diag-data-anomaly" },
        ],
      },
      {
        id: "diag-data-schema",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Schema-Änderung in Datenquelle",
          description: "Änderungen im Daten-Schema führen zu fehlenden oder falsch interpretierten Features.",
          causes: [
            "Neues Feld ersetzt altes Feld",
            "Feldtyp hat sich geändert (String → Integer)",
            "Encoding-Änderung (UTF-8 Probleme)",
            "Neue NULL-Werte durch Schema-Migration",
          ],
          steps: [
            { title: "Schema-Diff erstellen", detail: "Vergleiche altes und neues Schema systematisch" },
            { title: "Feature-Pipeline prüfen", detail: "Welche Features sind betroffen?" },
            { title: "Fallback definieren", detail: "Wie gehen wir mit fehlenden Werten um?" },
            { title: "Monitoring einrichten", detail: "Schema-Validierung vor Modell-Inference" },
          ],
          relatedLinks: [
            { text: "Data Understanding Phase", href: "/lernen/grundlagen#crisp-dm" },
          ],
        },
      },
      {
        id: "diag-deploy-error",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Deployment-Fehler",
          description: "Das neue Modell wurde fehlerhaft deployed oder es gibt Versions-Inkonsistenzen.",
          causes: [
            "Falsches Modell-Artefakt deployed",
            "Feature-Preprocessing nicht aktualisiert",
            "Versions-Mismatch bei Libraries",
            "Konfigurationsfehler in Production",
          ],
          steps: [
            { title: "Rollback prüfen", detail: "Kann schnell zur alten Version zurückgekehrt werden?" },
            { title: "Deployment-Logs checken", detail: "Gibt es Fehlermeldungen?" },
            { title: "A/B-Vergleich", detail: "Alte vs. neue Version auf gleichen Daten" },
            { title: "Deployment-Pipeline härten", detail: "Automatische Tests vor Rollout" },
          ],
          relatedLinks: [
            { text: "Deployment Phase", href: "/lernen/grundlagen#crisp-dm" },
          ],
        },
      },
      {
        id: "diag-concept-drift",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Concept Drift durch Business-Änderung",
          description: "Die Beziehung zwischen Features und Zielvariable hat sich geändert.",
          causes: [
            "Neue Produkte/Services mit anderem Verhalten",
            "Marktveränderungen (Wettbewerb, Wirtschaft)",
            "Regulatorische Änderungen",
            "Geänderte Kundenerwartungen",
          ],
          steps: [
            { title: "Stakeholder befragen", detail: "Was hat sich im Business verändert?" },
            { title: "Segmentanalyse", detail: "Welche Kundengruppen sind betroffen?" },
            { title: "Retraining planen", detail: "Mit aktuellen Daten neu trainieren" },
            { title: "Feature Review", detail: "Sind neue Features notwendig?" },
          ],
          relatedLinks: [
            { text: "Business Understanding", href: "/lernen/grundlagen#crisp-dm" },
            { text: "Drift (Glossar)", href: "/nachschlagen/glossar" },
          ],
        },
      },
      {
        id: "diag-data-drift",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Data Drift",
          description: "Die Verteilung der Eingabedaten hat sich langsam verschoben.",
          causes: [
            "Saisonale Veränderungen",
            "Demographischer Wandel der Nutzer",
            "Schleichende Prozessänderungen",
            "Neue Datenquellen mischen sich ein",
          ],
          steps: [
            { title: "Distribution-Vergleich", detail: "Feature-Verteilungen Training vs. Production" },
            { title: "Drift-Metriken einführen", detail: "PSI, KL-Divergenz monitoring" },
            { title: "Retraining-Trigger", detail: "Automatisches Retraining bei Schwellenwert" },
            { title: "Rolling Window", detail: "Modell auf neueren Daten trainieren" },
          ],
          relatedLinks: [
            { text: "Drift (Glossar)", href: "/nachschlagen/glossar" },
          ],
        },
      },
      {
        id: "diag-segment-drift",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Segment-spezifischer Drift",
          description: "Die Performance ist nur für bestimmte Kundengruppen oder Segmente gesunken.",
          causes: [
            "Neues Kundensegment mit anderem Verhalten",
            "Änderung in einem Vertriebskanal",
            "Regionale Unterschiede",
            "Produktspezifische Änderungen",
          ],
          steps: [
            { title: "Segment-Analyse", detail: "Performance pro Segment aufschlüsseln" },
            { title: "Segment-Features prüfen", detail: "Sind Segment-spezifische Features vorhanden?" },
            { title: "Separate Modelle erwägen", detail: "Lohnt sich ein Modell pro Segment?" },
            { title: "Gewichtung anpassen", detail: "Aktuelle Segmentverteilung im Training?" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-threshold-drift",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Threshold-Optimierung nötig",
          description: "Der gewählte Schwellenwert passt nicht mehr zur aktuellen Score-Verteilung.",
          causes: [
            "Score-Verteilung hat sich verschoben",
            "Klassenverteilung hat sich geändert",
            "Business-Prioritäten haben sich geändert",
          ],
          steps: [
            { title: "Score-Verteilung prüfen", detail: "Vergleich aktuelle vs. historische Scores" },
            { title: "Precision-Recall-Kurve", detail: "Optimalen Threshold neu bestimmen" },
            { title: "Business-Abstimmung", detail: "Trade-offs mit Stakeholder besprechen" },
            { title: "Dynamischen Threshold erwägen", detail: "Threshold basierend auf Kapazität" },
          ],
          relatedLinks: [
            { text: "Threshold (Glossar)", href: "/nachschlagen/glossar" },
          ],
        },
      },
      {
        id: "diag-insufficient-data",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Unzureichende Trainingsdaten",
          description: "Das Modell hatte nicht genug Daten, um robuste Muster zu lernen.",
          causes: [
            "Zu kurzer Beobachtungszeitraum",
            "Seltenes Ereignis mit wenig Beispielen",
            "Unausgewogene Klassen",
            "Wichtige Segmente unterrepräsentiert",
          ],
          steps: [
            { title: "Datenmenge analysieren", detail: "Wie viele Beispiele pro Klasse?" },
            { title: "Zeitraum erweitern", detail: "Ältere Daten einbeziehen (falls relevant)" },
            { title: "Oversampling/Undersampling", detail: "Klassenbalance verbessern" },
            { title: "Simpler beginnen", detail: "Weniger komplexes Modell wählen" },
          ],
          relatedLinks: [
            { text: "Overfitting (Glossar)", href: "/nachschlagen/glossar" },
          ],
        },
      },
      {
        id: "diag-wrong-target",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Falsche Zieldefinition",
          description: "Die Definition des Labels passt nicht zum eigentlichen Geschäftsziel.",
          causes: [
            "Proxy-Metrik statt echtem Ziel",
            "Zeitfenster falsch gewählt",
            "Label-Definition zu eng/weit",
            "Leakage durch Zieldefinition",
          ],
          steps: [
            { title: "Label-Definition reviewen", detail: "Mit Stakeholder abstimmen" },
            { title: "Zeitfenster prüfen", detail: "30 Tage vs. 90 Tage Horizont?" },
            { title: "Leakage ausschließen", detail: "Keine Zukunftsinformation im Label?" },
            { title: "Neu trainieren", detail: "Mit korrigierter Definition" },
          ],
          relatedLinks: [
            { text: "Label (Glossar)", href: "/nachschlagen/glossar" },
            { text: "Leakage (Glossar)", href: "/nachschlagen/glossar" },
          ],
        },
      },
      {
        id: "diag-data-quality",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Datenqualitätsprobleme",
          description: "Die Eingabedaten haben grundlegende Qualitätsmängel.",
          causes: [
            "Viele fehlende Werte",
            "Inkonsistente Kodierungen",
            "Duplikate im Datensatz",
            "Falsche Datentypen",
          ],
          steps: [
            { title: "Data Profiling", detail: "Systematische Analyse aller Features" },
            { title: "Missing Values behandeln", detail: "Imputation oder Ausschluss?" },
            { title: "Standardisierung", detail: "Einheitliche Formate und Kodierungen" },
            { title: "Validierungsregeln", detail: "Checks vor dem Training" },
          ],
          relatedLinks: [
            { text: "Data Preparation Phase", href: "/lernen/grundlagen#crisp-dm" },
          ],
        },
      },
      {
        id: "diag-hidden-drift",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Versteckter Drift oder Leakage",
          description: "Es gibt subtile Änderungen, die nicht sofort sichtbar sind.",
          causes: [
            "Feature-Berechnung hat sich geändert",
            "Upstream-System verhält sich anders",
            "Zeitliche Leakage wurde eingeführt",
            "Implizite Abhängigkeiten gebrochen",
          ],
          steps: [
            { title: "Feature-Audit", detail: "Jedes Feature End-to-End prüfen" },
            { title: "Upstream prüfen", detail: "Änderungen in vorgelagerten Systemen?" },
            { title: "Zeitliche Analyse", detail: "Wann genau begann das Problem?" },
            { title: "Shadow Mode", detail: "Modell parallel mit Logging laufen lassen" },
          ],
          relatedLinks: [
            { text: "Leakage (Glossar)", href: "/nachschlagen/glossar" },
          ],
        },
      },
      {
        id: "diag-data-anomaly",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Daten-Anomalie in Produktion",
          description: "Die Produktionsdaten enthalten unerwartete Anomalien.",
          causes: [
            "Technischer Fehler in Daten-Pipeline",
            "Externes Event (DDoS, Bot-Traffic)",
            "Fehlkonfiguration upstream",
            "Unbekannter Edge-Case",
          ],
          steps: [
            { title: "Anomalie isolieren", detail: "Welche Datenpunkte sind betroffen?" },
            { title: "Root Cause finden", detail: "Woher kommen die anomalen Daten?" },
            { title: "Filterung einbauen", detail: "Anomalien vor Inference ausfiltern" },
            { title: "Alerting verbessern", detail: "Früherkennung für Anomalien" },
          ],
          relatedLinks: [],
        },
      },
    ],
  },
  {
    id: "data",
    title: "Daten-Probleme",
    emoji: "📊",
    description: "Probleme mit Datenqualität, -verfügbarkeit oder -verständnis.",
    startNodeId: "data-1",
    nodes: [
      {
        id: "data-1",
        type: "question",
        text: "Was ist das Hauptproblem?",
        options: [
          { text: "Daten sind nicht verfügbar", nextNodeId: "data-2" },
          { text: "Datenqualität ist schlecht", nextNodeId: "data-3" },
          { text: "Daten sind unverständlich", nextNodeId: "data-4" },
          { text: "Daten reichen nicht aus", nextNodeId: "data-5" },
        ],
      },
      {
        id: "data-2",
        type: "question",
        text: "Warum sind die Daten nicht verfügbar?",
        options: [
          { text: "Technische Zugriffsprobleme", nextNodeId: "diag-access-issues" },
          { text: "Daten existieren nicht", nextNodeId: "diag-data-not-exist" },
          { text: "Rechtliche/Compliance Gründe", nextNodeId: "diag-legal-issues" },
        ],
      },
      {
        id: "data-3",
        type: "question",
        text: "Welches Qualitätsproblem?",
        options: [
          { text: "Viele fehlende Werte", nextNodeId: "diag-missing-values" },
          { text: "Inkonsistente Werte", nextNodeId: "diag-inconsistent-data" },
          { text: "Duplikate", nextNodeId: "diag-duplicates" },
          { text: "Veraltete Daten", nextNodeId: "diag-stale-data" },
        ],
      },
      {
        id: "data-4",
        type: "question",
        text: "Was ist unklar?",
        options: [
          { text: "Bedeutung der Felder", nextNodeId: "diag-no-documentation" },
          { text: "Beziehungen zwischen Tabellen", nextNodeId: "diag-no-schema" },
          { text: "Geschäftslogik in den Daten", nextNodeId: "diag-hidden-logic" },
        ],
      },
      {
        id: "data-5",
        type: "question",
        text: "In welcher Hinsicht?",
        options: [
          { text: "Zu kurzer Zeitraum", nextNodeId: "diag-short-history" },
          { text: "Zu wenige positive Fälle", nextNodeId: "diag-rare-events" },
          { text: "Wichtige Features fehlen", nextNodeId: "diag-missing-features" },
        ],
      },
      {
        id: "diag-access-issues",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Technische Zugriffsprobleme",
          description: "Die Daten existieren, aber der Zugriff ist blockiert.",
          causes: [
            "Fehlende Berechtigungen",
            "Firewall/Netzwerk-Probleme",
            "Kein API-Zugang",
            "Veraltete Credentials",
          ],
          steps: [
            { title: "IT kontaktieren", detail: "Zugriffsrechte formal beantragen" },
            { title: "Datenowner identifizieren", detail: "Wer kann Zugang gewähren?" },
            { title: "Alternatives Format prüfen", detail: "Export statt direkter Zugriff?" },
            { title: "Dokumentieren", detail: "Für künftige Projekte festhalten" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-data-not-exist",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Daten werden nicht erfasst",
          description: "Die benötigten Daten werden aktuell nicht gesammelt.",
          causes: [
            "Kein Tracking implementiert",
            "Feature wurde nie gebaut",
            "Daten werden nicht persistiert",
          ],
          steps: [
            { title: "Tracking planen", detail: "Was genau soll erfasst werden?" },
            { title: "Implementierung beauftragen", detail: "Engineering-Ticket erstellen" },
            { title: "Wartezeit einplanen", detail: "Wie lange bis genug Daten da sind?" },
            { title: "Proxy-Daten prüfen", detail: "Gibt es Alternativen?" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-legal-issues",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Rechtliche/Compliance Hürden",
          description: "Die Nutzung der Daten ist rechtlich eingeschränkt.",
          causes: [
            "DSGVO-Einschränkungen",
            "Keine Einwilligung der Nutzer",
            "Vertragliche Beschränkungen",
            "Branchenregulierung",
          ],
          steps: [
            { title: "Legal Team einbinden", detail: "Genaue Einschränkungen klären" },
            { title: "Anonymisierung prüfen", detail: "Können Daten anonymisiert werden?" },
            { title: "Consent-Prozess", detail: "Kann Einwilligung eingeholt werden?" },
            { title: "Alternatives Design", detail: "Projekt ohne diese Daten möglich?" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-missing-values",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Viele fehlende Werte",
          description: "Wichtige Felder haben zu viele NULL-Werte.",
          causes: [
            "Optionale Felder in Formularen",
            "Technische Erfassungsfehler",
            "Feld erst später eingeführt",
            "Verschiedene Datenquellen",
          ],
          steps: [
            { title: "Missing-Pattern analysieren", detail: "MCAR, MAR oder MNAR?" },
            { title: "Imputation wählen", detail: "Mean, Median, Model-based?" },
            { title: "Feature ausschließen", detail: "Bei >50% Missing oft sinnvoll" },
            { title: "Ursache beheben", detail: "Kann Erfassung verbessert werden?" },
          ],
          relatedLinks: [
            { text: "Data Preparation", href: "/lernen/grundlagen#crisp-dm" },
          ],
        },
      },
      {
        id: "diag-inconsistent-data",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Inkonsistente Datenwerte",
          description: "Gleiche Konzepte sind unterschiedlich kodiert.",
          causes: [
            "Verschiedene Quellsysteme",
            "Manuelle Dateneingabe",
            "Historische Format-Änderungen",
            "Keine Validierungsregeln",
          ],
          steps: [
            { title: "Mapping erstellen", detail: "Alle Varianten eines Konzepts auflisten" },
            { title: "Standardisierung", detail: "Einheitliches Format definieren" },
            { title: "Transformation", detail: "Mapping in Pipeline einbauen" },
            { title: "Validierung", detail: "Checks für neue Daten" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-duplicates",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Duplikate im Datensatz",
          description: "Gleiche Entitäten erscheinen mehrfach.",
          causes: [
            "Mehrfache Importe",
            "Fehlende Deduplizierung",
            "System-Migration",
            "Keine eindeutigen IDs",
          ],
          steps: [
            { title: "Duplikat-Regeln definieren", detail: "Was macht einen Duplikat aus?" },
            { title: "Fuzzy Matching", detail: "Ähnliche aber nicht identische Einträge" },
            { title: "Deduplizierung", detail: "Welcher Eintrag bleibt?" },
            { title: "Root Cause", detail: "Quelle der Duplikate beheben" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-stale-data",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Veraltete Daten",
          description: "Die Daten sind nicht aktuell genug für den Use Case.",
          causes: [
            "Batch-Prozesse zu selten",
            "Verzögerungen in der Pipeline",
            "Manuelle Update-Prozesse",
            "Archivdaten statt Livedaten",
          ],
          steps: [
            { title: "Anforderung klären", detail: "Wie aktuell müssen Daten sein?" },
            { title: "Pipeline prüfen", detail: "Wo entstehen Verzögerungen?" },
            { title: "Streaming erwägen", detail: "Real-time statt Batch?" },
            { title: "Trade-off akzeptieren", detail: "Ist Verzögerung geschäftlich OK?" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-no-documentation",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Fehlende Datendokumentation",
          description: "Es gibt keine oder unzureichende Dokumentation der Datenfelder.",
          causes: [
            "Historisch gewachsene Systeme",
            "Keine Data Governance",
            "Wechselnde Teams",
            "Technische Schulden",
          ],
          steps: [
            { title: "Fachexperten identifizieren", detail: "Wer kennt die Daten am besten?" },
            { title: "Data Dictionary erstellen", detail: "Jedes Feld dokumentieren" },
            { title: "Beispiele sammeln", detail: "Konkrete Werte zur Illustration" },
            { title: "Institutionalisieren", detail: "Dokumentation verpflichtend machen" },
          ],
          relatedLinks: [
            { text: "Data Understanding", href: "/lernen/grundlagen#crisp-dm" },
          ],
        },
      },
      {
        id: "diag-no-schema",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Unklare Datenbeziehungen",
          description: "Die Beziehungen zwischen Tabellen/Entitäten sind nicht dokumentiert.",
          causes: [
            "Kein ER-Diagramm vorhanden",
            "Implizite Beziehungen",
            "Historische Altlasten",
            "Fehlende Fremdschlüssel",
          ],
          steps: [
            { title: "Schema reverse-engineeren", detail: "Aus Daten auf Beziehungen schließen" },
            { title: "Entwickler befragen", detail: "Wer hat das System gebaut?" },
            { title: "ER-Diagramm erstellen", detail: "Beziehungen visualisieren" },
            { title: "Testen", detail: "Joins validieren" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-hidden-logic",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Versteckte Geschäftslogik",
          description: "Die Daten enthalten implizite Regeln, die nicht dokumentiert sind.",
          causes: [
            "Historische Workarounds",
            "Encoded Business Rules",
            "Magic Numbers",
            "Kontextabhängige Bedeutung",
          ],
          steps: [
            { title: "Fachexperten interviewen", detail: "Was bedeuten die Werte wirklich?" },
            { title: "Edge Cases sammeln", detail: "Wann verhält sich was wie?" },
            { title: "Regeln explizit machen", detail: "Dokumentieren und validieren" },
            { title: "Feature Engineering", detail: "Logik in Features abbilden" },
          ],
          relatedLinks: [
            { text: "Fachexperte Rolle", href: "/lernen/grundlagen#rollen" },
          ],
        },
      },
      {
        id: "diag-short-history",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Zu kurze Datenhistorie",
          description: "Der verfügbare Zeitraum ist zu kurz für robuste Muster.",
          causes: [
            "Neues Produkt/Feature",
            "Daten wurden gelöscht",
            "System erst kürzlich eingeführt",
            "Archivierungsrichtlinien",
          ],
          steps: [
            { title: "Mindestzeitraum klären", detail: "Wie viel Historie ist nötig?" },
            { title: "Warten", detail: "Projekt verschieben bis genug Daten da?" },
            { title: "Transfer Learning", detail: "Ähnliche Produkte/Märkte nutzen?" },
            { title: "Simpler starten", detail: "Regelbasierte Lösung als Brücke" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-rare-events",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Seltene Events / Klassenungleichgewicht",
          description: "Die Zielvariable hat zu wenige positive Beispiele.",
          causes: [
            "Inhärent seltenes Event (Betrug, Ausfall)",
            "Neues Event ohne Historie",
            "Starkes Klassenungleichgewicht",
          ],
          steps: [
            { title: "Mindestanzahl prüfen", detail: "Wie viele positive Fälle sind nötig?" },
            { title: "Oversampling (SMOTE)", detail: "Synthetische Beispiele generieren" },
            { title: "Undersampling", detail: "Mehrheitsklasse reduzieren" },
            { title: "Anomaly Detection", detail: "Alternativansatz für seltene Events" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-missing-features",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Wichtige Features fehlen",
          description: "Vermutlich relevante Prädiktoren sind nicht in den Daten.",
          causes: [
            "Daten werden nicht erfasst",
            "Externe Datenquellen nötig",
            "Datenschutz-Einschränkungen",
            "Technische Limitierungen",
          ],
          steps: [
            { title: "Feature-Wunschliste", detail: "Welche Features wären ideal?" },
            { title: "Verfügbarkeit prüfen", detail: "Gibt es die Daten irgendwo?" },
            { title: "Proxy-Features", detail: "Approximationen möglich?" },
            { title: "Priorisieren", detail: "Welche Features lohnen den Aufwand?" },
          ],
          relatedLinks: [
            { text: "Feature (Glossar)", href: "/nachschlagen/glossar" },
          ],
        },
      },
    ],
  },
  {
    id: "stakeholder",
    title: "Stakeholder-Probleme",
    emoji: "🤝",
    description: "Kommunikations-, Erwartungs- oder Alignment-Probleme mit Stakeholdern.",
    startNodeId: "stake-1",
    nodes: [
      {
        id: "stake-1",
        type: "question",
        text: "Was ist das Kernproblem?",
        options: [
          { text: "Unrealistische Erwartungen", nextNodeId: "stake-2" },
          { text: "Mangelndes Engagement", nextNodeId: "stake-3" },
          { text: "Kommunikationsprobleme", nextNodeId: "stake-4" },
          { text: "Widerstand gegen das Projekt", nextNodeId: "stake-5" },
        ],
      },
      {
        id: "stake-2",
        type: "question",
        text: "Welche Erwartung ist unrealistisch?",
        options: [
          { text: "100% Accuracy erwartet", nextNodeId: "diag-accuracy-expectation" },
          { text: "Zu schnelle Umsetzung erwartet", nextNodeId: "diag-timeline-expectation" },
          { text: "Zu wenig Daten/Ressourcen", nextNodeId: "diag-resource-expectation" },
        ],
      },
      {
        id: "stake-3",
        type: "question",
        text: "Wie zeigt sich das?",
        options: [
          { text: "Keine Zeit für Meetings", nextNodeId: "diag-no-time" },
          { text: "Keine Antworten auf Fragen", nextNodeId: "diag-no-answers" },
          { text: "Keine Ressourcen bereitgestellt", nextNodeId: "diag-no-resources" },
        ],
      },
      {
        id: "stake-4",
        type: "question",
        text: "Was ist das Kommunikationsproblem?",
        options: [
          { text: "Technische Sprache nicht verstanden", nextNodeId: "diag-tech-language" },
          { text: "Ergebnisse falsch interpretiert", nextNodeId: "diag-misinterpretation" },
          { text: "Unklare Verantwortlichkeiten", nextNodeId: "diag-unclear-roles" },
        ],
      },
      {
        id: "stake-5",
        type: "question",
        text: "Woher kommt der Widerstand?",
        options: [
          { text: "Angst vor Jobverlust/Bedeutungsverlust", nextNodeId: "diag-fear-of-replacement" },
          { text: "Schlechte Erfahrungen mit ML", nextNodeId: "diag-past-failure" },
          { text: "Kein erkennbarer Nutzen", nextNodeId: "diag-no-visible-value" },
        ],
      },
      {
        id: "diag-accuracy-expectation",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Unrealistische Accuracy-Erwartung",
          description: "Stakeholder erwarten 100% Genauigkeit oder perfekte Vorhersagen.",
          causes: [
            "Fehlendes Verständnis für ML-Limitierungen",
            "Marketing-Hype ('KI kann alles')",
            "Keine Referenzwerte bekannt",
            "Vergleich mit deterministischen Systemen",
          ],
          steps: [
            { title: "Baseline zeigen", detail: "Was ist heute ohne ML möglich?" },
            { title: "Trade-offs erklären", detail: "Precision vs. Recall anschaulich machen" },
            { title: "Business-Impact fokussieren", detail: "Verbesserung gegenüber Status quo" },
            { title: "Benchmarks zeigen", detail: "Was erreichen andere in ähnlichen Fällen?" },
          ],
          relatedLinks: [
            { text: "Begriffe übersetzen", href: "/nachschlagen/uebersetzen" },
            { text: "Accuracy (Glossar)", href: "/nachschlagen/glossar" },
          ],
        },
      },
      {
        id: "diag-timeline-expectation",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Unrealistische Timeline",
          description: "Stakeholder erwarten schnellere Ergebnisse als realistisch.",
          causes: [
            "Unterschätzung der Datenarbeit",
            "Vergleich mit einfacheren IT-Projekten",
            "Druck von oben",
            "Agile Misverständnisse",
          ],
          steps: [
            { title: "Phasen erklären", detail: "Warum dauert Data Prep so lange?" },
            { title: "Realistische Milestones", detail: "Was kann wann geliefert werden?" },
            { title: "Quick Wins identifizieren", detail: "Frühe sichtbare Ergebnisse" },
            { title: "Risiken aufzeigen", detail: "Was passiert bei Abkürzungen?" },
          ],
          relatedLinks: [
            { text: "CRISP-DM Phasen", href: "/lernen/grundlagen#crisp-dm" },
          ],
        },
      },
      {
        id: "diag-resource-expectation",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Ressourcen-Erwartung unrealistisch",
          description: "Stakeholder erwarten Ergebnisse ohne angemessene Ressourcen.",
          causes: [
            "Budgetdruck",
            "Unterschätzung des Aufwands",
            "Keine Erfahrung mit ML-Projekten",
            "Andere Prioritäten",
          ],
          steps: [
            { title: "Aufwand transparent machen", detail: "Detaillierte Aufwandsschätzung" },
            { title: "Scope anpassen", detail: "Was ist mit verfügbaren Ressourcen möglich?" },
            { title: "Risiken aufzeigen", detail: "Qualitätsverlust bei Unterfinanzierung" },
            { title: "Alternativen vorschlagen", detail: "Kleinerer Scope, späterer Start?" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-no-time",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Keine Zeit für Abstimmungen",
          description: "Stakeholder haben keine Zeit für notwendige Meetings und Abstimmungen.",
          causes: [
            "Überlastung",
            "Projekt hat keine Priorität",
            "Delegationsunklarheit",
            "Meeting-Müdigkeit",
          ],
          steps: [
            { title: "Eskalieren", detail: "Projektrisiko durch Sponsor kommunizieren" },
            { title: "Effizienter werden", detail: "Kürzere, fokussiertere Meetings" },
            { title: "Async-Kommunikation", detail: "Schriftliche Abstimmungen wo möglich" },
            { title: "Vertreter benennen", detail: "Wer kann für den Stakeholder entscheiden?" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-no-answers",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Fragen werden nicht beantwortet",
          description: "Wichtige fachliche Fragen bleiben unbeantwortet.",
          causes: [
            "Falsche Ansprechpartner",
            "Unklare Fragen",
            "Wissen existiert nicht",
            "Politische Gründe",
          ],
          steps: [
            { title: "Fragen priorisieren", detail: "Welche sind blocker?" },
            { title: "Konkret formulieren", detail: "Multiple Choice statt offene Fragen" },
            { title: "Richtige Person finden", detail: "Wer weiß es wirklich?" },
            { title: "Annahmen dokumentieren", detail: "Wenn keine Antwort, eigene Annahme + Risiko" },
          ],
          relatedLinks: [
            { text: "Stakeholder befragen", href: "/im-projekt/stakeholder" },
          ],
        },
      },
      {
        id: "diag-no-resources",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Keine Ressourcen bereitgestellt",
          description: "Versprochene Ressourcen (Daten, Personal, Budget) kommen nicht.",
          causes: [
            "Konkurrierende Prioritäten",
            "Budget wurde gekürzt",
            "Zuständigkeit unklar",
            "Commitment nur oberflächlich",
          ],
          steps: [
            { title: "Schriftlich festhalten", detail: "Vereinbarungen dokumentieren" },
            { title: "Eskalieren", detail: "Sponsor einschalten" },
            { title: "Alternativen prüfen", detail: "Weniger aufwändige Optionen?" },
            { title: "Projekt pausieren", detail: "Wenn kritische Ressourcen fehlen" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-tech-language",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Technische Sprache nicht verstanden",
          description: "Data-Science-Begriffe werden von Stakeholdern nicht verstanden.",
          causes: [
            "Fach-Jargon ohne Erklärung",
            "Verschiedene Hintergründe",
            "Fehlende Übersetzung",
            "Zu wenig Business-Kontext",
          ],
          steps: [
            { title: "Stakeholder-Übersetzer nutzen", detail: "DS-Begriffe in Business-Sprache" },
            { title: "Analogien verwenden", detail: "Vergleiche aus dem Business-Alltag" },
            { title: "Zahlen mit Kontext", detail: "'80% Precision' → '8 von 10 Alarmen sind echt'" },
            { title: "Visualisierungen", detail: "Bilder statt Zahlen wo möglich" },
          ],
          relatedLinks: [
            { text: "Begriffe übersetzen", href: "/nachschlagen/uebersetzen" },
          ],
        },
      },
      {
        id: "diag-misinterpretation",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Ergebnisse werden falsch interpretiert",
          description: "Stakeholder ziehen falsche Schlüsse aus den Modell-Ergebnissen.",
          causes: [
            "Korrelation als Kausalität",
            "Einzelfälle überbewertet",
            "Statistische Unsicherheit ignoriert",
            "Wunschdenken",
          ],
          steps: [
            { title: "Limitationen explizit machen", detail: "Was sagt das Modell NICHT?" },
            { title: "Konfidenzintervalle zeigen", detail: "Unsicherheit kommunizieren" },
            { title: "Gegenbeispiele diskutieren", detail: "Wann funktioniert es nicht?" },
            { title: "Handlungsempfehlungen geben", detail: "Nicht nur Ergebnisse, sondern Aktionen" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-unclear-roles",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Unklare Verantwortlichkeiten",
          description: "Es ist unklar, wer was entscheidet und verantwortet.",
          causes: [
            "Fehlende RACI-Matrix",
            "Organisationsänderungen",
            "Neue Technologie, alte Strukturen",
            "Niemand will Verantwortung",
          ],
          steps: [
            { title: "RACI erstellen", detail: "Wer ist Responsible, Accountable, Consulted, Informed?" },
            { title: "Entscheider klären", detail: "Wer hat das letzte Wort?" },
            { title: "Eskalationspfad", detail: "Was passiert bei Uneinigkeit?" },
            { title: "Dokumentieren", detail: "Rollen schriftlich festhalten" },
          ],
          relatedLinks: [
            { text: "Rollen-Übersicht", href: "/lernen/grundlagen#rollen" },
          ],
        },
      },
      {
        id: "diag-fear-of-replacement",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Angst vor Ersetzung durch ML",
          description: "Mitarbeiter befürchten, durch das ML-System ersetzt zu werden.",
          causes: [
            "Fehlkommunikation",
            "Historische Erfahrungen",
            "Allgemeine KI-Ängste",
            "Unklare Zukunftsplanung",
          ],
          steps: [
            { title: "Klarstellen", detail: "Automatisierung von Tasks, nicht Jobs" },
            { title: "Einbinden", detail: "Experten als Wissensträger positionieren" },
            { title: "Neue Rolle zeigen", detail: "Was wird sich verbessern?" },
            { title: "Qualifikation anbieten", detail: "Weiterbildung für neue Aufgaben" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-past-failure",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Schlechte Vorerfahrungen mit ML",
          description: "Frühere ML-Projekte sind gescheitert, was zu Skepsis führt.",
          causes: [
            "Fehlgeschlagene Projekte",
            "Gebrochene Versprechen",
            "Mangelnde Qualität",
            "Schlechte Kommunikation",
          ],
          steps: [
            { title: "Lessons Learned analysieren", detail: "Was ging schief?" },
            { title: "Anders machen", detail: "Konkret zeigen, was sich ändert" },
            { title: "Kleiner anfangen", detail: "Vertrauen durch Quick Wins aufbauen" },
            { title: "Transparent sein", detail: "Risiken offen kommunizieren" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-no-visible-value",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Kein erkennbarer Nutzen",
          description: "Stakeholder sehen nicht, welchen Mehrwert das Projekt bringt.",
          causes: [
            "Nutzen nicht quantifiziert",
            "Falsche Metriken kommuniziert",
            "Zu lange bis zu Ergebnissen",
            "Nutzen bei anderen Abteilungen",
          ],
          steps: [
            { title: "ROI berechnen", detail: "Konkrete €-Zahlen" },
            { title: "Quick Wins zeigen", detail: "Frühe sichtbare Ergebnisse" },
            { title: "Vergleich mit Status quo", detail: "'Heute X, mit Modell Y'" },
            { title: "Nutznießer einbinden", detail: "Wer profitiert am meisten?" },
          ],
          relatedLinks: [
            { text: "Business Understanding", href: "/lernen/grundlagen#crisp-dm" },
          ],
        },
      },
    ],
  },
  {
    id: "deployment",
    title: "Deployment-Probleme",
    emoji: "🚀",
    description: "Schwierigkeiten beim Produktivgang oder im laufenden Betrieb.",
    startNodeId: "deploy-1",
    nodes: [
      {
        id: "deploy-1",
        type: "question",
        text: "Wo liegt das Problem?",
        options: [
          { text: "Modell kommt nicht in Produktion", nextNodeId: "deploy-2" },
          { text: "Modell ist langsam in Produktion", nextNodeId: "deploy-3" },
          { text: "Modell verhält sich anders als im Test", nextNodeId: "deploy-4" },
        ],
      },
      {
        id: "deploy-2",
        type: "question",
        text: "Was blockiert den Produktivgang?",
        options: [
          { text: "Technische Integration", nextNodeId: "diag-integration-block" },
          { text: "Fehlende Freigaben", nextNodeId: "diag-approval-block" },
          { text: "Infrastruktur nicht bereit", nextNodeId: "diag-infra-block" },
        ],
      },
      {
        id: "deploy-3",
        type: "question",
        text: "Welche Art von Latenz-Problem?",
        options: [
          { text: "Einzelne Vorhersagen zu langsam", nextNodeId: "diag-inference-latency" },
          { text: "Batch-Verarbeitung dauert zu lange", nextNodeId: "diag-batch-latency" },
          { text: "Skaliert nicht mit Last", nextNodeId: "diag-scaling-issues" },
        ],
      },
      {
        id: "deploy-4",
        type: "question",
        text: "Wie unterscheidet sich das Verhalten?",
        options: [
          { text: "Schlechtere Performance", nextNodeId: "diag-prod-perf-gap" },
          { text: "Andere Ergebnisse bei gleichen Inputs", nextNodeId: "diag-determinism" },
          { text: "Unerwartete Fehler", nextNodeId: "diag-prod-errors" },
        ],
      },
      {
        id: "diag-integration-block",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Technische Integrationsprobleme",
          description: "Das Modell lässt sich nicht in bestehende Systeme integrieren.",
          causes: [
            "Inkompatible Schnittstellen",
            "Fehlende APIs",
            "Verschiedene Technologie-Stacks",
            "Keine Deployment-Pipeline",
          ],
          steps: [
            { title: "API-Design", detail: "REST/gRPC Schnittstelle definieren" },
            { title: "Containerisierung", detail: "Docker für portable Bereitstellung" },
            { title: "CI/CD einrichten", detail: "Automatisierte Deployment-Pipeline" },
            { title: "Mit IT abstimmen", detail: "Anforderungen früh klären" },
          ],
          relatedLinks: [
            { text: "Deployment Phase", href: "/lernen/grundlagen#crisp-dm" },
          ],
        },
      },
      {
        id: "diag-approval-block",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Fehlende Freigaben",
          description: "Das Modell wartet auf Genehmigungen von verschiedenen Stakeholdern.",
          causes: [
            "Governance-Prozesse",
            "Rechtliche Prüfung",
            "Security Review",
            "Business Sign-off",
          ],
          steps: [
            { title: "Prozess klären", detail: "Welche Freigaben sind nötig?" },
            { title: "Parallelisieren", detail: "Reviews gleichzeitig statt nacheinander" },
            { title: "Dokumentation vorbereiten", detail: "Alle nötigen Unterlagen bereit?" },
            { title: "Eskalieren", detail: "Wenn Reviews zu lange dauern" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-infra-block",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Infrastruktur nicht bereit",
          description: "Die benötigte Produktionsinfrastruktur existiert nicht oder ist nicht konfiguriert.",
          causes: [
            "Keine ML-Plattform",
            "Fehlende Compute-Ressourcen",
            "Netzwerk-Konfiguration",
            "Storage nicht bereit",
          ],
          steps: [
            { title: "Anforderungen definieren", detail: "CPU/GPU, RAM, Storage?" },
            { title: "Optionen prüfen", detail: "Cloud vs. On-Premise?" },
            { title: "IT einbinden", detail: "Beschaffung/Konfiguration" },
            { title: "Alternativen", detail: "Managed Services nutzen?" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-inference-latency",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Inferenz-Latenz zu hoch",
          description: "Einzelne Vorhersagen dauern zu lange für den Use Case.",
          causes: [
            "Modell zu komplex",
            "Langsame Feature-Berechnung",
            "Unoptimiertes Framework",
            "Zu wenig Compute",
          ],
          steps: [
            { title: "Profiling", detail: "Wo genau geht die Zeit verloren?" },
            { title: "Modell vereinfachen", detail: "Kleineres Modell, Distillation?" },
            { title: "Optimierungen", detail: "ONNX, TensorRT, Quantization?" },
            { title: "Hardware", detail: "GPU statt CPU? Mehr Cores?" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-batch-latency",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Batch-Verarbeitung zu langsam",
          description: "Die Verarbeitung großer Datenmengen dauert zu lange.",
          causes: [
            "Ineffiziente Daten-Pipeline",
            "Sequentielle statt parallele Verarbeitung",
            "Memory-Bottlenecks",
            "I/O-Limitierungen",
          ],
          steps: [
            { title: "Parallelisieren", detail: "Spark, Dask, Ray?" },
            { title: "Batch-Größe optimieren", detail: "Nicht zu klein, nicht zu groß" },
            { title: "Inkrementell verarbeiten", detail: "Nur Änderungen statt allem?" },
            { title: "Pre-compute", detail: "Features vorberechnen?" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-scaling-issues",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Skalierungsprobleme",
          description: "Das System kommt mit steigender Last nicht zurecht.",
          causes: [
            "Kein Horizontal Scaling",
            "Bottleneck-Komponente",
            "Stateful Service",
            "Ressourcen-Limits",
          ],
          steps: [
            { title: "Load Testing", detail: "Wo bricht das System ein?" },
            { title: "Horizontal Scaling", detail: "Mehr Instanzen statt größere?" },
            { title: "Caching", detail: "Wiederholte Anfragen cachen?" },
            { title: "Auto-Scaling", detail: "Dynamisch mit Last skalieren" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-prod-perf-gap",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Performance-Gap zwischen Test und Produktion",
          description: "Das Modell ist in Produktion schlechter als in der Entwicklung.",
          causes: [
            "Training-Serving-Skew",
            "Unterschiedliche Datenverteilung",
            "Feature-Pipeline-Unterschiede",
            "Timing-Probleme",
          ],
          steps: [
            { title: "Feature-Vergleich", detail: "Gleiche Features in Dev und Prod?" },
            { title: "Daten-Vergleich", detail: "Verteilung Training vs. Produktion?" },
            { title: "Pipeline prüfen", detail: "Gleiche Transformationen?" },
            { title: "Shadow Mode", detail: "Parallel laufen lassen und vergleichen" },
          ],
          relatedLinks: [
            { text: "Leakage (Glossar)", href: "/nachschlagen/glossar" },
          ],
        },
      },
      {
        id: "diag-determinism",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Nicht-deterministische Ergebnisse",
          description: "Gleiche Inputs liefern unterschiedliche Outputs.",
          causes: [
            "Random Seed nicht fixiert",
            "Race Conditions",
            "Floating-Point-Unterschiede",
            "Feature-Timing-Issues",
          ],
          steps: [
            { title: "Seeds fixieren", detail: "Alle Zufallszahlen-Generatoren" },
            { title: "Threading prüfen", detail: "Deterministische Reihenfolge?" },
            { title: "Versioning", detail: "Modell- und Lib-Versionen loggen" },
            { title: "Reproducibility Tests", detail: "Automatisierte Checks" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-prod-errors",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Unerwartete Fehler in Produktion",
          description: "Das Modell wirft Fehler, die in der Entwicklung nicht auftraten.",
          causes: [
            "Edge Cases in echten Daten",
            "Fehlende Fehlerbehandlung",
            "Ressourcen-Limits erreicht",
            "Unbekannte Datenformate",
          ],
          steps: [
            { title: "Error Logging verbessern", detail: "Detaillierte Fehlermeldungen" },
            { title: "Input Validation", detail: "Unerwartete Inputs abfangen" },
            { title: "Fallback definieren", detail: "Was passiert bei Fehler?" },
            { title: "Edge Cases sammeln", detail: "Fehler-Fälle ins Testing" },
          ],
          relatedLinks: [],
        },
      },
    ],
  },
  {
    id: "project",
    title: "Projekt-Probleme",
    emoji: "📋",
    description: "Organisatorische Probleme, Scope Creep, oder Projektmanagement-Herausforderungen.",
    startNodeId: "proj-1",
    nodes: [
      {
        id: "proj-1",
        type: "question",
        text: "Was ist das Hauptproblem?",
        options: [
          { text: "Scope Creep / Feature Creep", nextNodeId: "proj-2" },
          { text: "Zeitplan nicht haltbar", nextNodeId: "proj-3" },
          { text: "Team-Probleme", nextNodeId: "proj-4" },
          { text: "Unklare Ziele", nextNodeId: "proj-5" },
        ],
      },
      {
        id: "proj-2",
        type: "question",
        text: "Woher kommt das Scope Creep?",
        options: [
          { text: "Stakeholder fügen Anforderungen hinzu", nextNodeId: "diag-stakeholder-creep" },
          { text: "Team entdeckt neue Möglichkeiten", nextNodeId: "diag-team-creep" },
          { text: "Ursprüngliche Anforderungen unklar", nextNodeId: "diag-unclear-scope" },
        ],
      },
      {
        id: "proj-3",
        type: "question",
        text: "Warum ist der Zeitplan gefährdet?",
        options: [
          { text: "Aufwand unterschätzt", nextNodeId: "diag-underestimated" },
          { text: "Unvorhergesehene Probleme", nextNodeId: "diag-unforeseen" },
          { text: "Abhängigkeiten blockieren", nextNodeId: "diag-blocked" },
        ],
      },
      {
        id: "proj-4",
        type: "question",
        text: "Welches Team-Problem?",
        options: [
          { text: "Fehlende Skills", nextNodeId: "diag-skill-gap" },
          { text: "Konflikte im Team", nextNodeId: "diag-team-conflict" },
          { text: "Mangelnde Motivation", nextNodeId: "diag-motivation" },
        ],
      },
      {
        id: "proj-5",
        type: "question",
        text: "Was ist unklar?",
        options: [
          { text: "Was genau gebaut werden soll", nextNodeId: "diag-unclear-what" },
          { text: "Warum das Projekt wichtig ist", nextNodeId: "diag-unclear-why" },
          { text: "Wann es fertig sein soll", nextNodeId: "diag-unclear-when" },
        ],
      },
      {
        id: "diag-stakeholder-creep",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Scope Creep durch Stakeholder",
          description: "Stakeholder fügen kontinuierlich neue Anforderungen hinzu.",
          causes: [
            "Kein Change-Management-Prozess",
            "Stakeholder sehen Fortschritt und wollen mehr",
            "Ursprüngliche Anforderungen zu vage",
            "Fehlende Priorisierung",
          ],
          steps: [
            { title: "Change-Prozess einführen", detail: "Neue Anforderungen formal bewerten" },
            { title: "Impact zeigen", detail: "Was kostet jede Änderung an Zeit/Budget?" },
            { title: "Backlog führen", detail: "Neue Features für V2 notieren" },
            { title: "MVP verteidigen", detail: "Was ist Minimum für Success?" },
          ],
          relatedLinks: [
            { text: "Business Understanding", href: "/lernen/grundlagen#crisp-dm" },
          ],
        },
      },
      {
        id: "diag-team-creep",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Feature Creep durch Team",
          description: "Das Team fügt selbst Features hinzu, die nicht angefordert wurden.",
          causes: [
            "Technische Begeisterung",
            "Perfektionismus",
            "Unklare Prioritäten",
            "Langeweile bei 'einfachen' Tasks",
          ],
          steps: [
            { title: "Definition of Done klären", detail: "Was ist 'fertig'?" },
            { title: "Timeboxing", detail: "Feste Zeitbudgets pro Feature" },
            { title: "Review-Prozess", detail: "Änderungen vor Umsetzung absegnen" },
            { title: "Backlog für Ideen", detail: "Gute Ideen für später parken" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-unclear-scope",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Ursprünglicher Scope unklar",
          description: "Die anfänglichen Anforderungen waren nicht präzise genug.",
          causes: [
            "Zu wenig Anforderungsanalyse",
            "Agile Misverständnisse",
            "Stakeholder wussten es selbst nicht",
            "Zeitdruck beim Start",
          ],
          steps: [
            { title: "Scope-Dokument nachträglich", detail: "Was genau bauen wir?" },
            { title: "Out-of-Scope explizit machen", detail: "Was bauen wir NICHT?" },
            { title: "Stakeholder-Abstimmung", detail: "Schriftliche Bestätigung" },
            { title: "Regelmäßige Reviews", detail: "Sind wir noch auf Kurs?" },
          ],
          relatedLinks: [
            { text: "Business Understanding", href: "/lernen/grundlagen#crisp-dm" },
          ],
        },
      },
      {
        id: "diag-underestimated",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Aufwand unterschätzt",
          description: "Die ursprüngliche Schätzung war zu optimistisch.",
          causes: [
            "Fehlende Erfahrung mit ähnlichen Projekten",
            "Datenqualität unterschätzt",
            "Optimismus-Bias",
            "Druck für niedrige Schätzung",
          ],
          steps: [
            { title: "Neu schätzen", detail: "Mit aktuellem Wissen realistische Timeline" },
            { title: "Kommunizieren", detail: "Verzögerung früh und transparent" },
            { title: "Scope reduzieren", detail: "Was kann weggelassen werden?" },
            { title: "Lessons Learned", detail: "Für künftige Projekte dokumentieren" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-unforeseen",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Unvorhergesehene Probleme",
          description: "Probleme sind aufgetreten, die niemand vorhergesehen hat.",
          causes: [
            "Technische Überraschungen",
            "Datenprobleme",
            "Externe Abhängigkeiten",
            "Neue Anforderungen",
          ],
          steps: [
            { title: "Problem eingrenzen", detail: "Was genau ist das Problem?" },
            { title: "Lösungsoptionen", detail: "Welche Wege gibt es?" },
            { title: "Impact bewerten", detail: "Wie viel Zeit kostet das?" },
            { title: "Puffer einplanen", detail: "Künftig mehr Risiko-Buffer" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-blocked",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Durch Abhängigkeiten blockiert",
          description: "Das Projekt wartet auf andere Teams oder Systeme.",
          causes: [
            "Abhängigkeiten nicht früh identifiziert",
            "Andere Teams haben andere Prioritäten",
            "Technische Abhängigkeiten",
            "Organisatorische Silos",
          ],
          steps: [
            { title: "Eskalieren", detail: "Blocker an Management kommunizieren" },
            { title: "Workaround suchen", detail: "Können wir anders weitermachen?" },
            { title: "Parallele Arbeit", detail: "Was kann in der Zwischenzeit getan werden?" },
            { title: "Für nächstes Mal", detail: "Abhängigkeiten früher identifizieren" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-skill-gap",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Fehlende Skills im Team",
          description: "Dem Team fehlen wichtige Fähigkeiten für das Projekt.",
          causes: [
            "Neue Technologie",
            "Unterschätzter Skill-Bedarf",
            "Teamzusammensetzung",
            "Fluktuation",
          ],
          steps: [
            { title: "Skill-Gap identifizieren", detail: "Was genau fehlt?" },
            { title: "Training", detail: "Kann das Team lernen?" },
            { title: "Externe Hilfe", detail: "Berater, Freelancer?" },
            { title: "Scope anpassen", detail: "Projekt auf vorhandene Skills zuschneiden" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-team-conflict",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Konflikte im Team",
          description: "Es gibt zwischenmenschliche Konflikte, die die Arbeit behindern.",
          causes: [
            "Unterschiedliche Arbeitsweisen",
            "Unklare Verantwortlichkeiten",
            "Stress und Druck",
            "Persönliche Differenzen",
          ],
          steps: [
            { title: "Problem anerkennen", detail: "Konflikte nicht ignorieren" },
            { title: "Gespräch führen", detail: "Perspektiven verstehen" },
            { title: "Rollen klären", detail: "Wer macht was?" },
            { title: "Externe Hilfe", detail: "Mediation, Teamcoaching" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-motivation",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Mangelnde Motivation",
          description: "Das Team ist nicht motiviert, das Projekt voranzutreiben.",
          causes: [
            "Sinn des Projekts unklar",
            "Zu viel Routine, zu wenig Challenge",
            "Fehlendes Feedback",
            "Burnout",
          ],
          steps: [
            { title: "Why kommunizieren", detail: "Warum ist das Projekt wichtig?" },
            { title: "Quick Wins schaffen", detail: "Sichtbare Erfolge" },
            { title: "Autonomie geben", detail: "Entscheidungen überlassen" },
            { title: "Anerkennung", detail: "Gute Arbeit wertschätzen" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-unclear-what",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Unklares Projektziel (Was)",
          description: "Es ist nicht klar, was genau gebaut werden soll.",
          causes: [
            "Fehlende Anforderungsanalyse",
            "Vage Auftragserteilung",
            "Widersprüchliche Anforderungen",
            "Ständige Änderungen",
          ],
          steps: [
            { title: "Workshop", detail: "Anforderungen gemeinsam erarbeiten" },
            { title: "Konkrete Use Cases", detail: "Was soll der User tun können?" },
            { title: "Prototyp/Mockup", detail: "Visualisieren statt beschreiben" },
            { title: "Schriftlich fixieren", detail: "Abgestimmtes Scope-Dokument" },
          ],
          relatedLinks: [
            { text: "Business Understanding", href: "/lernen/grundlagen#crisp-dm" },
          ],
        },
      },
      {
        id: "diag-unclear-why",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Unklarer Projektzweck (Warum)",
          description: "Es ist nicht klar, warum das Projekt wichtig ist.",
          causes: [
            "Business Case nicht kommuniziert",
            "Projekt wurde 'von oben' verordnet",
            "Politische statt sachliche Gründe",
            "Pilot ohne klares Ziel",
          ],
          steps: [
            { title: "Business Case klären", detail: "Welches Problem lösen wir?" },
            { title: "ROI zeigen", detail: "Was ist der erwartete Nutzen?" },
            { title: "Sponsor einbinden", detail: "Warum ist ihm/ihr das wichtig?" },
            { title: "Team informieren", detail: "Why transparent kommunizieren" },
          ],
          relatedLinks: [],
        },
      },
      {
        id: "diag-unclear-when",
        type: "diagnosis",
        text: "",
        diagnosis: {
          title: "Unklare Timeline (Wann)",
          description: "Es gibt keine klare Deadline oder Meilensteine.",
          causes: [
            "Kein Projekt-Management",
            "Agile Misverständnisse",
            "Externe Deadlines ignoriert",
            "Ständige Verschiebungen",
          ],
          steps: [
            { title: "Deadline klären", detail: "Gibt es einen harten Termin?" },
            { title: "Meilensteine definieren", detail: "Was ist wann fällig?" },
            { title: "Rückwärts planen", detail: "Was muss wann fertig sein?" },
            { title: "Regelmäßig prüfen", detail: "Sind wir im Zeitplan?" },
          ],
          relatedLinks: [],
        },
      },
    ],
  },
];

// Hilfsfunktion: Baum finden
export function getDecisionTree(id: string): DecisionTree | undefined {
  return decisionTrees.find((tree) => tree.id === id);
}

// Hilfsfunktion: Node finden
export function getNode(treeId: string, nodeId: string): DecisionNode | undefined {
  const tree = getDecisionTree(treeId);
  if (!tree) return undefined;
  return tree.nodes.find((node) => node.id === nodeId);
}
