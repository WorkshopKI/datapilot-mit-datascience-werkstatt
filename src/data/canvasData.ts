// Canvas Data: Problemtypen, Branchen, Kontext-Texte und Checklisten

export interface ProblemType {
  id: string;
  name: string;
  emoji: string;
  kernfrage: string;
  compatibleIndustries: string[];
}

export interface Industry {
  id: string;
  name: string;
  emoji: string;
}

export interface ScenarioContext {
  context: string;
  typischeKPIs: string;
  typischeIntervention: string;
  phasenHinweise: {
    business: string;
    data: string;
    preparation: string;
    modeling: string;
    evaluation: string;
    deployment: string;
  };
}

export interface CheckItem {
  id: string;
  label: string;
  tooltip: string;
}

export interface Phase {
  id: string;
  name: string;
  number: string;
  kernfrage: string;
  checks: CheckItem[];
}

// 7 Problemtypen
export const problemTypes: ProblemType[] = [
  {
    id: "churn",
    name: "Abwanderung",
    emoji: "🚪",
    kernfrage: "Wer geht bald?",
    compatibleIndustries: ["telekom", "ecommerce", "saas", "streaming", "bank", "versicherung", "einzelhandel", "gastro", "energie", "gesundheit", "hr", "bildung"]
  },
  {
    id: "conversion",
    name: "Conversion & Upselling",
    emoji: "💰",
    kernfrage: "Wer kauft (mehr)?",
    compatibleIndustries: ["ecommerce", "saas", "bank", "versicherung", "telekom", "einzelhandel", "immobilien", "automobil"]
  },
  {
    id: "risk",
    name: "Risiko & Anomalie",
    emoji: "⚠️",
    kernfrage: "Was ist verdächtig?",
    compatibleIndustries: ["bank", "versicherung", "ecommerce", "gesundheit", "fertigung", "it-security"]
  },
  {
    id: "demand",
    name: "Nachfrage & Menge",
    emoji: "📦",
    kernfrage: "Wie viel brauchen wir?",
    compatibleIndustries: ["einzelhandel", "ecommerce", "logistik", "fertigung", "gastro", "energie", "hr"]
  },
  {
    id: "maintenance",
    name: "Ausfall & Wartung",
    emoji: "🔧",
    kernfrage: "Wann geht etwas kaputt?",
    compatibleIndustries: ["fertigung", "logistik", "energie", "it-security", "gebaeude", "automobil"]
  },
  {
    id: "segmentation",
    name: "Segmentierung",
    emoji: "👥",
    kernfrage: "Welche Gruppen gibt es?",
    compatibleIndustries: ["ecommerce", "bank", "telekom", "hr", "gesundheit", "einzelhandel", "streaming", "versicherung", "gastro"]
  },
  {
    id: "recommendation",
    name: "Empfehlung & Matching",
    emoji: "🎯",
    kernfrage: "Was passt zusammen?",
    compatibleIndustries: ["ecommerce", "streaming", "jobportal", "immobilien", "bildung"]
  }
];

// 18 Branchen
export const industries: Industry[] = [
  { id: "telekom", name: "Telekom", emoji: "📱" },
  { id: "ecommerce", name: "E-Commerce", emoji: "🛒" },
  { id: "saas", name: "SaaS/Software", emoji: "💻" },
  { id: "streaming", name: "Streaming", emoji: "📺" },
  { id: "bank", name: "Bank", emoji: "🏦" },
  { id: "versicherung", name: "Versicherung", emoji: "🛡️" },
  { id: "einzelhandel", name: "Einzelhandel", emoji: "🏪" },
  { id: "gastro", name: "Gastro/Hotel", emoji: "🏨" },
  { id: "energie", name: "Energie", emoji: "⚡" },
  { id: "gesundheit", name: "Gesundheit", emoji: "🏥" },
  { id: "hr", name: "HR/Personal", emoji: "👥" },
  { id: "fertigung", name: "Fertigung", emoji: "🏭" },
  { id: "logistik", name: "Logistik", emoji: "🚚" },
  { id: "it-security", name: "IT/Security", emoji: "🔒" },
  { id: "jobportal", name: "Jobportal", emoji: "💼" },
  { id: "immobilien", name: "Immobilien", emoji: "🏠" },
  { id: "automobil", name: "Automobil", emoji: "🚗" },
  { id: "bildung", name: "Bildung", emoji: "🎓" },
  { id: "gebaeude", name: "Gebäudemanagement", emoji: "🏢" }
];

