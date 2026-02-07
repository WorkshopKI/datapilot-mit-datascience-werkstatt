import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Search, BookOpen, Wrench, Lightbulb, BarChart3 } from "lucide-react";

const tools = [
  {
    id: "begriffe",
    title: "Begriffe & Übersetzungen",
    description: "Data-Science-Begriffe verstehen und erklären – mit zwei Modi für verschiedene Situationen.",
    icon: BookOpen,
    href: "/nachschlagen/begriffe",
    cta: "Nachschlagen",
    features: [
      "Schnell nachschlagen: A-Z Liste",
      "Für Stakeholder: Kategorien & Details",
      "Präsentationstexte zum Kopieren",
      "Beispiele & Tipps",
    ],
  },
  {
    id: "metriken",
    title: "Metriken-Referenz",
    description: "Statistische Maße für ML-Modelle verstehen und richtig einsetzen.",
    icon: BarChart3,
    href: "/nachschlagen/metriken",
    cta: "Referenz öffnen",
    features: [
      "Regression: R², MSE, RMSE, MAE",
      "Klassifikation: Precision, Recall, F1",
      "Statistik: Varianz, Standardabweichung",
      "Konzepte: Overfitting, Korrelation",
    ],
  },
  {
    id: "diagnose",
    title: "Problem diagnostizieren",
    description: "Was tun, wenn... – interaktive Entscheidungshilfe für typische Projektprobleme.",
    icon: Wrench,
    href: "/nachschlagen/diagnose",
    cta: "Diagnose starten",
    features: ["5 Problemtypen", "Geführte Diagnose", "Konkrete Lösungsschritte", "Weiterführende Links"],
  },
];

export default function NachschlagenIndex() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <Search className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Nachschlagen</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Schnelle Hilfe, wenn du nicht weiterweißt.
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {tools.map((tool) => (
          <Link key={tool.id} to={tool.href}>
            <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group">
              <CardHeader>
                <div className="text-primary mb-1 md:mb-2">
                  <tool.icon className="h-8 w-8 md:h-10 md:w-10" />
                </div>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
                <CardDescription className="text-base">
                  {tool.description}
                </CardDescription>
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
          <strong>Tipp:</strong> Im <strong>Schnell-Modus</strong> findest du Begriffe alphabetisch sortiert.
          Im <strong>Stakeholder-Modus</strong> bekommst du ausführliche Erklärungen mit Präsentationstexten.
        </p>
      </div>
    </div>
  );
}
