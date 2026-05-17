// src/pages/Vocabulary/VocabQuiz.tsx
// Trắc nghiệm 4 đáp án — 2 chế độ: JP→VI hoặc VI→JP
import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, Trophy } from 'lucide-react';
import { vocabularyN3, getN3Lessons } from '../../data/vocabularyN3';
import type { Word } from '../../types';

type QuizMode = 'jp_to_vi' | 'vi_to_jp';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildOptions(correct: Word, pool: Word[], mode: QuizMode): string[] {
  const getMeaning = (w: Word) =>
    typeof w.meaning === 'object' ? w.meaning.vi : w.meaning;

  const getKanjiDisplay = (w: Word) => w.alt_kanji ? `${w.kanji} (${w.alt_kanji})` : w.kanji;

  const getDisplay = (w: Word) =>
    mode === 'jp_to_vi' ? getMeaning(w) : getKanjiDisplay(w);

  const correctAnswer = getDisplay(correct);
  const distractors = shuffle(pool.filter(w => w.id !== correct.id))
    .slice(0, 3)
    .map(getDisplay);

  return shuffle([correctAnswer, ...distractors]);
}

export default function VocabQuiz() {
  const lessons = getN3Lessons();
  const [selectedLesson, setSelectedLesson] = useState('all');
  const [mode, setMode] = useState<QuizMode>('jp_to_vi');
  const [started, setStarted] = useState(false);

  const pool = useMemo(() => {
    const base = selectedLesson === 'all'
      ? vocabularyN3
      : vocabularyN3.filter(w => w.lesson === selectedLesson);
    return shuffle(base);
  }, [selectedLesson]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);

  const current = pool[index];

  const options = useMemo(() => {
    if (!current) return [];
    return buildOptions(current, pool, mode);
  }, [current, pool, mode]);

  const getMeaning = (w: Word) =>
    typeof w.meaning === 'object' ? w.meaning.vi : w.meaning;

  const getKanjiDisplay = (w: Word) => w.alt_kanji ? `${w.kanji} (${w.alt_kanji})` : w.kanji;

  const correctAnswer = current
    ? mode === 'jp_to_vi' ? getMeaning(current) : getKanjiDisplay(current)
    : '';

  const handleSelect = useCallback((opt: string) => {
    if (selected !== null) return;
    setSelected(opt);
    if (opt === correctAnswer) setScore(s => s + 1);
    else setWrong(s => s + 1);
  }, [selected, correctAnswer]);

  const handleNext = () => {
    if (index + 1 >= pool.length) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setSelected(null);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setSelected(null);
    setScore(0);
    setWrong(0);
    setDone(false);
  };

  // ──────────── SETUP ────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
        <div className="max-w-lg mx-auto">
          <Link to="/vocabulary" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">📝 Trắc nghiệm</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">4 đáp án — chọn đáp án đúng.</p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">📚 Bài học</label>
              <select
                value={selectedLesson}
                onChange={e => setSelectedLesson(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-colors"
              >
                <option value="all">Tất cả ({vocabularyN3.length} từ)</option>
                {lessons.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">🔀 Chế độ câu hỏi</label>
              <div className="flex flex-col gap-3">
                {([
                  { value: 'jp_to_vi', label: '🇯🇵 Kanji/Hiragana → 🇻🇳 Nghĩa tiếng Việt' },
                  { value: 'vi_to_jp', label: '🇻🇳 Nghĩa tiếng Việt → 🇯🇵 Kanji' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setMode(opt.value)}
                    className={`py-3 px-4 rounded-xl border-2 font-medium text-left transition-all ${
                      mode === opt.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-blue-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStarted(true)}
              disabled={pool.length < 4}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              {pool.length < 4 ? `Cần ít nhất 4 từ (hiện có ${pool.length})` : 'Bắt đầu'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────── DONE ────────────
  if (done) {
    const total = score + wrong;
    const pct = Math.round((score / total) * 100);
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl max-w-sm w-full text-center"
        >
          <Trophy className="mx-auto mb-4 text-amber-400" size={56} />
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-1">Kết quả</h2>
          <div className="text-6xl font-black text-blue-600 dark:text-blue-400 my-4">{pct}%</div>
          <div className="flex gap-3 mb-8">
            <div className="flex-1 bg-green-50 dark:bg-green-900/30 rounded-xl p-3">
              <div className="text-xl font-bold text-green-600">{score}</div>
              <div className="text-xs text-green-600">Đúng</div>
            </div>
            <div className="flex-1 bg-red-50 dark:bg-red-900/30 rounded-xl p-3">
              <div className="text-xl font-bold text-red-500">{wrong}</div>
              <div className="text-xs text-red-500">Sai</div>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={handleRestart} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
              Làm lại
            </button>
            <Link to="/vocabulary" className="block w-full py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:border-blue-400 transition-all text-center">
              Về dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ──────────── QUIZ ────────────
  const progress = (index / pool.length) * 100;
  const questionText = mode === 'jp_to_vi' ? getKanjiDisplay(current) : getMeaning(current);
  const questionSub = mode === 'jp_to_vi' ? current.hiragana : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors">
            <ArrowLeft size={18} /> Cài đặt
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">{index + 1} / {pool.length}</span>
        </div>

        {/* Progress */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
          <motion.div className="h-full bg-blue-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 text-center">
              {current.lesson && (
                <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-medium mb-4 inline-block">
                  {current.lesson}
                </span>
              )}
              <div className="text-5xl font-bold text-slate-800 dark:text-white mt-3">{questionText}</div>
              {questionSub && (
                <div className="text-lg text-slate-400 dark:text-slate-500 mt-2">{questionSub}</div>
              )}
              <div className="text-sm text-slate-400 mt-3">
                {mode === 'jp_to_vi' ? 'Chọn nghĩa tiếng Việt đúng' : 'Chọn Kanji đúng'}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-3">
              {options.map((opt, i) => {
                const isCorrect = opt === correctAnswer;
                const isSelected = opt === selected;
                let btnClass = 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20';
                if (selected !== null) {
                  if (isCorrect) btnClass = 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300';
                  else if (isSelected) btnClass = 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                  else btnClass = 'border-slate-200 dark:border-slate-700 opacity-50 bg-white dark:bg-slate-800 text-slate-500';
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt)}
                    disabled={selected !== null}
                    className={`w-full py-4 px-5 rounded-2xl border-2 font-medium text-left transition-all flex items-center justify-between ${btnClass}`}
                  >
                    <span>{opt}</span>
                    {selected !== null && isCorrect && <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />}
                    {selected !== null && isSelected && !isCorrect && <XCircle size={20} className="text-red-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            {selected !== null && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className="w-full mt-5 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                {index + 1 >= pool.length ? '🏁 Xem kết quả' : 'Tiếp theo'} <ArrowRight size={18} />
              </motion.button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Score mini */}
        <div className="flex justify-center gap-6 mt-5 text-sm">
          <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={14} /> {score}</span>
          <span className="text-red-500 flex items-center gap-1"><XCircle size={14} /> {wrong}</span>
        </div>
      </div>
    </div>
  );
}
