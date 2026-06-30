// Offizielle Formulare der BFV-Passabteilung, direkt vom BFV verlinkt
// (nicht lokal gespiegelt — so bleiben sie immer auf dem aktuellen Stand).
// Vollständige Liste inkl. Sonderspielrechte, Zweitspielrechte, internationale
// Wechsel und Sammellisten: BFV_FORMULARE_URL.
//
// Stand der kuratierten Auswahl: Juni 2026. Wenn ein Link ins Leere läuft,
// hat der BFV die Datei ersetzt — aktuelle Version über BFV_FORMULARE_URL holen.

export const BFV_FORMULARE_URL =
  "https://www.bfv.de/spielbetrieb-verbandsleben/paesse-und-vereinswechsel/formulare-der-passabteilung";

export type BfvFormFileType = "PDF" | "DOC";

export type BfvForm = {
  title: string;
  /** Gültigkeit oder Stand, z. B. "ab 1. Juli 2026" oder "Stand: April 2025". */
  note: string;
  type: BfvFormFileType;
  href: string;
};

export type BfvFormGroup = {
  eyebrow: string;
  title: string;
  forms: BfvForm[];
};

export const BFV_FORM_GROUPS: BfvFormGroup[] = [
  {
    eyebrow: "Anmeldung",
    title: "Spielberechtigung & Anmeldung",
    forms: [
      {
        title: "Antrag auf Spielberechtigung — Erwachsene",
        note: "ab 1. Juli 2026",
        type: "PDF",
        href: "https://www.bfv.de/binaries/content/assets/inhalt/spielbetrieb-verbandsleben/paesse-und-vereinswechsel/passe-vereinswechsel/antrag-auf-spielberechtigung/antrag-auf-spielberechtigung-erwachsene-ab-01.07.2026.pdf",
      },
      {
        title: "Antrag auf Spielberechtigung — Junioren/Juniorinnen",
        note: "ab 1. Juli 2026",
        type: "PDF",
        href: "https://www.bfv.de/binaries/content/assets/inhalt/spielbetrieb-verbandsleben/paesse-und-vereinswechsel/passe-vereinswechsel/antrag-auf-spielberechtigung/antrag-auf-spielberechtigung-jugend-ab-01.07.2026.pdf",
      },
      {
        title: "Einverständniserklärung Erziehungsberechtigter",
        note: "§34 JO / §25 FMO",
        type: "PDF",
        href: "https://www.bfv.de/binaries/content/assets/inhalt/spielbetrieb-verbandsleben/paesse-und-vereinswechsel/einverstandniserklarungen/einverstaendniserklaerung-erziehungsberechtigter-paragraf-34-jo-und-paragraf-25-fmo.pdf",
      },
    ],
  },
  {
    eyebrow: "Wechsel",
    title: "Abmeldung & Vereinswechsel",
    forms: [
      {
        title: "Abmeldung vom Spielbetrieb",
        note: "Stand: April 2025",
        type: "PDF",
        href: "https://www.bfv.de/binaries/content/assets/inhalt/spielbetrieb-verbandsleben/paesse-und-vereinswechsel/passe-vereinswechsel/abmeldung-vom-spielbetrieb-2025.pdf",
      },
      {
        title: "Einverständniserklärung für die Online-Abmeldung",
        note: "ab 1. Juli 2026",
        type: "PDF",
        href: "https://www.bfv.de/binaries/content/assets/inhalt/spielbetrieb-verbandsleben/paesse-und-vereinswechsel/passe-vereinswechsel/einverstandniserklarung-fur-die-online-abmeldung-ab-01.07.2026.pdf",
      },
      {
        title: "Nachträgliche Freigabe zum Vereinswechsel",
        note: "Stand: April 2023",
        type: "PDF",
        href: "https://www.bfv.de/binaries/content/assets/inhalt/spielbetrieb-verbandsleben/paesse-und-vereinswechsel/passe-vereinswechsel/nachtragliche-freigabe-zum-vereinswechsel.pdf",
      },
    ],
  },
  {
    eyebrow: "Verträge",
    title: "Musterverträge",
    forms: [
      {
        title: "Mustervertrag Vertragsspieler",
        note: "Stand: Februar 2024",
        type: "PDF",
        href: "https://www.bfv.de/binaries/content/assets/inhalt/spielbetrieb-verbandsleben/paesse-und-vereinswechsel/mustervertrage/mustervertrag-vertragsspieler-bfv-stand-februar-2024.pdf",
      },
      {
        title: "Mustervertrag Trainer",
        note: "Stand: April 2023",
        type: "PDF",
        href: "https://www.bfv.de/binaries/content/assets/inhalt/spielbetrieb-verbandsleben/paesse-und-vereinswechsel/mustervertrage/mustervertrag_trainer.pdf",
      },
    ],
  },
];
