// Use Case Library Data
// 12 vollständige Use Cases für die Use-Case-Bibliothek

export interface DataSource {
  source: string;
  features: string[];
}

export interface Pitfall {
  title: string;
  problem: string;
  whyBad: string;
  solution: string;
}

export interface PracticeStory {
  title: string;
  situation: string;
  problem: string;
  cause: string;
  learning: string;
}

export interface ModelMetric {
  metric: string;
  explanation: string;
}

export interface UseCase {
  id: string;
  emoji: string;
  title: string;
  industry: string;
  problemType: string;
  level: "beginner" | "intermediate" | "expert";
  levelStars: number;
  shortDescription: string;
  
  // Übersicht
  goal: string;
  decision: string;
  intervention: string;
  baseline: string;
  
  // Kennzahlen
  businessKPIs: string[];
  modelMetrics: ModelMetric[];
  metricsNote: string;
  
  // Typische Daten
  dataSources: DataSource[];
  labelDefinition: string;
  
  // Stolperfallen
  pitfalls: Pitfall[];
  
  // Praxis-Story
  practiceStory: PracticeStory;
}

export const problemTypes = [
  { id: "churn", label: "Abwanderung (Churn)" },
  { id: "conversion", label: "Conversion & Upselling" },
  { id: "risk", label: "Risiko & Anomalie" },
  { id: "demand", label: "Nachfrage & Menge" },
  { id: "maintenance", label: "Ausfall & Wartung" },
];

export const industries = [
  { id: "telco", label: "Telekommunikation" },
  { id: "saas", label: "SaaS" },
  { id: "bank", label: "Bank / Finanzwesen" },
  { id: "ecommerce", label: "E-Commerce" },
  { id: "retail", label: "Einzelhandel" },
  { id: "insurance", label: "Versicherung" },
  { id: "fintech", label: "Fintech" },
  { id: "manufacturing", label: "Fertigung" },
];

export const levels = [
  { id: "beginner", label: "Einsteiger", stars: 1 },
  { id: "intermediate", label: "Fortgeschritten", stars: 2 },
  { id: "expert", label: "Experte", stars: 3 },
];

