import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Gamepad2, CheckCircle } from "lucide-react";
import { CrispDMQuiz } from "@/components/quiz/CrispDMQuiz";
import { RollenQuiz } from "@/components/quiz/RollenQuiz";

export default function Quiz() {
  const [showRollenHint, setShowRollenHint] = useState(false);

  return (
    <div className="container mx-auto px-4 py-3 md:py-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-3">
        <Gamepad2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
        <h1 className="text-2xl md:text-3xl font-bold">Teste dein Wissen</h1>
      </div>
      <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-6">
        Zwei interaktive Quizze zu CRISP-DM und Projektrollen.
      </p>

      {/* CRISP-DM Quiz */}
      <section className="mb-4 md:mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
            1
          </span>
          <div>
            <h2 className="text-lg font-semibold">CRISP-DM Quiz</h2>
            <p className="text-xs text-muted-foreground">Lerne die Grundlagen</p>
          </div>
        </div>
        <CrispDMQuiz onComplete={() => setShowRollenHint(true)} />
        
        {showRollenHint && (
          <div className="flex items-center gap-2 text-sm text-primary mt-3">
            <CheckCircle className="h-4 w-4" />
            <span>Super! Weiter zum Rollen-Quiz ↓</span>
          </div>
        )}
      </section>

      <Separator className="my-4 md:my-6" />

      {/* Rollen Quiz */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">
            2
          </span>
          <div>
            <h2 className="text-lg font-semibold">Rollen-Quiz</h2>
            <p className="text-xs text-muted-foreground">Wende dein Wissen an</p>
          </div>
        </div>
        <RollenQuiz />
      </section>
    </div>
  );
}
