import React, { useState, useEffect } from 'react';

/**
 * Premium "Cute" Typewriter Component
 * Features: word-by-word pop-in, floating ✍️ emoji, and smooth transitions.
 */
export default function Typewriter({ text, speed = 18, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Reset when new text is provided
    setDisplayedText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        const nextSpace = text.indexOf(' ', index + 1);
        const nextStop = nextSpace === -1 ? text.length : nextSpace + 1;
        
        setDisplayedText(text.slice(0, nextStop));
        setIndex(nextStop);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, speed, onComplete]);

  return (
    <div className="whitespace-pre-wrap leading-relaxed relative cute-text font-medium text-slate-700 dark:text-slate-200">
      {displayedText}
      {index < text.length ? (
        <span className="inline-block animate-bounce-subtle ml-1 text-lg">✍️</span>
      ) : (
        <span className="inline-block w-2.5 h-2.5 bg-primary-400 rounded-full ml-1 animate-pulse" />
      )}
    </div>
  );
}
