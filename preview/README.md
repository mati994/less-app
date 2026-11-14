# less. – iPhone-Vorschau

Diese Kopie stammt aus dem Branch `refactor/modular-project-foundation` und dient ausschließlich dem Funktionstest der neuen Modulstruktur.

**Adresse:** https://mati994.github.io/less-app/preview/

**Isolierung:**
- Unveränderte Live-App: `/less-app/`
- Eigener Local-Storage-Schlüssel: `less.preview.v1`, nicht `less.prototype.v1`.
- Eigener Service Worker unter `/less-app/preview/` und Cache `less-preview-*`.
- Testdaten der Vorschau werden nicht in die eigentliche less.-App übernommen.

Zum Testen: Vorschau in Safari öffnen, Tabs wechseln, einen Check-in setzen, Seite neu laden, erneut öffnen und anschließend bei bereits geladener Vorschau die Internetverbindung ausschalten.

Dies ist **keine** inhaltliche Designfreigabe: Der dickere Ring, die Zentrierung der Zahl und der direkte positive Check-in sind separate, noch anstehende Verbesserungen.

Nur diese `preview/`-Dateien wurden ergänzt; `main/index.html`, `main/service-worker.js` und bestehende Nutzerdaten bleiben unverändert. Später kann der Ordner entfernt werden.
