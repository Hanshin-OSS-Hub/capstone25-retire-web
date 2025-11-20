'use client';

import { MessageCircle, Briefcase, BookOpen, ClipboardList } from 'lucide-react';

type TabId = 'chat' | 'career' | 'history' | 'phq';

interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'chat', label: 'AI 챗봇', icon: <MessageCircle size={24} /> },
    { id: 'career', label: '커리어 컨설팅', icon: <Briefcase size={24} /> },
    { id: 'history', label: '대화 기록', icon: <BookOpen size={24} /> },
    { id: 'phq', label: 'PHQ-9 설문', icon: <ClipboardList size={24} /> },
  ];

  return (
    <div className="flex gap-2 border-b border-slate-200 overflow-x-auto bg-white/80 backdrop-blur-md rounded-t-2xl p-2 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center flex-1 min-w-[100px] ${activeTab === tab.id
              ? 'bg-gradient-to-r from-warm-teal-500 to-warm-teal-600 text-white shadow-lg scale-105'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-warm-teal-600'
            }`}
        >
          <span className="shrink-0">{tab.icon}</span>
          <span className="ml-2 text-base truncate hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
