// Change Management und Widerstände

export const widerstaende = {
  gruende: [
    "Die Anforderungen wurden nicht richtig verstanden oder das Problem wurde nicht richtig gelöst",
    "Es fehlte die Unterstützung des Managements und der Fachabteilung"
  ],
  emotionaleWiderstände: "Menschen fürchten um ihre Jobs, wenn Maschinen Entscheidungen treffen sollen. Diese Ängste können nicht mit \"Corporate Blabla\" besänftigt werden. Ignoriert man sie, droht Widerstand bis hin zur Sabotage.",
  houseOfChange: [
    {
      zimmer: 1,
      name: "Zufriedenheit",
      beschreibung: "\"Alles soll so bleiben, wie es ist.\"",
      gefuehle: "Kontrolle",
      color: "success",
      emoji: "😌",
      hinweis: "In dieser Phase blocken Mitarbeiter oft unbewusst – sie merken gar nicht, dass Veränderung nötig ist.",
      colorScheme: {
        bg: "bg-orange-50/50 dark:bg-orange-950/20",
        border: "border-orange-300 dark:border-orange-700",
        text: "text-orange-800 dark:text-orange-300",
        activeBg: "bg-orange-100 dark:bg-orange-900/40"
      }
    },
    {
      zimmer: 2,
      name: "Ablehnung",
      beschreibung: "\"Diese Änderung ist schlecht, sie kann nicht funktionieren.\"",
      gefuehle: "Angst, Wut, Widerstand",
      color: "destructive",
      emoji: "😤",
      hinweis: "Widerstand ist normal und wichtig! Er zeigt, dass die Veränderung ernst genommen wird. Nicht ignorieren, sondern ernst nehmen.",
      colorScheme: {
        bg: "bg-orange-100/60 dark:bg-orange-950/30",
        border: "border-orange-400 dark:border-orange-600",
        text: "text-orange-800 dark:text-orange-300",
        activeBg: "bg-orange-200/80 dark:bg-orange-900/50"
      }
    },
    {
      zimmer: 3,
      name: "Verwirrung",
      beschreibung: "\"Ich komme nicht zurecht mit dieser Situation.\"",
      gefuehle: "Traurigkeit, Frust, Verlustgefühle",
      color: "warning",
      emoji: "🤔",
      hinweis: "Hier kommt die rationale und emotionale Einsicht",
      colorScheme: {
        bg: "bg-orange-100/80 dark:bg-orange-950/40",
        border: "border-orange-500 dark:border-orange-500",
        text: "text-orange-800 dark:text-orange-300",
        activeBg: "bg-orange-200 dark:bg-orange-900/60"
      }
    },
    {
      zimmer: 4,
      name: "Akzeptanz",
      beschreibung: "\"Ich lerne etwas Neues, und jetzt verstehe ich erst, warum das gut ist.\"",
      gefuehle: "Freude und Erschöpfung",
      color: "primary",
      emoji: "😊",
      hinweis: "Erst jetzt sind Mitarbeiter bereit, neue Prozesse wirklich anzunehmen und aktiv mitzugestalten.",
      colorScheme: {
        bg: "bg-orange-200/70 dark:bg-orange-950/50",
        border: "border-orange-600 dark:border-orange-400",
        text: "text-orange-900 dark:text-orange-200",
        activeBg: "bg-orange-300/80 dark:bg-orange-800/60"
      }
    }
  ],
  kernbotschaft: "Man kann nicht erwarten, dass Mitarbeiter direkt von Zimmer 1 in Zimmer 4 gelangen. Sie müssen Zimmer 2 und 3 durchlaufen und brauchen dafür ihre eigene Zeit."
};
