// src/pages/Study.tsx
import { Link } from 'react-router-dom';
import { useSettings } from '../context/global/useSettings';
import { Languages, ALargeSmall, WandSparkles, MessagesSquare, BookMarked, MapPinned } from 'lucide-react';
import { motion } from 'framer-motion';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVar = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export default function Study() {
  const { language } = useSettings();

  const modules = [
    {
      to: '/study/conjugation',
      icon: WandSparkles,
      label: language === 'en' ? 'Conjugation' : 'Học Chia Thể',
      desc: language === 'en' ? 'Master verb & adjective conjugation rules.' : 'Nắm vững quy tắc chia động từ, tính từ.',
      color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'hover:border-blue-500',
    },
    {
      to: '/study/keigo',
      icon: MessagesSquare,
      label: language === 'en' ? 'Keigo' : 'Học Kính Ngữ',
      desc: language === 'en' ? 'Learn polite, honorific and humble forms.' : 'Học cách nói tôn kính, khiêm nhường chuẩn Nhật.',
      color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', border: 'hover:border-green-500',
    },
    {
      to: '/study/grammar',
      icon: BookMarked,
      label: language === 'en' ? 'Grammar' : 'Học Ngữ Pháp',
      desc: language === 'en' ? 'Study N3 grammar structures, formations and JLPT traps.' : 'Học cấu trúc ngữ pháp N3, cách thành lập và bẫy JLPT.',
      color: 'text-teal-600', bg: 'bg-teal-100 dark:bg-teal-900/30', border: 'hover:border-teal-500',
    },
    {
      to: '/study/vocabulary',
      icon: ALargeSmall,
      label: language === 'en' ? 'Vocabulary' : 'Học Từ Vựng',
      desc: language === 'en' ? 'Study vocabulary by lesson with examples.' : 'Học từ vựng theo bài với ví dụ cụ thể.',
      color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30', border: 'hover:border-rose-500',
    },
    {
      to: '/study/kanji',
      icon: Languages,
      label: language === 'en' ? 'Kanji' : 'Học Kanji',
      desc: language === 'en' ? 'Look up Kanji, On/Kun readings and compounds.' : 'Tra cứu chữ Hán, âm On/Kun và từ ghép.',
      color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'hover:border-amber-500',
    },
    {
      to: '/study/roadmap',
      icon: MapPinned,
      label: language === 'en' ? 'Learning Roadmap' : 'Lộ Trình Học',
      desc: language === 'en'
        ? 'Follow a step-by-step path to conquer JLPT N3.'
        : 'Học theo lộ trình từng bước để chinh phục JLPT N3.',
      color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'hover:border-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-4 transition-colors">
            {language === 'en' ? 'Learning Path' : 'Lộ Trình Học Tập'}
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 transition-colors">
            {language === 'en' ? 'Choose what you want to focus on today.' : 'Chọn bài học bạn muốn tập trung hôm nay.'}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full"
        >
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div variants={itemVar} key={mod.to}>
                <Link
                  to={mod.to}
                  className={`group flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 ${mod.border} rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all h-full`}
                >
                  <div className={`p-4 ${mod.bg} ${mod.color} rounded-full mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{mod.label}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{mod.desc}</p>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}