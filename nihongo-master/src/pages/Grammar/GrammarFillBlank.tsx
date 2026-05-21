// src/pages/Grammar/GrammarFillBlank.tsx
// Dạng bài JLPT Part 5: Điền vào chỗ trống — chọn cấu trúc ngữ pháp đúng hoàn thành câu
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { grammarN3, getN3GrammarLessons } from '../../data/grammarN3';
import { useSettings } from '../../context/global/useSettings';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/** Tạo câu có chỗ trống: thay cấu trúc ngữ pháp trong câu ví dụ bằng ___  */
function makeBlankSentence(jp: string, structure: string): { blanked: string; found: boolean } {
  // Lấy phần gốc của cấu trúc (bỏ 〜, /, khoảng trắng thừa)
  const variants = structure
    .replace(/〜/g, '')
    .split(/[/／]/)
    .map(v => v.trim())
    .filter(v => v.length > 0)
    .sort((a, b) => b.length - a.length); // ưu tiên match dài trước

  for (const v of variants) {
    if (jp.includes(v)) {
      return { blanked: jp.replace(v, '＿＿＿'), found: true };
    }
  }
  // Fallback: che phần cuối câu
  return { blanked: jp.slice(0, Math.ceil(jp.length * 0.6)) + '＿＿＿', found: false };
}

interface FillItem {
  id: string;
  blankedSentence: string;
  fullSentence: string;
  translation: string;
  correctAnswer: string;   // structure của grammar item đúng
  correctStructure: string;
  caution: string;
  group: string;
  lesson: string;
}

export default function GrammarFillBlank() {
  const { language } = useSettings();
  const lessons = getN3GrammarLessons();
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [started, setStarted] = useState(false);

  const pool = useMemo<FillItem[]>(() => {
    const base = selectedLesson === 'all'
      ? grammarN3
      : grammarN3.filter(g => g.lesson === selectedLesson);

    const items: FillItem[] = [];
    base.forEach(g => {
      g.examples.forEach((ex, i) => {
        const { blanked } = makeBlankSentence(ex.jp, g.structure);
        // chỉ dùng câu có thể tạo chỗ trống hợp lệ
        if (blanked.includes('＿＿＿')) {
          items.push({
            id: `${g.id}_ex${i}`,
            blankedSentence: blanked,
            fullSentence: ex.jp,
            translation: ex.vi,
            correctAnswer: g.structure,
            correctStructure: g.structure,
            caution: g.caution[language as 'vi' | 'en'] || g.caution.vi,
            group: g.group,
            lesson: g.lesson,
          });
        }
      });
    });
    return shuffle(items);
  }, [selectedLesson]);

  const [queue, setQueue] = useState<FillItem[]>([]);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showCaution, setShowCaution] = useState(false);

  const current = queue[0];

  // 4 đáp án: 1 đúng + 3 nhiễu từ cùng group
  const options = useMemo(() => {
    if (!current) return [];
    const sameGroup = grammarN3
      .filter(g => g.group === current.group && g.structure !== current.correctAnswer)
      .map(g => g.structure);
    const others = grammarN3
      .filter(g => g.structure !== current.correctAnswer)
      .map(g => g.structure);
    const distractors = shuffle([...new Set([...sameGroup, ...others])])
      .filter(s => s !== current.correctAnswer)
      .slice(0, 3);
    return shuffle([current.correctAnswer, ...distractors]);
  }, [current]);

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
    if (ans === current.correctAnswer) {
      setScore(s => s + 1);
      setTimeout(() => {
        setQueue(q => q.slice(1));
        setSelectedAnswer(null);
        setShowCaution(false);
      }, 1300);
    } else {
      setShowCaution(true);
    }
  };

  const handleNext = () => {
    setQueue(q => q.slice(1));
    setSelectedAnswer(null);
    setShowCaution(false);
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
        <div className="max-w-lg mx-auto">
          <Link to="/grammar" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">📝 Điền vào chỗ trống</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Đúng dạng bài <strong className="text-teal-600 dark:text-teal-400">JLPT Part 5</strong>: đọc câu, chọn cấu trúc ngữ pháp phù hợp.
          </p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">📚 Phạm vi ôn tập</label>
              <select
                value={selectedLesson}
                onChange={e => setSelectedLesson(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-colors cursor-pointer"
              >
                <option value="all">Tất cả bài ({pool.length} câu)</option>
                {lessons.map(l => {
                  const cnt = pool.filter(p => p.lesson === l).length;
                  return <option key={l} value={l}>{l} ({cnt} câu)</option>;
                })}
              </select>
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/50 rounded-xl p-4">
              <p className="text-sm text-teal-700 dark:text-teal-300">
                💡 Câu ví dụ sẽ bị che phần cấu trúc ngữ pháp. Hãy chọn mẫu đúng trong 4 đáp án — đúng dạng đề thi JLPT thực tế!
              </p>
            </div>

            <button
              onClick={handleStart}
              disabled={pool.length === 0}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bắt đầu ({pool.length} câu)
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
          <div className="text-5xl font-black text-teal-600 dark:text-teal-400 mb-1">
            {score}<span className="text-2xl text-slate-400">/{pool.length}</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mb-6">{pct}% chính xác</p>
          <div className="space-y-3">
            <button
              onClick={handleStart}
              className="w-full py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:border-teal-400 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Làm lại
            </button>
            <Link to="/grammar" className="block w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all text-center">
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
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors">
            <ArrowLeft size={18} /> Thoát
          </button>
          <div className="text-sm font-bold text-teal-600 dark:text-teal-400">{score} điểm</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{pool.length - queue.length + 1}/{pool.length}</div>
        </div>

        {/* Progress */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
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
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-7 shadow-xl border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xs bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 px-3 py-1 rounded-full font-medium">
                  {current.lesson}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">Chọn cấu trúc phù hợp</span>
              </div>

              {/* Câu có chỗ trống */}
              <div className="text-center mb-6">
                <p className="text-xl font-bold text-slate-800 dark:text-white leading-relaxed mb-3">
                  {current.blankedSentence}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                  💬 {current.translation}
                </p>
              </div>

              {/* Đáp án */}
              <div className="grid grid-cols-1 gap-3">
                {options.map((opt, i) => {
                  let cls = 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20';
                  if (selectedAnswer !== null) {
                    if (opt === current.correctAnswer) cls = 'bg-green-500 border-green-500 text-white';
                    else if (opt === selectedAnswer) cls = 'bg-red-500 border-red-500 text-white';
                    else cls = 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-400 opacity-40';
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      disabled={selectedAnswer !== null}
                      className={`p-4 rounded-2xl border-2 transition-all text-base font-semibold flex items-center justify-center gap-2 ${cls}`}
                    >
                      {selectedAnswer !== null && opt === current.correctAnswer && <CheckCircle2 size={16} />}
                      {selectedAnswer !== null && opt === selectedAnswer && opt !== current.correctAnswer && <XCircle size={16} />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caution after wrong answer */}
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
                    <div>
                      <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">
                        Câu đúng: <span className="font-mono">{current.fullSentence}</span>
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                        {current.caution}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all"
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
