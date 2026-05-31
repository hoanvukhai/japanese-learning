// src/pages/Grammar/GrammarQuiz.tsx
import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, AlertTriangle, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { grammarN3, getN3GrammarLessons } from '../../data/grammarN3';
import { useSettings } from '../../context/global/useSettings';
import GrammarLessonChips, { getGroupLabel } from '../../components/grammar/GrammarLessonChips';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface QuizItem {
  id: string;
  questionText: string;
  target: string;           // Cái hiển thị để hỏi
  targetKana?: string;       // Phiên âm Kana của target (nếu có)
  correctAnswer: string;    // Đáp án đúng
  correctAnswerKana?: string; // Phiên âm Kana của correctAnswer (nếu có)
  caution: string;          // Hiện sau khi sai
  group: string;            // Dùng để lấy distractors
  lesson: string;
}

export default function GrammarQuiz() {
  const { language } = useSettings();
  const lessons = getN3GrammarLessons();
  const groups = useMemo(() => [...new Set(grammarN3.map(g => g.group))], []);

  // Chip multi-select filter
  const [filterType, setFilterType] = useState<'lesson' | 'group'>('lesson');
  const [selectedItems, setSelectedItems] = useState<string[]>([]); // [] = all
  const [direction, setDirection] = useState<'structure-meaning' | 'meaning-structure'>('structure-meaning');
  const [started, setStarted] = useState(false);
  // Option: bật "bẫy nhầm lẫn" (ưu tiên confusedWith làm distractor)
  const [useTrap, setUseTrap] = useState(true);

  const chipOptions = filterType === 'lesson' ? lessons : groups;

  const pool = useMemo<QuizItem[]>(() => {
    let base = grammarN3;
    if (selectedItems.length > 0) {
      base = filterType === 'lesson'
        ? grammarN3.filter(g => selectedItems.includes(g.lesson))
        : grammarN3.filter(g => selectedItems.includes(g.group));
    }

    return shuffle(base.map(g => {
      const meaningText = g.meaning[language as 'vi' | 'en'] || g.meaning.vi;
      const cautionText = g.caution[language as 'vi' | 'en'] || g.caution.vi;
      if (direction === 'structure-meaning') {
        return {
          id: g.id,
          questionText: language === 'en' ? 'What does this structure mean?' : 'Cấu trúc này có nghĩa là gì?',
          target: g.structure,
          targetKana: g.structureKana,
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
          correctAnswerKana: g.structureKana,
          caution: cautionText,
          group: g.group,
          lesson: g.lesson,
        };
      }
    }));
  }, [selectedItems, filterType, direction, language]);

  const [queue, setQueue] = useState<QuizItem[]>([]);
  const [score, setScore] = useState(0);
  const [showFurigana, setShowFurigana] = useState(false);

  const getOptionKana = (opt: string) => {
    if (direction !== 'meaning-structure') return null;
    const found = grammarN3.find(g => g.structure === opt);
    return found && found.structureKana !== opt ? found.structureKana : null;
  };
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showCaution, setShowCaution] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // Hiển thị banner đúng thủ công

  const current = queue[0];

  // ⚔️ KILLER FEATURE: Distractors theo 3 tầng ưu tiên
  const options = useMemo(() => {
    if (!current) return [];

    const getAnswer = (g: (typeof grammarN3)[0]) =>
      direction === 'structure-meaning'
        ? (g.meaning[language as 'vi' | 'en'] || g.meaning.vi)
        : g.structure;

    // ── Ưu tiên 1: confusedWith — bẫy JLPT chính xác theo data ──
    const confusedAnswers: string[] = [];
    if (current.group) {
      // Tìm grammar item gốc để lấy confusedWith
      const sourceItem = grammarN3.find(g => g.id === current.id);
      if (sourceItem?.confusedWith) {
        sourceItem.confusedWith.forEach(confusedStructure => {
          // Tìm grammar item khớp với chuỗi confusedWith
          const found = grammarN3.find(g =>
            g.structure === confusedStructure ||
            g.structure.includes(confusedStructure) ||
            confusedStructure.includes(g.structure.replace('〜', ''))
          );
          if (found && found.id !== current.id) {
            confusedAnswers.push(getAnswer(found));
          } else if (direction === 'structure-meaning') {
            // confusedWith là string cấu trúc — dùng trực tiếp làm distractor structure
          } else {
            // direction = meaning-structure: dùng confusedStructure trực tiếp
            confusedAnswers.push(confusedStructure);
          }
        });
      }
    }

    // ── Ưu tiên 2: cùng nhóm group ──
    const sameGroup = grammarN3
      .filter(g => g.group === current.group && g.id !== current.id)
      .map(getAnswer);

    // ── Ưu tiên 3: toàn bộ pool + global fallback ──
    const allAnswers = pool
      .filter(item => item.id !== current.id)
      .map(item => item.correctAnswer);
    const globalFallback = grammarN3
      .filter(g => g.id !== current.id)
      .map(getAnswer);

    const deduplicated = Array.from(
      new Set([...confusedAnswers, ...sameGroup, ...allAnswers, ...globalFallback])
    ).filter(ans => ans !== current.correctAnswer);

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
      setShowSuccess(true);
    } else {
      setShowCaution(true);
    }
  };

  const handleNext = () => {
    setQueue(q => q.slice(1));
    setSelectedAnswer(null);
    setShowCaution(false);
    setShowSuccess(false);
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
        <div className="max-w-3xl mx-auto">
          <Link to="/practice/grammar" className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">⚔️ Trắc nghiệm Bẫy</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Đáp án nhiễu được bốc từ <strong className="text-sky-600 dark:text-sky-400">cùng nhóm ngữ pháp</strong> — cực thực chiến!
          </p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">

            {/* Hướng câu hỏi */}
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
                  <span className="text-xs font-normal opacity-70">〜garu → Cảm thấy...</span>
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
                  <span className="text-xs font-normal opacity-70">Cảm thấy... → 〜garu</span>
                </button>
              </div>
            </div>

            {/* BắY NHẠM LỬẠN toggle */}
            <div
              className={`flex items-start gap-3 rounded-xl p-4 border cursor-pointer transition-all ${
                useTrap
                  ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/50'
                  : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
              }`}
              onClick={() => setUseTrap(v => !v)}
            >
              <div className={`w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                useTrap ? 'bg-sky-500 border-sky-500' : 'border-slate-300 dark:border-slate-600'
              }`}>
                {useTrap && <span className="text-white text-[10px] font-bold">✓</span>}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">🎯 Thêm bẫy nhầm lỬn</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ưu tiên dùng các mẫu được nhác đến trong confusedWith làm đáp án nhiễu — thực chiến JLPT!
                </p>
              </div>
            </div>

            {/* Chip selector */}
            <GrammarLessonChips
              filterType={filterType}
              onFilterTypeChange={t => { setFilterType(t); setSelectedItems([]); }}
              options={chipOptions}
              selected={selectedItems}
              onToggle={val => setSelectedItems(prev =>
                prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
              )}
              onSelectAll={() => setSelectedItems([])}
              getLabel={filterType === 'group' ? getGroupLabel : undefined}
              getCount={val =>
                filterType === 'lesson'
                  ? grammarN3.filter(g => g.lesson === val).length
                  : grammarN3.filter(g => g.group === val).length
              }
              totalCount={grammarN3.length}
              accentClass="border-sky-500 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300"
            />

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
      <div className="max-w-3xl mx-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-sky-600 transition-colors font-medium">
            <ArrowLeft size={18} /> Thoát
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFurigana(v => !v)}
              title={showFurigana ? 'Tắt Furigana' : 'Bật Furigana'}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border-2 text-xs font-bold transition-all ${
                showFurigana
                  ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
                  : 'border-slate-200 dark:border-slate-600 text-slate-400 hover:border-teal-300'
              }`}
            >
              {showFurigana ? <Eye size={12} /> : <EyeOff size={12} />}
              <span>Kana</span>
            </button>
            <div className="text-sm font-bold text-sky-600 dark:text-sky-400">{score} điểm</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{pool.length - queue.length + 1} / {pool.length}</div>
          </div>
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
                <div className="space-y-1">
                  <div className={`text-slate-800 dark:text-white ${getTargetStyle(current.target)}`}>
                    {current.target}
                  </div>
                  {showFurigana && current.targetKana && current.targetKana !== current.target && (
                    <div className="text-sm font-medium text-teal-600 dark:text-teal-400">
                      {current.targetKana}
                    </div>
                  )}
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
                      className={`p-4 rounded-2xl border-2 transition-all min-h-[3.5rem] flex flex-col items-center justify-center text-center ${btnClass} ${getOptionStyle(opt)}`}
                    >
                      <span className="flex items-center gap-2">
                        {selectedAnswer !== null && opt === current.correctAnswer && <CheckCircle2 size={16} />}
                        {selectedAnswer !== null && opt === selectedAnswer && opt !== current.correctAnswer && <XCircle size={16} />}
                        <span>{opt}</span>
                      </span>
                      {showFurigana && getOptionKana(opt) && (
                        <span className="text-xs text-teal-600 dark:text-teal-400 mt-1 font-medium">
                          {getOptionKana(opt)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Banner đúng + caution panel */}
            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={18} className="text-green-500" />
                    <span className="text-sm font-bold text-green-700 dark:text-green-400">Chính xác!</span>
                  </div>
                  <button
                    onClick={handleNext}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all"
                  >
                    Câu tiếp theo →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

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
