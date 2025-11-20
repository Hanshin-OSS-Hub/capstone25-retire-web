'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { ClipboardList, CheckCircle, AlertCircle, Info } from 'lucide-react';

const questions = [
  '기분이 가라앉거나, 우울하거나, 희망이 없다고 느꼈다.',
  '평소 하던 일에 대한 흥미가 없어지거나 즐거움을 느끼지 못했다.',
  '잠들기가 어렵거나 자꾸 깼다/혹은 너무 많이 잤다.',
  '평소보다 식욕이 줄었다/혹은 평소보다 많이 먹었다.',
  '다른 사람들이 눈치 챌 정도로 평소보다 말과 행동이 느려졌다 / 혹은 너무 안절부절 못해서 가만히 앉아있을 수 없었다.',
  '피곤하고 기운이 없었다.',
  '내가 잘 못했거나, 실패했다는 생각이 들었다 / 혹은 자신과 가족을 실망시켰다고 생각했다.',
  '신문을 읽거나 TV를 보는 것과 같은 일상적인 일에도 집중할 수가 없었다.',
  '차라리 죽는 것이 더 낫겠다고 생각했다 / 혹은 자해할 생각을 했다.',
];

const options = [
  { value: 0, label: '전혀 아니다 (0점)' },
  { value: 1, label: '여러 날 동안 (1점)' },
  { value: 2, label: '일주일 이상 (2점)' },
  { value: 3, label: '거의 매일 (3점)' },
];

const severityInfo = [
  {
    max: 4,
    label: '우울 아님',
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    description: '유의한 수준의 우울이 시사되진 않습니다.'
  },
  {
    max: 9,
    label: '가벼운 우울',
    color: 'text-lime-600',
    bg: 'bg-lime-50',
    border: 'border-lime-200',
    description: '다소 경미한 수준의 우울감이 있으나 일상생활에 지장을 줄 정도는 아닙니다.\n\n다만, 이러한 기분 상태가 지속될 경우 개인의 신체적, 심리적 대처자원을 저하시킬 수 있습니다.\n\n그러한 경우, 가까운 지역센터나 전문기관을 방문하시기 바랍니다.'
  },
  {
    max: 19,
    label: '중간정도의 우울',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    description: '중간정도 수준의 우울감이 시사됩니다.\n\n이러한 수준의 우울감은 흔히 신체적, 심리적 대처자원을 저하시키며 개인의 일상생활을 어렵게 만들기도 합니다.\n\n가까운 지역센터나 전문기관을 방문하여 보다 상세한 평가와 도움을 받아보시기 바랍니다.'
  },
  {
    max: 27,
    label: '심한 우울',
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    description: '심한 수준의 우울감이 시사됩니다.\n\n전문기관의 치료적 개입과 평가가 요구됩니다.'
  },
];

const getSeverity = (score: number) => severityInfo.find((info) => score <= info.max) ?? severityInfo[severityInfo.length - 1];

interface PhqResult {
  scores: number[];
  total_score: number;
  severity: string;
  severity_description?: string;
  created_at: string;
}

interface PhqTabProps {
  onResultSaved?: () => void;
}

