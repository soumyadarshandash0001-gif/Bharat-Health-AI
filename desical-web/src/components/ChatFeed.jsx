import React, { useEffect, useRef, useState } from 'react';
import { Zap, BrainCircuit, Heart, Activity, CloudSun } from 'lucide-react';
import { t } from '../utils/i18n';
import SuggestedPrompts from './SuggestedPrompts';
import Typewriter from './Typewriter';
import HealthScoreCircle from './HealthScoreCircle';
import RemindersSection from './RemindersSection';

const WeatherBanner = ({ weather }) => {
  if (!weather) return null;
  const colors = { 
    comfort: 'bg-indigo-50/50 border-indigo-100 text-indigo-700',
    cooling: 'bg-blue-50/50 border-blue-100 text-blue-700',
    warming: 'bg-orange-50/50 border-orange-100 text-orange-700',
    balanced: 'bg-emerald-50/50 border-emerald-100 text-emerald-700'
  };

  const emoji = weather.type === 'cooling' ? '☀️' : weather.type === 'comfort' ? '☔' : '❄️';
  
  return (
    <div className={`weather-banner flex items-center gap-3 p-3 rounded-2xl border mb-3 animate-in fade-in zoom-in duration-500 shadow-sm ${colors[weather.type] || colors.balanced}`}>
      <div className="p-2 bg-white/80 rounded-xl shadow-sm text-lg animate-float-cute">
        {emoji}
      </div>
      <div>
        <p className="text-sm font-bold leading-tight">{weather.text}</p>
        <div className="flex gap-2 mt-1">
          {weather.tags.map((tag, i) => (
            <span key={i} className="text-[10px] uppercase font-black tracking-wider opacity-60">
               {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const NutritionCard = ({ sources }) => {
  if (!sources || sources.length === 0) return null;
  const s = sources[0];

  return (
    <div className="nutrition-card">
      <h4>📊 Nutrition Data — {s.food}</h4>
      <div className="macro-grid">
        <div className="macro-item cal">
          <div className="macro-value">{s.calories}</div>
          <div className="macro-label">Calories</div>
        </div>
        <div className="macro-item protein">
          <div className="macro-value">{s.protein || '—'}</div>
          <div className="macro-label">Protein</div>
        </div>
        <div className="macro-item carbs">
          <div className="macro-value">{s.carbs || '—'}</div>
          <div className="macro-label">Carbs</div>
        </div>
        <div className="macro-item fat">
          <div className="macro-value">{s.fat || '—'}</div>
          <div className="macro-label">Fat</div>
        </div>
      </div>
    </div>
  );
};

const PersonaBadge = ({ persona }) => {
  if (!persona) return null;
  return (
    <div className="persona-badge" style={{ borderColor: persona.color }}>
      <span>{persona.emoji}</span>
      <span style={{ color: persona.color }}>{persona.name}</span>
      <span className="persona-role">{persona.role}</span>
    </div>
  );
};

const ChatFeed = ({ messages, loading, lang, onQuickAction, onCtaClick }) => {
  const feedRef = useRef(null);
  const [analyzingIndex, setAnalyzingIndex] = useState(-1);

  useEffect(() => {
    if (loading) {
      setAnalyzingIndex(-1);
    }
  }, [loading]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'ai') {
      setAnalyzingIndex(messages.length - 1);
      const timer = setTimeout(() => setAnalyzingIndex(-1), 1500); // Analysis time
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading, analyzingIndex]);

  // Welcome screen
  if (messages.length === 0 && !loading) {
    return (
      <div className="chat-area" ref={feedRef}>
        <div className="welcome-hero">
          <div className="welcome-icon">🌿</div>
          <h2>{t(lang, 'welcomeTitle')}</h2>
          <p>{t(lang, 'welcomeSubtitle')}</p>
          <div className="quick-actions">
            {['qa1', 'qa2', 'qa3', 'qa4'].map(id => (
              <button
                key={id}
                className="quick-action"
                onClick={() => onQuickAction(t(lang, `${id}Text`))}
              >
                <div className="qa-icon">{t(lang, `${id}Icon`)}</div>
                <div className="qa-text">{t(lang, `${id}Text`)}</div>
                <div className="qa-sub">{t(lang, `${id}Sub`)}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-area" ref={feedRef}>
      {messages.some(m => m.weather) && (
        <div className="sticky top-0 z-10 px-4 py-2 bg-gradient-to-r from-bg-primary/95 to-bg-secondary/95 backdrop-blur-md rounded-2xl border border-white/5 flex items-center justify-between shadow-xl mb-4 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-500">
                <CloudSun size={18} />
             </div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Room Status • Live Climate</p>
               <p className="text-xs font-bold text-slate-200">
                 {messages.findLast(m => m.weather)?.weather.city || 'India'} • {messages.findLast(m => m.weather)?.weather.temp}°C
               </p>
             </div>
           </div>
           <div className="px-3 py-1 rounded-full bg-primary-500/10 text-[10px] font-bold text-primary-500 uppercase">
             {messages.findLast(m => m.weather)?.weather.condition}
           </div>
        </div>
      )}
      {messages.map((msg, idx) => (
        <div key={idx} className={`msg ${msg.role}`}>
          <div className="msg-avatar">
            {msg.role === 'ai' ? (msg.persona?.emoji || '🌿') : '👤'}
          </div>
          <div className="msg-body">
            {msg.type === 'limit_hit' ? (
              <div className="limit-banner">
                <h4>{t(lang, 'limitTitle')}</h4>
                <p>{t(lang, 'limitBody')}</p>
                <button onClick={onCtaClick}>{t(lang, 'limitCta')}</button>
              </div>
            ) : (
              <>
                {msg.persona && msg.role === 'ai' && <PersonaBadge persona={msg.persona} />}
                <div className="msg-content">
                  {idx === analyzingIndex ? (
                    <div className="flex items-center gap-2 text-primary-500 font-medium animate-pulse py-2">
                       <BrainCircuit className="animate-spin-slow" size={20} />
                       <span>Analyse time: Consulting Cognitive Engine...</span>
                    </div>
                  ) : (
                    msg.role === 'ai' && idx === messages.length - 1 ? (
                      <Typewriter text={msg.content} speed={12} />
                    ) : (
                      msg.content
                    )
                  )}
                </div>
                {msg.weather && <WeatherBanner weather={msg.weather} />}
                {msg.intent === 'score' && !analyzingIndex && (
                  <div className="grid grid-cols-2 gap-4 my-4">
                    <HealthScoreCircle score={8.2} label="Protein" color="#3b82f6" />
                    <HealthScoreCircle score={7.5} label="Consistency" color="#10b981" />
                  </div>
                )}
                {msg.sources && msg.sources.length > 0 && (
                  <>
                    <div className="msg-sources">
                      {msg.sources.map((s, i) => (
                        <span key={i} className="source-tag">
                          <Zap size={10} /> {s.food} ({s.calories} kcal)
                        </span>
                      ))}
                    </div>
                    <NutritionCard sources={msg.sources} />
                  </>
                )}
                {msg.reminders && msg.role === 'ai' && !analyzingIndex && (
                   <RemindersSection reminders={msg.reminders} />
                )}
                {msg.role === 'ai' && idx === messages.length - 1 && (
                  <SuggestedPrompts suggestions={msg.suggestions} onSelect={onQuickAction} />
                )}
                <div className="msg-meta">
                  {msg.model && <span>⚡ {msg.model}</span>}
                  {msg.intent && <span className="intent-tag">{msg.intent}</span>}
                </div>
              </>
            )}
          </div>
        </div>
      ))}
      {loading && (
        <div className="typing-indicator">
          <div className="msg-avatar" style={{ background: 'var(--gradient-primary)' }}>🌿</div>
          <div className="typing-dots">
            <span /><span /><span />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatFeed;
