import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
      // Media uploaded through /admin lives in Vercel Blob, so mediaSrc can
      // return an absolute blob URL. Today every consumer renders it via a
      // plain <img> or a CSS background, but registering the host here means a
      // later switch to next/image does not fail the render at runtime.
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  // lib/publicUploads resolves media to committed /public/uploads assets by
  // reading that directory at runtime (fs.readdirSync). Dynamic routes run in
  // serverless functions where public/ is NOT traced in by default, so the read
  // would come back empty in production. Force these assets into every function
  // bundle so image resolution works once external blob storage is removed.
  outputFileTracingIncludes: {
    "/**": ["./public/uploads/**"],
  },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
