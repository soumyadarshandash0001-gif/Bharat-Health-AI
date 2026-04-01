/**
 * BHARAT HEALTH AI — Intelligent API Client v2
 * 
 * Features:
 * - 3-layer memory injection
 * - Food lookup by name + state search
 * - Symptom/wellness handling
 * - Anti-repetition engine
 * - LLaMA 3.2 backend + expert fallback
 */

import { buildContext, addSessionMessage, trackIssues, getRecurringIssues } from './memory';
import { classifyIntent, detectState, decideMode } from './intent';
import { calculateHealthScores } from './scoring';
import { getLocalWeather, getWeatherAdvice } from './weather';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getRelevantReminders(intent) {
  const all = [
    { type: 'water', text: 'Drink 1 glass of water 💧', time: 'Every 2 hours' },
    { type: 'activity', text: '10-minute Brisk Walk 🚶', time: 'After every meal' },
    { type: 'posture', text: 'Check your posture 🧘', time: 'Every hour while working' }
  ];
  if (intent === 'fitness') return [all[1], all[0], all[2]];
  if (intent === 'medical') return [all[0], all[2], all[1]];
  return all;
}

function getRandomSuggestions(intent, weather) {
  const pools = {
    general: ["How much protein is in paneer?", "What are healthy foods in Odisha?", "Suggest a budget diet plan"],
    weight: ["How to lose 5kg in a month?", "Low calorie Indian snacks", "Walking vs Gym for fat loss"],
    fitness: ["Best pre-workout Indian food", "How to hit 100g protein (veg)?", "Creatine info for beginners"],
    medical: ["Safe fruits for diabetes", "HBA1C test info", "Diet for high blood pressure"],
    symptom: ["Home remedies for bloating", "Cold relief khichdi recipe", "Drinks for instant energy"],
    climate: ["Summer cooling drinks", "Immunity tea for rain", "Warm winter breakfast"]
  };
  
  let pool = pools[intent] || pools.general;
  if (weather?.type === 'cooling') pool = [...pool, ...pools.climate];
  
  return [...pool].sort(() => 0.5 - Math.random()).slice(0, 3);
}

