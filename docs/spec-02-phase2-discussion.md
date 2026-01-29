# Ari Dashboard - Phase 2 Besprechungspunkte

**Version:** 1.1
**Datum:** 2026-01-28
**Status:** IN BEARBEITUNG - Punkte 1-4, 8 erledigt, Auto-Scaling implementiert
**Autor:** RE Automation GmbH

---

## Übersicht PoC-Status

**Fertig:**
- 4 Widget-Typen (Home, Text, File, HTML) - funktionieren
- REST API (CRUD Widgets + File-Upload)
- WebSocket Echtzeit-Updates
- Light + Dark Theme mit Toggle (RE Automation Design-System)
- API-gesteuertes Layout
- RE Automation Logo im Header
- Geist Font

**Offen / Nächste Schritte:**
Folgende Punkte müssen besprochen und entschieden werden.

---

## Besprechungspunkt 1: Ari Sidebar (Status + Activity Feed) - ENTSCHIEDEN

**Kontext:**
Neue Anforderung. Eine vertikale Leiste am Rand des Dashboards, die Ari's Zustand und Aktivität zeigt. Soll einklappbar sein (Maus vorhanden, aber minimale Bedienung gewünscht).

### 1a) Sidebar-Position
**Entscheidung: Rechts.**

### 1b) Sidebar-Inhalte
**Entscheidung: Drei Bereiche bestätigt:**
1. **Ari-Status** (oben): Idle / Working / Agenten laufen - mit visuellem Indikator
2. **Laufende Tasks** (mitte): Welche Agenten/Tasks gerade aktiv sind, mit Fortschritt wenn möglich
3. **Activity Feed** (unten, scrollbar): Chronologische Meldungen von Ari - Meilensteine ("Analyse gestartet", "PDF erstellt", "Task abgeschlossen")

**OFFEN: Ari-Avatar/Icon** - Das visuelle Element für den Ari-Status (oben in der Sidebar) muss noch gestaltet werden. Eventuell animiert. Wird separat besprochen (siehe Anhang A).

### 1c) API-Design für Sidebar
**Entscheidung: Eigene Endpoints (Option A).**
```
PUT  /api/status          - Ari-Status setzen (idle/working/agents)
GET  /api/status          - Aktuellen Status abrufen
POST /api/feed            - Neuer Feed-Eintrag
GET  /api/feed            - Feed abrufen (mit Pagination)
```
WebSocket-Events für Echtzeit:
```
socket.emit('status:updated', { status, ... })
socket.emit('feed:new', { entry })
```

### 1d) Minimieren (NICHT Ausblenden)
**Entscheidung: Sidebar wird NICHT komplett versteckt.** Per Klick zwischen zwei Stufen umschaltbar:
1. **Erweitert:** Volle Breite - Avatar, laufende Tasks, Activity Feed
2. **Minimiert:** Schmaler Streifen - Avatar bleibt sichtbar, minimale Info (z.B. Anzahl aktiver Tasks, letzter Feed-Eintrag als Einzeiler)

Ari ist IMMER auf dem Bildschirm sichtbar - er verschwindet nie komplett.

---

### Anhang A: Ari-Avatar/Icon - IN ARBEIT

**Entscheidung:** Illustrierte Figur, kein abstraktes Symbol. Zustandsabhängig (4 Varianten).

**Zwei Charakter-Entwürfe erstellt** (via Gemini):
- **Donkey (Esel):** Brille, Labormantel, grüne Akzente. Sauberer ausgeschnitten.
- **Goat (Ziege):** Ähnlicher Stil, brauner Charakter. Noch Label-Texte/Artefakte im Bild.

**Dateien:** `assets/ari-avatars/` (donkey_*.png, goat_*.png)

**Umschaltbar:** Beide Varianten sollen im Dashboard wählbar sein (einfacher Switch, keine große Programmierung).

