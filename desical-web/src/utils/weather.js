/**
 * Bharat Health AI — Professional Weather Service v2
 * Uses: ipapi.co (Location) + Open-Meteo (Weather)
 * Features: High reliability, NO API KEY required.
 */

export async function getLocalWeather(manualLocation = '') {
  try {
    let lat, lon, city;

    // Phase 1: Determine Coordinates
    if (manualLocation) {
      // If manual location, try geocoding via Open-Meteo (not direct, but we can approximate or use OSM)
      // For simplicity, we'll use a public geocoder.
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}`);
      const geoData = await geoRes.json();
      if (geoData.length > 0) {
        lat = geoData[0].lat;
        lon = geoData[0].lon;
        city = manualLocation;
      }
    } else {
      // Auto-detect by IP
      const ipRes = await fetch('https://ipapi.co/json/');
      const ipData = await ipRes.json();
      lat = ipData.latitude;
      lon = ipData.longitude;
      city = ipData.city;
    }

    if (!lat || !lon) throw new Error('Location detection failed');

    // Phase 2: Fetch Live Weather from Open-Meteo
    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m&daily=precipitation_sum&timezone=auto`);
    const weatherData = await weatherRes.json();
    const current = weatherData.current_weather;
    
    const weather = {
      temp: Math.round(current.temperature),
      conditionCode: current.weathercode,
      condition: getWeatherDescription(current.weathercode),
      windspeed: current.windspeed,
      isHot: current.temperature > 30,
      isCold: current.temperature < 20,
      isRainy: current.weathercode >= 51 && current.weathercode <= 67, // Drizzle, Rain, etc
      location: city || 'Your City',
      timestamp: new Date().toLocaleTimeString()
    };
    
    return weather;
  } catch (err) {
    console.error('Weather Service Error:', err);
    return null;
  }
}

function getWeatherDescription(code) {
  const codes = {
    0: 'Clear sky',
    1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Fog', 48: 'Depositing rime fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow fall', 73: 'Moderate snow fall', 75: 'Heavy snow fall',
    80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
  };
  return codes[code] || 'Cloudy';
}

/**
 * Get food recommendations based on weather
 */
export function getWeatherAdvice(weather) {
  if (!weather) return null;
  
  const { temp, isRainy, isHot, isCold, condition, location } = weather;
  
  if (isRainy) {
    return {
      text: `It's rain-time in ${location} (${condition})! ☔ Fuel up with warming, spicy energy.`,
      tags: ['Ginger Tea', 'Hot Rasam', 'Vegetable Soup', 'Warm Nuts'],
      type: 'comfort',
      city: location,
      temp: temp,
      condition: condition
    };
  }
  
  if (isHot) {
    return {
      text: `${location} is hot (${temp}°C) ☀️! Cooling hydration is mandatory.`,
      tags: ['Coconut Water', 'Lemonade', 'Chilled Curd', 'Cucumber'],
      type: 'cooling',
      city: location,
      temp: temp,
      condition: condition
    };
  }
  
  if (isCold) {
    return {
      text: `Chilly weather in ${location} (${temp}°C) ❄️. Boost your internal fire!`,
      tags: ['Masala Chai', 'Roasted Paneer', 'Warm Gud Chana', 'Soup'],
      type: 'warming',
      city: location,
      temp: temp,
      condition: condition
    };
  }
  
  return {
    text: `Perfect vibes in ${location} (${temp}°C) 🌤️. Enjoy a nutritious meal!`,
    tags: ['Mixed Fruit', 'Dal Chawal', 'Paneer Sabzi'],
    type: 'balanced',
    city: location,
    temp: temp,
    condition: condition
  };
}
