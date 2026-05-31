import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { kanjiN3 } from '../../data/kanjiN3';
import KanjiLessonChips from '../../components/kanji/KanjiLessonChips';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function KanjiTyping() {
  const lessons = Array.from(new Set(kanjiN3.map(k => k.lesson))).filter(Boolean);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [mode, setMode] = useState<'kanji-hanviet' | 'word-hiragana' | 'word-meaning'>('kanji-hanviet');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [showFurigana, setShowFurigana] = useState(false);
  const [started, setStarted] = useState(false);

  const pool = useMemo(() => {
    const baseKanji = selectedLessons.length === 0
      ? kanjiN3
      : kanjiN3.filter(k => selectedLessons.includes(k.lesson || ''));

    if (mode === 'kanji-hanviet') {
      const items = baseKanji.map(k => ({
        id: k.id,
        questionText: direction === 'forward' ? 'Nhập âm Hán Việt của chữ Hán này' : 'Nhập chữ Hán tương ứng với âm Hán Việt này',
        target: direction === 'forward' ? k.character : k.hanViet,
        answer: direction === 'forward' ? k.hanViet : k.character,
        hint: `Bài học: ${k.lesson}`,
      }));
      return shuffle(items);
    } else if (mode === 'word-hiragana') {
      const words: any[] = [];
      baseKanji.forEach(k => {
        k.words.forEach((w, idx) => {
          words.push({
            id: `${k.id}_w_${idx}`,
            questionText: direction === 'forward' ? 'Nhập cách đọc Hiragana của từ này' : 'Nhập từ ghép Kanji tương ứng với cách đọc này',
            target: direction === 'forward' ? w.word : w.hiragana,
            answer: direction === 'forward' ? w.hiragana : w.word,
            hint: `Nghĩa: ${typeof w.meaning === 'object' ? w.meaning.vi : w.meaning} (${w.hanVietWord || k.hanViet})`,
          });
        });
      });
      return shuffle(words);
    } else { // 'word-meaning'
      const words: any[] = [];
      baseKanji.forEach(k => {
        k.words.forEach((w, idx) => {
          const meaningStr = typeof w.meaning === 'object' ? w.meaning.vi : w.meaning;
          words.push({
            id: `${k.id}_w_${idx}`,
            questionText: direction === 'forward' ? 'Nhập từ ghép Kanji tương ứng với nghĩa này' : 'Nhập cách đọc Hiragana tương ứng với nghĩa này',
            target: meaningStr,
            answer: direction === 'forward' ? w.word : w.hiragana,
            hint: direction === 'forward' ? `Cách đọc: ${w.hiragana} (${w.hanVietWord || k.hanViet})` : `Chữ Hán: ${w.word} (${w.hanVietWord || k.hanViet})`,
          });
        });
      });
      return shuffle(words);
    }
  }, [selectedLessons, mode, direction]);

  const [queue, setQueue] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState('');
  const [showError, setShowError] = useState(false);
  const [isCorrectAnimation, setIsCorrectAnimation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = queue[0];

  useEffect(() => {
    if (started && inputRef.current) {
      inputRef.current.focus();
    }
  }, [started, queue]);

  const handleStart = () => {
    setQueue(pool);
    setScore(0);
    setInput('');
    setShowError(false);
    setIsCorrectAnimation(false);
    setStarted(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !input.trim()) return;

    const normalizedInput = input.trim().toLowerCase();
    const isCorrect = normalizedInput === current.answer.toLowerCase();

    if (isCorrect) {
      setIsCorrectAnimation(true);
      setScore(s => s + 1);
      setTimeout(() => {
        setQueue(q => q.slice(1));
        setInput('');
        setIsCorrectAnimation(false);
      }, 500);
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 500);
    }
  };

  const handleSkip = () => {
    setShowError(true); // Hiện đỏ một chút
    setInput(current.answer); // Show đáp án
    setTimeout(() => {
      setQueue(q => q.slice(1));
      setInput('');
      setShowError(false);
    }, 1500);
  };

  const getTargetSize = (text: string) => {
    if (text.length <= 2) return 'text-6xl font-black';
    if (text.length <= 6) return 'text-4xl font-extrabold';
    return 'text-2xl font-bold px-4';
  };

  const getPlaceholder = () => {
    if (mode === 'kanji-hanviet') {
      return direction === 'forward' ? "Nhập âm Hán Việt..." : "Nhập chữ Hán...";
    } else if (mode === 'word-hiragana') {
      return direction === 'forward' ? "Nhập hiragana..." : "Nhập chữ Hán...";
    } else {
      return direction === 'forward' ? "Nhập chữ Hán..." : "Nhập hiragana...";
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
        <div className="max-w-3xl mx-auto">
          <Link to="/practice/kanji" className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">⌨️ Nhập chữ Kanji</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Luyện gõ cách đọc / âm Hán Việt để nhớ sâu hơn.</p>

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
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">⚙️ Chế độ gõ</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('kanji-hanviet')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex justify-between items-center ${
                      mode === 'kanji-hanviet'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span>Chữ Kanji & Hán Việt</span>
                    <span className="text-xs font-normal opacity-70">共 ⇄ CỘNG</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('word-hiragana')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex justify-between items-center ${
                      mode === 'word-hiragana'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span>Từ ghép & Cách đọc (Hiragana)</span>
                    <span className="text-xs font-normal opacity-70">共通点 ⇄ きょうつうてん</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('word-meaning')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex justify-between items-center ${
                      mode === 'word-meaning'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span>Từ ghép & Nghĩa tiếng Việt</span>
                    <span className="text-xs font-normal opacity-70">Nghĩa ⇄ Kanji / Hira</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">🔄 Hướng câu hỏi</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDirection('forward')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                      direction === 'forward'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {mode === 'word-meaning' ? 'Gõ chữ Hán' : 'Thuận'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection('backward')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                      direction === 'backward'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {mode === 'word-meaning' ? 'Gõ Hiragana' : 'Đảo ngược'}
                  </button>
                </div>
                {mode === 'word-meaning' && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-4 font-medium leading-relaxed">
                    * Chế độ từ ghép & nghĩa luôn hiển thị Nghĩa tiếng Việt để gõ chữ Hán hoặc Hiragana tương ứng (do nghĩa dài không thể so khớp chính xác nếu gõ nghĩa).
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  👁️ Hiển thị Gợi ý (Kana/Nghĩa)
                </label>
                <button
                  onClick={() => setShowFurigana(!showFurigana)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    showFurigana
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3 font-bold">
                    {showFurigana ? <Eye size={20} /> : <EyeOff size={20} />}
                    {showFurigana ? 'Đang bật' : 'Đang ẩn'}
                  </div>
                  <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative transition-colors" style={{ backgroundColor: showFurigana ? '#f59e0b' : '' }}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showFurigana ? 'left-5' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              Bắt đầu gõ (hiện có {pool.length} câu)
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
          <div className="text-6xl mb-4">⌨️</div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Hoàn thành!</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Điểm của bạn: {score} / {pool.length}</p>

          <div className="space-y-3">
            <button
              onClick={handleStart}
              className="w-full py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:border-amber-400 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Gõ lại
            </button>
            <Link to="/practice/kanji" className="block w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all text-center">
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
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-amber-600 transition-colors font-medium">
            <ArrowLeft size={18} /> Cài đặt
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                showFurigana 
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {showFurigana ? <Eye size={16} /> : <EyeOff size={16} />}
              Gợi ý
            </button>
            <div className="text-sm font-bold text-amber-500">
              {score} điểm
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {pool.length - queue.length + 1} / {pool.length}
            </div>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-amber-400 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.target}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className={`bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border-2 transition-colors duration-300 ${
              isCorrectAnimation ? 'border-green-400 bg-green-50 dark:bg-green-900/20' :
              showError ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-slate-100 dark:border-slate-700'
            } mb-8`}
          >
            <div className="text-center mb-8">
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-2 font-medium">
                {current.questionText}
              </div>
              <div className={`text-slate-800 dark:text-white mb-4 ${getTargetSize(current.target)}`}>
                {current.target}
              </div>
              <div className="text-slate-500 dark:text-slate-400 min-h-[1.5rem] font-medium text-sm">
                {showFurigana && current.hint}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={getPlaceholder()}
                className={`flex-1 px-4 py-3 rounded-xl border-2 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white text-lg font-bold outline-none transition-colors ${
                  showError ? 'border-red-400 focus:border-red-500' : 'border-slate-200 dark:border-slate-600 focus:border-amber-400'
                }`}
                autoFocus
                disabled={isCorrectAnimation}
              />
              <button
                type="submit"
                disabled={isCorrectAnimation}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-400 text-white font-bold rounded-xl transition-colors active:scale-95"
              >
                Gửi
              </button>
            </form>

            <div className="mt-4 text-center">
              <button onClick={handleSkip} className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                Không biết? Xem đáp án
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
