# Development Plan: Mistakes & Bookmarks Features

This plan outlines the implementation of "Mistakes Notebook" (错题本) and "Bookmarks" (收藏题目) features using **Zustand** for state management with **LocalStorage** persistence.

## 1. State Management Setup (Zustand)

We will use `zustand` with `persist` middleware to create a robust, persistent store for user progress.

### 1.1 Install Dependencies
```bash
npm install zustand
```

### 1.2 Create Store (`src/hooks/useUserProgress.ts`)
Define the store to manage mistakes and bookmarks.

**Data Structure:**
```typescript
interface MistakeRecord {
  questionId: string;
  question: Question; // Store full object for offline access/easy rendering
  topicId: string;
  count: number;      // How many times missed
  lastWrongAt: number; // Timestamp
}

interface BookmarkRecord {
  questionId: string;
  question: Question;
  topicId: string;
  addedAt: number;
}

interface UserProgressState {
  mistakes: Record<string, MistakeRecord>; // Key: questionId
  bookmarks: Record<string, BookmarkRecord>; // Key: questionId
  
  // Actions
  addMistake: (question: Question, topicId: string) => void;
  removeMistake: (questionId: string) => void;
  toggleBookmark: (question: Question, topicId: string) => void;
  isBookmarked: (questionId: string) => boolean;
}
```

**Persistence:**
- Use `persist` middleware to save to `localStorage` under key `user-progress-storage`.
- Ensure hydration logic handles potential schema changes in the future.

## 2. Logic Integration (Auto-Tracking)

We need to hook into existing quiz logic to automatically track mistakes and allow bookmarking.

### 2.1 Update `useTopicQuiz.ts`
Modify the `submitAnswer` function to integrate with the store.

- **Import**: `useUserProgress` store.
- **Logic**:
  ```typescript
  // Inside submitAnswer callback
  if (!isCorrect) {
    addMistake(question, topicId);
  }
  ```

### 2.2 Create `useQuestionActions` Hook (Optional but Clean)
Encapsulate bookmark logic for reusability across different cards (Topic Quiz, Daily Practice).

```typescript
export function useQuestionActions(question: Question) {
  const { toggleBookmark, isBookmarked } = useUserProgress();
  return {
    isBookmarked: isBookmarked(question.id),
    toggleBookmark: () => toggleBookmark(question, 'unknown') // topicId needs to be passed down
  };
}
```

## 3. UI Component Updates

### 3.1 Create `BookmarkButton` Component
- **Path**: `src/components/quiz/BookmarkButton.tsx`
- **Icon**: Use `Lucide-React` Heart icon.
- **Behavior**: Toggles state, animates on click (using `framer-motion`).
- **Props**: `questionId`, `isActive`, `onClick`.

### 3.2 Update `QuestionCard` (or equivalent quiz UI)
- Add `BookmarkButton` to the top-right corner of the question card.
- Ensure it doesn't conflict with the layout (absolute positioning or flex header).

## 4. Profile/Progress Page Implementation (`/progress`)

Revamp the existing placeholder page to be the central hub for user progress.

### 4.1 Layout & Tabs
- **Route**: `src/app/progress/page.tsx`
- **Tabs**: Two toggleable sections:
  1.  **错题本 (Mistakes)** - Sorted by `count` (frequency) descending.
  2.  **我的收藏 (Bookmarks)** - Sorted by `addedAt` descending.

### 4.2 Mistake List Item
- Display question stem (truncated if long).
- Show badges:
  - "Error Count: X" (Red badge)
  - "Last Wrong: [Date]"
- **Interaction**:
  - Click to expand/view full question & answer (Review Mode).
  - "Mark as Mastered" button (removes from mistakes or decrements count).

### 4.3 Bookmark List Item
- Display question stem.
- **Interaction**:
  - Click to view details.
  - "Remove Bookmark" button.

### 4.4 "Review Mode" (Modal or Expandable)
- When clicking an item, show the `QuestionCard` in "read-only" or "retry" mode.
- Show the correct answer immediately for review.

## 5. Refinement & Future Proofing

### 5.1 Empty States
- **Mistakes**: "Perfect record! No mistakes yet." (Encouraging UI)
- **Bookmarks**: "No bookmarks yet. Save tricky questions to review later!"

### 5.2 Animations
- Use `framer-motion` for list entry animations (staggered fade-in).
- Heart pop animation for bookmarking.

### 5.3 Future Backend Prep
- The `useUserProgress` store is the single source of truth.
- To migrate to Supabase later, we only need to swap the `persist` middleware or add a `sync` effect in this one hook, without rewriting UI components.

---

## Execution Checklist

1.  [ ] **Install**: `npm install zustand`
2.  [ ] **Store**: Create `src/hooks/useUserProgress.ts`
3.  [ ] **Component**: Create `BookmarkButton.tsx`
4.  [ ] **Integration**: Update `useTopicQuiz.ts` to track mistakes
5.  [ ] **Page**: Implement `src/app/progress/page.tsx` with Tabs and Lists
6.  [ ] **Review**: Verify persistence works after refresh
