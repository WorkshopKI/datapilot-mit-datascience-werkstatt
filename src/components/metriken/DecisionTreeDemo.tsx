import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, TreeDeciduous, Target, Users, Ship } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TreeVisualization } from "./TreeVisualization";
interface TreeNode {
  id: string;
  question?: string;
  options?: Array<{
    text: string;
    nextId: string;
  }>;
  result?: {
    prediction: string;
    probability: number;
    survived: boolean;
    explanation: string;
  };
}

const titanicTree: TreeNode[] = [
  {
    id: "start",
    question: "Ist der Passagier männlich oder weiblich?",
    options: [
      { text: "Männlich", nextId: "male" },
      { text: "Weiblich", nextId: "female" }
    ]
  },
  {
    id: "male",
    question: "Ist der Passagier erwachsen (≥ 18 Jahre)?",
    options: [
      { text: "Ja, erwachsen", nextId: "male-adult" },
      { text: "Nein, Kind", nextId: "male-child" }
    ]
  },
  {
    id: "female",
    question: "In welcher Klasse reiste die Passagierin?",
    options: [
      { text: "1. oder 2. Klasse", nextId: "female-upper" },
      { text: "3. Klasse", nextId: "female-third" }
    ]
  },
  {
    id: "male-adult",
    result: {
      prediction: "Nicht überlebt",
      probability: 17,
      survived: false,
      explanation: "Erwachsene Männer hatten die niedrigste Überlebensrate. Bei der Evakuierung galt 'Frauen und Kinder zuerst'."
    }
  },
  {
    id: "male-child",
    result: {
      prediction: "Unsicher (leichte Tendenz zum Überleben)",
      probability: 45,
      survived: true,
      explanation: "Jungen hatten bessere Chancen als erwachsene Männer, da Kinder bei der Rettung bevorzugt wurden."
    }
  },
  {
    id: "female-upper",
    result: {
      prediction: "Überlebt",
      probability: 93,
      survived: true,
      explanation: "Frauen der 1. und 2. Klasse hatten die höchste Überlebensrate. Sie wurden bei der Evakuierung priorisiert und hatten besseren Zugang zu Rettungsbooten."
    }
  },
  {
    id: "female-third",
    result: {
      prediction: "Unsicher (50/50)",
      probability: 50,
      survived: true,
      explanation: "Frauen der 3. Klasse hatten zwar den Vorteil ihres Geschlechts, aber schlechteren Zugang zu den Rettungsbooten auf den oberen Decks."
    }
  }
];

function getNode(id: string): TreeNode | undefined {
  return titanicTree.find(node => node.id === id);
}

function getDepth(nodeId: string): number {
  if (nodeId === "start") return 1;
  if (nodeId === "male" || nodeId === "female") return 2;
  return 3;
}

function getMaxDepth(): number {
  return 3;
}

export function DecisionTreeDemo() {
  const [currentNodeId, setCurrentNodeId] = useState("start");
  const [path, setPath] = useState<string[]>([]);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);

  const currentNode = getNode(currentNodeId);
  const isResult = !!currentNode?.result;
  const currentDepth = getDepth(currentNodeId);
  const progress = (currentDepth / getMaxDepth()) * 100;

  const handleSelectOption = (optionText: string, nextNodeId: string) => {
    setVisitedNodes([...visitedNodes, currentNodeId]);
    setPath([...path, optionText]);
    setCurrentNodeId(nextNodeId);
  };

  const handleReset = () => {
    setCurrentNodeId("start");
    setPath([]);
    setVisitedNodes([]);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Titanic: Wer überlebt?</CardTitle>
          </div>
          {path.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Neu starten
            </Button>
          )}
        </div>
        <CardDescription>
          Beantworte die Fragen und sieh, wie ein Entscheidungsbaum die Überlebenschance vorhersagt.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Schritt {currentDepth} von {getMaxDepth()}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Path Breadcrumb */}
        {path.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center text-sm">
            <TreeDeciduous className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Pfad:</span>
            {path.map((step, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {step}
              </Badge>
            ))}
          </div>
        )}

        {/* Tree Visualization */}
        <TreeVisualization currentNodeId={currentNodeId} visitedNodes={visitedNodes} />

        {/* Question Node */}
        {currentNode?.question && (
          <div className="space-y-3 pt-2">
            <p className="font-medium text-base">{currentNode.question}</p>
            <div className="grid grid-cols-2 gap-2">
              {currentNode.options?.map((option) => (
                <Button
                  key={option.nextId}
                  variant="outline"
                  className="h-auto py-3 text-left justify-start"
                  onClick={() => handleSelectOption(option.text, option.nextId)}
                >
                  {option.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Result Node */}
        {currentNode?.result && (
          <div className="space-y-4 pt-2">
            <div className={`p-4 rounded-lg border-2 ${
              currentNode.result.survived 
                ? "border-green-500/50 bg-green-500/10" 
                : "border-red-500/50 bg-red-500/10"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5" />
                <span className="font-semibold">Vorhersage: {currentNode.result.prediction}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Überlebenswahrscheinlichkeit</span>
                  <span className="font-bold">{currentNode.result.probability}%</span>
                </div>
                <Progress 
                  value={currentNode.result.probability} 
                  className={`h-3 ${currentNode.result.survived ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`}
                />
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Erklärung:</strong> {currentNode.result.explanation}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Basierend auf historischen Titanic-Passagierdaten (1912)</span>
            </div>

            <Button onClick={handleReset} className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Anderen Passagier testen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
