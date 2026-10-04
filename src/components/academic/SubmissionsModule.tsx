import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  CheckCircle, 
  Clock, 
  Award, 
  FileText, 
  HelpCircle, 
  User, 
  Search,
  ExternalLink
} from 'lucide-react';

export const SubmissionsModule: React.FC = () => {
  const { currentUser, submissions, quizSubmissions, assignments, gradeSubmission } = useData();

  if (!currentUser) return null;

  const isStudent = currentUser.role === 'student';
  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';

  const [activeTab, setActiveTab] = useState<'assignments' | 'quizzes'>('assignments');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter submissions
  const visibleSubmissions = isStudent
    ? submissions.filter(s => s.studentId === currentUser.id)
    : isTeacher
    ? submissions.filter(s => s.grade === currentUser.grade && s.section === currentUser.section)
    : submissions;

  const visibleQuizSubmissions = isStudent
    ? quizSubmissions.filter(qs => qs.studentId === currentUser.id)
    : isTeacher
    ? quizSubmissions.filter(qs => qs.grade === currentUser.grade && qs.section === currentUser.section)
    : quizSubmissions;

  // Grade modal
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(90);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  const handleGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubId) return;
    gradeSubmission(selectedSubId, Number(scoreInput), feedbackInput.trim() || undefined);
    setSelectedSubId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <CheckCircle className="w-4 h-4" />
            <span>Academic Performance &amp; Evaluation</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isStudent ? 'My Grades &amp; Submissions' : 'Submissions &amp; Evaluation Hub'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isStudent 
              ? 'View evaluated homework, feedback, and interactive quiz scores.'
              : 'Review coursework submitted by students in your assigned classes and record scores.'}
          </p>
        </div>

        {/* Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'assignments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Assignments ({visibleSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'quizzes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Quizzes ({visibleQuizSubmissions.length})
          </button>
        </div>
      </div>

      {activeTab === 'assignments' ? (
        /* ASSIGNMENTS SUBMISSIONS */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {visibleSubmissions.length > 0 ? (
            <>
              {/* Phone Card View */}
              <div className="block sm:hidden divide-y divide-slate-100">
                {visibleSubmissions.map((sub) => {
                  const asg = assignments.find(a => a.id === sub.assignmentId);
                  return (
                    <div key={sub.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-sm text-slate-900 leading-tight">
                            {sub.assignmentTitle}
                          </h4>
                          {!isStudent && (
                            <div className="text-xs text-slate-600 font-medium">
                              By <strong className="text-slate-900">{sub.studentName}</strong> ({sub.grade} • {sub.section})
                            </div>
                          )}
                          <div className="text-[11px] text-slate-400">
                            Submitted {new Date(sub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border shrink-0 ${
                          sub.status === 'graded'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {sub.status === 'graded' ? `${sub.score} / ${asg?.maxScore || 100} pts` : 'Pending'}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl text-xs space-y-1">
                        <p className="text-slate-700 italic">"{sub.content}"</p>
                        {sub.attachmentUrl && (
                          <a 
                            href={sub.attachmentUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-indigo-600 hover:underline text-[11px] inline-flex items-center gap-1 font-semibold pt-1"
                          >
                            <span>Open Attached Document / Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      {sub.feedback && (
                        <div className="text-xs p-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                          <span className="font-semibold text-indigo-800 block text-[11px]">Teacher Feedback:</span>
                          <p className="text-indigo-900 italic mt-0.5">"{sub.feedback}"</p>
                        </div>
                      )}

                      {!isStudent && (
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => {
                              setSelectedSubId(sub.id);
                              setScoreInput(sub.score || 90);
                              setFeedbackInput(sub.feedback || '');
                            }}
                            className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors text-center"
                          >
                            {sub.status === 'graded' ? 'Update Evaluation' : 'Evaluate & Grade'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      {!isStudent && <th className="py-3.5 px-4">Student</th>}
                      <th className="py-3.5 px-4">Assignment</th>
                      <th className="py-3.5 px-4">Submitted Date</th>
                      <th className="py-3.5 px-4">Status &amp; Score</th>
                      <th className="py-3.5 px-4">Feedback</th>
                      {!isStudent && <th className="py-3.5 px-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleSubmissions.map((sub) => {
                      const asg = assignments.find(a => a.id === sub.assignmentId);
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                          {!isStudent && (
                            <td className="py-3.5 px-4 font-semibold text-slate-900">
                              <div>{sub.studentName}</div>
                              <div className="text-[11px] text-slate-400 font-normal">{sub.grade} • {sub.section}</div>
                            </td>
                          )}
                          <td className="py-3.5 px-4 font-medium text-slate-800">
                            <div className="font-semibold text-slate-900">{sub.assignmentTitle}</div>
                            <div className="text-slate-500 line-clamp-1 italic max-w-xs">"{sub.content}"</div>
                            {sub.attachmentUrl && (
                              <a 
                                href={sub.attachmentUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-indigo-600 hover:underline text-[11px] inline-flex items-center gap-1 mt-0.5"
                              >
                                <span>Attached Resource</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">
                            {new Date(sub.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border inline-block ${
                              sub.status === 'graded'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {sub.status === 'graded' ? `${sub.score} / ${asg?.maxScore || 100} pts` : 'Pending Review'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 italic">
                            {sub.feedback ? `"${sub.feedback}"` : '—'}
                          </td>
                          {!isStudent && (
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedSubId(sub.id);
                                  setScoreInput(sub.score || 90);
                                  setFeedbackInput(sub.feedback || '');
                                }}
                                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200"
                              >
                                {sub.status === 'graded' ? 'Update Grade' : 'Grade'}
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700 text-xs">No assignment submissions recorded.</p>
            </div>
          )}
        </div>
      ) : (
        /* QUIZ SUBMISSIONS */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {visibleQuizSubmissions.length > 0 ? (
            <>
              {/* Phone Card View */}
              <div className="block sm:hidden divide-y divide-slate-100">
                {visibleQuizSubmissions.map((qs) => (
                  <div key={qs.id} className="p-4 space-y-2.5 hover:bg-slate-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">{qs.quizTitle}</h4>
                        {!isStudent && (
                          <div className="text-xs text-slate-600 font-medium mt-0.5">
                            By <strong className="text-slate-900">{qs.studentName}</strong>
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {qs.grade} • {qs.section} • {new Date(qs.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-sm text-indigo-700">
                          {qs.score} / {qs.maxScore} pts
                        </div>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold border inline-block mt-0.5 ${
                          qs.percentage >= 80 
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : qs.percentage >= 60
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}>
                          {qs.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      {!isStudent && <th className="py-3.5 px-4">Student</th>}
                      <th className="py-3.5 px-4">Quiz Title</th>
                      <th className="py-3.5 px-4">Class</th>
                      <th className="py-3.5 px-4">Date Completed</th>
                      <th className="py-3.5 px-4">Score</th>
                      <th className="py-3.5 px-4">Proficiency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visibleQuizSubmissions.map((qs) => (
                      <tr key={qs.id} className="hover:bg-slate-50/60 transition-colors">
                        {!isStudent && (
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {qs.studentName}
                          </td>
                        )}
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {qs.quizTitle}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {qs.grade} • {qs.section}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(qs.submittedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {qs.score} / {qs.maxScore} pts
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold border ${
                            qs.percentage >= 80 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : qs.percentage >= 60
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-rose-50 text-rose-800 border-rose-200'
                          }`}>
                            {qs.percentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
              <p className="font-semibold text-slate-700 text-xs">No quiz results logged yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Grade Modal for Teacher */}
      {selectedSubId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Evaluate Submission</h3>
              <button
                onClick={() => setSelectedSubId(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGrade} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Score</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  required
                  value={scoreInput}
                  onChange={(e) => setScoreInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teacher Feedback (Optional)</label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Enter constructive remarks for the student..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSubId(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
