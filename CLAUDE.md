# CLAUDE.md - Ari Dashboard Development Guide

> **WICHTIG**: Diese Datei ist die zentrale Anleitung für KI-Agenten die am Ari Dashboard arbeiten.

---

## 📁 Repository-Struktur

```
ari-dashboard/
├── frontend/                     # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── widgets/         # Dashboard Widgets
│   │   │   │   ├── DockerWidget.tsx
│   │   │   │   ├── CPUWidget.tsx
│   │   │   │   ├── ChartWidget.tsx
│   │   │   │   └── TextWidget.tsx
│   │   │   ├── Dashboard.tsx    # Haupt-Dashboard Layout
│   │   │   └── WidgetContainer.tsx
│   │   ├── lib/
│   │   │   └── socket.ts        # Socket.io Client
│   │   ├── types/
│   │   │   └── widget.ts        # TypeScript Types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── backend/                      # Node.js + Express API
│   ├── src/
│   │   ├── api/                 # REST Endpoints
│   │   │   ├── widgets.ts       # Widget CRUD
│   │   │   └── health.ts        # Health Check
│   │   ├── services/            # Business Logic
│   │   │   ├── widgetService.ts
│   │   │   └── socketService.ts
│   │   ├── types/
│   │   │   └── widget.ts        # TypeScript Types
│   │   └── index.ts             # Entry Point
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml
├── .gitignore
├── CLAUDE.md                     # Diese Datei
└── README.md                     # Projekt-Übersicht
```

---

## 🎯 Projekt-Übersicht

**Ari Dashboard** ist ein React-basiertes, API-gesteuertes Dashboard-System für den Moltbot AI-Assistenten "Ari".

### Hauptfunktionen:
- **Widget-basiertes Layout**: Mehrere Bereiche gleichzeitig anzeigen
- **Echtzeit-Updates**: Via WebSocket (Socket.io)
- **API-Steuerung**: Ari kann Widgets erstellen/aktualisieren via REST API
- **Responsive**: Optimiert für große TV-Displays
- **Typsicher**: TypeScript in Frontend und Backend

---

## 🔧 Tech Stack

| Bereich | Technologie | Version | Warum |
|---------|-------------|---------|-------|
| **Frontend** | React | 18.x | Modern, bewährt |
| | TypeScript | 5.x | Typsicherheit |
| | Vite | 5.x | Schnelles Build-Tool |
| | Tailwind CSS | 3.x | Utility-first Styling |
| | React-Grid-Layout | 1.x | Drag & Drop Widgets |
| | Socket.io Client | 4.x | WebSocket |
| | Chart.js / Recharts | - | Diagramme |
| **Backend** | Node.js | 20.x | JavaScript Runtime |
| | Express | 4.x | Web Framework |
| | TypeScript | 5.x | Typsicherheit |
| | Socket.io | 4.x | WebSocket Server |
| **Deployment** | Docker | - | Containerisierung |
| | docker-compose | - | Multi-Container Setup |

---

## 🚀 Getting Started

### Development (Lokal)

```bash
# Frontend
cd frontend
npm install
npm run dev       # http://localhost:5173

# Backend
cd backend
npm install
npm run dev       # http://localhost:3000
```

### Production (Docker)

```bash
docker-compose up -d

# Frontend: http://localhost:8080
# Backend API: http://localhost:3000
```

---

## 📡 API Endpoints

### Widget-Management

```bash
# Widget erstellen
POST /api/widgets
{
  "type": "chart|text|status|code",
  "title": "Widget Title",
  "data": { ... },
  "position": { x: 0, y: 0, w: 4, h: 2 }
}

# Widget aktualisieren
PUT /api/widgets/:id
{
  "data": { ... }
}

# Alle Widgets abrufen
GET /api/widgets

# Widget löschen
DELETE /api/widgets/:id

# Dashboard-Layout speichern
POST /api/layout
{
  "widgets": [ ... ]
}
```

### WebSocket Events

