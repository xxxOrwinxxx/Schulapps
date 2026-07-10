# Analyse-App (Schnellcheck-Auswertung) — Plan und Stand

Status: **in Arbeit** (Start 2026-07-09). Lebendes Planungsdokument, bewusst nicht in git
eingecheckt (rein intern). Die App selbst liegt unter `Schulapps/auswertung/index.html`.

## Grundsatzentscheidungen (2026-07-09)
- **Eine eigenstaendige App, keine Doppelstruktur.** Die neue `Schulapps/auswertung/` wird die
  eine Analyse-App. Sie loest den schlanken Vorlaeufer `Schulapps/pse-auswertung/` ab und ersetzt
  langfristig die MS-Forms-Kompetenzstand-App (`Apps/kompetenzstand_app.html`). Grund der Lehrkraft:
  Forms-Module zu erstellen und zu verwalten kostet zu viel Zeit; kuenftige Schnellchecks werden
  ohnehin gemeinsam gebaut und geben Ergebnis-Codes aus.
- **Die Kompetenzstand-App ist der Erstversuch (Vorlage), nicht die Basis.** Gute Bausteine wandern
  rueber, der Rest bleibt liegen.
- **Kein Altbestand:** es sind noch keine Ergebnis-Codes im Umlauf. Also direkt sauberes Format,
  kein Kompatibilitaets-Ballast fuer ein Altformat.
- **Detailtiefe: pro Aufgabe.** Die Auswertung kennt fuer jede Einzelaufgabe geschafft/halb/nicht.
  Groebere Sichten (Thema, Gesamt) sind darin enthalten.

## Ergebnis-Code (das gemeinsame Format, der "Zettel")
`SC1-` + Base64(JSON). JSON:
```
{ v:1, testId:"pse-grundlagen", titel:"PSE Grundlagen", fach:"CH", stufe:"10",
  erstellt:"2026-07-09T10:30",   // Datum + Uhrzeit (mehrere Erhebungen/Tag trennbar)
  name:"Max M.", sid:null,       // sid = optionale pseudonyme Schueler-ID (Laengsschnitt)
  aufgaben:[ { id:"a1", titel:"Ordnungszahl", ergebnis:"done" }, ... ] }
```
- Kanonisches Vokabular je Aufgabe: **done / partial / wrong**.
- `testId` haelt verschiedene Checks auseinander. `titel` fuer Anzeige. `erstellt` mit Uhrzeit.
- Encode/Decode in der App: `btoa(unescape(encodeURIComponent(...)))` bzw. Gegenrichtung.
- **Wichtig fuer Happen 2:** der produktive PSE-Lernpfad (`Schulapps/periodensystem/index.html`)
  gibt heute noch das alte `PSE2-`/5-Lektionen-Format aus. Er muss einmalig auf dieses SC1-Format
  umgestellt werden (nur die Code-Erzeugung, eine Stelle), dann liefert er echte Codes.

## Wichtiger Befund (korrigiert alte Annahme)
Die Kompetenzstand-App ist **nicht** abhaengigkeitsfrei: sie nutzt Chart.js (lokal gebuendelt) und
laedt Schriften per Google-Fonts-`@import` (externe Ressource, DSGVO-Bruch). Beim Uebernehmen:
Diagramme als **eigenes SVG** neu bauen, Google-Fonts ersatzlos streichen. Die abhaengigkeitsfreien
Teile (CSS-Segmentbalken, Tabelle, Stat-Tiles, Score-Helfer) sind direkt brauchbar.

## Roadmap (kleine Happen, je ein Zwischenblick)
- **Happen 1 — Grundgeruest. FERTIG + verifiziert.** Datenmodell, Persistenz, Klassen-/Check-CRUD,
  Code-Import, Demo-Daten, Ergebnistabelle mit Ampel und Kennzahlen.
