import { CategoryPage } from "@/components/fussball/CategoryPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Juniorinnen · Fußball",
  alternates: { canonical: "/fussball/juniorinnen" },
};

export default function JuniorinnenPage() {
  return <CategoryPage slug="juniorinnen" />;
}
