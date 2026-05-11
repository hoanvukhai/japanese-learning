// src/components/FlashcardModule/FlipCard.tsx
import { useMemo } from 'react';
import type { Word } from '../../types';
import type { FormType } from '../../context/features/flashcard/FlashcardSettingsContext';
import { useFlashcardSettings } from '../../context/features/flashcard/useFlashcardSettings';
import { FORM_REGISTRY } from '../../lib/formRegistry';
import CardFront from './CardFront';
import CardBack from './CardBack';

interface FlipCardProps {
  word: Word;
  isFlipped?: boolean;
  targetFormsOverride?: FormType[];
  /** Seed ngẫu nhiên được tạo sẵn từ QueueCard – tránh double-random giữa 2 mặt */
  cardSeed?: number;
}

const resolveForm = (form: FormType, seed: number, index: number, word: Word, excludeForms: FormType[] = []): FormType => {
  if (form !== 'random') return form;

  const validForms = FORM_REGISTRY.filter(f =>
    f.id !== 'random' &&
    (!f.validTypes || f.validTypes.includes(word.type)) &&
    !excludeForms.includes(f.id as FormType)
  );

  if (validForms.length === 0) {
    if (!excludeForms.includes('jisho')) return 'jisho';
    const anyValid = FORM_REGISTRY.filter(f => f.id !== 'random' && !excludeForms.includes(f.id as FormType));
    return anyValid.length > 0 ? (anyValid[0].id as FormType) : 'jisho';
  }

  const idx = (seed + index * 7) % validForms.length;
  return validForms[idx].id as FormType;
};

export default function FlipCard({ word, isFlipped, targetFormsOverride, cardSeed = 0 }: FlipCardProps) {
  const { settings } = useFlashcardSettings();
  const sourceForm = settings.sourceForm;
  const baseTargetForms = targetFormsOverride || settings.targetForms;

  const actualSourceForm = useMemo(
    () => resolveForm(sourceForm, cardSeed + 99, 0, word, []),
    [sourceForm, cardSeed, word]
  );

  const actualTargetForms = useMemo(
    () => {
      const targets: FormType[] = [];
      baseTargetForms.forEach((form, i) => {
        const resolved = resolveForm(form, cardSeed, i, word, [actualSourceForm, ...targets]);
        targets.push(resolved);
      });
      return targets;
    },
    [baseTargetForms, cardSeed, word, actualSourceForm]
  );

  return (
    <div className="w-80 h-96 sm:w-[30rem] sm:h-[26rem] [perspective:1000px]">
      <div
        className={`relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] shadow-2xl rounded-2xl ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
      >
        <CardFront
          word={word}
          isFlipped={isFlipped}
          actualSourceForm={actualSourceForm}
          actualTargetForms={actualTargetForms}
        />
        <CardBack
          word={word}
          isFlipped={isFlipped}
          actualTargetForms={actualTargetForms}
        />
      </div>
    </div>
  );
}