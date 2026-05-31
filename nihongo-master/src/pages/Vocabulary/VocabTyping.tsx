// src/pages/Vocabulary/VocabTyping.tsx
// Nhập liệu: nhìn nghĩa VN, gõ Hiragana — tái sử dụng cơ chế wanakana từ TypingTest.tsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, Eye, EyeOff, Trophy, ArrowRight } from 'lucide-react';
import * as wanakana from 'wanakana';
import { vocabularyN3, getN3Lessons } from '../../data/vocabularyN3';
import type { Word } from '../../types';
import VocabLessonChips from '../../components/vocabulary/VocabLessonChips';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}



export default function VocabTyping() {
  const lessons = getN3Lessons();
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [showFurigana, setShowFurigana] = useState(false);
  const [started, setStarted] = useState(false);

  const pool = useMemo(() => {
    const base = selectedLessons.length === 0
      ? vocabularyN3
      : vocabularyN3.filter(w => selectedLessons.includes(w.lesson || ''));
    return shuffle(base);
  }, [selectedLessons]);

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [done, setDone] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const current = pool[index];

  const getMeaning = (w: Word) =>
    typeof w.meaning === 'object' ? w.meaning.vi : w.meaning;

  const correctAnswer = current
    ? direction === 'backward' 
      ? current.hiragana 
      : (current.alt_kanji ? `${current.kanji} hoặc ${current.alt_kanji}` : current.kanji)
    : '';

  useEffect(() => {
    if (started && !submitted) {
      inputRef.current?.focus();
    }
  }, [index, started, submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || submitted) return;

    let check = false;
    if (direction === 'forward') {
      check = input.trim() === current.kanji || (current.alt_kanji ? input.trim() === current.alt_kanji : false);
    } else {
      check = input.trim() === current.hiragana;
    }

    setIsCorrect(check);
    setSubmitted(true);
    if (check) setScore(s => s + 1);
    else setWrong(s => s + 1);
  };

  const handleNext = () => {
    if (index + 1 >= pool.length) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
      setInput('');
      setSubmitted(false);
    }
  };

  const handleRestart = () => {
    setIndex(0);
    setInput('');
    setSubmitted(false);
    setScore(0);
    setWrong(0);
    setDone(false);
  };

  // ──────────── SETUP ────────────
  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
        <div className="max-w-3xl mx-auto">
          <Link to="/practice/vocabulary" className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">⌨️ Nhập liệu</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Nhìn nghĩa, gõ Romaji — tự chuyển sang Hiragana.</p>

          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 space-y-8">
            <VocabLessonChips
              options={lessons}
              selected={selectedLessons}
              onToggle={(val) => {
                setSelectedLessons(prev =>
                  prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]
                );
              }}
              onSelectAll={() => setSelectedLessons([])}
              totalCount={vocabularyN3.length}
              getCount={(l) => vocabularyN3.filter(w => w.lesson === l).length}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">🔄 Hướng câu hỏi</label>
                <div className="flex flex-col gap-3">
                  {([
                    { value: 'forward', label: 'Thuận (Nghĩa → gõ Kanji)' },
                    { value: 'backward', label: 'Đảo ngược (Nghĩa → gõ Hiragana)' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDirection(opt.value)}
                      className={`py-3 px-4 rounded-xl border-2 font-medium text-left transition-all ${direction === opt.value
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                          : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-orange-300'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">👁️ Hiển thị Kana (Gợi ý)</label>
                <button
                  onClick={() => setShowFurigana(!showFurigana)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${showFurigana
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                >
                  <div className="flex items-center gap-3 font-bold">
                    {showFurigana ? <Eye size={20} /> : <EyeOff size={20} />}
                    {showFurigana ? 'Đang bật' : 'Đang ẩn'}
                  </div>
                  <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full relative transition-colors" style={{ backgroundColor: showFurigana ? '#f97316' : '' }}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showFurigana ? 'left-5' : 'left-1'}`} />
                  </div>
                </button>
              </div>
            </div>

            <button
              onClick={() => setStarted(true)}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              Bắt đầu
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
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl max-w-sm w-full text-center"
        >
          <Trophy className="mx-auto mb-4 text-amber-400" size={56} />
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-1">Kết quả</h2>
          <div className="text-6xl font-black text-orange-500 my-4">{pct}%</div>
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
            <button onClick={handleRestart} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all">Làm lại</button>
            <Link to="/practice/vocabulary" className="block w-full py-3 border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:border-orange-400 transition-all text-center">Về dashboard</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ──────────── TYPING ────────────
  const progress = (index / pool.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors font-medium">
            <ArrowLeft size={18} /> Cài đặt
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                showFurigana 
                  ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {showFurigana ? <Eye size={16} /> : <EyeOff size={16} />}
              Kana
            </button>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{index + 1} / {pool.length}</span>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mb-8 overflow-hidden">
          <motion.div className="h-full bg-orange-500 rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.2 }}
          >
            {/* Question card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 mb-6 text-center">
              {current.lesson && (
                <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full font-medium mb-4 inline-block">
                  {current.lesson}
                </span>
              )}
              <div className="text-4xl font-bold text-slate-800 dark:text-white mt-3 mb-2">
                {getMeaning(current)}
              </div>
              {showFurigana && (
                <div className="text-lg text-slate-500 dark:text-slate-400 mb-2 font-medium">
                  {current.hiragana}
                </div>
              )}
              <div className="text-sm text-slate-400 dark:text-slate-500">
                {direction === 'backward' ? 'Gõ Romaji → Hiragana' : 'Gõ Kanji trực tiếp'}
              </div>
            </div>

            {/* Input form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => {
                  if (submitted) return;
                  const raw = e.target.value;
                  const converted = direction === 'backward'
                    ? wanakana.toHiragana(raw, { IMEMode: true })
                    : raw;
                  setInput(converted);
                }}
                disabled={submitted}
                placeholder={direction === 'backward' ? 'VD: taberu → たべる' : 'VD: 食べる'}
                className={`w-full text-center text-3xl font-bold p-5 rounded-2xl border-2 outline-none transition-all dark:bg-slate-700 dark:text-white ${submitted
                    ? isCorrect
                      ? 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'border-slate-200 dark:border-slate-600 focus:border-orange-500'
                  }`}
              />

              {!submitted ? (
                <button
                  type="submit"
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all active:scale-[0.98]"
                >
                  Kiểm tra
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Result */}
                  <div className={`p-4 rounded-2xl flex items-center justify-center gap-3 ${isCorrect
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                    }`}>
                    {isCorrect ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                    <span className="font-bold text-lg">{isCorrect ? 'Chính xác! 🎉' : 'Chưa đúng!'}</span>
                  </div>

                  {!isCorrect && (
                    <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Đáp án đúng:</p>
                      <p className="text-3xl font-bold text-slate-800 dark:text-white">{correctAnswer}</p>
                      {direction === 'forward' && (
                        <p className="text-lg text-slate-400 mt-1">{current.hiragana}</p>
                      )}
                    </div>
                  )}

                  {/* Example */}
                  {current.examples && current.examples[0] && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-200 dark:border-orange-800/40">
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-400 mb-1">Ví dụ:</p>
                      <p className="text-slate-700 dark:text-slate-200">{current.examples[0].jp}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{current.examples[0].vi}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    {index + 1 >= pool.length ? '🏁 Xem kết quả' : 'Tiếp theo'} <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}
            </form>

            {/* Score mini */}
            <div className="flex justify-center gap-6 mt-5 text-sm">
              <span className="text-green-500 flex items-center gap-1"><CheckCircle2 size={14} /> {score}</span>
              <span className="text-red-500 flex items-center gap-1"><XCircle size={14} /> {wrong}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
