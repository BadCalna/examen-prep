import { describe, expect, it } from 'vitest';
import { MistakeRecord } from '@/hooks/useUserProgress';
import {
  buildPracticeQueue,
  filterMistakes,
  getAvailableChoiceTopics,
  getQuestionKind,
} from '@/lib/mistakeFilters';

const makeRecord = (overrides: Partial<MistakeRecord>): MistakeRecord => ({
  questionId: overrides.questionId ?? 'q1',
  topicId: overrides.topicId ?? 'values',
  count: overrides.count ?? 1,
  lastWrongAt: overrides.lastWrongAt ?? 100,
  question: overrides.question ?? {
    id: overrides.questionId ?? 'q1',
    type: 'single',
    stem: 'question',
    analysis: 'analysis',
    choices: [
      { id: 'c1', text: 'A', isCorrect: true },
      { id: 'c2', text: 'B', isCorrect: false },
    ],
  },
});

describe('mistakeFilters', () => {
  it('can classify question kind by topic', () => {
    expect(getQuestionKind('situation')).toBe('situation');
    expect(getQuestionKind('history')).toBe('choice');
  });

  it('filters by question kind and min wrong count', () => {
    const records = [
      makeRecord({ questionId: 'q1', topicId: 'history', count: 3 }),
      makeRecord({ questionId: 'q2', topicId: 'situation', count: 2 }),
      makeRecord({ questionId: 'q3', topicId: 'values', count: 1 }),
    ];

    const filtered = filterMistakes(records, { kind: 'choice', minWrongCount: 2 });
    expect(filtered.map((item) => item.questionId)).toEqual(['q1']);
  });

  it('returns de-duplicated choice topics only', () => {
    const records = [
      makeRecord({ topicId: 'history' }),
      makeRecord({ topicId: 'history', questionId: 'q2' }),
      makeRecord({ topicId: 'situation', questionId: 'q3' }),
      makeRecord({ topicId: 'values', questionId: 'q4' }),
    ];

    expect(getAvailableChoiceTopics(records)).toEqual(['history', 'values']);
  });

  it('builds review queue by count first then time', () => {
    const records = [
      makeRecord({ questionId: 'q1', count: 2, lastWrongAt: 100 }),
      makeRecord({ questionId: 'q2', count: 4, lastWrongAt: 20 }),
      makeRecord({ questionId: 'q3', count: 2, lastWrongAt: 500 }),
    ];

    const queue = buildPracticeQueue(records, 'review');
    expect(queue.map((item) => item.questionId)).toEqual(['q2', 'q3', 'q1']);
  });

  it('builds weighted sprint queue', () => {
    const records = [
      makeRecord({ questionId: 'q1', count: 1 }),
      makeRecord({ questionId: 'q2', count: 3 }),
    ];

    const queue = buildPracticeQueue(records, 'sprint', () => 0.5);

    const q1Count = queue.filter((item) => item.questionId === 'q1').length;
    const q2Count = queue.filter((item) => item.questionId === 'q2').length;

    expect(q1Count).toBe(1);
    expect(q2Count).toBe(3);
    expect(queue).toHaveLength(4);
  });
});
