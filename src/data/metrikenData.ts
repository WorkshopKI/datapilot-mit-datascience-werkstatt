// Metriken-Daten für die Metriken-Referenz Seite

export interface MetricData {
  id: string;
  title: string;
  formula?: string;
  definition: string;
  range?: string;
  unit?: string;
  interpretation?: Array<{ value: string; meaning: string }>;
  example?: {
    scenario?: string;
    data?: string;
    calculation?: string;
    steps?: string[];
  };
  pros?: string[];
  cons?: string[];
  warning?: string;
  useWhen?: string;
}

export interface ComparisonData {
  title: string;
  columns: string[];
  rows: string[][];
}

export interface ConceptData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  keyPoints?: string[];
  warning?: string;
  measures?: string[];
}

// ===== REGRESSION METRIKEN =====

export const regressionMetrics: MetricData[] = [
  {
    id: "r2",
    title: "R² (Bestimmtheitsmaß)",
    formula: "R² = 1 - (SS_Res / SS_Tot)",
    definition: "Anteil der Variation in y, der durch das Modell erklärt wird.",
    range: "0 ≤ R² ≤ 1",
    interpretation: [
      { value: "R² = 1", meaning: "Perfekte Anpassung (alle Punkte auf der Geraden)" },
      { value: "R² = 0", meaning: "Modell erklärt keine Variation" },
      { value: "R² = 0.7", meaning: "70% der Variation erklärt" },
    ],
    example: {
      scenario: "Berechnung der Summenquadrate",
      steps: [
        "SS_Tot = Σ(y - ȳ)² → Gesamtvariation (Abstand jedes Punkts vom Mittelwert)",
        "SS_Res = Σ(y - ŷ)² → Restfehler (Abstand jedes Punkts von der Vorhersage)",
        "ȳ = Mittelwert aller y-Werte, ŷ = Modell-Vorhersage"
      ]
    },
    warning: "R² steigt IMMER wenn Variablen hinzugefügt werden – auch nutzlose!",
    useWhen: "Allgemeine Bewertung der Modellgüte",
  },
  {
    id: "adjusted-r2",
    title: "Adjusted R² (Korrigiertes R²)",
    formula: "Adj. R² = 1 - [(SS_Res/(n-k-1)) / (SS_Tot/(n-1))]",
    definition: "R² angepasst für die Anzahl der Variablen. 'Bestraft' unnötige Variablen.",
    range: "Kann auch negativ sein (bei schlechtem Modell)",
    interpretation: [
      { value: "Adj. R² < R²", meaning: "Normal – Strafe für Variablen" },
      { value: "Adj. R² sinkt", meaning: "Neue Variable bringt keinen Mehrwert" },
      { value: "Adj. R² negativ", meaning: "Modell ist schlechter als Mittelwert" },
    ],
    useWhen: "Vergleich von Modellen mit unterschiedlicher Variablenanzahl",
  },
  {
    id: "mse",
    title: "MSE (Mean Squared Error)",
    formula: "MSE = (1/n) × Σ(y - ŷ)²",
    definition: "Durchschnitt der quadrierten Fehler zwischen Vorhersage und echtem Wert.",
    unit: "Quadrat der Original-Einheit (z.B. €²)",
    interpretation: [
      { value: "MSE = 0", meaning: "Perfekte Vorhersage" },
      { value: "MSE hoch", meaning: "Große Abweichungen" },
    ],
    warning: "Sehr empfindlich gegenüber Ausreißern durch Quadrierung!",
    useWhen: "Optimierung, wenn große Fehler besonders schlimm sind",
  },
  {
    id: "rmse",
    title: "RMSE (Root Mean Squared Error)",
    formula: "RMSE = √MSE",
    definition: "Wurzel des MSE – in der gleichen Einheit wie die Zielgröße.",
    unit: "Gleiche Einheit wie Originaldaten",
    interpretation: [
      { value: "RMSE = 0", meaning: "Perfekte Vorhersage" },
      { value: "RMSE = 5€", meaning: "Vorhersage weicht im Schnitt ~5€ ab" },
    ],
    useWhen: "Interpretierbare Version von MSE",
  },
  {
    id: "mae",
    title: "MAE (Mean Absolute Error)",
    formula: "MAE = (1/n) × Σ|y - ŷ|",
    definition: "Durchschnitt der absoluten Fehler – robust gegenüber Ausreißern.",
    unit: "Gleiche Einheit wie Originaldaten",
    interpretation: [
      { value: "MAE = 0", meaning: "Perfekte Vorhersage" },
      { value: "MAE = 3€", meaning: "Vorhersage weicht im Schnitt 3€ ab" },
    ],
    useWhen: "Wenn Ausreißer ignoriert werden sollen",
  },
];

