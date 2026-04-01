/**
 * Weather Utility for Bharat Health AI
 * Fetches real-time weather using wttr.in (No API key required)
 */

export async function getLocalWeather(location = 'India') {
  try {
    // We use wttr.in with JSON format
    const response = await fetch(`https://wttr.in/${encodeURIComponent(location)}?format=j1`);
    if (!response.ok) throw new Error('Weather fetch failed');
    
    const data = await response.json();
    const current = data.current_condition[0];
    
    return {
      temp: current.temp_C,
      condition: current.weatherDesc[0].value.toLowerCase(),
      humidity: current.humidity,
      precip: current.precipMM,
      isRainy: current.precipMM > 0 || current.weatherDesc[0].value.toLowerCase().includes('rain'),
      isHot: parseInt(current.temp_C) > 32,
      isCold: parseInt(current.temp_C) < 18,
      location: data.nearest_area[0].areaName[0].value
    };
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
  
  const { temp, isRainy, isHot, isCold, condition } = weather;
  
  if (isRainy) {
    return {
      text: `It's currently rainy in ${weather.location}. Perfect time for something warm!`,
      tags: ['Hot Tea', 'Soup', 'Pakora (Occasional)', 'Adrak Chai'],
      type: 'comfort'
    };
  }
  
  if (isHot) {
    return {
      text: `It's quite hot (${temp}°C). Stay hydrated with cooling foods.`,
      tags: ['Coconut Water', 'Buttermilk', 'Watermelon', 'Curd Rice'],
      type: 'cooling'
    };
  }
  
  if (isCold) {
    return {
      text: `Chilly weather detected! Fuel up with warming, high-energy foods.`,
      tags: ['Gud (Jaggery)', 'Nuts', 'Warm Dal', 'Bajra Roti'],
      type: 'warming'
    };
  }
  
  return {
    text: `Pleasant weather in ${weather.location}. A balanced meal is best!`,
    tags: ['Fruit Bowl', 'Dal Chawal', 'Paneer Sabzi'],
    type: 'balanced'
  };
}
