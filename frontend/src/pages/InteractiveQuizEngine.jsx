import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useTheme } from '../context/ThemeContext';
import { roomService } from '../services/roomService';
import { gameService } from '../services/gameService';
import {
  getSubjectsForStandard,
  getChaptersForStandardAndSubject,
} from '../config/curriculumConfig';
import {
  ArrowLeft, Lightbulb, CheckCircle2, XCircle, Clock,
  Sparkles, Zap, ChevronRight, RotateCcw, Trophy,
  Shield, Heart, Award, AlertTriangle, Check, X, BookOpen,
  Send, HelpCircle, AlertCircle, Play, Loader2,
} from 'lucide-react';

// ─── HUD Corner Accents ───────────────────────────────────────────────────────
function HUDCorners({ color = '#10B981', size = 12 }) {
  const s = { borderColor: color };
  return (
    <>
      <div className="absolute top-0 left-0 border-t-2 border-l-2 pointer-events-none" style={{ ...s, width: size, height: size }} />
      <div className="absolute top-0 right-0 border-t-2 border-r-2 pointer-events-none" style={{ ...s, width: size, height: size }} />
      <div className="absolute bottom-0 left-0 border-b-2 border-l-2 pointer-events-none" style={{ ...s, width: size, height: size }} />
      <div className="absolute bottom-0 right-0 border-b-2 border-r-2 pointer-events-none" style={{ ...s, width: size, height: size }} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN INTERACTIVE QUIZ ENGINE
// ─────────────────────────────────────────────────────────────────────────────
export default function InteractiveQuizEngine() {
  const {
    navigateTo,
    selectedStandardId, selectedStandard,
    selectedSubjectId, selectedSubject,
    selectedChapterId, selectedChapter,
    selectedRoomId, currentRoom,
    lives,
    markRoomCompleted,
    refreshUserStats,
  } = useNavigation();

  const { isDark } = useTheme();

  // ── 1. Resolve Context Metadata ─────────────────────────────────────────────
  const resolvedStdId = selectedStandardId || 'grade-5';
  const resolvedSubjId = selectedSubjectId || 'tamil';
  const stdDisplayName = selectedStandard || (resolvedStdId === 'grade-4' ? '4th Standard' : resolvedStdId === 'grade-5' ? '5th Standard' : '11th Standard');
  const subjDisplayName = selectedSubject || (resolvedSubjId.charAt(0).toUpperCase() + resolvedSubjId.slice(1));

  const subjects = useMemo(() => getSubjectsForStandard(resolvedStdId), [resolvedStdId]);
  const subjConfig = useMemo(() => subjects.find(s => s.id === resolvedSubjId), [subjects, resolvedSubjId]);
  const accentColor = subjConfig?.color || '#10B981';
  const glowColor = `${accentColor}40`;

  const chaptersList = useMemo(() => {
    return getChaptersForStandardAndSubject(resolvedStdId, resolvedSubjId);
  }, [resolvedStdId, resolvedSubjId]);

  const activeChapter = useMemo(() => {
    if (typeof selectedChapter === 'object' && selectedChapter?.title) {
      return selectedChapter;
    }
    if (selectedChapterId) {
      const found = chaptersList.find(c => c.id === selectedChapterId);
      if (found) return found;
    }
    return chaptersList[0] || null;
  }, [selectedChapter, selectedChapterId, chaptersList]);

  const chapterTitle = activeChapter?.title || 'Chapter 1';

  // ── 2. Local State Management ───────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [calculationInput, setCalculationInput] = useState('');
  const [hintVisible, setHintVisible] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);   // true while backend is validating
  const [feedback, setFeedback] = useState(null);        // null | { isCorrect, message, earnedPoints }
  const [answerError, setAnswerError] = useState(null);  // API failure message
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [submittingCompletion, setSubmittingCompletion] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [completionError, setCompletionError] = useState(null);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [loadedRoomId, setLoadedRoomId] = useState(null);

  // ── 3. Fetch Questions Strictly Belonging to Current Room/Mission ───────────
  useEffect(() => {
    let isMounted = true;

    async function loadMissionQuestions() {
      setLoading(true);
      setError(null);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setSelectedOptionId(null);
      setCalculationInput('');
      setHintVisible(false);
      setIsSubmitted(false);
      setIsChecking(false);
      setFeedback(null);
      setAnswerError(null);
      setScore(0);
      setCorrectCount(0);
      setWrongCount(0);
      setQuizComplete(false);
      setTimeSpentSeconds(0);

      try {
        let targetRoomId = null;

        // 1. Primary: Query authoritative rooms for the active chapter
        if (activeChapter?.id) {
          try {
            const roomRes = await roomService.getRoomsByChapter(activeChapter.id, {
              standardId: resolvedStdId,
              subjectId: resolvedSubjId,
            });
            const rooms = roomRes?.data?.rooms || roomRes?.data || (Array.isArray(roomRes) ? roomRes : []);
            if (rooms.length > 0) {
              const matched = selectedRoomId ? rooms.find(r => r.id === selectedRoomId) : null;
              targetRoomId = matched ? matched.id : rooms[0].id;
            }
          } catch (e) {
            console.warn('[InteractiveQuizEngine] Notice on getRoomsByChapter:', e.message);
          }
        }

        // 2. Secondary fallback: check selectedRoomId or currentRoom
        if (!targetRoomId) {
          const cand = selectedRoomId || (typeof currentRoom === 'object' ? currentRoom?.id : currentRoom);
          if (cand && typeof cand === 'string' && cand.startsWith('room-')) {
            targetRoomId = cand;
          }
        }

        // 3. Deterministic chapter-to-room convention fallback (e.g. ch-soc4-1 -> room-soc4-1)
        if (!targetRoomId && activeChapter?.id && typeof activeChapter.id === 'string' && activeChapter.id.startsWith('ch-')) {
          targetRoomId = activeChapter.id.replace('ch-', 'room-');
        }

        if (!targetRoomId) {
          if (isMounted) {
            setQuestions([]);
            setLoading(false);
          }
          return;
        }

        if (isMounted) {
          setLoadedRoomId(targetRoomId);
        }

        const qRes = await roomService.getQuestionsByRoom(targetRoomId, {
          standardId: resolvedStdId,
          subjectId: resolvedSubjId,
          chapterId: activeChapter?.id,
        });
        const rawList = qRes?.data?.questions || qRes?.questions || (Array.isArray(qRes) ? qRes : []);

        if (isMounted) {
          if (Array.isArray(rawList) && rawList.length > 0) {
            const capped = rawList.slice(0, 10);
            setQuestions(capped);
          } else {
            setQuestions([]);
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const errMsg = err.response?.data?.message || err.message || 'Unable to load questions';
          setError(errMsg);
          setQuestions([]);
          setLoading(false);
        }
      }
    }

    loadMissionQuestions();

    return () => {
      isMounted = false;
    };
  }, [selectedRoomId, currentRoom, activeChapter?.id, resolvedStdId, resolvedSubjId]);

  // ── 4. Timer Tick ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (quizComplete || loading || questions.length === 0) return;
    const interval = setInterval(() => {
      setTimeSpentSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [quizComplete, loading, questions.length]);

  // ── 5. Active Question Reference ────────────────────────────────────────────
  const currentQuestion = useMemo(() => {
    if (!questions || questions.length === 0) return null;
    return questions[currentQuestionIndex] || null;
  }, [questions, currentQuestionIndex]);

  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // ── 6. Handle Answer Submission — Server-Authoritative ─────────────────────
  //
  // Flow:
  //   1. Guard: no double-submit, no submit while already checking
  //   2. Determine the answer to submit (optionId or calculation string)
  //   3. Set isChecking = true (show "Checking answer…" state)
  //   4. POST to /api/game/questions/:id/answer with { answer, roomId }
  //   5. Read result.correct from backend response (HTTP 200 ≠ correct)
  //   6. Set feedback based on result.correct — never infer from "submitted"
  //   7. Update score/counts
  //   8. On API failure: show error, allow retry
  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || isSubmitted || isChecking) return;

    const qType = currentQuestion.questionType || 'MCQ';

    // Determine the answer string to submit
    let answerToSubmit = null;
    if (qType === 'MCQ') {
      if (!selectedOptionId) return;
      answerToSubmit = selectedOptionId;
    } else if (qType === 'CALCULATION') {
      if (!calculationInput.trim()) return;
      answerToSubmit = calculationInput.trim();
    } else {
      // Unsupported type: skip
      answerToSubmit = '__SKIP__';
    }

    const questionId = currentQuestion.id;
    const roomId = loadedRoomId;

    // Guard: must have a valid roomId to submit against
    if (!roomId || !questionId) {
      setAnswerError('Cannot validate answer: room context is missing. Please reload.');
      return;
    }

    // ── Transition to CHECKING state ──────────────────────────────────────────
    setIsChecking(true);
    setAnswerError(null);

    try {
      // Call the server-authoritative answer validation endpoint
      // Backend returns: { success, data: { correct: Boolean, points: Number, feedback: String } }
      const result = await gameService.submitAnswer(questionId, roomId, answerToSubmit);

      // result is { correct, points, feedback } (gameService extracts .data)
      const isCorrect = result?.correct === true;
      const earnedPoints = result?.points ?? (isCorrect ? (currentQuestion.points || 100) : 0);
      const serverFeedback = result?.feedback || (isCorrect ? 'Correct! Well done.' : 'Incorrect. Try again.');

      // ── Transition to SUBMITTED state with authoritative result ────────────
      setIsChecking(false);
      setIsSubmitted(true);
      setFeedback({
        isCorrect,
        message: isCorrect
          ? `✓ Correct! ${serverFeedback}`
          : `✕ Incorrect. ${serverFeedback}`,
        earnedPoints,
      });

      if (isCorrect) {
        setScore(prev => prev + earnedPoints);
        setCorrectCount(prev => prev + 1);
      } else {
        setWrongCount(prev => prev + 1);
      }
    } catch (err) {
      // ── API error state — do NOT infer correct/incorrect ──────────────────
      setIsChecking(false);
      setAnswerError('Unable to check your answer. Please try again.');
      // isSubmitted remains false so the student can retry
    }
  }, [currentQuestion, isSubmitted, isChecking, selectedOptionId, calculationInput, loadedRoomId]);

  // ── 7. Handle Hint Toggle & Usage Tracking ─────────────────────────────────
  const handleToggleHint = useCallback(() => {
    if (!hintVisible) {
      setHintsUsed(prev => prev + 1);
    }
    setHintVisible(prev => !prev);
  }, [hintVisible]);

  // ── 8. Server-Authoritative Mission & Chapter Completion ───────────────────
  const handleCompleteMission = useCallback(async () => {
    if (submittingCompletion) return;
    setSubmittingCompletion(true);
    setCompletionError(null);

    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    const calculatedStars = accuracy >= 80 ? 3 : accuracy >= 50 ? 2 : accuracy >= 30 ? 1 : 0;

    const targetRoomId = loadedRoomId || selectedRoomId || (activeChapter?.id?.startsWith('ch-') ? activeChapter.id.replace('ch-', 'room-') : (typeof currentRoom === 'object' ? currentRoom?.id : currentRoom));

    try {
      const payload = {
        score,
        stars: calculatedStars,
        timeSpentSec: timeSpentSeconds,
        gameState: {
          answeredQuestions: totalQuestions,
          correctAnswers: correctCount,
          wrongAnswers: wrongCount,
          hintsUsed,
        },
      };

      const res = await gameService.completeRoom(targetRoomId, payload);
      const data = res?.data || res;
      setCompletionData(data);

      markRoomCompleted(targetRoomId, activeChapter?.id);
      refreshUserStats();

      setQuizComplete(true);
      setSubmittingCompletion(false);
    } catch (err) {
      console.warn('[QuizEngine] Completion API call returned:', err.message);
      markRoomCompleted(targetRoomId, activeChapter?.id);
      refreshUserStats();
      setQuizComplete(true);
      setSubmittingCompletion(false);
    }
  }, [
    submittingCompletion, totalQuestions, correctCount, wrongCount, hintsUsed,
    score, timeSpentSeconds, loadedRoomId, selectedRoomId, currentRoom, activeChapter?.id,
    markRoomCompleted, refreshUserStats
  ]);

  // ── 9. Handle Advancing to Next Question / Final Completion ────────────────
  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setCalculationInput('');
      setHintVisible(false);
      setIsSubmitted(false);
      setIsChecking(false);
      setFeedback(null);
      setAnswerError(null);
    } else {
      handleCompleteMission();
    }
  }, [currentQuestionIndex, totalQuestions, handleCompleteMission]);

  // ── 10. Format Time ─────────────────────────────────────────────────────────
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: Loading State
  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#020609] text-white flex flex-col items-center justify-center p-6">
        <motion.div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl"
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}40` }}
          animate={{ scale: [1, 1.1, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          ⚡
        </motion.div>
        <p className="font-orbitron font-bold text-lg text-white mb-1">
          Loading Mission Intel & Questions...
        </p>
        <p className="font-space text-xs text-white/50">
          {stdDisplayName} • {subjDisplayName} • {chapterTitle}
        </p>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: Empty / No Questions State (Zero Fallback Safeguard)
  // ─────────────────────────────────────────────────────────────────────────
  if (!loading && questions.length === 0) {
    return (
      <div className="relative min-h-screen bg-[#020609] text-white flex flex-col items-center justify-center p-6">
        <motion.div
          className="relative w-full max-w-lg rounded-3xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(8,14,24,0.98))',
            border: `1.5px solid ${accentColor}30`,
            boxShadow: `0 0 50px ${accentColor}15`,
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 text-3xl"
            style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}30` }}
          >
            📋
          </div>

          <span
            className="inline-block px-3 py-1 rounded-full text-[10px] font-orbitron font-bold tracking-widest uppercase mb-3"
            style={{ background: `${accentColor}18`, color: accentColor }}
          >
            {stdDisplayName} • {subjDisplayName}
          </span>

          <h2 className="font-orbitron font-black text-xl sm:text-2xl text-white mb-2">
            No questions are configured for this mission yet.
          </h2>

          <p className="text-sm font-inter text-white/70 leading-relaxed mb-6">
            Questions for <strong>{chapterTitle}</strong> have not been published to this room. Please explore other subjects or check back soon.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigateTo('chapters')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer border-0 transition-transform active:scale-95"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
            >
              <ArrowLeft size={14} />
              <span>Back to Chapters</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('select-subject')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-orbitron font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 text-slate-950 cursor-pointer border-0 transition-transform active:scale-95"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)` }}
            >
              <Sparkles size={14} />
              <span>Explore Other Subjects</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: Mission Complete Celebration Screen
  // ─────────────────────────────────────────────────────────────────────────
  if (quizComplete) {
    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    const finalEarnedXP = completionData?.awardedXP ?? score;
    const finalEarnedCoins = completionData?.awardedCoins ?? (accuracy >= 80 ? 100 : 50);

    return (
      <div className="relative min-h-screen bg-[#020609] text-white flex flex-col items-center justify-center p-6">
        <motion.div
          className="relative w-full max-w-xl rounded-3xl p-8 sm:p-10 text-center overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.96), rgba(8,14,24,0.98))',
            border: `2px solid ${accentColor}50`,
            boxShadow: `0 0 60px ${accentColor}25`,
          }}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <HUDCorners color={accentColor} size={16} />

          <motion.div
            className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-6 text-4xl shadow-xl"
            style={{ background: `${accentColor}25`, border: `1.5px solid ${accentColor}50` }}
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🏆
          </motion.div>

          <span
            className="inline-block px-3.5 py-1 rounded-full text-[10px] font-orbitron font-bold tracking-widest uppercase mb-3"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            MISSION COMPLETE
          </span>

          <h2 className="font-orbitron font-black text-2xl sm:text-3xl text-white mb-2">
            Chapter Completed!
          </h2>

          <p className="text-sm font-inter text-white/70 mb-8">
            You successfully completed the mission for <strong>{chapterTitle}</strong> ({stdDisplayName} {subjDisplayName}). Next chapter is now unlocked!
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <div className="p-3.5 rounded-2xl" style={{ background: `${accentColor}0d`, border: `1px solid ${accentColor}25` }}>
              <CheckCircle2 size={16} style={{ color: accentColor, marginBottom: 4 }} />
              <p className="font-orbitron font-black text-lg text-white">{correctCount}/{totalQuestions}</p>
              <p className="text-[10px] font-space text-white/40 uppercase">Answered</p>
            </div>

            <div className="p-3.5 rounded-2xl" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
              <Zap size={16} className="text-amber-400 mb-1" />
              <p className="font-orbitron font-black text-lg text-amber-400">+{finalEarnedXP}</p>
              <p className="text-[10px] font-space text-white/40 uppercase">XP Earned</p>
            </div>

            <div className="p-3.5 rounded-2xl" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Award size={16} className="text-blue-400 mb-1" />
              <p className="font-orbitron font-black text-lg text-blue-400">+{finalEarnedCoins}</p>
              <p className="text-[10px] font-space text-white/40 uppercase">Coins</p>
            </div>

            <div className="p-3.5 rounded-2xl" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
              <Clock size={16} className="text-purple-400 mb-1" />
              <p className="font-orbitron font-black text-lg text-purple-400">{formatTime(timeSpentSeconds)}</p>
              <p className="text-[10px] font-space text-white/40 uppercase">Time Spent</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCurrentQuestionIndex(0);
                setSelectedOptionId(null);
                setCalculationInput('');
                setHintVisible(false);
                setIsSubmitted(false);
                setFeedback(null);
                setScore(0);
                setCorrectCount(0);
                setWrongCount(0);
                setQuizComplete(false);
                setTimeSpentSeconds(0);
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer border-0 transition-transform active:scale-95"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}
            >
              <RotateCcw size={14} />
              <span>Replay</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('chapters')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-orbitron font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 text-slate-950 cursor-pointer border-0 transition-transform active:scale-95 shadow-lg"
              style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)` }}
            >
              <ArrowLeft size={14} />
              <span>Back to Chapters</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: Active Question Flow
  // ─────────────────────────────────────────────────────────────────────────
  const qType = currentQuestion?.questionType || 'MCQ';
  const isMCQ = qType === 'MCQ' || qType === 'SINGLE_CHOICE';
  const isCalculation = qType === 'CALCULATION' || qType === 'NUMERIC';
  const isUnsupported = !isMCQ && !isCalculation;

  return (
    <div className="relative min-h-screen bg-[#020609] text-white flex flex-col pb-16 overflow-x-hidden">
      {/* ── TOP NAV BAR ── */}
      <header className="relative z-20 border-b border-white/10 px-4 sm:px-8 py-4 flex items-center justify-between backdrop-blur-md bg-black/40">
        <button
          type="button"
          onClick={() => navigateTo('chapters')}
          className="flex items-center gap-2 text-xs font-space font-medium text-white/70 hover:text-white bg-transparent border-0 cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Chapter Map</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-orbitron font-bold tracking-widest uppercase px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/80">
            {stdDisplayName} • {subjDisplayName}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-space">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap size={13} className="fill-amber-400" />
            <span className="font-orbitron font-bold">{score} XP</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <Heart size={13} className="fill-rose-400" />
            <span>{lives} / 3</span>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 flex-1 w-full flex flex-col justify-start">
        
        {/* Progress Bar & Question Counter Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-2.5">
            <div className="flex items-center gap-2">
              <span
                className="text-[11px] font-orbitron font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-md"
                style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}35` }}
              >
                Question {currentQuestionIndex + 1} / {totalQuestions}
              </span>
              <span className="text-xs font-space text-white/50 truncate">
                {chapterTitle}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-space text-white/50">
              <Clock size={13} />
              <span>{formatTime(timeSpentSeconds)}</span>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2 rounded-full overflow-hidden bg-white/5 border border-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${accentColor}, #22d3ee)` }}
              initial={{ width: `${((currentQuestionIndex) / totalQuestions) * 100}%` }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* ── QUESTION CARD ── */}
        <motion.div
          key={currentQuestion.id || currentQuestionIndex}
          className="relative rounded-3xl p-6 sm:p-8 mb-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(8,14,24,0.96))',
            border: `1.5px solid ${accentColor}30`,
            boxShadow: `0 0 40px ${glowColor}`,
            backdropFilter: 'blur(16px)',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <HUDCorners color={accentColor} size={14} />

          {/* Question Metadata Header */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-orbitron font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-white/70">
                {currentQuestion.difficulty || 'Beginner'}
              </span>
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-orbitron font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400">
                +{currentQuestion.points || 100} XP
              </span>
            </div>

            {/* Hint Button */}
            <button
              type="button"
              onClick={handleToggleHint}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-space font-medium cursor-pointer border transition-all"
              style={{
                background: hintVisible ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
                borderColor: hintVisible ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.1)',
                color: hintVisible ? '#FBBF24' : 'rgba(255,255,255,0.7)',
              }}
            >
              <Lightbulb size={13} className={hintVisible ? 'fill-amber-400' : ''} />
              <span>{hintVisible ? 'Hide Hint' : '💡 Hint'}</span>
            </button>
          </div>

          {/* Question Text */}
          <h2 className="font-orbitron font-bold text-lg sm:text-xl lg:text-2xl text-white leading-relaxed mb-6">
            {currentQuestion.questionText}
          </h2>

          {/* Hint Area (Only for Current Question) */}
          <AnimatePresence>
            {hintVisible && (
              <motion.div
                className="rounded-2xl p-4 mb-6 flex items-start gap-3"
                style={{
                  background: 'rgba(251,191,36,0.08)',
                  border: '1px solid rgba(251,191,36,0.3)',
                }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Lightbulb size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-orbitron font-bold text-[11px] text-amber-400 uppercase tracking-wider mb-0.5">
                    Tactical Hint
                  </p>
                  <p className="text-xs sm:text-sm font-inter text-amber-200/90 leading-relaxed">
                    {currentQuestion.hint || 'Review the core concepts from the chapter to solve this problem.'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── QUESTION INPUT TYPES ── */}

          {/* 1. Multiple Choice Options */}
          {isMCQ && (
            <div className="space-y-3 mb-6">
              {(currentQuestion.options || []).map((opt, i) => {
                const optId = opt.id || opt.optionKey || String(i);
                const isSelected = selectedOptionId === optId;
                const optLetter = opt.optionKey || String.fromCharCode(65 + i);

                // Determine border + background
                let optBorder, optBg, letterBg, letterColor, showCheck = false, showX = false;

                if (isSubmitted) {
                  if (isSelected && feedback?.isCorrect) {
                    // ✅ Selected + backend says CORRECT → green
                    optBorder = '2px solid #10B981';
                    optBg = 'rgba(16,185,129,0.18)';
                    letterBg = '#10B981';
                    letterColor = '#020609';
                    showCheck = true;
                  } else if (isSelected && !feedback?.isCorrect) {
                    // ❌ Selected + backend says WRONG → red
                    optBorder = '2px solid #F43F5E';
                    optBg = 'rgba(244,63,94,0.18)';
                    letterBg = '#F43F5E';
                    letterColor = '#fff';
                    showX = true;
                  } else {
                    // Neutral non-selected after submission
                    optBorder = '1px solid rgba(255,255,255,0.06)';
                    optBg = 'rgba(255,255,255,0.02)';
                    letterBg = 'rgba(255,255,255,0.05)';
                    letterColor = 'rgba(255,255,255,0.3)';
                  }
                } else {
                  // Before / during submission
                  optBorder = isSelected ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.08)';
                  optBg = isSelected ? `${accentColor}18` : 'rgba(255,255,255,0.03)';
                  letterBg = isSelected ? accentColor : 'rgba(255,255,255,0.06)';
                  letterColor = isSelected ? '#020609' : '#fff';
                }

                const isInteractive = !isSubmitted && !isChecking;

                return (
                  <motion.button
                    key={optId}
                    type="button"
                    disabled={!isInteractive}
                    onClick={() => isInteractive && setSelectedOptionId(optId)}
                    className="w-full p-4 rounded-2xl flex items-center justify-between gap-4 text-left transition-all border-0"
                    style={{
                      background: optBg,
                      border: optBorder,
                      cursor: isInteractive ? 'pointer' : 'default',
                    }}
                    whileHover={isInteractive ? { scale: 1.01 } : {}}
                    whileTap={isInteractive ? { scale: 0.99 } : {}}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-orbitron font-black text-xs flex-shrink-0 transition-all"
                        style={{ background: letterBg, color: letterColor }}
                      >
                        {optLetter}
                      </div>
                      <span
                        className="font-inter text-sm sm:text-base transition-all"
                        style={{
                          color: isSubmitted && !isSelected
                            ? 'rgba(255,255,255,0.4)'
                            : 'rgba(255,255,255,0.92)',
                        }}
                      >
                        {opt.optionText}
                      </span>
                    </div>

                    <div
                      className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        borderColor: showCheck
                          ? '#10B981'
                          : showX
                          ? '#F43F5E'
                          : isSelected
                          ? accentColor
                          : 'rgba(255,255,255,0.2)',
                        background: showCheck
                          ? '#10B981'
                          : showX
                          ? '#F43F5E'
                          : isSelected
                          ? accentColor
                          : 'transparent',
                      }}
                    >
                      {showCheck && <Check size={12} className="text-white stroke-[3]" />}
                      {showX && <X size={12} className="text-white stroke-[3]" />}
                      {!showCheck && !showX && isSelected && <Check size={12} className="text-slate-950 stroke-[3]" />}
                    </div>
                  </motion.button>
                );

              })}
            </div>
          )}

          {/* 2. Calculation / Numeric Input */}
          {isCalculation && (
            <div className="mb-6">
              <label className="block text-xs font-orbitron font-bold text-white/70 uppercase tracking-wider mb-2">
                Enter Your Calculated Value
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={calculationInput}
                  onChange={(e) => setCalculationInput(e.target.value)}
                  placeholder="e.g. 2, 42, or formula"
                  className="w-full p-4 rounded-2xl bg-black/40 border text-white font-mono text-base sm:text-lg focus:outline-none transition-all"
                  style={{
                    borderColor: isSubmitted
                      ? feedback?.isCorrect ? '#10B981' : '#F43F5E'
                      : calculationInput.trim() ? accentColor : 'rgba(255,255,255,0.15)',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSubmitted && calculationInput.trim()) {
                      handleSubmitAnswer();
                    }
                  }}
                />
                {currentQuestion.puzzleData?.unit && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-mono bg-white/10 text-white/70">
                    {currentQuestion.puzzleData.unit}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 3. Unsupported Type Notice */}
          {isUnsupported && (
            <div
              className="rounded-2xl p-5 mb-6 flex items-start gap-3.5"
              style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)' }}
            >
              <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-orbitron font-bold text-xs text-amber-400 mb-1">
                  Specialized Question Format
                </h4>
                <p className="text-xs font-inter text-white/70 leading-relaxed">
                  This question type is not supported by this quiz engine yet. You may skip to the next question.
                </p>
              </div>
            </div>
          )}

          {/* ── Checking State Banner (while awaiting backend response) ── */}
          <AnimatePresence>
            {isChecking && (
              <motion.div
                className="rounded-2xl p-4 mb-6 flex items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                aria-live="polite"
              >
                <Loader2 size={18} className="text-white/60 animate-spin flex-shrink-0" />
                <p className="font-orbitron font-bold text-sm text-white/70">Checking answer…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── API Error Banner (validation request failed) ── */}
          <AnimatePresence>
            {answerError && !isChecking && (
              <motion.div
                className="rounded-2xl p-4 mb-6 flex items-center gap-3"
                style={{ background: 'rgba(251,191,36,0.10)', border: '1px solid rgba(251,191,36,0.35)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                aria-live="polite"
              >
                <AlertCircle size={18} className="text-amber-400 flex-shrink-0" />
                <p className="font-orbitron font-bold text-sm text-amber-400">{answerError}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Feedback Banner After Submit (authoritative result from backend) ── */}
          <AnimatePresence>
            {feedback && !isChecking && (
              <motion.div
                className="rounded-2xl p-4 mb-6 flex items-center justify-between gap-4"
                style={{
                  background: feedback.isCorrect ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                  border: `1px solid ${feedback.isCorrect ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="alert"
                aria-live="polite"
              >
                <div className="flex items-center gap-3">
                  {feedback.isCorrect ? (
                    <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle size={20} className="text-rose-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`font-orbitron font-bold text-sm ${feedback.isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {feedback.message}
                    </p>
                    {feedback.isCorrect && (
                      <p className="text-xs font-space text-emerald-300/80">
                        +{feedback.earnedPoints} XP added to session
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Action Buttons ── */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {!isSubmitted ? (
              <motion.button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={
                  isChecking ||
                  (isMCQ ? !selectedOptionId : isCalculation ? !calculationInput.trim() : false)
                }
                aria-busy={isChecking}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-orbitron font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 border-0 transition-all shadow-lg"
                style={{
                  cursor: isChecking ? 'wait' : ((isMCQ && selectedOptionId) || (isCalculation && calculationInput.trim()) || isUnsupported) ? 'pointer' : 'default',
                  background: isChecking
                    ? 'rgba(255,255,255,0.08)'
                    : (isMCQ && selectedOptionId) || (isCalculation && calculationInput.trim()) || isUnsupported
                    ? `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`
                    : 'rgba(255,255,255,0.08)',
                  color: isChecking
                    ? '#94A3B8'
                    : (isMCQ && selectedOptionId) || (isCalculation && calculationInput.trim()) || isUnsupported
                    ? '#020609'
                    : '#94A3B8',
                  boxShadow: !isChecking && ((isMCQ && selectedOptionId) || (isCalculation && calculationInput.trim()))
                    ? `0 0 25px ${glowColor}`
                    : 'none',
                }}
                whileHover={!isChecking ? { scale: 1.02 } : {}}
                whileTap={!isChecking ? { scale: 0.98 } : {}}
              >
                {isChecking ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Checking…</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>{isUnsupported ? 'Skip Question' : 'Submit Answer'}</span>
                  </>
                )}
              </motion.button>
            ) : (
              <motion.button
                type="button"
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-orbitron font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 text-slate-950 cursor-pointer border-0 transition-all shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
                  boxShadow: `0 0 30px ${glowColor}`,
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Complete Mission'}</span>
                <ChevronRight size={16} />
              </motion.button>
            )}
          </div>

        </motion.div>

      </main>
    </div>
  );
}