**Noch zu tun:**
- [ ] Hintergründe sauber freistellen (transparent PNG)
- [ ] Label-Texte aus Goat-Bildern entfernen
- [ ] "Agents"-Variante überarbeiten (Multi-Figur wird zu klein in Sidebar)
- [ ] Einheitliche Bildgröße (quadratisch, z.B. 256x256)
- [ ] Finale Entscheidung ob Donkey, Goat oder beide

**Zustände:**
| Zustand | Beschreibung | CSS-Animation dazu |
|---------|-------------|-------------------|
| Idle | Entspannt, lächelnd | Sanftes Pulsieren / "Atmen" |
| Working | Konzentriert, mit Screen | Leichtes Wippen |
| Agents | Aktiv, Zahnräder | Rotation der Zahnräder (CSS overlay) |
| Error | Besorgt, rotes X | Leichtes Schütteln |

**Format:** PNG (von Gemini), Animation per CSS im Dashboard.

---

## Besprechungspunkt 2: Notification/Task-Widget vs. Sidebar

**Kontext:**
In der PoC-Spec standen "Notification-Widget" und "Task-Widget" als Phase 2 Features. Die neue Sidebar-Anforderung überschneidet sich damit.

**Frage:**
Ersetzen die Sidebar-Bereiche (Status + Tasks + Feed) die geplanten separaten Widgets komplett?

**Optionen:**
- **A)** Sidebar ersetzt beides komplett - Notifications und Tasks leben nur in der Sidebar
- **B)** Sidebar zeigt Kurzversion, aber es gibt zusätzlich ein Widget für Details (z.B. Task-Widget zeigt ausführliche Aufgabenliste als Widget im Grid)
- **C)** Sidebar für laufende Sachen, eigenes Notification-Widget für wichtige Alerts die Aufmerksamkeit brauchen (z.B. große rote Kachel bei dringender Kundenanfrage)

**Empfehlung:** Option C - Sidebar für den laufenden Betrieb, aber bei wichtigen Alerts kann Ari zusätzlich ein auffälliges Widget im Grid erstellen. Das gibt Flexibilität.

**Entscheidung: Option C - Sidebar für laufenden Betrieb, Widget für Alerts.**
- Routine-Meldungen (Task gestartet, fertig, etc.) → Sidebar-Feed
- Dringende/wichtige Sachen (Kundenanfrage, Fehler, Alert) → Ari erstellt ein auffälliges Widget im Grid
- Ari entscheidet selbst, was "Widget-würdig" ist vs. nur Feed-Eintrag
- Kein separates Notification-Widget oder Task-Widget nötig - wird durch Sidebar + bestehende Widget-Typen abgedeckt

---

## Besprechungspunkt 3: Auto-Scaling Widget-Inhalte

**Kontext:**
Im Screenshot sichtbar: Content überläuft die Widget-Grenzen. Besonders beim HomeWidget (Info-Items abgeschnitten) und bei File-Widgets (Scroll-Indikatoren).

**Teilfragen:**

### 3a) Strategie pro Widget-Typ
| Widget | Vorschlag |
|--------|-----------|
| **Home** | Text verkleinern bis es passt, unwichtige Items ausblenden |
| **Text** | Schriftgröße anpassen ODER Überlauf mit "..." abschneiden |
| **File (Bild)** | `object-fit: contain` - Bild skaliert auf Container |
| **File (PDF)** | PDF-Viewer skaliert auf Container (kein Scroll) |
| **HTML** | iframe skaliert via CSS transform auf Container |

### 3b) Generelle Strategie
- **A)** Kein Scroll, alles muss in den Container passen (strikt)
- **B)** Scroll als Fallback erlauben, aber Content versucht zuerst zu skalieren
- **C)** Für TV-Display: Kein Scroll. Für interaktive Nutzung (Meeting mit Maus): Scroll erlauben

**Entscheidung: Hybrid B/C - Zwei Ebenen:**

1. **Display-Modus (Default):** Kein Scroll, Content wird automatisch skaliert/eingepasst. Optimiert für TV-Display ohne Interaktion.
2. **Interaktiv-Modus:** Per Klick (User!) umschaltbar - dann Scroll erlaubt, Original-Größen. Für Meetings mit Maus, wenn man Details lesen will.
3. **Ari kann zusätzlich** pro Widget `scrollable: true` setzen, wenn er weiß dass der Inhalt lang ist (z.B. Meeting-Protokoll).

