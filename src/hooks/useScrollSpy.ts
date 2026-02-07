import { useState, useEffect, useRef } from "react";

export function useScrollSpy(sectionIds: string[], offset: number = 100) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  // Ref um alle aktuell sichtbaren Sektionen zu tracken
  const visibleSectionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Nichts tun wenn keine Section-IDs
    if (sectionIds.length === 0) {
      setActiveSection(null);
      return;
    }

    const updateActiveSection = () => {
      // Finde die erste (oberste) sichtbare Sektion in DOM-Reihenfolge
      for (const id of sectionIds) {
        if (visibleSectionsRef.current.has(id)) {
          setActiveSection(id);
          return;
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSectionsRef.current.add(entry.target.id);
          } else {
            visibleSectionsRef.current.delete(entry.target.id);
          }
        });

        updateActiveSection();
      },
      {
        rootMargin: `-${offset}px 0px -60% 0px`,
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      observer.disconnect();
      visibleSectionsRef.current.clear();
    };
  }, [sectionIds.join(","), offset]);

  return activeSection;
}
