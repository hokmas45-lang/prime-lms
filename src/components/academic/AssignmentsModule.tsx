import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Assignment, TargetClassItem } from '../../types';
import { GRADES, SECTIONS, SUBJECTS } from '../../lib/constants';
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  Upload, 
  Trash2, 
  Image as ImageIcon,
  X,
  ExternalLink,
  Maximize2,
  CheckSquare,
  Square,
  Layers
} from 'lucide-react';

export const AssignmentsModule: React.FC = () => {
  const { 
    currentUser, 
    assignments, 
    submissions, 
    createAssignment, 
    deleteAssignment,
    submitAssignment, 
    gradeSubmission 
  } = useData();

  if (!currentUser) return null;

  const isTeacher = currentUser.role === 'teacher';
  const isAdmin = currentUser.role === 'admin';
  const isStudent = currentUser.role === 'student';

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState(currentUser.subject || SUBJECTS[0]);
  const [dueDate, setDueDate] = useState('2026-10-25');
  const [maxScore, setMaxScore] = useState(100);

  // Targeted publishing state: map grade -> sections array
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

  // Student submission modal state with Image Upload
  const [activeSubmittingAssignment, setActiveSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);

  // Preview full image modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Teacher grading modal state
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradingScore, setGradingScore] = useState(90);
  const [gradingFeedback, setGradingFeedback] = useState('');

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

  // Filter assignments based on targeted publishing
  const visibleAssignments = isStudent
    ? assignments.filter(a => {
        if (a.targetClasses && a.targetClasses.length > 0) {
          return a.targetClasses.some(tc => tc.grade === currentUser.grade && tc.section === currentUser.section);
        }
        return a.grade === currentUser.grade && (a.section === currentUser.section || a.section === 'All Sections');
      })
    : isTeacher
    ? assignments.filter(a => {
        if (a.teacherId === currentUser.id) return true;
        if (currentUser.assignedClasses && currentUser.assignedClasses.length > 0) {
          return currentUser.assignedClasses.some(ac => 
            (a.targetClasses && a.targetClasses.some(tc => tc.grade === ac.grade && ac.sections.includes(tc.section))) ||
            (a.grade === ac.grade && ac.sections.includes(a.section))
          );
        }
        return a.grade === currentUser.grade && a.section === currentUser.section;
      })
    : assignments;

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Build targetClasses array
    const targetClasses: TargetClassItem[] = [];
    Object.entries(targetClassSelection).forEach(([gradeName, sections]) => {
      sections.forEach(sec => {
        targetClasses.push({ grade: gradeName, section: sec });
      });
    });

    if (targetClasses.length === 0) {
      alert('Please select at least one target Grade and Section for this assignment.');
      return;
    }

    const primaryGrade = targetClasses[0].grade;
    const primarySection = targetClasses[0].section;

    createAssignment({
      title: title.trim(),
      description: description.trim(),
      subject,
      grade: primaryGrade,
      section: primarySection,
      targetClasses,
      dueDate,
      maxScore: Number(maxScore),
    });

    setTitle('');
    setDescription('');
    setShowCreateModal(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmittingAssignment || (!submissionContent.trim() && !uploadedImageBase64)) {
      alert('Please provide written answers or attach an image.');
      return;
    }

    submitAssignment(
      activeSubmittingAssignment.id, 
      submissionContent.trim() || 'Attached handwritten document / diagram.', 
      attachmentUrl.trim() || undefined,
      uploadedImageBase64 || undefined
    );

    setActiveSubmittingAssignment(null);
    setSubmissionContent('');
    setAttachmentUrl('');
    setUploadedImageBase64(null);
  };

  const handleTeacherGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmissionId) return;

    gradeSubmission(gradingSubmissionId, Number(gradingScore), gradingFeedback.trim() || undefined);
    setGradingSubmissionId(null);
    setGradingScore(90);
    setGradingFeedback('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Coursework &amp; Academic Tasks</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isStudent ? 'My Class Assignments' : 'Assignments Hub'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isStudent 
              ? `Filtered for your enrolled class: ${currentUser.grade} • ${currentUser.section}. Direct image uploads supported.`
              : 'Create, distribute, and grade assignments targeted by grade and class section with image upload review.'}
          </p>
        </div>

        {(isTeacher || isAdmin) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Assignment</span>
          </button>
        )}
      </div>

      {/* Assignments List */}
      {visibleAssignments.length > 0 ? (
        <div className="space-y-4">
          {visibleAssignments.map((asg) => {
            const mySubmission = submissions.find(s => s.assignmentId === asg.id && s.studentId === currentUser.id);
            const classSubmissions = submissions.filter(s => s.assignmentId === asg.id);

            return (
              <div
                key={asg.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                        {asg.subject}
                      </span>
                      {asg.targetClasses && asg.targetClasses.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          {asg.targetClasses.map((tc, idx) => (
                            <span key={`${tc.grade}_${tc.section}_${idx}`} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200">
                              {tc.grade} • {tc.section}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                          {asg.grade} • {asg.section}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        Due {asg.dueDate}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 mt-1">{asg.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl whitespace-pre-wrap">
                      {asg.description}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium pt-1">
                      Posted by: <strong className="text-slate-700">{asg.teacherName}</strong>
                    </p>
                  </div>

                  <div className="flex flex-col sm:items-end justify-between gap-2 shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-xs font-bold text-slate-700 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
                      {asg.maxScore} Max Points
                    </span>

                    {/* Student View Action */}
                    {isStudent && (
                      mySubmission ? (
                        mySubmission.status === 'graded' ? (
                          <div className="text-left sm:text-right w-full sm:w-auto">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              Graded: {mySubmission.score} / {asg.maxScore}
                            </span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-medium text-xs border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Submitted (Pending Review)
                          </span>
                        )
                      ) : (
                        <button
                          onClick={() => {
                            setActiveSubmittingAssignment(asg);
                            setUploadedImageBase64(null);
                          }}
                          className="w-full sm:w-auto justify-center px-3.5 py-2 sm:py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Submit Work &amp; Attach Image</span>
                        </button>
                      )
                    )}

                    {(isTeacher || isAdmin) && (
                      <button
                        onClick={() => deleteAssignment(asg.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Student Submission preview with attached image */}
                {isStudent && mySubmission && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Your Submitted Work:</span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(mySubmission.submittedAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-700 italic">"{mySubmission.content}"</p>

                    {mySubmission.imageUrl && (
                      <div className="pt-2">
                        <span className="text-[11px] font-semibold text-slate-500 block mb-1">Attached Photo / Diagram:</span>
                        <div className="relative inline-block border border-slate-300 rounded-lg overflow-hidden group cursor-pointer" onClick={() => setPreviewImageUrl(mySubmission.imageUrl || null)}>
                          <img 
                            src={mySubmission.imageUrl} 
                            alt="Uploaded handwritten answers" 
                            className="w-32 h-32 object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-semibold">
                            <Maximize2 className="w-4 h-4 mr-1" /> View Image
                          </div>
                        </div>
                      </div>
                    )}

                    {mySubmission.feedback && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <span className="font-semibold text-indigo-700">Teacher Feedback:</span>
                        <p className="italic text-slate-600 mt-0.5">"{mySubmission.feedback}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Teacher / Admin: Review Submissions Section */}
                {(isTeacher || isAdmin) && (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-xs font-semibold text-slate-500 block">
                      Student Submissions ({classSubmissions.length})
                    </span>

                    {classSubmissions.length > 0 ? (
                      <div className="space-y-2.5">
                        {classSubmissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-1.5 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-900">{sub.studentName}</span>
                                <span className="text-slate-400">({sub.grade} - {sub.section})</span>
                                <span className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${
                                  sub.status === 'graded'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {sub.status === 'graded' ? `Score: ${sub.score} / ${asg.maxScore}` : 'Pending Review'}
                                </span>
                              </div>
                              <p className="text-slate-600 italic">"{sub.content}"</p>

                              {/* Student Uploaded Image Preview */}
                              {sub.imageUrl && (
                                <div className="pt-1 flex items-center gap-2">
                                  <button
                                    onClick={() => setPreviewImageUrl(sub.imageUrl || null)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-indigo-600 font-semibold text-xs shadow-2xs"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    <span>View Student Attached Photo</span>
                                  </button>
                                  <span className="text-[11px] text-slate-400">(Handwritten Notes / Diagram)</span>
                                </div>
                              )}

                              {sub.feedback && (
                                <p className="text-indigo-600 text-[11px]">Feedback: {sub.feedback}</p>
                              )}
                            </div>

                            <button
                              onClick={() => {
                                setGradingSubmissionId(sub.id);
                                setGradingScore(sub.score || 90);
                                setGradingFeedback(sub.feedback || '');
                              }}
                              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs shrink-0"
                            >
                              {sub.status === 'graded' ? 'Edit Grade' : 'Grade Submission'}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No student submissions received yet.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-3">
          <FileText className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-sm">No Assignments Active</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {isStudent 
              ? `There are currently no assignments posted for ${currentUser.grade} (${currentUser.section}).`
              : 'No assignments have been posted yet. Click "Create New Assignment" above to assign coursework.'}
          </p>
        </div>
      )}

      {/* Student Submit Modal with Direct Media/Image Upload */}
      {activeSubmittingAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Submit Assignment</h3>
                <p className="text-xs text-slate-500">{activeSubmittingAssignment.title}</p>
              </div>
              <button
                onClick={() => setActiveSubmittingAssignment(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Written Answers / Description
                </label>
                <textarea
                  rows={4}
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Enter your answers, summary, methodology notes, or refer to attached image below..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Direct Media/Image Upload Area */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Attach Photo of Handwritten Work, Diagrams, or Notes
                </label>
                
                {uploadedImageBase64 ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={uploadedImageBase64} 
                        alt="Uploaded preview" 
                        className="w-14 h-14 object-cover rounded-lg border border-slate-200"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">Image Attached</span>
                        <span className="text-[11px] text-emerald-600 font-medium">Ready to send to teacher</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedImageBase64(null)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mb-2 transition-colors">
                      <ImageIcon className="w-5 h-5 text-slate-500 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600">
                      Click to upload an image file
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      PNG, JPG, or WEBP (photos of homework, diagrams, formulas)
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Project Document URL
                </label>
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or project link"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveSubmittingAssignment(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Send Work to Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Image Viewer Lightbox */}
      {previewImageUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors z-10"
            >
              ✕
            </button>
            <img 
              src={previewImageUrl} 
              alt="Uploaded student handwritten work" 
              className="max-h-[82vh] w-auto object-contain rounded-xl mx-auto"
            />
          </div>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Create New Assignment</h3>
                <p className="text-xs text-slate-500">Post an assignment targeted to a specific grade and section.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Quadratic Equations Problem Set 3"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
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
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Score</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Guidelines &amp; Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail instructions, problems, deliverables, or submission criteria..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Grade Modal */}
      {gradingSubmissionId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Grade Student Submission</h3>
              <button
                onClick={() => setGradingSubmissionId(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTeacherGrade} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Score / Points</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="500"
                  value={gradingScore}
                  onChange={(e) => setGradingScore(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback &amp; Comments (Optional)</label>
                <textarea
                  rows={3}
                  value={gradingFeedback}
                  onChange={(e) => setGradingFeedback(e.target.value)}
                  placeholder="Provide constructive feedback for the student..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingSubmissionId(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
