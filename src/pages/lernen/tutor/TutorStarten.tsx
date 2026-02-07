import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { chatbotUrls } from "@/data/content";
import { tutorPrompt } from "@/data/tutorPrompt";
import { Rocket, Copy, ExternalLink, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "@/hooks/useProgress";

type ChatbotKey = keyof typeof chatbotUrls;

const chatbots: { id: ChatbotKey; name: string; description: string }[] = [
  { id: "claude", name: "Claude (empfohlen)", description: "Anthropic's KI-Assistent" },
  { id: "gemini", name: "Gemini", description: "Google's Gemini" },
  { id: "chatgpt", name: "ChatGPT", description: "OpenAI's ChatGPT" },
];

export default function TutorStarten() {
  const [selectedBot, setSelectedBot] = useState<ChatbotKey>("claude");
  const [isCopied, setIsCopied] = useState(false);
  const { markAsVisited } = useProgress();

  useEffect(() => {
    markAsVisited("tutor-started");
  }, [markAsVisited]);

  const handleStart = async () => {
    try {
      await navigator.clipboard.writeText(tutorPrompt);
      setIsCopied(true);
      
      toast({
        title: "✅ Prompt kopiert!",
        description: `Füge den Prompt in ${chatbots.find(b => b.id === selectedBot)?.name} ein.`,
      });

      // Open chatbot in new tab
      window.open(chatbotUrls[selectedBot], "_blank");

      // Reset copied state after 3 seconds
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
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-2xl">
      <h1 className="text-2xl md:text-4xl font-bold mb-2 text-center">Tutor starten</h1>
      <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-8 text-center">
        Wähle deinen Chatbot und starte das interaktive Rollenspiel.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>1. Chatbot wählen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Chatbot Selection */}
          <div className="grid grid-cols-3 gap-3">
            {chatbots.map((bot) => (
              <button
                key={bot.id}
                onClick={() => setSelectedBot(bot.id)}
                className={cn(
                  "p-4 rounded-lg border-2 text-center transition-all",
                  selectedBot === bot.id
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className="font-semibold">{bot.name}</div>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {bot.description}
                </div>
              </button>
            ))}
          </div>

          {/* Start Button */}
          <div className="pt-4">
            <Button
              onClick={handleStart}
              size="lg"
              className="w-full text-lg h-14"
            >
              {isCopied ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Prompt kopiert!
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-5 w-5" />
                  🚀 Tutor starten
                </>
              )}
            </Button>
          </div>

          {/* Hint Text */}
          <p className="text-sm text-muted-foreground text-center">
            Der Tutor-Prompt wird in deine Zwischenablage kopiert und{" "}
            <strong>{chatbots.find(b => b.id === selectedBot)?.name}</strong>{" "}
            öffnet sich in einem neuen Tab.
          </p>

          {/* Manual Copy Option */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await navigator.clipboard.writeText(tutorPrompt);
                toast({
                  title: "Prompt kopiert!",
                  description: "Du kannst ihn jetzt manuell einfügen.",
                });
              }}
              className="w-full"
            >
              <Copy className="mr-2 h-4 w-4" />
              Nur Prompt kopieren (ohne Tab öffnen)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
