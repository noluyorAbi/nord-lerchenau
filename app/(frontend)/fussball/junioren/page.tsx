import { CategoryPage } from "@/components/fussball/CategoryPage";
import { U8Showcase } from "@/components/fussball/U8Showcase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Junioren · Fußball",
  alternates: { canonical: "/fussball/junioren" },
};

export default function JuniorenPage() {
  return (
    <CategoryPage
      slug="junioren"
      belowIntro={<U8Showcase />}
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
