import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Lightbulb, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Phase, type ScenarioContext } from '@/data/canvasData';

interface CanvasPhaseCardProps {
  phase: Phase;
  phaseIndex: number;
  context: ScenarioContext;
  note: string;
  checks: Record<string, boolean>;
  onNoteChange: (note: string) => void;
  onCheckToggle: (checkKey: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function CanvasPhaseCard({
  phase,
  phaseIndex,
  context,
  note,
  checks,
  onNoteChange,
  onCheckToggle,
  isOpen,
  onToggle
}: CanvasPhaseCardProps) {

  const phaseHint = context.phasenHinweise[phase.id as keyof typeof context.phasenHinweise];
  
  const completedChecks = phase.checks.filter(
    check => checks[`${phase.id}-${check.id}`]
  ).length;

  const content = (
    <div className="space-y-3">
      {/* Kernfrage */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Kernfrage:</span> {phase.kernfrage}
      </p>

      {/* Kontext-Hinweis */}
      {phaseHint && (
        <div className="flex gap-2 p-3 bg-primary/5 border-l-4 border-primary rounded-r">
          <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">{phaseHint}</p>
        </div>
      )}

      {/* Notizen */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Deine Notizen:</label>
        <Textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Schreibe hier deine Überlegungen..."
          className="min-h-[60px] resize-y text-sm"
        />
      </div>

      {/* Selbst-Check */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          ✓ Selbst-Check
          <span className="text-muted-foreground font-normal">
            ({completedChecks}/{phase.checks.length})
          </span>
        </h4>
        <div className="space-y-1.5">
          {phase.checks.map((check) => {
            const checkKey = `${phase.id}-${check.id}`;
            const isChecked = checks[checkKey] || false;

            return (
              <div
                key={check.id}
                className="flex items-start gap-2"
              >
                <Checkbox
                  id={checkKey}
                  checked={isChecked}
                  onCheckedChange={() => onCheckToggle(checkKey)}
                  className="mt-0.5"
                />
                <label
                  htmlFor={checkKey}
                  className={cn(
                    "text-sm cursor-pointer flex-1",
                    isChecked && "text-emerald-600 dark:text-emerald-400 line-through"
                  )}
                >
                  {check.label}
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                      <HelpCircle className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p>{check.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="py-3 px-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-semibold text-xs">{phase.number}</span>
              </div>
              <span>{phase.name}</span>
            </CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {completedChecks}/{phase.checks.length}
                </span>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 transition-transform",
                    isOpen && "rotate-180"
                  )} 
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-4 pt-0">
            {content}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
