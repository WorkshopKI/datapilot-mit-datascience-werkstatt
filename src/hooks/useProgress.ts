import { useState, useEffect, useCallback } from "react";
import { trackedSections } from "@/data/content";

const STORAGE_KEY = "ds-app-progress";

interface ProgressState {
  visitedSections: string[];
}

function getInitialState(): ProgressState {
  if (typeof window === "undefined") {
    return { visitedSections: [] };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error reading progress from localStorage:", e);
  }
  
  return { visitedSections: [] };
}

export function useProgress() {
  const [state, setState] = useState<ProgressState>(getInitialState);

  // Sync to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Error saving progress to localStorage:", e);
    }
  }, [state]);

  const markAsVisited = useCallback((sectionId: string) => {
    setState((prev) => {
      if (prev.visitedSections.includes(sectionId)) {
        return prev;
      }
      return {
        ...prev,
        visitedSections: [...prev.visitedSections, sectionId],
      };
    });
  }, []);

  const isVisited = useCallback(
    (sectionId: string) => state.visitedSections.includes(sectionId),
    [state.visitedSections]
  );

  const getProgress = useCallback(() => {
    const total = trackedSections.length;
    const visited = state.visitedSections.length;
    return {
      visited,
      total,
      percentage: total > 0 ? Math.round((visited / total) * 100) : 0,
    };
  }, [state.visitedSections]);

  const resetProgress = useCallback(() => {
    setState({ visitedSections: [] });
  }, []);

  const getVisitedSections = useCallback(() => {
    return trackedSections.filter((section) =>
      state.visitedSections.includes(section.id)
    );
  }, [state.visitedSections]);

  return {
    markAsVisited,
    isVisited,
    getProgress,
    resetProgress,
    getVisitedSections,
    visitedSections: state.visitedSections,
  };
}
