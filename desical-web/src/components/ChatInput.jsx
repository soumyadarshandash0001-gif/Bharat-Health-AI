import React, { useRef, useEffect, useState } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';
import { t } from '../utils/i18n';

const ChatInput = ({ onSend, loading, lang }) => {
  const inputRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const text = inputRef.current.value.trim();
    if (text && !loading) {
      onSend(text);
      inputRef.current.value = '';
      inputRef.current.style.height = 'auto';
    }
  };

  const handleInput = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Voice input
  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    const langMap = { en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', or: 'or-IN' };
    recognition.lang = langMap[lang] || 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (inputRef.current) {
        inputRef.current.value = transcript;
      }
      setIsRecording(false);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  useEffect(() => {
    if (!loading && inputRef.current) inputRef.current.focus();
  }, [loading]);

  return (
    <div className="input-bar">
      <div className="input-row">
        <textarea
          ref={inputRef}
          placeholder={isRecording ? t(lang, 'voiceListening') : t(lang, 'placeholder')}
          rows={1}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={loading || isRecording}
        />
        <button
          className={`voice-btn ${isRecording ? 'recording' : ''}`}
          onClick={toggleVoice}
          title="Voice Input"
        >
          {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={loading}
        >
          <Send size={16} />
        </button>
      </div>
      <div className="input-disclaimer">
        {t(lang, 'disclaimer')}
      </div>
    </div>
  );
};

export default ChatInput;