**Wichtig:** Der User muss den Modus selbst wechseln können, ohne Ari zu bitten. Toggle im Dashboard (z.B. im Header oder pro Widget).

**Auto-Scale Strategien pro Widget-Typ:**
| Widget | Display-Modus |
|--------|---------------|
| **Home** | Text/Items verkleinern, unwichtige Items ausblenden |
| **Text** | Schriftgröße anpassen, Overflow mit "..." |
| **File (Bild)** | `object-fit: contain` |
| **File (PDF)** | PDF-Viewer skaliert auf Container |
| **HTML** | iframe via CSS `transform: scale()` einpassen |

**Hinweis:** Details werden im laufenden Betrieb nachjustiert.

### Implementierung (2026-01-29)

**Neue Dateien:**
- `frontend/src/hooks/useDisplayMode.ts` - Hook und Context für Display-Modus
- `frontend/src/components/DisplayModeProvider.tsx` - Context Provider
- `frontend/src/components/AutoScaleWrapper.tsx` - Wrapper für Widget-Content Skalierung

**Änderungen:**
- `frontend/src/App.tsx` - DisplayModeProvider hinzugefügt
- `frontend/src/components/Header.tsx` - Display-Modus Toggle (Monitor/Maus-Icon)
- `frontend/src/components/WidgetContainer.tsx` - AutoScaleWrapper für skalierbare Widgets
- `frontend/src/types/widget.ts` - `scrollable` Feld hinzugefügt
- `backend/src/types/widget.ts` - `scrollable` Feld hinzugefügt

**Features:**
- Global Toggle im Header: Monitor-Icon = Display-Modus, Maus-Icon = Interaktiv-Modus
- Per-Widget Toggle: Kleine Maximize-Button unten rechts wenn Content skaliert wird
- `widget.scrollable = true` von Ari setzbar für erzwungenen Scroll-Modus

---

## Besprechungspunkt 4: Design / Visueller Stil - ERLEDIGT

**Kontext:**
Aktuelles Light Theme funktioniert, sieht aber "noch nicht modern genug" aus. Gewünscht: Modern, clean, nicht bunt.

**Entscheidung:** Linear-Stil als Basis, kombiniert mit RE Automation Design-System aus MultiFab Control.

**Umgesetzt:**
- **Stil-Richtung:** Linear-inspiriert (subtile Schatten, polierte Optik)
- **Farbsystem:** MultiFab Control übernommen - rein neutrale Grautöne (Hue 0), RE-Grün `HSL(81, 44%, 39%)` als Akzent
- **Schatten:** Custom 6-stufige Shadow-Skala (mehrstufig, weich)
- **Kanten:** `border-radius: 0.5rem` (MultiFab-Linie)
- **Hintergrund:** Flach neutral-grau `HSL(0, 0%, 96%)`
- **Widget-Karten:** Border + subtiler Shadow (Karten "schweben")
- **Typografie:** Geist (Sans + Mono) - wie MultiFab
- **Akzentfarbe:** RE-Grün statt Blau (Firmenfarbe, dezent eingesetzt)
- **Dark/Light Toggle:** Implementiert mit localStorage-Persistenz
- **Logo:** RE Automation SVG im Header

**Status:** IMPLEMENTIERT

---

## Besprechungspunkt 5: Persistente Speicherung

**Kontext:**
Aktuell ist alles In-Memory - bei Backend-Neustart ist alles weg. Frage ist, was persistent sein sollte.

**Was könnte persistent gespeichert werden:**
| Daten | Nutzen |
|-------|--------|
| **Widget-Layout** | Dashboard sieht nach Neustart gleich aus |
| **Activity Feed** | Verlauf von Ari's Aktivitäten bleibt erhalten |
| **Hochgeladene Dateien** | Schon jetzt auf Filesystem, aber Metadaten gehen verloren |
| **Layout-Presets** | Verschiedene Layouts speichern/wechseln (z.B. "Meeting", "Idle", "Präsentation") |

