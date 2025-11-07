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

interface HistoryTabProps {
  status: {
    current_score: number;
    average_score: number;
    recent_scores: number[];
  } | null;
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
    
    // 유효하지 않은 날짜인 경우 처리
    if (isNaN(date.getTime())) {
      return '시간 정보 없음';
    }
    
    // UTC 시간인 경우 KST로 변환 (9시간 추가)
    // timestamp가 'Z'로 끝나거나 timezone 정보가 없으면 UTC로 간주
    if (timestamp.endsWith('Z') || (!timestamp.includes('+') && !timestamp.includes('-', 10))) {
      date = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    }
    
    // KST 시간으로 표시
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${year}. ${month}. ${day}. ${h}:${m}`;
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-600">로딩 중...</div>;
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
        <span className="text-3xl">📊</span>
        <span>우울 수치 변화</span>
      </h3>

      {status && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-300 shadow-md">
              <div className="text-lg font-bold text-gray-700 mb-3">현재 점수</div>
              <div className="text-4xl font-bold text-blue-700">
                {status.current_score.toFixed(1)}
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-xl border-2 border-green-300 shadow-md">
              <div className="text-lg font-bold text-gray-700 mb-3">평균 점수</div>
              <div className="text-4xl font-bold text-green-700">
                {status.average_score.toFixed(1)}
              </div>
            </div>
            <div className="bg-teal-50 p-6 rounded-xl border-2 border-teal-300 shadow-md">
              <div className="text-lg font-bold text-gray-700 mb-3">총 대화 수</div>
              <div className="text-4xl font-bold text-teal-700">
                {chatHistory.length}
              </div>
            </div>
          </div>

          {/* 우울 수치 변화 그래프 */}
          {status.recent_scores && status.recent_scores.length > 0 && (
            <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl border-2 border-gray-300 shadow-md">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                우울 수치 변화 추이
              </h4>
              <div className="w-full h-[250px] sm:h-[350px] lg:h-[400px]">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#4b5563"
                    style={{ fontSize: '12px', fontWeight: 'bold' }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tick={{ fill: '#374151', fontSize: 12 }}
                  />
                  <YAxis
                    domain={[0, 10]}
                    stroke="#4b5563"
                    style={{ fontSize: '12px', fontWeight: 'bold' }}
                    tick={{ fill: '#374151', fontSize: 12 }}
                    width={40}
                    label={{
                      value: '우울 수치',
                      angle: -90,
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: '12px', fontWeight: 'bold', fill: '#374151' },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #14b8a6',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      padding: '8px',
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'score') {
                        return [`${value}/10`, '우울 수치'];
                      }
                      return [`${value}/10`, '평균'];
                    }}
                    labelFormatter={(label) => label}
                    labelStyle={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '14px', fontWeight: 'bold', paddingTop: '10px' }}
                    iconSize={16}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    dot={{ fill: '#14b8a6', r: 6 }}
                    activeDot={{ r: 8 }}
                    name="우울 수치"
                  />
                  {/* 평균선 */}
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    strokeDasharray="8 4"
                    strokeOpacity={0.7}
                    dot={false}
                    name="평균"
                    animationDuration={800}
                    isAnimationActive={true}
                  />
                </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-700 text-center font-semibold">
                최근 {status.recent_scores.length}개 대화의 우울 수치 변화
              </div>
            </div>
          )}
        </>
      )}

      <div>
        <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <span className="text-3xl">💬</span>
          <span>최근 대화</span>
        </h4>
        <div className="space-y-5 max-h-[500px] overflow-y-auto">
          {chatHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-xl">
              아직 대화 기록이 없습니다.
            </div>
          ) : (
            [...chatHistory].reverse().map((msg, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl border-2 border-gray-300 shadow-sm">
                {msg.user_message && (
                  <div className="mb-4">
                    <div className="text-base font-bold text-gray-700 mb-2">{username || '사용자'}</div>
                    <div className="text-lg text-gray-900 leading-relaxed">{msg.user_message}</div>
                  </div>
                )}
                {msg.bot_response && (
                  <div className="mb-4">
                    <div className="text-base font-bold text-gray-700 mb-2">봇</div>
                    <div className="text-lg text-gray-900 whitespace-pre-wrap leading-relaxed">
                      {msg.bot_response}
                    </div>
                  </div>
                )}
                {msg.depression_score !== undefined && (
                  <div className="text-lg text-teal-700 mt-3 font-semibold">
                    우울 수치: {msg.depression_score.toFixed(1)}/10
                  </div>
                )}
                <div className="text-base text-gray-600 mt-3">
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

