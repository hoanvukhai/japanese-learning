// src/pages/Vocabulary/VocabFlashcard.tsx
// Tái sử dụng cơ chế lật thẻ, nhưng đơn giản hóa cho từ vựng (không chia thể)
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { vocabularyN3, getN3Lessons } from '../../data/vocabularyN3';
import type { Word } from '../../types';

type CardFace = 'jp' | 'vi'; // mặt trước hiển thị gì

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function VocabFlashcard() {
  const lessons = getN3Lessons();
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [frontFace, setFrontFace] = useState<CardFace>('jp');
  const [started, setStarted] = useState(false);

  const pool = useMemo(() => {
    const base = selectedLesson === 'all'
      ? vocabularyN3
      : vocabularyN3.filter(w => w.lesson === selectedLesson);
    return shuffle(base);
  }, [selectedLesson]);

  const [queue, setQueue] = useState<Word[]>([]);
  const [known, setKnown] = useState<Word[]>([]);
  const [learning, setLearning] = useState<Word[]>([]);
  const [isFlipped, setIsFlipped] = useState(false);

  const current = queue[0];

  const handleStart = () => {
    setQueue(pool);
    setKnown([]);
    setLearning([]);
    setIsFlipped(false);
    setStarted(true);
  };

  const handleResult = (knew: boolean) => {
    if (!current) return;
    if (knew) setKnown(p => [...p, current]);
    else setLearning(p => [...p, current]);
    setQueue(q => q.slice(1));
    setIsFlipped(false);
  };

  const handleRestart = () => {
    setQueue(shuffle([...known, ...learning]));
    setKnown([]);
    setLearning([]);
    setIsFlipped(false);
  };

  const handleRestartLearning = () => {
    setQueue(shuffle(learning));
    setKnown([]);
    setLearning([]);
    setIsFlipped(false);
  };

  const getMeaning = (w: Word) =>
    typeof w.meaning === 'object' ? w.meaning.vi : w.meaning;

  // ──────────── SETUP SCREEN ────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
        <div className="max-w-lg mx-auto">
          <Link to="/practice/vocabulary" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">🃏 Lật thẻ từ vựng</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Chọn bài học và chế độ hiển thị.</p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            {/* Chọn bài */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">📚 Bài học</label>
              <select
                value={selectedLesson}
                onChange={e => setSelectedLesson(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:border-violet-500 transition-colors"
              >
                <option value="all">Tất cả ({vocabularyN3.length} từ)</option>
                {lessons.map(l => (
                  <option key={l} value={l}>{l} ({vocabularyN3.filter(w => w.lesson === l).length} từ)</option>
                ))}
              </select>
            </div>

            {/* Chế độ mặt trước */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">🔄 Mặt trước hiển thị</label>
              <div className="flex gap-3">
                {(['jp', 'vi'] as CardFace[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFrontFace(f)}
                    className={`flex-1 py-3 rounded-xl font-medium border-2 transition-all ${
                      frontFace === f
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-violet-300'
                    }`}
                  >
                    {f === 'jp' ? '🇯🇵 Kanji / Hiragana' : '🇻🇳 Nghĩa tiếng Việt'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              Bắt đầu luyện tập
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──────────── DONE SCREEN ────────────
  if (queue.length === 0) {
    const total = known.length + learning.length;
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl max-w-sm w-full text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Hoàn thành!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Bạn đã học xong {total} từ.</p>

          <div className="flex gap-3 mb-6">
            <div className="flex-1 bg-green-50 dark:bg-green-900/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{known.length}</div>
              <div className="text-xs text-green-600 dark:text-green-400">Đã thuộc</div>
            </div>
            <div className="flex-1 bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{learning.length}</div>
              <div className="text-xs text-amber-600 dark:text-amber-400">Cần ôn</div>
            </div>
          </div>

          <div className="space-y-3">
            {learning.length > 0 && (
              <button
                onClick={handleRestartLearning}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all"
              >
                Ôn lại {learning.length} từ chưa thuộc
              </button>
            )}
            <button
              onClick={handleRestart}
              className="w-full py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:border-violet-400 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Học lại tất cả
            </button>
            <Link to="/practice/vocabulary" className="block w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all text-center">
              Về dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ──────────── CARD SCREEN ────────────
  const getKanjiDisplay = (w: Word) => w.alt_kanji ? `${w.kanji} (${w.alt_kanji})` : w.kanji;

  const frontContent = frontFace === 'jp' ? getKanjiDisplay(current) : getMeaning(current);
  const backContent = frontFace === 'jp' ? getMeaning(current) : getKanjiDisplay(current);
  const progress = ((known.length + learning.length) / (known.length + learning.length + queue.length)) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </button>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {known.length + learning.length} / {known.length + learning.length + queue.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-violet-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Lesson tag */}
        {current.lesson && (
          <div className="text-center mb-3">
            <span className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 px-3 py-1 rounded-full font-medium">
              {current.lesson}
            </span>
          </div>
        )}

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id + isFlipped}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="relative cursor-pointer select-none"
              onClick={() => setIsFlipped(f => !f)}
            >
              <div className={`min-h-64 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border-2 transition-colors ${
                isFlipped
                  ? 'bg-violet-600 border-violet-500 text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white'
              }`}>
                {!isFlipped ? (
                  <>
                    <div className="text-5xl font-bold mb-3">{frontContent}</div>
                    {frontFace === 'jp' && (
                      <div className="text-lg text-slate-400 dark:text-slate-500">{current.hiragana}</div>
                    )}
                    <div className="mt-6 text-sm text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <RotateCcw size={14} /> Chạm để lật
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-violet-200 text-sm mb-3 font-medium">Đáp án</div>
                    <div className="text-4xl font-bold mb-3 text-white">{backContent}</div>
                    {frontFace === 'vi' && (
                      <div className="text-violet-200 text-lg">{current.hiragana}</div>
                    )}
                    {current.examples && current.examples[0] && (
                      <div className="mt-4 p-3 bg-white/10 rounded-xl text-left w-full">
                        <div className="text-sm text-violet-100">{current.examples[0].jp}</div>
                        <div className="text-xs text-violet-200 mt-1">{current.examples[0].vi}</div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action buttons — chỉ hiện sau khi lật */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex gap-4 mt-6"
            >
              <button
                onClick={() => handleResult(false)}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 font-bold rounded-2xl hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all active:scale-95"
              >
                <ThumbsDown size={20} /> Chưa thuộc
              </button>
              <button
                onClick={() => handleResult(true)}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 font-bold rounded-2xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-all active:scale-95"
              >
                <ThumbsUp size={20} /> Đã thuộc
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats mini */}
        <div className="flex justify-center gap-6 mt-6 text-sm">
          <span className="flex items-center gap-1 text-green-500">
            <CheckCircle2 size={14} /> {known.length} thuộc
          </span>
          <span className="flex items-center gap-1 text-amber-500">
            <RotateCcw size={14} /> {learning.length} cần ôn
          </span>
        </div>
      </div>
    </div>
  );
}