// ═══════════════════════════════════════
// 🗃️ EXPANDED FOOD DATABASE
// ═══════════════════════════════════════
const FOODS = {
  idli: { name: "Idli", state: "Tamil Nadu", cal: 156, protein: 4.5, carbs: 33.5, fat: 1.5, gi: 35, method: "steamed", budget: "low" },
  masala_dosa: { name: "Masala Dosa", state: "Tamil Nadu", cal: 305, protein: 7.0, carbs: 52.0, fat: 10.5, gi: 55, method: "fried", budget: "low" },
  chicken_biryani: { name: "Chicken Biryani", state: "Telangana", cal: 495, protein: 19.0, carbs: 68.0, fat: 21.5, gi: 65, method: "fried", budget: "medium" },
  veg_biryani: { name: "Veg Biryani", state: "Telangana", cal: 400, protein: 13.0, carbs: 72.0, fat: 13.0, gi: 60, method: "fried", budget: "medium" },
  paneer_butter_masala: { name: "Paneer Butter Masala", state: "Punjab", cal: 480, protein: 17.5, carbs: 22.0, fat: 38.0, gi: 45, method: "gravy", budget: "medium" },
  butter_chicken: { name: "Butter Chicken", state: "Punjab", cal: 520, protein: 32.0, carbs: 13.0, fat: 38.0, gi: 40, method: "gravy", budget: "medium" },
  samosa: { name: "Samosa", state: "Maharashtra", cal: 262, protein: 5.0, carbs: 30.0, fat: 14.0, gi: 78, method: "fried", budget: "low" },
  rasgulla: { name: "Rasgulla", state: "West Bengal", cal: 230, protein: 5.0, carbs: 45.0, fat: 2.5, gi: 80, method: "syrup", budget: "low" },
  dalma: { name: "Dalma", state: "Odisha", cal: 210, protein: 9.0, carbs: 32.0, fat: 5.5, gi: 42, method: "boiled", budget: "low" },
  pakhala: { name: "Pakhala", state: "Odisha", cal: 190, protein: 4.5, carbs: 43.0, fat: 1.1, gi: 30, method: "fermented", budget: "low" },
  chhena_poda: { name: "Chhena Poda", state: "Odisha", cal: 380, protein: 9.5, carbs: 47.0, fat: 14.0, gi: 70, method: "baked", budget: "low" },
  dal_rice: { name: "Dal + Rice", state: "Pan India", cal: 340, protein: 12.0, carbs: 55.0, fat: 6.0, gi: 50, method: "boiled", budget: "low" },
  egg_bhurji: { name: "Egg Bhurji (3 eggs)", state: "Pan India", cal: 280, protein: 21.0, carbs: 3.0, fat: 20.0, gi: 0, method: "fried", budget: "low" },
  chana_roti: { name: "Chana + 2 Roti", state: "Pan India", cal: 380, protein: 15.0, carbs: 52.0, fat: 8.0, gi: 38, method: "boiled", budget: "low" },
  paneer_bhurji: { name: "Paneer Bhurji (150g)", state: "Pan India", cal: 350, protein: 22.0, carbs: 6.0, fat: 26.0, gi: 0, method: "fried", budget: "medium" },
  moong_dal: { name: "Moong Dal Khichdi", state: "Pan India", cal: 250, protein: 10.0, carbs: 40.0, fat: 4.0, gi: 35, method: "boiled", budget: "low" },
  peanut_chikki: { name: "Peanut Chikki (50g)", state: "Maharashtra", cal: 230, protein: 8.0, carbs: 22.0, fat: 14.0, gi: 42, method: "raw", budget: "low" },
  poha: { name: "Poha", state: "Maharashtra", cal: 244, protein: 5.0, carbs: 40.0, fat: 8.0, gi: 50, method: "fried", budget: "low" },
  upma: { name: "Upma", state: "Tamil Nadu", cal: 210, protein: 5.0, carbs: 35.0, fat: 7.0, gi: 55, method: "boiled", budget: "low" },
  curd_rice: { name: "Curd Rice", state: "Tamil Nadu", cal: 220, protein: 6.0, carbs: 38.0, fat: 5.0, gi: 45, method: "mixed", budget: "low" },
  rajma_chawal: { name: "Rajma Chawal", state: "Punjab", cal: 380, protein: 14.0, carbs: 60.0, fat: 7.0, gi: 50, method: "boiled", budget: "low" },
  aloo_paratha: { name: "Aloo Paratha", state: "Punjab", cal: 320, protein: 7.0, carbs: 45.0, fat: 14.0, gi: 60, method: "fried", budget: "low" },
  fish_curry: { name: "Fish Curry", state: "Odisha", cal: 280, protein: 25.0, carbs: 8.0, fat: 16.0, gi: 0, method: "gravy", budget: "medium" },
  rasam_rice: { name: "Rasam Rice", state: "Tamil Nadu", cal: 200, protein: 4.0, carbs: 42.0, fat: 2.0, gi: 48, method: "boiled", budget: "low" },
  vada: { name: "Medu Vada", state: "Tamil Nadu", cal: 170, protein: 6.0, carbs: 15.0, fat: 10.0, gi: 55, method: "fried", budget: "low" },
  lassi: { name: "Lassi (Sweet)", state: "Punjab", cal: 180, protein: 5.0, carbs: 30.0, fat: 5.0, gi: 55, method: "mixed", budget: "low" },
  santula: { name: "Santula (Mixed Veg)", state: "Odisha", cal: 120, protein: 4.0, carbs: 18.0, fat: 3.5, gi: 30, method: "boiled", budget: "low" },
  dahi_bara: { name: "Dahi Bara", state: "Odisha", cal: 250, protein: 7.0, carbs: 38.0, fat: 8.0, gi: 55, method: "fried", budget: "low" },
};

const ALL_FOODS = Object.values(FOODS);

// ═══════════════════════════════════════
// 🔍 FOOD SEARCH FUNCTIONS
// ═══════════════════════════════════════
function searchFoodByName(query) {
  const q = query.toLowerCase();
  return ALL_FOODS.filter(f => {
    const name = f.name.toLowerCase();
    return name.includes(q) || q.includes(name.split(' ')[0].toLowerCase());
  });
}

function searchFoodByState(stateName) {
  return ALL_FOODS.filter(f => f.state === stateName);
}

function findExactFood(query) {
  const q = query.toLowerCase();
  for (const [key, food] of Object.entries(FOODS)) {
    const cleanKey = key.replace(/_/g, ' ');
    const foodName = food.name.toLowerCase();
    if (q.includes(cleanKey) || q.includes(foodName)) return food;
  }
// partial
  for (const [key, food] of Object.entries(FOODS)) {
    const parts = key.split('_');
    for (const part of parts) {
      if (part.length > 3 && q.includes(part)) return food;
    }
  }
  return null;
}

function detectMultipleFoods(query) {
  const q = query.toLowerCase();
  const found = [];

  // Pattern 1: "2 idli 1 dosa"
  const matches = [...q.matchAll(/(\d+)\s*([a-z]+)/g)];
  for (const match of matches) {
    const qty = parseInt(match[1]);
    const word = match[2];
    for (const [key, food] of Object.entries(FOODS)) {
      if (key.includes(word) || food.name.toLowerCase().includes(word)) {
        found.push({ qty, food });
        break;
      }
    }
  }

  // Pattern 2: "idli and dosa and sambar" (no quantities)
  if (found.length === 0) {
    for (const [key, food] of Object.entries(FOODS)) {
      const cleanKey = key.replace(/_/g, ' ');
      if (q.includes(cleanKey) || q.includes(food.name.toLowerCase())) {
        if (!found.find(f => f.food.name === food.name)) {
          found.push({ qty: 1, food });
        }
      }
    }
  }
  return found;
}

