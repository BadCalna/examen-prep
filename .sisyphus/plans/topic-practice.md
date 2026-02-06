# Plan: Topic Practice Module (Thèmes)

## TL;DR

> **Quick Summary**: Implement a specialized "Topic Practice" module distinct from daily flashcards, featuring a theme selection hub and an interactive quiz interface.
> 
> **Deliverables**:
> - New Route: `/topics` (Theme Selection)
> - New Route: `/topics/[slug]` (Quiz Interface)
> - Data: 5 Cleaned JSON files in `public/data/topics/`
> - Components: `ThemeCard`, `TopicQuizCard` (with animations)
> - Test Infra: Vitest + React Testing Library setup
> 
> **Estimated Effort**: Medium
> **Parallel Execution**: YES - 2 waves
> **Critical Path**: Test Setup → Data Prep → Components → Page Integration

---

## Context

### Original Request
Separate "Topic Practice" (Themed Quizzes) from "Daily Practice". Use existing 5 JSON files. Modern UI with animations.

### Interview Summary
**Key Decisions**:
- **Routing**: Strictly separate `/topics` from `/practice`.
- **Data**: Use **Placeholders** for missing Chinese translations (bilingual UI support, but mocked data).
- **Testing**: **Setup Vitest** and use TDD (Red-Green-Refactor).
- **Files**: Rename messy filenames to clean slugs (e.g., `values.json`).

**Research Findings**:
- Current Project: Next.js 16, Tailwind 4.
- No existing test infrastructure.
- Existing `PracticeCard` is insufficient; building new `TopicQuizCard`.

---

## Work Objectives

### Core Objective
Enable users to practice specific themes (e.g., "History", "Values") via a dedicated, interactive quiz flow.

### Concrete Deliverables
- [ ] `public/data/topics/*.json` (Renamed & Validated)
- [ ] `vitest.config.ts` (Test Setup)
- [ ] `/src/app/topics/page.tsx` (Hub)
- [ ] `/src/app/topics/[slug]/page.tsx` (Quiz)
- [ ] `TopicQuizCard.tsx` (Component)

### Definition of Done
- [ ] `npm run test` passes (100% pass rate).
- [ ] User can navigate `/topics` -> Select Theme -> Play Quiz -> See Results.
- [ ] Incorrect answers show "Analysis" (with placeholder for CN).

### Must Have
- TDD workflow (write test first).
- Framer Motion animations (entry/exit).
- Bilingual UI structure (even if content is placeholder).

### Must NOT Have (Guardrails)
- **No Persistence**: Progress resets on refresh (Session-only).
- **No AI Translation**: Do not attempt to machine-translate 5 files. Use "Translation pending..." text.
- **No Backend**: All data fetching is client-side static JSON.

---

## Verification Strategy (TDD ENABLED)

### Test Decision
- **Infrastructure exists**: NO (Must Create)
- **User wants tests**: **YES (TDD)**
- **Framework**: **Vitest** + **React Testing Library**

### TDD Workflow
Each TODO follows RED-GREEN-REFACTOR:
1. **RED**: Create `__tests__/Component.test.tsx` and write a failing test.
2. **GREEN**: Implement minimal code in `Component.tsx` to pass.
3. **REFACTOR**: Polish code while keeping tests passing.

**Test Setup Task:**
- [ ] 0. Setup Test Infrastructure
  - Install: `npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom`
  - Config: Create `vitest.config.ts`
  - Verify: `npm run test` -> 1 test passes (setup verification)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Setup & Data):
├── Task 1: Setup Test Infra [Basis]
├── Task 2: Data Migration [Independent]
└── Task 3: Install Framer Motion [Independent]

Wave 2 (Components - TDD):
├── Task 4: ThemeHub Component (Selection UI) [Depends: 1, 3]
└── Task 5: QuizEngine Logic (Hook/State) [Depends: 1]

