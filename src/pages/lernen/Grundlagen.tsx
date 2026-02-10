import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  dataScience,
  crispDmPhasen,
  rollen,
  widerstaende,
  projektmanagement
} from "@/data/content";
import { cn } from "@/lib/utils";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import {
  Lightbulb,
  Target,
  Database,
  Wrench,
  Brain,
  CheckCircle,
  Rocket,
  RefreshCw,
  FlaskConical,
  Cog,
  BarChart3,
  Briefcase,
  GraduationCap,
  Home,
  ArrowRight,
  ArrowDown,
  Quote,
  Info,
  ArrowUp,
  UserCheck,
  ChevronDown,
  ClipboardCheck,
  Layers,
} from "lucide-react";

const crispIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Target,
  Database,
  Wrench,
  Brain,
  CheckCircle,
  Rocket,
};

const rollenIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FlaskConical,
  Cog,
  BarChart3,
  Briefcase,
  GraduationCap,
  UserCheck,
};

const sections = [
  { id: "was-ist-ds", label: "Was ist Data Science?" },
  { id: "crisp-dm", label: "Der CRISP-DM Prozess" },
  { id: "rollen", label: "Rollen im Projekt" },
  { id: "change-management", label: "Change Management" },
  { id: "projektmanagement", label: "Projektmanagement" },
];