// ═══════════════════════════════════════
// 🩺 SYMPTOM DATABASE
// ═══════════════════════════════════════
const SYMPTOM_REMEDIES = {
  cold: {
    emoji: '🤧', label: 'Cold / Sardi',
    remedies: ['Haldi + adrak + honey wali chai — anti-inflammatory powerhouse', 'Tulsi + kali mirch ka kadha — clears congestion', 'Warm haldi doodh before bed — boosts immunity overnight'],
    eat: ['Khichdi (easy to digest, warm)', 'Dalma (light + nutritious)', 'Hot rasam with pepper — opens sinuses', 'Warm soups, dals, steamed veggies'],
    avoid: ['Cold drinks, ice cream', 'Fried foods (increases mucus)', 'Dairy (can worsen congestion)', 'Heavy meals at night'],
    doctor: 'If fever > 101°F for 3+ days, or severe body ache, or breathing difficulty',
  },
  fever: {
    emoji: '🤒', label: 'Fever / Bukhar',
    remedies: ['Tulsi + adrak chai — natural antipyretic', 'Cold compress on forehead', 'Rest — body is fighting infection'],
    eat: ['Light khichdi, dalma', 'ORS / lemon water with salt', 'Coconut water — electrolytes', 'Idli — easy to digest'],
    avoid: ['Spicy food', 'Non-veg until fever breaks', 'Heavy meals', 'Caffeine (dehydrates)'],
    doctor: 'If fever > 103°F, or lasts > 3 days, or with rash/stiff neck',
  },
  headache: {
    emoji: '🤕', label: 'Headache / Sar Dard',
    remedies: ['Drink 2 glasses water NOW (dehydration is top cause)', 'Peppermint/balm on temples', 'Deep breathing — 4-7-8 technique (inhale 4, hold 7, exhale 8)'],
    eat: ['Banana (magnesium helps)', 'Green tea (gentle caffeine)', 'Nuts — almonds, walnuts', 'Pakhala — cooling + hydrating'],
    avoid: ['Excess caffeine', 'Processed food / MSG', 'Skipping meals (causes headaches!)', 'Screen time — take 20-min break'],
    doctor: 'If worst headache ever, or with vision changes, or after head injury',
  },
  tired: {
    emoji: '😴', label: 'Fatigue / Thakan',
    remedies: ['Check: are you sleeping 7-8 hours?', 'Hydrate — fatigue is often dehydration', 'Iron-rich foods (common deficiency in India)'],
    eat: ['Egg bhurji — iron + B12', 'Dal + rice — complete protein', 'Dates + nuts — instant energy', 'Spinach sabzi — iron boost'],
    avoid: ['Excess sugar (causes energy crash)', 'Heavy lunch (food coma)', 'Late-night screens', 'Skipping breakfast'],
    doctor: 'If fatigue persists > 2 weeks, or with weight loss, or pale skin → get blood test (Hb, B12, Thyroid)',
  },
  acidity: {
    emoji: '🔥', label: 'Acidity / Gas',
    remedies: ['Cold milk — instant relief', 'Jeera water — boil 1 tsp jeera in water', 'Saunf (fennel) after meals', 'Banana — natural antacid'],
    eat: ['Curd rice — probiotic + soothing', 'Pakhala — fermented, gut-friendly', 'Coconut water', 'Steamed idli — gentle on stomach'],
    avoid: ['Tea/coffee on empty stomach', 'Spicy food, chaat, pickles', 'Late dinner (eat before 8 PM)', 'Lying down right after eating'],
    doctor: 'If burning sensation daily, or with blood in stool, or chest pain',
  },
  bloat: {
    emoji: '🫃', label: 'Bloating / Pet Phoolna',
    remedies: ['Ajwain water — boil 1 tsp in water', 'Hing (asafoetida) — pinch in warm water', '15-min walk after meals'],
    eat: ['Khichdi — easy to digest', 'Papaya — digestive enzymes', 'Buttermilk (chaas) with jeera', 'Santula — light mixed veg'],
    avoid: ['Beans/chana (if causing gas)', 'Carbonated drinks', 'Eating too fast', 'Chewing gum'],
    doctor: 'If bloating daily for > 2 weeks, or with unexplained weight loss',
  },
  hair_fall: {
    emoji: '💇', label: 'Hair Fall / Baal Jharna',
    remedies: ['Check iron, B12, Vitamin D, thyroid levels', 'Amla — eat or apply oil', 'Coconut oil head massage 2x/week'],
    eat: ['Eggs — biotin + protein', 'Spinach + beetroot — iron', 'Almonds + walnuts — omega-3', 'Curd — protein for hair keratin'],
    avoid: ['Crash diets (major hair fall cause!)', 'Excess heat styling', 'Stress (practice yoga/meditation)', 'Chemical-heavy shampoos'],
    doctor: 'If losing > 100 hairs/day, or bald patches, or with thyroid symptoms',
  },
  stress: {
    emoji: '😰', label: 'Stress / Tension',
    remedies: ['Box breathing: 4 sec inhale → 4 hold → 4 exhale → 4 hold', '10-min walk in sunlight', 'Talk to someone you trust'],
    eat: ['Dark chocolate (small piece)', 'Banana — serotonin boost', 'Warm haldi doodh — calming', 'Chamomile or green tea'],
    avoid: ['Excess caffeine', 'Social media scrolling', 'Processed food / junk', 'Alcohol (feels good short-term, worsens anxiety)'],
    doctor: 'If stress affects daily life, or with panic attacks, or feeling hopeless for > 2 weeks',
  },
};

