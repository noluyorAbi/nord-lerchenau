import { handleConsentAction } from "@/lib/photo-consent-actions";

export async function POST(request: Request) {
  return handleConsentAction(request, "widerrufen");
}
