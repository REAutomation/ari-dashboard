# CLAUDE.md - Ari Dashboard Session Recovery

> Kompakte Referenz für KI-Agenten. Details in `docs/`.

---

## Aktueller Status

**Stand:** 2026-01-29
**Phase:** PoC abgeschlossen + Phase 2 (Sidebar, Presets, Auto-Scaling) implementiert
**Services laufen auf:**
- Frontend: http://localhost:5173 (Netzwerk: http://192.168.2.70:5173)
- Backend: http://localhost:3001 (Netzwerk: http://192.168.2.70:3001)
- Port 3000 belegt durch Open WebUI!

---

## Projekt-Übersicht

Ari Dashboard = Visuelles Interface für den Moltbot AI-Assistenten "Ari".
Läuft permanent auf einem TV-Display in der Firma RE Automation GmbH.

**Zweck:** Ari zeigt Dateien, HTML-Artefakte, Notizen, Status an. Alles API-gesteuert.

---

## Repo-Struktur (aktuell)

```
ari-dashboard/
├── frontend/                     # React 18 + TypeScript + Vite 5
│   ├── src/
│   │   ├── components/
│   │   │   ├── widgets/         # HomeWidget, TextWidget, FileViewerWidget, HTMLRendererWidget
│   │   │   ├── sidebar/         # AriAvatar, TaskList, ActivityFeed
│   │   │   ├── ui/              # Card, Badge (shadcn/ui)
│   │   │   ├── Dashboard.tsx    # Grid-Layout + Sidebar
│   │   │   ├── Header.tsx       # Logo, Theme-Toggle, Display-Mode-Toggle, Clock
│   │   │   ├── Sidebar.tsx      # Ari Status-Sidebar (erweitert/minimiert)
│   │   │   ├── WidgetContainer.tsx
│   │   │   ├── AutoScaleWrapper.tsx  # Widget-Content Skalierung
│   │   │   └── DisplayModeProvider.tsx
│   │   ├── hooks/               # useSocket, useTheme, useSidebar, useDisplayMode
│   │   ├── lib/                 # api.ts, socket.ts, utils.ts
│   │   ├── types/widget.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/assets/
│   │   ├── re-automation-logo.svg
│   │   └── avatars/             # donkey_*.png, goat_*.png (4 Zustände je)
│   └── .env                     # VITE_API_URL, VITE_WS_URL
│
├── backend/                      # Node.js 20 + Express + Socket.io
│   ├── src/
│   │   ├── api/                 # widgets.ts, files.ts, health.ts, status.ts, feed.ts
│   │   ├── services/            # widgetStore, fileStore, statusStore, feedStore, socketService
│   │   ├── types/widget.ts
│   │   └── index.ts
│   ├── uploads/                 # File-Upload Verzeichnis
│   └── .env                     # PORT=3001, CORS_ORIGIN=...
│
├── assets/ari-avatars/          # Original Avatar-PNGs (Quelldateien)
├── docs/
│   ├── spec-01-poc-definition.md    # PoC Spezifikation (v2.0)
│   └── spec-02-phase2-discussion.md # Phase 2 Besprechungspunkte
└── CLAUDE.md                    # Diese Datei
```

---

## Tech Stack

- **Frontend:** React 18, TypeScript 5, Vite 5, Tailwind 3, shadcn/ui, Socket.io Client, lucide-react, react-markdown
- **Backend:** Node.js 20, Express 4, TypeScript 5, Socket.io 4, multer
- **Design:** Geist Font, RE Automation Farbsystem (neutrale Grautöne, grüner Akzent HSL 81 44% 39%)
- **Speicherung:** In-Memory (keine DB - persistente Speicherung zurückgestellt)

---

## API Endpoints

### Widgets
```
GET    /api/widgets          - Alle Widgets
POST   /api/widgets          - Widget erstellen
PUT    /api/widgets/:id      - Widget aktualisieren
DELETE /api/widgets/:id      - Widget löschen
```

### Files
```
POST   /api/files/upload     - Datei hochladen (multipart/form-data)
GET    /api/files/:id        - Datei herunterladen
```

### Ari Status (NEU)
```
GET    /api/status           - Aktuellen Status abrufen
PUT    /api/status           - Status setzen (state, message, activeTasks)
```

