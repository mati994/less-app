# Projektregeln für less.

## Design

- less. begleitet Menschen beim Reduzieren unerwünschter Gewohnheiten. Formuliere auf Deutsch, ruhig, knapp und ohne Wertung. Ein fehlender Check-in bleibt offen. Gewonnene Tage zählen kumulativ.
- Bewahre den offenen Fortschrittsring, die dunkle Farbwelt und die gut lesbare, optisch zentrierte Zahl. Die Ringöffnung wächst mit den gewonnenen Tagen.
- Pearl Light bestätigt einen gespeicherten positiven Check-in mit einer weichen Lichtwoge und einer etwa 1 px dünnen Bildschirmkante in Pfirsich und Lavendel. Texte und Bedienelemente bleiben sichtbar und bedienbar.
- Entwickle für schmale iPhone-Ansichten, Safari-Sicherheitsabstände und den Standalone-Modus. Respektiere `prefers-reduced-motion` und gib auch ohne Animation eindeutiges Feedback.

## Entwicklung und Daten

- Die App ist eine statische GitHub-Pages-PWA ohne Build-Schritt und Backend. Nutze relative Pfade und die bestehenden Module. `app.js` steuert Interaktionen, `views.js` baut die Ansichten, `ring.js` enthält Ringlogik und Animation und `storage.js` verwaltet lokale Daten und Statistiken.
- Bewahre gespeicherte Check-ins, das Datenformat und den Live-Schlüssel `less.prototype.v1`. Änderungen am Format brauchen eine getestete, verlustfreie Migration. Initialisierung und Updates dürfen keine vorhandenen Daten überschreiben.
- Die Test-App liegt in `preview/`. Sie nutzt `less.preview.v1`, einen eigenen Service-Worker-Scope und Cache-Namen mit `less-preview-`. Aktualisiere bei Asset-Änderungen die URL-Versionen in HTML, Modulimporten und Cache-Liste gemeinsam.
- Animiere Licht mit statischen Verläufen und möglichst nur `transform` und `opacity`. Vermeide Canvas-Neuzeichnungen, animierte Filter und Layoutmessungen pro Frame im Check-in-Effekt. Entferne Effekte nach dem Ablauf.

## Qualitätssicherung

- Prüfe den Diff auf unbeabsichtigte Änderungen an Live-Dateien, Datenpfaden und Cache-Namensräumen. Prüfe die JavaScript-Syntax und teste in einem Browser.
- Teste positive und negative Check-ins, erneutes Tippen, Bearbeitung im Verlauf, Reload, vorhandene Testdaten und reduzierte Bewegung. Prüfe für PWA-Änderungen auch Offline-Start und Update der Vorschau.
- Prüfe für eine Animationsfreigabe die Wirkung auf einem echten iPhone in Safari und, falls installiert, als PWA. Benenne fehlende Gerätetests und offene Befunde im Übergabebericht.

## Veröffentlichung

- Beginne Änderungen in einem eigenen Branch und halte Vorschau und Live-App getrennt. Für den lokalen Test am Repository-Root `python3 -m http.server 8000` starten und `/preview/` öffnen.
- Präsentiere den Teststand und die Prüfergebnisse vor einer Veröffentlichung. Änderungen an `main`, GitHub Pages und der Live-PWA brauchen eine ausdrückliche Freigabe des Projektinhabers. Prüfe danach den freigegebenen Stand und die betroffenen Cache-Versionen.
