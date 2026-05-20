import axios from "axios";
import { auth } from "@/firebase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const generatePlan = async (data: any) => {
  try {
    const res = await api.post("/plan/generate", data);
    return res.data.plan ?? res.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const { error: errorTitle, message, details } = error.response.data;
      throw new Error(message || errorTitle || "Failed to generate plan");
    }
    throw error;
  }
};

export const askAI = async (message: string, history: any[]) => {
  const res = await api.post("/chat", { message, history });
  return res.data;
};

export const fetchTrips = async () => {
  const res = await api.get("/trips");
  return res.data;
};

export const fetchReviews = async () => {
  const res = await api.get("/reviews");
  return res.data;
};

export const postReview = async (reviewData: { rating: number; comment: string; name: string }) => {
  const res = await api.post("/reviews", reviewData);
  return res.data;
};

export const fetchVibeSuggestions = async (vibe: { adventure: number, modern: number, social: number }) => {
  const res = await api.get("/plan/vibe-suggestions", { params: vibe });
  return res.data.suggestions;
};

export const fetchDreamWeaverSuggestions = async (prompt: string) => {
  const res = await api.post("/plan/dream-weaver", { prompt });
  return res.data.suggestions;
};

export const searchPlaces = async (query: string) => {
  if (!query || query.length < 3) return [];
  const res = await api.get(`/places/search?q=${encodeURIComponent(query)}`);
  return res.data;
};

export const fetchMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

// Budget API
export const fetchBudget = async (tripId: string) => {
  const res = await api.get(`/trips/${tripId}/budget`);
  return res.data;
};

export const addExpense = async (tripId: string, expenseData: any) => {
  const res = await api.post(`/trips/${tripId}/budget/expense`, expenseData);
  return res.data;
};

export const deleteExpense = async (tripId: string, expenseId: string) => {
  const res = await api.delete(`/trips/${tripId}/budget/expense/${expenseId}`);
  return res.data;
};

export const fetchSettlements = async (tripId: string) => {
  const res = await api.get(`/trips/${tripId}/budget/settle`);
  return res.data;
};

// Destination Vote Board API
export const fetchDestinations = async (tripId: string) => {
  const res = await api.get(`/trips/${tripId}/destinations`);
  return res.data;
};

export const addDestination = async (tripId: string, destData: any) => {
  const res = await api.post(`/trips/${tripId}/destinations`, destData);
  return res.data;
};

export const voteDestination = async (tripId: string, destId: string, voteType: 'up' | 'down') => {
  const res = await api.post(`/trips/${tripId}/destinations/${destId}/vote`, { voteType });
  return res.data;
};

export const lockDestination = async (tripId: string, destId: string) => {
  const res = await api.put(`/trips/${tripId}/destinations/${destId}/lock`);
  return res.data;
};

export const deleteDestination = async (tripId: string, destId: string) => {
  const res = await api.delete(`/trips/${tripId}/destinations/${destId}`);
  return res.data;
};

export const fetchAISuggestions = async (tripId: string, params: any) => {
  const res = await api.post(`/trips/${tripId}/destinations/ai-suggest`, params);
  return res.data;
};

// Availability API
export const fetchAvailability = async (tripId: string) => {
  const res = await api.get(`/trips/${tripId}/availability`);
  return res.data;
};

export const addAvailabilityOptions = async (tripId: string, options: any[]) => {
  const res = await api.post(`/trips/${tripId}/availability/options`, { options });
  return res.data;
};

export const voteAvailability = async (tripId: string, voteData: { dateOptionId: string, available: string, name?: string, userId?: string }) => {
  const res = await api.post(`/trips/${tripId}/availability/vote`, voteData);
  return res.data;
};

export const lockAvailabilityDates = async (tripId: string, dates: { startDate: Date, endDate: Date }) => {
  const res = await api.put(`/availability/lock`, dates);
  return res.data;
};

// Itinerary Remix API
export const fetchPublicItineraries = async () => {
  const res = await api.get("/public/itineraries");
  return res.data;
};

export const remixItinerary = async (itineraryId: string) => {
  const res = await api.post(`/itineraries/${itineraryId}/remix`);
  return res.data;
};

export const remixItineraryByTrip = async (tripId: string) => {
  const res = await api.post(`/itineraries/remix/trip/${tripId}`);
  return res.data;
};

export const fetchTripAlerts = async (tripId: string) => {
  const res = await api.get(`/itineraries/trip/${tripId}/alerts`);
  return res.data;
};

export default api;
