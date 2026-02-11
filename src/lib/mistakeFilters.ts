import { MistakeRecord } from '@/hooks/useUserProgress';

export type MistakeQuestionKind = 'all' | 'choice' | 'situation';
export type PracticeMode = 'review' | 'sprint';

export interface MistakeFilterOptions {
  kind?: MistakeQuestionKind;
  topicId?: string;
  minWrongCount?: number;
}

export function isSituationTopic(topicId: string): boolean {
  return topicId === 'situation';
}

export function getQuestionKind(topicId: string): Exclude<MistakeQuestionKind, 'all'> {
  return isSituationTopic(topicId) ? 'situation' : 'choice';
}

export function getAvailableChoiceTopics(records: MistakeRecord[]): string[] {
  const topics = records
    .map((record) => record.topicId)
    .filter((topicId) => !isSituationTopic(topicId));

  return Array.from(new Set(topics));
}

export function filterMistakes(records: MistakeRecord[], options: MistakeFilterOptions): MistakeRecord[] {
  const {
    kind = 'all',
    topicId = 'all',
    minWrongCount = 1,
  } = options;

  return records.filter((record) => {
    if (record.count < minWrongCount) {
      return false;
    }

    const recordKind = getQuestionKind(record.topicId);

    if (kind !== 'all' && recordKind !== kind) {
      return false;
    }

    if (topicId !== 'all' && record.topicId !== topicId) {
      return false;
    }

    return true;
  });
}

function shuffleArray<T>(items: T[], randomFn: () => number): T[] {
  const copied = [...items];
  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }
  return copied;
}

function buildReviewQueue(records: MistakeRecord[], randomFn: () => number): MistakeRecord[] {
  return shuffleArray([...records], randomFn);
}

function buildSprintQueue(records: MistakeRecord[], randomFn: () => number): MistakeRecord[] {
  const weighted: MistakeRecord[] = [];

  for (const record of records) {
    const weight = Math.min(5, Math.max(1, record.count));
    for (let i = 0; i < weight; i++) {
      weighted.push(record);
    }
  }

  return shuffleArray(weighted, randomFn);
}

export function buildPracticeQueue(
  records: MistakeRecord[],
  mode: PracticeMode,
  randomFn: () => number = Math.random
): MistakeRecord[] {
  if (mode === 'sprint') {
    return buildSprintQueue(records, randomFn);
  }

  return buildReviewQueue(records, randomFn);
}
