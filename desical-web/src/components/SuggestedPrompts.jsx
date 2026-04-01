import React from 'react';

export default function SuggestedPrompts({ suggestions, onSelect }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <span className="w-full text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        Try asking:
      </span>
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => onSelect(s)}
          className="px-4 py-2 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 
                     rounded-full text-sm text-slate-700 dark:text-slate-300 hover:bg-primary-500 
                     hover:text-white hover:border-transparent transition-all duration-300 shadow-sm"
        >
          {s}
        </button>
      ))}
    </div>
  );
}
