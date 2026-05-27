/**
 * Dynamically classifies a place into 15 GoTripo metadata categories
 * based on name, category type, description, price, and OpenStreetMap tags.
 * 
 * Standard metadata categories:
 * - photography, food, veg, nightlife, shopping, nature, heritage, adventure, 
 *   spiritual, family, luxury, backpacking, solo-friendly, romantic, budget-friendly
 * 
 * @param {Object} place - The place object
 * @param {String} budgetTier - The budget tier ('low', 'medium', 'high')
 * @returns {Object} A map of the 15 categories to boolean values plus timing defaults
 */
function classifyPlace(place, budgetTier = 'medium') {
  const name = (place.name || "").toLowerCase();
  const category = (place.category || "").toLowerCase();
  const tags = (place.tags || []).map(t => String(t).toLowerCase());
  const cost = place.avgCost ?? place.estimatedCost ?? 0;

  const metadata = {
    photography: false,
    food: false,
    veg: false,
    nightlife: false,
    shopping: false,
    nature: false,
    heritage: false,
    adventure: false,
    spiritual: false,
    family: false,
    luxury: false,
    backpacking: false,
    "solo-friendly": false,
    romantic: false,
    "budget-friendly": false,
    
    // Final Change 1: Time-Aware Defaults
    bestTimeOfDay: "anytime",
    avgDuration: 90, 
    openingHours: { start: "09:00", end: "21:00" }
  };

  // 1. Photography (scenic views, architecture, lookouts)
  if (
    category === "nature" || category === "culture" || 
    tags.some(t => ["scenic", "viewpoint", "photography", "photo", "sunset", "sunrise", "beach", "lake", "palace", "fort", "garden", "monument"].includes(t)) ||
    ["view", "sunset", "sunrise", "hill", "lake", "falls", "beach", "palace", "fort", "garden", "temple", "monument", "scenic", "shanti stupa"].some(kw => name.includes(kw))
  ) {
    metadata.photography = true;
    metadata.bestTimeOfDay = (name.includes("sunset") || tags.includes("sunset")) ? "evening" : 
                             (name.includes("sunrise") || tags.includes("sunrise")) ? "morning" : "anytime";
  }

  // 2. Food
  if (
    category === "food" || 
    tags.some(t => ["restaurant", "cafe", "food", "dining", "bakery", "street_food", "food_court"].includes(t)) || 
    ["cafe", "restaurant", "food", "dining", "dhaba", "bistro", "hotel dining", "kitchen", "sweets", "bazaar food", "eats"].some(kw => name.includes(kw))
  ) {
    metadata.food = true;
    metadata.bestTimeOfDay = (name.includes("breakfast") || name.includes("brunch")) ? "morning" :
                             (name.includes("lunch")) ? "afternoon" :
                             (name.includes("dinner") || name.includes("night")) ? "evening" : "anytime";
    metadata.avgDuration = 60;
    metadata.openingHours = { start: "08:00", end: "23:00" };
  }

  // 3. Veg (Sightseeing/nature is veg-friendly. For food, we check for pure veg names)
  if (!metadata.food) {
    metadata.veg = true;
  } else {
    if (
      ["veg", "vegetarian", "pure veg", "green", "organic", "udupi", "krishna", "ananda", "prasadam", "sweet", "chaat", "salad", "herbs"].some(kw => name.includes(kw)) || 
      tags.some(t => ["veg", "vegetarian", "organic"].includes(t))
    ) {
      metadata.veg = true;
    }
  }

  // 4. Nightlife
  if (
    category === "nightlife" || 
    tags.some(t => ["pub", "bar", "nightclub", "club", "lounge", "brewery"].includes(t)) || 
    ["pub", "bar", "club", "lounge", "brewery", "social", "beer", "wine", "discotheque"].some(kw => name.includes(kw))
  ) {
    metadata.nightlife = true;
    metadata.bestTimeOfDay = "night";
    metadata.avgDuration = 120;
    metadata.openingHours = { start: "18:00", end: "02:00" };
  }

  // 5. Shopping
  if (
    category === "shopping" || 
    tags.some(t => ["market", "mall", "shopping", "bazaar", "arcade", "marketplace"].includes(t)) || 
    ["market", "mall", "bazaar", "street shopping", "square", "emporium", "plaza", "commercial"].some(kw => name.includes(kw))
  ) {
    metadata.shopping = true;
    metadata.bestTimeOfDay = "afternoon";
    metadata.avgDuration = 120;
  }

  // 6. Nature
  if (
    category === "nature" || 
    tags.some(t => ["park", "garden", "lake", "waterfall", "beach", "forest", "reserve", "hills", "valley", "river", "ocean"].includes(t)) || 
    ["park", "garden", "lake", "waterfall", "falls", "beach", "forest", "reserve", "hills", "valley", "river", "sea", "ocean", "sanctuary", "peak", "ridge", "kufri"].some(kw => name.includes(kw))
  ) {
    metadata.nature = true;
    metadata.bestTimeOfDay = "morning";
    metadata.avgDuration = 120;
  }

  // 7. Heritage
  if (
    category === "culture" || 
    tags.some(t => ["historic", "heritage", "monument", "museum", "palace", "fort", "ruins", "ancient"].includes(t)) || 
    ["heritage", "monument", "museum", "palace", "fort", "ruins", "ancient", "history", "temple", "church", "mosque", "dargah", "tomb", "stupa"].some(kw => name.includes(kw))
  ) {
    metadata.heritage = true;
    metadata.bestTimeOfDay = "morning";
    metadata.avgDuration = 90;
    metadata.openingHours = { start: "09:00", end: "18:00" };
  }

  // 8. Adventure
  if (
    category === "adventure" || 
    tags.some(t => ["trekking", "hiking", "safari", "rafting", "climbing", "adventure", "watersports", "sports"].includes(t)) || 
    ["trek", "hike", "safari", "rafting", "adventure", "watersports", "camp", "cave", "climb", "slide"].some(kw => name.includes(kw))
  ) {
    metadata.adventure = true;
    metadata.avgDuration = 180;
    metadata.bestTimeOfDay = "morning";
  }

  // 9. Spiritual
  if (
    category === "spiritual" || 
    tags.some(t => ["spiritual", "temple", "church", "mosque", "dargah", "gurudwara", "ashram", "worship", "religion", "religious"].includes(t)) || 
    ["temple", "church", "mosque", "dargah", "gurudwara", "ashram", "matha", "spiritual", "basilica", "cathedral", "stupa", "worship"].some(kw => name.includes(kw))
  ) {
    metadata.spiritual = true;
    metadata.bestTimeOfDay = "morning";
    metadata.avgDuration = 60;
    metadata.openingHours = { start: "05:00", end: "20:00" };
  }

  // 10. Family-friendly (places suitable for all ages, avoiding clubs, hostels, or extreme hikes)
  if (
    !metadata.nightlife && 
    (category === "nature" || category === "culture" || category === "shopping" || category === "spiritual" || 
     tags.some(t => ["park", "garden", "palace", "museum", "temple", "beach", "lake", "zoo"].includes(t)) || 
     ["park", "garden", "palace", "museum", "temple", "beach", "lake", "zoo", "aquarium", "planetarium", "science", "family"].some(kw => name.includes(kw)))
  ) {
    metadata.family = true;
  }

  // 11. Luxury
  if (
    cost >= 800 || budgetTier === "high" || 
    tags.some(t => ["luxury", "resort", "palace", "fine_dining", "premium"].includes(t)) || 
    ["resort", "palace", "fine dining", "premium", "taj", "leela", "oberoi", "marriott", "rooftop", "sheraton", "ritz"].some(kw => name.includes(kw))
  ) {
    metadata.luxury = true;
  }

  // 12. Backpacking
  if (
    cost <= 350 || budgetTier === "low" || 
    tags.some(t => ["hostel", "budget", "street_food", "public", "free"].includes(t)) || 
    ["hostel", "dorm", "budget", "street food", "local dhaba", "tapri", "public park", "free entry", "trek"].some(kw => name.includes(kw))
  ) {
    metadata.backpacking = true;
  }

  // 13. Solo-friendly
  if (
    metadata.backpacking || category === "nature" || category === "culture" || 
    tags.some(t => ["hostel", "cafe", "trekking", "museum", "library", "solo"].includes(t)) || 
    ["hostel", "cafe", "trek", "museum", "library", "backpackers"].some(kw => name.includes(kw))
  ) {
    metadata["solo-friendly"] = true;
  }

  // 14. Romantic (Scenic sunsets, seaside walks, fine dining, rooftops)
  if (
    metadata.photography && 
    (tags.some(t => ["sunset", "beach", "scenic", "rooftop", "resort"].includes(t)) || 
     ["sunset", "beach", "viewpoint", "lake", "rooftop", "palace", "candlelight", "lounge"].some(kw => name.includes(kw)))
  ) {
    metadata.romantic = true;
    metadata.bestTimeOfDay = "evening";
  }

  // 15. Budget-friendly (free or low entry/average cost)
  if (cost <= 250 || metadata.backpacking || tags.some(t => ["free", "budget"].includes(t))) {
    metadata["budget-friendly"] = true;
  }

  return metadata;
}

module.exports = classifyPlace;
