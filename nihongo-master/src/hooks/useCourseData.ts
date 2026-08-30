import { useMemo } from 'react';
import type { LearningItem } from '../types';
import { getCourseById } from '../data/courses/registry';

export function useCourseData(courseId: string | undefined) {
  const course = useMemo(() => {
    return getCourseById(courseId || '');
  }, [courseId]);

  const rawDataset: LearningItem[] = useMemo(() => {
    if (!course || !course.data) return [];
    
    // Apply template and extractType filtering
    let processedData = course.data;

    // Apply specific extractType if needed
    if (course.extractType === 'vocabulary_only') {
      processedData = processedData.flatMap((item: any) => item.words || []);
    } else if (course.extractType === 'kanji_only') {
      processedData = processedData.map((item: any) => {
        const { words, ...kanjiOnly } = item;
        return kanjiOnly;
      });
    }

    // Map template
    return processedData.map((item: any) => ({
      ...item,
      template: course.template || 'japanese', // Default fallback
    }));
  }, [course]);

  return { course, rawDataset };
}
