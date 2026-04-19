import { Heritage } from "@/components/home/Heritage";
import { Hero } from "@/components/home/Hero";
import { MembershipCta } from "@/components/home/MembershipCta";
import { NewsGrid } from "@/components/home/NewsGrid";
import { NextMatch } from "@/components/home/NextMatch";
import { SponsorMarquee } from "@/components/home/SponsorMarquee";
import { SportsGrid } from "@/components/home/SportsGrid";
import { StatStrip } from "@/components/home/StatStrip";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { VereinsheimTeaser } from "@/components/home/VereinsheimTeaser";
import { getPayloadClient } from "@/lib/payload";

export default async function HomePage() {
  const payload = await getPayloadClient();
  const home = await payload.findGlobal({ slug: "home-page" });

  const sections = home.sections ?? {};

  return (
    <>
      <Hero hero={home.hero} />
      <StatStrip stats={home.stats} />
      {sections.showNextMatch !== false ? <NextMatch /> : null}
      {sections.showNews !== false ? <NewsGrid /> : null}
      {sections.showSports !== false ? <SportsGrid /> : null}
      {sections.showEvents !== false ? <UpcomingEvents /> : null}
      <Heritage />
      {sections.showVereinsheim !== false ? <VereinsheimTeaser /> : null}
      {sections.showSponsors !== false ? <SponsorMarquee /> : null}
      {sections.showMembershipCta !== false ? <MembershipCta /> : null}
    </>
  );
}
