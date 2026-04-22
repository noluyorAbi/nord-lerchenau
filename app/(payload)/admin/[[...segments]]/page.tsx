import type { Metadata } from "next";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";

import config from "@/payload.config";
import { importMap } from "@/app/(payload)/admin/importMap.js";

type Props = {
  params: Promise<{ segments: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

export const generateMetadata = ({
  params,
  searchParams,
}: Props): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams });

export default function Page({ params, searchParams }: Props) {
  return (
    <RootPage
      config={config}
      importMap={importMap}
      params={params}
      searchParams={searchParams}
    />
  );
}