// Kontext-Texte Matrix (Auswahl der wichtigsten Kombinationen)
export const scenarioContexts: Record<string, Record<string, ScenarioContext>> = {
  churn: {
    telekom: {
      context: "Ein Telekom-Anbieter will Kunden identifizieren, die in 4-8 Wochen kündigen werden. Das Retention-Team soll die Top-Risikokunden proaktiv kontaktieren.",
      typischeKPIs: "Churn-Rate ↓, Retention-Rate ↑",
      typischeIntervention: "Anruf, Rabatt-Angebot, Service-Check",
      phasenHinweise: {
        business: "Retention-Team soll Top-200 Risikokunden pro Woche anrufen.",
        data: "CRM, Billing, Nutzungsdaten, Support-Tickets",
        preparation: "6-12 Monate Historie, zeitliche Sortierung wichtig",
        modeling: "Baseline: Regelbasiert (z.B. 'wenig Nutzung = Risiko')",
        evaluation: "Precision@K wichtig: Wie viele der Top-200 sind wirklich Risikokunden?",
        deployment: "Wöchentliche Liste ans CRM, Monitoring der Anruf-Erfolgsquote"
      }
    },
    ecommerce: {
      context: "Ein Online-Shop will erkennen, welche Kunden seit 3+ Monaten nicht mehr bestellt haben und bald ganz abwandern. Ziel: Reaktivierungs-Kampagne.",
      typischeKPIs: "Reaktivierungsrate ↑, Customer Lifetime Value ↑",
      typischeIntervention: "Personalisierte E-Mail, Rabattcode, Empfehlungen",
      phasenHinweise: {
        business: "Marketing will monatlich Top-1000 Reaktivierungs-Kandidaten.",
        data: "Bestellhistorie, Klickverhalten, Newsletter-Öffnungsraten",
        preparation: "Inaktivitäts-Definition klären (z.B. 90 Tage keine Bestellung)",
        modeling: "RFM-Score als Baseline, ML für komplexere Muster",
        evaluation: "Reaktivierungsrate der Top-Kandidaten vs. Kontrollgruppe",
        deployment: "Automatisierte Kampagnen-Trigger, A/B-Tests"
      }
    },
    saas: {
      context: "Ein Software-Anbieter will vorhersagen, welche Kunden ihr Abo nicht verlängern. Customer Success soll rechtzeitig eingreifen.",
      typischeKPIs: "Net Revenue Retention ↑, Churn-Rate ↓",
      typischeIntervention: "Onboarding-Gespräch, Feature-Schulung, Upgrade-Angebot",
      phasenHinweise: {
        business: "Customer Success priorisiert Accounts nach Risiko-Score.",
        data: "Login-Frequenz, Feature-Nutzung, Support-Tickets, Vertragsdaten",
        preparation: "Vertragslaufzeit und Renewal-Datum als Zeitrahmen",
        modeling: "Product-Engagement-Score als einfache Baseline",
        evaluation: "Wie viele High-Risk Accounts wurden erfolgreich gehalten?",
        deployment: "Score im CRM, automatische Alerts bei Risiko-Anstieg"
      }
    },
    streaming: {
      context: "Ein Streaming-Dienst will Abonnenten identifizieren, die in den nächsten 30 Tagen kündigen. Ziel: Personalisierte Inhalts-Empfehlungen.",
      typischeKPIs: "Churn-Rate ↓, Watch-Time ↑",
      typischeIntervention: "Personalisierte Empfehlungen, neue Inhalte hervorheben",
      phasenHinweise: {
        business: "Produkt-Team will Churn durch bessere Empfehlungen senken.",
        data: "Watch-History, Suchverhalten, Bewertungen, Login-Muster",
        preparation: "Saisonale Effekte beachten (z.B. nach Serien-Finale)",
        modeling: "Engagement-Score vs. ML-basierter Ansatz",
        evaluation: "A/B-Test: Churn-Rate mit vs. ohne Intervention",
        deployment: "Echtzeit-Empfehlungen, Push-Benachrichtigungen"
      }
    },
    bank: {
      context: "Eine Bank will erkennen, welche Kunden zur Konkurrenz wechseln. Berater sollen Top-Kunden proaktiv kontaktieren.",
      typischeKPIs: "Kundenabwanderung ↓, Share of Wallet ↑",
      typischeIntervention: "Beratungsgespräch, Konditionen-Anpassung",
      phasenHinweise: {
        business: "Private Banking priorisiert vermögende Kunden mit Risiko.",
        data: "Transaktionen, Kontostand-Verlauf, Produkt-Nutzung",
        preparation: "Abwanderung oft schleichend – Zeitfenster definieren",
        modeling: "Transaktions-Trends als Feature, nicht nur Snapshot",
        evaluation: "Retention-Rate der kontaktierten High-Risk Kunden",
        deployment: "Monatlicher Report, Integration ins Berater-Dashboard"
      }
    },
    versicherung: {
      context: "Eine Versicherung will vorhersagen, welche Kunden ihre Police nicht verlängern. Außendienst soll Beratungsgespräche anbieten.",
      typischeKPIs: "Vertragsverlängerungsrate ↑, Cross-Selling ↑",
      typischeIntervention: "Beratungsgespräch, Bündelangebote, Service-Check",
      phasenHinweise: {
        business: "Außendienst erhält priorisierte Kundenliste 8 Wochen vor Ablauf.",
        data: "Schadenhistorie, Prämienentwicklung, Kundenkontakte",
        preparation: "Kündigungsfristen und Ablaufdaten als Zeitrahmen",
        modeling: "Regelbasiert (z.B. Prämienerhöhung > 10%) vs. ML",
        evaluation: "Verlängerungsrate nach Beratung vs. Kontrollgruppe",
        deployment: "Monatliche Listen, Integration in Außendienst-App"
      }
    },
    einzelhandel: {
      context: "Eine Supermarktkette will Stammkunden identifizieren, die seltener kommen. Ziel: Personalisierte Rabattaktionen.",
      typischeKPIs: "Besuchsfrequenz ↑, Warenkorbgröße ↑",
      typischeIntervention: "Personalisierte Coupons, Treuepunkte-Bonus",
      phasenHinweise: {
        business: "CRM-Team will wöchentlich Reaktivierungs-Kampagnen.",
        data: "Kundenkarte, Einkaufshistorie, Coupon-Einlösungen",
        preparation: "Saisonale Muster (Urlaub, Feiertage) berücksichtigen",
        modeling: "RFM-Score als Baseline, Frequenz-Trend wichtig",
        evaluation: "Besuchsfrequenz nach Coupon-Aktion",
        deployment: "Automatisierte Coupon-Generierung, App-Push"
      }
    },
    gastro: {
      context: "Eine Hotelkette will erkennen, welche Geschäftskunden weniger buchen. Key-Account-Manager sollen reagieren.",
      typischeKPIs: "Buchungsfrequenz ↑, Umsatz pro Kunde ↑",
      typischeIntervention: "Persönlicher Kontakt, Corporate-Rabatte",
      phasenHinweise: {
        business: "Key-Account-Manager betreut Top-100 Firmenkunden.",
        data: "Buchungshistorie, Firmengröße, Branche",
        preparation: "B2B-Kunden haben andere Muster als Privatkunden",
        modeling: "Buchungs-Trend vs. Vorjahr als einfache Baseline",
        evaluation: "Buchungsvolumen nach Intervention",
        deployment: "Monatlicher Report, CRM-Integration"
      }
    },
    energie: {
      context: "Ein Energieversorger will Kunden identifizieren, die den Anbieter wechseln. Vertrieb soll Bindungsangebote machen.",
      typischeKPIs: "Churn-Rate ↓, Kundenzufriedenheit ↑",
      typischeIntervention: "Tarifanpassung, Ökostrom-Angebot, Service-Check",
      phasenHinweise: {
        business: "Vertrieb kontaktiert Risikokunden vor Kündigungsfrist.",
        data: "Verbrauchsdaten, Beschwerden, Zahlungsverhalten",
        preparation: "Wechselzyklen und Kündigungsfristen beachten",
        modeling: "Beschwerden und Mahnungen als starke Indikatoren",
        evaluation: "Churn-Rate der kontaktierten vs. nicht kontaktierten",
        deployment: "Vierteljährliche Kampagne, Call-Center-Integration"
      }
    },
    gesundheit: {
      context: "Eine Krankenversicherung will erkennen, welche Mitglieder zur Konkurrenz wechseln.",
      typischeKPIs: "Mitglieder-Retention ↑, Zufriedenheit ↑",
      typischeIntervention: "Beratung, Zusatzleistungen, Präventionsangebote",
      phasenHinweise: {
        business: "Kundenservice priorisiert Rückfragen von Risiko-Mitgliedern.",
        data: "Leistungsanfragen, Beschwerden, Altersstruktur",
        preparation: "Wechselperioden (Jahreswechsel) beachten",
        modeling: "Unzufriedenheits-Indikatoren als Features",
        evaluation: "Retention nach proaktiver Beratung",
        deployment: "Integration ins Service-System"
      }
    },
    hr: {
      context: "Ein Unternehmen will vorhersagen, welche Mitarbeiter in den nächsten 6 Monaten kündigen. HR soll Gespräche führen.",
      typischeKPIs: "Fluktuation ↓, Mitarbeiterzufriedenheit ↑",
      typischeIntervention: "Entwicklungsgespräch, Gehaltsanpassung, Projektwechsel",
      phasenHinweise: {
        business: "HR-Partner führen Stay-Interviews mit Risiko-Mitarbeitern.",
        data: "Betriebszugehörigkeit, letzte Beförderung, Überstunden, Feedback",
        preparation: "Datenschutz und Ethik kritisch – Betriebsrat einbeziehen!",
        modeling: "Tenure und Beförderungshistorie als einfache Baseline",
        evaluation: "Bleibequote nach Intervention, Mitarbeiterfeedback",
        deployment: "Vertraulicher Report an HR, niemals an Führungskräfte direkt"
      }
    },
    bildung: {
      context: "Eine Online-Lernplattform will erkennen, welche Nutzer ihr Abo kündigen werden.",
      typischeKPIs: "Churn-Rate ↓, Kursabschlussrate ↑",
      typischeIntervention: "Lernempfehlungen, Reminder, Community-Features",
      phasenHinweise: {
        business: "Produkt-Team will Engagement steigern.",
        data: "Login-Frequenz, Kursfortschritt, Quiz-Ergebnisse",
        preparation: "Lernmuster variieren stark nach Nutzertyp",
        modeling: "Engagement-Score als Baseline",
        evaluation: "Retention nach personalisierten Empfehlungen",
        deployment: "In-App Nudges, E-Mail-Kampagnen"
      }
    }
  },
  conversion: {
    ecommerce: {
      context: "Ein Online-Shop will vorhersagen, welche Besucher zu Käufern werden. Ziel: Gezielte Rabatte für High-Potential-Leads.",
      typischeKPIs: "Conversion-Rate ↑, CAC ↓",
      typischeIntervention: "Exit-Intent Popup, personalisierte Rabatte",
      phasenHinweise: {
        business: "Marketing will Budget auf High-Potential-Besucher fokussieren.",
        data: "Clickstream, Warenkorbabbrüche, Referrer, Gerät",
        preparation: "Session-basierte Features vs. User-basierte",
        modeling: "Regelbasiert (Warenkorb > 50€) vs. ML",
        evaluation: "Conversion-Lift durch gezielte Ansprache",
        deployment: "Echtzeit-Scoring, Integration in Marketing-Automation"
      }
    },
    saas: {
      context: "Ein Software-Anbieter will erkennen, welche Free-User auf Premium upgraden. Sales soll diese priorisieren.",
      typischeKPIs: "Free-to-Paid Rate ↑, Sales Efficiency ↑",
      typischeIntervention: "Demo-Angebot, Feature-Teaser, persönlicher Kontakt",
      phasenHinweise: {
        business: "Sales fokussiert auf High-Intent Free-User.",
        data: "Feature-Nutzung, Team-Größe, Login-Frequenz",
        preparation: "Unterscheide Hobby-User von Business-Potenzial",
        modeling: "Product Qualified Lead (PQL) Score als Baseline",
        evaluation: "Conversion-Rate der kontaktierten PQLs",
        deployment: "Score im Sales-Tool, automatische Lead-Zuweisung"
      }
    },
    bank: {
      context: "Eine Bank will vorhersagen, welche Kunden einen Kredit aufnehmen werden. Berater sollen proaktiv Angebote machen.",
      typischeKPIs: "Kreditabschlüsse ↑, Cross-Selling ↑",
      typischeIntervention: "Proaktives Kreditangebot, Konditionenvergleich",
      phasenHinweise: {
        business: "Berater erhalten monatlich priorisierte Kundenliste.",
        data: "Kontobewegungen, Gehaltseingänge, Sparverhalten",
        preparation: "Lebensereignisse (Hauskauf) als Trigger identifizieren",
        modeling: "Regelbasiert (Gehaltserhöhung) vs. ML",
        evaluation: "Abschlussquote bei proaktiver Ansprache",
        deployment: "Berater-Dashboard, Trigger-basierte Alerts"
      }
    },
    versicherung: {
      context: "Eine Versicherung will erkennen, welche Kunden eine Zusatzversicherung abschließen. Cross-Selling-Kampagne.",
      typischeKPIs: "Cross-Selling-Rate ↑, Deckungssumme ↑",
      typischeIntervention: "Bundle-Angebote, Bedarfsanalyse",
      phasenHinweise: {
        business: "Außendienst fokussiert auf Kunden mit Deckungslücken.",
        data: "Bestehende Policen, Lebenssituation, Schadenshistorie",
        preparation: "Lebensereignisse (Kind, Hauskauf) als Trigger",
        modeling: "Bedarfsanalyse vs. propensity-basierter Ansatz",
        evaluation: "Abschlussquote nach Beratung",
        deployment: "Monatliche Potenzial-Listen, CRM-Integration"
      }
    },
    telekom: {
      context: "Ein Telekom-Anbieter will vorhersagen, welche Kunden auf einen höheren Tarif wechseln. Upselling-Kampagne.",
      typischeKPIs: "ARPU ↑, Upgrade-Rate ↑",
      typischeIntervention: "Tarif-Upgrade-Angebot, Datenpaket-Empfehlung",
      phasenHinweise: {
        business: "Marketing will gezielte Upgrade-Kampagnen.",
        data: "Nutzungsverhalten, Datenvolumen, Roaming-Nutzung",
        preparation: "Nutzung nahe am Limit als starker Indikator",
        modeling: "Regelbasiert (>80% Datennutzung) vs. ML",
        evaluation: "Upgrade-Rate bei gezielter vs. Massen-Kampagne",
        deployment: "App-Benachrichtigungen, Call-Center-Skripte"
      }
    },
    einzelhandel: {
      context: "Ein Einzelhändler will erkennen, welche Kunden auf Premium-Produkte umsteigen. Ziel: Personalisierte Empfehlungen.",
      typischeKPIs: "Average Basket Size ↑, Marge ↑",
      typischeIntervention: "Premium-Produkt-Empfehlungen, Samples",
      phasenHinweise: {
        business: "Category Management will Premium-Sortiment pushen.",
        data: "Kaufhistorie, Preissegment-Präferenzen, Marken",
        preparation: "Unterscheide Preis- von Qualitätskäufern",
        modeling: "Segment-basierte Empfehlungen",
        evaluation: "Premium-Anteil nach Empfehlung",
        deployment: "Personalisierte Coupons, Kassenbon-Empfehlungen"
      }
    },
    immobilien: {
      context: "Ein Immobilienportal will vorhersagen, welche Suchenden wirklich kaufen. Makler sollen diese priorisieren.",
      typischeKPIs: "Lead-to-Deal Rate ↑, Makler-Effizienz ↑",
      typischeIntervention: "Premium-Exposés, persönliche Beratung",
      phasenHinweise: {
        business: "Makler fokussieren auf ernsthafte Kaufinteressenten.",
        data: "Suchverhalten, Kontaktanfragen, Finanzierungsstatus",
        preparation: "Finanzierungsbestätigung als starker Indikator",
        modeling: "Engagement-Score (Anfragen, Besichtigungen)",
        evaluation: "Abschlussquote priorisierter Leads",
        deployment: "Lead-Scoring im Makler-Portal"
      }
    },
    automobil: {
      context: "Ein Autohaus will erkennen, welche Interessenten wirklich kaufen. Verkäufer sollen diese zuerst kontaktieren.",
      typischeKPIs: "Lead-to-Sale Rate ↑, Sales Cycle ↓",
      typischeIntervention: "Probefahrt-Angebot, Finanzierungsberatung",
      phasenHinweise: {
        business: "Verkäufer priorisieren Hot Leads.",
        data: "Website-Besuche, Konfigurator-Nutzung, Probefahrt-Anfragen",
        preparation: "Konfigurator-Abschluss als starker Kaufindikator",
        modeling: "Lead-Scoring basierend auf Engagement",
        evaluation: "Abschlussquote priorisierter vs. aller Leads",
        deployment: "CRM-Integration, automatische Lead-Zuweisung"
      }
    }
  },
  risk: {
    bank: {
      context: "Eine Bank will betrügerische Transaktionen erkennen. Fraud-Team soll verdächtige Fälle prüfen, bevor Geld abgebucht wird.",
      typischeKPIs: "Fraud-Rate ↓, False Positive Rate ↓",
      typischeIntervention: "Transaktion blockieren, Rückruf beim Kunden",
      phasenHinweise: {
        business: "Fraud-Team prüft verdächtige Transaktionen in Echtzeit.",
        data: "Transaktionsdaten, Geräte-Fingerprint, Geo-Location",
        preparation: "Labeled Data oft unbalanciert – Oversampling nötig",
        modeling: "Regelbasiert + ML-Ensemble, Echtzeit-Scoring",
        evaluation: "Precision vs. Recall Trade-off kritisch!",
        deployment: "Echtzeit-Integration, 24/7 Monitoring"
      }
    },
    versicherung: {
      context: "Eine Versicherung will betrügerische Schadensmeldungen erkennen. Fraud-Analysten prüfen verdächtige Fälle vor Auszahlung.",
      typischeKPIs: "Betrugsquote ↓, Schadenaufwand ↓",
      typischeIntervention: "Manuelle Prüfung, Gutachter einschalten",
      phasenHinweise: {
        business: "Fraud-Team priorisiert verdächtige Schadensmeldungen.",
        data: "Schadensbeschreibung, Fotos, Historische Schäden, Netzwerk",
        preparation: "Textanalyse der Schadensbeschreibung",
        modeling: "Anomalie-Erkennung + supervised ML",
        evaluation: "Präzision wichtig – jede Prüfung kostet Zeit",
        deployment: "Scoring bei Schadenseingang, Workflow-Integration"
      }
    },
    ecommerce: {
      context: "Ein Online-Shop will Fake-Bewertungen und Bot-Käufe erkennen. Ziel: Plattform-Integrität schützen.",
      typischeKPIs: "Fake-Rate ↓, User Trust ↑",
      typischeIntervention: "Bewertung löschen, Account sperren",
      phasenHinweise: {
        business: "Trust & Safety Team prüft verdächtige Accounts.",
        data: "Bewertungsmuster, Account-Alter, IP-Adressen, Kaufverhalten",
        preparation: "Netzwerk-Analyse (Bewertungsringe)",
        modeling: "Graph-basierte Anomalie-Erkennung",
        evaluation: "Manuelle Stichproben zur Validierung",
        deployment: "Automatische Flagging, Review-Queue"
      }
    },
    gesundheit: {
      context: "Eine Krankenkasse will ungewöhnliche Abrechnungsmuster erkennen. Ziel: Abrechnungsbetrug aufdecken.",
      typischeKPIs: "Betrugsquote ↓, Abrechnungsqualität ↑",
      typischeIntervention: "Prüfung durch Medizinischen Dienst",
      phasenHinweise: {
        business: "Abrechnungsprüfung fokussiert auf Anomalien.",
        data: "Abrechnungsdaten, Diagnosen, Behandlungsmuster",
        preparation: "Medizinisches Wissen für Feature Engineering",
        modeling: "Anomalie-Erkennung, Peer-Vergleich",
        evaluation: "Aufdeckungsrate vs. False Positives",
        deployment: "Prüf-Queue, Integration ins Abrechnungssystem"
      }
    },
    fertigung: {
      context: "Ein Hersteller will fehlerhafte Produkte in der Qualitätskontrolle erkennen. Ziel: Defekte Teile aussortieren.",
      typischeKPIs: "Ausschussrate ↓, Qualität ↑",
      typischeIntervention: "Aussortieren, Nacharbeit, Prozessanpassung",
      phasenHinweise: {
        business: "Qualitätssicherung will automatische Erkennung.",
        data: "Sensordaten, Bilder, Prozessparameter",
        preparation: "Bildverarbeitung für visuelle Defekte",
        modeling: "Computer Vision, Anomalie-Erkennung",
        evaluation: "Recall wichtig – kein Defekt darf durchrutschen",
        deployment: "Echtzeit-Erkennung an der Produktionslinie"
      }
    },
    "it-security": {
      context: "Ein Unternehmen will Cyberangriffe und ungewöhnliche Netzwerkaktivität erkennen. Security-Team soll reagieren.",
      typischeKPIs: "Mean Time to Detect ↓, False Positives ↓",
      typischeIntervention: "Alarm, Isolation, Incident Response",
      phasenHinweise: {
        business: "Security Operations Center (SOC) prüft Alerts.",
        data: "Logs, Netzwerktraffic, User-Verhalten",
        preparation: "Baseline für 'normales' Verhalten etablieren",
        modeling: "Anomalie-Erkennung, UEBA (User Entity Behavior Analytics)",
        evaluation: "Alert-Fatigue vermeiden – Precision kritisch",
        deployment: "SIEM-Integration, Echtzeit-Alerts"
      }
    }
  },
  demand: {
    einzelhandel: {
      context: "Ein Supermarkt will vorhersagen, wie viel von Produkt X nächste Woche in Filiale Y gebraucht wird. Ziel: Weniger Out-of-Stock, weniger Überbestand.",
      typischeKPIs: "Out-of-Stock Rate ↓, Lagerkosten ↓",
      typischeIntervention: "Bestellmenge anpassen, Umlagerung",
      phasenHinweise: {
        business: "Supply Chain will automatisierte Bestellvorschläge.",
        data: "Verkaufsdaten, Wetter, Feiertage, Aktionen",
        preparation: "Saisonalität und Promotions als Features",
        modeling: "Zeitreihen-Modelle (Prophet, ARIMA) oder ML",
        evaluation: "MAPE, Bias (Over- vs. Under-Forecasting)",
        deployment: "Integration ins Warenwirtschaftssystem"
      }
    },
    ecommerce: {
      context: "Ein Online-Shop will die Bestellmenge pro Produkt vorhersagen. Ziel: Optimale Lagerhaltung.",
      typischeKPIs: "Lagerdrehung ↑, Kapitalbindung ↓",
      typischeIntervention: "Nachbestellung, Lageroptimierung",
      phasenHinweise: {
        business: "Einkauf will wöchentliche Bestellvorschläge.",
        data: "Bestellhistorie, Marketing-Kampagnen, Saisonalität",
        preparation: "Long-Tail-Produkte separat behandeln",
        modeling: "Hierarchische Forecasts (Kategorie → Produkt)",
        evaluation: "Forecast Accuracy, Bias",
        deployment: "Automatisierte Bestellvorschläge, Safety Stock"
      }
    },
    logistik: {
      context: "Ein Paketdienst will das Sendungsvolumen pro Region vorhersagen. Ziel: Optimale Fahrzeug- und Personalplanung.",
      typischeKPIs: "Kapazitätsauslastung ↑, Überstunden ↓",
      typischeIntervention: "Personalplanung, Fahrzeugeinsatz",
      phasenHinweise: {
        business: "Disposition plant Ressourcen pro Tag und Region.",
        data: "Historische Sendungen, E-Commerce-Trends, Events",
        preparation: "Peak-Zeiten (Black Friday, Weihnachten) modellieren",
        modeling: "Zeitreihen mit externen Regressoren",
        evaluation: "Accuracy pro Region und Tag",
        deployment: "Täglicher Forecast, Planungs-Dashboard"
      }
    },
    fertigung: {
      context: "Ein Hersteller will den Rohstoffbedarf vorhersagen. Ziel: Just-in-Time-Bestellung, weniger Lagerhaltung.",
      typischeKPIs: "Lagerkosten ↓, Liefertreue ↑",
      typischeIntervention: "Bestellmenge, Lieferantenkommunikation",
      phasenHinweise: {
        business: "Einkauf will Bedarfsprognosen für Lieferanten.",
        data: "Produktionsplan, Stücklisten, historischer Verbrauch",
        preparation: "Produktionsplan als externer Regressor",
        modeling: "Verbrauchsbasierte Prognose + ML",
        evaluation: "Accuracy, Lieferengpässe vermeiden",
        deployment: "ERP-Integration, automatische Bestellvorschläge"
      }
    },
    gastro: {
      context: "Eine Restaurantkette will die Gästezahl pro Tag vorhersagen. Ziel: Optimale Personal- und Einkaufsplanung.",
      typischeKPIs: "Personalkosten ↓, Lebensmittelverschwendung ↓",
      typischeIntervention: "Schichtplanung, Einkaufsmengen",
      phasenHinweise: {
        business: "Filialleiter plant Personal basierend auf Prognose.",
        data: "Historische Gästezahlen, Reservierungen, Wetter, Events",
        preparation: "Wochentag und Events als wichtige Features",
        modeling: "Zeitreihen, Regression mit Regressoren",
        evaluation: "Accuracy, Über- vs. Unterbesetzung",
        deployment: "App für Filialleiter, wöchentliche Prognose"
      }
    },
    energie: {
      context: "Ein Energieversorger will den Strombedarf pro Stunde vorhersagen. Ziel: Optimale Kraftwerkssteuerung.",
      typischeKPIs: "Prognosegenauigkeit ↑, Kosten ↓",
      typischeIntervention: "Kraftwerkseinsatz, Zukauf an Börse",
      phasenHinweise: {
        business: "Dispatch-Team steuert Kraftwerke basierend auf Prognose.",
        data: "Historischer Verbrauch, Wetter, Uhrzeit, Feiertage",
        preparation: "Temperatur als wichtigster externer Faktor",
        modeling: "Zeitreihen mit Wetter-Regressoren",
        evaluation: "MAPE, Peak-Accuracy kritisch",
        deployment: "Stündliche Prognose, Integration ins Leitsystem"
      }
    },
    hr: {
      context: "Ein Unternehmen will den Personalbedarf pro Abteilung vorhersagen. Ziel: Rechtzeitige Stellenausschreibungen.",
      typischeKPIs: "Time-to-Hire ↓, Unterbesetzung ↓",
      typischeIntervention: "Recruiting starten, Budget beantragen",
      phasenHinweise: {
        business: "HR-Planung basierend auf Bedarfsprognose.",
        data: "Fluktuation, Wachstumsplanung, Projektpipeline",
        preparation: "Abteilungsspezifische Muster berücksichtigen",
        modeling: "Regression auf Wachstum + Fluktuation",
        evaluation: "Abweichung Plan vs. Ist",
        deployment: "Jährliche Planung, quartalsweise Aktualisierung"
      }
    }
  },
  maintenance: {
    fertigung: {
      context: "Ein Hersteller will Maschinenausfälle vorhersagen. Wartungsteam soll präventiv eingreifen, bevor die Linie steht.",
      typischeKPIs: "Ungeplante Stillstände ↓, OEE ↑",
      typischeIntervention: "Präventive Wartung, Ersatzteil-Bestellung",
      phasenHinweise: {
        business: "Instandhaltung plant Wartung basierend auf Prognose.",
        data: "Sensordaten (Vibration, Temperatur), Wartungshistorie",
        preparation: "Feature Engineering aus Sensordaten (Trends, Anomalien)",
        modeling: "Survival Analysis, Classification (Ausfall in X Tagen)",
        evaluation: "Recall wichtig – Ausfall verhindern!",
        deployment: "Dashboard für Instandhaltung, Alarme"
      }
    },
    logistik: {
      context: "Ein Logistiker will Fahrzeugausfälle vorhersagen. Ziel: Präventive Wartung statt Pannenhilfe.",
      typischeKPIs: "Fahrzeugverfügbarkeit ↑, Reparaturkosten ↓",
      typischeIntervention: "Werkstatttermin, Ersatzteil vorbestellen",
      phasenHinweise: {
        business: "Fuhrparkmanagement plant Werkstattkapazitäten.",
        data: "Telematik-Daten, Kilometerstand, Wartungshistorie",
        preparation: "Fahrzeugtyp-spezifische Modelle",
        modeling: "Remaining Useful Life (RUL) Prediction",
        evaluation: "Precision-Recall Balance, Kosten-Nutzen",
        deployment: "Flottenmanagement-System, automatische Termine"
      }
    },
    energie: {
      context: "Ein Energieversorger will Ausfälle im Stromnetz vorhersagen. Techniker sollen präventiv prüfen.",
      typischeKPIs: "SAIDI ↓, Ausfallzeit ↓",
      typischeIntervention: "Inspektion, präventiver Austausch",
      phasenHinweise: {
        business: "Netzwarte priorisiert Inspektionen.",
        data: "Asset-Alter, Wetter, Lastdaten, historische Ausfälle",
        preparation: "Asset-Daten oft fragmentiert",
        modeling: "Risiko-Score pro Asset",
        evaluation: "Vermiedene Ausfälle vs. Inspektionskosten",
        deployment: "GIS-Integration, Inspektionsplanung"
      }
    },
    "it-security": {
      context: "Ein Unternehmen will Server-Ausfälle vorhersagen. IT-Team soll präventiv handeln.",
      typischeKPIs: "Uptime ↑, MTTR ↓",
      typischeIntervention: "Server-Migration, Hardware-Austausch",
      phasenHinweise: {
        business: "IT-Operations priorisiert Server-Wartung.",
        data: "Systemlogs, Performance-Metriken, Hardware-Alter",
        preparation: "Log-Analyse für Anomalien",
        modeling: "Anomalie-Erkennung, Time-to-Failure",
        evaluation: "Vermiedene Ausfälle, False Alarms",
        deployment: "Monitoring-Dashboard, automatische Tickets"
      }
    },
    gebaeude: {
      context: "Ein Facility Manager will Aufzug- und Heizungsausfälle vorhersagen. Ziel: Präventive Wartung.",
      typischeKPIs: "Verfügbarkeit ↑, Reparaturkosten ↓",
      typischeIntervention: "Wartungstermin, Ersatzteil bestellen",
      phasenHinweise: {
        business: "Facility Management plant Wartungsbudget.",
        data: "IoT-Sensoren, Wartungshistorie, Gebäudenutzung",
        preparation: "Gebäude-/Anlagentyp als Segment",
        modeling: "Survival Analysis, Risiko-Score",
        evaluation: "Vermiedene Ausfälle, Nutzerzufriedenheit",
        deployment: "CAFM-Integration, automatische Ticketerstellung"
      }
    },
    automobil: {
      context: "Ein Autohersteller will Bauteil-Ausfälle vorhersagen. Werkstätten sollen Kunden proaktiv kontaktieren (Rückruf).",
      typischeKPIs: "Rückrufkosten ↓, Kundensicherheit ↑",
      typischeIntervention: "Proaktiver Werkstatttermin, Rückruf",
      phasenHinweise: {
        business: "After-Sales plant Rückrufaktionen.",
        data: "Werkstattdaten, Telematik, Produktionsdaten",
        preparation: "Bauteil-Chargen als Feature",
        modeling: "Survival Analysis pro Bauteil/Charge",
        evaluation: "Vermiedene Ausfälle, Rückrufkosten",
        deployment: "Werkstatt-Portal, proaktive Kundenkommunikation"
      }
    }
  },
  segmentation: {
    ecommerce: {
      context: "Ein Online-Shop will Kundengruppen identifizieren. Ziel: Unterschiedliche Marketing-Kampagnen pro Segment.",
      typischeKPIs: "Campaign ROI ↑, Customer Engagement ↑",
      typischeIntervention: "Segmentspezifische Kampagnen, Personalisierung",
      phasenHinweise: {
        business: "Marketing will 4-6 handhabbare Segmente.",
        data: "Kaufverhalten, Demografie, Kanalpräferenzen",
        preparation: "Feature-Normalisierung wichtig",
        modeling: "K-Means, Hierarchisches Clustering",
        evaluation: "Silhouette Score, Business-Interpretierbarkeit",
        deployment: "Segment-Attribut im CRM, Kampagnen-Targeting"
      }
    },
    bank: {
      context: "Eine Bank will Kundentypen identifizieren. Ziel: Passende Produkte pro Segment anbieten.",
      typischeKPIs: "Cross-Selling ↑, Kundenzufriedenheit ↑",
      typischeIntervention: "Segmentspezifische Produktempfehlungen",
      phasenHinweise: {
        business: "Produktmanagement will Zielgruppen verstehen.",
        data: "Transaktionen, Produkte, Kontakte, Demografie",
        preparation: "Vermögen, Alter, Produktnutzung als Features",
        modeling: "RFM-Segmentierung oder Clustering",
        evaluation: "Segment-Stabilität, Business-Nutzen",
        deployment: "Segment im Kernbanksystem, Berater-Info"
      }
    },
    telekom: {
      context: "Ein Telekom-Anbieter will Nutzertypen identifizieren. Ziel: Personalisierte Tarif-Empfehlungen.",
      typischeKPIs: "ARPU ↑, Churn ↓",
      typischeIntervention: "Passende Tarif-Vorschläge, Bundles",
      phasenHinweise: {
        business: "Marketing will Value-basierte Segmente.",
        data: "Nutzungsverhalten, Tarif, Vertragsdauer",
        preparation: "Nutzungsprofile als Features",
        modeling: "Behavioral Clustering",
        evaluation: "Segment-Größe, Handhabbarkeit",
        deployment: "Segment in CRM, personalisierte Angebote"
      }
    },
    hr: {
      context: "Ein Unternehmen will Mitarbeitertypen identifizieren. Ziel: Passende Entwicklungsprogramme.",
      typischeKPIs: "Mitarbeiterzufriedenheit ↑, Produktivität ↑",
      typischeIntervention: "Karrierepfade, Schulungsprogramme",
      phasenHinweise: {
        business: "HR will Personas für Entwicklungsprogramme.",
        data: "Leistungsdaten, Umfragen, Karrierehistorie",
        preparation: "Datenschutz beachten!",
        modeling: "Clustering, Persona-Entwicklung",
        evaluation: "Praktikabilität für HR-Maßnahmen",
        deployment: "Mitarbeiter-Typ in HR-System (anonymisiert)"
      }
    },
    gesundheit: {
      context: "Eine Krankenkasse will Versichertengruppen identifizieren. Ziel: Präventionsprogramme pro Segment.",
      typischeKPIs: "Präventionsbeteiligung ↑, Leistungskosten ↓",
      typischeIntervention: "Zielgruppenspezifische Präventionsangebote",
      phasenHinweise: {
        business: "Prävention will Angebote personalisieren.",
        data: "Alter, Geschlecht, Diagnosen, Inanspruchnahme",
        preparation: "Datenschutz und Ethik kritisch!",
        modeling: "Risiko-Stratifizierung, Clustering",
        evaluation: "Segment-Trennschärfe, Programmakzeptanz",
        deployment: "Zielgruppenauswahl für Kampagnen"
      }
    }
  },
  recommendation: {
    ecommerce: {
      context: "Ein Online-Shop will passende Produkte zum Warenkorb empfehlen. Ziel: Höherer Warenkorbwert.",
      typischeKPIs: "Average Order Value ↑, Conversion ↑",
      typischeIntervention: "Produktempfehlungen, Bundles",
      phasenHinweise: {
        business: "E-Commerce-Team will Cross-Selling optimieren.",
        data: "Kaufhistorie, Produktkatalog, Session-Daten",
        preparation: "Collaborative Filtering vs. Content-based",
        modeling: "Matrix Factorization, Deep Learning",
        evaluation: "Click-Through Rate, Add-to-Cart Rate",
        deployment: "Echtzeit-Empfehlungen, A/B-Tests"
      }
    },
    streaming: {
      context: "Ein Streaming-Dienst will passende Filme/Serien empfehlen. Ziel: Längere Nutzungsdauer, weniger Churn.",
      typischeKPIs: "Watch Time ↑, Churn ↓",
      typischeIntervention: "Personalisierte Startseite, Empfehlungsreihen",
      phasenHinweise: {
        business: "Produkt-Team optimiert Engagement.",
        data: "Watch-History, Ratings, Content-Metadaten",
        preparation: "Cold-Start-Problem bei neuen Usern/Inhalten",
        modeling: "Hybrid: Collaborative + Content-based",
        evaluation: "Watch-Time nach Empfehlung, Diversität",
        deployment: "Personalisierte Startseite, Echtzeit-Updates"
      }
    },
    jobportal: {
      context: "Ein Jobportal will passende Stellen für Bewerber empfehlen. Ziel: Mehr erfolgreiche Vermittlungen.",
      typischeKPIs: "Application Rate ↑, Placement Rate ↑",
      typischeIntervention: "Job-Alerts, personalisierte Suchergebnisse",
      phasenHinweise: {
        business: "Produkt will Match-Qualität verbessern.",
        data: "Lebenslauf, Suchverhalten, Stellenanzeigen",
        preparation: "NLP für Skill-Matching",
        modeling: "Content-based + Collaborative",
        evaluation: "Application Rate, Interview Rate",
        deployment: "Ranking der Suchergebnisse, E-Mail-Alerts"
      }
    },
    immobilien: {
      context: "Ein Immobilienportal will passende Objekte für Suchende empfehlen. Ziel: Schnellere Vermittlung.",
      typischeKPIs: "Kontaktanfragen ↑, Time-to-Sale ↓",
      typischeIntervention: "Personalisierte Objektvorschläge, Alerts",
      phasenHinweise: {
        business: "Produkt will Suchende besser matchen.",
        data: "Suchkriterien, Klickverhalten, Objektmerkmale",
        preparation: "Implizite vs. explizite Präferenzen",
        modeling: "Content-based mit gelernten Präferenzen",
        evaluation: "Klickrate, Kontaktrate",
        deployment: "Personalisierte Suche, E-Mail-Alerts"
      }
    },
    bildung: {
      context: "Eine Lernplattform will passende Kurse empfehlen. Ziel: Höhere Abschlussquote.",
      typischeKPIs: "Kursabschlussrate ↑, Engagement ↑",
      typischeIntervention: "Kursempfehlungen, Learning Paths",
      phasenHinweise: {
        business: "Produkt will Lernerfolg steigern.",
        data: "Lernhistorie, Skills, Karriereziele",
        preparation: "Skill-Mapping für Kurse",
        modeling: "Content-based + Collaborative",
        evaluation: "Einschreiberate, Abschlussrate",
        deployment: "Personalisierte Startseite, Skill-Gaps aufzeigen"
      }
    }
  }
};

