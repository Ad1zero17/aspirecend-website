# Aspirecend Website

Agentur-Website von **Aspirecend** (Tobias Schieler) – Meta-Ads-Management für Fashion- & E-Commerce-DTC-Brands. Dieses Repo löst schrittweise die bisherige Webflow-Seite (aspirecend.com) ab.

## Kontext / bisherige Entscheidungen

- **Start:** Redesign der Ads-Landingpage `/wachstum-ads` (deutsche Zielgruppe, kalter Meta-Traffic auf Fashion-Founder). Webflow bleibt parallel live, bis die Code-Version steht; Domain-Umstellung erst nach Freigabe durch Tobias.
- **Design (Stand 16.11.2026, von Tobias so gewünscht):** Eleganter, luxuriöser Look nach Vorbild der Collabs-Seite von Les Énervés. Headlines und große Zahlen in Serif (Playfair Display 600, Akzentzeile kursiv in Gold, Ziffern mit `lnum`), Fließtext, Labels, Buttons und Wortmarke in Montserrat (Labels versal mit weitem Zeichenabstand; Fließtext seit 18.11.2026 Montserrat statt Inter, von Tobias im direkten Vergleich gewählt). Farben nicht statisch Navy: Der Seitenhintergrund läuft von Navy (#070B24) in Aubergine/Plum und zurück, dazu weiche Glows; Prozess + Kundenstimmen liegen in einem eigenen Plum-Panel (`.tone`). Text in Creme `#F8EDE1`, Gold-Akzent `#E7C27D`, Glass-Karten, Creme-Buttons mit dunklem Pfeil-Kreis. Kein Grid-Muster mehr, keine Mono-Schrift. Struktur angelehnt an advancemedia.nl (Hero + KPI-Leiste → Brand-Logos → Cases → Garantie → Prozess → Testimonials → FAQ → CTA mit Gründer-Karte). Design-Mockup (Claude Design-Canvas): https://claude.ai/artifact/Qf6kkjw9AW9wTfQWanRHcq
- **Tracking hat oberste Priorität:** Google Tag Manager `GTM-K8H9MRTP` (gleicher Container wie Webflow, damit Meta Pixel & Attribution nahtlos weiterlaufen) ist in jeder Seite im `<head>` + `<noscript>` eingebunden. Bei neuen Seiten IMMER mit einbauen. Später geplant: Meta Conversions API.
- **CTAs:** Calendly `https://calendly.com/aspirecend/brand-growth-call` (DE-Landingpages) bzw. `/performance-marketing-chat` (EN/Home).
- **Geplant:** Komplette Website hierher migrieren – Home, Privacy/Datenschutz, Impressum, weitere Landingpages (u. a. VSL-Seite mit Video-Hero). Nischen-Landingpages als Kopien mit angepassten Texten.

## Struktur

- `public/` – alles, was online geht. Nur dieser Ordner wird veröffentlicht; Notizen wie diese Datei bleiben draußen.
- `functions/assets/video/[[path]].js` – kleine Cloudflare-Pages-Funktion (läuft bei Cloudflare, kein eigener Server): liefert Videos unter `/assets/video/*` in Teilstücken aus (Range/206). Ohne das spielt Safari auf dem iPhone selbst gehostete Videos nicht ab, weil Pages statische Dateien nur am Stück ausliefert. Nach Änderungen an Videos prüfen: `curl -H "Range: bytes=0-999"` muss 206 liefern.
- `public/wachstum-ads/index.html` – die Landingpage (Pfad `/wachstum-ads`)
- `public/assets/style.css` – globales Stylesheet (Design-Tokens oben in `:root`)
- Case-Karten (`.card--case`) haben oben eine animierte Mini-Ansicht (`.viz`, Vorbild rize.io, seit 23.11.2026): zwei Balken + Notiz, Schleife per kleinem Script am Seitenende. Alle Werte darin sind die echten Case-Zahlen aus dem Kartentext – bei Textänderungen `data-from`/`data-to`, Balken-Prozent (`--from`) und Notiz mit anpassen.
- Kundenstimmen (seit 23.11.2026): nur die zwei schriftlichen Reviews von der Webflow-Seite (Wakim Krari / Maison Les Énervés, Sheryl Hawkins / Lusher), wortgleich auf Englisch – Tobias will sie NICHT übersetzt. Die Karte zeigt nur einen kurzen Anriss (3 Zeilen); Klick auf die Karte öffnet den vollen Text in einem Fenster (`<dialog class="review-dialog">`, von Tobias so gewünscht statt Aufklappen). Darüber die Reihe der vier Video-Testimonials von der Webflow-Seite (Siobhan/IntoGaia, Mariana/Wild&Pacific, Federico Uribe/209Mare, Roshni/LittleIA; Stefan Ponsold/Sunnybag am 23.11.2026 auf Tobias' Wunsch entfernt und NICHT wieder als Testimonial aufnehmen, auch nicht auf anderen Seiten): Hochkant-Kacheln mit Vimeo-Vorschaubild aus `public/assets/testimonials/`, am Handy seitlich wischbar. Der Vimeo-Player wird erst beim Klick geladen (Ladezeit + Datenschutz) und öffnet im selben Fenster wie die Reviews, darunter das deutsche Zitat von Webflow. Federicos Video ist nicht gelistet und braucht den Hash (`data-hash`).
- Interview-Sektion `#fairdim` (seit 23.11.2026, zwischen Cases und Garantie): Ali, Founder FAIRDIM, im Gespräch mit Tobias. Video liegt selbst gehostet in `public/assets/video/` (aus Tobias' 9:16-Original mit ffmpeg auf 4:5 geschnitten, 720×900, ~2 MB; Untertitel sind eingebrannt). Läuft stumm in Schleife, solange sichtbar; Knopf „Ton an“. Das Zitat daneben ist der Wortlaut aus dem Video (Englisch). Zahlen zur Skalierung fehlen noch – nur ergänzen, wenn Tobias sie liefert.
- Video-Kacheln tragen oben links das Brand-Logo (`*-trim.png` = randlos geschnittene Fassungen). Für LittleIA (Roshni) fehlt das Logo noch.
- `public/assets/logos/` – Kundenlogos (21) und Partner-Abzeichen (4) als transparente PNGs. Stand 18.11.2026 aus den zwei Sammelbildern der Webflow-Seite geschnitten (Auflösung daher begrenzt); schickt Tobias Original-Logodateien, diese hier ersetzen.
- `public/index.html` – leitet vorerst auf `/wachstum-ads/` weiter
- Statisches HTML/CSS ohne Framework/Build-Step. Deployment: Cloudflare Pages (statisch, Ausgabeordner `public`, kein Build-Befehl).
- **Vorschau-Link:** https://aspirecend-website.pages.dev/wachstum-ads/ – Cloudflare-Pages-Projekt `aspirecend-website`, per Git mit diesem Repo verbunden. Jeder Push auf `main` geht nach etwa einer Minute automatisch online. Unbekannte Pfade liefern die Startseite (Fallback), also beim Prüfen auf echten Seiteninhalt achten, nicht nur auf Status 200.

## Arbeitsweise

- Tobias ist kein Entwickler: Änderungen als klare Umsetzung seiner Ansagen, keine Rückfragen zu Code-Details. Deutsch antworten.
- Texte/Zahlen (Cases, Testimonials, FAQ) stammen von der echten Webflow-Seite – keine Zahlen erfinden oder „verbessern".
- Mobile ist der wichtigste Viewport (Meta-Ads-Traffic): jede Änderung auch bei ~390 px prüfen.
- Lokale Vorschau: Auf dem Mac ist kein Node installiert, also `python3 -m http.server` im Ordner `public/` statt `npx serve`. Die Vorschau der Claude-App kann `~/Documents` nicht direkt lesen: `public/` vorher in einen temporären Ordner kopieren und von dort ausliefern.
