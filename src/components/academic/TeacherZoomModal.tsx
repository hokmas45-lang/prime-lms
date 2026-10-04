import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { GRADES, SECTIONS, SUBJECTS } from '../../lib/constants';
import { 
  Video, 
  Link, 
  Radio, 
  Users, 
  X, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle,
  ExternalLink,
  Layers,
  StopCircle
} from 'lucide-react';

interface TeacherZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherZoomModal: React.FC<TeacherZoomModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, startZoomSession, endZoomSession, zoomSessions } = useData();

  if (!isOpen || !currentUser) return null;

  const activeTeacherSession = zoomSessions.find(
    s => s.teacherId === currentUser.id && s.status === 'active'
  );

  const [topic, setTopic] = useState('Interactive Lecture & Collaborative Q&A');
  const [subject, setSubject] = useState(currentUser.subject || SUBJECTS[0]);
  const [grade, setGrade] = useState(currentUser.grade || GRADES[0]);
  const [section, setSection] = useState(currentUser.section || SECTIONS[0]);
  const [zoomUrl, setZoomUrl] = useState('https://zoom.us/j/9876543210?pwd=PrimeLive2026');
  const [meetingId, setMeetingId] = useState('987 654 3210');
  const [passcode, setPasscode] = useState('Prime2026');
  const [broadcastAlert, setBroadcastAlert] = useState<string | null>(null);

  const handleStartSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !zoomUrl.trim()) {
      alert('Please provide a session topic and Zoom meeting link.');
      return;
    }

    startZoomSession({
      topic: topic.trim(),
      subject,
      grade,
      section,
      zoomUrl: zoomUrl.trim(),
      meetingId: meetingId.trim(),
      passcode: passcode.trim(),
    });

    setBroadcastAlert(`Broadcast sent! Students in ${grade} (${section}) have received an instant urgent notification and live join link.`);
    setTimeout(() => {
      setBroadcastAlert(null);
      onClose();
    }, 2500);
  };

  const handleEndSession = (sessionId: string) => {
    endZoomSession(sessionId);
    setBroadcastAlert('Live session ended. Students have been notified.');
    setTimeout(() => {
      setBroadcastAlert(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Teacher Live Zoom Integration</h3>
              <p className="text-xs text-slate-500">Broadcast live video classroom to your class feed</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-700 p-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {broadcastAlert && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{broadcastAlert}</span>
          </div>
        )}

        {/* Existing Active Session Banner */}
        {activeTeacherSession ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                <span className="font-bold text-xs">You Have an Active Live Session</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-mono text-[10px] font-black">
                BROADCASTING
              </span>
            </div>

            <div className="text-xs text-rose-800 space-y-0.5">
              <p className="font-bold">Topic: {activeTeacherSession.topic}</p>
              <p className="text-[11px] text-rose-600">
                Cohorts: {activeTeacherSession.subject} • {activeTeacherSession.grade} ({activeTeacherSession.section})
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={activeTeacherSession.zoomUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <span>Launch Host Zoom</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => handleEndSession(activeTeacherSession.id)}
                className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>End Session</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleStartSession} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Session Topic / Lesson Goal
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Live Physics: Newton's 2nd Law Demonstration"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white"
                >
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Grade</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white"
                >
                  {GRADES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Section</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white"
                >
                  {SECTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Zoom Meeting Join URL
              </label>
              <div className="relative">
                <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  required
                  value={zoomUrl}
                  onChange={(e) => setZoomUrl(e.target.value)}
                  placeholder="https://zoom.us/j/1234567890?pwd=..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Paste your personal Zoom meeting or schedule link.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting ID (Optional)</label>
                <input
                  type="text"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  placeholder="e.g. 987 654 3210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Passcode (Optional)</label>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="e.g. Prime2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-[11px] text-indigo-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Instantly broadcasts live banner to all enrolled student portals in {grade} ({section}).</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>Start Live Session &amp; Broadcast</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
