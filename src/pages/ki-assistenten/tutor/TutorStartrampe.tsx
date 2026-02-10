import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { chatbotUrls, tutorBefehle, beispielDialog, modusTipps } from "@/data/content";
import { tutorPrompt } from "@/data/tutorPrompt";
import { useProgress } from "@/hooks/useProgress";
import { TutorTabs } from "@/components/tutor/TutorTabs";
import { TutorChallengeTeaser } from "@/components/tutor/TutorChallengeTeaser";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Briefcase,
  Cog,
  BarChart3,
  ClipboardList,
  Rocket,
  ChevronDown,
  Check,
  Lightbulb,
  User,
  Users,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Terminal,
  Bot,
  Copy,
} from "lucide-react";

type ChatbotKey = keyof typeof chatbotUrls;

const chatbots: { id: ChatbotKey; name: string }[] = [
  { id: "claude", name: "Claude (empfohlen)" },
  { id: "gemini", name: "Gemini" },
  { id: "chatgpt", name: "ChatGPT" },
];

const tutorRollen = [
  { 
    name: "Business Stakeholder", 
    Icon: Briefcase, 
    frage: "Hilft das der Entscheidung?" 
  },
  { 
    name: "Data Engineer", 
    Icon: Cog, 
    frage: "So nicht stabil betreibbar." 
  },
  { 
    name: "Fachexperte", 
    Icon: GraduationCap, 
    frage: "So läuft der Prozess nicht." 
  },
  { 
    name: "BI Analyst", 
    Icon: BarChart3, 
    frage: "Messbarkeit fehlt." 
  },
  { 
    name: "Abteilungsleiter", 
    Icon: ClipboardList, 
    frage: "Wer betreibt das später?" 
  },
  { 
    name: "Mentor", 
    Icon: GraduationCap, 
    frage: "Hier ein Lern-Tipp für dich...",
    isMentor: true
  },
] as const;

const wichtigeBefehle = tutorBefehle;

