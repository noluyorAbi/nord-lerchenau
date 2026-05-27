type Row = {
  jahr: string;
  vorstand1: string;
  vorstand2: string;
  kassier: string;
  schriftfuehrer: string;
};

const ROWS: Row[] = [
  {
    jahr: "2026",
    vorstand1: "Kirmeyer Ralf",
    vorstand2: "Höfer Birgit",
    kassier: "Feierabend Britta",
    schriftfuehrer: "Falk Fabian",
  },
  {
    jahr: "2017–25",
    vorstand1: "Fessenmayer Heinz",
    vorstand2: "Höfer Birgit",
    kassier: "Feierabend Udo",
    schriftfuehrer: "Fessenmayer Sylvia",
  },
  {
    jahr: "2015–17",
    vorstand1: "Pajic Goran",
    vorstand2: "Reinhardt Mathias ***)",
    kassier: "Feierabend Udo",
    schriftfuehrer: "Gagermeier Thomas",
  },
  {
    jahr: "2012–15",
    vorstand1: "Douda Christian",
    vorstand2: "Starostzik Alexander **)",
    kassier: "Werner Christine *)",
    schriftfuehrer: "Wurdack Helmut",
  },
  {
    jahr: "2009–12",
    vorstand1: "Douda Christian",
    vorstand2: "Haberstroh Martin",
    kassier: "Wanninger Christian",
    schriftfuehrer: "Wurdack Helmut",
  },
  {
    jahr: "2008/09",
    vorstand1: "Wennrich Wolfgang",
    vorstand2: "Feierabend Udo",
    kassier: "Röll Sonja",
    schriftfuehrer: "Eichelseder Roland",
  },
  {
    jahr: "2007",
    vorstand1: "Wennrich Wolfgang",
    vorstand2: "Feierabend Udo",
    kassier: "Röll Sonja",
    schriftfuehrer: "Eichelseder Roland",
  },
  {
    jahr: "2005–06",
    vorstand1: "Wennrich Wolfgang",
    vorstand2: "Fessenmayer Heinz",
    kassier: "Röll Sonja",
    schriftfuehrer: "Eichelseder Roland",
  },
  {
    jahr: "2004",
    vorstand1: "Westermair Rudi",
    vorstand2: "Wennrich Wolfgang",
    kassier: "Röll Sonja",
    schriftfuehrer: "Tänzer Kurt",
  },
  {
    jahr: "2000–03",
    vorstand1: "Ottl Günther",
    vorstand2: "Schweiger Hans",
    kassier: "Röll Sonja",
    schriftfuehrer: "Kirmeyer Petra",
  },
  {
    jahr: "1998–99",
    vorstand1: "Tänzer Kurt",
    vorstand2: "Bentlage Robert",
    kassier: "Ottl Günter",
    schriftfuehrer: "Kirmeyer Petra",
  },
  {
    jahr: "1995–97",
    vorstand1: "Tänzer Kurt",
    vorstand2: "Bentlage Robert",
    kassier: "Ottl Günter",
    schriftfuehrer: "Niedermeier Martin",
  },
  {
    jahr: "1994",
    vorstand1: "Tänzer Kurt",
    vorstand2: "Bentlage Robert",
    kassier: "Ottl Günter",
    schriftfuehrer: "Schrank Marion",
  },
  {
    jahr: "1992–93",
    vorstand1: "Tänzer Kurt",
    vorstand2: "Bentlage Robert",
    kassier: "Wennrich Roswitha",
    schriftfuehrer: "Zinsbacher Lydia",
  },
  {
    jahr: "1990–91",
    vorstand1: "Tänzer Kurt",
    vorstand2: "Jendros Helmut",
    kassier: "Wennrich Roswitha",
    schriftfuehrer: "Zinsbacher Lydia",
  },
  {
    jahr: "1988–89",
    vorstand1: "Lanninger Horst",
    vorstand2: "Jendros Helmut",
    kassier: "Wennrich Roswitha",
    schriftfuehrer: "Zinsbacher Lydia",
  },
  {
    jahr: "1986–87",
    vorstand1: "Lanninger Horst",
    vorstand2: "Dietel Siegfried",
    kassier: "Wennrich Roswitha",
    schriftfuehrer: "Zinsbacher Lydia",
  },
  {
    jahr: "1984–85",
    vorstand1: "Lanninger Horst",
    vorstand2: "Promesberger Josef",
    kassier: "Wennrich Roswitha",
    schriftfuehrer: "Röll Sonja",
  },
  {
    jahr: "1982–83",
    vorstand1: "Lanninger Horst",
    vorstand2: "Promesberger Josef",
    kassier: "Wennrich Roswitha",
    schriftfuehrer: "Möchel Monika",
  },
  {
    jahr: "1980–81",
    vorstand1: "Lanninger Horst",
    vorstand2: "Tänzer Kurt",
    kassier: "Wennrich Roswitha",
    schriftfuehrer: "Möchel Monika",
  },
  {
    jahr: "1978–79",
    vorstand1: "Münch Franz",
    vorstand2: "Lanninger Horst",
    kassier: "Wersching Klaus",
    schriftfuehrer: "Zinsbacher Lydia",
  },
  {
    jahr: "1976–77",
    vorstand1: "Viertl Wolfgang",
    vorstand2: "Lanninger Horst",
    kassier: "Hirsch Karl Heinz",
    schriftfuehrer: "Zinsbacher Lydia",
  },
  {
    jahr: "1975",
    vorstand1: "Viertl Wolfgang",
    vorstand2: "Lanninger Horst",
    kassier: "Hirsch Karl Heinz",
    schriftfuehrer: "Hiering Andreas",
  },
  {
    jahr: "1974",
    vorstand1: "Viertl Wolfgang",
    vorstand2: "Lanninger Horst",
    kassier: "Hirsch Karl Heinz",
    schriftfuehrer: "Ramsauer Adolf",
  },
  {
    jahr: "1972–73",
    vorstand1: "Viertl Wolfgang",
    vorstand2: "Albert Georg",
    kassier: "Gelli Florian",
    schriftfuehrer: "Wersching Klaus",
  },
  {
    jahr: "1971",
    vorstand1: "Promesberger Jos.",
    vorstand2: "Gelli Florian",
    kassier: "Meier Heinz",
    schriftfuehrer: "Huber Helmut 2",
  },
  {
    jahr: "1970",
    vorstand1: "Promesberger Jos.",
    vorstand2: "Gelli Florian",
    kassier: "Meier Heinz",
    schriftfuehrer: "Jastrow Jürgen",
  },
  {
    jahr: "1967–69",
    vorstand1: "Huhle Oskar",
    vorstand2: "Helfer Josef",
    kassier: "Riepl Karl",
    schriftfuehrer: "Zenta Martin",
  },
  {
    jahr: "1966",
    vorstand1: "Gossler Franz",
    vorstand2: "Helfer Josef",
    kassier: "Eigenstetter Erich",
    schriftfuehrer: "Schneider Werner",
  },
  {
    jahr: "1964–65",
    vorstand1: "Gossler Franz",
    vorstand2: "Prochnow Manfred",
    kassier: "Eigenstetter Erich",
    schriftfuehrer: "Schneider Werner",
  },
  {
    jahr: "1963",
    vorstand1: "Schmidt Georg",
    vorstand2: "Gossler Franz",
    kassier: "Eigenstetter Erich",
    schriftfuehrer: "Schneider Werner",
  },
  {
    jahr: "1962",
    vorstand1: "Schmidt Georg",
    vorstand2: "Prochnow Manfred",
    kassier: "Härtl Max",
    schriftfuehrer: "Späth Hans",
  },
  {
    jahr: "1961",
    vorstand1: "Schmidt Georg",
    vorstand2: "Gossler Franz",
    kassier: "Härtl Max",
    schriftfuehrer: "Schneider Werner",
  },
  {
    jahr: "1959–60",
    vorstand1: "Späth Hans",
    vorstand2: "Kraft Franz / Schmidt Georg",
    kassier: "Kraft Franz / Härtl Max",
    schriftfuehrer: "Schneider Werner",
  },
  {
    jahr: "1958",
    vorstand1: "Lang Kleophas",
    vorstand2: "Kraft Franz",
    kassier: "Härtl Max",
    schriftfuehrer: "Schneider Werner",
  },
  {
    jahr: "1957",
    vorstand1: "Lang Kleophas",
    vorstand2: "Proll Hans",
    kassier: "Gräf Adolf",
    schriftfuehrer: "Schneider Werner",
  },
  {
    jahr: "1956",
    vorstand1: "Lang Kleophas",
    vorstand2: "Schaflitzl Alfred",
    kassier: "Gräf Adolf",
    schriftfuehrer: "Schneider Werner",
  },
  {
    jahr: "1953–55",
    vorstand1: "Lang Kleophas",
    vorstand2: "Neumeier Josef",
    kassier: "Schmidt G. / Gossler F. / Riepl K.",
    schriftfuehrer: "Schneider Werner",
  },
  {
    jahr: "1952",
    vorstand1: "Lang Kleophas",
    vorstand2: "Kraft Franz",
    kassier: "Riepl Karl",
    schriftfuehrer: "Schneider Werner",
  },
  {
    jahr: "1950–51",
    vorstand1: "Lang Kleophas",
    vorstand2: "Osterrieder K. / Oberauer A.",
    kassier: "Gräf Adolf",
    schriftfuehrer: "Pertl Hans",
  },
  {
    jahr: "1948–49",
    vorstand1: "Hornung Karl sen.",
    vorstand2: "Lang Kleophas / Jäger Karl",
    kassier: "Gräf Adolf",
    schriftfuehrer: "Hornung Karl jr.",
  },
  {
    jahr: "1947",
    vorstand1: "Jennerwein Carl",
    vorstand2: "Lang Kleophas",
    kassier: "Gräf Adolf",
    schriftfuehrer: "Hornung Karl jr.",
  },
];

