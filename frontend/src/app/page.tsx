'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, Briefcase, ChevronRight, Heart, Sparkles } from 'lucide-react';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // router 의존성 제거 - 마운트 시 한 번만 실행 (ngrok 환경 대응)

  return (
    <div className="min-h-screen relative overflow-hidden bg-creamy-white">
      {/* 배경 장식 요소 (Blobs) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-warm-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-soft-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-warm-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container-responsive relative z-10 flex flex-col items-center justify-center min-h-screen py-12">

        {/* 히어로 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <div className="inline-flex items-center justify-center p-2 bg-white rounded-full shadow-sm mb-6 border border-warm-teal-100">
            <span className="px-3 py-1 bg-warm-teal-100 text-warm-teal-800 rounded-full text-sm font-bold mr-2">New</span>
            <span className="text-slate-600 text-sm font-medium pr-2">AI 기반 시니어 멘탈케어 서비스</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-8 leading-tight tracking-tight">
            당신의 <span className="gradient-text">두 번째 청춘</span>을<br />
            <span className="relative inline-block">
              응원합니다
              <svg className="absolute bottom-2 left-0 w-full h-3 text-soft-orange-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-600 mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            RetireWeb은 AI 기술로 여러분의 마음을 돌보고<br className="hidden sm:block" />
            새로운 커리어의 기회를 열어드립니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/login" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                시작하기 <ChevronRight size={24} />
              </motion.button>
            </Link>
            <Link href="/signup" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full btn-secondary"
              >
                회원가입
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* 기능 카드 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-card p-8 sm:p-10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <MessageCircle size={120} className="text-warm-teal-500" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-warm-teal-100 rounded-2xl flex items-center justify-center mb-6 text-warm-teal-600 shadow-sm">
                <Heart size={32} fill="currentColor" />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-4">AI 마음 돌봄</h3>
              <p className="text-xl text-slate-600 leading-relaxed mb-6">
                언제든 편하게 이야기를 들어주는 AI 친구와 대화하세요.
                우울감을 분석하고 따뜻한 위로를 전해드립니다.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="glass-card p-8 sm:p-10 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
              <Briefcase size={120} className="text-soft-orange-500" />
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-soft-orange-100 rounded-2xl flex items-center justify-center mb-6 text-soft-orange-600 shadow-sm">
                <Sparkles size={32} />
              </div>
              <h3 className="text-3xl font-bold text-slate-800 mb-4">커리어 재설계</h3>
              <p className="text-xl text-slate-600 leading-relaxed mb-6">
                여러분의 소중한 경험을 분석하여 새로운 기회를 찾아드립니다.
                이력서 분석부터 맞춤형 직무 추천까지 받아보세요.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
