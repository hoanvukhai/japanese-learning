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

// Kanji types
export interface KanjiWord {
  id: string;               // Nên có ID cho từng từ (VD: 'kw_01_01')
  word: string;             // Từ vựng (VD: '責任')
  hiragana: string;         // Cách đọc (VD: 'seki-nin')
  hanVietWord?: string;     // Âm Hán Việt tương ứng của từ
  
  meaning: {
    vi: string;             // Nghĩa tiếng Việt (VD: 'Trách nhiệm')
    en?: string;            // Nghĩa tiếng Anh (VD: 'Responsibility')
  };
  
  type: WordType;           // RẤT QUAN TRỌNG: Để ném vào Máy chia thể
  group?: 1 | 2 | 3;        // Nhóm động từ (nếu type là 'verb')
  readingType: '音' | '訓'; // Âm On hay Âm Kun
  
  examples?: {              // Câu ví dụ
    jp: string;
    vi: string;
  }[];
}

export interface Kanji {
  id: string;               // VD: 'k_01_01'
  character: string;        // Chữ Hán (VD: '任')
  hanViet: string;          // Âm Hán Việt (VD: 'NHIỆM')
  level: JLPTLevel;         // 'N3'
  lesson: string;           // 'Bài 1'
  
  words: KanjiWord[];       // Mảng chứa các từ vựng ghép với chữ Hán này
}
