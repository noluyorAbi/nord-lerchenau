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
import { cachedQuery, globalTag } from "@/lib/cms";
import { getPayloadClient } from "@/lib/payload";

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
      return payload.findGlobal({ slug: "home-page" });
    },
  );

  const sections = home.sections ?? {};

  return (
    <>
      <Hero hero={home.hero} />
      <StatStrip />
      <SommerfestSection />
      {sections.showNextMatch !== false ? <MatchdayBlock /> : null}
      {sections.showNews !== false ? <NewsGrid /> : null}
      {sections.showInstagram !== false ? <InstagramTeaser /> : null}
      {sections.showSports !== false ? <SportsGrid /> : null}
      {sections.showEvents !== false ? <UpcomingEvents /> : null}
      {sections.showSponsors !== false ? <SponsorMarquee /> : null}
      {sections.showMembershipCta !== false ? <MembershipCta /> : null}
    </>
  );
}
