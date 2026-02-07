import { useProgress } from "@/hooks/useProgress";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { trackedSections } from "@/data/content";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  collapsed?: boolean;
}

export function ProgressTracker({ collapsed = false }: ProgressTrackerProps) {
  const { getProgress, isVisited } = useProgress();
  const { visited, total, percentage } = getProgress();

  const content = (
    <div className={cn("w-full", collapsed ? "px-1" : "px-3")}>
      {collapsed ? (
        <div className="flex flex-col items-center gap-1 py-2">
          <div className="text-xs font-medium text-muted-foreground">
            {visited}/{total}
          </div>
          <div className="w-2 h-16 bg-secondary rounded-full overflow-hidden">
            <div
              className="w-full bg-primary transition-all duration-300"
              style={{ height: `${percentage}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2 py-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Fortschritt</span>
            <span>{visited} von {total}</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      )}
    </div>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{content}</div>
        </TooltipTrigger>
        <TooltipContent side="right" className="w-64 p-3">
          <div className="space-y-2">
            <div className="font-medium text-sm">Lernfortschritt</div>
            <div className="text-xs text-muted-foreground mb-2">
              {visited} von {total} Abschnitten besucht ({percentage}%)
            </div>
            <div className="space-y-1">
              {trackedSections.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center gap-2 text-xs"
                >
                  {isVisited(section.id) ? (
                    <Check className="h-3 w-3 text-primary" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground/50" />
                  )}
                  <span
                    className={cn(
                      isVisited(section.id)
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {section.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-help">{content}</div>
      </TooltipTrigger>
      <TooltipContent side="right" className="w-64 p-3">
        <div className="space-y-2">
          <div className="font-medium text-sm">Besuchte Abschnitte</div>
          <div className="space-y-1">
            {trackedSections.map((section) => (
              <div
                key={section.id}
                className="flex items-center gap-2 text-xs"
              >
                {isVisited(section.id) ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground/50" />
                )}
                <span
                  className={cn(
                    isVisited(section.id)
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {section.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