// Fallback-Kontext für nicht definierte Kombinationen
export const fallbackContext: ScenarioContext = {
  context: "Wähle eine Problemtyp-Branche-Kombination, um spezifische Hinweise zu erhalten.",
  typischeKPIs: "Abhängig vom Kontext",
  typischeIntervention: "Abhängig vom Kontext",
  phasenHinweise: {
    business: "Definiere das Geschäftsproblem und die Zielgruppe.",
    data: "Identifiziere relevante Datenquellen.",
    preparation: "Bereite die Daten für die Modellierung vor.",
    modeling: "Wähle einen passenden Modellansatz.",
    evaluation: "Definiere Erfolgskriterien und Testmethoden.",
    deployment: "Plane die Integration und den Betrieb."
  }
};

// Die 6 CRISP-DM Phasen mit Checklisten
export const phases: Phase[] = [
  {
    id: "business",
    name: "Business Understanding",
    number: "1",
    kernfrage: "Welches Problem löst du und für wen?",
    checks: [
      { id: "problem-klar", label: "Problem klar formuliert", tooltip: "Was genau soll vorhergesagt/optimiert werden?" },
      { id: "zielgruppe", label: "Zielgruppe / Entscheider definiert", tooltip: "Wer nutzt das Ergebnis? Wie oft?" },
      { id: "kpi", label: "KPI festgelegt", tooltip: "Welche Geschäftskennzahl soll sich verbessern?" },
      { id: "scope", label: "Scope abgegrenzt", tooltip: "Welche Kunden/Produkte/Regionen sind betroffen?" }
    ]
  },
  {
    id: "data",
    name: "Data Understanding",
    number: "2",
    kernfrage: "Welche Daten brauchst du und was ist das Label?",
    checks: [
      { id: "quellen", label: "Datenquellen identifiziert", tooltip: "Welche Systeme liefern Daten?" },
      { id: "label-definiert", label: "Label klar definiert", tooltip: "Was genau ist das Ereignis, das du vorhersagst?" },
      { id: "label-delay", label: "Label Delay berücksichtigt", tooltip: "Wie lange dauert es, bis du weißt, ob das Label eingetreten ist?" },
      { id: "qualitaet", label: "Datenqualität / Risiken geprüft", tooltip: "Gibt es fehlende Werte, Ausreißer, Inkonsistenzen?" }
    ]
  },
  {
    id: "preparation",
    name: "Data Preparation",
    number: "3",
    kernfrage: "Wie bereitest du die Daten auf?",
    checks: [
      { id: "feature-set", label: "Feature-Set definiert", tooltip: "Welche Merkmale nutzt du für die Vorhersage?" },
      { id: "split", label: "Train/Test Split festgelegt", tooltip: "Wie teilst du die Daten auf?" },
      { id: "zeitlich", label: "Zeitliche Sortierung beachtet", tooltip: "Trainierst du nur auf Vergangenheit, testest auf Zukunft?" },
      { id: "regeln", label: "Datenregeln dokumentiert", tooltip: "Welche Filter, Ausschlüsse, Transformationen?" }
    ]
  },
  {
    id: "modeling",
    name: "Modeling",
    number: "4",
    kernfrage: "Welches Modell und welche Baseline?",
    checks: [
      { id: "baseline", label: "Baseline definiert", tooltip: "Was ist die einfache Alternative ohne ML?" },
      { id: "modellklasse", label: "Modellklasse gewählt", tooltip: "Welcher Algorithmus passt zum Problem?" },
      { id: "metrik", label: "Metrik festgelegt", tooltip: "Precision, Recall, F1, MAE, RMSE, ...?" },
      { id: "erklaerbarkeit", label: "Erklärbarkeit bedacht", tooltip: "Muss das Modell interpretierbar sein für Stakeholder?" }
    ]
  },
  {
    id: "evaluation",
    name: "Evaluation",
    number: "5",
    kernfrage: "Wie testest du, ob es funktioniert?",
    checks: [
      { id: "go-nogo", label: "Go/No-Go Kriterien definiert", tooltip: "Ab welcher Performance geht ihr live?" },
      { id: "fehleranalyse", label: "Fehleranalyse geplant", tooltip: "Was tut ihr bei False Positives / False Negatives?" },
      { id: "business-impact", label: "Business-Impact messbar", tooltip: "Wie messt ihr den echten Geschäftswert, nicht nur die Metrik?" },
      { id: "pilot", label: "Pilotplan erstellt", tooltip: "A/B-Test? Shadow Mode? Rollout-Strategie?" }
    ]
  },
  {
    id: "deployment",
    name: "Deployment",
    number: "6",
    kernfrage: "Wer betreibt es und was passiert bei Problemen?",
    checks: [
      { id: "integration", label: "Integration geklärt", tooltip: "Wohin gehen die Vorhersagen? CRM? Dashboard? API?" },
      { id: "monitoring", label: "Monitoring / Drift-Erkennung geplant", tooltip: "Wie erkennt ihr, wenn das Modell schlechter wird?" },
      { id: "owner", label: "Owner definiert", tooltip: "Wer ist nach Go-Live verantwortlich?" },
      { id: "fallback", label: "Fallback-Lösung vorhanden", tooltip: "Was passiert, wenn das Modell ausfällt?" }
    ]
  }
];

// Helper: Get context for a scenario
export function getScenarioContext(problemTypeId: string, industryId: string): ScenarioContext {
  return scenarioContexts[problemTypeId]?.[industryId] || fallbackContext;
}

// Helper: Get compatible industries for a problem type
export function getCompatibleIndustries(problemTypeId: string): Industry[] {
  const problemType = problemTypes.find(p => p.id === problemTypeId);
  if (!problemType) return [];
  return industries.filter(i => problemType.compatibleIndustries.includes(i.id));
}

// Helper: Check if combination exists
export function hasScenarioContext(problemTypeId: string, industryId: string): boolean {
  return !!scenarioContexts[problemTypeId]?.[industryId];
}
