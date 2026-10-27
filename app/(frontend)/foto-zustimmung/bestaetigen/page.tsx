import type { Metadata } from "next";

import { PhotoConsentTokenPage } from "@/components/PhotoConsentTokenPage";

export const metadata: Metadata = {
  title: "Zustimmung bestätigen",
  robots: { index: false, follow: false },
  // Der Token steht in der URL und darf nicht per Referer abfliessen.
  referrer: "no-referrer",
};

type Props = { searchParams: Promise<{ token?: string }> };

export default async function FotoZustimmungBestaetigenPage({
  searchParams,
}: Props) {
  const { token } = await searchParams;
  return <PhotoConsentTokenPage action="bestaetigen" token={token} />;
}
