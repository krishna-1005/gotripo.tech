const express = require("express");
const router = express.Router();
const axios = require("axios");

/* ── Haversine distance formula (km) ── */
function distance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/* ── Generate stable pseudo-rating ── */
function getRating(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const base = 3.5 + (Math.abs(hash) % 15) / 10; // 3.5 to 5.0
  return Math.min(5.0, base).toFixed(1);
}

/* ── Search Places using Nominatim ── */
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) return res.status(400).json({ error: "Query required" });

  const query = q.toLowerCase().trim();

  // 1. FAST LOCAL SEARCH (Prioritize local data to avoid rate limits)
  try {
    const indiaPlaces = require("../data/indiaPlaces.json");
    const localMatches = indiaPlaces
      .filter(c => c.city.toLowerCase().includes(query))
      .map(c => ({
        id: `local-${c.city.toLowerCase()}`,
        name: c.city,
        fullName: `${c.city}, India`,
        lat: c.coordinates.lat,
        lng: c.coordinates.lng,
        category: "City",
        rating: "4.8",
        address: { city: c.city, country: "India" }
      }));

    // If we have strong local matches, we can still try OSM to get more variety
    
    // 2. EXTERNAL SEARCH (OSM)
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=10&countrycodes=in`,
        { 
          headers: { "User-Agent": "GoTripo-Travel-App/2.0 (contact@gotripo.com)" },
          timeout: 4000
        }
      );

      if (response.data && response.data.length > 0) {
        const osmPlaces = response.data.map(p => ({
          id: p.place_id,
          name: p.display_name.split(',')[0],
          fullName: p.display_name,
          lat: Number(p.lat),
          lng: Number(p.lon),
          category: p.type || "Place",
          rating: getRating(p.display_name),
          address: p.address
        }));

        // Merge local and OSM, avoiding duplicates
        const combined = [...localMatches];
        osmPlaces.forEach(op => {
          if (!combined.some(lp => lp.name.toLowerCase() === op.name.toLowerCase())) {
            combined.push(op);
          }
        });
        
        return res.json(combined.slice(0, 5));
      }
    } catch (osmErr) {
      console.warn("⚠️ OSM Search failed (likely rate limit):", osmErr.message);
      // If OSM fails, return whatever local matches we found (even if empty, but prefer local)
      if (localMatches.length > 0) return res.json(localMatches);
      throw osmErr; // Proceed to ultimate fallback
    }

    res.json(localMatches);

  } catch (err) {
    console.error("Search failure:", err.message);
    
    // 3. ULTIMATE FALLBACK: Hardcoded major cities if everything else fails
    const fallbacks = [
      { name: "Delhi", lat: 28.6139, lng: 77.2090 },
      { name: "Mumbai", lat: 19.076, lng: 72.8777 },
      { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
      { name: "Jaipur", lat: 26.9124, lng: 75.7873 },
      { name: "Goa", lat: 15.2993, lng: 74.1240 },
      { name: "Tirupati", lat: 13.6288, lng: 79.4192 }
    ].filter(c => c.name.toLowerCase().includes(query))
     .map(c => ({
        id: `fb-${c.name.toLowerCase()}`,
        name: c.name,
        fullName: `${c.name}, India`,
        lat: c.lat,
        lng: c.lng,
        category: "City",
        rating: "4.7"
     }));

    res.json(fallbacks);
  }
});

/* ── Get Place Details ── */
router.get("/details/:id", async (req, res) => {
  const { id } = req.params;
  const { lat, lon } = req.query; // If we have coords already

  try {
    // If we have coords, we can use reverse geocoding to get more details or just return what we have
    // For simplicity, we'll use the ID if provided by Nominatim or just return mock data if it's a known place
    
    // In a real app, you'd use Google Places ID or a specific OSM ID.
    // For this prototype, we'll assume the client sends the place data and we just return it or enrich it.
    
    res.json({
      success: true,
      message: "Details enriched"
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to get details" });
  }
});

module.exports = router;
