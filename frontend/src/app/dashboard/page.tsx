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
  const [activeTab, setActiveTab] = useState<'chat' | 'career' | 'history' | 'phq'>('chat');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [userData, statusData] = await Promise.all([
        api.getUser(),
        api.getDepressionStatus(),
      ]);
      setUser(userData);
      setDepressionStatus(statusData);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      removeToken();
      router.push('/login');
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

