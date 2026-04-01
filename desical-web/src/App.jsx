import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatFeed from './components/ChatFeed';
import ChatInput from './components/ChatInput';
import BMICalculator from './components/BMICalculator';
import MealPlanView from './components/MealPlanView';
import OnboardingModal from './components/OnboardingModal';
import { Menu, Sparkles } from 'lucide-react';
import { t } from './utils/i18n';
import { chat as apiChat } from './utils/api';
import { isOnboarded, getProfile, clearSession, trackBehavior, fullReset } from './utils/memory';
import { classifyIntent } from './utils/intent';

const FREE_LIMIT = 15;

const VIEW_TITLES = {
  chat: 'brand',
  bmi: 'bmiCalc',
  mealplan: 'mealPlan',
};

function App() {
  const [lang, setLang] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checksToday, setChecksToday] = useState(0);
  const [activeView, setActiveView] = useState('chat');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState(getProfile());

  // Check if user needs onboarding
  useEffect(() => {
    if (!isOnboarded()) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = (data) => {
    setShowOnboarding(false);
    setProfile(getProfile());
  };

  const handleSend = async (text) => {
    // Classify intent for display
    const { intent, persona } = classifyIntent(text);

    // Track behavior
    trackBehavior(intent);

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    const newCount = checksToday + 1;
    setChecksToday(newCount);

    if (newCount > FREE_LIMIT) {
      setMessages(prev => [...prev, {
        role: 'ai',
        type: 'limit_hit',
        content: ''
      }]);
      setLoading(false);
      return;
    }

    try {
      const data = await apiChat(text, lang);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: data.response,
        sources: data.sources || [],
        model: data.model || 'unknown',
        intent: data.intent || intent,
        persona: data.persona || persona,
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: lang === 'hi'
          ? 'माफ़ कीजिए, कुछ गड़बड़ हुई। कृपया दोबारा कोशिश करें।'
          : 'Sorry, something went wrong. Please try again.',
        sources: [],
      }]);
    }

    setLoading(false);
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      const firstUserMsg = messages.find(m => m.role === 'user');
      const title = firstUserMsg?.content?.slice(0, 30) + '...' || 'Chat';
      setHistory(prev => [{ title }, ...prev]);
    }
    setMessages([]);
    setChecksToday(0);
    clearSession();
    setActiveView('chat');
  };

  const handleDeleteHistory = () => {
    // Full wipe — clear everything from RAM + localStorage
    fullReset();
    setHistory([]);
    setMessages([]);
    setChecksToday(0);
    setProfile({});
    // Re-show onboarding so new user can set up
    setShowOnboarding(true);
    setActiveView('chat');
  };

  const handleResetProfile = () => {
    // Wipe profile + memory, re-onboard
    fullReset();
    setMessages([]);
    setHistory([]);
    setChecksToday(0);
    setProfile({});
    setShowOnboarding(true);
    setActiveView('chat');
    setSidebarOpen(false);
  };

  const handleQuickAction = (text) => {
    setActiveView('chat');
    handleSend(text);
  };

  const handleCtaClick = () => {
    alert(lang === 'hi'
      ? 'Premium Upgrade — ₹199/माह\n✅ Unlimited queries\n✅ Personalized tracking\n✅ WhatsApp integration\n✅ Priority support'
      : 'Premium Upgrade — ₹199/mo\n✅ Unlimited queries\n✅ Personalized tracking\n✅ WhatsApp integration\n✅ Priority support');
  };

  const remainingChecks = Math.max(0, FREE_LIMIT - checksToday);

  return (
    <div className="app">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal lang={lang} onComplete={handleOnboardingComplete} />
      )}

      <Sidebar
        lang={lang}
        setLang={setLang}
        history={history}
        onNewChat={handleNewChat}
        onDeleteHistory={handleDeleteHistory}
        onResetProfile={handleResetProfile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
        userName={profile.name}
      />

      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-title">
            <button className="topbar-btn menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Menu size={18} />
            </button>
            <Sparkles size={16} style={{ color: 'var(--accent-green)' }} />
            {t(lang, VIEW_TITLES[activeView] || 'brand')}
            {profile.name && activeView === 'chat' && (
              <span style={{ color: 'var(--text-dim)', fontSize: '12px', marginLeft: '8px' }}>
                — {profile.name}
              </span>
            )}
          </div>
          <div className="topbar-actions">
            {activeView === 'chat' && (
              <div style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                background: remainingChecks <= 3
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${remainingChecks <= 3
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(16, 185, 129, 0.2)'}`,
                fontSize: '12px',
                fontWeight: 600,
                color: remainingChecks <= 3
                  ? 'var(--accent-red)'
                  : 'var(--accent-green)',
              }}>
                {remainingChecks > 0 ? `${remainingChecks} left` : 'Limit hit'}
              </div>
            )}
          </div>
        </div>

        {/* View Router */}
        {activeView === 'chat' && (
          <>
            <ChatFeed
              messages={messages}
              loading={loading}
              lang={lang}
              onQuickAction={handleQuickAction}
              onCtaClick={handleCtaClick}
            />
            <ChatInput
              onSend={handleSend}
              loading={loading}
              lang={lang}
            />
          </>
        )}

        {activeView === 'bmi' && <BMICalculator lang={lang} />}
        {activeView === 'mealplan' && <MealPlanView lang={lang} />}
      </div>
    </div>
  );
}

export default App;
