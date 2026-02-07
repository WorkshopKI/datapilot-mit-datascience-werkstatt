import { cn } from "@/lib/utils";
import { Search, MessageSquare } from "lucide-react";

type Mode = "schnell" | "stakeholder";

interface ModeToggleProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <button
        onClick={() => onChange("schnell")}
        className={cn(
          "p-4 rounded-lg border-2 text-left transition-all",
          mode === "schnell"
            ? "border-primary bg-primary/5"
            : "border-muted hover:border-primary/50"
        )}
      >
        <Search className="h-6 w-6 text-primary mb-2" />
        <div className="font-semibold">Schnell nachschlagen</div>
        <div className="text-sm text-muted-foreground">
          Alphabetische Liste, kurze Definitionen
        </div>
      </button>

      <button
        onClick={() => onChange("stakeholder")}
        className={cn(
          "p-4 rounded-lg border-2 text-left transition-all",
          mode === "stakeholder"
            ? "border-primary bg-primary/5"
            : "border-muted hover:border-primary/50"
        )}
      >
        <MessageSquare className="h-6 w-6 text-primary mb-2" />
        <div className="font-semibold">Für Stakeholder</div>
        <div className="text-sm text-muted-foreground">
          Mit Kategorien, Beispielen und Präsentationstexten
        </div>
      </button>
    </div>
  );
}