export default function PhqTab({ onResultSaved }: PhqTabProps) {
  const [scores, setScores] = useState<(number | null)[]>(Array(9).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [latestResult, setLatestResult] = useState<PhqResult | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLatest();
  }, []);

  const fetchLatest = async () => {
    try {
      const data = await api.getPhqLatest();
      setLatestResult(data.result);
    } catch (err) {
      console.error('PHQ-9 결과 로드 오류:', err);
    }
  };

  const handleScoreChange = (index: number, value: number) => {
    setScores((prev) => prev.map((score, i) => (i === index ? value : score)));
  };

  const allAnswered = useMemo(() => scores.every((score) => score !== null), [scores]);
  const totalScore = useMemo(
    () => scores.reduce((sum, score) => sum + (score ?? 0), 0),
    [scores]
  );
  const severity = getSeverity(totalScore);

  const handleSubmit = async () => {
    if (!allAnswered) {
      setError('모든 문항에 응답해 주세요.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    setError('');
    try {
      const response = await api.submitPhq9(scores as number[]);
      setLatestResult(response);
      setMessage('설문 결과가 저장되었습니다.');
      onResultSaved?.();
    } catch (err: any) {
      setError(err.message || '설문 결과 저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '';
    let date = new Date(value);
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
    <div className="space-y-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-lg animate-fade-in">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6">
          <ClipboardList className="text-warm-teal-500" size={32} />
          <span>PHQ-9 우울 자가검사</span>
        </h3>
        <div className="bg-slate-50 p-4 rounded-xl text-slate-600 mb-8 flex items-start gap-3">
          <Info className="text-warm-teal-500 shrink-0 mt-1" size={20} />
          <p className="leading-relaxed">
            지난 2주 동안의 상태를 기준으로 각 문항을 선택해 주세요. 총점에 따라 우울 수준을 평가합니다.
            솔직하게 답변해주시면 더 정확한 결과를 얻을 수 있습니다.
          </p>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="border border-slate-200 rounded-xl p-6 hover:border-warm-teal-200 hover:shadow-md transition-all duration-300">
              <p className="font-bold text-slate-800 mb-4 text-lg leading-relaxed">
                <span className="text-warm-teal-500 mr-2">{index + 1}.</span>
                {question}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {options.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition-all duration-200 ${scores[index] === option.value
                        ? 'bg-warm-teal-50 border-warm-teal-500 text-warm-teal-900 shadow-sm'
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${scores[index] === option.value ? 'border-warm-teal-500' : 'border-slate-300'
                      }`}>
                      {scores[index] === option.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-warm-teal-500" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={option.value}
                      checked={scores[index] === option.value}
                      onChange={() => handleScoreChange(index, option.value)}
                      className="hidden"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-6">
          <div className={`p-6 rounded-2xl border-2 ${severity.bg} ${severity.border} ${severity.color} shadow-sm transition-all duration-500`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold opacity-80">예상 결과</span>
              <div className="text-2xl font-bold flex items-center gap-2">
                <span>{totalScore}점</span>
                <span className="text-slate-400 font-normal text-lg">/ 27점</span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-4">{severity.label}</div>
            {severity.description && (
              <div className="bg-white/60 rounded-xl p-4 text-slate-700 whitespace-pre-line leading-relaxed">
                {severity.description}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
              className="px-8 py-4 bg-gradient-to-r from-warm-teal-500 to-warm-teal-600 text-white text-lg font-bold rounded-xl hover:from-warm-teal-600 hover:to-warm-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  저장 중...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  결과 저장하기
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 font-medium animate-fade-in">
            <AlertCircle size={20} />
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 p-4 bg-warm-teal-50 text-warm-teal-700 rounded-xl flex items-center gap-2 font-medium animate-fade-in">
            <CheckCircle size={20} />
            {message}
          </div>
        )}
      </div>

      {latestResult && (
        <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 shadow-lg animate-fade-in">
          <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <CheckCircle className="text-warm-teal-500" size={24} />
            <span>최근 검사 결과</span>
          </h4>

          <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm mb-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold text-warm-teal-600">{latestResult.total_score}점</div>
              <div className="h-10 w-px bg-slate-200"></div>
              <div className="text-2xl font-bold text-slate-700">{latestResult.severity}</div>
            </div>

            {latestResult.severity_description && (
              <div className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg">
                {latestResult.severity_description}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-sm text-slate-500">
            <span>제출일: {formatDate(latestResult.created_at)}</span>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200 text-xs text-slate-400 leading-relaxed">
            <p className="font-semibold mb-1">출처: 우울증 건강설문-9 (PHQ-9)</p>
            <p>박승진, 최혜라, 최지혜, 김건우, 홍진표(2010), 한글판 우울증 선별도구(Patient Health Questionnaire-9, PHQ-9)의 신뢰도와 타당도, 대한불안의학회지 6, 119-24.</p>
          </div>
        </div>
      )}
    </div>
  );
}
