import React, { useState } from 'react';
import { t } from '../utils/i18n';

const BMICalculator = ({ lang }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age);
    if (!w || !h || w <= 0 || h <= 0) return;

    const hm = h / 100;
    const bmi = w / (hm * hm);

    let category, color, emoji, advice, dietPlan;

    if (bmi < 18.5) {
      category = lang === 'hi' ? 'कम वजन (Underweight)' : 'Underweight';
      color = '#f59e0b';
      emoji = '⚠️';
      advice = lang === 'hi'
        ? 'आपका वजन कम है। कैलोरी और प्रोटीन बढ़ाएं।'
        : 'You are underweight. Increase calorie and protein intake.';
      dietPlan = {
        breakfast: { name: 'Paneer Paratha (2) + Curd', cal: 520, protein: 22 },
        lunch: { name: 'Chicken Biryani (1.5 plates)', cal: 740, protein: 28 },
        snack: { name: 'Banana Shake + Almonds', cal: 280, protein: 8 },
        dinner: { name: 'Paneer Butter Masala + 3 Roti', cal: 680, protein: 24 },
        total: { cal: 2220, protein: 82 }
      };
    } else if (bmi < 25) {
      category = lang === 'hi' ? 'सामान्य (Normal)' : 'Normal';
      color = '#10b981';
      emoji = '✅';
      advice = lang === 'hi'
        ? 'बहुत बढ़िया! आपका वजन एकदम सही है। बस maintain करें।'
        : 'Excellent! Your weight is ideal. Focus on maintaining it.';
      dietPlan = {
        breakfast: { name: '3 Idli + Sambar + Chutney', cal: 280, protein: 9 },
        lunch: { name: 'Veg Biryani + Raita', cal: 480, protein: 14 },
        snack: { name: 'Roasted Makhana + Green Tea', cal: 110, protein: 4 },
        dinner: { name: 'Dalma + 2 Roti', cal: 420, protein: 15 },
        total: { cal: 1290, protein: 42 }
      };
    } else if (bmi < 30) {
      category = lang === 'hi' ? 'अधिक वजन (Overweight)' : 'Overweight';
      color = '#f59e0b';
      emoji = '⚠️';
      advice = lang === 'hi'
        ? 'वजन थोड़ा ज़्यादा है। Fried food कम करें, steamed food बढ़ाएं।'
        : 'Slightly overweight. Reduce fried foods, increase steamed and boiled options.';
      dietPlan = {
        breakfast: { name: '2 Idli + Coconut Chutney', cal: 180, protein: 6 },
        lunch: { name: 'Dalma + Brown Rice (½ cup)', cal: 320, protein: 12 },
        snack: { name: 'Cucumber + Buttermilk', cal: 60, protein: 3 },
        dinner: { name: 'Pakhala + Mixed Sabzi', cal: 250, protein: 6 },
        total: { cal: 810, protein: 27 }
      };
    } else {
      category = lang === 'hi' ? 'मोटापा (Obese)' : 'Obese';
      color = '#ef4444';
      emoji = '🚨';
      advice = lang === 'hi'
        ? 'कृपया डॉक्टर से मिलें। मीठे और तले हुए खाने बंद करें।'
        : 'Please consult a doctor. Eliminate sweets and fried foods immediately.';
      dietPlan = {
        breakfast: { name: '2 Idli (plain) + Green Tea', cal: 160, protein: 5 },
        lunch: { name: 'Dalma (1 bowl) + Salad', cal: 240, protein: 10 },
        snack: { name: 'Green tea + 3 Almonds', cal: 40, protein: 2 },
        dinner: { name: 'Moong Dal Soup + 1 Roti', cal: 200, protein: 10 },
        total: { cal: 640, protein: 27 }
      };
    }

    // BMR calculation (Mifflin-St Jeor)
    let bmr;
    if (gender === 'male') {
      bmr = 10 * w + 6.25 * h - 5 * (a || 25) + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * (a || 25) - 161;
    }
    const tdee = bmr * 1.55; // moderate activity

    setResult({ bmi: bmi.toFixed(1), category, color, emoji, advice, dietPlan, bmr: Math.round(bmr), tdee: Math.round(tdee) });
  };

  return (
    <div className="bmi-view">
      <div className="bmi-container">
        <div className="bmi-header">
          <div className="bmi-icon">🧮</div>
          <h2>{lang === 'hi' ? 'BMI कैलकुलेटर' : 'BMI Calculator'}</h2>
          <p>{lang === 'hi' ? 'अपना BMI जानें और personalized Indian diet पाएं' : 'Know your BMI and get a personalized Indian diet plan'}</p>
        </div>

        <div className="bmi-form">
          <div className="bmi-row">
            <div className="bmi-field">
              <label>{lang === 'hi' ? 'वजन (kg)' : 'Weight (kg)'}</label>
              <input
                type="number"
                placeholder="e.g. 72"
                value={weight}
                onChange={e => setWeight(e.target.value)}
              />
            </div>
            <div className="bmi-field">
              <label>{lang === 'hi' ? 'ऊंचाई (cm)' : 'Height (cm)'}</label>
              <input
                type="number"
                placeholder="e.g. 170"
                value={height}
                onChange={e => setHeight(e.target.value)}
              />
            </div>
          </div>
          <div className="bmi-row">
            <div className="bmi-field">
              <label>{lang === 'hi' ? 'उम्र' : 'Age'}</label>
              <input
                type="number"
                placeholder="e.g. 28"
                value={age}
                onChange={e => setAge(e.target.value)}
              />
            </div>
            <div className="bmi-field">
              <label>{lang === 'hi' ? 'लिंग' : 'Gender'}</label>
              <select value={gender} onChange={e => setGender(e.target.value)}>
                <option value="male">{lang === 'hi' ? 'पुरुष' : 'Male'}</option>
                <option value="female">{lang === 'hi' ? 'महिला' : 'Female'}</option>
              </select>
            </div>
          </div>
          <button className="bmi-calc-btn" onClick={calculate}>
            {lang === 'hi' ? '📊 BMI कैलकुलेट करें' : '📊 Calculate BMI'}
          </button>
        </div>

        {result && (
          <div className="bmi-result" style={{ '--bmi-color': result.color }}>
            <div className="bmi-score-card">
              <div className="bmi-big-number" style={{ color: result.color }}>
                {result.bmi}
              </div>
              <div className="bmi-category">
                <span className="bmi-emoji">{result.emoji}</span>
                <span style={{ color: result.color }}>{result.category}</span>
              </div>
              <p className="bmi-advice">{result.advice}</p>
            </div>

            <div className="bmi-stats">
              <div className="bmi-stat">
                <div className="bmi-stat-value">{result.bmr}</div>
                <div className="bmi-stat-label">BMR (kcal/day)</div>
              </div>
              <div className="bmi-stat">
                <div className="bmi-stat-value">{result.tdee}</div>
                <div className="bmi-stat-label">TDEE (kcal/day)</div>
              </div>
              <div className="bmi-stat">
                <div className="bmi-stat-value">{result.dietPlan.total.protein}g</div>
                <div className="bmi-stat-label">{lang === 'hi' ? 'प्रोटीन लक्ष्य' : 'Protein Target'}</div>
              </div>
            </div>

            <div className="bmi-diet-plan">
              <h3>🍽️ {lang === 'hi' ? 'आपका Personalized Diet Plan' : 'Your Personalized Diet Plan'}</h3>
              {['breakfast', 'lunch', 'snack', 'dinner'].map(meal => (
                <div key={meal} className="bmi-meal-row">
                  <span className="bmi-meal-icon">
                    {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '🌞' : meal === 'snack' ? '🫖' : '🌙'}
                  </span>
                  <div className="bmi-meal-info">
                    <div className="bmi-meal-name">{result.dietPlan[meal].name}</div>
                    <div className="bmi-meal-macros">
                      <span className="cal">{result.dietPlan[meal].cal} kcal</span>
                      <span className="prot">{result.dietPlan[meal].protein}g protein</span>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bmi-total">
                <span>🎯 {lang === 'hi' ? 'कुल' : 'Total'}:</span>
                <strong>{result.dietPlan.total.cal} kcal | {result.dietPlan.total.protein}g protein</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BMICalculator;
