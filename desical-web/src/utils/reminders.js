/**
 * Reminder Logic for Bharat Health AI
 * Handles health-related reminders like water intake, meal timing, and medicine.
 */

export const INITIAL_REMINDERS = [
  { id: 1, text: "💧 Drink 2 glasses of water now", time: "Every 2 hrs", type: "water", active: true },
  { id: 2, text: "🥗 Breakfast Time (Fiber-rich!)", time: "8:30 AM", type: "meal", active: true },
  { id: 3, text: "🚶 10 min walk after Lunch", time: "2:00 PM", type: "activity", active: false },
  { id: 4, text: "🌙 Light Dinner before 8 PM", time: "8:00 PM", type: "meal", active: true },
];

export function getReminderSuggestions(user_profile) {
  const suggestions = [];
  
  if (user_profile.goal === 'Weight Loss') {
    suggestions.push({ id: 5, text: "🛑 No junk food today - Stay strong!", type: "behavior", active: true });
  }
  
  if (user_profile.diet === 'Non-Vegetarian') {
    suggestions.push({ id: 6, text: "🥚 High protein snack: 2 eggs", type: "protein", active: true });
  }

  return [...INITIAL_REMINDERS, ...suggestions];
}

export function formatReminderMessage(text) {
  return `⏰ Reminder: ${text}`;
}

/**
 * Handle notification logic (Web Push API / Simple Alerts)
 */
export function scheduleReminder(reminder, callback) {
  // Mock scheduler logic
  console.log(`Scheduling reminder: ${reminder.text} for ${reminder.time}`);
  // In a real app, use Service Workers or notification API
}
