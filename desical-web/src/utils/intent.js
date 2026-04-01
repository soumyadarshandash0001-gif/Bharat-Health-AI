/**
 * INTENT CLASSIFIER v2
 * Detects: food lookup, state search, symptoms, diet, fitness, medical, behavior, weight, score
 */

const INDIAN_STATES = {
  'odisha': 'Odisha', 'odia': 'Odisha', 'orissa': 'Odisha',
  'tamil nadu': 'Tamil Nadu', 'tamilnadu': 'Tamil Nadu', 'south indian': 'Tamil Nadu',
  'telangana': 'Telangana', 'hyderabad': 'Telangana', 'hyderabadi': 'Telangana',
  'punjab': 'Punjab', 'punjabi': 'Punjab', 'north indian': 'Punjab',
  'maharashtra': 'Maharashtra', 'marathi': 'Maharashtra', 'mumbai': 'Maharashtra',
  'west bengal': 'West Bengal', 'bengali': 'West Bengal', 'kolkata': 'West Bengal',
  'karnataka': 'Karnataka', 'kannada': 'Karnataka',
  'kerala': 'Kerala', 'rajasthan': 'Rajasthan', 'rajasthani': 'Rajasthan',
  'gujarat': 'Gujarat', 'gujarati': 'Gujarat',
  'andhra': 'Andhra Pradesh', 'andhra pradesh': 'Andhra Pradesh',
  'bihar': 'Bihar', 'goa': 'Goa',
};

const INTENT_RULES = [
  {
    intent: 'symptom',
    persona: { name: 'Dr. Sharma', role: 'Wellness Advisor', emoji: '🤗', color: '#8b5cf6' },
    keywords: ['feeling', 'cold', 'fever', 'headache', 'tired', 'fatigue', 'nausea',
      'acidity', 'bloat', 'gas', 'constipation', 'diarrhea', 'cough', 'sore throat',
      'weak', 'dizzy', 'pain', 'cramp', 'inflammation', 'allergy', 'skin',
      'hair fall', 'not well', 'sick', 'unwell', 'vomit',
      'ठंड', 'बुखार', 'सिरदर्द', 'थकान', 'गैस', 'कब्ज', 'बालों का झड़ना',
      'दर्द', 'उल्टी', 'तबीयत'],
  },
  {
    intent: 'diet',
    persona: { name: 'Priya Patel', role: 'Clinical Dietician', emoji: '🥗', color: '#10b981' },
    keywords: ['food', 'eat', 'meal', 'diet', 'calorie', 'kcal', 'protein', 'carb', 'fat',
      'breakfast', 'lunch', 'dinner', 'snack', 'khana', 'भोजन', 'खाना', 'plan',
      'nutrition', 'macro', 'fiber', 'vitamin', 'mineral', 'dal', 'roti', 'rice',
      'paneer', 'idli', 'dosa', 'biryani', 'samosa', 'analyze', 'प्रोटीन', 'प्लान',
      'veg', 'nonveg', 'egg', 'chicken', 'fish', 'sabzi', 'fruit'],
  },
  {
    intent: 'fitness',
    persona: { name: 'Coach Arjun', role: 'Fitness Nutritionist', emoji: '💪', color: '#3b82f6' },
    keywords: ['workout', 'exercise', 'gym', 'muscle', 'bulk', 'cut', 'strength',
      'yoga', 'cardio', 'running', 'walk', 'pushup', 'squat', 'plank', 'stretch',
      'bodyweight', 'home workout', 'कसरत', 'व्यायाम', 'fitness', 'body',
      'abs', 'chest', 'arms', 'legs', 'back', 'core', 'weight training'],
  },
  {
    intent: 'medical',
    persona: { name: 'Dr. Sharma', role: 'Endocrinologist', emoji: '🩺', color: '#8b5cf6' },
    keywords: ['diabetes', 'sugar', 'blood', 'bp', 'pressure', 'cholesterol', 'thyroid',
      'pcos', 'pcod', 'kidney', 'liver', 'heart', 'शुगर', 'डायबिटीज', 'medicine',
      'doctor', 'hba1c', 'insulin', 'glucose', 'glycemic', 'gi', 'uric acid',
      'anemia', 'vitamin d', 'b12', 'iron', 'hemoglobin', 'disease', 'condition'],
  },
  {
    intent: 'behavior',
    persona: { name: 'Coach Meera', role: 'Behavioral Coach', emoji: '🧠', color: '#f59e0b' },
    keywords: ['motivation', 'habit', 'consistency', 'skip', 'lazy', 'bored',
      'stress', 'sleep', 'insomnia', 'mood', 'craving', 'binge', 'emotional',
      'procrastinate', 'routine', 'discipline', 'mindset', 'focus', 'energy',
      'neend', 'आलस', 'तनाव'],
  },
  {
    intent: 'weight',
    persona: { name: 'Priya Patel', role: 'Weight Management Expert', emoji: '⚖️', color: '#10b981' },
    keywords: ['weight', 'fat loss', 'lose weight', 'slim', 'thin', 'reduce',
      'वजन', 'मोटा', 'पतला', 'belly', 'tummy', 'obesity', 'overweight',
      'bmi', 'deficit', 'tdee', 'bmr'],
  },
  {
    intent: 'score',
    persona: { name: 'Bharat Health AI', role: 'Health Scoring Engine', emoji: '📊', color: '#14b8a6' },
    keywords: ['score', 'report', 'health score', 'rating', 'how am i', 'progress',
      'track', 'analyze me', 'assessment', 'review'],
  },
];

