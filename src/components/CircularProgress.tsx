import { motion } from 'framer-motion';

interface CircularProgressProps {
  score: number;
  total: number;
}

export default function CircularProgress({ score, total }: CircularProgressProps) {
  const percentage = Math.round((score / total) * 100);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const color = percentage >= 80 ? '#16a34a' : percentage >= 50 ? '#ca8a04' : '#dc2626';

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-48 w-48 -rotate-90 transform">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-slate-100"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          cx="96"
          cy="96"
          r={radius}
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center text-slate-900">
        <span className="text-4xl font-bold">{score}/{total}</span>
      </div>
    </div>
  );
}
