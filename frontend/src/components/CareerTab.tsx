'use client';

import { useState, FormEvent } from 'react';
import { api } from '@/lib/api';

export default function CareerTab() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume_text: '',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.createCareerConsultation({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        resume_text: formData.resume_text,
      });
      setResult(response.consultation_result);
    } catch (err: any) {
      setError(err.message || '커리어 컨설팅 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
        <span className="text-3xl">💼</span>
        <span>가상 이력서 작성</span>
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">
              이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-teal-500 focus:border-teal-600 outline-none text-gray-900 bg-white placeholder:text-gray-500"
            />
          </div>

          <div>
            <label className="block text-lg font-bold text-gray-900 mb-3">
              이메일
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-teal-500 focus:border-teal-600 outline-none text-gray-900 bg-white placeholder:text-gray-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-bold text-gray-900 mb-3">
            전화번호
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-600 outline-none text-gray-900 bg-white placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="block text-lg font-bold text-gray-900 mb-3">
            이력서 내용 (자연어로 자유롭게 작성해주세요)
          </label>
          <textarea
            value={formData.resume_text}
            onChange={(e) => setFormData({ ...formData, resume_text: e.target.value })}
            required
            rows={12}
            className="w-full px-6 py-4 text-lg border-2 border-gray-400 rounded-xl focus:ring-4 focus:ring-purple-500 focus:border-purple-600 outline-none resize-none text-gray-900 bg-white placeholder:text-gray-500 leading-relaxed"
            placeholder="예시: 저는 컴퓨터공학을 전공한 개발자입니다. 3년간 웹 개발 경험이 있으며..."
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
          className="w-full sm:w-auto px-8 py-5 bg-teal-600 text-white text-xl rounded-xl hover:bg-teal-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg min-h-[64px]"
        >
          {loading ? '처리 중...' : '✨ AI 커리어 컨설팅 받기'}
        </button>
      </form>

      {result && (
        <div className="mt-8 p-6 sm:p-8 bg-teal-50 border-2 border-teal-300 rounded-xl shadow-md">
          <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-3xl">💡</span>
            <span>AI 커리어 컨설팅 결과</span>
          </h4>
          <div className="prose max-w-none text-gray-900 whitespace-pre-wrap text-lg leading-relaxed">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

