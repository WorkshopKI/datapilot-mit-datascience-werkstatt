import { CopilotTabs } from "@/components/copilot/CopilotTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { copilotPhasen } from "@/data/copilotData";
import { Handshake, Search, Wrench, Cpu, CheckCircle, ArrowRight, Bot, User } from "lucide-react";

const phasenIcons = {
  Search,
  Wrench,
  Cpu,
  CheckCircle,
};

export default function CopilotPhasen() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      <CopilotTabs activeTab="phasen" />

      <div className="flex items-center gap-3 mb-6">
        <Handshake className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Die 4 Phasen</h1>
      </div>

      <p className="text-muted-foreground mb-8">
        Der KI Copilot führt dich durch 4 Phasen – von den Rohdaten bis zum fertigen Dashboard. Du kannst jederzeit Phasen überspringen oder zurückgehen.
      </p>

      <div className="space-y-6">
        {copilotPhasen.map((phase, index) => {
          const Icon = phasenIcons[phase.icon as keyof typeof phasenIcons];
          return (
            <Card key={phase.phase} className="overflow-hidden">
              <CardHeader className="bg-muted/30 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                    {phase.nr}
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {phase.phase}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{phase.kurzbeschreibung}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Copilot macht */}
                  <div>
                    <div className="flex items-center gap-2 font-medium mb-2">
                      <Bot className="h-4 w-4 text-primary" />
                      Der KI Copilot macht:
                    </div>
                    <ul className="space-y-1.5">
                      {phase.copilotMacht.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Du entscheidest */}
                  <div>
                    <div className="flex items-center gap-2 font-medium mb-2">
                      <User className="h-4 w-4 text-primary" />
                      Du entscheidest:
                    </div>
                    <ul className="space-y-1.5">
                      {phase.duEntscheidest.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                      <strong>Deliverable:</strong> {phase.deliverable}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <section className="text-center pt-8 border-t mt-8">
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
