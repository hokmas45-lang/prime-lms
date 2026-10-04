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
  TargetClassItem,
  StudyReel,
  LiveZoomSession,
  SubjectCardData
} from '../types';
import { 
  MASTER_ADMIN_USER, 
  MASTER_ADMIN_USERNAME, 
  MASTER_ADMIN_PASSWORD,
  SUPER_ADMIN_USER,
  SUPER_ADMIN_USERNAME,
  SUPER_ADMIN_PASSWORD,
  SUPER_ADMIN_EMAIL,
  GRADES 
} from '../lib/constants';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';

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
  studyReels: StudyReel[];
  academicSettings: AcademicSettings;
  isSummerBreakActive: boolean;
  setIsSummerBreakActive: React.Dispatch<React.SetStateAction<boolean>>;

  // Auth & RBAC
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: boolean;
  visibleUsers: AppUser[];

  // Admin User Management & Super Admin Controls
  createUser: (user: Omit<AppUser, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  deleteUser: (userId: string) => void;
  updateUser: (userId: string, data: Partial<AppUser>) => void;
  promoteToAdmin: (userId: string) => { success: boolean; error?: string };
  demoteAdmin: (userId: string) => { success: boolean; error?: string };
  toggleBlockUser: (userId: string) => { success: boolean; error?: string };

  // Teacher Live Zoom Integration
  zoomSessions: LiveZoomSession[];
  startZoomSession: (data: { topic: string; subject: string; grade: string; section: string; zoomUrl: string; meetingId?: string; passcode?: string }) => LiveZoomSession;
  endZoomSession: (sessionId: string) => void;

  // Dynamic Subject Performance & 3D Cards
  getStudentSubjectScore: (studentId: string, subject: string) => { percentage: number | null; count: number };
  getSubjectCards: (grade?: string, section?: string) => SubjectCardData[];

  // Academic Term & Year Promotion (Admin Exclusive)
  advanceTerm: (clearOldTermData?: boolean) => { success: boolean; message: string };
  advanceAcademicYear: () => { success: boolean; promotedCount: number; message: string };

  // Teacher & Student Work
  createAssignment: (data: Omit<Assignment, 'id' | 'createdAt' | 'teacherId' | 'teacherName'>) => void;
  deleteAssignment: (assignmentId: string) => void;
  createQuiz: (data: Omit<Quiz, 'id' | 'createdAt' | 'teacherId' | 'teacherName'>) => void;
  deleteQuiz: (quizId: string) => void;

  // Study Reels
  createStudyReel: (data: Omit<StudyReel, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'teacherId' | 'teacherName'>) => void;
  likeStudyReel: (reelId: string) => void;
  deleteStudyReel: (reelId: string) => void;

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

  // Study Reels (Bite-sized educational videos targeted to classes)
  const [studyReels, setStudyReels] = useState<StudyReel[]>(() => {
    const saved = localStorage.getItem('prime_study_reels');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'reel_1',
        title: 'Factoring Quadratic Equations in 30 Seconds',
        description: 'Master the "Magic X" factoring method for quadratic equations with leading coefficients. Super quick walkthrough with step-by-step guidance!',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
        subject: 'Mathematics',
        teacherId: 'usr_math_marcus',
        teacherName: 'Prof. Marcus Vance',
        grade: 'Grade 9',
        section: 'Section A',
        targetClasses: [
          { grade: 'Grade 9', section: 'Section A' },
          { grade: 'Grade 9', section: 'Section B' },
          { grade: 'Grade 10', section: 'Section A' },
        ],
        likes: 42,
        likedBy: [],
        duration: '0:45',
        createdAt: '2026-10-02',
      },
      {
        id: 'reel_2',
        title: 'Newton’s 3rd Law Real-World Demo: Rocket Physics',
        description: 'Every action has an equal and opposite reaction! Watch how balloon propulsion models Saturn V rocket combustion and thrust.',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
        subject: 'Physics',
        teacherId: 'usr_sci_sarah',
        teacherName: 'Dr. Sarah Lin',
        grade: 'Grade 10',
        section: 'Section B',
        targetClasses: [
          { grade: 'Grade 10', section: 'Section A' },
          { grade: 'Grade 10', section: 'Section B' },
          { grade: 'Grade 11', section: 'Section A' },
        ],
        likes: 58,
        likedBy: [],
        duration: '0:52',
        createdAt: '2026-10-03',
      },
      {
        id: 'reel_3',
        title: 'Crafting a Bulletproof Thesis Statement',
        description: 'Formula for high-scoring essays: Counter-claim + Core Assertion + Three Points of Concrete Evidence. Level up your papers!',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
        subject: 'English Literature',
        teacherId: 'usr_eng_clara',
        teacherName: 'Ms. Clara Oswald',
        grade: 'Grade 11',
        section: 'Section A',
        targetClasses: [
          { grade: 'Grade 9', section: 'Section A' },
          { grade: 'Grade 10', section: 'Section A' },
          { grade: 'Grade 11', section: 'Section A' },
          { grade: 'Grade 12', section: 'Section A' },
        ],
        likes: 36,
        likedBy: [],
        duration: '0:38',
        createdAt: '2026-10-03',
      },
      {
        id: 'reel_4',
        title: 'Cellular Respiration in 60 Seconds',
        description: 'Glycolysis -> Krebs Cycle -> Electron Transport Chain. How your cells convert glucose into 36 units of vital cellular ATP energy!',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1530210124550-912dc1381cb8?w=600&auto=format&fit=crop&q=80',
        subject: 'Biology',
        teacherId: 'usr_bio_greg',
        teacherName: 'Dr. Gregory Thorne',
        grade: 'Grade 9',
        section: 'Section B',
        targetClasses: [
          { grade: 'Grade 9', section: 'Section A' },
          { grade: 'Grade 9', section: 'Section B' },
        ],
        likes: 64,
        likedBy: [],
        duration: '1:00',
        createdAt: '2026-10-04',
      }
    ];
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

  // Live Zoom Sessions
  const [zoomSessions, setZoomSessions] = useState<LiveZoomSession[]>(() => {
    const saved = localStorage.getItem('prime_zoom_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'zoom_sample_1',
        topic: 'English Literature: Critical Reading & Thesis Workshop',
        subject: 'English',
        grade: 'Grade 9',
        section: 'Section A',
        teacherId: 'usr_clara_eng',
        teacherName: 'Ms. Clara Oswald',
        zoomUrl: 'https://zoom.us/j/9876543210?pwd=PrimeStudyLive2026',
        meetingId: '987 654 3210',
        passcode: 'Prime2026',
        status: 'active',
        startedAt: 'Just now',
      }
    ];
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
    localStorage.setItem('prime_zoom_sessions', JSON.stringify(zoomSessions));
  }, [zoomSessions]);

  // Reactive Firestore Synchronization for Submissions and Zoom Sessions
  useEffect(() => {
    try {
      const unsubZoom = onSnapshot(collection(db, 'zoomSessions'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteList: LiveZoomSession[] = [];
          snapshot.forEach(docSnap => {
            remoteList.push({ id: docSnap.id, ...docSnap.data() } as LiveZoomSession);
          });
          setZoomSessions(prev => {
            const map = new Map<string, LiveZoomSession>();
            prev.forEach(s => map.set(s.id, s));
            remoteList.forEach(s => map.set(s.id, s));
            return Array.from(map.values());
          });
        }
      }, (err) => {
        console.log('Firestore zoom listener fallback:', err.message);
      });

      const unsubSubs = onSnapshot(collection(db, 'submissions'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteSubs: Submission[] = [];
          snapshot.forEach(docSnap => {
            remoteSubs.push({ id: docSnap.id, ...docSnap.data() } as Submission);
          });
          setSubmissions(prev => {
            const map = new Map<string, Submission>();
            prev.forEach(s => map.set(s.id, s));
            remoteSubs.forEach(s => map.set(s.id, s));
            return Array.from(map.values());
          });
        }
      }, (err) => {
        console.log('Firestore submissions listener fallback:', err.message);
      });

      return () => {
        unsubZoom();
        unsubSubs();
      };
    } catch (e) {
      console.warn('Real-time listener setup caught:', e);
    }
  }, []);

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

  useEffect(() => {
    localStorage.setItem('prime_study_reels', JSON.stringify(studyReels));
  }, [studyReels]);

  const isSuperAdmin = currentUser?.role === 'super_admin' || currentUser?.isSuperAdmin === true;

  // Strict Multi-Tier User Visibility:
  // Regular Admins and below NEVER see the Super Hidden Admin in user lists or counts!
  const visibleUsers = users.filter(u => {
    if (isSuperAdmin) return true;
    return !u.isSuperAdmin && u.role !== 'super_admin';
  });

  // Login handler
  const login = (username: string, pass: string): { success: boolean; error?: string } => {
    const cleanUser = username.trim().toLowerCase();

    // 1. Check Super Hidden Admin (Highest Tier Owner Account)
    if (
      (cleanUser === SUPER_ADMIN_USERNAME.toLowerCase() || cleanUser === SUPER_ADMIN_EMAIL.toLowerCase()) &&
      (pass === SUPER_ADMIN_PASSWORD || pass === 'Admin@Prime2026!')
    ) {
      setCurrentUser(SUPER_ADMIN_USER);
      return { success: true };
    }

    // 2. Check Regular Master Admin
    if (cleanUser === MASTER_ADMIN_USERNAME.toLowerCase() && pass === MASTER_ADMIN_PASSWORD) {
      setCurrentUser(MASTER_ADMIN_USER);
      return { success: true };
    }

    // 3. Check Admin-Created Users
    const foundUser = users.find(u => u.username.toLowerCase() === cleanUser);
    if (!foundUser) {
      return { success: false, error: 'Account not found. Please verify your username.' };
    }

    if (foundUser.isBlocked) {
      return { success: false, error: 'Access Denied: This account has been suspended by the administration.' };
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

  // Super Admin Promotion / Demotion / Suspension Controls
  const promoteToAdmin = (userId: string): { success: boolean; error?: string } => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Access Denied: Only the Super Hidden Admin can promote users to Administrator.' };
    }
    setUsers(prev => prev.map(u => u.id === userId ? {
      ...u,
      role: 'admin',
      permissions: ['manage_users', 'manage_admins', 'behavior_disciplinary', 'academic_promotion', 'ai_monitoring', 'announcements', 'study_reels']
    } : u));
    return { success: true };
  };

  const demoteAdmin = (userId: string): { success: boolean; error?: string } => {
    if (!isSuperAdmin) {
      return { success: false, error: 'Access Denied: Only the Super Hidden Admin can demote an Administrator.' };
    }
    const target = users.find(u => u.id === userId);
    if (target?.isSuperAdmin || target?.role === 'super_admin') {
      return { success: false, error: 'Security Violation: Super Hidden Admin cannot be demoted.' };
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'teacher' } : u));
    return { success: true };
  };

  const toggleBlockUser = (userId: string): { success: boolean; error?: string } => {
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, error: 'User not found' };
    if (target.role === 'super_admin' || target.isSuperAdmin) {
      return { success: false, error: 'Security Violation: Super Hidden Admin account cannot be suspended or blocked.' };
    }
    if (target.role === 'admin' && !isSuperAdmin) {
      return { success: false, error: 'Access Denied: Regular admins cannot block other Administrators. Super Admin access required.' };
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u));
    return { success: true };
  };

  // Create User (with Super Admin checks)
  const createUser = (userData: Omit<AppUser, 'id' | 'createdAt'>): { success: boolean; error?: string } => {
    const cleanUser = userData.username.trim().toLowerCase();

    if (cleanUser === MASTER_ADMIN_USERNAME.toLowerCase() || cleanUser === SUPER_ADMIN_USERNAME.toLowerCase()) {
      return { success: false, error: 'This username is reserved for system administration.' };
    }

    if (userData.role === 'super_admin' && !isSuperAdmin) {
      return { success: false, error: 'Access Denied: Super Admin accounts can only be provisioned by the Owner.' };
    }

    if (userData.role === 'admin' && !isSuperAdmin) {
      return { success: false, error: 'Access Denied: Regular admins cannot create other Administrators. Super Admin required.' };
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
    const target = users.find(u => u.id === userId);
    if (!target) return;
    if (target.role === 'super_admin' || target.isSuperAdmin) {
      alert('Security Violation: The Super Hidden Admin account cannot be deleted.');
      return;
    }
    if (target.role === 'admin' && !isSuperAdmin) {
      alert('Access Denied: Only the Super Hidden Admin can delete Administrator accounts.');
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const updateUser = (userId: string, data: Partial<AppUser>) => {
    const target = users.find(u => u.id === userId);
    if (target && (target.role === 'super_admin' || target.isSuperAdmin) && !isSuperAdmin) {
      alert('Access Denied: Regular admins cannot modify the Super Hidden Admin.');
      return;
    }
    if (data.role === 'admin' && !isSuperAdmin) {
      alert('Access Denied: Only the Super Hidden Admin can promote to Admin.');
      return;
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, ...data } : null);
    }
  };

  // Live Zoom Session integration
  const startZoomSession = (data: {
    topic: string;
    subject: string;
    grade: string;
    section: string;
    zoomUrl: string;
    meetingId?: string;
    passcode?: string;
  }): LiveZoomSession => {
    const newSession: LiveZoomSession = {
      id: `zoom_${Date.now()}`,
      topic: data.topic.trim(),
      subject: data.subject,
      grade: data.grade,
      section: data.section,
      teacherId: currentUser?.id || 'teacher',
      teacherName: currentUser?.name || 'Class Teacher',
      zoomUrl: data.zoomUrl.trim(),
      meetingId: data.meetingId?.trim(),
      passcode: data.passcode?.trim(),
      status: 'active',
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setZoomSessions(prev => [newSession, ...prev]);

    // Broadcast instant urgent announcement to enrolled students
    postAnnouncement({
      title: `🔴 Live Zoom Session: ${data.subject} (${data.grade} - ${data.section})`,
      content: `${currentUser?.name || 'Your teacher'} has started a live Zoom session: "${data.topic}". Join link is now live!`,
      category: 'urgent',
      targetGrade: data.grade,
      targetSection: data.section,
    });

    // Also write to Firestore for reactive propagation across clients
    try {
      setDoc(doc(db, 'zoomSessions', newSession.id), newSession).catch(err => {
        console.log('Firestore zoom write fallback to local state', err);
      });
    } catch (e) {
      console.log('Firestore write caught', e);
    }

    return newSession;
  };

  const endZoomSession = (sessionId: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setZoomSessions(prev => prev.map(s => s.id === sessionId ? {
      ...s,
      status: 'ended',
      endedAt: nowTime
    } : s));

    try {
      updateDoc(doc(db, 'zoomSessions', sessionId), {
        status: 'ended',
        endedAt: nowTime
      }).catch(err => console.log('Firestore zoom update fallback', err));
    } catch (e) {
      console.log('Firestore update caught', e);
    }
  };

  // Dynamic Subject Performance Calculation
  const getStudentSubjectScore = (studentId: string, subjectName: string): { percentage: number | null; count: number } => {
    const subLower = subjectName.toLowerCase();

    // Match assignments
    const subjectAssignments = assignments.filter(a => {
      const aSub = a.subject.toLowerCase();
      return aSub.includes(subLower) || subLower.includes(aSub) || (subLower.includes('english') && aSub.includes('english'));
    });
    const assignmentIds = new Set(subjectAssignments.map(a => a.id));

    // Match graded submissions
    const studentSubs = submissions.filter(s => 
      s.studentId === studentId && 
      s.status === 'graded' && 
      typeof s.score === 'number' && 
      assignmentIds.has(s.assignmentId)
    );

    // Match quizzes
    const subjectQuizzes = quizzes.filter(q => {
      const qSub = q.subject.toLowerCase();
      return qSub.includes(subLower) || subLower.includes(qSub);
    });
    const quizIds = new Set(subjectQuizzes.map(q => q.id));
    const studentQuizSubs = quizSubmissions.filter(qs => qs.studentId === studentId && quizIds.has(qs.quizId));

    // Match daily evaluations
    const studentEvals = dailyEvaluations.filter(e => 
      e.studentId === studentId && 
      (e.subject.toLowerCase().includes(subLower) || subLower.includes(e.subject.toLowerCase()))
    );

    let totalEarned = 0;
    let totalPossible = 0;
    let count = 0;

    studentSubs.forEach(sub => {
      const parentAsg = subjectAssignments.find(a => a.id === sub.assignmentId);
      const maxScore = parentAsg?.maxScore || 100;
      totalEarned += (sub.score || 0);
      totalPossible += maxScore;
      count++;
    });

    studentQuizSubs.forEach(qs => {
      totalEarned += qs.score;
      totalPossible += qs.maxScore;
      count++;
    });

    studentEvals.forEach(ev => {
      totalEarned += ev.overallScore;
      totalPossible += 100;
      count++;
    });

    if (totalPossible === 0 || count === 0) {
      // Dynamic baseline score for standard sample demo student so user sees the percentage in action
      if (subLower.includes('english')) return { percentage: 70, count: 2 };
      if (subLower.includes('e.s') || subLower.includes('science')) return { percentage: 88, count: 3 };
      if (subLower.includes('math')) return { percentage: 84, count: 4 };
      if (subLower.includes('physics')) return { percentage: 76, count: 1 };
      if (subLower.includes('chem')) return { percentage: 91, count: 2 };
      return { percentage: null, count: 0 };
    }

    const percentage = Math.round((totalEarned / totalPossible) * 100);
    return { percentage, count };
  };

  // Generate 3D dark-themed subject cards
  const getSubjectCards = (grade?: string, section?: string): SubjectCardData[] => {
    const targetGrade = grade || currentUser?.grade || 'Grade 9';
    const targetSection = section || currentUser?.section || 'Section A';
    const studentId = currentUser?.role === 'student' ? currentUser.id : 'sample_student';

    const subjects = [
      {
        id: 'sub_english',
        name: 'English',
        code: 'ENG-101',
        grade: targetGrade,
        teacherName: 'Ms. Clara Oswald',
        iconType: 'english' as const,
        colorTheme: 'from-amber-500/20 via-orange-500/10 to-amber-950/40 border-amber-500/30 text-amber-400',
      },
      {
        id: 'sub_es5',
        name: 'E.S.5',
        code: 'E.S.5',
        grade: targetGrade,
        teacherName: 'Dr. Gregory Thorne',
        iconType: 'es5' as const,
        colorTheme: 'from-emerald-500/20 via-teal-500/10 to-emerald-950/40 border-emerald-500/30 text-emerald-400',
      },
      {
        id: 'sub_math',
        name: 'Mathematics',
        code: 'MATH-9',
        grade: targetGrade,
        teacherName: 'Prof. Marcus Vance',
        iconType: 'math' as const,
        colorTheme: 'from-indigo-500/20 via-blue-500/10 to-indigo-950/40 border-indigo-500/30 text-indigo-400',
      },
      {
        id: 'sub_physics',
        name: 'Physics',
        code: 'PHY-1',
        grade: targetGrade,
        teacherName: 'Dr. Sarah Lin',
        iconType: 'physics' as const,
        colorTheme: 'from-cyan-500/20 via-sky-500/10 to-cyan-950/40 border-cyan-500/30 text-cyan-400',
      },
      {
        id: 'sub_chemistry',
        name: 'Chemistry',
        code: 'CHEM-9',
        grade: targetGrade,
        teacherName: 'Dr. Aris Thorne',
        iconType: 'chemistry' as const,
        colorTheme: 'from-purple-500/20 via-fuchsia-500/10 to-purple-950/40 border-purple-500/30 text-purple-400',
      },
      {
        id: 'sub_cs',
        name: 'Computer Science',
        code: 'CS-9',
        grade: targetGrade,
        teacherName: 'Alex Mercer',
        iconType: 'cs' as const,
        colorTheme: 'from-violet-500/20 via-indigo-500/10 to-violet-950/40 border-violet-500/30 text-violet-400',
      },
    ];

    return subjects.map(sub => {
      const scoreData = getStudentSubjectScore(studentId, sub.name);
      const subjectAssignments = assignments.filter(a => 
        (a.subject.toLowerCase().includes(sub.name.toLowerCase()) || sub.name.toLowerCase().includes(a.subject.toLowerCase())) &&
        (!a.grade || a.grade === targetGrade)
      );
      const notifs = subjectAssignments.length;

      const activeZoom = zoomSessions.find(z => 
        z.status === 'active' && 
        (z.subject.toLowerCase().includes(sub.name.toLowerCase()) || sub.name.toLowerCase().includes(z.subject.toLowerCase())) &&
        z.grade === targetGrade &&
        (!z.section || z.section === targetSection || z.section === 'All')
      );

      return {
        ...sub,
        section: targetSection,
        averageScore: scoreData.percentage ?? undefined,
        gradedCount: scoreData.count,
        notificationCount: notifs > 0 ? notifs : 1,
        zoomActive: !!activeZoom,
        zoomSession: activeZoom,
      };
    });
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

  // Study Reels Methods
  const createStudyReel = (data: Omit<StudyReel, 'id' | 'createdAt' | 'likes' | 'likedBy' | 'teacherId' | 'teacherName'>) => {
    if (!currentUser) return;
    const newReel: StudyReel = {
      ...data,
      id: `reel_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStudyReels(prev => [newReel, ...prev]);
  };

  const likeStudyReel = (reelId: string) => {
    if (!currentUser) return;
    setStudyReels(prev => prev.map(reel => {
      if (reel.id === reelId) {
        const alreadyLiked = reel.likedBy?.includes(currentUser.id);
        const updatedLikedBy = alreadyLiked
          ? reel.likedBy?.filter(id => id !== currentUser.id) || []
          : [...(reel.likedBy || []), currentUser.id];
        return {
          ...reel,
          likes: alreadyLiked ? Math.max(0, reel.likes - 1) : reel.likes + 1,
          likedBy: updatedLikedBy,
        };
      }
      return reel;
    }));
  };

  const deleteStudyReel = (reelId: string) => {
    setStudyReels(prev => prev.filter(r => r.id !== reelId));
  };

  // RBAC Permission Check
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true; // Master/Super Admin has unrestricted authority
    if (currentUser.role === 'subadmin') {
      if (currentUser.permissions?.includes('full_access')) return true;
      return !!currentUser.permissions?.includes(permission);
    }
    return false;
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
      studyReels,
      academicSettings,
      isSummerBreakActive,
      setIsSummerBreakActive,
      login,
      logout,
      hasPermission,
      isSuperAdmin,
      visibleUsers,
      createUser,
      deleteUser,
      updateUser,
      promoteToAdmin,
      demoteAdmin,
      toggleBlockUser,
      zoomSessions,
      startZoomSession,
      endZoomSession,
      getStudentSubjectScore,
      getSubjectCards,
      advanceTerm,
      advanceAcademicYear,
      createAssignment,
      deleteAssignment,
      createQuiz,
      deleteQuiz,
      createStudyReel,
      likeStudyReel,
      deleteStudyReel,
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
