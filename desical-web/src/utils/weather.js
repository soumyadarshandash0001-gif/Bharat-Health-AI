/**
 * Bharat Health AI — High-Precision Weather Service v3
 * Uses: Browser Geolocation (Precision) -> ipapi.co (Fallback) + Open-Meteo
 * Features: Solves ISP misidentification (e.g., Bandoli vs Odisha).
 */

export async function getLocalWeather(manualLocation = '') {
  try {
    let lat, lon, city;

    // Phase 1: High-Precision Coordinate Detection
    if (manualLocation && manualLocation !== 'India') {
      // User-provided location (e.g., from Profile/Onboarding)
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation + ', India')}`);
      const geoData = await geoRes.json();
      if (geoData.length > 0) {
        lat = geoData[0].lat;
        lon = geoData[0].lon;
        city = manualLocation;
      }
    } 
    
    if (!lat || !lon) {
      // Try Browser Geolocation (Permission-based, high accuracy)
      try {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        lat = pos.coords.latitude;
        lon = pos.coords.longitude;
        city = 'Your Current Area'; // We'll get city from reverse geo below
      } catch (e) {
        // Fallback to IP-only if browser geo fails or denied
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        lat = ipData.latitude;
        lon = ipData.longitude;
        city = ipData.city || ipData.region || 'Odisha';
      }
    }

    if (!lat || !lon) throw new Error('Location detection failed');

    // Phase 2: Reverse Geocode (Get actual city from Coords)
    const revGeoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
    const revGeoData = await revGeoRes.json();
    if (revGeoData.address) {
      city = revGeoData.address.city || revGeoData.address.town || revGeoData.address.village || revGeoData.address.state || city;
    }

    // Phase 3: Fetch Live Weather
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
      isRainy: current.weathercode >= 51 && current.weathercode <= 67,
      location: city,
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

export function getWeatherAdvice(weather) {
  if (!weather) return null;
  const { temp, isRainy, isHot, isCold, condition, location } = weather;
  if (isRainy) {
    return {
      text: `It's rain-time in ${location}! ☔ Perfect for warming energy.`,
      tags: ['Ginger Tea', 'Hot Soup', 'Lentil Stew', 'Steamed Corn'],
      type: 'comfort', city: location, temp: temp, condition: condition
    };
  }
  if (isHot) {
    return {
      text: `${location} is hot (${temp}°C) ☀️! Hydrate now!`,
      tags: ['Coconut Water', 'Chaas', 'Watermelon', 'Cucumber Salad'],
      type: 'cooling', city: location, temp: temp, condition: condition
    };
  }
  if (isCold) {
    return {
      text: `Chilly vibes in ${location} (${temp}°C) ❄️. Boost up!`,
      tags: ['Jaggery & Nuts', 'Boiled Eggs', 'Hot Nut Milk', 'Warm Bajra'],
      type: 'warming', city: location, temp: temp, condition: condition
    };
  }
  return {
    text: `Pleasant day in ${location} (${temp}°C) 🌤️. Stay balanced!`,
    tags: ['Mixed Fruit', 'Dal & Roti', 'Paneer Platter'],
    type: 'balanced', city: location, temp: temp, condition: condition
  };
}
