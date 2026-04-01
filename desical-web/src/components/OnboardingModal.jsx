import React, { useState } from 'react';
import { saveProfile } from '../utils/memory';

const GOALS = [
  { id: 'fat_loss', emoji: '🏃', label: 'Fat Loss', labelHi: 'वजन घटाना' },
  { id: 'muscle_gain', emoji: '💪', label: 'Muscle Gain', labelHi: 'मसल बनाना' },
  { id: 'maintain', emoji: '⚖️', label: 'Maintain Weight', labelHi: 'वजन बनाए रखना' },
  { id: 'diabetes_control', emoji: '🩺', label: 'Diabetes Control', labelHi: 'शुगर कंट्रोल' },
];

const DIETS = [
  { id: 'veg', emoji: '🥬', label: 'Vegetarian' },
  { id: 'egg', emoji: '🥚', label: 'Egg-etarian' },
  { id: 'nonveg', emoji: '🍗', label: 'Non-Veg' },
];

const BUDGETS = [
  { id: 'low', emoji: '💰', label: 'Low (₹100-200/day)' },
  { id: 'medium', emoji: '💳', label: 'Medium (₹200-500/day)' },
  { id: 'high', emoji: '💎', label: 'High (₹500+/day)' },
];

const LIFESTYLES = [
  { id: 'student', emoji: '📚', label: 'Student' },
  { id: 'working', emoji: '💼', label: 'Working Professional' },
  { id: 'homemaker', emoji: '🏠', label: 'Homemaker' },
  { id: 'retired', emoji: '🧘', label: 'Retired' },
];

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
];

