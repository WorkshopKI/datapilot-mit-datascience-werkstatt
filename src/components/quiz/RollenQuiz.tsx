import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { quizRollen, rollenQuizSzenarien } from "@/data/content";
import { 
  RotateCcw, 
  RefreshCw, 
  Quote,
  CheckCircle,
  XCircle,
  Trophy,
  Search,
  Package,
  Settings,
  ArrowLeft,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

type RollenQuizState = "selecting" | "playing" | "answered" | "finished";

// Icon mapping for scenarios
const scenarioIcons: Record<string, LucideIcon> = {
  "RefreshCw": RefreshCw,
  "Search": Search,
  "Package": Package,
  "Settings": Settings
};

export function RollenQuiz() {
  const [quizState, setQuizState] = useState<RollenQuizState>("selecting");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const currentScenario = useMemo(
    () => rollenQuizSzenarien.find(s => s.id === selectedScenarioId),
    [selectedScenarioId]
  );
  
  const currentQuestion = currentScenario?.fragen[currentIndex];
  const totalQuestions = currentScenario?.fragen.length || 5;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isCorrect = selectedAnswer === currentQuestion?.richtig;

  const handleSelectScenario = useCallback((scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setQuizState("playing");
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
  }, []);

  const handleAnswer = useCallback((rolle: string) => {
    if (quizState !== "playing" || !currentQuestion) return;
    setSelectedAnswer(rolle);
    setQuizState("answered");
    if (rolle === currentQuestion.richtig) {
      setScore((prev) => prev + 1);
    }
  }, [quizState, currentQuestion]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setQuizState("playing");
      setSelectedAnswer(null);
    } else {
      setQuizState("finished");
    }
  }, [currentIndex, totalQuestions]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setScore(0);
    setQuizState("playing");
    setSelectedAnswer(null);
  }, []);

  const handleChangeScenario = useCallback(() => {
    setQuizState("selecting");
    setSelectedScenarioId(null);
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
  }, []);

  // Scenario Selection Screen
  if (quizState === "selecting") {
    return (
      <div>
        <p className="text-sm text-muted-foreground mb-3">
          Wer sagt was? Wähle ein Szenario:
        </p>
        
        <div className="space-y-2">
          {rollenQuizSzenarien.map((szenario) => {
            const IconComponent = scenarioIcons[szenario.icon] || RefreshCw;
            return (
              <Card 
                key={szenario.id}
                className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
                onClick={() => handleSelectScenario(szenario.id)}
              >
                <CardContent className="py-2.5 px-3">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
                      <IconComponent className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm flex items-center gap-2 flex-wrap">
                        {szenario.name}
                        {szenario.empfohlen && (
                          <Badge variant="secondary" className="text-xs py-0">Empfohlen</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{szenario.kontext}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Finished Screen
  if (quizState === "finished" && currentScenario) {
    const percentage = Math.round((score / totalQuestions) * 100);
    return (
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Quiz abgeschlossen!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Szenario: {currentScenario.name}
          </p>
          <div className="text-4xl font-bold text-primary">
            {score} von {totalQuestions}
          </div>
          <p className="text-muted-foreground">
            {percentage >= 80
              ? "Ausgezeichnet! Du kennst die Rollen sehr gut."
              : percentage >= 60
              ? "Gut gemacht! Du hast ein solides Verständnis."
              : "Weiter üben! Die Rollen werden dir mit der Zeit vertrauter."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={handleChangeScenario} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Anderes Szenario
            </Button>
            <Button onClick={handleRestart} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Nochmal spielen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Playing / Answered Screen
  if (!currentScenario || !currentQuestion) return null;

  return (
    <div>
      {/* Scenario Header */}
      <div className="flex items-center gap-2 mb-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleChangeScenario}
          className="gap-1 text-muted-foreground hover:text-foreground h-7 px-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Zurück
        </Button>
        <span className="text-muted-foreground text-sm">|</span>
        <span className="text-sm font-medium">{currentScenario.name}</span>
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Frage {currentIndex + 1}/{totalQuestions}</span>
          <span>Score: {score}</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      {/* Quote Card */}
      <Card className="mb-3 border-2 border-primary/20">
        <CardContent className="py-3 px-3">
          <div className="flex items-start gap-3">
            <Quote className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">„{currentQuestion.zitat}"</p>
          </div>
        </CardContent>
      </Card>

      {/* Answer Buttons */}
      <p className="text-xs text-muted-foreground mb-2">Wer sagt das?</p>
      <div className="grid gap-1.5 mb-3">
        {quizRollen.map((rolle) => {
          const isSelected = selectedAnswer === rolle;
          const isCorrectAnswer = rolle === currentQuestion.richtig;
          const showResult = quizState === "answered";

          return (
            <Button
              key={rolle}
              variant="outline"
              size="sm"
              className={cn(
                "h-auto py-2 px-3 justify-start text-left transition-all text-sm",
                showResult && isCorrectAnswer && "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400",
                showResult && isSelected && !isCorrectAnswer && "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400",
                !showResult && "hover:border-primary hover:bg-primary/5"
              )}
              onClick={() => handleAnswer(rolle)}
              disabled={quizState === "answered"}
            >
              <span className="flex items-center gap-1.5">
                {showResult && isCorrectAnswer && <CheckCircle className="h-4 w-4 shrink-0" />}
                {showResult && isSelected && !isCorrectAnswer && <XCircle className="h-4 w-4 shrink-0" />}
                {rolle}
              </span>
            </Button>
          );
        })}
      </div>

      {/* Feedback */}
      {quizState === "answered" && (
        <Card className={cn(
          "mb-3",
          isCorrect ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "border-red-500 bg-red-50 dark:bg-red-950/30"
        )}>
          <CardContent className="py-2.5 px-3">
            <div className="flex items-start gap-2">
              {isCorrect ? (
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className={cn(
                  "font-medium text-sm mb-1",
                  isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                )}>
                  {isCorrect ? "Richtig!" : `Falsch – ${currentQuestion.richtig}`}
                </p>
                <p className="text-xs text-muted-foreground">{currentQuestion.erklaerung}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Button */}
      {quizState === "answered" && (
        <div className="flex justify-end">
          <Button size="sm" onClick={handleNext}>
            {currentIndex < totalQuestions - 1 ? "Weiter" : "Ergebnis"}
          </Button>
        </div>
      )}
    </div>
  );
}
