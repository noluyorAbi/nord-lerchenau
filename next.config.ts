import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: hides the Next.js dev-tools bubble. Set when screen-recording the
  // admin (video/storyboard.json), otherwise the button sits in every frame.
  ...(process.env.NEXT_HIDE_DEV_INDICATOR === "1"
    ? { devIndicators: false }
    : {}),
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
      //
      // Pinned to THIS project's store, not `*.public.blob.vercel-storage.com`:
      // /_next/image proxies any URL matching a pattern, so a wildcard would let
      // anyone with a free blob store serve their own images off svnord.de and
      // bill the optimizer to the club. Update the subdomain if the store is
      // ever recreated (it is the id inside BLOB_READ_WRITE_TOKEN).
      {
        protocol: "https",
        hostname: "wifujncy146uydef.public.blob.vercel-storage.com",
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
