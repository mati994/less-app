# Sprint 1 – Sichere Datenoperationen

16. November 2026. Nur Testbranch `codex/pearl-light-iphone`, nur `preview/`.

## Verhalten

Alle acht Änderungen verwenden einen gemeinsamen Commit-Pfad: positiver und negativer Schnell-Check-in, historischer positiver/negativer Eintrag, Entfernen eines einzelnen Eintrags, Löschen aller Einträge, Demo-Wechsel und neues Ziel.

Die App erstellt zuerst eine neue Datenkopie. Erst wenn das Schreiben erfolgreich war, ersetzt diese den sichtbaren Zustand. Bei Fehlern bleiben die bisherigen Daten, der aktuelle Dialog und ausgefüllte Formularfelder erhalten. Keine Erfolgsmeldung und keine positive Bestätigungsanimation für fehlgeschlagene Änderungen. Erneutes Speichern nach einem vorübergehenden Schreibfehler ist möglich.

Ein dauerhafter, zugänglicher Fehlerhinweis ergänzt die kurze Meldung. Im Normalzustand ist er verborgen. Bereits vorhandene Bestätigungen vor Löschen/Ersetzen bleiben bestehen.

## Kompatibilität und beschädigte Daten

- Kein neues Datenformat, keine Migration, kein neuer Speicherschlüssel. Live bleibt `less.prototype.v1`, Test bleibt `less.preview.v1`.
- Lesen verändert keine gespeicherten Bytes. Ältere Datensätze mit `habit` und `checkins` ohne optionale Felder funktionieren weiterhin.
- Wenn vorhanden, werden `goal`, `mode`, `isDemo`, `created` auf den erwarteten Typ/Inhalt geprüft. Check-in-Schlüssel müssen echte ISO-Kalendertage sein; Werte ausschließlich `yes` oder `no`.
- Unbekannte Zusatzfelder bleiben bei Check-ins und Eintragslöschung erhalten. Ein ausdrücklich bestätigter Demo-/Zielwechsel ersetzt weiterhin den Datensatz wie bisher.
- Fehlerhaftes JSON, unerwartete Formate und ein beim Start nicht lesbarer Speicher sperren Schreiboperationen für diesen Seitenlauf. Keine stille Umwandlung in Demo und kein Überschreiben, auch nicht durch „Neues Ziel“ oder „Demo zurücksetzen“.
- Die Ansicht zeigt dann ausdrücklich „Daten derzeit nicht verfügbar“ und einen Hinweis. Die leere Anzeige ist nur ein Platzhalter und wird niemals gespeichert. Der normale Export wird in diesem Zustand gesperrt, damit kein falsches leeres Backup entsteht.
- Es gibt bewusst keine automatische Reparatur, kein Löschen beschädigter Rohdaten und keinen neuen Import-/Recovery-Dialog. Bei solchen Befunden Browserdaten erhalten, Ursache untersuchen und erst mit Zustimmung gezielt wiederherstellen. Ein Neuladen allein repariert beschädigte Daten nicht.

## Zwei Tabs: Schutz und Grenzen

Jede geladene App merkt sich den exakten ursprünglich gelesenen Speicherinhalt. Vor **jedem** Schreiben wird er erneut gelesen und verglichen. Ist er anders, wird nichts geschrieben und der Nutzer zum Neuladen aufgefordert. Das gilt auch für eine inzwischen erfolgte Löschung, Beschädigung oder einen Zielwechsel. Nach einem Konflikt bleibt Schreiben bis zum Neuladen gesperrt; es gibt keinen blinden Wiederholungsversuch und keine automatische Zusammenführung.

Dies erkennt veraltete Zustände ohne Schemaänderung. Es ist **keine atomare Mehrtab-Transaktion**: Zwei Schreibvorgänge können beide den gleichen alten Stand lesen und danach nahezu gleichzeitig schreiben. Dieser enge Wettlauf bleibt möglich. Auch alte, bereits geöffnete App-Versionen kennen den neuen Schutz nicht. Beim Test alle alten Test-Tabs schließen und den aktualisierten Stand neu öffnen. Änderungen werden nicht im Hintergrund automatisch in andere Tabs übernommen.

