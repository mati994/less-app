# Sprint 2 – Der erste Anfang

16. November 2026 · Basis: Sprint 1, Commit `8d96b0603d9aa93d19bc22d6430b838cfb7200e4`.

## Erststart

Ein leerer Speicher öffnet die einzelne Willkommensansicht mit den vereinbarten Texten, einem statischen offenen Perlmutt-Ring und zwei Aktionen. Der bisherige Splash entfällt beim frischen Einstieg. Es gibt keine weiteren Einführungsschritte und kein Produktkonto.

„Meinen Weg beginnen“ öffnet direkt das Formular mit Fokus, den beiden Wegen und optionalem persönlichem Ziel. „Bewusst reduzieren“ ist vorausgewählt. Die Erklärung stellt die tägliche Selbsteinschätzung klar. „Meinen Weg starten“ führt erst nach erfolgreicher Speicherung zur Startseite mit null Tagen. Bei Speicherfehler bleiben Formular und Eingaben erhalten.

Die Startseite ergänzt zwei kurze Hinweise: „Insgesamt. Keine Serie nötig.“ und „Ein Tag ohne Eintrag bleibt offen.“ Die vorhandenen Antwortmöglichkeiten und Pearl Light 2.1 bleiben erhalten.

## Datenstrategie ohne Migration

| Speicherstand / Aktion | Verhalten |
| --- | --- |
| Schlüssel fehlt | Willkommen; keine Schreiboperation, keine Beispielhistorie |
| Persönliche Daten, auch mit leerer Historie | Direkter Start auf Heute; keine erneute Einführung |
| Älteres gültiges Format ohne `isDemo` | Als persönliche Daten behandelt; keine automatische Bereinigung |
| Explizites altes `isDemo: true` | Bisheriger Demo-Stand sichtbar; Rohdaten bleiben unverändert; neue Demo-Interaktionen nur im Arbeitsspeicher |
| Beschädigter oder nicht lesbarer Speicher | Schutz und Fehlermeldung aus Sprint 1; kein stiller Erststart und keine Überschreibung |
| Demo erkunden | Ausschließlich flüchtiger Arbeitsspeicher; keine Änderung persönlicher Daten |
| Demo mit vorhandenen persönlichen Daten verlassen | Rückkehr zum unveränderten persönlichen Stand |
| Persönliches Ziel aus frischer Demo beginnen | Leere Check-in-Historie; keine Übernahme von Beispieltagen |
| Expliziten alten gespeicherten Demo-Stand ersetzen | Erst nach Bestätigung und erfolgreichem Speichern |
| Bereits vorhandenes persönliches Ziel ersetzen | Bestehende ausdrückliche Bestätigung bleibt erforderlich, wenn Einträge vorliegen |
| Neustart nach flüchtiger Demo | Persönlicher Stand, falls vorhanden; sonst Willkommen. Explizite alte gespeicherte Demo bleibt bis zum bestätigten Wechsel erhalten. |

Kein neuer Speicherschlüssel, keine Schemaänderung, keine Migration. Live bleibt `less.prototype.v1`, Test bleibt `less.preview.v1`. Datenkopien aus der Demo werden niemals an den persönlichen Speicherpfad übergeben. Demo-Export und persönliche Löschaktionen sind in der Demo nicht angeboten. „Demo ansehen“ ersetzt den früheren destruktiven Demo-Wechsel.

Historische Mischstände, die bereits vor Sprint 2 ohne Demo-Markierung gespeichert wurden, lassen sich nicht verlässlich in persönliche und Beispiel-Einträge zerlegen. Sie bleiben deshalb vollständig erhalten. Es gibt keine heuristische Löschung.

Die Schutzmechanismen aus Sprint 1 bleiben aktiv: Validierung, Commit erst nach erfolgreichem Schreiben, Blockade beschädigter Daten und Vergleich mit dem ursprünglich gelesenen Stand vor jeder persönlichen Schreiboperation. Der bekannte enge Wettlauf exakt gleichzeitiger Schreibvorgänge zweier Tabs ist weiterhin nicht atomar abgesichert. Es gibt keine automatische Zusammenführung.

## Mobile Bedienung

Willkommen und Formular haben eigene vertikale Scrollbereiche. Felder verwenden mindestens 16 px Schrift bei normaler Schriftgröße. Relative Schriftgrößen, umbrechende Auswahlfelder und flexible Buttonhöhen unterstützen vergrößerte Schrift. Native Radio-Inputs mit `fieldset` und `legend` bieten Tastaturbedienung und einen semantisch erkennbaren Auswahlzustand. Ansichtswechsel ins Formular setzen den Fokus auf die Überschrift, ohne die Bildschirmtastatur vorzeitig zu öffnen. Ein leerer oder nur aus Leerzeichen bestehender Fokus wird abgewiesen.

