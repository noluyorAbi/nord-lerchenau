import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.wixstatic.com",
      },
      // Vercel Blob public URLs, so CMS-uploaded media can be used with
      // next/image. Media currently renders via plain <img>, but this keeps the
      // door open without another config change.
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
