// src/components/Flashcard.tsx
import { useState } from 'react';
import type { Word } from '../types';
import { getTeForm, getNaiForm, getTaForm, getMasuForm, getNakattaForm } from '../lib/conjugator';
import { RotateCcw } from 'lucide-react';
import { useSettings } from '../context/global/useSettings';

interface FlashcardProps {
  word: Word;
  targetForm: 'te' | 'nai' | 'ta' | 'masu' | 'jisho' | 'nakatta';
}

export default function Flashcard({ word, targetForm }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [prevWord, setPrevWord] = useState(word);
  const { language } = useSettings();

  if (word !== prevWord) {
    setPrevWord(word);
    setIsFlipped(false);
  }

  // Hàm chọn kết quả chia thể dựa trên targetForm được truyền vào
const getConjugatedResult = () => {
    switch (targetForm) {
      case 'jisho': return word.hiragana; // Trả về gốc
      case 'masu': return getMasuForm(word);
      case 'te': return getTeForm(word);
      case 'nai': return getNaiForm(word);
      case 'ta': return getTaForm(word);
      case 'nakatta': return getNakattaForm(word); // Hàm bạn vừa thêm
      default: return word.hiragana;
    }
  };

  const translations = {
    vi: {
      conjugateTo: 'Chia sang:',
      tapToFlip: 'Chạm để lật thẻ',
      reading: 'Cách đọc:',
      group: 'Nhóm',
      irregular: 'Bất quy tắc',
      forms: {
        jisho: 'Từ điển (Khẳng định - Hiện tại)',
        masu: 'Thể Lịch sự (Masu)',
        te: 'Thể Te (て)',
        nai: 'Thể Nai (Phủ định - Hiện tại)',
        ta: 'Thể Ta (Khẳng định - Quá khứ)',
        nakatta: 'Thể Nakatta (Phủ định - Quá khứ)',
      }
    },
    en: {
      conjugateTo: 'Conjugate to:',
      tapToFlip: 'Tap to flip',
      reading: 'Reading:',
      group: 'Group',
      irregular: 'Irregular',
      forms: {
        jisho: 'Dictionary (Affirmative - Present)',
        masu: 'Polite Form (Masu)',
        te: 'Te Form (て)',
        nai: 'Nai Form (Negative - Present)',
        ta: 'Ta Form (Affirmative - Past)',
        nakatta: 'Nakatta Form (Negative - Past)',
      }
    }
  };
  const t = translations[language as keyof typeof translations] || translations.vi;

  return (
    <div 
      className="group w-80 h-96 [perspective:1000px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={`relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* MẶT TRƯỚC: Hiển thị Kanji (Câu hỏi) */}
        <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 [backface-visibility:hidden] border-2 border-blue-100 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
          <span className="text-gray-400 dark:text-gray-500 text-sm font-medium mb-8 uppercase tracking-widest transition-colors">
            {t.conjugateTo} {t.forms[targetForm]}
          </span>
          <h2 className="text-6xl font-bold text-gray-800 dark:text-white mb-4 transition-colors">{word.kanji}</h2>
          <div className="mt-auto flex items-center text-gray-400 text-sm">
            <RotateCcw size={16} className="mr-2" />
            <span>{t.tapToFlip}</span>
          </div>
        </div>

        {/* MẶT SAU: Hiển thị Đáp án (Đã chia thể) + Nghĩa */}
        <div className="absolute inset-0 w-full h-full bg-blue-600 dark:bg-blue-700 rounded-2xl shadow-xl flex flex-col items-center justify-center p-6 [transform:rotateY(180deg)] [backface-visibility:hidden] text-white transition-colors">
          <span className="text-blue-200 text-sm font-medium mb-4">
            {t.reading} {word.hiragana}
          </span>
          
          {/* Kết quả chia thể nổi bật ở giữa */}
          <div className="text-5xl font-bold mb-6 text-yellow-300">
            {getConjugatedResult()}
          </div>
          
          <div className="w-16 h-1 bg-blue-400 rounded-full mb-6"></div>
          
          <div className="text-xl font-medium text-center">
            {typeof word.meaning === 'object' ? word.meaning[language as 'vi' | 'en'] : word.meaning}
          </div>
          
          <div className="mt-auto flex gap-2">
            <span className="px-3 py-1 bg-blue-700/50 rounded-full text-xs">
              {t.group} {word.group}
            </span>
            {word.isSpecial && (
              <span className="px-3 py-1 bg-red-500/80 rounded-full text-xs">
                {t.irregular}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}