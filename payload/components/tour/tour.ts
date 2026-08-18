"use client";

import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import "./tour.css";

import { tourTarget } from "./tour-targets";

/**
 * Guided tour of the admin, built on driver.js.
 *
 * One tour, started from two places: the sidebar help block on every admin
 * page and the "Erste Schritte" card on the dashboard. Every step points at the
 * dashboard, so starting it elsewhere navigates there first (see startTour).
 * The first visit starts it automatically; after that it only runs on request.
 */

const STORAGE_KEY = "svnord.admin.tour.v1";
const TOUR_CLASS = "svnord-tour";

export { TOUR_TARGET } from "./tour-targets";

/**
 * Nav groups start collapsed after a while (Payload remembers the toggle per
 * user). A collapsed group hides its links, and a hidden link cannot be
 * highlighted, so open everything before the tour points at the sidebar.
 */
function expandNavGroups() {
  document
    .querySelectorAll<HTMLButtonElement>(
      ".nav-group--collapsed .nav-group__toggle",
    )
    .forEach((toggle) => toggle.click());
}

function isVisible(selector: string): boolean {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/**
 * Below Payload's large breakpoint the sidebar sits off-canvas behind the
 * hamburger, still measuring 275px wide, so a size check alone would let the
 * tour highlight thin air. Open it before pointing at it. Returns true when
 * something had to be opened, so the caller can wait for the slide-in.
 */
function ensureNavOpen(): boolean {
  const nav = document.querySelector<HTMLElement>(".nav");
  if (!nav || nav.classList.contains("nav--nav-open")) return false;
  const toggler = document.querySelector<HTMLButtonElement>(
    ".template-default__nav-toggler",
  );
  if (!toggler) return false;
  toggler.click();
  return true;
}

/** The nav is on screen when it is open (large screens open it by default). */
function navOnScreen(): boolean {
  const nav = document.querySelector<HTMLElement>(".nav");
  if (!nav) return false;
  const rect = nav.getBoundingClientRect();
  return rect.right > 0 && rect.width > 0;
}

/**
 * The plan for the whole tour. Text is written for someone who has never used
 * a CMS: what the thing is, what it is for, in that order. Sidebar steps are
 * skipped when the sidebar is collapsed into the hamburger (narrow window),
 * because pointing at nothing is worse than skipping.
 */
function buildSteps(): DriveStep[] {
  const steps: DriveStep[] = [
    {
      popover: {
        title: "Willkommen im SV-Nord-Admin",
        description:
          "Hier pflegt der Verein seine Website selbst. In einer Minute zeige ich dir, wo alles liegt. Du kannst den Rundgang jederzeit mit Esc beenden und später über „Hilfe“ in der Seitenleiste wieder starten.",
      },
    },
    {
      element: ".nav",
      popover: {
        title: "Die Seitenleiste",
        description:
          "Alles, was du bearbeiten kannst, steht hier, sortiert nach Bereichen. Die Nummern zeigen, was am wichtigsten ist: 1 brauchst du oft, 9 fast nie.",
        side: "right",
        align: "start",
      },
    },
    {
      element: '[id="nav-group-1. Inhalte"]',
      popover: {
        title: "1. Inhalte: News und Termine",
        description:
          "Der Bereich für den Alltag. Ein Spielbericht, eine Ankündigung, das Sommerfest: hier schreibst du es rein, und es erscheint auf der Website.",
        side: "right",
        align: "start",
      },
    },
    {
      element: '[id="nav-group-2. Sport"]',
      popover: {
        title: "2. Sport: Mannschaften und Personen",
        description:
          "Mannschaften mit Trainern und Fotos, Personen wie Vorstand und Trainer, und Spiele. Ergebnisse und Tabellen kommen automatisch vom BFV, die musst du nicht pflegen.",
        side: "right",
        align: "start",
      },
    },
    {
      element: "#nav-media",
      popover: {
        title: "Bilder & Medien",
        description:
          "Jedes Foto und jedes Logo landet zuerst hier. Danach wählst du es in einem Artikel oder bei einer Mannschaft aus. Höchstens 4 MB pro Bild, und den Alt-Text (kurze Bildbeschreibung) nicht vergessen.",
        side: "right",
        align: "start",
      },
    },
    {
      element: tourTarget("tasks"),
      popover: {
        title: "Häufige Aufgaben",
        description:
          "Die vier Handgriffe, die am öftesten vorkommen, als Direktlink. Ein Klick, und du bist im richtigen Formular.",
        side: "top",
        align: "start",
      },
    },
    {
      element: tourTarget("video"),
      popover: {
        title: "Das Video",
        description:
          "Zwei Minuten, die einen echten News-Artikel von Anfang bis Ende zeigen, mit Bild. Wenn du unsicher bist, schau kurz rein.",
        side: "top",
        align: "start",
      },
    },
    {
      element: tourTarget("steps"),
      popover: {
        title: "Schritt für Schritt",
        description:
          "So läuft jede Änderung ab: Bereich wählen, „Neu erstellen“ oder einen Eintrag anklicken, Felder ausfüllen, speichern. Die Website aktualisiert sich von selbst.",
        side: "top",
        align: "start",
      },
    },
    {
      element: tourTarget("glossary"),
      popover: {
        title: "Was bedeutet was?",
        description:
          "Ein paar Wörter tauchen immer wieder auf: Alt-Text, Pflichtfeld, Slug. Hier sind sie in einem Satz erklärt.",
        side: "top",
        align: "start",
      },
    },
    {
      element: ".app-header__account",
      popover: {
        title: "Dein Konto",
        description:
          "Passwort ändern oder abmelden. Melde dich am geteilten Rechner am Ende ab.",
        side: "bottom",
        align: "end",
      },
    },
    {
      element: tourTarget("help"),
      popover: {
        title: "Hilfe, jederzeit",
        description:
          "Diesen Rundgang findest du hier wieder, auf jeder Seite des Admins. Viel Erfolg!",
        side: "right",
        align: "end",
      },
    },
  ];

  const navStep = (selector: string) =>
    selector === ".nav" ||
    selector.startsWith('[id="nav-') ||
    selector.startsWith("#nav-") ||
    selector === tourTarget("help");

  return steps.filter((step) => {
    if (typeof step.element !== "string") return true;
    if (!isVisible(step.element)) return false;
    return navStep(step.element) ? navOnScreen() : true;
  });
}

let active: Driver | null = null;
let pending = false;

export function tourSeen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "done";
  } catch {
    return true;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(STORAGE_KEY, "done");
  } catch {
    // Private mode without storage: the tour simply offers itself again.
  }
}

