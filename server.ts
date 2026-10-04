import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Endpoint: Study Assistant / Tutor for students (with Summer Break Mode and Anti-Cheating)
app.post('/api/ai/tutor', async (req: Request, res: Response) => {
  try {
    const { subject, question, gradeLevel, conversationHistory, isSummerBreakMode } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const currentMonth = new Date().getMonth(); // 6 = July, 7 = August
    const isSummerTime = isSummerBreakMode === true || currentMonth === 6 || currentMonth === 7;

    const historyPrompt = Array.isArray(conversationHistory) && conversationHistory.length > 0
      ? `Prior context:\n${conversationHistory.map((m: any) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n')}\n\n`
      : '';

    let systemInstruction = `You are Prime AI, an elite pedagogical study assistant for students and teachers at Prime LMS.
SUBJECT: ${subject || 'Academic Studies'}. LEVEL: ${gradeLevel || 'High School'}.

CRITICAL ANTI-CHEATING & HOMEWORK RESTRICTION POLICY (STRICTLY ENFORCED):
1. STRICT PROHIBITION: You are EXPLICITLY FORBIDDEN from directly solving student homework problems, test questions, or assignment prompts, and from providing final numerical answers, completed code solutions, or full essay drafts to be copied.
2. If a student presents a homework problem (e.g., "Solve this: 3x^2 + 5x - 2 = 0", "Write an essay about the causes of WWI for my class", "What is the answer to question 4?", "Do my homework for me"):
   - DO NOT provide the direct answer or final solution.
   - POLITELY AND FIRMLY STATE: "I'm here to help you learn, so I cannot solve your homework questions or provide direct answers. Let's work through the core concept together so you can solve it yourself!"
   - BREAK DOWN THE CONCEPT: Explain the fundamental theorem, rule, formula, or historical background clearly.
   - PROVIDE AN ANALOGOUS PRACTICE EXAMPLE: Demonstrate the technique using DIFFERENT numbers or a parallel scenario.
   - ASK A GUIDING SOCRATIC QUESTION: Ask the student what their first step would be or what formula applies.
3. Your tone must be supportive, encouraging, and focused on active learning, critical thinking, and mastery.
4. Format responses with clean Markdown headers, bullet points, and code/math blocks.`;

    if (isSummerTime) {
      systemInstruction += `\n\nSPECIAL SUMMER BREAK MODE (ACTIVE):
- SUMMER MENTOR PERSONA: In Summer Break Mode, shift your focus to supporting personal projects, creative ideas, coding, building prototypes, science experiments, or independent curiosity-driven learning based on the student's personal interests.
- REVIEW SHEETS & PRACTICE: If a student asks for review material, step-by-step review sheets, or practice quizzes for their upcoming grade level (${gradeLevel || 'next grade'}), enthusiastically generate structured, engaging, and interactive review sheets with conceptual explanations, practice problems (with hidden/step-by-step guidance), and key tips so they stay sharp without feeling overwhelmed by heavy traditional homework.
- Maintain the strict anti-cheating guard if they ask to solve specific graded assignments.`;
    }

    const prompt = `${historyPrompt}Current Student Request: "${question}"\n\n${isSummerTime ? '[Summer Break Mode Active]' : ''} Please provide an encouraging, pedagogical response.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'I could not generate an answer at this moment. Please try again.';
    res.json({ reply, isSummerMode: isSummerTime });
  } catch (error: any) {
    console.error('AI Tutor Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to process AI tutoring request',
      fallback: 'Our AI tutor is temporarily busy. Please review course notes or try again shortly.'
    });
  }
});

// AI Endpoint: Formal Disciplinary Notice & Letter Generator for Administrators
app.post('/api/ai/disciplinary-notice', async (req: Request, res: Response) => {
  try {
    const { studentName, studentGrade, studentSection, noticeType, reason, duration, issuedBy } = req.body;

    if (!studentName || !reason) {
      return res.status(400).json({ error: 'Student name and reason are required' });
    }

    const noticeTitles: Record<string, string> = {
      warning: 'OFFICIAL WRITTEN DISCIPLINARY WARNING NOTICE',
      suspension: 'NOTICE OF FORMAL SUSPENSION & BEHAVIORAL INTERVENTION',
      expulsion: 'FORMAL NOTICE OF EXPULSION & DISCIPLINARY DETERMINATION',
    };

    const title = noticeTitles[noticeType] || 'OFFICIAL DISCIPLINARY NOTICE';

    const systemInstruction = `You are the Senior Legal & Administrative Compliance Officer at Prime LMS Academic Institution.
Generate an official, professional, formal Disciplinary Notice in clean Markdown format with an institutional letterhead feel.
Structure of the formal notice:
1. Institutional Header: "PRIME ACADEMIC INSTITUTION • OFFICE OF THE DEAN & SUPERINTENDENT"
2. Date, Formal Reference ID, and Recipient Details (Student: ${studentName}, Grade: ${studentGrade || 'Enrolled'}, Section: ${studentSection || 'Class Section'})
3. Official Notice Title: "${title}"
4. Statement of Incident & Policy Infraction: Articulate the cited violation clearly based on the administrator's incident description. Cite relevant sections of the Student Code of Conduct and Institutional Standards.
5. Action Mandated & Disciplinary Terms: Clearly state the penalty (${noticeType.toUpperCase()}) and exact duration/conditions (${duration || 'Immediate effect'}).
6. Required Remediation & Mandatory Behavioral Conditions: Clear milestones required before reinstatement or removal of the warning.
7. Parental/Guardian Notification & Right to Administrative Hearing/Appeal: Detail the scheduled conference window and formal right of appeal within 5 business days.
8. Official Signatures:
   - Super Administrator: ${issuedBy || 'Prime Super Administrator'}
   - Institutional Disciplinary Board`;

    const prompt = `Draft the formal disciplinary notice for:
- Student: ${studentName} (${studentGrade} - ${studentSection})
- Notice Type: ${noticeType} (${title})
- Incident Reason & Facts: "${reason}"
- Disciplinary Duration: ${duration || 'Notice on Record'}
- Issuing Authority: ${issuedBy || 'Super Administrator'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    const formalLetter = response.text || 'Unable to generate disciplinary notice.';
    res.json({ formalLetter, title });
  } catch (error: any) {
    console.error('AI Disciplinary Notice Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate formal disciplinary letter',
    });
  }
});

