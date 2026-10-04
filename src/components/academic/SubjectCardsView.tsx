import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { SubjectCardData } from '../../types';
import { 
  Bell, 
  Video, 
  Sparkles, 
  BookOpen, 
  Atom, 
  Calculator, 
  Binary, 
  Leaf, 
  FlaskConical, 
  GraduationCap, 
  TrendingUp, 
  Award, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Radio,
  ExternalLink,
  Layers
} from 'lucide-react';

interface SubjectCardsViewProps {
  onSelectSubject?: (subjectName: string) => void;
  filterGrade?: string;
  filterSection?: string;
}

export const SubjectCardsView: React.FC<SubjectCardsViewProps> = ({ 
  onSelectSubject,
  filterGrade,
  filterSection
}) => {
  const { currentUser, getSubjectCards, assignments, zoomSessions, submissions } = useData();
  const [selectedSubjectModal, setSelectedSubjectModal] = useState<SubjectCardData | null>(null);

  const cards = getSubjectCards(filterGrade, filterSection);

  // Helper to render customized 3D-styled central illustrations for each subject
  const render3DIllustration = (iconType: SubjectCardData['iconType']) => {
    switch (iconType) {
      case 'english':
        return (
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 p-[1px] shadow-[0_12px_30px_rgba(245,158,11,0.35)] transform transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
            <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#251f1c] via-[#1a1614] to-[#120f0e] flex flex-col items-center justify-center relative overflow-hidden border border-amber-500/20">
              {/* 3D Glass Accent Reflection */}
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-900/40 border border-amber-400/30 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all">
                <BookOpen className="w-8 h-8 text-amber-300 drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)]" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-amber-300/80 mt-2 font-mono">
                LITERATURE
              </span>
            </div>
          </div>
        );

      case 'es5':
        return (
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-green-400 p-[1px] shadow-[0_12px_30px_rgba(16,185,129,0.35)] transform transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
            <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#162520] via-[#101b17] to-[#0a120f] flex flex-col items-center justify-center relative overflow-hidden border border-emerald-500/20">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-900/40 border border-emerald-400/30 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all">
                <Leaf className="w-8 h-8 text-emerald-300 drop-shadow-[0_4px_8px_rgba(16,185,129,0.6)]" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-300/80 mt-2 font-mono">
                ENV. SCIENCE
              </span>
            </div>
          </div>
        );

      case 'math':
        return (
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 p-[1px] shadow-[0_12px_30px_rgba(99,102,241,0.35)] transform transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
            <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#1b1e2e] via-[#12141f] to-[#0c0d15] flex flex-col items-center justify-center relative overflow-hidden border border-indigo-500/20">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-indigo-400/20 rounded-full blur-xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/15 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400/20 to-indigo-900/40 border border-indigo-400/30 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all">
                <Calculator className="w-8 h-8 text-indigo-300 drop-shadow-[0_4px_8px_rgba(99,102,241,0.6)]" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-300/80 mt-2 font-mono">
                CALCULUS
              </span>
            </div>
          </div>
        );

      case 'physics':
        return (
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-400 p-[1px] shadow-[0_12px_30px_rgba(6,182,212,0.35)] transform transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
            <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#12242a] via-[#0d191d] to-[#081013] flex flex-col items-center justify-center relative overflow-hidden border border-cyan-500/20">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-400/20 rounded-full blur-xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-cyan-900/40 border border-cyan-400/30 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all">
                <Atom className="w-8 h-8 text-cyan-300 drop-shadow-[0_4px_8px_rgba(6,182,212,0.6)] animate-[spin_12s_linear_infinite]" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-cyan-300/80 mt-2 font-mono">
                MECHANICS
              </span>
            </div>
          </div>
        );

      case 'chemistry':
        return (
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-pink-400 p-[1px] shadow-[0_12px_30px_rgba(168,85,247,0.35)] transform transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
            <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#26172e] via-[#1a1020] to-[#110a15] flex flex-col items-center justify-center relative overflow-hidden border border-purple-500/20">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-400/20 rounded-full blur-xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-500/15 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400/20 to-purple-900/40 border border-purple-400/30 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all">
                <FlaskConical className="w-8 h-8 text-purple-300 drop-shadow-[0_4px_8px_rgba(168,85,247,0.6)]" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-purple-300/80 mt-2 font-mono">
                ORGANIC LAB
              </span>
            </div>
          </div>
        );

      case 'cs':
      default:
        return (
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-purple-400 p-[1px] shadow-[0_12px_30px_rgba(139,92,246,0.35)] transform transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1">
            <div className="w-full h-full rounded-2xl bg-gradient-to-b from-[#1e1b2f] via-[#141221] to-[#0c0a15] flex flex-col items-center justify-center relative overflow-hidden border border-violet-500/20">
              <div className="absolute -top-12 -right-12 w-28 h-28 bg-violet-400/20 rounded-full blur-xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-500/15 via-transparent to-transparent pointer-events-none" />
              
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400/20 to-violet-900/40 border border-violet-400/30 backdrop-blur-md flex items-center justify-center shadow-inner group-hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all">
                <Binary className="w-8 h-8 text-violet-300 drop-shadow-[0_4px_8px_rgba(139,92,246,0.6)]" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-violet-300/80 mt-2 font-mono">
                ALGORITHMS
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-700/60 shadow-xl text-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Enrolled Academic Disciplines</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Subject Dashboard &amp; Real-Time Grades</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold font-mono">
              Live Firestore Connected
            </span>
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            Modern dark-themed 3D curriculum cards with dynamic subject scores, pending assignments, and instant Zoom live feeds.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3.5 py-2 rounded-xl text-xs text-slate-300 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Cohort: {filterGrade || currentUser?.grade || 'Grade 9'}</span>
        </div>
      </div>

      {/* Modern Dark-Themed Subject Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {cards.map((card) => {
          return (
            <div
              key={card.id}
              onClick={() => {
                if (onSelectSubject) onSelectSubject(card.name);
                setSelectedSubjectModal(card);
              }}
              className="group relative bg-[#13151b] hover:bg-[#181a24] rounded-2xl sm:rounded-3xl p-5 border border-slate-800/90 hover:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle Ambient Glow behind top 3D container */}
              <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none rounded-t-3xl" />
              
              {/* Top Central 3D Illustration Area */}
              <div className="flex flex-col items-center justify-center pt-2 pb-6">
                {render3DIllustration(card.iconType)}
              </div>

              {/* Live Zoom Active Indicator if session is running */}
              {card.zoomActive && card.zoomSession && (
                <div className="mb-3 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300 animate-pulse">
                  <div className="flex items-center gap-2 font-bold">
                    <Radio className="w-4 h-4 text-rose-400" />
                    <span>Live Zoom Session Active</span>
                  </div>
                  <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full">
                    JOIN
                  </span>
                </div>
              )}

              {/* Bottom Details (Subject name, grade level, dynamic score, and pill notification badge) */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                {/* Left: Subject Name, Grade level, and Dynamic Score */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline flex-wrap gap-1.5">
                    <span className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate">
                      {card.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      - {card.grade}
                    </span>
                    
                    {/* Dynamic Score Display (Requirement 2):
                        Appends the percentage next to the subject name or grade pill:
                        e.g., "English - Grade 9 | 70%" */}
                    {card.averageScore !== undefined && (
                      <span className="inline-flex items-center gap-1 font-bold text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                        <span className="text-slate-500 font-normal">|</span>
                        <span>{card.averageScore}%</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    Faculty: {card.teacherName}
                  </p>
                </div>

                {/* Right: Pill-shaped badge showing notification counts with a bell icon */}
                <div 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-white font-semibold text-xs shadow-inner group-hover:border-indigo-500/50 group-hover:bg-indigo-950/40 transition-colors shrink-0"
                  title={`${card.notificationCount} active course items / updates`}
                >
                  <Bell className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                  <span className="text-xs font-bold text-slate-200">
                    {card.notificationCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Subject Modal on Card Click */}
      {selectedSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151720] border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold">
                  {selectedSubjectModal.code} • Course Dossier
                </div>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {selectedSubjectModal.name} - {selectedSubjectModal.grade}
                </h3>
                <p className="text-xs text-slate-400">
                  Lead Instructor: {selectedSubjectModal.teacherName}
                </p>
              </div>

              <button
                onClick={() => setSelectedSubjectModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Dynamic Performance Highlight Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Continuous Subject Grade
                </span>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {selectedSubjectModal.averageScore !== undefined ? `${selectedSubjectModal.averageScore}%` : 'Pending Evaluation'}
                </div>
                <span className="text-[11px] text-slate-400">
                  Based on assignments, continuous quizzes, and daily evaluations.
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Live Zoom Session banner inside modal if running */}
            {selectedSubjectModal.zoomActive && selectedSubjectModal.zoomSession ? (
              <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
                    <span>Live Class Session in Progress</span>
                  </div>
                  <span className="text-[10px] font-mono bg-rose-500 text-white font-black px-2 py-0.5 rounded-full">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-rose-100">
                  Topic: "{selectedSubjectModal.zoomSession.topic}"
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <a
                    href={selectedSubjectModal.zoomSession.zoomUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    <span>Launch &amp; Join Zoom Meeting</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
                <Video className="w-4 h-4 text-slate-500" />
                <span>No active live Zoom session at this moment.</span>
              </div>
            )}

            {/* Course Information & Actions */}
            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[11px]">
                Active Tasks &amp; Advisories
              </span>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-between">
                <span>Total notification badges active</span>
                <span className="font-bold text-white px-2 py-0.5 rounded-full bg-slate-800">
                  {selectedSubjectModal.notificationCount} updates
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedSubjectModal(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
