import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Bot, GraduationCap, Handshake, ArrowRight, Lightbulb, Copy, ExternalLink } from "lucide-react";

const tools = [
  {
    id: "ki-tutor",
    title: "KI Tutor",
    description: "Spiel den Data Scientist! Durchlaufe ein DS-Projekt von der Anforderung bis zum Go-Live.",
    icon: GraduationCap,
    href: "/ki-assistenten/tutor",
    cta: "Zum KI Tutor",
    duration: "~30-45 Min.",
    featured: true,
  },
  {
    id: "ki-copilot",
    title: "KI Copilot",
    description: "Dein Arbeitspartner für Datenanalyse und Machine Learning. Analysiert, visualisiert und baut Modelle mit dir.",
    icon: Handshake,
    href: "/ki-assistenten/copilot",
    cta: "Zum KI Copilot",
    duration: "Flexibel",
  },
];

export default function KIAssistentenIndex() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <Bot className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">KI-Assistenten</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Interaktive Prompts für ChatGPT, Claude oder Gemini – zum Lernen und Analysieren.
        </p>
      </div>

      {/* Erklärung: So funktioniert's */}
      <Alert className="mb-6 border-primary/20 bg-primary/5">
        <Lightbulb className="h-4 w-4" />
        <AlertTitle>So funktioniert's</AlertTitle>
        <AlertDescription className="text-sm">
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li className="flex items-start gap-2">
              <span className="shrink-0">1.</span>
              <span>Wähle einen Assistenten und klicke "Prompt kopieren"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0">2.</span>
              <span>Der Prompt wird kopiert und ChatGPT/Claude öffnet sich</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="shrink-0">3.</span>
              <span>Füge den Prompt ein – die KI wird zu deinem Lernpartner</span>
            </li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* Tool Cards */}
      <div className="grid gap-4 md:gap-6">
        {tools.map((tool) => (
          <Link key={tool.id} to={tool.href}>
            <Card className={`hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group ${tool.featured ? 'border-2 border-primary bg-primary/5' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="text-primary">
                      <tool.icon className="h-8 w-8 md:h-10 md:w-10" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-xl">{tool.title}</CardTitle>
                        <Badge variant="secondary" className="text-xs">Prompt</Badge>
                      </div>
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

      {/* Hinweis */}
      <div className="mt-6 md:mt-8 p-3 md:p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground flex items-start gap-2">
        <Bot className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          <strong>Tipp:</strong> Der <strong>KI Tutor</strong> ist ideal zum Lernen von Projektmanagement-Grundlagen. 
          Der <strong>KI Copilot</strong> hilft bei echter Datenanalyse mit eigenen Daten.
        </p>
      </div>
    </div>
  );
}
