# less. – Pearl Light 2.0 testen

Der Teststand liegt im Branch `codex/pearl-light-iphone`. Die vorhandene GitHub-Pages-Adresse zeigt den veröffentlichten Stand von `main`. Der Branch stellt allein keine neue Safari-Testadresse bereit.

## Start unter Windows

1. Auf der GitHub-Seite des Testbranches **Code → Download ZIP** wählen und das Archiv entpacken.
2. Im Ordner `preview` die Datei `Testversion-starten.cmd` doppelt anklicken. Voraussetzung ist Python 3 auf dem Rechner. Das Fenster während des Tests geöffnet lassen.
3. Am Rechner `http://localhost:8000/` öffnen.
4. Rechner und iPhone mit demselben WLAN verbinden. Unter Windows in einem Terminal `ipconfig` ausführen und die IPv4-Adresse des aktiven WLAN-Adapters ablesen. Auf dem iPhone in Safari `http://<IPv4-Adresse>:8000/` öffnen, zum Beispiel `http://192.168.178.25:8000/`.

Falls Windows eine Firewall-Rückfrage zeigt, ist für diesen WLAN-Test der Zugriff im privaten Netzwerk nötig. Ein belegter Port oder fehlendes Python wird im Startfenster angezeigt. Zum Beenden das Fenster schließen oder Strg+C drücken. Das Skript selbst wurde hier per Codeprüfung geprüft, ein Windows-Lauf steht aus.

Alternativ im Ordner `preview` starten:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Der Server liefert den Testordner aus. Nutze für wiederholte Tests dieselbe Adresse und denselben Safari-Modus, damit die lokalen Testeinträge wiedergefunden werden.

## Testablauf auf dem iPhone

- **Heute geschafft** antippen. Erwartet werden eine weiche Woge in Lavendel, Rosé und Pfirsich sowie ein sehr dünner, nach innen auslaufender Rand. Der gesamte Effekt endet nach etwa 2,35 Sekunden.
- Schnell mehrfach antippen. Ein Effekt wird neu gestartet, der Tag wird genau einmal gezählt.
- Während der Woge **Heute war es schwer** antippen. Die positive Woge endet, der negative Check-in wird gespeichert.
- Zum Verlauf wechseln, einen Tag ändern und das Ergebnis über **Weiter**, das X oder den Hintergrund schließen. Ein gespeicherter positiver Eintrag löst die Woge aus. Ein negativer Eintrag oder das Entfernen eines Eintrags löst sie nicht aus.
- Neu laden und Safari schließen/erneut öffnen. Die bisherigen Testeinträge müssen erhalten bleiben.
- In iOS unter **Einstellungen → Bedienungshilfen → Bewegung → Bewegung reduzieren** die reduzierte Bewegung aktivieren. Speichern und sichtbare Statusmeldung funktionieren ohne Woge. Auch einen Wechsel dieser Einstellung während eines laufenden Effekts prüfen.
- Während des Effekts drehen oder die App in den Hintergrund schicken. Bei der Rückkehr dürfen keine Leuchtschichten hängen bleiben.

## Offline und HTTPS

Auf dem Rechner unterstützt `http://localhost:8000/` den Service Worker. Nach einem Online-Aufruf und erneutem Laden lässt sich der Server anhalten und die App nochmals laden. Einträge sollten weiter funktionieren.

Die WLAN-Adresse mit `http://<IPv4-Adresse>` eignet sich auf dem iPhone für die Animation und lokale Speicherung. Der Service Worker braucht dort HTTPS. Für den vollständigen iPhone-Offline- und Homescreen-Test ist eine separat gehostete HTTPS-Testseite erforderlich.

GitHub Pages hat für dieses Repository eine veröffentlichte Site mit konfigurierter Quelle. Ein weiterer Branch erzeugt keine zusätzliche Test-Site. Eine separate Test-Site über einen Hostingdienst oder ein eigenes Pages-Repository müsste eigens eingerichtet werden. Dafür wurde noch keine Freigabe eingeholt und kein Deployment vorgenommen.

## Daten und Cache

- Testdaten verwenden `less.preview.v1` und bleiben im Browser des jeweiligen Test-Ursprungs.
- Die Live-App verwendet `less.prototype.v1`. Dieses Format und der Live-Code wurden in dieser Phase nicht bearbeitet.
- Der Service Worker ist relativ zum Testordner registriert und verwendet `less-preview-2026-11-16-pearl2`. Offline-Antworten werden ausschließlich aus diesem Cache gelesen.
- Ein Update entfernt alte Vorschau-Caches. Check-ins liegen separat in Local Storage und werden dabei nicht gelöscht.

## Wiederholbare Codeprüfungen

Node.js 18 oder neuer genügt. Vom Repository-Root aus:

```sh
node --experimental-vm-modules preview/tests/checkins.cjs
node preview/tests/offline.cjs
git diff --check
```

Die Tests verwenden isolierte Daten und simulierte Browser-/Service-Worker-Schnittstellen. Den Browser-Test und die offenen Gerätetests beschreibt [QA.md](QA.md).
