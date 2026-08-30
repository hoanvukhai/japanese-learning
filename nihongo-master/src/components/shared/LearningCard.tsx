
import type { LearningItem } from '../../types';
import JapaneseGrammarCard from '../grammar/JapaneseGrammarCard';
import JapaneseKanjiCard from '../kanji/JapaneseKanjiCard';
import JapaneseVocabCard from '../vocabulary/JapaneseVocabCard';

interface LearningCardProps {
  item: LearningItem;
  language: string;
  index: number;
  showFurigana?: boolean;
}

export default function LearningCard({ item, language, index, showFurigana = false }: LearningCardProps) {
  if (item.template === 'japanese') {
    // If it's a grammar item (has 'structure')
    if ('structure' in item) {
      return <JapaneseGrammarCard item={item} language={language} index={index} showFurigana={showFurigana} />;
    }
    // If it's a kanji item (has 'character' AND 'hanViet')
    if ('character' in item && 'hanViet' in item) {
      return <JapaneseKanjiCard item={item} language={language} index={index} />;
    }
    // If it's a vocab item (has 'kanji' or 'hiragana' but no 'structure' or 'character')
    if ('kanji' in item && 'hiragana' in item) {
      return <JapaneseVocabCard item={item as any} language={language} index={index} />;
    }
  }

  // Fallback generic card
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="font-bold text-slate-800 dark:text-white">
        {'structure' in item ? (item as any).structure : 'character' in item ? (item as any).character : 'Unknown Item'}
      </div>
      <div className="text-sm text-slate-500 mt-2">
        Template: {item.template}
      </div>
    </div>
  );
}
