import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { DailyEvaluation, AppUser } from '../../types';
import { GRADES, SECTIONS, SUBJECTS } from '../../lib/constants';
import { 
  Award, 
  Calendar, 
  CheckCircle, 
  User, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Star, 
  ShieldCheck, 
  BookOpen, 
  Smile, 
  Filter,
  Check
} from 'lucide-react';

export const DailyEvaluationsModule: React.FC = () => {
  const { currentUser, users, dailyEvaluations, logDailyEvaluation, deleteDailyEvaluation } = useData();

  if (!currentUser) return null;

  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';
  const isStudent = currentUser.role === 'student';

  // Teacher filters
  const [selectedGrade, setSelectedGrade] = useState<string>(currentUser.grade || GRADES[0]);
  const [selectedSection, setSelectedSection] = useState<string>(currentUser.section || SECTIONS[0]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form modal state for logging evaluation
  const [showLogModal, setShowLogModal] = useState(false);
  const [targetStudentId, setTargetStudentId] = useState<string>('');
  const [behaviorScore, setBehaviorScore] = useState<number>(95);
  const [participationScore, setParticipationScore] = useState<number>(90);
  const [assignmentScore, setAssignmentScore] = useState<number>(88);
  const [evalSubject, setEvalSubject] = useState<string>(currentUser.subject || SUBJECTS[0]);
  const [evalRemarks, setEvalRemarks] = useState<string>('');

  // Available students in the selected class
  const classStudents = users.filter(
    u => u.role === 'student' && u.grade === selectedGrade && u.section === selectedSection
  );

  // Filtered evaluations list
  const visibleEvaluations = isStudent
    ? dailyEvaluations.filter(e => e.studentId === currentUser.id)
    : isTeacher
    ? dailyEvaluations.filter(e => e.grade === selectedGrade && e.section === selectedSection)
    : dailyEvaluations;

  // Student specific stats
  const studentAverage = isStudent && visibleEvaluations.length > 0
    ? Math.round(visibleEvaluations.reduce((acc, e) => acc + e.overallScore, 0) / visibleEvaluations.length)
    : null;

  const studentBehaviorAvg = isStudent && visibleEvaluations.length > 0
    ? Math.round(visibleEvaluations.reduce((acc, e) => acc + e.behaviorScore, 0) / visibleEvaluations.length)
    : null;

  const studentParticipationAvg = isStudent && visibleEvaluations.length > 0
    ? Math.round(visibleEvaluations.reduce((acc, e) => acc + e.participationScore, 0) / visibleEvaluations.length)
    : null;

  const studentAssignmentAvg = isStudent && visibleEvaluations.length > 0
    ? Math.round(visibleEvaluations.reduce((acc, e) => acc + e.assignmentScore, 0) / visibleEvaluations.length)
    : null;

  const handleOpenLogModal = (student?: AppUser) => {
    if (student) {
      setTargetStudentId(student.id);
    } else if (classStudents.length > 0) {
      setTargetStudentId(classStudents[0].id);
    }
    setBehaviorScore(95);
    setParticipationScore(90);
    setAssignmentScore(88);
    setEvalRemarks('');
    setShowLogModal(true);
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStudentId) {
      alert('Please select a student.');
      return;
    }

    const student = users.find(u => u.id === targetStudentId);
    if (!student) return;

    logDailyEvaluation({
      studentId: student.id,
      studentName: student.name,
      grade: student.grade || selectedGrade,
      section: student.section || selectedSection,
      subject: evalSubject,
      date: selectedDate,
      behaviorScore: Number(behaviorScore),
      participationScore: Number(participationScore),
      assignmentScore: Number(assignmentScore),
      remarks: evalRemarks.trim() || undefined,
    });

    setShowLogModal(false);
    setEvalRemarks('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Continuous Academic Assessment</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isStudent ? 'My Daily Grades & Evaluations' : 'Daily Evaluation & Continuous Grading'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {isStudent
              ? 'Real-time performance scores across Behavior, Participation, and Homework assigned by your teachers.'
              : 'Log continuous assessment scores across Behavior, Classroom Participation, and Assignments for students in your assigned classes.'}
          </p>
        </div>

        {(isTeacher || isAdmin) && (
          <button
            onClick={() => handleOpenLogModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Log Daily Evaluation</span>
          </button>
        )}
      </div>

      {/* Student View Summary Cards */}
      {isStudent && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Overall Average</span>
            <div className="text-2xl font-extrabold text-indigo-700 mt-1">
              {studentAverage !== null ? `${studentAverage}%` : 'N/A'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Continuous composite</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Behavior</span>
            <div className="text-2xl font-extrabold text-emerald-700 mt-1">
              {studentBehaviorAvg !== null ? `${studentBehaviorAvg}%` : 'N/A'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Conduct &amp; Respect</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider block">Participation</span>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">
              {studentParticipationAvg !== null ? `${studentParticipationAvg}%` : 'N/A'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Engagement &amp; Inquiry</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">Assignments</span>
            <div className="text-2xl font-extrabold text-blue-700 mt-1">
              {studentAssignmentAvg !== null ? `${studentAssignmentAvg}%` : 'N/A'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">Daily coursework score</p>
          </div>
        </div>
      )}

      {/* Teacher Filters & Class Selector */}
      {(isTeacher || isAdmin) && (
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>Target Class:</span>
            </span>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white"
            >
              {GRADES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white"
            >
              {SECTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white"
            />
          </div>

          <span className="text-xs text-slate-400 font-medium">
            {classStudents.length} Students Enrolled in {selectedGrade} ({selectedSection})
          </span>

          {currentUser.assignedClasses && currentUser.assignedClasses.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 w-full pt-2 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500">My Assigned Classes:</span>
              {currentUser.assignedClasses.map(ac => 
                ac.sections.map(sec => {
                  const isSelected = selectedGrade === ac.grade && selectedSection === sec;
                  return (
                    <button
                      key={`${ac.grade}_${sec}`}
                      type="button"
                      onClick={() => {
                        setSelectedGrade(ac.grade);
                        setSelectedSection(sec);
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                        isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ac.grade} ({sec})
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Evaluations List / Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            {isStudent ? 'Logged Daily Evaluation Records' : `Daily Evaluations for ${selectedGrade} - ${selectedSection}`}
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {visibleEvaluations.length} Records
          </span>
        </div>

        {visibleEvaluations.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {visibleEvaluations.map((evalItem) => (
              <div key={evalItem.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {evalItem.studentName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{evalItem.studentName}</span>
                        <span className="text-xs font-semibold px-2 py-0.2 rounded bg-slate-100 text-slate-700">
                          {evalItem.subject}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {evalItem.grade} • {evalItem.section} • Date: {evalItem.date} • Logged by: {evalItem.teacherName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Composite</span>
                      <span className={`text-base font-extrabold ${
                        evalItem.overallScore >= 90 ? 'text-emerald-700' :
                        evalItem.overallScore >= 75 ? 'text-indigo-700' : 'text-amber-700'
                      }`}>
                        {evalItem.overallScore}%
                      </span>
                    </div>

                    {(isTeacher || isAdmin) && (
                      <button
                        onClick={() => deleteDailyEvaluation(evalItem.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete Evaluation Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2.5 bg-emerald-50/60 border border-emerald-100 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Behavior</span>
                    <span className="text-sm font-extrabold text-emerald-700">{evalItem.behaviorScore}%</span>
                  </div>

                  <div className="p-2.5 bg-amber-50/60 border border-amber-100 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Participation</span>
                    <span className="text-sm font-extrabold text-amber-700">{evalItem.participationScore}%</span>
                  </div>

                  <div className="p-2.5 bg-blue-50/60 border border-blue-100 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-blue-800 uppercase block">Assignments</span>
                    <span className="text-sm font-extrabold text-blue-700">{evalItem.assignmentScore}%</span>
                  </div>
                </div>

                {/* Teacher Observations / Remarks */}
                {evalItem.remarks && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
                    <span className="font-semibold text-slate-700 text-[11px] block">Teacher Notes &amp; Observations:</span>
                    <p className="text-slate-600 italic mt-0.5">"{evalItem.remarks}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Award className="w-10 h-10 mx-auto text-slate-300" />
            <h4 className="font-semibold text-slate-700 text-xs">No Daily Evaluations Logged</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              {isStudent
                ? 'Your teachers have not recorded daily performance scores yet for this period.'
                : 'Click "Log Daily Evaluation" above to grade student behavior, participation, and daily work.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal to Log Evaluation */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Daily Evaluation</h3>
                <p className="text-xs text-slate-500">Continuous scoring for {selectedGrade} ({selectedSection})</p>
              </div>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student</label>
                <select
                  value={targetStudentId}
                  onChange={(e) => setTargetStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {classStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.username})</option>
                  ))}
                  {classStudents.length === 0 && (
                    <option value="">No students in {selectedGrade} - {selectedSection}</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                  <select
                    value={evalSubject}
                    onChange={(e) => setEvalSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                  >
                    {SUBJECTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Evaluation Date</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Specific Category Scores */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800 block">Category Performance Scores (0 - 100)</span>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-emerald-800">Behavior &amp; Demeanor</span>
                    <span className="font-bold text-emerald-700">{behaviorScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={behaviorScore}
                    onChange={(e) => setBehaviorScore(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-amber-800">Classroom Participation</span>
                    <span className="font-bold text-amber-700">{participationScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={participationScore}
                    onChange={(e) => setParticipationScore(Number(e.target.value))}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-blue-800">Assignments &amp; Daily Homework</span>
                    <span className="font-bold text-blue-700">{assignmentScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={assignmentScore}
                    onChange={(e) => setAssignmentScore(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Calculated Overall Average:</span>
                  <span className="font-extrabold text-indigo-700 text-sm">
                    {Math.round((behaviorScore + participationScore + assignmentScore) / 3)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teacher Remarks &amp; Feedback</label>
                <textarea
                  rows={2}
                  value={evalRemarks}
                  onChange={(e) => setEvalRemarks(e.target.value)}
                  placeholder="e.g. Excellent active questioning during lab, attentive behavior..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={classStudents.length === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Post Continuous Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
