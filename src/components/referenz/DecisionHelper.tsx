import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, ExternalLink, Target, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { decisionTrees, getNode, type DecisionTree, type DecisionNode } from "@/data/decisionTreeData";
import { IconBox } from "@/components/ui/IconBox";
import { getDiagnosisTypeIcon } from "@/data/icons";

export function DecisionHelper() {
  const [selectedTree, setSelectedTree] = useState<DecisionTree | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);

  const currentNode = selectedTree && currentNodeId ? getNode(selectedTree.id, currentNodeId) : null;

  const handleSelectTree = (tree: DecisionTree) => {
    setSelectedTree(tree);
    setCurrentNodeId(tree.startNodeId);
    setPath([]);
  };

  const handleSelectOption = (optionText: string, nextNodeId: string) => {
    setPath([...path, optionText]);
    setCurrentNodeId(nextNodeId);
  };

  const handleReset = () => {
    if (selectedTree) {
      setCurrentNodeId(selectedTree.startNodeId);
      setPath([]);
    }
  };

  const handleBackToOverview = () => {
    setSelectedTree(null);
    setCurrentNodeId(null);
    setPath([]);
  };

  // Tree Selection View
  if (!selectedTree) {
    return (
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Wähle ein Problem-Thema, um zur Diagnose geführt zu werden.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {decisionTrees.map((tree) => (
            <Card
              key={tree.id}
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => handleSelectTree(tree)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <IconBox icon={getDiagnosisTypeIcon(tree.id)} size="md" />
                  {tree.title}
                </CardTitle>
                <CardDescription>{tree.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Question/Diagnosis View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleBackToOverview}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zur Übersicht
        </Button>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Nochmal starten
        </Button>
      </div>

      {/* Path Breadcrumb */}
      {path.length > 0 && (
        <div className="flex flex-wrap gap-1 items-center text-sm">
          <span className="text-muted-foreground">Pfad:</span>
          {path.map((step, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {step.length > 25 ? step.slice(0, 25) + "..." : step}
            </Badge>
          ))}
        </div>
      )}

      {/* Current Node */}
      {currentNode?.type === "question" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentNode.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {currentNode.options?.map((option) => (
              <Button
                key={option.nextNodeId}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleSelectOption(option.text, option.nextNodeId)}
              >
                {option.text}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {currentNode?.type === "diagnosis" && currentNode.diagnosis && (
        <Card className="border-2 border-primary">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-xl flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              {currentNode.diagnosis.title}
            </CardTitle>
            <CardDescription className="text-base">
              {currentNode.diagnosis.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Causes */}
            <div>
              <h4 className="font-semibold mb-2">Häufige Ursachen</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {currentNode.diagnosis.causes.map((cause, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    {cause}
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <h4 className="font-semibold mb-2">Empfohlene Schritte</h4>
              <div className="space-y-3">
                {currentNode.diagnosis.steps.map((step, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Links */}
            {currentNode.diagnosis.relatedLinks.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Weiterführende Links</h4>
                <div className="flex flex-wrap gap-2">
                  {currentNode.diagnosis.relatedLinks.map((link, i) => (
                    <Link key={i} to={link.href}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-primary/10">
                        {link.text}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
