import React, { useState, useEffect } from 'react';

/**
 * ChatGPT-Style Typewriter Component
 * Features: word-by-word streaming, blinking cursor, and smooth transitions.
 */
export default function Typewriter({ text, speed = 15, onComplete }) {
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
        // Find next whitespace or take a chunk
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
    <div className="whitespace-pre-wrap leading-relaxed relative">
      {displayedText}
      {index < text.length && (
        <span className="inline-block w-1.5 h-4 ml-1 bg-primary-500 animate-pulse align-middle" />
      )}
    </div>
  );
}
