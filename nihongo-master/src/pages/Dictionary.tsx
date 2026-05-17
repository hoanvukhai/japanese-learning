// src/pages/Dictionary.tsx
import { useState } from 'react';
import { vocabulary } from '../data';
import { keigoVerbs } from '../data/keigoDb';
import type { Word } from '../types';
import { Search, Filter, Book, GraduationCap } from 'lucide-react';
import { useSettings } from '../context/global/useSettings';
import { getKeigoResult } from '../lib/keigoEngine';

export default function Dictionary() {
  const words = (Array.isArray(vocabulary) ? vocabulary : []) as Word[];
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [dictMode, setDictMode] = useState<'general' | 'keigo'>('general');
  const { language } = useSettings();

  const translations = {
    vi: {
      title: 'Tra cứu Từ vựng',
      total: 'Tổng số:',
      wordsInDb: 'từ trong hệ thống',
      searchPlaceholder: 'Tìm theo Kanji, Hiragana hoặc Nghĩa...',
      allTypes: 'Tất cả loại từ',
      verbG1: 'Động từ - Nhóm 1',
      verbG2: 'Động từ - Nhóm 2',
      verbG3: 'Động từ - Nhóm 3',
      adjI: 'Tính từ đuôi I',
      adjNa: 'Tính từ đuôi NA',
      noun: 'Danh từ',
      adv: 'Trạng từ',
      expression: 'Cụm từ / Biểu đạt',
      thKanji: 'Kanji / Từ gốc',
      thHiragana: 'Cách đọc',
      thMeaning: 'Ý nghĩa',
      thType: 'Phân loại',
      thLevel: 'Cấp độ',
      thSonkei: 'Tôn kính ngữ (Sonkei)',
      thKenjou: 'Khiêm nhường ngữ (Kenjou)',
      thTeinei: 'Lịch sự (Teinei)',
      notFound: 'Không tìm thấy kết quả nào phù hợp.',
      genMode: 'Từ vựng chung',
      keigoMode: 'Kính ngữ (Keigo)'
    },
    en: {
      title: 'Dictionary',
      total: 'Total:',
      wordsInDb: 'words in system',
      searchPlaceholder: 'Search by Kanji, Hiragana or Meaning...',
      allTypes: 'All word types',
      verbG1: 'Verb - Group 1',
      verbG2: 'Verb - Group 2',
      verbG3: 'Verb - Group 3',
      adjI: 'I-Adjective',
      adjNa: 'Na-Adjective',
      noun: 'Noun',
      adv: 'Adverb',
      expression: 'Expression',
      thKanji: 'Kanji / Base',
      thHiragana: 'Reading',
      thMeaning: 'Meaning',
      thType: 'Type',
      thLevel: 'Level',
      thSonkei: 'Honorific (Sonkei)',
      thKenjou: 'Humble (Kenjou)',
      thTeinei: 'Polite (Teinei)',
      notFound: 'No matching results found.',
      genMode: 'General Vocab',
      keigoMode: 'Keigo Dictionary'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.vi;

  // -- FILTER LOGIC --
  const filteredWords = words.filter((word) => {
    const meaningText = typeof word.meaning === 'object' ? word.meaning[language as 'vi' | 'en'] : word.meaning;
    const matchesSearch = 
      word.kanji.includes(searchTerm) || 
      (word.alt_kanji && word.alt_kanji.includes(searchTerm)) ||
      word.hiragana.includes(searchTerm) || 
      (meaningText || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'verb1' && word.type === 'verb' && word.group === 1) ||
      (filterType === 'verb2' && word.type === 'verb' && word.group === 2) ||
      (filterType === 'verb3' && word.type === 'verb' && word.group === 3) ||
      (filterType === 'adj_i' && word.type === 'adj_i') ||
      (filterType === 'adj_na' && word.type === 'adj_na') ||
      (filterType === 'adv' && word.type === 'adv') ||
      (filterType === 'expression' && word.type === 'expression') ||
      (filterType === 'noun' && word.type === 'noun');

    return matchesSearch && matchesFilter;
  });

  const filteredKeigo = keigoVerbs.filter(verb => {
    const meaningText = verb.meaning[language as 'vi' | 'en'];
    return verb.kanji.includes(searchTerm) || 
           verb.hiragana.includes(searchTerm) || 
           (meaningText || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white transition-colors">{t.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 transition-colors">
            {t.total} {dictMode === 'general' ? words.length : keigoVerbs.length} {t.wordsInDb}
          </p>
        </div>
        
        {/* MODE TOGGLE */}
        <div className="flex bg-gray-200 dark:bg-slate-700 p-1 rounded-xl">
          <button
            onClick={() => setDictMode('general')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              dictMode === 'general' 
                ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Book size={18} /> <span className="hidden sm:inline">{t.genMode}</span>
          </button>
          <button
            onClick={() => setDictMode('keigo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              dictMode === 'keigo' 
                ? 'bg-white dark:bg-slate-600 shadow-sm text-green-600 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <GraduationCap size={18} /> <span className="hidden sm:inline">{t.keigoMode}</span>
          </button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 flex flex-col md:flex-row gap-4 transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        
        {dictMode === 'general' && (
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
              <option value="adv">{t.adv}</option>
              <option value="expression">{t.expression}</option>
            </select>
          </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors">
                <th className="py-4 px-6 font-semibold whitespace-nowrap">{t.thKanji}</th>
                {dictMode === 'general' && <th className="py-4 px-6 font-semibold">{t.thHiragana}</th>}
                <th className="py-4 px-6 font-semibold">{t.thMeaning}</th>
                {dictMode === 'general' ? (
                  <>
                    <th className="py-4 px-6 font-semibold text-center">{t.thType}</th>
                    <th className="py-4 px-6 font-semibold text-center">{t.thLevel}</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 px-6 font-semibold">{t.thSonkei}</th>
                    <th className="py-4 px-6 font-semibold">{t.thKenjou}</th>
                    <th className="py-4 px-6 font-semibold">{t.thTeinei}</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {dictMode === 'general' ? (
                filteredWords.length > 0 ? (
                  filteredWords.map((word) => (
                    <tr key={word.id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-lg text-slate-800 dark:text-white whitespace-nowrap">
                        {word.kanji}
                        {word.alt_kanji && <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">({word.alt_kanji})</span>}
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 whitespace-nowrap">{word.hiragana}</td>
                      <td className="py-4 px-6 text-slate-700 dark:text-slate-200 min-w-[150px]">
                        {typeof word.meaning === 'object' ? word.meaning[language as 'vi' | 'en'] : word.meaning}
                      </td>
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium inline-block transition-colors">
                          {word.type === 'verb' 
                              ? (language === 'en' ? `Verb G${word.group}` : `Động từ N${word.group}`)
                              : word.type === 'adj_i' ? (language === 'en' ? 'I-Adj' : 'Tính từ I')
                              : word.type === 'adj_na' ? (language === 'en' ? 'Na-Adj' : 'Tính từ NA')
                              : word.type === 'adv' ? (language === 'en' ? 'Adverb' : 'Trạng từ')
                              : word.type === 'expression' ? (language === 'en' ? 'Expression' : 'Cụm từ')
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
                )
              ) : (
                filteredKeigo.length > 0 ? (
                  filteredKeigo.map(verb => {
                    const renderKeigoCell = (formType: 'sonkei' | 'kenjou' | 'teinei') => {
                      const f = verb[formType];
                      if (f.type === 'none') return <span className="text-slate-300 dark:text-slate-600">-</span>;
                      const result = getKeigoResult(verb, formType);
                      return (
                        <div>
                          <span className="font-bold text-slate-800 dark:text-white">{result}</span>
                          {f.type === 'special' && (
                            <span className="ml-2 text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                              {language === 'en' ? 'Special' : 'Đặc biệt'}
                            </span>
                          )}
                        </div>
                      );
                    };

                    return (
                      <tr key={verb.id} className="border-b border-gray-50 dark:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-lg text-slate-800 dark:text-white">{verb.kanji}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{verb.hiragana}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-700 dark:text-slate-200 font-medium min-w-[150px]">
                          {verb.meaning[language as 'vi' | 'en']}
                        </td>
                        <td className="py-4 px-6">{renderKeigoCell('sonkei')}</td>
                        <td className="py-4 px-6">{renderKeigoCell('kenjou')}</td>
                        <td className="py-4 px-6">{renderKeigoCell('teinei')}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500">
                      {t.notFound}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}