# Sprint 2.1 – Erststart sicher testen

16. November 2026 · Basis: Sprint 2 (`858834eb158da8aebd21d08625cd1384be9b2bd5`).

## Ergebnis

Unter **Mehr → Erststart erneut ansehen** startet eine ausdrücklich gekennzeichnete Testvorschau. Willkommen, Fokus-Formular, Demo, Abschluss und Probe-Check-ins lassen sich ohne Speicherung durchspielen. Eine dauerhaft erreichbare Leiste bietet **Vorschau beenden**, auch über geöffneten Dialogen. Die Funktion existiert ausschließlich in der Test-App unter `preview/`.

Die Vorschau besitzt einen eigenen flüchtigen Zustand. Der zentrale persönliche Speicherpfad wird vor jedem Schreibversuch abgefangen; Demo-Eingaben bleiben ebenfalls flüchtig. Export und Löschen werden in der Vorschau nicht angeboten. Beim Verlassen wird der aktuelle gespeicherte Stand neu gelesen, einschließlich zwischenzeitlicher Änderungen eines anderen Tabs. Es wird niemals eine alte Kopie zurückgeschrieben. Ein Reload beendet die Vorschau und startet aus dem tatsächlich gespeicherten Stand. Es gibt keinen gespeicherten Vorschau-Schalter und keinen zweiten persönlichen Erststart.

## Demo und Safari-Befund

Der bisherige Startcode behandelte einen gültigen gespeicherten Stand mit `isDemo: true` unmittelbar als aktive Demo. Damit ist eine konkrete Ursache des übersprungenen Willkommens im Code nachgewiesen und mit synthetischen Altständen reproduziert. Ob dies genau die Ursache des berichteten privaten iPhone-Tests war, ist ohne dessen damaligen Zustand nicht belegbar.

Jetzt führen fehlende Daten **und explizit markierte alte Demo-Daten** zu Willkommen. Die alten Rohdaten werden weder gelöscht noch verändert. Erst ein ausdrücklich bestätigter echter persönlicher Start kann den alten Demo-Stand ersetzen, weiterhin nur nach erfolgreichem Speichern. Ältere Daten ohne Demo-Markierung bleiben als persönlich geschützt; eine heuristische Erkennung oder Bereinigung findet nicht statt.

| Ausgangslage | Demo verlassen | Reload, auch während der Testvorschau |
| --- | --- | --- |
| Kein persönlicher Stand | Zurück zu Willkommen | Willkommen |
| Expliziter alter Demo-Stand | Zurück zu Willkommen | Willkommen; alte Rohdaten bleiben erhalten |
| Persönlicher Stand | Zurück zu meinem Weg | Gespeicherter persönlicher Stand |
| Beschädigte / nicht lesbare Daten | Bestehender Speicherschutz | Schutzmeldung; keine Überschreibung |

Die Demo erklärt sofort **„Du siehst Beispieldaten“** und die aktuelle Zahl der Beispieltage im Ring. Ohne persönlichen Stand sind „Meinen Weg beginnen“ und „Zurück zu Willkommen“ direkt erreichbar; mit persönlichem Stand heißt der Rückweg „Zurück zu meinem Weg“. Mehr bleibt der Einstellungsbereich. Innerhalb der Testvorschau führen diese Wege nur durch die Simulation; ausschließlich „Vorschau beenden“ kehrt zum echten Stand zurück.

Weitere mögliche, hier nicht belegte Ursachen des ursprünglichen Safari-Verhaltens: ein bereits offener beziehungsweise wiederhergestellter Tab mit aktivem Demo-Zustand, ein älterer ausgelieferter App-Stand oder eine andere Testadresse. Für eine gezielte Reproduktion benötigen wir bei erneutem Auftreten: genaue URL, iOS-Version, privater/neuer oder wiederverwendeter Tab, vorherige Aktionen, Verhalten nach echtem Neuladen sowie Screenshot der ersten Ansicht. Keine persönlichen Speicherinhalte nötig; Browserdaten bitte nicht pauschal löschen.

