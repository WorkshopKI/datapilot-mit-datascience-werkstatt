import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ClipboardList, Wrench, Search, ArrowRight, Lightbulb, Bot, GraduationCap, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";

const welcomeContent = {
  title: "Data Science und KI",
  subtitle: "Deine interaktive Lern-App",
  shortDescription: "Lerne Data Science Projektmanagement – von den Grundlagen bis zum eigenen Projekt im interaktiven Tutor.",
};

const groups = [
  {
    id: "lernen",
    title: "Lernen",
    icon: BookOpen,
    description: "CRISP-DM verstehen, Rollen kennenlernen, Wissen testen.",
    href: "/lernen",
    featured: false,
    tools: [
      { label: "Grundlagen", duration: "~20 Min" },
      { label: "Challenge Cards", duration: "~2-3 Min/Karte" },
      { label: "Quiz", duration: "~5 Min" },
    ],
  },
  {
    id: "ki-assistenten",
    title: "KI-Assistenten",
    icon: Bot,
    description: "Interaktive Prompts für ChatGPT/Claude – zum Lernen und Analysieren.",
    href: "/ki-assistenten",
    featured: true,
    tools: [
      { label: "KI Tutor", duration: "~30-45 Min", featured: true, hint: "Prompt" },
      { label: "KI Copilot", hint: "Prompt" },
    ],
  },
  {
    id: "planen",
    title: "Planen",
    icon: ClipboardList,
    description: "Eigenes Projekt starten, Checklisten und Dokumente generieren.",
    href: "/planen",
    featured: false,
    tools: [
      { label: "Projekt planen" },
      { label: "Checkliste generieren" },
    ],
  },
  {
    id: "im-projekt",
    title: "Im Projekt",
    icon: Wrench,
    description: "Meeting vorbereiten, Stakeholder befragen, Business Case rechnen.",
    href: "/im-projekt",
    featured: false,
    tools: [
      { label: "Meeting vorbereiten" },
      { label: "Stakeholder befragen" },
      { label: "ROI berechnen" },
    ],
  },
  {
    id: "nachschlagen",
    title: "Nachschlagen",
    icon: Search,
    description: "Begriffe klären, Stakeholder übersetzen, Probleme diagnostizieren.",
    href: "/nachschlagen",
    featured: false,
    tools: [
      { label: "Begriffe & Übersetzungen" },
      { label: "Problem diagnostizieren" },
    ],
  },
];

const Index = () => {
  return (
<div className="container mx-auto px-4 py-4 md:py-8 max-w-5xl">
      {/* Hero Section */}
      <section className="text-center py-4 md:py-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-3 text-foreground">
          {welcomeContent.title}
        </h1>
        <p className="text-base md:text-xl text-muted-foreground max-w-xl mx-auto mb-2 md:mb-4">
          Deine Lern-App für Data Science Projektmanagement – von den Grundlagen bis zum eigenen Projekt.
        </p>
        <Badge variant="secondary" className="gap-1">
          <BookOpen className="h-3 w-3" />
          Workshop-Begleiter
        </Badge>
      </section>

      {/* 2x2 Grid of Group Cards */}
      <section className="py-4">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {groups.map((group) => (
            <Link key={group.id} to={group.href} className="block">
              <Card
                className={cn(
                  "group hover:shadow-lg transition-all cursor-pointer relative h-full flex flex-col",
                  "hover:border-primary/50",
                  group.featured && "border-2 border-primary bg-primary/5"
                )}
              >
                {/* Empfohlen Badge */}
                {group.featured && (
                  <Badge className="absolute -top-2 right-4">
                    Empfohlen
                  </Badge>
                )}
                <CardHeader>
                <div className="text-primary mb-1 md:mb-2">
                    <group.icon className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                  <CardTitle className="text-xl">{group.title}</CardTitle>
                  <CardDescription className="text-base">
                    {group.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Tool List */}
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {group.tools.map((tool, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span className="text-primary">•</span>
                        <span className={tool.featured ? "font-semibold text-primary" : ""}>
                          {tool.label}
                        </span>
                        {'hint' in tool && tool.hint && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                            {tool.hint}
                          </Badge>
                        )}
                        {tool.featured && (
                          <Badge variant="secondary" className="text-xs py-0 px-1.5">
                            Empfohlen
                          </Badge>
                        )}
                        {tool.duration && (
                          <span className="text-xs text-muted-foreground/70">
                            ({tool.duration})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                  
                  {/* Spacer */}
                  <div className="flex-1 min-h-4" />
                  
                  {/* CTA */}
                  <span className="inline-flex items-center text-primary font-medium mt-4">
                    Loslegen
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Tip */}
        <p className="text-center text-sm text-muted-foreground mt-6 md:mt-8 flex items-center justify-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Tipp:</strong> Das Glossar hilft dir jederzeit beim Nachschlagen.
          </span>
        </p>
      </section>
    </div>
  );
};

export default Index;
