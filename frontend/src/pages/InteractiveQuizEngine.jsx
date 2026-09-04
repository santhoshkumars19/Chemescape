import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { apiClient } from '../services/apiClient';
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
  Send, HelpCircle, AlertCircle, Play, Loader2, ChevronLeft,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// MAIN INTERACTIVE QUIZ ENGINE
// ─────────────────────────────────────────────────────────────────────────────
export default function InteractiveQuizEngine() {
  const { user } = useAuth();
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
  const resolvedStdId = selectedStandardId || 'grade-8';
  const resolvedSubjId = selectedSubjectId || 'science';
  const stdDisplayName = selectedStandard || (resolvedStdId === 'grade-4' ? '4th Standard' : resolvedStdId === 'grade-5' ? '5th Standard' : '8th Standard');
  const subjDisplayName = selectedSubject || (resolvedSubjId.charAt(0).toUpperCase() + resolvedSubjId.slice(1));

  const subjects = useMemo(() => getSubjectsForStandard(resolvedStdId), [resolvedStdId]);
  const subjConfig = useMemo(() => subjects.find(s => s.id === resolvedSubjId), [subjects, resolvedSubjId]);
  const accentColor = subjConfig?.color || '#10B981';

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

  const chapterTitle = activeChapter?.title || 'Chapter Quiz';

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
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [answerError, setAnswerError] = useState(null);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [submittingCompletion, setSubmittingCompletion] = useState(false);
  const [completionData, setCompletionData] = useState(null);
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

        if (!targetRoomId) {
          const cand = selectedRoomId || (typeof currentRoom === 'object' ? currentRoom?.id : currentRoom);
          if (cand && typeof cand === 'string' && cand.startsWith('room-')) {
            targetRoomId = cand;
          }
        }

        if (!targetRoomId && activeChapter?.id && typeof activeChapter.id === 'string' && activeChapter.id.startsWith('ch-')) {
          targetRoomId = activeChapter.id.replace('ch-', 'room-');
        }

        if (!targetRoomId) {
          const stdNum = String(resolvedStdId).replace(/[^0-9]/g, '') || '8';
          const subjCodeMap = {
            tamil: 'tam',
            english: 'eng',
            mathematics: 'math',
            science: 'sci',
            'social-science': 'soc',
          };
          const code = subjCodeMap[resolvedSubjId] || String(resolvedSubjId).slice(0, 3);
          const chNum = activeChapter?.chapterNumber || 1;
          targetRoomId = `room-${code}${stdNum}-${chNum}`;
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

        let qRes = await roomService.getQuestionsByRoom(targetRoomId, {
          standardId: resolvedStdId,
          subjectId: resolvedSubjId,
          chapterId: activeChapter?.id,
        });
        let rawList = qRes?.data?.questions || qRes?.questions || (Array.isArray(qRes) ? qRes : []);

        if ((!rawList || rawList.length === 0) && targetRoomId) {
          try {
            qRes = await roomService.getQuestionsByRoom(targetRoomId, {
              standardId: resolvedStdId,
              subjectId: resolvedSubjId,
            });
            rawList = qRes?.data?.questions || qRes?.questions || (Array.isArray(qRes) ? qRes : []);
          } catch {}
        }

        if (isMounted) {
          if (Array.isArray(rawList) && rawList.length > 0) {
            setQuestions(rawList.slice(0, 10));
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

  const currentQuestion = useMemo(() => {
    if (!questions || questions.length === 0) return null;
    return questions[currentQuestionIndex] || null;
  }, [questions, currentQuestionIndex]);

  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  // ── 5. Server-Authoritative Answer Submission ───────────────────────────────
  const handleSubmitAnswer = useCallback(async () => {
    if (!currentQuestion || isSubmitted || isChecking) return;

    const qType = currentQuestion.questionType || 'MCQ';
    let answerToSubmit = null;
    if (qType === 'MCQ' || qType === 'SINGLE_CHOICE') {
      if (!selectedOptionId) return;
      answerToSubmit = selectedOptionId;
    } else if (qType === 'CALCULATION' || qType === 'NUMERIC') {
      if (!calculationInput.trim()) return;
      answerToSubmit = calculationInput.trim();
    } else {
      answerToSubmit = '__SKIP__';
    }

    const questionId = currentQuestion.id;
    const roomId = loadedRoomId;

    if (!roomId || !questionId) {
      setAnswerError('Cannot validate answer: room context is missing.');
      return;
    }

    setIsChecking(true);
    setAnswerError(null);

    try {
      const result = await gameService.submitAnswer(questionId, roomId, answerToSubmit);
      const isCorrect = result?.correct === true;
      const earnedPoints = result?.points ?? (isCorrect ? (currentQuestion.points || 100) : 0);
      const serverFeedback = result?.feedback || (isCorrect ? 'Correct! Excellent job.' : 'Incorrect. Keep going!');

      setIsChecking(false);
      setIsSubmitted(true);
      setFeedback({
        isCorrect,
        message: isCorrect ? `✓ ${serverFeedback}` : `✕ ${serverFeedback}`,
        earnedPoints,
      });

      if (isCorrect) {
        setScore(prev => prev + earnedPoints);
        setCorrectCount(prev => prev + 1);
      } else {
        setWrongCount(prev => prev + 1);
      }
    } catch (err) {
      setIsChecking(false);
      setAnswerError('Unable to check your answer. Please retry.');
    }
  }, [currentQuestion, isSubmitted, isChecking, selectedOptionId, calculationInput, loadedRoomId]);

  const handleToggleHint = useCallback(() => {
    if (!hintVisible) setHintsUsed(prev => prev + 1);
    setHintVisible(prev => !prev);
  }, [hintVisible]);

  // ── 6. Mission Completion ──────────────────────────────────────────────────
  const handleCompleteMission = useCallback(async () => {
    if (submittingCompletion) return;
    setSubmittingCompletion(true);

    const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    const calculatedStars = correctCount >= 8 ? 3 : correctCount >= 7 ? 2 : correctCount >= 5 ? 1 : 0;
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

      const isPassed = data?.passed === true || (data?.passed !== false && correctCount >= 7);
      if (isPassed) {
        markRoomCompleted(targetRoomId, activeChapter?.id);
        refreshUserStats();
      }

      apiClient.post('/reports/activity', {
        name: user?.name || 'Student Scholar',
        userId: user?.id || 'usr-student-1',
        standard: stdDisplayName,
        subject: subjDisplayName,
        chapter: activeChapter?.title || activeChapter?.name || 'Chapter Quiz',
        gameOrQuizName: `${subjDisplayName} Chapter Quiz`,
        points: score,
        accuracy: `${accuracy}%`,
        totalQuestions,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        timeSpentSec: timeSpentSeconds,
        status: isPassed ? 'PASSED' : 'FAILED',
      }).catch(err => console.warn('[QuizEngine] Activity report notice:', err.message));

      setQuizComplete(true);
      setSubmittingCompletion(false);
    } catch (err) {
      console.warn('[QuizEngine] Completion API call returned:', err.message);
      const isPassed = correctCount >= 7;
      if (isPassed) {
        markRoomCompleted(targetRoomId, activeChapter?.id);
        refreshUserStats();
      }
      setCompletionData({
        passed: isPassed,
        completed: isPassed,
        score: correctCount,
        totalQuestions,
        minimumPassScore: 7,
        retryRequired: !isPassed,
        nextChapterUnlocked: isPassed,
        awardedXP: isPassed ? score : 0,
        awardedCoins: isPassed ? (accuracy >= 80 ? 100 : 50) : 0,
      });

      apiClient.post('/reports/activity', {
        name: user?.name || 'Student Scholar',
        userId: user?.id || 'usr-student-1',
        standard: stdDisplayName,
        subject: subjDisplayName,
        chapter: activeChapter?.title || activeChapter?.name || 'Chapter Quiz',
        gameOrQuizName: `${subjDisplayName} Chapter Quiz`,
        points: score,
        accuracy: `${accuracy}%`,
        totalQuestions,
        correctAnswers: correctCount,
        wrongAnswers: wrongCount,
        timeSpentSec: timeSpentSeconds,
        status: isPassed ? 'PASSED' : 'FAILED',
      }).catch(err => console.warn('[QuizEngine] Activity report fallback notice:', err.message));

      setQuizComplete(true);
      setSubmittingCompletion(false);
    }
  }, [
    submittingCompletion, totalQuestions, correctCount, wrongCount, hintsUsed,
    score, timeSpentSeconds, loadedRoomId, selectedRoomId, currentRoom, activeChapter?.id,
    markRoomCompleted, refreshUserStats, user, stdDisplayName, subjDisplayName, activeChapter
  ]);

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

  const handlePrevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOptionId(null);
      setCalculationInput('');
      setHintVisible(false);
      setIsSubmitted(false);
      setIsChecking(false);
      setFeedback(null);
      setAnswerError(null);
    }
  }, [currentQuestionIndex]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── LOADING STATE ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col items-center justify-center p-6">
        <motion.div
          className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 text-3xl shadow-lg"
          style={{ background: isDark ? '#112820' : '#E8F5E9', border: '1.5px solid #10B981' }}
          animate={{ scale: [1, 1.08, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          ⚡
        </motion.div>
        <p className="font-heading font-extrabold text-lg text-[var(--text-main)] mb-1">
          Loading Quiz Questions...
        </p>
        <p className="text-xs text-[var(--text-muted)] font-medium">
          {stdDisplayName} • {subjDisplayName} • {chapterTitle}
        </p>
      </div>
    );
  }

  // ── EMPTY STATE ─────────────────────────────────────────────────────────────
  if (!loading && questions.length === 0) {
    return (
      <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col items-center justify-center p-6">
        <div className="card-modern max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-5 text-3xl bg-emerald-500/10 border border-emerald-500/20">
            📋
          </div>
          <h2 className="font-heading font-extrabold text-xl text-[var(--text-main)] mb-2">
            No questions available
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
            Questions for <strong>{chapterTitle}</strong> are being prepared. Please explore another subject or check back soon!
          </p>
          <button
            type="button"
            onClick={() => navigateTo('chapters')}
            className="w-full pill-btn-forest text-xs font-heading font-bold"
          >
            Back to Chapters
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS / CELEBRATION STATE ─────────────────────────────────────────────
  if (quizComplete) {
    const isPassed = completionData?.passed === true || (completionData?.passed === undefined && correctCount >= 7);
    const finalEarnedXP = isPassed ? (completionData?.awardedXP ?? score) : 0;
    const finalEarnedCoins = isPassed ? (completionData?.awardedCoins ?? (correctCount >= 8 ? 100 : 50)) : 0;

    return (
      <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col items-center justify-center p-6">
        <motion.div
          className="card-modern relative w-full max-w-lg rounded-3xl p-8 sm:p-10 text-center"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-5 text-4xl shadow-md"
            style={{
              background: isPassed ? '#E8F5E9' : '#FFEBEB',
              border: isPassed ? '2px solid #10B981' : '2px solid #F43F5E',
            }}
          >
            {isPassed ? '🏆' : '⚠️'}
          </div>

          <span
            className="inline-block px-3.5 py-1 rounded-full text-xs font-heading font-extrabold tracking-wider uppercase mb-2"
            style={{
              background: isPassed ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
              color: isPassed ? '#10B981' : '#F43F5E',
            }}
          >
            {isPassed ? 'Quiz Completed Successfully' : 'Quiz Not Cleared'}
          </span>

          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--text-main)] mb-2">
            {isPassed ? 'Great Job, Scholar!' : 'Nice Effort! Try Again'}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium mb-6">
            {isPassed ? (
              <>You scored <strong>{correctCount} / {totalQuestions}</strong> correct answers in <strong>{chapterTitle}</strong>.</>
            ) : (
              <>You scored <strong>{correctCount} / {totalQuestions}</strong>. You need at least 7 correct answers to pass this chapter.</>
            )}
          </p>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="font-heading font-extrabold text-lg text-emerald-600 dark:text-emerald-400 leading-none">
                {correctCount}/{totalQuestions}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] font-medium mt-1">Score</p>
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <p className="font-heading font-extrabold text-lg text-amber-500 leading-none">
                +{finalEarnedXP}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] font-medium mt-1">XP Earned</p>
            </div>

            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20">
              <p className="font-heading font-extrabold text-lg text-teal-600 dark:text-teal-400 leading-none">
                {formatTime(timeSpentSeconds)}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] font-medium mt-1">Time</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
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
                setCompletionData(null);
              }}
              className="w-full sm:w-auto pill-btn-outline text-xs font-heading font-bold"
            >
              <RotateCcw size={14} className="inline mr-1.5" />
              <span>Replay Quiz</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('chapters')}
              className="w-full sm:w-auto pill-btn-forest text-xs font-heading font-bold"
            >
              <span>Back to Chapters</span>
              <ChevronRight size={14} className="inline ml-1.5" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── ACTIVE QUESTION SCREEN (Direct Match to Reference Image) ────────────────
  const qType = currentQuestion?.questionType || 'MCQ';
  const isMCQ = qType === 'MCQ' || qType === 'SINGLE_CHOICE';
  const isCalculation = qType === 'CALCULATION' || qType === 'NUMERIC';

  return (
    <div className="relative min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] flex flex-col transition-colors duration-200">
      
      {/* ── TOP HEADER (Reference Design: Back Circle, Title, Progress Pill) ── */}
      <header className="sticky top-0 z-30 bg-[var(--bg-card)] border-b border-[var(--border-primary)] shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          
          {/* Left: Circular Back Arrow Button */}
          <button
            type="button"
            onClick={() => navigateTo('chapters')}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-[var(--border-primary)] bg-[var(--bg-secondary)] text-[var(--text-main)] hover:border-emerald-500 transition-colors cursor-pointer"
            title="Back to Chapters"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Center: Quiz Title */}
          <div className="text-center min-w-0">
            <h1 className="font-heading font-extrabold text-base sm:text-lg text-[var(--text-main)] truncate">
              {subjDisplayName} Quiz
            </h1>
            <p className="text-[11px] text-[var(--text-muted)] font-medium truncate">
              {chapterTitle}
            </p>
          </div>

          {/* Right: Progress Counter Pill (e.g. "7 / 20") */}
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-heading font-extrabold text-xs sm:text-sm whitespace-nowrap">
            {currentQuestionIndex + 1} / {totalQuestions}
          </div>

        </div>

        {/* Progress Bar Track right below header */}
        <div className="w-full h-1.5 bg-emerald-500/10 overflow-hidden">
          <motion.div
            className="h-full rounded-r-full"
            style={{ background: 'linear-gradient(90deg, #0C3B2E, #10B981)' }}
            initial={{ width: `${((currentQuestionIndex) / totalQuestions) * 100}%` }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </header>

      {/* ── MAIN QUIZ AREA ── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full flex flex-col justify-between">
        
        {/* Question Card */}
        <motion.div
          key={currentQuestion.id || currentQuestionIndex}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="card-modern p-6 sm:p-8 mb-6"
        >
          {/* Metadata Row: Difficulty, Points, Hint */}
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-heading font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {currentQuestion.difficulty || 'Standard'}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-heading font-extrabold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                +{currentQuestion.points || 100} XP
              </span>
            </div>

            {/* Hint Button */}
            <button
              type="button"
              onClick={handleToggleHint}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-semibold cursor-pointer border transition-all"
              style={{
                background: hintVisible ? '#FEF3C7' : 'transparent',
                borderColor: hintVisible ? '#F59E0B' : 'var(--border-primary)',
                color: hintVisible ? '#B45309' : 'var(--text-muted)',
              }}
            >
              <Lightbulb size={13} className={hintVisible ? 'fill-amber-500 text-amber-500' : ''} />
              <span>{hintVisible ? 'Hide Hint' : 'Hint'}</span>
            </button>
          </div>

          {/* Hint Dropdown */}
          <AnimatePresence>
            {hintVisible && (
              <motion.div
                className="p-4 rounded-2xl mb-6 bg-amber-500/10 border border-amber-500/25 flex items-start gap-3"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-heading font-bold text-xs text-amber-500 uppercase tracking-wider mb-0.5">
                    Helpful Clue
                  </p>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                    {currentQuestion.hint || 'Review the core concepts from the chapter to solve this problem.'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Text */}
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[var(--text-main)] leading-snug mb-6">
            {currentQuestion.questionText}
          </h2>

          {/* Multiple Choice Options List */}
          {isMCQ && (
            <div className="space-y-3 mb-6">
              {(currentQuestion.options || []).map((opt, i) => {
                const optId = opt.id || opt.optionKey || String(i);
                const isSelected = selectedOptionId === optId;
                const optLetter = opt.optionKey || String.fromCharCode(65 + i);

                let cardClass = 'quiz-option-card';
                let isCardSelected = isSelected;
                let showCheck = false;
                let showX = false;

                if (isSubmitted) {
                  if (isSelected && feedback?.isCorrect) {
                    cardClass += ' correct';
                    showCheck = true;
                  } else if (isSelected && !feedback?.isCorrect) {
                    cardClass += ' wrong';
                    showX = true;
                  }
                } else if (isSelected) {
                  cardClass += ' active';
                }

                const isInteractive = !isSubmitted && !isChecking;

                return (
                  <button
                    key={optId}
                    type="button"
                    disabled={!isInteractive}
                    onClick={() => isInteractive && setSelectedOptionId(optId)}
                    className={`${cardClass} cursor-pointer w-full text-left`}
                  >
                    {/* Left: Option Letter Pill / Circle */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-heading font-extrabold text-xs flex-shrink-0 transition-all"
                        style={{
                          background: isSelected ? '#0C3B2E' : isDark ? 'rgba(255,255,255,0.06)' : '#F0F4F2',
                          color: isSelected ? '#34D399' : 'var(--text-secondary)',
                        }}
                      >
                        {optLetter}
                      </div>

                      <span className="text-sm sm:text-base font-sans font-medium text-[var(--text-main)]">
                        {opt.optionText}
                      </span>
                    </div>

                    {/* Right: Round Selection Checkmark Circle (Reference Design) */}
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ml-2"
                      style={{
                        background: showCheck
                          ? '#10B981'
                          : showX
                          ? '#F43F5E'
                          : isSelected
                          ? '#10B981'
                          : 'transparent',
                        border: showCheck || showX || isSelected
                          ? 'none'
                          : '2px solid var(--border-primary)',
                      }}
                    >
                      {(showCheck || (!showX && isSelected)) && (
                        <Check size={14} className="text-white stroke-[3]" />
                      )}
                      {showX && (
                        <X size={14} className="text-white stroke-[3]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Numeric / Calculation Input */}
          {isCalculation && (
            <div className="mb-6">
              <label className="block text-xs font-heading font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Enter Your Answer
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={isSubmitted}
                  value={calculationInput}
                  onChange={(e) => setCalculationInput(e.target.value)}
                  placeholder="Type numeric answer or formula..."
                  className="w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-main)] font-mono text-base focus:outline-none focus:border-emerald-500 transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSubmitted && calculationInput.trim()) {
                      handleSubmitAnswer();
                    }
                  }}
                />
                {currentQuestion.puzzleData?.unit && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {currentQuestion.puzzleData.unit}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Checking Spinner */}
          <AnimatePresence>
            {isChecking && (
              <motion.div
                className="p-3.5 rounded-2xl mb-4 bg-emerald-500/10 flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader2 size={16} className="animate-spin" />
                <span className="font-heading font-semibold text-xs">Checking your answer...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Feedback Banner */}
          <AnimatePresence>
            {feedback && !isChecking && (
              <motion.div
                className={`p-4 rounded-2xl mb-4 flex items-center gap-3 ${
                  feedback.isCorrect ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-rose-500/15 border border-rose-500/30'
                }`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {feedback.isCorrect ? (
                  <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle size={20} className="text-rose-500 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-heading font-bold text-sm ${feedback.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                    {feedback.message}
                  </p>
                  {feedback.isCorrect && (
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      +{feedback.earnedPoints} XP awarded!
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* API error banner */}
          {answerError && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs font-semibold mb-4">
              {answerError}
            </div>
          )}

        </motion.div>

        {/* ── FOOTER NAVIGATION (Previous & Next Pill Buttons) ── */}
        <div className="flex items-center justify-between gap-4 pt-2">
          
          {/* Previous Pill Button */}
          <button
            type="button"
            disabled={currentQuestionIndex === 0 || isChecking}
            onClick={handlePrevQuestion}
            className={`pill-btn-outline text-xs sm:text-sm font-heading font-bold flex items-center gap-1.5 ${
              currentQuestionIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          {/* Right Action: Submit Answer OR Next Question */}
          {!isSubmitted ? (
            <button
              type="button"
              disabled={isChecking || (isMCQ ? !selectedOptionId : !calculationInput.trim())}
              onClick={handleSubmitAnswer}
              className={`pill-btn-forest text-xs sm:text-sm font-heading font-extrabold flex items-center gap-2 cursor-pointer shadow-md ${
                (isMCQ ? !selectedOptionId : !calculationInput.trim()) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isChecking ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <span>Submit Answer</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNextQuestion}
              className="pill-btn-forest text-xs sm:text-sm font-heading font-extrabold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>{currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish Quiz'}</span>
              <ChevronRight size={16} />
            </button>
          )}

        </div>

      </main>
    </div>
  );
}
