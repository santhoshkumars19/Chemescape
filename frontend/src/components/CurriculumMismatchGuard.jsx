import React from 'react';
import { motion } from 'framer-motion';
import { useNavigation } from '../context/NavigationContext';
import { AlertTriangle, ArrowLeft, GraduationCap } from 'lucide-react';

export default function CurriculumMismatchGuard({
  expectedStandard = 'grade-11',
  expectedSubject = 'chemistry',
  gameName = 'Mission Game',
  children,
}) {
  const {
    navigateTo,
    selectedStandardId,
    selectedStandard,
    selectedSubjectId,
    selectedSubject,
    setSelectedStandardId,
    setSelectedStandard,
    setSelectedSubjectId,
    setSelectedSubject,
  } = useNavigation();

  // If user has explicitly selected a different standard or subject
  const isStdMismatch = Boolean(selectedStandardId && selectedStandardId !== expectedStandard && selectedStandardId !== 'std-11');
  const isSubjMismatch = Boolean(selectedSubjectId && selectedSubjectId !== expectedSubject && selectedSubjectId !== 'subj-chem');

  if (isStdMismatch || isSubjMismatch) {
    const activeStd = selectedStandard || selectedStandardId || 'Selected Standard';
    const activeSubj = selectedSubject || selectedSubjectId || 'Selected Subject';

    return (
      <div className="min-h-screen bg-[#020609] text-white flex items-center justify-center p-4">
        <motion.div
          className="max-w-lg w-full rounded-3xl p-8 text-center border"
          style={{
            background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(8,14,24,0.98))',
            borderColor: 'rgba(245,158,11,0.4)',
            boxShadow: '0 0 50px rgba(245,158,11,0.2)',
          }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-5 bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <AlertTriangle size={32} />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-[10px] font-orbitron font-bold tracking-widest uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3">
            Curriculum Context Mismatch
          </span>

          <h2 className="font-orbitron font-black text-xl sm:text-2xl text-white mb-2">
            Wrong Subject Selected
          </h2>

          <p className="text-sm font-inter text-white/70 leading-relaxed mb-6">
            <strong>{gameName}</strong> is designed specifically for <strong>11th Standard Chemistry</strong>. Your active learning context is <strong>{activeStd} • {activeSubj}</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigateTo('chapters')}
              className="px-5 py-3 rounded-xl font-orbitron font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white cursor-pointer border-0"
            >
              <ArrowLeft size={14} />
              <span>Back to {activeSubj} Chapters</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedStandardId('grade-11');
                setSelectedStandard('11th Standard');
                setSelectedSubjectId('chemistry');
                setSelectedSubject('Chemistry');
                navigateTo('chapters');
              }}
              className="px-5 py-3 rounded-xl font-orbitron font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 cursor-pointer border-0"
            >
              <GraduationCap size={14} />
              <span>Switch to 11th Chemistry</span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return children;
}
