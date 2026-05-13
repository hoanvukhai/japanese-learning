// src/pages/Practice/KeigoFlashcards.tsx
// ============================================================
// Trang Luyện Kính Ngữ – Flashcard Mode
// ============================================================
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Volume2, RotateCcw, ChevronRight, ChevronLeft,
  Shuffle, Settings2, BookOpen, Crown, Heart, Star,
} from 'lucide-react';
import { keigoVerbs } from '../../data/keigoDb';
import type { KeigoVerb, KeigoFormKey } from '../../types/keigo';
import { generateSonkei, generateKenjou, generateTeinei } from '../../lib/keigoEngine';
import { useSettings } from '../../context/global/useSettings';

// ── Helpers ──────────────────────────────────────────────────
const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

type KeigoFormSetting = 'sonkei' | 'kenjou' | 'teinei' | 'all';

// ── Badge colors ──────────────────────────────────────────────
const FORM_META: Record<KeigoFormKey, { label: string; labelEn: string; color: string; icon: React.ReactNode }> = {
  sonkei: {
    label: '尊敬語 (Tôn kính)',
    labelEn: '尊敬語 (Sonkei)',
    color: 'from-violet-500 to-purple-600',
    icon: <Crown size={16} className="text-violet-300" />,
  },
  kenjou: {
    label: '謙譲語 (Khiêm nhường)',
    labelEn: '謙譲語 (Kenjou)',
    color: 'from-blue-500 to-indigo-600',
    icon: <Heart size={16} className="text-blue-300" />,
  },
  teinei: {
    label: '丁寧語 (Lịch sự)',
    labelEn: '丁寧語 (Teinei)',
    color: 'from-emerald-500 to-teal-600',
    icon: <Star size={16} className="text-emerald-300" />,
  },
};

// ── Keigo Card Component ──────────────────────────────────────
interface KeigoCardProps {
  verb: KeigoVerb;
  formKey: KeigoFormKey;
  isFlipped: boolean;
  language: 'vi' | 'en';
  onFlip: () => void;
}

