// Evaluation Phase - Placeholder
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, CheckCircle2, Target } from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';

export function Evaluation() {
  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 rounded-full bg-muted w-fit">
            <BarChart3 className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle>Evaluation</CardTitle>
          <CardDescription>
            Modellperformance bewerten und Entscheidung für Deployment treffen
          </CardDescription>
          <Badge variant="secondary" className="w-fit mx-auto">Kommt in Phase 2</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground space-y-4">
            <p>In dieser Phase wirst du:</p>
            <ul className="text-left max-w-md mx-auto space-y-2">
              <li className="flex items-start gap-2">
                <BarChart3 className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Performance-Metriken berechnen und interpretieren</span>
              </li>
              <li className="flex items-start gap-2">
                <Target className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Ergebnisse gegen Erfolgskriterien prüfen</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Go/No-Go Entscheidung dokumentieren</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Relevante Begriffe für diese Phase</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <GlossaryLink term="Confusion Matrix" termId="confusion-matrix" />
            <GlossaryLink term="Precision" />
            <GlossaryLink term="Recall" />
            <GlossaryLink term="F1-Score" termId="f1-score" />
            <GlossaryLink term="AUC-ROC" termId="auc-roc" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
