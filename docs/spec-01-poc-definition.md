# Ari Dashboard - PoC Spezifikation

**Version:** 2.0
**Datum:** 2026-01-28
**Status:** ENTWURF - Wartet auf Freigabe
**Autor:** RE Automation GmbH

---

## 1. Vision & Zweck

Das Ari Dashboard ist das **visuelle Interface des digitalen Mitarbeiters Ari** (Moltbot).
Es läuft dauerhaft auf einem TV-Display im Büro und dient als:

- **Firmendisplay:** Zeigt laufend relevanten Firmenstatus an
- **Ari's Arbeitsplatz:** Zeigt, woran Ari gerade arbeitet
- **Content-Viewer:** Dateien (PDF, Bilder, Excel, ...) darstellen
- **Artefakt-Werkstatt:** Ari erstellt live HTML/SVG-basierte Tools und Visualisierungen
- **Brainstorming-Fläche:** In Meetings gemeinsam mit Ari Ideen entwickeln und festhalten
- **Benachrichtigungszentrale:** Wichtige Kundenanfragen, Alerts, anstehende Aufgaben

**Kernprinzip:** Ari steuert das Dashboard komplett via REST-API. Er entscheidet, welche Widgets angezeigt werden und füllt sie mit Inhalt. Wenn nichts aktiv ist, wird ein Home-Screen angezeigt.

---

## 2. Proof of Concept - Scope

### 2.1 Ziel des PoC

Demonstrieren, dass:
- Ari via API Widgets erstellen, befüllen und entfernen kann
- Verschiedene Content-Typen dargestellt werden (Text, Dateien, HTML)
- Echtzeit-Updates via WebSocket funktionieren
- Ein ansprechendes Dark-Mode-Dashboard auf TV-Display läuft

### 2.2 PoC Widget-Typen (4 Stück)

| Widget | Zweck |
|--------|-------|
| **HomeWidget** | Default-Ansicht: Ari-Status, Uhrzeit, anstehende Infos |
| **TextWidget** | Markdown/Text: Notizen, Meldungen, Meeting-Protokolle |
| **FileViewerWidget** | Dateien anzeigen: PDF, Bilder, Excel-Vorschau |
| **HTMLRendererWidget** | Ari erstellt HTML/SVG-Artefakte live im Dashboard |

### 2.3 Explizit NICHT im PoC

- Persistente Datenspeicherung (In-Memory reicht)
- User-Authentication
- Drag & Drop Widget-Positionierung
- Canvas/Zeichenfläche (spätere Phase)
- Notification-Widget (spätere Phase)
- Task-Widget (spätere Phase)
- Umfangreiche Fehlerbehandlung
- Tests

---

## 3. Widget-Definitionen

### 3.1 HomeWidget

Das Home-Widget wird angezeigt, wenn keine aktiven Aufgaben laufen. Es ist der **Idle-Screen**.

```typescript
interface HomeWidgetData {
  greeting?: string;           // z.B. "Guten Morgen! Ari ist bereit."
  status: 'idle' | 'working' | 'meeting';
  currentTask?: string;        // z.B. "Analysiere Kundendaten..."
  infoItems?: Array<{
    icon?: string;             // Emoji oder Icon-Name
    label: string;
    value: string;
  }>;
}
```

**Darstellung:**
- Großes Ari-Logo/Avatar
- Begrüßungstext
- Aktueller Status
- Uhrzeit/Datum
- Optionale Info-Items (Wetter, nächster Termin, etc.)

**Anwendungsfälle:**
- Idle-Screen wenn nichts aktiv ist
- "Ari arbeitet gerade an..." Anzeige
- Grundlegende Firmeninfos

---

### 3.2 TextWidget

Zeigt formatierten Text, Markdown oder einfache Nachrichten.

```typescript
interface TextWidgetData {
  content: string;             // Markdown-fähiger Text
  variant?: 'default' | 'info' | 'warning' | 'success' | 'error';
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
}
```

**Darstellung:**
- Markdown wird gerendert (Überschriften, Listen, Code-Blöcke, Links)
- Farbliche Varianten für verschiedene Kontexte
- Scrollbar bei langem Inhalt

**Anwendungsfälle:**
- Ari teilt Ergebnisse mit ("Analyse abgeschlossen: ...")
- Meeting-Notizen / Brainstorming-Ergebnisse
- Statusmeldungen
- Aufgabenlisten
- Kundennachrichten anzeigen

---

### 3.3 FileViewerWidget

Zeigt Dateien direkt im Dashboard an.

