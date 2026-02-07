export type Phase = "business" | "data" | "preparation" | "modeling" | "evaluation" | "deployment";
export type Role = "stakeholder" | "fachexperte" | "dataEngineer" | "it" | "biAnalyst";

export interface QuestionCategory {
  name: string;
  questions: string[];
}

export interface RoleQuestions {
  role: Role;
  roleName: string;
  roleEmoji: string;
  categories: QuestionCategory[];
}

export interface PhaseQuestions {
  phase: Phase;
  phaseName: string;
  phaseNumber: number;
  roles: RoleQuestions[];
}

export const phaseQuestions: PhaseQuestions[] = [
  {
    phase: "business",
    phaseName: "Business Understanding",
    phaseNumber: 1,
    roles: [
      {
        role: "stakeholder",
        roleName: "Stakeholder / Auftraggeber",
        roleEmoji: "👔",
        categories: [
          {
            name: "Problemverständnis",
            questions: [
              "Was ist das konkrete Geschäftsproblem, das wir lösen wollen?",
              "Wie wird dieses Problem aktuell gelöst?",
              "Was sind die Kosten des aktuellen Ansatzes?",
              "Was wäre eine messbare Verbesserung?",
            ],
          },
          {
            name: "Erfolgskriterien",
            questions: [
              "Wie definieren wir Erfolg für dieses Projekt?",
              "Welche KPIs sollen verbessert werden?",
              "Was ist der Mindest-ROI für eine Umsetzung?",
              "Bis wann muss das Projekt Ergebnisse liefern?",
            ],
          },
          {
            name: "Rahmenbedingungen",
            questions: [
              "Welches Budget steht zur Verfügung?",
              "Gibt es regulatorische Einschränkungen?",
              "Wer muss in Entscheidungen eingebunden werden?",
              "Gibt es ähnliche Projekte, aus denen wir lernen können?",
            ],
          },
        ],
      },
      {
        role: "fachexperte",
        roleName: "Fachexperte / Domain Expert",
        roleEmoji: "🔬",
        categories: [
          {
            name: "Domänenwissen",
            questions: [
              "Welche Faktoren beeinflussen das Zielergebnis typischerweise?",
              "Gibt es bekannte Ausnahmen oder Sonderfälle?",
              "Was sind typische Fehlentscheidungen in diesem Bereich?",
              "Gibt es saisonale oder zyklische Muster?",
            ],
          },
          {
            name: "Datenverständnis",
            questions: [
              "Welche Daten werden heute für manuelle Entscheidungen genutzt?",
              "Welche Daten wären ideal, sind aber nicht verfügbar?",
              "Gibt es bekannte Datenqualitätsprobleme?",
              "Wie aktuell müssen die Daten sein?",
            ],
          },
        ],
      },
    ],
  },
  {
    phase: "data",
    phaseName: "Data Understanding",
    phaseNumber: 2,
    roles: [
      {
        role: "dataEngineer",
        roleName: "Data Engineer",
        roleEmoji: "🔧",
        categories: [
          {
            name: "Datenverfügbarkeit",
            questions: [
              "Welche Datenquellen sind verfügbar?",
              "Wie ist die Datenqualität (Vollständigkeit, Aktualität)?",
              "Gibt es dokumentierte Datenschemata?",
              "Wie häufig werden die Daten aktualisiert?",
            ],
          },
          {
            name: "Technische Details",
            questions: [
              "In welchem Format liegen die Daten vor?",
              "Wie groß ist das Datenvolumen?",
              "Gibt es Zugriffsbeschränkungen?",
              "Wie sind die Daten historisch gewachsen?",
            ],
          },
          {
            name: "Integration",
            questions: [
              "Können die Datenquellen verknüpft werden?",
              "Gibt es eindeutige Schlüssel für Joins?",
              "Welche ETL-Prozesse existieren bereits?",
              "Wer ist für die Datenquellen verantwortlich?",
            ],
          },
        ],
      },
      {
        role: "fachexperte",
        roleName: "Fachexperte / Domain Expert",
        roleEmoji: "🔬",
        categories: [
          {
            name: "Datenbedeutung",
            questions: [
              "Was bedeuten die einzelnen Felder genau?",
              "Gibt es Felder mit versteckter Geschäftslogik?",
              "Welche Felder sind abgeleitet vs. Original?",
              "Gibt es bekannte Datenerfassungsfehler?",
            ],
          },
          {
            name: "Datenevolution",
            questions: [
              "Haben sich Definitionen über die Zeit geändert?",
              "Gab es Systemmigrationen, die die Daten beeinflusst haben?",
              "Welche Felder wurden wann eingeführt?",
              "Gibt es Daten, die nicht mehr gepflegt werden?",
            ],
          },
        ],
      },
    ],
  },
  {
    phase: "preparation",
    phaseName: "Data Preparation",
    phaseNumber: 3,
    roles: [
      {
        role: "dataEngineer",
        roleName: "Data Engineer",
        roleEmoji: "🔧",
        categories: [
          {
            name: "Datentransformation",
            questions: [
              "Welche Bereinigungsschritte sind notwendig?",
              "Wie gehen wir mit fehlenden Werten um?",
              "Gibt es Duplikate, die bereinigt werden müssen?",
              "Welche Aggregationsebenen brauchen wir?",
            ],
          },
          {
            name: "Feature Engineering",
            questions: [
              "Welche abgeleiteten Features sind sinnvoll?",
              "Gibt es temporale Features (Trends, Saisonalität)?",
              "Welche Kodierungen sind für kategorische Variablen geeignet?",
              "Brauchen wir Interaktions-Features?",
            ],
          },
        ],
      },
      {
        role: "fachexperte",
        roleName: "Fachexperte / Domain Expert",
        roleEmoji: "🔬",
        categories: [
          {
            name: "Plausibilität",
            questions: [
              "Sind die bereinigten Daten fachlich plausibel?",
              "Wurden wichtige Sonderfälle korrekt behandelt?",
              "Entsprechen die Feature-Definitionen dem Fachwissen?",
              "Gibt es offensichtliche Ausreißer, die erklärbar sind?",
            ],
          },
        ],
      },
    ],
  },
  {
    phase: "modeling",
    phaseName: "Modeling",
    phaseNumber: 4,
    roles: [
      {
        role: "stakeholder",
        roleName: "Stakeholder / Auftraggeber",
        roleEmoji: "👔",
        categories: [
          {
            name: "Anforderungen",
            questions: [
              "Wie wichtig ist Erklärbarkeit vs. Genauigkeit?",
              "Gibt es Geschwindigkeitsanforderungen (Echtzeit vs. Batch)?",
              "Welche Fehlertypen sind geschäftlich kritischer?",
              "Müssen bestimmte Regeln immer eingehalten werden?",
            ],
          },
        ],
      },
      {
        role: "fachexperte",
        roleName: "Fachexperte / Domain Expert",
        roleEmoji: "🔬",
        categories: [
          {
            name: "Modellvalidierung",
            questions: [
              "Sind die wichtigsten Features aus Fachsicht plausibel?",
              "Gibt es Features, die nicht verwendet werden sollten?",
              "Entspricht die Modelllogik dem Domänenwissen?",
              "Gibt es Fälle, die das Modell besser erkennen sollte?",
            ],
          },
        ],
      },
    ],
  },
  {
    phase: "evaluation",
    phaseName: "Evaluation",
    phaseNumber: 5,
    roles: [
      {
        role: "stakeholder",
        roleName: "Stakeholder / Auftraggeber",
        roleEmoji: "👔",
        categories: [
          {
            name: "Business-Evaluation",
            questions: [
              "Erreicht das Modell die definierten Erfolgskriterien?",
              "Wie verhält sich das Modell im Vergleich zum aktuellen Prozess?",
              "Sind die Fehlerkosten akzeptabel?",
              "Stimmt der Business Case noch?",
            ],
          },
          {
            name: "Entscheidung",
            questions: [
              "Soll das Modell produktiv gehen?",
              "Welche Pilotphase ist sinnvoll?",
              "Wer trägt die Verantwortung für Modellfehler?",
              "Wie kommunizieren wir die Einführung?",
            ],
          },
        ],
      },
      {
        role: "fachexperte",
        roleName: "Fachexperte / Domain Expert",
        roleEmoji: "🔬",
        categories: [
          {
            name: "Fachliche Prüfung",
            questions: [
              "Sind die Modellergebnisse fachlich nachvollziehbar?",
              "Gibt es systematische Fehler bei bestimmten Fallgruppen?",
              "Würden Experten ähnlich entscheiden?",
              "Welche Fälle sollten manuell geprüft werden?",
            ],
          },
        ],
      },
    ],
  },
  {
    phase: "deployment",
    phaseName: "Deployment",
    phaseNumber: 6,
    roles: [
      {
        role: "it",
        roleName: "IT / Operations",
        roleEmoji: "🖥️",
        categories: [
          {
            name: "Integration",
            questions: [
              "Wie wird das Modell in bestehende Systeme integriert?",
              "Welche APIs oder Schnittstellen werden benötigt?",
              "Wie ist die Fehlerbehandlung geregelt?",
              "Gibt es Fallback-Mechanismen bei Modellausfall?",
            ],
          },
          {
            name: "Betrieb",
            questions: [
              "Wie wird das Modell überwacht?",
              "Welche Alerts bei Performance-Problemen?",
              "Wie ist das Retraining organisiert?",
              "Wer ist für den Betrieb verantwortlich?",
            ],
          },
          {
            name: "Security & Compliance",
            questions: [
              "Welche Daten werden im Modell verwendet?",
              "Sind alle Datenschutz-Anforderungen erfüllt?",
              "Wie werden Modell-Entscheidungen geloggt?",
              "Gibt es Audit-Anforderungen?",
            ],
          },
        ],
      },
      {
        role: "stakeholder",
        roleName: "Stakeholder / Auftraggeber",
        roleEmoji: "👔",
        categories: [
          {
            name: "Rollout",
            questions: [
              "Wie ist der Rollout-Plan (Pilot → Vollbetrieb)?",
              "Wie werden Nutzer geschult?",
              "Wie sammeln wir Feedback?",
              "Wann ist der Review-Termin?",
            ],
          },
        ],
      },
    ],
  },
];

