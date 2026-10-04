import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { AppUser, UserRole, TeacherClassAssignment } from '../../types';
import { GRADES, SECTIONS, SUBJECTS } from '../../lib/constants';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Trash2, 
  Copy, 
  Check, 
  Key, 
  GraduationCap, 
  BookOpen,
  Layers,
  AlertCircle,
  Edit2,
  CheckSquare,
  Square,
  ShieldCheck,
  Shield,
  Briefcase,
  Crown,
  Ban,
  ArrowUpCircle,
  ArrowDownCircle,
  UserCheck,
  CheckCircle
} from 'lucide-react';

const ADMIN_PERMISSION_OPTIONS = [
  { id: 'manage_users', label: 'User & Student Database', desc: 'Create, edit, and manage student and faculty accounts' },
  { id: 'manage_admins', label: 'Admin Accounts Management', desc: 'Promote, demote, and oversee subordinate administrators' },
  { id: 'behavior_disciplinary', label: 'Disciplinary & Behavior System', desc: 'Issue official warnings, suspensions, and expulsion notices' },
  { id: 'academic_promotion', label: 'Academic Year & Term Promotion', desc: 'Advance academic terms, student promotion, and data resets' },
  { id: 'ai_monitoring', label: 'AI Chat Monitoring', desc: 'Review, moderate, and monitor student Gemini AI sessions' },
  { id: 'announcements', label: 'Campus Announcements', desc: 'Publish institutional notices and advisories' },
  { id: 'study_reels', label: 'Study Reels Feed & Moderation', desc: 'Manage educational short video reels' },
  { id: 'full_access', label: 'Full System Control', desc: 'Unrestricted Super Admin privileges across all features' },
];

