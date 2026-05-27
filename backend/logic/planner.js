const path = require("path");
const fetchOSMPlaces = require("../services/osmPlaces");
const { generateReviews: fetchUserReviews } = require("../services/reviewService");
const { analyzeAndRefinePlan } = require("../services/aiPlanner");
const classifyPlace = require("./metadataClassifier");

/* ── CONFIG ── */
const MAX_HOURS_PER_DAY = 8;
const MEAL_COST = { low: 200, medium: 500, high: 1500 };

/* ── TRUST HELPERS ── */
function generateRating(index) {
  // Range: 4.0 to 4.6 (believable)
  const base = 4.0;
  const variation = (index * 731) % 7; // pseudo-random variation
  return parseFloat((base + variation * 0.1).toFixed(1));
}

function generateReviews(index) {
  // Range: 100 to 5000 (realistic)
  return 100 + (index * 917) % 4901;
}

function generateTag(place, index) {
  const tags = ["Top Attraction", "Popular Spot", "Hidden Gem"];
  return tags[index % tags.length];
}

/* ── DISTANCE FUNCTION ── */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── SCORING ENGINE ── */
function calculateScore(place, interests, coords, budgetTier, userPreferences = {}, perDayBudget = 2000) {
  let score = 0;
  const interestSet = new Set(interests.map(i => i.toLowerCase()));
  
  const {
    interests: userInterests = [],
    avoidedCategories = [],
    categoryWeights = {}
  } = userPreferences;

  const category = (place.category || "").toLowerCase();

  // HEAVY Boost for CURRENT trip interests
  if (interestSet.has(category)) score += 25; 
  if ((place.tags || []).some(tag => interestSet.has(tag.toLowerCase()))) score += 15;

  // Boost for USER general interests (Personalization)
  if (userInterests.some(i => i.toLowerCase() === category)) score += 5;

  // Learned weights
  const weight = categoryWeights instanceof Map ? (categoryWeights.get(place.category) || 0) : (categoryWeights[place.category] || 0);
  score += weight;

  // Penalty for avoided categories
  if (avoidedCategories.some(i => i.toLowerCase() === category)) score -= 10;

  const cost = place.avgCost || 200;
  
  // Budget alignment (Aggressive penalties for over-budget places)
  if (cost > perDayBudget * 0.6) score -= 25; 
  else if (cost > perDayBudget * 0.4) score -= 10;
  else if (cost < perDayBudget * 0.1) score += 8; 
  
  if (budgetTier === "low" && cost < 200) score += 5;
  if (budgetTier === "medium" && cost < 500) score += 3;

  const dist = getDistance(coords.lat, coords.lng, place.lat, place.lng);
  if (dist < 5) score += 3;
  else if (dist < 15) score += 2;

  return score;
}

/* ── PRICE ── */
function calculateDynamicPrice(place, budgetTier) {
  let base = place.avgCost;

  if (base == null || base === 0) {
    base = 200; // fallback realistic price
  }

  const mult = {
    low: 0.7,
    medium: 1,
    high: 2
  }[budgetTier] || 1;

  return Math.round(base * mult);
}

/* ── LOAD DATA ── */
let allPlacesPool = [];
let accommodationPool = [];

function loadData() {
  try {
    const curated = require(path.join(__dirname, "../data/bengaluruPlaces.json"));
    const bulk = require(path.join(__dirname, "../data/bangalorePlaces.json"));
    const indiaPlaces = require(path.join(__dirname, "../data/indiaPlaces.json"));
    
    try {
      accommodationPool = require(path.join(__dirname, "../data/accommodations.json"));
    } catch (e) {
      console.warn("Accommodations data not found, using fallbacks.");
      accommodationPool = [];
    }

    const flatIndia = indiaPlaces.flatMap(cityData => 
      cityData.places.map(p => ({ ...p, area: cityData.city }))
    );

    allPlacesPool = [...curated.flat(), ...bulk, ...flatIndia].map(p => {
      const enriched = {
        name: p.name,
        lat: Number(p.lat),
        lng: Number(p.lng),
        category: p.category || "Other",
        tags: (p.tags || []).map(t => t.toLowerCase()),
        timeHours: p.timeHours || 2,
        avgCost: p.avgCost ?? null,
        source: "dataset",
        area: p.area
      };
      // Pre-calculate metadata
      enriched.metadata = classifyPlace(enriched, "medium");
      return enriched;
    });
  } catch (err) {
    console.error("Error loading data:", err);
    allPlacesPool = [];
  }
}

loadData();

