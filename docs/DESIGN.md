# less. – Design-Leitlinien

## Markenidee

**Ein ruhiger, persönlicher Begleiter.** Weniger Druck, weniger Dashboard-Charakter; progressiver Freiraum ist das Leitmotiv. Die Marke heißt immer `less.` mit Punkt. Logo bleibt ein elegant geöffneter Kreis.

## Prioritäten

1. **Ring als visuelles Herzstück:** offen, weich leuchtend, langsam atmend; Fortschritt öffnet ihn. Keine harte Prozentanzeige.
2. **Zahl im Ring:** optisch mittig; Erklärung `bewusst gewonnene Tage` und `Jeder einzelne zählt.` darunter, nicht im Ring.
3. **Ruhige Oberfläche:** mitternachtsdunkler Hintergrund, zurückhaltende Tiefe, keine überfüllten Charts, viel Luft.
4. **Check-in als Ritual:** positiv, unmittelbar, warm; kein Bestrafen nach einem schwierigen Tag.

## Ausgangspalette (Stand des Prototyps)

- Hintergrund: `#090b12`, `#0b0c17`
- Primärtext: `#f5f1f3`
- Gedämpfter Text: `#9b99aa`
- Lavendel: `#c6a9fa`, `#c6a4fa`
- Pfirsich: `#ecc9b7`, `#f6dcd5`
- Ringverlauf: Pfirsich → zartes Rosa → Lavendel → zartes Violett

## Bewegung

- Ruhiger Atemrhythmus etwa 9 Sekunden; minimaler Skalierungswechsel.
- Beim Erfolg öffnet sich der Ring und leuchtet kurz warm auf; keine plötzlichen Farbwechsel.
- Beim Start wandelt sich der Logo-Ring möglichst flüssig in den Dashboard-Ring.
- `prefers-reduced-motion` respektieren.

## Noch offen / nächste Designrunde

- Ring in der App ist aktuell **zu schmal** – stärkere, an Intro angeglichene Strichstärke erproben.
- Die Zahl wirkt auf dem iPhone aktuell **nicht sauber zentriert** – Geometrie und optische Position prüfen.
- Der Bestätigungsdialog verdeckt den Erfolg. Vorschlag zur Abstimmung: großer Button `Heute geschafft`, darunter dezenter Button `Heute nicht erreicht`; Animation **ohne Overlay** unmittelbar sichtbar.
- Für größere Designentscheidungen vor dem Einbau zwei bis drei Varianten besprechen, danach fokussiert implementieren.
