import { useState, useEffect, useCallback } from 'react';
import { CardCategory } from '@/data/challengeCardsData';

const STORAGE_KEY = 'challenge-cards-progress';

interface ChallengeProgress {
  completedCards: number[];
  lastCategory: CardCategory | 'all';
  lastViewedCardId: number | null;
}

const defaultProgress: ChallengeProgress = {
  completedCards: [],
  lastCategory: 'all',
  lastViewedCardId: null,
};

export function useChallengeProgress() {
  const [progress, setProgress] = useState<ChallengeProgress>(defaultProgress);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProgress({
          completedCards: parsed.completedCards || [],
          lastCategory: parsed.lastCategory || 'all',
          lastViewedCardId: parsed.lastViewedCardId || null,
        });
      }
    } catch (error) {
      console.error('Error loading challenge progress:', error);
    }
  }, []);

  // Save to localStorage whenever progress changes
  const saveProgress = useCallback((newProgress: ChallengeProgress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Error saving challenge progress:', error);
    }
  }, []);

  const markCardComplete = useCallback((cardId: number) => {
    setProgress((prev) => {
      if (prev.completedCards.includes(cardId)) {
        return prev;
      }
      const newProgress = {
        ...prev,
        completedCards: [...prev.completedCards, cardId],
        lastViewedCardId: cardId,
      };
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  const setLastCategory = useCallback((category: CardCategory | 'all') => {
    setProgress((prev) => {
      const newProgress = { ...prev, lastCategory: category };
      saveProgress(newProgress);
      return newProgress;
    });
  }, [saveProgress]);

  const resetProgress = useCallback(() => {
    saveProgress(defaultProgress);
  }, [saveProgress]);

  const getCompletedCount = useCallback(() => {
    return progress.completedCards.length;
  }, [progress.completedCards]);

  const isCardCompleted = useCallback((cardId: number) => {
    return progress.completedCards.includes(cardId);
  }, [progress.completedCards]);

  return {
    completedCards: progress.completedCards,
    lastCategory: progress.lastCategory,
    lastViewedCardId: progress.lastViewedCardId,
    markCardComplete,
    setLastCategory,
    resetProgress,
    getCompletedCount,
    isCardCompleted,
  };
}
