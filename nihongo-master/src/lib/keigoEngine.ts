// src/lib/keigoEngine.ts
// ============================================================
// KEIGO LOGIC ENGINE – Tự động sinh các dạng kính ngữ
// ============================================================
import type { KeigoVerb, KeigoFormKey } from '../types/keigo';
import { getMasuForm } from './conjugator';

const PREFIX_MAP: Record<string, string> = {
  o: 'お',
  go: 'ご',
  none: '',
};

/**
 * Lấy Masu-stem từ động từ (phần trước ます)
 * VD: 書きます → 書き | 食べます → 食べ
 */
const getMasuStem = (verb: KeigoVerb): string => {
  // getMasuForm nhận Word-like; KeigoVerb tương thích (có kanji, hiragana, group, isSpecial?)
  const wordLike = {
    id: verb.id,
    kanji: verb.kanji,
    hiragana: verb.hiragana,
    group: verb.group,
    type: 'verb' as const,
    level: 'N4' as const,
    meaning: verb.meaning,
  };
  const masuFull = getMasuForm(wordLike);
  return masuFull.replace('ます', '');
};

// ── 1. TÔN KÍNH NGỮ (尊敬語) ─────────────────────────────────
export const generateSonkei = (verb: KeigoVerb): string => {
  if (verb.sonkei.type === 'special' && verb.sonkei.word) {
    return verb.sonkei.word;
  }
  if (verb.sonkei.type === 'none') return '(なし)';

  const prefixKana = PREFIX_MAP[verb.prefix];
  const masuStem = getMasuStem(verb);

  // Nhóm 3 する: Bỏ し, giữ danh từ + prefix + になる
  if (verb.group === 3 && verb.hiragana.endsWith('する')) {
    const nounStem = masuStem.replace(/し$/, '');
    return `${prefixKana}${nounStem}になる`;
  }

  return `${prefixKana}${masuStem}になる`;
};

// ── 2. KHIÊM NHƯỜNG NGỮ (謙譲語) ─────────────────────────────
export const generateKenjou = (verb: KeigoVerb): string => {
  if (verb.kenjou.type === 'special' && verb.kenjou.word) {
    return verb.kenjou.word;
  }
  if (verb.kenjou.type === 'none') return '(なし)';

  const prefixKana = PREFIX_MAP[verb.prefix];
  const masuStem = getMasuStem(verb);

  if (verb.group === 3 && verb.hiragana.endsWith('する')) {
    const nounStem = masuStem.replace(/し$/, '');
    return `${prefixKana}${nounStem}する`;
  }

  return `${prefixKana}${masuStem}する`;
};

// ── 3. THỂ LỊCH SỰ (丁寧語 / Teinei) ─────────────────────────
export const generateTeinei = (verb: KeigoVerb): string => {
  if (verb.teinei.type === 'special' && verb.teinei.word) {
    return verb.teinei.word;
  }

  const wordLike = {
    id: verb.id,
    kanji: verb.kanji,
    hiragana: verb.hiragana,
    group: verb.group,
    type: 'verb' as const,
    level: 'N4' as const,
    meaning: verb.meaning,
  };
  return getMasuForm(wordLike);
};

// ── 4. HELPER: Lấy kết quả theo key ──────────────────────────
export const getKeigoResult = (verb: KeigoVerb, key: KeigoFormKey): string => {
  switch (key) {
    case 'sonkei': return generateSonkei(verb);
    case 'kenjou': return generateKenjou(verb);
    case 'teinei': return generateTeinei(verb);
  }
};

// ── 5. DISTRACTOR GENERATOR (Tạo bẫy – đáp án sai) ──────────
export const generateDistractors = (
  verb: KeigoVerb,
  targetKey: KeigoFormKey,
  count = 3,
): string[] => {
  const correct = getKeigoResult(verb, targetKey);
  const pool: string[] = [];

  // Bẫy 1: Lấy đáp án của 2 key còn lại
  const otherKeys: KeigoFormKey[] = (['sonkei', 'kenjou', 'teinei'] as KeigoFormKey[]).filter(k => k !== targetKey);
  otherKeys.forEach(k => {
    const r = getKeigoResult(verb, k);
    if (r !== correct && r !== '(なし)') pool.push(r);
  });

  // Bẫy 2: Sai tiền tố (O ↔ GO)
  const masuStem = getMasuStem(verb);
  const wrongPrefix = verb.prefix === 'o' ? 'ご' : verb.prefix === 'go' ? 'お' : 'お';
  const suffix = targetKey === 'sonkei' ? 'になる' : 'する';
  if (verb.group === 3 && verb.hiragana.endsWith('する')) {
    const nounStem = masuStem.replace(/し$/, '');
    pool.push(`${wrongPrefix}${nounStem}${suffix}`);
  } else {
    pool.push(`${wrongPrefix}${masuStem}${suffix}`);
  }

  // Bẫy 3: Double-keigo (thêm お trước từ đặc biệt)
  if (verb[targetKey].type === 'special' && verb[targetKey].word) {
    pool.push(`お${verb[targetKey].word}`);
  }

  // Bẫy 4: Nhầm になる ↔ する
  if (verb.prefix !== 'none') {
    const wrongSuffix = targetKey === 'sonkei' ? 'する' : 'になる';
    const prefixKana = PREFIX_MAP[verb.prefix];
    pool.push(`${prefixKana}${masuStem}${wrongSuffix}`);
  }

  // Lọc trùng & đúng
  const unique = [...new Set(pool)].filter(d => d !== correct && d.length > 0);

  // Shuffle
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }

  return unique.slice(0, count);
};
