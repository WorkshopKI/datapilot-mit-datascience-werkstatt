

# Fortschrittsbalken bei Beispielprojekten optimieren

## Problem
Beispielprojekte zeigen immer einen Fortschrittsbalken (0/6), obwohl der Nutzer noch nicht begonnen hat. Da Beispielprojekte beim Bearbeiten automatisch unter "Eigene Projekte" gespeichert werden, ist ein leerer Fortschrittsbalken irreführend.

## Lösung
Den Fortschrittsbalken nur anzeigen, wenn mindestens eine Phase abgeschlossen ist (`completedPhases > 0`). Wenn kein Fortschritt vorhanden ist, wird stattdessen die aktuelle Phase als einfaches Text-Label angezeigt.

## Änderung

**Datei:** `src/components/werkstatt/ProjectCard.tsx`

Der Progress-Bar-Block (Zeilen 103-115) wird bedingt gerendert:

- **Wenn `completedPhases > 0`:** Fortschrittsbalken mit Zähler wie bisher
- **Wenn `completedPhases === 0`:** Nur ein dezentes Label mit der Startphase (z.B. "Business Understanding"), ohne Balken

So sieht das Ergebnis aus:

| Zustand | Anzeige |
|---------|---------|
| Beispielprojekt, nicht begonnen | Nur Phase-Label, kein Balken |
| Beispielprojekt, 1+ Phasen fertig | Fortschrittsbalken mit x/6 |
| Eigenes Projekt, nicht begonnen | Nur Phase-Label, kein Balken |
| Eigenes Projekt, 1+ Phasen fertig | Fortschrittsbalken mit x/6 |

## Technische Details

- Nur 1 Datei betroffen: `ProjectCard.tsx`
- Keine neuen Props nötig — die Logik basiert auf dem bereits berechneten `completedPhases`
- Konsistentes Verhalten für alle Projekttypen (eigene und Beispiele)

