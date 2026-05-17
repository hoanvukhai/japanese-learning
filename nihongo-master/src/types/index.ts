// src/types/index.ts

export type WordType = 'verb' | 'adj_i' | 'adj_na' | 'noun' | 'adv' | 'expression';
export type VerbGroup = 1 | 2 | 3 | null;
export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface Word {
  id: string;
  kanji: string;
  alt_kanji?: string;
  hiragana: string; // Cách đọc (furigana)
  romaji?: string;
  meaning: {vi: string; en: string} | string; // Hỗ trợ cả dạng chuỗi đơn giản và đối tượng đa ngôn ngữ
  type: WordType;
  group?: VerbGroup; // Bắt buộc với động từ (1, 2, 3), undefined/null với loại khác
  level: JLPTLevel;
  isSpecial?: boolean; // Đánh dấu các trường hợp bất quy tắc (ví dụ: 行く)
  lesson?: string; // Ví dụ: "Bài 1", "Chương 3", "Topic: Gia đình"
  examples?: { jp: string; vi: string }[];
}

// Thêm vào src/types/index.ts
export type FormType = 'jisho' | 'masu' | 'te' | 'nai' | 'ta' | 'nakatta';
export type FlashcardMode = 'endless' | 'quiz';

export interface FlashcardSettingsState {
  // Khối A
  poolSize: number | 'all';
  sourceForm: FormType;
  targetForms: FormType[];
  
  // Khối B
  uiFront: { showKanji: boolean; showFurigana: boolean; showMeaning: boolean };
  uiBack: { showAnswer: boolean; showRomaji: boolean; showRule: boolean };
  
  // Khối C & D
  playMode: FlashcardMode;
  autoPlayAudio: boolean;
}