function detectSymptom(query) {
  const q = query.toLowerCase();
  for (const [key, data] of Object.entries(SYMPTOM_REMEDIES)) {
    if (q.includes(key)) return { key, ...data };
    // Check label too
    const labelParts = data.label.toLowerCase().split(/[\/\s]+/);
    for (const part of labelParts) {
      if (part.length > 3 && q.includes(part)) return { key, ...data };
    }
  }
  // Broader checks
  if (q.includes('feeling') && (q.includes('cold') || q.includes('sick') || q.includes('unwell'))) {
    return { key: 'cold', ...SYMPTOM_REMEDIES.cold };
  }
  if (q.includes('not feeling well') || q.includes('tabiyat') || q.includes('तबीयत')) {
    return { key: 'cold', ...SYMPTOM_REMEDIES.cold };
  }
  return null;
}


async function tryFetch(url, options) {
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(12000) });
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

// ════════════════════════════════════════════
// MAIN CHAT FUNCTION
// ════════════════════════════════════════════
export async function chat(question, language = 'en') {
  addSessionMessage('user', question);
  trackIssues(question);

  const { intent, persona } = classifyIntent(question);
  const context = buildContext();
  const profile = context.user_profile;
  const mode = decideMode(question, profile);

  // Try real backend
  const backendData = await tryFetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question, language,
      context: JSON.stringify(context),
      intent, mode,
    })
  });

  if (backendData) {
    addSessionMessage('ai', backendData.response);
    return { ...backendData, intent, persona, suggestions: getRandomSuggestions(3) };
  }

  // Expert fallback
  const weather = await getLocalWeather(profile.location || 'India');
  const weatherAdvice = getWeatherAdvice(weather);
  
  const response = generateExpertResponse(question, language, intent, mode, profile, context, weatherAdvice);
  const finalResponse = { 
    ...response, 
    intent, 
    persona, 
    suggestions: getRandomSuggestions(intent, weatherAdvice),
    weather: weatherAdvice,
    reminders: getRelevantReminders(intent)
  };

  addSessionMessage('ai', finalResponse.response);
  return finalResponse;
}

