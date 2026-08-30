import { vocabularyN3 } from '../jlpt/n3/vocabularyN3';
import { kanjiN3 } from '../jlpt/n3/kanjiN3';
import { grammarN3 } from '../jlpt/n3/grammarN3';
import { keigoVerbs } from '../jlpt/keigo/keigoDb';
import verbsConjugation from '../jlpt/conjugation/verbs.json';

export type SubjectType = 'vocab' | 'kanji_single' | 'kanji_words' | 'grammar' | 'special';
export type LevelType = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'ALL';

export type TemplateType = 'japanese' | 'english' | 'generic';
export type ExtractType = 'all' | 'kanji_only' | 'vocabulary_only';

export interface Course {
  id: string;
  name: string;
  description: string;
  subject: SubjectType;
  level: LevelType;
  color: string;
  data: any[]; // The raw data array
  template?: TemplateType;
  extractType?: ExtractType;
}

// Giả lập chia nhỏ các khóa học dựa trên Data tĩnh hiện tại
export const COURSE_REGISTRY: Course[] = [
  {
    id: 'n3-vocab-core',
    name: 'Từ vựng N3 Mimikara Oboeru',
    description: 'Bao quát toàn bộ từ vựng N3 thường gặp trong JLPT.',
    subject: 'vocab',
    level: 'N3',
    color: 'indigo',
    data: vocabularyN3
  },
  {
    id: 'n3-kanji-single',
    name: 'Hán Tự N3 Riki (Chữ Gốc)',
    description: 'Học mặt chữ, Bộ thủ và Âm Hán Việt cơ bản.',
    subject: 'kanji_single',
    level: 'N3',
    color: 'amber',
    data: kanjiN3
  },
  {
    id: 'n3-kanji-words',
    name: 'Chữ Hán N3 Riki (Từ Vựng)',
    description: 'Từ vựng cấu tạo từ các Hán Tự N3.',
    subject: 'kanji_words',
    level: 'N3',
    color: 'orange',
    data: kanjiN3
  },
  {
    id: 'n3-grammar-core',
    name: 'Ngữ pháp N3 Riki',
    description: 'Nắm chắc ngữ pháp N3 với ví dụ và bẫy JLPT.',
    subject: 'grammar',
    level: 'N3',
    color: 'teal',
    data: grammarN3
  },
  {
    id: 'keigo-master',
    name: 'Chinh phục Kính ngữ',
    description: 'Nắm vững Tôn kính ngữ và Khiêm nhường ngữ giao tiếp công sở.',
    subject: 'special',
    level: 'ALL',
    color: 'fuchsia',
    data: keigoVerbs
  },
  {
    id: 'verb-conjugation',
    name: 'Chia thể Động từ',
    description: 'Phản xạ chia thể nhanh như gió không cần suy nghĩ.',
    subject: 'special',
    level: 'ALL',
    color: 'orange',
    data: verbsConjugation as any[]
  }
];

export function getCourseById(courseId: string): Course | undefined {
  return COURSE_REGISTRY.find(c => c.id === courseId);
}

export function getCoursesBySubject(subject: SubjectType): Course[] {
  return COURSE_REGISTRY.filter(c => c.subject === subject);
}

export function getAllCourses(): Course[] {
  return COURSE_REGISTRY;
}
