// CRISP-DM Stepper component
import { CrispDmPhase, CrispDmPhaseId } from '@/engine/types';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Play } from 'lucide-react';
import {
  Briefcase,
  Database,
  Settings2,
  Brain,
  BarChart3,
  Rocket,
} from 'lucide-react';

interface CrispDmStepperProps {
  phases: CrispDmPhase[];
  currentPhase: CrispDmPhaseId;
  onPhaseClick: (phaseId: CrispDmPhaseId) => void;
  orientation?: 'horizontal' | 'vertical';
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
}: CrispDmStepperProps) {
  const isVertical = orientation === 'vertical';

  return (
    <div
      className={cn(
        'flex',
        isVertical ? 'flex-col gap-2' : 'flex-row items-center gap-1 overflow-x-auto pb-2'
      )}
    >
      {phases.map((phase, index) => {
        const Icon = phaseIcons[phase.id];
        const isActive = phase.id === currentPhase;
        const isCompleted = phase.status === 'completed';
        const isInProgress = phase.status === 'in-progress';
        const isLast = index === phases.length - 1;

        return (
          <div
            key={phase.id}
            className={cn(
              'flex',
              isVertical ? 'flex-row items-start' : 'flex-col items-center'
            )}
          >
            {/* Step Button */}
            <button
              onClick={() => onPhaseClick(phase.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-left',
                isVertical ? 'flex-row w-full' : 'flex-col min-w-[100px]',
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
                ) : isInProgress && !isActive ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <div className={cn(isVertical ? 'flex-1' : 'text-center')}>
                <p
                  className={cn(
                    'text-sm font-medium',
                    !isVertical && 'whitespace-nowrap'
                  )}
                >
                  {phase.shortName}
                </p>
                {isVertical && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {phase.description}
                  </p>
                )}
              </div>
            </button>

            {/* Connector */}
            {!isLast && (
              <div
                className={cn(
                  'flex-shrink-0',
                  isVertical
                    ? 'w-8 flex justify-center py-1'
                    : 'h-8 flex items-center px-1'
                )}
              >
                <div
                  className={cn(
                    'bg-border',
                    isVertical ? 'w-px h-4' : 'h-px w-4',
                    index < phases.findIndex((p) => p.id === currentPhase) &&
                      'bg-primary'
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
