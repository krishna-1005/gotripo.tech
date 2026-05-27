/**
 * Dynamically classifies a place into GoTripo primary categories
 * and generates realistic metadata (duration, cost, description).
 */
function classifyPlace(place, budgetTier = 'medium') {
  const name = (place.name || "").toLowerCase();
  const category = (place.category || "").toLowerCase();
  const tags = (place.tags || []).map(t => String(t).toLowerCase());
  const cost = place.avgCost ?? place.estimatedCost ?? 0;
  
  // Base metadata structure
  const metadata = {
    primaryCategory: "sightseeing",
    avgDuration: 90,
    estimatedCost: 100,
    description: "",
    bestTimeOfDay: "anytime",
    openingHours: { start: "09:00", end: "21:00" },
    flags: {
      photography: false,
      food: false,
      nightlife: false,
      shopping: false,
      nature: false,
      heritage: false,
      adventure: false,
      spiritual: false,
      luxury: false,
      backpacking: false,
    }
  };

  // 1. SPIRITUAL
  if (
    category === "spiritual" || 
    tags.some(t => ["temple", "church", "mosque", "dargah", "gurudwara", "ashram", "worship", "religion", "religious"].includes(t)) || 
    ["temple", "church", "mosque", "dargah", "gurudwara", "ashram", "matha", "spiritual", "basilica", "cathedral", "stupa", "worship", "iskcon"].some(kw => name.includes(kw))
  ) {
    metadata.primaryCategory = "spiritual";
    metadata.avgDuration = 45 + (Math.floor(Math.random() * 30)); // 45-75 mins
    metadata.estimatedCost = 0; // Usually free, maybe donation
    metadata.description = "A peaceful spiritual site known for its serene atmosphere and cultural significance.";
    metadata.bestTimeOfDay = "morning";
    metadata.flags.spiritual = true;
  }

  // 2. FOOD
  else if (
    category === "food" || 
    tags.some(t => ["restaurant", "cafe", "food", "dining", "bakery", "street_food", "food_court"].includes(t)) || 
    ["cafe", "restaurant", "food", "dining", "dhaba", "bistro", "hotel dining", "kitchen", "sweets", "bazaar food", "eats", "bakery", "pizzeria", "grill", "house", "coffee"].some(kw => name.includes(kw))
  ) {
    metadata.primaryCategory = "food";
    metadata.avgDuration = 60 + (Math.floor(Math.random() * 30)); // 60-90 mins
    
    // Cost based on name/tags and budget tier
    let baseCost = 400;
    if (["street", "tapri", "chai", "stall", "tiffin"].some(kw => name.includes(kw))) baseCost = 150;
    else if (["fine", "luxury", "lounge", "premium", "rooftop"].some(kw => name.includes(kw))) baseCost = 1500;
    
    const mult = { low: 0.6, medium: 1, high: 1.8 }[budgetTier];
    metadata.estimatedCost = Math.round(baseCost * mult);
    
    metadata.description = "A popular local food destination known for its authentic flavors and welcoming atmosphere.";
    metadata.bestTimeOfDay = (name.includes("breakfast")) ? "morning" : (name.includes("lunch")) ? "afternoon" : "evening";
    metadata.flags.food = true;
  }

  // 3. NIGHTLIFE
  else if (
    category === "nightlife" || 
    tags.some(t => ["pub", "bar", "nightclub", "club", "lounge", "brewery"].includes(t)) || 
    ["pub", "bar", "club", "lounge", "brewery", "social", "beer", "wine", "discotheque", "tavern"].some(kw => name.includes(kw))
  ) {
    metadata.primaryCategory = "nightlife";
    metadata.avgDuration = 120 + (Math.floor(Math.random() * 60)); // 2-3 hrs
    
    let baseCost = 1200;
    const mult = { low: 0.7, medium: 1, high: 2 }[budgetTier];
    metadata.estimatedCost = Math.round(baseCost * mult);
    
    metadata.description = "A lively evening destination offering great music, drinks, and a vibrant social scene.";
    metadata.bestTimeOfDay = "night";
    metadata.flags.nightlife = true;
  }

  // 4. NATURE
  else if (
    category === "nature" || 
    tags.some(t => ["park", "garden", "lake", "waterfall", "beach", "forest", "reserve", "hills", "valley", "river", "ocean"].includes(t)) || 
    ["park", "garden", "lake", "waterfall", "falls", "beach", "forest", "reserve", "hills", "valley", "river", "sea", "ocean", "sanctuary", "peak", "ridge", "viewpoint", "view"].some(kw => name.includes(kw))
  ) {
    metadata.primaryCategory = "nature";
    metadata.avgDuration = 90 + (Math.floor(Math.random() * 60)); // 1.5-2.5 hrs
    metadata.estimatedCost = name.includes("park") || name.includes("garden") ? 50 : 0;
    
    metadata.description = "A scenic natural location perfect for relaxing walks, fresh air, and beautiful views.";
    metadata.bestTimeOfDay = "morning";
    metadata.flags.nature = true;
  }

  // 5. HERITAGE
  else if (
    category === "culture" || category === "heritage" ||
    tags.some(t => ["historic", "heritage", "monument", "museum", "palace", "fort", "ruins", "ancient"].includes(t)) || 
    ["heritage", "monument", "museum", "palace", "fort", "ruins", "ancient", "history", "tomb", "stupa", "archaeological"].some(kw => name.includes(kw))
  ) {
    metadata.primaryCategory = "heritage";
    metadata.avgDuration = 90 + (Math.floor(Math.random() * 60)); // 1.5-2.5 hrs
    metadata.estimatedCost = 200;
    
    metadata.description = "A significant historic landmark showcasing rich architecture and fascinating cultural heritage.";
    metadata.bestTimeOfDay = "morning";
    metadata.flags.heritage = true;
  }

  // 6. SHOPPING
  else if (
    category === "shopping" || 
    tags.some(t => ["market", "mall", "shopping", "bazaar", "arcade", "marketplace"].includes(t)) || 
    ["market", "mall", "bazaar", "street shopping", "square", "emporium", "plaza", "commercial", "shopping"].some(kw => name.includes(kw))
  ) {
    metadata.primaryCategory = "shopping";
    metadata.avgDuration = 120 + (Math.floor(Math.random() * 90)); // 2-3.5 hrs
    metadata.estimatedCost = name.includes("mall") ? 500 : 200; // Expected spending
    
    metadata.description = "A bustling shopping area featuring local specialties, variety, and a lively marketplace vibe.";
    metadata.bestTimeOfDay = "afternoon";
    metadata.flags.shopping = true;
  }

  // 7. ADVENTURE
  else if (
    category === "adventure" || 
    tags.some(t => ["trekking", "hiking", "safari", "rafting", "climbing", "adventure", "watersports", "sports"].includes(t)) || 
    ["trek", "hike", "safari", "rafting", "adventure", "watersports", "camp", "cave", "climb", "slide", "zipline"].some(kw => name.includes(kw))
  ) {
    metadata.primaryCategory = "adventure";
    metadata.avgDuration = 180 + (Math.floor(Math.random() * 120)); // 3-5 hrs
    metadata.estimatedCost = 1500;
    
    metadata.description = "An exciting adventure destination offering thrilling activities and memorable outdoor experiences.";
    metadata.bestTimeOfDay = "morning";
    metadata.flags.adventure = true;
  }

  // 8. SIGHTSEEING (Fallback)
  else {
    metadata.primaryCategory = "sightseeing";
    metadata.avgDuration = 60 + (Math.floor(Math.random() * 60)); // 1-2 hrs
    metadata.estimatedCost = 100;
    metadata.description = "A must-visit local spot offering unique character and great photo opportunities.";
    metadata.flags.photography = true;
  }

  // Special checks for photography and luxury
  if (tags.some(t => ["viewpoint", "scenic"].includes(t)) || name.includes("view")) {
    metadata.flags.photography = true;
  }
  
  if (cost >= 800 || budgetTier === "high" || tags.includes("luxury")) {
    metadata.flags.luxury = true;
  }

  return metadata;
}

module.exports = classifyPlace;
