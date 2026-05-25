// src/pages/Grammar/GrammarQuiz.tsx
import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, AlertTriangle, CheckCircle2, XCircle, Swords } from 'lucide-react';
import { grammarN3, getN3GrammarLessons } from '../../data/grammarN3';
import { useSettings } from '../../context/global/useSettings';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface QuizItem {
  id: string;
  questionText: string;
  target: string;           // Cái hiển thị để hỏi
  correctAnswer: string;    // Đáp án đúng
  caution: string;          // Hiện sau khi sai
  group: string;            // Dùng để lấy distractors
  lesson: string;
}

export default function GrammarQuiz() {
  const { language } = useSettings();
  const lessons = getN3GrammarLessons();
  const [searchParams] = useSearchParams();
  const isArenaMode = searchParams.get('mode') === 'arena'; // UI-08 fix
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [direction, setDirection] = useState<'structure-meaning' | 'meaning-structure'>('structure-meaning');
  const [started, setStarted] = useState(false);

  const pool = useMemo<QuizItem[]>(() => {
    const base = selectedLesson === 'all'
      ? grammarN3
      : grammarN3.filter(g => g.lesson === selectedLesson);

    return shuffle(base.map(g => {
      const meaningText = g.meaning[language as 'vi' | 'en'] || g.meaning.vi;
      const cautionText = g.caution[language as 'vi' | 'en'] || g.caution.vi;
      if (direction === 'structure-meaning') {
        return {
          id: g.id,
          questionText: language === 'en' ? 'What does this structure mean?' : 'Cấu trúc này có nghĩa là gì?',
          target: g.structure,
          correctAnswer: meaningText,
          caution: cautionText,
          group: g.group,
          lesson: g.lesson,
        };
      } else {
        return {
          id: g.id,
          questionText: language === 'en' ? 'Which structure corresponds to this meaning?' : 'Nghĩa tiếng Việt này tương ứng với cấu trúc ngữ pháp nào?',
          target: meaningText,
          correctAnswer: g.structure,
          caution: cautionText,
          group: g.group,
          lesson: g.lesson,
        };
      }
    }));
  }, [selectedLesson, direction, language]);

  const [queue, setQueue] = useState<QuizItem[]>([]);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showCaution, setShowCaution] = useState(false);

  const current = queue[0];

  // ⚔️ KILLER FEATURE: Lấy distractors từ cùng group — Bẫy đối kháng!
  const options = useMemo(() => {
    if (!current) return [];

    // Ưu tiên lấy nhiễu từ cùng nhóm (group)
    const sameGroup = grammarN3
      .filter(g => g.group === current.group && g.id !== current.id)
      .map(g => {
        const meaningText = g.meaning[language as 'vi' | 'en'] || g.meaning.vi;
        return direction === 'structure-meaning' ? meaningText : g.structure;
      });

    // Nếu không đủ 3, lấy thêm từ toàn bộ pool
    const allAnswers = pool
      .filter(item => item.id !== current.id)
      .map(item => item.correctAnswer);

    // BUG-05 fix: Fallback từ toàn bộ grammarN3 thay vì dùng '---'
    const globalFallback = grammarN3
      .filter(g => g.id !== current.id)
      .map(g => direction === 'structure-meaning'
        ? (g.meaning[language as 'vi' | 'en'] || g.meaning.vi)
        : g.structure
      );

    const deduplicated = Array.from(new Set([...sameGroup, ...allAnswers, ...globalFallback]))
      .filter(ans => ans !== current.correctAnswer);

    const distractors = shuffle(deduplicated).slice(0, 3);
    return shuffle([current.correctAnswer, ...distractors]).slice(0, 4);
  }, [current, pool, direction, language]);

  const handleStart = () => {
    setQueue(pool);
    setScore(0);
    setSelectedAnswer(null);
    setShowCaution(false);
    setStarted(true);
  };

  const handleAnswer = (ans: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(ans);
    const correct = ans === current.correctAnswer;
    if (correct) {
      setScore(s => s + 1);
      setTimeout(() => {
        setQueue(q => q.slice(1));
        setSelectedAnswer(null);
        setShowCaution(false);
      }, 1200);
    } else {
      setShowCaution(true);
    }
  };

  const handleNext = () => {
    setQueue(q => q.slice(1));
    setSelectedAnswer(null);
    setShowCaution(false);
  };

  const getTargetStyle = (text: string) => {
    if (text.length <= 15) return 'text-2xl font-bold';
    if (text.length <= 30) return 'text-lg font-bold';
    return 'text-base font-semibold';
  };

  const getOptionStyle = (text: string) => {
    if (text.length <= 20) return 'text-base font-semibold';
    if (text.length <= 40) return 'text-sm font-semibold';
    return 'text-xs font-medium';
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
        <div className="max-w-lg mx-auto">
          <Link to="/practice/grammar" className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          {/* UI-08 fix: Tiêu đề khác nhau cho Arena vs Quiz */}
          {isArenaMode ? (
            <>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                <Swords size={28} className="text-red-500" /> Bẫy đối kháng
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Chế độ <strong className="text-red-600 dark:text-red-400">KILLER</strong>: đáp án nhiễu 100% từ cùng nhóm ngữ pháp — cực hóc búa!
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">⚔️ Trắc nghiệm Bẫy</h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Đáp án nhiễu được bốc từ <strong className="text-sky-600 dark:text-sky-400">cùng nhóm ngữ pháp</strong> — cực thực chiến!
              </p>
            </>
          )}

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">📚 Phạm vi ôn tập</label>
              <select
                value={selectedLesson}
                onChange={e => setSelectedLesson(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:border-sky-500 transition-colors cursor-pointer"
              >
                <option value="all">Tất cả bài ({grammarN3.length} mẫu)</option>
                {lessons.map(l => (
                  <option key={l} value={l}>{l} ({grammarN3.filter(g => g.lesson === l).length} mẫu)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">🔄 Hướng câu hỏi</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setDirection('structure-meaning')}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex justify-between items-center ${
                    direction === 'structure-meaning'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>Cấu trúc → Nghĩa tiếng Việt</span>
                  <span className="text-xs font-normal opacity-70">〜がる → Cảm thấy...</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('meaning-structure')}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex justify-between items-center ${
                    direction === 'meaning-structure'
                      ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>Nghĩa tiếng Việt → Cấu trúc</span>
                  <span className="text-xs font-normal opacity-70">Cảm thấy... → 〜がる</span>
                </button>
              </div>
            </div>

            {/* Trap badge */}
            <div className="flex items-start gap-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/50 rounded-xl p-4">
              <AlertTriangle size={16} className="flex-shrink-0 text-sky-500 mt-0.5" />
              <p className="text-sm text-sky-700 dark:text-sky-300">
                <strong>Bẫy đối kháng:</strong> Đáp án nhiễu được bốc từ các mẫu cùng nhóm (group) với câu hỏi, không phải random ngẫu nhiên.
              </p>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-sky-500/20"
            >
              Bắt đầu kiểm tra ({pool.length} câu)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (queue.length === 0) {
    const pct = Math.round((score / pool.length) * 100);
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl max-w-sm w-full text-center"
        >
          <div className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚'}</div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Kết quả</h2>
          <div className="text-5xl font-black text-sky-600 dark:text-sky-400 mb-1">{score}<span className="text-2xl text-slate-400">/{pool.length}</span></div>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{pct}% chính xác</p>

          <div className="space-y-3">
            <button
              onClick={handleStart}
              className="w-full py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:border-sky-400 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Làm lại
            </button>
            <Link to="/practice/grammar" className="block w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all text-center">
              Về dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const progress = ((pool.length - queue.length) / pool.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-lg mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors">
            <ArrowLeft size={18} /> Thoát
          </button>
          <div className="text-sm font-bold text-sky-600 dark:text-sky-400">{score} điểm</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{pool.length - queue.length + 1} / {pool.length}</div>
        </div>

        {/* Progress */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Question card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-xs bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 px-3 py-1 rounded-full font-medium">
                    {current.lesson}
                  </span>
                  <span className="text-xs bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 px-3 py-1 rounded-full font-medium">
                    Nhóm: {current.group}
                  </span>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mb-3 font-medium">{current.questionText}</div>
                <div className={`text-slate-800 dark:text-white ${getTargetStyle(current.target)}`}>
                  {current.target}
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {options.map((opt, i) => {
                  let btnClass = 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20';

                  if (selectedAnswer !== null) {
                    if (opt === current.correctAnswer) {
                      btnClass = 'bg-green-500 border-green-500 text-white';
                    } else if (opt === selectedAnswer && opt !== current.correctAnswer) {
                      btnClass = 'bg-red-500 border-red-500 text-white';
                    } else {
                      btnClass = 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-400 opacity-40';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      disabled={selectedAnswer !== null}
                      className={`p-4 rounded-2xl border-2 transition-all min-h-[3.5rem] flex items-center justify-center text-center ${btnClass} ${getOptionStyle(opt)}`}
                    >
                      <span className="flex items-center gap-2">
                        {selectedAnswer !== null && opt === current.correctAnswer && <CheckCircle2 size={16} />}
                        {selectedAnswer !== null && opt === selectedAnswer && opt !== current.correctAnswer && <XCircle size={16} />}
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caution panel (after wrong answer) */}
            <AnimatePresence>
              {showCaution && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle size={18} className="flex-shrink-0 text-amber-500 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                      {current.caution}
                    </p>
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all"
                  >
                    Câu tiếp theo →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
