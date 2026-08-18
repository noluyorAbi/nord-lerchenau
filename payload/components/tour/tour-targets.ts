/**
 * Anchors the tour points at on the dashboard. Lives in its own file with no
 * "use client" directive on purpose: WelcomeDashboard is a server component,
 * and importing an object from a client module there yields a client reference
 * instead of the object, so the attributes would silently render as nothing.
 */
export const TOUR_TARGET = {
  intro: "intro",
  video: "video",
  tasks: "tasks",
  steps: "steps",
  glossary: "glossary",
  help: "help",
} as const;

export function tourTarget(name: keyof typeof TOUR_TARGET): string {
  return `[data-tour="${TOUR_TARGET[name]}"]`;
}
