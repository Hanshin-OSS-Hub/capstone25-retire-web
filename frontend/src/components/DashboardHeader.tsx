'use client';

import { LogOut, User } from 'lucide-react';

interface DashboardHeaderProps {
  username: string;
  onLogout: () => void;
}

export default function DashboardHeader({ username, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-6 mb-6 sticky top-0 z-50 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center tracking-tight text-slate-800">
          <span>RetireWeb</span>
        </h1>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-200">
            <User size={18} className="text-slate-500" />
            <span className="text-base font-semibold text-slate-700">{username}님</span>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-full transition-all duration-300 font-medium text-sm shadow-sm hover:shadow-md active:scale-95"
          >
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    </header>
  );
}
