import { ArrowLeft, Target, Activity, Database, AlertTriangle, BookOpen, Star, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { problemTypes, industries, type UseCase } from "@/data/useCaseData";

interface UseCaseDetailProps {
  useCase: UseCase;
  onBack: () => void;
}

export function UseCaseDetail({ useCase, onBack }: UseCaseDetailProps) {
  const getProblemTypeLabel = (id: string) => problemTypes.find((pt) => pt.id === id)?.label || id;
  const getIndustryLabel = (id: string) => industries.find((ind) => ind.id === id)?.label || id;

  const renderStars = (count: number) => {
    return Array.from({ length: 3 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < count ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Zur Übersicht
      </button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <span className="text-5xl">{useCase.emoji}</span>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{useCase.title}</h2>
          <p className="text-muted-foreground mt-1">{useCase.shortDescription}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="secondary">{getProblemTypeLabel(useCase.problemType)}</Badge>
            <Badge variant="outline">{getIndustryLabel(useCase.industry)}</Badge>
            <div className="flex items-center gap-0.5 ml-2">
              {renderStars(useCase.levelStars)}
            </div>
          </div>
        </div>
      </div>

      {/* Übersicht */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Übersicht
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Ziel</span>
              <p className="text-sm">{useCase.goal}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Entscheidung</span>
              <p className="text-sm">{useCase.decision}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Intervention</span>
              <p className="text-sm">{useCase.intervention}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted-foreground">Baseline</span>
              <p className="text-sm">{useCase.baseline}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kennzahlen */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Kennzahlen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Business KPIs</span>
            <ul className="mt-2 space-y-1">
              {useCase.businessKPIs.map((kpi, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {kpi}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <span className="text-sm font-medium text-muted-foreground">Modell-Metriken</span>
            <div className="mt-2 space-y-2">
              {useCase.modelMetrics.map((metric, i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium text-sm">{metric.metric}</span>
                  <p className="text-sm text-muted-foreground mt-1">{metric.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {useCase.metricsNote && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                💡 {useCase.metricsNote}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Typische Daten */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Typische Daten
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {useCase.dataSources.map((source, i) => (
              <div key={i} className="p-3 bg-muted/50 rounded-lg">
                <span className="font-medium text-sm">{source.source}</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {source.features.map((feature, j) => (
                    <Badge key={j} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-muted/50 rounded-lg">
            <span className="font-medium text-sm">Label-Definition</span>
            <p className="text-sm text-muted-foreground mt-1">{useCase.labelDefinition}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stolperfallen */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Stolperfallen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {useCase.pitfalls.map((pitfall, i) => (
              <AccordionItem key={i} value={`pitfall-${i}`}>
                <AccordionTrigger className="text-left">
                  <span className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="font-medium">{pitfall.title}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-8 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Problem:</span>
                    <p className="text-sm">{pitfall.problem}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">Warum schlecht:</span>
                    <p className="text-sm">{pitfall.whyBad}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">Lösung:</span>
                    <p className="text-sm">{pitfall.solution}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Praxis-Story */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Praxis-Story: {useCase.practiceStory.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-sm font-medium text-muted-foreground">Situation</span>
            <p className="text-sm mt-1">{useCase.practiceStory.situation}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Problem</span>
            <p className="text-sm mt-1">{useCase.practiceStory.problem}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">Ursache</span>
            <p className="text-sm mt-1">{useCase.practiceStory.cause}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-lg">
            <span className="text-sm font-medium text-primary">💡 Learning</span>
            <p className="text-sm mt-1">{useCase.practiceStory.learning}</p>
          </div>
        </CardContent>
      </Card>

      {/* Link to Starter Kit */}
      <div className="flex justify-center pt-4">
        <Link
          to="/werkzeuge/starter"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Projekt-Starter Kit für diesen Use Case erstellen
        </Link>
      </div>
    </div>
  );
}
