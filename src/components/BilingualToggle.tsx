'use client';

import { motion } from 'framer-motion';

interface BilingualToggleProps {
    enabled: boolean;
    onChange: (value: boolean) => void;
}

export default function BilingualToggle({ enabled, onChange }: BilingualToggleProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={enabled}
            aria-label="中法对照模式"
            onClick={() => onChange(!enabled)}
            className="group inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
        >

            {/* Toggle track */}
            <div
                className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${enabled ? 'bg-blue-600' : 'bg-slate-300'
                    }`}
            >
                {/* Toggle knob */}
                <motion.div
                    className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm"
                    animate={{ x: enabled ? 16 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            </div>

            <span className="text-base leading-none">中文对照</span>

            <span
                className={`ml-0.5 text-xs transition-colors ${enabled ? 'text-blue-600' : 'text-slate-400'
                    }`}
            >
            </span>
        </button>
    );
}
