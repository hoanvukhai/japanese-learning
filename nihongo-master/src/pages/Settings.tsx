// src/pages/Settings.tsx
import { useAuth } from '../context/auth/useAuth';
import { useSettings } from '../context/global/useSettings';
import { useAudio } from '../context/audio/useAudio';
import { Moon, Sun, Monitor, Volume2, VolumeX, Type, Globe } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const { user } = useAuth();
  const { theme, language, fontSize, updateSettings } = useSettings();
  const { isMuted, toggleMute } = useAudio();

  const translations = {
    vi: {
      title: 'Cài Đặt Hệ Thống',
      themeLabel: 'Giao diện (Theme)',
      light: 'Sáng',
      dark: 'Tối',
      system: 'Hệ thống',
      langLabel: 'Ngôn ngữ hiển thị',
      fontLabel: 'Cỡ chữ toàn cục',
      fontSmall: 'Nhỏ',
      fontBase: 'Vừa',
      fontLarge: 'Lớn',
      soundLabel: 'Âm thanh hệ thống',
      dangerZone: 'Vùng Nguy Hiểm',
      dangerDesc: 'Xóa toàn bộ tiến độ học tập trên tất cả khóa học. Hành động này không thể hoàn tác.',
      resetBtn: 'Xóa Toàn Bộ Tiến Độ',
      resetConfirm: 'Bạn có chắc chắn 100% không?',
      resetting: 'Đang xóa...',
      resetSuccess: 'Đã xóa toàn bộ dữ liệu học tập!'
    },
    en: {
      title: 'System Settings',
      themeLabel: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      langLabel: 'Display Language',
      fontLabel: 'Global Font Size',
      fontSmall: 'Small',
      fontBase: 'Medium',
      fontLarge: 'Large',
      soundLabel: 'System Sound',
      dangerZone: 'Danger Zone',
      dangerDesc: 'Reset all learning progress across all courses. This action cannot be undone.',
      resetBtn: 'Delete All Progress',
      resetConfirm: 'Are you 100% sure?',
      resetting: 'Deleting...',
      resetSuccess: 'All progress deleted successfully.'
    }
  };
  const t = translations[language as keyof typeof translations] || translations.vi;

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto animate-in fade-in">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-8 transition-colors">{t.title}</h1>

      <div className="space-y-6">
        {/* KHỐI 1: GIAO DIỆN */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white transition-colors">
            <Monitor size={20} /> {t.themeLabel}
          </h2>
          <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl transition-colors">
            {(['light', 'dark', 'system'] as const).map((tTheme) => (
              <button
                key={tTheme}
                onClick={() => updateSettings({ theme: tTheme as typeof theme })}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${theme === tTheme ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                  }`}
              >
                {tTheme === 'light' && <><Sun size={18} /> {t.light}</>}
                {tTheme === 'dark' && <><Moon size={18} /> {t.dark}</>}
                {tTheme === 'system' && <><Monitor size={18} /> {t.system}</>}
              </button>
            ))}
          </div>
        </div>

        {/* KHỐI 2: NGÔN NGỮ */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center transition-colors">
          <div className="flex items-center gap-2">
            <Globe size={20} className="dark:text-white transition-colors" />
            <span className="font-semibold dark:text-white transition-colors">{t.langLabel}</span>
          </div>
          <select
            value={language}
            onChange={(e) => updateSettings({ language: e.target.value as 'vi' | 'en' })}
            className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-slate-800 dark:text-white rounded-lg p-2.5 outline-none transition-colors"
          >
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* KHỐI 3: CỠ CHỮ */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 dark:text-white transition-colors">
            <Type size={20} /> {t.fontLabel}
          </h2>
          <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl transition-colors">
            {(['sm', 'base', 'lg'] as const).map((size) => (
              <button
                key={size}
                onClick={() => updateSettings({ fontSize: size })}
                className={`flex-1 py-2 rounded-lg transition-all ${fontSize === size ? 'bg-white dark:bg-slate-600 shadow-sm font-bold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                  }`}
              >
                {size === 'sm' ? t.fontSmall : size === 'base' ? t.fontBase : t.fontLarge}
              </button>
            ))}
          </div>
        </div>

        {/* KHỐI 4: ÂM THANH */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex justify-between items-center transition-colors">
          <div className="flex items-center gap-2">
            {!isMuted ? <Volume2 size={20} className="text-blue-600" /> : <VolumeX size={20} className="text-gray-400" />}
            <span className="font-semibold dark:text-white transition-colors">{t.soundLabel}</span>
          </div>
          <button
            onClick={toggleMute}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${!isMuted ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${!isMuted ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>



      </div>
    </div>
  );
}