import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TutorTabs } from "@/components/tutor/TutorTabs";
import { beispielDialog, beispielProjektbrief } from "@/data/content";
import { MessageSquare, GraduationCap, HelpCircle, ChevronDown, ClipboardCheck, Target, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TutorBeispiel() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      <TutorTabs activeTab="beispiel" />
      
      <h1 className="text-2xl md:text-4xl font-bold mb-2">Was erwartet dich?</h1>
      <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-8">
        So könnte ein typischer Einstieg aussehen (Szenario: Churn-Vorhersage):
      </p>

      <div className="space-y-6">
        {/* Stakeholder Nachricht */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              {beispielDialog.stakeholder.rolle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-line text-muted-foreground">
              {beispielDialog.stakeholder.nachricht}
            </div>
          </CardContent>
        </Card>

        {/* Mentor Tipp */}
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-amber-700 dark:text-amber-400">
              <GraduationCap className="h-5 w-5" />
              🎓 Mentor-Tipp
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-amber-800 dark:text-amber-300">{beispielDialog.mentor}</p>
          </CardContent>
        </Card>

        {/* Folgefrage */}
        <Card className="border-2 border-dashed border-primary/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <p className="text-muted-foreground">{beispielDialog.folgefrage}</p>
            </div>
          </CardContent>
        </Card>

        {/* Beispiel-Projektbrief (Collapsible) */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <Card className="border-2 border-dashed border-muted-foreground/30 bg-muted/30">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-2 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ClipboardCheck className="h-5 w-5" />
                    Fertiges Ergebnis ansehen
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6 animate-fade-in">
                <p className="text-sm text-muted-foreground italic">
                  So könnte dein fertiger Projektbrief nach Abschluss des Tutors aussehen:
                </p>

                {/* Projektbrief Header */}
                <div className="rounded-lg bg-background border p-4 space-y-4">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <ClipboardCheck className="h-5 w-5" />
                    📋 Dein Projektbrief: {beispielProjektbrief.titel}
                  </div>

                  {/* Geschäftsziel */}
                  <div>
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <Target className="h-4 w-4 text-primary" />
                      Geschäftsziel
                    </div>
                    <p className="text-sm text-muted-foreground pl-6">
                      {beispielProjektbrief.geschaeftsziel}
                    </p>
                  </div>

                  {/* Entscheidung */}
                  <div>
                    <div className="font-medium mb-1">Entscheidung</div>
                    <p className="text-sm text-muted-foreground">
                      {beispielProjektbrief.entscheidung}
                    </p>
                  </div>

                  {/* KPIs */}
                  <div>
                    <div className="font-medium mb-1">KPIs</div>
                    <ul className="text-sm text-muted-foreground list-disc list-inside">
                      {beispielProjektbrief.kpis.map((kpi, i) => (
                        <li key={i}>{kpi}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Phasen-Entscheidungen */}
                  <div>
                    <div className="font-medium mb-2">Deine Entscheidungen</div>
                    <div className="space-y-2">
                      {beispielProjektbrief.phasenEntscheidungen.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded shrink-0">
                            {item.phase}
                          </span>
                          <span className="text-muted-foreground">{item.entscheidung}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risiken */}
                  <div>
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                      Risiken
                    </div>
                    <ul className="text-sm text-muted-foreground list-disc list-inside pl-6">
                      {beispielProjektbrief.risiken.map((risiko, i) => (
                        <li key={i}>{risiko}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Nächste Schritte */}
                  <div>
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      Nächste Schritte
                    </div>
                    <ul className="text-sm text-muted-foreground list-disc list-inside pl-6">
                      {beispielProjektbrief.naechsteSchritte.map((schritt, i) => (
                        <li key={i}>{schritt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>
    </div>
  );
}
