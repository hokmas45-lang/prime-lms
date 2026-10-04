import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { AdminUserManagement } from './components/admin/AdminUserManagement';
import { AdminAiMonitoring } from './components/admin/AdminAiMonitoring';
import { AdminDisciplinaryModule } from './components/admin/AdminDisciplinaryModule';
import { AdminAcademicPromotion } from './components/admin/AdminAcademicPromotion';
import { DailyEvaluationsModule } from './components/academic/DailyEvaluationsModule';
import { AssignmentsModule } from './components/academic/AssignmentsModule';
import { QuizzesModule } from './components/academic/QuizzesModule';
import { SubmissionsModule } from './components/academic/SubmissionsModule';
import { MessagingModule } from './components/communication/MessagingModule';
import { AnnouncementsModule } from './components/communication/AnnouncementsModule';
import { PrimeAiChatbot } from './components/ai/PrimeAiChatbot';
import { SubjectCardsView } from './components/academic/SubjectCardsView';
import { LiveZoomBanner } from './components/academic/LiveZoomBanner';
import { TeacherZoomModal } from './components/academic/TeacherZoomModal';
import { GraduationCap } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser } = useData();
  const [activeTab, setActiveTab] = useState<string>('subjects');
  const [showFloatingAi, setShowFloatingAi] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Set default tab based on role when user logs in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin' || currentUser.role === 'super_admin') {
        setActiveTab('users');
      } else {
        setActiveTab('subjects');
      }
    }
  }, [currentUser]);

  // If not authenticated, show calm soft Login Page
  if (!currentUser) {
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'subjects':
        return <SubjectCardsView onSelectSubject={() => setActiveTab('assignments')} />;
      case 'users':
        return (currentUser.role === 'admin' || currentUser.role === 'super_admin') ? <AdminUserManagement /> : <SubjectCardsView />;
      case 'ai-monitoring':
        return (currentUser.role === 'admin' || currentUser.role === 'super_admin') ? <AdminAiMonitoring /> : <AssignmentsModule />;
      case 'academic-promotion':
        return (currentUser.role === 'admin' || currentUser.role === 'super_admin') ? <AdminAcademicPromotion /> : <AssignmentsModule />;
      case 'disciplinary':
        return <AdminDisciplinaryModule />;
      case 'daily-evaluations':
        return <DailyEvaluationsModule />;
      case 'assignments':
        return <AssignmentsModule />;
      case 'quizzes':
        return <QuizzesModule />;
      case 'submissions':
        return <SubmissionsModule />;
      case 'messages':
        return <MessagingModule />;
      case 'announcements':
        return <AnnouncementsModule />;
      case 'ai-helper':
        return <PrimeAiChatbot />;
      default:
        return <SubjectCardsView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col text-slate-800 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Top Application Header */}
      <Header 
        onOpenAiHelper={() => setShowFloatingAi(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
        onOpenZoomModal={() => setShowZoomModal(true)}
      />

      {/* Main Layout Container */}
      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1700px] mx-auto">
        {/* Sidebar Nav (Static on desktop, slide drawer on mobile) */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Area with extra bottom padding on mobile for sticky bottom bar */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto pb-20 lg:pb-8">
          {/* Real-Time Live Zoom Session Broadcast Banner */}
          <LiveZoomBanner />

          {renderContent()}
        </main>
      </div>

      {/* Teacher Live Zoom Modal */}
      <TeacherZoomModal 
        isOpen={showZoomModal} 
        onClose={() => setShowZoomModal(false)} 
      />

      {/* Floating AI Chatbot Modal when triggered */}
      {showFloatingAi && (
        <PrimeAiChatbot isModal onClose={() => setShowFloatingAi(false)} />
      )}

      {/* Sticky Mobile Bottom Navigation for Phones */}
      <BottomNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenAiHelper={() => setShowFloatingAi(true)}
      />

      {/* Footer (hidden on tiny screens or simplified) */}
      <footer className="hidden lg:flex bg-white border-t border-slate-200 py-3.5 px-6 text-center text-xs text-slate-400 font-medium items-center justify-between gap-2 max-w-[1700px] mx-auto w-full">
        <div className="flex items-center gap-2 text-slate-600">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span>Prime LMS • Mobile-Optimized Academic Engine</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>Enterprise Cloud Firestore Connected</span>
          <span>•</span>
          <span>Gemini 3.8 Flash Active</span>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