Wave 3 (Integration):
└── Task 6: Quiz Interface & Card UI [Depends: 2, 4, 5]
```

---

## TODOs

- [ ] 1. Setup Test Infrastructure (Vitest)
  **What to do**:
  - Install dependencies: `vitest`, `jsdom`, `@testing-library/react`.
  - Create `vitest.config.ts` configured for Next.js (alias `@/*`).
  - Add script `"test": "vitest"` to `package.json`.
  - Create a dummy test `src/__tests__/setup.test.ts` to verify.
  
  **Acceptance Criteria**:
  - [ ] `npm run test` runs and passes.
  - [ ] Can import components using `@/` alias in tests.

- [ ] 2. Data Preparation & Migration
  **What to do**:
  - Create directory `public/data/topics/`.
  - Copy and **Rename** files from `docs/data/` to clean slugs:
    - `1-...` -> `values.json`
    - `2-...` -> `institutions.json`
    - `3-...` -> `rights.json`
    - `4-...` -> `history.json`
    - `5-...` -> `society.json`
  - Create `public/data/topics/index.json` registry file (listing title, slug, iconName).
  
  **Verification**:
  - [ ] `ls public/data/topics/` shows 5 renamed files + index.json.
  - [ ] `curl http://localhost:3000/data/topics/values.json` returns valid JSON (manual check after server start).

- [ ] 3. Install UI Dependencies
  **What to do**:
  - Install Framer Motion: `npm install framer-motion`.
  - Ensure `lucide-react` is present.
  
  **Verification**:
  - [ ] `npm list framer-motion` returns version.

- [ ] 4. TDD: Implement Theme Selection Hub (`/topics`)
  **What to do**:
  - **RED**: Write test for `src/app/topics/page.tsx` (or a `ThemeList` component).
    - Assert it fetches `index.json`.
    - Assert it renders 5 cards with titles.
  - **GREEN**: Implement `ThemeList` component and Page.
    - Fetch registry.
    - Render grid of cards.
    - Link to `/topics/[slug]`.
  
  **Pattern References**:
  - `src/components/PracticeCard.tsx` (fetching pattern).
  
  **Acceptance Criteria**:
  - [ ] Test passes: Renders list of topics.
  - [ ] Visual: 5 cards displayed in a responsive grid.

- [ ] 5. TDD: Implement Quiz Logic Hook (`useTopicQuiz`)
  **What to do**:
  - **RED**: Write test for `useTopicQuiz` hook.
    - Initial state: loading.
    - Load data: success.
    - Actions: `selectOption`, `nextQuestion`.
    - Logic: Score calculation, `isCorrect` check.
  - **GREEN**: Implement hook in `src/hooks/useTopicQuiz.ts`.
  
  **Acceptance Criteria**:
  - [ ] Test passes: Handles "Next", "Select", "Score" correctly.

- [ ] 6. TDD: Implement `TopicQuizCard` Component
  **What to do**:
  - **RED**: Write test for `src/components/TopicQuizCard.tsx`.
    - Assert renders question stem.
    - Assert renders options (clickable).
    - Assert shows feedback (Green/Red) on click.
    - Assert shows "Analysis" (Bilingual placeholder) after selection.
  - **GREEN**: Implement component with Framer Motion.
    - Props: `question`, `onAnswer`, `userAnswer`.
    - UI: Modern styled buttons (not checkboxes).
    - Feedback: `bg-green-100` / `bg-red-100`.
  
  **Acceptance Criteria**:
  - [ ] Test passes: Interaction triggers callback.
  - [ ] Animation: Smooth entry/exit.

- [ ] 7. Integrate Quiz Interface (`/topics/[slug]`)
  **What to do**:
  - Create dynamic route `src/app/topics/[slug]/page.tsx`.
  - Use `useTopicQuiz` hook.
  - Render `TopicQuizCard`.
  - Add "Result View" when questions are exhausted.
  
  **Acceptance Criteria**:
  - [ ] User can complete a full quiz loop.
  - [ ] URL `/topics/values` loads specific JSON.

---

## Success Criteria

### Final Checklist
- [ ] All 5 topics are playable.
- [ ] Tests pass (`npm run test`).
- [ ] Quiz shows visual feedback (Green/Red).
- [ ] "Analysis" section appears for incorrect answers.
- [ ] No regression on existing `/practice` route.
