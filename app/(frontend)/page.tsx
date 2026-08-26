import { Hero } from "@/components/home/Hero";
import { InstagramTeaser } from "@/components/home/InstagramTeaser";
import { MatchdayBlock } from "@/components/home/MatchdayBlock";
import { MembershipCta } from "@/components/home/MembershipCta";
import { NewsGrid } from "@/components/home/NewsGrid";
import { SommerfestSection } from "@/components/home/SommerfestSection";
import { SponsorMarquee } from "@/components/home/SponsorMarquee";
import { SportsGrid } from "@/components/home/SportsGrid";
import { StatStrip } from "@/components/home/StatStrip";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import type { GalleryShot } from "@/lib/home-images";
import { cachedQuery, globalTag } from "@/lib/cms";
import { getPayloadClient } from "@/lib/payload";
import { usableMediaSrc } from "@/lib/publicUploads";
import type { Media } from "@/payload-types";

// NextMatch, UpcomingEvents and MatchdayBlock all filter on "later than now".
// Expiring their data entries is not enough to refresh an already prerendered
// page, so the route needs the same bound. Next only accepts a literal in a
// segment config export, so this cannot reference the shared constant;
// tests/lib/cms-tags.test.ts asserts the two stay equal.
export const revalidate = 900;

export default async function HomePage() {
  const home = await cachedQuery(
    ["global", "home-page"],
    [globalTag("home-page")],
    async () => {
      const payload = await getPayloadClient();
      // depth 1, damit die verknuepften Bilder mitkommen und nicht nur ihre IDs.
      return payload.findGlobal({ slug: "home-page", depth: 1 });
    },
  );

  const sections = home.sections ?? {};

  // Aus dem CMS gepflegte Bilder. Was hier leer bleibt, faellt in der jeweiligen
  // Komponente auf das mitgelieferte Bild zurueck.
  const heroSlides = (home.bilder?.heroImages ?? [])
    .map((row) => usableMediaSrc(row.image as Media | number | null))
    .filter((src): src is string => Boolean(src));

  const galleryTiles: GalleryShot[] = (home.bilder?.galerie ?? [])
    .map((row): GalleryShot | null => {
      const image = row.image as Media | number | null;
      const src = usableMediaSrc(image);
      if (!src || typeof image !== "object" || !image) return null;
      return {
        src,
        caption: row.caption ?? "",
        sub: row.sub ?? "",
        w: image.width ?? 1600,
        h: image.height ?? 1200,
      };
    })
    .filter((tile): tile is GalleryShot => tile !== null);

  return (
    <>
      <Hero hero={home.hero} slides={heroSlides} />
      <StatStrip />
      <SommerfestSection />
      {sections.showNextMatch !== false ? <MatchdayBlock /> : null}
      {sections.showNews !== false ? <NewsGrid /> : null}
      {sections.showInstagram !== false ? (
        <InstagramTeaser tiles={galleryTiles} />
      ) : null}
      {sections.showSports !== false ? <SportsGrid /> : null}
      {sections.showEvents !== false ? <UpcomingEvents /> : null}
      {sections.showSponsors !== false ? <SponsorMarquee /> : null}
      {sections.showMembershipCta !== false ? <MembershipCta /> : null}
    </>
  );
}
