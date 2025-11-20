import type { NextConfig } from "next";

// ngrok URL을 환경 변수에서 가져오기 (매 세션마다 변경 가능)
const getNgrokUrl = () => {
  const ngrokUrl = process.env.NEXT_PUBLIC_NGROK_URL;
  if (ngrokUrl) {
    // http:// 또는 https://가 없으면 추가
    return ngrokUrl.startsWith('http') ? ngrokUrl : `https://${ngrokUrl}`;
  }
  return null;
};

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    // 백엔드 API 프록시 설정
    // 브라우저는 /api/* 로 요청하고, Next.js 서버가 백엔드로 프록시
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  // 개발 환경: ngrok URL을 환경 변수로 동적으로 허용
  // 프로덕션에서는 특정 도메인만 허용하도록 변경 필요
  allowedDevOrigins: (() => {
    if (process.env.NODE_ENV !== 'development') {
      return ['210.100.148.132'];
    }
    
    // 개발 환경: 기본 오리진 + ngrok URL (환경 변수에서)
    const origins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://210.100.148.132:3000',
      'https://210.100.148.132',
    ];
    
    const ngrokUrl = getNgrokUrl();
    if (ngrokUrl) {
      origins.push(ngrokUrl);
    }
    
    return origins;
  })(),
};

export default nextConfig;
