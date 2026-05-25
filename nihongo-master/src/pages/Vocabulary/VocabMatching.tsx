// src/pages/Vocabulary/VocabMatching.tsx
// Nối từ: bên trái là từ Nhật, bên phải là nghĩa tiếng Việt
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, RotateCcw, Trophy } from 'lucide-react';
import { vocabularyN3, getN3Lessons } from '../../data/vocabularyN3';
import type { Word } from '../../types';

const PAIR_COUNT = 6; // Số cặp mỗi vòng

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface Pair {
  word: Word;
  jpId: string;  // unique key cho cột trái
  viId: string;  // unique key cho cột phải
}

export default function VocabMatching() {
  const lessons = getN3Lessons();
  const [selectedLesson, setSelectedLesson] = useState('all');
  const [started, setStarted] = useState(false);
  const [round, setRound] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);

  const fullPool = useMemo(() => {
    return selectedLesson === 'all'
      ? vocabularyN3
      : vocabularyN3.filter(w => w.lesson === selectedLesson);
  }, [selectedLesson]);

  // Mỗi round lấy PAIR_COUNT từ pool (xoay vòng)
  const pairs: Pair[] = useMemo(() => {
    const shuffled = shuffle(fullPool);
    const slice = shuffled.slice(0, PAIR_COUNT);
    return slice.map(word => ({
      word,
      jpId: `jp_${word.id}`,
      viId: `vi_${word.id}`,
    }));
  }, [fullPool, round]); // eslint-disable-line react-hooks/exhaustive-deps

  const getMeaning = (w: Word) =>
    typeof w.meaning === 'object' ? w.meaning.vi : w.meaning;

  // Cột trái (JP) và cột phải (VI) được shuffle độc lập
  const leftItems = useMemo(() => shuffle(pairs.map(p => ({ id: p.jpId, label: p.word.alt_kanji ? `${p.word.kanji} (${p.word.alt_kanji})` : p.word.kanji, sub: p.word.hiragana, pairId: p.word.id }))), [pairs]);
  const rightItems = useMemo(() => shuffle(pairs.map(p => ({ id: p.viId, label: getMeaning(p.word), pairId: p.word.id }))), [pairs]); // eslint-disable-line react-hooks/exhaustive-deps

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set()); // pairId của những cặp đúng
  const [errorPair, setErrorPair] = useState<{ l: string, r: string } | null>(null);

  const isComplete = matched.size === pairs.length;

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      const leftPairId = leftItems.find(l => l.id === selectedLeft)?.pairId;
      const rightPairId = rightItems.find(r => r.id === selectedRight)?.pairId;

      if (leftPairId === rightPairId && leftPairId) {
        // Đúng
        setMatched(prev => new Set([...prev, leftPairId]));
        setTotalCorrect(c => c + 1);
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        // Sai
        setErrorPair({ l: selectedLeft, r: selectedRight });
        setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
          setErrorPair(null);
        }, 800);
      }
    }
  }, [selectedLeft, selectedRight, leftItems, rightItems]);

  const handleLeftClick = (pairId: string, id: string) => {
    if (errorPair || matched.has(pairId)) return;
    setSelectedLeft(id === selectedLeft ? null : id);
  };

  const handleRightClick = (pairId: string, id: string) => {
    if (errorPair || matched.has(pairId)) return;
    setSelectedRight(id === selectedRight ? null : id);
  };

  const handleNextRound = () => {
    setRound(r => r + 1);
    setMatched(new Set());
    setSelectedLeft(null);
    setSelectedRight(null);
    setErrorPair(null);
  };

  // ──────────── SETUP ────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
        <div className="max-w-lg mx-auto">
          <Link to="/practice/vocabulary" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">🔗 Nối từ</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Nối Kanji với nghĩa tiếng Việt tương ứng. Mỗi vòng có {PAIR_COUNT} cặp.
          </p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">📚 Bài học</label>
              <select
                value={selectedLesson}
                onChange={e => setSelectedLesson(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="all">Tất cả ({vocabularyN3.length} từ)</option>
                {lessons.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setStarted(true)}
              disabled={fullPool.length < PAIR_COUNT}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              {fullPool.length < PAIR_COUNT
                ? `Cần ít nhất ${PAIR_COUNT} từ (hiện có ${fullPool.length})`
                : 'Bắt đầu'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────── GAME ────────────

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </button>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500 dark:text-slate-400">Vòng {round + 1}</span>
            <span className="text-blue-500 dark:text-blue-400">Điểm: {totalCorrect}</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <CheckCircle2 size={14} /> {matched.size}/{pairs.length}
            </span>
          </div>
        </div>

        {/* Grid nối từ */}
        <div className="grid grid-cols-2 gap-3">
          {/* Cột trái — JP */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-center text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">🇯🇵 Kanji</div>
            {leftItems.map(item => {
              const isMatched = matched.has(item.pairId);
              const isSelected = selectedLeft === item.id;
              const isWrong = errorPair?.l === item.id;
              
              let btnClass = "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-white hover:border-emerald-400 hover:shadow-sm";
              if (isMatched) btnClass = "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 opacity-70 cursor-default";
              else if (isWrong) btnClass = "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400";
              else if (isSelected) btnClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-md";

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleLeftClick(item.pairId, item.id)}
                  disabled={isMatched}
                  whileTap={{ scale: isMatched ? 1 : 0.95 }}
                  animate={isWrong ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`w-full py-4 px-3 rounded-2xl border-2 font-bold text-center transition-all ${btnClass}`}
                >
                  <div className="text-xl">{item.label}</div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{item.sub}</div>
                </motion.button>
              );
            })}
          </div>

          {/* Cột phải — VI */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-center text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">🇻🇳 Nghĩa</div>
            {rightItems.map(item => {
              const isMatched = matched.has(item.pairId);
              const isSelected = selectedRight === item.id;
              const isWrong = errorPair?.r === item.id;

              let btnClass = "border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-white hover:border-emerald-400 hover:shadow-sm cursor-pointer";
              if (isMatched) btnClass = "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 opacity-70 cursor-default";
              else if (isWrong) btnClass = "border-red-400 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400";
              else if (isSelected) btnClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-md cursor-pointer";

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleRightClick(item.pairId, item.id)}
                  disabled={isMatched}
                  whileTap={{ scale: isMatched ? 1 : 0.95 }}
                  animate={isWrong ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  className={`w-full py-4 px-3 rounded-2xl border-2 font-medium text-center transition-all ${btnClass}`}
                >
                  <div className="text-sm leading-snug">{item.label}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Complete overlay */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center">
                <Trophy className="mx-auto mb-3 text-amber-400" size={48} />
                <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Xuất sắc!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6">
                  Bạn đã nối đúng tất cả {pairs.length} cặp từ!
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleNextRound}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <RotateCcw size={16} /> Vòng mới
                  </button>
                  <Link to="/practice/vocabulary" className="block w-full py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:border-emerald-400 transition-all text-center">
                    Về dashboard
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
