// src/pages/Grammar/GrammarFlashcard.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, ThumbsUp, ThumbsDown, CheckCircle2, AlertTriangle, Volume2 } from 'lucide-react';
import { grammarN3, getN3GrammarLessons } from '../../data/grammarN3';
import { useSettings } from '../../context/global/useSettings';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function GrammarFlashcard() {
  const { language } = useSettings();
  const lessons = getN3GrammarLessons();
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [filterType, setFilterType] = useState<'lesson' | 'group'>('lesson');
  const [started, setStarted] = useState(false);

  const groups = useMemo(() => [...new Set(grammarN3.map(g => g.group))], []);

  const pool = useMemo(() => {
    if (filterType === 'lesson') {
      return shuffle(
        selectedLesson === 'all' ? grammarN3 : grammarN3.filter(g => g.lesson === selectedLesson)
      );
    } else {
      return shuffle(
        selectedLesson === 'all' ? grammarN3 : grammarN3.filter(g => g.group === selectedLesson)
      );
    }
  }, [selectedLesson, filterType]);

  const [queue, setQueue] = useState<typeof grammarN3>([]);
  const [known, setKnown] = useState<typeof grammarN3>([]);
  const [learning, setLearning] = useState<typeof grammarN3>([]);
  const [isFlipped, setIsFlipped] = useState(false);

  const current = queue[0];

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text.replace(/〜|[/（）()]/g, ' ').trim());
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

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

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
        <div className="max-w-lg mx-auto">
          <Link to="/practice/grammar" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">🃏 Lật thẻ Ngữ Pháp</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Ôn cấu trúc và nghĩa qua thẻ ghi nhớ hai mặt.</p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">

            {/* Filter type */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">🎛️ Lọc theo</label>
              <div className="grid grid-cols-2 gap-3">
                {(['lesson', 'group'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setFilterType(type); setSelectedLesson('all'); }}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                      filterType === type
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {type === 'lesson' ? '📚 Theo Bài' : '🎭 Theo Nhóm Bẫy'}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                {filterType === 'lesson' ? '📚 Chọn bài học' : '🎭 Chọn nhóm'}
              </label>
              <select
                value={selectedLesson}
                onChange={e => setSelectedLesson(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-colors cursor-pointer"
              >
                <option value="all">Tất cả ({grammarN3.length} thẻ)</option>
                {filterType === 'lesson'
                  ? lessons.map(l => (
                      <option key={l} value={l}>{l} ({grammarN3.filter(g => g.lesson === l).length} thẻ)</option>
                    ))
                  : groups.map(g => (
                      <option key={g} value={g}>{g} ({grammarN3.filter(item => item.group === g).length} thẻ)</option>
                    ))
                }
              </select>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-teal-500/20"
            >
              Bắt đầu ôn tập ({pool.length} thẻ)
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="text-slate-500 dark:text-slate-400 mb-6">Bạn đã ôn xong {total} thẻ.</p>

          <div className="flex gap-3 mb-6">
            <div className="flex-1 bg-green-50 dark:bg-green-900/30 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{known.length}</div>
              <div className="text-xs text-green-600 dark:text-green-400">Đã nhớ</div>
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
                Ôn lại {learning.length} thẻ chưa nhớ
              </button>
            )}
            <button
              onClick={handleRestart}
              className="w-full py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:border-teal-400 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Ôn lại tất cả
            </button>
            <Link to="/practice/grammar" className="block w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all text-center">
              Về dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const progress = ((known.length + learning.length) / (known.length + learning.length + queue.length)) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-lg mx-auto">

        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </button>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {known.length + learning.length} / {known.length + learning.length + queue.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Lesson + Group tag */}
        <div className="flex justify-center gap-2 mb-4">
          <span className="text-xs bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 px-3 py-1 rounded-full font-medium">
            {current.lesson}
          </span>
          <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-3 py-1 rounded-full font-medium">
            {current.group}
          </span>
        </div>

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
              <div className={`min-h-[22rem] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border-2 transition-colors duration-300 ${
                isFlipped
                  ? 'bg-gradient-to-br from-teal-600 to-cyan-600 border-teal-500 text-white'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white'
              }`}>
                {!isFlipped ? (
                  <>
                    <div className="text-2xl md:text-3xl font-bold text-center leading-snug">
                      {current.structure}
                    </div>
                    <div className="mt-6 text-sm text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <RotateCcw size={14} /> Chạm để lật
                    </div>
                  </>
                ) : (
                  <div className="w-full space-y-4">
                    {/* Meaning */}
                    <div>
                      <div className="text-teal-200 text-xs font-bold uppercase tracking-widest mb-1">Nghĩa</div>
                      <div className="text-2xl font-extrabold text-white">{current.meaning[language as 'vi' | 'en'] || current.meaning.vi}</div>
                    </div>

                    {/* Formation */}
                    <div className="border-t border-teal-500/40 pt-4 text-left">
                      <div className="text-teal-200 text-xs font-bold uppercase tracking-widest mb-2">Cách thành lập</div>
                      <div className="space-y-1">
                        {current.formation.map((f, i) => (
                          <div key={i} className="text-sm text-teal-100 bg-white/10 rounded-lg px-3 py-1.5 font-mono">
                            {f}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Caution */}
                    <div className="flex items-start gap-2 bg-white/10 rounded-xl p-3 text-left">
                      <AlertTriangle size={14} className="flex-shrink-0 text-amber-300 mt-0.5" />
                      <p className="text-xs text-teal-100 leading-relaxed">{current.caution[language as 'vi' | 'en'] || current.caution.vi}</p>
                    </div>

                    {/* First example */}
                    {current.examples[0] && (
                      <div className="border-t border-teal-500/40 pt-4 text-left">
                        <button
                          onClick={(e) => { e.stopPropagation(); playAudio(current.examples[0].jp); }}
                          className="flex items-center gap-1 text-xs text-teal-200 mb-2 hover:text-white transition-colors"
                        >
                          <Volume2 size={12} /> Ví dụ
                        </button>
                        <div className="text-sm text-white font-medium">{current.examples[0].jp}</div>
                        <div className="text-xs text-teal-200 mt-1">{current.examples[0].vi}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action buttons */}
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
                <ThumbsDown size={20} /> Chưa nhớ
              </button>
              <button
                onClick={() => handleResult(true)}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 font-bold rounded-2xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-all active:scale-95"
              >
                <ThumbsUp size={20} /> Đã nhớ
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Score */}
        <div className="flex justify-center gap-6 mt-6 text-sm">
          <span className="flex items-center gap-1 text-green-500">
            <CheckCircle2 size={14} /> {known.length} nhớ
          </span>
          <span className="flex items-center gap-1 text-amber-500">
            <RotateCcw size={14} /> {learning.length} cần ôn
          </span>
        </div>

      </div>
    </div>
  );
}
