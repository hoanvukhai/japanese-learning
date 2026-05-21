// src/pages/Grammar/GrammarWordOrder.tsx
import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { grammarN3, getN3GrammarLessons } from '../../data/grammarN3';
import { useSettings } from '../../context/global/useSettings';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

/** Tách câu tiếng Nhật thành các token (bảo toàn nguyên văn) */
function tokenizeJapanese(sentence: string): string[] {
  // Tách theo khoảng trắng nếu có, nếu không thì tách theo từng char 2-4 ký tự
  if (sentence.includes(' ')) {
    return sentence.split(/\s+/).filter(Boolean);
  }
  // Tách thủ công: mỗi 2-3 ký tự cho cụm ngắn, hoặc tách theo dấu句読点
  const tokens: string[] = [];
  let remaining = sentence;
  while (remaining.length > 0) {
    // Ưu tiên tách ở các điểm có nghĩa
    const match = remaining.match(/^(.{2,5}?[はがをにでもとのへから]|.{1,4})/);
    if (match) {
      tokens.push(match[0]);
      remaining = remaining.slice(match[0].length);
    } else {
      tokens.push(remaining[0]);
      remaining = remaining.slice(1);
    }
  }
  return tokens.filter(t => t.trim().length > 0);
}

interface WordOrderCard {
  id: string;
  structure: string;
  meaning: string;
  sentence: string;        // Câu tiếng Nhật đầy đủ
  translation: string;     // Nghĩa tiếng Việt
  tokens: string[];        // Đã xáo trộn
  correctTokens: string[]; // Thứ tự đúng
  lesson: string;
}

