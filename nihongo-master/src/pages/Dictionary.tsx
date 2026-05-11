// src/pages/Dictionary.tsx
import { useState } from 'react';
import { vocabulary } from '../data';
import type { Word } from '../types';
import { Search, Filter } from 'lucide-react';
import { useSettings } from '../context/global/useSettings';

export default function Dictionary() {
  // Thêm kiểm tra an toàn: Nếu vocabulary không phải mảng, mặc định là mảng rỗng
  const words = (Array.isArray(vocabulary) ? vocabulary : []) as Word[];
  console.log("Dữ liệu vocabulary hiện tại:", vocabulary); // In ra để debug
  
  // State cho tìm kiếm và lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { language } = useSettings();

  const translations = {
    vi: {
      title: 'Tra cứu Từ vựng',
      total: 'Tổng số:',
      wordsInDb: 'từ trong cơ sở dữ liệu',
      searchPlaceholder: 'Tìm theo Kanji, Hiragana hoặc Nghĩa...',
      allTypes: 'Tất cả loại từ',
      verbG1: 'Động từ - Nhóm 1',
      verbG2: 'Động từ - Nhóm 2',
      verbG3: 'Động từ - Nhóm 3',
      adjI: 'Tính từ đuôi I',
      adjNa: 'Tính từ đuôi NA',
      noun: 'Danh từ',
      thKanji: 'Kanji',
      thHiragana: 'Cách đọc (Hiragana)',
      thMeaning: 'Ý nghĩa',
      thType: 'Phân loại',
      thLevel: 'Cấp độ',
      notFound: 'Không tìm thấy từ vựng nào phù hợp.'
    },
    en: {
      title: 'Vocabulary Dictionary',
      total: 'Total:',
      wordsInDb: 'words in database',
      searchPlaceholder: 'Search by Kanji, Hiragana or Meaning...',
      allTypes: 'All word types',
      verbG1: 'Verb - Group 1',
      verbG2: 'Verb - Group 2',
      verbG3: 'Verb - Group 3',
      adjI: 'I-Adjective',
      adjNa: 'Na-Adjective',
      noun: 'Noun',
      thKanji: 'Kanji',
      thHiragana: 'Reading (Hiragana)',
      thMeaning: 'Meaning',
      thType: 'Type',
      thLevel: 'Level',
      notFound: 'No matching words found.'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  // Logic Lọc dữ liệu
  const filteredWords = words.filter((word) => {
    // 1. Kiểm tra từ khóa tìm kiếm (so khớp Kanji, Hiragana hoặc Nghĩa)
    const meaningText = typeof word.meaning === 'object' ? word.meaning[language as 'vi' | 'en'] : word.meaning;
    const matchesSearch = 
      word.kanji.includes(searchTerm) || 
      word.hiragana.includes(searchTerm) || 
      (meaningText || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Kiểm tra bộ lọc loại từ
    const matchesFilter = filterType === 'all' || 
      (filterType === 'verb1' && word.type === 'verb' && word.group === 1) ||
      (filterType === 'verb2' && word.type === 'verb' && word.group === 2) ||
      (filterType === 'verb3' && word.type === 'verb' && word.group === 3) ||
      (filterType === 'adj_i' && word.type === 'adj_i') ||
      (filterType === 'adj_na' && word.type === 'adj_na') ||
      (filterType === 'noun' && word.type === 'noun');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">{t.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">{t.total} {words.length} {t.wordsInDb}</p>
        </div>
      </div>

      {/* Thanh Công Cụ: Tìm kiếm & Lọc */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 flex flex-col md:flex-row gap-4 transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all"
          />
        </div>
        
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-blue-500 outline-none appearance-none cursor-pointer transition-colors"
          >
            <option value="all">{t.allTypes}</option>
            <option value="verb1">{t.verbG1}</option>
            <option value="verb2">{t.verbG2}</option>
            <option value="verb3">{t.verbG3}</option>
            <option value="adj_i">{t.adjI}</option>
            <option value="adj_na">{t.adjNa}</option>
            <option value="noun">{t.noun}</option>
          </select>
        </div>
      </div>

      {/* Bảng Dữ Liệu */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                <th className="py-4 px-6 font-semibold">{t.thKanji}</th>
                <th className="py-4 px-6 font-semibold">{t.thHiragana}</th>
                <th className="py-4 px-6 font-semibold">{t.thMeaning}</th>
                <th className="py-4 px-6 font-semibold text-center">{t.thType}</th>
                <th className="py-4 px-6 font-semibold text-center">{t.thLevel}</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.length > 0 ? (
                filteredWords.map((word) => (
                  <tr key={word.id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-lg text-slate-800 dark:text-white">{word.kanji}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{word.hiragana}</td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-200">
                      {typeof word.meaning === 'object' ? word.meaning[language as 'vi' | 'en'] : word.meaning}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium inline-block transition-colors">
                        {word.type === 'verb' 
                            ? (language === 'en' ? `Verb G${word.group}` : `Động từ N${word.group}`)
                            : word.type === 'adj_i' ? (language === 'en' ? 'I-Adj' : 'Tính từ I')
                            : word.type === 'adj_na' ? (language === 'en' ? 'Na-Adj' : 'Tính từ NA')
                            : (language === 'en' ? 'Noun' : 'Danh từ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-slate-500 dark:text-slate-400 font-medium">
                      {word.level}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500">
                    {t.notFound}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}