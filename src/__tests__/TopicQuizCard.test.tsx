import { render, screen, fireEvent } from '@testing-library/react'
import TopicQuizCard from '@/components/TopicQuizCard'
import { Question } from '@/types/quiz'
import { describe, it, expect, vi } from 'vitest'

const mockQuestion: Question = {
  id: 'q1',
  type: 'single',
  stem: 'What is 1+1?',
  stemZh: '1+1等于几？',
  choices: [
    { id: 'c1', text: '2', textZh: '二', isCorrect: true },
    { id: 'c2', text: '3', textZh: '三', isCorrect: false }
  ],
  analysis: 'It is 2.',
  analysisZh: '答案是2。'
}

describe('TopicQuizCard', () => {
  it('renders question and choices', () => {
    render(
      <TopicQuizCard
        question={mockQuestion}
        onAnswer={vi.fn()}
        userAnswer={null}
        topicId="test"
        showTranslation={false}
      />
    )

    expect(screen.getByText('What is 1+1?')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })

  it('calls onAnswer when clicking a choice', () => {
    const handleAnswer = vi.fn()
    render(
      <TopicQuizCard
        question={mockQuestion}
        onAnswer={handleAnswer}
        userAnswer={null}
        topicId="test"
        showTranslation={false}
      />
    )

    fireEvent.click(screen.getByText('2'))
    expect(handleAnswer).toHaveBeenCalledWith('c1')
  })

  it('shows feedback and analysis when answered', () => {
    render(
      <TopicQuizCard
        question={mockQuestion}
        onAnswer={vi.fn()}
        userAnswer="c1"
        topicId="test"
        showTranslation={false}
      />
    )

    expect(screen.getByText('It is 2.')).toBeDefined()
    expect(screen.getByText(/Analyse/i)).toBeDefined()
  })

  it('shows Chinese translations when showTranslation is true', () => {
    render(
      <TopicQuizCard
        question={mockQuestion}
        onAnswer={vi.fn()}
        userAnswer={null}
        topicId="test"
        showTranslation={true}
      />
    )

    expect(screen.getByText('1+1等于几？')).toBeDefined()
    expect(screen.getByText('二')).toBeDefined()
    expect(screen.getByText('三')).toBeDefined()
  })

  it('hides Chinese translations when showTranslation is false', () => {
    render(
      <TopicQuizCard
        question={mockQuestion}
        onAnswer={vi.fn()}
        userAnswer={null}
        topicId="test"
        showTranslation={false}
      />
    )

    expect(screen.queryByText('1+1等于几？')).toBeNull()
    expect(screen.queryByText('二')).toBeNull()
  })

  it('shows Chinese analysis when answered with translation on', () => {
    render(
      <TopicQuizCard
        question={mockQuestion}
        onAnswer={vi.fn()}
        userAnswer="c1"
        topicId="test"
        showTranslation={true}
      />
    )

    expect(screen.getByText('答案是2。')).toBeDefined()
  })
})
