import React, { useState, useEffect, useRef } from "react";
import { 
  Code2, Bot, Compass, Terminal, FileText, History, 
  BarChart3, LogOut, Sparkles, CheckCircle2, ChevronRight,
  User, Lock, Mail, ArrowRight, Copy, Check,
  Send, Upload, Award, AlertCircle, RefreshCw,
  Menu, X, Paperclip, FileCode, FileUp, BookOpen, GraduationCap, Trash2, Flame, Plus
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("home");
  const [selectedLang, setSelectedLang] = useState("Python");
  const [codePrompt, setCodePrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const [dailyStreak, setDailyStreak] = useState(1);
  const [coderFileName, setCoderFileName] = useState("");

  const [searchHistory, setSearchHistory] = useState([]);
  const [notesList, setNotesList] = useState([]);
  const [roadmapSteps, setRoadmapSteps] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);

  // --- MULTI-CHAT STATES (AI Mentor History) ---
  const [mentorChats, setMentorChats] = useState([
    {
      id: 1,
      title: "New Chat",
      messages: [
        { sender: "ai", text: "Hello! I am your SynapseAura AI Teacher & Mentor. You can ask any academic or technical doubts, upload question images, or request mathematical derivations. I will explain everything in clear, structured steps." }
      ]
    }
  ]);
  const [activeChatId, setActiveChatId] = useState(1);

  const [selectedGrade, setSelectedGrade] = useState("Class 10");
  const [selectedSubject, setSelectedSubject] = useState("Science / EVS");
  const [customNoteQuery, setCustomNoteQuery] = useState("");
  const [notesFileName, setNotesFileName] = useState("");
  const [activeNoteModal, setActiveNoteModal] = useState(null);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [mentorInput, setMentorInput] = useState("");
  const [mentorFileName, setMentorFileName] = useState("");
  const [mentorFileBase64, setMentorFileBase64] = useState("");
  const chatEndRef = useRef(null);

  const [roadmapRole, setRoadmapRole] = useState("Fullstack Web Developer");
  const [customGoal, setCustomGoal] = useState("");
  const [roadmapFileName, setRoadmapFileName] = useState("");

  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Fullstack Developer");
  const [fileName, setFileName] = useState("");

  const getDefaultRoadmap = () => [
    { id: 1, title: "HTML, CSS & Modern Tailwind", completed: false },
    { id: 2, title: "JavaScript ES6+ & TypeScript Basics", completed: false },
    { id: 3, title: "React.js & State Management", completed: false },
    { id: 4, title: "Backend API (Node.js/Express or Python)", completed: false },
    { id: 5, title: "Database (Supabase / PostgreSQL)", completed: false },
    { id: 6, title: "Deployment & Fullstack Project Portfolio", completed: false }
  ];

  const getDefaultChat = () => [
    {
      id: 1,
      title: "New Chat",
      messages: [
        { sender: "ai", text: "Hello! I am your SynapseAura AI Teacher & Mentor. You can ask any academic or technical doubts, upload question images, or request mathematical derivations. I will explain everything in clear, structured steps." }
      ]
    }
  ];

  const loadUserDataForEmail = (email) => {
    const rawData = localStorage.getItem(`synapseaura_data_${email.toLowerCase()}`);

    const todayStr = new Date().toISOString().slice(0, 10);
    const lastActiveKey = `synapseaura_last_active_${email.toLowerCase()}`;
    const streakKey = `synapseaura_streak_${email.toLowerCase()}`;
    const lastActiveStr = localStorage.getItem(lastActiveKey);
    let calculatedStreak = parseInt(localStorage.getItem(streakKey) || "1", 10);

    if (!lastActiveStr) {
      localStorage.setItem(lastActiveKey, todayStr);
      localStorage.setItem(streakKey, "1");
      calculatedStreak = 1;
    } else if (lastActiveStr !== todayStr) {
      const lastDate = new Date(lastActiveStr);
      const currentDate = new Date(todayStr);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        calculatedStreak = calculatedStreak + 1;
      } else {
        calculatedStreak = 1;
      }
      localStorage.setItem(streakKey, calculatedStreak.toString());
      localStorage.setItem(lastActiveKey, todayStr);
    }
    setDailyStreak(calculatedStreak);

    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        setNotesList(parsed.notesList || []);
        setSearchHistory(parsed.searchHistory || []);
        setRoadmapSteps(parsed.roadmapSteps || getDefaultRoadmap());
        if (parsed.mentorChats && parsed.mentorChats.length > 0) {
          setMentorChats(parsed.mentorChats);
          setActiveChatId(parsed.mentorChats[0].id);
        } else {
          setMentorChats(getDefaultChat());
          setActiveChatId(1);
        }
        setAnalysisResult(parsed.analysisResult || null);
        return;
      } catch (err) {
        console.error("Data parse error", err);
      }
    }

    setNotesList([]);
    setSearchHistory([]);
    setRoadmapSteps(getDefaultRoadmap());
    setMentorChats(getDefaultChat());
    setActiveChatId(1);
    setAnalysisResult(null);
  };

  const syncCurrentUserData = (overrides = {}) => {
    if (!user?.email) return;
    const emailKey = `synapseaura_data_${user.email.toLowerCase()}`;
    const payload = {
      notesList,
      searchHistory,
      roadmapSteps,
      mentorChats,
      analysisResult,
      dailyStreak,
      ...overrides
    };
    localStorage.setItem(emailKey, JSON.stringify(payload));
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("synapseaura_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      loadUserDataForEmail(parsedUser.email);
    }
  }, []);

  const currentChat = mentorChats.find(c => c.id === activeChatId) || mentorChats[0];
  const chatMessages = currentChat ? currentChat.messages : [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (!authEmail || !authPassword) return;

    const userData = {
      name: authName || authEmail.split("@")[0],
      email: authEmail.trim().toLowerCase()
    };

    setUser(userData);
    localStorage.setItem("synapseaura_user", JSON.stringify(userData));
    loadUserDataForEmail(userData.email);
  };

  const handleLogout = () => {
    if (user?.email) {
      syncCurrentUserData();
    }
    setUser(null);
    localStorage.removeItem("synapseaura_user");
    setActiveTab("home");
  };

  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

  // --- NEW CHAT HANDLER ---
  const handleNewChat = () => {
    const newChatObj = {
      id: Date.now(),
      title: "New Chat",
      messages: [
        { sender: "ai", text: "Hello! I am your SynapseAura AI Teacher & Mentor. You can ask any academic or technical doubts, upload question images, or request mathematical derivations." }
      ]
    };
    const updatedChats = [newChatObj, ...mentorChats];
    setMentorChats(updatedChats);
    setActiveChatId(newChatObj.id);
    syncCurrentUserData({ mentorChats: updatedChats });
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
  };

  const handleDeleteChat = (e, id) => {
    e.stopPropagation();
    if (mentorChats.length <= 1) return;
    const updatedChats = mentorChats.filter(c => c.id !== id);
    setMentorChats(updatedChats);
    if (activeChatId === id) {
      setActiveChatId(updatedChats[0].id);
    }
    syncCurrentUserData({ mentorChats: updatedChats });
  };

  const handleMentorFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMentorFileName(file.name);

      const reader = new FileReader();
      reader.onload = (event) => {
        setMentorFileBase64(event.target.result);
      };
      reader.readAsDataURL(file);

      const updatedMessages = [
        ...chatMessages, 
        { sender: "user", text: `Attached file: ${file.name}` },
        { sender: "ai", text: `I have received the file "${file.name}". Please ask your specific question or let me know what you would like me to explain.` }
      ];

      const updatedChats = mentorChats.map(chat => {
        if (chat.id === activeChatId) {
          return { ...chat, messages: updatedMessages };
        }
        return chat;
      });

      setMentorChats(updatedChats);
      syncCurrentUserData({ mentorChats: updatedChats });
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    if (!mentorInput.trim() && !mentorFileBase64) return;

    const userText = mentorInput.trim();
    const tempUserMsg = { sender: "user", text: userText || `[Attached: ${mentorFileName}]` };
    const withUserMessages = [...chatMessages, tempUserMsg];

    const chatTitle = currentChat.title === "New Chat" && userText ? userText.slice(0, 24) + "..." : currentChat.title;

    const withPendingAi = [
      ...withUserMessages,
      { sender: "ai", text: "AI Teacher is analyzing and preparing a clear step-by-step solution..." }
    ];

    const updatedChatsWithPending = mentorChats.map(chat => {
      if (chat.id === activeChatId) {
        return { ...chat, title: chatTitle, messages: withPendingAi };
      }
      return chat;
    });

    setMentorChats(updatedChatsWithPending);
    setMentorInput("");

    const updatedHistory = [
      { id: Date.now(), type: "AI Mentor", query: userText || mentorFileName, time: "Just now" },
      ...searchHistory
    ];
    setSearchHistory(updatedHistory);
    syncCurrentUserData({ searchHistory: updatedHistory, mentorChats: updatedChatsWithPending });

    try {
      const systemInstruction = `You are SynapseAura AI, an expert school and college teacher.
STRICT RESPONSE RULES:
1. Always respond strictly in clear, natural English.
2. NEVER wrap theoretical, academic, or mathematical solutions inside code blocks (do NOT use triple backticks or single backticks).
3. Write solutions like a human teacher on a whiteboard using simple line breaks, numbered steps, and bullet points:
   - Problem Statement
   - Condition & Applicable Theorems
   - Step 1: Breakdown
   - Step 2: Step-by-step Calculation
   - Final Answer clearly stated
4. Write mathematical expressions directly in plain, readable text (e.g. f'(c) = [f(b) - f(a)] / [b - a]).
5. Maintain a helpful, respectful, and educational tone.`;

      const activeFreeModels = [
        "google/gemini-2.0-flash-lite-preview-02-05:free",
        "meta-llama/llama-3.2-11b-vision-instruct:free",
        "openrouter/auto"
      ];

      const formattedMessages = [
        { role: "system", content: systemInstruction },
        ...withUserMessages.slice(-6).map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text
        }))
      ];

      if (mentorFileBase64) {
        const lastMsg = formattedMessages[formattedMessages.length - 1];
        lastMsg.content = [
          { type: "text", text: userText || "Please explain and solve the problem from this attached image or file step-by-step in plain text." },
          { type: "image_url", image_url: { url: mentorFileBase64 } }
        ];
      }

      let aiReply = "";

      for (const modelId of activeFreeModels) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
              "HTTP-Referer": window.location.origin || "http://localhost:5173",
              "X-Title": "SynapseAura",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: modelId,
              messages: formattedMessages
            })
          });

          const data = await response.json();
          if (data.choices?.[0]?.message?.content) {
            aiReply = data.choices[0].message.content;
            break;
          }
        } catch (innerErr) {
          console.warn(`Model ${modelId} failed, trying next...`);
        }
      }

      if (!aiReply) {
        aiReply = "Unable to process the query. Please rephrase or submit your question again.";
      }

      const cleanOutput = aiReply
        .replace(/```[a-z]*\n?/gi, "")
        .replace(/```/g, "")
        .trim();

      setMentorFileBase64("");
      setMentorFileName("");

      const finalMessages = [
        ...withUserMessages,
        { sender: "ai", text: cleanOutput }
      ];

      const finalChats = mentorChats.map(chat => {
        if (chat.id === activeChatId) {
          return { ...chat, title: chatTitle, messages: finalMessages };
        }
        return chat;
      });

      setMentorChats(finalChats);
      syncCurrentUserData({ mentorChats: finalChats });
    } catch (err) {
      console.error("OpenRouter API Error:", err);
      const errorMessages = [
        ...withUserMessages,
        {
          sender: "ai",
          text: "Connection issue encountered. Please verify your internet connection."
        }
      ];
      const errorChats = mentorChats.map(chat => {
        if (chat.id === activeChatId) {
          return { ...chat, messages: errorMessages };
        }
        return chat;
      });
      setMentorChats(errorChats);
      syncCurrentUserData({ mentorChats: errorChats });
    }
  };

  const handleGenerateNotes = async (e) => {
    e.preventDefault();
    if (!customNoteQuery.trim()) return;

    setLoadingNotes(true);
    const query = customNoteQuery.trim();

    try {
      const systemPrompt = `You are a Senior Academic Professor and Elite Legal/Textbook Author. Your objective is to create exhaustive, multi-page, publication-grade academic or legal revision notes for students. Write extensively without summarizing or skipping details. Never use backticks (\`\`\`).`;

      const isLaw = selectedSubject === "LLB / Law (Legal Studies)";

      const userPrompt = isLaw 
        ? `Write a comprehensive, exhaustive, 4 to 5 page masterclass legal chapter on: "${query}".
Academic Target: ${selectedGrade} - ${selectedSubject}.

MANDATORY RULES:
1. Write in-depth paragraphs and complete detailed legal explanations for every subtopic.
2. Structure the content strictly with:
   - Legislative Intent & Statutory Provisions (Relevant Sections & Acts)
   - Landmark Case Laws & Judicial Precedents (Case name, facts, and court ruling)
   - Legal Principles & Doctrines
   - Analytical Case Scenarios & Exam Answers
3. Do NOT use backticks (\`\`\`). Keep formatting clean in plain English text.

PROVIDE EXTENSIVE DETAIL UNDER ALL 8 SECTIONS:
SECTION 1: INTRODUCTION & HISTORICAL EVOLUTION
SECTION 2: CORE STATUTORY PROVISIONS & SECTIONS
SECTION 3: LANDMARK CASE LAWS & JUDICIAL INTERPRETATIONS
SECTION 4: LEGAL DOCTRINES & THEORETICAL FRAMEWORK
SECTION 5: PRACTICAL APPLICATIONS & REAL-WORLD SCENARIOS
SECTION 6: LEGISLATIVE GAPS & CRITICAL ANALYSIS
SECTION 7: COMMON PITFALLS IN LEGAL DRAFTING & EXAMS
SECTION 8: HIGH-YIELD EXAM QUESTION BANK (WITH MOOT COURT STYLE MODEL ANSWERS)`
        : `Write a comprehensive, exhaustive, 4 to 5 page masterclass textbook chapter on: "${query}".
Academic Target: ${selectedGrade} - ${selectedSubject}.

MANDATORY RULES:
1. Write in-depth paragraphs and complete detailed explanations for every subtopic.
2. Write every mathematical equation, chemical formula, and law on dedicated single lines in clean, plain English text (e.g. 1 mol = 6.022 x 10^23 particles, F = m * a, p = m * v).
3. Do NOT break single variables or numbers into strange vertical lists. Keep all formulas accurate with units.

PROVIDE EXTENSIVE DETAIL UNDER ALL 8 SECTIONS:

SECTION 1: CHAPTER OVERVIEW & HISTORICAL CONTEXT
- In-depth theoretical background, discoveries, historical timeline, and foundational significance in ${selectedSubject}.

SECTION 2: CORE POSTULATES, DEFINITIONS & SCIENTIFIC PRINCIPLES
- Complete definitions of every fundamental term and underlying physical or chemical mechanism.

SECTION 3: COMPLETE FORMULA DIRECTORY & UNIT BREAKDOWN
- Exhaustive list of all governing formulas, equations, constants, and relations.
- State each variable, SI unit, dimensional formula, and validity conditions.

SECTION 4: STEP-BY-STEP MATHEMATICAL DERIVATIONS & PROOFS
- Write out the complete mathematical or conceptual derivation step-by-step with thorough logical explanations.

SECTION 5: REAL-WORLD PHENOMENA & PRACTICAL APPLICATIONS
- At least 4 to 5 detailed applications in modern engineering, laboratory experiments, industry, and daily life.

SECTION 6: SOLVED NUMERICAL PROBLEMS (ACADEMIC BENCHMARK)
- Problem 1 (Standard): Problem statement, given parameters, formula, complete arithmetic steps, final answer with units.
- Problem 2 (Advanced Exam Level): Multi-step calculation with intermediate steps shown clearly.
- Problem 3 (Conceptual Calculation): Full step-by-step resolution.

SECTION 7: COMMON PITFALLS & EXAM TRAPS
- Common conceptual mistakes students make in board/college exams and unit conversion errors.

SECTION 8: HIGH-YIELD EXAM QUESTION BANK
- 5 Short Answer Questions (with comprehensive model answers).
- 3 Long Essay-type Analytical Questions (with complete marking-scheme style solutions).`;

      const modelsToTry = [
        "google/gemini-2.0-flash-lite-preview-02-05:free",
        "meta-llama/llama-3.2-11b-vision-instruct:free",
        "openrouter/auto"
      ];

      let aiContent = "";

      for (const mId of modelsToTry) {
        try {
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
              "HTTP-Referer": window.location.origin || "http://localhost:5173",
              "X-Title": "SynapseAura",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              model: mId,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
              ]
            })
          });

          const data = await response.json();
          if (data.choices?.[0]?.message?.content) {
            aiContent = data.choices[0].message.content;
            break;
          }
        } catch (innerErr) {
          console.warn(`Model ${mId} failed, trying next...`);
        }
      }

      if (!aiContent || aiContent.length < 200) {
        throw new Error("Empty response received from AI models");
      }

      const cleanContent = aiContent
        .replace(/```[a-z]*\n?/gi, "")
        .replace(/```/g, "")
        .trim();

      const newNote = {
        id: Date.now(),
        title: query,
        grade: selectedGrade,
        subject: selectedSubject,
        summary: `Exhaustive 4-5 page chapter guide for ${query} (${selectedGrade} - ${selectedSubject}) with derivations, formula directory, solved numericals, and exam questions.`,
        content: cleanContent
      };

      const updatedNotes = [newNote, ...notesList];
      const updatedHistory = [
        { id: Date.now(), type: "Notes", query: `${selectedGrade}: ${query}`, time: "Just now" },
        ...searchHistory
      ];

      setNotesList(updatedNotes);
      setSearchHistory(updatedHistory);
      syncCurrentUserData({ notesList: updatedNotes, searchHistory: updatedHistory });
      setCustomNoteQuery("");
    } catch (err) {
      console.error("Notes generation error:", err);
      alert("Note generate karne mein dikkat aayi. Please dobara click karein.");
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleDeleteNote = (id) => {
    const updatedNotes = notesList.filter((note) => note.id !== id);
    setNotesList(updatedNotes);
    syncCurrentUserData({ notesList: updatedNotes });
    if (activeNoteModal?.id === id) {
      setActiveNoteModal(null);
    }
  };

  const handleNotesFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setNotesFileName(file.name);
      const uploadedNote = {
        id: Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        grade: selectedGrade,
        subject: selectedSubject,
        summary: `Uploaded document for ${selectedGrade} - ${selectedSubject}. Ready for offline study.`,
        content: `DOCUMENT FILE: ${file.name}\nSize: ${(file.size / 1024).toFixed(1)} KB\nUploaded: Just now\n\nThis document is ready for offline reading and quick revision.`
      };
      const updatedNotes = [uploadedNote, ...notesList];
      setNotesList(updatedNotes);
      syncCurrentUserData({ notesList: updatedNotes });
    }
  };

  const handleCoderFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoderFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        setGeneratedCode(content);
        setCodePrompt(`Uploaded file: ${file.name}`);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateCode = () => {
    if (!codePrompt) return;

    const query = codePrompt.toLowerCase();
    let output = "";

    if (query.includes("hello world") || query.includes("hello")) {
      switch (selectedLang) {
        case "Python": output = `# Python 3\nprint("Hello, World!")`; break;
        case "C++": output = `// C++\n#include <iostream>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}`; break;
        case "JavaScript": output = `// JavaScript\nconsole.log("Hello, World!");`; break;
        case "TypeScript": output = `// TypeScript\nconst message: string = "Hello, World!";\nconsole.log(message);`; break;
        case "Java": output = `// Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`; break;
        case "Go": output = `// Go Lang\npackage main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}`; break;
        case "SQL": output = `-- SQL\nSELECT 'Hello, World!' AS message;`; break;
        default: output = `print("Hello, World!")`;
      }
    } else {
      switch (selectedLang) {
        case "Python": output = `# Python Solution for: ${codePrompt}\ndef solve():\n    # Logic here\n    pass\n\nsolve()`; break;
        case "C++": output = `// C++ Solution for: ${codePrompt}\n#include <iostream>\n\nint main() {\n    return 0;\n}`; break;
        case "JavaScript": output = `// JavaScript Solution for: ${codePrompt}\nfunction solve() {\n    // Logic\n}\n\nsolve();`; break;
        default: output = `// ${selectedLang} Solution for: ${codePrompt}`;
      }
    }

    setGeneratedCode(output);
    const updatedHistory = [
      { id: Date.now(), type: "Code", query: codePrompt, time: "Just now" },
      ...searchHistory
    ];
    setSearchHistory(updatedHistory);
    syncCurrentUserData({ searchHistory: updatedHistory });
  };

  const handleRoadmapFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setRoadmapFileName(file.name);
      setCustomGoal(`Roadmap based on ${file.name}`);
      const uploadedSteps = [
        { id: 1, title: `${file.name}: Module 1 - Core Foundations`, completed: false },
        { id: 2, title: `${file.name}: Module 2 - Advanced Architecture`, completed: false },
        { id: 3, title: `${file.name}: Module 3 - Practical Case Study`, completed: false },
        { id: 4, title: `${file.name}: Module 4 - Final Project`, completed: false }
      ];
      setRoadmapSteps(uploadedSteps);
      syncCurrentUserData({ roadmapSteps: uploadedSteps });
    }
  };

  const handleGenerateRoadmap = (e) => {
    e.preventDefault();
    const target = customGoal.trim() || roadmapRole;

    const generated = [
      { id: 1, title: `${target}: Basics & Core Syntax`, completed: false },
      { id: 2, title: `Data Structures & Essential Problem Solving`, completed: false },
      { id: 3, title: `Frameworks & Production Tooling for ${target}`, completed: false },
      { id: 4, title: `API Integration, State & Database Ops`, completed: false },
      { id: 5, title: `Production Capstone Project & Deployment`, completed: false }
    ];

    const updatedHistory = [
      { id: Date.now(), type: "Roadmap", query: target, time: "Just now" },
      ...searchHistory
    ];

    setRoadmapSteps(generated);
    setSearchHistory(updatedHistory);
    syncCurrentUserData({ roadmapSteps: generated, searchHistory: updatedHistory });
  };

  const toggleRoadmapStep = (id) => {
    const updatedSteps = roadmapSteps.map((step) => 
      step.id === id ? { ...step, completed: !step.completed } : step
    );
    setRoadmapSteps(updatedSteps);
    syncCurrentUserData({ roadmapSteps: updatedSteps });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setResumeText(
        `Skills: React, JavaScript, HTML, CSS, Git, Basic SQL\nProjects: Weather App, Portfolio Website\nExperience: 6 Months Student Intern\nEducation: BCA / B.Tech Computer Science`
      );
    }
  };

  const handleAnalyzeResume = () => {
    if (!resumeText.trim()) return;

    const lower = resumeText.toLowerCase();
    const skillsFound = [];
    const missingSkills = [];

    const expected = ["react", "javascript", "python", "sql", "git", "docker", "typescript", "tailwind"];

    expected.forEach((skill) => {
      if (lower.includes(skill)) {
        skillsFound.push(skill.toUpperCase());
      } else {
        missingSkills.push(skill.toUpperCase());
      }
    });

    const score = Math.min(95, Math.max(45, Math.round((skillsFound.length / expected.length) * 100)));

    const result = {
      score,
      skillsFound,
      missingSkills,
      strengths: "Clean formatting, foundational web stack mentioned.",
      suggestions: "Include quantifiable project metrics and GitHub links."
    };

    const updatedHistory = [
      { id: Date.now(), type: "Resume", query: `ATS Score: ${score}% for ${targetRole}`, time: "Just now" },
      ...searchHistory
    ];

    setAnalysisResult(result);
    setSearchHistory(updatedHistory);
    syncCurrentUserData({ analysisResult: result, searchHistory: updatedHistory });
  };

  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gradeOptions = [
    "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
    "Class 11 (Science)", "Class 11 (Commerce)", "Class 11 (Arts)",
    "Class 12 (Science)", "Class 12 (Commerce)", "Class 12 (Arts)",
    "Undergraduate (B.Tech / BCA / B.Sc)", "Undergraduate (B.Com / B.A / BBA)",
    "Postgraduate (M.Tech / MCA / M.Sc)", "Postgraduate (MBA / M.Com / M.A)"
  ];

  const completedRoadmapSteps = roadmapSteps.filter((s) => s.completed).length;
  const roadmapPercentage = Math.round((completedRoadmapSteps / (roadmapSteps.length || 1)) * 100);
  const codeQueriesCount = searchHistory.filter((i) => i.type === "Code").length;
  const aiMentorQueriesCount = searchHistory.filter((i) => i.type === "AI Mentor").length;
  const totalNotesCount = notesList.length;
  const resumeAtsScore = analysisResult ? analysisResult.score : 0;

  const overallLearningIndex = Math.min(
    100,
    Math.round(
      (roadmapPercentage * 0.35) + 
      (Math.min(dailyStreak, 30) * 1) + 
      (Math.min(totalNotesCount, 10) * 1.5) + 
      (Math.min(codeQueriesCount + aiMentorQueriesCount, 10) * 1.5) + 
      (resumeAtsScore * 0.2)
    )
  );

  if (!user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-between p-6 sm:p-12 lg:px-20 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/bg.png')" }}
      >
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"></div>

        <div className="hidden lg:flex flex-col justify-center max-w-xl relative z-10 text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold w-fit tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen EdTech Platform
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
            Learn & Excel with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">SynapseAura</span>
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            Class 1 to PG comprehensive notes, live web search extraction, code assistant, AI mentor tutor, career roadmaps, and ATS resume scanner.
          </p>
        </div>

        <div className="w-full max-w-md ml-auto bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl rounded-2xl p-8 sm:p-10 shadow-2xl relative z-10 overflow-hidden">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
              <Code2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">SynapseAura</h2>
            <p className="text-slate-400 text-sm mt-1">
              {authMode === "login" ? "Sign in to your account" : "Create a new account and get started"}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "signup" && (
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-3 cursor-pointer"
            >
              {authMode === "login" ? "Sign In" : "Create Account"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            {authMode === "login" ? (
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => setAuthMode("signup")}
                  className="text-indigo-400 hover:underline font-medium cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setAuthMode("login")}
                  className="text-indigo-400 hover:underline font-medium cursor-pointer"
                >
                  Log In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans relative overflow-x-hidden">
      
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 mr-2">
                  {activeNoteModal.grade}
                </span>
                <span className="text-xs text-slate-400">{activeNoteModal.subject}</span>
                <h3 className="text-lg font-bold text-white mt-1">{activeNoteModal.title}</h3>
              </div>
              <button 
                onClick={() => setActiveNoteModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans bg-slate-900/60">
              {activeNoteModal.content || activeNoteModal.summary}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <button
                onClick={() => handleDeleteNote(activeNoteModal.id)}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Note
              </button>
              <button
                onClick={() => setActiveNoteModal(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold tracking-tight text-white leading-tight">SynapseAura</h2>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">EdTech AI</span>
              </div>
            </div>

            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {[
              { id: "home", label: "Home Dashboard", icon: Sparkles },
              { id: "notes", label: "Class 1 to PG Notes", icon: BookOpen },
              { id: "quickcoder", label: "Synapse Coder", icon: Terminal },
              { id: "mentor", label: "AI Mentor", icon: Bot },
              { id: "roadmap", label: "Roadmap Maker", icon: Compass },
              { id: "resume", label: "Resume Analyser", icon: FileText },
              { id: "tracker", label: "Progress Tracker", icon: BarChart3 },
              { id: "history", label: "Search History", icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      <main 
        className="flex-1 p-6 md:p-8 overflow-y-auto w-full bg-cover bg-center relative flex flex-col justify-between"
        style={activeTab === "home" ? { backgroundImage: "url('/home-bg.png')" } : {}}
      >
        {activeTab === "home" && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] pointer-events-none z-0"></div>
        )}

        <div className="relative z-10 flex-1">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-800 mb-6 gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500/50 hover:bg-slate-800 cursor-pointer flex items-center gap-2 transition-all shadow-md"
              >
                <Menu className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-semibold hidden sm:inline">Menu</span>
              </button>

              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white capitalize">
                  {activeTab === "home" ? "Welcome back, " + user.name : activeTab === "notes" ? "Class 1 to PG Study Notes" : activeTab.replace("-", " ")}
                </h1>
                <p className="text-sm text-slate-400">SynapseAura Intelligent Educational Ecosystem</p>
              </div>
            </div>
          </header>

          {activeTab === "home" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
                  <span className="text-xs text-slate-400 font-medium">Daily Streak</span>
                  <p className="text-3xl font-bold text-indigo-400 mt-1 flex items-center gap-2">
                    <Flame className="w-7 h-7 text-amber-500 fill-amber-500 animate-pulse" />
                    {dailyStreak} {dailyStreak === 1 ? "Day" : "Days"}
                  </p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
                  <span className="text-xs text-slate-400 font-medium">Notes Available</span>
                  <p className="text-3xl font-bold text-amber-400 mt-1">{totalNotesCount} Notes</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
                  <span className="text-xs text-slate-400 font-medium">Milestones Completed</span>
                  <p className="text-3xl font-bold text-emerald-400 mt-1">
                    {completedRoadmapSteps} of {roadmapSteps.length}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  onClick={() => setActiveTab("notes")}
                  className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 p-5 rounded-2xl cursor-pointer transition-all backdrop-blur-md"
                >
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl w-fit mb-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-white">Class 1 to PG Notes</h4>
                  <p className="text-xs text-slate-400 mt-1">Live AI textbook syllabus extraction, chapter derivations, and document uploads.</p>
                </div>

                <div 
                  onClick={() => setActiveTab("quickcoder")}
                  className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-2xl cursor-pointer transition-all backdrop-blur-md"
                >
                  <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-3">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-white">Synapse Coder</h4>
                  <p className="text-xs text-slate-400 mt-1">Multi-language code generator and direct file editing support.</p>
                </div>

                <div 
                  onClick={() => setActiveTab("mentor")}
                  className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-5 rounded-2xl cursor-pointer transition-all backdrop-blur-md"
                >
                  <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit mb-3">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-white">AI Mentor Tutor</h4>
                  <p className="text-xs text-slate-400 mt-1">Direct interactive AI answers questions, images, and documents in English.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-amber-400" />
                      Class 1 to Post Graduation (PG) Notes Hub
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Type any chapter/topic to generate AI textbook-grade revision notes, or attach your personal notes.
                    </p>
                  </div>

                  <div>
                    <input
                      type="file"
                      id="notesFileUpload"
                      className="hidden"
                      onChange={handleNotesFileUpload}
                      accept=".pdf,.txt,.doc,.docx"
                    />
                    <label 
                      htmlFor="notesFileUpload"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-amber-500/40 rounded-xl text-xs text-amber-400 cursor-pointer font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      {notesFileName ? notesFileName : "Upload PDF/Document Notes"}
                    </label>
                  </div>
                </div>

                <form onSubmit={handleGenerateNotes} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Class / Standard</label>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {gradeOptions.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Subject</label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Science / EVS">Science / EVS</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="Social Science / History">Social Science / History</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Computer Science / IT">Computer Science / IT</option>
                      <option value="English Literature">English Literature</option>
                      <option value="Economics / Accountancy">Economics / Accountancy</option>
                      <option value="Engineering & Data Science">Engineering & Data Science</option>
                      <option value="LLB / Law (Legal Studies)">LLB / Law (Legal Studies)</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-slate-400 font-medium block mb-1">Chapter / Topic Name</label>
                      <input
                        type="text"
                        value={customNoteQuery}
                        onChange={(e) => setCustomNoteQuery(e.target.value)}
                        placeholder="e.g. Mole concept, Newton's laws of motion, Constitutional Law..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loadingNotes}
                      className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 cursor-pointer shrink-0 transition-all"
                    >
                      {loadingNotes ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Generating Notes...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Fetch & Generate
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notesList.map((note) => (
                  <div key={note.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl flex flex-col justify-between group transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {note.grade}
                        </span>
                        
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          title="Delete note"
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <h4 className="font-semibold text-white text-base mb-2">{note.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3">{note.summary}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {note.subject}
                      </span>
                      <button 
                        onClick={() => setActiveNoteModal(note)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
                      >
                        Read Full Content <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "quickcoder" && (
            <div className="space-y-5">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {["Python", "JavaScript", "TypeScript", "C++", "Java", "Go", "SQL"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        selectedLang === lang
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>

                <div>
                  <input
                    type="file"
                    id="coderFile"
                    className="hidden"
                    onChange={handleCoderFileUpload}
                    accept=".py,.js,.jsx,.ts,.tsx,.cpp,.c,.java,.sql,.html,.css"
                  />
                  <label 
                    htmlFor="coderFile"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-indigo-400 cursor-pointer font-medium"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    {coderFileName ? coderFileName : "Upload Code File"}
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={codePrompt}
                  onChange={(e) => setCodePrompt(e.target.value)}
                  placeholder="Describe problem (e.g. write a hello world program)"
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleGenerateCode}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Generate
                </button>
              </div>

              {generatedCode && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden mt-4">
                  <div className="flex justify-between items-center px-4 py-2.5 bg-slate-950/70 border-b border-slate-800 text-xs text-slate-400">
                    <span>Output ({selectedLang})</span>
                    <button 
                      onClick={handleCopyCode} 
                      className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy Code"}
                    </button>
                  </div>
                  <pre className="p-4 text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                    {generatedCode}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* --- AI MENTOR WITH CHAT HISTORY SIDEBAR & NEW CHAT --- */}
          {activeTab === "mentor" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[680px]">
              {/* Chat History Sidebar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between lg:col-span-1 shadow-xl">
                <div>
                  <button
                    onClick={handleNewChat}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 mb-4 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> New Chat
                  </button>

                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">Chat History</p>
                  
                  <div className="space-y-1.5 overflow-y-auto max-h-[480px] pr-1">
                    {mentorChats.map((chat) => (
                      <div
                        key={chat.id}
                        onClick={() => handleSelectChat(chat.id)}
                        className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                          chat.id === activeChatId
                            ? "bg-slate-800 text-indigo-400 border border-slate-700"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/60"
                        }`}
                      >
                        <span className="truncate flex-1">{chat.title}</span>
                        {mentorChats.length > 1 && (
                          <button
                            onClick={(e) => handleDeleteChat(e, chat.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-rose-400 transition-opacity"
                            title="Delete chat"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 text-center">
                  Saved locally in browser
                </div>
              </div>

              {/* Main Chat Interface */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col lg:col-span-3 overflow-hidden shadow-xl">
                <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{currentChat?.title || "AI Mentor"}</h3>
                      <p className="text-xs text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span> Multi-modal Active • Clear English Output
                      </p>
                    </div>
                  </div>

                  {mentorFileName && (
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/20 flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5" /> {mentorFileName}
                    </span>
                  )}
                </div>

                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                          msg.sender === "user" 
                            ? "bg-indigo-600 text-white rounded-br-none shadow-md font-sans" 
                            : "bg-slate-950 border border-slate-800/90 text-slate-100 rounded-bl-none shadow-lg font-sans whitespace-pre-wrap selection:bg-indigo-500"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 flex gap-2 overflow-x-auto text-xs">
                  <button 
                    onClick={() => setMentorInput("Explain Lagrange Mean Value Theorem (LMVT) with a step-by-step example")} 
                    className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    LMVT Theorem
                  </button>
                  <button 
                    onClick={() => setMentorInput("Explain this problem step by step with clear calculations")} 
                    className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    Step-by-Step Solution
                  </button>
                  <button 
                    onClick={() => setMentorInput("Explain Newton's Laws of Motion with formulas and everyday examples")} 
                    className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    Newton's Laws
                  </button>
                </div>

                <form onSubmit={handleSendChatMessage} className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center gap-2">
                  <input
                    type="file"
                    id="mentorFile"
                    className="hidden"
                    onChange={handleMentorFileUpload}
                    accept="image/*,.pdf,.txt,.js,.py,.cpp,.html"
                  />
                  <label 
                    htmlFor="mentorFile" 
                    className="p-2.5 bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-xl text-slate-400 hover:text-indigo-400 cursor-pointer transition-colors"
                    title="Attach image or problem file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </label>

                  <input
                    type="text"
                    value={mentorInput}
                    onChange={(e) => setMentorInput(e.target.value)}
                    placeholder="Ask a question or attach a problem file (English)..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                  <button 
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl cursor-pointer flex items-center justify-center transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "roadmap" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-white">Create Learning Roadmap</h3>
                    <p className="text-xs text-slate-400">Select a target role, enter a custom goal, or upload your syllabus.</p>
                  </div>

                  <div>
                    <input
                      type="file"
                      id="roadmapFile"
                      className="hidden"
                      onChange={handleRoadmapFileUpload}
                      accept=".pdf,.txt,.doc,.docx"
                    />
                    <label 
                      htmlFor="roadmapFile"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-indigo-500/40 rounded-xl text-xs text-indigo-400 cursor-pointer font-medium"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {roadmapFileName ? roadmapFileName : "Upload Course/Syllabus File"}
                    </label>
                  </div>
                </div>

                <form onSubmit={handleGenerateRoadmap} className="flex flex-col md:flex-row gap-3">
                  <select
                    value={roadmapRole}
                    onChange={(e) => setRoadmapRole(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Fullstack Web Developer">Fullstack Web Developer</option>
                    <option value="Frontend Specialist (React)">Frontend Specialist (React)</option>
                    <option value="Backend Developer (Node / Python)">Backend Developer (Node / Python)</option>
                    <option value="Data Structures & Algorithms">Data Structures & Algorithms (DSA)</option>
                    <option value="AI & Machine Learning Engineer">AI & Machine Learning Engineer</option>
                  </select>

                  <input
                    type="text"
                    value={customGoal}
                    onChange={(e) => setCustomGoal(e.target.value)}
                    placeholder="Or enter custom goal..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" /> Generate Roadmap
                  </button>
                </form>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-white">Active Roadmap Checklist</h4>
                  <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    {roadmapPercentage}% Complete
                  </span>
                </div>

                <div className="space-y-2">
                  {roadmapSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      onClick={() => toggleRoadmapStep(step.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        step.completed 
                          ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          step.completed ? "bg-emerald-500 text-black" : "bg-slate-800 text-slate-400"
                        }`}>
                          {idx + 1}
                        </div>
                        <span className={`text-sm ${step.completed ? "line-through opacity-80" : ""}`}>
                          {step.title}
                        </span>
                      </div>
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "resume" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
                <h3 className="text-base font-semibold text-white">Resume ATS Analyser</h3>
                <p className="text-xs text-slate-400">Upload resume file or paste text to evaluate ATS compatibility score.</p>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <label className="text-xs text-slate-400 font-medium shrink-0">Target Job Role:</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-auto"
                  >
                    <option value="Fullstack Developer">Fullstack Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Software Engineer Intern">Software Engineer Intern</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 text-center transition-colors">
                  <input 
                    type="file" 
                    accept=".pdf,.txt,.doc,.docx"
                    id="resumeUpload"
                    onChange={handleFileUpload}
                    className="hidden" 
                  />
                  <label htmlFor="resumeUpload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-indigo-400" />
                    <span className="text-sm font-medium text-slate-200">
                      {fileName ? `Uploaded: ${fileName}` : "Click to Upload Resume (PDF / DOC / TXT)"}
                    </span>
                    <span className="text-xs text-slate-500">Free ATS Scanner for Developers</span>
                  </label>
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1.5">Or paste resume text:</label>
                  <textarea
                    rows={4}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste resume skills, project details, and experience here..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleAnalyzeResume}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/20"
                >
                  <Sparkles className="w-4 h-4" /> Run ATS Scan
                </button>
              </div>

              {analysisResult && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
                    <div>
                      <h4 className="text-lg font-bold text-white">Report for {targetRole}</h4>
                      <p className="text-xs text-slate-400 mt-1">ATS match details.</p>
                    </div>
                    <div className="text-center px-6 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                      <span className="text-xs text-slate-400 font-medium block">ATS Score</span>
                      <span className="text-3xl font-extrabold text-indigo-400">{analysisResult.score}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Matched Skills
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.skillsFound.map((skill, i) => (
                          <span key={i} className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <h5 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Missing Keywords
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.missingSkills.map((skill, i) => (
                          <span key={i} className="text-xs bg-rose-500/10 border border-rose-500/20 text-rose-300 px-2.5 py-1 rounded-lg">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "tracker" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    Live Performance Index
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-2">Overall Realized Learning Score</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg">
                    Real-time aggregated score calculated automatically from your roadmap tasks, completed notes, coding sessions, daily streak, and resume ATS rating.
                  </p>
                </div>
                <div className="text-center px-8 py-4 rounded-2xl bg-indigo-600/10 border border-indigo-500/30">
                  <span className="text-xs text-slate-400 block font-medium">Index Score</span>
                  <span className="text-4xl font-extrabold text-indigo-400">{overallLearningIndex}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-medium">Daily Streak</span>
                  <p className="text-2xl font-bold text-amber-400 mt-1 flex items-center gap-1.5">
                    <Flame className="w-5 h-5 fill-amber-400" />
                    {dailyStreak} {dailyStreak === 1 ? "Day" : "Days"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Real calendar login tracking</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-medium">Roadmap Completion</span>
                  <p className="text-2xl font-bold text-white mt-1">{roadmapPercentage}%</p>
                  <p className="text-[11px] text-slate-500 mt-1">{completedRoadmapSteps} of {roadmapSteps.length} tasks done</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-medium">Notes in Library</span>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{totalNotesCount} Topics</p>
                  <p className="text-[11px] text-slate-500 mt-1">Available for revision</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                  <span className="text-xs text-slate-400 font-medium">Latest Resume ATS</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{resumeAtsScore ? `${resumeAtsScore}%` : "Not Scanned"}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{resumeAtsScore ? `Evaluated for ${targetRole}` : "Run ATS scan in Resume tab"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h4 className="font-semibold text-white">Roadmap Milestone Progress</h4>
                  <div className="w-full bg-slate-950 h-3.5 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${roadmapPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-400 pt-1">
                    <span>{completedRoadmapSteps} Completed</span>
                    <span>{roadmapSteps.length - completedRoadmapSteps} Pending</span>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
                  <h4 className="font-semibold text-white">Dynamic Achievements</h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                      dailyStreak >= 1 
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300" 
                        : "bg-slate-950 border-slate-800 text-slate-600"
                    }`}>
                      <Flame className="w-4 h-4 fill-amber-400 text-amber-400" /> {dailyStreak} Day Streak
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                      roadmapPercentage > 0 
                        ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300" 
                        : "bg-slate-950 border-slate-800 text-slate-600"
                    }`}>
                      <Award className="w-4 h-4" /> Roadmap Starter
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                      totalNotesCount >= 2 
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-300" 
                        : "bg-slate-950 border-slate-800 text-slate-600"
                    }`}>
                      <Award className="w-4 h-4" /> Active Scholar
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                      resumeAtsScore >= 70 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                        : "bg-slate-950 border-slate-800 text-slate-600"
                    }`}>
                      <Award className="w-4 h-4" /> Career Ready ATS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="text-base font-semibold mb-4 text-white">Recent Activity & Query History</h3>
              <div className="space-y-3">
                {searchHistory.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 mr-2">
                        {item.type}
                      </span>
                      <span className="text-sm text-slate-200">{item.query}</span>
                    </div>
                    <span className="text-xs text-slate-500">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="relative z-10 pt-8 pb-2 text-center border-t border-slate-800/80 mt-12 text-xs text-slate-500">
          <p>
            SynapseAura AI Ecosystem • Designed & Developed with passion by{" "}
            <span className="text-indigo-400 font-semibold">Madhav Vashistha</span>
          </p>
        </footer>
      </main>
    </div>
  );
}