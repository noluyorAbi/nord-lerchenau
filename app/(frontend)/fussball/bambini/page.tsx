import { CategoryPage } from "@/components/fussball/CategoryPage";

export const metadata = {
  title: "Bambinis & Fußballkindergarten · Fußball",
  alternates: { canonical: "/fussball/bambini" },
};

export default function BambiniPage() {
  return <CategoryPage slug="bambini" />;
}
