import React from 'react';
import { PlusCircle, MessageSquare, Calculator, UtensilsCrossed, Trash2, Globe, UserCog } from 'lucide-react';
import { t, languages } from '../utils/i18n';

const Sidebar = ({ lang, setLang, history, onNewChat, onDeleteHistory, onResetProfile, isOpen, onClose, activeView, setActiveView, userName }) => {
  const navItems = [
    { id: 'chat', icon: <MessageSquare size={17} />, labelKey: 'chatItem' },
    { id: 'bmi', icon: <Calculator size={17} />, labelKey: 'bmiCalc' },
    { id: 'mealplan', icon: <UtensilsCrossed size={17} />, labelKey: 'mealPlan' },
  ];

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon">🌿</div>
          <div className="brand-text">
            <h1>{t(lang, 'brand')}</h1>
            <span>{t(lang, 'tagline')}</span>
          </div>
        </div>

        {/* New Chat */}
        <div className="sidebar-actions">
          <button className="new-chat-btn" onClick={onNewChat}>
            <PlusCircle size={17} />
            {t(lang, 'newChat')}
          </button>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <div className="nav-label">{t(lang, 'features')}</div>
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => { setActiveView(item.id); onClose(); }}
            >
              {item.icon}
              <span>{t(lang, item.labelKey)}</span>
            </div>
          ))}

          {/* History */}
          {history.length > 0 && (
            <>
              <div className="nav-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t(lang, 'today')}</span>
                <button
                  className="delete-history-btn"
                  onClick={onDeleteHistory}
                  title={lang === 'hi' ? 'सब कुछ मिटाएं और नया शुरू करें' : 'Clear all data & start fresh'}
                >
                  <Trash2 size={13} />
                </button>
              </div>
              {history.map((chat, i) => (
                <div key={i} className="nav-item history-item">
                  <MessageSquare size={14} />
                  <span>{chat.title}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Switch User / Reset Profile */}
          {userName && (
            <button className="switch-user-btn" onClick={onResetProfile}>
              <UserCog size={15} />
              <div className="switch-user-info">
                <span className="switch-user-name">{userName}</span>
                <span className="switch-user-action">
                  {lang === 'hi' ? 'प्रोफ़ाइल बदलें' : 'Switch User'}
                </span>
              </div>
            </button>
          )}

          {!userName && (
            <button className="switch-user-btn" onClick={onResetProfile}>
              <UserCog size={15} />
              <span className="switch-user-action">
                {lang === 'hi' ? 'प्रोफ़ाइल सेट करें' : 'Set Up Profile'}
              </span>
            </button>
          )}

          <div className="lang-wrap">
            <Globe size={14} className="lang-icon" />
            <select
              className="lang-selector"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              {languages.map(l => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
