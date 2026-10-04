import React from 'react';
import { useData } from '../../context/DataContext';
import { 
  Users, 
  FileText, 
  HelpCircle, 
  CheckCircle, 
  MessageSquare, 
  Sparkles, 
  ShieldAlert, 
  Menu
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
  onOpenAiHelper: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
  onOpenAiHelper,
}) => {
  const { currentUser, assignments, quizzes, aiInteractions } = useData();

  if (!currentUser) return null;

  const isStudent = currentUser.role === 'student';
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  const studentAssignmentsCount = isStudent
    ? assignments.filter(a => a.grade === currentUser.grade && a.section === currentUser.section).length
    : assignments.length;

  const studentQuizzesCount = isStudent
    ? quizzes.filter(q => q.grade === currentUser.grade && q.section === currentUser.section).length
    : quizzes.length;

  const flaggedAiCount = aiInteractions.filter(i => i.flagged).length;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {isAdmin ? (
        <>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all active:scale-95 touch-manipulation flex-1 ${
              activeTab === 'users' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span>Users</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-monitoring')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all active:scale-95 touch-manipulation flex-1 relative ${
              activeTab === 'ai-monitoring' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-5 h-5 mb-0.5" />
            <span>AI Safety</span>
            {flaggedAiCount > 0 && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all active:scale-95 touch-manipulation flex-1 ${
              activeTab === 'assignments' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span>Tasks</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all active:scale-95 touch-manipulation flex-1 ${
              activeTab === 'messages' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span>Messages</span>
          </button>

          <button
            onClick={onOpenMobileMenu}
            className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold text-slate-500 hover:text-slate-900 transition-all active:scale-95 touch-manipulation flex-1"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>Menu</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all active:scale-95 touch-manipulation flex-1 relative ${
              activeTab === 'assignments' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-5 h-5 mb-0.5" />
            <span>Tasks</span>
            {studentAssignmentsCount > 0 && (
              <span className="absolute top-1 right-3 px-1 min-w-[14px] h-[14px] rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                {studentAssignmentsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all active:scale-95 touch-manipulation flex-1 relative ${
              activeTab === 'quizzes' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-5 h-5 mb-0.5" />
            <span>Quizzes</span>
            {studentQuizzesCount > 0 && (
              <span className="absolute top-1 right-3 px-1 min-w-[14px] h-[14px] rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                {studentQuizzesCount}
              </span>
            )}
          </button>

          {/* Center AI action button */}
          <button
            onClick={onOpenAiHelper}
            className="flex flex-col items-center justify-center p-1 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 active:scale-90 transition-all -translate-y-2.5 w-11 h-11 border-2 border-white shrink-0 mx-1 touch-manipulation"
            title="Open AI Assistant"
          >
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold transition-all active:scale-95 touch-manipulation flex-1 ${
              activeTab === 'messages' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span>Chat</span>
          </button>

          <button
            onClick={onOpenMobileMenu}
            className="flex flex-col items-center justify-center p-1.5 rounded-xl text-[10px] font-semibold text-slate-500 hover:text-slate-900 transition-all active:scale-95 touch-manipulation flex-1"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span>More</span>
          </button>
        </>
      )}
    </nav>
  );
};
