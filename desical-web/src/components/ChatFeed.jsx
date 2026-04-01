import React, { useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { t } from '../utils/i18n';

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

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

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
                <div className="msg-content">{msg.content}</div>
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
