import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TutorService } from '@/engine/tutor/TutorService';
import { SHORT_LABELS } from './stepTypes';
import type { WorkspaceProject, PipelineStepType, PreparedDataSummary } from '@/engine/types';

export function RecommendedPathCard({
  projectType,
  appliedStepTypes,
  dataSummary,
}: {
  projectType: WorkspaceProject['type'];
  appliedStepTypes: PipelineStepType[];
  dataSummary: PreparedDataSummary | null;
}) {
  const recommendations = TutorService.getPipelineRecommendations(projectType);
  if (recommendations.length === 0) return null;

  const isStepNeeded = (stepType: PipelineStepType): boolean => {
    if (!dataSummary) return true;
    if (stepType === 'missing-values') return dataSummary.missingValueCount > 0;
    if (stepType === 'encoding') return dataSummary.categoricalColumns.length > 0;
    return true;
  };

  const neededSteps = recommendations.filter(r => !r.optional && isStepNeeded(r.stepType));
  const doneCount = neededSteps.filter(r => appliedStepTypes.includes(r.stepType)).length;

  if (neededSteps.length > 0 && doneCount >= neededSteps.length) return null;

  const firstUndone = neededSteps.find(r => !appliedStepTypes.includes(r.stepType))?.stepType;

  return (
    <div className="flex flex-wrap items-center gap-2 px-1">
      <Lightbulb className="h-4 w-4 text-blue-600 shrink-0" />
      <span className="text-xs font-medium text-blue-700 mr-1">Empfohlener Pfad</span>

      <div className="flex items-center gap-0">
        {neededSteps.map((rec, index) => {
          const isDone = appliedStepTypes.includes(rec.stepType);
          const isNext = rec.stepType === firstUndone;

          return (
            <div key={rec.stepType} className="flex items-center">
              {index > 0 && (
                <div className={cn(
                  'w-4 h-0.5 shrink-0',
                  isDone ? 'bg-green-400' : 'bg-gray-200'
                )} />
              )}
              <div className="flex items-center gap-1.5">
                {isDone ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                ) : isNext ? (
                  <div className="h-4 w-4 rounded-full border-2 border-orange-400 bg-orange-50 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <span className={cn(
                  'text-xs whitespace-nowrap',
                  isDone ? 'text-muted-foreground line-through' : isNext ? 'font-medium text-orange-700' : 'text-muted-foreground'
                )}>
                  {SHORT_LABELS[rec.stepType]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <Badge variant="outline" className="text-xs ml-auto bg-white">
        {doneCount}/{neededSteps.length} erledigt
      </Badge>
    </div>
  );
}
