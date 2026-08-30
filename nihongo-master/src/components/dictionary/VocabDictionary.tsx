import { useState, useMemo } from 'react';
import type { Word } from '../../types';
import { useSettings } from '../../context/global/useSettings';
import Pagination from '../ui/Pagination';
import { Search, X } from 'lucide-react';

interface Props {
  data: Word[];
}

export default function VocabDictionary({ data }: Props) {
  const { language } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<Word | null>(null);
  
  const pageSize = 20;

  const filtersList = [
    { id: 'verb1', labelEn: 'Verb G1', labelVi: 'Động từ N1' },
    { id: 'verb2', labelEn: 'Verb G2', labelVi: 'Động từ N2' },
    { id: 'verb3', labelEn: 'Verb G3', labelVi: 'Động từ N3' },
    { id: 'adj_i', labelEn: 'I-Adj', labelVi: 'Tính từ I' },
    { id: 'adj_na', labelEn: 'Na-Adj', labelVi: 'Tính từ NA' },
    { id: 'noun', labelEn: 'Noun', labelVi: 'Danh từ' },
    { id: 'adv', labelEn: 'Adverb', labelVi: 'Trạng từ' },
    { id: 'expression', labelEn: 'Expression', labelVi: 'Cụm từ' },
  ];

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]
    );
    setCurrentPage(1);
  };

  const filteredData = useMemo(() => {
    return data.filter((word) => {
      const meaningText = typeof word.meaning === 'object' ? word.meaning[language as 'vi' | 'en'] : word.meaning;
      const matchesSearch = 
        word.kanji.includes(searchTerm) || 
        (word.alt_kanji && word.alt_kanji.includes(searchTerm)) ||
        word.hiragana.includes(searchTerm) || 
        (meaningText || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const wordFilterType = word.type === 'verb' ? `verb${word.group}` : word.type;
      const matchesFilter = activeFilters.length === 0 || activeFilters.includes(wordFilterType);

      return matchesSearch && matchesFilter;
    });
  }, [data, searchTerm, activeFilters, language]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getTypeLabel = (type: string, group?: number | null) => {
    if (type === 'verb') return language === 'en' ? `Verb G${group}` : `Động từ Nhóm ${group}`;
    if (type === 'adj_i') return language === 'en' ? 'I-Adj' : 'Tính từ đuôi I';
    if (type === 'adj_na') return language === 'en' ? 'Na-Adj' : 'Tính từ đuôi NA';
    if (type === 'adv') return language === 'en' ? 'Adverb' : 'Trạng từ';
    if (type === 'expression') return language === 'en' ? 'Expression' : 'Cụm từ';
    return language === 'en' ? 'Noun' : 'Danh từ';
  };

  const getMeaning = (word: Word) => {
    return typeof word.meaning === 'object' ? word.meaning[language as 'vi' | 'en'] : word.meaning;
  };

  return (
    <div>
      {/* TOOLBAR */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 flex flex-col gap-4 transition-colors">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder={language === 'en' ? "Search by Kanji, Hiragana or Meaning..." : "Tìm theo Kanji, Hiragana hoặc Nghĩa..."}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white focus:border-blue-500 outline-none transition-all"
          />
        </div>
        
        {/* Chips Filter */}
        <div className="flex flex-wrap gap-2">
          {filtersList.map(f => {
            const isActive = activeFilters.includes(f.id);
            return (
              <button
                key={f.id}
                onClick={() => toggleFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                  isActive 
                    ? 'bg-blue-500 border-blue-500 text-white shadow-sm' 
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-300 hover:text-blue-500'
                }`}
              >
                {language === 'en' ? f.labelEn : f.labelVi}
              </button>
            );
          })}
          {activeFilters.length > 0 && (
            <button 
              onClick={() => { setActiveFilters([]); setCurrentPage(1); }}
              className="px-3 py-1.5 text-sm font-bold text-rose-500 hover:text-rose-600 transition-colors"
            >
              {language === 'en' ? 'Clear all' : 'Xóa lọc'}
            </button>
          )}
        </div>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Kanji</th>
              <th className="py-4 px-6 font-semibold">Hiragana</th>
              <th className="py-4 px-6 font-semibold">{language === 'en' ? 'Meaning' : 'Ý nghĩa'}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((word) => (
                <tr 
                  key={word.id} 
                  onClick={() => setSelectedItem(word)}
                  className="border-b border-gray-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-6 font-bold text-xl text-slate-800 dark:text-white whitespace-nowrap">
                    {word.kanji}
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300 whitespace-nowrap">{word.hiragana}</td>
                  <td className="py-4 px-6 text-slate-700 dark:text-slate-200">
                    {getMeaning(word)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-12 text-center text-gray-400 dark:text-gray-500">
                  {language === 'en' ? 'No matching results found.' : 'Không tìm thấy kết quả nào phù hợp.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE LIST */}
      <div className="block md:hidden">
        <div className="flex flex-col gap-3">
          {paginatedData.length > 0 ? (
            paginatedData.map((word) => (
              <div 
                key={word.id} 
                onClick={() => setSelectedItem(word)}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl text-slate-800 dark:text-white">{word.kanji}</h3>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{word.hiragana}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300">{getMeaning(word)}</p>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-slate-800 rounded-xl">
              {language === 'en' ? 'No matching results found.' : 'Không tìm thấy kết quả nào phù hợp.'}
            </div>
          )}
        </div>
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredData.length}
        itemsPerPage={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* MODAL */}
      {selectedItem && (
        <div 
          onClick={() => setSelectedItem(null)} 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700"
          >
            {/* Header Modal */}
            <div className="relative p-6 border-b border-slate-100 dark:border-slate-700 text-center px-14">
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2">{selectedItem.kanji}</h2>
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400">{selectedItem.hiragana}</p>
            </div>
            
            {/* Body Modal */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="mb-6">
                <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">{language === 'en' ? 'Meaning' : 'Ý nghĩa'}</h4>
                <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{getMeaning(selectedItem)}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium">
                  {getTypeLabel(selectedItem.type, selectedItem.group)}
                </span>
                {selectedItem.level && (
                  <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium">
                    {selectedItem.level}
                  </span>
                )}
                {selectedItem.lesson && (
                  <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg text-sm font-medium">
                    {selectedItem.lesson}
                  </span>
                )}
              </div>

              {selectedItem.examples && selectedItem.examples.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">{language === 'en' ? 'Examples' : 'Ví dụ'}</h4>
                  <div className="space-y-4">
                    {selectedItem.examples.map((ex, i) => (
                      <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                        <p className="font-medium text-slate-800 dark:text-white mb-1">{ex.jp}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{language === 'en' && (ex as any).en ? (ex as any).en : ex.vi}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
