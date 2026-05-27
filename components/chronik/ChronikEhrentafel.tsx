type Ehrenperson = {
  name: string;
  jahre?: string;
  body: string[];
};

const EHRENVORSTAENDE: Ehrenperson[] = [
  {
    name: "Lang Kleophas",
    jahre: "1914 – 1992",
    body: [
      "Gründungsmitglied und Mäzen.",
      "2. Vorstand bis 1948, 1. Vorstand von 1950 bis 1958. 1959 zum Ehrenvorstand ernannt.",
    ],
  },
  {
    name: "Lanninger Horst",
    body: [
      "Kam als Mitglied der BSG Hurth am 01. Januar 1963 zum SV Nord.",
      "1974 bis 1979 zweiter Vorstand, anschließend 1. Vorstand bis 1990.",
      "Seit 1986 im Vorstand der Vereins-Interessengemeinschaft Lerchenau (Eschengarten).",
      "1997 zum Ehrenvorstand des SV Nord ernannt. 9 Spiele in der 1. Fußball-Mannschaft, 2 Tore.",
    ],
  },
];

const EHRENMITGLIEDER: Ehrenperson[] = [
  {
    name: "Schaflitzl Anna",
    jahre: "1905 – 1990",
    body: [
      "Langjährige Wirtin unseres Vereinslokals Schützengarten. Frau Schaflitzl, auch „Mutti“ genannt, unterstützte ab 1947 — als Not und Hunger die Zeit bestimmten — vor allem unsere Jugendlichen mit Speisen und Getränken.",
      "1950 zum Ehrenmitglied ernannt.",
    ],
  },
  {
    name: "Gerber Josef",
    jahre: "1903 – 1986",
    body: [
      "Mitglied ab 1949. Aktiver Schiedsrichter von 1949 bis 1964.",
      "1980 zum Ehrenmitglied ernannt. 1984 zum Ehrenmitglied der Münchner Schiedsrichtervereinigung ernannt.",
    ],
  },
  {
    name: "Riepl Karl",
    jahre: "1921 – 2007",
    body: [
      "Mitglied ab 01.01.1948.",
      "Fußball-Jugendleiter 1951/52, Fußball-Abteilungsleiter 1955–1958.",
      "Vereinskassier von 1956–1959 und 1967–1969.",
      "Chronist der Fußballabteilung von 1948–1996.",
      "1980 zum Ehrenmitglied ernannt. 165 Spiele in der 1. Fußball-Mannschaft, 4 Tore.",
    ],
  },
  {
    name: "Riepl Annemarie",
    body: [
      "Mitglied ab 01.11.1967.",
      "Gründerin der Gymnastikabteilung 1967 und Abteilungsleiterin bis 1995.",
      "1994 zum Ehrenmitglied ernannt.",
    ],
  },
  {
    name: "Härtl Max",
    jahre: "1927 – 2011",
    body: [
      "Gründungsmitglied. 118 Spiele in der 1. Fußball-Mannschaft, 5 Tore.",
      "Wurde wegen ununterbrochener 50-jähriger Mitgliedschaft am 12. Juli 1997 zum Ehrenmitglied ernannt.",
    ],
  },
  {
    name: "Pertl Johann",
    jahre: "1927 – 2014",
    body: [
      "Gründungsmitglied.",
      "Wurde wegen ununterbrochener 50-jähriger Mitgliedschaft am 12. Juli 1997 zum Ehrenmitglied ernannt.",
    ],
  },
  {
    name: "Riepl Simon",
    jahre: "1923 – 2011",
    body: [
      "Gründungsmitglied. 87 Spiele in der 1. Fußball-Mannschaft, 4 Tore.",
      "Wurde wegen ununterbrochener 50-jähriger Mitgliedschaft am 12. Juli 1997 zum Ehrenmitglied ernannt.",
    ],
  },
  {
    name: "Tänzer Kurt",
    body: [
      "Mitglied ab November 1967.",
      "1970–1973 A-Jugendtrainer · 1973–1975 Trainer 1. Mannschaft.",
      "1976–1979 AL Fußball (mit Ludwig Kettner) · 1979–1982 A+B-Jugendtrainer · 1980–1981 2. Vorstand.",
      "1982–2007 Schiedsrichter · 1982–1988 Jugendleiter (zeitw. mit Gerd Lausch) · 1990–1999 1. Vorstand · 1995–2007 Schiedsrichter-Obmann.",
      "2007, im Rahmen des 60-jährigen Vereinsjubiläums zum Ehrenmitglied ernannt. Ein Spiel in der 1. Fußball-Mannschaft.",
    ],
  },
  {
    name: "Wennrich Roswitha",
    jahre: "1944 – 2018",
    body: [
      "Mitglied ab November 1967. 1975 Gründerin der Damenfußball-Abteilung und Abteilungsleiterin bis 1985.",
      "Kassier des SV Nord von 1980 bis 1993.",
      "1984–1986 und 1996/1997 Kassier der Vereins-Interessengemeinschaft (Eschengarten).",
      "2007, im Rahmen des 60-jährigen Vereinsjubiläums zum Ehrenmitglied ernannt.",
    ],
  },
  {
    name: "Mauler Horst",
    body: [
      "Kam im Juli 1968 als 13-Jähriger zum SV Nord.",
      "1970 bis 2007 ununterbrochen Jugendtrainer aller Altersklassen. Nach nur einem Jahr Pause weiterhin Trainer und Betreuer bis heute.",
      "Von 1973 bis 1995 vorwiegend in der 2. Mannschaft aktiv, fünf Einsätze in der 1. Mannschaft. 1990 Verbandsehrenzeichen des BFV in Gold.",
      "1995–2005 aktiver Schiedsrichter. 1977 silberne, 1996 goldene Vereins-Ehrennadel.",
      "2007 wegen außerordentlicher Verdienste zum Ehrenmitglied ernannt.",
    ],
  },
  {
    name: "Bauer Sebastian",
    body: [
      "Gründungsmitglied. 1957 Schiedsrichterprüfung · 1959–2004 Schiedsrichter · 1964–1994 Schiedsrichter-Obmann.",
      "Wurde wegen ununterbrochener 60-jähriger Mitgliedschaft 2007 zum Ehrenmitglied ernannt.",
    ],
  },
  {
    name: "Richter Rudolf",
    body: [
      "Gründungsmitglied. 165 Spiele in der 1. Fußball-Mannschaft, davon fünfmal als Torwart (!), 43 Tore.",
      "Wurde wegen ununterbrochener 60-jähriger Mitgliedschaft 2007 zum Ehrenmitglied ernannt.",
    ],
  },
  {
    name: "Heldeis Heinz",
    body: [
      "Gründungsmitglied. 29 Spiele in der 1. Fußball-Mannschaft, 3 Tore.",
      "Wurde wegen ununterbrochener 60-jähriger Mitgliedschaft 2007 zum Ehrenmitglied ernannt.",
    ],
  },
];

