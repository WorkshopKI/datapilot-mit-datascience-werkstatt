import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Gamepad2, Lightbulb, Dices, Bot } from "lucide-react";

const tools = [
  {
    id: "grundlagen",
    title: "Grundlagen",
    description: "CRISP-DM Prozess, Rollen im Projekt, Change Management – die Theorie kompakt erklärt.",
    icon: BookOpen,
    href: "/lernen/grundlagen",
    cta: "Lernen",
    duration: "~20 Min.",
  },
  {
    id: "challenge-cards",
    title: "Challenge Cards",
    description: "Ziehe zufällige Projekt-Herausforderungen und teste dein Problemlöse-Denken.",
    icon: Dices,
    href: "/lernen/challenge-cards",
    cta: "Ziehen",
    duration: "~2-3 Min./Karte",
  },
  {
    id: "quiz",
    title: "Quiz",
    description: "Hast du's verstanden? Drag & Drop Quiz zu CRISP-DM und Rollen-Zuordnung.",
    icon: Gamepad2,
    href: "/lernen/quiz",
    cta: "Testen",
    duration: "~5 Min.",
  },
];

export default function LernenIndex() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Lernen</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          CRISP-DM verstehen, Rollen kennenlernen, Wissen testen.
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid gap-4 md:gap-6">
        {tools.map((tool) => (
          <Link key={tool.id} to={tool.href}>
            <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-primary">
                      <tool.icon className="h-8 w-8 md:h-10 md:w-10" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{tool.title}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {tool.description}
                      </CardDescription>
                      <span className="text-xs text-muted-foreground mt-2 block">
                        {tool.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center text-primary font-medium">
                  {tool.cta}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info Note - Hinweis auf KI Tutor */}
      <div className="mt-6 md:mt-8 p-3 md:p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground flex items-start gap-2">
        <Bot className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          <strong>KI-gestützt lernen?</strong> Probier den{" "}
          <Link to="/ki-assistenten/tutor" className="text-primary hover:underline font-medium">
            KI Tutor
          </Link>{" "}
          – ein interaktiver Prompt für ChatGPT/Claude, der dich durch ein ganzes DS-Projekt führt.
        </p>
      </div>

      {/* Empfehlung */}
      <div className="mt-4 p-3 md:p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          <strong>Empfohlen:</strong> Starte mit den <strong>Grundlagen</strong>, teste dein Wissen im <strong>Quiz</strong>.
        </p>
      </div>
    </div>
  );
}
