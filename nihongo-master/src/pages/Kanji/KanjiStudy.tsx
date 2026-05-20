import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, Volume2 } from 'lucide-react';
import { kanjiN3 } from '../../data/kanjiN3';

export default function KanjiStudy() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('all');

  const lessons = Array.from(new Set(kanjiN3.map(k => k.lesson))).filter(Boolean);

  const filteredKanji = kanjiN3.filter(k => {
    const matchLesson = selectedLesson === 'all' || k.lesson === selectedLesson;
    const matchSearch =
      k.character.includes(searchTerm) ||
      k.hanViet.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.words.some(w =>
        w.word.includes(searchTerm) ||
        w.meaning.vi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.meaning.en && w.meaning.en.toLowerCase().includes(searchTerm.toLowerCase())) ||
        w.hiragana.includes(searchTerm)
      );
    return matchLesson && matchSearch;
  });

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <Link to="/kanji" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition-colors font-medium">
            <ArrowLeft size={18} /> Quay lại Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">Học Kanji</h1>
              <p className="text-slate-500 dark:text-slate-400">Danh sách chữ Hán và từ vựng ghép.</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl font-bold">
              Tổng số: {filteredKanji.length}
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm kanji, hán việt, từ vựng, ý nghĩa..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 dark:text-white transition-colors"
            />
          </div>
          <select
            value={selectedLesson}
            onChange={e => setSelectedLesson(e.target.value)}
            className="w-full md:w-48 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 dark:text-white transition-colors font-medium cursor-pointer"
          >
            <option value="all">Tất cả bài học</option>
            {lessons.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* List */}
        <div className="space-y-6">
          {filteredKanji.map(kanji => (
            <div key={kanji.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col md:flex-row">
              {/* Cột Kanji */}
              <div className="md:w-1/3 bg-blue-50 dark:bg-blue-900/20 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700">
                <div className="text-8xl font-black text-slate-800 dark:text-white mb-4">{kanji.character}</div>
                <div className="text-xl font-bold tracking-widest text-blue-600 dark:text-blue-400 mb-2">{kanji.hanViet}</div>
                {kanji.lesson && (
                  <div className="mt-2 text-xs font-semibold bg-white dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400 shadow-sm border border-slate-200 dark:border-slate-700">
                    {kanji.lesson}
                  </div>
                )}
              </div>

              {/* Cột Từ Vựng */}
              <div className="md:w-2/3 p-6 md:p-8">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Từ vựng đi kèm</h3>
                <div className="space-y-4">
                  {kanji.words.map((word, idx) => (
                    <div key={idx} className="flex items-start justify-between group p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xl font-bold text-slate-800 dark:text-white">{word.word}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-medium">
                            Âm {word.readingType}
                          </span>
                          {word.type && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                              {word.type === 'verb' ? `Động từ ${word.group ? `N${word.group}` : ''}` : word.type}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">{word.hiragana}</div>
                        <div className="text-slate-600 dark:text-slate-300">{word.meaning.vi}</div>
                        {word.examples && word.examples.length > 0 && (
                          <div className="mt-2 text-sm text-slate-500 border-l-2 border-blue-200 dark:border-blue-800 pl-3">
                            <div>{word.examples[0].jp}</div>
                            <div>{word.examples[0].vi}</div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => playAudio(word.word)}
                        className="p-2 text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30"
                      >
                        <Volume2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {filteredKanji.length === 0 && (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Không tìm thấy Kanji nào</h3>
              <p className="text-slate-500">Hãy thử thay đổi từ khóa hoặc bộ lọc.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