function PersonCard({ p }: { p: Ehrenperson }) {
  return (
    <article className="rounded-2xl border border-nord-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-nord-gold hover:shadow-md md:p-6">
      <h4 className="font-display text-lg font-black tracking-tight text-nord-ink md:text-xl">
        {p.name}
      </h4>
      {p.jahre ? (
        <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-nord-muted">
          {p.jahre}
        </div>
      ) : null}
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-nord-ink md:text-[15px]">
        {p.body.map((b, i) => (
          <p key={i}>{b}</p>
        ))}
      </div>
    </article>
  );
}

export function ChronikEhrentafel() {
  return (
    <div className="space-y-10">
      <div>
        <div className="mb-4 flex items-baseline justify-between border-b border-nord-line pb-2">
          <h3 className="font-display text-xl font-black tracking-tight text-nord-ink md:text-2xl">
            Ehren-Vorstände
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
            {EHRENVORSTAENDE.length}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {EHRENVORSTAENDE.map((p) => (
            <PersonCard key={p.name} p={p} />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-baseline justify-between border-b border-nord-line pb-2">
          <h3 className="font-display text-xl font-black tracking-tight text-nord-ink md:text-2xl">
            Ehren-Mitglieder
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-nord-muted">
            {EHRENMITGLIEDER.length}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {EHRENMITGLIEDER.map((p) => (
            <PersonCard key={p.name} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
