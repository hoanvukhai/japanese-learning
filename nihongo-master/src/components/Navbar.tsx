// src/components/Navbar.tsx
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Book, Gamepad2, Settings, GraduationCap, Menu, X } from 'lucide-react';
import { useSettings } from '../context/global/useSettings';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { language } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);

  const t = {
    vi: { home: 'Trang chủ', dict: 'Từ điển', study: 'Học tập', practice: 'Luyện tập', settings: 'Cài đặt' },
    en: { home: 'Home', dict: 'Dictionary', study: 'Study', practice: 'Practice', settings: 'Settings' }
  }[language];

  const links = [
    { to: '/', end: true, icon: Home, label: t.home },
    { to: '/dictionary', end: false, icon: Book, label: t.dict },
    { to: '/study', end: false, icon: GraduationCap, label: t.study },
    { to: '/practice', end: false, icon: Gamepad2, label: t.practice },
    { to: '/settings', end: false, icon: Settings, label: t.settings },
  ];

  // Desktop link style
  const desktopNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm ${isActive
      ? 'bg-blue-600 text-white shadow-md'
      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
    }`;

  // Mobile drawer link style
  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all text-base ${isActive
      ? 'bg-blue-600 text-white shadow-sm'
      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'
    }`;

  return (
    <>
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-100 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <div className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-colors flex-shrink-0">
            <span className="text-blue-600 text-xl font-black">あ</span>
            <span className="hidden sm:inline">Nihongo Master</span>
            <span className="sm:hidden">NM</span>
          </div>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map(link => {
              const Icon = link.icon;
              return (
                <NavLink key={link.to} to={link.to} end={link.end} className={desktopNavClass} onClick={() => setMenuOpen(false)}>
                  <Icon size={16} />
                  <span className="hidden md:inline">{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-40 sm:hidden"
              onClick={() => setMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="fixed top-0 right-0 h-full w-72 max-w-[80vw] bg-white dark:bg-slate-800 shadow-2xl z-50 sm:hidden flex flex-col"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <div className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <span className="text-blue-600 text-xl font-black">あ</span>
                  Nihongo Master
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer links */}
              <nav className="flex flex-col gap-1 p-4 flex-1">
                {links.map(link => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.end}
                      className={mobileNavClass}
                      onClick={() => setMenuOpen(false)}
                    >
                      <Icon size={20} />
                      {link.label}
                    </NavLink>
                  );
                })}
              </nav>

              {/* Drawer footer */}
              <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400 dark:text-slate-500 text-center">Nihongo Master © 2025</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}