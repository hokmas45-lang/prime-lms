import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { GRADES } from '../../lib/constants';
import { 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  GraduationCap, 
  RefreshCw, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const AdminAcademicPromotion: React.FC = () => {
  const { 
    currentUser, 
    users, 
    assignments, 
    quizzes, 
    submissions, 
    dailyEvaluations,
    academicSettings, 
    advanceTerm, 
    advanceAcademicYear 
  } = useData();

  const [confirmTermModal, setConfirmTermModal] = useState(false);
  const [clearTermDataOption, setClearTermDataOption] = useState(true);
  const [confirmYearModal, setConfirmYearModal] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (currentUser?.role !== 'admin') {
    return null;
  }

  // Student counts per grade
  const studentUsers = users.filter(u => u.role === 'student');
  const gradeCounts: Record<string, number> = {};
  GRADES.forEach(g => {
    gradeCounts[g] = studentUsers.filter(s => s.grade === g).length;
  });
  const graduatedCount = studentUsers.filter(s => s.grade?.includes('Graduated')).length;

  const handleTriggerTerm = () => {
    const res = advanceTerm(clearTermDataOption);
    setConfirmTermModal(false);
    setNotification({ type: 'success', message: res.message });
    setTimeout(() => setNotification(null), 6000);
  };

  const handleTriggerYear = () => {
    const res = advanceAcademicYear();
    setConfirmYearModal(false);
    setNotification({ type: 'success', message: res.message });
    setTimeout(() => setNotification(null), 7000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Institutional Governance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Academic Year &amp; Term Promotion Control
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Administer institutional terms, trigger student grade advancements, and manage automated annual data resets for a fresh academic start.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-800 shrink-0">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span>Active: {academicSettings.currentAcademicYear} • {academicSettings.currentTerm}</span>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 border shadow-xs ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="leading-relaxed">{notification.message}</span>
        </div>
      )}

      {/* Current Academic State & Student Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Academic Session</span>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">{academicSettings.currentAcademicYear}</div>
              <div className="text-xs font-bold text-indigo-600 mt-0.5">{academicSettings.currentTerm}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Current live semester active for all student and faculty portals.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Enrolled Cohort</span>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">{studentUsers.length} Students</div>
              <div className="text-xs text-emerald-600 font-semibold mt-0.5">{users.filter(u => u.role === 'teacher').length} Faculty Members</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Registered accounts eligible for grade-level promotion.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Current Term Coursework</span>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900">{assignments.length + quizzes.length} Tasks</div>
              <div className="text-xs text-slate-500 font-semibold mt-0.5">{submissions.length + dailyEvaluations.length} Submissions &amp; Evals</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
            Temporary class records subject to end-of-term archival.
          </p>
        </div>
      </div>

      {/* Grade Level Breakdown */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-slate-900">Student Cohort Distribution</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {GRADES.map(g => (
            <div key={g} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center space-y-0.5">
              <span className="text-[11px] font-semibold text-slate-500 block">{g}</span>
              <span className="text-lg font-bold text-slate-900">{gradeCounts[g] || 0}</span>
              <span className="text-[10px] text-slate-400 block">students</span>
            </div>
          ))}
          <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-center space-y-0.5">
            <span className="text-[11px] font-semibold text-indigo-700 block">Graduated / Alumni</span>
            <span className="text-lg font-bold text-indigo-800">{graduatedCount}</span>
            <span className="text-[10px] text-indigo-500 block">completed</span>
          </div>
        </div>
      </div>

      {/* Action Controls: End of Term & End of Academic Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* End of Term Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <Calendar className="w-4 h-4" />
              <span>1. Term Progression Control</span>
            </div>
            <h3 className="font-bold text-base text-slate-900">Advance to Next Academic Term</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transition the calendar to the next term (e.g., Term 1 Fall → Term 2 Spring). Optionally archives and clears coursework, evaluations, and assignments from the completed term while keeping student grade levels intact.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Current: <strong className="text-slate-800">{academicSettings.currentTerm}</strong>
            </span>
            <button
              onClick={() => setConfirmTermModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Advance Term</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* End of Academic Year Panel */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200/80 bg-gradient-to-br from-white to-rose-50/20 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4" />
              <span>2. Annual Student Promotion &amp; Reset</span>
            </div>
            <h3 className="font-bold text-base text-slate-900">Trigger End of Academic Year</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automates the year-end transition: 
              <br />
              • <strong>Automated Grade Promotion:</strong> All students advance to their next grade level (Grade 9 → 10, Grade 10 → 11, Grade 11 → 12, Grade 12 → Graduated).
              <br />
              • <strong>Full Data Cleanup:</strong> Clears previous year's coursework, submissions, and evaluations for a completely clean slate in the new school year.
            </p>
          </div>

          <div className="pt-4 border-t border-rose-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700">
              Active: <strong>{academicSettings.currentAcademicYear}</strong>
            </span>
            <button
              onClick={() => setConfirmYearModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Promote Students &amp; Reset</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Promotion & Transition Audit Trail History */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-sm text-slate-900">Academic Promotion &amp; Transition Audit History</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {academicSettings.promotionHistory?.length || 0} Events Logged
          </span>
        </div>

        {academicSettings.promotionHistory && academicSettings.promotionHistory.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {academicSettings.promotionHistory.map((rec) => (
              <div key={rec.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      rec.type === 'end_year' 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {rec.type === 'end_year' ? 'Annual Grade Promotion' : 'Term Advance'}
                    </span>
                    <span className="font-bold text-slate-900">
                      {rec.fromTermOrYear} → {rec.toTermOrYear}
                    </span>
                  </div>
                  <p className="text-slate-600">{rec.notes}</p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="font-semibold text-slate-700 block">{rec.date}</span>
                  <span className="text-[11px] text-slate-400">
                    {rec.promotedCount > 0 ? `${rec.promotedCount} Students Promoted • ` : ''}
                    {rec.clearedItemsCount} Items Cleared
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400 space-y-1">
            <Clock className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-700">No promotion history recorded yet.</p>
            <p className="text-[11px] text-slate-400">When you trigger end of term or academic year advancement, audit logs will be permanently preserved here.</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal: End of Term */}
      {confirmTermModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Advance Academic Term</h3>
              <button
                onClick={() => setConfirmTermModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You are about to advance the active term from <strong>{academicSettings.currentTerm}</strong> to the next scheduled term.
            </p>

            <label className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={clearTermDataOption}
                onChange={(e) => setClearTermDataOption(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">Archive &amp; Reset Term Coursework</span>
                <span className="text-slate-500 text-[11px]">
                  Automatically clear assignments, homework submissions, and evaluations from the completed term to provide a clean slate.
                </span>
              </div>
            </label>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmTermModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerTerm}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Confirm Term Advance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: End of Academic Year */}
      {confirmYearModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-rose-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-base">Confirm End of Academic Year</h3>
              </div>
              <button
                onClick={() => setConfirmYearModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1.5 leading-relaxed">
              <p className="font-bold">This is a major institutional action that will execute:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-700 text-[11px]">
                <li><strong>Advance all student grade levels:</strong> Grade 9 becomes Grade 10, Grade 10 becomes Grade 11, Grade 11 becomes Grade 12, and Grade 12 students transition to Graduated Alumni status.</li>
                <li><strong>Advance Academic Calendar:</strong> {academicSettings.currentAcademicYear} will transition to the next school year, starting fresh at Term 1.</li>
                <li><strong>Data Cleanup:</strong> All past year assignments, submissions, quizzes, and daily evaluations will be cleared to provide a fresh, clean slate.</li>
              </ul>
            </div>

            <p className="text-xs text-slate-500 italic">
              Faculty and administrator accounts remain untouched and will be ready for the new academic intake.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmYearModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleTriggerYear}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Promote Students &amp; Start New Year
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
