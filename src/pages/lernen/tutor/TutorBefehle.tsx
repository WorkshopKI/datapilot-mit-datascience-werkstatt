import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TutorTabs } from "@/components/tutor/TutorTabs";
import { cn } from "@/lib/utils";

// Command categories
const befehlsKategorien = {
  navigation: {
    titel: "Navigation",
    befehle: [
      { befehl: "weiter", beschreibung: "Nächster Schritt im Projekt" },
      { befehl: "status", beschreibung: "Zeigt aktuellen Stand und alle Entscheidungen" },
      { befehl: "hilfe", beschreibung: "Diese Befehlsübersicht anzeigen" },
    ],
  },
  einstellungen: {
    titel: "Einstellungen",
    befehle: [
      { 
        befehl: "panel", 
        beschreibung: "Komplexität ändern",
        details: [
          "einsteiger – nur Business Stakeholder + Mentor",
          "praxis – + Data Engineer & Fachexperte",
          "realistisch – alle Rollen, knapper Stil"
        ]
      },
    ],
  },
  lernen: {
    titel: "Lernen & Vertiefen",
    befehle: [
      { befehl: "tiefer", beschreibung: "Ausführliche Erklärung mit Beispiel" },
      { befehl: "quiz", beschreibung: "5 Fragen zu deinem konkreten Projekt" },
      { befehl: "challenge", beschreibung: "Stakeholder-Gespräch üben", isNew: true },
    ],
  },
  export: {
    titel: "Export",
    befehle: [
      { befehl: "zusammenfassung", beschreibung: "Projektbrief mit allen Entscheidungen" },
    ],
  },
};

function NumberBadge({ children, variant = "primary" }: { 
  children: React.ReactNode;
  variant?: "primary" | "muted";
}) {
  return (
    <span className={cn(
      "w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm",
      variant === "muted" 
        ? "bg-muted text-muted-foreground"
        : "bg-primary text-primary-foreground"
    )}>
      {children}
    </span>
  );
}

function CommandRow({ befehl, beschreibung, details, isNew }: { 
  befehl: string;
  beschreibung: string;
  details?: string[];
  isNew?: boolean;
}) {
  return (
    <div className="py-2">
      <div className="flex items-center gap-3">
        <code className={cn(
          "font-mono px-2 py-0.5 rounded min-w-[140px] text-sm",
          isNew 
            ? "bg-primary/10 text-primary font-semibold"
            : "bg-muted text-primary"
        )}>
          {befehl}
        </code>
        <span className="text-muted-foreground">{beschreibung}</span>
        {isNew && (
          <Badge className="bg-primary text-primary-foreground text-xs">
            NEU
          </Badge>
        )}
      </div>
      {details && (
        <ul className="mt-2 ml-[156px] space-y-1 text-sm text-muted-foreground">
          {details.map((detail, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="text-primary">•</span>
              {detail}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TutorBefehle() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      <TutorTabs activeTab="befehle" />
      
      <h1 className="text-2xl md:text-4xl font-bold mb-2">Alle Befehle</h1>
      <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-8">
        Diese Befehle kannst du im KI Tutor-Chat verwenden:
      </p>

      <div className="space-y-6">
        {/* Command Categories */}
        {Object.entries(befehlsKategorien).map(([key, kategorie]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
                {kategorie.titel}
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {kategorie.befehle.map((cmd) => (
                <CommandRow 
                  key={cmd.befehl}
                  befehl={cmd.befehl}
                  beschreibung={cmd.beschreibung}
                  details={'details' in cmd ? cmd.details : undefined}
                  isNew={'isNew' in cmd ? cmd.isNew : undefined}
                />
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Selection Commands - Special Box */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
              Bei Auswahl-Fragen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 1/2/3 Options */}
            <div className="flex items-start gap-4">
              <div className="flex gap-2">
                <NumberBadge>1</NumberBadge>
                <NumberBadge>2</NumberBadge>
                <NumberBadge>3</NumberBadge>
              </div>
              <span className="text-muted-foreground pt-1">Wähle eine der angebotenen Optionen</span>
            </div>
            
            {/* 0 Autopilot */}
            <div className="flex items-start gap-4">
              <div className="flex gap-2">
                <NumberBadge variant="muted">0</NumberBadge>
              </div>
              <span className="text-muted-foreground pt-1">Keine Idee? Lass dir Vorschläge geben</span>
            </div>
            
            {/* beispiel */}
            <div className="flex items-start gap-4">
              <code className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">
                beispiel
              </code>
              <span className="text-muted-foreground">Zeige eine Musterantwort (ohne fortzufahren)</span>
            </div>
          </CardContent>
        </Card>

        {/* Restart hint */}
        <Card className="bg-muted/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-muted-foreground uppercase tracking-wide">
              Neu starten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              💡 Öffne einen neuen Chat (+ Button oben) für frischen Kontext.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
