import { CategoryPage } from "@/components/fussball/CategoryPage";
import { U8Showcase } from "@/components/fussball/U8Showcase";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Junioren · Fußball",
  alternates: { canonical: "/fussball/junioren" },
};

export default function JuniorenPage() {
  return <CategoryPage slug="junioren" belowIntro={<U8Showcase />} />;
}