// ════════════════════════════════════════════
// EXPERT RESPONSE ENGINE v3 (Climate-Aware)
// ════════════════════════════════════════════
function generateExpertResponse(question, lang, intent, mode, profile, context, weatherAdvice) {
  const isHi = lang === 'hi';
  const q = question.toLowerCase();
  const name = profile.name || (isHi ? 'दोस्त' : 'friend');
  const loc = profile.location || '';
  const goal = profile.goal || '';
  const diet = profile.diet || 'veg';
  const budget = profile.budget || 'low';

  // ══════ SYMPTOM HANDLER ══════
  if (intent === 'symptom' || detectSymptom(q)) {
    const symptom = detectSymptom(q);
    if (symptom) {
      return {
        response: (isHi
          ? `${symptom.emoji} **Dr. Sharma (Wellness):**\n\n${name}, samjh raha hoon — ${symptom.label} ho raha hai. Fikar mat karo, main help karta hoon:\n\n`
          : `${symptom.emoji} **Dr. Sharma (Wellness):**\n\n${name}, I understand — you're dealing with ${symptom.label}. Don't worry, I'm here to help:\n\n`) +
          `🏠 **Home Remedies:**\n${symptom.remedies.map(r => `• ${r}`).join('\n')}\n\n` +
          `🍽️ **Foods to Eat:**\n${symptom.eat.map(e => `• ${e}`).join('\n')}\n\n` +
          `❌ **Avoid:**\n${symptom.avoid.map(a => `• ${a}`).join('\n')}\n\n` +
          `⚠️ **See a Doctor if:** ${symptom.doctor}\n\n` +
          (isHi
            ? `💡 Aur kuch symptoms hain? Mujhe batao, main specific advice dunga.`
            : `💡 Any other symptoms? Tell me and I'll give specific advice.`),
        sources: [],
        model: 'expert-wellness'
      };
    }
  }

  // ══════ MULTI FOOD SYSTEM CALC ══════
  if (intent === 'multi_food_calc' || q.includes('macros') || q.includes('total')) {
    const multi = detectMultipleFoods(q);
    if (multi.length > 0) {
      let totalCal = 0, totalPro = 0, totalCar = 0, totalFat = 0;
      const lines = [];

      for (const item of multi) {
        const cal = item.qty * item.food.cal;
        const pro = item.qty * item.food.protein;
        const car = item.qty * item.food.carbs;
        const fat = item.qty * item.food.fat;

        totalCal += cal; totalPro += pro; totalCar += car; totalFat += fat;
        lines.push(`• **${item.qty}x ${item.food.name}** — ${cal.toFixed(1)} kcal | ${pro.toFixed(1)}g P | ${car.toFixed(1)}g C | ${fat.toFixed(1)}g F`);
      }

      const verdict = totalCal <= 600 ? '✅ Balanced meal' : '⚠️ Heavy meal';
      
      return {
        response: `🧮 **Total Macros Calculation:**\n\n${lines.join('\n')}\n\n` + 
                  `🎯 **GRAND TOTAL:**\n` +
                  `🔥 **${totalCal.toFixed(1)} kcal**\n` +
                  `🥚 **${totalPro.toFixed(1)}g Protein**\n` +
                  `🍚 **${totalCar.toFixed(1)}g Carbs**\n` +
                  `🧈 **${totalFat.toFixed(1)}g Fat**\n\n` +
                  `💡 Verdict: ${verdict}`,
        sources: multi.map(m => ({ food: m.food.name, calories: m.food.cal, protein: m.food.protein, carbs: m.food.carbs, fat: m.food.fat })),
        model: 'expert-macro-calculator'
      };
    }
  }

  // ══════ STATE FOOD SEARCH ══════
  if (intent === 'state_food') {
    const state = detectState(question);
    if (state) {
      const foods = searchFoodByState(state);
      if (foods.length > 0) {
        const foodLines = foods.map(f => {
          const rating = f.gi <= 45 ? '✅ Healthy' : f.gi <= 65 ? '⚠️ Moderate' : '❌ High GI';
          return `• **${f.name}** — ${f.cal} kcal | ${f.protein}g P | ${f.carbs}g C | ${f.fat}g F | ${f.method} | ${rating}`;
        }).join('\n');

        const healthyPicks = foods.filter(f => f.gi <= 50).slice(0, 3);
        const mealSuggestion = healthyPicks.length > 0
          ? `\n\n🍽️ **Best ${state} Meal Combo:**\n${healthyPicks.map(f => `• ${f.name} (${f.cal} kcal)`).join(' + ')}`
          : '';

        return {
          response: (isHi
            ? `🗺️ **${state} ke Famous Foods:**\n\n${foodLines}${mealSuggestion}\n\n💡 Kisi bhi food ke baare mein detail puchho — main full nutrition bataunga!`
            : `🗺️ **Famous Foods from ${state}:**\n\n${foodLines}${mealSuggestion}\n\n💡 Ask me about any food for full nutritional details!`),
          sources: foods.slice(0, 3).map(f => ({ food: f.name, calories: f.cal, protein: f.protein, carbs: f.carbs, fat: f.fat })),
          model: 'expert-regional'
        };
      }
    }
  }

  // ══════ FOOD LOOKUP ══════
  const food = findExactFood(q);
  if (food && (intent === 'general' || q.includes('about') || q.includes('detail') || q.includes('tell') || q.includes('what is') || q.includes('nutrition'))) {
    const giLabel = food.gi <= 35 ? 'Low (Good ✅)' : food.gi <= 55 ? 'Medium ⚠️' : food.gi >= 70 ? 'High ❌' : 'Moderate';
    const verdict = food.gi <= 50 && food.protein >= 5 ? '✅ Healthy choice' :
                    food.gi >= 70 ? '⚠️ Eat in moderation' : '📊 Balanced option';
    return {
      response: (isHi
        ? `🔍 **${food.name} — Full Analysis:**\n\n`
        : `🔍 **${food.name} — Complete Breakdown:**\n\n`) +
        `📍 **Region:** ${food.state}\n` +
        `🔥 **Calories:** ${food.cal} kcal\n` +
        `🥚 **Protein:** ${food.protein}g\n` +
        `🍚 **Carbs:** ${food.carbs}g\n` +
        `🧈 **Fat:** ${food.fat}g\n` +
        `📊 **GI:** ${food.gi} — ${giLabel}\n` +
        `👨‍🍳 **Method:** ${food.method}\n` +
        `💰 **Budget:** ${food.budget}\n\n` +
        `🏷️ **Verdict:** ${verdict}\n\n` +
        (isHi
          ? `💡 ${name}, isko ${food.gi <= 50 ? 'regularly kha sakte ho' : 'occasionally khao'}. Kuch aur jaanna hai?`
          : `💡 ${name}, you can eat this ${food.gi <= 50 ? 'regularly' : 'occasionally'}. Want to know more?`),
      sources: [{ food: food.name, calories: food.cal, protein: food.protein, carbs: food.carbs, fat: food.fat }],
      model: 'expert-food-lookup'
    };
  }

  // ══════ HEALTH SCORE ══════
  if (intent === 'score' || matchKW(q, ['score', 'report', 'progress'])) {
    const scores = calculateHealthScores(profile);
    return {
      response: (isHi
        ? `📊 **${name}, Health Report:**\n\n`
        : `📊 **${name}, your Health Report:**\n\n`) +
        `🥚 Protein Score: **${scores.proteinScore}/10** ${scores.proteinScore < 5 ? '⚠️' : '✅'}\n` +
        `🍬 Sugar Risk: **${scores.sugarRisk}/10** ${scores.sugarRisk > 6 ? '⚠️' : '✅'}\n` +
        `🥗 Diet Quality: **${scores.dietQuality}/10**\n` +
        `📅 Consistency: **${scores.consistencyScore}/10**\n\n` +
        `🎯 **Overall: ${scores.overall}/10**\n\n` +
        `📋 **Fixes:**\n${scores.fixes.map(f => `${f.emoji} ${f.text}`).join('\n')}`,
      sources: [],
      model: 'health-scoring-engine'
    };
  }

  // ══════ EXPLORATION MODE ══════
  if (mode === 'exploration') {
    return {
      response: isHi
        ? `🌿 **${name}, pehle thoda info chahiye:**\n\n` +
          `${!goal ? '🎯 Goal kya hai? (fat loss / muscle gain / sugar control)\n' : ''}` +
          `${!diet ? '🍽️ Diet type? (veg / non-veg / egg)\n' : ''}` +
          `${!profile.weight ? '⚖️ Weight kitna hai?\n' : ''}` +
          `\n💡 Ye details se **personalized** plan milega!`
        : `🌿 **${name}, I need a few details:**\n\n` +
          `${!goal ? '🎯 What is your goal? (fat loss / muscle gain / sugar control)\n' : ''}` +
          `${!diet ? '🍽️ Diet type? (veg / non-veg / egg)\n' : ''}` +
          `${!profile.weight ? '⚖️ What is your weight?\n' : ''}` +
          `\n💡 This helps me give **personalized** advice!`,
      sources: [],
      model: 'exploration-mode'
    };
  }

  // ══════ CORRECTION MODE ══════
  if (mode === 'correction') {
    return {
      response: (isHi
        ? `🩺 **Dr. Sharma (Medical Alert):**\n\n⚠️ ${name}, yeh approach **dangerous** hai!\n\n`
        : `🩺 **Dr. Sharma (Medical Alert):**\n\n⚠️ ${name}, this approach is **dangerous**!\n\n`) +
        `${q.includes('crash') ? '• Crash diet → starvation mode → metabolism 25% slow\n• Muscle loss, not fat loss\n• 90% rebound weight gain\n' : ''}` +
        `${q.includes('no carb') ? '• Zero carb = energy crash + brain fog\n• Indian body needs carbs (dal, roti)\n' : ''}` +
        `${q.includes('detox') ? '• Detox juices are a myth — your liver already detoxifies\n' : ''}` +
        `\n✅ **Instead:** Sustainable 500 kcal deficit with ${diet === 'veg' ? 'dal + paneer + sabzi' : 'eggs + chicken + dal'}\n` +
        `💡 Slow fat loss (0.5kg/week) = permanent results!`,
      sources: [],
      model: 'correction-mode'
    };
  }

  // ══════ RECURRING ISSUE AWARENESS ══════
  const recurring = getRecurringIssues();
  let recurringNote = '';
  if (recurring.length > 0 && recurring[0].count >= 2) {
    const top = recurring[0];
    recurringNote = isHi
      ? `\n\n🔔 **Pattern:** ${name}, aapne ${top.count} baar ${top.issue} poocha hai — let me give a permanent fix.`
      : `\n\n🔔 **Pattern detected:** ${name}, you've asked about ${top.issue} ${top.count} times — let me suggest a permanent fix.`;
  }

  // Budget + diet filtering
  const budgetFoods = ALL_FOODS.filter(f => budget === 'high' || f.budget === 'low' || (budget === 'medium' && f.budget !== 'high'));
  const dietFoods = budgetFoods.filter(f =>
    diet === 'nonveg' ? true :
    diet === 'egg' ? (!f.name.includes('Chicken') && !f.name.includes('Fish')) :
    !['Chicken Biryani', 'Butter Chicken', 'Egg Bhurji', 'Fish Curry'].some(n => f.name.includes(n.split(' ')[0]))
  );
  const locNote = loc ? (isHi ? `(${loc} se hain to ) ` : `(being from ${loc}) `) : '';

  // ══════ INTENT-BASED RESPONSES ══════

  // DIABETES
  if (intent === 'medical' || matchKW(q, ['diabetes', 'sugar', 'शुगर', 'glucose', 'hba1c', 'insulin', 'glycemic'])) {
    const safeFoods = dietFoods.filter(f => f.gi <= 45);
    const dangerFoods = ALL_FOODS.filter(f => f.gi >= 70);
    return {
      response: (isHi
        ? `🩺 **Dr. Sharma:**\n\n${name}, ${locNote}diabetes control mein GI sabse important hai.\n\n`
        : `🩺 **Dr. Sharma:**\n\n${name}, ${locNote}for diabetes, GI is the key factor.\n\n`) +
        `✅ **Safe (GI ≤ 45):**\n${safeFoods.slice(0, 5).map(f => `• ${f.name} — ${f.cal} kcal, GI: ${f.gi}`).join('\n')}\n\n` +
        `❌ **Avoid (GI ≥ 70):**\n${dangerFoods.slice(0, 3).map(f => `• ${f.name} — GI: ${f.gi} ⚠️`).join('\n')}\n\n` +
        (isHi
          ? `📋 Carbs < 45g/meal | Protein combo | Dinner 8 PM se pehle\n⚠️ Regular HbA1c check karvaayein.`
          : `📋 Keep carbs < 45g/meal | Pair with protein | Dinner before 8 PM\n⚠️ Get regular HbA1c checks.`) +
        recurringNote,
      sources: safeFoods.slice(0, 3).map(f => ({ food: f.name, calories: f.cal, protein: f.protein, carbs: f.carbs, fat: f.fat })),
      model: 'expert-medical'
    };
  }

  // PROTEIN / FITNESS
  if (intent === 'fitness' || matchKW(q, ['protein', 'muscle', 'gym', 'workout'])) {
    const w = parseFloat(profile.weight) || 70;
    const proteinTarget = Math.round(w * (goal === 'muscle_gain' ? 2.0 : 1.6));
    const highProtein = dietFoods.sort((a, b) => b.protein - a.protein).slice(0, 5);
    return {
      response: (isHi
        ? `💪 **Coach Arjun:**\n\n${name}, daily protein target: **${proteinTarget}g**\n\n`
        : `💪 **Coach Arjun:**\n\n${name}, your daily protein target: **${proteinTarget}g**\n\n`) +
        `🏆 **Top Protein Sources:**\n${highProtein.map(f => `• ${f.name} — **${f.protein}g P**, ${f.cal} kcal`).join('\n')}\n\n` +
        (isHi
          ? `💡 Post-workout 30 min ke andar protein = 40% faster recovery!`
          : `💡 Protein within 30 min post-workout = 40% faster recovery!`) +
        recurringNote,
      sources: highProtein.slice(0, 3).map(f => ({ food: f.name, calories: f.cal, protein: f.protein, carbs: f.carbs, fat: f.fat })),
      model: 'expert-fitness'
    };
  }

  // WEIGHT LOSS
  if (intent === 'weight' || matchKW(q, ['weight', 'fat loss', 'slim', 'reduce'])) {
    const lowCal = dietFoods.sort((a, b) => a.cal - b.cal).slice(0, 5);
    return {
      response: (isHi
        ? `🥗 **Priya Patel:**\n\n${name}, ${locNote}sustainable weight loss = **Calorie Deficit + Protein + Fiber**\n\n`
        : `🥗 **Priya Patel:**\n\n${name}, ${locNote}sustainable weight loss = **Calorie Deficit + Protein + Fiber**\n\n`) +
        `🏆 **Lowest Cal Foods:**\n${lowCal.map(f => `• ${f.name} — **${f.cal} kcal**, ${f.protein}g P`).join('\n')}\n\n` +
        (isHi ? `⚠️ 1,200 kcal se neeche KABHI nahi!\n💡 30 min daily walk = game changer!` : `⚠️ Never go below 1,200 kcal!\n💡 30 min daily walk = game changer!`) +
        recurringNote,
      sources: lowCal.slice(0, 3).map(f => ({ food: f.name, calories: f.cal, protein: f.protein, carbs: f.carbs, fat: f.fat })),
      model: 'expert-weight'
    };
  }

  // BEHAVIOR
  if (intent === 'behavior') {
    return {
      response: isHi
        ? `🧠 **Coach Meera:**\n\n${name}, consistency ke 3 rules:\n\n` +
          `**1. 2-Minute Rule** 🕐 — Bas 2 min se start karo\n` +
          `**2. Environment Design** 🏠 — Healthy saamne, junk door\n` +
          `**3. Habit Stacking** 📚 — "Chai ke baad → 5 min stretch"\n\n` +
          `💡 **Small daily step >> big step kabhi-kabhi**`
        : `🧠 **Coach Meera:**\n\n${name}, 3 rules of consistency:\n\n` +
          `**1. 2-Minute Rule** 🕐 — Just start with 2 min\n` +
          `**2. Environment Design** 🏠 — Healthy visible, junk hidden\n` +
          `**3. Habit Stacking** 📚 — "After chai → 5 min stretch"\n\n` +
          `💡 **A small daily step >> a big step once in a while**`,
      sources: [],
      model: 'expert-behavior'
    };
  }

  // MEAL PLAN / DIET
  if (matchKW(q, ['meal', 'plan', 'breakfast', 'lunch', 'dinner', 'diet', 'food'])) {
    const goalLabel = { fat_loss: 'Weight Loss', muscle_gain: 'Muscle Gain', maintain: 'Balanced', diabetes_control: 'Diabetes-Safe' }[goal] || 'Balanced';
    return {
      response: (isHi
        ? `🥗 **Priya Patel:**\n\n${name}, ${locNote}**${goalLabel}** plan:\n\n`
        : `🥗 **Priya Patel:**\n\n${name}, ${locNote}**${goalLabel}** plan:\n\n`) +
        `🌅 **7 AM:** ${diet !== 'veg' ? 'Egg Bhurji + Roti' : 'Moong Khichdi'} — ${diet !== 'veg' ? 280 : 250} kcal\n` +
        `🌞 **1 PM:** Dalma + Rice + Sabzi — 380 kcal\n` +
        `🫖 **5 PM:** ${budget === 'low' ? 'Roasted chana + chai' : 'Makhana + green tea'} — 90 kcal\n` +
        `🌙 **8 PM:** ${loc === 'Odisha' ? 'Pakhala + Sabzi' : 'Dal + 2 Roti'} — 300 kcal\n\n` +
        `🎯 Total: ~1,050 kcal\n` +
        `💡 Use **Meal Plan** tab for full personalized plans!`,
      sources: [FOODS.dalma, FOODS.dal_rice, diet !== 'veg' ? FOODS.egg_bhurji : FOODS.moong_dal].filter(Boolean).map(f => ({ food: f.name, calories: f.cal, protein: f.protein, carbs: f.carbs, fat: f.fat })),
      model: 'expert-diet'
    };
  }

  // BMI
  if (matchKW(q, ['bmi', 'body mass'])) {
    return {
      response: isHi
        ? `🧮 ${name}, BMI Calculator sidebar mein available hai!\nClick karein → Result + personalized diet!`
        : `🧮 ${name}, the BMI Calculator is in the sidebar!\nClick it → Get instant result + personalized diet!`,
      sources: [],
      model: 'expert-redirect'
    };
  }

  // ══════ CLIMATE ADVICE ══════
  let climateNote = '';
  if (weatherAdvice) {
    climateNote = `\n\n🌤️ **Climate Tip:** ${weatherAdvice.text}\nTry: ${weatherAdvice.tags.join(', ')}`;
  }

  // ══════ DEFAULT ══════
  const topFoods = dietFoods.sort((a, b) => (b.protein / b.cal) - (a.protein / a.cal)).slice(0, 4);
  return {
    response: (isHi
      ? `🌿 **Bharat Health AI:**\n\n${name}${loc ? ` (${loc})` : ''}, main samajh gaya!\n\n`
      : `🌿 **Bharat Health AI:**\n\n${name}${loc ? ` (${loc})` : ''}, I got it!\n\n`) +
      `🏆 **Best Foods:**\n${topFoods.map(f => `• ${f.name} — ${f.cal} kcal, ${f.protein}g P`).join('\n')}\n` +
      climateNote + 
      (isHi
        ? `\n\n📋 **Puchho:**\n• "Odisha food list"\n• "Tell me about dalma"\n• "I'm feeling cold"\n• "Diabetes diet plan"\n\n💡 BMI Calculator aur Meal Planner sidebar mein hain!`
        : `\n\n📋 **Try asking:**\n• "Odisha food list"\n• "Tell me about dalma"\n• "I'm feeling cold"\n• "Diabetes diet plan"\n\n💡 BMI Calculator and Meal Planner in the sidebar!`) +
      recurringNote,
    sources: topFoods.slice(0, 3).map(f => ({ food: f.name, calories: f.cal, protein: f.protein, carbs: f.carbs, fat: f.fat })),
    model: 'expert-general'
  };
}

function matchKW(query, keywords) {
  return keywords.some(k => query.includes(k));
}
