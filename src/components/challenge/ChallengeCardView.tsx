import { ChallengeCard, cardCategories } from '@/data/challengeCardsData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ChallengeCardViewProps {
  card: ChallengeCard;
  showHint: boolean;
  onShowHint: () => void;
  onShowSolution: () => void;
}

const categoryBadgeStyles: Record<string, string> = {
  krisen: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  entscheidungen: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  stakeholder: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  daten: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
};

const difficultyLabels: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Einsteiger', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' },
  intermediate: { label: 'Fortgeschritten', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  advanced: { label: 'Experte', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

export function ChallengeCardView({ card, showHint, onShowHint, onShowSolution }: ChallengeCardViewProps) {
  const [userAnswer, setUserAnswer] = useState('');
  const category = cardCategories.find(c => c.id === card.category);
  const difficulty = difficultyLabels[card.difficulty];

  return (
    <Card className="w-full max-w-lg mx-auto border border-gray-200 dark:border-gray-700 bg-card animate-fade-in">
      <CardHeader className="pb-3">
        {/* Header with category and ID */}
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

        {/* Difficulty badge */}
        <div className="flex justify-center pt-2">
          <Badge variant="outline" className={cn("text-xs", difficulty.color)}>
            {difficulty.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Situation */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm md:text-base leading-relaxed">{card.situation}</p>
        </div>

        {/* Question */}
        <div className="bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-500 rounded-r-lg p-4">
          <p className="font-semibold text-base md:text-lg text-foreground">
            ❓ {card.question}
          </p>
        </div>

        {/* Optional user answer */}
        <div>
          <Textarea
            placeholder="Deine Antwort (optional)..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        {/* Hint */}
        {showHint && card.hint && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 animate-fade-in">
            <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{card.hint}</span>
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          {!showHint && card.hint && (
            <Button variant="outline" onClick={onShowHint} className="flex-1 gap-2">
              <Lightbulb className="h-4 w-4" />
              Tipp
            </Button>
          )}
          <Button onClick={onShowSolution} className="flex-1 gap-2">
            <Sparkles className="h-4 w-4" />
            Auflösung
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
