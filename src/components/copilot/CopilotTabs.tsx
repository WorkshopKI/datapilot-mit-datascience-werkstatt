import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const copilotTabs = [
  { id: "uebersicht", label: "Übersicht", shortLabel: "Start", path: "/ki-assistenten/copilot" },
  { id: "was-kann", label: "Was kann der KI Copilot?", shortLabel: "Features", path: "/ki-assistenten/copilot/faehigkeiten" },
  { id: "phasen", label: "Phasen", shortLabel: "Phasen", path: "/ki-assistenten/copilot/phasen" },
  { id: "befehle", label: "Befehle", shortLabel: "Befehle", path: "/ki-assistenten/copilot/befehle" },
  { id: "beispiel", label: "Beispiel-Dialog", shortLabel: "Beispiel", path: "/ki-assistenten/copilot/beispiel" },
];

interface CopilotTabsProps {
  activeTab: "uebersicht" | "was-kann" | "phasen" | "befehle" | "beispiel";
}

export function CopilotTabs({ activeTab }: CopilotTabsProps) {
  return (
    <nav className="flex gap-2 mb-6 border-b border-border pb-2 overflow-x-auto">
      {copilotTabs.map((tab) => (
        <Link
          key={tab.id}
          to={tab.path}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
            activeTab === tab.id
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <span className="sm:hidden">{tab.shortLabel}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </Link>
      ))}
    </nav>
  );
}