## Prüfungen

Alle fünf Programme bestanden:

```sh
node --experimental-vm-modules preview/tests/checkins.cjs
node --experimental-vm-modules preview/tests/storage.cjs
node --experimental-vm-modules preview/tests/onboarding.cjs
node --experimental-vm-modules preview/tests/preview.cjs
node preview/tests/offline.cjs
```

- Bestehende Check-in-Suite: positive/negative und wiederholte Eingaben, Verlauf, Schreibfehler, Effekt-Cleanup, reduzierte Bewegung und Live-Schlüssel-Isolation.
- 121 Speicher-Szenarien sowie 13 Onboarding-Abläufe weiterhin erfolgreich.
- 88 neue Vorschau-/Navigationsszenarien: wiederholtes Öffnen und Beenden an sieben Ablaufstellen, Abbruch mit Dialog, Reload, persönliche/fehlende/alte Demo-/beschädigte Daten, Lese- und Schreibfehler, sämtliche Mutationen ohne Schreibversuch, zwei Tabs und Erhaltung der ursprünglichen Rohdaten. Die Hauptmatrix durchläuft jeden Fall zweimal.
- Offline-Suite: Cache-Assets und Update, Offline-Fallback, Scope-Grenzen, HTTP-/Cachefehler und Live-Cache-Erhaltung. Dies sind automatisierte Service-Worker-Tests, kein neuer Offline-Gerätetest.
- JavaScript-Syntax und Git-Diff geprüft. `storage.js`, `ring.js` und `ring.css` unverändert; alle Änderungen unter `preview/`.
- Chromium-Browser mit synthetischen Daten: Vorschauzugang, Formularabschluss bei null, Probe-Check-in, Rückkehr zum ursprünglichen persönlichen Ziel mit einem gewonnenen Tag, erneutes Öffnen, Demo-Erklärung und Rückweg, Reload während Vorschau, alter Demo-Stand vor und nach Reload. Formular bei 320 × 568 visuell geprüft und über den Scrollbereich abgeschlossen; Vorschauleiste bleibt erreichbar. Keine echte iOS-Tastatur simuliert.

## Grenzen und iPhone-Abnahme

Kein echter Safari-/iPhone-Test in dieser Ausführung. Noch prüfen: private Safari-Sitzungen, Tab-Wiederherstellung, Tastatur, VoiceOver, große Schrift und Offline-Neustart nach dem Update. Wiederherstellung einer noch lebenden Seite kann ihren flüchtigen Zustand behalten; die Kennzeichnung und der Speicher-Stopp bleiben dann aktiv. Die bestehende sehr enge Race-Condition exakt gleichzeitiger persönlicher Schreibvorgänge zweier Tabs bleibt wie in Sprint 1 nicht atomar abgesichert. Vorschau selbst schreibt nicht und verschärft dieses Risiko nicht.

1. Private Test-Site aktualisieren; vorhandener persönlicher Stand muss direkt erscheinen.
2. **Mehr → Erststart erneut ansehen** öffnen. Beide Einstiegswege und den Formularabschluss ausprobieren.
3. **Vorschau beenden** wählen: ursprüngliches Ziel und Check-ins müssen zurückkehren. Wiederholen und auch mitten im Formular beziehungsweise in der Demo beenden.
4. Während der Vorschau neu laden: persönlicher Stand muss erscheinen, ohne simulierte Einträge.
5. Frischen echten Erststart nur in einem separaten Browserprofil ohne Testdaten prüfen. Vorhandene Browserdaten nicht zur Vorbereitung löschen.

Kein Onboarding-Redesign, keine Schemaänderung und keine Migration. Keine Änderung an `main`, Live-App, GitHub Pages, Pearl Light 2.1 oder dem Speicherschutz aus Sprint 1.
