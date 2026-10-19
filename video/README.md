# video

## SV Nord: Admin-Tutorial (dieses Projekt)

Dieser Ordner ist die Remotion-Werkstatt für das Tutorial-Video, das im Admin
auf dem Dashboard eingebettet ist (`payload/components/tour/tutorial-video.ts`).
Die einzige Quelle ist `storyboard.json`; alles andere wird daraus abgeleitet.
Die Pipeline-Skripte liegen unter `video/tools/` (siehe
`video/tools/README.md`), Stufen: plan, capture, narrate, assemble, render, finish.

Neu produzieren, wenn sich das Admin sichtbar ändert (alle Befehle aus dem
Repository-Wurzelverzeichnis):

1. Dev-Server ohne Next-Dev-Bubble starten, lokale Datenbank:
   `NEXT_HIDE_DEV_INDICATOR=1 bunx next dev -p 3010`. Für die Login-Szene ein
   neutrales Konto benutzen (`demo@svnord.de` in der lokalen DB), nie das
   echte Vereins- oder Admin-Konto: das Video ist im Blob-Store öffentlich
   abrufbar, wenn auch nur über die zufällige URL erreichbar.
2. Szenen mit `agent-browser record start video/public/footage/<id>.webm <url>`
   aufnehmen. Innerhalb einer Aufnahme nicht mit `open` navigieren (das
   beendet die Aufnahme), sondern klicken oder `location.assign`. Danach zu
   h264-mp4 wandeln, Remotion liest die Playwright-WebMs nicht zuverlässig:
   `ffmpeg -i <id>.webm -vf "scale=1600:900,fps=30" -c:v libx264 -pix_fmt yuv420p -an <id>.mp4`.
   Bei Bedarf mit `-vf tpad=stop_mode=clone:stop_duration=<s>` verlängern,
   damit das Material mindestens so lang ist wie die Vertonung.
3. `node video/tools/narrate.js` (OpenAI TTS, Stimme und Ton in
   `storyboard.json`; `--realign` erneuert nur die Zeitstempel ohne TTS),
   `node video/tools/assemble.js`, dann `cd video && npm run render:wide-long`,
   dann `node video/tools/finish.js` (schreibt `assets/demo-16x9-long.mp4`).
   `assemble.js` schreibt `src/demovideo.content.ts` unformatiert; das
   Root-Prettier formatiert es beim nächsten Gate, also direkt danach
   `bunx prettier --write video/src` laufen lassen, sonst churnt die Datei.
4. Poster: `ffmpeg -ss 2.5 -i assets/demo-16x9-long.mp4 -frames:v 1 -vf scale=1280:-1 -q:v 3 assets/tutorial-poster.jpg`.
   Untertitel: `node video/tools/captions.js` schreibt `video/out/captions.de.vtt`
   aus denselben Wort-Zeitstempeln (für die `<track>`-Spur des Players).
5. Video, Poster und VTT in den Vercel-Blob-Store laden, mit Datum im Namen und
   `addRandomSuffix: true` (`admin/tutorial-<datum>.mp4`), URL und
   Kapitelzeiten (Szenenstarts aus `src/demovideo.content.ts`) in
   `payload/components/tour/tutorial-video.ts` eintragen, alte Objekte
   löschen. Nie denselben Namen überschreiben, der CDN cacht ein Jahr.

`public/footage`, `public/audio`, `out/` und `../assets/` sind bewusst nicht im
Repository (schwer und reproduzierbar). `src/Wide.tsx` ist auf Vereinsfarben
angepasst; `src/content.ts` und die vier Launch-Assets darunter sind vom
Launch-Template und werden hier nicht benutzt.

The launch-asset compositions (`src/content.ts`, `TEMPLATE.md`) come from a
project template and are not used for this site; the README does not embed them.