### 5a) Speicher-Technologie
- **A)** SQLite (einfach, kein extra Service)
- **B)** JSON-Dateien (noch einfacher)
- **C)** PostgreSQL (robuster, aber Overhead)

**Entscheidung: ZURÜCKGESTELLT - nicht kritisch für jetzt.**

Alles läuft erstmal weiter In-Memory. Wird nachgeholt wenn:
- Der Feed-Verlauf nach Neustart wichtig wird
- Layout-Presets gebraucht werden
- Der Betrieb stabiler laufen muss (Deployment-Phase)

Technologie-Tendenz wenn es soweit ist: SQLite (kein extra Service, trotzdem echte DB).

---

## Besprechungspunkt 8: Briefing-Preset (NEU)

**Kontext:**
Ein vordefiniertes Dashboard-Layout das:
- Standardmäßig beim Start geladen wird
- Nach ~30 Minuten Inaktivität automatisch wieder geladen wird (Screensaver-Effekt)
- Den täglichen Überblick für das Team zeigt

### Inhalt des Briefing-Presets

| Kachel | Beschreibung | Datenquelle |
|--------|--------------|-------------|
| **Tagesinformationen** | Datum, Begrüßung, Ari-Status | Ari via API |
| **To-Dos Team** | Offene Aufgaben für alle Mitarbeiter (aktuell: User, Florian, Ari; später mehr) | Ari via API (evtl. Integration mit Task-System?) |
| **Kalender/Meetings** | Übersicht anstehender Termine heute | Ari via Kalender-Integration (Google/Outlook?) |
| **Wetter** | Aktuelles Wetter + Vorhersage | Wetter-API direkt oder via Ari |
| **Mittagessen** | Angebote umliegender Restaurants | Ari recherchiert / via API? |
| **News** | Dezenter, kuratierter Newsfeed - keine Laufschrift, relevant für RE Automation | Ari kuratiert |

### Offene Fragen

**8a) Preset-Mechanismus:**
- Wie werden Presets gespeichert? (API: `POST /api/presets`, `GET /api/presets/:name`)
- Wer erstellt das Preset? (Ari via API, oder manuell?)
- Auto-Load nach Inaktivität: Timer im Frontend oder Backend-gesteuert?

**8b) Kalender-Integration:**
- Welcher Kalender? Google Calendar? Outlook? iCal?
- Zugriff: API-Key, OAuth, oder Ari hat bereits Zugang und postet nur die Daten?

**8c) Wetter:**
- Standort: Laupheim / 88471?
- API: OpenWeatherMap (kostenloser Tier), oder Ari fetcht es selbst?
- Eigenes Widget-Type "weather" oder HTML-Widget das Ari befüllt?

**8d) Restaurant/Mittagessen:**
- Woher kommen die Daten? Manuelle Pflege, Lieferando-API, Google Places?
- Oder: Ari recherchiert täglich und postet als Text-Widget?

**8e) News:**
- RSS-Feeds? Oder Ari aggregiert selbst?
- Welche Themen? Industrie, Automation, Lokales, Wirtschaft?
- Dezente Darstellung: Kein Ticker, sondern statische Liste die sich sanft aktualisiert

### Entscheidungen

**8a) Architektur:** Variante A - "Ari macht alles"
- Dashboard ist primär Display
- Ari postet Kalender, Restaurant, News als Text/HTML-Widgets
- Einzige Ausnahme: Wetter-Widget mit direkter API-Integration

**8b) Kalender:** Ari bekommt Zugriff, filtert was wichtig ist, postet Ergebnis. Keine direkte Dashboard-Integration.

**8c) Wetter:** Eigenes Widget mit direkter API (OpenWeatherMap o.ä.)
- Standort: **Stuttgart Bad Cannstatt, 70372**
- Neuer Widget-Typ: `weather`

**8d) Restaurant/Mittagessen:** Ari recherchiert täglich, postet als Text/HTML-Widget.

