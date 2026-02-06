import { render, screen, fireEvent } from '@testing-library/react'
import TopicQuizCard from '@/components/TopicQuizCard'
import { Question } from '@/types/quiz'
import { describe, it, expect, vi } from 'vitest'

const mockQuestion: Question = {
  id: 'q1',
  type: 'single',
  stem: 'What is 1+1?',
  choices: [
    { id: 'c1', text: '2', isCorrect: true },
    { id: 'c2', text: '3', isCorrect: false }
  ],
  analysis: 'It is 2.'
}

describe('TopicQuizCard', () => {
  it('renders question and choices', () => {
    render(
      <TopicQuizCard 
        question={mockQuestion} 
        onAnswer={vi.fn()} 
        userAnswer={null} 
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
      />
    )
    
    expect(screen.getByText('It is 2.')).toBeDefined()
    expect(screen.getByText(/Analyse/i)).toBeDefined()
  })
})
