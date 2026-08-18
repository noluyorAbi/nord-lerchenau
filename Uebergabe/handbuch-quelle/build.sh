#!/usr/bin/env bash
# Baut das Handbuch. Zwei Dinge, die ein Handlauf falsch macht:
#
#   1. Ein Lauf statt zwei. Die dunklen Seiten beziehen ihre Position ueber
#      remember picture, und \pageref braucht die Aux-Datei aus dem ersten Lauf.
#      Nach einem Lauf steht "??" im Text und ein Verweis zeigt ins Leere.
#   2. Aufraeumen vor dem Pruefen. Wer handbuch.log loescht und danach nach
#      Overfull sucht, findet nie etwas. Hier wird erst geprueft, dann geraeumt.
#
# Aufruf:  build.sh [verzeichnis-mit-handbuch.tex]
set -euo pipefail
cd "${1:-$(dirname "$0")}"

if [ ! -f handbuch.tex ]; then
  echo "handbuch.tex liegt nicht in $(pwd)" >&2
  exit 2
fi

command -v xelatex >/dev/null || { echo "xelatex fehlt. MacTeX oder TeX Live installieren." >&2; exit 2; }

# --- Schriften -------------------------------------------------------------
# Die Schriften der Website, damit das Heft und die Seite dieselbe Stimme haben,
# plus eine Serife fuer den gedruckten Fliesstext. Wird nur geladen, was fehlt.
if [ -f fonts.txt ] && [ ! -f fonts/.complete ]; then
  echo "Schriften laden..."
  mkdir -p fonts
  python3 - "$(cat fonts.txt)" <<'PY'
import re, sys, urllib.request, os
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
# fonts.txt: eine Zeile je Schrift, "Kurzname|Google-Familie|Achsen"
for line in sys.argv[1].splitlines():
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    short, family, axis = (line.split('|') + ['wght@400'])[:3]
    url = f'https://fonts.googleapis.com/css2?family={family}:{axis}&display=swap'
    try:
        css = urllib.request.urlopen(urllib.request.Request(url, headers=UA)).read().decode()
    except Exception as e:
        print(f'  {short}: {e}')
        continue
    for block in re.findall(r'@font-face\s*\{(.*?)\}', css, re.S):
        weight = re.search(r'font-weight:\s*(\d+)', block)
        href = re.search(r'url\((https://[^)]+\.ttf)\)', block)
        if not (weight and href):
            continue
        italic = 'i' if 'italic' in block else ''
        out = f'fonts/{short}-{weight.group(1)}{italic}.ttf'
        if not os.path.exists(out):
            urllib.request.urlretrieve(href.group(1), out)
            print('  ', out)
PY
  touch fonts/.complete
fi

# --- Satz ------------------------------------------------------------------
# Nicht nach /dev/null: ein harter Fehler beendete das Skript wortlos, weil
# set -e zuschlug, bevor die Pruefungen liefen. Jetzt wird der Ausgang gemerkt
# und die Fehlerzeilen werden gezeigt.
run() {
  if ! xelatex -interaction=nonstopmode handbuch.tex >xelatex.out 2>&1; then
    echo "FEHLER: xelatex ist ausgestiegen." >&2
    grep -m 10 -E "^!|^l\.[0-9]+|LaTeX Error|not found" xelatex.out >&2 || tail -20 xelatex.out >&2
    echo "Vollstaendiges Protokoll: $(pwd)/handbuch.log und xelatex.out" >&2
    exit 1
  fi
}
run
run

# --- Pruefen, dann raeumen -------------------------------------------------
status=0

if grep -q "Overfull" handbuch.log; then
  n=$(grep -c "Overfull" handbuch.log)
  echo "FEHLER: $n ueberlaufende Box(en) im Satz." >&2
  grep -m 3 -A 1 "Overfull" handbuch.log >&2
  status=1
fi

if grep -qE "LaTeX Warning: (Reference|Citation).*undefined" handbuch.log; then
  echo "FEHLER: ein Verweis ist nicht aufgeloest, im Text steht '??'." >&2
  grep -m 3 "undefined" handbuch.log >&2
  status=1
fi

if grep -q "Missing character" handbuch.log; then
  echo "FEHLER: fehlende Zeichen im Font, im PDF fehlt Text unsichtbar." >&2
  grep -m 3 "Missing character" handbuch.log >&2
  status=1
fi

pages=$(python3 -c "
import re,sys
m=re.findall(r'Output written on handbuch.pdf \((\d+) page', open('handbuch.log',errors='ignore').read())
print(m[-1] if m else '?')")

if [ "$status" -ne 0 ]; then
  echo "Protokolle bleiben zur Fehlersuche liegen: handbuch.log, xelatex.out" >&2
else
  rm -f handbuch.aux handbuch.log handbuch.out handbuch.toc xelatex.out
fi

if [ "$status" -ne 0 ]; then
  echo "Bau abgebrochen, PDF nicht uebergabefaehig." >&2
  exit "$status"
fi

echo "fertig: $(pwd)/handbuch.pdf, $pages Seiten"
