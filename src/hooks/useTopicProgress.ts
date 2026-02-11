'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 每个主题的进度记录
export interface TopicProgressRecord {
    topicId: string;
    totalAnswered: number;   // 总答题数
    correctCount: number;    // 正确数
    lastPracticeAt: number;  // 最近练习时间
}

interface TopicProgressState {
    progress: Record<string, TopicProgressRecord>;

    // Actions
    recordAnswer: (topicId: string, isCorrect: boolean) => void;
    getTopicProgress: (topicId: string) => TopicProgressRecord | undefined;
    resetTopicProgress: (topicId: string) => void;
    resetAllProgress: () => void;
}

export const useTopicProgress = create<TopicProgressState>()(
    persist(
        (set, get) => ({
            progress: {},

            recordAnswer: (topicId: string, isCorrect: boolean) => {
                set((state) => {
                    const existing = state.progress[topicId];
                    return {
                        progress: {
                            ...state.progress,
                            [topicId]: {
                                topicId,
                                totalAnswered: existing ? existing.totalAnswered + 1 : 1,
                                correctCount: existing
                                    ? existing.correctCount + (isCorrect ? 1 : 0)
                                    : isCorrect ? 1 : 0,
                                lastPracticeAt: Date.now(),
                            },
                        },
                    };
                });
            },

            getTopicProgress: (topicId: string) => {
                return get().progress[topicId];
            },

            resetTopicProgress: (topicId: string) => {
                set((state) => {
                    const { [topicId]: _, ...rest } = state.progress;
                    return { progress: rest };
                });
            },

            resetAllProgress: () => {
                set({ progress: {} });
            },
        }),
        {
            name: 'topic-progress-storage',
        }
    )
);
