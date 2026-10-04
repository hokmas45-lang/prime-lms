import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { ChatMessage } from '../../types';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  ShieldCheck, 
  X,
  AlertCircle,
  Sun,
  Compass
} from 'lucide-react';

interface PrimeAiChatbotProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const PrimeAiChatbot: React.FC<PrimeAiChatbotProps> = ({ isModal = false, onClose }) => {
  const { currentUser, logAiInteraction } = useData();

  const isTeacher = currentUser?.role === 'teacher';
  const isStudent = currentUser?.role === 'student';

  // July (month 6) or August (month 7) auto-activation
  const currentMonth = new Date().getMonth();
  const isSummerCalendar = currentMonth === 6 || currentMonth === 7;
  const [isSummerBreakMode, setIsSummerBreakMode] = useState<boolean>(isSummerCalendar);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: isTeacher 
        ? `Hello ${currentUser?.name || 'Instructor'}! I am your Prime AI Assistant. I can help you draft quiz questions, structure assignments, write rubrics, or create lesson plans. How can I assist your teaching today?`
        : isSummerBreakMode
        ? `☀️ Hello ${currentUser?.name || 'Scholar'}! Summer Break Mode is active. Whether you are building an independent coding project, exploring creative ideas, or preparing review sheets for next year, I'm here to mentor and guide your journey step-by-step!`
        : `Hello ${currentUser?.name || 'Scholar'}! I am your Prime AI Study Assistant. I am here to explain concepts step-by-step and guide your thinking without directly solving your homework. What topic or problem can we explore together?`,
      timestamp: 'Just now',
    }
  ]);

  const quickPrompts = isTeacher ? [
    "Draft 3 multiple choice quiz questions on Newton's Laws with answer keys.",
    "Suggest a 45-minute lesson plan outline for quadratic equations.",
    "Give me an evaluation rubric for a biology lab report.",
  ] : isSummerBreakMode ? [
    "Brainstorm a fun Python coding or robotics project for summer.",
    "Generate a friendly review sheet for my upcoming grade level math.",
    "Help me design an independent science or creative writing experiment.",
    "Explain quantum physics fundamentals in an exciting, intuitive way.",
  ] : [
    "Explain the difference between mitosis and meiosis in simple terms.",
    "Can you guide me through how to factor quadratic expressions?",
    "How do I structure a thesis statement for a history paper?",
  ];

  const handleSend = async (customPrompt?: string) => {
    const query = customPrompt || inputQuery;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const endpoint = isTeacher ? '/api/ai/lesson-plan' : '/api/ai/tutor';
      const payload = isTeacher ? {
        topic: query.trim(),
        subject: currentUser?.subject || 'General Education',
        gradeLevel: currentUser?.grade || 'High School',
        duration: '45 mins',
      } : {
        question: query.trim(),
        subject: currentUser?.subject || 'Academic Studies',
        gradeLevel: currentUser?.grade || 'Grade 10',
        conversationHistory: chatMessages.slice(-4),
        isSummerBreakMode,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const replyText = data.reply || data.lessonPlan || data.fallback || 'I have analyzed your request.';

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setChatMessages(prev => [...prev, botMsg]);

      // Log interaction for Admin Monitoring & Moderation
      logAiInteraction(query.trim(), replyText, currentUser?.subject);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        text: 'The AI assistant is momentarily offline. Please try your question again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = isModal
    ? "fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[480px] sm:h-[620px] bg-white sm:rounded-2xl border border-slate-200 shadow-2xl z-50 flex flex-col overflow-hidden"
    : "bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[calc(100dvh-175px)] sm:h-[650px] overflow-hidden";

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">Prime AI Assistant</h3>
            <p className="text-[11px] text-indigo-100 font-medium">
              Powered by Gemini 3.8 Flash • {isTeacher ? 'Faculty Studio' : 'Guided Socratic Tutor'}
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Anti-Cheating & Integrity Guard Banner */}
      {isStudent && (
        <div className="px-3.5 py-1.5 bg-amber-50 border-b border-amber-200/60 text-amber-900 text-[11px] font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>Anti-Cheating Guard: Socratic guidance only — direct homework answers strictly prohibited.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsSummerBreakMode(prev => !prev)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors flex items-center gap-1 shrink-0 ${
              isSummerBreakMode 
                ? 'bg-amber-100 text-amber-900 border-amber-300' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Toggle Summer Break Mode (automatically enabled in July & August)"
          >
            <Sun className={`w-3 h-3 ${isSummerBreakMode ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
            <span>{isSummerBreakMode ? 'Summer Mode ON' : 'Summer Mode OFF'}</span>
          </button>
        </div>
      )}

      {/* Summer Break Mode Special Callout Banner */}
      {isStudent && isSummerBreakMode && (
        <div className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-b border-amber-200/60 text-amber-900 text-[11px] font-medium flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Summer Break Mode: Project mentoring, independent coding, and next-grade review sheets active!</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 text-xs">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed space-y-1 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                  : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
              }`}
            >
              <div className={`text-[10px] font-semibold opacity-70 flex justify-between gap-3 ${
                msg.role === 'user' ? 'text-indigo-100' : 'text-slate-400'
              }`}>
                <span>{msg.role === 'user' ? (currentUser?.name || 'You') : 'Prime AI'}</span>
                <span>{msg.timestamp}</span>
              </div>
              <div className="whitespace-pre-wrap font-normal text-xs">
                {msg.text}
              </div>
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-500 w-fit shadow-xs">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Guiding concept step-by-step...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        <span className="text-[10px] font-bold uppercase text-slate-400 px-1 shrink-0">Try:</span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-slate-600 font-medium truncate max-w-[200px] shrink-0 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder={isTeacher ? "Ask to generate a quiz, rubric, or lesson..." : "Ask any study question..."}
          className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
