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

## Pearl Light im Branch `codex/pearl-light-iphone`

Die oben genannte Pages-Adresse zeigt den Stand von `main`. Für Pearl Light diesen Branch auschecken und vom Projektordner aus lokal starten:

```sh
python3 -m http.server 8000
```

Am Rechner `http://localhost:8000/preview/` öffnen. Für den iPhone-Test im selben WLAN `http://<IP-des-Rechners>:8000/preview/` in Safari öffnen. Über HTTP im WLAN lassen sich Check-ins und Animation testen. Der Service Worker wird erst über HTTPS registriert.

- **Heute geschafft** antippen. Die Lichtwoge breitet sich vom Fortschrittsring aus und die Bildschirmkante leuchtet kurz auf. Ein erneutes Tippen spielt die Animation erneut ab und zählt den Tag nur einmal.
- **Heute war es schwer** antippen. Die Rückmeldung erscheint ohne Pearl Light.
- Im Verlauf einen Tag positiv eintragen und das Ergebnis schließen. Nach dem Neuladen bleiben die Testeinträge erhalten.
- In iOS **Bewegung reduzieren** einschalten. Der Check-in wird unmittelbar angezeigt und gespeichert, die Lichtwoge entfällt.
