import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useAuth } from '../auth/AuthContext';
import apiClient from '../services/apiClient';
import {
  Bot, Sparkles, Send, Lightbulb, BookOpen, Flame, Compass,
  HelpCircle, ArrowLeft, RotateCcw, Zap, CheckCircle2, AlertTriangle,
  LayoutDashboard, Trophy, User, ShieldAlert, Layers, Search
} from 'lucide-react';

// Contextual suggestions based on Chemistry Syllabus
const SUGGESTIONS = [
  { id: '1', label: 'What is modern periodic law?', icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' },
  { id: '2', label: 'Why does atomic radius decrease across a period?', icon: Lightbulb, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  { id: '3', label: 'Calculate particles in 3 mol.', icon: HelpCircle, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  { id: '4', label: 'What is the atomic number of oxygen?', icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  { id: '5', label: 'Explain Aufbau Principle and Hund\'s rule.', icon: Compass, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
];

const INITIAL_WELCOME = (userName = 'Chemist') => ([
  {
    id: 1,
    sender: 'bot',
    text: `Hello ${userName}! I am **ChemEscape AI Tutor**, your strict syllabus-grounded Chemistry assistant. ⚛️\n\nI answer questions derived directly from your 11th & 12th Chemistry syllabus content. Ask me about periodic trends, atomic structure, stoichiometry calculations, or chapter concepts!`,
    time: 'Just now',
    classification: 'IN_SCOPE',
    type: 'welcome'
  }
]);

export default function AiAssistantPage() {
  const { user } = useAuth();
  const {
    navigateTo,
    selectedStandard,
    selectedStandardId,
    selectedSubject,
    selectedSubjectId,
    selectedChapter,
    selectedChapterId
  } = useNavigation();

  // Mode: CURRENT_CHAPTER vs FULL_SYLLABUS
  const [mode, setMode] = useState('CURRENT_CHAPTER');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // User-scoped LocalStorage Key
  const userChatKey = user?.id ? `chemescape:user:${user.id}:ai-chat` : 'chemescape:guest:ai-chat';

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(userChatKey);
      return saved ? JSON.parse(saved) : INITIAL_WELCOME(user?.name || 'Chemist');
    } catch {
      return INITIAL_WELCOME(user?.name || 'Chemist');
    }
  });

  // Save to user-scoped localStorage
  useEffect(() => {
    try {
      localStorage.setItem(userChatKey, JSON.stringify(messages));
    } catch { /* ignore quota errors */ }
  }, [messages, userChatKey]);

  // When user changes, reset messages to that user's history
  useEffect(() => {
    try {
      const saved = localStorage.getItem(userChatKey);
      setMessages(saved ? JSON.parse(saved) : INITIAL_WELCOME(user?.name || 'Chemist'));
    } catch {
      setMessages(INITIAL_WELCOME(user?.name || 'Chemist'));
    }
  }, [user?.id, userChatKey, user?.name]);

  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleClearChat = () => {
    const fresh = INITIAL_WELCOME(user?.name || 'Chemist');
    setMessages(fresh);
    try { localStorage.removeItem(userChatKey); } catch { /* noop */ }
  };

  const handleSendMessage = async (customQuery = null) => {
    const query = customQuery || inputText.trim();
    if (!query || isTyping) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customQuery) setInputText('');
    setIsTyping(true);

    try {
      const res = await apiClient.post('/ai/assistant', {
        question: query,
        mode,
        standardId: selectedStandardId,
        subjectId: selectedSubjectId,
        chapterId: selectedChapterId
      });

      setIsTyping(false);

      if (res.success && res.data) {
        const botMsg = {
          id: Date.now() + 1,
          sender: 'bot',
          text: res.data.answer,
          classification: res.data.classification,
          chapter: res.data.chapter,
          topic: res.data.topic,
          sources: res.data.sources || [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(res.message || 'Failed to generate response.');
      }
    } catch (err) {
      setIsTyping(false);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "I couldn't find enough information in the selected ChemEscape syllabus to answer this accurately. Please ask a question from your current chapter or topic.",
        classification: 'NOT_IN_SYLLABUS',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const currentStandardName = selectedStandard || '11th Standard';
  const currentChapterTitle = selectedChapter || 'Periodic Classification of Elements';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex selection:bg-cyan-500 selection:text-black">
      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-white/10 bg-slate-950/80 backdrop-blur-xl p-5 justify-between select-none">
        <div>
          <button
            onClick={() => navigateTo('landing')}
            className="flex items-center gap-3 mb-8 px-2 border-0 bg-transparent cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-orbitron font-extrabold text-base tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                ChemEscape
              </span>
              <span className="block text-[9px] font-space text-slate-400 tracking-widest uppercase">
                AI Tutor Suite
              </span>
            </div>
          </button>

          <nav className="space-y-1.5 font-space text-xs">
            <button
              onClick={() => navigateTo('dashboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors border-0 bg-transparent cursor-pointer text-left"
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigateTo('standards')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors border-0 bg-transparent cursor-pointer text-left"
            >
              <Compass size={18} />
              <span>Play Missions</span>
            </button>
            <button
              onClick={() => navigateTo('ai-assistant')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold shadow-lg shadow-cyan-500/10 cursor-pointer text-left"
            >
              <Bot size={18} />
              <span>AI Assistant</span>
            </button>
            <button
              onClick={() => navigateTo('leaderboard')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors border-0 bg-transparent cursor-pointer text-left"
            >
              <Trophy size={18} />
              <span>Leaderboard</span>
            </button>
            <button
              onClick={() => navigateTo('profile')}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors border-0 bg-transparent cursor-pointer text-left"
            >
              <User size={18} />
              <span>Student Profile</span>
            </button>
          </nav>
        </div>

        {/* Bot Status Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/20 text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <Bot size={20} />
          </div>
          <span className="font-orbitron font-bold text-xs text-white block">Syllabus AI Tutor</span>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center justify-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Syllabus-Bound • Active
          </span>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 h-screen relative overflow-hidden">
        {/* Ambient Orb */}
        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-gradient-to-br from-cyan-500/10 via-purple-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <header className="px-6 py-3.5 border-b border-white/10 bg-slate-950/80 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => navigateTo('dashboard')} className="lg:hidden text-slate-400 hover:text-white border-0 bg-transparent cursor-pointer">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                <Bot size={18} />
              </div>
              <div>
                <h1 className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                  CHEMISTRY AI TUTOR
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    SYLLABUS GROUNDED
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400 font-space">
                  Answers Chemistry questions strictly from your approved syllabus content
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setMode('CURRENT_CHAPTER')}
                className={`px-3 py-1 rounded-lg text-xs font-space font-medium transition-colors cursor-pointer border-0 ${
                  mode === 'CURRENT_CHAPTER'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-white bg-transparent'
                }`}
              >
                Current Chapter
              </button>
              <button
                onClick={() => setMode('FULL_SYLLABUS')}
                className={`px-3 py-1 rounded-lg text-xs font-space font-medium transition-colors cursor-pointer border-0 ${
                  mode === 'FULL_SYLLABUS'
                    ? 'bg-purple-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white bg-transparent'
                }`}
              >
                Full {currentStandardName}
              </button>
            </div>

            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-400 text-xs font-space transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </header>

        {/* Current Syllabus Context Bar */}
        <div className="px-6 py-2 bg-slate-900/60 border-b border-white/5 flex items-center justify-between text-xs font-space text-slate-400 z-10">
          <div className="flex items-center gap-3 truncate">
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Layers size={13} />
              {currentStandardName} • Chemistry
            </span>
            <span className="text-slate-600">|</span>
            <span className="truncate">
              Selected: <strong className="text-white">{mode === 'CURRENT_CHAPTER' ? currentChapterTitle : `All Chapters in ${currentStandardName}`}</strong>
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300/60 hidden sm:inline">
            MODE: {mode}
          </span>
        </div>

        {/* Preset Contextual Suggestions */}
        <div className="px-6 py-2.5 border-b border-white/5 bg-slate-950/40 overflow-x-auto flex items-center gap-2 z-10 no-scrollbar">
          <span className="text-[10px] font-orbitron font-bold text-slate-500 uppercase tracking-wider flex-shrink-0 mr-1">
            Suggested:
          </span>
          {SUGGESTIONS.map((preset) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                onClick={() => handleSendMessage(preset.label)}
                className={`flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-space transition-all whitespace-nowrap cursor-pointer hover:scale-102 ${preset.bg}`}
              >
                <Icon size={13} className={preset.color} />
                <span className="text-slate-200">{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chat Stream Window */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm flex-shrink-0 shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white'
                    : msg.classification === 'OUT_OF_SCOPE' || msg.classification === 'NOT_IN_SYLLABUS'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white border border-cyan-400/40'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User size={18} />
                ) : msg.classification === 'OUT_OF_SCOPE' || msg.classification === 'NOT_IN_SYLLABUS' ? (
                  <ShieldAlert size={18} />
                ) : (
                  <Bot size={18} />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`space-y-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className="flex items-center gap-2 px-1">
                  <span className="font-orbitron text-[10px] font-bold text-slate-400">
                    {msg.sender === 'user' ? 'You' : 'ChemEscape AI Tutor'}
                  </span>
                  {msg.classification && msg.sender === 'bot' && (
                    <span className={`text-[9px] font-orbitron font-bold px-2 py-0.2 rounded-full border ${
                      msg.classification === 'IN_SCOPE'
                        ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                        : msg.classification === 'AMBIGUOUS'
                        ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {msg.classification}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-600 font-mono">{msg.time}</span>
                </div>

                <div
                  className={`p-4 rounded-2xl font-space text-xs leading-relaxed max-w-xl whitespace-pre-line shadow-xl break-words ${
                    msg.sender === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none'
                      : msg.classification === 'OUT_OF_SCOPE' || msg.classification === 'NOT_IN_SYLLABUS'
                      ? 'bg-slate-900 border border-amber-500/30 text-amber-200/90 rounded-tl-none'
                      : 'bg-slate-900 border border-cyan-500/20 text-slate-200 rounded-tl-none backdrop-blur-xl'
                  }`}
                >
                  {msg.text}

                  {/* Sources Grounding Tag */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] font-space text-cyan-300/80 flex items-center gap-1.5 flex-wrap">
                      <span className="text-slate-400 font-semibold">Based on:</span>
                      {msg.sources.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                          {s.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-md">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                <Bot size={18} />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl z-10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask a Chemistry question from ${mode === 'CURRENT_CHAPTER' ? currentChapterTitle : currentStandardName}...`}
              className="flex-1 px-5 py-3.5 rounded-2xl bg-slate-900 border border-white/10 text-white text-xs font-space placeholder-slate-500 outline-none focus:border-cyan-500/50 transition-colors shadow-inner"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send size={15} />
              <span>Ask</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
