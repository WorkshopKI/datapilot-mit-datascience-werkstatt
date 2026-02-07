import { Wrench } from "lucide-react";
import { DecisionHelper } from "@/components/referenz/DecisionHelper";

export default function ProblemDiagnose() {
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Wrench className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Problem diagnostizieren</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          „Was tun, wenn..." – interaktive Entscheidungshilfe für typische Projektprobleme.
        </p>
      </div>

      <DecisionHelper />
    </div>
  );
}
