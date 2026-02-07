// Quiz-Daten für Rollen-Quiz

// Rollen-Quiz Fragen (alt, für einfaches Quiz)
export const rollenQuizFragen = [
  {
    id: 1,
    zitat: "\"Hilft das der Entscheidung?\"",
    richtig: "Business Stakeholder",
    erklaerung: "Der Stakeholder denkt immer an KPI, Impact und Business-Wert. Er will wissen, ob das Modell tatsächlich bei Entscheidungen hilft."
  },
  {
    id: 2,
    zitat: "\"So nicht stabil betreibbar.\"",
    richtig: "Data Engineer",
    erklaerung: "Der Engineer sorgt sich um Pipelines, Datenqualität und SLAs. Stabilität im Betrieb ist seine Hauptsorge."
  },
  {
    id: 3,
    zitat: "\"So läuft der Prozess nicht.\"",
    richtig: "Fachexperte (SME)",
    erklaerung: "Der Fachexperte kennt die echten Abläufe und Edge-Cases. Er erkennt sofort, wenn Annahmen nicht zur Realität passen."
  },
  {
    id: 4,
    zitat: "\"Messbarkeit fehlt.\"",
    richtig: "Data Analyst / BI Analyst",
    erklaerung: "Der Analyst denkt an KPI-Logik und Reporting. Ohne klare Metriken kann er den Erfolg nicht tracken."
  },
  {
    id: 5,
    zitat: "\"Wer betreibt das später?\"",
    richtig: "Business Stakeholder",
    erklaerung: "Der Stakeholder klärt Kapazität, Ownership und Change. Er muss sicherstellen, dass das Modell auch genutzt wird."
  }
];

// Rollen für das Quiz (Buttons) - erweitert um Abteilungsleiter
export const quizRollen = [
  "Data Scientist",
  "Data Engineer",
  "Data Analyst / BI Analyst",
  "Business Stakeholder",
  "Fachexperte",
  "Abteilungsleiter"
];

