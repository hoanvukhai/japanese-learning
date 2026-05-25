// src/pages/Home.tsx
import { Link } from 'react-router-dom';
import { useSettings } from '../context/global/useSettings';
import { motion } from 'framer-motion';
import { Database, Zap, Gamepad2 } from 'lucide-react';

export default function Home() {
  const { language } = useSettings();

  const translations = {
    vi: {
      title: 'Hệ thống Học tập và Ôn luyện thi',
      highlight: 'JLPT N3',
      description: 'Ứng dụng hỗ trợ ôn thi N3 sát với thực tế, tập trung vào phản xạ và tránh bẫy:',
      features: [
        {
          icon: <Database className="w-6 h-6 text-blue-500" />,
          title: 'Kho dữ liệu trọn bộ',
          desc: '880 Từ vựng, 35 bài Kanji và 20 bài Ngữ pháp.'
        },
        {
          icon: <Zap className="w-6 h-6 text-amber-500" />,
          title: 'Thực hành cốt lõi',
          desc: 'Luyện phản xạ tự động chia thể (động từ, tính từ) và chuyên đề Kính ngữ.'
        },
        {
          icon: <Gamepad2 className="w-6 h-6 text-green-500" />,
          title: 'Đa dạng chế độ ôn tập',
          desc: 'Tích hợp Flashcard, nhập liệu thông minh và nhiều chế độ chơi/test khác nhau để rèn luyện cho từng kỹ năng.'
        }
      ],
      startBtn: 'Bắt đầu học ngay'
    },
    en: {
      title: 'Study and Practice System for',
      highlight: 'JLPT N3',
      description: 'An application designed for practical N3 preparation, focusing on reflexes and avoiding exam traps:',
      features: [
        {
          icon: <Database className="w-6 h-6 text-blue-500" />,
          title: 'Complete Database',
          desc: '880 Vocabulary words, 35 Kanji lessons, and 20 Grammar lessons.'
        },
        {
          icon: <Zap className="w-6 h-6 text-amber-500" />,
          title: 'Core Practice',
          desc: 'Automatic conjugation reflex training (verbs, adjectives) and specialized Keigo modules.'
        },
        {
          icon: <Gamepad2 className="w-6 h-6 text-green-500" />,
          title: 'Diverse Study Modes',
          desc: 'Integrated Flashcards, smart typing input, and various play/test modes to train each skill.'
        }
      ],
      startBtn: 'Start learning now'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 md:px-8 py-12">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-800 dark:text-white mb-6 leading-tight transition-colors"
        >
          {t.title} <span className="text-teal-600 dark:text-teal-400">{t.highlight}</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto transition-colors"
        >
          {t.description}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-left"
        >
          {t.features.map((feature, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="bg-slate-50 dark:bg-slate-900/50 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link 
            to="/study" 
            className="inline-flex items-center justify-center px-10 py-4 bg-teal-600 text-white font-bold rounded-full text-xl shadow-lg shadow-teal-500/30 hover:bg-teal-700 hover:shadow-teal-500/50 hover:-translate-y-1 active:translate-y-0 transition-all"
          >
            {t.startBtn}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}