const { getForecast } = require('./weatherService');

const OUTDOOR_KEYWORDS = [
  "trek", "hiking", "beach", "park", "garden", "outdoor", "zoo", "safari", 
  "hill", "lake", "waterfall", "viewpoint", "mountaineering", "climbing",
  "temple", "monument", "fort", "palace" // These are usually outdoor
];

async function generateAlerts(trip, itinerary) {
  console.log(`[AlertService] Generating alerts for destination: ${trip.destination}`);
  if (!trip.destination) return [];
  
  const alerts = [];
  const forecast = await getForecast(trip.destination);
  console.log(`[AlertService] Forecast retrieved:`, forecast.map(f => `${f.date}: ${f.main}`));
  
  // PRIORITIZE Trip.itinerary as it's what the Group Room uses primarily.
  // Fallback to standalone itinerary only if Trip.itinerary is empty.
  const days = (trip.itinerary && trip.itinerary.length > 0) 
    ? trip.itinerary 
    : (itinerary && itinerary.days ? itinerary.days : []);

  console.log(`[AlertService] Total days found in plan: ${days.length}`);
  
  if (days.length === 0) return [];

  days.forEach((day, index) => {
    let dayDateStr = day.date ? new Date(day.date).toISOString().split('T')[0] : null;
    
    // FALLBACK: If date is missing or very old (stale), calculate it from trip.startDate
    if (!dayDateStr || new Date(dayDateStr).getFullYear() < 2025) {
      if (trip.startDate) {
        const calcDate = new Date(trip.startDate);
        calcDate.setDate(calcDate.getDate() + index);
        dayDateStr = calcDate.toISOString().split('T')[0];
        console.log(`[AlertService] Day ${index + 1}: Using calculated fallback date ${dayDateStr}`);
      }
    }

    console.log(`[AlertService] Day ${index + 1} final check date: ${dayDateStr}`);
    if (!dayDateStr) return;

    const weather = forecast.find(f => f.date === dayDateStr);

    if (weather) {
      console.log(`[AlertService] Weather for ${dayDateStr}: ${weather.main}`);
      if (weather.main === 'Rain' || weather.main === 'Storm' || weather.main === 'Snow') {
        const events = day.events || day.activities || day.items || [];
        console.log(`[AlertService] Found ${events.length} events for this day.`);
        
        const outdoorEvents = events.filter(event => {
          const name = event.name || event.title || event.activity || "";
          const description = event.description || event.notes || "";
          const text = (name + " " + description).toLowerCase();
          const matches = OUTDOOR_KEYWORDS.some(kw => text.includes(kw));
          if (matches) console.log(`[AlertService] Outdoor activity matched: ${name}`);
          return matches;
        });

        if (outdoorEvents.length > 0) {
          const mainEvent = outdoorEvents[0];
          const affectedName = mainEvent.name || mainEvent.title || mainEvent.activity;
          
          alerts.push({
            id: `alert-${dayDateStr}`,
            type: 'weather_warning',
            severity: 'high',
            title: `Heads up! ${weather.main} predicted for ${new Date(day.date || trip.startDate).toLocaleDateString('en-IN', { weekday: 'long' })}`,
            message: `Your visit to ${affectedName} might be affected by rain.`,
            affectedDate: dayDateStr,
            affectedLocation: affectedName,
            dayIndex: index,
            activityId: mainEvent._id || mainEvent.id,
            suggestedAction: 'Switch to an indoor activity?',
            weather: weather
          });
        }
      }
    } else {
      console.log(`[AlertService] No weather data found for ${dayDateStr}`);
    }
  });

  console.log(`[AlertService] Returning ${alerts.length} alerts.`);
  return alerts;
}

module.exports = { generateAlerts };