// 4 Szenarien mit je 5 kontextreichen Fragen
export const rollenQuizSzenarien = [
  {
    id: "churn",
    name: "Kundenabwanderung (Churn)",
    icon: "RefreshCw",
    empfohlen: true,
    kontext: "Telekom-Unternehmen will Kunden identifizieren, die in 4-8 Wochen kündigen werden. Retention-Team soll Top-200 Risikokunden pro Woche anrufen.",
    fragen: [
      {
        id: 1,
        zitat: "Wir wollen die Churn-Rate von 12% auf 10% senken. Aber wie messen wir, ob das Modell wirklich hilft – oder ob einfach weniger Kunden kündigen wollen?",
        richtig: "Business Stakeholder",
        erklaerung: "Der Business Stakeholder denkt immer an den Business-Impact: KPIs, ROI, und ob das Projekt wirklich einen Unterschied macht. Die Frage nach dem \"echten Effekt\" vs. externen Faktoren ist typisch."
      },
      {
        id: 2,
        zitat: "Ihr wollt CRM-Daten und Billing-Daten joinen? Die Systeme haben unterschiedliche Kunden-IDs, und die Nutzungsdaten kommen mit 3 Wochen Verzögerung rein. So ist das nicht stabil in Production betreibbar.",
        richtig: "Data Engineer",
        erklaerung: "Der Data Engineer sorgt sich um Datenqualität, Pipelines und Betriebsstabilität. \"Unterschiedliche IDs\" und \"Verzögerung\" sind typische Infrastruktur-Probleme, die er sofort erkennt."
      },
      {
        id: 3,
        zitat: "Tarifwechsel als Churn-Signal nutzen? Vorsicht – oft bieten wir den Tarifwechsel ja gerade an, WEIL jemand kündigen will. Das ist dann kein Frühindikator, sondern unsere Reaktion!",
        richtig: "Fachexperte",
        erklaerung: "Der Fachexperte kennt die echten Prozesse im Detail. Hier erkennt er ein Leakage-Risiko: Der Tarifwechsel ist Folge der Kündigungsabsicht, nicht Ursache. Dieses Prozesswissen hat nur der Fachexperte."
      },
      {
        id: 4,
        zitat: "Ihr redet von Precision@200 als Erfolgsmetrik – aber wie tracken wir das im wöchentlichen Dashboard? Und wie vergleichen wir das fair mit der alten regelbasierten Methode?",
        richtig: "Data Analyst / BI Analyst",
        erklaerung: "Der BI Analyst denkt an Messbarkeit und Reporting. \"Wie tracken wir das?\" und \"fairer Vergleich\" sind seine Kernfragen – er muss die Zahlen später im Dashboard darstellen."
      },
      {
        id: 5,
        zitat: "Schönes Modell. Aber mein Retention-Team ist jetzt schon voll ausgelastet mit den Bestandsaufgaben. Wer kümmert sich später um Monitoring und Nachtraining, wenn ihr Data Scientists zum nächsten Projekt weiterzieht?",
        richtig: "Abteilungsleiter",
        erklaerung: "Der Abteilungsleiter denkt an Kapazitäten und langfristige Ownership. \"Wer betreibt das später?\" ist seine Kernfrage – er will nicht auf einem System sitzen bleiben, das niemand pflegt."
      }
    ]
  },
  {
    id: "fraud",
    name: "Betrugserkennung (Fraud)",
    icon: "Search",
    empfohlen: false,
    kontext: "Versicherung will betrügerische Schadensmeldungen erkennen. Fraud-Analysten sollen verdächtige Fälle prüfen, bevor ausgezahlt wird.",
    fragen: [
      {
        id: 1,
        zitat: "Wir zahlen jährlich 5 Millionen Euro an betrügerische Claims aus. Wenn das Modell nur 20% davon findet, sind das schon 1 Million gespart – aber wie rechtfertigen wir die False Positives gegenüber ehrlichen Kunden?",
        richtig: "Business Stakeholder",
        erklaerung: "Der Business Stakeholder wägt Kosten gegen Nutzen ab. Bei Fraud ist die Balance zwischen \"Betrüger fangen\" und \"ehrliche Kunden nicht verärgern\" eine Business-Entscheidung."
      },
      {
        id: 2,
        zitat: "Die Schadensmeldungen kommen aus drei verschiedenen Systemen – KFZ, Hausrat und Haftpflicht. Die haben komplett unterschiedliche Datenformate. Das zu vereinheitlichen dauert Monate, nicht Wochen.",
        richtig: "Data Engineer",
        erklaerung: "Der Data Engineer sieht sofort die Integrations-Komplexität. Unterschiedliche Quellsysteme mit verschiedenen Formaten sind sein tägliches Brot – und er weiß, wie aufwändig das wird."
      },
      {
        id: 3,
        zitat: "Ihr wollt 'schnelle Meldung nach Unfall' als Fraud-Signal? Das ist Quatsch – wir schulen unsere Kunden aktiv, Schäden sofort zu melden! Das sind gerade die guten Kunden.",
        richtig: "Fachexperte",
        erklaerung: "Der Fachexperte kennt den echten Prozess. Was auf dem Papier verdächtig aussieht (\"zu schnelle Meldung\"), ist in Wirklichkeit erwünschtes Kundenverhalten. Dieses Wissen hat nur er."
      },
      {
        id: 4,
        zitat: "Wie definieren wir eigentlich 'bestätigter Betrug'? Im System steht nur 'Claim abgelehnt' – aber das kann auch ein Formfehler sein. Ohne sauberes Label können wir keine Trefferquote reporten.",
        richtig: "Data Analyst / BI Analyst",
        erklaerung: "Der BI Analyst braucht klare Definitionen für sein Reporting. \"Wie ist das Label definiert?\" ist eine Kernfrage – ohne saubere Definition sind alle Metriken wertlos."
      },
      {
        id: 5,
        zitat: "Aktuell prüfen meine Fraud-Analysten 50 Fälle am Tag. Wenn das Modell plötzlich 200 Verdachtsfälle ausspuckt, brauche ich mehr Personal – oder wir schauen uns nur die Top-50 an und der Rest verfällt.",
        richtig: "Abteilungsleiter",
        erklaerung: "Der Abteilungsleiter rechnet in Kapazitäten. Mehr Alerts bedeuten mehr Arbeit – und die muss jemand machen. Er plant die Ressourcen und will wissen, was realistisch umsetzbar ist."
      }
    ]
  },
  {
    id: "forecast",
    name: "Nachfrageprognose (Forecast)",
    icon: "Package",
    empfohlen: false,
    kontext: "Einzelhändler will Nachfrage pro Produkt und Filiale vorhersagen. Ziel: weniger Out-of-Stock, weniger Überbestand.",
    fragen: [
      {
        id: 1,
        zitat: "Wir haben 15% Out-of-Stock-Quote und gleichzeitig 20% Überbestand, der abgeschrieben wird. Das Modell soll beides reduzieren – aber was ist wichtiger, wenn wir uns entscheiden müssen?",
        richtig: "Business Stakeholder",
        erklaerung: "Der Business Stakeholder definiert die Prioritäten. Out-of-Stock vs. Überbestand ist eine strategische Entscheidung – mehr Verfügbarkeit kostet Lagergeld, weniger Lager riskiert leere Regale."
      },
      {
        id: 2,
        zitat: "Die Kassendaten kommen täglich um 2 Uhr nachts rein. Aber die Filialen in der anderen Zeitzone liefern erst um 5 Uhr. Bis wir alles zusammen haben und verarbeitet haben, ist es 8 Uhr – zu spät für die Morgen-Bestellung.",
        richtig: "Data Engineer",
        erklaerung: "Der Data Engineer denkt in Pipelines und Timing. Wann kommen Daten an? Wie lange dauert die Verarbeitung? Ist das rechtzeitig für den Business-Prozess? Das sind seine Fragen."
      },
      {
        id: 3,
        zitat: "Ihr prognostiziert auf Artikel-Ebene? Bei uns gibt es aber ständig Sortimentswechsel – ein neuer Joghurt ersetzt den alten, hat aber eine neue Artikelnummer. Das Modell sieht dann nur 'neues Produkt ohne Historie'.",
        richtig: "Fachexperte",
        erklaerung: "Der Fachexperte kennt die Tücken des Sortiments. Artikel-Substitutionen, Saisonware, Aktionsprodukte – all das macht die schöne Theorie komplizierter. Nur er weiß, wie das Geschäft wirklich läuft."
      },
      {
        id: 4,
        zitat: "Wie aggregieren wir die Forecast-Genauigkeit fürs Management? MAE pro Artikel ist zu granular – aber wenn wir auf Warengruppe aggregieren, verstecken sich die Ausreißer. Was soll ins Dashboard?",
        richtig: "Data Analyst / BI Analyst",
        erklaerung: "Der BI Analyst kämpft mit der richtigen Aggregationsebene. Zu detailliert ist unübersichtlich, zu aggregiert versteckt Probleme. Die richtige Dashboard-Metrik zu finden ist seine Aufgabe."
      },
      {
        id: 5,
        zitat: "Aktuell bestellen meine Filialleiter selbst – die kennen ihre Kunden. Wenn jetzt ein Algorithmus sagt 'bestell 50 Stück' und der Filialleiter weiß, dass Stadtfest ist und es 100 sein müssten – was gilt dann?",
        richtig: "Abteilungsleiter",
        erklaerung: "Der Abteilungsleiter denkt an Change Management. Algorithmus vs. Erfahrung ist ein Kulturthema. Wer darf das Modell überstimmen? Das muss geklärt sein, sonst gibt es Konflikte."
      }
    ]
  },
  {
    id: "maintenance",
    name: "Maschinenausfälle (Maintenance)",
    icon: "Settings",
    empfohlen: false,
    kontext: "Fertigungsunternehmen will Maschinenausfälle vorhersagen. Wartungsteam soll präventiv eingreifen, bevor die Linie steht.",
    fragen: [
      {
        id: 1,
        zitat: "Eine Stunde Stillstand kostet uns 50.000 Euro. Aber präventive Wartung kostet auch – wenn wir zu oft 'falschen Alarm' haben, tauschen wir Teile, die noch gut sind. Wo ist der Sweet Spot?",
        richtig: "Business Stakeholder",
        erklaerung: "Der Business Stakeholder rechnet in Euro. Stillstand-Kosten vs. Wartungskosten vs. False-Positive-Kosten – das ist eine Optimierungsaufgabe mit Business-Zahlen."
      },
      {
        id: 2,
        zitat: "Die Sensordaten von den alten Maschinen kommen per OPC-UA, die neuen liefern über MQTT. Die Datenformate sind komplett unterschiedlich, und bei Netzwerkproblemen fehlen einfach Datenpunkte – ohne Fehlermeldung.",
        richtig: "Data Engineer",
        erklaerung: "Der Data Engineer kennt die Sensor-Infrastruktur. Unterschiedliche Protokolle, fehlende Daten ohne Warnung – das sind typische Industrie-4.0-Probleme, die er täglich löst."
      },
      {
        id: 3,
        zitat: "Ihr wollt Vibrationsdaten als Haupt-Feature? Bei der Fräse stimmt das, aber bei der Presse ist die Temperatur viel wichtiger. Und die CNC-Maschine hat gar keine Vibrationssensoren – die hat nur Stromaufnahme.",
        richtig: "Fachexperte",
        erklaerung: "Der Fachexperte kennt jede Maschine individuell. \"One size fits all\" funktioniert nicht – jeder Maschinentyp hat andere Fehlermuster und andere relevante Sensoren."
      },
      {
        id: 4,
        zitat: "Wie reporten wir 'verhinderte Ausfälle'? Wenn die Wartung erfolgreich war, ist ja nichts passiert – woher wissen wir, ob das Modell recht hatte oder ob die Maschine sowieso nicht ausgefallen wäre?",
        richtig: "Data Analyst / BI Analyst",
        erklaerung: "Der BI Analyst erkennt das Attributionsproblem. Erfolgreiche Prävention ist unsichtbar – man kann nicht beweisen, was nicht passiert ist. Trotzdem braucht er Zahlen fürs Management."
      },
      {
        id: 5,
        zitat: "Mein Wartungsteam arbeitet nach festen Schichten. Wenn das Modell sagt 'Maschine 7 fällt Sonntagnacht aus', kann ich nicht mal eben jemanden hinschicken. Wer organisiert den Bereitschaftsdienst?",
        richtig: "Abteilungsleiter",
        erklaerung: "Der Abteilungsleiter plant die Ressourcen. Vorhersage ist nur wertvoll, wenn man auch reagieren kann. Schichtpläne, Bereitschaft, Ersatzteile – all das muss organisiert werden."
      }
    ]
  }
];
