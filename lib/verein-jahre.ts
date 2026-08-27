/** Gründungsjahr des SV Nord München-Lerchenau e.V. */
export const VEREIN_GEGRUENDET = 1947;

/**
 * Wie viele Jahre der Verein besteht.
 *
 * Stand bisher an zwei Stellen als feste Zahl ("78 Jahre") und war damit ab
 * dem 1. Januar falsch, ohne dass es jemandem auffaellt: eine Zahl, die
 * stillschweigend veraltet, sieht bis zuletzt richtig aus. Die Chronik hat es
 * schon gerechnet, /verein nicht.
 *
 * `now` ist ein Parameter, damit die Rechnung pruefbar ist, ohne die Uhr zu
 * stellen.
 */
export function vereinsJahre(now: Date = new Date()): number {
  return now.getFullYear() - VEREIN_GEGRUENDET;
}
