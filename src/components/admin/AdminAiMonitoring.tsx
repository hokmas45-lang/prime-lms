import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { 
  Bot, 
  Search, 
  Filter, 
  ShieldAlert, 
  Trash2, 
  Clock, 
  User, 
  CheckCircle, 
  AlertTriangle,
  Sparkles,
  BookOpen,
  ArrowLeft
} from 'lucide-react';
import { GRADES, SECTIONS } from '../../lib/constants';

export const AdminAiMonitoring: React.FC = () => {
  const { aiInteractions, deleteAiInteraction, clearAiInteractions } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  const filteredInteractions = aiInteractions.filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.response.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = gradeFilter === 'all' || item.grade === gradeFilter;
    const matchesSection = sectionFilter === 'all' || item.section === sectionFilter;
    const matchesFlag = !flaggedOnly || item.flagged;
    return matchesSearch && matchesGrade && matchesSection && matchesFlag;
  });

  const flaggedCount = aiInteractions.filter(i => i.flagged).length;
  const activeDetail = aiInteractions.find(i => i.id === selectedInteractionId) || filteredInteractions[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>AI Safety &amp; Academic Integrity Oversight</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            AI Chat Monitoring &amp; Moderation
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Real-time audit log of all student and faculty interactions with the Prime AI assistant to ensure academic honesty and pedagogical compliance.
          </p>
        </div>

        {aiInteractions.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Clear all stored AI interaction logs?')) {
                clearAiInteractions();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl text-xs font-semibold transition-all shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear Logs</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total AI Queries</span>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">{aiInteractions.length}</div>
          <p className="text-xs text-slate-500 mt-0.5">Logged student &amp; teacher sessions</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider block">Homework / Integrity Flags</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{flaggedCount}</div>
          <p className="text-xs text-slate-500 mt-0.5">Direct answer requests blocked by filter</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider block">Anti-Cheating Policy</span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">100%</div>
          <p className="text-xs text-slate-500 mt-0.5">System prompt restrictions active</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transcripts by student name, prompt question, or keyword..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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

          <button
            onClick={() => setFlaggedOnly(!flaggedOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              flaggedOnly 
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs' 
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Flagged Only ({flaggedCount})
          </button>
        </div>
      </div>

      {/* Main Split: Interaction List and Full Transcript View */}
      {filteredInteractions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Interactions (Hidden on mobile if viewing transcript detail) */}
          <div className={`${mobileDetailOpen ? 'hidden lg:block' : 'block'} bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-2 max-h-[600px] overflow-y-auto`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 block mb-2">
              Interaction Sessions ({filteredInteractions.length})
            </span>

            {filteredInteractions.map((item) => {
              const isSelected = activeDetail?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setSelectedInteractionId(item.id);
                    setMobileDetailOpen(true);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all space-y-1.5 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 truncate max-w-[140px]">{item.studentName}</span>
                    {item.flagged ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                        <AlertTriangle className="w-3 h-3" /> Flagged
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 font-medium line-clamp-2">
                    "{item.prompt}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
                    <span>{item.grade ? `${item.grade} (${item.section})` : item.role}</span>
                    <span>{item.subject}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Transcript Detail (Visible on desktop or when mobileDetailOpen is true on mobile) */}
          <div className={`${!mobileDetailOpen ? 'hidden lg:flex' : 'flex'} lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 flex-col justify-between space-y-4`}>
            {activeDetail ? (
              <div className="space-y-4 sm:space-y-5">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
                  <div className="space-y-1">
                    {/* Mobile Back Button */}
                    <button
                      onClick={() => setMobileDetailOpen(false)}
                      className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mb-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to Interaction List</span>
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{activeDetail.studentName}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                        {activeDetail.role}
                      </span>
                      {activeDetail.flagged && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Integrity Flagged
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activeDetail.grade} • {activeDetail.section} • Subject: {activeDetail.subject} • {new Date(activeDetail.timestamp).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteAiInteraction(activeDetail.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    title="Remove interaction log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Prompt block */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Student Prompt / Query
                  </span>
                  <p className="text-xs text-slate-900 font-semibold leading-relaxed">
                    {activeDetail.prompt}
                  </p>
                </div>

                {/* AI Response block */}
                <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Prime AI Pedagogical Response
                    </span>
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-800 font-semibold">
                      Socratic Guided Response
                    </span>
                  </div>
                  <div className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-normal max-h-[300px] overflow-y-auto">
                    {activeDetail.response}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-3">
          <Bot className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="font-bold text-slate-700 text-sm">No AI Chat Logs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When students or teachers interact with the Prime AI assistant, all sessions are automatically recorded here for institutional monitoring and academic integrity review.
          </p>
        </div>
      )}
    </div>
  );
};
