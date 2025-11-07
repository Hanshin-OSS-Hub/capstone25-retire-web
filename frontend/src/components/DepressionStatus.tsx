'use client';

interface DepressionStatusProps {
  status: {
    current_score: number;
    average_score: number;
    needs_intervention: boolean;
  } | null;
}

export default function DepressionStatus({ status }: DepressionStatusProps) {
  if (!status) {
    return (
      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
        <p className="text-gray-600">데이터를 불러오는 중...</p>
      </div>
    );
  }

  // 우울 수치에 따른 배경색 계산 (0: 하늘색, 5: 초록색, 10: 붉은색)
  const getBackgroundColor = (score: number) => {
    // 0-10 범위를 0-1로 정규화
    const normalized = Math.min(Math.max(score / 10, 0), 1);
    
    // 하늘색(0) → 초록색(5) → 붉은색(10)으로 그라데이션
    if (normalized <= 0.5) {
      // 0-5: 하늘색에서 초록색으로
      if (normalized <= 0.1) return 'from-sky-100 to-sky-200';
      if (normalized <= 0.2) return 'from-sky-200 to-sky-300';
      if (normalized <= 0.3) return 'from-sky-300 to-blue-200';
      if (normalized <= 0.4) return 'from-blue-200 to-green-200';
      return 'from-green-200 to-green-400';
    } else {
      // 5-10: 초록색에서 붉은색으로
      if (normalized <= 0.6) return 'from-green-400 to-yellow-300';
      if (normalized <= 0.7) return 'from-yellow-300 to-orange-300';
      if (normalized <= 0.8) return 'from-orange-300 to-orange-400';
      if (normalized <= 0.9) return 'from-orange-400 to-red-400';
      return 'from-red-400 to-red-600';
    }
  };

  const getStatusText = () => {
    if (status.current_score >= 7) {
      return { text: '높은 우울 수치 - 전문가 상담 권장', color: 'text-red-700' };
    } else if (status.current_score >= 3) {
      return { text: '보통 우울 수치', color: 'text-yellow-700' };
    } else {
      return { text: '양호한 상태 - 계속 유지하세요', color: 'text-green-700' };
    }
  };

  const statusInfo = getStatusText();
  const bgGradient = getBackgroundColor(status.current_score);

  return (
    <div className={`bg-gradient-to-r ${bgGradient} p-4 sm:p-6 lg:p-8 rounded-xl border-2 border-gray-300 shadow-md`}>
      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
        <span className="text-2xl sm:text-3xl">📊</span>
        <span>현재 우울 수치</span>
      </h3>
      <div className="flex items-baseline gap-2 sm:gap-3 mb-4 sm:mb-6">
        <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900">
          {status.current_score.toFixed(1)}
        </div>
        <div className="text-xl sm:text-2xl lg:text-3xl text-gray-700 font-semibold">/ 10</div>
      </div>
      <div className={`text-lg sm:text-xl font-bold ${statusInfo.color} mb-3 sm:mb-4`}>
        {statusInfo.text}
      </div>
      {status.needs_intervention && (
        <div className="mt-6 p-5 bg-red-100 border-2 border-red-400 rounded-xl">
          <p className="text-lg font-bold text-red-900 mb-3">
            💙 전문적인 도움이 필요해 보입니다. 다음 기관들을 연락해보세요:
          </p>
          <div className="space-y-2 text-lg text-red-800">
            <p>• 생명의전화: <span className="font-bold text-xl">1588-9191</span></p>
            <p>• 청소년전화: <span className="font-bold text-xl">1388</span></p>
            <p>• 정신건강상담전화: <span className="font-bold text-xl">1577-0199</span></p>
          </div>
        </div>
      )}
    </div>
  );
}

