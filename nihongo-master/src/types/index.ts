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

// Grammar types
export interface GrammarExample {
  jp: string;               // C\u00e2u v\u00ed d\u1ee5 ti\u1ebfng Nh\u1eadt, c\u00f3 d\u1ea5u [...] \u0111\u00e1nh d\u1ea5u \u0111i\u1ec3m r\u01a1i ng\u1eef ph\u00e1p: "妹は犬を怖[がる]。"
  kana: string;             // \u0110\u1ecdc to\u00e0n b\u1ed9 b\u1eb1ng hiragana, c\u0169ng c\u00f3 [...]: "いもうとはいぬをこわ[がる]。"
  vi: string;               // Ngh\u0129a ti\u1ebfng Vi\u1ec7t
  en?: string;              // Ngh\u0129a ti\u1ebfng Anh (optional)
}

export interface GrammarItem {
  id: string;               // VD: 'g_01_01' \u2014 1 ID = 1 m\u1eabu \u0111\u1ed9c l\u1eadp (Atomic)
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'; // Scalability
  structure: string;        // C\u1ea5u tr\u00fac (VD: '\u301c\u304c\u308b')
  structureKana: string;    // \u0110\u1ecdc b\u1eb1ng kana (VD: '\u301c\u304c\u308b') \u2014 d\u00f9ng \u0111\u1ec3 search hi\u1ebfragana
  meaning: {
    vi: string;
    en?: string;
  };                        // Ngh\u0129a ti\u1ebfng Vi\u1ec7t v\u00e0 ti\u1ebfng Anh ng\u1eafn g\u1ecdn
  formation: string[];      // C\u00e1ch th\u00e0nh l\u1eadp (m\u1ea3ng c\u00e1c d\u1ea1ng bi\u1ebfn th\u1ec3)
  lesson: string;           // 'B\u00e0i 1' \u2014 d\u00f9ng cho ch\u1ebf \u0111\u1ed9 H\u1ecdc theo b\u00e0i
  group: string;            // 'Emotion_Desire' \u2014 d\u00f9ng cho Game \u0111\u1ed1i kh\u00e1ng
  confusedWith?: string[];  // C\u00e1c c\u1ea5u tr\u00fac d\u1ec5 nh\u1ea7m l\u1eabn: ['\u301c\u305f\u3044', '\u301c\u3066\u307b\u3057\u3044']
  caution: {
    vi: string;
    en?: string;
  };                        // L\u1eddi nh\u1eafc b\u1eaby JLPT
  examples: GrammarExample[]; // C\u00e2u v\u00ed d\u1ee5
}

