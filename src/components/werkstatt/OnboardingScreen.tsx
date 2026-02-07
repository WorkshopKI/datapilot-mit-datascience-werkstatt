// Onboarding Screen for DS Werkstatt
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FlaskConical, HardDrive, Cloud, ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingScreenProps {
  onComplete: (mode: 'local' | 'sync') => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [selectedMode, setSelectedMode] = useState<'local' | 'sync' | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
          <FlaskConical className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Willkommen in der DS Werkstatt</h1>
        <p className="text-muted-foreground text-lg">
          Dein interaktiver Begleiter durch den CRISP-DM Zyklus
        </p>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Wo sollen deine Projekte gespeichert werden?</h2>
          <p className="text-muted-foreground">
            Du kannst dies später in den Einstellungen ändern.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Local Storage Option */}
          <Card
            className={cn(
              'cursor-pointer transition-all hover:border-primary/50',
              selectedMode === 'local' && 'border-2 border-primary bg-primary/5'
            )}
            onClick={() => setSelectedMode('local')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-muted">
                  <HardDrive className="h-6 w-6 text-muted-foreground" />
                </div>
                {selectedMode === 'local' && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </div>
              <CardTitle className="text-lg">Lokal speichern</CardTitle>
              <CardDescription>
                Projekte werden im Browser gespeichert
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  Kein Account nötig
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  Sofort loslegen
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50">–</span>
                  <span className="text-muted-foreground/70">Nur auf diesem Gerät</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Sync Option (Coming Soon) */}
          <Card
            className={cn(
              'cursor-pointer transition-all opacity-60',
              selectedMode === 'sync' && 'border-2 border-primary bg-primary/5 opacity-100'
            )}
            onClick={() => setSelectedMode('sync')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-muted">
                  <Cloud className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-xs bg-muted px-2 py-1 rounded-full">Bald</span>
              </div>
              <CardTitle className="text-lg">Cloud-Sync</CardTitle>
              <CardDescription>
                Projekte geräteübergreifend synchronisieren
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50">○</span>
                  Auf allen Geräten verfügbar
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50">○</span>
                  Automatische Backups
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground/50">○</span>
                  Account erforderlich
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-4">
          <Button
            size="lg"
            disabled={!selectedMode}
            onClick={() => selectedMode && onComplete(selectedMode)}
            className="gap-2"
          >
            Werkstatt betreten
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