export function ChronikVorstandschaften() {
  return (
    <div>
      <p className="mb-4 max-w-prose text-sm leading-relaxed text-nord-muted md:text-base">
        Die Amtszeiten unserer Vorstandschaft, chronologisch geordnet von heute
        bis zur Gründung 1947.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-nord-line bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-nord-paper-2 text-left font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-nord-muted">
            <tr>
              <th className="px-4 py-3">Jahr</th>
              <th className="px-4 py-3">1. Vorstand</th>
              <th className="px-4 py-3">2. Vorstand</th>
              <th className="px-4 py-3">Kassier</th>
              <th className="px-4 py-3">Schriftführer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-nord-line/70 text-nord-ink">
            {ROWS.map((r) => (
              <tr key={r.jahr} className="hover:bg-nord-paper-2/60">
                <td className="px-4 py-2 font-display font-bold text-nord-navy">
                  {r.jahr}
                </td>
                <td className="px-4 py-2 font-semibold">{r.vorstand1}</td>
                <td className="px-4 py-2">{r.vorstand2}</td>
                <td className="px-4 py-2">{r.kassier}</td>
                <td className="px-4 py-2">{r.schriftfuehrer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ol className="mt-4 space-y-1 font-mono text-[11px] text-nord-muted">
        <li>*) Amt 2013 niedergelegt</li>
        <li>**) Amt 2014 niedergelegt</li>
        <li>***) ab 2016 Höfer Birgit</li>
      </ol>
    </div>
  );
}
