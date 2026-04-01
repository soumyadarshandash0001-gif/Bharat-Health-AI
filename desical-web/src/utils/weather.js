/**
 * Weather Utility for Bharat Health AI
 * Fetches real-time weather using wttr.in (No API key required)
 */

export async function getLocalWeather(location = '') {
  try {
    const q = location || ''; 
    const response = await fetch(`https://wttr.in/${encodeURIComponent(q)}?format=j1`);
    if (!response.ok) throw new Error('Weather fetch failed');
    
    const data = await response.json();
    const current = data.current_condition[0];
    const area = data.nearest_area[0];
    
    const weather = {
      temp: current.temp_C,
      condition: current.weatherDesc[0].value,
      humidity: current.humidity,
      precip: parseFloat(current.precipMM),
      isRainy: parseFloat(current.precipMM) > 0 || current.weatherDesc[0].value.toLowerCase().includes('rain'),
      isHot: parseInt(current.temp_C) > 30,
      isCold: parseInt(current.temp_C) < 20,
      location: area.areaName[0].value,
      region: area.region[0].value,
      country: area.country[0].value
    };
    return weather;
  } catch (error) {
    console.error('Weather Utility Error:', error);
    return null;
  }
}

/**
 * Get food recommendations based on weather
 */
export function getWeatherAdvice(weather) {
  if (!weather) return null;
  
  const { temp, isRainy, isHot, isCold, condition, location } = weather;
  
  if (isRainy) {
    return {
      text: `It's rain-time in ${location}! ☔ Perfect for warming energy.`,
      tags: ['Ginger Tea', 'Hot Soup', 'Lentil Stew', 'Steamed Corn'],
      type: 'comfort',
      city: location,
      temp: temp,
      condition: condition
    };
  }
  
  if (isHot) {
    return {
      text: `${location} is hot (${temp}°C) ☀️! Stay hydrated!`,
      tags: ['Coconut Water', 'Chaas', 'Watermelon', 'Cucumber Salad'],
      type: 'cooling',
      city: location,
      temp: temp,
      condition: condition
    };
  }
  
  if (isCold) {
    return {
      text: `Chilly vibes in ${location} (${temp}°C) ❄️. Boost your energy!`,
      tags: ['Jaggery & Nuts', 'Boiled Eggs', 'Hot Nut Milk', 'Warm Bajra'],
      type: 'warming',
      city: location,
      temp: temp,
      condition: condition
    };
  }
  
  return {
    text: `Pleasant day in ${location} (${temp}°C) 🌤️. Enjoy a balanced meal!`,
    tags: ['Mixed Fruit', 'Dal & Roti', 'Paneer Platter'],
    type: 'balanced',
    city: location,
    temp: temp,
    condition: condition
  };
}
