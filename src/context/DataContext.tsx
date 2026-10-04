import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  AppUser, 
  UserRole, 
  Assignment, 
  Quiz, 
  Submission, 
  QuizSubmission, 
  Announcement, 
  AiInteraction, 
  Message,
  DailyEvaluation,
  DisciplinaryNotice,
  AcademicSettings,
  PromotionRecord,
  TeacherClassAssignment,
  TargetClassItem
} from '../types';
import { MASTER_ADMIN_USER, MASTER_ADMIN_USERNAME, MASTER_ADMIN_PASSWORD, GRADES } from '../lib/constants';

interface DataContextType {
  currentUser: AppUser | null;
  users: AppUser[];
  assignments: Assignment[];
  quizzes: Quiz[];
  submissions: Submission[];
  quizSubmissions: QuizSubmission[];
  announcements: Announcement[];
  aiInteractions: AiInteraction[];
  messages: Message[];
  dailyEvaluations: DailyEvaluation[];
  disciplinaryNotices: DisciplinaryNotice[];
  academicSettings: AcademicSettings;
  isSummerBreakActive: boolean;
  setIsSummerBreakActive: React.Dispatch<React.SetStateAction<boolean>>;

  // Auth
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;

  // Admin User Management
  createUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  deleteUser: (userId: string) => void;
  updateUser: (userId: string, data: Partial<AppUser>) => void;

  // Academic Term & Year Promotion (Admin Exclusive)
  advanceTerm: (clearOldTermData?: boolean) => { success: boolean; message: string };
  advanceAcademicYear: () => { success: boolean; promotedCount: number; message: string };

  // Teacher & Student Work
  createAssignment: (data: Omit<Assignment, 'id' | 'createdAt' | 'teacherId' | 'teacherName'>) => void;
  deleteAssignment: (assignmentId: string) => void;
  createQuiz: (data: Omit<Quiz, 'id' | 'createdAt' | 'teacherId' | 'teacherName'>) => void;
  deleteQuiz: (quizId: string) => void;

  // Daily Evaluations (Continuous grading by category)
  logDailyEvaluation: (data: Omit<DailyEvaluation, 'id' | 'createdAt' | 'teacherId' | 'teacherName'>) => void;
  deleteDailyEvaluation: (id: string) => void;

  // Administrative Disciplinary System
  issueDisciplinaryNotice: (data: Omit<DisciplinaryNotice, 'id' | 'issuedAt' | 'issuedBy' | 'status'>) => void;
  acknowledgeDisciplinaryNotice: (id: string) => void;
  resolveDisciplinaryNotice: (id: string) => void;
  deleteDisciplinaryNotice: (id: string) => void;

  // Submissions & Grading
  submitAssignment: (assignmentId: string, content: string, attachmentUrl?: string, imageUrl?: string) => void;
  gradeSubmission: (submissionId: string, score: number, feedback?: string) => void;
  submitQuiz: (quizId: string, answers: Record<string, number>) => { score: number; maxScore: number; percentage: number };

  // AI Chat Logging & Monitoring for Admin
  logAiInteraction: (prompt: string, response: string, subject?: string) => void;
  deleteAiInteraction: (id: string) => void;
  clearAiInteractions: () => void;

  // Messaging with image attachments
  sendMessage: (recipientId: string, recipientName: string, content: string, imageUrl?: string) => void;

  // Announcements
  postAnnouncement: (data: Omit<Announcement, 'id' | 'createdAt' | 'authorName'>) => void;
  deleteAnnouncement: (announcementId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current logged in user
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('prime_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Admin-registered accounts (Starts empty)
  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('prime_users');
    return saved ? JSON.parse(saved) : [];
  });

  // Academic Settings (Year & Term)
  const [academicSettings, setAcademicSettings] = useState<AcademicSettings>(() => {
    const saved = localStorage.getItem('prime_academic_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      currentAcademicYear: '2026-2027',
      currentTerm: 'Term 1 (Fall)',
      promotionHistory: [],
    };
  });

