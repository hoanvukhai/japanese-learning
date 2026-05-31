import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { kanjiN3 } from '../../data/kanjiN3';
import KanjiLessonChips from '../../components/kanji/KanjiLessonChips';

interface QuizItem {
  id: string;
  questionText: string;
  target: string;
  targetHiragana?: string;
  correctAnswer: string;
  answerHiragana?: string;
  hint?: string;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function KanjiQuiz() {
  const lessons = Array.from(new Set(kanjiN3.map(k => k.lesson))).filter(Boolean);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [mode, setMode] = useState<'kanji-hanviet' | 'word-meaning'>('kanji-hanviet');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [showFurigana, setShowFurigana] = useState(false);
  const [started, setStarted] = useState(false);

  const pool = useMemo(() => {
    const baseKanji = selectedLessons.length === 0
      ? kanjiN3
      : kanjiN3.filter(k => selectedLessons.includes(k.lesson || ''));

    const list: QuizItem[] = [];

    if (mode === 'kanji-hanviet') {
      baseKanji.forEach(k => {
        if (direction === 'forward') {
          list.push({
            id: k.id,
            questionText: 'Âm Hán Việt của chữ Hán này là gì?',
            target: k.character,
            correctAnswer: k.hanViet,
            hint: `Bài học: ${k.lesson}`,
          });
        } else {
          list.push({
            id: k.id,
            questionText: 'Chữ Hán tương ứng với âm Hán Việt này là gì?',
            target: k.hanViet,
            correctAnswer: k.character,
            hint: `Bài học: ${k.lesson}`,
          });
        }
      });
    } else { // 'word-meaning'
      baseKanji.forEach(k => {
        k.words.forEach((w, idx) => {
          const meaningStr = typeof w.meaning === 'object' ? w.meaning.vi : w.meaning;
          const hanVietWordStr = w.hanVietWord || k.hanViet;
          if (direction === 'forward') {
            list.push({
              id: `${k.id}_w_${idx}`,
              questionText: 'Ý nghĩa tiếng Việt của từ này là gì?',
              target: w.word,
              targetHiragana: w.hiragana,
              correctAnswer: meaningStr,
              hint: hanVietWordStr ? `Hán Việt: ${hanVietWordStr}` : undefined,
            });
          } else {
            list.push({
              id: `${k.id}_w_${idx}`,
              questionText: 'Từ ghép tương ứng với ý nghĩa tiếng Việt này là gì?',
              target: meaningStr,
              correctAnswer: w.word,
              answerHiragana: w.hiragana,
              hint: hanVietWordStr ? `Hán Việt: ${hanVietWordStr}` : undefined,
            });
          }
        });
      });
    }

    return shuffle(list);
  }, [selectedLessons, mode, direction]);

  const [queue, setQueue] = useState<QuizItem[]>([]);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const current = queue[0];

  // Tạo các lựa chọn nhiễu
  const options = useMemo(() => {
    if (!current) return [];

    const uniqueAnswersMap = new Map<string, string | undefined>();
    pool.forEach(item => {
      if (!uniqueAnswersMap.has(item.correctAnswer)) {
        uniqueAnswersMap.set(item.correctAnswer, item.answerHiragana);
      }
    });

    const uniqueKeys = Array.from(uniqueAnswersMap.keys());
    const otherKeys = uniqueKeys.filter(ans => ans !== current.correctAnswer);
    const shuffledOthers = shuffle(otherKeys).slice(0, 3);

    const allOptions = [
      { text: current.correctAnswer, hiragana: current.answerHiragana },
      ...shuffledOthers.map(k => ({ text: k, hiragana: uniqueAnswersMap.get(k) }))
    ];

    while (allOptions.length < 4) {
      allOptions.push({ text: `sai_${Math.random()}`, hiragana: undefined });
    }

    return shuffle(allOptions);
  }, [current, pool]);

  const handleStart = () => {
    setQueue(pool);
    setScore(0);
    setSelectedAnswer(null);
    setStarted(true);
  };

  const handleAnswer = (ans: string) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(ans);
    const correct = ans === current.correctAnswer;

    if (correct) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      setQueue(q => q.slice(1));
      setSelectedAnswer(null);
    }, 1500);
  };

  const getOptionSize = (text: string) => {
    if (text.length <= 8) return 'text-lg font-bold';
    if (text.length <= 16) return 'text-base font-semibold';
    return 'text-xs md:text-sm font-medium';
  };

  const getTargetSize = (text: string) => {
    if (text.length <= 2) return 'text-6xl font-black';
    if (text.length <= 6) return 'text-4xl font-extrabold';
    return 'text-2xl font-bold px-4';
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
        <div className="max-w-3xl mx-auto">
          <Link to="/practice/kanji" className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">🎯 Trắc nghiệm Kanji</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Kiểm tra khả năng đọc hiểu chữ Hán hoặc từ vựng ghép.</p>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 space-y-8">
            <KanjiLessonChips
              options={lessons}
              selected={selectedLessons}
              onToggle={(val) => {
                setSelectedLessons(prev =>
                  prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
                );
              }}
              onSelectAll={() => setSelectedLessons([])}
              totalCount={kanjiN3.length}
              getCount={(l) => {
                if (mode === 'kanji-hanviet') {
                  return kanjiN3.filter(k => k.lesson === l).length;
                }
                return kanjiN3.filter(k => k.lesson === l).reduce((acc, k) => acc + k.words.length, 0);
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">⚙️ Chế độ trắc nghiệm</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('kanji-hanviet')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex justify-between items-center ${
                      mode === 'kanji-hanviet'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span>Chữ Kanji → Hán Việt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('word-meaning')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex justify-between items-center ${
                      mode === 'word-meaning'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span>Từ ghép → Nghĩa tiếng Việt</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">👁️ Hiển thị Kana (Khi chữ Hán)</label>
                <button
                  onClick={() => setShowFurigana(!showFurigana)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    showFurigana
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3 font-bold">
                    {showFurigana ? <Eye size={20} /> : <EyeOff size={20} />}
                    {showFurigana ? 'Đang bật' : 'Đang ẩn'}
                  </div>
                  <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative transition-colors" style={{ backgroundColor: showFurigana ? '#10b981' : '' }}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showFurigana ? 'left-5' : 'left-1'}`} />
                  </div>
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">🔄 Hướng câu hỏi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDirection('forward')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                      direction === 'forward'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    Thuận
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('backward')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                      direction === 'backward'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    Đảo ngược
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              Bắt đầu kiểm tra (hiện có {pool.length} câu)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl max-w-sm w-full text-center"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Hoàn thành!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Điểm của bạn: {score} / {pool.length}</p>

          <div className="space-y-3">
            <button
              onClick={handleStart}
              className="w-full py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:border-emerald-400 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Làm lại
            </button>
            <Link to="/practice/kanji" className="block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all text-center">
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
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium">
            <ArrowLeft size={18} /> Thoát
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                showFurigana 
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {showFurigana ? <Eye size={16} /> : <EyeOff size={16} />}
              Kana
            </button>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {score} điểm
            </div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {pool.length - queue.length + 1} / {pool.length}
            </div>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.target}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-100 dark:border-slate-700 mb-8"
          >
            <div className="text-center mb-8">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">{current.questionText}</div>
              <div className={`text-slate-800 dark:text-white mb-4 ${getTargetSize(current.target)}`}>
                {current.target}
              </div>
              {showFurigana && current.targetHiragana && (
                <div className="text-xl text-slate-400 dark:text-slate-500 mb-4 font-medium">{current.targetHiragana}</div>
              )}
              {current.hint && <div className="text-slate-500 dark:text-slate-400 text-sm font-medium">{current.hint}</div>}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {options.map((opt, i) => {
                let btnClass = "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30";

                if (selectedAnswer !== null) {
                  if (opt.text === current.correctAnswer) {
                    btnClass = "bg-emerald-500 border-emerald-500 text-white";
                  } else if (opt.text === selectedAnswer) {
                    btnClass = "bg-red-500 border-red-500 text-white";
                  } else {
                    btnClass = "bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-400 opacity-50";
                  }
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt.text)}
                    disabled={selectedAnswer !== null}
                    className={`p-4 rounded-2xl border-2 transition-all min-h-[4rem] flex flex-col items-center justify-center ${btnClass} ${getOptionSize(opt.text)}`}
                  >
                    <span>{opt.text}</span>
                    {showFurigana && opt.hiragana && (
                      <span className="text-sm opacity-70 font-medium mt-1">{opt.hiragana}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