/* ── SUMMARY GENERATOR ── */
function generatePlanSummary({ city, days, totalBudget, totalTripCost, interests }) {
  const interestList = interests.length > 0 ? interests.join(", ").toLowerCase() : "general exploration";
  const budgetStatus = totalTripCost <= totalBudget ? "comfortably within" : "optimized for";
  const efficiencyNote = "Locations are grouped by proximity to minimize transit time, ensuring a balanced pace each day.";

  const templates = [
    `This ${days}-day odyssey in ${city} is curated to blend ${interestList} experiences, staying ${budgetStatus} your budget. ${efficiencyNote}`,
    `Your ${days}-day ${city} escape is perfectly paced for ${interestList}. We've grouped nearby spots to maximize your time while staying ${budgetStatus} your financial plan.`,
    `Designed for ${interestList}, this ${days}-day ${city} itinerary ensures a seamless flow. It stays ${budgetStatus} your budget goal with a focus on travel efficiency.`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

/* ── OSM CACHE ── */
const osmCache = new Map();

/* ── DE-DUPLICATION UTILITY ── */
function mergePools(curated, dynamic, budgetTier = "medium") {
  const merged = [];
  const seenNames = new Set();

  const combined = [...curated, ...dynamic];

  for (const p of combined) {
    const cleanName = p.name.toLowerCase().trim();
    if (!seenNames.has(cleanName)) {
      if (!p.metadata) {
        p.metadata = classifyPlace(p, budgetTier);
      }
      merged.push(p);
      seenNames.add(cleanName);
    }
  }
  return merged;
}

/* ── DATA ENRICHMENT ── */
function enrichPlace(p, index) {
  return {
    ...p,
    rating: p.rating || generateRating(index),
    reviews: p.reviews || generateReviews(index),
    tag: p.tag || generateTag(p, index),
    avgCost: p.avgCost || 200,
    timeHours: p.timeHours || 2
  };
}

/* ── FALLBACK GENERATOR ── */
function generateFallbacks(city, coords, count, budgetTier = "medium") {
  const fallbacks = [
    { name: "Local Market", category: "Shopping", tags: ["local", "market", "authentic"], timeHours: 2, avgCost: 100 },
    { name: "City Park", category: "Nature", tags: ["park", "relaxing", "greenery"], timeHours: 1.5, avgCost: 0 },
    { name: "Food Street", category: "Food", tags: ["street food", "local flavors", "evening"], timeHours: 2, avgCost: 300 },
    { name: "Central Mall", category: "Shopping", tags: ["mall", "modern", "branded"], timeHours: 3, avgCost: 500 },
    { name: "Ancient Temple", category: "Culture", tags: ["temple", "historic", "spiritual"], timeHours: 1, avgCost: 0 },
    { name: "Art Gallery", category: "Culture", tags: ["art", "museum", "creativity"], timeHours: 2, avgCost: 200 },
    { name: "Riverside Walk", category: "Nature", tags: ["river", "scenic", "peaceful"], timeHours: 1, avgCost: 0 },
    { name: "Heritage Walk", category: "Culture", tags: ["history", "walking tour", "architecture"], timeHours: 2.5, avgCost: 0 }
  ];

  const results = [];
  for (let i = 0; i < count; i++) {
    const template = fallbacks[i % fallbacks.length];
    const p = {
      ...template,
      name: `${city} ${template.name}`,
      lat: coords.lat + (Math.random() - 0.5) * 0.05,
      lng: coords.lng + (Math.random() - 0.5) * 0.05,
      source: "fallback",
      area: city
    };
    p.metadata = classifyPlace(p, budgetTier);
    results.push(p);
  }
  return results;
}

/* ── STAY RECOMMENDATION ── */
function getRecommendedStay(city, travelerType, budgetTier) {
  const cleanCity = city.trim().toLowerCase();
  const cityData = accommodationPool.find(c => c.city.toLowerCase() === cleanCity);
  
  if (!cityData) return null;

  let selection = [];
  let stayType = "Hotel";

  if (travelerType === "solo" || travelerType === "backpacking") {
    selection = cityData.hostels || [];
    stayType = "Hostel";
  } else if (travelerType === "family") {
    selection = cityData.airbnbs || [];
    stayType = "Airbnb (with Kitchen)";
  } else {
    // Default to a mix or high-rated hostels/airbnbs as "Boutique stays" if no hotels in pool
    selection = [...(cityData.hostels || []), ...(cityData.airbnbs || [])];
  }

  if (selection.length === 0) return null;

  // Filter by budget if possible
  let filtered = selection;
  if (budgetTier === "low") {
    filtered = selection.filter(s => s.avgCost < 1000);
  } else if (budgetTier === "medium") {
    filtered = selection.filter(s => s.avgCost < 3000);
  }
  
  const finalSelection = filtered.length > 0 ? filtered : selection;
  const picked = finalSelection[Math.floor(Math.random() * finalSelection.length)];

  return {
    ...picked,
    stayType,
    category: "Stay"
  };
}

/* ── TRANSPORTATION RECOMMENDATION ── */
function getRecommendedTransport(dist) {
  if (dist < 400) {
    return {
      mode: "Bus / Car",
      reason: "Short distance, most convenient and cost-effective for road travel.",
      icon: "car"
    };
  } else if (dist < 800) {
    return {
      mode: "Train",
      reason: "Comfortable mid-range journey with scenic views and better connectivity.",
      icon: "train"
    };
  } else {
    return {
      mode: "Flight",
      reason: "Long distance, saves significant time for a faster arrival.",
      icon: "plane"
    };
  }
}

const CITY_COST_MULTIPLIERS = {
  "mumbai": 1.4,
  "delhi": 1.2,
  "new delhi": 1.2,
  "bengaluru": 1.3,
  "bangalore": 1.3,
  "chennai": 1.1,
  "hyderabad": 1.1,
  "goa": 1.5,
  "agra": 1.1,
  "jaipur": 1.0,
  "varanasi": 0.8,
  "patna": 0.7,
  "rishikesh": 0.9,
  "amritsar": 0.8,
  "kerala": 1.1
};

/* ── DETERMINISTIC PRICING RULES ── */
const COST_RULES = {
  foodPerDay: {
    low: 400,
    medium: 1000,
    high: 2500
  },
  hotelPerNight: {
    low: 800,
    medium: 1500,
    high: 4000
  },
  transportPerKm: 8,
  activityBase: 50
};

/**
 * Deterministically calculates the total trip cost.
 */
function calculateDeterministicTripCost(itinerary, days, budgetTier, travelerType, targetTotalBudget = Infinity, recommendedStay = null, dietary = "any", city = "") {
  const tMult = { solo: 1, couple: 2, family: 3, friends: 4, backpacking: 1 }[travelerType] || 1;
  const nights = Math.max(1, days - 1); 
  
  const cityKey = city.trim().toLowerCase();
  const cityMultiplier = CITY_COST_MULTIPLIERS[cityKey] || 1.0;

  const calculateWithTier = (tier) => {
    // 1. Hotel Cost
    let hotelRate = (COST_RULES.hotelPerNight[tier] || COST_RULES.hotelPerNight.medium) * cityMultiplier;
    
    // If we have a recommended stay, use its cost
    if (recommendedStay && recommendedStay.avgCost) {
      hotelRate = recommendedStay.avgCost;
    }

    const roomsNeeded = travelerType === "solo" || travelerType === "backpacking" ? 1 : Math.ceil(tMult / 2);
    const totalHotel = hotelRate * nights * roomsNeeded;

    // 2. Food Cost
    let foodRate = (COST_RULES.foodPerDay[tier] || COST_RULES.foodPerDay.medium) * cityMultiplier;
    
    // Veg preference is usually ~20% cheaper in India
    if (dietary === "veg") {
      foodRate = foodRate * 0.8;
    }

    // Spiritual places check for Prasadam recommendation
    let spiritualBonus = 0;
    const hasSpiritualStops = itinerary.some(d => 
      (d.places || []).some(p => (p.category || "").toLowerCase() === "spiritual" || (p.tags || []).some(t => t.toLowerCase() === "temple"))
    );

    if (hasSpiritualStops) {
      // Suggesting Prasadam can save around 15% of food cost if user chooses it
      spiritualBonus = 0.15;
    }

    const totalFood = foodRate * days * tMult * (1 - spiritualBonus);

    // 3. Transport & Activities
    let totalTransport = 0;
    let totalActivities = 0;

    itinerary.forEach((dayData) => {
      const places = dayData.places || [];
      
      places.forEach((place) => {
        const cat = (place.category || "").toLowerCase();
        if (cat === "stay" || cat === "nature" || cat === "religious" || cat === "spiritual") {
          totalActivities += 0;
        } else {
          const baseActivity = place.avgCost || COST_RULES.activityBase;
          totalActivities += baseActivity * tMult;
        }
      });

      for (let i = 0; i < places.length - 1; i++) {
        const dist = getDistance(places[i].lat, places[i].lng, places[i+1].lat, places[i+1].lng) || 3;
        totalTransport += dist * COST_RULES.transportPerKm;
      }
      totalTransport += 10 * COST_RULES.transportPerKm; // Daily base commute
    });

    return {
      total: Math.round(totalHotel + totalFood + totalTransport + totalActivities),
      breakdown: {
        hotel: Math.round(totalHotel),
        food: Math.round(totalFood),
        transport: Math.round(totalTransport),
        activities: Math.round(totalActivities),
        hasSpiritualSavings: spiritualBonus > 0
      }
    };
  };

  let currentPricing = calculateWithTier(budgetTier);

  // Safeguard: If over budget, try downgrading hotel tier
  if (currentPricing.total > targetTotalBudget * 1.05) { 
    if (budgetTier === "high") {
      const mediumPricing = calculateWithTier("medium");
      if (mediumPricing.total <= targetTotalBudget * 1.1 || mediumPricing.total < currentPricing.total) {
        currentPricing = mediumPricing;
        budgetTier = "medium";
      }
    }
    if (currentPricing.total > targetTotalBudget * 1.05 && budgetTier === "medium") {
      const lowPricing = calculateWithTier("low");
      if (lowPricing.total <= targetTotalBudget * 1.1 || lowPricing.total < currentPricing.total) {
        currentPricing = lowPricing;
        budgetTier = "low";
      }
    }
  }

  return currentPricing;
}

/* ── MAIN FUNCTION ── */
async function generatePlan({
  city,
  days,
  budget,
  interests,
  travelerType,
  pace,
  planningStyle = "balanced", // Final Change 4
  userPreferences = {},
  language = "English",
  sourceCity = null,
  mood = "local culture"
}) {
  const coords = await getCityCoords(city);
  if (!coords) {
    throw new Error(`Location not found: ${city}. Please check the spelling or try a different destination.`);
  }

  const cleanCity = city.trim().toLowerCase();
  
  // Calculate transport recommendation if sourceCity provided
  let recommendedTransport = null;
  if (sourceCity) {
    try {
      const sourceCoords = await getCityCoords(sourceCity);
      if (sourceCoords) {
        const distanceToDest = getDistance(sourceCoords.lat, sourceCoords.lng, coords.lat, coords.lng);
        recommendedTransport = getRecommendedTransport(distanceToDest);
        recommendedTransport.distance = Math.round(distanceToDest);
        recommendedTransport.from = sourceCity;
        recommendedTransport.to = city;
        
        if (recommendedTransport.distance < 1) {
          recommendedTransport.distance = 0;
          recommendedTransport.mode = "Local Commute";
          recommendedTransport.reason = "You are already in or very near the destination.";
        }
      }
    } catch (err) {
      console.warn("Transport recommendation failed:", err.message);
    }
  }
  
  // Normalize budget: can be a number (total) or a tier string
  let totalBudget = 5000;
  let budgetTier = "medium";
  const tMult = { solo: 1, couple: 2, family: 3, friends: 4, backpacking: 1 }[travelerType] || 1;

  if (typeof budget === 'number' || !isNaN(Number(budget))) {
    totalBudget = Number(budget);
    const perPersonPerDay = totalBudget / (days * tMult);
    
    if (perPersonPerDay <= 1500) {
      budgetTier = "low";
    } else if (perPersonPerDay <= 4000) {
      budgetTier = "medium";
    } else {
      budgetTier = "high";
    }
  } else if (typeof budget === 'string') {
    budgetTier = budget.toLowerCase();
    const dailyBase = { low: 1500, medium: 3500, high: 8000 }[budgetTier] || 2500;
    totalBudget = dailyBase * days * tMult;
  }

  /* STEP 1: CURATED POOL & DYNAMIC OSM POOL */
  let curatedPool = allPlacesPool.filter(p => {
    if (p.area && p.area.toLowerCase() === cleanCity) return true;
    const dist = getDistance(coords.lat, coords.lng, p.lat, p.lng);
    return dist <= 40; 
  });

  let osmPool = [];
  const cacheKey = `${coords.lat.toFixed(3)},${coords.lng.toFixed(3)}`;
  
  if (osmCache.has(cacheKey)) {
    osmPool = osmCache.get(cacheKey);
  } else {
    const radius = curatedPool.length < 10 ? 15 : 10;
    osmPool = await fetchOSMPlaces(coords.lat, coords.lng, radius);
    osmCache.set(cacheKey, osmPool);
  }

  let cityPool = mergePools(curatedPool, osmPool, budgetTier);

  /* STEP 2 & 3: METADATA CLASSIFICATION & WEIGHTED SCORING */
  // Define helper scoring function inside generatePlan
  const scoreCandidate = (p) => {
    const metadata = p.metadata || classifyPlace(p, budgetTier);
    let score = p.rating ? p.rating * 3 : 12; // base score from rating
    const whyRecommended = [];

    const interestSet = new Set(interests.map(i => i.toLowerCase().trim()));
    const category = (p.category || "").toLowerCase();
    const nameLower = (p.name || "").toLowerCase();
    const tags = (p.tags || []).map(t => String(t).toLowerCase());

    // HARD RELEVANCE FILTERS (Final Change 3)
    const dietary = (userPreferences.dietary || "").toLowerCase();
    if (dietary === "veg" || interests.includes("Veg Only")) {
      if (metadata.food && !metadata.veg) return { score: -1000, whyRecommended: [] };
    }

    const style = (travelerType || "").toLowerCase();
    if (style === "family" || interests.includes("Family")) {
      if (metadata.nightlife) return { score: -1000, whyRecommended: [] };
    }

    if (style === "luxury" || interests.includes("Luxury")) {
      if (metadata.backpacking && !metadata.luxury && budgetTier === "high") {
         score -= 40; // Soft penalty for cheap spots in high budget
      }
    }

    // 1. Strict Weighted Interest Matching
    interests.forEach(interest => {
      const cleanI = interest.toLowerCase().replace(" trail", "").trim();
      const match = metadata[cleanI] || category.includes(cleanI) || tags.includes(cleanI) || nameLower.includes(cleanI);
      
      if (match) {
        if (cleanI === "photography") {
          score += 30;
          whyRecommended.push("Top spot for photography");
        } else if (cleanI === "nature") {
          score += 15;
          whyRecommended.push("Scenic nature experience");
        } else if (cleanI === "food" || cleanI === "food trail") {
          score += 20;
          whyRecommended.push("Must-visit for food lovers");
        } else if (cleanI === "nightlife") {
          score += 20;
          whyRecommended.push("Great for nightlife");
        } else if (cleanI === "spiritual") {
          score += 15;
          whyRecommended.push("Peaceful spiritual site");
        } else if (cleanI === "heritage") {
          score += 20;
          whyRecommended.push("Rich heritage & history");
        } else if (cleanI === "adventure") {
          score += 20;
          whyRecommended.push("Exciting adventure spot");
        } else if (cleanI === "shopping") {
          score += 15;
          whyRecommended.push("Popular shopping destination");
        } else {
          score += 15;
          whyRecommended.push(`Matches ${interest} interest`);
        }
      }
    });

    // 2. Travel style matching
    if (style === "solo" && metadata["solo-friendly"]) {
      score += 15;
      whyRecommended.push("Solo-friendly location");
    }
    if ((style === "family" || interests.includes("Family")) && metadata["family"]) {
      score += 15;
      whyRecommended.push("Family-friendly experience");
    }
    if ((style === "backpacking" || interests.includes("Backpacking")) && metadata["backpacking"]) {
      score += 15;
      whyRecommended.push("Backpacker favorite");
    }
    if ((style === "luxury" || interests.includes("Luxury")) && metadata["luxury"]) {
      score += 25;
      whyRecommended.push("Premium luxury spot");
    }
    if (interests.includes("Romantic") && metadata["romantic"]) {
      score += 20;
      whyRecommended.push("Perfect for a romantic outing");
    }

    // 3. Trip Mood boosts
    const reqMood = (mood || "").toLowerCase().trim();
    if (reqMood === "relaxed" && (metadata["nature"] || metadata["romantic"])) {
      score += 20;
      whyRecommended.push("Ideal for a relaxed pace");
    }
    if (reqMood === "adventure-heavy" && (metadata["adventure"] || category === "adventure")) {
      score += 30;
      whyRecommended.push("Fits your adventure-heavy mood");
    }
    if (reqMood === "party-focused" && (metadata["nightlife"] || category === "nightlife")) {
      score += 30;
      whyRecommended.push("Matches your party-focused mood");
    }
    if (reqMood === "slow luxury" && metadata["luxury"]) {
      score += 30;
      whyRecommended.push("Curated for slow luxury");
    }
    if (reqMood === "hidden gems") {
      // Final Change 2: Improved Hidden Gem logic (Rating >= 4.2, low reviews)
      const isHidden = (p.reviews < 1200 && p.rating >= 4.2) || tags.includes("hidden gem") || nameLower.includes("hidden");
      if (isHidden) {
        score += 35;
        whyRecommended.push("Off-the-beaten-path hidden gem");
      }
    }
    if (reqMood === "local culture" && (metadata["heritage"] || metadata["spiritual"] || category === "culture")) {
      score += 25;
      whyRecommended.push("Deep dive into local culture");
    }

    // 4. Veg Preference (+20 for Veg, heavy penalty for non-veg if Veg Only selected)
    if (dietary === "veg" || interests.includes("Veg Only")) {
      if (metadata["veg"] && metadata["food"]) {
          score += 20;
          whyRecommended.push("Great vegetarian options");
      }
    }

    // 5. Budget matching (+10)
    if (budgetTier === "low" && metadata["budget-friendly"]) {
      score += 10;
      whyRecommended.push("Budget-friendly");
    } else if (budgetTier === "high" && metadata["luxury"]) {
      score += 10;
    }

    // Proximity to city center (small boost)
    const dist = getDistance(coords.lat, coords.lng, p.lat, p.lng);
    if (dist < 8) score += 3;
    else if (dist < 15) score += 1;

    // DB feedback loop
    if ((userPreferences.likedPlaces || []).includes(p.name)) {
      score += 30;
      whyRecommended.push("Highly rated by you");
    }
    if ((userPreferences.dislikedPlaces || []).includes(p.name)) {
      score -= 1000; // Phase 1: Hard filter out disliked places
    }

    return {
      score,
      whyRecommended: [...new Set(whyRecommended)]
    };
  };

  const scoredPool = cityPool
    .map((p, idx) => {
      const enriched = enrichPlace(p, idx);
      const { score, whyRecommended } = scoreCandidate(enriched);
      return { ...enriched, score, whyRecommended };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score);

  // Fallback: If pool is empty, generate baseline fallback places
  let finalPool = scoredPool;
  const minRequired = days * 5; // Diversity buffer
  if (finalPool.length < minRequired) {
    const needed = minRequired - finalPool.length;
    const fallbacks = generateFallbacks(city, coords, needed, budgetTier).map((p, idx) => {
      const enriched = enrichPlace(p, finalPool.length + idx);
      return {
        ...enriched,
        score: 1,
        whyRecommended: ["Popular spot"]
      };
    });
    finalPool = [...finalPool, ...fallbacks];
  }

  /* STEP 5 STAY RECOMMENDATION */
  const recommendedStay = getRecommendedStay(city, travelerType, budgetTier);

  /* STEP 6: GEOGRAPHIC PROXIMITY CLUSTERING & PACING */
  // Planning Style (Final Change 4)
  let placesPerDay = 3;
  const currentMood = (mood || "").toLowerCase().trim();
  const currentStyle = (planningStyle || "balanced").toLowerCase();

  if (currentStyle === "packed") {
    placesPerDay = 5;
  } else if (currentStyle === "minimal" || currentStyle === "relaxed") {
    placesPerDay = 2;
  } else {
    // Balanced (default) influenced by pace/mood
    if (pace === "fast" || currentMood === "adventure-heavy") placesPerDay = 4;
    else if (pace === "slow" || currentMood === "relaxed") placesPerDay = 2;
    else placesPerDay = 3;
  }

  const itineraryDays = [];
  const unassigned = [...finalPool];

  for (let dayNum = 1; dayNum <= days; dayNum++) {
    if (unassigned.length === 0) break;

    // Pick seed (highest scoring available place)
    const seed = unassigned.shift();
    const dayGroup = [seed];
    const categoryCounts = { [seed.category]: 1 }; // Final Change 5: Diversity Balancing

    // Find nearest neighbors to the seed
    while (dayGroup.length < placesPerDay && unassigned.length > 0) {
      let bestCandidateIdx = -1;
      let minDistance = Infinity;

      for (let i = 0; i < unassigned.length; i++) {
        const p = unassigned[i];
        
        // Diversity Balancing: Prefer different categories
        const cat = p.category || "Other";
        const catRepeatPenalty = (categoryCounts[cat] || 0) * 10; // 10km virtual penalty per repeat
        
        const dist = getDistance(seed.lat, seed.lng, p.lat, p.lng) + catRepeatPenalty;
        if (dist < minDistance) {
          minDistance = dist;
          bestCandidateIdx = i;
        }
      }

      if (bestCandidateIdx !== -1) {
        const picked = unassigned.splice(bestCandidateIdx, 1)[0];
        dayGroup.push(picked);
        categoryCounts[picked.category] = (categoryCounts[picked.category] || 0) + 1;
      } else break;
    }

    // Final Change 1: Time-Aware Sequencing
    const getTimePriority = (p) => {
      const metadata = p.metadata || classifyPlace(p);
      const bestTime = metadata.bestTimeOfDay || "anytime";
      
      if (bestTime === "morning") return 1;
      if (bestTime === "afternoon") return 3;
      if (bestTime === "evening") return 5;
      if (bestTime === "night") return 7;

      // Category-based fallbacks
      const cat = (p.category || "").toLowerCase();
      if (cat === "spiritual") return 1;
      if (cat === "nature" || cat === "culture") return 2;
      if (cat === "food") return 4;
      if (cat === "shopping") return 6;
      if (cat === "nightlife") return 8;
      
      return 3; // default afternoon
    };

    dayGroup.sort((a, b) => getTimePriority(a) - getTimePriority(b));

    // Assign time slots
    const dayPlaces = dayGroup.map((p, idx) => {
      const priority = getTimePriority(p);
      const metadata = p.metadata || classifyPlace(p, budgetTier);
      
      let slot = "Afternoon";
      if (priority <= 2) slot = "Morning";
      else if (priority <= 4) slot = "Afternoon";
      else if (priority <= 6) slot = "Evening";
      else slot = "Night";

      return {
        ...p,
        type: metadata.primaryCategory || p.category,
        bestTime: slot,
        timeReason: `Optimized for ${slot.toLowerCase()} visit.`,
        estimatedCost: metadata.estimatedCost ?? p.avgCost ?? 200,
        duration: metadata.avgDuration ? (metadata.avgDuration >= 60 ? `${Math.floor(metadata.avgDuration/60)} – ${Math.floor(metadata.avgDuration/60)+1} hrs` : `${metadata.avgDuration} mins`) : "1 – 2 hrs",
      };
    });

    itineraryDays.push({
      day: dayNum,
      label: `Day ${dayNum}`,
      theme: `Exploring the best of ${city}`,
      places: dayPlaces
    });
  }

  /* STEP 7: AI ENHANCEMENT LAYER (CONSTRAINED LLM) */
  let aiRefinedItinerary = null;
  let summaryText = `A structured ${days}-day personalized itinerary for ${city} optimized for ${mood || 'general exploration'}.`;

  try {
    // Pass pre-clustered itinerary to AI for enhancement (without swapping/inventing)
    const aiResponse = await analyzeAndRefinePlan({
      city,
      days,
      budget: totalBudget,
      interests,
      travelerType,
      pace,
      candidates: finalPool, // candidate reference
      userPreferences,
      language,
      recommendedStay,
      preClusteredItinerary: itineraryDays // custom parameter
    });

    if (aiResponse && aiResponse.itinerary) {
      aiRefinedItinerary = aiResponse.itinerary;
      summaryText = aiResponse.summary || summaryText;
    }
  } catch (err) {
    console.warn("⚠️ AI Plan Enhancement failed/skipped. Using local fallback plan.", err.message);
  }

  // Fallback if AI fails or returns invalid structure: map reasons to fallback descriptions
  let finalItinerary = itineraryDays;
  if (aiRefinedItinerary) {
    // Map AI description back to our geographically optimized places list
    finalItinerary = itineraryDays.map((d, dIdx) => {
      const aiDay = aiRefinedItinerary[dIdx] || {};
      const aiPlaces = aiDay.places || [];

      const mappedPlaces = d.places.map((p, pIdx) => {
        const aiPlace = aiPlaces.find(ap => ap.name.toLowerCase() === p.name.toLowerCase()) || aiPlaces[pIdx] || {};
        return {
          ...p,
          desc: aiPlace.reason || aiPlace.desc || `Visit ${p.name}, a highly recommended ${p.category.toLowerCase()} spot.`,
        };
      });

      return {
        ...d,
        theme: aiDay.theme || d.theme,
        places: mappedPlaces
      };
    });
  } else {
    // Pure local fallback descriptions using reasons
    finalItinerary = itineraryDays.map(d => ({
      ...d,
      places: d.places.map(p => ({
        ...p,
        desc: p.whyRecommended && p.whyRecommended.length > 0
          ? `${p.name} is selected because it ${p.whyRecommended.join(" and ").toLowerCase()}.`
          : `Enjoy a curated visit to ${p.name}, matching your overall travel style.`
      }))
    }));
  }

  // Add reviews to all places
  for (const d of finalItinerary) {
    d.places = await Promise.all(d.places.map(async (p) => {
      const userReviews = await fetchUserReviews(p.name, p.category, city);
      return { ...p, userReviews };
    }));
  }

  /* STEP 8: FINAL COST CALCULATION */
  const dietary = userPreferences.dietary || "any";
  const finalPricing = calculateDeterministicTripCost(finalItinerary, days, budgetTier, travelerType, totalBudget, recommendedStay, dietary, city);

  return {
    city,
    days: parseInt(days),
    itinerary: finalItinerary,
    recommendedStay,
    recommendedTransport,
    coordinates: coords,
    totalBudget,
    budgetTier,
    totalTripCost: finalPricing.total,
    costBreakdown: finalPricing.breakdown,
    remainingBudget: Math.round(totalBudget - finalPricing.total),
    perDayBudget: Math.round(totalBudget / days),
    isPersonalized: true,
    summary: summaryText
  };
}

const axios = require("axios");

/* ── CITY COORDS ── */
async function getCityCoords(city) {
  const map = {
    "bengaluru": { lat: 12.9716, lng: 77.5946 },
    "bangalore": { lat: 12.9716, lng: 77.5946 },
    "mumbai": { lat: 19.076, lng: 72.8777 },
    "agra": { lat: 27.1767, lng: 78.0081 },
    "delhi": { lat: 28.6139, lng: 77.2090 },
    "new delhi": { lat: 28.6139, lng: 77.2090 },
    "jaipur": { lat: 26.9124, lng: 75.7873 },
    "varanasi": { lat: 25.3176, lng: 82.9739 },
    "goa": { lat: 15.2993, lng: 74.1240 },
    "rishikesh": { lat: 30.0869, lng: 78.2676 },
    "udaipur": { lat: 24.5854, lng: 73.7125 },
    "kochi": { lat: 9.9312, lng: 76.2673 },
    "amritsar": { lat: 31.6340, lng: 74.8723 },
    "hampi": { lat: 15.3350, lng: 76.4600 },
    "ladakh": { lat: 34.1526, lng: 77.5771 },
    "leh": { lat: 34.1526, lng: 77.5771 },
    "tirupati": { lat: 13.6288, lng: 79.4192 },
    "tirupati balaji": { lat: 13.6288, lng: 79.4192 },
    "shirdi": { lat: 19.7648, lng: 74.4762 },
    "pune": { lat: 18.5204, lng: 73.8567 },
    "hyderabad": { lat: 17.3850, lng: 78.4867 },
    "chennai": { lat: 13.0827, lng: 80.2707 },
    "kolkata": { lat: 22.5726, lng: 88.3639 },
    "patna": { lat: 25.5941, lng: 85.1376 },
    "shimla": { lat: 31.1048, lng: 77.1734 },
    "manali": { lat: 32.2396, lng: 77.1887 },
    "srinagar": { lat: 34.0837, lng: 74.7973 },
    "pondicherry": { lat: 11.9416, lng: 79.8083 },
    "mysore": { lat: 12.2958, lng: 76.6394 },
    "mysuru": { lat: 12.2958, lng: 76.6394 },
    "madurai": { lat: 9.9252, lng: 78.1198 },
    "rameshwaram": { lat: 9.2876, lng: 79.3129 },
    "puri": { lat: 19.8135, lng: 85.8312 },
    "dwarka": { lat: 22.2442, lng: 68.9685 },
    "somnath": { lat: 20.8880, lng: 70.4012 },
    "kedarnath": { lat: 30.7352, lng: 79.0669 },
    "badrinath": { lat: 30.7433, lng: 79.4938 },
    "haridwar": { lat: 29.9457, lng: 78.1642 },
    "ooty": { lat: 11.4102, lng: 76.6950 },
    "udhagamandalam": { lat: 11.4102, lng: 76.6950 },
    "munnar": { lat: 10.0889, lng: 77.0595 },
    "coorg": { lat: 12.3375, lng: 75.8069 },
    "madikeri": { lat: 12.4244, lng: 75.7382 },
    "wayanad": { lat: 11.6854, lng: 76.1320 },
    "alleppey": { lat: 9.4981, lng: 76.3329 },
    "alappuzha": { lat: 9.4981, lng: 76.3329 },
    "jodhpur": { lat: 26.2389, lng: 73.0243 },
    "jaisalmer": { lat: 26.9157, lng: 70.9160 },
    "pushkar": { lat: 26.4897, lng: 74.5511 },
    "khajuraho": { lat: 24.8318, lng: 79.9199 },
    "gwalior": { lat: 26.2183, lng: 78.1828 },
    "mahabaleshwar": { lat: 17.9307, lng: 73.6477 },
    "lonavala": { lat: 18.7557, lng: 73.4091 },
    "mumbai": { lat: 19.076, lng: 72.8777 },
    "delhi": { lat: 28.6139, lng: 77.2090 },
    "bengaluru": { lat: 12.9716, lng: 77.5946 },
    "bangalore": { lat: 12.9716, lng: 77.5946 },
    "hyderabad": { lat: 17.385, lng: 78.4867 },
    "ahmedabad": { lat: 23.0225, lng: 72.5714 },
    "chennai": { lat: 13.0827, lng: 80.2707 },
    "kolkata": { lat: 22.5726, lng: 88.3639 },
    "surat": { lat: 21.1702, lng: 72.8311 },
    "pune": { lat: 18.5204, lng: 73.8567 },
    "jaipur": { lat: 26.9124, lng: 75.7873 },
    "lucknow": { lat: 26.8467, lng: 80.9462 },
    "kanpur": { lat: 26.4499, lng: 80.3319 },
    "nagpur": { lat: 21.1458, lng: 79.0882 },
    "visakhapatnam": { lat: 17.6868, lng: 83.2185 },
    "indore": { lat: 22.7196, lng: 75.8577 },
    "thane": { lat: 19.2183, lng: 72.9781 },
    "bhopal": { lat: 23.2599, lng: 77.4126 },
    "visakhapatnam": { lat: 17.6868, lng: 83.2185 },
    "pimpri-chinchwad": { lat: 18.6298, lng: 73.7997 },
    "patna": { lat: 25.5941, lng: 85.1376 },
    "vadodara": { lat: 22.3072, lng: 73.1812 },
    "ghaziabad": { lat: 28.6692, lng: 77.4538 },
    "ludhiana": { lat: 30.901, lng: 75.8573 },
    "agra": { lat: 27.1767, lng: 78.0081 },
    "nashik": { lat: 19.9975, lng: 73.7898 },
    "faridabad": { lat: 28.4089, lng: 77.3178 },
    "meerut": { lat: 28.9845, lng: 77.7064 },
    "rajkot": { lat: 22.3039, lng: 70.8022 },
    "varanasi": { lat: 25.3176, lng: 82.9739 },
    "srinagar": { lat: 34.0837, lng: 74.7973 },
    "aurangabad": { lat: 19.8762, lng: 75.3433 },
    "dhanbad": { lat: 23.7957, lng: 86.4304 },
    "amritsar": { lat: 31.634, lng: 74.8723 },
    "navi mumbai": { lat: 19.033, lng: 73.0297 },
    "allahabad": { lat: 25.4358, lng: 81.8463 },
    "prayagraj": { lat: 25.4358, lng: 81.8463 },
    "howrah": { lat: 22.5769, lng: 88.3186 },
    "gwalior": { lat: 26.2183, lng: 78.1828 },
    "jabalpur": { lat: 23.1815, lng: 79.9864 },
    "coimbatore": { lat: 11.0168, lng: 76.9558 },
    "vijayawada": { lat: 16.5062, lng: 80.648 },
    "jodhpur": { lat: 26.2389, lng: 73.0243 },
    "madurai": { lat: 9.9252, lng: 78.1198 },
    "raipur": { lat: 21.2514, lng: 81.6296 },
    "kota": { lat: 25.2138, lng: 75.8648 },
    "chandigarh": { lat: 30.7333, lng: 76.7794 },
    "guwahati": { lat: 26.1445, lng: 91.7362 },
    "sholapur": { lat: 17.6599, lng: 75.9064 },
    "hubli": { lat: 15.3647, lng: 75.124 },
    "bareilly": { lat: 28.367, lng: 79.4304 },
    "moradabad": { lat: 28.8351, lng: 78.7733 },
    "mysore": { lat: 12.2958, lng: 76.6394 },
    "gurgaon": { lat: 28.4595, lng: 77.0266 },
    "aligarh": { lat: 27.8837, lng: 78.0667 },
    "jalandhar": { lat: 31.326, lng: 75.5762 },
    "tiruchirappalli": { lat: 10.7905, lng: 78.7047 },
    "bhubaneswar": { lat: 20.2961, lng: 85.8245 },
    "salem": { lat: 11.6643, lng: 78.146 },
    "warangal": { lat: 17.9689, lng: 79.5941 },
    "guntur": { lat: 16.3067, lng: 80.4365 },
    "bhilai": { lat: 21.1938, lng: 81.3509 },
    "bhiwandi": { lat: 19.2813, lng: 73.0483 },
    "saharampur": { lat: 29.964, lng: 77.546 },
    "gorakhpur": { lat: 26.7606, lng: 83.3731 },
    "bikander": { lat: 28.0229, lng: 73.3119 },
    "amravati": { lat: 20.932, lng: 77.7523 },
    "noida": { lat: 28.5355, lng: 77.391 },
    "jamshedpur": { lat: 22.8046, lng: 86.2029 },
    "bhilai": { lat: 21.1938, lng: 81.3509 },
    "cuttack": { lat: 20.4625, lng: 85.883 },
    "firozabad": { lat: 27.15, lng: 78.4 },
    "kochi": { lat: 9.9312, lng: 76.2673 },
    "nellore": { lat: 14.4426, lng: 79.9865 },
    "bhavnagar": { lat: 21.7645, lng: 72.1519 },
    "dehradun": { lat: 30.3165, lng: 78.0322 },
    "durgapur": { lat: 23.4846, lng: 87.3105 },
    "asansol": { lat: 23.6739, lng: 86.9524 },
    "rohtak": { lat: 28.8955, lng: 76.6066 },
    "kurukshetra": { lat: 29.9695, lng: 76.8783 },
    "panipat": { lat: 29.3909, lng: 76.9635 },
    "karnal": { lat: 29.6857, lng: 76.9905 },
    "hisar": { lat: 29.1492, lng: 75.7217 },
    "sonipat": { lat: 28.9931, lng: 77.0151 },
    "panchkula": { lat: 30.6942, lng: 76.8606 },
    "yamunanagar": { lat: 30.129, lng: 77.2674 },
    "sirsa": { lat: 29.5322, lng: 75.0318 },
    "ambala": { lat: 30.3782, lng: 76.7767 },
    "mangaluru": { lat: 12.9141, lng: 74.856 },
    "belagavi": { lat: 15.8497, lng: 74.4977 },
    "davanagere": { lat: 14.4644, lng: 75.9218 },
    "ballari": { lat: 15.1394, lng: 76.9214 },
    "vijayapura": { lat: 16.8302, lng: 75.71 },
    "shivamogga": { lat: 13.9299, lng: 75.5681 },
    "tumakuru": { lat: 13.3392, lng: 77.114 },
    "raichur": { lat: 16.212, lng: 77.3556 },
    "bidar": { lat: 17.912, lng: 77.5188 },
    "hospet": { lat: 15.2689, lng: 76.3909 },
    "gadag": { lat: 15.4244, lng: 75.6253 },
    "hassan": { lat: 13.007, lng: 76.1025 },
    "udupi": { lat: 13.3409, lng: 74.7421 },
    "kolar": { lat: 13.1373, lng: 78.1278 },
    "mandya": { lat: 12.5222, lng: 76.896 },
    "chikmagalur": { lat: 13.3161, lng: 75.772 },
    "bagalkot": { lat: 16.1817, lng: 75.6958 },
    "karwar": { lat: 14.8105, lng: 74.1293 },
    "kozhikode": { lat: 11.2588, lng: 75.7804 },
    "thiruvananthapuram": { lat: 8.5241, lng: 76.9366 },
    "thrissur": { lat: 10.5276, lng: 76.2144 },
    "malappuram": { lat: 11.051, lng: 76.0711 },
    "palakkad": { lat: 10.7867, lng: 76.6547 },
    "kannur": { lat: 11.8745, lng: 75.3704 },
    "kollam": { lat: 8.8932, lng: 76.6141 },
    "kottayam": { lat: 9.5916, lng: 76.5221 },
    "kasaragod": { lat: 12.4996, lng: 74.9869 },
    "pathanamthitta": { lat: 9.2648, lng: 76.787 },
    "idukki": { lat: 9.9189, lng: 77.1025 },
    "ernakulam": { lat: 9.9816, lng: 76.2999 },
    "alappuzha": { lat: 9.4981, lng: 76.3329 },
    "coorg": { lat: 12.3375, lng: 75.8069 },
    "ooty": { lat: 11.4102, lng: 76.695 },
    "pondicherry": { lat: 11.9416, lng: 79.8083 },
    "lakshadweep": { lat: 10.5667, lng: 72.6417 },
    "port blair": { lat: 11.6234, lng: 92.7265 }
  };

  const cleanCity = city.trim().toLowerCase();
  
  // Handle region names by mapping them to primary cities
  const REGION_TO_CITY = {
    "rajasthan": "Jaipur",
    "kerala": "Kochi",
    "himachal": "Shimla",
    "himalayas": "Leh",
    "uttarakhand": "Rishikesh",
    "karnataka": "Bengaluru",
    "tamil nadu": "Chennai",
    "maharashtra": "Mumbai",
    "andhra pradesh": "Tirupati",
    "telangana": "Hyderabad",
    "west bengal": "Kolkata",
    "gujarat": "Ahmedabad",
    "bihar": "Patna",
    "punjab": "Amritsar",
    "jammu": "Srinagar",
    "kashmir": "Srinagar",
    "ladakh region": "Leh"
  };

  const lookupCity = REGION_TO_CITY[cleanCity] || cleanCity;
  const finalLookup = lookupCity.toLowerCase();

  if (map[finalLookup]) return map[finalLookup];

  try {
    const indiaPlaces = require("../data/indiaPlaces.json");
    const found = indiaPlaces.find(c => c.city.toLowerCase() === finalLookup);
    if (found) return found.coordinates;
  } catch (e) {}

  try {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanCity)}&limit=1`,
      { 
        headers: { "User-Agent": "GoTripo-Travel-App/2.0 (contact@gotripo.com)" },
        timeout: 5000 // 5 second timeout for geocoding
      }
    );
    if (res.data && res.data.length > 0) {
      console.log(`📍 Geocoding success for [${cleanCity}]:`, res.data[0].lat, res.data[0].lon);
      return {
        lat: Number(res.data[0].lat),
        lng: Number(res.data[0].lon)
      };
    } else {
      console.warn(`⚠️ Geocoding returned no results for: ${cleanCity}`);
    }
  } catch (err) {
    console.error(`❌ Geocoding failed for [${cleanCity}]:`, err.message);
    if (err.response) {
      console.error("  - Status:", err.response.status);
      console.error("  - Data:", err.response.data);
    }
  }

  return null; // Return null instead of defaulting to Bengaluru
}

function generateReason(place, interests, budgetTier, index) {
  const category = (place.category || "").toLowerCase();
  const interestSet = new Set(interests.map(i => i.toLowerCase()));

  const parts = [];

  const categoryLine = {
    nature: "offers a refreshing natural experience",
    food: "is great for exploring local food",
    culture: "has strong cultural significance",
    shopping: "is perfect for shopping lovers"
  };

  if (categoryLine[category]) {
    parts.push(categoryLine[category]);
  }

  if (interestSet.has(category)) {
    parts.push("matches your interests");
  }

  const timeTag = getTimeOfDayTag(place, index);
  if (timeTag) parts.push(timeTag);

  if ((place.avgCost || 200) < 200 && budgetTier === "low") {
    parts.push("budget-friendly");
  }

  parts.push(getCrowdTag(index));

  if (index % 2 === 0) {
    parts.push(getTrendingTag(index));
  }

  return parts.join(", ") + ".";
}

function getTimeOfDayTag(place, index) {
  const morning = ["park", "nature"];
  const evening = ["food", "shopping"];
  const flexible = ["culture"];

  const category = (place.category || "").toLowerCase();

  if (morning.includes(category)) {
    return index % 2 === 0 ? "best visited in the morning" : "perfect for early hours";
  }

  if (evening.includes(category)) {
    return index % 2 === 0 ? "ideal for evening time" : "great for sunset or night vibe";
  }

  if (flexible.includes(category)) {
    return "can be explored anytime during the day";
  }

  return null;
}

function getCrowdTag(index) {
  const crowdTypes = [
    "usually less crowded",
    "popular among travelers",
    "a well-known busy spot",
    "relatively quiet and peaceful"
  ];

  return crowdTypes[index % crowdTypes.length];
}

function getTrendingTag(index) {
  const trending = [
    "currently trending among tourists",
    "a must-visit spot right now",
    "one of the top-rated places recently",
    "frequently recommended by travelers"
  ];

  return trending[index % trending.length];
}

module.exports = generatePlan;