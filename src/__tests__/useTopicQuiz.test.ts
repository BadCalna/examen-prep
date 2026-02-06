import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import useTopicQuiz from '@/hooks/useTopicQuiz'
import { Question } from '@/types/quiz'

const mockQuestions: { questions: Question[] } = {
  questions: [
    {
      id: 'q1',
      type: 'single',
      stem: 'Question 1',
      choices: [
        { id: 'c1', text: 'Choice 1', isCorrect: true },
        { id: 'c2', text: 'Choice 2', isCorrect: false }
      ],
      analysis: 'Analysis 1'
    },
    {
      id: 'q2',
      type: 'single',
      stem: 'Question 2',
      choices: [
        { id: 'c3', text: 'Choice 3', isCorrect: true },
        { id: 'c4', text: 'Choice 4', isCorrect: false }
      ],
      analysis: 'Analysis 2'
    }
  ]
}

describe('useTopicQuiz', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuestions),
      })
    ) as any
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('loads questions initially', async () => {
    const { result } = renderHook(() => useTopicQuiz('test-slug'))

    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.questions).toHaveLength(2)
    expect(result.current.currentQuestion?.id).toBe('q1')
  })

  it('handles answering correctly', async () => {
    const { result } = renderHook(() => useTopicQuiz('test-slug'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.submitAnswer('c1')
    })

    expect(result.current.userAnswers['q1']).toBe('c1')
    expect(result.current.score).toBe(1)
  })

  it('handles answering incorrectly', async () => {
    const { result } = renderHook(() => useTopicQuiz('test-slug'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.submitAnswer('c2')
    })

    expect(result.current.userAnswers['q1']).toBe('c2')
    expect(result.current.score).toBe(0)
  })

  it('moves to next question', async () => {
    const { result } = renderHook(() => useTopicQuiz('test-slug'))
    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => {
      result.current.submitAnswer('c1')
    })
    
    act(() => {
      result.current.nextQuestion()
    })

    expect(result.current.currentIndex).toBe(1)
    expect(result.current.currentQuestion?.id).toBe('q2')
  })
})
