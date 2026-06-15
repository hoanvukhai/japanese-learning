import os

out_path = r"f:\Workspace\learn-language\nihongo-master\src\pages\Grammar\GrammarFullRun.tsx"

content = """// src/pages/Grammar/GrammarFullRun.tsx — Toàn Diện
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, XCircle,
  RefreshCw, Flame, Clock, Info, X, Eye, EyeOff, Lightbulb, Trophy, AlertTriangle
} from 'lucide-react';
import { grammarN3, getN3GrammarLessons } from '../../data/grammarN3';
import { useSettings } from '../../context/global/useSettings';
import {
  RANKS, getRankByExp, getRankModifier, getBestExp, saveBestExp,
  getStorageKey, getStorageKeyGlobal
} from '../../lib/rankSystem';

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

// ── Level config ──────────────────────────────────────────────────────────
type Level = 'easy' | 'normal' | 'hard';
const LEVEL_CONFIG: Record<Level, { label: string; kanji: string; questions: number; blitzSecs: number; hintPenalty: number; freeHint: boolean }> = {
  easy:   { label: 'Dễ',  kanji: '入門', questions: 15, blitzSecs: 9999, hintPenalty: 0, freeHint: true  },
  normal: { label: 'Vừa', kanji: '普通', questions: 25, blitzSecs: 300, hintPenalty: 2, freeHint: false },
  hard:   { label: 'Khó', kanji: '上級', questions: 35, blitzSecs: 180, hintPenalty: 0, freeHint: false },
};

// ── Question types ────────────────────────────────────────────────────────
type QType = 'quiz' | 'flashcard' | 'error' | 'matching' | 'fill_blank';

interface BaseQ { id: string; type: QType }
interface QuizOption { id: string; label: string; subLabel?: string }

interface QuizQ extends BaseQ {
  type: 'quiz';
  prompt: string; promptSub?: string;
  options: QuizOption[];
  correctId: string;
}
interface FlashQ extends BaseQ {
  type: 'flashcard';
  front: string; frontSub?: string; back: string; backSub?: string;
}
interface ErrorQ extends BaseQ {
  type: 'error';
  correctSentence: string; wrongSentence: string;
  isCorrect: boolean;
  kana?: string; translation: string;
  structure: string; wrongStructure: string;
  caution: string;
}
interface FillBlankQ extends BaseQ {
  type: 'fill_blank';
  blankedSentence: string; fullSentence: string;
  kana?: string; translation: string;
  options: QuizOption[];
  correctId: string;
  caution: string;
}
interface MatchQ extends BaseQ {
  type: 'matching';
  pairs: { jp: string; vi: string; jpSub?: string; pairId: string }[];
}

type UnifiedQ = QuizQ | FlashQ | ErrorQ | MatchQ | FillBlankQ;

// ── Helpers ───────────────────────────────────────────────────────────────
function makeWrongSentence(g: typeof grammarN3[0], ex: typeof grammarN3[0]['examples'][0]) {
  const bracketMatch = ex.jp.match(/\\[([^\\]]+)\\]/);
  if (!bracketMatch) return null;
  const correctAnswer = bracketMatch[1];
  const blanked = ex.jp.replace(/\\[[^\\]]+\\]/, '___');
  const correctHighlighted = blanked.replace('___', `<${correctAnswer}>`);

  let wrongStructure = '';
  const sameGroup = grammarN3.filter(x => x.group === g.group && x.id !== g.id);

  if (sameGroup.length > 0) {
    const randItem = sameGroup[Math.floor(Math.random() * sameGroup.length)];
    const exMatch = randItem.examples[0]?.jp.match(/\\[([^\\]]+)\\]/);
    wrongStructure = exMatch ? exMatch[1] : randItem.structure.replace(/〜/g, '').split('/')[0];
  } else {
    const randItem = grammarN3[Math.floor(Math.random() * grammarN3.length)];
    wrongStructure = randItem.structure.replace(/〜/g, '').split('/')[0];
  }

  if (!wrongStructure) wrongStructure = 'こと';
  const wrongHighlighted = blanked.replace('___', `<${wrongStructure}>`);

  return {
    correctSentence: correctHighlighted,
    wrongSentence: wrongHighlighted,
    wrongStructure
  };
}

function makeBlankSentence(jp: string, structure: string): { blanked: string; answer: string; found: boolean } {
  const bracketMatch = jp.match(/\\[([^\\]]+)\\]/);
  if (bracketMatch) {
    const answer = bracketMatch[1];
    const blanked = jp.replace(/\\[[^\\]]+\\]/, '＿＿＿');
    return { blanked, answer, found: true };
  }

  const variants = structure
    .replace(/〜/g, '')
    .split(/[/／]/)
    .map(v => v.trim())
    .filter(v => v.length > 0)
    .sort((a, b) => b.length - a.length);

  for (const v of variants) {
    if (jp.includes(v)) {
      return { blanked: jp.replace(v, '＿＿＿'), answer: v, found: true };
    }
  }
  return { blanked: jp.slice(0, Math.ceil(jp.length * 0.6)) + '＿＿＿', answer: structure, found: false };
}

// ── Question builder ──────────────────────────────────────────────────────
interface BuildOptions { totalQ: number; language: string }

function buildQuestions(opts: BuildOptions): UnifiedQ[] {
  const { totalQ, language } = opts;
  const flatG = shuffle([...grammarN3]);
  const qs: UnifiedQ[] = [];

  const ratio = totalQ / 25;
  const dist = {
    quiz: Math.round(6 * ratio),
    fill_blank: Math.round(6 * ratio),
    error: Math.round(6 * ratio),
    flashcard: Math.round(6 * ratio),
    matching: 1,
  };

  const getMeaning = (g: typeof grammarN3[0]) => g.meaning[language as 'vi'|'en'] || g.meaning.vi;
  const getCaution = (g: typeof grammarN3[0]) => g.caution[language as 'vi'|'en'] || g.caution.vi;

  // Quiz
  for (let i = 0; i < dist.quiz && i < flatG.length; i++) {
    const g = flatG[i];
    const meaning = getMeaning(g);
    
    const sameGroup = grammarN3.filter(x => x.group === g.group && x.id !== g.id).map(getMeaning);
    const others = grammarN3.filter(x => x.id !== g.id).map(getMeaning);
    const distractorsMeaning = shuffle([...new Set([...sameGroup, ...others])]).filter(m => m !== meaning).slice(0, 3);
    
    const sameGroupStr = grammarN3.filter(x => x.group === g.group && x.id !== g.id).map(x => x.structure);
    const othersStr = grammarN3.filter(x => x.id !== g.id).map(x => x.structure);
    const distractorsStr = shuffle([...new Set([...sameGroupStr, ...othersStr])]).filter(s => s !== g.structure).slice(0, 3);

    const dir = Math.random() > 0.5 ? 's2m' : 'm2s';

    if (dir === 's2m') {
      const optsList = shuffle([meaning, ...distractorsMeaning]).map((m, idx) => ({ id: `opt_${i}_${idx}`, label: m }));
      const correctOpt = optsList.find(o => o.label === meaning)!;
      qs.push({ id: `quiz-${i}`, type: 'quiz', prompt: g.structure, promptSub: g.structureKana !== g.structure ? g.structureKana : undefined, options: optsList, correctId: correctOpt.id });
    } else {
      const optsList = shuffle([g.structure, ...distractorsStr]).map((s, idx) => {
        const found = grammarN3.find(x => x.structure === s);
        return { id: `opt_${i}_${idx}`, label: s, subLabel: found && found.structureKana !== s ? found.structureKana : undefined };
      });
      const correctOpt = optsList.find(o => o.label === g.structure)!;
      qs.push({ id: `quiz-${i}`, type: 'quiz', prompt: meaning, options: optsList, correctId: correctOpt.id });
    }
  }

  // Flashcard
  for (let i = 0; i < dist.flashcard && i < flatG.length; i++) {
    const g = flatG[(i + dist.quiz) % flatG.length];
    const meaning = getMeaning(g);
    const dir = Math.random() > 0.5 ? 's2m' : 'm2s';
    if (dir === 's2m') {
      qs.push({ id: `flash-${i}`, type: 'flashcard', front: g.structure, frontSub: g.structureKana !== g.structure ? g.structureKana : undefined, back: meaning });
    } else {
      qs.push({ id: `flash-${i}`, type: 'flashcard', front: meaning, back: g.structure, backSub: g.structureKana !== g.structure ? g.structureKana : undefined });
    }
  }

  // Error Detect
  for (let i = 0; i < dist.error && i < flatG.length; i++) {
    const g = flatG[(i + dist.quiz + dist.flashcard) % flatG.length];
    const ex = shuffle([...g.examples])[0];
    const sentenceData = makeWrongSentence(g, ex);
    if (sentenceData) {
      const cleanKana = ex.kana ? ex.kana.replace(/\\[([^\\]]+)\\]/g, '$1') : undefined;
      qs.push({
        id: `error-${i}`, type: 'error',
        isCorrect: Math.random() > 0.5,
        correctSentence: sentenceData.correctSentence,
        wrongSentence: sentenceData.wrongSentence,
        kana: cleanKana,
        translation: ex.vi,
        structure: g.structure,
        wrongStructure: sentenceData.wrongStructure,
        caution: getCaution(g)
      });
    }
  }

  // Fill Blank
  for (let i = 0; i < dist.fill_blank && i < flatG.length; i++) {
    const g = flatG[(i + dist.quiz + dist.flashcard + dist.error) % flatG.length];
    const ex = shuffle([...g.examples])[0];
    const { blanked, answer, found } = makeBlankSentence(ex.jp, g.structure);
    if (found && blanked.includes('＿＿＿')) {
      const fullSentence = ex.jp.replace(/\\[([^\\]]+)\\]/g, '$1');
      const cleanKana = ex.kana ? ex.kana.replace(/\\[([^\\]]+)\\]/g, '$1') : undefined;
      
      const getAnswerText = (x: typeof grammarN3[0]) => {
        for (const e of x.examples) {
          const m = e.jp.match(/\\[([^\\]]+)\\]/);
          if (m) return m[1];
        }
        return x.structure.replace(/〜/g, '').split('/')[0].trim();
      };

      const sameGroup = grammarN3.filter(x => x.group === g.group && getAnswerText(x) !== answer).map(getAnswerText);
      const others = grammarN3.filter(x => getAnswerText(x) !== answer).map(getAnswerText);
      const distractors = shuffle([...new Set([...sameGroup, ...others])]).filter(s => s !== answer).slice(0, 3);
      const optsList = shuffle([answer, ...distractors]).map((s, idx) => ({ id: `opt_${i}_${idx}`, label: s }));
      const correctOpt = optsList.find(o => o.label === answer)!;

      qs.push({
        id: `fill-${i}`, type: 'fill_blank',
        blankedSentence: blanked, fullSentence,
        kana: cleanKana, translation: ex.vi,
        options: optsList, correctId: correctOpt.id,
        caution: getCaution(g)
      });
    }
  }

  // Matching
  {
    if (flatG.length >= 8) {
      const mws = shuffle(flatG).slice(0, 8); // 8 pairs = 16 tiles for 4x4 grid
      qs.push({ id: 'matching-0', type: 'matching', pairs: mws.map(g => ({ jp: g.structure, vi: getMeaning(g), jpSub: g.structureKana !== g.structure ? g.structureKana : undefined, pairId: g.id })) });
    }
  }

  return shuffle(qs);
}

const TIME_LIMITS: Record<QType, number> = {
  flashcard: 5, quiz: 10, error: 12, fill_blank: 15, matching: 45
};
const BASE_SCORES: Record<QType, number> = {
  flashcard: 5, quiz: 10, error: 15, fill_blank: 15, matching: 0
};

// ── Scoring ───────────────────────────────────────────────────────────────
function calcExp(baseScore: number, streak: number, timeLeft: number, level: Level, correct: number, total: number): number {
  let finalScore = baseScore;
  if (level === 'normal') {
    const accuracy = total > 0 ? (correct / total) : 0;
    finalScore += (timeLeft * 2) * accuracy;
  }
  if (level !== 'easy') finalScore += Math.min(10, streak * 0.5);
  return Math.round(finalScore);
}

// ── MatchingMini (keyboard arrow navigation) ─────────────────────────────
interface MatchTile { uid: string; pairId: string; label: string; sub?: string; side: 'jp' | 'vi'; origIdx: number }

function MatchingMini({ q, showKana, onDone }: { q: MatchQ; showKana: boolean; onDone: (correct: number, total: number) => void }) {
  const tiles = useMemo<MatchTile[]>(() => {
    const t: MatchTile[] = [];
    q.pairs.forEach(p => {
      t.push({ uid: `jp_${p.pairId}`, pairId: p.pairId, label: p.jp, sub: p.jpSub, side: 'jp', origIdx: 0 });
      t.push({ uid: `vi_${p.pairId}`, pairId: p.pairId, label: p.vi, side: 'vi', origIdx: 0 });
    });
    return shuffle(t).map((tile, idx) => ({ ...tile, origIdx: idx }));
  }, [q]);

  const [selected, setSelected] = useState<MatchTile | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongUids, setWrongUids] = useState<[string, string] | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [focusIdx, setFocusIdx] = useState(0);
  const total = q.pairs.length;
  const COLS = 4; // 8 pairs = 16 tiles in 4x4 grid

  useEffect(() => {
    if (matched.size === total) setTimeout(() => onDone(total - wrongCount, total), 500);
  }, [matched.size]); // eslint-disable-line

  const handleTile = useCallback((tile: MatchTile) => {
    if (matched.has(tile.pairId) || wrongUids) return;
    if (selected?.uid === tile.uid) { setSelected(null); return; }
    if (!selected) { setSelected(tile); return; }
    if (selected.pairId === tile.pairId && selected.side !== tile.side) {
      setMatched(prev => new Set([...prev, tile.pairId])); setSelected(null);
    } else {
      setWrongUids([selected.uid, tile.uid]); setSelected(null); setWrongCount(c => c + 1);
      setTimeout(() => setWrongUids(null), 600);
    }
  }, [matched, wrongUids, selected]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
      }
      setFocusIdx(prev => {
        let next = prev;
        const r = Math.floor(prev / COLS);
        const c = prev % COLS;
        const ROWS = Math.ceil(tiles.length / COLS);
        if (e.key === 'ArrowRight') {
          next = r * COLS + ((c + 1) % COLS);
        } else if (e.key === 'ArrowLeft') {
          next = r * COLS + ((c - 1 + COLS) % COLS);
        } else if (e.key === 'ArrowDown') {
          next = ((r + 1) % ROWS) * COLS + c;
        } else if (e.key === 'ArrowUp') {
          next = ((r - 1 + ROWS) % ROWS) * COLS + c;
        }
        return next;
      });

      if (e.key === 'Enter' || e.key === ' ') {
        handleTile(tiles[focusIdx]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tiles, handleTile, focusIdx, matched]);

  return (
    <div className="space-y-2">
      <div className="text-center text-sm font-semibold text-slate-500 mb-1">
        🔗 Nối cặp — <span className="text-indigo-500">{matched.size}</span>/{total}
        <span className="ml-2 text-xs text-slate-400">Dùng phím mũi tên di chuyển, Enter để chọn</span>
      </div>
      <div className={`grid grid-cols-4 gap-2`}>
        {tiles.map((tile, idx) => {
          const isMatched = matched.has(tile.pairId);
          const isSel = selected?.uid === tile.uid;
          const isWrong = wrongUids?.includes(tile.uid);
          const isFocused = focusIdx === idx;

          let stateClass = 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white cursor-pointer';
          if (isMatched) stateClass = 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-900/30 opacity-40 cursor-default';
          else if (isWrong) stateClass = 'bg-red-50 border-red-400 text-red-600 dark:bg-red-900/30';
          else if (isSel) stateClass = 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 shadow-md ring-2 ring-indigo-300';
          else stateClass += ' hover:border-indigo-400';

          if (isFocused && !isMatched) {
            stateClass += ' ring-2 ring-indigo-400 dark:ring-indigo-500 border-indigo-400 scale-105 z-10';
          } else if (isFocused && isMatched) {
            stateClass += ' ring-2 ring-emerald-500 border-emerald-500 scale-105 z-10 opacity-100'; // Hiển thị rõ focus trên ô đã nối
          }

          return (
            <motion.button key={tile.uid} onClick={() => { setFocusIdx(idx); handleTile(tile); }} disabled={isMatched}
              animate={isWrong ? { x: [0, -5, 5, -3, 3, 0] } : {}} transition={{ duration: 0.25 }}
              className={`relative p-2.5 rounded-xl text-sm font-bold border-2 transition-all text-center min-h-[64px] flex flex-col items-center justify-center ${stateClass}`}>
              <div className={`${tile.side === 'jp' ? 'text-base' : 'text-xs leading-snug'}`}>{tile.label}</div>
              {showKana && tile.sub && <div className="text-xs font-normal text-slate-400 mt-0.5">{tile.sub}</div>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}


// ── Rank tooltip ──────────────────────────────────────────────────────────
function RankTooltip() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(o => !o)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"><Info size={14} /></button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute right-0 top-7 z-50 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-slate-700 dark:text-white text-sm">🏅 Bảng cấp độ</h4>
                <button onClick={() => setOpen(false)} className="text-slate-400"><X size={14} /></button>
              </div>
              <div className="space-y-1.5 mb-4">
                {RANKS.map(r => (
                  <div key={r.key} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg ${r.bgColor}`}>
                    <span className="text-lg">{r.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold ${r.color}`}>{r.kanji} — {r.nameVi}</div>
                      <div className="text-xs text-slate-500">{r.minExp} EXP+</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-slate-200 dark:border-slate-700 pt-3 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
                <div className="font-bold text-slate-600 dark:text-slate-300">Hệ số đánh giá tinh phân:</div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  <span><strong className="text-purple-500">S+ / S / S-</strong>: Xuất sắc</span>
                  <span><strong className="text-sky-500">A+ / A / A-</strong>: Giỏi</span>
                  <span><strong className="text-emerald-500">B+ / B / B-</strong>: Khá</span>
                  <span><strong className="text-amber-500">C+ / C / C-</strong>: TB</span>
                  <span className="col-span-2"><strong className="text-slate-400">D</strong>: Cần cố gắng thêm</span>
                </div>
                <div className="mt-1 italic opacity-80">* Hệ số chi tiết phụ thuộc vào số điểm vượt mốc của mỗi hạng.</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── KB hints ──────────────────────────────────────────────────────────────
const KB_HINTS: Partial<Record<QType, { key: string; desc: string }[]>> = {
  quiz:         [{ key: '1-4', desc: 'Chọn' }, { key: 'Enter', desc: 'Tiếp' }],
  fill_blank:   [{ key: '1-4', desc: 'Chọn' }, { key: 'Enter', desc: 'Tiếp' }],
  flashcard:    [{ key: 'Space', desc: 'Lật' }, { key: '1', desc: 'Chưa nhớ' }, { key: '2', desc: 'Nhớ rồi' }],
  error:        [{ key: '1', desc: 'Đúng' }, { key: '2', desc: 'Sai' }],
  matching:     [{ key: '1-0', desc: 'Chọn thẻ' }],
};

function KbHints({ type }: { type: QType }) {
  const hints = KB_HINTS[type] ?? [];
  if (!hints.length) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap mt-1 mb-1">
      {hints.map(h => (
        <span key={h.key} className="flex items-center gap-1 text-xs text-slate-400">
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 border border-slate-200 dark:border-slate-600 font-mono text-xs">{h.key}</kbd>
          {h.desc}
        </span>
      ))}
    </div>
  );
}

// ── Result screen ─────────────────────────────────────────────────────────
function ResultScreen({ score, correct, total, streak, timeLeft, blitzSecs, level, hintCount, onRetry, onBack }: {
  score: number; correct: number; total: number; streak: number;
  timeLeft?: number; blitzSecs: number; level: Level; hintCount: number;
  onRetry: () => void; onBack: () => void;
}) {
  const exp = calcExp(score, streak, timeLeft ?? 0, level, correct, total);
  const { rank, modifier, isPerfect } = getRankModifier(exp);
  
  const storageKey = getStorageKey('grammar', level);
  const globalKey = getStorageKeyGlobal('grammar');
  
  const isNewBest = saveBestExp(storageKey, exp);
  const isNewGlobalBest = saveBestExp(globalKey, exp);
  
  const bestExp = getBestExp(storageKey);
  const globalBestExp = getBestExp(globalKey);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.8, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 20 }}
        className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className={`${rank.bgColor} p-6 text-center relative`}>
          {isNewGlobalBest ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
              className="absolute top-3 right-3 bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] text-xs font-black px-2 py-1 rounded-full">KỶ LỤC TỔNG! 👑</motion.div>
          ) : isNewBest ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
              className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-1 rounded-full">KỶ LỤC MỚI! 🎉</motion.div>
          ) : null}
          <div className="flex justify-center mb-1">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }} 
              className={`text-5xl font-black tracking-widest ${isPerfect ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 animate-pulse' : rank.color}`}>
              [ {rank.badge}{modifier} ]
            </motion.div>
          </div>
          <div className={`text-xl font-bold ${rank.color} mt-2 flex items-center justify-center gap-2`}>
            <span className="text-2xl">{rank.emoji}</span> <span>{rank.kanji} — {rank.nameVi}</span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center">
            <motion.div className="text-xl font-bold text-slate-600 dark:text-slate-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              Điểm đạt được: <span className="text-4xl font-black text-slate-800 dark:text-white mx-1">{exp}</span> <span className="text-lg text-slate-400">EXP</span>
            </motion.div>
            <p className={`text-sm mt-1 ${rank.color} font-medium`}>{rank.descVi}</p>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { val: `${correct}/${total}`, label: 'Đúng', cls: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600' },
              { val: total - correct, label: 'Sai', cls: 'bg-red-50 dark:bg-red-900/30 text-red-500' },
              { val: `${streak}🔥`, label: 'Streak', cls: 'bg-orange-50 dark:bg-orange-900/30 text-orange-500' },
              { val: `${hintCount}💡`, label: 'Gợi ý', cls: 'bg-slate-50 dark:bg-slate-700 text-slate-500' },
            ].map(s => (
              <div key={s.label} className={`text-center rounded-xl p-2 ${s.cls}`}>
                <div className="text-lg font-black">{s.val}</div>
                <div className="text-xs">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="text-center space-y-1">
             <div className="text-xs text-slate-400">🏆 Kỷ lục {LEVEL_CONFIG[level].label}: <strong className="text-slate-600 dark:text-slate-200">{bestExp} EXP</strong></div>
             {globalBestExp > 0 && <div className="text-xs text-slate-400">🌟 Kỷ lục Tổng: <strong className="text-indigo-500">{globalBestExp} EXP</strong></div>}
          </div>
          <div className="flex gap-2">
            <button onClick={onBack} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm">Về Dashboard</button>
            <button onClick={onRetry} className="flex-1 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-sm flex items-center justify-center gap-2">
              <RefreshCw size={14} /> Chơi lại
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
const BACK_PATH = '/practice/grammar';

export default function GrammarFullRun() {
  const navigate = useNavigate();
  const { language } = useSettings();

  const [level, setLevel] = useState<Level>('normal');
  const [showKana, setShowKana] = useState(true);
  const [started, setStarted] = useState(false);
  const [seed, setSeed] = useState(0);

  const lvl = LEVEL_CONFIG[level];

  const questions = useMemo(() => buildQuestions({ totalQ: lvl.questions, language }), [lvl.questions, seed, language]);
  const [qIdx, setQIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [score, setScore] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(lvl.blitzSecs);
  const [hintCount, setHintCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [done, setDone] = useState(false);

  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
  const [flashFlipped, setFlashFlipped] = useState(false);
  const [errorSelected, setErrorSelected] = useState<boolean | null>(null);
  const [errorCorrect, setErrorCorrect] = useState<boolean | null>(null);

  // Auto-advance countdown
  const RESULT_SECS = 3;
  const [countdown, setCountdown] = useState<number | null>(null);
  const [blitzPaused, setBlitzPaused] = useState(false);
  const pendingAdvanceRef = useRef<{ correct: boolean; added: number; baseScore?: number } | null>(null);
  const commitAdvanceRef = useRef<() => void>(() => {});

  const currentQ = questions[qIdx];
  const totalQ = questions.length;

  const [qTimeLeft, setQTimeLeft] = useState<number | null>(null);

  // Timer (Global only ticks in Normal mode)
  useEffect(() => {
    if (!started || level !== 'normal' || done || blitzPaused) return;
    if (timeLeft <= 0) { setDone(true); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, level, timeLeft, done, blitzPaused]);

  // QTimer Setup
  useEffect(() => {
    if (level === 'hard' && started && currentQ && !done) {
      setQTimeLeft(TIME_LIMITS[currentQ.type]);
    } else {
      setQTimeLeft(null);
    }
  }, [qIdx, started, level, currentQ, done]);

  // QTimer Tick
  useEffect(() => {
    if (level !== 'hard' || !started || done || blitzPaused || qTimeLeft === null || qTimeLeft <= 0) return;
    const t = setTimeout(() => setQTimeLeft(s => s! - 1), 1000);
    return () => clearTimeout(t);
  }, [qTimeLeft, level, started, done, blitzPaused]);

  const forceTimeoutRef = useRef(false);

  const resetQ = useCallback(() => {
    setQuizSelected(null); setQuizCorrect(null); setFlashFlipped(false);
    setErrorSelected(null); setErrorCorrect(null);
    setCountdown(null); setBlitzPaused(false); pendingAdvanceRef.current = null;
    forceTimeoutRef.current = false;
  }, []);

  const advance = useCallback((wasCorrect: boolean, addedCorrect = 1, customBaseScore?: number) => {
    if (wasCorrect) {
      setCorrect(c => c + addedCorrect);
      const base = customBaseScore !== undefined ? customBaseScore : BASE_SCORES[currentQ.type];
      const multiplier = level === 'easy' ? 1.0 : level === 'normal' ? 1.5 : 2.5;
      let earned = base * multiplier;
      if (level === 'hard' && qTimeLeft !== null) {
        earned += (qTimeLeft * 3);
      }
      setScore(s => s + Math.round(earned));

      if (level !== 'easy') {
        setCurrentStreak(s => { const ns = s + 1; setMaxStreak(m => Math.max(m, ns)); return ns; });
      }
    } else { 
      if (level !== 'easy') setCurrentStreak(0);
      if (level === 'hard') {
        setLives(l => {
          const nl = l - 1;
          if (nl <= 0) setDone(true);
          return nl;
        });
      }
    }
    setQIdx(prev => {
      const next = prev + 1;
      if (next >= totalQ || (level === 'easy' && next >= lvl.questions)) {
        setDone(true);
      }
      return next;
    });
    resetQ();
  }, [level, totalQ, lvl.questions, resetQ, currentQ?.type, qTimeLeft]);

  const commitAdvance = useCallback(() => {
    const pa = pendingAdvanceRef.current;
    pendingAdvanceRef.current = null;
    setBlitzPaused(false);
    setCountdown(null);
    if (pa !== null) advance(pa.correct, pa.added, pa.baseScore);
  }, [advance]);

  commitAdvanceRef.current = commitAdvance;

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) { commitAdvanceRef.current(); return; }
    const t = setTimeout(() => setCountdown(c => c !== null ? c - 1 : null), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  function triggerResult(correct: boolean, added = 1, baseScore?: number) {
    pendingAdvanceRef.current = { correct, added, baseScore };
    setCountdown(RESULT_SECS);
    setBlitzPaused(true);
  }

  // Handle QTimer timeout
  useEffect(() => {
    if (level === 'hard' && qTimeLeft === 0 && !blitzPaused && !forceTimeoutRef.current && currentQ) {
      forceTimeoutRef.current = true;
      if (currentQ.type === 'quiz' || currentQ.type === 'fill_blank') { setQuizSelected('timeout'); setQuizCorrect(false); }
      else if (currentQ.type === 'error') { setErrorSelected(false); setErrorCorrect(false); }
      else if (currentQ.type === 'flashcard') { setFlashFlipped(true); }
      triggerResult(false, 0, 0);
    }
  }, [qTimeLeft, level, blitzPaused, currentQ]);

  // Keyboard shortcuts -- unified
  useEffect(() => {
    if (!started || done || !currentQ) return;
    const handler = (e: KeyboardEvent) => {
      const el = e.target as HTMLInputElement;
      const isActiveInput = (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') && !el.disabled;
      if (isActiveInput) return;

      if (e.key === 'Enter' && countdown !== null) { e.preventDefault(); commitAdvanceRef.current(); return; }

      const isQuizType = currentQ.type === 'quiz' || currentQ.type === 'fill_blank';
      if (isQuizType && !quizSelected) {
        const q = currentQ as QuizQ | FillBlankQ;
        const num = parseInt(e.key);
        if (!isNaN(num) && num >= 1 && num <= q.options.length) {
          const opt = q.options[num - 1];
          const correct = opt.id === q.correctId;
          setQuizSelected(opt.id); setQuizCorrect(correct);
          triggerResult(correct);
        }
      }
      if (currentQ.type === 'flashcard') {
        if (e.key === ' ') { e.preventDefault(); setFlashFlipped(f => !f); }
        if ((e.key === 'ArrowLeft' || e.key === '1') && flashFlipped) { e.preventDefault(); advance(false); }
        if ((e.key === 'ArrowRight' || e.key === 'Enter' || e.key === '2') && flashFlipped) { e.preventDefault(); advance(true); }
      }
      if (currentQ.type === 'error' && errorSelected === null) {
        if (e.key.toLowerCase() === 't' || e.key === '1') {
          const ok = (currentQ as ErrorQ).isCorrect;
          setErrorSelected(true); setErrorCorrect(ok); triggerResult(ok);
        }
        if (e.key.toLowerCase() === 'f' || e.key === '2') {
          const ok = !(currentQ as ErrorQ).isCorrect;
          setErrorSelected(false); setErrorCorrect(ok); triggerResult(ok);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [started, done, currentQ, quizSelected, flashFlipped, errorSelected, countdown, advance, triggerResult]);

  function startGame() {
    setSeed(s => s + 1);
    setStarted(true); setQIdx(0); setCorrect(0); setScore(0); setMaxStreak(0); setCurrentStreak(0);
    setTimeLeft(lvl.blitzSecs); setHintCount(0); setLives(3); setDone(false); resetQ();
  }

  // ── SETUP ─────────────────────────────────────────────────────────────
  if (!started) {
    const storageKey = getStorageKeyGlobal('grammar');
    const bp = getBestExp(storageKey);
    const br = bp > 0 ? getRankByExp(bp) : null;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 font-sans">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => navigate(BACK_PATH)} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-8 transition-colors font-medium">
            <ArrowLeft size={18} /> Quay lại
          </button>
          <div className="flex items-center justify-between mb-8">
             <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">⚡ Toàn Diện — Ngữ Pháp</h1>
                  <RankTooltip />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">5 loại mini-game trong một phiên luyện tập.</p>
             </div>
             {br && (() => {
               const bMod = getRankModifier(bp);
               return (
                 <div className="bg-gradient-to-r from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 border border-indigo-200 dark:border-indigo-800 px-4 py-2 rounded-2xl text-center shadow-sm">
                    <div className="text-[10px] uppercase font-black tracking-wider text-indigo-600 dark:text-indigo-500 mb-0.5">Kỷ lục Tổng</div>
                    <div className="flex items-center justify-center gap-1.5">
                       <span className="text-lg font-black tracking-widest text-indigo-700 dark:text-indigo-400">[ {br.badge}{bMod.modifier} ]</span>
                       <span className="font-bold text-indigo-700 dark:text-indigo-400">{bp} EXP</span>
                    </div>
                 </div>
               );
             })()}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-600 dark:text-slate-300 block mb-2">Độ khó & Luật chơi</label>
                <div className="space-y-2">
                  {(['easy', 'normal', 'hard'] as Level[]).map(l => {
                    const cfg = LEVEL_CONFIG[l];
                    const isHard = l === 'hard';
                    const isEasy = l === 'easy';
                    const desc = isEasy ? 'Không giới hạn thời gian, không áp lực' : isHard ? 'Sinh tồn: Chỉ có 3 Mạng, khóa hoàn toàn Gợi ý' : 'Tính thời gian và Combo, được dùng Gợi ý';
                    return (
                      <button key={l} onClick={() => setLevel(l)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${level === l ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300'}`}>
                        <div className="flex items-center gap-3 text-left">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                              isEasy ? 'bg-emerald-100 text-emerald-600' : isHard ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                           }`}>
                              {cfg.kanji}
                           </div>
                           <div>
                             <div className="font-bold text-sm text-slate-800 dark:text-white">Mức {cfg.label}</div>
                             <div className="text-xs text-slate-500 line-clamp-1">{desc}</div>
                           </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <label className="text-sm font-bold text-slate-600 dark:text-slate-300 block mb-2">Tuỳ chọn</label>
                <div className="space-y-2">
                  {[
                    { key: 'kana',    label: 'Hiển thị Hiragana', desc: 'Hiện furigana trên câu hỏi', icon: <Eye size={16}/>, val: showKana, set: setShowKana },
                  ].map(t => (
                    <button key={t.key} onClick={() => t.set(!t.val)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${t.val ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'}`}>
                      <div className={t.val ? 'text-indigo-600' : 'text-slate-400'}>{t.icon}</div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-700 dark:text-white">{t.label}</div>
                        <div className="text-xs text-slate-500">{t.desc}</div>
                      </div>
                      <div className={`w-9 h-5 rounded-full relative transition-colors ${t.val ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-600'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${t.val ? 'left-4' : 'left-0.5'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 text-sm border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2 mb-1"><Lightbulb size={14}/> Gợi ý</div>
                {lvl.freeHint ? <div className="text-slate-500">Miễn phí ở độ khó Dễ</div> : level === 'hard' ? <div className="text-red-500">Không có gợi ý ở Khó</div> : <div className="text-slate-500">-{lvl.hintPenalty}% mỗi lần (tối đa -10%)</div>}
              </div>
            </div>
          </div>
          <button onClick={startGame}
            className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all text-lg shadow-lg hover:shadow-indigo-400/30 hover:-translate-y-0.5">
            Bắt đầu thách đấu
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <ResultScreen score={score} correct={correct} total={totalQ} streak={maxStreak}
        timeLeft={level !== 'easy' ? timeLeft : undefined} blitzSecs={lvl.blitzSecs}
        level={level} hintCount={hintCount}
        onRetry={() => setStarted(false)} onBack={() => navigate(BACK_PATH)} />
    );
  }

  const progress = (qIdx / totalQ) * 100;
  const isQuizType = currentQ.type === 'quiz' || currentQ.type === 'fill_blank';
  const isLivesCritical = level === 'hard' && lives === 1;

  const renderHighlightedSentence = (text: string, status: 'idle'|'success'|'fail') => {
    const parts = text.split(/<([^>]+)>/);
    return (
      <span>
        {parts.map((part, i) =>
          i % 2 === 1 ? (
            <span key={i} className={`font-bold border-b-4 pb-0.5 px-1 ${
              status === 'idle' ? 'border-indigo-400 text-indigo-600 dark:text-indigo-400'
              : status === 'success' ? 'border-green-400 text-green-600 dark:text-green-400'
              : 'border-red-400 text-red-600 dark:text-red-400'
            }`}>
              {part}
            </span>
          ) : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans transition-colors duration-500 ${isLivesCritical ? 'ring-[4px] ring-red-500/50 ring-inset' : ''}`}>
      <div className="flex items-center justify-between px-4 pt-3 pb-2 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        <button onClick={() => setDone(true)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><ArrowLeft size={18} /></button>
        <div className="flex items-center gap-3 text-sm">
          {level === 'normal' && (
            <div className={`flex items-center gap-1 font-bold ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-slate-600 dark:text-slate-300'}`}>
              <Clock size={13} /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          )}
          {level === 'hard' && qTimeLeft !== null && (
            <div className={`flex items-center gap-1 font-black ${qTimeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-orange-500'}`}>
              <Clock size={13} /> {qTimeLeft}s
            </div>
          )}
          {level === 'hard' && (
            <div className="flex items-center gap-0.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-red-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
              ))}
            </div>
          )}
          {level !== 'easy' && (
            <div className="flex items-center gap-1 font-bold text-orange-500">
              <Flame size={14} className={currentStreak > 2 ? 'animate-pulse' : ''} />
              {currentStreak}
            </div>
          )}
          <div className="font-black text-indigo-600 dark:text-indigo-400">{score} pt</div>
        </div>
      </div>
      <div className="w-full h-1 bg-slate-200 dark:bg-slate-700">
        <motion.div className="h-full bg-indigo-500" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>
      <div className="flex-1 overflow-auto p-4 flex flex-col max-w-2xl w-full mx-auto justify-center">
        <AnimatePresence mode="wait">
          <motion.div key={currentQ.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.2 }} className="w-full">
            
            {/* ── QUIZ & FILL BLANK ────────────────────────────────────────────── */}
            {isQuizType && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 text-center relative overflow-hidden">
                  {blitzPaused && <div className="absolute inset-0 z-20 pointer-events-none" />}
                  {currentQ.type === 'fill_blank' ? (
                    <>
                      <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Điền vào chỗ trống</div>
                      <div className="text-xl font-bold text-slate-800 dark:text-white leading-relaxed mb-2">{(currentQ as FillBlankQ).blankedSentence}</div>
                      {showKana && (currentQ as FillBlankQ).kana && <div className="text-sm font-medium text-slate-500 font-mono mb-2">{(currentQ as FillBlankQ).kana}</div>}
                    </>
                  ) : (
                    <>
                      <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Chọn đáp án đúng</div>
                      <div className="text-2xl font-bold text-slate-800 dark:text-white">{(currentQ as QuizQ).prompt}</div>
                      {showKana && (currentQ as QuizQ).promptSub && <div className="text-sm font-medium text-slate-500 font-mono mt-1">{(currentQ as QuizQ).promptSub}</div>}
                    </>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(currentQ as QuizQ | FillBlankQ).options.map((opt, i) => {
                    const isSel = quizSelected === opt.id;
                    const isCorrect = opt.id === (currentQ as QuizQ | FillBlankQ).correctId;
                    let stateClass = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-indigo-400';
                    if (blitzPaused) {
                      if (isCorrect) stateClass = 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300';
                      else if (isSel) stateClass = 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300';
                      else stateClass = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 opacity-50';
                    }
                    return (
                      <button key={opt.id} disabled={blitzPaused}
                        onClick={() => { setQuizSelected(opt.id); setQuizCorrect(isCorrect); triggerResult(isCorrect); }}
                        className={`p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group ${stateClass}`}>
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                            {blitzPaused && isCorrect ? <CheckCircle2 size={20} className="text-emerald-500" /> : blitzPaused && isSel ? <XCircle size={20} className="text-red-500" /> : <span className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400">{i+1}</span>}
                          </div>
                          <div>
                            <div className="font-bold text-base leading-snug">{opt.label}</div>
                            {showKana && opt.subLabel && <div className="text-xs font-medium opacity-70 mt-0.5">{opt.subLabel}</div>}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {blitzPaused && quizCorrect === false && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl text-sm text-amber-800 dark:text-amber-300">
                    <div className="flex gap-2 font-bold mb-1"><AlertTriangle size={16} /> Lưu ý:</div>
                    {(currentQ as QuizQ | FillBlankQ).type === 'fill_blank' && <div className="mb-2 italic">{(currentQ as FillBlankQ).fullSentence}</div>}
                    <div>{(currentQ as QuizQ | FillBlankQ).caution}</div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── FLASHCARD ──────────────────────────────────────────────────── */}
            {currentQ.type === 'flashcard' && (
              <div className="flex flex-col h-full max-w-sm mx-auto items-center justify-center w-full">
                <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">Lật thẻ ghi nhớ</div>
                <div className="w-full aspect-[4/3] perspective-1000">
                  <motion.div
                    className="w-full h-full relative preserve-3d cursor-pointer"
                    animate={{ rotateY: flashFlipped ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    onClick={() => { if (!blitzPaused) setFlashFlipped(!flashFlipped); }}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
                      <div className="text-3xl font-bold text-slate-800 dark:text-white">{(currentQ as FlashQ).front}</div>
                      {showKana && (currentQ as FlashQ).frontSub && <div className="text-base text-slate-500 mt-2 font-mono">{(currentQ as FlashQ).frontSub}</div>}
                      <div className="absolute bottom-4 text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">BẤM ĐỂ LẬT</div>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl p-6 shadow-xl border border-indigo-200 dark:border-indigo-800/50 flex flex-col items-center justify-center text-center" style={{ transform: 'rotateY(180deg)' }}>
                      <div className="text-2xl font-bold text-indigo-800 dark:text-indigo-200">{(currentQ as FlashQ).back}</div>
                      {showKana && (currentQ as FlashQ).backSub && <div className="text-sm text-indigo-500 mt-2 font-mono">{(currentQ as FlashQ).backSub}</div>}
                    </div>
                  </motion.div>
                </div>
                <div className={`flex gap-3 w-full mt-6 transition-opacity ${flashFlipped && !blitzPaused ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <button onClick={() => advance(false)} className="flex-1 py-4 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 text-red-600 font-bold rounded-2xl transition-colors">Chưa nhớ (1)</button>
                  <button onClick={() => advance(true)} className="flex-1 py-4 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-200 text-emerald-600 font-bold rounded-2xl transition-colors">Nhớ rồi (2)</button>
                </div>
              </div>
            )}

            {/* ── ERROR DETECT ───────────────────────────────────────────────── */}
            {currentQ.type === 'error' && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 text-center relative">
                  {blitzPaused && <div className="absolute inset-0 z-20 pointer-events-none" />}
                  <div className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-4">Câu này sai ngữ pháp hay đúng?</div>
                  <div className="text-xl leading-loose text-slate-800 dark:text-white">
                    {renderHighlightedSentence((currentQ as ErrorQ).isCorrect ? (currentQ as ErrorQ).correctSentence : (currentQ as ErrorQ).wrongSentence, blitzPaused ? (errorCorrect ? 'success' : 'fail') : 'idle')}
                  </div>
                  {showKana && (currentQ as ErrorQ).kana && <div className="text-sm text-slate-500 mt-3 font-mono">{(currentQ as ErrorQ).kana}</div>}
                </div>
                {!blitzPaused ? (
                  <div className="flex gap-4">
                    <button onClick={() => { const ok = (currentQ as ErrorQ).isCorrect === true; setErrorSelected(true); setErrorCorrect(ok); triggerResult(ok); }} className="flex-1 py-5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/40 border-2 border-emerald-300 dark:border-emerald-700 text-emerald-600 font-bold rounded-2xl flex items-center justify-center gap-2 text-lg active:scale-95"><CheckCircle2/> ĐÚNG (1)</button>
                    <button onClick={() => { const ok = (currentQ as ErrorQ).isCorrect === false; setErrorSelected(false); setErrorCorrect(ok); triggerResult(ok); }} className="flex-1 py-5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border-2 border-red-300 dark:border-red-700 text-red-600 font-bold rounded-2xl flex items-center justify-center gap-2 text-lg active:scale-95"><XCircle/> SAI (2)</button>
                  </div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl p-5 border-2 ${errorCorrect ? 'bg-emerald-50 border-emerald-400 dark:bg-emerald-900/20' : 'bg-red-50 border-red-400 dark:bg-red-900/20'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {errorCorrect ? <><CheckCircle2 className="text-emerald-500"/><span className="font-bold text-emerald-700 dark:text-emerald-400">Phán đoán chuẩn xác!</span></> : <><XCircle className="text-red-500"/><span className="font-bold text-red-700 dark:text-red-400">Rất tiếc, bạn đã nhầm!</span></>}
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 rounded-xl p-3 mb-2">
                      <div className="text-xs font-bold text-slate-500 mb-1 uppercase">Câu đúng phải là:</div>
                      <div className="text-base">{renderHighlightedSentence((currentQ as ErrorQ).correctSentence, 'idle')}</div>
                    </div>
                    <div className="flex gap-2 text-sm text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
                      <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                      <div><span className="font-bold">{(currentQ as ErrorQ).structure}:</span> {(currentQ as ErrorQ).caution}</div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── MATCHING ───────────────────────────────────────────────────── */}
            {currentQ.type === 'matching' && (
              <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                <MatchingMini q={currentQ as MatchQ} showKana={showKana} onDone={(c, t) => advance(true, 1, Math.max(0, c * 5 - (t - c) * 2))} />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Footer hint & next button */}
      <div className="px-4 py-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between min-h-[64px]">
        {!blitzPaused ? (
          <KbHints type={currentQ.type} />
        ) : (
          <div className="text-slate-500 text-sm font-medium flex items-center gap-2">
            Tự động chuyển sau <span className="font-black text-indigo-500">{countdown}s</span>...
          </div>
        )}
        <AnimatePresence>
          {blitzPaused && (
            <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              onClick={commitAdvance} className="ml-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm flex items-center gap-1 shadow-md">
              Tiếp tục <ArrowLeft size={14} className="rotate-180" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
"""

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Written GrammarFullRun.tsx to {out_path}")
