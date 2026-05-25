// src/pages/Vocabulary/VocabDashboard.tsx
import { Link, useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Layers, GitMerge, Keyboard, Lock, ArrowLeft, BookOpen, CheckSquare } from 'lucide-react';
import { useSettings } from '../../context/global/useSettings';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } }
};

export default function VocabDashboard() {
  const navigate = useNavigate();
  const { language } = useSettings();
  const lang = (language ?? 'vi') as 'vi' | 'en';

  const t = {
    vi: {
      title: 'Luyện Từ Vựng',
      subtitle: 'Chọn chế độ luyện tập phù hợp với bạn hôm nay.',
      comingSoon: 'Sắp ra mắt',
      studyBtn: 'Học lý thuyết từ vựng',
    },
    en: {
      title: 'Vocabulary Practice',
      subtitle: 'Choose a practice mode that fits you today.',
      comingSoon: 'Coming soon',
      studyBtn: 'Study vocabulary theory',
    },
  }[lang];

  const modes = [
    {
      id: 'flashcard',
      name: lang === 'en' ? 'Flashcard' : 'Lật thẻ',
      path: '/practice/vocabulary/flashcard',
      icon: Layers,
      desc: lang === 'en'
        ? 'See word & meaning on flip cards, mark correct/incorrect to filter hard words'
        : 'Xem từ và nghĩa qua thẻ ghi nhớ, chọn đúng/sai để lọc từ khó',
      color: 'text-violet-500',
      bgLight: 'bg-violet-100 dark:bg-violet-900/30',
      border: 'hover:border-violet-500',
      disabled: false,
    },
    {
      id: 'quiz',
      name: lang === 'en' ? 'Quiz' : 'Trắc nghiệm',
      path: '/practice/vocabulary/quiz',
      icon: CheckSquare,
      desc: lang === 'en'
        ? '4 choices — 2 modes: Kanji→Meaning or Meaning→Kanji'
        : '4 đáp án — 2 chế độ: Kanji→Nghĩa hoặc Nghĩa→Kanji',
      color: 'text-blue-500',
      bgLight: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'hover:border-blue-500',
      disabled: false,
    },
    {
      id: 'matching',
      name: lang === 'en' ? 'Matching' : 'Nối từ',
      path: '/practice/vocabulary/matching',
      icon: GitMerge,
      desc: lang === 'en'
        ? 'Match Japanese words with their Vietnamese meanings'
        : 'Nối từ Nhật với nghĩa tiếng Việt tương ứng',
      color: 'text-emerald-500',
      bgLight: 'bg-emerald-100 dark:bg-emerald-900/30',
      border: 'hover:border-emerald-500',
      disabled: false,
    },
    {
      id: 'typing',
      name: lang === 'en' ? 'Typing' : 'Nhập liệu',
      path: '/practice/vocabulary/typing',
      icon: Keyboard,
      desc: lang === 'en'
        ? 'See the meaning, type the correct Hiragana — reflex writing training'
        : 'Nhìn nghĩa, gõ Hiragana tương ứng — luyện phản xạ viết',
      color: 'text-orange-500',
      bgLight: 'bg-orange-100 dark:bg-orange-900/30',
      border: 'hover:border-orange-500',
      disabled: false,
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
              <button
                onClick={() => navigate('/practice')}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 text-sm font-bold rounded-full">
                JLPT N3
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-3">
              {t.title}
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              {t.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end items-center gap-3">
            <Link
              to="/study/vocabulary"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <BookOpen size={16} />
              {t.studyBtn}
            </Link>
          </div>
        </motion.header>

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
                      {t.comingSoon}
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
