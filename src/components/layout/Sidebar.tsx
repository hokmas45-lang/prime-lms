import React from 'react';
import { useData } from '../../context/DataContext';
import { 
  Users, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  Megaphone, 
  Sparkles, 
  MessageSquare,
  ShieldAlert,
  X,
  LogOut,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isMobileOpen, 
  onCloseMobile 
}) => {
  const { currentUser, assignments, quizzes, users, aiInteractions, logout } = useData();

  if (!currentUser) return null;

  const isStudent = currentUser.role === 'student';
  const isAdmin = currentUser.role === 'admin';

  const studentAssignmentsCount = isStudent
    ? assignments.filter(a => a.grade === currentUser.grade && a.section === currentUser.section).length
    : assignments.length;

  const studentQuizzesCount = isStudent
    ? quizzes.filter(q => q.grade === currentUser.grade && q.section === currentUser.section).length
    : quizzes.length;

  const flaggedAiCount = aiInteractions.filter(i => i.flagged).length;

  const navItems = [
    // Admin Items
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      roles: ['admin'],
      badge: users.length > 0 ? users.length : undefined,
    },
    {
      id: 'ai-monitoring',
      label: 'AI Chat Monitoring',
      icon: ShieldAlert,
      roles: ['admin'],
      badge: flaggedAiCount > 0 ? `${flaggedAiCount} flag` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'assignments',
      label: currentUser.role === 'teacher' ? 'Assignments' : isAdmin ? 'All Assignments' : 'My Assignments',
      icon: FileText,
      roles: ['admin', 'teacher', 'student'],
      badge: studentAssignmentsCount > 0 ? studentAssignmentsCount : undefined,
    },
    {
      id: 'quizzes',
      label: currentUser.role === 'teacher' ? 'Quizzes' : isAdmin ? 'All Quizzes' : 'Interactive Quizzes',
      icon: HelpCircle,
      roles: ['admin', 'teacher', 'student'],
      badge: studentQuizzesCount > 0 ? studentQuizzesCount : undefined,
    },
    {
      id: 'submissions',
      label: currentUser.role === 'teacher' ? 'Submissions & Review' : 'My Grades & Work',
      icon: CheckCircle,
      roles: ['teacher', 'student'],
    },
    {
      id: 'messages',
      label: isStudent ? 'Message Teachers' : 'Direct Messages',
      icon: MessageSquare,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone,
      roles: ['admin', 'teacher', 'student'],
    },
    {
      id: 'ai-helper',
      label: currentUser.role === 'teacher' ? 'AI Lesson & Quiz Helper' : 'AI Study Assistant',
      icon: Sparkles,
      roles: ['admin', 'teacher', 'student'],
      highlight: true,
    },
  ];

  const visibleItems = navItems.filter(item => item.roles.includes(currentUser.role));

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white lg:bg-slate-50/70 border-r border-slate-200 p-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-none transition-transform duration-200 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:static lg:w-64
      `}>
        <div className="space-y-4">
          {/* Mobile Drawer Header with Close Button */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-slate-900">Prime LMS</span>
            </div>
            <button 
              onClick={onCloseMobile} 
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
              title="Close Navigation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Context Card */}
          <div className="p-3.5 bg-slate-50 lg:bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <span>Academic Portal</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold">Online</span>
            </div>
            <p className="font-bold text-sm text-slate-900 truncate">{currentUser.name}</p>
            <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="font-medium text-slate-700 capitalize">{currentUser.role}</span>
              {(currentUser.grade || currentUser.section) && (
                <>
                  <span>•</span>
                  <span className="text-indigo-600 font-semibold">{currentUser.grade} ({currentUser.section})</span>
                </>
              )}
            </div>
          </div>

          {/* Navigation items */}
          <nav className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 px-2.5 mb-2">
              Navigation
            </p>
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : item.highlight
                      ? 'bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      item.badgeColor || (isActive ? 'bg-indigo-400 text-white' : 'bg-slate-200 text-slate-700')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer in Drawer with Logout */}
        <div className="pt-4 border-t border-slate-200/80 text-xs text-slate-400 space-y-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-xs transition-colors lg:hidden"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Portal</span>
          </button>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            Prime LMS Mobile Engine • Firestore
          </p>
        </div>
      </aside>
    </>
  );
};
