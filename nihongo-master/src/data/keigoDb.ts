// src/data/keigoDb.ts
import type { KeigoVerb } from '../types/keigo';

export const keigoVerbs: KeigoVerb[] = [
  // ────────── NHÓM ĐẶC BIỆT HOÀN TOÀN ──────────

  // 1. いく / くる / いる (Di chuyển & Tồn tại)
  {
    id: 'k_v01',
    jisho: '行く', kanji: '行く', hiragana: 'いく', group: 1, prefix: 'none',
    meaning: { vi: 'Đi', en: 'Go' },
    sonkei: { type: 'special', word: 'いらっしゃる' },
    kenjou: { type: 'special', word: '参る' },
    teinei: { type: 'special', word: '行きます' },
    note: { vi: 'Sonkei của 行く・来る・いる đều là いらっしゃる', en: 'Sonkei of 行く/来る/いる all share いらっしゃる' },
  },
  {
    id: 'k_v02',
    jisho: '来る', kanji: '来る', hiragana: 'くる', group: 3, prefix: 'none',
    meaning: { vi: 'Đến', en: 'Come' },
    sonkei: { type: 'special', word: 'いらっしゃる' },
    kenjou: { type: 'special', word: '参る' },
    teinei: { type: 'special', word: '来ます' },
  },
  {
    id: 'k_v03',
    jisho: 'いる', kanji: 'いる', hiragana: 'いる', group: 2, prefix: 'none',
    meaning: { vi: 'Có mặt / Ở', en: 'Be / Stay' },
    sonkei: { type: 'special', word: 'いらっしゃる' },
    kenjou: { type: 'special', word: 'おる' },
    teinei: { type: 'special', word: 'います' },
  },

  // 2. ăn / uống
  {
    id: 'k_v04',
    jisho: '食べる', kanji: '食べる', hiragana: 'たべる', group: 2, prefix: 'none',
    meaning: { vi: 'Ăn', en: 'Eat' },
    sonkei: { type: 'special', word: '召し上がる' },
    kenjou: { type: 'special', word: 'いただく' },
    teinei: { type: 'rule', word: null },
  },
  {
    id: 'k_v05',
    jisho: '飲む', kanji: '飲む', hiragana: 'のむ', group: 1, prefix: 'none',
    meaning: { vi: 'Uống', en: 'Drink' },
    sonkei: { type: 'special', word: '召し上がる' },
    kenjou: { type: 'special', word: 'いただく' },
    teinei: { type: 'rule', word: null },
  },

  // 3. Nói / Hỏi / Trả lời
  {
    id: 'k_v06',
    jisho: '言う', kanji: '言う', hiragana: 'いう', group: 1, prefix: 'none',
    meaning: { vi: 'Nói', en: 'Say' },
    sonkei: { type: 'special', word: 'おっしゃる' },
    kenjou: { type: 'special', word: '申す' },
    teinei: { type: 'rule', word: null },
  },
  {
    id: 'k_v07',
    jisho: '聞く', kanji: '聞く', hiragana: 'きく', group: 1, prefix: 'o',
    meaning: { vi: 'Hỏi / Nghe', en: 'Ask / Listen' },
    sonkei: { type: 'rule', word: null },   // → お聞きになる
    kenjou: { type: 'special', word: '伺う' },
    teinei: { type: 'rule', word: null },
    note: { vi: 'Kenjou: 伺う dùng cho hỏi/thăm hỏi; お聞きする cũng có thể dùng', en: 'Kenjou: 伺う for asking/visiting; お聞きする is also acceptable' },
  },

  // 4. Nhìn / Xem
  {
    id: 'k_v08',
    jisho: '見る', kanji: '見る', hiragana: 'みる', group: 2, prefix: 'none',
    meaning: { vi: 'Nhìn / Xem', en: 'See / Watch' },
    sonkei: { type: 'special', word: 'ご覧になる' },
    kenjou: { type: 'special', word: '拝見する' },
    teinei: { type: 'rule', word: null },
  },

  // 5. Biết / Hiểu
  {
    id: 'k_v09',
    jisho: '知る', kanji: '知る', hiragana: 'しる', group: 1, prefix: 'none',
    meaning: { vi: 'Biết', en: 'Know' },
    sonkei: { type: 'special', word: 'ご存知だ' },
    kenjou: { type: 'special', word: '存じる' },
    teinei: { type: 'rule', word: null },
  },

  // 6. Cho / Tặng
  {
    id: 'k_v10',
    jisho: 'あげる', kanji: 'あげる', hiragana: 'あげる', group: 2, prefix: 'none',
    meaning: { vi: 'Cho (người khác)', en: 'Give (to others)' },
    sonkei: { type: 'none', word: null },
    kenjou: { type: 'special', word: '差し上げる' },
    teinei: { type: 'rule', word: null },
  },
  {
    id: 'k_v11',
    jisho: 'もらう', kanji: 'もらう', hiragana: 'もらう', group: 1, prefix: 'none',
    meaning: { vi: 'Nhận (từ người khác)', en: 'Receive' },
    sonkei: { type: 'none', word: null },
    kenjou: { type: 'special', word: 'いただく' },
    teinei: { type: 'rule', word: null },
  },
  {
    id: 'k_v12',
    jisho: 'くれる', kanji: 'くれる', hiragana: 'くれる', group: 2, prefix: 'none',
    meaning: { vi: 'Cho (ta)', en: 'Give (to me)' },
    sonkei: { type: 'special', word: 'くださる' },
    kenjou: { type: 'none', word: null },
    teinei: { type: 'rule', word: null },
  },

  // 7. Làm / Thực hiện
  {
    id: 'k_v13',
    jisho: 'する', kanji: 'する', hiragana: 'する', group: 3, prefix: 'none',
    meaning: { vi: 'Làm / Thực hiện', en: 'Do' },
    sonkei: { type: 'special', word: 'なさる' },
    kenjou: { type: 'special', word: 'いたす' },
    teinei: { type: 'special', word: 'します' },
  },

  // 8. Theo Quy Tắc – Nhóm 1 (dùng お)
  {
    id: 'k_v14',
    jisho: '書く', kanji: '書く', hiragana: 'かく', group: 1, prefix: 'o',
    meaning: { vi: 'Viết', en: 'Write' },
    sonkei: { type: 'rule', word: null },  // → お書きになる
    kenjou: { type: 'rule', word: null },  // → お書きする
    teinei: { type: 'rule', word: null },
  },
  {
    id: 'k_v15',
    jisho: '待つ', kanji: '待つ', hiragana: 'まつ', group: 1, prefix: 'o',
    meaning: { vi: 'Chờ', en: 'Wait' },
    sonkei: { type: 'rule', word: null },  // → お待ちになる
    kenjou: { type: 'rule', word: null },  // → お待ちする
    teinei: { type: 'rule', word: null },
  },
  {
    id: 'k_v16',
    jisho: '読む', kanji: '読む', hiragana: 'よむ', group: 1, prefix: 'o',
    meaning: { vi: 'Đọc', en: 'Read' },
    sonkei: { type: 'rule', word: null },
    kenjou: { type: 'rule', word: null },
    teinei: { type: 'rule', word: null },
  },

  // 9. Theo Quy Tắc – Nhóm 2 (dùng お)
  {
    id: 'k_v17',
    jisho: '教える', kanji: '教える', hiragana: 'おしえる', group: 2, prefix: 'o',
    meaning: { vi: 'Dạy / Cho biết', en: 'Teach / Tell' },
    sonkei: { type: 'rule', word: null },  // → お教えになる
    kenjou: { type: 'rule', word: null },  // → お教えする
    teinei: { type: 'rule', word: null },
  },
  {
    id: 'k_v18',
    jisho: '見せる', kanji: '見せる', hiragana: 'みせる', group: 2, prefix: 'o',
    meaning: { vi: 'Cho xem', en: 'Show' },
    sonkei: { type: 'rule', word: null },
    kenjou: { type: 'rule', word: null },
    teinei: { type: 'rule', word: null },
  },

  // 10. Theo Quy Tắc – Nhóm 3 する (dùng ご)
  {
    id: 'k_v19',
    jisho: '案内する', kanji: '案内する', hiragana: 'あんないする', group: 3, prefix: 'go',
    meaning: { vi: 'Hướng dẫn', en: 'Guide' },
    sonkei: { type: 'rule', word: null },  // → ご案内になる
    kenjou: { type: 'rule', word: null },  // → ご案内する
    teinei: { type: 'rule', word: null },
  },
  {
    id: 'k_v20',
    jisho: '連絡する', kanji: '連絡する', hiragana: 'れんらくする', group: 3, prefix: 'go',
    meaning: { vi: 'Liên lạc', en: 'Contact' },
    sonkei: { type: 'rule', word: null },
    kenjou: { type: 'rule', word: null },
    teinei: { type: 'rule', word: null },
  },
  {
    id: 'k_v21',
    jisho: '説明する', kanji: '説明する', hiragana: 'せつめいする', group: 3, prefix: 'go',
    meaning: { vi: 'Giải thích', en: 'Explain' },
    sonkei: { type: 'rule', word: null },
    kenjou: { type: 'rule', word: null },
    teinei: { type: 'rule', word: null },
  },

  // 11. Thêm một số từ phổ biến N4/N3
  {
    id: 'k_v22',
    jisho: '訪ねる', kanji: '訪ねる', hiragana: 'たずねる', group: 2, prefix: 'o',
    meaning: { vi: 'Thăm / Ghé thăm', en: 'Visit' },
    sonkei: { type: 'rule', word: null },
    kenjou: { type: 'special', word: '伺う' },
    teinei: { type: 'rule', word: null },
  },
  {
    id: 'k_v23',
    jisho: '受け取る', kanji: '受け取る', hiragana: 'うけとる', group: 1, prefix: 'o',
    meaning: { vi: 'Nhận (tài liệu/vật)', en: 'Receive (item)' },
    sonkei: { type: 'rule', word: null },
    kenjou: { type: 'special', word: '頂戴する' },
    teinei: { type: 'rule', word: null },
  },
];