export const regressionComparisons: ComparisonData[] = [
  {
    title: "R² vs. Adjusted R²",
    columns: ["Merkmal", "R²", "Adjusted R²"],
    rows: [
      ["Was es misst", "Erklärte Variation", "Erklärte Variation (bereinigt)"],
      ["Steigt immer?", "Ja, bei neuen Variablen", "Nein, kann sinken"],
      ["Wertebereich", "0 bis 1", "Kann negativ sein"],
      ["Wann verwenden?", "Einzelnes Modell bewerten", "Modelle vergleichen"],
    ],
  },
  {
    title: "Fehlermetriken im Vergleich",
    columns: ["Metrik", "Einheit", "Ausreißer-Sensitivität", "Wann verwenden?"],
    rows: [
      ["MSE", "y²", "Hoch", "Optimierung, wenn große Fehler schlimm"],
      ["RMSE", "y", "Hoch", "Interpretierbare Version von MSE"],
      ["MAE", "y", "Niedrig", "Wenn Ausreißer ignoriert werden sollen"],
    ],
  },
];

// ===== KLASSIFIKATION METRIKEN =====

export const klassifikationAlgorithms: MetricData[] = [
  {
    id: "decision-tree",
    title: "Decision Tree (Entscheidungsbaum)",
    definition: "Funktioniert wie ein Flussdiagramm: Der Algorithmus stellt nacheinander Ja/Nein-Fragen und kommt so Schritt für Schritt zur Vorhersage.",
    example: {
      scenario: "Titanic-Überlebenschance",
      steps: [
        "Frage 1: Ist die Person männlich?",
        "Frage 2: Ist sie erwachsen?",
        "Frage 3: Reiste sie in der 3. Klasse?",
        "→ Jeder Pfad führt zu einer Wahrscheinlichkeit"
      ]
    },
    pros: [
      "Leicht zu interpretieren und zu erklären",
      "Ergebnis kann als Regelwerk dargestellt werden",
      "Findet automatisch die wichtigsten Fragen"
    ],
    cons: [
      "Anfällig für Overfitting",
      "Kleine Datenänderungen können Baum stark verändern"
    ],
    useWhen: "Wenn Stakeholder das Modell verstehen müssen"
  },
  {
    id: "random-forest",
    title: "Random Forest",
    definition: "Kombiniert viele Entscheidungsbäume zu einem 'Wald'. Jeder Baum lernt auf leicht unterschiedlichen Daten, am Ende stimmen alle gemeinsam ab.",
    example: {
      scenario: "Warum funktioniert das?",
      steps: [
        "Wie bei einem Expertenteam:",
        "Einzelmeinungen können falsch sein",
        "Aber der Durchschnitt vieler Meinungen ist oft richtig",
        "→ Mehrheitsentscheid aller Bäume"
      ]
    },
    pros: [
      "Genauer als einzelner Entscheidungsbaum",
      "Robuster gegen Overfitting",
      "Stabil bei verrauschten Daten"
    ],
    cons: [
      "Schwer zu erklären ('Black Box')",
      "Längere Trainingszeit"
    ],
    useWhen: "Wenn Genauigkeit wichtiger als Erklärbarkeit ist"
  }
];

