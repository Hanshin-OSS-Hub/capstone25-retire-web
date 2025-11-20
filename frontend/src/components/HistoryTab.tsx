'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Activity, TrendingUp, MessageCircle, FileText, Calendar } from 'lucide-react';

interface HistoryStatus {
  current_score: number;
  average_score: number;
  recent_scores: number[];
  phq_latest?: {
    total_score: number;
    severity: string;
    created_at: string;
  } | null;
}

interface HistoryTabProps {
  status: HistoryStatus | null;
  username?: string;
}

interface ChatMessage {
  user_message?: string;
  bot_response?: string;
  depression_score?: number;
  timestamp: string;
}

export default function HistoryTab({ status, username }: HistoryTabProps) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getChatHistory();
      if (data.messages) {
        setChatHistory(data.messages);
      }
    } catch (error) {
      console.error('히스토리 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    let date = new Date(timestamp);
    if (isNaN(date.getTime())) return '시간 정보 없음';
    if (timestamp.endsWith('Z') || (!timestamp.includes('+') && !timestamp.includes('-', 10))) {
      date = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    }

    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500 text-xl">데이터를 불러오는 중...</div>;
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
        <Activity className="text-warm-teal-500" size={32} />
        <span>우울 수치 변화</span>
      </h3>

      {status && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="glass-card p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={80} className="text-warm-teal-500" />
              </div>
              <div className="relative z-10">
                <div className="text-lg font-bold text-slate-600 mb-2 flex items-center gap-2">
                  <Activity size={20} className="text-warm-teal-500" />
                  <span>현재 점수</span>
                </div>
                <div className="text-5xl font-bold text-warm-teal-600 drop-shadow-sm">
                  {status.current_score.toFixed(1)}
                </div>
              </div>
            </div>

            <div className="glass-card p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={80} className="text-soft-orange-500" />
              </div>
              <div className="relative z-10">
                <div className="text-lg font-bold text-slate-600 mb-2 flex items-center gap-2">
                  <TrendingUp size={20} className="text-soft-orange-500" />
                  <span>평균 점수</span>
                </div>
                <div className="text-5xl font-bold text-soft-orange-500 drop-shadow-sm">
                  {status.average_score.toFixed(1)}
                </div>
              </div>
            </div>

            <div className="glass-card p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MessageCircle size={80} className="text-blue-500" />
              </div>
              <div className="relative z-10">
                <div className="text-lg font-bold text-slate-600 mb-2 flex items-center gap-2">
                  <MessageCircle size={20} className="text-blue-500" />
                  <span>총 대화 수</span>
                </div>
                <div className="text-5xl font-bold text-blue-600 drop-shadow-sm">
                  {chatHistory.length}
                </div>
              </div>
            </div>
          </div>

          {status.phq_latest && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-8 shadow-lg animate-fade-in">
              <h4 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <FileText size={24} />
                <span>최근 PHQ-9 결과</span>
              </h4>
              <div className="bg-white/60 rounded-xl p-6 border border-purple-100 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-lg text-purple-800 mb-1">
                      총점 <span className="font-bold text-3xl text-purple-600 ml-2">{status.phq_latest.total_score}점</span>
                    </p>
                    <p className="text-base text-purple-700 font-medium">
                      우울 수준: <span className="font-bold text-lg">{status.phq_latest.severity}</span>
                    </p>
                  </div>
                  {status.phq_latest.created_at && (
                    <div className="text-sm text-purple-600 bg-purple-50 px-4 py-2 rounded-lg">
                      <span className="font-semibold block mb-1">제출일</span>
                      {new Date(status.phq_latest.created_at).toLocaleDateString('ko-KR')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {status.recent_scores && status.recent_scores.length > 0 && (
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-lg animate-fade-in">
              <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <TrendingUp size={24} className="text-warm-teal-500" />
                우울 수치 변화 추이
              </h4>
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={status.recent_scores.map((score, index) => ({
                      index: index + 1,
                      score: Number(score.toFixed(1)),
                      average: Number(status.average_score.toFixed(1)),
                      date: `대화 ${index + 1}`,
                    }))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      style={{ fontSize: '12px', fontWeight: 'bold' }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      stroke="#64748b"
                      style={{ fontSize: '12px', fontWeight: 'bold' }}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      width={40}
                      label={{
                        value: '우울 수치',
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold', fill: '#64748b' },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        padding: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#2dd4bf"
                      strokeWidth={3}
                      dot={{ fill: '#2dd4bf', r: 6, strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 8 }}
                      name="우울 수치"
                    />
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="#fb923c"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="평균"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 text-center text-slate-500 font-medium bg-slate-50 py-3 rounded-xl">
                최근 {status.recent_scores.length}개 대화의 우울 수치 변화를 보여줍니다.
              </div>
            </div>
          )}
        </>
      )}

      <div>
        <h4 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
          <MessageCircle className="text-warm-teal-500" size={32} />
          <span>최근 대화</span>
        </h4>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {chatHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xl bg-slate-50 rounded-2xl border border-slate-200">
              아직 대화 기록이 없습니다.
            </div>
          ) : (
            [...chatHistory].reverse().map((msg, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all animate-fade-in group">
                {msg.user_message && (
                  <div className="mb-4 pl-4 border-l-4 border-warm-teal-500">
                    <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-warm-teal-500"></span>
                      {username || '사용자'}
                    </div>
                    <div className="text-lg text-slate-800 leading-relaxed font-medium break-words whitespace-pre-wrap">{msg.user_message}</div>
                  </div>
                )}
                {msg.bot_response && (
                  <div className="mb-4 pl-4 border-l-4 border-soft-orange-400">
                    <div className="text-sm font-bold text-slate-500 mb-1 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-soft-orange-400"></span>
                      AI 챗봇
                    </div>
                    <div className="text-lg text-slate-700 whitespace-pre-wrap leading-relaxed break-words">
                      {msg.bot_response}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    {msg.depression_score !== undefined && (
                      <div className="text-sm font-bold text-warm-teal-600 bg-warm-teal-50 px-3 py-1 rounded-full">
                        우울 수치: {msg.depression_score.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-slate-400 flex items-center gap-1">
                    <Calendar size={14} />
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
