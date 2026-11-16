# Aspirecend Website

Agentur-Website von **Aspirecend** (Tobias Schieler) – Meta-Ads-Management für Fashion- & E-Commerce-DTC-Brands. Dieses Repo löst schrittweise die bisherige Webflow-Seite (aspirecend.com) ab.

## Kontext / bisherige Entscheidungen

- **Start:** Redesign der Ads-Landingpage `/wachstum-ads` (deutsche Zielgruppe, kalter Meta-Traffic auf Fashion-Founder). Webflow bleibt parallel live, bis die Code-Version steht; Domain-Umstellung erst nach Freigabe durch Tobias.
- **Design:** Dunkles Navy (#070B24) mit subtilen Glows + feinem Grid, Glassmorphism-Karten, Montserrat (Headlines) / Inter (Body) / JetBrains Mono (Eyebrow-Labels), Gold-Akzent `#E7C27D`. Stil-Level: Linear/Raycast bzw. innovationmanagement.at; Struktur angelehnt an advancemedia.nl (Hero + KPI-Leiste → Brand-Logos → Cases → Garantie → Prozess → Testimonials → FAQ → CTA mit Gründer-Karte). Design-Mockup (Claude Design-Canvas): https://claude.ai/artifact/Qf6kkjw9AW9wTfQWanRHcq
- **Tracking hat oberste Priorität:** Google Tag Manager `GTM-K8H9MRTP` (gleicher Container wie Webflow, damit Meta Pixel & Attribution nahtlos weiterlaufen) ist in jeder Seite im `<head>` + `<noscript>` eingebunden. Bei neuen Seiten IMMER mit einbauen. Später geplant: Meta Conversions API.
- **CTAs:** Calendly `https://calendly.com/aspirecend/brand-growth-call` (DE-Landingpages) bzw. `/performance-marketing-chat` (EN/Home).
- **Geplant:** Komplette Website hierher migrieren – Home, Privacy/Datenschutz, Impressum, weitere Landingpages (u. a. VSL-Seite mit Video-Hero). Nischen-Landingpages als Kopien mit angepassten Texten.

## Struktur

- `wachstum-ads/index.html` – die Landingpage (Pfad `/wachstum-ads`)
- `assets/style.css` – globales Stylesheet (Design-Tokens oben in `:root`)
- `index.html` – leitet vorerst auf `/wachstum-ads/` weiter
- Statisches HTML/CSS ohne Framework/Build-Step. Deployment-Ziel: Vercel oder Cloudflare Pages (statisch).

## Arbeitsweise

- Tobias ist kein Entwickler: Änderungen als klare Umsetzung seiner Ansagen, keine Rückfragen zu Code-Details. Deutsch antworten.
- Texte/Zahlen (Cases, Testimonials, FAQ) stammen von der echten Webflow-Seite – keine Zahlen erfinden oder „verbessern".
- Mobile ist der wichtigste Viewport (Meta-Ads-Traffic): jede Änderung auch bei ~390 px prüfen.
- Lokale Vorschau: `npx serve` im Repo-Root (oder Datei direkt im Browser öffnen).
