// CRISP-DM Phase Wrapper - Container with tutor hints
import { ReactNode } from 'react';
import { PhaseGuidance, TutorHint } from '@/engine/tutor/TutorService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { GlossaryLink } from './GlossaryLink';
import { Lightbulb, AlertTriangle, Info, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrispDmPhaseWrapperProps {
  guidance: PhaseGuidance;
  hints: TutorHint[];
  children: ReactNode;
  showTutorPanel?: boolean;
}

const hintIcons = {
  tip: Lightbulb,
  warning: AlertTriangle,
  info: Info,
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
}: CrispDmPhaseWrapperProps) {
  return (
    <div className="grid lg:grid-cols-[1fr,320px] gap-6">
      {/* Main Content */}
      <div className="space-y-6">
        {/* Phase Header */}
        <div>
          <h2 className="text-xl font-semibold mb-2">{guidance.phaseId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()).replace('Understanding', 'Understanding')}</h2>
          <p className="text-muted-foreground">{guidance.introduction}</p>
        </div>

        {/* Objectives */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ziele dieser Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {guidance.objectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Phase Content */}
        {children}
      </div>

      {/* Tutor Panel */}
      {showTutorPanel && (
        <aside className="space-y-4">
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
            <Card>
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