export const klassifikationMetrics: MetricData[] = [
  {
    id: "accuracy",
    title: "Accuracy (Genauigkeit)",
    formula: "Accuracy = (TP + TN) / (TP + TN + FP + FN)",
    definition: "Anteil aller korrekten Vorhersagen an der Gesamtzahl.",
    range: "0 bis 1 (höher = besser)",
    interpretation: [
      { value: "Accuracy = 0.95", meaning: "95% aller Vorhersagen sind korrekt" },
    ],
    warning: "⚠️ Bei unbalancierten Klassen irreführend! Ein Modell das bei 1% Fraud-Rate immer 'kein Fraud' sagt, erreicht 99% Accuracy.",
    useWhen: "Nur bei balancierten Klassen (ca. 50/50 Verteilung)",
  },
  {
    id: "precision",
    title: "Precision (Präzision)",
    formula: "Precision = TP / (TP + FP)",
    definition: "Wie viele der positiven Vorhersagen sind korrekt?",
    range: "0 bis 1 (höher = besser)",
    interpretation: [
      { value: "Precision = 1", meaning: "Kein falscher Alarm" },
      { value: "Precision = 0.8", meaning: "80% der positiven Vorhersagen stimmen" },
    ],
    example: {
      scenario: "Spam-Filter",
      steps: [
        "Hohe Precision = wenige legitime Mails im Spam",
        "Niedrige Precision = viele gute Mails als Spam markiert",
      ],
    },
    useWhen: "False Positives sind teuer (z.B. unnötige Kundenanrufe)",
  },
  {
    id: "recall",
    title: "Recall (Sensitivität)",
    formula: "Recall = TP / (TP + FN)",
    definition: "Wie viele der tatsächlich positiven Fälle wurden erkannt?",
    range: "0 bis 1 (höher = besser)",
    interpretation: [
      { value: "Recall = 1", meaning: "Alle positiven Fälle gefunden" },
      { value: "Recall = 0.9", meaning: "90% der positiven Fälle erkannt" },
    ],
    example: {
      scenario: "Krebs-Screening",
      steps: [
        "Hoher Recall = wenige Kranke übersehen",
        "Niedriger Recall = Kranke nicht erkannt",
      ],
    },
    useWhen: "False Negatives sind teuer (z.B. Krankheit übersehen)",
  },
  {
    id: "specificity",
    title: "Specificity (Spezifität)",
    formula: "Specificity = TN / (TN + FP)",
    definition: "Wie viele der tatsächlich negativen Fälle wurden korrekt als negativ erkannt?",
    range: "0 bis 1 (höher = besser)",
    interpretation: [
      { value: "Specificity = 1", meaning: "Keine False Positives" },
      { value: "Specificity = 0.95", meaning: "95% der negativen Fälle korrekt erkannt" },
    ],
    useWhen: "Wenn False Positives vermieden werden sollen (z.B. unnötige Behandlungen)",
  },
  {
    id: "f1",
    title: "F1-Score",
    formula: "F1 = 2 × (Precision × Recall) / (Precision + Recall)",
    definition: "Harmonisches Mittel aus Precision und Recall. Balanciert beide Metriken.",
    range: "0 bis 1 (höher = besser)",
    interpretation: [
      { value: "F1 = 1", meaning: "Perfekte Precision und Recall" },
      { value: "F1 = 0", meaning: "Precision oder Recall ist 0" },
      { value: "F1 hoch", meaning: "Gute Balance zwischen beiden" },
    ],
    useWhen: "Precision und Recall gleich wichtig",
  },
  {
    id: "auc-roc",
    title: "AUC-ROC",
    definition: "Area Under the ROC Curve. Misst die Trennfähigkeit des Modells über alle möglichen Thresholds.",
    range: "0.5 (Zufall) bis 1.0 (perfekt)",
    interpretation: [
      { value: "AUC = 0.5", meaning: "Nicht besser als Münzwurf" },
      { value: "AUC 0.7-0.8", meaning: "Akzeptable Trennfähigkeit" },
      { value: "AUC 0.8-0.9", meaning: "Gute Trennfähigkeit" },
      { value: "AUC > 0.9", meaning: "Sehr gute Trennfähigkeit" },
    ],
    example: {
      scenario: "Interpretation",
      steps: [
        "AUC = 0.85 bedeutet: Bei einem zufälligen Paar (positiv/negativ)",
        "ordnet das Modell in 85% der Fälle den positiven Fall höher ein",
      ],
    },
    useWhen: "Gesamtbeurteilung der Klassifikationsleistung, wenn Threshold noch nicht feststeht",
  },
];

