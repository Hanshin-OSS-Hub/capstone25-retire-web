'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken, removeToken } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import DepressionStatus from '@/components/DepressionStatus';
import TabNavigation from '@/components/TabNavigation';
import ChatTab from '@/components/ChatTab';
import CareerTab from '@/components/CareerTab';
import HistoryTab from '@/components/HistoryTab';
import PhqTab from '@/components/PhqTab';

type User = {
  id: string;
  username: string;
  email: string;
  created_at: string;
};

type DepressionStatusData = {
  current_score: number;
  average_score: number;
  recent_scores: number[];
  needs_intervention: boolean;
  last_updated: string | null;
  phq_latest?: {
    total_score: number;
    severity: string;
    created_at: string;
    scores: number[];
  } | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [depressionStatus, setDepressionStatus] = useState<DepressionStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 세션 스토리지에서 activeTab 복원 (HMR 리로드 대응)
  const [activeTab, setActiveTab] = useState<'chat' | 'career' | 'history' | 'phq'>(() => {
    if (typeof window !== 'undefined') {
      const savedTab = sessionStorage.getItem('dashboard_activeTab');
      if (savedTab && ['chat', 'career', 'history', 'phq'].includes(savedTab)) {
        return savedTab as 'chat' | 'career' | 'history' | 'phq';
      }
    }
    return 'chat';
  });
  
  const [loading, setLoading] = useState(true);

  // activeTab 변경 시 세션 스토리지에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('dashboard_activeTab', activeTab);
    }
  }, [activeTab]);

  const loadData = useCallback(async () => {
    setError(null); // 에러 초기화
    try {
      const [userData, statusData] = await Promise.all([
        api.getUser(),
        api.getDepressionStatus(),
      ]);
      setUser(userData);
      setDepressionStatus(statusData);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      const statusCode = errorMessage.match(/\d{3}/)?.[0];
      
      // 401 또는 403 인증 오류만 로그아웃 처리
      if (statusCode === '401' || statusCode === '403' || 
          errorMessage.includes('Unauthorized') || 
          errorMessage.includes('Forbidden')) {
        removeToken();
        router.push('/login');
        return;
      }
      
      // 다른 오류는 에러 메시지 표시 (리다이렉트 없음)
      setError('데이터를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
      // 기존 데이터는 유지 (사용자가 계속 작업할 수 있도록)
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
    // loadData는 useCallback으로 감싸져 있고 router에 의존하므로,
    // router가 변경되지 않는 한 loadData도 변경되지 않습니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 컴포넌트 마운트 시에만 실행

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      removeToken();
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-white text-2xl font-bold">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen gradient-bg">
      <DashboardHeader username={user.username} onLogout={handleLogout} />

      <div className="container-responsive pb-8 sm:pb-10 lg:pb-12">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between animate-fade-in">
            <span>{error}</span>
            <button 
              onClick={loadData}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              다시 시도
            </button>
          </div>
        )}
        
        <div className="card-responsive">
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <DepressionStatus status={depressionStatus} />

            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="mt-6">
              {activeTab === 'chat' && <ChatTab onStatusUpdate={loadData} />}
              {activeTab === 'career' && <CareerTab />}
              {activeTab === 'history' && <HistoryTab status={depressionStatus} username={user.username} />}
              {activeTab === 'phq' && <PhqTab onResultSaved={loadData} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

