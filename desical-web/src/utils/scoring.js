/**
 * HEALTH SCORING ENGINE
 * Generates ATS-style health scores from user data.
 */

export function calculateHealthScores(profile, mealLog = null) {
  const w = parseFloat(profile.weight) || 70;
  const goal = profile.goal || 'maintain';

  // ── Required protein (g) ──
  const proteinMultiplier = {
    muscle_gain: 2.0,
    fat_loss: 1.6,
    maintain: 1.2,
    diabetes_control: 1.0,
  }[goal] || 1.2;
  const requiredProtein = Math.round(w * proteinMultiplier);

  // ── Estimated intake (from meal log or profile patterns) ──
  const estimatedProtein = mealLog?.protein || (profile.diet === 'veg' ? 35 : 55);
  const estimatedSugar = mealLog?.sugar || 45;
  const processedFoodPct = mealLog?.processed || 30;
  const fruitVegServings = mealLog?.fruitVeg || 2;

  // ── 1. PROTEIN SCORE (0-10) ──
  const proteinScore = Math.min(10, Math.round((estimatedProtein / requiredProtein) * 10 * 10) / 10);

  // ── 2. SUGAR RISK (0-10, higher = worse) ──
  let sugarRisk;
  if (estimatedSugar > 50) sugarRisk = 9;
  else if (estimatedSugar > 40) sugarRisk = 7.5;
  else if (estimatedSugar > 30) sugarRisk = 5;
  else if (estimatedSugar > 20) sugarRisk = 3;
  else sugarRisk = 1.5;

  // Diabetes users get +1 risk
  if (goal === 'diabetes_control') sugarRisk = Math.min(10, sugarRisk + 1);

  // ── 3. DIET QUALITY (0-10) ──
  let dietQuality = 5;
  dietQuality -= (processedFoodPct / 20);    // penalize processed food
  dietQuality += (fruitVegServings * 0.8);   // reward fruit/veg
  if (profile.diet === 'veg') dietQuality += 0.5;      // slight veg bonus
  if (estimatedProtein >= requiredProtein * 0.7) dietQuality += 1.5;
  dietQuality = Math.min(10, Math.max(1, Math.round(dietQuality * 10) / 10));

  // ── 4. CONSISTENCY SCORE (0-10) ──
  const behavior = JSON.parse(localStorage.getItem('bharat_health_behavior') || '{}');
  const streakDays = behavior.streak_days || 0;
  const consistencyScore = Math.min(10, Math.round((streakDays / 7) * 10 * 10) / 10);

  // ── OVERALL SCORE ──
  const overall = Math.round(((proteinScore + (10 - sugarRisk) + dietQuality + consistencyScore) / 4) * 10) / 10;

  // ── KEY FIXES ──
  const fixes = [];
  if (proteinScore < 6) {
    const gap = requiredProtein - estimatedProtein;
    const fix = profile.diet === 'veg'
      ? `Add ${gap}g protein daily (2 eggs or 100g paneer or 1 cup dal extra)`
      : `Add ${gap}g protein daily (150g chicken breast or 3 eggs)`;
    fixes.push({ emoji: '🥚', text: fix, priority: 'high' });
  }
  if (sugarRisk >= 7) {
    fixes.push({ emoji: '🍬', text: 'Reduce sugar — skip chai sugar, avoid packaged juice', priority: 'high' });
  }
  if (dietQuality < 5) {
    fixes.push({ emoji: '🥗', text: 'Eat 3+ servings fruits/vegetables daily', priority: 'medium' });
  }
  if (consistencyScore < 4) {
    fixes.push({ emoji: '📅', text: 'Build streak — use the app daily for tracking', priority: 'medium' });
  }
  if (fixes.length === 0) {
    fixes.push({ emoji: '✅', text: 'Great job! Keep maintaining this routine', priority: 'low' });
  }

  return {
    proteinScore,
    sugarRisk,
    dietQuality,
    consistencyScore,
    overall,
    requiredProtein,
    estimatedProtein,
    fixes,
  };
}

export function getScoreColor(score, inverted = false) {
  const val = inverted ? 10 - score : score;
  if (val >= 7) return '#10b981';
  if (val >= 4) return '#f59e0b';
  return '#ef4444';
}

export function getScoreLabel(score, inverted = false) {
  const val = inverted ? 10 - score : score;
  if (val >= 7) return 'Good';
  if (val >= 4) return 'Needs Work';
  return 'Critical';
}