export const klassifikationComparisons: ComparisonData[] = [
  {
    title: "Precision vs. Recall – Wann was optimieren?",
    columns: ["Szenario", "Optimiere auf", "Warum?"],
    rows: [
      ["Spam-Filter", "Precision", "Lieber Spam durchlassen als gute Mail löschen"],
      ["Krebs-Screening", "Recall", "Lieber Fehlalarm als Krebs übersehen"],
      ["Fraud Detection", "Recall", "Lieber mehr prüfen als Betrug übersehen"],
      ["Produktempfehlung", "Precision", "Weniger, aber passende Empfehlungen"],
      ["Churn Prediction", "Balance (F1)", "Beides wichtig für ROI"],
    ],
  },
  {
    title: "Decision Tree vs. Random Forest",
    columns: ["Merkmal", "Decision Tree", "Random Forest"],
    rows: [
      ["Verständlichkeit", "Leicht erklärbar", "Schwer erklärbar (Black Box)"],
      ["Genauigkeit", "Gut", "Sehr gut"],
      ["Overfitting-Risiko", "Höher", "Niedriger"],
      ["Trainingszeit", "Schnell", "Langsamer"],
      ["Wann nutzen?", "Erklärbarkeit wichtig", "Genauigkeit wichtig"],
    ],
  },
];

// ===== STATISTIK METRIKEN =====

export const statistikMetrics: MetricData[] = [
  {
    id: "mittelwert",
    title: "Mittelwert (Durchschnitt)",
    formula: "x̄ = (1/n) × Σxᵢ",
    definition: "Summe aller Werte geteilt durch Anzahl.",
    example: {
      data: "[2, 4, 6]",
      calculation: "(2 + 4 + 6) / 3 = 4",
    },
    warning: "Empfindlich gegenüber Ausreißern!",
  },
  {
    id: "median",
    title: "Median",
    definition: "Der mittlere Wert einer sortierten Datenreihe. Robust gegenüber Ausreißern.",
    example: {
      data: "[1, 2, 100]",
      calculation: "Median = 2 (robuster als Mittelwert = 34.3)",
    },
    interpretation: [
      { value: "Median < Mittelwert", meaning: "Daten sind rechtsschief (wenige hohe Werte)" },
      { value: "Median > Mittelwert", meaning: "Daten sind linksschief (wenige niedrige Werte)" },
    ],
    useWhen: "Bei Ausreißern oder schiefen Verteilungen",
  },
  {
    id: "varianz",
    title: "Varianz",
    formula: "σ² = (1/n) × Σ(xᵢ - x̄)²",
    definition: "Durchschnitt der quadrierten Abweichungen vom Mittelwert.",
    unit: "Quadrat der Original-Einheit",
    interpretation: [
      { value: "Varianz = 0", meaning: "Alle Werte gleich" },
      { value: "Varianz hoch", meaning: "Werte streuen stark" },
    ],
    warning: "Für Stichproben: durch (n-1) teilen (Bessel-Korrektur)",
  },
  {
    id: "standardabweichung",
    title: "Standardabweichung",
    formula: "σ = √Varianz",
    definition: "Wie weit streuen die Werte um den Mittelwert?",
    unit: "Gleiche Einheit wie Originaldaten",
    interpretation: [
      { value: "Kleine Std.Abw.", meaning: "Werte liegen eng beieinander" },
      { value: "Große Std.Abw.", meaning: "Werte streuen stark" },
    ],
    example: {
      data: "[2, 4, 6]",
      steps: [
        "Mittelwert: 4",
        "Abweichungen: -2, 0, +2",
        "Quadriert: 4, 0, 4",
        "Summe: 8",
        "Varianz (Stichprobe): 8/2 = 4",
        "Standardabweichung: √4 = 2",
      ],
    },
  },
  {
    id: "kovarianz",
    title: "Kovarianz",
    formula: "Cov(X,Y) = Σ(xᵢ - x̄)(yᵢ - ȳ) / n",
    definition: "Maß für den gemeinsamen Zusammenhang zweier Variablen (nicht normiert).",
    interpretation: [
      { value: "Cov > 0", meaning: "Positive Zusammenhang (beide steigen/fallen gemeinsam)" },
      { value: "Cov < 0", meaning: "Negativer Zusammenhang (eine steigt, andere fällt)" },
      { value: "Cov ≈ 0", meaning: "Kein linearer Zusammenhang" },
    ],
    warning: "Nicht vergleichbar zwischen verschiedenen Variablen – nutze stattdessen Korrelation!",
    useWhen: "Als Grundlage für Korrelation und Varianzanalyse",
  },
  {
    id: "korrelation-statistik",
    title: "Korrelation (Pearson r)",
    formula: "r = Cov(X,Y) / (σₓ × σᵧ)",
    definition: "Normierte Kovarianz. Misst Stärke und Richtung des linearen Zusammenhangs.",
    range: "-1 bis +1",
    interpretation: [
      { value: "r = +1", meaning: "Perfekt positiv (je mehr x, desto mehr y)" },
      { value: "r = -1", meaning: "Perfekt negativ (je mehr x, desto weniger y)" },
      { value: "r = 0", meaning: "Kein linearer Zusammenhang" },
      { value: "|r| > 0.7", meaning: "Starke Korrelation" },
      { value: "|r| < 0.3", meaning: "Schwache Korrelation" },
    ],
    warning: "Korrelation ≠ Kausalität! Eisverkauf korreliert mit Ertrinkungsfällen – beide steigen im Sommer.",
    useWhen: "Feature-Analyse, explorative Datenanalyse",
  },
  {
    id: "normalverteilung",
    title: "Normalverteilung (Gaußverteilung)",
    definition: "Symmetrische, glockenförmige Wahrscheinlichkeitsverteilung.",
    interpretation: [
      { value: "68% der Werte", meaning: "innerhalb ±1σ vom Mittelwert" },
      { value: "95% der Werte", meaning: "innerhalb ±2σ vom Mittelwert" },
      { value: "99.7% der Werte", meaning: "innerhalb ±3σ vom Mittelwert" },
    ],
    useWhen: "Viele statistische Tests und ML-Algorithmen setzen Normalverteilung voraus",
  },
  {
    id: "perzentil",
    title: "Perzentil",
    definition: "Wert, unter dem ein bestimmter Prozentsatz der Daten liegt.",
    example: {
      scenario: "Gehaltsverteilung",
      steps: [
        "25. Perzentil (Q1): 25% verdienen weniger",
        "50. Perzentil (Median): 50% verdienen weniger",
        "90. Perzentil: 90% verdienen weniger (Top 10%)",
      ],
    },
    useWhen: "Zum Vergleich von Positionen in Verteilungen, Ausreißer-Erkennung",
  },
];