```typescript
interface FileViewerWidgetData {
  fileType: 'pdf' | 'image' | 'excel' | 'csv' | 'other';
  fileName: string;            // Anzeigename
  fileUrl: string;             // URL zur Datei (vom Backend serviert)
  // Für Bilder:
  alt?: string;
  // Für Excel/CSV Vorschau:
  previewData?: {
    headers: string[];
    rows: string[][];
  };
}
```

**Darstellung:**
- **Bilder:** Direkte Anzeige, skaliert auf Widget-Größe
- **PDF:** Eingebetteter PDF-Viewer (iframe oder pdf.js)
- **Excel/CSV:** Tabellenvorschau mit Header und ersten Zeilen
- **Andere:** Download-Link mit Dateiinfo

**Backend-Unterstützung:**
- `POST /api/files/upload` - Datei hochladen
- `GET /api/files/:id` - Datei abrufen
- Dateien werden im Backend temporär gespeichert (PoC: im Filesystem)

**Anwendungsfälle:**
- Ari zeigt ein Ergebnis-PDF an
- Bilder/Screenshots präsentieren
- Excel-Tabelle in Meeting durchgehen
- Kundendokumente anzeigen

---

### 3.4 HTMLRendererWidget

Ari erstellt HTML/SVG/CSS-Artefakte und rendert sie live im Dashboard. Das ist die **kreative Werkstatt**.

```typescript
interface HTMLRendererWidgetData {
  html: string;                // Vollständiges HTML (wird in Sandbox gerendert)
  sandbox?: boolean;           // Default: true - iframe Sandbox
  // Alternativ für einfache Fälle:
  svgContent?: string;         // Reines SVG
}
```

**Darstellung:**
- HTML wird in einem sandboxed iframe gerendert
- SVG kann direkt inline dargestellt werden
- Volle CSS-Unterstützung innerhalb des Artefakts

**Sicherheit:**
- iframe mit `sandbox` Attribut (kein Zugriff auf Parent)
- Kein JavaScript-Zugriff auf das Dashboard selbst
- Content Security Policy

**Anwendungsfälle:**
- Ari baut ein kleines interaktives Tool (Rechner, Formular)
- Organigramm als SVG skizzieren
- Flowcharts / Diagramme
- Interaktive Prototypen
- Datenvisualisierungen die über Standard-Charts hinausgehen

---

## 4. API-Spezifikation

### 4.1 Base URL

- Development: `http://localhost:3000`
- Production: `http://192.168.2.70:3000`

### 4.2 Widget-Endpoints

#### GET /health
```json
{ "status": "ok", "timestamp": "2026-01-28T10:00:00Z", "widgets": 3 }
```

#### GET /api/widgets
Alle Widgets abrufen.

**Response:**
```json
{
  "widgets": [
    {
      "id": "uuid-123",
      "type": "home",
      "title": "Ari Status",
      "data": { "status": "idle", "greeting": "Guten Morgen!" },
      "position": { "x": 0, "y": 0, "w": 12, "h": 4 },
      "createdAt": "2026-01-28T10:00:00Z",
      "updatedAt": "2026-01-28T10:00:00Z"
    }
  ]
}
```

#### POST /api/widgets
Widget erstellen.

**Request:**
```json
{
  "type": "home | text | file | html",
  "title": "Widget Title",
  "data": { },
  "position": { "x": 0, "y": 0, "w": 6, "h": 3 }
}
```

**Response:** `201` - Das erstellte Widget mit generierter ID.

#### PUT /api/widgets/:id
Widget aktualisieren (Partial Update).

**Request:**
```json
{
  "title?": "Neuer Titel",
  "data?": { },
  "position?": { }
}
```

**Response:** `200` - Das aktualisierte Widget.

#### DELETE /api/widgets/:id
Widget löschen.

**Response:**
```json
{ "success": true, "id": "uuid-123" }
```

### 4.3 Datei-Endpoints (für FileViewerWidget)

#### POST /api/files/upload
Datei hochladen (multipart/form-data).

**Request:** FormData mit Feld `file`

**Response:**
```json
{
  "id": "file-uuid-456",
  "fileName": "report.pdf",
  "fileType": "pdf",
  "url": "/api/files/file-uuid-456",
  "size": 245000
}
```

#### GET /api/files/:id
Datei herunterladen/anzeigen.

**Response:** Datei-Binary mit korrektem Content-Type.

### 4.4 WebSocket Events

**Server → Client:**
```typescript
socket.emit('widget:created', widget);     // Neues Widget
socket.emit('widget:updated', widget);     // Widget geändert
socket.emit('widget:deleted', { id });     // Widget entfernt
```

**Client → Server:**
```typescript
socket.emit('widget:subscribe', { widgetId });   // Für später
```

---

## 5. Technologie-Stack

