/**
 * Auswahlmöglichkeiten des Antrags auf Spielberechtigung, so wie sie auf Seite 1
 * ("Zutreffendes") und Seite 2 ("Entfall der Wartezeit") der BFV-Vorlagen
 * stehen. Texte sind gekürzt, aber inhaltlich dem Formular entnommen.
 */

export type AntragKind = "junioren" | "erwachsene";

export const ANTRAG_CHANGES = [
  "erstausstellung",
  "vereinswechsel",
  "vertragsverlaengerung",
  "statuswechsel",
  "zweitspielrecht",
  "zweitspielrecht-ue",
  "sonstiges",
] as const;
export type AntragChange = (typeof ANTRAG_CHANGES)[number];

export type ChangeOption = {
  value: AntragChange;
  label: string;
  /** Kästchen auf Seite 1 der Vorlage. */
  check: string;
};

export const CHANGE_OPTIONS: Record<AntragKind, ChangeOption[]> = {
  junioren: [
    {
      value: "erstausstellung",
      label: "Erster Spielerpass",
      check: "Erstausstellung",
    },
    {
      value: "vereinswechsel",
      label: "Wechsel von einem anderen Verein",
      check: "Vereinswechsel 01",
    },
    { value: "sonstiges", label: "Sonstiges", check: "Sonstiges" },
  ],
  erwachsene: [
    {
      value: "erstausstellung",
      label: "Erster Spielerpass",
      check: "Erstausstellung",
    },
    {
      value: "vereinswechsel",
      label: "Wechsel von einem anderen Verein",
      check: "Vereinswechsel",
    },
    {
      value: "vertragsverlaengerung",
      label: "Vertragsverlängerung",
      check: "Vertragsverlängerung",
    },
    {
      value: "statuswechsel",
      label: "Statuswechsel Vertragsspieler / Amateur",
      check: "Statuswechsel",
    },
    {
      value: "zweitspielrecht",
      label: "Zweitspielrecht (§ 37 SpO)",
      check: "Zweitspielrecht §37 SpO",
    },
    {
      value: "zweitspielrecht-ue",
      label: "Zweitspielrecht Ü-Bereich",
      check: "Zweitspielrecht Ü-Bereich",
    },
    { value: "sonstiges", label: "Sonstiges", check: "Sonstiges 3" },
  ],
};

/** Bei diesen Anträgen gibt es einen bisherigen Verein, Seite 2 und Seite 3. */
export const TRANSFER_CHANGES: readonly AntragChange[] = ["vereinswechsel"];
export const isTransfer = (change: AntragChange) =>
  TRANSFER_CHANGES.includes(change);

export type WaitReason = {
  id: string;
  label: string;
  /** Kästchen auf Seite 2 ("Entfall der Wartezeit"). */
  check: string;
  /** Kästchen auf Seite 1, das den Paragrafen nennt (statt "Vereinswechsel"). */
  pageOneCheck: string;
};

