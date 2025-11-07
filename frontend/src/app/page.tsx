'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 토큰이 있으면 대시보드로 리다이렉트
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        router.push('/dashboard');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-6">
      <div className="container-responsive">
        <div className="card-responsive text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 flex items-center justify-center gap-4">
            <span className="text-5xl sm:text-6xl">💜</span>
            <span>RetireWeb</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-10 font-semibold">
            AI 챗봇과 커리어 컨설팅을 통한 멘탈케어 서비스
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            <div className="p-8 bg-teal-50 rounded-xl border-2 border-teal-200 shadow-md">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI 챗봇</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                우울 수치를 분석하고 멘탈케어를 제공하는 AI 챗봇
              </p>
            </div>
            <div className="p-8 bg-teal-50 rounded-xl border-2 border-teal-200 shadow-md">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">커리어 컨설팅</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                이력서 분석 및 커리어 발전 방향 제안
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/login"
              className="px-10 py-5 bg-teal-600 text-white text-xl rounded-xl hover:bg-teal-700 transition-colors font-bold shadow-lg min-h-[64px] flex items-center justify-center"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="px-10 py-5 bg-white text-teal-700 border-2 border-teal-600 text-xl rounded-xl hover:bg-teal-50 transition-colors font-bold shadow-lg min-h-[64px] flex items-center justify-center"
            >
              회원가입
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
