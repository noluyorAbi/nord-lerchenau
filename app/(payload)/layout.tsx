import type { ReactNode } from "react";
import { RootLayout } from "@payloadcms/next/layouts";
import { handleServerFunctions } from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";

import config from "@/payload.config";
import { importMap } from "@/app/(payload)/admin/importMap.js";

import "@payloadcms/next/css";

type Props = { children: ReactNode };

export const metadata = {
  title: "SV Nord Admin",
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

export default function PayloadLayout({ children }: Props) {
  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  );
}
