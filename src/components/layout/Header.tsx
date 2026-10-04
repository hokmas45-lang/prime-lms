import React from 'react';
import { useData } from '../../context/DataContext';
import { 
  GraduationCap, 
  LogOut, 
  User, 
  Sparkles, 
  Menu,
  X,
  Video,
  Crown
} from 'lucide-react';

interface HeaderProps {
  onOpenAiHelper: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  onOpenZoomModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenAiHelper, 
  onToggleMobileMenu,
  isMobileMenuOpen,
  onOpenZoomModal
}) => {
  const { currentUser, logout, isSuperAdmin } = useData();

  if (!currentUser) return null;

  const roleStyles: Record<string, string> = {
    super_admin: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    admin: 'bg-rose-50 text-rose-700 border-rose-200',
    subadmin: 'bg-purple-50 text-purple-700 border-purple-200',
    teacher: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    student: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const roleLabels: Record<string, string> = {
    super_admin: '👑 Super Admin',
    admin: 'Admin',
    subadmin: 'Sub-Admin',
    teacher: 'Teacher',
    student: 'Student',
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 pt-[max(0.625rem,env(safe-area-inset-top))] flex items-center justify-between gap-2 sm:gap-4">
      {/* Left: Mobile Menu Toggle + Brand */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
          title="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
          <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-none">
              Prime <span className="text-indigo-600">LMS</span>
            </span>
          </div>
          <p className="text-[10px] text-slate-600 hidden md:block">
            Academic Management &amp; Learning Portal
          </p>
        </div>
      </div>

      {/* Right controls: Zoom launch, AI helper & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Teacher Live Zoom Quick Action */}
        {(currentUser.role === 'teacher' || isSuperAdmin) && onOpenZoomModal && (
          <button
            onClick={onOpenZoomModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-all active:scale-95"
            title="Start Live Zoom Session for your class"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Start Live Zoom</span>
          </button>
        )}

        {/* Floating AI Helper Trigger */}
        <button
          onClick={onOpenAiHelper}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all shadow-xs"
          title="Open Prime AI Chatbot Assistant"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>Prime AI</span>
        </button>

        {/* User Profile Info */}
        <div className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser.name.charAt(0)}
          </div>

          <div className="text-left leading-tight hidden min-[370px]:block">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-xs text-slate-900 truncate max-w-[90px] sm:max-w-[150px]">
                {currentUser.name}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`px-1.5 py-0.2 text-[9px] font-semibold rounded border ${roleStyles[currentUser.role] || roleStyles.student}`}>
                {roleLabels[currentUser.role] || 'User'}
              </span>
              {(currentUser.grade || currentUser.section) && (
                <span className="text-[9px] text-slate-600 font-medium truncate max-w-[80px]">
                  {currentUser.grade}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-0.5 active:scale-95"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
