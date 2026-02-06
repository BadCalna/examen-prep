'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Question } from '@/types/quiz';
import { useUserProgress } from '@/hooks/useUserProgress';

// Constants
const EXAM_DURATION_SECONDS = 45 * 60; // 45 minutes
const TOPIC_QUESTION_COUNT = 28;
const SITUATION_QUESTION_COUNT = 12;
const TOPIC_FILES = ['values', 'institutions', 'rights', 'history', 'society'];

export interface ExamQuestion extends Question {
    topicId: string;
}

export interface TopicScore {
    correct: number;
    total: number;
}

export interface WrongQuestion {
    question: Question;
    userAnswer: string;
    correctAnswer: string;
    topicId: string;
}

export interface ExamResult {
    id: string;
    date: number;
    score: number;
    total: number;
    duration: number;
    topicScores: Record<string, TopicScore>;
    wrongQuestions: WrongQuestion[];
}

type ExamStatus = 'idle' | 'loading' | 'inProgress' | 'finished';

interface ExamState {
    status: ExamStatus;
    questions: ExamQuestion[];
    currentIndex: number;
    userAnswers: Record<string, string>;
    timeRemaining: number;
    result: ExamResult | null;
    error: string | null;
}

interface TopicData {
    meta: { sectionId: string; sectionTitle: string };
    questions: Question[];
}

