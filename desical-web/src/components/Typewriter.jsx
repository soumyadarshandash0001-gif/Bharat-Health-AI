import React, { useState, useEffect } from 'react';

/**
 * Typewriter Component
 * Simulates intelligent "next-word" streaming output.
 */
export default function Typewriter({ text, speed = 10, onComplete }) {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        // Move by word or cluster for smoother "intelligent" look
        const nextChunk = text.slice(index, index + 3); 
        setDisplayedText(prev => prev + nextChunk);
        setIndex(prev => prev + 3);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, speed, onComplete]);

  return <div className="whitespace-pre-wrap">{displayedText}</div>;
}
