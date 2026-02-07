import { Progress } from '@/components/ui/progress';
import { TrendingUp, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CardProgressProps {
  completed: number;
  total: number;
  onReset?: () => void;
}

export function CardProgress({ completed, total, onReset }: CardProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>
            <span className="font-medium text-foreground">{completed}</span> von {total} Karten gemeistert
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      
      {completed > 0 && onReset && (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            Zurücksetzen
          </Button>
        </div>
      )}
    </div>
  );
}
