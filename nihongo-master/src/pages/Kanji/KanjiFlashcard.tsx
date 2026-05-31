import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, ThumbsUp, ThumbsDown, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { kanjiN3 } from '../../data/kanjiN3';
import KanjiLessonChips from '../../components/kanji/KanjiLessonChips';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function KanjiFlashcard() {
  const lessons = Array.from(new Set(kanjiN3.map(k => k.lesson))).filter(Boolean);
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [mode, setMode] = useState<'kanji-hanviet' | 'word-meaning'>('kanji-hanviet');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [showFurigana, setShowFurigana] = useState(false);
  const [started, setStarted] = useState(false);

  const pool = useMemo(() => {
    const base = selectedLessons.length === 0
      ? kanjiN3
      : kanjiN3.filter(k => selectedLessons.includes(k.lesson || ''));
    
    if (mode === 'kanji-hanviet') {
      return shuffle(base).map(k => ({
        id: k.id,
        character: k.character,
        hanViet: k.hanViet,
        lesson: k.lesson,
        words: k.words,
      }));
    } else {
      const wordsList: any[] = [];
      base.forEach(k => {
        k.words.forEach((w, idx) => {
          wordsList.push({
            id: `${k.id}_w_${idx}`,
            word: w.word,
            hiragana: w.hiragana,
            meaning: typeof w.meaning === 'object' ? w.meaning.vi : w.meaning,
            hanVietWord: w.hanVietWord || k.hanViet,
            examples: w.examples,
            lesson: k.lesson,
          });
        });
      });
      return shuffle(wordsList);
    }
  }, [selectedLessons, mode]);

  const [queue, setQueue] = useState<any[]>([]);
  const [known, setKnown] = useState<any[]>([]);
  const [learning, setLearning] = useState<any[]>([]);
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

  // Get dynamic front text size based on length
  const getFrontTextSize = (text: string) => {
    if (text.length <= 2) return 'text-8xl font-black';
    if (text.length <= 5) return 'text-5xl font-extrabold';
    if (text.length <= 10) return 'text-3xl font-bold';
    return 'text-2xl font-bold px-4';
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
        <div className="max-w-3xl mx-auto">
          <Link to="/practice/kanji" className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">🃏 Lật thẻ Kanji</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Ôn tập chữ Hán và các từ vựng đi kèm.</p>

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
              getCount={(l) => kanjiN3.filter(k => k.lesson === l).length}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">⚙️ Chế độ ôn tập</label>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('kanji-hanviet')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex justify-between items-center ${
                      mode === 'kanji-hanviet'
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span>Chữ Kanji & Hán Việt</span>
                    <span className="text-xs font-normal opacity-70">共 ⇄ CỘNG</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('word-meaning')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex justify-between items-center ${
                      mode === 'word-meaning'
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span>Từ ghép & Nghĩa tiếng Việt</span>
                    <span className="text-xs font-normal opacity-70">共通点 ⇄ Điểm chung</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">🔄 Hướng lật thẻ</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDirection('forward')}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                      direction === 'forward'
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shadow-sm'
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
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    Đảo ngược
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">
                  👁️ Hiển thị Kana (Gợi ý mặt chữ Hán)
                </label>
                <button
                  onClick={() => setShowFurigana(!showFurigana)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    showFurigana
                      ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-3 font-bold">
                    {showFurigana ? <Eye size={20} /> : <EyeOff size={20} />}
                    {showFurigana ? 'Đang bật' : 'Đang ẩn'}
                  </div>
                  <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative transition-colors" style={{ backgroundColor: showFurigana ? '#8b5cf6' : '' }}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showFurigana ? 'left-5' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              Bắt đầu ôn tập (hiện có {pool.length} thẻ)
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
              className="w-full py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:border-violet-400 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Ôn lại tất cả
            </button>
            <Link to="/practice/kanji" className="block w-full py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl transition-all text-center">
              Về dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const progress = ((known.length + learning.length) / (known.length + learning.length + queue.length)) * 100;

  const getFrontText = () => {
    if (!current) return '';
    if (mode === 'kanji-hanviet') {
      return direction === 'forward' ? current.character : current.hanViet;
    } else {
      return direction === 'forward' ? current.word : current.meaning;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-violet-600 transition-colors font-medium">
            <ArrowLeft size={18} /> Cài đặt
          </button>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                showFurigana 
                  ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {showFurigana ? <Eye size={16} /> : <EyeOff size={16} />}
              Kana
            </button>
            <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
              {known.length + learning.length} / {known.length + learning.length + queue.length}
            </div>
          </div>
        </div>

        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="h-full bg-violet-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {current.lesson && (
          <div className="text-center mb-3">
            <span className="text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 px-3 py-1 rounded-full font-medium">
              {current.lesson}
            </span>
          </div>
        )}

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
              <div className={`min-h-[24rem] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl border-2 transition-colors ${isFlipped
                ? 'bg-violet-600 border-violet-500 text-white'
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white'
                }`}>
                {!isFlipped ? (
                  <>
                    <div className={getFrontTextSize(getFrontText())}>
                      {getFrontText()}
                    </div>
                    {showFurigana && mode !== 'kanji-hanviet' && direction === 'forward' && (
                      <div className="text-lg text-slate-400 dark:text-slate-500 mt-2 font-medium">
                        {current.hiragana}
                      </div>
                    )}
                    <div className="mt-6 text-sm text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <RotateCcw size={14} /> Chạm để lật
                    </div>
                  </>
                ) : (
                  <div className="w-full">
                    {mode === 'kanji-hanviet' ? (
                      <>
                        <div className="text-violet-200 text-sm mb-2 font-medium uppercase tracking-widest">
                          {direction === 'forward' ? 'Hán Việt' : 'Chữ Hán'}
                        </div>
                        <div className="text-5xl font-black mb-6 text-white">
                          {direction === 'forward' ? current.hanViet : current.character}
                        </div>

                        <div className="space-y-3 mt-6 text-left w-full border-t border-violet-500 pt-6 max-h-[300px] overflow-y-auto pr-1">
                          {current.words && current.words.map((w: any, idx: number) => (
                            <div key={idx} className="bg-white/10 rounded-xl p-3 flex flex-col justify-between items-start">
                              <div className="flex w-full justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl font-bold text-white">{w.word}</span>
                                    {w.type && (
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-800/50 text-violet-200 uppercase font-bold tracking-wider">
                                        {w.type === 'verb' ? `Verb ${w.group ? `G${w.group}` : ''}` : w.type}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-sm text-violet-200">{w.hiragana}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-white">{typeof w.meaning === 'object' ? w.meaning.vi : w.meaning}</div>
                                  <div className="text-xs text-violet-300">Âm {w.readingType}</div>
                                </div>
                              </div>
                              
                              {w.examples && w.examples.length > 0 && (
                                <div className="w-full mt-2 pt-2 border-t border-violet-400/30 text-left">
                                  <div className="text-xs text-violet-100">{w.examples[0].jp}</div>
                                  <div className="text-[10px] text-violet-300">{w.examples[0].vi}</div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-violet-200 text-sm mb-1 font-medium uppercase tracking-widest">
                          {direction === 'forward' ? 'Ý nghĩa' : 'Từ ghép'}
                        </div>
                        <div className="text-3xl font-extrabold mb-4 text-white">
                          {direction === 'forward' ? current.meaning : current.word}
                        </div>

                        <div className="text-violet-200 text-sm mb-1 font-medium uppercase tracking-widest">Cách đọc</div>
                        <div className="text-3xl font-extrabold mb-4 text-white">{current.hiragana}</div>
                        
                        <div className="text-violet-200 text-sm mb-1 font-medium uppercase tracking-widest">Hán Việt</div>
                        <div className="text-2xl font-bold mb-6 text-white">{current.hanVietWord}</div>

                        {current.examples && current.examples.length > 0 && (
                          <div className="w-full mt-4 pt-4 border-t border-violet-500 text-left">
                            <div className="text-xs text-violet-200 uppercase tracking-widest font-semibold mb-2">Ví dụ</div>
                            <div className="bg-white/10 rounded-xl p-3">
                              <div className="text-sm font-medium text-white">{current.examples[0].jp}</div>
                              <div className="text-xs text-violet-200 mt-1">{current.examples[0].vi}</div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

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