// ===== CLUSTERING METRIKEN =====

export const clusteringMetrics: MetricData[] = [
  {
    id: "kmeans",
    title: "k-Means Algorithmus",
    definition: "Iterativer Algorithmus, der Datenpunkte in k Gruppen (Cluster) einteilt, indem er die Abstände zu k Cluster-Zentren minimiert.",
    example: {
      scenario: "Ablauf des k-Means",
      steps: [
        "1. Wähle k zufällige Startpunkte als Centroids",
        "2. Ordne jeden Datenpunkt dem nächsten Centroid zu",
        "3. Berechne neue Centroids als Mittelwert der zugeordneten Punkte",
        "4. Wiederhole Schritte 2-3 bis Konvergenz",
      ],
    },
    warning: "k muss vorab festgelegt werden – die Wahl beeinflusst das Ergebnis stark!",
    useWhen: "Daten in kompakte, ähnlich große Gruppen einteilen",
  },
  {
    id: "inertia",
    title: "Inertia (WCSS)",
    formula: "WCSS = Σᵢ Σₓ∈Cᵢ ||x - μᵢ||²",
    definition: "Within-Cluster Sum of Squares. Summe der quadrierten Abstände aller Punkte zu ihrem jeweiligen Cluster-Zentrum.",
    range: "0 bis ∞ (niedriger = besser)",
    interpretation: [
      { value: "WCSS = 0", meaning: "Jeder Punkt ist sein eigener Cluster" },
      { value: "WCSS hoch", meaning: "Punkte liegen weit vom Centroid entfernt" },
      { value: "WCSS sinkt", meaning: "Mehr Cluster → kleinere Inertia" },
    ],
    warning: "Sinkt IMMER mit mehr Clustern – nicht allein zur k-Wahl nutzen!",
    useWhen: "Elbow-Methode zur Bestimmung der optimalen Cluster-Anzahl",
  },
  {
    id: "silhouette",
    title: "Silhouette-Koeffizient",
    formula: "s = (b - a) / max(a, b)",
    definition: "Misst wie gut ein Punkt zu seinem Cluster passt. a = mittlerer Abstand zu eigenen Cluster-Punkten, b = mittlerer Abstand zum nächsten fremden Cluster.",
    range: "-1 bis +1",
    interpretation: [
      { value: "s ≈ +1", meaning: "Punkt passt gut zum eigenen Cluster" },
      { value: "s ≈ 0", meaning: "Punkt liegt zwischen zwei Clustern" },
      { value: "s ≈ -1", meaning: "Punkt gehört zum falschen Cluster" },
    ],
    example: {
      scenario: "Interpretation des Durchschnitts",
      steps: [
        "Durchschnitt > 0.7: Starke Struktur",
        "Durchschnitt 0.5-0.7: Vernünftige Struktur",
        "Durchschnitt 0.25-0.5: Schwache Struktur",
        "Durchschnitt < 0.25: Keine echte Cluster-Struktur",
      ],
    },
    useWhen: "Allgemeine Bewertung der Clustering-Qualität",
  },
  {
    id: "davies-bouldin",
    title: "Davies-Bouldin-Index",
    formula: "DB = (1/k) × Σᵢ maxⱼ [(σᵢ + σⱼ) / d(cᵢ, cⱼ)]",
    definition: "Verhältnis von Cluster-Kompaktheit (σ = Streuung) zu Cluster-Trennung (d = Abstand der Centroids). Niedrigere Werte sind besser.",
    range: "0 bis ∞ (niedriger = besser)",
    interpretation: [
      { value: "DB nahe 0", meaning: "Kompakte, gut getrennte Cluster" },
      { value: "DB hoch", meaning: "Überlappende oder diffuse Cluster" },
    ],
    useWhen: "Vergleich verschiedener Clustering-Modelle oder k-Werte",
  },
];

