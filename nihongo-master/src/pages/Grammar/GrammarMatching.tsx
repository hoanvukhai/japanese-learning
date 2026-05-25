// src/pages/Grammar/GrammarMatching.tsx
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { grammarN3, getN3GrammarLessons } from '../../data/grammarN3';
import { useSettings } from '../../context/global/useSettings';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

type MatchMode = 'structure-meaning' | 'structure-formation';

export default function GrammarMatching() {
  const { language } = useSettings();
  const lessons = getN3GrammarLessons();
  const [started, setStarted] = useState(false);
  const [lesson, setLesson] = useState('all');
  const [mode, setMode] = useState<MatchMode>('structure-meaning');

  // Game state
  const [lefts, setLefts] = useState<{ id: string; text: string; matched: boolean; selected: boolean }[]>([]);
  const [rights, setRights] = useState<{ id: string; text: string; matched: boolean; selected: boolean }[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [errorPair, setErrorPair] = useState<{ l: string; r: string } | null>(null);
  const [roundScore, setRoundScore] = useState(0);
  const [totalRounds, setTotalRounds] = useState(0);

  const basePool = useMemo(() => {
    return lesson === 'all' ? grammarN3 : grammarN3.filter(g => g.lesson === lesson);
  }, [lesson]);

  const initRound = () => {
    const pool = shuffle(basePool).slice(0, 6);
    if (mode === 'structure-meaning') {
      setLefts(shuffle(pool.map(g => ({ id: g.id, text: g.structure, matched: false, selected: false }))));
      setRights(shuffle(pool.map(g => ({ id: g.id, text: g.meaning[language as 'vi' | 'en'] || g.meaning.vi, matched: false, selected: false }))));
    } else {
      // structure ↔ first formation rule
      setLefts(shuffle(pool.map(g => ({ id: g.id, text: g.structure, matched: false, selected: false }))));
      setRights(shuffle(pool.map(g => ({ id: g.id, text: g.formation[0], matched: false, selected: false }))));
    }
    setSelectedLeft(null);
    setSelectedRight(null);
    setErrorPair(null);
    setRoundScore(0); // BUG-06 fix: Reset score mỗi vòng mới
    setTotalRounds(t => t + 1);
    setStarted(true);
  };

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (selectedLeft === selectedRight) {
        // Correct match
        setLefts(prev => prev.map(l => l.id === selectedLeft ? { ...l, matched: true, selected: false } : l));
        setRights(prev => prev.map(r => r.id === selectedRight ? { ...r, matched: true, selected: false } : r));
        setSelectedLeft(null);
        setSelectedRight(null);
        setRoundScore(s => s + 1);
      } else {
        // Mismatch
        setErrorPair({ l: selectedLeft, r: selectedRight });
        setTimeout(() => {
          setLefts(prev => prev.map(l => ({ ...l, selected: false })));
          setRights(prev => prev.map(r => ({ ...r, selected: false })));
          setSelectedLeft(null);
          setSelectedRight(null);
          setErrorPair(null);
        }, 800);
      }
    }
  }, [selectedLeft, selectedRight]);

  const handleLeft = (id: string) => {
    if (errorPair || lefts.find(l => l.id === id)?.matched) return;
    setSelectedLeft(id);
    setLefts(prev => prev.map(l => ({ ...l, selected: l.id === id })));
  };

  const handleRight = (id: string) => {
    if (errorPair || rights.find(r => r.id === id)?.matched) return;
    setSelectedRight(id);
    setRights(prev => prev.map(r => ({ ...r, selected: r.id === id })));
  };

  const isWin = lefts.length > 0 && lefts.every(l => l.matched);

  const getTextSize = (text: string) => {
    if (text.length <= 12) return 'text-base font-bold';
    if (text.length <= 25) return 'text-sm font-semibold';
    return 'text-xs font-medium';
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
        <div className="max-w-lg mx-auto">
          <Link to="/practice/grammar" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">🔗 Nối Ngữ Pháp</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Ghép cấu trúc với nghĩa tiếng Việt — phản xạ siêu tốc.</p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">📚 Bài học</label>
              <select
                value={lesson}
                onChange={e => setLesson(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:border-teal-500 transition-colors cursor-pointer"
              >
                <option value="all">Tất cả ({grammarN3.length} mẫu)</option>
                {lessons.map(l => (
                  <option key={l} value={l}>{l} ({grammarN3.filter(g => g.lesson === l).length} mẫu)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">⚙️ Chế độ nối</label>
              <div className="grid grid-cols-1 gap-2">
                {([
                  { val: 'structure-meaning', label: 'Cấu trúc ↔ Nghĩa tiếng Việt', hint: '〜がる ↔ Cảm thấy...' },
                  { val: 'structure-formation', label: 'Cấu trúc ↔ Cách thành lập', hint: '〜がる ↔ A(bỏ い) + がる' },
                ] as const).map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setMode(opt.val)}
                    className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex justify-between items-center ${
                      mode === opt.val
                        ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-xs font-normal opacity-70">{opt.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={initRound}
              className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-teal-500/20"
            >
              Bắt đầu trò chơi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 transition-colors font-medium">
            <ArrowLeft size={18} /> Quay lại
          </button>
          <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {mode === 'structure-meaning' ? 'Nối Cấu trúc ↔ Nghĩa' : 'Nối Cấu trúc ↔ Thành lập'}
          </div>
          <div className="text-sm font-bold text-teal-600 dark:text-teal-400">
            {roundScore} ✓
          </div>
        </div>

        {isWin ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl text-center max-w-sm mx-auto"
          >
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-2">Xuất sắc!</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Đã nối đúng {roundScore} cặp · Vòng {totalRounds}</p>
            <button
              onClick={initRound}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mb-3 shadow-md"
            >
              <RotateCcw size={18} /> Chơi tiếp (bộ mới)
            </button>
            <Link to="/practice/grammar" className="block w-full py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:border-slate-300 transition-all text-center">
              Về dashboard
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {/* Cột Trái — Cấu trúc */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-2">Cấu trúc</div>
              {lefts.map(l => {
                let cls = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:border-teal-400';
                if (l.matched) cls = 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-800 text-green-600 dark:text-green-400 opacity-50 cursor-default';
                else if (errorPair?.l === l.id) cls = 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-700 text-red-600';
                else if (l.selected) cls = 'bg-teal-50 dark:bg-teal-900/30 border-teal-400 dark:border-teal-600 text-teal-700 dark:text-teal-300';
                return (
                  <button
                    key={l.id}
                    onClick={() => handleLeft(l.id)}
                    disabled={l.matched}
                    className={`w-full min-h-[5rem] p-3 flex items-center justify-center rounded-2xl border-2 transition-all shadow-sm ${cls} ${getTextSize(l.text)} text-center`}
                  >
                    {l.text}
                  </button>
                );
              })}
            </div>

            {/* Cột Phải — Nghĩa / Thành lập */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-2">
                {mode === 'structure-meaning' ? 'Nghĩa' : 'Cách thành lập'}
              </div>
              {rights.map(r => {
                let cls = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:border-teal-400';
                if (r.matched) cls = 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-800 text-green-600 dark:text-green-400 opacity-50 cursor-default';
                else if (errorPair?.r === r.id) cls = 'bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-700 text-red-600';
                else if (r.selected) cls = 'bg-teal-50 dark:bg-teal-900/30 border-teal-400 dark:border-teal-600 text-teal-700 dark:text-teal-300';
                return (
                  <button
                    key={r.id}
                    onClick={() => handleRight(r.id)}
                    disabled={r.matched}
                    className={`w-full min-h-[5rem] p-3 flex items-center justify-center rounded-2xl border-2 transition-all shadow-sm ${cls} ${getTextSize(r.text)} text-center`}
                  >
                    {r.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