export const useCases: UseCase[] = [
  // ========== CHURN (3) ==========
  {
    id: "churn-telco",
    emoji: "📱",
    title: "Churn Prediction",
    industry: "telco",
    problemType: "churn",
    level: "beginner",
    levelStars: 1,
    shortDescription: "Identifiziere Kunden, die ihren Mobilfunkvertrag kündigen werden, bevor sie es tun.",
    
    goal: "Kunden mit hohem Kündigungsrisiko frühzeitig erkennen und durch gezielte Maßnahmen halten.",
    decision: "Welche Kunden sollen vom Retention-Team kontaktiert werden?",
    intervention: "Proaktiver Anruf mit personalisiertem Angebot (z.B. Rabatt, Upgrade, Zusatzleistung).",
    baseline: "Aktuell werden Kunden zufällig oder nach Bauchgefühl kontaktiert – Erfolgsquote: ~15%.",
    
    businessKPIs: [
      "Churn-Rate (monatlich/jährlich)",
      "Customer Lifetime Value (CLV)",
      "Retention-Rate nach Intervention",
      "Kosten pro gerettetem Kunden",
    ],
    modelMetrics: [
      { metric: "Precision", explanation: "Wie viele der als Churn-Risiko markierten Kunden wollen wirklich kündigen? Wichtig bei begrenzter Anrufkapazität." },
      { metric: "Recall", explanation: "Wie viele der tatsächlichen Kündiger wurden erkannt? Wichtig, wenn jeder verlorene Kunde teuer ist." },
      { metric: "AUC-ROC", explanation: "Gesamtqualität der Risiko-Ranking – wie gut trennt das Modell Kündiger von Bleibern?" },
    ],
    metricsNote: "Bei begrenzter Team-Kapazität ist Precision wichtiger als Recall. Lieber weniger, aber die richtigen Kunden anrufen.",
    
    dataSources: [
      { source: "CRM-System", features: ["Vertragslaufzeit", "Tarif", "Kündigungen in Vergangenheit", "Beschwerden"] },
      { source: "Billing-System", features: ["Monatliche Kosten", "Zahlungshistorie", "Rechnungsreklamationen"] },
      { source: "Nutzungsdaten", features: ["Datenverbrauch", "Anrufminuten", "App-Nutzung", "Roaming"] },
      { source: "Kundenservice", features: ["Ticket-Anzahl", "Beschwerdekategorien", "NPS-Score"] },
    ],
    labelDefinition: "Churn = Kunde hat innerhalb von 30 Tagen nach Scoring gekündigt oder portiert.",
    
    pitfalls: [
      {
        title: "Label-Definition zu spät",
        problem: "Churn wird erst definiert, wenn der Kunde bereits gekündigt hat.",
        whyBad: "Dann ist die Intervention zu spät – der Kunde ist mental schon weg.",
        solution: "Churn 30-60 Tage vorher definieren, um Handlungsspielraum zu haben.",
      },
      {
        title: "Vertragslaufzeit ignoriert",
        problem: "Kunden mit 24-Monats-Vertrag können gar nicht kündigen.",
        whyBad: "Modell lernt irrelevante Muster, wenn Bindungsfrist nicht berücksichtigt wird.",
        solution: "Nur Kunden in den letzten 3 Monaten der Vertragslaufzeit betrachten.",
      },
      {
        title: "Saisonale Effekte übersehen",
        problem: "Training nur auf Sommerdaten, Einsatz im Winter.",
        whyBad: "Weihnachtsgeschäft und Wechselsaison haben andere Muster.",
        solution: "Mindestens 12 Monate Trainingsdaten verwenden.",
      },
      {
        title: "Intervention nicht messbar",
        problem: "Alle Top-Risiko-Kunden werden angerufen.",
        whyBad: "Ohne Kontrollgruppe kann man den Effekt nicht messen.",
        solution: "10% Holdout-Gruppe nicht kontaktieren, um Uplift zu messen.",
      },
      {
        title: "Kosten der Retention ignoriert",
        problem: "Jeder Kunde mit Churn-Risiko bekommt teures Angebot.",
        whyBad: "Manche Kunden wären auch ohne Rabatt geblieben – verschenktes Geld.",
        solution: "Uplift-Modelling: Nur Kunden mit positivem Response auf Intervention targeten.",
      },
    ],
    
    practiceStory: {
      title: "Der teure Anruf",
      situation: "Ein Telekommunikationsanbieter implementierte ein Churn-Modell mit 85% Accuracy und feierte den Erfolg.",
      problem: "Nach 6 Monaten zeigte sich: Die Retention-Rate war nicht gestiegen, aber die Kosten für Rabatte explodierten.",
      cause: "Das Modell hatte hohen Recall, aber niedrige Precision. Viele kontaktierte Kunden hatten nie vor zu kündigen – nahmen aber gerne den Rabatt mit.",
      learning: "Bei begrenzten Ressourcen ist Precision wichtiger als Recall. Außerdem fehlte eine Kontrollgruppe, um den echten Uplift zu messen.",
    },
  },
  
  {
    id: "churn-saas",
    emoji: "☁️",
    title: "Subscription Churn",
    industry: "saas",
    problemType: "churn",
    level: "intermediate",
    levelStars: 2,
    shortDescription: "Erkenne SaaS-Kunden, die ihr Abo nicht verlängern werden, anhand von Nutzungsmustern.",
    
    goal: "Abwanderungsgefährdete B2B-Kunden identifizieren und durch Customer Success reaktivieren.",
    decision: "Welche Accounts brauchen proaktive Betreuung durch Customer Success Manager?",
    intervention: "Persönlicher Check-in, Feature-Training, Eskalation an Entscheider.",
    baseline: "CSMs betreuen Accounts nach Umsatzgröße, nicht nach Risiko – viele kleinere Churner werden übersehen.",
    
    businessKPIs: [
      "Monthly Recurring Revenue (MRR) Churn",
      "Net Revenue Retention (NRR)",
      "Customer Health Score",
      "Time-to-Value für Neukunden",
    ],
    modelMetrics: [
      { metric: "Precision@k", explanation: "Von den Top-k Risiko-Accounts: Wie viele churnen wirklich? Wichtig bei limitierter CSM-Kapazität." },
      { metric: "Lead Time", explanation: "Wie früh vor dem Renewal warnt das Modell? Mindestens 60 Tage nötig für Intervention." },
      { metric: "Revenue-weighted Recall", explanation: "Werden die umsatzstärksten Churner erkannt?" },
    ],
    metricsNote: "B2B-Churn ist oft MRR-gewichtet – ein Enterprise-Kunde zählt mehr als 100 Starter-Accounts.",
    
    dataSources: [
      { source: "Produkt-Analytics", features: ["DAU/MAU", "Feature-Adoption", "Session-Dauer", "Aktivitäts-Trend"] },
      { source: "CRM (Salesforce)", features: ["Vertragswert", "Renewal-Datum", "Kontakthistorie", "Support-Tickets"] },
      { source: "Billing", features: ["Zahlungsverzögerungen", "Downgrades", "Add-on-Nutzung"] },
      { source: "NPS/Surveys", features: ["NPS-Score", "CSAT nach Support", "Feature-Requests"] },
    ],
    labelDefinition: "Churn = Account hat Subscription nicht verlängert oder auf Free-Tier downgraded.",
    
    pitfalls: [
      {
        title: "Seat-Reduktion ignoriert",
        problem: "Nur komplette Churner werden als Label verwendet.",
        whyBad: "Kunden, die von 50 auf 5 Seats reduzieren, sind genauso problematisch.",
        solution: "Contraction (>50% MRR-Verlust) als separates Label oder gemeinsam modellieren.",
      },
      {
        title: "Onboarding-Phase nicht separiert",
        problem: "Neue Accounts in den ersten 90 Tagen werden genauso behandelt.",
        whyBad: "Niedrige Nutzung in der Onboarding-Phase ist normal, nicht unbedingt Churn-Signal.",
        solution: "Separate Modelle oder Features für Onboarding-Accounts.",
      },
      {
        title: "Champion-Wechsel nicht erkannt",
        problem: "Modell basiert auf Account-Level-Daten.",
        whyBad: "Wenn der interne Champion das Unternehmen verlässt, steigt das Churn-Risiko drastisch.",
        solution: "User-Level-Activity und Kontakt-Änderungen als Features einbauen.",
      },
      {
        title: "Renewal-Timing ignoriert",
        problem: "Churn-Score wird monatlich für alle Accounts berechnet.",
        whyBad: "Accounts mit Renewal in 6 Monaten brauchen andere Intervention als in 30 Tagen.",
        solution: "Time-to-Renewal als Feature und für Priorisierung nutzen.",
      },
      {
        title: "Produkt-Feedback nicht integriert",
        problem: "Nur Nutzungsdaten, keine qualitativen Signale.",
        whyBad: "Feature-Requests und Support-Eskalationen sind starke Churn-Prädiktoren.",
        solution: "Ticket-Sentiment und Feature-Request-Status als Features.",
      },
    ],
    
    practiceStory: {
      title: "Der stille Abgang",
      situation: "Ein SaaS-Unternehmen trainierte ein Churn-Modell auf Nutzungsdaten und erreichte gute Metriken.",
      problem: "Trotzdem churnte ein Enterprise-Kunde (500k ARR) überraschend bei Renewal.",
      cause: "Der Account hatte weiterhin hohe Nutzung, aber der VP Engineering (Champion) hatte 3 Monate vorher das Unternehmen verlassen. Das Modell erkannte nur Account-Level-Aktivität, nicht User-Level-Änderungen.",
      learning: "Champion-Tracking und Kontakt-Änderungen sind kritische Signale, die reine Nutzungsdaten nicht abbilden.",
    },
  },
  
  {
    id: "churn-bank",
    emoji: "🏦",
    title: "Customer Attrition",
    industry: "bank",
    problemType: "churn",
    level: "intermediate",
    levelStars: 2,
    shortDescription: "Identifiziere Bankkunden, die ihr Konto auflösen oder zur Konkurrenz wechseln.",
    
    goal: "Profitable Kunden mit Abwanderungsrisiko erkennen und durch gezielte Angebote binden.",
    decision: "Welche Kunden sollen ein Retention-Angebot erhalten?",
    intervention: "Persönliche Beratung, Konditionsverbesserung, Cross-Selling relevanter Produkte.",
    baseline: "Kunden werden erst kontaktiert, wenn sie bereits die Kündigung eingereicht haben.",
    
    businessKPIs: [
      "Kundenabwanderungsrate (jährlich)",
      "Customer Lifetime Value (CLV)",
      "Kosten pro Neukundenakquise vs. Retention",
      "Share of Wallet",
    ],
    modelMetrics: [
      { metric: "Precision", explanation: "Wie viele der als Risiko markierten Kunden wollten wirklich wechseln?" },
      { metric: "CLV-weighted Recall", explanation: "Werden die profitabelsten Kunden mit Churn-Risiko erkannt?" },
      { metric: "Decile Lift", explanation: "Um wieviel besser ist das Top-Dezil vs. Zufallsauswahl?" },
    ],
    metricsNote: "Nicht jeder Kunde ist gleich profitabel – unprofitable Churner sind kein Verlust.",
    
    dataSources: [
      { source: "Kernbanksystem", features: ["Kontotypen", "Einlagen", "Kredite", "Produkt-Cross-Selling"] },
      { source: "Transaktionsdaten", features: ["Transaktionsvolumen", "Gehaltseingänge", "Daueraufträge-Änderungen"] },
      { source: "Online-Banking", features: ["Login-Frequenz", "App-Nutzung", "Feature-Nutzung"] },
      { source: "Kundencenter", features: ["Beschwerden", "Konditionsanfragen", "Konkurrenz-Erwähnungen"] },
    ],
    labelDefinition: "Churn = Hauptkonto aufgelöst oder Gehaltseingänge auf 0 innerhalb von 90 Tagen.",
    
    pitfalls: [
      {
        title: "Inaktive Konten einbezogen",
        problem: "Alle Konten werden gleichbehandelt.",
        whyBad: "Viele 'Zombie-Konten' mit 5€ Guthaben verzerren das Modell.",
        solution: "Nur aktive Kunden (z.B. >3 Transaktionen/Monat) betrachten.",
      },
      {
        title: "Stille Abwanderung übersehen",
        problem: "Churn = Kontoauflösung.",
        whyBad: "Viele Kunden lösen nicht auf, sondern reduzieren nur die Nutzung.",
        solution: "Aktivitäts-basierte Churn-Definition: z.B. Gehalt nicht mehr eingehend.",
      },
      {
        title: "Regulatorische Kündigungen",
        problem: "Alle Kündigungen werden als Churn gezählt.",
        whyBad: "Zwangskündigungen wegen Compliance sind nicht vorhersagbar.",
        solution: "Regulatorische Gründe als separates Label oder Filter.",
      },
      {
        title: "Produkt-Kannibalisierung",
        problem: "Kunde wechselt nur das Produkt, nicht die Bank.",
        whyBad: "Wechsel von Girokonto auf Tagesgeld ist kein echter Churn.",
        solution: "Kundenbeziehungs-Level betrachten, nicht einzelne Produkte.",
      },
      {
        title: "Datenschutz-Einschränkungen",
        problem: "Wichtige Features sind aus Compliance-Gründen nicht nutzbar.",
        whyBad: "Modell hat weniger Vorhersagekraft als technisch möglich.",
        solution: "Frühzeitig mit Legal/Compliance abstimmen, welche Daten nutzbar sind.",
      },
    ],
    
    practiceStory: {
      title: "Die Gehaltsüberweisung",
      situation: "Eine Bank trainierte ein Churn-Modell auf Kontoauflösungen und erreichte 80% AUC.",
      problem: "Trotzdem sanken die Einlagen dramatisch, obwohl die Kontoauflösungen stabil blieben.",
      cause: "Kunden lösten ihre Konten nicht auf, sondern ließen sie einfach liegen – ihr Gehalt ging zur Konkurrenz. Das Modell erkannte nur formale Kündigungen, nicht die 'stille Abwanderung'.",
      learning: "Die Churn-Definition muss das echte Geschäftsproblem abbilden. Kontoauflösung ≠ Kundenabwanderung.",
    },
  },
  
  // ========== CONVERSION & UPSELLING (3) ==========
  {
    id: "upselling-ecommerce",
    emoji: "🛒",
    title: "Upselling Propensity",
    industry: "ecommerce",
    problemType: "conversion",
    level: "beginner",
    levelStars: 1,
    shortDescription: "Identifiziere Kunden mit hoher Wahrscheinlichkeit für Premium-Produkte oder größere Warenkörbe.",
    
    goal: "Kunden identifizieren, die auf personalisierte Upgrade-Angebote positiv reagieren.",
    decision: "Welchen Kunden soll ein Premium-Upgrade oder Bundle angezeigt werden?",
    intervention: "Personalisierte Produktempfehlung, Bundle-Angebot, Premium-Version im Checkout.",
    baseline: "Alle Kunden sehen dieselben Upselling-Banner – Conversion: ~2%.",
    
    businessKPIs: [
      "Average Order Value (AOV)",
      "Upsell-Conversion-Rate",
      "Revenue per Visitor",
      "Marge pro Upsell",
    ],
    modelMetrics: [
      { metric: "Precision", explanation: "Wie oft führt das Upsell-Angebot zum Kauf? Wichtig für Kundenerlebnis." },
      { metric: "Lift vs. Random", explanation: "Wie viel besser ist das Modell als zufällige Angebote?" },
      { metric: "Revenue Impact", explanation: "Zusätzlicher Umsatz durch das Modell vs. Baseline." },
    ],
    metricsNote: "A/B-Test ist essentiell – ohne Vergleich kann man den echten Modell-Effekt nicht messen.",
    
    dataSources: [
      { source: "Shop-Analytics", features: ["Besuchte Kategorien", "Preissegment-Historie", "Verweildauer"] },
      { source: "Kaufhistorie", features: ["Durchschnittlicher Warenkorb", "Premium-Käufe", "Retourenquote"] },
      { source: "CRM", features: ["Kundensegment", "Newsletter-Engagement", "Loyalty-Status"] },
      { source: "Session-Daten", features: ["Device", "Referrer", "Zeit seit letztem Besuch"] },
    ],
    labelDefinition: "Positiv = Kunde hat Upsell-Angebot angenommen und nicht retourniert.",
    
    pitfalls: [
      {
        title: "Retouren ignoriert",
        problem: "Jeder Upsell-Kauf wird als Erfolg gezählt.",
        whyBad: "Premium-Produkte haben oft höhere Retourenquoten.",
        solution: "Label erst nach Ablauf der Retourenfrist setzen.",
      },
      {
        title: "Kannibalisierung nicht gemessen",
        problem: "Upsell-Erfolge werden gezählt, aber nicht Basis-Verkäufe.",
        whyBad: "Manche Kunden hätten auch ohne Upsell das Premium gekauft.",
        solution: "Kontrollgruppe ohne Upsell-Angebot für echten Uplift.",
      },
      {
        title: "Kundenerlebnis vernachlässigt",
        problem: "Aggressive Upselling bei jedem Besuch.",
        whyBad: "Kann zu Kaufabbrüchen und Kundenverärgerung führen.",
        solution: "Frequenz-Capping und Confidence-Threshold für Angebote.",
      },
      {
        title: "Saisonalität ignoriert",
        problem: "Modell trainiert auf Black-Friday-Daten.",
        whyBad: "Kaufverhalten in Sales-Phasen ist nicht repräsentativ.",
        solution: "Sales-Perioden separat modellieren oder ausschließen.",
      },
      {
        title: "Margen nicht berücksichtigt",
        problem: "Upsell auf Produkte mit niedriger Marge.",
        whyBad: "Höherer Umsatz, aber nicht unbedingt mehr Gewinn.",
        solution: "Marge in die Zielgröße oder Scoring einbeziehen.",
      },
    ],
    
    practiceStory: {
      title: "Der Retouren-Boom",
      situation: "Ein E-Commerce-Shop implementierte Upselling mit einem Modell, das 40% mehr Premium-Käufe erzielte.",
      problem: "Nach 3 Monaten zeigte sich: Die Retourenquote bei Premium-Produkten war 3x höher als normal.",
      cause: "Das Modell hatte Kunden identifiziert, die gerne Premium 'ausprobieren' – aber oft zurückschicken. Die Conversion war hoch, der Nettogewinn negativ.",
      learning: "Das Label muss den echten Geschäftserfolg abbilden: Kauf UND Behalten, nicht nur Kauf.",
    },
  },
  
  {
    id: "lead-scoring-b2b",
    emoji: "🎯",
    title: "Lead Scoring",
    industry: "saas",
    problemType: "conversion",
    level: "intermediate",
    levelStars: 2,
    shortDescription: "Priorisiere B2B-Leads nach Abschlusswahrscheinlichkeit für effizienteren Vertrieb.",
    
    goal: "Sales-Team auf die vielversprechendsten Leads fokussieren und Conversion-Rate erhöhen.",
    decision: "Welche Leads sollen priorisiert von Sales kontaktiert werden?",
    intervention: "Priorisierte Bearbeitung durch Account Executives, personalisierte Outreach.",
    baseline: "Leads werden nach FIFO oder manuellem Scoring bearbeitet – viele Cold Leads verschwenden Zeit.",
    
    businessKPIs: [
      "Lead-to-Opportunity Conversion",
      "Sales Cycle Length",
      "Revenue per Sales Rep",
      "Cost per Acquisition (CPA)",
    ],
    modelMetrics: [
      { metric: "Precision@k", explanation: "Von den Top-k Leads: Wie viele werden zu Opportunities?" },
      { metric: "Lead Time", explanation: "Wie früh im Funnel kann das Modell gute Leads erkennen?" },
      { metric: "AUC-PR", explanation: "Wichtiger als AUC-ROC bei stark unbalancierten Klassen (wenige Conversions)." },
    ],
    metricsNote: "B2B-Conversions sind selten – Precision-Recall-Kurve ist aussagekräftiger als Accuracy.",
    
    dataSources: [
      { source: "Marketing Automation", features: ["Website-Besuche", "Content-Downloads", "Email-Engagement"] },
      { source: "CRM (Salesforce)", features: ["Firmengröße", "Branche", "Budget", "Entscheider-Kontakt"] },
      { source: "Enrichment (Clearbit)", features: ["Technografische Daten", "Wachstumssignale", "Funding"] },
      { source: "Intent Data", features: ["Themen-Recherche", "Konkurrenz-Vergleiche", "G2-Reviews"] },
    ],
    labelDefinition: "Conversion = Lead wurde zu qualifizierter Opportunity (SQL) innerhalb von 90 Tagen.",
    
    pitfalls: [
      {
        title: "Survivorship Bias",
        problem: "Training nur auf bearbeiteten Leads.",
        whyBad: "Nicht kontaktierte Leads fehlen – vielleicht wären sie konvertiert.",
        solution: "Stichprobe aller Leads bearbeiten, auch niedrig-scorende.",
      },
      {
        title: "Sales-Aktivität als Feature",
        problem: "Anzahl Sales-Touches als Input für das Modell.",
        whyBad: "Kausalität umgekehrt: Sales kontaktiert gute Leads öfter.",
        solution: "Nur Daten VOR erstem Sales-Kontakt als Features.",
      },
      {
        title: "Firmengröße dominiert",
        problem: "Enterprise-Leads werden immer hoch gescoret.",
        whyBad: "Kleine Firmen mit hohem Fit werden übersehen.",
        solution: "Segmentspezifische Modelle oder Größen-Normalisierung.",
      },
      {
        title: "Veraltete Daten",
        problem: "Enrichment-Daten sind Monate alt.",
        whyBad: "Funding-Runden, Entlassungen, etc. ändern das Potenzial.",
        solution: "Regelmäßiges Enrichment-Update, Decay für alte Daten.",
      },
      {
        title: "ICP nicht definiert",
        problem: "Modell optimiert auf alle Conversions.",
        whyBad: "Nicht alle Kunden sind gleich profitabel oder gut passend.",
        solution: "Ideal Customer Profile definieren und als Label-Filter nutzen.",
      },
    ],
    
    practiceStory: {
      title: "Die vergessenen Leads",
      situation: "Ein SaaS-Unternehmen trainierte Lead Scoring auf historischen Conversions und priorisierte danach.",
      problem: "Das Modell bevorzugte immer Enterprise-Leads – SMB-Segment wurde vernachlässigt.",
      cause: "Historisch hatte Sales Enterprise priorisiert → mehr Conversions → Modell lernte diesen Bias. SMB-Leads hatten nie eine Chance, da sie nicht kontaktiert wurden.",
      learning: "Training-Daten reflektieren vergangene Entscheidungen. Ohne Exploration (alle Leads mal kontaktieren) verstärkt das Modell bestehende Biases.",
    },
  },
  
  {
    id: "next-best-offer",
    emoji: "🎁",
    title: "Next Best Offer",
    industry: "retail",
    problemType: "conversion",
    level: "expert",
    levelStars: 3,
    shortDescription: "Empfehle jedem Kunden das individuell passendste Produkt oder Angebot.",
    
    goal: "Personalisierte Produktempfehlungen zur Steigerung von Conversion und Warenkorb.",
    decision: "Welches Produkt/Angebot soll diesem Kunden jetzt angezeigt werden?",
    intervention: "Personalisierte Banner, Email-Kampagnen, App-Notifications.",
    baseline: "Alle Kunden sehen dieselben Top-Seller oder Kategorie-basierte Empfehlungen.",
    
    businessKPIs: [
      "Click-Through-Rate (CTR) auf Empfehlungen",
      "Conversion-Rate der Empfehlungen",
      "Incremental Revenue",
      "Customer Engagement Score",
    ],
    modelMetrics: [
      { metric: "Hit Rate@k", explanation: "Ist das gekaufte Produkt in den Top-k Empfehlungen?" },
      { metric: "NDCG", explanation: "Qualität des Rankings – sind die besten Empfehlungen oben?" },
      { metric: "Diversity", explanation: "Werden verschiedene Kategorien empfohlen oder nur ähnliche?" },
    ],
    metricsNote: "Offline-Metriken sind nur Proxies – echter Erfolg zeigt sich nur im A/B-Test.",
    
    dataSources: [
      { source: "Transaktionen", features: ["Kaufhistorie", "Warenkörbe", "Kauffrequenz"] },
      { source: "Browse-Verhalten", features: ["Angesehene Produkte", "Suchbegriffe", "Kategorie-Affinität"] },
      { source: "Produktkatalog", features: ["Kategorien", "Attribute", "Preissegment", "Marke"] },
      { source: "Kontext", features: ["Tageszeit", "Device", "Wetter", "lokale Events"] },
    ],
    labelDefinition: "Positiv = Kunde hat empfohlenes Produkt gekauft (nicht nur geklickt).",
    
    pitfalls: [
      {
        title: "Popularity Bias",
        problem: "Modell empfiehlt immer Bestseller.",
        whyBad: "Keine echte Personalisierung, Long-Tail-Produkte werden ignoriert.",
        solution: "Popularity-Penalty oder Diversity-Constraints einbauen.",
      },
      {
        title: "Cold Start",
        problem: "Neue Kunden oder Produkte haben keine Historie.",
        whyBad: "Modell kann keine Empfehlung geben.",
        solution: "Fallback auf Content-based oder Popularity, explizite Präferenz-Abfrage.",
      },
      {
        title: "Feedback Loop",
        problem: "Nur empfohlene Produkte werden gekauft.",
        whyBad: "Modell bestätigt sich selbst, Exploration fehlt.",
        solution: "Exploration-Anteil (z.B. 10% zufällige Empfehlungen) einbauen.",
      },
      {
        title: "Offline-Online-Gap",
        problem: "Modell optimiert auf historische Käufe.",
        whyBad: "Vergangenes Kaufverhalten ≠ aktuelle Intention.",
        solution: "Session-basierte Signale stärker gewichten, Online-Learning.",
      },
      {
        title: "Kontext ignoriert",
        problem: "Empfehlungen sind statisch für jeden Kunden.",
        whyBad: "Morgens und abends, mobil und desktop – unterschiedliche Needs.",
        solution: "Kontextuelle Features (Zeit, Device, Situation) einbauen.",
      },
    ],
    
    practiceStory: {
      title: "Die Bestseller-Falle",
      situation: "Ein Einzelhändler implementierte ein Empfehlungssystem, das Offline-Metriken um 30% verbesserte.",
      problem: "Im A/B-Test zeigte sich: Kein signifikanter Umsatzunterschied zur Baseline.",
      cause: "Das Modell empfahl hauptsächlich Bestseller, die Kunden sowieso gefunden hätten. Die Offline-Metrik (Hit Rate) war hoch, weil Bestseller oft gekauft wurden – aber nicht wegen der Empfehlung.",
      learning: "Offline-Metriken können täuschen. Nur A/B-Tests zeigen den echten inkrementellen Wert.",
    },
  },
  
  // ========== RISIKO & ANOMALIE (3) ==========
  {
    id: "fraud-insurance",
    emoji: "🔍",
    title: "Fraud Detection",
    industry: "insurance",
    problemType: "risk",
    level: "intermediate",
    levelStars: 2,
    shortDescription: "Erkenne betrügerische Versicherungsansprüche vor der Auszahlung.",
    
    goal: "Betrugsfälle automatisch identifizieren und zur manuellen Prüfung eskalieren.",
    decision: "Welche Schadensmeldungen sollen von Fraud-Spezialisten geprüft werden?",
    intervention: "Tiefenprüfung, Gutachterbeauftragung, ggf. Ablehnung des Anspruchs.",
    baseline: "Stichprobenartige Prüfung (~5%) oder regelbasierte Flags – viele Betrugsfälle werden übersehen.",
    
    businessKPIs: [
      "Fraud-Rate (erkannt)",
      "Schadenssumme verhindert",
      "False Positive Rate (Kundenärger)",
      "Prüfungskosten pro Case",
    ],
    modelMetrics: [
      { metric: "Precision", explanation: "Wie viele der eskalierten Cases sind echte Betrugsfälle?" },
      { metric: "Recall", explanation: "Wie viele echte Betrugsfälle werden erkannt?" },
      { metric: "Savings/False Positive", explanation: "Trade-off zwischen Einsparung und Kundenbelästigung." },
    ],
    metricsNote: "Extrem unbalancierte Klassen (<1% Fraud) – Standard-Accuracy ist nutzlos.",
    
    dataSources: [
      { source: "Schadenmeldung", features: ["Schadensart", "Schadenshöhe", "Zeitpunkt", "Beschreibung"] },
      { source: "Vertragsdaten", features: ["Vertragsbeginn", "Deckungssumme", "Vorschäden", "Beitragshöhe"] },
      { source: "Kundendaten", features: ["Alter", "Region", "Beruf", "Vorversicherungen"] },
      { source: "Externe Daten", features: ["Wetter", "Polizeiberichte", "Werkstatt-Netzwerk"] },
    ],
    labelDefinition: "Fraud = Schaden wurde nach Prüfung als betrügerisch eingestuft und abgelehnt.",
    
    pitfalls: [
      {
        title: "Label-Qualität",
        problem: "Nur erkannte Betrugsfälle sind gelabelt.",
        whyBad: "Unerkannte Fälle werden als 'legitimate' trainiert.",
        solution: "Regelmäßige Tiefenprüfung von Stichproben für bessere Labels.",
      },
      {
        title: "Discrimination-Risiko",
        problem: "Modell nutzt Postleitzahl als starkes Feature.",
        whyBad: "Kann zu unfairer Behandlung bestimmter Regionen führen.",
        solution: "Fairness-Audit, sensible Features prüfen oder entfernen.",
      },
      {
        title: "Adversarial Attacks",
        problem: "Betrüger lernen die Modell-Regeln.",
        whyBad: "Muster ändern sich, Modell wird obsolet.",
        solution: "Regelmäßiges Retraining, Feature-Rotation, Ensemble-Methoden.",
      },
      {
        title: "Kundenerlebnis vs. Savings",
        problem: "Hoher Recall = viele False Positives.",
        whyBad: "Ehrliche Kunden werden frustriert, wenn Ansprüche verzögert werden.",
        solution: "Tier-System: High-Confidence Cases automatisch, Rest gestaffelt prüfen.",
      },
      {
        title: "Schaden erst nach Regulierung erkannt",
        problem: "Label wird erst Monate später bekannt.",
        whyBad: "Modell-Feedback-Schleife ist sehr langsam.",
        solution: "Intermediäre Signale nutzen (Inkonsistenzen, Gutachter-Flags).",
      },
    ],
    
    practiceStory: {
      title: "Der Postleitzahlen-Bias",
      situation: "Eine Versicherung implementierte Fraud Detection mit 90% Recall auf dem Testset.",
      problem: "Nach Beschwerden zeigte sich: Kunden in bestimmten Stadtteilen wurden systematisch häufiger geprüft.",
      cause: "Historisch wurden in diesen Gebieten mehr Betrugsfälle aufgedeckt – weil dort intensiver geprüft wurde. Das Modell verstärkte diesen Bias.",
      learning: "Fairness-Audits sind Pflicht. Historische Prüfungs-Intensität ≠ echte Fraud-Rate.",
    },
  },
  
  {
    id: "credit-risk",
    emoji: "💳",
    title: "Credit Risk",
    industry: "bank",
    problemType: "risk",
    level: "expert",
    levelStars: 3,
    shortDescription: "Bewerte das Ausfallrisiko von Kreditanträgen für bessere Kreditentscheidungen.",
    
    goal: "Risiko-adjustierte Kreditentscheidungen treffen und Ausfallraten minimieren.",
    decision: "Soll der Kreditantrag bewilligt werden? Zu welchen Konditionen?",
    intervention: "Ablehnung, Genehmigung, oder Genehmigung mit angepassten Konditionen (Zins, Sicherheiten).",
    baseline: "Regelbasiertes Scoring + manuelle Prüfung – langsam und nicht optimal.",
    
    businessKPIs: [
      "Default Rate (30/60/90 days)",
      "Expected Loss vs. Actual Loss",
      "Approval Rate",
      "Risk-adjusted Return on Capital",
    ],
    modelMetrics: [
      { metric: "Gini Coefficient", explanation: "Wie gut trennt das Modell gute von schlechten Krediten?" },
      { metric: "KS Statistic", explanation: "Maximale Trennung zwischen Default- und Non-Default-Verteilungen." },
      { metric: "Calibration", explanation: "Entspricht die vorhergesagte Wahrscheinlichkeit der echten Ausfallrate?" },
    ],
    metricsNote: "Regulatorische Anforderungen (BCBS, SR 11-7) erfordern spezifische Validierungen.",
    
    dataSources: [
      { source: "Antragsdaten", features: ["Einkommen", "Beschäftigung", "Kreditsumme", "Verwendungszweck"] },
      { source: "Schufa/Auskunfteien", features: ["Score", "Bonitätsmerkmale", "Anfragen", "Mahnverfahren"] },
      { source: "Kontodaten (PSD2)", features: ["Kontostand-Verlauf", "Einnahmen/Ausgaben", "Lastschrift-Rückläufer"] },
      { source: "Interne Historie", features: ["Bestandskunde", "Produkt-Historie", "Zahlungsverhalten"] },
    ],
    labelDefinition: "Default = Kredit 90+ Tage überfällig oder Insolvenz innerhalb von 12 Monaten.",
    
    pitfalls: [
      {
        title: "Selection Bias",
        problem: "Training nur auf bewilligten Krediten.",
        whyBad: "Abgelehnte Anträge fehlen – Modell sieht nur Teil der Population.",
        solution: "Reject Inference oder Testportfolio mit zufälligen Bewilligungen.",
      },
      {
        title: "Vintage-Effekte",
        problem: "Modell trainiert auf einem Zeitraum, deployed in einem anderen.",
        whyBad: "Wirtschaftszyklen, Krisen, etc. ändern Ausfallmuster.",
        solution: "Out-of-time Validation, regelmäßiges Monitoring auf Drift.",
      },
      {
        title: "Interpretierbarkeit",
        problem: "Black-Box-Modell für regulierte Entscheidung.",
        whyBad: "Regulatorisch problematisch, Ablehnungsgründe nicht erklärbar.",
        solution: "Interpretierbare Modelle (Scorecard) oder SHAP/LIME für Erklärungen.",
      },
      {
        title: "Feature-Stabilität",
        problem: "Volatile Features wie 'aktuelle Zinsen' als Input.",
        whyBad: "Modell-Performance schwankt mit externen Faktoren.",
        solution: "Stabile, kontrollierbare Features bevorzugen.",
      },
      {
        title: "Fairness-Anforderungen",
        problem: "Modell diskriminiert geschützte Gruppen.",
        whyBad: "Rechtliche und Reputationsrisiken.",
        solution: "Fairness-Testing, Disparate Impact Analyse, ggf. Constraints.",
      },
    ],
    
    practiceStory: {
      title: "Die Pandemie-Überraschung",
      situation: "Eine Bank hatte ein Credit-Risk-Modell mit exzellenter Performance über 5 Jahre.",
      problem: "2020 explodierten die Ausfallraten – das Modell hatte völlig versagt.",
      cause: "Das Modell war auf stabilen Wirtschaftsdaten trainiert. Die Corona-Krise war 'Out of Distribution' – Branchenzugehörigkeit (Gastro, Tourismus) war plötzlich der wichtigste Faktor.",
      learning: "Stresstests und Szenario-Analysen sind kritisch. Modelle können bei Regime-Wechseln versagen.",
    },
  },
  
  {
    id: "transaction-monitoring",
    emoji: "🔐",
    title: "Transaction Monitoring",
    industry: "fintech",
    problemType: "risk",
    level: "expert",
    levelStars: 3,
    shortDescription: "Erkenne verdächtige Transaktionen in Echtzeit für AML- und Fraud-Prävention.",
    
    goal: "Verdächtige Transaktionsmuster identifizieren und zur Prüfung eskalieren.",
    decision: "Soll die Transaktion blockiert, verzögert oder zur Prüfung markiert werden?",
    intervention: "Transaktion stoppen, 2FA anfordern, manueller Review, SAR-Meldung.",
    baseline: "Regelbasiertes Alerting mit hoher False-Positive-Rate (>95%).",
    
    businessKPIs: [
      "False Positive Rate",
      "Alert-to-SAR Ratio",
      "Fraud Losses",
      "Analyst Workload",
    ],
    modelMetrics: [
      { metric: "Precision@Alert-Volume", explanation: "Bei fixem Alert-Budget: Wie viele echte Cases?" },
      { metric: "Detection Latency", explanation: "Wie schnell nach der Transaktion kommt der Alert?" },
      { metric: "Pattern Coverage", explanation: "Werden verschiedene Fraud-Typen erkannt?" },
    ],
    metricsNote: "Echtzeit-Anforderungen erfordern Trade-off zwischen Modellkomplexität und Latenz.",
    
    dataSources: [
      { source: "Transaktionen", features: ["Betrag", "Zeitpunkt", "Empfänger", "Kanal", "Device"] },
      { source: "Kundenprofil", features: ["Übliches Verhalten", "Risikoklasse", "Verifizierungsstatus"] },
      { source: "Netzwerk", features: ["Bekannte Fraud-Accounts", "Ring-Transaktionen", "Neue Verbindungen"] },
      { source: "Device/IP", features: ["Geolocation", "Device-Fingerprint", "IP-Reputation"] },
    ],
    labelDefinition: "Fraud = Transaktion wurde als betrügerisch bestätigt (durch Kunden oder Ermittlung).",
    
    pitfalls: [
      {
        title: "Latenz-Constraints",
        problem: "Komplexe Modelle sind zu langsam für Echtzeit.",
        whyBad: "Transaktion muss in <100ms entschieden werden.",
        solution: "Zwei-Stufen-System: Schnelle Vorfilterung + asynchrone Deep Analysis.",
      },
      {
        title: "Label-Feedback-Loop",
        problem: "Blockierte Transaktionen können nicht verifiziert werden.",
        whyBad: "War es wirklich Fraud? Ohne Feedback kein Lernen.",
        solution: "Stichproben durchlassen, Kunden-Rückfragen systematisch erfassen.",
      },
      {
        title: "Evolving Patterns",
        problem: "Betrüger passen sich an.",
        whyBad: "Modell-Performance degradiert schnell.",
        solution: "Kontinuierliches Monitoring, schnelles Retraining, Adversarial Testing.",
      },
      {
        title: "Alert Fatigue",
        problem: "Analysten müssen tausende Alerts pro Tag bearbeiten.",
        whyBad: "Echte Cases werden übersehen, Burnout.",
        solution: "Precision optimieren, intelligentes Alert-Batching, Priorisierung.",
      },
      {
        title: "Regulatorische Anforderungen",
        problem: "AML-Compliance erfordert bestimmte Prüfungen.",
        whyBad: "ML-Modell kann regulatorische Regeln nicht einfach ersetzen.",
        solution: "Hybrid: Regelwerk für Compliance + ML für Effizienz.",
      },
    ],
    
    practiceStory: {
      title: "Die Alert-Flut",
      situation: "Ein Fintech implementierte ML-basiertes Transaction Monitoring und reduzierte False Positives um 60%.",
      problem: "Die Regulierungsbehörde bemängelte: Wichtige SAR-Fälle wurden vom Modell niedriger priorisiert.",
      cause: "Das Modell war auf historische Fraud-Bestätigungen trainiert. SAR-pflichtige Geldwäsche-Muster waren anders als Fraud-Muster – und wurden vom Modell nicht gelernt.",
      learning: "AML und Fraud sind verschiedene Use Cases. Regulatorische Anforderungen müssen separat abgebildet werden.",
    },
  },
  
  // ========== NACHFRAGE & MENGE (2) ==========
  {
    id: "demand-forecasting",
    emoji: "📊",
    title: "Demand Forecasting",
    industry: "retail",
    problemType: "demand",
    level: "intermediate",
    levelStars: 2,
    shortDescription: "Prognostiziere die Nachfrage nach Produkten für optimale Bestandsplanung.",
    
    goal: "Nachfrage pro Produkt und Standort vorhersagen für bessere Disposition.",
    decision: "Wie viel von welchem Produkt soll bestellt/produziert werden?",
    intervention: "Automatische Bestellvorschläge, Produktions-Planung, Filial-Allokation.",
    baseline: "Manuelle Planung basierend auf Vorjahr + Bauchgefühl – hohe Stockout- und Überbestand-Raten.",
    
    businessKPIs: [
      "Forecast Accuracy (WMAPE)",
      "Stockout-Rate",
      "Überbestand-Rate",
      "Inventory Turnover",
    ],
    modelMetrics: [
      { metric: "WMAPE", explanation: "Weighted Mean Absolute Percentage Error – berücksichtigt Umsatzgewichtung." },
      { metric: "Bias", explanation: "Systematische Über-/Unterschätzung erkennen." },
      { metric: "Service Level", explanation: "Prozent der Nachfrage, die erfüllt werden kann." },
    ],
    metricsNote: "Forecast-Fehler bei langsam drehenden Artikeln (Long Tail) sind normal höher.",
    
    dataSources: [
      { source: "POS-Daten", features: ["Historische Verkäufe", "Preise", "Promotions", "Kannibalisierung"] },
      { source: "Stammdaten", features: ["Kategorie", "Saisonalität", "Lifecycle-Status", "Substitutes"] },
      { source: "Externe Daten", features: ["Wetter", "Feiertage", "Events", "Wirtschaftsindikatoren"] },
      { source: "Supply Chain", features: ["Lieferzeiten", "Mindestbestellmengen", "Lagerkapazität"] },
    ],
    labelDefinition: "Zielgröße = Tatsächliche Verkäufe (bereinigt um Stockouts, wenn möglich).",
    
    pitfalls: [
      {
        title: "Stockout-Verzerrung",
        problem: "Verkäufe = 0, weil Produkt nicht verfügbar war.",
        whyBad: "Modell lernt fälschlich 'keine Nachfrage'.",
        solution: "Stockouts erkennen und Nachfrage schätzen (Lost Sales).",
      },
      {
        title: "Promotion-Effekte",
        problem: "Historische Promotions nicht als Feature.",
        whyBad: "Modell verwechselt Promotion-Peaks mit normaler Nachfrage.",
        solution: "Promotion-Kalender als Feature, separate Baseline + Uplift.",
      },
      {
        title: "Neue Produkte",
        problem: "Keine Historie für Neueinführungen.",
        whyBad: "Cold-Start-Problem, keine Prognose möglich.",
        solution: "Analogie-Methoden, Attribute-basierte Schätzung, kurze Testphase.",
      },
      {
        title: "Aggregationslevel",
        problem: "Forecast auf falscher Granularität.",
        whyBad: "Zu granular = hohes Rauschen, zu aggregiert = keine Filial-Steuerung.",
        solution: "Hierarchisches Forecasting: Bottom-up und Top-down kombinieren.",
      },
      {
        title: "Kannibalisierung ignoriert",
        problem: "Promo-Produkt A steigert, aber Produkt B sinkt.",
        whyBad: "Gesamteffekt wird überschätzt.",
        solution: "Cross-Elastizitäten modellieren, Kategorie-Level betrachten.",
      },
    ],
    
    practiceStory: {
      title: "Der Sommer, der keiner war",
      situation: "Ein Einzelhändler trainierte Demand Forecasting auf 3 Jahren Historie mit gutem WMAPE.",
      problem: "Im verregneten Sommer 2021 waren Grillprodukte massiv überbestellt.",
      cause: "Das Modell hatte 'Sommer' als Feature, aber keine Wetterdaten. Historisch war Sommer = Grillsaison. Das ungewöhnliche Wetter konnte nicht antizipiert werden.",
      learning: "Externe Faktoren (Wetter) als Features einbauen – und die Grenzen der Vorhersagbarkeit akzeptieren.",
    },
  },
  
  {
    id: "inventory-optimization",
    emoji: "📦",
    title: "Inventory Optimization",
    industry: "ecommerce",
    problemType: "demand",
    level: "intermediate",
    levelStars: 2,
    shortDescription: "Optimiere Lagerbestände über alle Produkte und Standorte hinweg.",
    
    goal: "Optimale Bestandshöhe pro SKU und Lager für minimale Kosten bei hohem Service Level.",
    decision: "Wann und wie viel soll nachbestellt werden? Wo soll gelagert werden?",
    intervention: "Automatische Bestellauslösung, Lagerort-Empfehlungen, Markdown-Timing.",
    baseline: "Fixe Mindestbestände und Bestellmengen – oft zu hoch oder zu niedrig.",
    
    businessKPIs: [
      "Inventory Holding Costs",
      "Stockout Rate",
      "Days of Supply",
      "Obsolescence Rate",
    ],
    modelMetrics: [
      { metric: "Service Level", explanation: "Prozent der Nachfrage, die sofort erfüllt werden kann." },
      { metric: "Fill Rate", explanation: "Prozent der Bestellpositionen, die komplett geliefert werden." },
      { metric: "Inventory Turnover", explanation: "Wie oft dreht sich der Bestand pro Jahr?" },
    ],
    metricsNote: "Optimierung ist Multi-Objective: Service Level vs. Kosten.",
    
    dataSources: [
      { source: "Demand Forecast", features: ["Erwartete Nachfrage", "Forecast-Unsicherheit"] },
      { source: "Supply Chain", features: ["Lieferzeiten", "Mindestmengen", "Kosten pro Einheit"] },
      { source: "Bestandsdaten", features: ["Aktueller Bestand", "Reservierungen", "Transit-Bestand"] },
      { source: "Finanzdaten", features: ["Lagerkosten", "Kapitalbindung", "Abschreibungsregeln"] },
    ],
    labelDefinition: "Optimierung auf Kostenfunktion: Lagerhaltungskosten + Stockout-Kosten + Handling-Kosten.",
    
    pitfalls: [
      {
        title: "Lokale Optimierung",
        problem: "Jede Filiale optimiert unabhängig.",
        whyBad: "Gesamtbestand suboptimal, Verschiebungen zwischen Lagern ignoriert.",
        solution: "Netzwerk-Optimierung, zentrale Koordination.",
      },
      {
        title: "Stockout-Kosten falsch geschätzt",
        problem: "Stockout = nur entgangener Umsatz.",
        whyBad: "Kundenabwanderung, Reputationsschaden werden ignoriert.",
        solution: "Langfristige Effekte und Customer Lifetime Value einbeziehen.",
      },
      {
        title: "Lieferzeit-Variabilität",
        problem: "Feste Lieferzeit im Modell.",
        whyBad: "Realität: Lieferzeiten schwanken, Sicherheitsbestand zu niedrig.",
        solution: "Stochastische Lieferzeiten modellieren, Sicherheitsbestand anpassen.",
      },
      {
        title: "Produkt-Lebenszyklen",
        problem: "Modell behandelt alle Produkte gleich.",
        whyBad: "Neue Produkte brauchen anderen Bestand als Auslauf-Artikel.",
        solution: "Lifecycle-Phase als Feature, unterschiedliche Strategien.",
      },
      {
        title: "Discount-Timing",
        problem: "Überbestand wird zu spät abgewertet.",
        whyBad: "Höhere Abschreibungen, wenn Saison vorbei ist.",
        solution: "Proaktives Markdown-Modell, das Timing optimiert.",
      },
    ],
    
    practiceStory: {
      title: "Das gefüllte Lager",
      situation: "Ein E-Commerce-Händler optimierte Bestände mit einem ML-Modell und reduzierte Stockouts um 40%.",
      problem: "Die Lagerkosten stiegen im selben Zeitraum um 60%.",
      cause: "Das Modell optimierte nur auf Service Level (Stockout-Vermeidung). Die Lagerhaltungskosten waren nicht Teil der Zielfunktion – das Modell bestellte 'sicherheitshalber' zu viel.",
      learning: "Multi-Objective-Optimierung: Service Level UND Kosten müssen in der Zielfunktion sein.",
    },
  },
  
  // ========== AUSFALL & WARTUNG (1) ==========
  {
    id: "predictive-maintenance",
    emoji: "⚙️",
    title: "Predictive Maintenance",
    industry: "manufacturing",
    problemType: "maintenance",
    level: "expert",
    levelStars: 3,
    shortDescription: "Sage Maschinenausfälle vorher, um Wartung optimal zu planen.",
    
    goal: "Ungeplante Stillstände vermeiden durch vorausschauende Wartung.",
    decision: "Wann soll welche Komponente gewartet oder ausgetauscht werden?",
    intervention: "Geplante Wartung während Produktionspausen, Ersatzteil-Bestellung.",
    baseline: "Präventive Wartung nach Zeitplan – oft zu früh (teuer) oder zu spät (Ausfall).",
    
    businessKPIs: [
      "Ungeplante Stillstandszeit",
      "Wartungskosten",
      "OEE (Overall Equipment Effectiveness)",
      "Ersatzteil-Lagerkosten",
    ],
    modelMetrics: [
      { metric: "Precision", explanation: "Wie oft tritt der vorhergesagte Ausfall tatsächlich ein?" },
      { metric: "Lead Time", explanation: "Wie viel Vorlauf gibt das Modell für Wartungsplanung?" },
      { metric: "RUL Accuracy", explanation: "Remaining Useful Life – wie genau ist die Restlebensdauer-Schätzung?" },
    ],
    metricsNote: "Trade-off: Zu frühe Warnung = unnötige Wartung, zu späte Warnung = Ausfall.",
    
    dataSources: [
      { source: "Sensordaten", features: ["Vibration", "Temperatur", "Druck", "Stromaufnahme", "Geräusche"] },
      { source: "Wartungshistorie", features: ["Vergangene Ausfälle", "Reparaturen", "Ersatzteile"] },
      { source: "Betriebsdaten", features: ["Laufzeit", "Last", "Produktionszyklen", "Bediener"] },
      { source: "Umgebungsdaten", features: ["Temperatur", "Luftfeuchtigkeit", "Staub"] },
    ],
    labelDefinition: "Ausfall = Komponente ist ausgefallen oder hat kritischen Schwellenwert unterschritten.",
    
    pitfalls: [
      {
        title: "Survival Bias",
        problem: "Nur Daten von Maschinen, die gewartet wurden.",
        whyBad: "Ausfall-Muster von ungewarteten Maschinen fehlen.",
        solution: "Run-to-Failure-Tests an ausgewählten Komponenten.",
      },
      {
        title: "Sensor-Anomalien ≠ Ausfälle",
        problem: "Modell erkennt Sensor-Fehler als Maschinenprobleme.",
        whyBad: "False Positives durch defekte Sensoren.",
        solution: "Sensor-Health-Check voranstellen, Multi-Sensor-Korrelation.",
      },
      {
        title: "Domänenwissen ignoriert",
        problem: "Pure ML ohne Verständnis der Physik.",
        whyBad: "Modell lernt Korrelationen, nicht Kausalitäten.",
        solution: "Physics-informed ML, Zusammenarbeit mit Ingenieuren.",
      },
      {
        title: "Datenqualität in der Fabrik",
        problem: "Sensor-Ausfälle, manuelle Eingriffe, unvollständige Logs.",
        whyBad: "Rauschen und Lücken in den Trainingsdaten.",
        solution: "Robuste Modelle, Datenqualitäts-Monitoring, Edge-Processing.",
      },
      {
        title: "Integration in Prozesse",
        problem: "Modell warnt, aber Wartung reagiert nicht.",
        whyBad: "Keine Verbindung zwischen Prediction und Aktion.",
        solution: "Integration in CMMS, automatische Work-Order-Erstellung.",
      },
    ],
    
    practiceStory: {
      title: "Der ignorierten Warnung",
      situation: "Ein Fertigungsunternehmen implementierte Predictive Maintenance mit 85% Recall auf Ausfälle.",
      problem: "Die ungeplanten Stillstände blieben auf dem gleichen Niveau.",
      cause: "Das Modell warnte korrekt, aber die Warnungen landeten in E-Mails, die niemand las. Die Integration in den Wartungsprozess fehlte völlig – es gab keine automatischen Work Orders.",
      learning: "Ein Modell ist nur so gut wie seine Integration in den operativen Prozess. Warnung ohne Aktion ist nutzlos.",
    },
  },
];
