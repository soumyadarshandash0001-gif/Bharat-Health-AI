import React, { useState } from 'react';
import { t } from '../utils/i18n';

const MEAL_DB = {
  steamed: [
    { name: 'Idli (3 pcs)', cal: 234, protein: 7, carbs: 50, fat: 2, state: 'Tamil Nadu', gi: 35 },
    { name: 'Idli (2 pcs)', cal: 156, protein: 5, carbs: 34, fat: 1.5, state: 'Tamil Nadu', gi: 35 },
  ],
  boiled: [
    { name: 'Dalma (1 bowl)', cal: 210, protein: 9, carbs: 32, fat: 5.5, state: 'Odisha', gi: 42 },
    { name: 'Dalma (1.5 bowls)', cal: 315, protein: 14, carbs: 48, fat: 8, state: 'Odisha', gi: 42 },
  ],
  gravy: [
    { name: 'Paneer Butter Masala', cal: 480, protein: 18, carbs: 22, fat: 38, state: 'Punjab', gi: 55 },
    { name: 'Butter Chicken', cal: 520, protein: 32, carbs: 13, fat: 38, state: 'Punjab', gi: 50 },
    { name: 'Veg Biryani', cal: 400, protein: 13, carbs: 72, fat: 13, state: 'Telangana', gi: 65 },
  ],
  fermented: [
    { name: 'Pakhala (1 plate)', cal: 190, protein: 4.5, carbs: 43, fat: 1.1, state: 'Odisha', gi: 30 },
    { name: 'Masala Dosa', cal: 305, protein: 7, carbs: 52, fat: 10.5, state: 'Tamil Nadu', gi: 55 },
  ],
  fried: [
    { name: 'Chicken Biryani', cal: 495, protein: 19, carbs: 68, fat: 21.5, state: 'Telangana', gi: 65 },
    { name: 'Samosa (2 pcs)', cal: 262, protein: 5, carbs: 30, fat: 14, state: 'Maharashtra', gi: 78 },
  ],
  sweet: [
    { name: 'Rasgulla (2 pcs)', cal: 230, protein: 5, carbs: 45, fat: 2.5, state: 'West Bengal', gi: 80 },
    { name: 'Chhena Poda (1 slice)', cal: 380, protein: 9.5, carbs: 47, fat: 14, state: 'Odisha', gi: 70 },
  ],
};

const GOALS = {
  weight_loss: { label: '🏃 Weight Loss', labelHi: '🏃 वजन घटाना', calMult: 0.75, protMult: 1.8 },
  maintenance: { label: '⚖️ Maintenance', labelHi: '⚖️ वजन बनाए रखना', calMult: 1.0, protMult: 1.4 },
  muscle_gain: { label: '💪 Muscle Gain', labelHi: '💪 मसल बनाना', calMult: 1.2, protMult: 2.0 },
  diabetes: { label: '🩺 Diabetes Control', labelHi: '🩺 शुगर कंट्रोल', calMult: 0.85, protMult: 1.2 },
};

