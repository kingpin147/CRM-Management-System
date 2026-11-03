import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/invoice/:id/pdf",
        destination: "/api/invoice/:id",
      },
      {
        source: "/api/customers/:id/crf",
        destination: "/api/signup/:id",
      },
    ];
  },
};

export default nextConfig;