export const clusteringConcepts: ConceptData[] = [
  {
    id: "elbow",
    title: "Elbow-Methode",
    subtitle: "Optimale Cluster-Anzahl finden",
    description: "Visualisierung der Inertia (WCSS) für verschiedene k-Werte. Der 'Ellbogen' im Diagramm zeigt den Punkt, ab dem mehr Cluster kaum noch Verbesserung bringen.",
    keyPoints: [
      "X-Achse: Anzahl Cluster (k)",
      "Y-Achse: Inertia (WCSS)",
      "Optimales k: Wo die Kurve abknickt",
      "Nicht immer eindeutig – manchmal ist der Ellbogen schwer zu erkennen",
    ],
    warning: "Subjektive Methode – bei unklarem Ellbogen zusätzlich Silhouette-Score prüfen!",
  },
  {
    id: "centroid",
    title: "Centroid",
    subtitle: "Mittelpunkt eines Clusters",
    description: "Der Centroid ist der Durchschnitt aller Punkte im Cluster – quasi der 'Schwerpunkt'. Bei k-Means werden Punkte dem nächsten Centroid zugeordnet.",
    keyPoints: [
      "Berechnung: Mittelwert aller Koordinaten der Cluster-Punkte",
      "Bewegung: Centroids wandern in jeder Iteration",
      "Konvergenz: Wenn Centroids sich nicht mehr ändern",
    ],
  },
  {
    id: "kmeans-pp",
    title: "k-Means++",
    subtitle: "Bessere Initialisierung",
    description: "Verbesserter Algorithmus für die Wahl der Startpunkte. Statt zufälliger Auswahl werden Punkte gewählt, die weit voneinander entfernt liegen.",
    keyPoints: [
      "Erster Centroid: Zufällig gewählt",
      "Weitere Centroids: Mit Wahrscheinlichkeit proportional zum Abstand²",
      "Ergebnis: Schnellere Konvergenz, bessere Cluster",
    ],
    measures: [
      "Standard in scikit-learn (init='k-means++')",
      "Reduziert das Risiko schlechter lokaler Minima",
      "Kaum Mehraufwand bei der Initialisierung",
    ],
  },
];

