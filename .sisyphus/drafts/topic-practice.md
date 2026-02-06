# Draft: Topic Practice Module (Thèmes)

## Requirements (Confirmed)
- **Routing**: Separate `/topics` (Quizzes) from `/practice` (Flashcards).
- **Data**: Use existing 5 JSONs. Move to `public/`.
- **Language**: UI supports Bilingual (FR/CN), but use **Placeholders** for CN data for now.
- **Icons**: Use `lucide-react` (already installed).

## Technical Decisions
- **Dependencies**: Need to install `framer-motion` (currently missing).
- **Component**: Create new `TopicQuizCard` (interactive).
- **State**: Use local state + simple progress bar.

## Test Strategy (To Confirm)
- Project has **NO** test infrastructure.
- Options:
    1. Setup Vitest/Jest (TDD).
    2. Manual Verification (Prototype mode).

## Scope Boundaries
- **INCLUDE**:
    - Data migration.
    - `/topics` landing page.
    - `/topics/[slug]` quiz page.
    - `TopicQuizCard` component.
    - Basic animations.
- **EXCLUDE**:
    - Actual Chinese translations (placeholder only).
    - User accounts / Persistent progress (unless requested).