### Activity Feed
```
GET    /api/feed?limit=50    - Feed-Einträge (newest first)
POST   /api/feed             - Neuer Feed-Eintrag (type, message, details?)
```

### Presets (NEU)
```
GET    /api/presets              - Alle Presets auflisten
GET    /api/presets/:name        - Preset abrufen
GET    /api/presets/default      - Default-Preset abrufen
POST   /api/presets              - Preset erstellen/aktualisieren
PUT    /api/presets/activate/:name - Preset aktivieren (lädt Widgets)
DELETE /api/presets/:name        - Preset löschen
```

### WebSocket Events
```
widget:created, widget:updated, widget:deleted
status:updated, feed:new
preset:activated
```

---

## Widget-Typen

| Type | Beschreibung |
|------|-------------|
| `home` | Startseite mit Greeting, Status, Info-Items |
| `text` | Markdown-Text mit Varianten (info/warning/success/error) |
| `file` | Datei-Viewer (image, pdf, excel/csv) |
| `html` | HTML/SVG-Renderer (sandboxed iframe) |
| `weather` | Wetter-Widget mit OpenWeatherMap API |

---

## Letzte Schritte

1. PoC implementiert: 4 Widget-Typen, REST API, WebSocket, CSS Grid
2. Design-Refresh: RE Automation Farbsystem (MultiFab), Geist Font, Linear-Shadows, Logo
3. Light/Dark Theme-Toggle mit localStorage
4. Ari Sidebar implementiert: Avatar (Donkey/Goat umschaltbar), TaskList, ActivityFeed
5. JSON-Persistenz: Widgets + Presets überleben Backend-Neustarts
6. Preset-System: API zum Speichern/Laden/Aktivieren von Dashboard-Layouts
7. Wetter-Widget: OpenWeatherMap API, Standort Stuttgart Bad Cannstatt
8. Briefing-Button im Header: Lädt das Default-Preset "briefing"
9. Briefing-Preset erstellt: Wetter + Willkommen-Text + Ari-Status
10. **Auto-Scaling** (Punkt 3): Display-Modus (auto-scale) vs. Interaktiv-Modus (scroll)
    - Global Toggle im Header (Monitor/Maus-Icon)
    - Per-Widget Toggle (Maximize-Button bei skaliertem Content)
    - `widget.scrollable` Feld für API-gesteuerten Scroll-Modus

---

## Nächste Schritte

1. **Ari-Avatar finalisieren**: Hintergründe sauber freistellen, bessere "Agents"-Variante
2. **Meeting-Preset** erstellen: Layout für Besprechungen (Notizen, Präsentation)
3. **Ari-Integration testen**: Briefing mit echten Daten (Kalender, Todos, News)
4. **Docker Deployment** (wenn Stand gut ist)

---

## Offene Entscheidungen

Siehe `docs/spec-02-phase2-discussion.md`:
- Canvas-Widget (zurückgestellt)
- Persistenz-Technologie (SQLite tendenz, JSON aktuell ausreichend)
- Ari Avatar final (Bilder noch nicht final, Gemini-Limit erreicht)

---

## Lessons Learned

- Port 3000 ist durch Open WebUI belegt → Backend auf 3001
- Socket.io braucht `http://` nicht `ws://` als URL
- CSS Grid: `auto-rows-[200px]` verursacht Scroll auf TV → `repeat(rows, 1fr)` + `calc(100vh - ...)` nutzen
- `body { overflow: hidden }` für TV-Display (kein Scroll)
- Frontend-Types müssen exakt zum Backend passen (file_viewer→file, html_renderer→html)
- Agenten erstellen manchmal überflüssige .md Dateien → nach Agent-Run aufräumen

---

## Konventionen

- **Sprache:** Antworten Deutsch, Code/Variablen/Kommentare Englisch
- **Header:** Alle Quelldateien mit `RE Automation GmbH - 2026` + Beschreibung
- **Agenten:** Sonnet zum Coden nutzen, klare Anweisungen, Arbeit prüfen
- **NIEMALS:** `killall node` (beendet Claude Code), Port 3000 nutzen, Platzhalter/Mocks ohne Anweisung

---

*Aktualisiert: 2026-01-29 09:20*