const OnboardingModal = ({ lang, onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: '', age: '', gender: 'male', weight: '', height: '',
    goal: '', diet: '', location: '', budget: 'low', lifestyle: 'student',
  });

  const isHi = lang === 'hi';

  const updateField = (key, val) => setData(prev => ({ ...prev, [key]: val }));

  const finish = () => {
    saveProfile({ ...data, onboarded: true });
    onComplete(data);
  };

  const steps = [
    // Step 0: Welcome
    () => (
      <div className="onboard-step">
        <div className="onboard-hero-icon">🌿</div>
        <h2>{isHi ? 'नमस्ते! 🙏' : 'Namaste! 🙏'}</h2>
        <p className="onboard-desc">
          {isHi
            ? 'मैं Bharat Health AI हूँ — आपका personal health coach। 30 seconds में अपनी profile बनाएं।'
            : "I'm Bharat Health AI — your personal health coach. Set up your profile in 30 seconds."}
        </p>
        <button className="onboard-next" onClick={() => setStep(1)}>
          {isHi ? 'शुरू करें →' : "Let's Start →"}
        </button>
      </div>
    ),

    // Step 1: Basic Info
    () => (
      <div className="onboard-step">
        <h3>{isHi ? '📝 बेसिक जानकारी' : '📝 Basic Info'}</h3>
        <div className="onboard-fields">
          <div className="onboard-field">
            <label>{isHi ? 'नाम' : 'Name'}</label>
            <input placeholder="e.g. Rahul" value={data.name} onChange={e => updateField('name', e.target.value)} />
          </div>
          <div className="onboard-row">
            <div className="onboard-field">
              <label>{isHi ? 'उम्र' : 'Age'}</label>
              <input type="number" placeholder="28" value={data.age} onChange={e => updateField('age', e.target.value)} />
            </div>
            <div className="onboard-field">
              <label>{isHi ? 'लिंग' : 'Gender'}</label>
              <select value={data.gender} onChange={e => updateField('gender', e.target.value)}>
                <option value="male">{isHi ? 'पुरुष' : 'Male'}</option>
                <option value="female">{isHi ? 'महिला' : 'Female'}</option>
              </select>
            </div>
          </div>
          <div className="onboard-row">
            <div className="onboard-field">
              <label>{isHi ? 'वजन (kg)' : 'Weight (kg)'}</label>
              <input type="number" placeholder="72" value={data.weight} onChange={e => updateField('weight', e.target.value)} />
            </div>
            <div className="onboard-field">
              <label>{isHi ? 'ऊंचाई (cm)' : 'Height (cm)'}</label>
              <input type="number" placeholder="170" value={data.height} onChange={e => updateField('height', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="onboard-nav">
          <button className="onboard-back" onClick={() => setStep(0)}>←</button>
          <button className="onboard-next" onClick={() => setStep(2)} disabled={!data.name || !data.weight}>
            {isHi ? 'आगे →' : 'Next →'}
          </button>
        </div>
      </div>
    ),

    // Step 2: Goal + Diet
    () => (
      <div className="onboard-step">
        <h3>{isHi ? '🎯 आपका Goal क्या है?' : '🎯 What is your goal?'}</h3>
        <div className="onboard-options">
          {GOALS.map(g => (
            <button key={g.id} className={`onboard-option ${data.goal === g.id ? 'active' : ''}`}
              onClick={() => updateField('goal', g.id)}>
              <span>{g.emoji}</span> {isHi ? g.labelHi : g.label}
            </button>
          ))}
        </div>
        <h3 style={{ marginTop: 20 }}>{isHi ? '🍽️ आपका Diet Type?' : '🍽️ Your Diet Type?'}</h3>
        <div className="onboard-options row">
          {DIETS.map(d => (
            <button key={d.id} className={`onboard-option small ${data.diet === d.id ? 'active' : ''}`}
              onClick={() => updateField('diet', d.id)}>
              {d.emoji} {d.label}
            </button>
          ))}
        </div>
        <div className="onboard-nav">
          <button className="onboard-back" onClick={() => setStep(1)}>←</button>
          <button className="onboard-next" onClick={() => setStep(3)} disabled={!data.goal || !data.diet}>
            {isHi ? 'आगे →' : 'Next →'}
          </button>
        </div>
      </div>
    ),

    // Step 3: Location + Budget + Lifestyle
    () => (
      <div className="onboard-step">
        <h3>{isHi ? '📍 थोड़ा और बताएं' : '📍 A bit more about you'}</h3>
        <div className="onboard-fields">
          <div className="onboard-field">
            <label>{isHi ? 'राज्य (State)' : 'State'}</label>
            <select value={data.location} onChange={e => updateField('location', e.target.value)}>
              <option value="">{isHi ? '--- चुनें ---' : '--- Select ---'}</option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <h3 style={{ marginTop: 16 }}>{isHi ? '💰 Budget' : '💰 Monthly Food Budget'}</h3>
        <div className="onboard-options">
          {BUDGETS.map(b => (
            <button key={b.id} className={`onboard-option small ${data.budget === b.id ? 'active' : ''}`}
              onClick={() => updateField('budget', b.id)}>
              {b.emoji} {b.label}
            </button>
          ))}
        </div>
        <h3 style={{ marginTop: 16 }}>{isHi ? '🏠 Lifestyle' : '🏠 Lifestyle'}</h3>
        <div className="onboard-options row">
          {LIFESTYLES.map(l => (
            <button key={l.id} className={`onboard-option small ${data.lifestyle === l.id ? 'active' : ''}`}
              onClick={() => updateField('lifestyle', l.id)}>
              {l.emoji} {l.label}
            </button>
          ))}
        </div>
        <div className="onboard-nav">
          <button className="onboard-back" onClick={() => setStep(2)}>←</button>
          <button className="onboard-next" onClick={finish}>
            ✅ {isHi ? 'शुरू करें!' : "Let's Go!"}
          </button>
        </div>
      </div>
    ),
  ];

  return (
    <div className="onboard-overlay">
      <div className="onboard-modal">
        <div className="onboard-progress">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`onboard-dot ${i <= step ? 'active' : ''}`} />
          ))}
        </div>
        {steps[step]()}
      </div>
    </div>
  );
};

export default OnboardingModal;
