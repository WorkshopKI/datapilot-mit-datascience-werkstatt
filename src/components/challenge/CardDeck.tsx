import { cn } from '@/lib/utils';
import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CardDeckProps {
  onDrawCard: () => void;
  isFlipping: boolean;
  cardsRemaining?: number;
  totalCards?: number;
}

export function CardDeck({ onDrawCard, isFlipping, cardsRemaining, totalCards }: CardDeckProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Card Stack */}
      <div 
        className="relative cursor-pointer group"
        onClick={onDrawCard}
      >
        {/* Background cards for stack effect */}
        <div className="absolute inset-0 bg-primary/10 rounded-xl rotate-3 translate-x-1 translate-y-1 border border-border/50" />
        <div className="absolute inset-0 bg-primary/5 rounded-xl -rotate-2 -translate-x-0.5 translate-y-0.5 border border-border/50" />
        
        {/* Main card */}
        <div
          className={cn(
            "relative w-56 h-72 md:w-64 md:h-80 bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-xl border-2 border-primary/30 shadow-lg",
            "flex flex-col items-center justify-center gap-4 p-6",
            "transition-all duration-300 ease-out",
            "group-hover:-translate-y-2 group-hover:shadow-xl group-hover:border-primary/50",
            isFlipping && "animate-pulse"
          )}
        >
          {/* Card back design */}
          <div className="text-5xl md:text-6xl">🎲</div>
          <div className="text-center">
            <p className="text-lg md:text-xl font-bold text-primary tracking-wider">CHALLENGE</p>
            <p className="text-xs text-muted-foreground mt-1">Klicken zum Ziehen</p>
          </div>
          
          {/* Decorative corners */}
          <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-primary/40 rounded-tl" />
          <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-primary/40 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-primary/40 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-primary/40 rounded-br" />
        </div>
      </div>

      {/* Draw button */}
      <Button 
        onClick={onDrawCard} 
        size="lg" 
        className="gap-2"
        disabled={isFlipping}
      >
        <Shuffle className="h-4 w-4" />
        Karte ziehen
      </Button>

      {/* Progress hint */}
      {cardsRemaining !== undefined && totalCards !== undefined && (
        <p className="text-xs text-muted-foreground">
          {totalCards - cardsRemaining} von {totalCards} Karten gesehen
        </p>
      )}
    </div>
  );
}
