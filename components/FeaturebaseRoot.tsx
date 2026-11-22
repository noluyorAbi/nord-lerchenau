"use client";

import { FeaturebaseProvider } from "featurebase-js/react";
import type { ReactNode } from "react";

export function FeaturebaseRoot({ children }: { children: ReactNode }) {
  return (
    <FeaturebaseProvider appId="6b0359a9d04ad94ae90c2310">
      {children}
    </FeaturebaseProvider>
  );
}
