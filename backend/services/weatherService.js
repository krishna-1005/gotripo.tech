const axios = require('axios');

/**
 * Fetches a 5-day weather forecast for a given city.
 * Falls back to a realistic mock if API key is missing.
 */
async function getForecast(city) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    console.warn("⚠️ OPENWEATHER_API_KEY missing. Using mock weather data.");
    return generateMockForecast();
  }

  try {
    const res = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
    
    // Group by date
    const forecast = [];
    const seenDates = new Set();
    
    res.data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!seenDates.has(date)) {
        seenDates.add(date);
        forecast.push({
          date,
          temp: item.main.temp,
          main: item.weather[0].main, // Rain, Clear, Clouds, etc.
          description: item.weather[0].description
        });
      }
    });

    return forecast.slice(0, 5);
  } catch (error) {
    console.error("Weather API Error:", error.message);
    return generateMockForecast();
  }
}

function generateMockForecast() {
  const forecast = [];
  const now = new Date();
  
  const conditions = ["Clear", "Clouds", "Rain", "Rain", "Clouds"]; // Injected rain for testing
  
  for (let i = 0; i < 5; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    forecast.push({
      date: d.toISOString().split('T')[0],
      temp: 20 + Math.floor(Math.random() * 10),
      main: conditions[i],
      description: conditions[i].toLowerCase() + "y sky"
    });
  }
  return forecast;
}

module.exports = { getForecast };
