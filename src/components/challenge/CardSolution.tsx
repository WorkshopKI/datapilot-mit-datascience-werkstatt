import { ChallengeCard, cardCategories } from '@/data/challengeCardsData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Lightbulb, Shuffle, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CardSolutionProps {
  card: ChallengeCard;
  onNewCard: () => void;
  onBack: () => void;
}

const categoryBadgeStyles: Record<string, string> = {
  krisen: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  entscheidungen: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  stakeholder: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  daten: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
};

export function CardSolution({ card, onNewCard, onBack }: CardSolutionProps) {
  const category = cardCategories.find(c => c.id === card.category);

  const handleCopy = async () => {
    const text = `🎲 Challenge Card #${card.id}\n\n${card.emoji} ${card.title}\n\n${card.situation}\n\n❓ ${card.question}\n\n✅ Profi-Antwort:\n${card.solution.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n💡 ${card.solution.keyInsight}`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Kopiert!",
        description: "Die Karte wurde in die Zwischenablage kopiert.",
      });
    } catch {
      toast({
        title: "Fehler",
        description: "Kopieren fehlgeschlagen.",
        variant: "destructive",
      });
    }
  };


  return (
    <Card className="w-full max-w-lg mx-auto border border-gray-200 dark:border-gray-700 bg-card animate-fade-in">
      <CardHeader className="pb-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Badge className={categoryBadgeStyles[card.category]}>
            {category?.emoji} {category?.name}-Karte
          </Badge>
          <span className="text-sm text-muted-foreground">#{card.id}</span>
        </div>

        {/* Title */}
        <div className="text-center pt-4">
          <span className="text-4xl block mb-2">{card.emoji}</span>
          <h2 className="text-xl md:text-2xl font-bold">{card.title}</h2>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Solution steps */}
        <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <CheckCircle2 className="h-5 w-5" />
            <span>Profi-Antwort</span>
          </div>
          <ol className="space-y-2">
            {card.solution.steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm md:text-base">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Key insight */}
        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-700 dark:text-orange-400 text-sm mb-1">Lernpunkt</p>
              <p className="text-sm text-orange-800 dark:text-orange-300">{card.solution.keyInsight}</p>
            </div>
          </div>
        </div>

        {/* Related terms */}
        {card.relatedTerms && card.relatedTerms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Verwandte Begriffe:</span>
            {card.relatedTerms.map((term) => (
              <Badge key={term} variant="outline" className="text-xs">
                {term}
              </Badge>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Button onClick={onNewCard} className="flex-1 gap-2">
            <Shuffle className="h-4 w-4" />
            Neue Karte
          </Button>
          <Button variant="outline" onClick={handleCopy} size="icon">
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="ghost" onClick={onBack} className="w-full">
          Zurück zur Übersicht
        </Button>
      </CardContent>
    </Card>
  );
}