- **Happen 2 — echter Datenfluss. FERTIG + verifiziert.** PSE-Lernpfad (`periodensystem/index.html`)
  gibt jetzt SC1-Codes aus: neue Funktion `buildResultCode(name)`, Praefix von `PSE2-` auf `SC1-`,
  testId `pse-lernpfad`, je Frage eine Aufgabe `L{lektion}A{n}` (Kurztitel `L1.1`), Lektionsthema als
  `block`. Interner Lernpfad-Fortschritt unberuehrt (nur der Export-Code umgestellt), keine Alt-Codes.
  End-to-End getestet: 3 Codes -> Erhebung mit 3 Schuelern, korrekte Scores. **Befund:** der Lernpfad
  hat 43 Einzelfragen, als 43 Spalten unuebersichtlich -> Themen-Gruppierung ueber `block` in Happen 3.
- **Happen 3 — Themen-Ansicht. FERTIG + verifiziert.** Aufgaben werden nach `block` (Thema)
  gruppiert: Standard zeigt Themen-Kacheln (Prozent in Ampelfarbe), Klick auf ein Thema klappt seine
  Einzelaufgaben auf (zweizeiliger Kopf, andere Themen bleiben Kacheln), erneuter Klick klappt zu.
  Generisch: Tests mit mindestens zwei echten Themen -> Themen-Ansicht, sonst flach. `readCodes`
  reicht jetzt `block` durch, Demo hat 2 Themen. Kennzahlen auf Themen-Ebene (staerkstes/schwaechstes
  Thema). Beim PSE: 43 Aufgaben -> 5 Themen. ACHTUNG: Erhebungen, die VOR diesem Umbau importiert
  wurden, haben kein `block` gespeichert und bleiben flach -> zum Testen neu einlesen bzw. Demo neu laden.
  (Die urspruenglich hier geplanten CSS-Segmentbalken/Filter sind in einen spaeteren Feinschliff verschoben.)
- **Happen 4 — Verlauf. FERTIG + verifiziert.** Umschalter (Diese Erhebung / Verlauf ueber das Jahr,
  ab 2 Erhebungen). Eigenes SVG (keine Bibliothek): Klassenschnitt-Linie ueber die datierten Erhebungen
  plus per Dropdown EINE waehlbare Schuelerlinie (keine grauen Einzellinien mehr, bewusst entfernt).
  Klick auf einen Prozentwert/Punkt oeffnet genau diese Erhebung (`openErhebung`). Ampelzonen mit
  Wort-Beschriftung rechts (verstanden / knapp bestanden / Förderbedarf) + gestrichelte Grenzlinien,
  Deckkraft 0.22, rot-gruen-sicher (Nutzer hat Rot-Gruen-Schwaeche). Funktionen `renderView`/
  `renderVerlauf`/`classAvgAt`/`studentPctAt`. Schueler-Matching per Name (fragil, haengt mit dem
  Sammel-Import-Happen zusammen). Deckt Wunsch 3 (Entwicklung ueber das Jahr) und 4 (Grafik/Farbe).

  Hinweis Verifikation: App auf **Port 8790** testen (launch.json auswertung), nicht 8766 (Nutzer-Batch).
  `preview_screenshot` haengt durchgehend, daher via `preview_eval` an der laufenden Seite pruefen.
