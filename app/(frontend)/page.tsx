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
import { getPayloadClient } from "@/lib/payload";
import { mediaSrc } from "@/lib/publicUploads";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const payload = await getPayloadClient();
  const home = await payload.findGlobal({ slug: "home-page" });

  const sections = home.sections ?? {};
  const heroSlides = (home.heroSlides ?? [])
    .map((s) => mediaSrc(s.image))
    .filter((s): s is string => Boolean(s));

  return (
    <>
      <Hero hero={home.hero} slides={heroSlides} />
      <StatStrip stats={home.stats} />
      <SommerfestSection />
      {sections.showNextMatch !== false ? <MatchdayBlock /> : null}
      {sections.showNews !== false ? <NewsGrid /> : null}
      {sections.showInstagram !== false ? <InstagramTeaser /> : null}
      {sections.showSports !== false ? (
        <SportsGrid data={home.sportsSection} />
      ) : null}
      {sections.showEvents !== false ? <UpcomingEvents /> : null}
      {sections.showSponsors !== false ? <SponsorMarquee /> : null}
      {sections.showMembershipCta !== false ? <MembershipCta /> : null}
    </>
  );
}