function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function generateExamId(): string {
    return `exam_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export default function useExam() {
    const [state, setState] = useState<ExamState>({
        status: 'idle',
        questions: [],
        currentIndex: 0,
        userAnswers: {},
        timeRemaining: EXAM_DURATION_SECONDS,
        result: null,
        error: null,
    });

    const { addMistake } = useUserProgress();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const mistakesRecordedRef = useRef<boolean>(false);

    // Load questions from all topics and situation
    const loadQuestions = useCallback(async () => {
        setState(prev => ({ ...prev, status: 'loading', error: null }));

        try {
            const allTopicQuestions: ExamQuestion[] = [];

            // Load topic questions
            for (const topic of TOPIC_FILES) {
                const response = await fetch(`/data/topics/${topic}.json`);
                if (!response.ok) continue;
                const data = (await response.json()) as TopicData;
                if (data.questions) {
                    const questionsWithTopic = data.questions.map(q => ({
                        ...q,
                        topicId: topic
                    }));
                    allTopicQuestions.push(...questionsWithTopic);
                }
            }

            // Load situation questions
            const situationResponse = await fetch('/data/situation.json');
            if (!situationResponse.ok) throw new Error('Failed to load situation questions');
            const situationData = (await situationResponse.json()) as TopicData;
            const situationQuestions = situationData.questions.map(q => ({
                ...q,
                topicId: 'situation'
            }));

            // Shuffle and select questions
            const shuffledTopics = shuffleArray(allTopicQuestions);
            const shuffledSituation = shuffleArray(situationQuestions);

            const selectedTopicQuestions = shuffledTopics.slice(0, TOPIC_QUESTION_COUNT);
            const selectedSituationQuestions = shuffledSituation.slice(0, SITUATION_QUESTION_COUNT);

            // Combine and shuffle final exam
            const finalQuestions = shuffleArray([
                ...selectedTopicQuestions,
                ...selectedSituationQuestions
            ]);

            if (finalQuestions.length === 0) {
                throw new Error('无法加载题库');
            }

            setState(prev => ({
                ...prev,
                status: 'inProgress',
                questions: finalQuestions,
                currentIndex: 0,
                userAnswers: {},
                timeRemaining: EXAM_DURATION_SECONDS,
                result: null,
            }));

            startTimeRef.current = Date.now();

        } catch (err) {
            setState(prev => ({
                ...prev,
                status: 'idle',
                error: err instanceof Error ? err.message : '加载失败',
            }));
        }
    }, []);

    // Timer effect
    useEffect(() => {
        if (state.status !== 'inProgress') {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        timerRef.current = setInterval(() => {
            setState(prev => {
                if (prev.timeRemaining <= 1) {
                    // Time's up - auto submit
                    return prev; // Will be handled by finishExam
                }
                return { ...prev, timeRemaining: prev.timeRemaining - 1 };
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [state.status]);

    // Auto-submit when time runs out
    useEffect(() => {
        if (state.status === 'inProgress' && state.timeRemaining <= 0) {
            finishExam();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.timeRemaining, state.status]);

    // Record mistakes to the mistakes notebook when exam finishes
    useEffect(() => {
        if (state.status === 'finished' && state.result && !mistakesRecordedRef.current) {
            mistakesRecordedRef.current = true;
            // Record each wrong question to the mistakes notebook
            for (const wrong of state.result.wrongQuestions) {
                addMistake(wrong.question, wrong.topicId);
            }
        }
        // Reset the flag when exam is reset
        if (state.status === 'idle') {
            mistakesRecordedRef.current = false;
        }
    }, [state.status, state.result, addMistake]);

    const startExam = useCallback(() => {
        loadQuestions();
    }, [loadQuestions]);

    const selectAnswer = useCallback((questionId: string, choiceId: string) => {
        setState(prev => ({
            ...prev,
            userAnswers: {
                ...prev.userAnswers,
                [questionId]: choiceId
            }
        }));
    }, []);

    const goToQuestion = useCallback((index: number) => {
        setState(prev => {
            if (index < 0 || index >= prev.questions.length) return prev;
            return { ...prev, currentIndex: index };
        });
    }, []);

    const nextQuestion = useCallback(() => {
        setState(prev => {
            if (prev.currentIndex >= prev.questions.length - 1) return prev;
            return { ...prev, currentIndex: prev.currentIndex + 1 };
        });
    }, []);

    const prevQuestion = useCallback(() => {
        setState(prev => {
            if (prev.currentIndex <= 0) return prev;
            return { ...prev, currentIndex: prev.currentIndex - 1 };
        });
    }, []);

    const finishExam = useCallback(() => {
        setState(prev => {
            if (prev.status !== 'inProgress') return prev;

            const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
            const topicScores: Record<string, TopicScore> = {};
            const wrongQuestions: WrongQuestion[] = [];
            let totalScore = 0;

            // Calculate scores
            for (const question of prev.questions) {
                const topicId = question.topicId;
                if (!topicScores[topicId]) {
                    topicScores[topicId] = { correct: 0, total: 0 };
                }
                topicScores[topicId].total++;

                const userAnswer = prev.userAnswers[question.id];
                const correctChoice = question.choices.find(c => c.isCorrect);
                const isCorrect = correctChoice && userAnswer === correctChoice.id;

                if (isCorrect) {
                    totalScore++;
                    topicScores[topicId].correct++;
                } else {
                    wrongQuestions.push({
                        question,
                        userAnswer: userAnswer || '',
                        correctAnswer: correctChoice?.id || '',
                        topicId
                    });
                }
            }

            const result: ExamResult = {
                id: generateExamId(),
                date: Date.now(),
                score: totalScore,
                total: prev.questions.length,
                duration,
                topicScores,
                wrongQuestions
            };

            return {
                ...prev,
                status: 'finished',
                result
            };
        });
    }, []);

    const resetExam = useCallback(() => {
        setState({
            status: 'idle',
            questions: [],
            currentIndex: 0,
            userAnswers: {},
            timeRemaining: EXAM_DURATION_SECONDS,
            result: null,
            error: null,
        });
    }, []);

    const currentQuestion = state.questions[state.currentIndex] || null;
    const answeredCount = Object.keys(state.userAnswers).length;
    const progress = state.questions.length > 0
        ? Math.round((answeredCount / state.questions.length) * 100)
        : 0;

    return {
        // State
        status: state.status,
        questions: state.questions,
        currentQuestion,
        currentIndex: state.currentIndex,
        userAnswers: state.userAnswers,
        timeRemaining: state.timeRemaining,
        result: state.result,
        error: state.error,
        answeredCount,
        progress,
        totalQuestions: state.questions.length,

        // Actions
        startExam,
        selectAnswer,
        goToQuestion,
        nextQuestion,
        prevQuestion,
        finishExam,
        resetExam,
    };
}
