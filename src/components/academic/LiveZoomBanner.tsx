import React from 'react';
import { useData } from '../../context/DataContext';
import { Video, Radio, ExternalLink, Users, Sparkles, X } from 'lucide-react';

export const LiveZoomBanner: React.FC = () => {
  const { currentUser, zoomSessions } = useData();

  if (!currentUser) return null;

  const isStudent = currentUser.role === 'student';
  const isTeacher = currentUser.role === 'teacher';

  // Find active session relevant to the current user
  const activeSession = zoomSessions.find(s => {
    if (s.status !== 'active') return false;
    if (isStudent) {
      return (
        (!s.grade || s.grade === currentUser.grade) &&
        (!s.section || s.section === currentUser.section || s.section === 'All')
      );
    }
    if (isTeacher) {
      return s.teacherId === currentUser.id;
    }
    return true; // Admin can see any active session
  });

  if (!activeSession) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-rose-700 to-indigo-700 text-white p-4 sm:p-5 shadow-lg border border-rose-500/50 mb-6">
      {/* Decorative backdrop glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0 border border-white/20 shadow-inner">
            <Radio className="w-6 h-6 text-white animate-pulse" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-white text-rose-700 text-[10px] font-black uppercase tracking-wider">
                LIVE NOW
              </span>
              <span className="text-xs text-rose-100 font-semibold">
                {activeSession.subject} • {activeSession.grade} ({activeSession.section})
              </span>
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-snug">
              {activeSession.topic}
            </h4>
            <p className="text-xs text-rose-100">
              Instructor: <span className="font-bold text-white">{activeSession.teacherName}</span>
              {activeSession.meetingId && ` • ID: ${activeSession.meetingId}`}
              {activeSession.passcode && ` • Passcode: ${activeSession.passcode}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <a
            href={activeSession.zoomUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-rose-700 hover:text-rose-800 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Video className="w-4 h-4 text-rose-600" />
            <span>Join Live Zoom Session</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
        </div>
      </div>
    </div>
  );
};
