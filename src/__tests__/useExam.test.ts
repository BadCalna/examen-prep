import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import useExam from '@/hooks/useExam';

vi.mock('@/hooks/useUserProgress', () => ({
  useUserProgress: () => ({
    addMistake: vi.fn(),
  }),
}));

function makeTopicPayload(topic: string) {
  return {
    meta: { sectionId: topic, sectionTitle: topic },
    questions: [
      {
        id: `${topic}-q1`,
        type: 'single',
        stem: `${topic} question`,
        analysis: 'analysis',
        choices: [
          { id: 'c1', text: 'A', isCorrect: true },
          { id: 'c2', text: 'B', isCorrect: false },
        ],
      },
    ],
  };
}

describe('useExam', () => {
  beforeEach(() => {
    global.fetch = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('/data/situation.json')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            meta: { sectionId: 'situation', sectionTitle: 'situation' },
            questions: [
              {
                id: 'sit-q1',
                type: 'single',
                stem: 'situation question',
                analysis: 'analysis',
                choices: [
                  { id: 'c1', text: 'A', isCorrect: true },
                  { id: 'c2', text: 'B', isCorrect: false },
                ],
              },
              null,
            ],
          }),
        }) as Promise<Response>;
      }

      const match = url.match(/\/data\/topics\/(.+)\.json$/);
      const topic = match?.[1] ?? 'unknown';

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(makeTopicPayload(topic)),
      }) as Promise<Response>;
    }) as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('ignores invalid questions when loading exam bank', async () => {
    const { result } = renderHook(() => useExam());

    act(() => {
      result.current.startExam();
    });

    await waitFor(() => expect(result.current.status).toBe('inProgress'));

    expect(result.current.totalQuestions).toBe(6);

    act(() => {
      result.current.finishExam();
    });

    expect(result.current.status).toBe('finished');
    expect(result.current.result?.total).toBe(6);
  });
});
