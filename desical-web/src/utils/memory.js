/**
 * 3-LAYER MEMORY SYSTEM
 * Layer A: Short-term (session messages, last 10)
 * Layer B: Long-term (user profile, persistent in localStorage)
 * Layer C: Vector-like semantic memory (keyword index for past issues)
 */

const STORAGE_KEYS = {
  PROFILE: 'bharat_health_profile',
  HISTORY: 'bharat_health_history',
  BEHAVIOR: 'bharat_health_behavior',
  SEMANTIC: 'bharat_health_semantic',
};

// ════════════════════════════════════════════
// LAYER A: SHORT-TERM MEMORY (Session)
// ════════════════════════════════════════════
let sessionMessages = [];
let lastResponses = [];

export function addSessionMessage(role, content) {
  sessionMessages.push({ role, content, ts: Date.now() });
  if (sessionMessages.length > 10) sessionMessages.shift();

  if (role === 'ai') {
    lastResponses.push(content.slice(0, 120));
    if (lastResponses.length > 3) lastResponses.shift();
  }
}

export function getSessionMessages() {
  return sessionMessages;
}

export function getLastResponses() {
  return lastResponses;
}

export function clearSession() {
  sessionMessages = [];
  lastResponses = [];
}

// ════════════════════════════════════════════
// LAYER B: LONG-TERM MEMORY (User Profile)
// ════════════════════════════════════════════
const DEFAULT_PROFILE = {
  name: '',
  age: '',
  gender: '',
  weight: '',
  height: '',
  goal: '',           // fat_loss | muscle_gain | maintain | diabetes_control
  diet: '',           // veg | nonveg | egg
  location: '',       // state
  budget: '',         // low | medium | high
  lifestyle: '',      // student | working | homemaker | retired
  health_conditions: [],
  allergies: [],
  onboarded: false,
  created_at: null,
  // Tracked patterns
  history: {
    protein_issue: false,
    consistency: 'unknown',    // low | medium | high
    sugar_concern: false,
    late_eating: false,
    skips_breakfast: false,
  }
};

export function getProfile() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (stored) return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
  } catch (e) {}
  return { ...DEFAULT_PROFILE };
}

export function saveProfile(updates) {
  const current = getProfile();
  const merged = { ...current, ...updates };
  if (!merged.created_at) merged.created_at = Date.now();
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(merged));
  return merged;
}

export function isOnboarded() {
  return getProfile().onboarded;
}

export function resetProfile() {
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
}

/**
 * FULL RESET — Wipe ALL data from RAM + localStorage
 * Call this when switching users or clearing everything
 */
export function fullReset() {
  // Clear ALL localStorage keys
  localStorage.removeItem(STORAGE_KEYS.PROFILE);
  localStorage.removeItem(STORAGE_KEYS.HISTORY);
  localStorage.removeItem(STORAGE_KEYS.BEHAVIOR);
  localStorage.removeItem(STORAGE_KEYS.SEMANTIC);

  // Clear RAM (session memory)
  sessionMessages = [];
  lastResponses = [];
}

// ════════════════════════════════════════════
// LAYER C: SEMANTIC MEMORY (Keyword Index)
// ════════════════════════════════════════════
// Lightweight vector-like system using keyword extraction

const ISSUE_KEYWORDS = {
  protein: ['protein', 'प्रोटीन', 'muscle', 'weak', 'kamzor'],
  sugar: ['sugar', 'diabetes', 'शुगर', 'glucose', 'sweet'],
  weight: ['weight', 'fat', 'वजन', 'slim', 'mota', 'patla'],
  consistency: ['skip', 'irregular', 'miss', 'bhool', 'lazy'],
  sleep: ['sleep', 'insomnia', 'neend', 'late night'],
  digestion: ['digestion', 'bloat', 'gas', 'pet', 'acidity'],
  stress: ['stress', 'tension', 'anxiety', 'worry'],
};

export function extractIssues(text) {
  const lower = text.toLowerCase();
  const issues = [];
  for (const [issue, keywords] of Object.entries(ISSUE_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) {
      issues.push(issue);
    }
  }
  return issues;
}

export function trackIssues(text) {
  const issues = extractIssues(text);
  if (issues.length === 0) return;

  const semantic = getSemanticMemory();
  issues.forEach(issue => {
    if (!semantic[issue]) semantic[issue] = { count: 0, first: Date.now(), last: Date.now() };
    semantic[issue].count++;
    semantic[issue].last = Date.now();
  });
  localStorage.setItem(STORAGE_KEYS.SEMANTIC, JSON.stringify(semantic));

  // Also update profile history
  const profile = getProfile();
  if (issues.includes('protein')) profile.history.protein_issue = true;
  if (issues.includes('sugar')) profile.history.sugar_concern = true;
  if (issues.includes('consistency')) profile.history.consistency = 'low';
  saveProfile(profile);
}

export function getSemanticMemory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SEMANTIC);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return {};
}

export function getRecurringIssues() {
  const semantic = getSemanticMemory();
  return Object.entries(semantic)
    .filter(([, data]) => data.count >= 2)
    .map(([issue, data]) => ({ issue, count: data.count }))
    .sort((a, b) => b.count - a.count);
}

// ════════════════════════════════════════════
// BEHAVIOR TRACKER
// ════════════════════════════════════════════
export function getBehavior() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BEHAVIOR);
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  return {
    sessions: 0,
    total_queries: 0,
    last_session: null,
    streak_days: 0,
    topics_asked: {},
    avg_queries_per_session: 0,
  };
}

export function trackBehavior(intent) {
  const b = getBehavior();
  const today = new Date().toDateString();

  if (b.last_session !== today) {
    b.sessions++;
    if (b.last_session === new Date(Date.now() - 86400000).toDateString()) {
      b.streak_days++;
    } else if (b.last_session !== today) {
      b.streak_days = 1;
    }
    b.last_session = today;
  }

  b.total_queries++;
  b.topics_asked[intent] = (b.topics_asked[intent] || 0) + 1;
  b.avg_queries_per_session = Math.round(b.total_queries / b.sessions);

  localStorage.setItem(STORAGE_KEYS.BEHAVIOR, JSON.stringify(b));
  return b;
}

// ════════════════════════════════════════════
// CONTEXT BUILDER (for prompt injection)
// ════════════════════════════════════════════
export function buildContext() {
  const profile = getProfile();
  const session = getSessionMessages();
  const lastResp = getLastResponses();
  const recurring = getRecurringIssues();
  const behavior = getBehavior();

  return {
    user_profile: profile,
    conversation_memory: session.map(m => `${m.role}: ${m.content}`).join('\n'),
    last_responses: lastResp,
    recurring_issues: recurring,
    behavior: behavior,
  };
}
