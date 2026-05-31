// src/pages/Vocabulary/VocabStudy.tsx
// Học theo bài — xem toàn bộ từ vựng có ví dụ, kiểu từ, level
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, Gamepad2 } from 'lucide-react';
import { vocabularyN3, getN3Lessons } from '../../data/vocabularyN3';
import type { Word } from '../../types';

const typeLabel = (w: Word) => {
  switch (w.type) {
    case 'verb': return `Động từ N${w.group ?? '?'}`;
    case 'adj_i': return 'Tính từ I';
    case 'adj_na': return 'Tính từ NA';
    case 'noun': return 'Danh từ';
    case 'adv': return 'Trạng từ';
    case 'expression': return 'Cụm từ';
    default: return w.type;
  }
};

const typeColor = (w: Word) => {
  switch (w.type) {
    case 'verb': return 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400';
    case 'adj_i': return 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400';
    case 'adj_na': return 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-400';
    case 'noun': return 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400';
    case 'adv': return 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400';
    case 'expression': return 'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400';
    default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
  }
};

function WordCard({ word }: { word: Word }) {
  const [expanded, setExpanded] = useState(false);
  const meaning = typeof word.meaning === 'object' ? word.meaning.vi : word.meaning;

  return (
    <motion.div
      layout
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div
        className="p-5 flex items-start gap-4 cursor-pointer"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 mb-1 flex-wrap">
            <span className="text-2xl font-bold text-slate-800 dark:text-white">
              {word.kanji}
              {word.alt_kanji && <span className="text-lg font-normal text-slate-500 dark:text-slate-400 ml-2">({word.alt_kanji})</span>}
            </span>
            <span className="text-slate-400 dark:text-slate-500 text-sm">{word.hiragana}</span>
          </div>
          <div className="text-slate-600 dark:text-slate-300 font-medium">{meaning}</div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${typeColor(word)}`}>
            {typeLabel(word)}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">{word.level}</span>
        </div>
        <div className="text-slate-400 dark:text-slate-500 ml-2 flex-shrink-0">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </div>

      {expanded && word.examples && word.examples.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700 pt-4"
        >
          <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Ví dụ</div>
          <div className="space-y-3">
            {word.examples.map((ex, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                <div className="text-slate-700 dark:text-slate-200 font-medium mb-1">{ex.jp}</div>
                <div className="text-slate-500 dark:text-slate-400 text-sm">{ex.vi}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function VocabStudy() {
  const lessons = getN3Lessons();
  const [selectedLesson, setSelectedLesson] = useState(lessons[0] ?? 'all');

  const words = selectedLesson === 'all'
    ? vocabularyN3
    : vocabularyN3.filter(w => w.lesson === selectedLesson);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header — template chuẩn */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <Link to="/study" className="inline-flex items-center gap-2 text-slate-500 hover:text-rose-600 transition-colors mb-3">
              <ArrowLeft size={18} /> Quay lại Học Tập
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-1">📚 Học Từ Vựng</h1>
            <p className="text-slate-500 dark:text-slate-400">Nhấn vào từ để xem ví dụ và cách dùng.</p>
          </div>
          <div className="flex flex-wrap justify-end items-center gap-3">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-full font-medium text-sm shadow-sm">
              {words.length} / {vocabularyN3.length} từ
            </div>
            <Link
              to="/practice/vocabulary"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Gamepad2 size={16} />
              Thực hành ngay
            </Link>
          </div>
        </div>

        {/* Lesson tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setSelectedLesson('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedLesson === 'all'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-rose-400'
              }`}
          >
            Tất cả ({vocabularyN3.length})
          </button>
          {lessons.map(l => (
            <button
              key={l}
              onClick={() => setSelectedLesson(l)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedLesson === l
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-rose-400'
                }`}
            >
              {l.split(':')[0]} ({vocabularyN3.filter(w => w.lesson === l).length})
            </button>
          ))}
        </div>

        {/* Word list — 2 columns on wide screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {words.map(word => (
            <WordCard key={word.id} word={word} />
          ))}
        </div>
      </div>
    </div>
  );
}
