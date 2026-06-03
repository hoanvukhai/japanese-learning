// src/data/keigoVocabDb.ts

export interface KeigoVocab {
  id: string;
  normal: string;
  normalHiragana?: string;
  polite: string;
  politeHiragana?: string;
  meaning: { vi: string; en: string };
}

export const keigoVocabList: KeigoVocab[] = [
  { id: 'kv_01', normal: '僕・わたし', normalHiragana: 'ぼく・わたし', polite: 'わたくし', politeHiragana: 'わたくし', meaning: { vi: 'Tôi', en: 'I/Me' } },
  { id: 'kv_02', normal: '今', normalHiragana: 'いま', polite: 'ただ今', politeHiragana: 'ただいま', meaning: { vi: 'Bây giờ', en: 'Now' } },
  { id: 'kv_03', normal: '今度', normalHiragana: 'こんど', polite: 'この度', politeHiragana: 'このたび', meaning: { vi: 'Lần này', en: 'This time' } },
  { id: 'kv_04', normal: 'このあいだ', normalHiragana: 'このあいだ', polite: '先日', politeHiragana: 'せんじつ', meaning: { vi: 'Mấy hôm trước', en: 'The other day' } },
  { id: 'kv_05', normal: 'きのう', normalHiragana: 'きのう', polite: '昨日', politeHiragana: 'さくじつ', meaning: { vi: 'Hôm qua', en: 'Yesterday' } },
  { id: 'kv_06', normal: 'きょう', normalHiragana: 'きょう', polite: '本日', politeHiragana: 'ほんじつ', meaning: { vi: 'Hôm nay', en: 'Today' } },
  { id: 'kv_07', normal: 'あした', normalHiragana: 'あした', polite: 'みょうにち', politeHiragana: 'みょうにち', meaning: { vi: 'Ngày mai', en: 'Tomorrow' } },
  { id: 'kv_08', normal: 'さっき', normalHiragana: 'さっき', polite: 'さきほど', politeHiragana: 'さきほど', meaning: { vi: 'Lúc trước / Lúc nãy', en: 'Earlier' } },
  { id: 'kv_09', normal: 'あとで', normalHiragana: 'あとで', polite: 'のちほど', politeHiragana: 'のちほど', meaning: { vi: 'Sau đây / Lát nữa', en: 'Later' } },
  { id: 'kv_10', normal: 'こっち', normalHiragana: 'こっち', polite: 'こちら', politeHiragana: 'こちら', meaning: { vi: 'Phía này / Chúng tôi', en: 'This way/us' } },
  { id: 'kv_11', normal: 'そっち', normalHiragana: 'そっち', polite: 'そちら', politeHiragana: 'そちら', meaning: { vi: 'Phía kia / Các vị', en: 'That way/you' } },
  { id: 'kv_12', normal: 'あっち', normalHiragana: 'あっち', polite: 'あちら', politeHiragana: 'あちら', meaning: { vi: 'Phía đó', en: 'Over there' } },
  { id: 'kv_13', normal: 'どっち', normalHiragana: 'どっち', polite: 'どちら', politeHiragana: 'どちら', meaning: { vi: 'Phía nào / Bên nào', en: 'Which way' } },
  { id: 'kv_14', normal: 'だれ', normalHiragana: 'だれ', polite: 'どなた', politeHiragana: 'どなた', meaning: { vi: 'Ai', en: 'Who' } },
  { id: 'kv_15', normal: 'どこ', normalHiragana: 'どこ', polite: 'どちら', politeHiragana: 'どちら', meaning: { vi: 'Ở đâu', en: 'Where' } },
  { id: 'kv_16', normal: 'どう', normalHiragana: 'どう', polite: 'いかが', politeHiragana: 'いかが', meaning: { vi: 'Như thế nào', en: 'How' } },
  { id: 'kv_17', normal: '本当に', normalHiragana: 'ほんとうに', polite: '誠に', politeHiragana: 'まことに', meaning: { vi: 'Thật sự là', en: 'Truly' } },
  { id: 'kv_18', normal: 'すごく', normalHiragana: 'すごく', polite: 'たいへん', politeHiragana: 'たいへん', meaning: { vi: 'Rất', en: 'Very' } },
  { id: 'kv_19', normal: 'ちょっと', normalHiragana: 'ちょっと', polite: '少々', politeHiragana: 'しょうしょう', meaning: { vi: 'Một chút', en: 'A little' } },
  { id: 'kv_20', normal: 'いくら', normalHiragana: 'いくら', polite: 'いかほど', politeHiragana: 'いかほど', meaning: { vi: 'Bao nhiêu', en: 'How much' } },
  { id: 'kv_21', normal: 'すみません', normalHiragana: 'すみません', polite: '申し訳ありません', politeHiragana: 'もうしわけありません', meaning: { vi: 'Xin lỗi', en: 'I am sorry' } },
  { id: 'kv_22', normal: '～さん', normalHiragana: 'さん', polite: '～様', politeHiragana: 'さま', meaning: { vi: 'Ông/Bà/Ngài', en: 'Mr./Ms.' } },
];
