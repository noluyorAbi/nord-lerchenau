import { FupaBlock } from "@/components/home/FupaBlock";
import { Heritage } from "@/components/home/Heritage";
import { Hero } from "@/components/home/Hero";
import { InstagramTeaser } from "@/components/home/InstagramTeaser";
import { JugendHighlights } from "@/components/home/JugendHighlights";
import { LocationMap } from "@/components/home/LocationMap";
import { MatchdayBlock } from "@/components/home/MatchdayBlock";
import { MembershipCta } from "@/components/home/MembershipCta";
import { NewsGrid } from "@/components/home/NewsGrid";
import { SponsorMarquee } from "@/components/home/SponsorMarquee";
import { SportsGrid } from "@/components/home/SportsGrid";
import { StatStrip } from "@/components/home/StatStrip";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { VereinsheimTeaser } from "@/components/home/VereinsheimTeaser";
import { getPayloadClient } from "@/lib/payload";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const payload = await getPayloadClient();
  const home = await payload.findGlobal({ slug: "home-page" });

  const sections = home.sections ?? {};

  return (
    <>
      <Hero hero={home.hero} />
      <StatStrip />
      {sections.showNextMatch !== false ? <MatchdayBlock /> : null}
      <JugendHighlights />
      {sections.showFupa !== false ? <FupaBlock /> : null}
      {sections.showNews !== false ? <NewsGrid /> : null}
      {sections.showInstagram !== false ? <InstagramTeaser /> : null}
      {sections.showSports !== false ? <SportsGrid /> : null}
      {sections.showEvents !== false ? <UpcomingEvents /> : null}
      <Heritage />
      {sections.showVereinsheim !== false ? <VereinsheimTeaser /> : null}
      {sections.showLocation !== false ? <LocationMap /> : null}
      {sections.showSponsors !== false ? <SponsorMarquee /> : null}
      {sections.showMembershipCta !== false ? <MembershipCta /> : null}
    </>
  );
}
