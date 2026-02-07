// Modeling Phase - Placeholder
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sliders, GitCompare } from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';

export function Modeling() {
  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 rounded-full bg-muted w-fit">
            <Brain className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle>Modeling</CardTitle>
          <CardDescription>
            ML-Modelle trainieren, vergleichen und optimieren
          </CardDescription>
          <Badge variant="secondary" className="w-fit mx-auto">Kommt in Phase 2</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground space-y-4">
            <p>In dieser Phase wirst du:</p>
            <ul className="text-left max-w-md mx-auto space-y-2">
              <li className="flex items-start gap-2">
                <Brain className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Verschiedene Algorithmen trainieren</span>
              </li>
              <li className="flex items-start gap-2">
                <Sliders className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Hyperparameter optimieren</span>
              </li>
              <li className="flex items-start gap-2">
                <GitCompare className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Modelle vergleichen und das beste auswählen</span>
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
            <GlossaryLink term="Machine Learning" termId="machine-learning" />
            <GlossaryLink term="Hyperparameter" />
            <GlossaryLink term="Cross-Validation" termId="cross-validation" />
            <GlossaryLink term="Overfitting" />
            <GlossaryLink term="Baseline" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