// Alle verfügbaren Rollen
export const allRoles: { role: Role; roleName: string; roleEmoji: string }[] = [
  { role: "stakeholder", roleName: "Stakeholder", roleEmoji: "👔" },
  { role: "fachexperte", roleName: "Fachexperte", roleEmoji: "🔬" },
  { role: "dataEngineer", roleName: "Data Engineer", roleEmoji: "🔧" },
  { role: "it", roleName: "IT / Ops", roleEmoji: "🖥️" },
  { role: "biAnalyst", roleName: "BI Analyst", roleEmoji: "📊" },
];

// Alle Phasen
export const allPhases: { phase: Phase; phaseName: string; phaseNumber: number }[] = [
  { phase: "business", phaseName: "Business Understanding", phaseNumber: 1 },
  { phase: "data", phaseName: "Data Understanding", phaseNumber: 2 },
  { phase: "preparation", phaseName: "Data Preparation", phaseNumber: 3 },
  { phase: "modeling", phaseName: "Modeling", phaseNumber: 4 },
  { phase: "evaluation", phaseName: "Evaluation", phaseNumber: 5 },
  { phase: "deployment", phaseName: "Deployment", phaseNumber: 6 },
];

// Hilfsfunktion: Fragen für Phase und Rolle
export function getQuestionsForPhaseAndRole(
  phase: Phase,
  role: Role
): { categories: QuestionCategory[]; roleName: string; roleEmoji: string } | null {
  const phaseData = phaseQuestions.find((p) => p.phase === phase);
  if (!phaseData) return null;

  const roleData = phaseData.roles.find((r) => r.role === role);
  if (!roleData) return null;

  return {
    categories: roleData.categories,
    roleName: roleData.roleName,
    roleEmoji: roleData.roleEmoji,
  };
}

// Hilfsfunktion: Alle Fragen für eine Phase
export function getAllQuestionsForPhase(phase: Phase): {
  phaseName: string;
  roles: RoleQuestions[];
} | null {
  const phaseData = phaseQuestions.find((p) => p.phase === phase);
  if (!phaseData) return null;

  return {
    phaseName: phaseData.phaseName,
    roles: phaseData.roles,
  };
}

// Gesamtanzahl der Fragen
export function getTotalQuestionCount(): number {
  return phaseQuestions.reduce(
    (total, phase) =>
      total +
      phase.roles.reduce(
        (roleTotal, role) =>
          roleTotal + role.categories.reduce((catTotal, cat) => catTotal + cat.questions.length, 0),
        0
      ),
    0
  );
}
