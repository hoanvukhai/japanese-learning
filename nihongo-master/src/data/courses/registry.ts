import { vocabularyN3 } from '../jlpt/n3/vocabularyN3';
import { vocabularyMimikaraN2 } from '../jlpt/n2/vocabulary/mimikara';
import { vocabularyRikiN2 } from '../jlpt/n2/vocabulary/riki';
import { kanjiN3 } from '../jlpt/n3/kanjiN3';
import { allN2Kanji } from '../jlpt/n2/kanji';
import { grammarN3 } from '../jlpt/n3/grammarN3';
import { allN2Grammar } from '../jlpt/n2/grammar';
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
    id: 'n2-vocab-mimikara',
    name: 'Từ vựng N2 Mimikara',
    description: 'Tổng hợp từ vựng N2 theo giáo trình Mimikara Oboeru.',
    subject: 'vocab',
    level: 'N2',
    color: 'rose',
    data: vocabularyMimikaraN2
  },
  {
    id: 'n2-vocab-riki',
    name: 'Từ vựng N2 Riki',
    description: 'Tổng hợp từ vựng N2 theo giáo trình Riki Nihongo.',
    subject: 'vocab',
    level: 'N2',
    color: 'blue',
    data: vocabularyRikiN2
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
    id: 'n2-kanji-single',
    name: 'Hán Tự N2 Riki (Chữ Gốc)',
    description: 'Kanji N2 cấp cao và Âm Hán Việt.',
    subject: 'kanji_single',
    level: 'N2',
    color: 'emerald',
    data: allN2Kanji as any[]
  },
  {
    id: 'n2-kanji-words',
    name: 'Chữ Hán N2 Riki (Từ Vựng)',
    description: 'Từ vựng cấu tạo từ các Hán Tự N2.',
    subject: 'kanji_words',
    level: 'N2',
    color: 'teal',
    data: allN2Kanji as any[]
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
    id: 'n2-grammar-core',
    name: 'Ngữ pháp N2 Riki',
    description: 'Luyện thi ngữ pháp N2 theo Shinkanzen Master.',
    subject: 'grammar',
    level: 'N2',
    color: 'cyan',
    data: allN2Grammar
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
