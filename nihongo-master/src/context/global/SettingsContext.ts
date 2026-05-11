import { createContext } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'vi' | 'en';
export type FontSize = 'sm' | 'base' | 'lg';

export interface SettingsState {
  theme: Theme;
  language: Language;
  soundEnabled: boolean;
  fontSize: FontSize;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
}

// Khởi tạo giá trị mặc định
export const defaultSettings: SettingsState = {
  theme: 'system',
  language: 'vi',
  soundEnabled: true,
  fontSize: 'base',
  updateSettings: () => {},
};

// Tạo Context (Cái thùng rỗng chờ đổ dữ liệu vào)
export const SettingsContext = createContext<SettingsState>(defaultSettings);