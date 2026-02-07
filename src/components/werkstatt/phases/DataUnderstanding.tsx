// Data Understanding Phase - Placeholder
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, BarChart3, AlertTriangle } from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';

export function DataUnderstanding() {
  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 rounded-full bg-muted w-fit">
            <Database className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle>Data Understanding</CardTitle>
          <CardDescription>
            Daten erkunden, Qualität prüfen und erste Muster erkennen
          </CardDescription>
          <Badge variant="secondary" className="w-fit mx-auto">Kommt in Phase 2</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground space-y-4">
            <p>In dieser Phase wirst du:</p>
            <ul className="text-left max-w-md mx-auto space-y-2">
              <li className="flex items-start gap-2">
                <BarChart3 className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Deskriptive Statistiken für alle Features berechnen</span>
              </li>
              <li className="flex items-start gap-2">
                <BarChart3 className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Verteilungen visualisieren</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-1 text-orange-500" />
                <span>Fehlende Werte und Ausreißer identifizieren</span>
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
            <GlossaryLink term="Deskriptive Statistik" termId="mittelwert" />
            <GlossaryLink term="Fehlende Werte" termId="fehlende-werte" />
            <GlossaryLink term="Ausreißer" termId="ausreisser" />
            <GlossaryLink term="Korrelation" />
            <GlossaryLink term="Verteilung" termId="normalverteilung" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
