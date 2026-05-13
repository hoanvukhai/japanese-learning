// src/pages/Practice/KeigoDashboard.tsx
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Keyboard, CheckSquare, Zap } from 'lucide-react';
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
    },
    { 
      name: lang === 'en' ? 'Typing Practice' : 'Nhập Liệu (Typing)', 
      path: '/practice/keigo/typing', 
      icon: Keyboard, 
      description: lang === 'en' ? 'Type words/sentences to practice spelling' : 'Gõ lại từ/câu để luyện nhớ mặt chữ và cách viết', 
      color: 'text-indigo-500',
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      border: 'hover:border-indigo-500',
      badge: t.soonBadge,
      disabled: true 
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/practice')} 
          className="group flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-semibold mb-8 transition-colors bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md"
        >
          <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          {t.back}
        </motion.button>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight mb-2 flex items-center transition-colors">
              {t.title} <Zap className="ml-3 text-yellow-400 h-8 w-8 fill-yellow-400" />
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 transition-colors">{t.desc}</p>
          </div>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col space-y-5"
        >
          {gameModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <motion.div variants={item} key={mode.name}>
                <Link
                  to={mode.disabled ? '#' : mode.path}
                  className={`
                    group flex items-center p-5 sm:p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 transition-all duration-200
                    ${mode.disabled 
                      ? 'border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50 grayscale-[0.5]' 
                      : `border-slate-200 dark:border-slate-700 ${mode.border} hover:shadow-lg hover:-translate-y-1 hover:border-b-[6px] active:border-b-2 active:translate-y-0`
                    }
                  `}
                >
                  <div className={`flex-shrink-0 p-4 rounded-2xl ${mode.bg} ${mode.color} mr-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1 transition-colors">{mode.name}</h3>
                      {mode.badge && (
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          mode.disabled
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}>
                          {mode.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base transition-colors">{mode.description}</p>
                  </div>
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