export default function Grundlagen() {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [selectedZimmer, setSelectedZimmer] = useState<number | null>(1);
  const [activeRolle, setActiveRolle] = useState(rollen[0].id);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "was-ist-ds": true,
  });

  const sectionIds = useMemo(() => sections.map((s) => s.id), []);
  const activeSection = useScrollSpy(sectionIds);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const selectedZimmerData = selectedZimmer !== null
    ? widerstaende.houseOfChange.find((z) => z.zimmer === selectedZimmer)
    : null;

  const toggleSection = (sectionId: string, open: boolean) => {
    setOpenSections((prev) => ({ ...prev, [sectionId]: open }));
  };

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      {/* Header + CTA Buttons */}
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Grundlagen</h1>
        <p className="text-base md:text-lg text-muted-foreground">
          Alles Wichtige zu Data Science – von der Definition bis zum Projektmanagement.
        </p>

        {/* CTA Buttons - moved up */}
        <div className="flex gap-3 mt-4">
          <Button asChild>
            <Link to="/lernen/quiz">
              <ClipboardCheck className="h-4 w-4 mr-1" />
              Teste dein Wissen
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/lernen/challenge-cards">
              <Layers className="h-4 w-4 mr-1" />
              Challenge Cards
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid: Content + Sticky ToC Sidebar */}
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[1fr,240px] gap-6">
        {/* Main content column */}
        <div className="space-y-8 max-w-4xl">

          {/* ========== Section 1: Was ist Data Science? ========== */}
          <Collapsible
            open={openSections["was-ist-ds"]}
            onOpenChange={(open) => toggleSection("was-ist-ds", open)}
          >
            <section id="was-ist-ds" className="scroll-mt-16 md:scroll-mt-20">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left group mb-4">
                  <h2 className="text-2xl font-bold">Was ist Data Science?</h2>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      openSections["was-ist-ds"] && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        Definition
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg">{dataScience.definition}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Der Data Scientist als Dienstleister</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{dataScience.dienstleister}</p>
                    </CardContent>
                  </Card>

                  <div className="flex gap-2 md:gap-3 p-3 md:p-4 rounded-r-lg border-l-4 border-primary bg-primary/5">
                    <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Die größte Herausforderung</h4>
                      <p className="text-muted-foreground">{dataScience.herausforderung}</p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </section>
          </Collapsible>

          <Separator />

          {/* ========== Section 2: CRISP-DM ========== */}
          <Collapsible
            open={openSections["crisp-dm"]}
            onOpenChange={(open) => toggleSection("crisp-dm", open)}
          >
            <section id="crisp-dm" className="scroll-mt-16 md:scroll-mt-20">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left group mb-4">
                  <h2 className="text-2xl font-bold">Der CRISP-DM Prozess</h2>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      openSections["crisp-dm"] && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className="text-muted-foreground mb-6">
                  CRISP-DM (Cross-Industry Standard Process for Data Mining) ist ein bewährtes Vorgehensmodell für Data-Science-Projekte.
                </p>

                <div className="flex gap-2 md:gap-3 p-3 md:p-4 rounded-r-lg border-l-4 border-primary bg-primary/5 mb-4 md:mb-6">
                  <RefreshCw className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Iterativer Prozess</h4>
                    <p className="text-muted-foreground">Rücksprünge zwischen den Phasen sind normal und erwünscht!</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {crispDmPhasen.map((phase) => {
                    const IconComponent = crispIconMap[phase.icon] || Target;
                    return (
                      <Card key={phase.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">Phase {phase.id}</span>
                              <CardTitle className="text-lg">{phase.name}</CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </section>
          </Collapsible>

          <Separator />

          {/* ========== Section 3: Rollen ========== */}
          <Collapsible
            open={openSections["rollen"]}
            onOpenChange={(open) => toggleSection("rollen", open)}
          >
            <section id="rollen" className="scroll-mt-16 md:scroll-mt-20">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left group mb-4">
                  <h2 className="text-2xl font-bold">Rollen im DS-Projekt</h2>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      openSections["rollen"] && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className="text-muted-foreground mb-6">
                  Ein Data-Science-Projekt braucht verschiedene Kompetenzen. Hier sind die wichtigsten Rollen:
                </p>

                <Tabs value={activeRolle} onValueChange={setActiveRolle} className="w-full">
                  <TabsList className="w-full h-auto grid grid-cols-2 sm:grid-cols-3 gap-2 bg-transparent p-0 mb-6">
                    {rollen.map((rolle) => {
                      const IconComponent = rollenIconMap[rolle.icon] || FlaskConical;
                      return (
                        <TabsTrigger
                          key={rolle.id}
                          value={rolle.id}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border flex items-center justify-center gap-2 w-full"
                        >
                          <IconComponent className="h-4 w-4 shrink-0" />
                          <span className="text-xs sm:text-sm truncate">{rolle.name}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {rollen.map((rolle) => {
                    const IconComponent = rollenIconMap[rolle.icon] || FlaskConical;
                    return (
                      <TabsContent key={rolle.id} value={rolle.id}>
                        <Card>
                          <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                <IconComponent className="h-6 w-6" />
                              </div>
                              <div>
                                <CardTitle className="text-2xl">{rolle.name}</CardTitle>
                                <CardDescription className="text-base">{rolle.beschreibung}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div>
                              <h3 className="font-semibold mb-3">Typische Aufgaben:</h3>
                              <ul className="space-y-2">
                                {rolle.aufgaben.map((aufgabe, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-primary mt-1">•</span>
                                    <span className="text-muted-foreground">{aufgabe}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                              <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                              <p className="text-sm text-muted-foreground italic">{rolle.hinweis}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              </CollapsibleContent>
            </section>
          </Collapsible>

          <Separator />

          {/* ========== Section 4: Change Management ========== */}
          <Collapsible
            open={openSections["change-management"]}
            onOpenChange={(open) => toggleSection("change-management", open)}
          >
            <section id="change-management" className="scroll-mt-16 md:scroll-mt-20">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left group mb-4">
                  <h2 className="text-2xl font-bold">Change Management</h2>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      openSections["change-management"] && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-6">
                  {/* Warum scheitern Projekte */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Warum scheitern Data-Science-Projekte?</h3>
                    <Card>
                      <CardContent className="pt-6">
                        <ol className="list-decimal list-inside space-y-3">
                          {widerstaende.gruende.map((grund, index) => (
                            <li key={index} className="text-muted-foreground">{grund}</li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Emotionale Widerstände */}
                  <div className="flex gap-2 md:gap-3 p-3 md:p-4 rounded-r-lg border-l-4 border-primary bg-primary/5">
                    <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1">Emotionale Widerstände ernst nehmen</h4>
                      <p className="text-muted-foreground">{widerstaende.emotionaleWiderstände}</p>
                    </div>
                  </div>

                  {/* House of Change */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Das House of Change (4-Zimmer-Modell)
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Menschen durchlaufen bei Veränderungen typischerweise vier Phasen. Klicke auf ein Zimmer:
                    </p>

                    {/* Desktop: 4 Karten in einer Reihe mit Pfeilen */}
                    <div className="hidden md:flex items-center justify-center gap-2 mb-4">
                      {widerstaende.houseOfChange.map((zimmer, index) => (
                        <div key={zimmer.zimmer} className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedZimmer(
                              selectedZimmer === zimmer.zimmer ? null : zimmer.zimmer
                            )}
                            className={cn(
                              "p-4 rounded-xl text-center transition-all duration-300 min-w-[120px]",
                              "bg-card border border-border",
                              selectedZimmer === zimmer.zimmer && [
                                "!bg-primary/10",
                                "!border-2 !border-primary",
                                "shadow-sm",
                              ],
                              selectedZimmer !== null && selectedZimmer !== zimmer.zimmer && "opacity-50",
                              "hover:border-muted-foreground/50 hover:shadow-sm cursor-pointer"
                            )}
                          >
                            <span className="text-2xl block">{zimmer.emoji}</span>
                            <div className="text-sm font-medium mt-1 text-foreground">
                              {zimmer.zimmer}. {zimmer.name}
                            </div>
                          </button>
                          {index < widerstaende.houseOfChange.length - 1 && (
                            <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Mobile: Vertikal mit Pfeilen nach unten */}
                    <div className="md:hidden flex flex-col items-center gap-2 mb-4">
                      {widerstaende.houseOfChange.map((zimmer, index) => (
                        <div key={zimmer.zimmer} className="flex flex-col items-center gap-2 w-full">
                          <button
                            onClick={() => setSelectedZimmer(
                              selectedZimmer === zimmer.zimmer ? null : zimmer.zimmer
                            )}
                            className={cn(
                              "p-5 rounded-xl text-left transition-all duration-300 w-full max-w-[300px]",
                              "bg-card border border-border",
                              selectedZimmer === zimmer.zimmer && [
                                "!bg-primary/10",
                                "!border-2 !border-primary",
                                "shadow-sm",
                              ],
                              selectedZimmer !== null && selectedZimmer !== zimmer.zimmer && "opacity-50",
                              "hover:border-muted-foreground/50 hover:shadow-sm cursor-pointer"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{zimmer.emoji}</span>
                              <div>
                                <div className="text-xs font-medium opacity-70 text-muted-foreground">
                                  Zimmer {zimmer.zimmer}
                                </div>
                                <div className="font-bold text-base text-foreground">
                                  {zimmer.name}
                                </div>
                              </div>
                            </div>
                          </button>
                          {index < widerstaende.houseOfChange.length - 1 && (
                            <ArrowDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Detail Panel */}
                    {selectedZimmerData && (
                      <Card className="animate-fade-in border-l-4 border-primary bg-primary/5">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-3">
                            Zimmer {selectedZimmerData.zimmer}: {selectedZimmerData.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-lg italic text-muted-foreground">
                            {selectedZimmerData.beschreibung}
                          </p>
                          <div>
                            <span className="font-medium">Gefühle: </span>
                            <span className="text-muted-foreground">{selectedZimmerData.gefuehle}</span>
                          </div>
                          {selectedZimmerData.hinweis && (
                            <div className="flex items-start gap-2 p-3 rounded-lg bg-background/50">
                              <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                              <p className="text-sm text-muted-foreground">{selectedZimmerData.hinweis}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Kernbotschaft */}
                  <Card className="border-2 border-primary/50 bg-primary/5">
                    <CardContent className="pt-6">
                      <div className="flex gap-3">
                        <Quote className="h-6 w-6 text-primary shrink-0" />
                        <p className="text-lg font-medium">{widerstaende.kernbotschaft}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CollapsibleContent>
            </section>
          </Collapsible>

          <Separator />

          {/* ========== Section 5: Projektmanagement ========== */}
          <Collapsible
            open={openSections["projektmanagement"]}
            onOpenChange={(open) => toggleSection("projektmanagement", open)}
          >
            <section id="projektmanagement" className="scroll-mt-16 md:scroll-mt-20">
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full text-left group mb-4">
                  <h2 className="text-2xl font-bold">Projektmanagement</h2>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-muted-foreground transition-transform",
                      openSections["projektmanagement"] && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-6">
                  {/* Zitat */}
                  <Card className="border-2 border-primary/50 bg-primary/5">
                    <CardContent className="pt-6">
                      <div className="flex gap-3">
                        <Quote className="h-6 w-6 text-primary shrink-0" />
                        <p className="text-xl font-medium italic">&ldquo;{projektmanagement.zitat}&rdquo;</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Definition */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Was ist ein Projekt?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{projektmanagement.definition}</p>
                    </CardContent>
                  </Card>

                  {/* Aufgaben PM */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Aufgaben des Projektmanagers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {projektmanagement.aufgaben.map((aufgabe, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-1" />
                            <span className="text-muted-foreground">{aufgabe}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex items-start gap-3 mt-6 p-4 rounded-lg bg-muted/50">
                        <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground italic">{projektmanagement.hinweis}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* PM ↔ CRISP-DM Tabelle */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Verbindung: PM-Phasen ↔ CRISP-DM</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>PM-Phase</TableHead>
                            <TableHead>CRISP-DM</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {projektmanagement.pmCrispDm.map((row, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{row.pmPhase}</TableCell>
                              <TableCell>{row.crispDm}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              </CollapsibleContent>
            </section>
          </Collapsible>

        </div>

        {/* Sticky ToC Sidebar */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
              Inhalt
            </p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  "block text-sm py-1.5 px-2 rounded transition-colors",
                  activeSection === s.id
                    ? "text-primary font-medium bg-orange-50"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => {
                  // Open section when clicking ToC link
                  if (!openSections[s.id]) {
                    toggleSection(s.id, true);
                  }
                }}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>
      </div>

      {/* CTA to Tutor */}
      <div className="mt-12 text-center">
        <Button asChild size="lg">
          <Link to="/tutor">
            Weiter zum Tutor
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 z-50 shadow-lg"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
