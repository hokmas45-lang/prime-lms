import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { TargetClassItem } from '../../types';
import { GRADES, SECTIONS } from '../../lib/constants';
import { 
  Megaphone, 
  Plus, 
  Clock, 
  Trash2, 
  Pin,
  Layers,
  CheckSquare,
  Square,
  Globe
} from 'lucide-react';

export const AnnouncementsModule: React.FC = () => {
  const { currentUser, announcements, postAnnouncement, deleteAnnouncement } = useData();

  if (!currentUser) return null;

  const canPost = currentUser.role === 'admin' || currentUser.role === 'teacher';
  const isStudent = currentUser.role === 'student';

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'general' | 'academic' | 'urgent'>('general');
  const [content, setContent] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [isSchoolWide, setIsSchoolWide] = useState(false);

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

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    let targetClasses: TargetClassItem[] | undefined = undefined;
    if (!isSchoolWide) {
      targetClasses = [];
      Object.entries(targetClassSelection).forEach(([gradeName, sections]) => {
        sections.forEach(sec => {
          targetClasses!.push({ grade: gradeName, section: sec });
        });
      });

      if (targetClasses.length === 0) {
        alert('Please choose at least one target Grade/Section or check "School-wide Broadcast".');
        return;
      }
    }

    postAnnouncement({
      title: title.trim(),
      content: content.trim(),
      category,
      targetClasses,
      targetGrade: targetClasses && targetClasses.length > 0 ? targetClasses[0].grade : 'All',
      targetSection: targetClasses && targetClasses.length > 0 ? targetClasses[0].section : 'All',
    });

    setTitle('');
    setContent('');
    setIsSchoolWide(false);
    setShowModal(false);
  };

  const filtered = announcements.filter(a => {
    const matchesCat = filterCat === 'all' || a.category === filterCat;
    if (!matchesCat) return false;

    if (isStudent) {
      // If targeted to specific classes, must match student's grade & section
      if (a.targetClasses && a.targetClasses.length > 0) {
        return a.targetClasses.some(tc => tc.grade === currentUser.grade && tc.section === currentUser.section);
      }
      // If targetGrade specified and not All
      if (a.targetGrade && a.targetGrade !== 'All' && a.targetGrade !== currentUser.grade) {
        return false;
      }
      if (a.targetSection && a.targetSection !== 'All' && a.targetSection !== currentUser.section) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <Megaphone className="w-4 h-4" />
            <span>Campus Communication</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Announcements &amp; Advisories
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official institutional updates, academic schedules, and notices.
          </p>
        </div>

        {canPost && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Post Announcement</span>
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        {['all', 'general', 'academic', 'urgent'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all border ${
              filterCat === cat
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Announcements List */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((ann) => (
            <div
              key={ann.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                ann.category === 'urgent'
                  ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                  : 'bg-white border-slate-200/80 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      ann.category === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : ann.category === 'academic'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {ann.category}
                    </span>
                    {ann.targetClasses && ann.targetClasses.length > 0 ? (
                      ann.targetClasses.map((tc, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-[10px] font-medium border border-indigo-200">
                          {tc.grade} • {tc.section}
                        </span>
                      ))
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>School-wide</span>
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {ann.createdAt}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900">{ann.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>By: <strong className="text-slate-700">{ann.authorName}</strong></span>
                {canPost && (
                  <button
                    onClick={() => deleteAnnouncement(ann.id)}
                    className="p-1 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-2">
          <Megaphone className="w-10 h-10 mx-auto text-slate-300" />
          <p className="font-semibold text-slate-700 text-xs">No announcements published.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">New Announcement</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 text-sm font-bold">✕</button>
            </div>

            <form onSubmit={handlePost} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Schedule Update or Campus Event"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                >
                  <option value="general">General Notice</option>
                  <option value="academic">Academic / Curricular</option>
                  <option value="urgent">Urgent Advisory</option>
                </select>
              </div>

              {/* Target Audience: School-wide vs Targeted Cohorts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700">Target Audience</label>
                  <label className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSchoolWide}
                      onChange={(e) => setIsSchoolWide(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Broadcast School-wide</span>
                  </label>
                </div>

                {!isSchoolWide && (
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    {GRADES.map(g => {
                      const assignedSections = targetClassSelection[g] || [];
                      const allSelected = SECTIONS.every(s => assignedSections.includes(s));

                      return (
                        <div key={g} className="p-2 bg-white rounded-lg border border-slate-200/80 space-y-1">
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
                              {allSelected ? 'Deselect' : 'Select All'}
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
                                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium border flex items-center gap-1 transition-all ${
                                    isChecked
                                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold shadow-2xs'
                                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                  }`}
                                >
                                  {isChecked ? (
                                    <CheckSquare className="w-3 h-3 text-indigo-600" />
                                  ) : (
                                    <Square className="w-3 h-3 text-slate-400" />
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
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message Body</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailed information for scholars and teachers..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
