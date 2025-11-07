'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(email, password);
      setToken(result.access_token);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="container-responsive">
        <div className="card-responsive max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center">
            로그인
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-lg font-bold text-gray-900 mb-3">
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-teal-500 focus:border-teal-600 outline-none transition text-gray-900 bg-white placeholder:text-gray-500"
                placeholder="이메일을 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-lg font-bold text-gray-900 mb-3">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-teal-500 focus:border-teal-600 outline-none transition text-gray-900 bg-white placeholder:text-gray-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {error && (
              <div className="p-5 bg-red-100 border-2 border-red-400 text-red-900 rounded-xl text-lg font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-teal-600 text-white text-xl rounded-xl hover:bg-teal-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? '처리 중...' : '로그인'}
            </button>
          </form>

          <p className="mt-8 text-center text-lg text-gray-700">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-teal-700 hover:text-teal-800 font-bold underline text-xl">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