/**
 * Detect if user is asking about a specific Indian state's food.
 */
export function detectState(text) {
  const lower = text.toLowerCase();
  for (const [alias, state] of Object.entries(INDIAN_STATES)) {
    if (lower.includes(alias)) return state;
  }
  return null;
}

/**
 * Full intent classification with state/food awareness.
 */
export function classifyIntent(text) {
  const lower = text.toLowerCase();

  // 0. Check for multi-food calculation
  if (lower.includes('calculate') || lower.includes('macros') || lower.includes('total')) {
    const matches = lower.match(/\d+\s+[a-z]+/g);
    if (matches && matches.length > 1) {
      return {
        intent: 'multi_food_calc',
        persona: { name: 'Priya Patel', role: 'Clinical Dietician', emoji: '🧮', color: '#10b981' },
        confidence: 0.9,
      };
    }
  }

  // 1. Check for state food search
  const state = detectState(text);
  if (state && /food|dish|cuisine|eat|खाना|what|show|list|famous/.test(lower)) {
    return {
      intent: 'state_food',
      persona: { name: 'Priya Patel', role: 'Regional Food Expert', emoji: '🗺️', color: '#10b981' },
      confidence: 0.9,
      state,
    };
  }

  // 2. Keyword-based scoring
  let bestMatch = null;
  let bestScore = 0;

  for (const rule of INTENT_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = rule;
    }
  }

  if (!bestMatch || bestScore === 0) {
    // 3. Check if bare state name
    if (state) {
      return {
        intent: 'state_food',
        persona: { name: 'Priya Patel', role: 'Regional Food Expert', emoji: '🗺️', color: '#10b981' },
        confidence: 0.7,
        state,
      };
    }

    return {
      intent: 'general',
      persona: { name: 'Bharat Health AI', role: 'Health Coach', emoji: '🌿', color: '#10b981' },
      confidence: 0,
    };
  }

  return {
    intent: bestMatch.intent,
    persona: bestMatch.persona,
    confidence: Math.min(1, bestScore / 3),
  };
}

/**
 * Decide response mode based on query analysis.
 */
export function decideMode(text, profile) {
  const lower = text.toLowerCase();

  if (!profile.goal || !profile.diet || !profile.weight) {
    return 'exploration';
  }

  if (lower.includes('plan') || lower.includes('schedule') || lower.includes('week') || lower.includes('प्लान')) {
    return 'planning';
  }

  if (lower.includes('crash diet') || lower.includes('no carb') || lower.includes('starvation') ||
      lower.includes('detox') || lower.includes('juice cleanse')) {
    return 'correction';
  }

  return 'guidance';
}
