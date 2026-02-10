import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { modusTipps } from "@/data/content";
import { User, Users, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TutorTabs } from "@/components/tutor/TutorTabs";

export default function TutorModus() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <TutorTabs activeTab="modus" />
      <h1 className="text-3xl md:text-4xl font-bold mb-2">Einzel & Team</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Der Tutor funktioniert sowohl allein als auch im Team.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Einzelmodus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Einzelmodus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {modusTipps.einzelmodus.map((tipp, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-muted-foreground">{tipp}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Gruppenmodus */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Gruppenmodus (2-3 Personen)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {modusTipps.gruppenmodus.map((tipp, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span className="text-muted-foreground">{tipp}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Alert className="mt-6 border-blue-500/50 bg-blue-50 dark:bg-blue-950/20">
        <Info className="h-5 w-5 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-300">
          <strong>Auto-Erkennung:</strong> Der Tutor erkennt &quot;wir&quot; und &quot;unser Team&quot; automatisch und passt die Anrede entsprechend an.
        </AlertDescription>
      </Alert>
    </div>
  );
}
