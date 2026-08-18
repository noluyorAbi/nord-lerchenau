# Messprotokoll Lighthouse, 18.08.2026

Gemessen gegen die Live-Seite `https://www.svnord.de/` (Startseite), Lighthouse
13.4.1, Chrome headless. Rohberichte sind nicht eingecheckt: sie
enthalten eingebettete Bildschirmfotos als Base64 und sind je 700 kB gross.
Neu erzeugen:

```bash
npx lighthouse https://www.svnord.de --only-categories=accessibility,performance,seo,best-practices \
  --output=json --output-path=/tmp/lh.json --chrome-flags="--headless=new"
```

## Handy (Lighthouse-Standard, gedrosselt)

Zeitpunkt: 2026-08-18T20:13:26.389Z

| Kategorie | Punkte |
|---|---|
| performance | 60 |
| accessibility | 96 |
| best-practices | 100 |
| seo | 100 |

| Messwert | Wert |
|---|---|
| first-contentful-paint | 2.1 s |
| largest-contentful-paint | 23.5 s |
| speed-index | 6.6 s |
| total-blocking-time | 320 ms |
| cumulative-layout-shift | 0 |

Nicht bestandene Prüfungen:

- `first-contentful-paint` (0.8) 2.1 s
- `largest-contentful-paint` (0) 23.5 s
- `total-blocking-time` (0.77) 320 ms
- `speed-index` (0.37) 6.6 s
- `document-latency-insight` (0) Est savings of 110 ms
- `image-delivery-insight` (0) Est savings of 767 KiB
- `lcp-breakdown-insight` (0) 
- `lcp-discovery-insight` (0) 
- `legacy-javascript-insight` (0.5) Est savings of 14 KiB
- `network-dependency-tree-insight` (0) 
- `render-blocking-insight` (0.5) 
- `interactive` (0.01) 23.6 s
- `max-potential-fid` (0.61) 220 ms
- `unused-javascript` (0) Est savings of 91 KiB
- `total-byte-weight` (0.5) Total size was 3,803 KiB
- `mainthread-work-breakdown` (0) 2.9 s
- `redirects` (0) Est savings of 910 ms
- `color-contrast` (0) 
- `label-content-name-mismatch` (0) 

## Schreibtisch (preset=desktop)

Zeitpunkt: 2026-08-18T20:14:32.452Z

| Kategorie | Punkte |
|---|---|
| performance | 55 |
| accessibility | 96 |

| Messwert | Wert |
|---|---|
| first-contentful-paint | 0.6 s |
| largest-contentful-paint | 4.2 s |
| speed-index | 2.1 s |
| total-blocking-time | 110 ms |
| cumulative-layout-shift | 0.402 |

Nicht bestandene Prüfungen:

- `largest-contentful-paint` (0.15) 4.2 s
- `cumulative-layout-shift` (0.25) 0.402
- `speed-index` (0.59) 2.1 s
- `cls-culprits-insight` (0) 
- `document-latency-insight` (0) Est savings of 140 ms
- `image-delivery-insight` (0) Est savings of 767 KiB
- `lcp-discovery-insight` (0) 
- `legacy-javascript-insight` (0.5) Est savings of 14 KiB
- `network-dependency-tree-insight` (0) 
- `render-blocking-insight` (0.5) 
- `interactive` (0.55) 4.2 s
- `max-potential-fid` (0.81) 160 ms
- `unused-javascript` (0) Est savings of 92 KiB
- `total-byte-weight` (0.5) Total size was 3,984 KiB
- `unsized-images` (0.5) 
- `redirects` (0) Est savings of 260 ms
- `layout-shifts` (0) 1 layout shift found
- `color-contrast` (0) 
- `label-content-name-mismatch` (0) 