  // Summer Break Mode: Automatic during July & August, or toggleable
  const [isSummerBreakActive, setIsSummerBreakActive] = useState<boolean>(() => {
    const currentMonth = new Date().getMonth();
    const isAutoSummer = currentMonth === 6 || currentMonth === 7;
    const saved = localStorage.getItem('prime_summer_mode');
    return saved !== null ? saved === 'true' : isAutoSummer;
  });

  // Assignments (Starts empty)
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('prime_assignments');
    return saved ? JSON.parse(saved) : [];
  });

  // Quizzes (Starts empty)
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('prime_quizzes');
    return saved ? JSON.parse(saved) : [];
  });

  // Submissions (Starts empty)
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('prime_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  // Quiz Submissions (Starts empty)
  const [quizSubmissions, setQuizSubmissions] = useState<QuizSubmission[]>(() => {
    const saved = localStorage.getItem('prime_quiz_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  // Daily Evaluations (Behavior, Participation, Assignments)
  const [dailyEvaluations, setDailyEvaluations] = useState<DailyEvaluation[]>(() => {
    const saved = localStorage.getItem('prime_daily_evaluations');
    return saved ? JSON.parse(saved) : [];
  });

  // Administrative Disciplinary Notices (Warnings, Suspensions, Expulsions)
  const [disciplinaryNotices, setDisciplinaryNotices] = useState<DisciplinaryNotice[]>(() => {
    const saved = localStorage.getItem('prime_disciplinary_notices');
    return saved ? JSON.parse(saved) : [];
  });

  // Announcements (Starts empty)
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('prime_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  // AI Interactions for Admin Monitoring
  const [aiInteractions, setAiInteractions] = useState<AiInteraction[]>(() => {
    const saved = localStorage.getItem('prime_ai_interactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Messages between users with image support
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('prime_messages');
    return saved ? JSON.parse(saved) : [];
  });

  // Persistence
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('prime_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('prime_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('prime_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('prime_academic_settings', JSON.stringify(academicSettings));
  }, [academicSettings]);

  useEffect(() => {
    localStorage.setItem('prime_summer_mode', String(isSummerBreakActive));
  }, [isSummerBreakActive]);

  useEffect(() => {
    localStorage.setItem('prime_assignments', JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem('prime_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('prime_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('prime_daily_evaluations', JSON.stringify(dailyEvaluations));
  }, [dailyEvaluations]);

  useEffect(() => {
    localStorage.setItem('prime_disciplinary_notices', JSON.stringify(disciplinaryNotices));
  }, [disciplinaryNotices]);

  useEffect(() => {
    localStorage.setItem('prime_quiz_submissions', JSON.stringify(quizSubmissions));
  }, [quizSubmissions]);

  useEffect(() => {
    localStorage.setItem('prime_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('prime_ai_interactions', JSON.stringify(aiInteractions));
  }, [aiInteractions]);

  useEffect(() => {
    localStorage.setItem('prime_messages', JSON.stringify(messages));
  }, [messages]);

  // Login handler
  const login = (username: string, pass: string): { success: boolean; error?: string } => {
    const cleanUser = username.trim().toLowerCase();

    // 1. Check Master Admin
    if (cleanUser === MASTER_ADMIN_USERNAME.toLowerCase() && pass === MASTER_ADMIN_PASSWORD) {
      setCurrentUser(MASTER_ADMIN_USER);
      return { success: true };
    }

    // 2. Check Admin-Created Users
    const foundUser = users.find(u => u.username.toLowerCase() === cleanUser);
    if (!foundUser) {
      return { success: false, error: 'Account not found. Please verify your username.' };
    }

    if (foundUser.password !== pass) {
      return { success: false, error: 'Incorrect password. Please contact the administrator if you forgot it.' };
    }

    setCurrentUser(foundUser);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  // Create User (Admin only)
  const createUser = (userData: Omit<AppUser, 'id' | 'createdAt'>): { success: boolean; error?: string } => {
    const cleanUser = userData.username.trim().toLowerCase();

    if (cleanUser === MASTER_ADMIN_USERNAME.toLowerCase()) {
      return { success: false, error: 'Username "admin" is reserved for the Master Admin.' };
    }

    const exists = users.some(u => u.username.toLowerCase() === cleanUser);
    if (exists) {
      return { success: false, error: `Username "${userData.username}" is already assigned to another user.` };
    }

    const newUser: AppUser = {
      ...userData,
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setUsers(prev => [newUser, ...prev]);
    return { success: true };
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const updateUser = (userId: string, data: Partial<AppUser>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
  };

  // Create Assignment (Teacher)
  const createAssignment = (data: Omit<Assignment, 'id' | 'createdAt' | 'teacherId' | 'teacherName'>) => {
    if (!currentUser) return;
    const newAssignment: Assignment = {
      ...data,
      id: `asg_${Date.now()}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAssignments(prev => [newAssignment, ...prev]);
  };

  const deleteAssignment = (assignmentId: string) => {
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
  };

  // Create Quiz (Teacher)
  const createQuiz = (data: Omit<Quiz, 'id' | 'createdAt' | 'teacherId' | 'teacherName'>) => {
    if (!currentUser) return;
    const newQuiz: Quiz = {
      ...data,
      id: `qz_${Date.now()}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setQuizzes(prev => [newQuiz, ...prev]);
  };

  const deleteQuiz = (quizId: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== quizId));
  };

  // Submit Assignment (Student with text and optional media/image upload)
  const submitAssignment = (
    assignmentId: string, 
    content: string, 
    attachmentUrl?: string, 
    imageUrl?: string
  ) => {
    if (!currentUser) return;
    const target = assignments.find(a => a.id === assignmentId);
    if (!target) return;

    const newSub: Submission = {
      id: `sub_${Date.now()}`,
      assignmentId,
      assignmentTitle: target.title,
      studentId: currentUser.id,
      studentName: currentUser.name,
      grade: currentUser.grade || target.grade,
      section: currentUser.section || target.section,
      content,
      attachmentUrl,
      imageUrl,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    setSubmissions(prev => [newSub, ...prev.filter(s => !(s.assignmentId === assignmentId && s.studentId === currentUser.id))]);
  };

  // Grade Submission (Teacher)
  const gradeSubmission = (submissionId: string, score: number, feedback?: string) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === submissionId) {
        return {
          ...s,
          score,
          feedback,
          status: 'graded',
          gradedAt: new Date().toISOString(),
        };
      }
      return s;
    }));
  };

  // Submit Quiz (Student)
  const submitQuiz = (quizId: string, answers: Record<string, number>) => {
    const targetQuiz = quizzes.find(q => q.id === quizId);
    if (!targetQuiz || !currentUser) {
      return { score: 0, maxScore: 0, percentage: 0 };
    }

    let earnedScore = 0;
    targetQuiz.questions.forEach(q => {
      const selectedIndex = answers[q.id];
      if (selectedIndex === q.correctAnswerIndex) {
        earnedScore += q.points;
      }
    });

    const maxScore = targetQuiz.totalPoints || targetQuiz.questions.reduce((acc, q) => acc + q.points, 0);
    const percentage = maxScore > 0 ? Math.round((earnedScore / maxScore) * 100) : 0;

    const newQuizSub: QuizSubmission = {
      id: `qsub_${Date.now()}`,
      quizId,
      quizTitle: targetQuiz.title,
      studentId: currentUser.id,
      studentName: currentUser.name,
      grade: currentUser.grade || targetQuiz.grade,
      section: currentUser.section || targetQuiz.section,
      answers,
      score: earnedScore,
      maxScore,
      percentage,
      submittedAt: new Date().toISOString(),
    };

    setQuizSubmissions(prev => [newQuizSub, ...prev.filter(qs => !(qs.quizId === quizId && qs.studentId === currentUser.id))]);
    return { score: earnedScore, maxScore, percentage };
  };

  // Log AI Interaction for Admin Monitoring
  const logAiInteraction = (prompt: string, response: string, subject?: string) => {
    if (!currentUser) return;

    // Check for potential cheating or suspicious phrases
    const lowerPrompt = prompt.toLowerCase();
    const flaggedKeywords = ['solve my homework', 'do my assignment', 'test answer', 'exam question', 'answer key', 'write my entire'];
    const isFlagged = flaggedKeywords.some(kw => lowerPrompt.includes(kw));

    const newInteraction: AiInteraction = {
      id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      role: currentUser.role,
      grade: currentUser.grade,
      section: currentUser.section,
      subject: subject || currentUser.subject || 'General',
      prompt,
      response,
      flagged: isFlagged,
      timestamp: new Date().toISOString(),
    };

    setAiInteractions(prev => [newInteraction, ...prev]);
  };

  const deleteAiInteraction = (id: string) => {
    setAiInteractions(prev => prev.filter(i => i.id !== id));
  };

  const clearAiInteractions = () => {
    setAiInteractions([]);
  };

  // Send Direct Message (with Image support)
  const sendMessage = (recipientId: string, recipientName: string, content: string, imageUrl?: string) => {
    if (!currentUser) return;
    const convId = [currentUser.id, recipientId].sort().join('_');
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      recipientId,
      recipientName,
      conversationId: `conv_${convId}`,
      content,
      imageUrl,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, newMsg]);
  };

  // Announcements
  const postAnnouncement = (data: Omit<Announcement, 'id' | 'createdAt' | 'authorName'>) => {
    if (!currentUser) return;
    const newAnn: Announcement = {
      ...data,
      id: `anc_${Date.now()}`,
      authorName: currentUser.name,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  const deleteAnnouncement = (annId: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== annId));
  };

  // Academic Term & Year Promotion (Admin Exclusive)
  const advanceTerm = (clearOldTermData: boolean = true): { success: boolean; message: string } => {
    let nextTerm = 'Term 2 (Spring)';
    if (academicSettings.currentTerm.includes('Term 1')) nextTerm = 'Term 2 (Spring)';
    else if (academicSettings.currentTerm.includes('Term 2')) nextTerm = 'Term 3 (Summer)';
    else nextTerm = 'Term 1 (Fall)';

    const clearedCount = clearOldTermData 
      ? assignments.length + submissions.length + quizzes.length + quizSubmissions.length
      : 0;

    if (clearOldTermData) {
      setAssignments([]);
      setSubmissions([]);
      setQuizzes([]);
      setQuizSubmissions([]);
      setDailyEvaluations([]);
    }

    const newRecord: PromotionRecord = {
      id: `prom_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'end_term',
      fromTermOrYear: academicSettings.currentTerm,
      toTermOrYear: nextTerm,
      promotedCount: 0,
      clearedItemsCount: clearedCount,
      notes: clearOldTermData 
        ? `Term transitioned to ${nextTerm}. Prior term assignments, quizzes, and continuous evaluations archived.` 
        : `Term transitioned to ${nextTerm}. Data retained.`,
    };

    setAcademicSettings(prev => ({
      ...prev,
      currentTerm: nextTerm,
      lastPromotionDate: new Date().toISOString(),
      promotionHistory: [newRecord, ...prev.promotionHistory],
    }));

    return { 
      success: true, 
      message: `Successfully advanced academic calendar to ${nextTerm}.${clearOldTermData ? ` Cleared ${clearedCount} past term coursework items for a fresh start.` : ''}` 
    };
  };

  const advanceAcademicYear = (): { success: boolean; promotedCount: number; message: string } => {
    const parts = academicSettings.currentAcademicYear.split('-');
    let nextYear = '2027-2028';
    if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      nextYear = `${Number(parts[0]) + 1}-${Number(parts[1]) + 1}`;
    }

    const nextGradeMap: Record<string, string> = {
      'Grade 9': 'Grade 10',
      'Grade 10': 'Grade 11',
      'Grade 11': 'Grade 12',
      'Grade 12': 'Graduated (Class of ' + (parts[1] || '2027') + ')',
    };

    let promotedCount = 0;
    const updatedUsers = users.map(u => {
      if (u.role === 'student' && u.grade) {
        const nextGrade = nextGradeMap[u.grade] || 'Graduated';
        promotedCount++;
        return {
          ...u,
          grade: nextGrade,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      }
      return u;
    });

    setUsers(updatedUsers);

    // If current logged-in user is a student, advance their session grade immediately
    if (currentUser && currentUser.role === 'student' && currentUser.grade) {
      const nextGrade = nextGradeMap[currentUser.grade] || 'Graduated';
      setCurrentUser(prev => prev ? { ...prev, grade: nextGrade } : null);
    }

    // Clear previous year's coursework and evaluations for a clean slate
    const clearedItems = assignments.length + submissions.length + quizzes.length + quizSubmissions.length + dailyEvaluations.length;
    setAssignments([]);
    setSubmissions([]);
    setQuizzes([]);
    setQuizSubmissions([]);
    setDailyEvaluations([]);

    const newRecord: PromotionRecord = {
      id: `prom_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'end_year',
      fromTermOrYear: academicSettings.currentAcademicYear,
      toTermOrYear: nextYear,
      promotedCount,
      clearedItemsCount: clearedItems,
      notes: `End of Academic Year triggered. Advanced ${promotedCount} students to next grade levels. Data reset for new academic year ${nextYear}.`,
    };

    setAcademicSettings(prev => ({
      ...prev,
      currentAcademicYear: nextYear,
      currentTerm: 'Term 1 (Fall)',
      lastPromotionDate: new Date().toISOString(),
      promotionHistory: [newRecord, ...prev.promotionHistory],
    }));

    return {
      success: true,
      promotedCount,
      message: `Academic Year successfully transitioned to ${nextYear}! Promoted ${promotedCount} students to the next grade and cleared past year's coursework for a clean slate.`,
    };
  };

  // Daily Evaluations (Continuous grading by category)
  const logDailyEvaluation = (data: Omit<DailyEvaluation, 'id' | 'createdAt' | 'teacherId' | 'teacherName'>) => {
    if (!currentUser) return;
    const overall = Math.round((data.behaviorScore + data.participationScore + data.assignmentScore) / 3);
    const newEval: DailyEvaluation = {
      ...data,
      id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      overallScore: overall,
      createdAt: new Date().toISOString(),
    };
    setDailyEvaluations(prev => [newEval, ...prev]);
  };

  const deleteDailyEvaluation = (id: string) => {
    setDailyEvaluations(prev => prev.filter(e => e.id !== id));
  };

  // Administrative Disciplinary System
  const issueDisciplinaryNotice = (data: Omit<DisciplinaryNotice, 'id' | 'issuedAt' | 'issuedBy' | 'status'>) => {
    if (!currentUser) return;
    const newNotice: DisciplinaryNotice = {
      ...data,
      id: `disc_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      issuedBy: currentUser.name,
      issuedAt: new Date().toISOString(),
      status: 'active',
    };
    setDisciplinaryNotices(prev => [newNotice, ...prev]);
  };

  const acknowledgeDisciplinaryNotice = (id: string) => {
    setDisciplinaryNotices(prev => prev.map(n => n.id === id ? {
      ...n,
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
    } : n));
  };

  const resolveDisciplinaryNotice = (id: string) => {
    setDisciplinaryNotices(prev => prev.map(n => n.id === id ? {
      ...n,
      status: 'resolved',
    } : n));
  };

  const deleteDisciplinaryNotice = (id: string) => {
    setDisciplinaryNotices(prev => prev.filter(n => n.id !== id));
  };

  return (
    <DataContext.Provider value={{
      currentUser,
      users,
      assignments,
      quizzes,
      submissions,
      quizSubmissions,
      announcements,
      aiInteractions,
      messages,
      dailyEvaluations,
      disciplinaryNotices,
      academicSettings,
      isSummerBreakActive,
      setIsSummerBreakActive,
      login,
      logout,
      createUser,
      deleteUser,
      updateUser,
      advanceTerm,
      advanceAcademicYear,
      createAssignment,
      deleteAssignment,
      createQuiz,
      deleteQuiz,
      logDailyEvaluation,
      deleteDailyEvaluation,
      issueDisciplinaryNotice,
      acknowledgeDisciplinaryNotice,
      resolveDisciplinaryNotice,
      deleteDisciplinaryNotice,
      submitAssignment,
      gradeSubmission,
      submitQuiz,
      logAiInteraction,
      deleteAiInteraction,
      clearAiInteractions,
      sendMessage,
      postAnnouncement,
      deleteAnnouncement,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
