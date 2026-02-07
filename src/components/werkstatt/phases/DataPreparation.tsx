// Data Preparation Phase - Placeholder
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings2, Wand2, Scale } from 'lucide-react';
import { GlossaryLink } from '../GlossaryLink';

export function DataPreparation() {
  return (
    <div className="space-y-6">
      <Card className="border-dashed">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 rounded-full bg-muted w-fit">
            <Settings2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <CardTitle>Data Preparation</CardTitle>
          <CardDescription>
            Daten bereinigen, transformieren und für das Modelltraining vorbereiten
          </CardDescription>
          <Badge variant="secondary" className="w-fit mx-auto">Kommt in Phase 2</Badge>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground space-y-4">
            <p>In dieser Phase wirst du:</p>
            <ul className="text-left max-w-md mx-auto space-y-2">
              <li className="flex items-start gap-2">
                <Wand2 className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Fehlende Werte behandeln (Imputation)</span>
              </li>
              <li className="flex items-start gap-2">
                <Wand2 className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Feature Engineering durchführen</span>
              </li>
              <li className="flex items-start gap-2">
                <Scale className="h-4 w-4 shrink-0 mt-1 text-primary" />
                <span>Features skalieren und normalisieren</span>
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
            <GlossaryLink term="Feature Engineering" termId="feature-engineering" />
            <GlossaryLink term="Imputation" termId="imputation" />
            <GlossaryLink term="One-Hot Encoding" termId="one-hot-encoding" />
            <GlossaryLink term="Normalisierung" termId="normalisierung" />
            <GlossaryLink term="Train-Test-Split" termId="train-test-split" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