export default function TutorStartrampe() {
  const [selectedBot, setSelectedBot] = useState<ChatbotKey>("claude");
  const [isCopied, setIsCopied] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const startSectionRef = useRef<HTMLDivElement>(null);
  const { markAsVisited } = useProgress();

  const scrollToStart = () => {
    startSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleStart = async () => {
    try {
      await navigator.clipboard.writeText(tutorPrompt);
      setIsCopied(true);
      markAsVisited("tutor-started");
      
      toast({
        title: "Prompt kopiert!",
        description: `Füge den Prompt in ${chatbots.find(b => b.id === selectedBot)?.name} ein.`,
      });

      window.open(chatbotUrls[selectedBot], "_blank");
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
      <TutorTabs activeTab="uebersicht" />

      {/* Header */}
      <section className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <GraduationCap className="h-8 w-8 md:h-10 md:w-10 text-primary" />
          <h1 className="text-2xl md:text-4xl font-bold">KI Tutor</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Spiel den Data Scientist! Durchlaufe ein DS-Projekt von der Anforderung bis zum Go-Live.
        </p>
      </section>

      {/* Erklärung: Was ist das? */}
      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <Bot className="h-4 w-4" />
        <AlertTitle>Was ist der KI Tutor?</AlertTitle>
        <AlertDescription>
          Ein Prompt für ChatGPT, Claude oder Gemini. Du kopierst ihn, fügst ihn im Chatbot ein – 
          und die KI wird zu deinem interaktiven Lernpartner für Data Science Projektmanagement.
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

      {/* Abschnitt 1: Rollen */}
      <section className="mb-6 md:mb-10">
        <h2 className="text-xl font-semibold mb-4">Diese Rollen triffst du</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible">
          {tutorRollen.map((rolle) => (
            <div 
              key={rolle.name} 
              className={cn(
                "text-center p-3 rounded-lg border border-border/50 bg-background transition-all cursor-default hover:border-border hover:shadow-sm",
                "min-w-[120px] shrink-0 sm:min-w-0 sm:shrink",
                'isMentor' in rolle && rolle.isMentor && "border-primary/30 bg-primary/5"
              )}
            >
              <rolle.Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="font-medium text-sm mb-1">{rolle.name}</div>
              <div className="text-sm text-foreground/80 italic">{rolle.frage}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <span>
            Im <strong className="text-foreground">Einsteiger-Modus</strong> triffst du nur den Business Stakeholder + einen Mentor, der dir Tipps gibt.
          </span>
        </p>
      </section>

      {/* Challenge Teaser */}
      <section className="mb-6 md:mb-10">
        <TutorChallengeTeaser />
      </section>

      <Separator className="my-6 md:my-8" />

      {/* Abschnitt 2: Befehle */}
      <section className="mb-6 md:mb-10">
        <h2 className="text-xl font-semibold mb-4">So steuerst du den KI Tutor</h2>
        
        {/* Container mit leichtem Hintergrund */}
        <div className="bg-muted/30 rounded-lg p-4">
          {/* Nur die 3 wichtigsten Befehle */}
          <div className="space-y-1 mb-3">
            {wichtigeBefehle.slice(0, 3).map((cmd) => (
              <div key={cmd.befehl} className="flex items-center gap-3 py-1.5">
                <code className="font-mono text-primary font-semibold min-w-[100px]">
                  {cmd.befehl}
                </code>
                <span className="text-sm text-muted-foreground">{cmd.beschreibung}</span>
              </div>
            ))}
          </div>
          
          {/* Rest in Accordion */}
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2">
                <ChevronDown className="h-4 w-4 mr-2" />
                Alle Befehle anzeigen
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pt-2">
              {wichtigeBefehle.slice(3).map((cmd) => (
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

      {/* Abschnitt 3: Beispiel-Dialog */}
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
          <CollapsibleContent className="mt-4 space-y-4">
            {/* Dialog-Inhalte ohne Card-Rahmen */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <div className="font-semibold text-sm mb-1">{beispielDialog.stakeholder.rolle}</div>
                  <p className="text-sm whitespace-pre-line">{beispielDialog.stakeholder.nachricht}</p>
                </div>
              </div>
            </div>
            
            {/* Mentor-Tipp als Text ohne Box */}
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <GraduationCap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span><strong className="text-foreground">Mentor-Tipp:</strong> {beispielDialog.mentor}</span>
            </p>

            {/* Tutor-Frage */}
            <div className="text-sm">
              <p className="mb-2"><strong>KI Tutor fragt:</strong> {beispielDialog.folgefrage}</p>
              <p className="text-xs text-muted-foreground italic mb-1">Antwort-Optionen:</p>
              <div className="text-xs text-muted-foreground pl-2">
                1 - Begriffe | 2 - Prozess | 3 - Datenlage | 0 - Weiss nicht
              </div>
            </div>
            
            {/* Szenario-Hinweis am Ende */}
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Der KI Tutor bietet 6 verschiedene Szenarien - oder du bringst deinen eigenen Use Case mit.
            </p>
          </CollapsibleContent>
        </Collapsible>
      </section>

      {/* Abschnitt 4: Start-Button */}
      <section ref={startSectionRef} className="mb-10 mt-8 md:mb-16 md:mt-12 p-4 md:p-6 rounded-xl border-2 border-primary bg-primary/5 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-center">Bereit? Wähle deinen Chatbot:</h2>
        
        {/* Chatbot Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
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

        <p className="text-sm text-muted-foreground text-center">
          Der Prompt wird in die Zwischenablage kopiert und <strong>{chatbots.find(b => b.id === selectedBot)?.name}</strong> öffnet sich im neuen Tab.
        </p>
      </section>

      {/* Abschnitt 5: Modus-Info */}
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
          Für Fortgeschrittene
        </h3>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
          <Link to="/ki-assistenten/tutor/uebersicht" className="text-primary hover:underline">
            Was kann der KI Tutor?
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/ki-assistenten/tutor/phasen" className="text-primary hover:underline">
            Phasen im KI Tutor
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/ki-assistenten/tutor/befehle" className="text-primary hover:underline">
            Alle Befehle
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link to="/ki-assistenten/tutor/beispiel" className="text-primary hover:underline">
            Beispiel-Dialog
          </Link>
        </div>
      </section>
    </div>
  );
}
