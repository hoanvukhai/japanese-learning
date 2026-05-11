// src/components/Navbar.tsx
import { NavLink } from 'react-router-dom';
import { Home, Book, Gamepad2, Settings, GraduationCap } from 'lucide-react';
import { useSettings } from '../context/global/useSettings';

export default function Navbar() {
  const { language } = useSettings();

  // Khai báo bộ từ điển đơn giản cho Navbar
  const t = {
    vi: { home: 'Trang chủ', dict: 'Từ điển', study: 'Học tập', practice: 'Luyện tập', settings: 'Cài đặt' },
    en: { home: 'Home', dict: 'Dictionary', study: 'Study', practice: 'Practice', settings: 'Settings' }
  }[language];

  // Hàm tạo style cho nút đang được chọn (Active)
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all ${isActive
      ? 'bg-blue-600 text-white shadow-md'
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
    }`;

  return (
    <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-100 dark:border-slate-700 p-4 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        {/* Logo */}
        <div className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-colors">
          <span className="text-blue-600 text-2xl">あ</span>
          Nihongo Master
        </div>

        {/* Links */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 justify-between sm:justify-start custom-scrollbar">
          <NavLink to="/" className={navClass}>
            <Home size={18} /> <span className="hidden md:inline">{t.home}</span>
          </NavLink>
          <NavLink to="/dictionary" className={navClass}>
            <Book size={18} /> <span className="hidden md:inline">{t.dict}</span>
          </NavLink>
          <NavLink to="/study" className={navClass}>
            <GraduationCap size={18} /> <span className="hidden md:inline">{t.study}</span>
          </NavLink>
          <NavLink to="/practice" className={navClass}>
            <Gamepad2 size={18} /> <span className="hidden md:inline">{t.practice}</span>
          </NavLink>
          <NavLink to="/settings" className={navClass}>
            <Settings size={18} /> <span className="hidden md:inline">{t.settings}</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}