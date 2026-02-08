// CRISP-DM Stepper component
import { CrispDmPhase, CrispDmPhaseId } from '@/engine/types';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  Briefcase,
  Database,
  Settings2,
  Brain,
  BarChart3,
  Rocket,
  AlertTriangle,
} from 'lucide-react';

interface CrispDmStepperProps {
  phases: CrispDmPhase[];
  currentPhase: CrispDmPhaseId;
  onPhaseClick: (phaseId: CrispDmPhaseId) => void;
  orientation?: 'horizontal' | 'vertical';
  phaseWarnings?: Partial<Record<CrispDmPhaseId, string>>;
}

const phaseIcons: Record<CrispDmPhaseId, typeof Briefcase> = {
  'business-understanding': Briefcase,
  'data-understanding': Database,
  'data-preparation': Settings2,
  'modeling': Brain,
  'evaluation': BarChart3,
  'deployment': Rocket,
};

export function CrispDmStepper({
  phases,
  currentPhase,
  onPhaseClick,
  orientation = 'horizontal',
  phaseWarnings,
}: CrispDmStepperProps) {
  const isVertical = orientation === 'vertical';
  const activeIndex = phases.findIndex((p) => p.id === currentPhase);

  if (isVertical) {
    return (
      <div className="flex flex-col gap-2">
        {phases.map((phase, index) => {
          const Icon = phaseIcons[phase.id];
          const isActive = phase.id === currentPhase;
          const isCompleted = phase.status === 'completed';
          const isLast = index === phases.length - 1;
          const isPast = index < activeIndex;

          return (
            <div key={phase.id} className="flex flex-row items-start">
              <button
                onClick={() => onPhaseClick(phase.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left flex-row w-full',
                  isActive && 'bg-primary text-primary-foreground',
                  !isActive && isCompleted && 'bg-primary/10 text-primary hover:bg-primary/20',
                  !isActive && !isCompleted && 'hover:bg-muted'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full',
                    isActive && 'bg-primary-foreground/20',
                    !isActive && isCompleted && 'bg-primary/20',
                    !isActive && !isCompleted && 'bg-muted'
                  )}
                >
                  {isCompleted && !isActive ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{phase.shortName}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {phase.description}
                  </p>
                </div>
              </button>

              {!isLast && (
                <div className="w-8 flex justify-center py-1 flex-shrink-0">
                  <div
                    className={cn(
                      'w-px h-4',
                      isPast ? 'bg-primary' : 'bg-border'
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal layout with progress-line track
  return (
    <div className="flex items-start overflow-x-auto pb-2">
      {phases.map((phase, index) => {
        const Icon = phaseIcons[phase.id];
        const isActive = phase.id === currentPhase;
        const isCompleted = phase.status === 'completed';
        const isLast = index === phases.length - 1;
        const isPast = index < activeIndex;

        const warning = phaseWarnings?.[phase.id];
        const hasWarning = !!warning && !isCompleted;

        return (
          <div
            key={phase.id}
            className={cn(
              'flex flex-col items-center relative',
              isLast ? 'flex-initial' : 'flex-1'
            )}
          >
            {/* Connector line — left half */}
            {index > 0 && (
              <div
                className={cn(
                  'absolute top-[28px] right-1/2 w-1/2 h-0.5',
                  isPast || isActive ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
            {/* Connector line — right half */}
            {!isLast && (
              <div
                className={cn(
                  'absolute top-[28px] left-1/2 w-1/2 h-0.5',
                  isPast ? 'bg-primary' : 'bg-border'
                )}
              />
            )}

            {/* Step button */}
            <button
              onClick={() => onPhaseClick(phase.id)}
              className="relative z-10 flex flex-col items-center gap-2 group"
              title={hasWarning ? warning : undefined}
            >
              <div
                className={cn(
                  'w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all',
                  isActive && 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/25',
                  !isActive && isCompleted && 'bg-orange-50 border-primary text-primary',
                  !isActive && !isCompleted && hasWarning && 'bg-background border-amber-400 text-amber-600 ring-2 ring-amber-200 group-hover:border-amber-500',
                  !isActive && !isCompleted && !hasWarning && 'bg-background border-muted-foreground/25 text-muted-foreground group-hover:border-primary/50'
                )}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : hasWarning && !isActive ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}
              </div>
              <span
                className={cn(
                  'text-[13px] font-medium whitespace-nowrap transition-colors',
                  isActive && 'text-primary font-semibold',
                  !isActive && isCompleted && 'text-primary',
                  !isActive && !isCompleted && hasWarning && 'text-amber-600',
                  !isActive && !isCompleted && !hasWarning && 'text-muted-foreground'
                )}
              >
                {phase.shortName}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