/** True while a tour is on screen; used to avoid stacking two of them. */
export function tourRunning(): boolean {
  return pending || (active?.isActive() ?? false);
}

/**
 * Start the tour on the current page. Callers on other admin pages should
 * navigate to /admin first (see startTourFromAnywhere), otherwise most steps
 * find nothing to point at.
 */
export function startTour() {
  if (tourRunning()) return;
  // Mark as seen the moment it starts, not when it ends: someone who reloads
  // or navigates away mid-tour has seen the offer and must not be nagged again.
  // The buttons replay it on demand.
  markSeen();
  const opened = ensureNavOpen();
  expandNavGroups();

  // Give an off-canvas sidebar its slide-in before measuring the steps.
  pending = true;
  window.setTimeout(() => drive(), opened ? 450 : 0);
}

function drive() {
  pending = false;
  const instance = driver({
    animate: true,
    allowClose: true,
    overlayColor: "#0b1b3f",
    overlayOpacity: 0.55,
    stagePadding: 8,
    stageRadius: 10,
    popoverClass: TOUR_CLASS,
    showProgress: true,
    progressText: "{{current}} von {{total}}",
    nextBtnText: "Weiter",
    prevBtnText: "Zurück",
    doneBtnText: "Fertig",
    steps: buildSteps(),
    onDestroyed: () => {
      active = null;
    },
  });

  active = instance;
  instance.drive();
}

const RESUME_KEY = "svnord.admin.tour.resume";

/**
 * From any admin page: go to the dashboard and start there. The flag survives
 * the navigation and is consumed by the dashboard on mount.
 */
export function startTourFromAnywhere() {
  if (window.location.pathname.replace(/\/$/, "") === "/admin") {
    startTour();
    return;
  }
  try {
    window.sessionStorage.setItem(RESUME_KEY, "1");
  } catch {
    // Without sessionStorage the dashboard simply will not auto-start; the
    // user lands there and can press the button again.
  }
  window.location.assign("/admin");
}

/** Called by the dashboard on mount: honours a pending "start here" flag. */
export function consumeResumeFlag(): boolean {
  try {
    if (window.sessionStorage.getItem(RESUME_KEY) === "1") {
      window.sessionStorage.removeItem(RESUME_KEY);
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}
