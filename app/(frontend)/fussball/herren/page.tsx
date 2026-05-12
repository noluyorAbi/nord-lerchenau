import { CategoryPage } from "@/components/fussball/CategoryPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Herren · Fußball",
  alternates: { canonical: "/fussball/herren" },
};

export default function HerrenPage() {
  return <CategoryPage slug="herren" />;
}
