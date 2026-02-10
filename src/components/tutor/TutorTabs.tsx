import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const tutorTabs = [
  { id: "uebersicht", label: "Übersicht", shortLabel: "Start", path: "/ki-assistenten/tutor" },
  { id: "was-kann", label: "Was kann der KI Tutor?", shortLabel: "Features", path: "/ki-assistenten/tutor/uebersicht" },
  { id: "phasen", label: "Phasen", shortLabel: "Phasen", path: "/ki-assistenten/tutor/phasen" },
  { id: "befehle", label: "Befehle", shortLabel: "Befehle", path: "/ki-assistenten/tutor/befehle" },
  { id: "beispiel", label: "Beispiel-Dialog", shortLabel: "Beispiel", path: "/ki-assistenten/tutor/beispiel" },
  { id: "modus", label: "Einzel & Team", shortLabel: "Modus", path: "/ki-assistenten/tutor/modus" },
  { id: "starten", label: "Tutor starten", shortLabel: "Starten", path: "/ki-assistenten/tutor/starten" },
];

interface TutorTabsProps {
  activeTab: "uebersicht" | "was-kann" | "phasen" | "befehle" | "beispiel" | "modus" | "starten";
}

export function TutorTabs({ activeTab }: TutorTabsProps) {
  return (
    <nav className="flex gap-2 mb-6 border-b border-border pb-2 overflow-x-auto">
      {tutorTabs.map((tab) => (
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
