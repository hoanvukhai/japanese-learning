// src/pages/Home.tsx
import { Link } from 'react-router-dom';
import { useSettings } from '../context/global/useSettings';

export default function Home() {
  const { language } = useSettings();

  // Khai báo bộ từ điển cho trang Home
  const translations = {
    vi: {
      title: 'Hệ thống ôn luyện',
      highlight: 'Ngữ Pháp Tiếng Nhật',
      description: 'Tự động chia động từ, tính từ và luyện tập phản xạ với thẻ Flashcard & Nhập liệu thông minh.',
      startBtn: 'Bắt đầu học ngay'
    },
    en: {
      title: 'Practice system for',
      highlight: 'Japanese Grammar',
      description: 'Automatically conjugate verbs, adjectives and practice reflexes with Flashcards & Smart Input.',
      startBtn: 'Start learning now'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-5xl font-bold text-slate-800 dark:text-white mb-6 transition-colors">
        {t.title} <span className="text-blue-600 dark:text-blue-400">{t.highlight}</span>
      </h1>
      <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl transition-colors">
        {t.description}
      </p>
      <Link 
        to="/practice" 
        className="px-8 py-4 bg-blue-600 text-white font-bold rounded-full text-lg shadow-lg hover:bg-blue-700 dark:hover:bg-blue-500 hover:scale-105 transition-all"
      >
        {t.startBtn}
      </Link>
    </div>
  );
}