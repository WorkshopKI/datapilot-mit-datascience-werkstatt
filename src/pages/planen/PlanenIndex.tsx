import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ClipboardList, Layout, FileText, Lightbulb } from "lucide-react";

const tools = [
  {
    id: "projekt",
    title: "Projekt planen",
    description: "Plane dein Data-Science-Projekt interaktiv Schritt für Schritt mit dem CRISP-DM Canvas.",
    icon: Layout,
    href: "/planen/projekt",
    cta: "Projekt planen",
    features: ["7 Problemtypen", "14+ Branchen", "Kontext-sensitive Hilfe", "PDF-Export"],
  },
  {
    id: "checkliste",
    title: "Checkliste generieren",
    description: "Generiere ein Starter-Dokument mit Checklisten, Stolperfallen und Fragen – passend zu deinem Problemtyp und deiner Branche.",
    icon: FileText,
    href: "/planen/checkliste",
    cta: "Checkliste erstellen",
    features: ["Szenario-basierte Inhalte", "Erweiterte Checklisten", "Typische Stolperfallen", "PDF/Word-Export"],
  },
];

export default function PlanenIndex() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <ClipboardList className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Planen</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Starte dein eigenes Data-Science-Projekt mit Struktur.
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid gap-4 md:gap-6">
        {tools.map((tool) => (
          <Link key={tool.id} to={tool.href}>
            <Card className="hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="text-primary">
                    <tool.icon className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{tool.title}</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {tool.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Features */}
                <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                  {tool.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-primary">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                {/* CTA */}
                <span className="inline-flex items-center text-primary font-medium">
                  {tool.cta}
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Info Note */}
      <div className="mt-6 md:mt-8 p-3 md:p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground flex items-start gap-2">
        <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          <strong>Tipp:</strong> Starte mit <strong>Projekt planen</strong> für den Überblick, dann <strong>Checkliste generieren</strong> für das Detail-Dokument.
        </p>
      </div>
    </div>
  );
}
