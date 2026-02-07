import { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { crispDmPhasen } from "@/data/content";
import { 
  GripVertical, 
  Check, 
  X, 
  RotateCcw, 
  Eye, 
  RefreshCw, 
  PartyPopper
} from "lucide-react";
import { cn } from "@/lib/utils";

type CrispPhase = {
  id: number;
  name: string;
};

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface CrispDMQuizProps {
  onComplete?: () => void;
}

export function CrispDMQuiz({ onComplete }: CrispDMQuizProps) {
  const initialPhases: CrispPhase[] = useMemo(
    () => crispDmPhasen.map((p) => ({ id: p.id, name: p.name })),
    []
  );

  const [phases, setPhases] = useState<CrispPhase[]>(() => shuffleArray(initialPhases));
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const isCorrectPosition = useCallback(
    (index: number) => phases[index].id === index + 1,
    [phases]
  );

  const allCorrect = useMemo(
    () => phases.every((phase, index) => phase.id === index + 1),
    [phases]
  );

  const handleCardClick = (index: number) => {
    if (isChecked || showSolution) return;
    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      const newPhases = [...phases];
      [newPhases[selectedIndex], newPhases[index]] = [newPhases[index], newPhases[selectedIndex]];
      setPhases(newPhases);
      setSelectedIndex(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isChecked || showSolution) return;
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (isChecked || showSolution) return;
    const dragIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (dragIndex === dropIndex) return;
    const newPhases = [...phases];
    [newPhases[dragIndex], newPhases[dropIndex]] = [newPhases[dropIndex], newPhases[dragIndex]];
    setPhases(newPhases);
    setSelectedIndex(null);
  };

  const handleCheck = () => {
    setIsChecked(true);
    setSelectedIndex(null);
    // Check if all correct and trigger callback
    const allPhasesCorrect = phases.every((phase, index) => phase.id === index + 1);
    if (allPhasesCorrect && onComplete) {
      onComplete();
    }
  };

  const handleShowSolution = () => {
    setShowSolution(true);
    setPhases(initialPhases);
    setIsChecked(true);
  };

  const handleRestart = () => {
    setPhases(shuffleArray(initialPhases));
    setSelectedIndex(null);
    setIsChecked(false);
    setShowSolution(false);
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        Bringe die 6 Phasen in die richtige Reihenfolge (Karten tauschen).
      </p>

      {isChecked && allCorrect && (
        <Alert className="mb-3 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30">
          <PartyPopper className="h-4 w-4 text-emerald-600" />
          <AlertDescription className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">
            🎉 Perfekt! Alle Phasen richtig!
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5 mb-3">
        {phases.map((phase, index) => {
          const correct = isCorrectPosition(index);
          const isSelected = selectedIndex === index;
          return (
            <Card
              key={phase.id}
              draggable={!isChecked && !showSolution}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => handleCardClick(index)}
              className={cn(
                "cursor-pointer transition-all select-none",
                !isChecked && !showSolution && "hover:shadow-md hover:border-primary/50",
                isSelected && "ring-2 ring-primary border-primary",
                isChecked && correct && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
                isChecked && !correct && "border-red-500 bg-red-50 dark:bg-red-950/30"
              )}
            >
              <CardContent className="py-2 px-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    <span className="text-base font-mono w-5">{index + 1}.</span>
                  </div>
                  <span className="font-medium flex-1 text-sm">{phase.name}</span>
                  {isChecked && (
                    <div className="shrink-0">
                      {correct ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <X className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {!isChecked && (
          <>
            <Button size="sm" onClick={handleCheck} className="gap-1.5">
              <Check className="h-3.5 w-3.5" />
              Überprüfen
            </Button>
            <Button size="sm" variant="outline" onClick={handleShowSolution} className="gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              Lösung
            </Button>
          </>
        )}
        {isChecked && (
          <Button size="sm" onClick={handleRestart} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Nochmal
          </Button>
        )}
      </div>

      {isChecked && (
        <Alert className="mt-4 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
            <strong>Tipp:</strong> CRISP-DM ist iterativ – Rücksprünge sind normal.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
