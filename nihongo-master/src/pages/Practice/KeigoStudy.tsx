// src/pages/Practice/KeigoStudy.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, AlertTriangle, Gamepad2 } from 'lucide-react';
import { useSettings } from '../../context/global/useSettings';
import { keigoVerbs } from '../../data/keigoDb';

export default function KeigoStudy() {
  const { language } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc các từ có chứa từ khóa
  const filteredVerbs = keigoVerbs.filter(v => {
    const q = searchTerm.toLowerCase();
    const viMean = v.meaning.vi?.toLowerCase() || '';
    const enMean = v.meaning.en?.toLowerCase() || '';
    return (
      !q ||
      v.jisho.includes(q) ||
      v.hiragana.includes(q) ||
      viMean.includes(q) ||
      enMean.includes(q) ||
      (v.sonkei.word && v.sonkei.word.includes(q)) ||
      (v.kenjou.word && v.kenjou.word.includes(q)) ||
      (v.teinei.word && v.teinei.word.includes(q))
    );
  });

  // Tách ra các từ bất quy tắc (để đưa vào bảng)
  const specialVerbs = filteredVerbs.filter(
    v => v.sonkei.type === 'special' || v.kenjou.type === 'special' || v.teinei.type === 'special'
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <Link to="/study" className="inline-flex items-center gap-2 text-slate-500 hover:text-green-600 mb-4 transition-colors font-medium">
              <ArrowLeft size={18} /> Quay lại
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-2">🎓 Học Kính Ngữ</h1>
            <p className="text-slate-500 dark:text-slate-400">Hệ thống hóa Tôn kính ngữ, Lịch sự ngữ và Khiêm nhường ngữ.</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-3">
            <Link
              to="/practice/keigo"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-sm px-6 py-2.5 rounded-full shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <Gamepad2 size={16} />
              Thực hành ngay
            </Link>
          </div>
        </header>

        {/* Quy tắc chung */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 border-l-4 border-green-500 pl-4">1. Quy tắc chia Kính ngữ chung</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Tôn Kính Ngữ */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-rose-100 dark:border-rose-900/30 overflow-hidden">
              <div className="bg-rose-50 dark:bg-rose-900/20 p-4 border-b border-rose-100 dark:border-rose-900/30">
                <h3 className="font-bold text-rose-600 dark:text-rose-400 text-lg flex items-center gap-2">
                  <span className="text-2xl">⬆️</span> Tôn kính ngữ (Nâng đối phương)
                </h3>
              </div>
              <div className="p-5 space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <div className="font-bold text-sm mb-1 text-slate-500">Quy tắc 1:</div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 font-mono text-center">
                    <span className="text-rose-500">お / ご</span> + <span className="text-blue-500">V(bỏ ます)</span> + <span className="text-rose-500">になる</span>
                  </div>
                  <p className="text-xs text-center mt-2 text-slate-500">Ví dụ: 読みます ➔ お読みになる</p>
                </div>
                <div>
                  <div className="font-bold text-sm mb-1 text-slate-500">Quy tắc 2 (Thể bị động):</div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 font-mono text-center">
                    <span className="text-blue-500">V(bị động)</span> - <span className="text-rose-500">れる / られる</span>
                  </div>
                  <p className="text-xs text-center mt-2 text-slate-500">Ví dụ: 行きます ➔ 行かれる</p>
                </div>
                <div>
                  <div className="font-bold text-sm mb-1 text-slate-500">Yêu cầu lịch sự:</div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 font-mono text-center">
                    <span className="text-rose-500">お / ご</span> + <span className="text-blue-500">V(bỏ ます)</span> + <span className="text-rose-500">ください</span>
                  </div>
                  <p className="text-xs text-center mt-2 text-slate-500">Ví dụ: 待ちます ➔ お待ちください</p>
                </div>
              </div>
            </div>

            {/* Khiêm Nhường Ngữ */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/30 overflow-hidden">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 border-b border-blue-100 dark:border-blue-900/30">
                <h3 className="font-bold text-blue-600 dark:text-blue-400 text-lg flex items-center gap-2">
                  <span className="text-2xl">⬇️</span> Khiêm nhường ngữ (Hạ mình)
                </h3>
              </div>
              <div className="p-5 space-y-4 text-slate-700 dark:text-slate-300">
                <div>
                  <div className="font-bold text-sm mb-1 text-slate-500">Quy tắc 1:</div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-700 font-mono text-center">
                    <span className="text-blue-500">お / ご</span> + <span className="text-teal-500">V(bỏ ます)</span> + <span className="text-blue-500">する / いたす</span>
                  </div>
                  <p className="text-xs text-center mt-2 text-slate-500">Ví dụ: 持ちます ➔ お持ちします</p>
                </div>

                <div className="mt-6 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold mb-2 text-sm">
                    <AlertTriangle size={16} /> Chú ý:
                  </div>
                  <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
                    <li>Dùng <strong className="text-amber-600">お</strong> cho từ thuần Nhật (Nhóm 1, 2)</li>
                    <li>Dùng <strong className="text-amber-600">ご</strong> cho từ gốc Hán (Nhóm 3)</li>
                    <li>Tuyệt đối không dùng Tôn kính ngữ cho bản thân.</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Bảng Bất Quy Tắc */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 gap-4">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white border-l-4 border-purple-500 pl-4">2. Bảng Kính ngữ Bất quy tắc</h2>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm từ..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-green-500 dark:text-white transition-colors text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm">
                    <th className="py-4 px-6 border-b border-slate-200 dark:border-slate-700 font-bold w-1/4">
                      Ý Nghĩa / Từ gốc
                    </th>
                    <th className="py-4 px-6 border-b border-slate-200 dark:border-slate-700 font-bold w-1/4">
                      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                        <span>⬇️ Khiêm Nhường</span>
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full font-normal">(Hạ mình)</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 border-b border-slate-200 dark:border-slate-700 font-bold w-1/4 bg-slate-100 dark:bg-slate-800/80">
                      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <span>Lịch Sự (Teinei)</span>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full font-normal">(Tiêu chuẩn)</span>
                      </div>
                    </th>
                    <th className="py-4 px-6 border-b border-slate-200 dark:border-slate-700 font-bold w-1/4">
                      <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                        <span>⬆️ Tôn Kính</span>
                        <span className="text-[10px] bg-rose-100 dark:bg-rose-900/40 px-2 py-0.5 rounded-full font-normal">(Nâng đối phương)</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-slate-800 dark:text-slate-200">
                  {specialVerbs.length > 0 ? (
                    specialVerbs.map((verb, idx) => (
                      <tr
                        key={verb.id}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors ${idx !== specialVerbs.length - 1 ? 'border-b border-slate-100 dark:border-slate-700/50' : ''}`}
                      >
                        <td className="py-4 px-6">
                          <div className="font-bold text-lg text-slate-700 dark:text-white">
                            {verb.meaning[language as 'vi' | 'en'] || verb.meaning.vi}
                          </div>
                          <div className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                            <span>{verb.jisho}</span>
                            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">Nhóm {verb.group}</span>
                          </div>
                        </td>

                        {/* Cột Khiêm Nhường */}
                        <td className="py-4 px-6">
                          {verb.kenjou.type === 'special' ? (
                            <div className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                              {verb.kenjou.word}
                            </div>
                          ) : (
                            <div className="text-sm text-slate-400 italic">
                              {verb.prefix === 'o' ? 'お' : verb.prefix === 'go' ? 'ご' : ''}~する
                            </div>
                          )}
                        </td>

                        {/* Cột Lịch Sự */}
                        <td className="py-4 px-6 bg-slate-50/50 dark:bg-slate-900/20 font-medium text-slate-700 dark:text-slate-300">
                          {verb.teinei.word || `${verb.jisho.slice(0, -1)}ます`}
                        </td>

                        {/* Cột Tôn Kính */}
                        <td className="py-4 px-6">
                          {verb.sonkei.type === 'special' ? (
                            <div className="font-bold text-rose-600 dark:text-rose-400 text-lg">
                              {verb.sonkei.word}
                            </div>
                          ) : verb.sonkei.type === 'none' ? (
                            <div className="text-sm text-slate-400 italic">
                              (Không dùng)
                            </div>
                          ) : (
                            <div className="text-sm text-slate-400 italic">
                              {verb.prefix === 'o' ? 'お' : verb.prefix === 'go' ? 'ご' : ''}~になる
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-500">
                        Không tìm thấy từ bất quy tắc nào khớp với "{searchTerm}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
