function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getBestVisitTime(category, index) {
  const cat = (category || "").toLowerCase();
  
  // Rule-based logic with variations
  if (["nature", "park", "garden", "hill", "lake", "waterfall", "beach"].some(kw => cat.includes(kw))) {
    const isEven = index % 2 === 0;
    return {
      time: isEven ? "Morning" : "Evening",
      reason: isEven ? "Pleasant weather and soft sunlight for photos" : "Golden hour views and cool breeze"
    };
  }

  if (["temple", "church", "mosque", "spiritual", "monument", "museum", "history", "cultural"].some(kw => cat.includes(kw))) {
    const isEven = index % 2 === 0;
    return {
      time: "Morning",
      reason: isEven ? "Peaceful atmosphere and fewer crowds" : "Beat the midday heat and enjoy the tranquility"
    };
  }

  if (["cafe", "restaurant", "dining", "food", "bakery"].some(kw => cat.includes(kw))) {
    const isEven = index % 2 === 0;
    return {
      time: isEven ? "Afternoon" : "Evening",
      reason: isEven ? "Perfect time for a relaxed lunch break" : "Enjoy the vibrant dinner ambiance"
    };
  }

  if (["shopping", "market", "mall", "street"].some(kw => cat.includes(kw))) {
    return {
      time: "Evening",
      reason: "Most active hours with a lively local atmosphere"
    };
  }

  if (["nightlife", "pub", "bar", "club", "lounge"].some(kw => cat.includes(kw))) {
    return {
      time: "Night",
      reason: "Peak experience time with music and energy"
    };
  }

  // Default fallback
  const times = ["Morning", "Afternoon", "Evening"];
  const selectedTime = times[index % 3];
  const reasons = [
    "Ideal for exploring without the midday rush",
    "Great time to experience the local vibe",
    "Cooler temperatures and beautiful light"
  ];
  
  return {
    time: selectedTime,
    reason: reasons[index % 3]
  };
}

/* ── FALLBACK GENERATOR ── */
function generateFallbacks(city, count) {
  const templates = [
    { name: "Local Market", category: "Shopping", tags: ["local", "market"], avgTime: 120, estimatedCost: 200 },
    { name: "City Park", category: "Nature", tags: ["park", "relaxing"], avgTime: 90, estimatedCost: 0 },
    { name: "Food Street", category: "Food", tags: ["street food", "local"], avgTime: 60, estimatedCost: 300 },
    { name: "Central Mall", category: "Shopping", tags: ["mall", "modern"], avgTime: 180, estimatedCost: 500 },
    { name: "Ancient Temple", category: "Spiritual", tags: ["temple", "historic"], avgTime: 45, estimatedCost: 0 },
    { name: "Art Gallery", category: "Culture", tags: ["art", "museum"], avgTime: 120, estimatedCost: 200 }
  ];

  const results = [];
  for (let i = 0; i < count; i++) {
    const template = templates[i % templates.length];
    results.push({
      ...template,
      name: `${city} ${template.name}`,
      city: city,
      lat: 0, 
      lng: 0,
      rating: 4.2 + (i % 5) * 0.1,
      tag: "Popular Spot",
      isPersonalized: false,
      source: "fallback"
    });
  }
  return results;
}

function plannerEngine(places, { city, days, interests, budget, userPreferences = {} }) {
  // 1. Initial Filtering
  let candidates = places.filter(p => p.city && p.city.toLowerCase() === city.toLowerCase());

  const {
    interests: userInterests = [],
    avoidedCategories = [],
    categoryWeights = new Map(),
    travelStyleTags = []
  } = userPreferences;

  // 2. Personalized Scoring
  candidates = candidates.map(place => {
    let score = place.rating || 0;
    let isPersonalized = false;

    // Boost if in user's general interests
    if (userInterests.includes(place.category)) {
      score += 1.5;
      isPersonalized = true;
    }

    // NEW: Boost if in travel style tags from polls
    if (travelStyleTags.some(tag => tag.toLowerCase() === place.category.toLowerCase())) {
      score += 1.0;
      isPersonalized = true;
    }

    // Boost if in CURRENT trip interests
    if (interests.includes(place.category)) {
      score += 2.0;
    }

    // Apply learned weights
    const weight = categoryWeights instanceof Map 
      ? (categoryWeights.get(place.category) || 0)
      : (categoryWeights[place.category] || 0);
    
    if (weight !== 0) {
      score += weight;
      if (weight > 0) isPersonalized = true;
    }

    // Heavy penalty for avoided categories
    if (avoidedCategories.includes(place.category)) {
      score -= 5.0;
    }

    return { ...place, score, isPersonalized };
  });

  // 3. Filter by Budget & Minimum Score
  if (budget === "low") {
    candidates = candidates.filter(p => (p.cost || p.estimatedCost || 0) <= 500);
  } else if (budget === "medium") {
    candidates = candidates.filter(p => (p.cost || p.estimatedCost || 0) <= 1500);
  }

  // Remove heavily penalized places
  candidates = candidates.filter(p => p.score > 0);

  // 4. Sort by Score
  candidates.sort((a, b) => b.score - a.score);

  // 4.1 Ensure minimum places
  const minRequired = days * 3;
  if (candidates.length < minRequired) {
    const needed = minRequired - candidates.length;
    const fallbacks = generateFallbacks(city, needed);
    candidates = [...candidates, ...fallbacks];
  }

  // 5. Distribute across days
  const itinerary = {};
  const usedNames = new Set();

  for (let i = 0; i < days; i++) {
    const remainingDays = days - i;
    const remainingPool = candidates.filter(c => !usedNames.has(c.name));
    const targetCount = Math.max(3, Math.ceil(remainingPool.length / remainingDays));
    
    const dayPlaces = remainingPool.slice(0, targetCount);
    dayPlaces.forEach(p => usedNames.add(p.name));

    itinerary[`Day ${i + 1}`] = {
      places: dayPlaces.map((p, idx) => {
        const timing = getBestVisitTime(p.category, idx + i);
        const metadata = p.metadata || {};
        
        return {
          name: p.name,
          type: metadata.primaryCategory || p.category, // Map primaryCategory to 'type' for frontend
          category: p.category,
          estimatedCost: metadata.estimatedCost || p.cost || p.estimatedCost || 0,
          duration: metadata.avgDuration ? (metadata.avgDuration >= 60 ? `${Math.floor(metadata.avgDuration/60)} – ${Math.floor(metadata.avgDuration/60)+1} hrs` : `${metadata.avgDuration} mins`) : "1 – 2 hrs",
          description: metadata.description || "A wonderful place to explore and enjoy.",
          lat: p.lat,
          lng: p.lng,
          rating: p.rating,
          tag: p.tag || "Top Choice",
          isPersonalized: p.isPersonalized,
          bestTime: metadata.bestTimeOfDay ? (metadata.bestTimeOfDay.charAt(0).toUpperCase() + metadata.bestTimeOfDay.slice(1)) : timing.time,
          timeReason: timing.reason
        };
      })
    };
  }

  // 6. Total cost
  const totalCost = candidates
    .filter(p => usedNames.has(p.name))
    .reduce((sum, p) => sum + (p.cost || p.estimatedCost || 0), 0);

  return {
    itinerary,
    totalCost,
    isPersonalized: true
  };
}

module.exports = plannerEngine;