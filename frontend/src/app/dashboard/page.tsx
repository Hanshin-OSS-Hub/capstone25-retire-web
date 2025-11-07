'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getToken, removeToken } from '@/lib/api';
import DashboardHeader from '@/components/DashboardHeader';
import DepressionStatus from '@/components/DepressionStatus';
import TabNavigation from '@/components/TabNavigation';
import ChatTab from '@/components/ChatTab';
import CareerTab from '@/components/CareerTab';
import HistoryTab from '@/components/HistoryTab';

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
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [depressionStatus, setDepressionStatus] = useState<DepressionStatusData | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'career' | 'history'>('chat');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  const loadData = async () => {
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
  };

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
      <div className="container-responsive py-2 sm:py-4 lg:py-6">
        <div className="card-responsive">
          <DashboardHeader username={user.username} onLogout={handleLogout} />
          
          <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            <DepressionStatus status={depressionStatus} />
            
            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="mt-4 sm:mt-6">
              {activeTab === 'chat' && <ChatTab onStatusUpdate={loadData} />}
              {activeTab === 'career' && <CareerTab />}
              {activeTab === 'history' && <HistoryTab status={depressionStatus} username={user.username} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

