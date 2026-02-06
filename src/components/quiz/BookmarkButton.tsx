'use client';

import { Heart } from 'lucide-react';

interface BookmarkButtonProps {
    isActive: boolean;
    onClick: () => void;
    className?: string;
}

export default function BookmarkButton({
    isActive,
    onClick,
    className = ''
}: BookmarkButtonProps) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`
        group relative p-2 rounded-full transition-all duration-200
        ${isActive
                    ? 'bg-rose-100 text-rose-500'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                }
        ${className}
      `}
            aria-label={isActive ? '取消收藏' : '收藏题目'}
        >
            <Heart
                className={`
          h-5 w-5 transition-transform duration-200
          ${isActive ? 'fill-current scale-110' : 'group-hover:scale-110'}
        `}
            />
            {isActive && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>
            )}
        </button>
    );
}
