'use client';

interface DashboardHeaderProps {
  username: string;
  onLogout: () => void;
}

export default function DashboardHeader({ username, onLogout }: DashboardHeaderProps) {
  return (
    <header className="bg-teal-600 text-white p-4 sm:p-6 lg:p-8 rounded-xl mb-4 sm:mb-6 lg:mb-8 shadow-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 lg:gap-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold flex items-center gap-2 sm:gap-3">
          <span className="text-3xl sm:text-4xl lg:text-5xl"></span>
          <span>RetireWeb</span>
        </h1>
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-base sm:text-xl lg:text-2xl font-semibold">{username}님</span>
          <button
            onClick={onLogout}
            className="px-4 py-2 sm:px-6 sm:py-4 bg-white/25 hover:bg-white/35 rounded-xl transition-colors text-base sm:text-lg lg:text-xl font-bold shadow-md min-h-[48px] sm:min-h-[56px]"
          >
            로그아웃
          </button>
        </div>
      </div>
    </header>
  );
}

