import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased min-h-screen bg-creamy-white text-slate-800">
        {children}
      </body>
    </html>
  );
}
