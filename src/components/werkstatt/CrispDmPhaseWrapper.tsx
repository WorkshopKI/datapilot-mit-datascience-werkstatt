// CRISP-DM Phase Wrapper - Container with tutor hints
import { ReactNode } from 'react';
import { PhaseGuidance, TutorHint } from '@/engine/tutor/TutorService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { GlossaryLink } from './GlossaryLink';
import {
  Lightbulb, AlertTriangle, Info, ChevronRight, Target,
  Briefcase, Database, Settings2, Brain, BarChart3, Rocket,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrispDmPhaseWrapperProps {
  guidance: PhaseGuidance;
  hints: TutorHint[];
  children: ReactNode;
  showTutorPanel?: boolean;
  stepper?: ReactNode;
}

const hintIcons = {
  tip: Lightbulb,
  warning: AlertTriangle,
  info: Info,
};

const PHASE_META: Record<string, { de: string; en: string; num: number; icon: typeof Briefcase }> = {
  'business-understanding': { de: 'Geschäftsverständnis', en: 'Business Understanding', num: 1, icon: Briefcase },
  'data-understanding':     { de: 'Datenverständnis',     en: 'Data Understanding',     num: 2, icon: Database },
  'data-preparation':       { de: 'Datenvorbereitung',    en: 'Data Preparation',        num: 3, icon: Settings2 },
  'modeling':               { de: 'Modellierung',         en: 'Modeling',                 num: 4, icon: Brain },
  'evaluation':             { de: 'Bewertung',            en: 'Evaluation',               num: 5, icon: BarChart3 },
  'deployment':             { de: 'Bereitstellung',       en: 'Deployment',               num: 6, icon: Rocket },
};

const hintStyles = {
  tip: 'border-primary/30 bg-primary/5',
  warning: 'border-orange-500/30 bg-orange-50 dark:bg-orange-950/20',
  info: 'border-blue-500/30 bg-blue-50 dark:bg-blue-950/20',
};

export function CrispDmPhaseWrapper({
  guidance,
  hints,
  children,
  showTutorPanel = true,
  stepper,
}: CrispDmPhaseWrapperProps) {
  return (
    <div className="grid lg:grid-cols-[1fr,320px] gap-4">
      {/* Stepper – left column only */}
      {stepper && (
        <div className="overflow-x-auto lg:col-start-1">
          {stepper}
        </div>
      )}

      {/* Main Content – left column */}
      <div className="space-y-6 lg:col-start-1">
        {/* Phase Header */}
        {(() => {
          const meta = PHASE_META[guidance.phaseId];
          const PhaseIcon = meta?.icon ?? Info;
          return (
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <PhaseIcon className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">
                    Phase {meta?.num} · {meta?.en}
                  </span>
                  <h2 className="text-lg font-semibold">{meta?.de}</h2>
                </div>
              </div>
              <p className="text-muted-foreground mt-2">{guidance.introduction}</p>
            </div>
          );
        })()}

        {/* Objectives */}
        <Card className="bg-gradient-to-r from-orange-50/50 to-transparent border-orange-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Ziele dieser Phase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {guidance.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="h-5 w-5 p-0 justify-center shrink-0 text-xs">
                    {index + 1}
                  </Badge>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Phase Content */}
        {children}
      </div>

      {/* Tutor Panel – right column, starts at main content row */}
      {showTutorPanel && (
        <aside className={cn("space-y-4 lg:col-start-2", stepper && "lg:row-start-2")}>
          <div className="sticky top-4 space-y-4">
            {/* Hints */}
            {hints.map((hint) => {
              const HintIcon = hintIcons[hint.priority];
              return (
                <Alert key={hint.id} className={cn(hintStyles[hint.priority])}>
                  <HintIcon className="h-4 w-4" />
                  <AlertTitle className="text-sm font-medium">{hint.title}</AlertTitle>
                  <AlertDescription className="text-sm mt-1">
                    {hint.content}
                    {hint.glossaryTerms.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {hint.glossaryTerms.map((term) => (
                          <GlossaryLink key={term} term={term} className="text-xs" />
                        ))}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              );
            })}

            {/* Next Steps */}
            <Card className="border-l-4 border-l-primary/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Nächste Schritte</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {guidance.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="h-5 w-5 p-0 justify-center shrink-0">
                        {index + 1}
                      </Badge>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </aside>
      )}
    </div>
  );
}
