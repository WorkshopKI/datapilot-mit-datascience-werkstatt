import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { copilotChatbotUrls, copilotBefehle, beispielDialogCopilot, copilotStartWege, copilotPhasen, copilotInfo, copilotModusTipps } from "@/data/copilotData";
import { copilotPrompt } from "@/data/copilotPrompt";
import { useProgress } from "@/hooks/useProgress";
import { CopilotTabs } from "@/components/copilot/CopilotTabs";
import { cn } from "@/lib/utils";
import {
  Handshake,
  ChevronDown,
  Check,
  Lightbulb,
  User,
  Users,
  MessageSquare,
  ArrowRight,
  Upload,
  Target,
  Search,
  Wrench,
  Cpu,
  CheckCircle,
  Bot,
  Copy,
} from "lucide-react";

type ChatbotKey = keyof typeof copilotChatbotUrls;

const chatbots: { id: ChatbotKey; name: string }[] = [
  { id: "chatgpt", name: "ChatGPT Plus (empfohlen)" },
  { id: "claude", name: "Claude" },
];

const startWegeIcons = {
  Upload,
  Target,
  Lightbulb,
};

const phasenIcons = {
  Search,
  Wrench,
  Cpu,
  CheckCircle,
};

export default function CopilotStartrampe() {
  const [selectedBot, setSelectedBot] = useState<ChatbotKey>("chatgpt");
  const [isCopied, setIsCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const startSectionRef = useRef<HTMLDivElement>(null);
  const { markAsVisited } = useProgress();

  const handleStart = async () => {
    try {
      await navigator.clipboard.writeText(copilotPrompt);
      setIsCopied(true);
      markAsVisited("copilot-started");
      
      toast({
        title: "Prompt kopiert!",
        description: `Füge den Prompt in ${chatbots.find(b => b.id === selectedBot)?.name} ein.`,
      });

      window.open(copilotChatbotUrls[selectedBot], "_blank");
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Prompt konnte nicht kopiert werden.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      <CopilotTabs activeTab="uebersicht" />

      {/* Header */}
      <section className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Handshake className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          <h1 className="text-2xl md:text-4xl font-bold">KI Copilot</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Dein KI-Arbeitspartner für Datenanalyse und Machine Learning. Lade eigene Daten hoch oder nutze Beispieldaten – der Copilot analysiert, visualisiert und baut Modelle gemeinsam mit dir.
        </p>
      </section>

      {/* Erklärung: Was ist das? */}
      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <Bot className="h-4 w-4" />
        <AlertTitle>Was ist der KI Copilot?</AlertTitle>
        <AlertDescription>
          Ein Prompt für ChatGPT Plus oder Claude. Du kopierst ihn, fügst ihn im Chatbot ein – 
          und die KI wird zu deinem Arbeitspartner für Datenanalyse und Machine Learning.
        </AlertDescription>
      </Alert>

      {/* Quick-Start CTA (above fold) */}
      <div className="mb-6 p-4 rounded-xl border-2 border-primary bg-primary/5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex gap-2 shrink-0">
            {chatbots.map((bot) => (
              <button
                key={bot.id}
                onClick={() => setSelectedBot(bot.id)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                  selectedBot === bot.id
                    ? "border-primary bg-background"
                    : "border-muted bg-background hover:border-primary/50"
                )}
              >
                {selectedBot === bot.id && <Check className="h-3 w-3 inline mr-1" />}
                {bot.name}
              </button>
            ))}
          </div>
          <Button onClick={handleStart} className="gap-2 w-full sm:w-auto">
            {isCopied ? (
              <>
                <Check className="h-4 w-4" />
                Prompt kopiert!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Prompt kopieren & starten
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Abschnitt 1: Drei Wege zum Start */}
      <section className="mb-6 md:mb-10">
        <h2 className="text-xl font-semibold mb-4">Drei Wege zum Start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {copilotStartWege.map((weg) => {
            const Icon = startWegeIcons[weg.icon as keyof typeof startWegeIcons];
            return (
              <div 
                key={weg.id} 
                className="text-center p-4 rounded-lg border border-border/50 bg-background transition-all hover:border-border hover:shadow-sm"
              >
                <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                <div className="font-medium mb-1">{weg.titel}</div>
                <div className="text-sm text-muted-foreground">{weg.beschreibung}</div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-muted-foreground flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>Der KI Copilot arbeitet mit dir auf Augenhöhe: Er analysiert, du entscheidest.</span>
        </p>
      </section>

      <Separator className="my-6 md:my-8" />

      {/* Abschnitt 2: 4 Phasen */}
      <section className="mb-6 md:mb-10">
        <h2 className="text-xl font-semibold mb-4">4 Phasen – von Daten zum Dashboard</h2>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:items-stretch">
          {copilotPhasen.map((phase, index) => {
            const Icon = phasenIcons[phase.icon as keyof typeof phasenIcons];
            return (
              <div key={phase.phase} className="flex items-stretch flex-1">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-background flex-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                    {phase.nr}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      {phase.phase}
                    </div>
                    <div className="text-xs text-muted-foreground hidden md:block">{phase.kurzbeschreibung}</div>
                  </div>
                </div>
                {index < copilotPhasen.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground mx-2 hidden sm:block shrink-0 self-center" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Separator className="my-6 md:my-8" />

      {/* Abschnitt 3: Arbeitsstile */}
      <section className="mb-6 md:mb-10">
        <div className="bg-muted/30 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Wähle deinen Arbeitsstil</h2>
          <p className="text-sm text-muted-foreground mb-4">Der KI Copilot passt sich deiner Erfahrung an.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {copilotInfo.arbeitsstile.map((stil) => (
              <div 
                key={stil.id}
                className={cn(
                  "p-3 rounded-lg border bg-background",
                  stil.empfohlen ? "border-primary/50" : "border-border/50"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{stil.name}</span>
                  {stil.empfohlen && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Empfohlen</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{stil.beschreibung}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            {copilotModusTipps.hinweis}
          </p>
        </div>
      </section>

      <Separator className="my-6 md:my-8" />

      {/* Abschnitt 4: Befehle */}
      <section className="mb-6 md:mb-10">
        <h2 className="text-xl font-semibold mb-4">So steuerst du den KI Copilot</h2>
        
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="space-y-1 mb-3">
            {copilotBefehle.slice(0, 3).map((cmd) => (
              <div key={cmd.befehl} className="flex items-center gap-3 py-1.5">
                <code className="font-mono text-primary font-semibold min-w-[100px]">
                  {cmd.befehl}
                </code>
                <span className="text-sm text-muted-foreground">{cmd.beschreibung}</span>
              </div>
            ))}
          </div>
          
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2">
                <ChevronDown className="h-4 w-4 mr-2" />
                Alle Befehle anzeigen
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-2">
              {copilotBefehle.slice(3).map((cmd) => (
                <div key={cmd.befehl} className="flex items-center gap-3 py-1.5">
                  <code className="font-mono text-primary font-semibold min-w-[100px]">
                    {cmd.befehl}
                  </code>
                  <span className="text-sm text-muted-foreground">{cmd.beschreibung}</span>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>

      <Separator className="my-6 md:my-8" />

      {/* Abschnitt 5: Beispiel-Dialog */}
      <section className="mb-6 md:mb-10">
        <Collapsible open={dialogOpen} onOpenChange={setDialogOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-0 hover:bg-transparent">
              <span className="flex items-center gap-2 text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                Beispiel-Dialog anzeigen (Szenario: Kundenabwanderung)
              </span>
              <ChevronDown className={cn("h-4 w-4 transition-transform", dialogOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-3">
            {beispielDialogCopilot.nachrichten.slice(0, 5).map((msg, index) => (
              <div 
                key={index}
                className={cn(
                  "rounded-lg p-3 max-w-[85%]",
                  msg.rolle === "user" 
                    ? "bg-primary text-primary-foreground ml-auto" 
                    : "bg-muted/50"
                )}
              >
                {msg.rolle === "copilot" && (
                  <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                    <Bot className="h-4 w-4 text-primary" />
                    KI Copilot
                  </div>
                )}
                <div className="text-sm whitespace-pre-line">{msg.nachricht}</div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Der Dialog geht weiter durch alle Phasen bis zum fertigen Dashboard.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </section>

      {/* Abschnitt 6: Start-Button */}
      <section ref={startSectionRef} className="mb-10 mt-8 md:mb-16 md:mt-12 p-4 md:p-6 rounded-xl border-2 border-primary bg-primary/5 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Bereit? Wähle deinen Chatbot:</h2>
        
        {/* Chatbot Selection - nur Claude + ChatGPT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {chatbots.map((bot) => (
            <button
              key={bot.id}
              onClick={() => setSelectedBot(bot.id)}
              className={cn(
                "p-4 rounded-lg border-2 text-center transition-all",
                selectedBot === bot.id
                  ? "border-primary bg-background"
                  : "border-muted bg-background hover:border-primary/50"
              )}
            >
              <div className="font-semibold flex items-center justify-center gap-2">
                {selectedBot === bot.id && <Check className="h-4 w-4 text-primary" />}
                {bot.name}
              </div>
            </button>
          ))}
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStart}
          size="lg"
          className="w-full text-lg h-14 mb-3"
        >
          {isCopied ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Prompt kopiert!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-5 w-5" />
              Prompt kopieren & starten
            </>
          )}
        </Button>

        <p className="text-sm text-muted-foreground text-center mb-2">
          Der Prompt wird in die Zwischenablage kopiert und <strong>{chatbots.find(b => b.id === selectedBot)?.name}</strong> öffnet sich im neuen Tab.
        </p>
        
        <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
          <Upload className="h-4 w-4" />
          {copilotModusTipps.eigeneAaten}
        </p>
      </section>

      {/* Modus-Info */}
      <p className="text-sm text-muted-foreground text-center mt-6">
        <User className="h-4 w-4 inline mr-1" />
        Allein in deinem Tempo
        <span className="mx-3">·</span>
        <Users className="h-4 w-4 inline mr-1" />
        Im Team: einer tippt, alle denken mit
      </p>

      {/* Für Fortgeschrittene */}
      <section className="mt-8 pt-6 border-t text-center">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          Mehr erfahren
        </h3>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          <Link to="/ki-assistenten/copilot/faehigkeiten" className="text-primary hover:underline">
            Was kann der KI Copilot?
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/ki-assistenten/copilot/phasen" className="text-primary hover:underline">
            Phasen im Detail
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/ki-assistenten/copilot/befehle" className="text-primary hover:underline">
            Alle Befehle
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/ki-assistenten/copilot/beispiel" className="text-primary hover:underline">
            Beispiel-Dialog
          </Link>
        </div>
      </section>
    </div>
  );
}
