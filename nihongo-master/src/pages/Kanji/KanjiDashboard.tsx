import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Layers, Type, CheckSquare, GitMerge } from 'lucide-react';
import { kanjiN3 } from '../../data/kanjiN3';

export default function KanjiDashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const playModes = [
    {
      id: 'flashcard',
      name: 'Lật thẻ',
      path: '/kanji/flashcard',
      icon: Layers,
      desc: 'Luyện phản xạ nhớ mặt chữ Kanji, Âm Hán Việt và từ vựng đi kèm.',
      color: 'text-violet-500 dark:text-violet-400',
      bgLight: 'bg-violet-50 dark:bg-violet-900/30',
      borderColor: 'hover:border-violet-300 dark:hover:border-violet-500',
    },
    {
      id: 'quiz',
      name: 'Trắc nghiệm',
      path: '/kanji/quiz',
      icon: CheckSquare,
      desc: 'Chọn đáp án đúng về ý nghĩa, cách đọc hoặc chữ Hán tương ứng.',
      color: 'text-emerald-500 dark:text-emerald-400',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/30',
      borderColor: 'hover:border-emerald-300 dark:hover:border-emerald-500',
    },
    {
      id: 'typing',
      name: 'Nhập chữ',
      path: '/kanji/typing',
      icon: Type,
      desc: 'Luyện gõ chính xác cách đọc (Hiragana) của từ chứa Kanji.',
      color: 'text-amber-500 dark:text-amber-400',
      bgLight: 'bg-amber-50 dark:bg-amber-900/30',
      borderColor: 'hover:border-amber-300 dark:hover:border-amber-500',
    },
    {
      id: 'matching',
      name: 'Nối chữ',
      path: '/kanji/matching',
      icon: GitMerge,
      desc: 'Trò chơi phản xạ ghép nối chữ Kanji gốc với Âm Hán Việt tương ứng.',
      color: 'text-blue-500 dark:text-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-900/30',
      borderColor: 'hover:border-blue-300 dark:hover:border-blue-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center flex flex-col items-center">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-4">
            ⛩️ Chữ Hán (Kanji)
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg">
            Học Kanji qua thẻ ghi nhớ và các bài tập trắc nghiệm, gõ chữ phản xạ nhanh.
          </p>
          
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                {kanjiN3.length} Kanji có sẵn
              </span>
            </div>
            
            <Link 
              to="/kanji/study" 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-md transition-all duration-200"
            >
              <BookOpen size={16} />
              Học lý thuyết Kanji
            </Link>
          </div>
        </header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
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