Exakt gleichzeitige Mehrtab-Nutzung ist damit nicht als verlustfrei garantiert. Eine stärkere Serialisierung wäre ein gesonderter, browserübergreifend geprüfter Folgeschritt. Für den vorgesehenen persönlichen Ein-Tab-Ablauf erfolgt hier keine grundlegende Speicherumstellung.

## Verifikation

Aus dem Repository-Root:

```sh
node --experimental-vm-modules preview/tests/checkins.cjs
node --experimental-vm-modules preview/tests/storage.cjs
node preview/tests/offline.cjs
```

Alle drei Testprogramme bestanden. `storage.cjs` enthält 138 Szenarien für Fehler und erfolgreiche Wiederholung aller Änderungswege, Abbruch bestätigungspflichtiger Aktionen, beschädigte Daten, ältere Formate, Frischstart, zwei unabhängige App-Instanzen mit gemeinsamem Speicher und Neuladen nach Konflikt. Die bestehenden Check-in-Tests prüfen weiterhin Wiederholung, Animation/Cleanup, reduzierte Bewegung und Live-Datenisolation. Die Offline-Tests prüfen Asset-Cache, Cache-Aktualisierung, Scope, Fehlerfälle und Schutz des Live-Caches.

Zusätzliche Chromium-Browserprüfung in einer separaten lokalen QA-Kopie mit synthetischen Daten und kontrolliertem Speicherfehler:

- Positiver Check-in bei Schreibfehler: Zähler und Auswahl unverändert, Fehler sichtbar.
- Wiederholung nach aufgehobenem Fehler: erfolgreich gespeichert, Fehlerhinweis verschwindet.
- Bestätigte Gesamtlöschung bei Schreibfehler: Ansicht bleibt erhalten; zurück auf Heute sind die ursprünglichen Tage weiterhin sichtbar.
- Zwei echte Tabs: Tab B ändert den Tag; Tab A wird beim anschließenden Schreiben mit Konflikthinweis gestoppt.
- Beschädigter Speicher: expliziter Hinweis statt Demo, Schreibschutz aktiv.

Die QA-Fehlerinjektion liegt außerhalb des Repositorys und wird nicht veröffentlicht. Automatisierte Tests verwenden Browser-/DOM-Mocks; sie ersetzen keinen iPhone-Test. In diesem Sprint keine neue echte iPhone- oder installierte PWA-Offline-Abnahme. Die bereits freigegebene Pearl-Light-Implementierung (`ring.js`, `ring.css`, `views.js`) bleibt bytegleich.

## Testanleitung und nächster Schritt

Nach Aktualisierung der privaten Test-Site alte Test-Tabs schließen und die Adresse neu öffnen. Einen Test-Check-in setzen, negativ ändern, im Verlauf korrigieren und neu laden. Historie muss erhalten bleiben. Für einen einfachen Konflikttest zwei Tabs öffnen, in einem ändern und im anderen eine weitere Änderung versuchen: Konflikthinweis, dann neu laden. Lösch- und Demo-Tests nur mit ausdrücklich entbehrlichen Testdaten durchführen.

Die lokale Speicherung bleibt getrennt von der Live-App. Keine Änderung von `main`, Live-Dateien oder GitHub-Pages-Konfiguration.

Als nächster Sprint empfiehlt sich die bereits geplante Trennung von Demo und persönlichem Erststart. Das bekannte Übernehmen von Demo-Tagen beim ersten Check-in ist in diesem reinen Stabilisierungssprint bewusst noch nicht verändert. Vor persönlichen Nutzertests sollten außerdem der Backup-Import und die mobile Onboarding-Abnahme folgen.
