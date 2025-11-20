'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      await api.signup(formData.username, formData.email, formData.password);
      router.push('/login');
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="container-responsive">
        <div className="card-responsive max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8 text-center tracking-tight">
            회원가입
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-lg font-semibold text-gray-900 mb-3 tracking-tight">
                사용자명
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                minLength={3}
                maxLength={20}
                className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-teal-500 focus:border-teal-600 outline-none transition text-gray-900 bg-white placeholder:text-gray-500"
                placeholder="사용자명을 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-lg font-semibold text-gray-900 mb-3 tracking-tight">
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-teal-500 focus:border-teal-600 outline-none transition text-gray-900 bg-white placeholder:text-gray-500"
                placeholder="이메일을 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-lg font-semibold text-gray-900 mb-3 tracking-tight">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-teal-500 focus:border-teal-600 outline-none transition text-gray-900 bg-white placeholder:text-gray-500"
                placeholder="비밀번호를 입력하세요"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-lg font-semibold text-gray-900 mb-3 tracking-tight">
                비밀번호 확인
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-teal-500 focus:border-teal-600 outline-none transition text-gray-900 bg-white placeholder:text-gray-500"
                placeholder="비밀번호를 다시 입력하세요"
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
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          <p className="mt-8 text-center text-lg text-gray-700">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-teal-700 hover:text-teal-800 font-bold underline text-xl">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