Die innere Scrollposition der App wird beim Ansichtswechsel zurückgesetzt. Das verhindert, dass die Startseite nach einem langen Formular oben abgeschnitten bleibt. Die zusätzliche CSS-Datei ist auf Einstieg, Demo-Hinweise und die kurzen erklärenden Texte begrenzt; der Pearl-Light-Animationscode und dessen CSS bleiben bytegleich.

## Prüfungen

Alle vier Testprogramme bestanden:

```sh
node --experimental-vm-modules preview/tests/checkins.cjs
node --experimental-vm-modules preview/tests/storage.cjs
node --experimental-vm-modules preview/tests/onboarding.cjs
node preview/tests/offline.cjs
```

- Bestehende Check-in-Tests: Zählung, Wiederholungen, negative Eingabe, Schreibfehler, Verlauf, Pearl-Light-Cleanup, reduzierte Bewegung und Live-Schlüssel-Isolation.
- Speicher-Tests: 121 Szenarien für persönliche Mutationen, Fehler/Wiederholung, Abbruch, beschädigte Daten, ältere Formate und Tab-Konflikte. Die bisherigen 17 Szenarien des destruktiven Demo-Ersetzens entfallen, weil diese Speicheroperation nicht mehr existiert. Deren Schutz wird durch die neue vollständige Demo-Isolation geprüft.
- Onboarding-Tests: 13 mehrstufige Abläufe für leeren Erststart, Unterbrechung, Demo-Check-ins, Rückkehr, persönlichen Start bei null, bestehende und explizite alte Demo-Daten, Moduswahl, Speicherfehler, Neustart und einen anderen Tab, der während der Demo persönliche Daten anlegt.
- Offline-Tests: neue Assets vorhanden, Cache-Aktualisierung, Offline-Fallback, Scope-Grenzen, HTTP-/Cache-Schreibfehler und Live-Cache-Erhaltung.
- JavaScript-Syntax und Git-Diff geprüft. Geänderte Anwendungsdateien ausschließlich in `preview/`.

Browserprüfung in Chromium mit einer getrennten lokalen QA-Kopie und synthetischen Daten:

- Willkommensansicht bei 390 × 844 visuell geprüft.
- Formular bei 320 × 320 verfügbarer Höhe ausgefüllt und abgeschlossen; native Auswahl per Pfeiltaste bedient. Diese Höhe simuliert eingeschränkten Platz, keine echte iOS-Bildschirmtastatur.
- Startseite mit null Tagen bei 320 × 568 geprüft.
- Demo erkundet, positiven Check-in ausgelöst, zum persönlichen Ziel zurückgekehrt: weiterhin null persönliche Tage.
- Formular mit 150 % Basisschrift bei 320 × 568 erfolgreich abgeschlossen; vertikaler Scrollbereich vorhanden, kein horizontaler Überlauf.
- Nach Formularabschluss liegt die Startseite bei Scrollposition null.

Die lokale QA-Hülle und ihre Testdaten werden nicht veröffentlicht.

## Noch auf dem iPhone prüfen

Echte Safari-Tastatur, VoiceOver, vergrößerte iOS-Schrift, Standalone-PWA und Offline-Neustart nach Update wurden in diesem Sprint nicht auf echter Hardware geprüft. Die privaten Hosting-Zugangsregeln bleiben bestehen; eine vorgeschaltete Anmeldung der Test-Site ist kein Login innerhalb von less.

## Sicher ausprobieren

1. Alte Test-Tabs schließen und die aktualisierte private Test-Site öffnen. Bestehende persönliche Einträge sollten direkt erscheinen.
2. Mit vorhandenen Daten über „Mehr → Demo ansehen“ erkunden und über „Zurück zu meinem Weg“ zurückkehren. Persönliche Daten müssen unverändert sein.
3. Den echten Erststart in einem separaten Browserprofil ohne bisherige Testdaten prüfen. Nicht zur Vorbereitung bestehende Browserdaten löschen. Die private Test-Site benötigt dort gegebenenfalls erneut ihre Zugangsanmeldung.
4. „Erst einmal ansehen“ wählen, einen Demo-Check-in ausprobieren und danach ein persönliches Ziel beginnen. Die persönliche Startseite muss null Tage anzeigen.
5. Einen persönlichen Check-in setzen und neu laden. Das Ziel und der Eintrag müssen erhalten bleiben, die Einführung darf nicht erneut erscheinen.

Keine Änderung an `main`, Live-App oder GitHub Pages. Keine neue Animation für „Heute war es schwer“.