export const clusteringComparisons: ComparisonData[] = [
  {
    title: "Clustering-Metriken im Vergleich",
    columns: ["Metrik", "Misst", "Optimal", "Wann verwenden?"],
    rows: [
      ["Inertia (WCSS)", "Kompaktheit", "Niedrig", "Elbow-Methode"],
      ["Silhouette", "Trennung + Kompaktheit", "Nahe +1", "Allgemeine Bewertung"],
      ["Davies-Bouldin", "Verhältnis Größe/Abstand", "Niedrig", "Modellvergleich"],
    ],
  },
];

// ===== KONZEPTE =====

export const konzepte: ConceptData[] = [
  {
    id: "bessel",
    title: "Bessel-Korrektur",
    subtitle: "Warum teilen wir durch (n-1) statt n?",
    description: "Bei Stichproben unterschätzt n die wahre Streuung. (n-1) korrigiert diesen systematischen Fehler.",
    keyPoints: [
      "Stichprobe kennt den echten Mittelwert nicht",
      "Verwendung des Stichproben-Mittelwerts unterschätzt Varianz",
      "(n-1) korrigiert diese Unterschätzung",
    ],
  },
  {
    id: "quadrieren",
    title: "Warum Quadrieren + Wurzel?",
    subtitle: "Der Umweg zur Standardabweichung",
    description: "Positive und negative Abweichungen würden sich sonst aufheben.",
    keyPoints: [
      "Einfache Summe der Abweichungen = immer 0",
      "Beträge möglich, aber mathematisch schwieriger",
      "Quadrieren → alle Werte positiv + große Fehler stärker gewichtet",
      "Wurzel → zurück zur Originaleinheit",
    ],
  },
  {
    id: "anscombe",
    title: "Anscombe-Quartett",
    subtitle: "Warum Visualisierung wichtig ist",
    description: "Vier Datensätze mit identischen statistischen Kennzahlen, aber völlig unterschiedlichen Plots.",
    keyPoints: [
      "Mittelwert x: 9",
      "Mittelwert y: 7.50",
      "Varianz x: 11",
      "Korrelation: 0.816",
      "Regression: y = 3.00 + 0.500x",
    ],
    warning: "Kennzahlen allein reichen nicht. Immer die Daten visualisieren!",
  },
  {
    id: "overfitting",
    title: "Overfitting",
    subtitle: "Wenn das Modell zu gut ist",
    description: "Das Modell lernt die Trainingsdaten auswendig – inklusive Rauschen und Zufälligkeiten. Auf neuen Daten versagt es.",
    keyPoints: [
      "Training-Accuracy viel höher als Test-Accuracy",
      "R² steigt mit mehr Variablen, aber Adjusted R² sinkt",
      "Modell reagiert extrem auf kleine Datenänderungen",
    ],
    measures: [
      "Mehr Trainingsdaten",
      "Weniger Features (Feature Selection)",
      "Regularisierung (L1/L2)",
      "Cross-Validation",
    ],
  },
  {
    id: "korrelation",
    title: "Korrelation",
    subtitle: "Zusammenhang zwischen zwei Variablen",
    description: "Maß für die Stärke und Richtung des linearen Zusammenhangs zwischen zwei Variablen.",
    keyPoints: [
      "r = +1: Perfekt positiver Zusammenhang",
      "r = -1: Perfekt negativer Zusammenhang",
      "r = 0: Kein linearer Zusammenhang",
    ],
    warning: "Korrelation ≠ Kausalität! Eisverkauf korreliert mit Ertrinkungsfällen – beide steigen im Sommer.",
  },
];

// ===== CONFUSION MATRIX DATEN =====

export const confusionMatrixData = {
  cells: [
    {
      id: "tp",
      label: "TP",
      fullName: "True Positive",
      description: "Richtig erkannt",
      position: "top-left",
      color: "success",
    },
    {
      id: "fn",
      label: "FN",
      fullName: "False Negative",
      description: "Übersehen",
      position: "top-right",
      color: "error",
    },
    {
      id: "fp",
      label: "FP",
      fullName: "False Positive",
      description: "Falscher Alarm",
      position: "bottom-left",
      color: "warning",
    },
    {
      id: "tn",
      label: "TN",
      fullName: "True Negative",
      description: "Richtig abgelehnt",
      position: "bottom-right",
      color: "success",
    },
  ],
};
