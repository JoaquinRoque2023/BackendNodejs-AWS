// lib/weather.js
export const getCurrentWeather = async (latitude, longitude) => {
  try {
    // Validar coordenadas
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      throw new Error("Invalid coordinates: latitude and longitude must be numbers");
    }
    
    if (latitude < -90 || latitude > 90) {
      throw new Error("Invalid latitude: must be between -90 and 90");
    }
    
    if (longitude < -180 || longitude > 180) {
      throw new Error("Invalid longitude: must be between -180 and 180");
    }
    
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto&forecast_days=1`;
    
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SWAPI-Weather-Fusion/1.0'
      },
      timeout: 10000 // 10 segundos timeout
    });
    
    if (!res.ok) {
      throw new Error(`Weather API error: ${res.status} - ${res.statusText}`);
    }
    
    const json = await res.json();
    const currentWeather = json.current_weather;
    
    if (!currentWeather) {
      return { 
        available: false,
        error: "No current weather data available",
        coordinates: { latitude, longitude }
      };
    }
    
    // Mapear códigos de clima a descripciones
    const weatherCodeMap = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail"
    };
    
    return {
      available: true,
      coordinates: {
        latitude: latitude,
        longitude: longitude
      },
      temperature: {
        celsius: currentWeather.temperature,
        fahrenheit: Math.round((currentWeather.temperature * 9/5) + 32)
      },
      wind: {
        speed_kmh: currentWeather.windspeed,
        speed_mph: Math.round(currentWeather.windspeed * 0.621371),
        direction_degrees: currentWeather.winddirection,
        direction_cardinal: getWindDirection(currentWeather.winddirection)
      },
      weather: {
        code: currentWeather.weathercode,
        description: weatherCodeMap[currentWeather.weathercode] || "Unknown"
      },
      timezone: json.timezone || "UTC",
      fetchedAt: new Date().toISOString(),
      source: "Open-Meteo API"
    };
    
  } catch (error) {
    console.error(`Error getting weather for coordinates ${latitude}, ${longitude}:`, error);
    return {
      available: false,
      error: error.message,
      coordinates: { latitude, longitude },
      fetchedAt: new Date().toISOString()
    };
  }
};


const getWindDirection = (degrees) => {
  if (degrees === null || degrees === undefined) return "Unknown";
  
  const directions = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE", 
    "S", "SSW", "SW", "WSW",
    "W", "WNW", "NW", "NNW"
  ];
  
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
};