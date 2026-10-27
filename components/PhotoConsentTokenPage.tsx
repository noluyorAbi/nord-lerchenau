import { PageHero } from "@/components/PageHero";
import { PhotoConsentAction } from "@/components/PhotoConsentAction";

type Props = {
  action: "bestaetigen" | "widerrufen";
  token: string | undefined;
};

const COPY = {
  bestaetigen: {
    title: "Zustimmung bestätigen.",
    lede: "Ein Klick, dann darf das Mannschaftsfoto mit deinem Kind auf unserer Website erscheinen.",
  },
  widerrufen: {
    title: "Zustimmung widerrufen.",
    lede: "Nach dem Widerruf blenden wir das Mannschaftsfoto sofort aus.",
  },
} as const;

/** Landeseite fuer die Links aus der Bestaetigungsmail. */
export function PhotoConsentTokenPage({ action, token }: Props) {
  const copy = COPY[action];
  return (
    <>
      <PageHero eyebrow="Mannschaftsfoto" title={copy.title} lede={copy.lede} />
      <div className="mx-auto max-w-3xl px-6 py-14 md:px-10 md:py-20">
        <section className="rounded-2xl border border-nord-line bg-white p-6 shadow-[0_1px_0_rgba(11,27,63,0.04)] md:p-10">
          {token ? (
            <PhotoConsentAction action={action} token={token} />
          ) : (
            <p className="text-sm text-nord-muted">
              Der Link ist unvollständig. Bitte öffne ihn direkt aus der Mail.
            </p>
          )}
        </section>
      </div>
    </>
  );
}
