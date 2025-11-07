import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/:path*`,
      },
    ];
  },
  // 개발 환경에서 Cross origin 요청 허용
  allowedDevOrigins: ['210.100.148.132'],
};

export default nextConfig;
