// src/pages/Grammar/GrammarStudy.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Volume2, ChevronDown, ChevronUp, AlertTriangle, Gamepad2, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { grammarN3, getN3GrammarLessons } from '../../data/grammarN3';
import type { GrammarItem } from '../../types';
import { useSettings } from '../../context/global/useSettings';

function GrammarCard({ item }: { item: GrammarItem }) {
  const [expanded, setExpanded] = useState(false);
  const { language } = useSettings();

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-4 p-6">
        {/* Lesson badge */}
        <div className="flex-shrink-0 mt-1">
          <span className="text-xs font-bold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-2.5 py-1 rounded-full">
            {item.lesson}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-1 leading-tight">
                {item.structure}
              </h3>
              <p className="text-base text-teal-600 dark:text-teal-400 font-semibold">
                {item.meaning[language as 'vi' | 'en'] || item.meaning.vi}
              </p>
            </div>
            <button
              onClick={() => playAudio(item.structure.replace(/〜|[/（）()]/g, ' ').trim())}
              className="flex-shrink-0 p-2 text-slate-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-full transition-all"
              title="Phát âm"
            >
              <Volume2 size={20} />
            </button>
          </div>

          {/* Group tag */}
          <span className="mt-2 inline-flex items-center text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full">
            {item.group}
          </span>
        </div>
      </div>

      {/* Formation */}
      <div className="px-6 pb-4">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cách thành lập</div>
        <div className="space-y-1.5">
          {item.formation.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 text-xs font-bold flex items-center justify-center mt-0.5">
                {i + 1}
              </span>
              <code className="text-sm font-mono text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg flex-1">
                {f}
              </code>
            </div>
          ))}
        </div>
      </div>

      {/* Caution box */}
      <div className="px-6 pb-4">
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4">
          <AlertTriangle size={18} className="flex-shrink-0 text-amber-500 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">{item.caution[language as 'vi' | 'en'] || item.caution.vi}</p>
        </div>
      </div>

      {/* Expand/Collapse examples */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
      >
        <span>📖 {item.examples.length} câu ví dụ</span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4">
              {item.examples.map((ex, i) => (
                <div key={i} className="group relative pl-4 border-l-2 border-teal-300 dark:border-teal-700">
                  <button
                    onClick={() => playAudio(ex.jp)}
                    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-teal-500 transition-all rounded-full"
                  >
                    <Volume2 size={14} />
                  </button>
                  <div className="text-base font-medium text-slate-800 dark:text-white mb-1">{ex.jp}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{ex.vi}</div>
                  {ex.en && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 italic">{ex.en}</div>}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GrammarStudy() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('all');
  const { language } = useSettings();

  const lessons = getN3GrammarLessons();

  const filtered = grammarN3.filter(g => {
    const matchLesson = selectedLesson === 'all' || g.lesson === selectedLesson;
    const q = searchTerm.toLowerCase();
    const meaningText = g.meaning[language as 'vi' | 'en'] || g.meaning.vi || '';
    const cautionText = g.caution[language as 'vi' | 'en'] || g.caution.vi || '';
    const matchSearch =
      !q ||
      g.structure.toLowerCase().includes(q) ||
      meaningText.toLowerCase().includes(q) ||
      cautionText.toLowerCase().includes(q) ||
      g.group.toLowerCase().includes(q) ||
      g.examples.some(ex => ex.jp.includes(q) || ex.vi.toLowerCase().includes(q));
    return matchLesson && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">

        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <Link to="/study" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 mb-4 transition-colors font-medium">
              <ArrowLeft size={18} /> Quay lại
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">
              <BookOpen size={28} className="inline-block text-teal-500 mr-2 -mt-1" />
              Học Ngữ pháp
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Danh sách các cấu trúc ngữ pháp N3 phân theo bài học hoặc nhóm bẫy JLPT.
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end items-center gap-3">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-full font-medium text-sm shadow-sm">
              Đang chọn: {filtered.length} mẫu
            </div>
            <Link
              to="/practice/grammar"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Gamepad2 size={16} />
              Thực hành ngay
            </Link>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8 space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm cấu trúc, nghĩa, ví dụ..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-teal-500 dark:text-white transition-colors text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedLesson('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedLesson === 'all'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
            >
              Tất cả ({grammarN3.length})
            </button>
            {lessons.map(l => (
              <button
                key={l}
                onClick={() => setSelectedLesson(l)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedLesson === l
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
              >
                {l} ({grammarN3.filter(g => g.lesson === l).length})
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="space-y-5">
          {filtered.map(item => (
            <GrammarCard key={item.id} item={item} />
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Không tìm thấy mẫu nào</h3>
              <p className="text-slate-500">Hãy thử thay đổi từ khóa hoặc bộ lọc.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