function KeigoCard({ verb, formKey, isFlipped, language, onFlip }: KeigoCardProps) {
  const meta = FORM_META[formKey];
  const result = formKey === 'sonkei'
    ? generateSonkei(verb)
    : formKey === 'kenjou'
      ? generateKenjou(verb)
      : generateTeinei(verb);

  const playAudio = useCallback((e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (window.speechSynthesis.speaking) { window.speechSynthesis.cancel(); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  }, []);

  const isNone = result === '(なし)';

  return (
    <div
      className="relative w-full cursor-pointer select-none"
      style={{ perspective: '1200px', minHeight: '22rem' }}
      onClick={onFlip}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d', minHeight: '22rem' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col p-5 shadow-xl overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Gradient top bar */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r ${meta.color}`} />

          {/* Header */}
          <div className="flex items-start justify-between mt-2 mb-4">
            <div className="flex flex-col gap-1">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${meta.color} text-white text-xs font-bold shadow-sm`}>
                {meta.icon}
                {language === 'en' ? meta.labelEn : meta.label}
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1">
                {language === 'en' ? 'Tap to reveal' : 'Chạm để lật xem đáp án'}
              </span>
            </div>
            <button
              onClick={(e) => playAudio(e, verb.kanji)}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-700 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-slate-200 dark:border-slate-600"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {/* Main word */}
          <div className="flex flex-col items-center justify-center flex-1 gap-3 py-4">
            <span className="text-slate-400 dark:text-slate-500 text-sm font-medium">
              {verb.hiragana}
            </span>
            <h2 className="text-5xl sm:text-6xl font-bold text-slate-800 dark:text-white text-center leading-tight break-all px-2">
              {verb.kanji}
            </h2>
            <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 text-center">
              {language === 'en' ? verb.meaning.en : verb.meaning.vi}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-center items-center gap-2 text-slate-400 dark:text-slate-500 text-sm animate-pulse mt-2">
            <RotateCcw size={14} />
            <span>{language === 'en' ? 'Tap to flip' : 'Chạm để lật thẻ'}</span>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          className={`absolute inset-0 w-full rounded-2xl flex flex-col p-5 shadow-xl overflow-hidden bg-gradient-to-br ${
            isNone
              ? 'from-slate-700 to-slate-800'
              : formKey === 'sonkei'
                ? 'from-violet-600 to-purple-700'
                : formKey === 'kenjou'
                  ? 'from-blue-600 to-indigo-700'
                  : 'from-emerald-600 to-teal-700'
          }`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col gap-1">
              <span className="text-white/70 text-xs font-medium">
                {verb.hiragana} → {language === 'en' ? meta.labelEn : meta.label}
              </span>
              <span className="text-white text-base font-bold">
                {verb.kanji} ({language === 'en' ? verb.meaning.en : verb.meaning.vi})
              </span>
            </div>
            <button
              onClick={(e) => playAudio(e, result)}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {/* Answer */}
          <div className="flex flex-col items-center justify-center flex-1 gap-4 py-4">
            {isNone ? (
              <div className="text-white/60 text-xl italic">(không có dạng này)</div>
            ) : (
              <>
                <div className="text-4xl sm:text-5xl font-bold text-yellow-300 text-center leading-tight break-all px-2">
                  {result}
                </div>
                {/* Rule type badge */}
                <div className="px-3 py-1 rounded-full bg-white/20 text-white/90 text-xs font-bold">
                  {verb[formKey].type === 'special'
                    ? (language === 'en' ? '⚡ Special form' : '⚡ Từ đặc biệt')
                    : (language === 'en' ? '📐 Rule-based' : '📐 Theo quy tắc')}
                </div>
              </>
            )}
          </div>

          {/* Note */}
          {verb.note && (
            <div className="bg-white/10 rounded-xl p-3 text-white/80 text-xs leading-relaxed mt-2">
              <BookOpen size={12} className="inline mr-1 opacity-70" />
              {language === 'en' ? verb.note.en : verb.note.vi}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function KeigoFlashcards() {
  const navigate = useNavigate();
  const { language } = useSettings();

  // Settings
  const [formSetting, setFormSetting] = useState<KeigoFormSetting>('all');
  const [showSettings, setShowSettings] = useState(false);

  // Queue state
  const [queue, setQueue] = useState<Array<{ verb: KeigoVerb; formKey: KeigoFormKey }>>([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Build queue
  const buildQueue = useCallback(() => {
    const allKeys: KeigoFormKey[] = ['sonkei', 'kenjou', 'teinei'];
    const keys: KeigoFormKey[] = formSetting === 'all' ? allKeys : [formSetting];
    const entries: Array<{ verb: KeigoVerb; formKey: KeigoFormKey }> = [];
    keigoVerbs.forEach(verb => {
      keys.forEach(k => {
        entries.push({ verb, formKey: k });
      });
    });
    setQueue(shuffle(entries));
    setIndex(0);
    setIsFlipped(false);
  }, [formSetting]);

  useEffect(() => { buildQueue(); }, [buildQueue]);

  const current = queue[index];

  const goNext = useCallback(() => {
    setDirection(1);
    setIsFlipped(false);
    setTimeout(() => {
      setIndex(prev => (prev + 1 < queue.length ? prev + 1 : 0));
    }, 150);
  }, [queue.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setIsFlipped(false);
    setTimeout(() => {
      setIndex(prev => (prev - 1 >= 0 ? prev - 1 : queue.length - 1));
    }, 150);
  }, [queue.length]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.code === 'Space') { e.preventDefault(); setIsFlipped(p => !p); }
      else if (e.code === 'ArrowRight' || e.code === 'Enter') { e.preventDefault(); goNext(); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  const formOptions: { key: KeigoFormSetting; label: string; labelEn: string; color: string }[] = [
    { key: 'all', label: '🎲 Tất cả', labelEn: '🎲 All', color: 'bg-slate-700 text-white' },
    { key: 'sonkei', label: '👑 Tôn kính', labelEn: '👑 Sonkei', color: 'bg-violet-600 text-white' },
    { key: 'kenjou', label: '🙏 Khiêm nhường', labelEn: '🙏 Kenjou', color: 'bg-blue-600 text-white' },
    { key: 'teinei', label: '✨ Lịch sự', labelEn: '✨ Teinei', color: 'bg-emerald-600 text-white' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col gap-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/practice/keigo')}
            className="group flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-semibold transition-colors"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Quay lại</span>
          </button>

          <button
            onClick={() => setShowSettings(p => !p)}
            className={`p-2 rounded-full border transition-colors ${showSettings
              ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            <Settings2 size={18} />
          </button>
        </div>

        {/* ── Title ── */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            Keigo Flashcards <Crown size={24} className="text-yellow-400 fill-yellow-400" />
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {language === 'en'
              ? 'Master honorific Japanese expressions'
              : 'Luyện kính ngữ tiếng Nhật từ cơ bản đến nâng cao'}
          </p>
        </div>

        {/* ── Settings Panel ── */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm overflow-hidden"
            >
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                {language === 'en' ? 'Form Filter' : 'Lọc theo thể'}
              </p>
              <div className="flex flex-wrap gap-2">
                {formOptions.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setFormSetting(opt.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                      formSetting === opt.key
                        ? `${opt.color} border-transparent shadow-md scale-105`
                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {language === 'en' ? opt.labelEn : opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => { buildQueue(); setShowSettings(false); }}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors"
              >
                <Shuffle size={14} />
                {language === 'en' ? 'Shuffle & Restart' : 'Xáo trộn & Bắt đầu lại'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Progress ── */}
        {queue.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-12 text-right">
              {index + 1}
            </span>
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                style={{ width: `${((index + 1) / queue.length) * 100}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 w-12">
              {queue.length}
            </span>
          </div>
        )}

        {/* ── Card ── */}
        {current ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${current.verb.id}-${current.formKey}-${index}`}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <KeigoCard
                verb={current.verb}
                formKey={current.formKey}
                isFlipped={isFlipped}
                language={language as 'vi' | 'en'}
                onFlip={() => setIsFlipped(p => !p)}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex items-center justify-center h-64 text-slate-400">
            Không có thẻ nào.
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={goPrev}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
            {language === 'en' ? 'Prev' : 'Trước'}
          </button>

          <button
            onClick={() => setIsFlipped(p => !p)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-colors shadow-md"
          >
            <RotateCcw size={18} />
            {isFlipped
              ? (language === 'en' ? 'Front' : 'Mặt trước')
              : (language === 'en' ? 'Answer' : 'Đáp án')}
          </button>

          <button
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            {language === 'en' ? 'Next' : 'Tiếp'}
            <ChevronRight size={20} />
          </button>
        </div>

        {/* ── Keyboard hints ── */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">Space</kbd> {language === 'en' ? 'Flip' : 'Lật'} &nbsp;
          <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">←</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">→</kbd> {language === 'en' ? 'Navigate' : 'Di chuyển'}
        </p>
      </div>
    </div>
  );
}
