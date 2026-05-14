const axios = require('axios');

/**
 * Searches for nearby indoor places using Google Places API.
 * Types: museum, art_gallery, cafe, library, shopping_mall, movie_theater
 */
async function searchIndoorPlaces(city, lat, lng, radius = 5000) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!apiKey) {
    console.warn("⚠️ GOOGLE_PLACES_API_KEY missing. Google Places API calls will fail.");
    return null;
  }

  try {
    const types = ['museum', 'art_gallery', 'cafe', 'library', 'shopping_mall', 'movie_theater'];
    const typeString = types.join('|');
    
    // Using Text Search or Nearby Search. Nearby Search is better for specific types.
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${types[0]}&key=${apiKey}`;
    
    // Note: Nearby Search only supports ONE type per request in the 'type' parameter.
    // To search for multiple, we can use 'keyword' or make multiple requests.
    // Text search is more flexible for "indoor activities".
    
    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=indoor+activities+in+${encodeURIComponent(city)}&location=${lat},${lng}&radius=${radius}&key=${apiKey}`;

    const res = await axios.get(textSearchUrl);
    
    if (res.data.status !== 'OK') {
      console.error("Google Places API Error Status:", res.data.status, res.data.error_message);
      return null;
    }

    return res.data.results.map(place => ({
      name: place.name,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      category: place.types[0],
      rating: place.rating,
      address: place.formatted_address,
      source: "google_places"
    }));
  } catch (error) {
    console.error("Google Places API Error:", error.message);
    return null;
  }
}

module.exports = { searchIndoorPlaces };
