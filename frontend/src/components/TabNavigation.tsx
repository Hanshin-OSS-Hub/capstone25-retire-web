'use client';

interface TabNavigationProps {
  activeTab: 'chat' | 'career' | 'history';
  onTabChange: (tab: 'chat' | 'career' | 'history') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'chat' as const, label: 'AI 챗봇', icon: '💬' },
    { id: 'career' as const, label: '커리어 컨설팅', icon: '💼' },
    { id: 'history' as const, label: '대화 기록', icon: '📚' },
  ];

  return (
    <div className="flex gap-1 sm:gap-2 lg:gap-3 border-b-2 border-gray-300 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-1.5 py-2 sm:px-4 sm:py-3 lg:px-6 lg:py-4 rounded-t-lg sm:rounded-t-xl font-bold transition-colors min-h-[44px] sm:min-h-[52px] lg:min-h-[64px] flex items-center justify-center flex-1 sm:flex-none min-w-0 ${
            activeTab === tab.id
              ? 'bg-teal-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          <span className="mr-0.5 sm:mr-2 text-sm sm:text-xl lg:text-2xl shrink-0">{tab.icon}</span>
          <span className="text-xs sm:text-base lg:text-lg truncate">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

