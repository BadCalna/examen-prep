'use client';

import { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface ExamTimerProps {
    timeRemaining: number;
    onTimeUp?: () => void;
}

function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function ExamTimer({ timeRemaining, onTimeUp }: ExamTimerProps) {
    const [isWarning, setIsWarning] = useState(false);
    const [isCritical, setIsCritical] = useState(false);

    useEffect(() => {
        // Warning at 5 minutes
        setIsWarning(timeRemaining <= 300 && timeRemaining > 60);
        // Critical at 1 minute
        setIsCritical(timeRemaining <= 60);
    }, [timeRemaining]);

    useEffect(() => {
        if (timeRemaining <= 0 && onTimeUp) {
            onTimeUp();
        }
    }, [timeRemaining, onTimeUp]);

    const bgColor = isCritical
        ? 'bg-red-600'
        : isWarning
            ? 'bg-amber-500'
            : 'bg-slate-800';

    const textColor = 'text-white';

    return (
        <div
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-lg font-bold ${bgColor} ${textColor} transition-colors duration-300`}
        >
            {isCritical ? (
                <AlertTriangle className="h-5 w-5 animate-pulse" />
            ) : (
                <Clock className="h-5 w-5" />
            )}
            <span className={isCritical ? 'animate-pulse' : ''}>
                {formatTime(timeRemaining)}
            </span>
        </div>
    );
}