**8e) News:** Ari kuratiert komplett. KI entscheidet was relevant ist. Keine RSS-Feeds.

**8f) Briefing-Button:** Ja, Button im UI (Header?) zum manuellen Wechseln auf Briefing-Preset.

**8g) Preset-Wechsel-Logik:**
- **Briefing = Default/Ruhezustand des Dashboards** (nicht von Ari!)
- Beim Start wird Briefing geladen
- Ari kann jederzeit per API ein anderes Preset laden oder Widgets posten
- Wenn Ari Widgets postet → Briefing weicht den neuen Inhalten
- **Zurück zum Briefing:** Ari entscheidet wann und lädt es aktiv (Option 1)
- **Manueller Button:** User kann jederzeit per Klick zum Briefing wechseln

**Beispiel-Szenarien:**
1. Morgens: Dashboard startet → Briefing (Wetter, Kalender, Todos, News)
2. User: "Ari, zeig mir die Q4-Zahlen" → Ari postet Chart-Widget, Briefing verschwindet
3. User fertig, klickt Briefing-Button ODER Ari sagt "fertig" und lädt Briefing selbst
4. Meeting startet → Ari lädt Meeting-Preset (Notizen-Widget, Präsentationsfläche)
5. Meeting endet → Ari lädt Briefing

**Presets die wir brauchen:**
- `briefing` - Default, täglicher Überblick
- `meeting` - Für Besprechungen (Mitschrift, Präsentation)
- (weitere nach Bedarf)

**Status:** ENTSCHIEDEN

---

## Besprechungspunkt 6: Canvas-Widget

**Kontext:**
Als "gut zu haben" eingestuft, aber nicht höchste Priorität. Für später vormerken.

**Frage:** Was soll das Canvas-Widget können?
- Whiteboard zum Freihand-Zeichnen?
- Ari zeichnet/skizziert darauf?
- Beide gleichzeitig (kollaborativ)?
- Oder reicht das HTML-Widget für visuelle Artefakte?

**Entscheidung:** _[wird später besprochen]_

---

## Besprechungspunkt 7: Deployment-Strategie

**Kontext:**
Docker-Container erst wenn ein guter Stand erreicht ist. Aber schon mal klären:

**Fragen:**
- Soll es ein einzelner Container (Frontend + Backend) oder zwei getrennte sein?
- Frontend als statische Dateien via nginx oder als eigener dev-Server?
- Automatisches Rebuild bei Git-Push?

**Entscheidung:** _[wird später besprochen, wenn Stand gut ist]_

---

## Zusammenfassung: Prioritäten-Reihenfolge

| Prio | Thema | Status |
|------|-------|--------|
| ~~1~~ | ~~Design-Refresh (Punkt 4)~~ | ERLEDIGT + IMPLEMENTIERT |
| ~~2~~ | ~~Ari Sidebar (Punkt 1 + 2)~~ | ENTSCHIEDEN + IMPLEMENTIERT |
| ~~3~~ | ~~Auto-Scaling (Punkt 3)~~ | ERLEDIGT + IMPLEMENTIERT |
| **4** | **Briefing-Preset + Wetter-Widget (Punkt 8)** | **ENTSCHIEDEN - bereit zur Impl.** |
| 5 | Persistente Speicherung (Punkt 5) | ZURÜCKGESTELLT (aber bald nötig für Presets) |
| 6 | Canvas-Widget (Punkt 6) | ZURÜCKGESTELLT |
| 7 | Docker Deployment (Punkt 7) | ZURÜCKGESTELLT |
| **!** | **Ari-Avatar/Icon (Anhang A)** | **IN ARBEIT - Bilder vorhanden, nicht final** |

---

## Ablauf

Wir gehen die Punkte der Reihe nach durch:
1. Punkt besprechen → Fragen klären
2. Empfehlung/Entscheidung dokumentieren
3. Nächster Punkt

Nach Abschluss aller Punkte → Spec aktualisieren → Implementierung starten.

---

*Erstellt: 2026-01-28*
*RE Automation GmbH*
