import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check, MessageCircle } from "lucide-react";
import { phaseQuestions, allPhases, allRoles, getQuestionsForPhaseAndRole, type Phase, type Role } from "@/data/interviewQuestionsData";
import { useToast } from "@/hooks/use-toast";
import { getRoleIcon } from "@/data/icons";

export default function InterviewQuestions() {
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [copiedCategory, setCopiedCategory] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopyCategory = async (categoryName: string, questions: string[]) => {
    const text = `## ${categoryName}\n\n${questions.map((q) => `- ${q}`).join("\n")}`;
    await navigator.clipboard.writeText(text);
    setCopiedCategory(categoryName);
    toast({ title: "Kopiert!", description: `${questions.length} Fragen kopiert.` });
    setTimeout(() => setCopiedCategory(null), 2000);
  };

  const getAvailableRoles = (): Role[] => {
    if (!selectedPhase) return [];
    const phaseData = phaseQuestions.find((p) => p.phase === selectedPhase);
    return phaseData ? phaseData.roles.map((r) => r.role) : [];
  };

  const result = selectedPhase && selectedRole ? getQuestionsForPhaseAndRole(selectedPhase, selectedRole) : null;
  const availableRoles = getAvailableRoles();

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">

      <div className="mb-4 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Interview-Fragen</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Fragen für Stakeholder-Gespräche nach Phase und Rolle.
        </p>
      </div>

      {/* Phase Filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Phase wählen</h3>
        <div className="flex flex-wrap gap-2">
          {allPhases.map((p) => (
            <Badge
              key={p.phase}
              variant={selectedPhase === p.phase ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => {
                setSelectedPhase(p.phase);
                setSelectedRole(null);
              }}
            >
              {p.phaseNumber}. {p.phaseName}
            </Badge>
          ))}
        </div>
      </div>

      {/* Role Filter */}
      {selectedPhase && (
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Rolle wählen</h3>
          <div className="flex flex-wrap gap-2">
            {allRoles
              .filter((r) => availableRoles.includes(r.role))
              .map((r) => {
                const Icon = getRoleIcon(r.role);
                return (
                  <Badge
                    key={r.role}
                    variant={selectedRole === r.role ? "default" : "outline"}
                    className="cursor-pointer flex items-center gap-1"
                    onClick={() => setSelectedRole(r.role)}
                  >
                    <Icon className="h-3 w-3" />
                    {r.roleName}
                  </Badge>
                );
              })}
          </div>
        </div>
      )}

      {/* Questions */}
      {result ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            {(() => {
              const Icon = getRoleIcon(selectedRole!);
              return <Icon className="h-6 w-6 text-primary" />;
            })()}
            <h2 className="text-xl font-semibold">{result.roleName}</h2>
          </div>
          {result.categories.map((cat) => (
            <Card key={cat.name}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{cat.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyCategory(cat.name, cat.questions)}
                  >
                    {copiedCategory === cat.name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {cat.questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary">→</span>
                      {q}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/30">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {!selectedPhase
                ? "Wähle eine Phase, um relevante Fragen zu sehen."
                : "Wähle eine Rolle, um die Fragen anzuzeigen."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
