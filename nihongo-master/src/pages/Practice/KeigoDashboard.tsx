// src/pages/Practice/KeigoDashboard.tsx
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckSquare } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { useSettings } from '../../context/global/useSettings';

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const KeigoDashboard = () => {
  const navigate = useNavigate();
  const { language } = useSettings();
  const lang = (language ?? 'vi') as 'vi' | 'en';

  const t = {
    vi: {
      back: 'Quay lại',
      title: 'Luyện Kính Ngữ',
      desc: 'Chọn một chế độ chơi để bắt đầu cày cuốc.',
      newBadge: '🔥 Mới',
      soonBadge: 'Sắp ra mắt'
    },
    en: {
      back: 'Back',
      title: 'Keigo Practice',
      desc: 'Choose a game mode to start grinding.',
      newBadge: '🔥 New',
      soonBadge: 'Coming soon'
    }
  }[lang];

  const gameModes = [
    {
      name: lang === 'en' ? 'Flashcards' : 'Lật Thẻ (Flashcards)',
      path: '/practice/keigo/flashcards',
      icon: BookOpen,
      description: lang === 'en' ? 'Quick review with 2-sided flashcards: Sonkei / Kenjou / Teinei' : 'Ôn tập nhanh qua thẻ ghi nhớ 2 mặt: Tôn kính / Khiêm nhường / Lịch sự',
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'hover:border-blue-500',
      badge: null,
      disabled: false
    },
    {
      name: lang === 'en' ? '⚔️ Keigo Quest' : '⚔️ Keigo Quest (Nhập Vai)',
      path: '/practice/keigo/quest',
      icon: CheckSquare,
      description: lang === 'en' ? 'Real scenarios: Boss, Client, Colleague. Choose the right honorifics to score!' : 'Tình huống thực tế: Sếp, Khách hàng, Đồng nghiệp. Chọn kính ngữ đúng để ghi điểm!',
      color: 'text-rose-500',
      bg: 'bg-rose-100 dark:bg-rose-900/30',
      border: 'hover:border-rose-500',
      badge: t.newBadge,
      disabled: false
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 px-4 py-6 md:px-8 md:py-8 font-sans transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <button
                onClick={() => navigate('/practice')}
                className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
              <span className="px-2.5 py-0.5 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                JLPT N4-N3
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-1">
              {t.title}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t.desc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/study/keigo"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-sm px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <BookOpen size={14} />
              Học Kính Ngữ
            </Link>
          </div>
        </header>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {gameModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <motion.div variants={item} key={mode.name} className="h-full">
                <Link
                  to={mode.disabled ? '#' : mode.path}
                  className={`group flex flex-col h-full bg-white dark:bg-slate-800 rounded-3xl p-6 border-2 transition-all duration-200 shadow-sm ${mode.disabled
                      ? 'border-slate-100 dark:border-slate-700 opacity-60 cursor-not-allowed'
                      : `border-slate-100 dark:border-slate-700 ${mode.border} hover:shadow-xl hover:-translate-y-1 hover:border-b-[6px] active:border-b-2 active:translate-y-0`
                    }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl ${mode.bg} ${mode.color} group-hover:scale-110 transition-transform`}>
                      <Icon size={32} strokeWidth={2.5} />
                    </div>
                    {mode.badge && (
                      <span className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-full">
                        {mode.badge}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">
                    {mode.name}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed flex-grow">
                    {mode.description}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default KeigoDashboard;