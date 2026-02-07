// Deployment Phase - Placeholder
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, Monitor, RefreshCw } from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';

export function Deployment() {
  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 rounded-full bg-muted w-fit">
            <Rocket className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle>Deployment</CardTitle>
          <CardDescription>
            Modell in Produktion bringen und überwachen
          </CardDescription>
          <Badge variant="secondary" className="w-fit mx-auto">Kommt in Phase 2</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground space-y-4">
            <p>In dieser Phase wirst du:</p>
            <ul className="text-left max-w-md mx-auto space-y-2">
              <li className="flex items-start gap-2">
                <Rocket className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Deployment-Strategie festlegen</span>
              </li>
              <li className="flex items-start gap-2">
                <Monitor className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Monitoring und Alerting einrichten</span>
              </li>
              <li className="flex items-start gap-2">
                <RefreshCw className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Retraining-Strategie planen</span>
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
            <GlossaryLink term="Deployment" />
            <GlossaryLink term="Concept Drift" termId="concept-drift" />
            <GlossaryLink term="Monitoring" />
            <GlossaryLink term="MLOps" />
            <GlossaryLink term="A/B Testing" termId="ab-testing" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
