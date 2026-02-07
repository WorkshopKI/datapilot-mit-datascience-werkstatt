import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Dices, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { challengeCards, ChallengeCard, CardCategory } from '@/data/challengeCardsData';
import { useChallengeProgress } from '@/hooks/useChallengeProgress';
import { CardDeck } from '@/components/challenge/CardDeck';
import { ChallengeCardView } from '@/components/challenge/ChallengeCardView';
import { CardSolution } from '@/components/challenge/CardSolution';
import { CategoryFilter } from '@/components/challenge/CategoryFilter';
import { CardProgress } from '@/components/challenge/CardProgress';

type ViewState = 'deck' | 'challenge' | 'solution';

export default function ChallengeCards() {
  const {
    completedCards,
    lastCategory,
    markCardComplete,
    setLastCategory,
    resetProgress,
    getCompletedCount,
  } = useChallengeProgress();

  const [currentCard, setCurrentCard] = useState<ChallengeCard | null>(null);
  const [viewState, setViewState] = useState<ViewState>('deck');
  const [showHint, setShowHint] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CardCategory | 'all'>(lastCategory);

  // Filter cards by category
  const availableCards = useMemo(() => {
    if (selectedCategory === 'all') {
      return challengeCards;
    }
    return challengeCards.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  // Draw a random card
  const drawCard = useCallback(() => {
    if (availableCards.length === 0) return;

    setIsFlipping(true);

    // Prioritize unseen cards
    const unseenCards = availableCards.filter((c) => !completedCards.includes(c.id));
    const pool = unseenCards.length > 0 ? unseenCards : availableCards;

    const randomIndex = Math.floor(Math.random() * pool.length);
    const drawnCard = pool[randomIndex];

    setTimeout(() => {
      setCurrentCard(drawnCard);
      setShowHint(false);
      setViewState('challenge');
      setIsFlipping(false);
    }, 300);
  }, [availableCards, completedCards]);

  // Handle category change - reset card when changing category
  const handleCategoryChange = useCallback((category: CardCategory | 'all') => {
    setSelectedCategory(category);
    setLastCategory(category);
    // BUG-FIX: Reset card when changing category
    setCurrentCard(null);
    setViewState('deck');
    setShowHint(false);
  }, [setLastCategory]);

  // Show solution and mark as complete
  const handleShowSolution = useCallback(() => {
    if (currentCard) {
      markCardComplete(currentCard.id);
      setViewState('solution');
    }
  }, [currentCard, markCardComplete]);

  // Back to deck
  const handleBackToDeck = useCallback(() => {
    setCurrentCard(null);
    setViewState('deck');
    setShowHint(false);
  }, []);

  // Draw new card from solution
  const handleNewCard = useCallback(() => {
    drawCard();
  }, [drawCard]);

  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <Link to="/lernen">
          <Button variant="ghost" size="sm" className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Zurück zu Lernen
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Dices className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold">Challenge Cards</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Teste dein Projekt-Denken mit zufälligen Herausforderungen.
        </p>
      </div>

      {/* Category Filter - always visible */}
      <div className="mb-4 md:mb-6">
        <CategoryFilter selected={selectedCategory} onSelect={handleCategoryChange} />
      </div>

      {/* Progress */}
      <div className="mb-6 md:mb-8">
        <CardProgress
          completed={getCompletedCount()}
          total={challengeCards.length}
          onReset={resetProgress}
        />
      </div>

      {/* Main content area */}
      <div className="flex justify-center min-h-[400px]">
        {viewState === 'deck' && (
          <CardDeck
            onDrawCard={drawCard}
            isFlipping={isFlipping}
            cardsRemaining={availableCards.length - availableCards.filter((c) => completedCards.includes(c.id)).length}
            totalCards={availableCards.length}
          />
        )}

        {viewState === 'challenge' && currentCard && (
          <ChallengeCardView
            card={currentCard}
            showHint={showHint}
            onShowHint={() => setShowHint(true)}
            onShowSolution={handleShowSolution}
          />
        )}

        {viewState === 'solution' && currentCard && (
          <CardSolution
            card={currentCard}
            onNewCard={handleNewCard}
            onBack={handleBackToDeck}
          />
        )}
      </div>

      {/* Tip at bottom */}
      {viewState === 'deck' && (
        <div className="mt-6 md:mt-8 p-3 md:p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground flex items-start gap-2 max-w-lg mx-auto">
          <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            <strong>Tipp:</strong> Denke zuerst selbst nach, bevor du die Auflösung anschaust. So lernst du am meisten!
          </p>
        </div>
      )}
    </div>
  );
}
