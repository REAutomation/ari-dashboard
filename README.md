# Ari Dashboard

**AI-powered Dashboard System for Moltbot Assistant**

Ari Dashboard ist ein React-basiertes, API-gesteuertes Dashboard-System, das vom Moltbot AI-Assistenten "Ari" gesteuert wird.

![Dashboard Preview](https://via.placeholder.com/800x400?text=Dashboard+Preview)

---

## Features

- ✅ **Widget-basiertes Layout**: Modulares Dashboard mit verschiedenen Widget-Typen
- ✅ **Echtzeit-Updates**: WebSocket-basierte Live-Aktualisierung
- ✅ **API-Steuerung**: Vollständige REST API für externe Steuerung
- ✅ **TypeScript**: Type-safe Frontend und Backend
- ✅ **Responsive**: Optimiert für große TV-Displays
- ✅ **Docker-Ready**: Ein-Klick Deployment via docker-compose

---

## Quick Start

```bash
# Repository clonen
git clone https://github.com/REAutomation/ari-dashboard.git
cd ari-dashboard

# Mit Docker starten
docker-compose up -d

# Dashboard öffnen
open http://localhost:8080
```

---

## Widget Types

| Widget | Beschreibung | Verwendung |
|--------|--------------|------------|
| **Text** | Markdown-Text anzeigen | Nachrichten, Notizen |
| **Chart** | Diagramme (Line, Bar, Pie) | Metriken, Statistiken |
| **Status** | Status-Anzeige | Docker-Container, Server-Status |
| **Code** | Code mit Syntax-Highlighting | Scripts, Logs |
| **Image** | Bilder/Screenshots | Visualisierungen |

---

## API Beispiele

### Widget erstellen

```bash
curl -X POST http://localhost:3000/api/widgets \
  -H "Content-Type: application/json" \
  -d '{
    "type": "chart",
    "title": "Server CPU",
    "data": {
      "type": "line",
      "labels": ["10:00", "11:00", "12:00"],
      "datasets": [{
        "label": "CPU %",
        "data": [45, 60, 55]
      }]
    }
  }'
```

### Widget aktualisieren

```bash
curl -X PUT http://localhost:3000/api/widgets/abc123 \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "datasets": [{
        "data": [50, 65, 58]
      }]
    }
  }'
```

---

## Moltbot Integration

Ari kann das Dashboard über Moltbot Skills steuern:

```
User: "Ari, zeig mir die Docker-Container auf dem Dashboard"
Ari: → Ruft Docker-Status ab
     → Erstellt Status-Widget via API
     → Dashboard zeigt Container-Liste
```

---

## Development

### Frontend (React + TypeScript)

```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

### Backend (Node.js + Express)

```bash
cd backend
npm install
npm run dev      # http://localhost:3000
```

---

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, Socket.io
- **Deployment**: Docker, docker-compose

---

## Architecture

```
┌─────────────┐
│  Ari        │  HTTP POST / WebSocket
│  (Moltbot)  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│  Backend API     │
│  (Node.js)       │
│  - REST API      │
│  - WebSocket     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Frontend        │
│  (React)         │
│  - Dashboard     │
│  - Widgets       │
└──────────────────┘
```

---

## Documentation

Siehe [CLAUDE.md](./CLAUDE.md) für detaillierte Entwickler-Dokumentation.

---

## License

MIT License - Rentschler Engineering & Automation

---

## Links

- [Moltbot](https://github.com/moltbot/moltbot)
- [IT Infrastructure](https://github.com/REAutomation/internal-it-infrastructure)

---

**Made with ❤️ by Rentschler Engineering**
