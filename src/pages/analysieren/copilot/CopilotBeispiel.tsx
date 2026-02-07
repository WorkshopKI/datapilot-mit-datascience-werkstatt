import { CopilotTabs } from "@/components/copilot/CopilotTabs";
import { beispielDialogCopilot } from "@/data/copilotData";
import { cn } from "@/lib/utils";
import { Handshake, ArrowRight, Bot, User } from "lucide-react";

export default function CopilotBeispiel() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      <CopilotTabs activeTab="beispiel" />

      <div className="flex items-center gap-3 mb-6">
        <Handshake className="h-8 w-8 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Beispiel-Dialog</h1>
      </div>

      <p className="text-muted-foreground mb-6">
        So sieht eine typische Session mit dem Copilot aus – vom Start bis zum Dashboard.
      </p>

      <div className="bg-muted/20 rounded-xl p-4 md:p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          📊 Szenario: Kundenabwanderung vorhersagen (Churn)
        </h2>

        <div className="space-y-4">
          {beispielDialogCopilot.nachrichten.map((msg, index) => (
            <div 
              key={index}
              className={cn(
                "flex gap-3",
                msg.rolle === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.rolle === "copilot" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              
              <div 
                className={cn(
                  "rounded-lg p-4 max-w-[85%]",
                  msg.rolle === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-background border"
                )}
              >
                {msg.rolle === "copilot" && (
                  <div className="text-xs font-medium text-muted-foreground mb-2">KI Copilot</div>
                )}
                <div className="text-sm whitespace-pre-line">{msg.nachricht}</div>
              </div>
              
              {msg.rolle === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-sm text-muted-foreground">
            💡 Der Copilot erstellt am Ende ein interaktives HTML-Dashboard, das du herunterladen und teilen kannst.
          </p>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-lg border bg-muted/20">
          <div className="font-medium mb-1">🚀 Schneller Start</div>
          <p className="text-sm text-muted-foreground">
            Use Case wählen → KI Copilot generiert passende Beispieldaten
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/20">
          <div className="font-medium mb-1">🤝 Auf Augenhöhe</div>
          <p className="text-sm text-muted-foreground">
            KI Copilot schlägt vor, du entscheidest
          </p>
        </div>
        <div className="p-4 rounded-lg border bg-muted/20">
          <div className="font-medium mb-1">📈 Fertig zum Teilen</div>
          <p className="text-sm text-muted-foreground">
            Dashboard als HTML-Datei zum Herunterladen
          </p>
        </div>
      </div>

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