// AI Endpoint: Lesson Plan & Rubric Generator for Teachers
app.post('/api/ai/lesson-plan', async (req: Request, res: Response) => {
  try {
    const { topic, gradeLevel, subject, duration, learningObjectives } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const systemInstruction = `You are an elite Curriculum Developer and Master Teacher specialized in pedagogy, active learning, and formative assessment.
Generate a structured, classroom-ready Lesson Plan in clean Markdown. Include:
1. Lesson Overview & Standards / Objectives (Measurable Bloom's taxonomy outcomes)
2. Materials & Preparation
3. Bell-Ringer / Hook (5 mins)
4. Direct Instruction & Conceptual Modeling
5. Collaborative Student Activity / Guided Practice
6. Formative Assessment Quiz (3 multi-choice or short-response questions with solutions)
7. 4-Level Evaluation Rubric (Exemplary, Proficient, Developing, Beginning)
8. Differentiation Strategies (Support & Extension for high achievers)`;

    const prompt = `Create a comprehensive lesson plan for:
- Subject: ${subject || 'General'}
- Topic: "${topic}"
- Target Grade: ${gradeLevel || 'Grade 10'}
- Duration: ${duration || '50 minutes'}
${learningObjectives ? `- Special Focus Objectives: ${learningObjectives}` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const lessonPlan = response.text || 'Unable to generate lesson plan.';
    res.json({ lessonPlan });
  } catch (error: any) {
    console.error('AI Lesson Plan Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate lesson plan',
    });
  }
});

// AI Endpoint: Behavioral & Academic Insights for Administrators
app.post('/api/ai/behavioral-insights', async (req: Request, res: Response) => {
  try {
    const { stats, attendanceRate, riskStudents, topAchievers, recentEvents } = req.body;

    const systemInstruction = `You are an advanced Educational Analytics Advisor for school super administrators and principals.
Analyze school-wide attendance, grade trends, and behavioral metrics, then generate an executive, actionable briefing in Markdown:
1. Executive Health Scorecard (Summary of school operational vitality)
2. Key Positive Highlights & Commendations (Celebrating wins & student engagement)
3. Early Warning & Intervention Alerts (Identified patterns needing counseling or academic support)
4. Strategic Administrative Action Plan (3 concrete, actionable initiatives for the upcoming week)`;

    const prompt = `Analyze this school dataset:
- Total Enrolled Students: ${stats?.students || 450}
- Faculty Staff: ${stats?.teachers || 32}
- Overall Attendance Rate: ${attendanceRate || '94.2%'}
- Students Flagged for Academic/Attendance Intervention: ${JSON.stringify(riskStudents || ['Alex Rivera (Algebra II)', 'Sam Taylor (Chemistry)'])}
- Top Academic & Engagement Stars: ${JSON.stringify(topAchievers || ['Sophia Chen', 'Marcus Vance', 'Elena Rostova'])}
- Recent Campus Highlights: ${recentEvents || 'Mid-term exams concluded, Science Fair submission deadline approaching.'}

Provide a high-impact, professional executive summary.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const insights = response.text || 'Unable to generate insights at this moment.';
    res.json({ insights });
  } catch (error: any) {
    console.error('AI Insights Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate executive insights',
    });
  }
});

// Mount Vite middleware in development or serve static build in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
