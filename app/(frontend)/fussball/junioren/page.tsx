import { CategoryPage } from "@/components/fussball/CategoryPage";
import { U8Showcase } from "@/components/fussball/U8Showcase";
import { cachedQuery, globalTag } from "@/lib/cms";
import { getPayloadClient } from "@/lib/payload";
import { usableMediaSrc } from "@/lib/publicUploads";
import type { Media } from "@/payload-types";

export const metadata = {
  title: "Junioren · Fußball",
  alternates: { canonical: "/fussball/junioren" },
};

export default async function JuniorenPage() {
  const siteImages = await cachedQuery(
    ["global", "site-images"],
    [globalTag("site-images")],
    async () => {
      const payload = await getPayloadClient();
      return payload.findGlobal({ slug: "site-images", depth: 1 });
    },
  );

  const u8 = {
    trainerteam: usableMediaSrc(
      siteImages.u8?.trainerteam as Media | number | null,
    ),
    loewen: usableMediaSrc(siteImages.u8?.loewen as Media | number | null),
    tiger: usableMediaSrc(siteImages.u8?.tiger as Media | number | null),
  };

  return (
    <CategoryPage
      slug="junioren"
      belowIntro={<U8Showcase images={u8} />}
      leadership={[
        { role: "Sportlicher Leiter", names: ["Felix Kirmeyer"] },
        { role: "Fußball-Jugend", names: ["Ergin Piker"] },
        {
          role: "Großfeld",
          names: ["Dominik Besel", "Thomas Tiesler", "Zeljko Jeremic"],
        },
        { role: "Kompaktfeld", names: ["Steffen Helmreich", "Tom Wurm"] },
        { role: "Kleinfeld", names: ["Thomas Wimmer", "Stephan Krusche"] },
        { role: "Mädl's", names: ["Ergin Piker", "Abraham Mike Yousaf"] },
      ]}
    />
  );
}
