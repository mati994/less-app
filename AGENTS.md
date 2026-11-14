# Anleitung für KI-/Code-Assistenten – less.

## Zuerst lesen

1. Diese Datei, `README.md`, `docs/ARCHITECTURE.md` und bei UI-Änderungen `docs/DESIGN.md` lesen.
2. Nur die betroffenen Module öffnen; keine unnötigen Full-File-Rewrites.
3. Änderungen zuerst auf einem Feature-Branch vornehmen, nicht ungefragt auf `main`.
4. Vor einer Freigabe `npm test` und einen manuellen mobilen Safari-Test durchführen bzw. verbleibende Testlücken offen benennen.

## Unverrückbare Produktregeln

- Ein ruhiger, nicht wertender Begleiter zur **Reduktion unerwünschter Gewohnheiten**. Keine klinischen Behauptungen, kein Beschämen und keine Pflicht zum täglichen Eintrag.
- **Gewonnene Tage sind kumulativ**; einzelne Rückschritte löschen frühere Erfolge nicht. Fehlender Check-in ist neutral und nicht automatisch ein Misserfolg.
- Ringform öffnet sich über erreichte Tage; Licht ist weich, atmosphärisch, sanft animiert. Bewegung respektiert `prefers-reduced-motion`.
- Logo, Schreibweise **less.**, Farbwelt und mobile Lesbarkeit erhalten. Größere UI-Änderungen vor dem Programmieren gemeinsam entscheiden.
- Texte werden deutsch formuliert; kein Straf- oder Leistungsdruck.

## Kritische technische Regeln

- Die App ist eine **statische GitHub-Pages-PWA** ohne Backend oder Build-Schritt. Relative Pfade beibehalten (Unterpfad `/less-app/`).
- Das Datenformat und der Local-Storage-Schlüssel **`less.prototype.v1`** dürfen nicht ohne explizite Migrationsstrategie geändert werden. Keine echten Nutzereinträge beim Testen löschen/überschreiben.
- `src/storage.js` enthält Datum/Statistik/Speicherung; `src/ring.js` Ringlogik; `src/views.js` UI-Templates; `src/app.js` Eventfluss. `src/config.js` enthält gemeinsame Helfer.
- Änderungen an Assets im Cache von `service-worker.js` berücksichtigen. Vorsicht bei Offline-/Update-Verhalten.
- Einzige Quelle für Ringgeometrie: `ringArcLength` in `src/ring.js`. Ring im Intro und Dashboard nach Möglichkeit identisch halten.
- Bestehendes `ring-lab.html` separat belassen, bis der Nutzer Änderungen wünscht.

## Arbeitsweise

- Erst visuelle/konzeptionelle Rücksprache bei großen Gestaltungsentscheidungen; offensichtliche Bugs direkt beheben.
- Kleine, gezielte Änderungen; keine komplizierten Frameworks ohne Nutzen.
- Funktion und Aussehen getrennt prüfen. Nur automatisierte Tests sind kein Beweis für die reale iPhone-Darstellung.
- Dem Nutzer knapp berichten: Was geändert wurde, wie geprüft wurde, was offen ist; keine Token- oder Leistungsersparnis versprechen.
