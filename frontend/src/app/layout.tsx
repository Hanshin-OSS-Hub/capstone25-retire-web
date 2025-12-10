import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import DisableHMR from "@/components/DisableHMR";

export const metadata: Metadata = {
  title: "RetireWeb - 멘탈케어 웹 애플리케이션",
  description: "AI 챗봇과 커리어 컨설팅을 통한 멘탈케어 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <Script
          id="disable-hmr"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (window.location.hostname.includes('ngrok') || window.location.hostname.includes('ngrok-free')) {
                  console.log('[HMR] ngrok detected, blocking HMR requests');
                  const originalFetch = window.fetch;
                  window.fetch = function(...args) {
                    const url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || args[0].toString();
                    if (url.includes('webpack-hmr') || url.includes('_next/webpack-hmr') || url.includes('/hmr')) {
                      console.log('[HMR] Blocked fetch:', url);
                      return Promise.reject(new Error('HMR disabled'));
                    }
                    return originalFetch.apply(this, args);
                  };
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-creamy-white text-slate-800">
        <DisableHMR />
        {children}
      </body>
    </html>
  );
}
