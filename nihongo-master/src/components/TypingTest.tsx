// src/components/TypingTest.tsx
import { useState } from 'react';
import type { Word } from '../types';
import { getTeForm, getNaiForm, getTaForm, getMasuForm, getNakattaForm } from '../lib/conjugator';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import * as wanakana from 'wanakana';
import { useSettings } from '../context/global/useSettings';

interface TypingTestProps {
  word: Word;
  targetForm: 'te' | 'nai' | 'ta' | 'masu' | 'jisho' | 'nakatta';
  onNext: () => void; // Hàm gọi để chuyển từ tiếp theo
}

export default function TypingTest({ word, targetForm, onNext }: TypingTestProps) {
  const [input, setInput] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const { language } = useSettings();

  // Tính toán đáp án đúng dựa vào logic đã viết
  const correctAnswer = () => {
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // So sánh input của người dùng với đáp án (loại bỏ khoảng trắng)
    const check = input.trim() === correctAnswer();
    setIsCorrect(check);
    setIsSubmitted(true);
  };

  const translations = {
    vi: {
      conjugateTo: 'Hãy chia sang:',
      group: 'Nhóm',
      placeholder: 'Gõ Romaji (VD: tabete), tự đổi sang Hiragana...',
      checkBtn: 'Kiểm tra',
      correctMsg: 'Chính xác! Tuyệt vời!',
      incorrectMsg: 'Chưa đúng rồi!',
      correctAnswerIs: 'Đáp án đúng phải là:',
      continueBtn: 'Tiếp tục',
      forms: {
        jisho: 'Từ điển (Khẳng định - Hiện tại)',
        masu: 'Thể Lịch sự (Masu)',
        te: 'Thể Te (て)',
        nai: 'Thể Nai (Phủ định - Hiện tại)',
        ta: 'Thể Ta (Khẳng định - Quá khứ)',
        nakatta: 'Thể Nakatta (Phủ định - Quá khứ)'
      }
    },
    en: {
      conjugateTo: 'Please conjugate to:',
      group: 'Group',
      placeholder: 'Type Romaji (e.g., tabete), converts to Hiragana...',
      checkBtn: 'Check',
      correctMsg: 'Correct! Awesome!',
      incorrectMsg: 'Incorrect!',
      correctAnswerIs: 'The correct answer is:',
      continueBtn: 'Continue',
      forms: {
        jisho: 'Dictionary (Affirmative - Present)',
        masu: 'Polite (Masu)',
        te: 'Te Form (て)',
        nai: 'Nai Form (Negative - Present)',
        ta: 'Ta Form (Affirmative - Past)',
        nakatta: 'Nakatta Form (Negative - Past)'
      }
    }
  };
  const t = translations[language as keyof typeof translations] || translations.vi;

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-slate-700 transition-colors">
      <div className="text-center mb-8">
        <span className="text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-widest transition-colors">
          {t.conjugateTo} {t.forms[targetForm]}
        </span>
        <h2 className="text-5xl font-bold text-gray-800 dark:text-white mt-4 mb-2 transition-colors">{word.kanji}</h2>
        <p className="text-gray-500 dark:text-gray-400 transition-colors">
          ({typeof word.meaning === 'object' ? word.meaning[language as 'vi' | 'en'] : word.meaning} - {t.group} {word.group})
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={input}
            // SỬA DÒNG NÀY: Gọi wanakana.toHiragana với chế độ IMEMode
            onChange={(e) => {
              const text = e.target.value;
              const hiragana = wanakana.toHiragana(text, { IMEMode: true });
              setInput(hiragana);
            }}
            disabled={isSubmitted}
            placeholder={t.placeholder}
            className={`w-full text-center text-2xl p-4 rounded-xl border-2 outline-none transition-colors dark:bg-slate-700 dark:text-white ${isSubmitted
                ? isCorrect
                  ? 'border-green-400 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'border-red-400 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : 'border-gray-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-500'
              }`}
          />
        </div>

        {!isSubmitted ? (
          <button
            type="submit"
            className="w-full bg-blue-600 dark:bg-blue-500 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] transition-all"
          >
            {t.checkBtn}
          </button>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Hiển thị kết quả */}
            <div className={`p-4 rounded-xl flex items-center justify-center gap-3 ${isCorrect ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'}`}>
              {isCorrect ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              <span className="font-bold text-lg">
                {isCorrect ? t.correctMsg : t.incorrectMsg}
              </span>
            </div>

            {/* Nếu sai, hiện đáp án đúng */}
            {!isCorrect && (
              <div className="text-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t.correctAnswerIs}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">{correctAnswer()}</p>
              </div>
            )}

            <button
              type="button"
              onClick={onNext}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-700 text-white font-bold text-lg py-4 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 active:scale-[0.98] transition-all"
            >
              {t.continueBtn} <ArrowRight size={20} />
            </button>
          </div>
        )}
      </form>
    </div>
  );
}