import React, { useEffect, useState } from 'react';

/**
 * Animated Health Score Circle
 * Features: Filling stroke with percentage count-up.
 */
export default function HealthScoreCircle({ score, label, color = '#10b981' }) {
  const [offset, setOffset] = useState(283); // Circumference for r=45 (2*pi*45)
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const percentage = (score / 10) * 100;
    const progress = 283 - (283 * percentage) / 100;
    
    // Animate stroke
    const timer = setTimeout(() => setOffset(progress), 100);
    
    // Animate number
    let start = 0;
    const interval = setInterval(() => {
      if (start < score) {
        start += 0.1;
        setDisplayScore(Math.min(start, score).toFixed(1));
      } else {
        clearInterval(interval);
      }
    }, 20);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [score]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white/40 dark:bg-slate-800/40 rounded-3xl border border-white/20 shadow-xl backdrop-blur-md animate-in zoom-in duration-700">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48" cy="48" r="45"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="6"
            className="text-slate-100 dark:text-slate-700"
          />
          <circle
            cx="48" cy="48" r="45"
            fill="transparent"
            stroke={color}
            strokeWidth="6"
            strokeDasharray="283"
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-slate-800 dark:text-white">{displayScore}</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}
