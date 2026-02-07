
# Plan: App-Name zu "DataPilot" ändern ✅ ERLEDIGT

## Ziel

Den App-Namen von "DS PM Tutor" zu **"DataPilot"** überall ändern.

---

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `index.html` | Title, Meta-Tags (og:title, twitter:title, description, apple-mobile-web-app-title) |
| `public/manifest.json` | name, short_name, description |
| `src/components/layout/AppSidebar.tsx` | Logo-Text in der Sidebar |

---

## Detaillierte Änderungen

### 1. index.html

```html
<!-- Vorher -->
<meta name="apple-mobile-web-app-title" content="DS PM Tutor" />
<title>DS PM Tutor</title>
<meta name="description" content="DS PM Tutor">
<meta property="og:title" content="DS PM Tutor">
<meta name="twitter:title" content="DS PM Tutor">
<meta property="og:description" content="DS PM Tutor">
<meta name="twitter:description" content="DS PM Tutor">

<!-- Nachher -->
<meta name="apple-mobile-web-app-title" content="DataPilot" />
<title>DataPilot</title>
<meta name="description" content="DataPilot – Dein Begleiter für Data Science Projekte">
<meta property="og:title" content="DataPilot">
<meta name="twitter:title" content="DataPilot">
<meta property="og:description" content="DataPilot – Dein Begleiter für Data Science Projekte">
<meta name="twitter:description" content="DataPilot – Dein Begleiter für Data Science Projekte">
```

### 2. public/manifest.json

```json
{
  "name": "DataPilot",
  "short_name": "DataPilot",
  "description": "Dein Begleiter für Data Science Projekte",
  ...
}
```

### 3. src/components/layout/AppSidebar.tsx

```tsx
// Vorher
<span className="font-semibold text-lg">DS PM Tutor</span>

// Nachher
<span className="font-semibold text-lg">DataPilot</span>
```

---

## Icon-Überlegung (optional)

Das aktuelle Icon ist `GraduationCap` – passend zum "Tutor"-Namen. Für "DataPilot" könnte ein alternatives Icon besser passen:

| Option | Icon | Begründung |
|--------|------|------------|
| Behalten | GraduationCap | Lernen bleibt Kernfunktion |
| Alternativ | Compass | Passt zu "Pilot" / Navigation |
| Alternativ | Rocket | Dynamisch, "Launch" |

**Empfehlung:** GraduationCap behalten, da Lernen weiterhin zentral ist.

---

## Zusammenfassung

3 Dateien werden angepasst, um den Namen konsistent auf "DataPilot" zu ändern.
