import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { DisciplinaryNotice, AppUser } from '../../types';
import { 
  ShieldAlert, 
  Plus, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Trash2, 
  FileText, 
  Search, 
  Filter, 
  Loader2, 
  X,
  User,
  GraduationCap,
  ShieldCheck,
  Check
} from 'lucide-react';

export const AdminDisciplinaryModule: React.FC = () => {
  const { 
    currentUser, 
    users, 
    disciplinaryNotices, 
    issueDisciplinaryNotice, 
    acknowledgeDisciplinaryNotice, 
    resolveDisciplinaryNotice, 
    deleteDisciplinaryNotice 
  } = useData();

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';
  const isStudent = currentUser.role === 'student';

  // Filters
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal for Admin to create
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [noticeType, setNoticeType] = useState<'warning' | 'suspension' | 'expulsion'>('warning');
  const [duration, setDuration] = useState<string>('Notice on Permanent File');
  const [reason, setReason] = useState<string>('');
  const [generatedLetter, setGeneratedLetter] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Modal to view full letter
  const [viewingNotice, setViewingNotice] = useState<DisciplinaryNotice | null>(null);

  // Student accounts available
  const studentList = users.filter(u => u.role === 'student');

  const selectedStudent = studentList.find(s => s.id === selectedStudentId) || studentList[0];

  // AI Generator Function
  const handleGenerateAiNotice = async () => {
    if (!selectedStudent) {
      alert('Please select a student first.');
      return;
    }
    if (!reason.trim()) {
      alert('Please describe the infraction or incident reason so Gemini AI can draft the formal letter.');
      return;
    }

    setIsGeneratingAi(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/disciplinary-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: selectedStudent.name,
          studentGrade: selectedStudent.grade || 'High School',
          studentSection: selectedStudent.section || 'General',
          noticeType,
          duration: duration.trim() || 'Notice on Record',
          reason: reason.trim(),
          issuedBy: currentUser.name || 'Prime Super Administrator',
        }),
      });

      const data = await res.json();
      if (data.formalLetter) {
        setGeneratedLetter(data.formalLetter);
      } else {
        throw new Error(data.error || 'Failed to generate disciplinary letter');
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || 'Error communicating with AI service. You can type the formal notice manually.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleIssueNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!reason.trim()) {
      alert('Please provide the incident reason.');
      return;
    }

    const finalLetter = generatedLetter.trim() || `PRIME ACADEMIC INSTITUTION • OFFICIAL DISCIPLINARY NOTICE\n\nStudent: ${selectedStudent.name} (${selectedStudent.grade} - ${selectedStudent.section})\nNotice Type: ${noticeType.toUpperCase()}\nDuration: ${duration}\n\nReason: ${reason}\n\nIssued by: ${currentUser.name}\nDate: ${new Date().toLocaleDateString()}`;

    issueDisciplinaryNotice({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentGrade: selectedStudent.grade || 'Enrolled',
      studentSection: selectedStudent.section || 'General',
      noticeType,
      reason: reason.trim(),
      duration: duration.trim() || 'Notice on Record',
      formalLetter: finalLetter,
    });

    setReason('');
    setGeneratedLetter('');
    setShowIssueModal(false);
  };

  const visibleNotices = disciplinaryNotices.filter(n => {
    if (isStudent && n.studentId !== currentUser.id) return false;
    const matchesType = filterType === 'all' || n.noticeType === filterType;
    const matchesSearch = n.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.reason.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Administrative Governance &amp; Conduct</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isStudent ? 'Disciplinary Records & Official Notices' : 'AI-Powered Disciplinary Management'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {isStudent 
              ? 'Official behavioral notices, warning letters, or expulsion determinations issued by the Administration.'
              : 'Issue official student Warnings, Suspensions, and Expulsion Notices structured automatically with Gemini 3.8 Flash.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => {
              if (studentList.length > 0 && !selectedStudentId) {
                setSelectedStudentId(studentList[0].id);
              }
              setShowIssueModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Disciplinary Notice</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or cited infraction..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'warning', 'suspension', 'expulsion'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all border ${
                filterType === t
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      {visibleNotices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleNotices.map((notice) => {
            const isWarning = notice.noticeType === 'warning';
            const isSuspension = notice.noticeType === 'suspension';
            const isExpulsion = notice.noticeType === 'expulsion';

            return (
              <div 
                key={notice.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                  isExpulsion
                    ? 'bg-rose-50/60 border-rose-300 shadow-sm'
                    : isSuspension
                    ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                    : 'bg-white border-slate-200/80 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                        isExpulsion 
                          ? 'bg-rose-600 text-white shadow-2xs' 
                          : isSuspension 
                          ? 'bg-amber-600 text-white shadow-2xs' 
                          : 'bg-slate-800 text-white'
                      }`}>
                        {notice.noticeType} Notice
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        notice.status === 'resolved' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : notice.status === 'acknowledged'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                      }`}>
                        {notice.status.toUpperCase()}
                      </span>
                    </div>

                    <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(notice.issuedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-slate-600" />
                      <span>{notice.studentName}</span>
                      <span className="text-xs font-normal text-slate-500">
                        ({notice.studentGrade} • {notice.studentSection})
                      </span>
                    </h3>

                    <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 pt-1">
                      <AlertTriangle className={`w-3.5 h-3.5 ${isExpulsion ? 'text-rose-600' : 'text-amber-600'}`} />
                      <span>Duration / Mandate: {notice.duration || 'Notice on Record'}</span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white/70 p-3 rounded-xl border border-slate-200/60 line-clamp-3">
                      <strong>Cited Reason:</strong> {notice.reason}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setViewingNotice(notice)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Official Legal Letter</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Student Acknowledge Action */}
                    {isStudent && notice.status === 'active' && (
                      <button
                        onClick={() => acknowledgeDisciplinaryNotice(notice.id)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                      >
                        Acknowledge Receipt
                      </button>
                    )}

                    {/* Admin Actions */}
                    {isAdmin && (
                      <>
                        {notice.status !== 'resolved' && (
                          <button
                            onClick={() => resolveDisciplinaryNotice(notice.id)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors"
                            title="Mark Infraction Resolved"
                          >
                            Mark Resolved
                          </button>
                        )}
                        <button
                          onClick={() => deleteDisciplinaryNotice(notice.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-3">
          <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500" />
          <h3 className="font-bold text-slate-700 text-sm">No Disciplinary Notices on Record</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isStudent 
              ? 'Your behavioral record is in good standing with zero disciplinary citations.'
              : 'There are currently no active student warning or expulsion notices on record.'}
          </p>
        </div>
      )}

      {/* Admin Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Issue Official Disciplinary Notice</h3>
                  <p className="text-xs text-slate-500">Gemini AI will structure an institutional legal notice based on your parameters.</p>
                </div>
              </div>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueNotice} className="space-y-4">
              {/* Target Student Select */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                  >
                    {studentList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.grade} - {s.section})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Classification</label>
                  <select
                    value={noticeType}
                    onChange={(e) => setNoticeType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                  >
                    <option value="warning">Official Written Warning</option>
                    <option value="suspension">Notice of Behavioral Suspension</option>
                    <option value="expulsion">Permanent Expulsion Determination</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Disciplinary Duration / Terms
                </label>
                <input
                  type="text"
                  required
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g. 5 Academic Days, 1 Semester, Notice on Permanent Record"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cited Infraction Facts &amp; Description
                </label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe the incident, date, violated institutional policy, or repeated conduct violations..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* AI Generator Button */}
              <div className="p-3 bg-gradient-to-r from-rose-50 to-indigo-50 border border-rose-200/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="text-xs font-medium text-slate-800">
                    Use Gemini 3.8 Flash to structure formal institutional letterhead notice
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isGeneratingAi || !reason.trim()}
                  onClick={handleGenerateAiNotice}
                  className="flex items-center justify-center gap-2 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs shrink-0 transition-all"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Drafting Notice...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Generate with Gemini AI</span>
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{aiError}</span>
                </div>
              )}

              {/* Formal Letter Preview / Edit Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Formal Letterhead Notice (Review &amp; Customize)
                </label>
                <textarea
                  rows={8}
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  placeholder="Click 'Generate with Gemini AI' above or draft your custom disciplinary letterhead here..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Issue &amp; Dispatch Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Notice Full Letter Modal */}
      {viewingNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Official Administrative Record</h3>
                  <p className="text-xs text-slate-500">Office of Institutional Compliance • Prime LMS</p>
                </div>
              </div>
              <button
                onClick={() => setViewingNotice(null)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Letterhead Container */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 font-sans space-y-4">
              <div className="text-center pb-4 border-b border-slate-200 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Prime Academic Institution • Disciplinary Tribunal
                </div>
                <div className="text-base font-black text-slate-900 uppercase">
                  {viewingNotice.noticeType === 'expulsion'
                    ? 'Formal Notice of Expulsion & Disciplinary Determination'
                    : viewingNotice.noticeType === 'suspension'
                    ? 'Notice of Formal Suspension & Behavioral Intervention'
                    : 'Official Written Disciplinary Warning'}
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Ref ID: {viewingNotice.id} • Issued: {new Date(viewingNotice.issuedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Formatted Content */}
              <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-mono bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                {viewingNotice.formalLetter}
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <div>
                  <span>Issued By: </span>
                  <strong className="text-slate-800">{viewingNotice.issuedBy}</strong>
                </div>
                <div>
                  <span>Status: </span>
                  <strong className="text-indigo-700 capitalize">{viewingNotice.status}</strong>
                  {viewingNotice.acknowledgedAt && (
                    <span className="text-[11px] text-slate-400 ml-1">
                      (Acknowledged: {new Date(viewingNotice.acknowledgedAt).toLocaleDateString()})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              {isStudent && viewingNotice.status === 'active' && (
                <button
                  onClick={() => {
                    acknowledgeDisciplinaryNotice(viewingNotice.id);
                    setViewingNotice(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  I Acknowledge Receipt of this Notice
                </button>
              )}
              <button
                onClick={() => setViewingNotice(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
