import { useState, useEffect, useCallback, useMemo } from 'react';
import { Question, QuizState } from '@/types/quiz';
import { useUserProgress } from '@/hooks/useUserProgress';

interface UseTopicQuizReturn extends QuizState {
  currentQuestion: Question | null;
  submitAnswer: (choiceId: string) => void;
  nextQuestion: () => void;
  restart: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function useTopicQuiz(slug: string): UseTopicQuizReturn {
  const [state, setState] = useState<QuizState>({
    questions: [],
    currentIndex: 0,
    userAnswers: {},
    score: 0,
    isFinished: false,
    loading: true,
    error: null,
  });

  const { addMistake } = useUserProgress();

  useEffect(() => {
    let mounted = true;

    const loadQuestions = async () => {
      try {
        const response = await fetch(`/data/topics/${slug}.json`);
        if (!response.ok) throw new Error('Failed to load topic data');

        const data = await response.json();

        if (mounted) {
          const rawQuestions = (data.questions || []) as Question[];
          const shuffledQuestions = shuffleArray(rawQuestions);
          setState(prev => ({
            ...prev,
            questions: shuffledQuestions,
            loading: false,
            error: null
          }));
        }
      } catch (err) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err.message : 'Unknown error'
          }));
        }
      }
    };

    if (slug) {
      loadQuestions();
    }

    return () => {
      mounted = false;
    };
  }, [slug]);

  const submitAnswer = useCallback((choiceId: string) => {
    const question = state.questions[state.currentIndex];
    if (!question) return;

    const isAlreadyAnswered = state.userAnswers[question.id];
    if (isAlreadyAnswered) return;

    const selectedChoice = question.choices.find(c => c.id === choiceId);
    const isCorrect = selectedChoice?.isCorrect ?? false;

    // Track mistake OUTSIDE of setState to avoid double-call in StrictMode
    if (!isCorrect) {
      addMistake(question, slug);
    }

    setState(prev => ({
      ...prev,
      userAnswers: {
        ...prev.userAnswers,
        [question.id]: choiceId
      },
      score: isCorrect ? prev.score + 1 : prev.score
    }));
  }, [state.questions, state.currentIndex, state.userAnswers, addMistake, slug]);

  const nextQuestion = useCallback(() => {
    setState(prev => {
      const nextIndex = prev.currentIndex + 1;
      const isFinished = nextIndex >= prev.questions.length;

      return {
        ...prev,
        currentIndex: isFinished ? prev.currentIndex : nextIndex,
        isFinished
      };
    });
  }, []);

  const restart = useCallback(() => {
    setState(prev => {
      const shuffledQuestions = shuffleArray(prev.questions);
      return {
        ...prev,
        questions: shuffledQuestions,
        currentIndex: 0,
        userAnswers: {},
        score: 0,
        isFinished: false
      };
    });
  }, []);

  const currentQuestion = useMemo(() =>
    state.questions[state.currentIndex] || null
    , [state.questions, state.currentIndex]);

  return {
    ...state,
    currentQuestion,
    submitAnswer,
    nextQuestion,
    restart
  };
}
