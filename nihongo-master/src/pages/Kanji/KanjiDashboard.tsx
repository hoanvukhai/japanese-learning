import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Layers, Type, CheckSquare, GitMerge, ShieldAlert } from 'lucide-react';
import { kanjiN3 } from '../../data/kanjiN3';
import { useSettings } from '../../context/global/useSettings';
import { ArrowLeft } from 'lucide-react';

export default function KanjiDashboard() {
  const navigate = useNavigate();
  const { language } = useSettings();
  const lang = (language ?? 'vi') as 'vi' | 'en';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const t = {
    vi: {
      title: '⛩️ Chữ Hán (Kanji)',
      subtitle: 'Học Kanji qua thẻ ghi nhớ và các bài tập trắc nghiệm, gõ chữ phản xạ nhanh.',
      available: 'Kanji có sẵn',
      studyBtn: 'Học lý thuyết Kanji',
    },
    en: {
      title: '⛩️ Kanji',
      subtitle: 'Study Kanji through flashcards and quizzes, typing reflex exercises.',
      available: 'Kanji available',
      studyBtn: 'Study Kanji theory',
    },
  }[lang];

  const playModes = [
    {
      id: 'flashcard',
      name: lang === 'en' ? 'Flashcard' : 'Lật thẻ',
      path: '/practice/kanji/flashcard',
      icon: Layers,
      desc: lang === 'en'
        ? 'Reflex training to remember Kanji, Sino-Vietnamese reading and related vocabulary.'
        : 'Luyện phản xạ nhớ mặt chữ Kanji, Âm Hán Việt và từ vựng đi kèm.',
      color: 'text-amber-600 dark:text-amber-400',
      bgLight: 'bg-amber-50 dark:bg-amber-900/30',
      borderColor: 'hover:border-amber-400 dark:hover:border-amber-500',
    },
    {
      id: 'quiz',
      name: lang === 'en' ? 'Quiz' : 'Trắc nghiệm',
      path: '/practice/kanji/quiz',
      icon: CheckSquare,
      desc: lang === 'en'
        ? 'Choose the correct answer about meaning, reading or corresponding Kanji.'
        : 'Chọn đáp án đúng về ý nghĩa, cách đọc hoặc chữ Hán tương ứng.',
      color: 'text-orange-500 dark:text-orange-400',
      bgLight: 'bg-orange-50 dark:bg-orange-900/30',
      borderColor: 'hover:border-orange-300 dark:hover:border-orange-500',
    },
    {
      id: 'typing',
      name: lang === 'en' ? 'Typing' : 'Nhập chữ',
      path: '/practice/kanji/typing',
      icon: Type,
      desc: lang === 'en'
        ? 'Practice typing the correct Hiragana reading of Kanji-containing words.'
        : 'Luyện gõ chính xác cách đọc (Hiragana) của từ chứa Kanji.',
      color: 'text-amber-500 dark:text-amber-400',
      bgLight: 'bg-amber-50 dark:bg-amber-900/30',
      borderColor: 'hover:border-amber-300 dark:hover:border-amber-500',
    },
    {
      id: 'matching',
      name: lang === 'en' ? 'Matching' : 'Nối chữ',
      path: '/practice/kanji/matching',
      icon: GitMerge,
      desc: lang === 'en'
        ? 'Reflex game: match original Kanji with its Sino-Vietnamese reading.'
        : 'Trò chơi phản xạ ghép nối chữ Kanji gốc với Âm Hán Việt tương ứng.',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgLight: 'bg-yellow-50 dark:bg-yellow-900/30',
      borderColor: 'hover:border-yellow-400 dark:hover:border-yellow-500',
    },
    {
      id: 'errordetect',
      name: lang === 'en' ? 'Error Detect' : 'Tìm lỗi sai',
      path: '/practice/kanji/errordetect',
      icon: ShieldAlert,
      desc: lang === 'en'
        ? 'Find incorrectly paired Kanji readings.'
        : 'Phát hiện cách đọc Kanji bị sai.',
      color: 'text-amber-500 dark:text-amber-400',
      bgLight: 'bg-amber-100 dark:bg-amber-900/30',
      borderColor: 'hover:border-amber-400 dark:hover:border-amber-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
              <button
                onClick={() => navigate('/practice')}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-sm font-bold rounded-full">
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
            <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {kanjiN3.length} {t.available}
              </span>
            </div>
            <Link 
              to="/study/kanji" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <BookOpen size={16} />
              {t.studyBtn}
            </Link>
          </div>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {playModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <motion.div variants={itemVariants} key={mode.id}>
                <Link to={mode.path} className="block group h-full">
                  <div className={`bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-150 dark:border-slate-700/80 ${mode.borderColor} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col items-center text-center`}>
                    <div className={`w-16 h-16 ${mode.bgLight} rounded-2xl flex items-center justify-center ${mode.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                      {mode.name}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      {mode.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
