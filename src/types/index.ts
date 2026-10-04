export type UserRole = 'super_admin' | 'admin' | 'subadmin' | 'teacher' | 'student';

export type AdminPermission = 
  | 'manage_users' 
  | 'manage_admins'
  | 'behavior_disciplinary' 
  | 'academic_promotion' 
  | 'ai_monitoring' 
  | 'announcements'
  | 'study_reels';

export interface TeacherClassAssignment {
  grade: string;
  sections: string[];
}

export interface AppUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: UserRole;
  isSuperAdmin?: boolean; // Owner / Super Hidden Admin flag
  isBlocked?: boolean;    // Admin or Super Admin can suspend/block accounts
  subAdminTitle?: string; // e.g. "School Registrar", "Vice Principal", "System Moderator", "Dean of Academics"
  permissions?: string[]; // Granular permissions for sub-administrative accounts
  grade?: string;      // e.g. "Grade 9", "Grade 10", "Grade 11", "Grade 12"
  section?: string;    // e.g. "Section A", "Section B", "Section C"
  subject?: string;    // e.g. "Mathematics", "Science", "English" for teachers
  assignedClasses?: TeacherClassAssignment[]; // Multi-grade and multi-section assignments for teachers
  email?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LiveZoomSession {
  id: string;
  topic: string;
  subject: string;
  grade: string;
  section: string;
  teacherId: string;
  teacherName: string;
  zoomUrl: string;
  meetingId?: string;
  passcode?: string;
  status: 'active' | 'ended';
  startedAt: string;
  endedAt?: string;
}

export interface SubjectCardData {
  id: string;
  name: string;
  code: string; // e.g., "ENG-101", "E.S.5", "MATH-9"
  grade: string;
  section?: string;
  teacherName: string;
  averageScore?: number; // Dynamic graded percentage (e.g., 70%)
  gradedCount: number;
  notificationCount: number; // Bell pill count
  iconType: 'english' | 'es5' | 'math' | 'physics' | 'chemistry' | 'biology' | 'cs' | 'history' | 'general';
  colorTheme: string;
  zoomActive?: boolean;
  zoomSession?: LiveZoomSession;
}

export interface TargetClassItem {
  grade: string;
  section: string;
}

export interface StudyReel {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  grade: string;
  section: string;
  targetClasses?: TargetClassItem[]; // Targeted publishing to prevent global spam
  likes: number;
  likedBy?: string[];
  duration?: string;
  createdAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  grade: string;
  section: string;
  targetClasses?: TargetClassItem[]; // Multi-grade & multi-section targeted publishing
  subject: string;
  teacherId: string;
  teacherName: string;
  dueDate: string;
  maxScore: number;
  attachments?: { name: string; url: string }[];
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  grade: string;
  section: string;
  targetClasses?: TargetClassItem[]; // Multi-grade & multi-section targeted publishing
  subject: string;
  teacherId: string;
  teacherName: string;
  questions: QuizQuestion[];
  totalPoints: number;
  dueDate: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  content: string;
  imageUrl?: string;        // Photo of handwritten answers, diagrams, or notes
  attachmentUrl?: string;
  status: 'pending' | 'graded';
  score?: number;
  feedback?: string;
  submittedAt: string;
  gradedAt?: string;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  grade: string;
  section: string;
  answers: Record<string, number>;
  score: number;
  maxScore: number;
  percentage: number;
  submittedAt: string;
}

export interface DailyEvaluation {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  grade: string;
  section: string;
  subject: string;
  date: string;
  behaviorScore: number;      // 0 - 100
  participationScore: number; // 0 - 100
  assignmentScore: number;    // 0 - 100
  overallScore: number;       // Average of the three
  remarks?: string;
  createdAt: string;
}

export interface DisciplinaryNotice {
  id: string;
  studentId: string;
  studentName: string;
  studentGrade: string;
  studentSection: string;
  noticeType: 'warning' | 'suspension' | 'expulsion';
  reason: string;
  duration?: string;
  formalLetter: string;
  issuedBy: string;
  issuedAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
  acknowledgedAt?: string;
}

export interface PromotionRecord {
  id: string;
  date: string;
  type: 'end_term' | 'end_year';
  fromTermOrYear: string;
  toTermOrYear: string;
  promotedCount: number;
  clearedItemsCount: number;
  notes: string;
}

export interface AcademicSettings {
  currentAcademicYear: string; // e.g. "2026-2027"
  currentTerm: string;         // e.g. "Term 1", "Term 2", "Term 3"
  lastPromotionDate?: string;
  promotionHistory: PromotionRecord[];
}

export interface AiInteraction {
  id: string;
  studentId: string;
  studentName: string;
  role: string;
  grade?: string;
  section?: string;
  subject?: string;
  prompt: string;
  response: string;
  timestamp: string;
  flagged?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  conversationId: string;
  content: string;
  imageUrl?: string; // Image attached by student or teacher
  read: boolean;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'urgent' | 'academic' | 'general';
  authorName: string;
  targetGrade?: string;
  targetSection?: string;
  targetClasses?: TargetClassItem[]; // Multi-grade & multi-section targeted publishing
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
