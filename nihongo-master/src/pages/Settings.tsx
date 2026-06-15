// src/pages/Settings.tsx
import { useSettings } from '../context/global/useSettings';
import { Moon, Sun, Monitor, Volume2, VolumeX, Type, Globe, Trash2 } from 'lucide-react';

export default function Settings() {
  const { theme, language, soundEnabled, fontSize, updateSettings } = useSettings();

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
      dangerZone: 'Xóa Dữ Liệu Cá Nhân',
      resetDataWarn: 'Cảnh báo: Thao tác này sẽ xóa vĩnh viễn toàn bộ tiến độ học tập, điểm số, và kỷ lục cá nhân. Dữ liệu không thể khôi phục.',
      resetDataBtn: 'Xóa Tất Cả Dữ Liệu',
      resetConfirm: "⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ tiến độ học tập và kỷ lục đua top không? Dữ liệu này không thể khôi phục!",
      resetSuccess: "Đã reset dữ liệu thành công! Ứng dụng sẽ tải lại."
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
      resetDataWarn: 'Warning: This action will permanently delete all your learning progress and competition records. This data cannot be restored.',
      resetDataBtn: 'Reset All Data',
      resetConfirm: "⚠️ WARNING: Are you sure you want to delete all your learning progress and competition records? This data cannot be restored!",
      resetSuccess: "All data has been successfully reset! The application will now reload."
    }
  };
  const t = translations[language as keyof typeof translations] || translations.vi;

  const handleResetData = () => {
    // 1. Hiển thị cảnh báo xác nhận
    const isConfirmed = window.confirm(
      t.resetConfirm
    );

    // 2. Nếu người dùng chọn "OK"
    if (isConfirmed) {
      // Xóa toàn bộ dữ liệu trong LocalStorage
      localStorage.clear();

      // Nếu bạn có dùng cả SessionStorage thì thêm dòng này:
      sessionStorage.clear();

      // 3. Thông báo thành công và Tải lại trang để giao diện cập nhật lại từ đầu
      alert(t.resetSuccess);
      window.location.reload();
    }
  };

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
            {soundEnabled ? <Volume2 size={20} className="text-blue-600" /> : <VolumeX size={20} className="text-gray-400" />}
            <span className="font-semibold dark:text-white transition-colors">{t.soundLabel}</span>
          </div>
          <button
            onClick={() => updateSettings({ soundEnabled: !soundEnabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${soundEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        {/* KHỐI 5: XÓA TOÀN BỘ DỮ LIỆU (Bổ sung) */}
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-700 p-6 rounded-2xl shadow-sm transition-colors">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-700 dark:text-red-400">
            <Trash2 size={20} /> {t.dangerZone}
          </h2>
          <p className="text-sm text-red-600 dark:text-red-300 mb-4">
            {t.resetDataWarn}
          </p>
          <button
            onClick={handleResetData}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> {t.resetDataBtn}
          </button>
        </div>

      </div>
    </div>
  );
}