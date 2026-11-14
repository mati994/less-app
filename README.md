# less.

**Ein ruhiger Begleiter, um unerwünschte Gewohnheiten zu reduzieren.**

Dies ist die installierbare Web-App (PWA). Der leuchtende, sich öffnende Fortschrittsring ist ihr visueller Mittelpunkt. Die Oberfläche ist auf Deutsch und wird über GitHub Pages bereitgestellt.

## Aufbau

- `index.html` – schlanke HTML-Hülle und Splash-Logo
- `styles/base.css` – Bestandsstyles für gemeinsame Komponenten (werden schrittweise bereinigt)
- `styles/layout.css` – Dashboard, Verlauf und mobile Anordnung
- `styles/ring.css` – Glühen und Bewegung des Fortschrittsrings
- `src/config.js` – Konstanten, Icons und Datumshelfer
- `src/storage.js` – Datenmodell, Speicherung und Kennzahlen
- `src/views.js` – Darstellung der Screens
- `src/ring.js` – Fortschrittsgeometrie, Intro und Animation
- `src/app.js` – Navigation, Check-in-Ablauf und Ereignisse
- `src/register-sw.js`, `service-worker.js` – Offline-Support
- `ring-lab.html` – eigenständiger Ring-Prototyp, keine gespeicherten Check-ins
- `AGENTS.md` und `docs/` – Projektregeln, Architektur und Designprinzipien

## Entwickeln und prüfen

Keine externen Laufzeitpakete und kein Build-Schritt. Zum lokalen Ausprobieren einen statischen Server im Repo-Verzeichnis starten, z. B. `python3 -m http.server 8000`; dann `http://localhost:8000/` öffnen. ES-Module funktionieren nicht zuverlässig über `file://`.

Optional: Node.js 20+ und `npm test` (Tests benutzen ausschließlich Node-Bordmittel). Die Ansicht zusätzlich auf einem iPhone in Safari testen, besonders Intro, Animation, Scrollen, Check-ins und Neuaufruf.

**Live:** https://mati994.github.io/less-app/ – GitHub Pages verwendet den Branch `main`. Neue Arbeit zunächst in einem Feature-Branch entwickeln; erst nach Prüfung und Freigabe mergen.

**Wichtig:** Die Daten liegen lokal im Browser unter dem unveränderten Schlüssel `less.prototype.v1`. Kein Login, keine serverseitige Synchronisation. Browserdaten nicht ohne vorherigen Export löschen.