export const WAIT_REASONS: Record<AntragKind, WaitReason[]> = {
  junioren: [
    {
      id: "a",
      label:
        "§ 31 (a) Jugendordnung: Der Spieler hat nachweislich 6 Monate nicht mehr gespielt (Freundschafts- oder Pflichtspiel)",
      check: "Entfall Wartezeit 01",
      pageOneCheck: "Vereinswechsel 02",
    },
    {
      id: "b",
      label:
        "§ 31 (b) Jugendordnung: Nachgewiesener Umzug aus beruflichen, schulischen oder familiären Gründen; der neue Verein liegt dem neuen Wohnort deutlich näher (innerhalb von drei Monaten beantragen, Meldebestätigung beilegen)",
      check: "Entfall Wartezeit 02",
      pageOneCheck: "Vereinswechsel 03",
    },
    {
      id: "c-aufgeloest",
      label:
        "§ 31 (c ff.): Der bisherige Verein oder seine Fußballabteilung hat sich aufgelöst bzw. den Spielbetrieb eingestellt (Bestätigung des bisherigen Vereins)",
      check: "Entfall Wartezeit 03",
      pageOneCheck: "Vereinswechsel 04",
    },
    {
      id: "c-zusammenschluss",
      label:
        "§ 31 (c ff.): Zusammenschluss von Vereinen (der Spieler hatte bei einem davon die Spielerlaubnis) oder dessen Rückgängigmachung",
      check: "Entfall Wartezeit 04",
      pageOneCheck: "Vereinswechsel 04",
    },
    {
      id: "c-studium",
      label:
        "§ 31 (c ff.): Wechsel innerhalb eines Monats nach Studienbeginn (Immatrikulationsbescheinigung) bzw. Rückkehr zum alten Verein nach dem Studium (Nachweis der Exmatrikulation)",
      check: "Entfall Wartezeit 05",
      pageOneCheck: "Vereinswechsel 04",
    },
    {
      id: "c-rueckkehr",
      label:
        "§ 31 (c ff.): Rückkehr zum alten Verein (der neue Verein stimmt zu und der Spieler hat für ihn noch kein Verbandsspiel bestritten)",
      check: "Entfall Wartezeit 06",
      pageOneCheck: "Vereinswechsel 04",
    },
  ],
  erwachsene: [
    {
      id: "1",
      label:
        "Der Spieler hat noch keinem der FIFA angeschlossenen Verband angehört",
      check: "§44 Option 1",
      pageOneCheck: "Vereinswechsel  §44 SpO",
    },
    {
      id: "2",
      label:
        "Amateurspieler hat nachweislich 6 Monate nicht mehr gespielt (Freundschafts- oder Pflichtspiel; Nachweise beilegen)",
      check: "§44 Option 2",
      pageOneCheck: "Vereinswechsel  §44 SpO",
    },
    {
      id: "3",
      label:
        "Der bisherige Verein oder seine Fußballabteilung hat sich aufgelöst bzw. den Spielbetrieb eingestellt (Bestätigung des bisherigen Vereins)",
      check: "§44 Option 3",
      pageOneCheck: "Vereinswechsel  §44 SpO",
    },
    {
      id: "4",
      label:
        "Zusammenschluss von Vereinen (der Spieler hatte bei einem davon die Spielberechtigung)",
      check: "§44 Option 4",
      pageOneCheck: "Vereinswechsel  §44 SpO",
    },
    {
      id: "5",
      label:
        "Ein Vereins-Zusammenschluss wurde rückgängig gemacht (Entscheidung innerhalb von 14 Tagen)",
      check: "§44 Option 5",
      pageOneCheck: "Vereinswechsel  §44 SpO",
    },
    {
      id: "6",
      label:
        "Rückkehr zum alten Verein (der neue Verein stimmt zu und der Spieler hat für ihn noch kein Verbandsspiel bestritten, oder Rückkehr wegen Nicht-Zustimmung zum Wechsel)",
      check: "§44 Option 6",
      pageOneCheck: "Vereinswechsel  §44 SpO",
    },
    {
      id: "7",
      label:
        "Wechsel innerhalb eines Monats nach Studienbeginn zu einem Verein im Stadtgebiet bzw. angrenzenden Landkreis (Immatrikulationsbescheinigung)",
      check: "§44 Option 7",
      pageOneCheck: "Vereinswechsel  §44 SpO",
    },
    {
      id: "8",
      label:
        "Studierender kehrt innerhalb eines Monats nach Ende von Studium oder Semester zum alten Verein zurück (Nachweis der Exmatrikulation)",
      check: "§44 Option 8",
      pageOneCheck: "Vereinswechsel  §44 SpO",
    },
    {
      id: "9",
      label:
        "Neugründung eines Vereins oder einer Fußballabteilung am Wohnort (mindestens zwei Jahre ansässig, Beitritt innerhalb eines Monats)",
      check: "§44 Option 9",
      pageOneCheck: "Vereinswechsel  §44 SpO",
    },
    {
      id: "10",
      label:
        "Wechsel zu einem dritten Verein anlässlich eines Zusammenschlusses des bisherigen Vereins, bis zum festgelegten Abmeldetag",
      check: "§44 Option 10",
      pageOneCheck: "Vereinswechsel  §44 SpO",
    },
  ],
};

export function waitReasonIds(kind: AntragKind): string[] {
  return WAIT_REASONS[kind].map((r) => r.id);
}
