import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MistakesPracticeCard from '@/components/exam/MistakesPracticeCard';
import { MistakeRecord } from '@/hooks/useUserProgress';

const mockAddMistake = vi.fn();

const mockMistakes: Record<string, MistakeRecord> = {
  q1: {
    questionId: 'q1',
    topicId: 'history',
    count: 1,
    lastWrongAt: Date.now(),
    question: {
      id: 'q1',
      type: 'single',
      stem: 'Test stem',
      analysis: 'Test analysis',
      choices: [
        { id: 'c1', text: 'A', isCorrect: true },
        { id: 'c2', text: 'B', isCorrect: false },
      ],
    },
  },
};

vi.mock('@/hooks/useUserProgress', () => ({
  useUserProgress: () => ({
    mistakes: mockMistakes,
    bookmarks: {},
    isBookmarked: vi.fn(() => false),
    toggleBookmark: vi.fn(),
    removeMistake: vi.fn(),
    addMistake: mockAddMistake,
    removeBookmark: vi.fn(),
    isMistake: vi.fn(() => false),
    clearAllMistakes: vi.fn(),
    clearAllBookmarks: vi.fn(),
  }),
}));

describe('MistakesPracticeCard', () => {
  beforeEach(() => {
    mockAddMistake.mockClear();
  });

  it('keeps full filter controls after empty result', () => {
    render(<MistakesPracticeCard />);

    fireEvent.click(screen.getByText('错 >= 5 次'));

    expect(screen.getByText('当前筛选下暂无错题')).toBeDefined();
    expect(screen.getByText('错 >= 2 次')).toBeDefined();
    expect(screen.getByText('复习模式')).toBeDefined();
  });

  it('records mistake again when answered incorrectly in mistakes practice', () => {
    render(<MistakesPracticeCard />);

    fireEvent.click(screen.getByText('B'));

    expect(mockAddMistake).toHaveBeenCalledTimes(1);
    expect(mockAddMistake).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'q1' }),
      'history'
    );
  });
});
