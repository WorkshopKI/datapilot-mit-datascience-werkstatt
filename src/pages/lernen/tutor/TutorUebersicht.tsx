import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TutorTabs } from "@/components/tutor/TutorTabs";
import { tutorInfo } from "@/data/content";
import { Bot, CheckCircle, Star, Zap, Target } from "lucide-react";

const difficultyIcons = [Target, Zap, Star];

export default function TutorUebersicht() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      <TutorTabs activeTab="was-kann" />
      
      <h1 className="text-2xl md:text-4xl font-bold mb-2">Was kann der KI Tutor?</h1>
      <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-8">{tutorInfo.beschreibung}</p>

      <div className="space-y-6 md:space-y-8">
        {/* So funktioniert's */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              So funktioniert's
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {tutorInfo.funktionsweise.map((punkt, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{punkt}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Schwierigkeitsstufen */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Drei Schwierigkeitsstufen</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {tutorInfo.schwierigkeiten.map((stufe, index) => {
              const Icon = difficultyIcons[index];
              return (
                <Card key={stufe.name} className="text-center">
                  <CardHeader className="pb-2">
                    <div className="mx-auto p-3 rounded-full bg-primary/10 text-primary w-fit">
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{stufe.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{stufe.beschreibung}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Szenarien */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Verfügbare Szenarien</h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {tutorInfo.szenarien.map((szenario) => (
                  <li key={szenario.id} className="flex items-center gap-3">
                    <span className="font-mono bg-muted px-2 py-1 rounded text-sm">
                      {szenario.id}
                    </span>
                    <span className="text-muted-foreground">{szenario.name}</span>
                    {szenario.empfohlen && (
                      <Badge variant="secondary" className="text-xs">
                        Empfohlen für Einsteiger
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
