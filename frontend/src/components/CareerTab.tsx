'use client';

import { useState, FormEvent, useEffect } from 'react';
import { api } from '@/lib/api';
import { Briefcase, History, Sparkles, FileText, User, Mail, Phone, X } from 'lucide-react';

interface CareerConsultation {
  _id?: string;
  user_id: string;
  resume_data?: {
    name?: string;
    email?: string;
    phone?: string;
    resume_text?: string;
  };
  consultation_result: string;
  created_at: string;
}

export default function CareerTab() {
  const [activeView, setActiveView] = useState<'new' | 'history'>('new');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    resume_text: '',
  });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<CareerConsultation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<CareerConsultation | null>(null);

  useEffect(() => {
    if (activeView === 'history') {
      loadHistory();
    }
  }, [activeView]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await api.getCareerHistory();
      setHistory(data.consultations || []);
    } catch (err) {
      console.error('히스토리 로드 오류:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

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
      if (activeView === 'history') {
        loadHistory();
      }
    } catch (err: any) {
      setError(err.message || '커리어 컨설팅 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
          <Briefcase className="text-warm-teal-500" size={32} />
          <span>AI 커리어 컨설팅</span>
        </h3>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveView('new')}
            className={`px-4 py-2 text-sm font-bold transition-all duration-300 rounded-lg flex items-center gap-2 ${activeView === 'new'
                ? 'bg-white text-warm-teal-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <Sparkles size={16} />
            새 컨설팅
          </button>
          <button
            type="button"
            onClick={() => setActiveView('history')}
            className={`px-4 py-2 text-sm font-bold transition-all duration-300 rounded-lg flex items-center gap-2 ${activeView === 'history'
                ? 'bg-white text-warm-teal-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            <History size={16} />
            히스토리
          </button>
        </div>
      </div>

      {activeView === 'new' && (
        <>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="label-friendly flex items-center gap-2">
                  <User size={20} className="text-slate-400" />
                  이름
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-friendly"
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label className="label-friendly flex items-center gap-2">
                  <Mail size={20} className="text-slate-400" />
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="input-friendly"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label className="label-friendly flex items-center gap-2">
                <Phone size={20} className="text-slate-400" />
                전화번호
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="input-friendly"
                placeholder="010-1234-5678"
              />
            </div>

            <div>
              <label className="label-friendly flex items-center gap-2">
                <FileText size={20} className="text-slate-400" />
                이력서 내용 (자연어로 자유롭게 작성해주세요)
              </label>
              <textarea
                value={formData.resume_text}
                onChange={(e) => setFormData({ ...formData, resume_text: e.target.value })}
                required
                rows={10}
                className="input-friendly resize-none leading-relaxed"
                placeholder="예시: 저는 30년간 영업직에서 근무했습니다. 고객 관리와 소통에 자신감이 있으며..."
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  분석 중...
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  AI 커리어 컨설팅 받기
                </>
              )}
            </button>
          </form>

          {result && (
            <div className="mt-8 p-8 bg-gradient-to-br from-warm-teal-50 to-white border border-warm-teal-100 rounded-2xl shadow-lg animate-fade-in">
              <h4 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <Sparkles className="text-warm-teal-500" size={32} />
                <span>AI 커리어 컨설팅 결과</span>
              </h4>
              <div className="bg-white/80 rounded-xl p-8 border border-warm-teal-100/50 backdrop-blur-sm shadow-sm">
                <div className="prose max-w-none text-slate-800 whitespace-pre-wrap text-lg leading-relaxed">
                  {result}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeView === 'history' && (
        <div className="space-y-6">
          {loadingHistory ? (
            <div className="text-center py-12 text-slate-500 text-xl">로딩 중...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xl bg-slate-50 rounded-2xl border border-slate-200">
              아직 커리어 컨설팅 기록이 없습니다.
            </div>
          ) : (
            <div className="grid gap-4">
              {history.map((consultation, index) => (
                <div
                  key={consultation._id || index}
                  className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-warm-teal-300 group"
                  onClick={() => setSelectedConsultation(consultation)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-warm-teal-600 transition-colors">
                        {consultation.resume_data?.name || '이름 없음'}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {formatDate(consultation.created_at)}
                      </p>
                    </div>
                    <FileText className="text-slate-300 group-hover:text-warm-teal-400 transition-colors" size={24} />
                  </div>
                  {consultation.resume_data?.resume_text && (
                    <p className="text-slate-600 text-base line-clamp-2 mt-2">
                      {consultation.resume_data.resume_text.substring(0, 100)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedConsultation && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <Sparkles className="text-warm-teal-500" size={32} />
                <span>커리어 컨설팅 결과</span>
              </h3>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={28} />
              </button>
            </div>

            <div className="space-y-6 mb-8">
              {selectedConsultation.resume_data && (
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <User size={20} /> 이력서 정보
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-700">
                    {selectedConsultation.resume_data.name && (
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-500">이름</span>
                        <span className="font-medium">{selectedConsultation.resume_data.name}</span>
                      </div>
                    )}
                    {selectedConsultation.resume_data.email && (
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-500">이메일</span>
                        <span className="font-medium">{selectedConsultation.resume_data.email}</span>
                      </div>
                    )}
                    {selectedConsultation.resume_data.phone && (
                      <div className="flex flex-col">
                        <span className="text-sm text-slate-500">전화번호</span>
                        <span className="font-medium">{selectedConsultation.resume_data.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <p className="text-sm text-slate-500 text-right">
                작성일: {formatDate(selectedConsultation.created_at)}
              </p>
            </div>

            <div className="bg-warm-teal-50/50 border border-warm-teal-100 rounded-xl p-8">
              <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Briefcase size={24} className="text-warm-teal-600" />
                컨설팅 결과
              </h4>
              <div className="prose max-w-none text-slate-800 whitespace-pre-wrap text-lg leading-relaxed">
                {selectedConsultation.consultation_result}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setSelectedConsultation(null)}
                className="px-8 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-lg"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
