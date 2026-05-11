// src/pages/Study.tsx
import { useSettings } from '../context/global/useSettings';

export default function Study() {
  const { language } = useSettings();

  const translations = {
    vi: {
      title: 'Lộ Trình Học Tập',
      description: 'Tính năng đang được phát triển...',
    },
    en: {
      title: 'Learning Path',
      description: 'Feature in development...',
    }
  };
  const t = translations[language as keyof typeof translations] || translations.vi;

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-4 transition-colors">{t.title}</h1>
      <p className="text-gray-500 dark:text-gray-400 transition-colors">{t.description}</p>
    </div>
  );
}