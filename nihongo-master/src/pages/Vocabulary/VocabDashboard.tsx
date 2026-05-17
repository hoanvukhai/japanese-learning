// src/pages/Vocabulary/VocabDashboard.tsx
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Layers, ListChecks, GitMerge, Keyboard, Lock } from 'lucide-react';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } }
};

const modes = [
  {
    id: 'flashcard',
    name: 'Lật thẻ',
    path: '/vocabulary/flashcard',
    icon: Layers,
    desc: 'Xem từ và nghĩa qua thẻ ghi nhớ, chọn đúng/sai để lọc từ khó',
    color: 'text-violet-500',
    bgLight: 'bg-violet-100 dark:bg-violet-900/30',
    border: 'hover:border-violet-500',
    disabled: false,
  },
  {
    id: 'quiz',
    name: 'Trắc nghiệm',
    path: '/vocabulary/quiz',
    icon: ListChecks,
    desc: '4 đáp án — 2 chế độ: Kanji→Nghĩa hoặc Nghĩa→Kanji',
    color: 'text-blue-500',
    bgLight: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'hover:border-blue-500',
    disabled: false,
  },
  {
    id: 'matching',
    name: 'Nối từ',
    path: '/vocabulary/matching',
    icon: GitMerge,
    desc: 'Nối từ Nhật với nghĩa tiếng Việt tương ứng',
    color: 'text-emerald-500',
    bgLight: 'bg-emerald-100 dark:bg-emerald-900/30',
    border: 'hover:border-emerald-500',
    disabled: false,
  },
  {
    id: 'typing',
    name: 'Nhập liệu',
    path: '/vocabulary/typing',
    icon: Keyboard,
    desc: 'Nhìn nghĩa, gõ Hiragana tương ứng — luyện phản xạ viết',
    color: 'text-orange-500',
    bgLight: 'bg-orange-100 dark:bg-orange-900/30',
    border: 'hover:border-orange-500',
    disabled: false,
  }
];

export default function VocabDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-sm font-bold rounded-full">
              JLPT N3
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-3">
            Luyện Từ Vựng
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            Chọn chế độ luyện tập phù hợp với bạn hôm nay.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {modes.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div variants={item} key={mod.id} className="h-full">
                <Link
                  to={mod.disabled ? '#' : mod.path}
                  className={`group relative flex flex-col h-full bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 transition-all duration-200 ${mod.disabled
                      ? 'border-slate-200 dark:border-slate-700 opacity-55 cursor-not-allowed grayscale-[0.4]'
                      : `border-slate-200 dark:border-slate-700 ${mod.border} hover:shadow-xl hover:-translate-y-1 hover:border-b-[6px] active:border-b-2 active:translate-y-0`
                    }`}
                >
                  {mod.disabled && (
                    <div className="absolute top-4 right-4 flex items-center bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold px-3 py-1.5 rounded-full">
                      <Lock className="w-3 h-3 mr-1" />
                      Sắp ra mắt
                    </div>
                  )}
                  <div className={`inline-flex p-4 rounded-xl ${mod.bgLight} ${mod.color} mb-5 w-fit group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{mod.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed flex-grow">{mod.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
