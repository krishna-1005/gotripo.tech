const express = require("express");
const router = express.Router();
const axios = require("axios");
const path = require("path");
const { generateReviews } = require("../services/reviewService");

/* ── Load local datasets ── */
let allPlaces = [];
let accommodationPool = [];
const cityCoordsMap = {};

try {
  const curated = require("../data/bengaluruPlaces.json");
  const bulk = require("../data/bangalorePlaces.json");
const indiaPlaces = require("../data/indiaPlaces.json");

  try {
    accommodationPool = require("../data/accommodations.json");
  } catch (e) {}

  indiaPlaces.forEach(c => {
    if (c.city && c.coordinates) {
      cityCoordsMap[c.city.toLowerCase()] = c.coordinates;
    }
  });

  const normalizedCurated = curated.flat().filter(p => p && p.name).map(p => ({
    name: p.name,
    lat: Number(p.lat),
    lng: Number(p.lng),
    category: p.category || "Other",
    source: "curated"
  }));

  const normalizedBulk = bulk.filter(p => p && p.name).map(p => ({
    name: p.name,
    lat: Number(p.lat),
    lng: Number(p.lng),
    category: p.category || "Other",
    source: "bulk"
  }));

  const normalizedIndia = (indiaPlaces || []).flatMap(cityData => 
    (cityData.places || []).map(p => ({
      name: p.name,
      lat: p.lat ? Number(p.lat) : 0,
      lng: p.lng ? Number(p.lng) : 0,
      category: p.category || "Other",
      source: "india_places",
      city: cityData.city
    }))
  );

  allPlaces = [...normalizedCurated, ...normalizedBulk, ...normalizedIndia];
} catch (e) {
  console.error("❌ Error initializing local datasets in nearbyPlaces:", e.message);
}

function distance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const fetchOSMPlaces = require("../services/osmPlaces");
const { searchIndoorPlaces } = require("../services/googlePlaces");

const REGION_TO_CITY = {
  "himalayas": "Shimla",
  "kerala": "Munnar",
  "himachal": "Shimla",
  "uttarakhand": "Rishikesh",
  "rajasthan": "Jaipur",
  "karnataka": "Bengaluru"
};

router.post("/", async (req, res) => {
  try {
    let { lat, lng, city, radius = 10, category, travelerType, indoorOnly } = req.body;
    
    // Ensure numeric types for coordinates and radius
    lat = lat ? parseFloat(lat) : null;
    lng = lng ? parseFloat(lng) : null;
    radius = parseFloat(radius);

    // If city name is provided, geocode it first
    if (city && (!lat || !lng)) {
      // ... (existing geocoding logic)
      const normalizedInput = city.toLowerCase().trim();
      const lookupCity = REGION_TO_CITY[normalizedInput] || city;

      const normalizedCity = lookupCity.toLowerCase();
      if (cityCoordsMap[normalizedCity]) {
        lat = cityCoordsMap[normalizedCity].lat;
        lng = cityCoordsMap[normalizedCity].lng;
      } else {
        try {
          const geo = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`, {
            headers: { "User-Agent": "GoTripo/1.0" }
          });
          if (geo.data && geo.data.length > 0) {
            lat = Number(geo.data[0].lat);
            lng = Number(geo.data[0].lon);
          }
        } catch (e) {
          console.error("Geocoding failed for:", city);
        }
      }
    }

    // NEW: Handle indoorOnly request using Google Places API
    if (indoorOnly && city && lat && lng) {
      const googleResults = await searchIndoorPlaces(city, lat, lng, radius * 1000); // radius in meters
      if (googleResults && googleResults.length > 0) {
        return res.json(googleResults);
      }
    }

    // If we still don't have coordinates, we can't search effectively
    if (!lat || !lng) {
      const cityLabel = city || "Selected City";
      const fallbacks = [
        { name: "City Center", category: "Landmark" },
        { name: "Historical Monument", category: "Culture" },
        { name: "Local Food Street", category: "Food" },
        { name: "Central Park", category: "Nature" }
      ].map(f => ({
        ...f,
        name: `${cityLabel} ${f.name}`,
        distance: 0,
        lat: 0, lng: 0
      }));
      return res.json(fallbacks);
    }

    // SPECIAL HANDLING FOR ACCOMMODATIONS FROM OUR NEW POOL
    if (category?.toLowerCase() === "stay" && city) {
      const cityAcc = accommodationPool.find(a => a.city.toLowerCase() === city.toLowerCase());
      if (cityAcc) {
        let matches = [];
        if (travelerType === "solo" || travelerType === "backpacking") {
          matches = (cityAcc.hostels || []).map(h => ({ ...h, category: "Stay", stayType: "Hostel" }));
        } else if (travelerType === "family") {
          matches = (cityAcc.airbnbs || []).map(a => ({ ...a, category: "Stay", stayType: "Airbnb" }));
        } else {
          matches = [
            ...(cityAcc.hostels || []).map(h => ({ ...h, category: "Stay" })),
            ...(cityAcc.airbnbs || []).map(a => ({ ...a, category: "Stay" }))
          ];
        }

        if (matches.length > 0) {
          return res.json(matches.map(m => ({
            ...m,
            distance: m.lat ? distance(lat, lng, m.lat, m.lng) : 0
          })).sort((a, b) => a.distance - b.distance));
        }
      }
    }

    // Filter local data
    let localMatches = allPlaces
      .map(place => ({ ...place, distance: distance(lat, lng, place.lat, place.lng) }))
      .filter(place => place.distance <= radius);
    
    if (category) {
      localMatches = localMatches.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // NEW: Apply indoor filtering to local data if requested
    if (indoorOnly) {
      const OUTDOOR_CATEGORIES = ['nature', 'park', 'trek', 'garden', 'lake', 'mountain', 'zoo', 'safari'];
      localMatches = localMatches.filter(p => {
        const cat = p.category.toLowerCase();
        const name = p.name.toLowerCase();
        return !OUTDOOR_CATEGORIES.some(kw => cat.includes(kw) || name.includes(kw));
      });
    }

    localMatches = localMatches.sort((a, b) => a.distance - b.distance);

    if (localMatches.length > 2) {
      return res.json(localMatches.slice(0, 10));
    }

    // Try OSM if local data is thin
    const osmPlaces = await fetchOSMPlaces(lat, lng, radius);
    let filteredOsm = osmPlaces;
    if (category) {
      filteredOsm = osmPlaces.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    // Apply indoor filtering to OSM data
    if (indoorOnly) {
      const OUTDOOR_CATEGORIES = ['nature', 'park', 'trek', 'garden', 'lake', 'mountain', 'zoo', 'safari'];
      filteredOsm = filteredOsm.filter(p => {
        const cat = p.category.toLowerCase();
        const name = p.name.toLowerCase();
        return !OUTDOOR_CATEGORIES.some(kw => cat.includes(kw) || name.includes(kw));
      });
    }

    if (filteredOsm.length > 0) {
      return res.json(filteredOsm.slice(0, 10));
    }

    // Final fallback
    let fallbacks = [
      { name: "Museum", category: "Culture" },
      { name: "Art Gallery", category: "Culture" },
      { name: "Local Cafe", category: "Food" },
      { name: "Shopping Mall", category: "Shopping" },
      { name: "Central Library", category: "Culture" }
    ];

    if (!indoorOnly) {
      fallbacks.push({ name: "Central Park", category: "Nature" });
    }

    res.json(fallbacks.map(f => ({
      ...f,
      name: city ? `${city} ${f.name}` : f.name,
      distance: 0
    })));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
