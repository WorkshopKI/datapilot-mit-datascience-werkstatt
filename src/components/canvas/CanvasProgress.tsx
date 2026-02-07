import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { FileDown, RotateCcw } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CanvasProgressProps {
  completed: number;
  total: number;
  percentage: number;
  onExportPdf: () => void;
  onReset: () => void;
}

export function CanvasProgress({
  completed,
  total,
  percentage,
  onExportPdf,
  onReset
}: CanvasProgressProps) {
  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">📊 Fortschritt: {completed}/{total} Checks</span>
          <span className="text-muted-foreground">{percentage}%</span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onExportPdf}
        >
          <FileDown className="h-4 w-4 mr-2" />
          Als PDF exportieren
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="flex-1 text-destructive hover:text-destructive">
              <RotateCcw className="h-4 w-4 mr-2" />
              Canvas zurücksetzen
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Canvas zurücksetzen?</AlertDialogTitle>
              <AlertDialogDescription>
                Alle Notizen und Checkboxen werden gelöscht. 
                Diese Aktion kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={onReset} className="bg-destructive hover:bg-destructive/90">
                Zurücksetzen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
