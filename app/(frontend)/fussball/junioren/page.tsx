import { CategoryPage } from "@/components/fussball/CategoryPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Junioren · Fußball",
  alternates: { canonical: "/fussball/junioren" },
};

export default function JuniorenPage() {
  return <CategoryPage slug="junioren" />;
}
