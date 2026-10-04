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
  Square
} from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const { users, createUser, updateUser, deleteUser } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'teacher' | 'student'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');

  // Form state for creating
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
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
  const [editGrade, setEditGrade] = useState('');
  const [editSection, setEditSection] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editTeacherAssignedClasses, setEditTeacherAssignedClasses] = useState<Record<string, string[]>>({});
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Copy feedback state
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      grade: primaryGrade,
      section: primarySection,
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
      grade: primaryGrade,
      section: primarySection,
      assignedClasses,
      subject: editingUser.role === 'teacher' ? editSubject : undefined,
    });

    setEditingUser(null);
  };

  const handleCopyCredentials = (u: AppUser) => {
    const classInfo = u.assignedClasses && u.assignedClasses.length > 0
      ? u.assignedClasses.map(ac => `${ac.grade}: ${ac.sections.join(', ')}`).join('; ')
      : `${u.grade} - ${u.section}`;

    const text = `Prime LMS Account Credentials:\nName: ${u.name}\nRole: ${u.role}\nAssigned Classes: ${classInfo}\nUsername: ${u.username}\nPassword: ${u.password}`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesGrade = gradeFilter === 'all' || u.grade === gradeFilter;
    const matchesSection = sectionFilter === 'all' || u.section === sectionFilter;
    return matchesSearch && matchesRole && matchesGrade && matchesSection;
  });

  const teachersCount = users.filter(u => u.role === 'teacher').length;
  const studentsCount = users.filter(u => u.role === 'student').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Super Administrator Control</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            User Account Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Register teachers and students with assigned usernames, passwords, grades, and class sections.
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Registered</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">{users.length}</div>
          <p className="text-xs text-slate-500 mt-0.5">Faculty &amp; Students</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wider block">Teachers</span>
          <div className="text-2xl font-extrabold text-indigo-700 mt-1">{teachersCount}</div>
          <p className="text-xs text-slate-500 mt-0.5">Instructors with Class Access</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block">Students</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{studentsCount}</div>
          <p className="text-xs text-slate-500 mt-0.5">Enrolled across Grades &amp; Sections</p>
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
              placeholder="Search by full name or username..."
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
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          u.role === 'teacher'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {u.role === 'teacher' ? 'Teacher' : 'Student'}
                        </span>
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
                          <span>{u.grade} • <span className="font-semibold text-slate-900">{u.section}</span></span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {u.role === 'teacher' ? (u.subject || 'All Subjects') : 'Enrolled Scholar'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
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
                          <button
                            onClick={() => deleteUser(u.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
