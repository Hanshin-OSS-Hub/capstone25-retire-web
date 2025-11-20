'use client';

import { Activity, AlertTriangle, CheckCircle, Phone } from 'lucide-react';

interface DepressionStatusProps {
  status: {
    current_score: number;
    average_score: number;
    needs_intervention: boolean;
    phq_latest?: {
      total_score: number;
      severity: string;
      created_at: string;
    } | null;
  } | null;
}

export default function DepressionStatus({ status }: DepressionStatusProps) {
  if (!status) {
    return (
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-slate-200 rounded w-1/2"></div>
      </div>
    );
  }

  // 우울 수치에 따른 배경색 계산
  const getStatusColor = (score: number) => {
    if (score >= 8) return { bg: 'from-red-500 to-red-600', text: 'text-red-100', icon: 'text-red-200' };
    if (score >= 4) return { bg: 'from-lime-500 to-lime-600', text: 'text-lime-100', icon: 'text-lime-200' };
    return { bg: 'from-blue-500 to-blue-600', text: 'text-blue-100', icon: 'text-blue-200' };
  };

  const getStatusText = () => {
    if (status.current_score >= 7) {
      return { title: '높은 우울 수치', desc: '전문가 상담이 권장됩니다.' };
    } else if (status.current_score >= 4) {
      return { title: '주의 필요', desc: '기분 전환이 필요해요.' };
    } else {
      return { title: '양호한 상태', desc: '지금처럼 유지하세요!' };
    }
  };

  const statusInfo = getStatusText();
  const colors = getStatusColor(status.current_score);

  return (
    <div className={`bg-gradient-to-r ${colors.bg} p-5 rounded-2xl shadow-lg text-white relative overflow-hidden animate-fade-in`}>
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Activity size={100} />
      </div>

      <div className="relative z-10">
        <h3 className={`text-lg font-bold ${colors.text} mb-1 flex items-center gap-2`}>
          <Activity size={20} />
          <span>현재 마음 상태</span>
        </h3>

        <div className="flex items-baseline gap-3 mb-3">
          <div className="text-4xl font-bold drop-shadow-md">
            {status.current_score.toFixed(1)}
          </div>
          <div className={`text-xl font-medium ${colors.text}`}>/ 10</div>
        </div>

        <div className="font-bold text-xl mb-1">{statusInfo.title}</div>
        <div className={`text-sm ${colors.text} font-medium`}>{statusInfo.desc}</div>

        {status.phq_latest && (
          <div className="mt-4 bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/30">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white/90">최근 PHQ-9 검사</span>
              <span className="text-xs text-white/70">
                {new Date(status.phq_latest.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{status.phq_latest.total_score}점</span>
              <span className="w-px h-3 bg-white/40"></span>
              <span className="text-sm font-medium">{status.phq_latest.severity}</span>
            </div>
          </div>
        )}

        {status.needs_intervention && (
          <div className="mt-3 bg-white p-3 rounded-xl text-red-600 shadow-lg animate-bounce-slight">
            <div className="font-bold flex items-center gap-2 mb-2">
              <AlertTriangle size={20} />
              <span>전문가의 도움이 필요해요</span>
            </div>
            <div className="space-y-2 text-sm">
              <a href="tel:1588-9191" className="flex items-center justify-between p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <span className="font-medium">생명의전화</span>
                <div className="flex items-center gap-1 font-bold">
                  <Phone size={14} />
                  1588-9191
                </div>
              </a>
              <a href="tel:1577-0199" className="flex items-center justify-between p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <span className="font-medium">정신건강상담</span>
                <div className="flex items-center gap-1 font-bold">
                  <Phone size={14} />
                  1577-0199
                </div>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
