import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Quiz, QuizQuestion, TargetClassItem } from '../../types';
import { GRADES, SECTIONS, SUBJECTS } from '../../lib/constants';
import { 
  HelpCircle, 
  Plus, 
  Clock, 
  Award, 
  CheckCircle, 
  Trash2, 
  Play, 
  Check, 
  X, 
  AlertCircle,
  CheckSquare,
  Square,
  Layers
} from 'lucide-react';

export const QuizzesModule: React.FC = () => {
  const { 
    currentUser, 
    quizzes, 
    quizSubmissions, 
    createQuiz, 
    deleteQuiz, 
    submitQuiz 
  } = useData();

  if (!currentUser) return null;

  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';
  const isStudent = currentUser.role === 'student';

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizSubject, setQuizSubject] = useState(currentUser.subject || SUBJECTS[0]);
  const [quizDueDate, setQuizDueDate] = useState('2026-10-30');

  // Targeted publishing state
  const [targetClassSelection, setTargetClassSelection] = useState<Record<string, string[]>>(() => {
    if (currentUser?.assignedClasses && currentUser.assignedClasses.length > 0) {
      const map: Record<string, string[]> = {};
      currentUser.assignedClasses.forEach(ac => {
        map[ac.grade] = [...ac.sections];
      });
      return map;
    }
    return { [currentUser?.grade || GRADES[0]]: [currentUser?.section || SECTIONS[0]] };
  });

  const toggleTargetSection = (gradeName: string, sectionName: string) => {
    setTargetClassSelection(prev => {
      const current = prev[gradeName] || [];
      const updated = current.includes(sectionName)
        ? current.filter(s => s !== sectionName)
        : [...current, sectionName];

      const copy = { ...prev };
      if (updated.length === 0) {
        delete copy[gradeName];
      } else {
        copy[gradeName] = updated;
      }
      return copy;
    });
  };
  
  // Quiz questions state
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'q1',
      question: 'What is the fundamental unit of electric charge?',
      options: ['Coulomb', 'Ampere', 'Volt', 'Ohm'],
      correctAnswerIndex: 0,
      points: 10,
    }
  ]);

  // Active quiz taking state for students
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number; maxScore: number; percentage: number } | null>(null);

  // Filter quizzes based on targeted cohorts
  const visibleQuizzes = isStudent
    ? quizzes.filter(q => {
        if (q.targetClasses && q.targetClasses.length > 0) {
          return q.targetClasses.some(tc => tc.grade === currentUser.grade && tc.section === currentUser.section);
        }
        return q.grade === currentUser.grade && (q.section === currentUser.section || q.section === 'All Sections');
      })
    : isTeacher
    ? quizzes.filter(q => {
        if (q.teacherId === currentUser.id) return true;
        if (currentUser.assignedClasses && currentUser.assignedClasses.length > 0) {
          return currentUser.assignedClasses.some(ac => 
            (q.targetClasses && q.targetClasses.some(tc => tc.grade === ac.grade && ac.sections.includes(tc.section))) ||
            (q.grade === ac.grade && ac.sections.includes(q.section))
          );
        }
        return q.grade === currentUser.grade && q.section === currentUser.section;
      })
    : quizzes;

  const handleAddQuestion = () => {
    const newQ: QuizQuestion = {
      id: `q_${Date.now()}`,
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      points: 10,
    };
    setQuestions(prev => [...prev, newQ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleQuestionTextChange = (idx: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, question: text } : q));
  };

  const handleOptionChange = (qIdx: number, optIdx: number, text: string) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i === qIdx) {
        const newOpts = [...q.options];
        newOpts[optIdx] = text;
        return { ...q, options: newOpts };
      }
      return q;
    }));
  };

  const handleSetCorrectIndex = (qIdx: number, optIdx: number) => {
    setQuestions(prev => prev.map((q, i) => i === qIdx ? { ...q, correctAnswerIndex: optIdx } : q));
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || questions.length === 0) return;

    // Validate that questions have text and options
    for (const q of questions) {
      if (!q.question.trim()) {
        alert('Please fill in the question text for all questions.');
        return;
      }
      for (const opt of q.options) {
        if (!opt.trim()) {
          alert('Please fill in all 4 option choices for each question.');
          return;
        }
      }
    }

    const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);

    // Build targetClasses array
    const targetClasses: TargetClassItem[] = [];
    Object.entries(targetClassSelection).forEach(([gradeName, sections]) => {
      sections.forEach(sec => {
        targetClasses.push({ grade: gradeName, section: sec });
      });
    });

    if (targetClasses.length === 0) {
      alert('Please select at least one target Grade and Section for this quiz.');
      return;
    }

    const primaryGrade = targetClasses[0].grade;
    const primarySection = targetClasses[0].section;

    createQuiz({
      title: quizTitle.trim(),
      description: quizDesc.trim() || 'Interactive multiple choice assessment.',
      subject: quizSubject,
      grade: primaryGrade,
      section: primarySection,
      targetClasses,
      questions,
      totalPoints,
      dueDate: quizDueDate,
    });

    setQuizTitle('');
    setQuizDesc('');
    setShowCreateModal(false);
  };

  const handleStartQuiz = (q: Quiz) => {
    setActiveQuiz(q);
    setStudentAnswers({});
    setQuizResult(null);
  };

  const handleSelectAnswer = (qId: string, optIndex: number) => {
    setStudentAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmitQuiz = () => {
    if (!activeQuiz) return;
    const res = submitQuiz(activeQuiz.id, studentAnswers);
    setQuizResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Formative Assessments &amp; Quizzes</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isStudent ? 'Interactive Class Quizzes' : 'Quizzes Management Hub'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isStudent
              ? `Available assessments for: ${currentUser.grade} • ${currentUser.section}`
              : 'Draft interactive multiple choice quizzes targeted by grade and section.'}
          </p>
        </div>

        {(isTeacher || isAdmin) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Quiz</span>
          </button>
        )}
      </div>

      {/* Quizzes List */}
      {visibleQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleQuizzes.map((quiz) => {
            const myQuizSubmission = quizSubmissions.find(qs => qs.quizId === quiz.id && qs.studentId === currentUser.id);
            const totalSubmissions = quizSubmissions.filter(qs => qs.quizId === quiz.id);

            return (
              <div
                key={quiz.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                      {quiz.subject}
                    </span>
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due {quiz.dueDate}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug">{quiz.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{quiz.description}</p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 font-medium">
                    {quiz.targetClasses && quiz.targetClasses.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {quiz.targetClasses.map((tc, idx) => (
                          <span key={`${tc.grade}_${tc.section}_${idx}`} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                            {tc.grade} • {tc.section}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span>{quiz.grade} ({quiz.section})</span>
                    )}
                    <span>•</span>
                    <span>{quiz.questions.length} Questions</span>
                    <span>•</span>
                    <span>{quiz.totalPoints} Points</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    By: <strong className="text-slate-700">{quiz.teacherName}</strong>
                  </span>

                  {/* Student Action */}
                  {isStudent && (
                    myQuizSubmission ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        Score: {myQuizSubmission.score} / {myQuizSubmission.maxScore} ({myQuizSubmission.percentage}%)
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStartQuiz(quiz)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Take Quiz</span>
                      </button>
                    )
                  )}

                  {/* Teacher/Admin Stats */}
                  {(isTeacher || isAdmin) && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">
                        {totalSubmissions.length} Completed
                      </span>
                      <button
                        onClick={() => deleteQuiz(quiz.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-3">
          <HelpCircle className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-sm">No Quizzes Available</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isStudent
              ? `There are currently no quizzes scheduled for ${currentUser.grade} (${currentUser.section}).`
              : 'No quizzes have been created yet. Click "Create New Quiz" above to set up interactive questions.'}
          </p>
        </div>
      )}

      {/* Interactive Quiz Player Modal for Student */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{activeQuiz.title}</h3>
                <p className="text-xs text-slate-500">{activeQuiz.subject} • {activeQuiz.totalPoints} Total Points</p>
              </div>
              <button
                onClick={() => setActiveQuiz(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {quizResult ? (
              /* Quiz Result Display */
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Quiz Completed!</h4>
                  <p className="text-xs text-slate-500 mt-1">Your responses have been evaluated and recorded.</p>
                </div>
                <div className="inline-block p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Your Final Score</span>
                  <div className="text-3xl font-extrabold text-indigo-700 mt-1">
                    {quizResult.score} / {quizResult.maxScore}
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 block mt-1">
                    {quizResult.percentage}% Proficiency
                  </span>
                </div>
                <button
                  onClick={() => setActiveQuiz(null)}
                  className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm block mx-auto"
                >
                  Return to Quizzes
                </button>
              </div>
            ) : (
              /* Questions Form */
              <div className="space-y-6">
                {activeQuiz.questions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-900">
                        {qIndex + 1}. {q.question}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {q.points} pts
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt, optIndex) => {
                        const isSelected = studentAnswers[q.id] === optIndex;
                        return (
                          <button
                            key={optIndex}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, optIndex)}
                            className={`p-3 text-left rounded-xl text-xs font-medium border transition-all flex items-center justify-between ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-semibold'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                            }`}
                          >
                            <span>{opt}</span>
                            {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Answered {Object.keys(studentAnswers).length} of {activeQuiz.questions.length} questions
                  </span>
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(studentAnswers).length < activeQuiz.questions.length}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    Submit Answers
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Teacher Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Create Interactive Quiz</h3>
                <p className="text-xs text-slate-500">Draft questions and assign to a specific grade and section.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuiz} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quiz Title</label>
                <input
                  type="text"
                  required
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g. Unit 3 Formative Quiz: Kinematics & Vectors"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={quizSubject}
                  onChange={(e) => setQuizSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                >
                  {SUBJECTS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Targeted Publishing: Multi-Grade & Multi-Section Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <label className="block text-xs font-semibold text-slate-800">
                      Target Specific Grade(s) &amp; Section(s)
                    </label>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">Choose target cohorts</span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  {GRADES.map(g => {
                    const assignedSections = targetClassSelection[g] || [];
                    const allSelected = SECTIONS.every(s => assignedSections.includes(s));

                    return (
                      <div key={g} className="p-2 bg-white rounded-lg border border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{g}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (allSelected) {
                                setTargetClassSelection(prev => {
                                  const copy = { ...prev };
                                  delete copy[g];
                                  return copy;
                                });
                              } else {
                                setTargetClassSelection(prev => ({
                                  ...prev,
                                  [g]: [...SECTIONS]
                                }));
                              }
                            }}
                            className="text-[10px] text-indigo-600 font-semibold hover:underline"
                          >
                            {allSelected ? 'Deselect All' : 'Select All Sections'}
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {SECTIONS.map(s => {
                            const isChecked = assignedSections.includes(s);
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => toggleTargetSection(g, s)}
                                className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-all ${
                                  isChecked
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold shadow-2xs'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {isChecked ? (
                                  <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
                                ) : (
                                  <Square className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span>{s}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={quizDueDate}
                    onChange={(e) => setQuizDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={quizDesc}
                    onChange={(e) => setQuizDesc(e.target.value)}
                    placeholder="Brief guidance for scholars..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {/* Dynamic Questions Builder */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-900">Questions ({questions.length})</span>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {questions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-xs text-slate-700">Question {qIndex + 1}</span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIndex)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      value={q.question}
                      onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                      placeholder="Type the question text here..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                        Options (Click circle to select the correct answer):
                      </span>
                      <div className="space-y-1.5">
                        {q.options.map((opt, optIndex) => {
                          const isCorrect = q.correctAnswerIndex === optIndex;
                          return (
                            <div key={optIndex} className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSetCorrectIndex(qIndex, optIndex)}
                                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                  isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                                }`}
                                title="Mark as correct answer"
                              >
                                {isCorrect && <Check className="w-3 h-3 text-white" />}
                              </button>
                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                                placeholder={`Option ${optIndex + 1}`}
                                className={`flex-1 px-3 py-1.5 bg-white border rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                  isCorrect ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'
                                }`}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Publish Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