| Bereich | Technologie | Notizen |
|---------|-------------|---------|
| **Frontend** | React 18 + TypeScript | |
| | Vite 5 | Build Tool |
| | Tailwind CSS 3 | Styling |
| | **shadcn/ui** | UI-Komponenten (Card, Button, Badge, etc.) |
| | react-markdown | Markdown-Rendering für TextWidget |
| | Socket.io Client | WebSocket |
| **Backend** | Node.js 20 + Express | |
| | TypeScript | |
| | Socket.io | WebSocket Server |
| | multer | Datei-Upload |
| | uuid | Widget/File IDs |
| | In-Memory Storage | Kein DB für PoC |
| **Deployment** | Docker + docker-compose | |

---

## 6. UI-Layout

### 6.1 Grundstruktur

```
┌─────────────────────────────────────────────────────────────┐
│  ARI DASHBOARD                    ● Connected    28.01.2026 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   HomeWidget                        │    │
│  │          🤖 Ari ist bereit                          │    │
│  │       "Guten Morgen! Keine aktiven Aufgaben."       │    │
│  │                   10:30 Uhr                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  (Weitere Widgets erscheinen wenn Ari sie erstellt)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Aktiver Zustand (Beispiel: Ari arbeitet)

```
┌─────────────────────────────────────────────────────────────┐
│  ARI DASHBOARD                    ● Connected    28.01.2026 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────┐  ┌──────────────────────────────┐    │
│  │   Ari Status      │  │   Analyse-Ergebnis           │    │
│  │  🤖 Arbeitet...   │  │                              │    │
│  │  "Analysiere      │  │   ## Zusammenfassung          │    │
│  │   Kundendaten"    │  │   - 23 neue Anfragen          │    │
│  │                   │  │   - 5 offene Tickets          │    │
│  └───────────────────┘  │   - **Wichtig:** Kunde X...   │    │
│                         └──────────────────────────────┘    │
│  ┌───────────────────┐  ┌──────────────────────────────┐    │
│  │   report.pdf      │  │   Organigramm (HTML)         │    │
│  │  ┌─────────────┐  │  │  ┌──────────────────────┐    │    │
│  │  │  PDF View   │  │  │  │  [SVG/HTML Artefakt]  │    │    │
│  │  │             │  │  │  │                       │    │    │
│  │  └─────────────┘  │  │  └──────────────────────┘    │    │
│  └───────────────────┘  └──────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.3 Grid-System
- **12 Spalten**
- Position: `{ x, y, w, h }` (x: 0-11, w: 1-12)
- Widgets werden per API positioniert
- Kein Drag&Drop im PoC

---

## 7. Dateistruktur (Ziel)

```
ari-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # shadcn/ui Komponenten
│   │   │   ├── widgets/
│   │   │   │   ├── HomeWidget.tsx
│   │   │   │   ├── TextWidget.tsx
│   │   │   │   ├── FileViewerWidget.tsx
│   │   │   │   └── HTMLRendererWidget.tsx
│   │   │   ├── Dashboard.tsx        # Haupt-Layout + Grid
│   │   │   ├── WidgetContainer.tsx  # Widget-Wrapper (Card + Header)
│   │   │   └── Header.tsx           # Dashboard-Kopfzeile
│   │   ├── hooks/
│   │   │   └── useSocket.ts         # WebSocket Hook
│   │   ├── lib/
│   │   │   ├── socket.ts            # Socket.io Client Setup
│   │   │   ├── api.ts               # REST API Client
│   │   │   └── utils.ts             # shadcn/ui cn() Helper
│   │   ├── types/
│   │   │   └── widget.ts            # Shared TypeScript Types
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css                # Tailwind + Dark Mode Base
│   ├── components.json              # shadcn/ui Config
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── widgets.ts           # Widget CRUD Endpoints
│   │   │   ├── files.ts             # File Upload/Download
│   │   │   └── health.ts            # Health Check
│   │   ├── services/
│   │   │   ├── widgetStore.ts       # In-Memory Widget Store
│   │   │   ├── fileStore.ts         # File Storage (Filesystem)
│   │   │   └── socketService.ts     # WebSocket Event Handling
│   │   ├── types/
│   │   │   └── widget.ts            # TypeScript Types
│   │   └── index.ts                 # Express + Socket.io Setup
│   └── ...
│
├── docs/
│   └── spec-01-poc-definition.md    # Diese Datei
│
└── docker-compose.yml
```

---

## 8. Beispiel-Szenario: Ari erstellt Content

### Schritt 1: Ari zeigt an, dass er arbeitet
```bash
curl -X PUT http://localhost:3000/api/widgets/home-1 \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "status": "working",
      "currentTask": "Analysiere Quartalsbericht Q4..."
    }
  }'
```

