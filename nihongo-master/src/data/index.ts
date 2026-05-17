import verbs from './verbs.json';
import adjectives from './adjectives.json';
import nouns from './nouns.json';
import { vocabularyN3 } from './vocabularyN3';
import type { Word } from '../types';

// Ép kiểu một lần duy nhất ở đây
export const vocabulary: Word[] = [...verbs, ...adjectives, ...nouns, ...vocabularyN3] as unknown as Word[];