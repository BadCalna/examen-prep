# Examen Civique Prep - Agent Guidelines

## 1. Project Overview & Build System

### Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript 5
- **Testing**: Vitest + React Testing Library
- **Package Manager**: npm

### Commands
```bash
# Development
npm run dev          # Start dev server on port 3000
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Unit Tests (Vitest)

# Data Management
# Topic Data: public/data/topics/*.json
# Topic Registry: public/data/topics/index.json
```

### Data Structure

#### Topic Schema
```typescript
interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  type: string; // 'single' | 'multiple'
  stem: string; // Question text
  choices: Choice[];
  analysis: string; // Explanation
  difficulty?: number;
  tags?: string[];
}
```

## 2. Code Style & Conventions
...
## 4. Current Status (Feb 2026)
- **Home**: Dashboard style with 4 entry points.
- **Practice**: Daily Flashcard mode (Basic).
- **Topics**: Themed Quiz Module implemented (`/topics`).
  - 5 Themes available.
  - Interactive Quiz UI with feedback.
  - Bilingual UI structure (Chinese placeholders).
- **Testing**: Test infrastructure setup with Vitest.

