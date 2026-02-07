import { CopilotTabs } from "@/components/copilot/CopilotTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { copilotBefehle, copilotInfo } from "@/data/copilotData";
import { Handshake, ArrowRight, Terminal, Settings, FileDown, Navigation } from "lucide-react";

// Befehle in Kategorien gruppieren
const befehlsKategorien = [
  {
    name: "Navigation",
    icon: Navigation,
    befehle: ["weiter", "zurück", "status", "daten"]
  },
  {
    name: "Einstellungen",
    icon: Settings,
    befehle: ["modus", "hilfe"]
  },
  {
    name: "Ausgabe & Export",
    icon: FileDown,
    befehle: ["dashboard", "code", "erkläre", "export"]
  }
];

export default function CopilotBefehle() {
  const getBefehlInfo = (befehl: string) => {
    return copilotBefehle.find(b => b.befehl === befehl);
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      <CopilotTabs activeTab="befehle" />

      <div className="flex items-center gap-3 mb-6">
        <Handshake className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Alle Befehle</h1>
      </div>

      <p className="text-muted-foreground mb-6">
        Tippe diese Befehle einfach in den Chat – ohne Slash oder Sonderzeichen.
      </p>

      {/* Befehle nach Kategorien */}
      <div className="space-y-6 mb-8">
        {befehlsKategorien.map((kategorie) => (
          <Card key={kategorie.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <kategorie.icon className="h-5 w-5 text-primary" />
                {kategorie.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kategorie.befehle.map((befehl) => {
                  const info = getBefehlInfo(befehl);
                  if (!info) return null;
                  return (
                    <div key={befehl} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <code className="font-mono text-primary font-semibold min-w-[100px] bg-primary/10 px-2 py-1 rounded">
                        {info.befehl}
                      </code>
                      <span className="text-sm text-muted-foreground">{info.beschreibung}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Arbeitsstile Box */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            Arbeitsstile mit <code className="bg-primary/10 px-2 py-0.5 rounded">modus</code>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Tippe <code className="bg-muted px-1.5 py-0.5 rounded">modus</code> und wähle dann:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {copilotInfo.arbeitsstile.map((stil) => (
              <div 
                key={stil.id}
                className="p-3 rounded-lg bg-background border"
              >
                <div className="flex items-center gap-2 mb-1">
                  <code className="font-mono text-primary text-sm">{stil.id}</code>
                  {stil.empfohlen && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Empfohlen</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{stil.beschreibung}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tipps */}
      <Card className="mb-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tipps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• <strong>Datei hochladen:</strong> CSV oder Excel einfach in den Chat ziehen</p>
          <p>• <strong>Neu starten:</strong> Neuen Chat öffnen (+ Button oben)</p>
          <p>• <strong>Bei Unklarheit:</strong> Einfach fragen – der Copilot gibt Empfehlungen</p>
        </CardContent>
      </Card>

      {/* CTA */}
      <section className="text-center pt-6 border-t">
        <a 
          href="/ki-assistenten/copilot" 
          className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
        >
          Zurück zur Übersicht
          <ArrowRight className="h-4 w-4" />
        </a>
      </section>
    </div>
  );
}
