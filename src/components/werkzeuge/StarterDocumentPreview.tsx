import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Users, Database, MessageSquare } from "lucide-react";
import { getScenarioContext, problemTypes, industries } from "@/data/canvasData";
import { getStarterContent, type Pitfall, type RoleObjection } from "@/data/starterKitData";
import { cn } from "@/lib/utils";

interface StarterDocumentPreviewProps {
  problemTypeId: string;
  industryId: string;
  projectName?: string;
}

const phaseLabels: Record<string, { name: string; number: string }> = {
  business: { name: "Business Understanding", number: "1" },
  data: { name: "Data Understanding", number: "2" },
  preparation: { name: "Data Preparation", number: "3" },
  modeling: { name: "Modeling", number: "4" },
  evaluation: { name: "Evaluation", number: "5" },
  deployment: { name: "Deployment", number: "6" },
};

export function StarterDocumentPreview({ 
  problemTypeId, 
  industryId,
  projectName 
}: StarterDocumentPreviewProps) {
  const context = getScenarioContext(problemTypeId, industryId);
  const content = getStarterContent(problemTypeId, industryId);
  const problem = problemTypes.find(p => p.id === problemTypeId);
  const industry = industries.find(i => i.id === industryId);

  if (!context || !problem || !industry) {
    return <div className="text-muted-foreground">Szenario nicht gefunden.</div>;
  }

  return (
    <div className="space-y-8 print:space-y-6">
      {/* Header */}
      <div className="text-center pb-6 border-b">
        <h1 className="text-2xl font-bold mb-2">
          {projectName || "Projekt-Starter Kit"}
        </h1>
        <div className="flex items-center justify-center gap-2 text-lg">
          <span>{problem.emoji} {problem.name}</span>
          <span className="text-muted-foreground">×</span>
          <span>{industry.emoji} {industry.name}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Erstellt am {new Date().toLocaleDateString("de-DE")}
        </p>
      </div>

      {/* Context Box */}
      <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
        <h2 className="font-semibold mb-2">📋 Kontext</h2>
        <p className="text-muted-foreground">{context.context}</p>
        <div className="flex flex-wrap gap-4 mt-3 text-sm">
          <div>
            <span className="font-medium">Typische KPIs:</span>{" "}
            <span className="text-muted-foreground">{context.typischeKPIs}</span>
          </div>
          <div>
            <span className="font-medium">Typische Intervention:</span>{" "}
            <span className="text-muted-foreground">{context.typischeIntervention}</span>
          </div>
        </div>
      </div>

      {/* Checklists per Phase */}
      <section>
        <h2 className="text-xl font-semibold mb-4">✅ Checklisten pro Phase</h2>
        <div className="space-y-6">
          {Object.entries(content.checklists).map(([phaseId, items]) => {
            const phase = phaseLabels[phaseId];
            return (
              <Card key={phaseId}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                      {phase.number}
                    </span>
                    {phase.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Checkbox id={`${phaseId}-${index}`} className="mt-0.5" />
                        <label 
                          htmlFor={`${phaseId}-${index}`}
                          className="text-sm cursor-pointer"
                        >
                          {item}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Stakeholder Questions */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Fragen an Stakeholder
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(content.stakeholderQuestions).map(([category, questions]) => (
            <Card key={category} className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {category === "business" ? "Business-Fragen" : "Daten-Fragen"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary shrink-0">→</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Data Sources */}
      {content.dataSources.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Typische Datenquellen ({industry.name})
          </h2>
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="flex flex-wrap gap-2">
                {content.dataSources.map((source, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-background border rounded-full text-sm"
                  >
                    {source}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Pitfalls */}
      {content.pitfalls.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Typische Stolperfallen ({problem.name})
          </h2>
          <div className="space-y-3">
            {content.pitfalls.map((pitfall: Pitfall, index) => (
              <div 
                key={index}
                className="bg-destructive/5 border-l-4 border-destructive p-4 rounded-r-lg"
              >
                <h3 className="font-semibold text-destructive">{pitfall.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{pitfall.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Role Objections */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          Typische Einwände nach Rolle
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {content.roleObjections.map((roleObj: RoleObjection, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{roleObj.role}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {roleObj.objections.map((obj, i) => (
                    <li key={i} className="text-muted-foreground">{obj}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Notes Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">📝 Notizen</h2>
        <Textarea 
          placeholder="Eigene Notizen hier eintragen..."
          className="min-h-[150px]"
        />
      </section>
    </div>
  );
}