- **Happen 5 — Schuelerprofil + Reflexion. FERTIG + verifiziert.** Dritte Ansicht "Schülerprofil"
  (Tab neben Diese Erhebung / Verlauf; erscheint schon ab EINER Erhebung, sobald Schueler da sind).
  Aufbau: Kopf (Name + Erhebung + Datum), drei Kacheln (Gesamtstand mit Ampel-Badge, Klassenschnitt,
  Delta), seine Verlaufslinie (ab 2 Erhebungen), Einzelergebnisse je Aufgabe (nach Thema gruppiert,
  dreifach lesbar: Farbkasten + Symbol ✓/~/✗ + Klartext), leeres Reflexionsfeld (3 Leitfragen +
  Vereinbarung/Datum, geriffelte Schreiblinien). Delta rot-gruen-sicher: Pfeil ▲/▼ + Wort
  ("über/unter dem Schnitt"), nie Farbe allein. Namen in der Ergebnistabelle sind jetzt anklickbar
  (`openProfil`) und springen direkt ins Profil. Druck: "Profil drucken" -> `window.print()`, `@media
  print` blendet Header/Setup/Tabs/andere Ansichten (`.noprint`) aus, druckt nur die Profilkarten;
  `print-color-adjust:exact` erzwingt Schreiblinien + Farbmarker auf Papier. Neue Funktionen:
  `renderProfil`, `renderView` (3 Ansichten), `buildVerlaufSvg` (aus `renderVerlauf` extrahiert,
  jetzt von Verlauf UND Profil genutzt, keine Dopplung), `openProfil`/`setProfilStudent`/`stepProfil`/
  `printProfil`/`deltaHtml`/`profRow`. Deckt Wunsch 5.
  Verifiziert am 2026-07-09 (Port 8790): Demo (3 Erhebungen), Tabs korrekt auch bei 1 Erhebung,
  Namensklick + Wechsel (Dropdown/vorher-nächster), Verlauf-Ansicht ohne Regression, keine Konsolenfehler.

  **Ueberarbeitung nach Lehrkraft-Feedback (2026-07-09, verifiziert):**
  - Klassenvergleich als Zahl komplett raus (war fett-rote "-25 unter dem Schnitt"-Kachel, wirkte
    demotivierend). Vergleich jetzt nur noch visuell in der Verlaufsgrafik (schwarze Klassenlinie).
  - Dritte Kachel jetzt **"Entwicklung seit dem Start"** (`studentSeries`): Fortschritt in Pp. von der
    ersten erfassten Erhebung zur aktuellen, positiv gerahmt (▲/▼/●, "0% → 56%"). Kachel 1 heisst
    "Aktueller Stand" (nur die gewaehlte Erhebung), Kachel 2 Klassenschnitt bleibt.
  - Einzelergebnis-Begriffe an die Ampel angeglichen (Variante 2, aufgabengerecht):
    verstanden / teilweise / noch nicht / nicht bearbeitet (Symbol ✓/~/✗/– + Farbe bleiben).
  - Leere Reflexions-Schreibfelder ENTFERNT (war Missverstaendnis). Stattdessen **regelbasierter
    Gespraechsleitfaden** (`buildLeitfaden`, rein lokal, KEINE KI): drei Abschnitte (1. das Positive
    zuerst: Fortschritt + staerkstes Thema; 2. verstehen statt bewerten: schwaechstes Thema + konkrete
    Aufgaben mit "noch nicht"/"teilweise" + Klassenvergleich nur wenn drunter und dann konstruktiv;
    3. naechster Schritt, den der Schueler selbst formuliert, SRL-Impulsfragen). Verzweigt nach Lage
    (Fortschritt/stabil/Rueckgang, ueber/unter Schnitt). Gespraechshilfe fuers Mentoring, druckbar,
    nicht zur Doku. Getestet: below-Zeile nur bei Schuelern unter Schnitt, notYet-vs-teilweise-Zweig
    greift korrekt.

  **Zweite Ueberarbeitung: gemeinsames Lernstand-Blatt (2026-07-09, verifiziert).** Das Profil wird
  MIT dem Schueler zusammen angeschaut, also Umbau vom Lehrkraft-Regiezettel zum gemeinsamen Blatt:
  - Titel jetzt **"Unser Blick auf deinen Lernstand"** (nicht mehr "Gespraechsleitfaden"), Abschnitte
    "Das laeuft schon gut" / "Hier ist noch Luft" / "Deine naechsten Schritte (hier schreibst du mit)".
  - Ton: **Du-Ansprache** an die Schuelerin, plus **eine Ich-Botschaft** fuers Lob ("Mir ist
    aufgefallen: seit dem ... hast du dich von X% auf Y% gesteigert"). Alle Meta-Anweisungen an die
    Lehrkraft raus. Klassenvergleich-Zeile im Blatt entfernt (Schuelerin liest mit).
  - Layout **zweispaltig** (`.prof-cols`, flex-wrap): oben Kopf + zwei Kacheln (Aktueller Stand,
    Entwicklung), darunter links die Verlaufsgrafik, rechts das Blatt; Einzelergebnisse volle Breite
    darunter. Auf Smartphone bricht es untereinander um (verifiziert: 1280px nebeneinander je 528px,
    schmal gestapelt).
  - **Klassenschnitt-Kachel entfernt** (Wunsch): Klassenvergleich nur noch visuell in der Grafik
    (schwarze Linie), keine Zahl mehr, damit die Differenz nicht als Defizit dasteht.
  - Bei "Deine naechsten Schritte" ein `<textarea>` zum Mitschreiben. `buildLeitfaden` ohne avgR/below.

  **Dritte Ueberarbeitung: Notiz speichern + Groessenverhaeltnisse (2026-07-09, verifiziert).**
  - **Notiz wird jetzt gespeichert** (`saveProfilNote`, onchange -> `student.note` in der aktuellen
    Erhebung, `persist()` ohne Re-Render damit der Fokus bleibt). Neues Feld `student.note` im
    Datenmodell (lokal in der .json, personenbezogene Freitext-Vereinbarung -> Zweckbindung/Loeschfrist
    beachten, siehe DSGVO-Leitplanken).
  - **Wiederaufgreifen (SRL-Schleife):** im naechsten Gespraech zeigt `buildLeitfaden` oben in
    "Deine naechsten Schritte" einen Rueckblick auf die juengste fruehere Notiz des Schuelers:
    „Beim letzten Mal (Titel, Datum) hast du dir vorgenommen: ... Konntest du das schon umsetzen?".
    Textfeld ist mit der aktuellen Notiz vorbelegt. (Moegliche Erweiterung: vollstaendige Historie
    aller Vereinbarungen dieses Schuelers, noch nicht gebaut.)
  - **Groessenverhaeltnisse:** Seitenbreite `.wrap` 1100 -> 1400 (schmalerer Rand), Grafik-Spalte
    breiter als das Blatt (`.prof-graf` flex 1.5 vs `.lf` flex 1), SVG-Obergrenze 760 -> 860.
    Bei 1280px: Grafik-Spalte 699 / Blatt 519, SVG ~669 breit (vorher ~498). Bessere Blickfuehrung.
- **Spaeter/optional:** Beamer-/Anon-Modus, konfigurierbare Schwellen, xlsx-Export, Stapeldruck,
  A/B-Vergleich zweier Erhebungen, Gruppen-Generator, Deploy auf GitHub Pages.
  - **KI-Prompt-Export fuer den Gespraechsleitfaden (gemerkt 2026-07-09, Wunsch der Lehrkraft):** Der
    Leitfaden ist aktuell regelbasiert. Falls spaeter echte KI-Formulierungen gewuenscht sind, KEINE
    automatische Uebermittlung (DSGVO, Schuelerdaten), sondern die Kennzahlen als fertigen, kopierbaren
    Prompt ausgeben, den die Lehrkraft bewusst in Claude/ChatGPT einwirft. Bewusst manuell/optional.
    Passt zur SchilF-KI-Reihe (Browser/Gratis).

## Technischer Stand Happen 1 (`Schulapps/auswertung/index.html`)
- Datenmodell: `store = { version, activeClassId, activeCheckId, savedAt, settings,
  classes:[ {id,name,checks:[ {id,testId,titel,datum,aufgaben:[{id,titel}],
  students:[ {name,sid,results:{aufgId:'done'|'partial'|'wrong'}} ] } ] } ] }`.
- Persistenz aus der Kompetenzstand-App uebernommen: localStorage-Cache (`STORE_KEY =
  schnellcheck_auswertung_v1`) + File System Access API (Auto-Speichern) + Datei-Handle in IndexedDB
  (`schnellcheck_auswertung`) + savedAt-Newer-wins + Boot cache-first mit stillem Reconnect.
- Score: `scoreOfStudent` = (done*1 + partial*Gewicht) / **Anzahl aller Aufgaben** (nicht nur
  beantworteter), Gewicht partial 0,5. **Ampel am FOS-Notenschluessel** (references/notenschluessel.md):
  gruen "verstanden" ab 55% (Note 3 und besser), gelb "knapp bestanden" ab 40% (Note 4), rot
  "Förderbedarf" unter 40% (Note 5/6). Labels bewusst ohne Notenziffern. Schwellen `thrGruen`/`thrGelb`
  in `store.settings`, spaeter konfigurierbar.
- Verifiziert am 2026-07-09 lokal (Server Port 8766): laedt fehlerfrei, Demo (1 Klasse, 3 datierte
  Erhebungen, 10 Schueler, 8 Aufgaben, Schnitt 82%), Tabelle rendert, Sortierung, und **Daten
  ueberleben das Neuladen** (Kernbeweis Persistenz).
- Hinweis: File System Access API nur Chrome/Edge auf localhost/https, nicht auf `file://`.
  Fallback: localStorage plus manueller `.json`-Export/-Import steht.

## DSGVO-Leitplanken (gelten weiter)
Alles lokal im Browser, keine externen Ressourcen, kein Upload, `noindex`. Base64 ist keine
Verschluesselung (Klarnamen im Code) -> Abgabe nur ueber M365/Teams/OneNote, Persistenzdatei nur auf
dienstlichem Speicher. Bleibt unbeaufsichtigter Selbsttest (formatives Signal, kein sicherer
Leistungsnachweis). Neu: Daten laufen jetzt dauerhaft zusammen (nicht mehr fluechtig), also
Zweckbindung und Loeschfristen im Blick behalten.

## Datenspeicherung + Architektur-Entscheidung (2026-07-09, DSB-Absicherung offen)
- **Auswertung bleibt lokal-only.** Nicht deployen. **Lokaler Start gebaut:** `_Auswertung starten.bat`
  in der Schulordner-Wurzel (python http.server auf Port 8766, serviert `Schulapps`, oeffnet
  `http://localhost:8766/auswertung/`; Fenster offen lassen). App liegt noch physisch in
  `Schulapps/auswertung/` (untracked, nicht online); physischer Umzug nach `Apps/` steht noch aus.
  Schnellchecks bleiben online (Schuelerzugriff), sammeln aber keine Daten. Schueler sehen die
  Auswertung nie.
- **Kein Cloud-Backend.** Automatische Uebermittlung wuerde einen Server mit personenbezogenen
  Schuelerdaten bedeuten (AV-Vertrag, EU-Standort, TOMs, DSB-Freigabe): fuer eine Einzellehrkraft
  unverhaeltnismaessig. Der Ergebnis-Code-Weg IST der Datenschutz (kein Datum verlaesst je einen Server).
- **Ist-Speicherung** (gebaut, Happen 1): localStorage-Cache + lokale .json via File System Access API
  + manueller Export/Import. Die .json-Datei ist die Datenbank; Datenmodell Klasse -> datierte Erhebung
  -> Schueler -> Aufgaben ist die Jahresansicht.
- **Datenschutz-Feinheiten:** Base64 ist keine Verschluesselung (Klarname reist im Code) -> Codes nur
  ueber M365 (Teams/OneNote), .json nur auf dienstlichem Speicher, Loeschfrist definieren. Mit DSB
  klaeren: reicht der Code-Weg, genuegt die lokale Datei, Loeschfrist, Klarname vs. Pseudonym/Kuerzel.
- **Komfort ohne Server (spaeter):** QR-Code statt Text, Sammelabgabe ueber Teams. Siehe Memory
  [[feedback_dsgvo_schuelerdaten_lokal]].

## Offener Happen: Sammel-Import + Duplikat-Handling (gemerkt 2026-07-09, noch nicht gebaut)
Realer Workflow: Codes kommen NACH UND NACH rein, fuer verschiedene Checks (Schnellcheck 1, spaeter 2,
dann x/y), kein einmaliger Stapel. Folgen fuers Datenmodell:
- Eine Erhebung = ein Check (per `testId`), NICHT ein Paste. Codes desselben Checks landen in derselben
  Erhebung; ein Schueler taucht ueber mehrere Checks/Erhebungen auf (Laengsschnitt).
- Beim Einlesen Duplikat-Warnung, wenn dieser Schueler fuer diesen Check schon einen Eintrag hat
  ("Code fuer Check X, Schueler Y bereits hinterlegt"). Umgang (ueberschreiben / ignorieren / fragen)
  noch OFFEN, spaeter klaeren.
- Aktuell macht `readCodes` aus jedem Paste noch EINE neue Erhebung, ohne testId-Zuordnung und ohne
  Duplikat-Check. Das ist der Umbau dieses Happens.

## Aufraeumen (offen, erst nach Verifikation im Realeinsatz)
`Schulapps/pse-auswertung/` bleibt vorerst als Fallback bestehen. Loeschen samt Log-Eintrag in
`_Aufgeraeumt.md` erst, wenn die neue App im Unterricht verifiziert genutzt wird.
