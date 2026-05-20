import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { kanjiN3 } from '../../data/kanjiN3';

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function KanjiMatching() {
  const [started, setStarted] = useState(false);
  const [lesson, setLesson] = useState('all');
  const [mode, setMode] = useState<'kanji-hanviet' | 'word-hiragana' | 'word-meaning'>('kanji-hanviet');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // States cho game
  const [kanjis, setKanjis] = useState<{ id: string; text: string; matched: boolean; selected: boolean }[]>([]);
  const [meanings, setMeanings] = useState<{ id: string; text: string; matched: boolean; selected: boolean }[]>([]);

  const [selectedKanji, setSelectedKanji] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [errorPair, setErrorPair] = useState<{ k: string, m: string } | null>(null);

  const lessons = Array.from(new Set(kanjiN3.map(k => k.lesson))).filter(Boolean);

  const initGame = () => {
    let basePool = lesson === 'all' ? kanjiN3 : kanjiN3.filter(k => k.lesson === lesson);

    if (mode === 'kanji-hanviet') {
      let pool = shuffle(basePool).slice(0, 6);
      
      const charArr = pool.map(k => ({ id: k.id, text: k.character, matched: false, selected: false }));
      const hanarr = pool.map(k => ({ id: k.id, text: k.hanViet, matched: false, selected: false }));
      
      if (direction === 'forward') {
        setKanjis(shuffle(charArr));
        setMeanings(shuffle(hanarr));
      } else {
        setKanjis(shuffle(hanarr));
        setMeanings(shuffle(charArr));
      }
    } else if (mode === 'word-hiragana') {
      const wordsList: { id: string; word: string; hiragana: string }[] = [];
      basePool.forEach(k => {
        k.words.forEach((w, idx) => {
          wordsList.push({
            id: `${k.id}_w_${idx}`,
            word: w.word,
            hiragana: w.hiragana,
          });
        });
      });

      let pool = shuffle(wordsList).slice(0, 6);
      const wordArr = pool.map(w => ({ id: w.id, text: w.word, matched: false, selected: false }));
      const readArr = pool.map(w => ({ id: w.id, text: w.hiragana, matched: false, selected: false }));

      if (direction === 'forward') {
        setKanjis(shuffle(wordArr));
        setMeanings(shuffle(readArr));
      } else {
        setKanjis(shuffle(readArr));
        setMeanings(shuffle(wordArr));
      }
    } else { // 'word-meaning'
      const wordsList: { id: string; word: string; meaning: string }[] = [];
      basePool.forEach(k => {
        k.words.forEach((w, idx) => {
          wordsList.push({
            id: `${k.id}_w_${idx}`,
            word: w.word,
            meaning: typeof w.meaning === 'object' ? w.meaning.vi : w.meaning,
          });
        });
      });

      let pool = shuffle(wordsList).slice(0, 6);
      const wordArr = pool.map(w => ({ id: w.id, text: w.word, matched: false, selected: false }));
      const meanArr = pool.map(w => ({ id: w.id, text: w.meaning, matched: false, selected: false }));

      if (direction === 'forward') {
        setKanjis(shuffle(wordArr));
        setMeanings(shuffle(meanArr));
      } else {
        setKanjis(shuffle(meanArr));
        setMeanings(shuffle(wordArr));
      }
    }

    setSelectedKanji(null);
    setSelectedMeaning(null);
    setErrorPair(null);
    setStarted(true);
  };

  useEffect(() => {
    if (selectedKanji && selectedMeaning) {
      if (selectedKanji === selectedMeaning) {
        // Match!
        setKanjis(prev => prev.map(k => k.id === selectedKanji ? { ...k, matched: true, selected: false } : k));
        setMeanings(prev => prev.map(m => m.id === selectedMeaning ? { ...m, matched: true, selected: false } : m));
        setSelectedKanji(null);
        setSelectedMeaning(null);
      } else {
        // Mismatch!
        setErrorPair({ k: selectedKanji, m: selectedMeaning });
        setTimeout(() => {
          setKanjis(prev => prev.map(k => ({ ...k, selected: false })));
          setMeanings(prev => prev.map(m => ({ ...m, selected: false })));
          setSelectedKanji(null);
          setSelectedMeaning(null);
          setErrorPair(null);
        }, 800);
      }
    }
  }, [selectedKanji, selectedMeaning]);

  const handleKanjiClick = (id: string) => {
    if (errorPair || kanjis.find(k => k.id === id)?.matched) return;
    setSelectedKanji(id);
    setKanjis(prev => prev.map(k => ({ ...k, selected: k.id === id })));
  };

  const handleMeaningClick = (id: string) => {
    if (errorPair || meanings.find(m => m.id === id)?.matched) return;
    setSelectedMeaning(id);
    setMeanings(prev => prev.map(m => ({ ...m, selected: m.id === id })));
  };

  const isWin = kanjis.length > 0 && kanjis.every(k => k.matched);

  // Dynamic text size to prevent overflow for longer words/meanings/hiragana
  const getTextSize = (text: string) => {
    if (text.length <= 2) return 'text-3xl md:text-4xl font-bold';
    if (text.length <= 5) return 'text-xl md:text-2xl font-bold';
    if (text.length <= 10) return 'text-base md:text-lg font-bold';
    return 'text-xs md:text-sm font-semibold px-2 text-center';
  };

  const getSubTitle = () => {
    if (mode === 'kanji-hanviet') {
      return direction === 'forward' ? 'Nối chữ Kanji (Trái) với Hán Việt (Phải)' : 'Nối Hán Việt (Trái) với chữ Kanji (Phải)';
    } else if (mode === 'word-hiragana') {
      return direction === 'forward' ? 'Nối Từ ghép (Trái) với Hiragana (Phải)' : 'Nối Hiragana (Trái) với Từ ghép (Phải)';
    } else {
      return direction === 'forward' ? 'Nối Từ ghép (Trái) với Nghĩa tiếng Việt (Phải)' : 'Nối Nghĩa tiếng Việt (Trái) với Từ ghép (Phải)';
    }
  };

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 md:p-12 font-sans">
        <div className="max-w-lg mx-auto">
          <Link to="/kanji" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-colors">
            <ArrowLeft size={18} /> Quay lại
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2 font-display">🧩 Nối Kanji</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">Trò chơi ghép nối phản xạ siêu tốc.</p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">📚 Bài học</label>
              <select
                value={lesson}
                onChange={e => setLesson(e.target.value)}
                className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
              >
                <option value="all">Tất cả bài học ({kanjiN3.length} chữ)</option>
                {lessons.map(l => (
                  <option key={l} value={l}>{l} ({kanjiN3.filter(k => k.lesson === l).length} chữ)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">⚙️ Chế độ nối</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('kanji-hanviet')}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex justify-between items-center ${
                    mode === 'kanji-hanviet'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>Chữ Kanji & Hán Việt</span>
                  <span className="text-xs font-normal opacity-70">共 ⇄ CỘNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('word-hiragana')}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex justify-between items-center ${
                    mode === 'word-hiragana'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>Từ ghép & Cách đọc (Hiragana)</span>
                  <span className="text-xs font-normal opacity-70">共通点 ⇄ きょうつうてん</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('word-meaning')}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all text-left flex justify-between items-center ${
                    mode === 'word-meaning'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>Từ ghép & Nghĩa tiếng Việt</span>
                  <span className="text-xs font-normal opacity-70">共通点 ⇄ Điểm chung</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">🔄 Hướng câu hỏi</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDirection('forward')}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                    direction === 'forward'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  Thuận
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('backward')}
                  className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all ${
                    direction === 'backward'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  Đảo ngược
                </button>
              </div>
            </div>

            <button
              onClick={initGame}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all active:scale-[0.98]"
            >
              Bắt đầu trò chơi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setStarted(false)} className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-medium">
            <ArrowLeft size={18} /> Cài đặt
          </button>
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {getSubTitle()}
          </div>
        </div>

        {isWin ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 shadow-xl text-center max-w-sm mx-auto">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white mb-6">Xuất sắc!</h2>
            <button
              onClick={initGame}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 mb-3 shadow-md"
            >
              <RotateCcw size={18} /> Chơi tiếp
            </button>
            <Link to="/kanji" className="block w-full py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all text-center">
              Về dashboard
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:gap-8">
            {/* Cột Trái */}
            <div className="space-y-4">
              {kanjis.map(k => {
                let btnClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:border-blue-300 dark:hover:border-blue-500";
                if (k.matched) btnClass = "bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-800 text-green-600 dark:text-green-400 opacity-50 cursor-default";
                else if (errorPair?.k === k.id) btnClass = "bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-800 text-red-600 dark:text-red-400";
                else if (k.selected) btnClass = "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400";

                return (
                  <button
                    key={k.id}
                    onClick={() => handleKanjiClick(k.id)}
                    disabled={k.matched}
                    className={`w-full min-h-[5.5rem] p-4 flex items-center justify-center rounded-2xl border-2 transition-all shadow-sm ${btnClass} ${getTextSize(k.text)}`}
                  >
                    {k.text}
                  </button>
                );
              })}
            </div>

            {/* Cột Phải */}
            <div className="space-y-4">
              {meanings.map(m => {
                let btnClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:border-blue-300 dark:hover:border-blue-500";
                if (m.matched) btnClass = "bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-800 text-green-600 dark:text-green-400 opacity-50 cursor-default";
                else if (errorPair?.m === m.id) btnClass = "bg-red-50 dark:bg-red-900/30 border-red-400 dark:border-red-800 text-red-600 dark:text-red-400";
                else if (m.selected) btnClass = "bg-blue-50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400";

                return (
                  <button
                    key={m.id}
                    onClick={() => handleMeaningClick(m.id)}
                    disabled={m.matched}
                    className={`w-full min-h-[5.5rem] p-4 flex items-center justify-center rounded-2xl border-2 transition-all shadow-sm ${btnClass} ${getTextSize(m.text)}`}
                  >
                    {m.text}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
