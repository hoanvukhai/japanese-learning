// src/pages/Study.tsx
import { Link } from 'react-router-dom';
import { useSettings } from '../context/global/useSettings';
import { Pen, GraduationCap, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Study() {
  const { language } = useSettings();

  const translations = {
    vi: {
      title: 'Lộ Trình Học Tập',
      description: 'Chọn bài học bạn muốn tập trung hôm nay.',
      conjugation: 'Học Chia Thể',
      conjugationDesc: 'Nắm vững quy tắc chia động từ, tính từ.',
      keigo: 'Học Kính Ngữ',
      keigoDesc: 'Học cách nói tôn kính, khiêm nhường chuẩn Nhật.',
      vocab: 'Học Từ Vựng',
      vocabDesc: 'Học từ vựng theo bài với ví dụ cụ thể.',
    },
    en: {
      title: 'Learning Path',
      description: 'Choose what you want to focus on today.',
      conjugation: 'Conjugation Study',
      conjugationDesc: 'Master rules for verbs and adjectives.',
      keigo: 'Keigo Study',
      keigoDesc: 'Learn proper honorifics and humble forms.',
      vocab: 'Vocabulary Study',
      vocabDesc: 'Study vocabulary by lesson with specific examples.',
    }
  };
  const t = translations[language as keyof typeof translations] || translations.vi;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-4 transition-colors">{t.title}</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 transition-colors">{t.description}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.1}}>
            <Link to="/practice/conjugation" className="group flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl shadow-sm hover:shadow-xl transition-all h-full">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <Pen size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.conjugation}</h2>
              <p className="text-slate-500 dark:text-slate-400">{t.conjugationDesc}</p>
            </Link>
          </motion.div>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.2}}>
            <Link to="/practice/keigo" className="group flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 rounded-2xl shadow-sm hover:shadow-xl transition-all h-full">
              <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.keigo}</h2>
              <p className="text-slate-500 dark:text-slate-400">{t.keigoDesc}</p>
            </Link>
          </motion.div>

          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay:0.3}}>
            <Link to="/vocabulary/study" className="group flex flex-col items-center text-center p-8 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-rose-500 dark:hover:border-rose-500 rounded-2xl shadow-sm hover:shadow-xl transition-all h-full">
              <div className="p-4 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <BookOpen size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.vocab}</h2>
              <p className="text-slate-500 dark:text-slate-400">{t.vocabDesc}</p>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}