export const AdminUserManagement: React.FC = () => {
  const { 
    currentUser, 
    visibleUsers, 
    isSuperAdmin, 
    createUser, 
    updateUser, 
    deleteUser,
    promoteToAdmin,
    demoteAdmin,
    toggleBlockUser
  } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'teacher' | 'student' | 'subadmin'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form state for creating
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [subAdminTitle, setSubAdminTitle] = useState('School Registrar');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'manage_users',
    'announcements'
  ]);
  const [grade, setGrade] = useState<string>(GRADES[0]);
  const [section, setSection] = useState<string>(SECTIONS[0]);
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  // Multi-grade & multi-section for teachers: map grade -> set of sections
  const [teacherAssignedClasses, setTeacherAssignedClasses] = useState<Record<string, string[]>>({
    'Grade 9': ['Section A'],
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editSubAdminTitle, setEditSubAdminTitle] = useState('');
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editGrade, setEditGrade] = useState('');
  const [editSection, setEditSection] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editTeacherAssignedClasses, setEditTeacherAssignedClasses] = useState<Record<string, string[]>>({});
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const togglePermission = (permId: string, isEdit: boolean = false) => {
    const list = isEdit ? editPermissions : selectedPermissions;
    const setList = isEdit ? setEditPermissions : setSelectedPermissions;

    if (list.includes(permId)) {
      setList(list.filter(p => p !== permId));
    } else {
      setList([...list, permId]);
    }
  };

  const toggleSectionForGrade = (
    gradeName: string, 
    sectionName: string, 
    isEdit: boolean = false
  ) => {
    const targetState = isEdit ? editTeacherAssignedClasses : teacherAssignedClasses;
    const setTargetState = isEdit ? setEditTeacherAssignedClasses : setTeacherAssignedClasses;

    const currentSections = targetState[gradeName] || [];
    let updatedSections: string[];

    if (currentSections.includes(sectionName)) {
      updatedSections = currentSections.filter(s => s !== sectionName);
    } else {
      updatedSections = [...currentSections, sectionName];
    }

    setTargetState(prev => {
      const copy = { ...prev };
      if (updatedSections.length === 0) {
        delete copy[gradeName];
      } else {
        copy[gradeName] = updatedSections;
      }
      return copy;
    });
  };

  const formatAssignedClasses = (assignedMap: Record<string, string[]>): TeacherClassAssignment[] => {
    return Object.entries(assignedMap)
      .filter(([_, sections]) => sections.length > 0)
      .map(([grade, sections]) => ({ grade, sections }));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !username.trim() || !password.trim()) {
      setFormError('Please fill in all required fields (Name, Username, and Password).');
      return;
    }

    const assignedClasses = role === 'teacher' ? formatAssignedClasses(teacherAssignedClasses) : undefined;
    
    // Determine primary grade & section fallback for teacher
    const primaryGrade = assignedClasses && assignedClasses.length > 0 ? assignedClasses[0].grade : grade;
    const primarySection = assignedClasses && assignedClasses.length > 0 && assignedClasses[0].sections.length > 0 
      ? assignedClasses[0].sections[0] 
      : section;

    const res = createUser({
      name: name.trim(),
      username: username.trim(),
      password: password.trim(),
      role,
      subAdminTitle: role === 'subadmin' ? (subAdminTitle.trim() || 'Staff Administrator') : undefined,
      permissions: role === 'subadmin' ? selectedPermissions : undefined,
      grade: role === 'student' || role === 'teacher' ? primaryGrade : undefined,
      section: role === 'student' || role === 'teacher' ? primarySection : undefined,
      assignedClasses,
      subject: role === 'teacher' ? subject : undefined,
    });

    if (res.success) {
      setName('');
      setUsername('');
      setPassword('');
      setTeacherAssignedClasses({ 'Grade 9': ['Section A'] });
      setShowAddModal(false);
    } else {
      setFormError(res.error || 'Failed to create user account.');
    }
  };

  const handleOpenEdit = (user: AppUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditPassword(user.password || '');
    setEditSubAdminTitle(user.subAdminTitle || 'School Registrar');
    setEditPermissions(user.permissions || ['manage_users']);
    setEditGrade(user.grade || GRADES[0]);
    setEditSection(user.section || SECTIONS[0]);
    setEditSubject(user.subject || SUBJECTS[0]);

    const initialAssigned: Record<string, string[]> = {};
    if (user.assignedClasses && user.assignedClasses.length > 0) {
      user.assignedClasses.forEach(ac => {
        initialAssigned[ac.grade] = [...ac.sections];
      });
    } else if (user.grade && user.section) {
      initialAssigned[user.grade] = [user.section];
    }
    setEditTeacherAssignedClasses(initialAssigned);
    setEditFormError(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditFormError(null);

    if (!editName.trim() || !editUsername.trim() || !editPassword.trim()) {
      setEditFormError('Name, username, and password are required.');
      return;
    }

    const assignedClasses = editingUser.role === 'teacher' ? formatAssignedClasses(editTeacherAssignedClasses) : undefined;
    const primaryGrade = assignedClasses && assignedClasses.length > 0 ? assignedClasses[0].grade : editGrade;
    const primarySection = assignedClasses && assignedClasses.length > 0 && assignedClasses[0].sections.length > 0 
      ? assignedClasses[0].sections[0] 
      : editSection;

    updateUser(editingUser.id, {
      name: editName.trim(),
      username: editUsername.trim(),
      password: editPassword.trim(),
      subAdminTitle: editingUser.role === 'subadmin' ? editSubAdminTitle.trim() : undefined,
      permissions: editingUser.role === 'subadmin' ? editPermissions : undefined,
      grade: editingUser.role === 'student' || editingUser.role === 'teacher' ? primaryGrade : undefined,
      section: editingUser.role === 'student' || editingUser.role === 'teacher' ? primarySection : undefined,
      assignedClasses,
      subject: editingUser.role === 'teacher' ? editSubject : undefined,
    });

    setEditingUser(null);
  };

  const handleCopyCredentials = (u: AppUser) => {
    const classInfo = u.assignedClasses && u.assignedClasses.length > 0
      ? u.assignedClasses.map(ac => `${ac.grade}: ${ac.sections.join(', ')}`).join('; ')
      : u.role === 'subadmin'
      ? `Administrative Role: ${u.subAdminTitle || 'Sub-Admin'}`
      : `${u.grade} - ${u.section}`;

    const text = `Prime LMS Account Credentials:\nName: ${u.name}\nRole: ${u.role === 'subadmin' ? `Staff (${u.subAdminTitle})` : u.role}\nDetails: ${classInfo}\nUsername: ${u.username}\nPassword: ${u.password}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = visibleUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (u.subAdminTitle && u.subAdminTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesGrade = gradeFilter === 'all' || u.grade === gradeFilter;
    const matchesSection = sectionFilter === 'all' || u.section === sectionFilter;
    return matchesSearch && matchesRole && matchesGrade && matchesSection;
  });

  const adminsCount = visibleUsers.filter(u => u.role === 'admin' || u.role === 'super_admin').length;
  const teachersCount = visibleUsers.filter(u => u.role === 'teacher').length;
  const studentsCount = visibleUsers.filter(u => u.role === 'student').length;
  const subAdminsCount = visibleUsers.filter(u => u.role === 'subadmin').length;

  return (
    <div className="space-y-6">
      {/* Super Hidden Admin Security Banner (Owner Exclusive) */}
      {isSuperAdmin && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shrink-0">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-amber-300 uppercase tracking-wider">
                  Super Hidden Admin (System Owner Tier)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 text-[10px] font-mono font-bold">
                  Absolute RBAC Control
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                You possess unrestricted multi-tier authority: promote, demote, block, or delete subordinate regular Admins and staff. Your Super Admin account remains strictly concealed from regular administrators.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-amber-300">
              Account: {currentUser?.email || 'Owner'}
            </span>
          </div>
        </div>
      )}

      {actionNotice && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 font-semibold flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-indigo-400 hover:text-indigo-700 text-sm font-bold">✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>{isSuperAdmin ? 'Master Multi-Tier Administration' : 'Administrator Control Panel'}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User Account &amp; Staff Hierarchy Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {isSuperAdmin 
              ? 'Oversee all tiers: Administrators, Faculty, Sub-Admins, and Enrolled Scholars with full RBAC enforcement.'
              : 'Register teachers and students with assigned usernames, passwords, grades, and class sections.'}
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New User</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Visible Accounts</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">{visibleUsers.length}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Faculty, Staff &amp; Students</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider block">Teachers</span>
          <div className="text-2xl font-extrabold text-indigo-700 mt-1">{teachersCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Classroom Instructors</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wider block">Students</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{studentsCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Enrolled Cohorts</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-[11px] font-semibold text-purple-600 uppercase tracking-wider block">Sub-Admins</span>
          <div className="text-2xl font-extrabold text-purple-700 mt-1">{subAdminsCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Staff with Granular Roles</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by full name, username, or administrative title..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="all">All Roles</option>
              <option value="teacher">Teachers</option>
              <option value="student">Students</option>
              <option value="subadmin">Staff Sub-Admins</option>
            </select>

            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="all">All Grades</option>
              {GRADES.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:bg-white"
            >
              <option value="all">All Sections</option>
              {SECTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users List - Mobile Phone Card View (sm:hidden) and Desktop Table View (hidden sm:block) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredUsers.length > 0 ? (
          <>
            {/* Phone Card View */}
            <div className="block sm:hidden divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">{u.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${
                            u.role === 'teacher'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {u.role === 'teacher' ? 'Teacher' : 'Student'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {u.grade} • {u.section}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteUser(u.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                      title="Remove User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mobile Credentials Card */}
                  <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-slate-400 font-medium">User:</span>
                        <span className="font-mono font-bold text-indigo-700">{u.username}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px]">
                        <span className="text-slate-400 font-medium">Pass:</span>
                        <span className="font-mono text-slate-600">{u.password || '••••••••'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                        title="Edit User and Assigned Classes"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Edit</span>
                      </button>

                      <button
                        onClick={() => handleCopyCredentials(u)}
                        className="px-2.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-indigo-700 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        {copiedId === u.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Teacher Assigned Classes Badges on Mobile */}
                  {u.role === 'teacher' && (
                    <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center gap-1 font-semibold text-slate-600">
                        <Layers className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Assigned Classes ({u.subject || 'All Subjects'}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {u.assignedClasses && u.assignedClasses.length > 0 ? (
                          u.assignedClasses.map(ac => (
                            <span key={ac.grade} className="px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-md text-[10px] font-semibold">
                              {ac.grade}: {ac.sections.join(', ')}
                            </span>
                          ))
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px]">
                            {u.grade} • {u.section}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Assigned Username</th>
                    <th className="py-3.5 px-4">Assigned Password</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Assigned Grade(s) &amp; Section(s)</th>
                    <th className="py-3.5 px-4">Subject / Details</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-[11px] text-slate-600">
                            {u.name.charAt(0)}
                          </div>
                          <span>{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-indigo-700">
                        {u.username}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {u.password || '••••••••'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            u.role === 'super_admin'
                              ? 'bg-amber-500/10 text-amber-700 border-amber-300 font-bold'
                              : u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : u.role === 'subadmin'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : u.role === 'teacher'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {u.role === 'super_admin' ? '👑 Super Admin' : u.role === 'admin' ? 'Administrator' : u.role === 'subadmin' ? (u.subAdminTitle || 'Sub-Admin') : u.role === 'teacher' ? 'Teacher' : 'Student'}
                          </span>
                          {u.isBlocked && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                              Suspended
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium max-w-xs">
                        {u.role === 'teacher' && u.assignedClasses && u.assignedClasses.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {u.assignedClasses.map(ac => (
                              <span key={ac.grade} className="px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded text-[11px] font-medium whitespace-nowrap">
                                <span className="font-bold">{ac.grade}</span>: {ac.sections.join(', ')}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span>{u.grade || 'Campus-wide'} • <span className="font-semibold text-slate-900">{u.section || 'General'}</span></span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {u.role === 'teacher' ? (u.subject || 'All Subjects') : u.role === 'admin' ? 'Administrative Tier' : 'Enrolled Scholar'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Super Admin Tier Actions: Promote to Admin or Demote Admin */}
                          {isSuperAdmin && u.role !== 'super_admin' && (
                            <>
                              {u.role === 'admin' ? (
                                <button
                                  onClick={() => {
                                    const res = demoteAdmin(u.id);
                                    if (res.success) setActionNotice(`Demoted ${u.name} from Administrator to Faculty.`);
                                    else alert(res.error);
                                  }}
                                  className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Demote Administrator to Faculty"
                                >
                                  <ArrowDownCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    const res = promoteToAdmin(u.id);
                                    if (res.success) setActionNotice(`Promoted ${u.name} to Administrator with RBAC access.`);
                                    else alert(res.error);
                                  }}
                                  className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Promote User to Regular Administrator"
                                >
                                  <Crown className="w-4 h-4" />
                                </button>
                              )}

                              {/* Block / Unblock User */}
                              <button
                                onClick={() => {
                                  const res = toggleBlockUser(u.id);
                                  if (res.success) setActionNotice(`${u.name} status updated: ${u.isBlocked ? 'Reinstated' : 'Suspended'}.`);
                                  else alert(res.error);
                                }}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  u.isBlocked 
                                    ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50' 
                                    : 'text-amber-600 hover:text-rose-700 hover:bg-rose-50'
                                }`}
                                title={u.isBlocked ? "Reinstate Account" : "Suspend/Block Account"}
                              >
                                {u.isBlocked ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit User and Class Assignments"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleCopyCredentials(u)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Copy Login Credentials to Clipboard"
                          >
                            {copiedId === u.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete Account (protected by Super Admin rules) */}
                          {(isSuperAdmin || u.role !== 'admin') && u.role !== 'super_admin' && (
                            <button
                              onClick={() => deleteUser(u.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Remove User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Users className="w-10 h-10 mx-auto text-slate-300" />
            <h3 className="font-bold text-slate-700 text-sm">No Registered Users Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              The system currently has no teachers or students registered. Click "Register New User" above to create student and teacher logins with specific grades and sections.
            </p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Register New Account</h3>
                <p className="text-xs text-slate-500">Create login credentials with grade and section assignment.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      role === 'student'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('teacher')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      role === 'teacher'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Teacher / Faculty
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Elena Rostova or Dr. Gregory Thorne"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. elena.rostova"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Password</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="e.g. Elena#2026"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Student Single Grade & Section vs Teacher Multi-Grade & Multi-Section */}
              {role === 'student' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Enrolled Grade</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                    >
                      {GRADES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Enrolled Section</label>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                    >
                      {SECTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Subject Taught</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                    >
                      {SUBJECTS.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Multi-Grade &amp; Multi-Section Assignments
                      </label>
                      <span className="text-[11px] text-slate-400">Select all grades &amp; sections taught</span>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {GRADES.map(g => {
                        const assignedSections = teacherAssignedClasses[g] || [];
                        const allSelected = SECTIONS.every(s => assignedSections.includes(s));

                        return (
                          <div key={g} className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">{g}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (allSelected) {
                                    setTeacherAssignedClasses(prev => {
                                      const copy = { ...prev };
                                      delete copy[g];
                                      return copy;
                                    });
                                  } else {
                                    setTeacherAssignedClasses(prev => ({
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
                                    onClick={() => toggleSectionForGrade(g, s, false)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-all ${
                                      isChecked
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs font-semibold'
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
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Create &amp; Assign Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Edit Account • {editingUser.role === 'teacher' ? 'Teacher Class Assignment' : 'Student Record'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingUser.role === 'teacher' 
                    ? 'Configure multiple grades and multiple sections for this teacher.' 
                    : 'Modify student account details, grade level, and section.'}
                </p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {editFormError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{editFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="text"
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              {editingUser.role === 'student' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Grade</label>
                    <select
                      value={editGrade}
                      onChange={(e) => setEditGrade(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                    >
                      {GRADES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Section</label>
                    <select
                      value={editSection}
                      onChange={(e) => setEditSection(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                    >
                      {SECTIONS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Subject Taught</label>
                    <select
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                    >
                      {SUBJECTS.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Assigned Multi-Grades &amp; Multi-Sections
                      </label>
                      <span className="text-[11px] text-indigo-600 font-medium">Select grades and sections for this teacher</span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      {GRADES.map(g => {
                        const assignedSections = editTeacherAssignedClasses[g] || [];
                        const allSelected = SECTIONS.every(s => assignedSections.includes(s));

                        return (
                          <div key={g} className="p-2.5 bg-white rounded-lg border border-slate-200/80 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800">{g}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (allSelected) {
                                    setEditTeacherAssignedClasses(prev => {
                                      const copy = { ...prev };
                                      delete copy[g];
                                      return copy;
                                    });
                                  } else {
                                    setEditTeacherAssignedClasses(prev => ({
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
                                    onClick={() => toggleSectionForGrade(g, s, true)}
                                    className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-all ${
                                      isChecked
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-300 shadow-2xs font-semibold'
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
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
