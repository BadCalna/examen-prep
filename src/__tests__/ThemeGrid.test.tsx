import { render, screen } from '@testing-library/react'
import ThemeGrid from '@/components/ThemeGrid'
import { Topic } from '@/types/topic'
import { describe, it, expect } from 'vitest'

const mockTopics: Topic[] = [
  {
    id: 'test1',
    slug: 'test-topic',
    title: 'Test Topic FR',
    titleCn: 'Test Topic CN',
    icon: 'Scale'
  },
  {
    id: 'test2',
    slug: 'other-topic',
    title: 'Other Topic FR',
    titleCn: 'Other Topic CN',
    icon: 'Users'
  }
]

describe('ThemeGrid', () => {
  it('renders all topics', () => {
    render(<ThemeGrid topics={mockTopics} />)
    
    expect(screen.getByText('Test Topic FR')).toBeDefined()
    expect(screen.getByText('Test Topic CN')).toBeDefined()
    expect(screen.getByText('Other Topic FR')).toBeDefined()
  })

  it('links point to correct slugs', () => {
    render(<ThemeGrid topics={mockTopics} />)
    
    const links = screen.getAllByRole('link')
    expect(links[0].getAttribute('href')).toContain('/topics/test-topic')
    expect(links[1].getAttribute('href')).toContain('/topics/other-topic')
  })
})