```javascript
// Server → Client
socket.emit('widget:created', { id, type, data });
socket.emit('widget:updated', { id, data });
socket.emit('widget:deleted', { id });

// Client → Server
socket.emit('widget:subscribe', { widgetId });
```

---

## 🧩 Widget Types

| Type | Beschreibung | Daten-Format |
|------|--------------|--------------|
| **text** | Einfacher Text/Markdown | `{ content: string }` |
| **chart** | Chart.js Diagramm | `{ type, labels, datasets }` |
| **status** | Status-Anzeige (Docker, CPU, etc.) | `{ items: [{ name, status, value }] }` |
| **code** | Code-Block mit Syntax-Highlighting | `{ language, code }` |
| **image** | Bild/Screenshot | `{ url }` |
| **iframe** | Externe URL einbetten | `{ url }` |

---

## 🔗 Integration mit Moltbot (Ari)

Ari kann via Moltbot Skill das Dashboard steuern:

```javascript
// Moltbot Skill Definition (in ~/clawd/skills/dashboard/)
{
  "name": "dashboard",
  "tools": [
    {
      "name": "show_chart",
      "url": "http://192.168.2.70:3000/api/widgets",
      "method": "POST",
      "schema": { ... }
    },
    {
      "name": "update_widget",
      "url": "http://192.168.2.70:3000/api/widgets/{id}",
      "method": "PUT"
    }
  ]
}
```

---

## 🎨 Styling Guidelines

- **Tailwind CSS**: Utility-first approach
- **Dark Mode**: Dashboard läuft im Dark Mode (für TV-Display)
- **Responsive**: Grid-Layout passt sich an
- **Animationen**: Smooth transitions für Updates

---

## 🧪 Testing

```bash
# Frontend Tests
cd frontend
npm run test

# Backend Tests
cd backend
npm run test

# E2E Tests
npm run test:e2e
```

---

## 📦 Deployment

### Auf Ubuntu-Docker VM (192.168.2.70)

```bash
cd /home/ubuntu/ari-dashboard
git pull
docker-compose down
docker-compose up -d --build

# Logs anschauen
docker-compose logs -f
```

### URL im Netzwerk
- **Dashboard**: http://192.168.2.70:8080
- **API**: http://192.168.2.70:3000
- **Health Check**: http://192.168.2.70:3000/health

---

## 🔒 Security

- **Kein Auth nötig**: Läuft nur im internen Netzwerk (192.168.2.x)
- **CORS**: Nur localhost und 192.168.2.x erlaubt
- **Rate Limiting**: API hat Rate Limits

---

## 📝 Konventionen

### Code Style
- **TypeScript**: Strict Mode
- **ESLint**: Airbnb Config
- **Prettier**: Auto-Formatting
- **Naming**: camelCase für Variablen, PascalCase für Components

### Git Commits
```
feat: Add DockerWidget component
fix: WebSocket reconnection bug
docs: Update API documentation
refactor: Simplify widget state management
```

### Branch Strategy
- `main`: Production-ready Code
- `develop`: Development Branch
- `feature/*`: Feature Branches

---

## 🐛 Troubleshooting

### Frontend startet nicht
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### WebSocket Connection Failed
- Prüfe ob Backend läuft: `curl http://localhost:3000/health`
- Prüfe CORS-Einstellungen in `backend/src/index.ts`

### Docker Build Fehler
```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```

---

## 📚 Wichtige Links

- **GitHub Repo**: https://github.com/REAutomation/ari-dashboard
- **Moltbot Repo**: https://github.com/moltbot/moltbot
- **IT-Infrastructure Repo**: https://github.com/REAutomation/internal-it-infrastructure
- **React Docs**: https://react.dev/
- **Socket.io Docs**: https://socket.io/docs/
- **Tailwind Docs**: https://tailwindcss.com/docs

---

## 🤝 Contributing

Siehe `README.md` für Contribution Guidelines.

---

*Stand: Januar 2026*
*Entwickelt für Rentschler Engineering & Automation*