export default function GrammarWordOrder() {
  const { language } = useSettings();
  const lessons = getN3GrammarLessons();
  const [selectedLesson, setSelectedLesson] = useState<string>('all');
  const [started, setStarted] = useState(false);

  // Tạo pool chỉ từ các item có ví dụ
  const pool = useMemo<WordOrderCard[]>(() => {
    const base = selectedLesson === 'all'
      ? grammarN3
      : grammarN3.filter(g => g.lesson === selectedLesson);

    const cards: WordOrderCard[] = [];
    base.forEach(g => {
      g.examples.forEach((ex, i) => {
        const correctTokens = tokenizeJapanese(ex.jp);
        if (correctTokens.length >= 3) {
          cards.push({
            id: `${g.id}_ex${i}`,
            structure: g.structure,
            meaning: g.meaning[language as 'vi' | 'en'] || g.meaning.vi,
            sentence: ex.jp,
            translation: ex.vi,
            tokens: shuffle(correctTokens),
            correctTokens,
            lesson: g.lesson,
          });
        }
      });
    });
    return shuffle(cards);
  }, [selectedLesson]);

  const [queue, setQueue] = useState<WordOrderCard[]>([]);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<{ token: string; idx: number }[]>([]);
  const [remaining, setRemaining] = useState<{ token: string; idx: number }[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  const current = queue[0];

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const handleStart = () => {
    setQueue(pool);
    setScore(0);
    setStatus('idle');
    setStarted(true);
    if (pool[0]) {
      initCard(pool[0]);
    }
  };

  const initCard = useCallback((card: WordOrderCard) => {
    setRemaining(card.tokens.map((t, i) => ({ token: t, idx: i })));
    setSelected([]);
    setStatus('idle');
  }, []);

  const handleNext = () => {
    const nextQueue = queue.slice(1);
    setQueue(nextQueue);
    if (nextQueue[0]) {
      initCard(nextQueue[0]);
    }
  };

  const handlePickToken = (item: { token: string; idx: number }) => {
    if (status !== 'idle') return;
    setRemaining(r => r.filter(t => t.idx !== item.idx));
    const newSelected = [...selected, item];
    setSelected(newSelected);

    // Check khi đã chọn đủ
    if (newSelected.length === current.correctTokens.length) {
      const attempt = newSelected.map(s => s.token).join('');
      const correct = current.correctTokens.join('');
      if (attempt === correct) {
        setStatus('correct');
        setScore(s => s + 1);
        playAudio(current.sentence);
      } else {
        setStatus('wrong');
      }
    }
  };

  const handleRemoveToken = (item: { token: string; idx: number }) => {
    if (status !== 'idle') return;
    setSelected(s => s.filter(t => t.idx !== item.idx));
    setRemaining(r => [...r, item].sort((a, b) => a.idx - b.idx));
  };

  const handleRetry = () => {
    if (current) initCard(current);
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
        <div className="max-w-lg mx-auto">
          <Link to="/grammar" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">🔀 Xếp câu</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Bấm các mảnh ghép theo đúng thứ tự để tái tạo lại câu ví dụ.</p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">📚 Bài học</label>
              <select
                value={selectedLesson}
                onChange={e => setSelectedLesson(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:border-indigo-500 transition-colors cursor-pointer"
              >
                <option value="all">Tất cả ({pool.length} câu)</option>
                {lessons.map(l => {
                  const cnt = pool.filter(p => p.lesson === l).length;
                  return <option key={l} value={l}>{l} ({cnt} câu)</option>;
                })}
              </select>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl p-4">
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                💡 Mỗi câu được lấy từ phần ví dụ của các mẫu ngữ pháp. Câu được tách thành các mảnh, bạn cần ghép lại đúng thứ tự.
              </p>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-500/20"
            >
              Bắt đầu ({pool.length} câu)
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
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Hoàn thành!</h2>
          <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-1">{score}<span className="text-2xl text-slate-400">/{pool.length}</span></div>
          <p className="text-slate-500 dark:text-slate-400 mb-6">câu đúng</p>
          <div className="space-y-3">
            <button onClick={handleStart} className="w-full py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:border-indigo-400 transition-all flex items-center justify-center gap-2">
              <RotateCcw size={16} /> Làm lại
            </button>
            <Link to="/grammar" className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all text-center">
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
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={18} /> Thoát
          </button>
          <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{score} đúng</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{pool.length - queue.length + 1} / {pool.length}</div>
        </div>

        {/* Progress */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            {/* Context */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 px-2.5 py-1 rounded-full font-medium">{current.lesson}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Mẫu: {current.structure}</span>
              </div>
              <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">{current.meaning}</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 italic">💬 {current.translation}</div>
            </div>

            {/* Answer area */}
            <div className={`min-h-[5rem] p-4 rounded-2xl border-2 transition-all ${
              status === 'correct' ? 'border-green-400 bg-green-50 dark:bg-green-900/20'
              : status === 'wrong' ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
              : 'border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
            }`}>
              <div className="flex flex-wrap gap-2 min-h-[2.5rem] items-center">
                {selected.length === 0 && status === 'idle' && (
                  <span className="text-sm text-slate-400 dark:text-slate-500">← Bấm các mảnh bên dưới để ghép câu</span>
                )}
                {selected.map((item) => (
                  <motion.button
                    key={item.idx}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => handleRemoveToken(item)}
                    disabled={status !== 'idle'}
                    className={`px-3 py-2 rounded-xl text-sm font-bold transition-all ${
                      status === 'correct'
                        ? 'bg-green-500 text-white cursor-default'
                        : status === 'wrong'
                        ? 'bg-red-500 text-white cursor-default'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                    }`}
                  >
                    {item.token}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Result feedback */}
            <AnimatePresence>
              {status !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl p-4 ${
                    status === 'correct'
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {status === 'correct'
                      ? <><CheckCircle2 size={16} className="text-green-500" /><span className="text-sm font-bold text-green-700 dark:text-green-400">Chính xác!</span></>
                      : <><XCircle size={16} className="text-red-500" /><span className="text-sm font-bold text-red-700 dark:text-red-400">Chưa đúng</span></>
                    }
                  </div>
                  {status === 'correct' ? (
                    <div className="flex items-center justify-between">
                      <button onClick={() => playAudio(current.sentence)} className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 hover:text-green-800 transition-colors">
                        <Volume2 size={12} /> Nghe phát âm
                      </button>
                      <button onClick={handleNext} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all">
                        Tiếp theo →
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-red-700 dark:text-red-400 mb-3">
                        Đáp án đúng: <strong className="font-bold">{current.sentence}</strong>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleRetry} className="flex-1 py-2 border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 text-sm font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all flex items-center justify-center gap-1">
                          <RotateCcw size={14} /> Thử lại
                        </button>
                        <button onClick={handleNext} className="flex-1 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all">
                          Bỏ qua →
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Token bank */}
            {status === 'idle' && (
              <div className="flex flex-wrap gap-2">
                {remaining.map((item) => (
                  <motion.button
                    key={item.idx}
                    layout
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={() => handlePickToken(item)}
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all active:scale-95 shadow-sm"
                  >
                    {item.token}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
