'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Question } from '@/types/quiz';

//定义错题记录
export interface MistakeRecord {
    questionId: string;
    question: Question;
    topicId: string;
    count: number;
    lastWrongAt: number;
}

//定义收藏记录
export interface BookmarkRecord {
    questionId: string;
    question: Question;
    topicId: string;
    addedAt: number;
}

//定义用户进度状态
interface UserProgressState {
    mistakes: Record<string, MistakeRecord>;
    bookmarks: Record<string, BookmarkRecord>;

    // Actions
    addMistake: (question: Question, topicId: string) => void;
    removeMistake: (questionId: string) => void;
    toggleBookmark: (question: Question, topicId: string) => void;
    isBookmarked: (questionId: string) => boolean;
    isMistake: (questionId: string) => boolean;
    clearAllMistakes: () => void;
    clearAllBookmarks: () => void;
}

//创建用户进度状态
export const useUserProgress = create<UserProgressState>()(
    persist(
        (set, get) => ({
            mistakes: {},
            bookmarks: {},

            addMistake: (question: Question, topicId: string) => {
                set((state) => {
                    const existing = state.mistakes[question.id];
                    return {
                        mistakes: {
                            ...state.mistakes,
                            [question.id]: {
                                questionId: question.id,
                                question,
                                topicId,
                                count: existing ? existing.count + 1 : 1,
                                lastWrongAt: Date.now(),
                            },
                        },
                    };
                });
            },

            removeMistake: (questionId: string) => {
                set((state) => {
                    const { [questionId]: _, ...rest } = state.mistakes;
                    return { mistakes: rest };
                });
            },

            toggleBookmark: (question: Question, topicId: string) => {
                set((state) => {
                    const exists = state.bookmarks[question.id];
                    if (exists) {
                        const { [question.id]: _, ...rest } = state.bookmarks;
                        return { bookmarks: rest };
                    }
                    return {
                        bookmarks: {
                            ...state.bookmarks,
                            [question.id]: {
                                questionId: question.id,
                                question,
                                topicId,
                                addedAt: Date.now(),
                            },
                        },
                    };
                });
            },

            isBookmarked: (questionId: string) => {
                return !!get().bookmarks[questionId];
            },

            isMistake: (questionId: string) => {
                return !!get().mistakes[questionId];
            },

            clearAllMistakes: () => {
                set({ mistakes: {} });
            },

            clearAllBookmarks: () => {
                set({ bookmarks: {} });
            },
        }),
        {
            name: 'user-progress-storage',
        }
    )
);
