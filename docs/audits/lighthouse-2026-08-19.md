# Messprotokoll Lighthouse, 19.08.2026

Gemessen gegen die Live-Seite `https://www.svnord.de/` (Startseite), Lighthouse
13.4.1, Chrome headless, nach den beiden Korrekturen
vom 18. und 19.08.2026 (Kontraste, Hero über next/image, Fusszeilen-Logos mit
fester Fläche, neu komprimierte Nachrichtenbilder). Rohberichte sind nicht
eingecheckt, sie enthalten Bildschirmfotos als Base64. Neu erzeugen:

```bash
npx lighthouse https://www.svnord.de --only-categories=accessibility,performance,seo,best-practices \
  --output=json --output-path=/tmp/lh.json --chrome-flags="--headless=new"
```

## Handy (Lighthouse-Standard, gedrosselt)

Zeitpunkt: 2026-08-19T06:56:18.916Z

| Kategorie | Punkte |
|---|---|
| performance | 70 |
| accessibility | 96 |
| best-practices | 100 |
| seo | 100 |

| Messwert | Wert |
|---|---|
| first-contentful-paint | 1.8 s |
| largest-contentful-paint | 8.3 s |
| speed-index | 5.1 s |
| total-blocking-time | 110 ms |
| cumulative-layout-shift | 0 |

Nicht bestandene Prüfungen:

- `largest-contentful-paint` (0.02) 8.3 s
- `speed-index` (0.62) 5.1 s
- `document-latency-insight` (0) Est savings of 190 ms
- `image-delivery-insight` (0) Est savings of 272 KiB
- `legacy-javascript-insight` (0) Est savings of 14 KiB
- `network-dependency-tree-insight` (0) 
- `render-blocking-insight` (0) Est savings of 150 ms
- `interactive` (0.39) 8.4 s
- `max-potential-fid` (0.87) 140 ms
- `unused-javascript` (0) Est savings of 92 KiB
- `mainthread-work-breakdown` (0) 2.1 s
- `redirects` (0) Est savings of 790 ms
- `color-contrast` (0) 

## Schreibtisch (preset=desktop)

Zeitpunkt: 2026-08-19T06:56:40.880Z

| Kategorie | Punkte |
|---|---|
| performance | 69 |
| accessibility | 96 |
| best-practices | 100 |
| seo | 100 |

| Messwert | Wert |
|---|---|
| first-contentful-paint | 0.5 s |
| largest-contentful-paint | 2.2 s |
| speed-index | 1.5 s |
| total-blocking-time | 0 ms |
| cumulative-layout-shift | 0.402 |

Nicht bestandene Prüfungen:

- `largest-contentful-paint` (0.57) 2.2 s
- `cumulative-layout-shift` (0.25) 0.402
- `speed-index` (0.83) 1.5 s
- `cls-culprits-insight` (0) 
- `document-latency-insight` (0) Est savings of 110 ms
- `image-delivery-insight` (0) Est savings of 456 KiB
- `legacy-javascript-insight` (0.5) Est savings of 14 KiB
- `network-dependency-tree-insight` (0) 
- `render-blocking-insight` (0.5) 
- `unused-javascript` (0) Est savings of 92 KiB
- `total-byte-weight` (0.5) Total size was 3,389 KiB
- `unsized-images` (0.5) 
- `redirects` (0) Est savings of 240 ms
- `layout-shifts` (0) 1 layout shift found
- `color-contrast` (0) 

## Kontrastmessung, eigener Durchlauf

Eigenes Skript, das jede der 52 Seiten im Browser lädt, für jedes Textelement
Vorder- und Hintergrundfarbe berechnet und gegen die WCAG-AA-Schwelle prüft
(4,5:1 für Fliesstext, 3:1 für grosse Schrift). Text über Fotos wird
übersprungen, dort ist der Wert nicht berechenbar.

| Stand | Verstösse |
|---|---|
| vor der Korrektur (18.08.) | 665 |
| nach Runde 1 | 67 |
| nach Runde 2 (19.08.) | 8, davon 8 Fehlalarme (Tailwind-oklch-Flächen und Text über Fotos) |

