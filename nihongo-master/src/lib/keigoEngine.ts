// src/lib/keigoEngine.ts
// ============================================================
// KEIGO LOGIC ENGINE – Tự động sinh các dạng kính ngữ
// ============================================================
import type { KeigoVerb, KeigoFormKey } from '../types/keigo';
import { getMasuForm } from './conjugator';
import { keigoVerbs } from '../data/keigoDb';

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
  const wordLike = {
    id: verb.id, kanji: verb.kanji, hiragana: verb.hiragana,
    group: verb.group, type: 'verb' as const, level: 'N4' as const, meaning: verb.meaning,
  };
  return getMasuForm(wordLike).replace(/ます$/, '');
};

// ── 1. TÔN KÍNH NGỮ (尊敬語) ─────────────────────────────────
export const generateSonkei = (verb: KeigoVerb): string => {
  if (verb.sonkei.type === 'special' && verb.sonkei.word) return verb.sonkei.word;
  if (verb.sonkei.type === 'none') return '(なし)';
  const prefixKana = PREFIX_MAP[verb.prefix];
  const masuStem = getMasuStem(verb);
  if (verb.group === 3 && verb.hiragana.endsWith('する')) {
    return `${prefixKana}${masuStem.replace(/し$/, '')}になる`;
  }
  return `${prefixKana}${masuStem}になる`;
};

// ── 2. KHIÊM NHƯỜNG NGỮ (謙譲語) ─────────────────────────────
export const generateKenjou = (verb: KeigoVerb): string => {
  if (verb.kenjou.type === 'special' && verb.kenjou.word) return verb.kenjou.word;
  if (verb.kenjou.type === 'none') return '(なし)';
  const prefixKana = PREFIX_MAP[verb.prefix];
  const masuStem = getMasuStem(verb);
  if (verb.group === 3 && verb.hiragana.endsWith('する')) {
    return `${prefixKana}${masuStem.replace(/し$/, '')}する`;
  }
  return `${prefixKana}${masuStem}する`;
};

// ── 3. THỂ LỊCH SỰ (丁寧語 / Teinei) ─────────────────────────
export const generateTeinei = (verb: KeigoVerb): string => {
  if (verb.teinei.type === 'special' && verb.teinei.word) return verb.teinei.word;
  const wordLike = {
    id: verb.id, kanji: verb.kanji, hiragana: verb.hiragana,
    group: verb.group, type: 'verb' as const, level: 'N4' as const, meaning: verb.meaning,
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

// ── 5. GIẢI THÍCH QUY TẮC (Explanation Builder) ──────────────
export const buildRuleExplanation = (
  formKey: KeigoFormKey,
  verb: KeigoVerb,
  lang: 'vi' | 'en' = 'vi'
): string => {
  // Teinei: KHÔNG dùng tiền tố お/ご, chỉ chia ~ます
  if (formKey === 'teinei') {
    return lang === 'vi'
      ? 'Thể Lịch sự (丁寧語): chỉ cần chia sang dạng ~ます, không thêm tiền tố お/ご.'
      : 'Polite form (丁寧語): simply conjugate to ~ます. No お/ご prefix.';
  }

  const prefix = PREFIX_MAP[verb.prefix] || 'お';
  const suffix = formKey === 'sonkei' ? 'になる' : 'する';
  const formName = formKey === 'sonkei'
    ? (lang === 'vi' ? 'Tôn kính (尊敬語)' : 'Honorific (尊敬語)')
    : (lang === 'vi' ? 'Khiêm nhường (謙譲語)' : 'Humble (謙譲語)');

  // Nhóm 3 する: お/ご + danh từ + になる/する
  if (verb.group === 3 && verb.hiragana.endsWith('する')) {
    return lang === 'vi'
      ? `${formName}: ${prefix} + danh từ + ${suffix} (Nhóm 3 する).`
      : `${formName}: ${prefix} + noun stem + ${suffix} (Group 3 する).`;
  }

  // Nhóm 1/2: お/ご + masu-stem + になる/する
  return lang === 'vi'
    ? `${formName}: ${prefix} + masu-stem + ${suffix}.`
    : `${formName}: ${prefix} + masu-stem + ${suffix}.`;
};

// ── 6. DISTRACTOR GENERATOR (Tạo bẫy – đáp án sai) ──────────
export const generateDistractors = (
  verb: KeigoVerb,
  targetKey: KeigoFormKey,
  count = 3,
): string[] => {
  const correct = getKeigoResult(verb, targetKey);
  const pool: string[] = [];

  // Bẫy A: Các dạng Keigo khác của cùng động từ
  const otherKeys: KeigoFormKey[] = (['sonkei', 'kenjou', 'teinei'] as KeigoFormKey[])
    .filter(k => k !== targetKey);
  otherKeys.forEach(k => {
    const r = getKeigoResult(verb, k);
    if (r !== correct && r !== '(なし)') pool.push(r);
  });

  // Bẫy B: Sai tiền tố (お ↔ ご)
  const masuStem = getMasuStem(verb);
  const wrongPrefix = verb.prefix === 'o' ? 'ご' : 'お';
  if (targetKey !== 'teinei') {
    const suffix = targetKey === 'sonkei' ? 'になる' : 'する';
    if (verb.group === 3 && verb.hiragana.endsWith('する')) {
      pool.push(`${wrongPrefix}${masuStem.replace(/し$/, '')}${suffix}`);
    } else {
      pool.push(`${wrongPrefix}${masuStem}${suffix}`);
    }
  }

  // Bẫy C: Nhầm になる ↔ する (sai suffix)
  if (targetKey !== 'teinei' && verb.prefix !== 'none') {
    const wrongSuffix = targetKey === 'sonkei' ? 'する' : 'になる';
    const prefixKana = PREFIX_MAP[verb.prefix];
    pool.push(`${prefixKana}${masuStem}${wrongSuffix}`);
  }

  // Bẫy D: Double-keigo (thêm お trước từ đặc biệt)
  if (verb[targetKey].type === 'special' && verb[targetKey].word) {
    pool.push(`お${verb[targetKey].word}`);
  }

  // Lọc trùng & đúng
  let unique = [...new Set(pool)].filter(d => d !== correct && d.length > 0);

  // Fallback: dùng dạng Keigo THẬT của các động từ khác trong DB
  // → 100% hợp lệ ngữ pháp, không vô nghĩa, không trùng
  if (unique.length < count) {
    const crossPool = keigoVerbs
      .filter(v => v.id !== verb.id && v[targetKey].type !== 'none')
      .map(v => getKeigoResult(v, targetKey))
      .filter(r => r !== correct && r !== '(なし)' && !unique.includes(r));

    const shuffledCross = [...crossPool].sort(() => Math.random() - 0.5);
    unique = [...unique, ...shuffledCross].slice(0, count);
  }

  // Shuffle kết quả cuối
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }

  return unique.slice(0, count);
};