### Schritt 2: Ari erstellt ein Ergebnis-Widget
```bash
curl -X POST http://localhost:3000/api/widgets \
  -H "Content-Type: application/json" \
  -d '{
    "type": "text",
    "title": "Quartalsbericht Q4 - Zusammenfassung",
    "data": {
      "content": "## Ergebnisse\n\n- Umsatz: +12%\n- Neue Kunden: 8\n- **Achtung:** Projekt X verzögert",
      "variant": "info"
    },
    "position": { "x": 6, "y": 0, "w": 6, "h": 4 }
  }'
```

### Schritt 3: Ari zeigt ein PDF an
```bash
# Datei hochladen
curl -X POST http://localhost:3000/api/files/upload \
  -F "file=@report.pdf"

# Widget mit Datei erstellen
curl -X POST http://localhost:3000/api/widgets \
  -H "Content-Type: application/json" \
  -d '{
    "type": "file",
    "title": "Quartalsbericht PDF",
    "data": {
      "fileType": "pdf",
      "fileName": "report.pdf",
      "fileUrl": "/api/files/file-uuid-456"
    },
    "position": { "x": 0, "y": 4, "w": 6, "h": 5 }
  }'
```

### Schritt 4: Ari baut ein HTML-Artefakt
```bash
curl -X POST http://localhost:3000/api/widgets \
  -H "Content-Type: application/json" \
  -d '{
    "type": "html",
    "title": "Umsatz-Übersicht",
    "data": {
      "html": "<!DOCTYPE html><html><head><style>body{font-family:sans-serif;background:#1a1a2e;color:white;padding:20px} .bar{background:linear-gradient(90deg,#00d2ff,#3a7bd5);height:30px;margin:8px 0;border-radius:4px}</style></head><body><h2>Umsatz pro Quartal</h2><div class=\"bar\" style=\"width:60%\">Q1: 60k</div><div class=\"bar\" style=\"width:80%\">Q2: 80k</div><div class=\"bar\" style=\"width:75%\">Q3: 75k</div><div class=\"bar\" style=\"width:95%\">Q4: 95k</div></body></html>"
    },
    "position": { "x": 6, "y": 4, "w": 6, "h": 5 }
  }'
```

---

## 9. Offene Entscheidungen

| # | Frage | Vorschlag PoC |
|---|-------|---------------|
| 1 | Widget-Anordnung | Per Position in API-Request, kein Auto-Layout |
| 2 | Max. Widget-Anzahl | Kein Limit im PoC |
| 3 | Home-Widget Verhalten | Immer vorhanden, wird kleiner wenn andere Widgets da sind |
| 4 | Datei-Speicherung | Temporär im Filesystem (uploads/ Ordner) |
| 5 | HTML-Sandbox-Level | iframe sandbox="allow-scripts allow-same-origin" |

---

## 10. Spätere Phasen (nach PoC)

| Phase | Feature |
|-------|---------|
| **Phase 2** | Canvas-Widget (Zeichenfläche/Whiteboard) |
| | Notification-Widget (Kundenanfragen, Alerts) |
| | Task-Widget (Ari's Aufgabenliste) |
| **Phase 3** | Drag & Drop Widget-Positionierung |
| | Persistente Speicherung (SQLite/Postgres) |
| | Layout-Presets speichern/laden |
| **Phase 4** | User-Auth (für Remote-Zugriff) |
| | Mehrere Dashboard-Seiten |
| | Chart-Widget (Recharts) |

---

## 11. Abnahmekriterien PoC

Das PoC gilt als erfolgreich, wenn:

- [ ] Dashboard läuft im Dark Mode auf Fullscreen (TV-tauglich)
- [ ] HomeWidget zeigt Ari-Status und wechselt zwischen idle/working
- [ ] TextWidget rendert Markdown korrekt
- [ ] FileViewerWidget zeigt ein Bild und ein PDF an
- [ ] HTMLRendererWidget rendert ein von Ari erstelltes HTML-Artefakt
- [ ] `POST /api/widgets` erstellt Widget → erscheint in Echtzeit im Dashboard
- [ ] `PUT /api/widgets/:id` aktualisiert Widget → Update in Echtzeit sichtbar
- [ ] `DELETE /api/widgets/:id` entfernt Widget → verschwindet in Echtzeit
- [ ] Docker-Compose startet beide Services korrekt
- [ ] Datei-Upload und -Anzeige funktioniert

---

*Dokument erstellt: 2026-01-28*
*Version 2.0 - Aktualisiert nach Anforderungsklärung*
*RE Automation GmbH*
