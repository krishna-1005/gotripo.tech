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
  if (!q) return res.status(400).json({ error: "Query required" });

  const query = q.toLowerCase().trim();

  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&addressdetails=1&limit=5`,
      { 
        headers: { "User-Agent": "GoTripo-Travel-App/2.0 (contact@gotripo.com)" },
        timeout: 5000 
      }
    );

    if (response.data && response.data.length > 0) {
      const places = response.data.map(p => ({
        id: p.place_id,
        name: p.display_name.split(',')[0],
        fullName: p.display_name,
        lat: Number(p.lat),
        lng: Number(p.lon),
        category: p.type || "Place",
        rating: getRating(p.display_name),
        address: p.address
      }));
      return res.json(places);
    }
    
    // Fallback if Nominatim returns nothing but didn't error
    throw new Error("No results from Nominatim");

  } catch (err) {
    console.warn("⚠️ Nominatim Search failed, using local fallback:", err.message);
    
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

      if (localMatches.length > 0) {
        return res.json(localMatches);
      }

      // If still no results and it was an actual error
      if (err.response) {
        console.error("Nominatim Response Error:", err.response.status, err.response.data);
      }
      
      res.status(err.response?.status || 500).json({ 
        error: "Search failed", 
        message: err.message,
        details: "Nominatim service unavailable and no local match found."
      });
    } catch (fallbackErr) {
      console.error("Fallback search error:", fallbackErr.message);
      res.status(500).json({ error: "Search failed completely" });
    }
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
