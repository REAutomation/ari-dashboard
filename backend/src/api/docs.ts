/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Documentation API endpoint
 */

import { Router, Request, Response } from 'express';

const router = Router();

const ARI_DOCUMENTATION = `# Ari Dashboard - Steuerungsanleitung

Du hast Zugriff auf ein Dashboard, das auf einem TV-Display in der Firma läuft.

## API Base URL

\`http://192.168.2.70:3001\`

---

## Presets (Dashboard-Layouts)

| Preset | Beschreibung |
|--------|--------------|
| \`briefing\` | Tägliches Dashboard (Wetter, News, Tagesübersicht) |
| \`presentation\` | Leeres Dashboard für Präsentationen |

**Preset aktivieren:**
\`\`\`bash
curl -X PUT http://192.168.2.70:3001/api/presets/activate/briefing
curl -X PUT http://192.168.2.70:3001/api/presets/activate/presentation
\`\`\`

---

## Präsentationsmodus

1. \`PUT /api/presets/activate/presentation\` → Leeres Dashboard
2. Widgets erstellen (PDF, HTML, etc.)
3. \`PUT /api/presets/activate/briefing\` → Zurück zum Normal-Modus

---

## Widget-Typen

### Text (Markdown)
\`\`\`json
{
  "type": "text",
  "title": "Titel",
  "data": { "content": "## Überschrift\\n\\nText..." },
  "position": { "x": 0, "y": 0, "w": 6, "h": 2 }
}
\`\`\`

### News (Schlagzeilen mit Fade-Übergang)
\`\`\`json
{
  "type": "news",
  "title": "News",
  "data": {
    "items": [
      { "category": "Tech", "headline": "Titel", "summary": "Zusammenfassung", "time": "09:00" }
    ],
    "interval": 8
  },
  "position": { "x": 0, "y": 3, "w": 12, "h": 1 }
}
\`\`\`

### File (PDF, Bilder)
\`\`\`json
{
  "type": "file",
  "title": "Dokument",
  "data": {
    "fileType": "pdf",
    "fileName": "dokument.pdf",
    "fileUrl": "http://192.168.2.70:3001/api/files/serve?path=/home/node/datei.pdf"
  },
  "position": { "x": 0, "y": 0, "w": 12, "h": 4 }
}
\`\`\`

### HTML (beliebiger Content)
\`\`\`json
{
  "type": "html",
  "title": "Chart",
  "data": { "html": "<div style='...'>HTML Content</div>" },
  "position": { "x": 0, "y": 0, "w": 6, "h": 3 }
}
\`\`\`

### Weather
\`\`\`json
{
  "type": "weather",
  "title": "Wetter",
  "data": { "location": "Stuttgart", "zipCode": "70372", "units": "metric" },
  "position": { "x": 0, "y": 0, "w": 3, "h": 2 }
}
\`\`\`

---

## API Endpoints

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | /api/widgets | Alle Widgets auflisten |
| POST | /api/widgets | Widget erstellen |
| PUT | /api/widgets/:id | Widget aktualisieren |
| DELETE | /api/widgets/:id | Widget löschen |
| PUT | /api/presets/activate/:name | Preset aktivieren |
| GET | /api/files/serve?path=... | Lokale Datei servieren |
| PUT | /api/status | Ari-Status setzen |
| POST | /api/feed | Feed-Eintrag posten |

---

## Dateien hochladen und anzeigen

**Schritt 1: Datei hochladen**
\`\`\`bash
curl -X POST http://192.168.2.70:3001/api/files/upload -F "file=@/pfad/zur/datei.pdf"
\`\`\`

**Antwort:**
\`\`\`json
{
  "id": "abc123",
  "fileName": "datei.pdf",
  "url": "/api/files/abc123"
}
\`\`\`

**Schritt 2: Widget mit der URL erstellen**
\`\`\`json
{
  "type": "file",
  "title": "Mein PDF",
  "data": {
    "fileType": "pdf",
    "fileName": "datei.pdf",
    "fileUrl": "http://192.168.2.70:3001/api/files/abc123"
  },
  "position": { "x": 0, "y": 0, "w": 12, "h": 4 }
}
\`\`\`

**Kompletter Workflow:**
1. \`PUT /api/presets/activate/presentation\` → Leeres Dashboard
2. \`POST /api/files/upload\` → Datei hochladen, URL merken
3. \`POST /api/widgets\` → File-Widget mit der URL erstellen
4. \`PUT /api/presets/activate/briefing\` → Zurück wenn fertig

---

## Grid-System

12 Spalten breit. Position: { x, y, w, h }
- x: Spalte (0-11)
- y: Zeile (0 = oben)
- w: Breite (1-12)
- h: Höhe in Zeilen

---

## Status & Feed

**Status setzen:**
\`\`\`bash
curl -X PUT http://192.168.2.70:3001/api/status \\
  -H "Content-Type: application/json" \\
  -d '{"state": "working", "message": "Analysiere..."}'
\`\`\`
States: idle, working, agents, error

**Feed-Eintrag:**
\`\`\`bash
curl -X POST http://192.168.2.70:3001/api/feed \\
  -H "Content-Type: application/json" \\
  -d '{"type": "success", "message": "Fertig!"}'
\`\`\`
Types: info, success, warning, error
`;

router.get('/ari', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/markdown');
  res.send(ARI_DOCUMENTATION);
});

router.get('/ari/json', (req: Request, res: Response) => {
  res.json({
    title: 'Ari Dashboard API',
    baseUrl: 'http://192.168.2.70:3001',
    presets: ['briefing', 'presentation'],
    widgetTypes: ['text', 'news', 'file', 'html', 'weather', 'home'],
    endpoints: {
      widgets: {
        list: 'GET /api/widgets',
        create: 'POST /api/widgets',
        update: 'PUT /api/widgets/:id',
        delete: 'DELETE /api/widgets/:id'
      },
      presets: {
        activate: 'PUT /api/presets/activate/:name'
      },
      files: {
        serve: 'GET /api/files/serve?path=...'
      },
      status: {
        set: 'PUT /api/status'
      },
      feed: {
        post: 'POST /api/feed'
      }
    },
    allowedFileDirectories: ['/home/node', '/home/developer', '/tmp', '/shared']
  });
});

export default router;
