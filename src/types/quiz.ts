export interface Choice {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  type: string;
  stem: string;
  choices: Choice[];
  analysis: string;
  difficulty?: number;
  tags?: string[];
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  userAnswers: Record<string, string>;
  score: number;
  isFinished: boolean;
  loading: boolean;
  error: string | null;
}