const MealPlanView = ({ lang }) => {
  const [goal, setGoal] = useState('maintenance');
  const [isVeg, setIsVeg] = useState(true);
  const [weight, setWeight] = useState('70');
  const [plan, setPlan] = useState(null);

  const generatePlan = () => {
    const w = parseFloat(weight) || 70;
    const goalConfig = GOALS[goal];
    const targetCal = Math.round(w * 30 * goalConfig.calMult);
    const targetProtein = Math.round(w * goalConfig.protMult);

    const isDiabetes = goal === 'diabetes';

    // Breakfast: steamed/fermented (low GI)
    const breakfastOptions = [...MEAL_DB.steamed, ...MEAL_DB.fermented];
    const breakfast = breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)];

    // Lunch: gravy or boiled — filter fried if diabetes
    let lunchOptions = [...MEAL_DB.gravy, ...MEAL_DB.boiled];
    if (isVeg) lunchOptions = lunchOptions.filter(f => !f.name.includes('Chicken') && !f.name.includes('Butter Chicken'));
    if (isDiabetes) lunchOptions = lunchOptions.filter(f => f.gi <= 55);
    const lunch = lunchOptions[Math.floor(Math.random() * lunchOptions.length)] || MEAL_DB.boiled[0];

    // Snack
    const snack = { name: isDiabetes ? 'Roasted Chana + Green Tea' : 'Roasted Makhana + Fruit', cal: isDiabetes ? 80 : 120, protein: 4, carbs: isDiabetes ? 12 : 18, fat: 2 };

    // Dinner: boiled/fermented
    let dinnerOptions = [...MEAL_DB.boiled, ...MEAL_DB.fermented];
    if (isDiabetes) dinnerOptions = dinnerOptions.filter(f => f.gi <= 45);
    const dinner = dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)] || MEAL_DB.boiled[0];

    const totalCal = breakfast.cal + lunch.cal + snack.cal + dinner.cal;
    const totalProtein = breakfast.protein + lunch.protein + snack.protein + dinner.protein;

    setPlan({
      goal: goalConfig,
      targetCal,
      targetProtein,
      meals: { breakfast, lunch, snack, dinner },
      totalCal,
      totalProtein,
      isDiabetes,
    });
  };

  return (
    <div className="bmi-view">
      <div className="bmi-container">
        <div className="bmi-header">
          <div className="bmi-icon">🍽️</div>
          <h2>{lang === 'hi' ? 'Meal Plan Generator' : 'Meal Plan Generator'}</h2>
          <p>{lang === 'hi' ? 'अपने goal के हिसाब से Indian diet plan बनाएं' : 'Generate a personalized Indian diet plan based on your goal'}</p>
        </div>

        <div className="bmi-form">
          <div className="bmi-field">
            <label>{lang === 'hi' ? 'आपका Goal' : 'Your Goal'}</label>
            <div className="goal-grid">
              {Object.entries(GOALS).map(([key, g]) => (
                <button
                  key={key}
                  className={`goal-btn ${goal === key ? 'active' : ''}`}
                  onClick={() => setGoal(key)}
                >
                  {lang === 'hi' ? g.labelHi : g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bmi-row">
            <div className="bmi-field">
              <label>{lang === 'hi' ? 'वजन (kg)' : 'Weight (kg)'}</label>
              <input type="number" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)} />
            </div>
            <div className="bmi-field">
              <label>{lang === 'hi' ? 'भोजन प्रकार' : 'Diet Type'}</label>
              <div className="toggle-row">
                <button className={`toggle-btn ${isVeg ? 'active' : ''}`} onClick={() => setIsVeg(true)}>
                  🥬 {lang === 'hi' ? 'शाकाहारी' : 'Vegetarian'}
                </button>
                <button className={`toggle-btn ${!isVeg ? 'active' : ''}`} onClick={() => setIsVeg(false)}>
                  🍗 {lang === 'hi' ? 'मांसाहारी' : 'Non-Veg'}
                </button>
              </div>
            </div>
          </div>

          <button className="bmi-calc-btn" onClick={generatePlan}>
            🍽️ {lang === 'hi' ? 'मील प्लान बनाएं' : 'Generate Meal Plan'}
          </button>
        </div>

        {plan && (
          <div className="bmi-result">
            <div className="bmi-score-card" style={{ textAlign: 'left' }}>
              <h3 style={{ marginBottom: '8px', color: 'var(--accent-green)' }}>
                {lang === 'hi' ? plan.goal.labelHi : plan.goal.label} — {lang === 'hi' ? 'डाइट प्लान' : 'Diet Plan'}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                {lang === 'hi' ? `लक्ष्य: ~${plan.targetCal} kcal/day | ${plan.targetProtein}g protein` : `Target: ~${plan.targetCal} kcal/day | ${plan.targetProtein}g protein`}
              </p>
            </div>

            <div className="bmi-diet-plan">
              {[
                { key: 'breakfast', icon: '🌅', label: lang === 'hi' ? 'सुबह 8 AM' : 'Breakfast (8 AM)' },
                { key: 'lunch', icon: '🌞', label: lang === 'hi' ? 'दोपहर 1 PM' : 'Lunch (1 PM)' },
                { key: 'snack', icon: '🫖', label: lang === 'hi' ? 'शाम 5 PM' : 'Snack (5 PM)' },
                { key: 'dinner', icon: '🌙', label: lang === 'hi' ? 'रात 8 PM' : 'Dinner (8 PM)' },
              ].map(({ key, icon, label }) => {
                const meal = plan.meals[key];
                return (
                  <div key={key} className="bmi-meal-row">
                    <span className="bmi-meal-icon">{icon}</span>
                    <div className="bmi-meal-info">
                      <div className="bmi-meal-time">{label}</div>
                      <div className="bmi-meal-name">{meal.name}</div>
                      <div className="bmi-meal-macros">
                        <span className="cal">{meal.cal} kcal</span>
                        <span className="prot">{meal.protein}g P</span>
                        <span className="carb">{meal.carbs}g C</span>
                        <span className="fatt">{meal.fat}g F</span>
                      </div>
                      {meal.state && <div className="bmi-meal-state">📍 {meal.state}</div>}
                    </div>
                  </div>
                );
              })}

              <div className="bmi-total">
                <span>🎯 Total:</span>
                <strong>{plan.totalCal} kcal | {plan.totalProtein}g protein</strong>
              </div>

              {plan.isDiabetes && (
                <div className="diabetes-note">
                  ⚠️ {lang === 'hi'
                    ? 'सभी items low Glycemic Index (GI ≤ 55) वाले हैं। Doctor से confirm ज़रूर करें।'
                    : 'All items are low Glycemic Index (GI ≤ 55). Always confirm with your doctor.'}
                </div>
              )}
            </div>

            <button className="bmi-calc-btn" onClick={generatePlan} style={{ marginTop: '16px', background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)' }}>
              🔄 {lang === 'hi' ? 'नया प्लान बनाएं' : 'Regenerate Plan'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanView;
