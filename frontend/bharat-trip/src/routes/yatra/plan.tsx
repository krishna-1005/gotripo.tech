import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { Sparkles, Loader2, Calendar, MapPin, Users, Wallet, CheckCircle2, Utensils, Home, ArrowLeft, Send, Compass, Info, ChevronRight, ArrowRight, Landmark, Stars, Bell, Flame, Clock, Plane, ShoppingBag, Package, ShieldCheck, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const fallbackYatras = [
  {
    _id: "seed-hri",
    name: "Haridwar & Rishikesh",
    description: "Experience the evening Ganga Aarti and the spiritual vibe of the Himalayan foothills.",
    location: "Uttarakhand",
    duration: "4 Days",
    bestTimeToVisit: "February to June, August to October",
    highlights: ["Ganga Aarti at Har Ki Pauri", "Laxman Jhula", "Beatles Ashram", "Yoga & Meditation"],
    imageUrl: "https://images.unsplash.com/photo-1590050752117-23a9d7fc2140?auto=format&fit=crop&q=80&w=800",
    category: "pilgrimage",
    transportCosts: {
      train: { minCost: 800, maxCost: 1500, duration: "5-7 hrs" },
      flight: { minCost: 3500, maxCost: 6000, duration: "1.5 hrs" },
      bus: { minCost: 500, maxCost: 900, duration: "6-8 hrs" }
    }
  },
  {
    _id: "seed-kashi",
    name: "Kashi (Varanasi) Darshan",
    description: "Visit the oldest living city in the world and the sacred Kashi Vishwanath Temple.",
    location: "Uttar Pradesh",
    duration: "3 Days",
    bestTimeToVisit: "October to March",
    highlights: ["Kashi Vishwanath Temple", "Dashashwamedh Ghat Aarti", "Sarnath", "Boat ride on Ganges"],
    imageUrl: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=800",
    category: "pilgrimage",
    transportCosts: {
      train: { minCost: 1200, maxCost: 2500, duration: "12-14 hrs" },
      flight: { minCost: 4500, maxCost: 8000, duration: "1.5 hrs" },
      bus: { minCost: 800, maxCost: 1200, duration: "14-16 hrs" }
    }
  },
  {
    _id: "seed-chardham",
    name: "Char Dham Yatra",
    description: "The ultimate pilgrimage covering Yamunotri, Gangotri, Kedarnath, and Badrinath.",
    location: "Uttarakhand",
    duration: "12 Days",
    bestTimeToVisit: "May to June, September to October",
    highlights: ["Kedarnath Temple", "Badrinath Temple", "Yamunotri", "Gangotri"],
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=800",
    category: "pilgrimage",
    transportCosts: {
      train: { minCost: 1500, maxCost: 3000, duration: "12 hrs (to Haridwar)" },
      flight: { minCost: 5000, maxCost: 9000, duration: "1.5 hrs (to Dehradun)" },
      bus: { minCost: 1000, maxCost: 1800, duration: "14 hrs (to Haridwar)" }
    }
  },
  {
    _id: "seed-vaishno",
    name: "Vaishno Devi Katra",
    description: "A divine journey to the holy cave of Mata Vaishno Devi in the Trikuta Mountains.",
    location: "Jammu & Kashmir",
    duration: "3 Days",
    bestTimeToVisit: "March to October",
    highlights: ["Bhawan Darshan", "Bhairon Nath Temple", "Ardh Kuwari Cave", "Trek from Katra"],
    imageUrl: "https://images.unsplash.com/photo-1622144360341-2a6c6ec663da?auto=format&fit=crop&q=80&w=800",
    category: "pilgrimage",
    transportCosts: {
      train: { minCost: 1000, maxCost: 2200, duration: "12-15 hrs" },
      flight: { minCost: 4000, maxCost: 7500, duration: "1.5 hrs" },
      bus: { minCost: 900, maxCost: 1400, duration: "14-16 hrs" }
    }
  },
  {
    _id: "seed-tirupati",
    name: "Tirupati Balaji",
    description: "Visit the richest temple in the world and seek blessings of Lord Venkateswara.",
    location: "Andhra Pradesh",
    duration: "2 Days",
    bestTimeToVisit: "September to March",
    highlights: ["Venkateswara Temple", "Padmavathi Temple", "Akasa Ganga", "Silathoranam"],
    imageUrl: "https://images.unsplash.com/photo-1610448721566-473ce9da81c3?auto=format&fit=crop&q=80&w=800",
    category: "pilgrimage",
    transportCosts: {
      train: { minCost: 1500, maxCost: 3500, duration: "24-30 hrs" },
      flight: { minCost: 5500, maxCost: 10000, duration: "2.5 hrs" },
      bus: { minCost: 1200, maxCost: 2000, duration: "12-15 hrs" }
    }
  },
  {
    _id: "seed-shirdi",
    name: "Shirdi Sai Baba",
    description: "A pilgrimage to the home of the revered saint Sai Baba.",
    location: "Maharashtra",
    duration: "2 Days",
    bestTimeToVisit: "June to March",
    highlights: ["Sai Baba Samadhi Mandir", "Dwarkamai", "Chavadi", "Shani Shingnapur"],
    imageUrl: "https://images.unsplash.com/photo-1616493923308-466f913d07e6?auto=format&fit=crop&q=80&w=800",
    category: "pilgrimage",
    transportCosts: {
      train: { minCost: 1100, maxCost: 2400, duration: "18-22 hrs" },
      flight: { minCost: 4500, maxCost: 8500, duration: "2.5 hrs" },
      bus: { minCost: 1000, maxCost: 1600, duration: "12-14 hrs" }
    }
  }
];

export default function YatraPlannerPage() {
  const [searchParams] = useSearchParams();
  const [yatras, setYatras] = useState<any[]>(fallbackYatras);
  const [loadingYatras, setLoadingYatras] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Initialize state from localStorage if available
  const [itinerary, setItinerary] = useState<any>(() => {
    const saved = localStorage.getItem("yatra_itinerary");
    const nameParam = searchParams.get("name");
    if (saved) {
      const parsed = JSON.parse(saved);
      // If a specific name is requested in URL, and it doesn't match the saved itinerary, ignore it
      if (nameParam && parsed.yatraName !== nameParam) {
        return null;
      }
      return parsed;
    }
    return null;
  });

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("yatra_plan_formData");
    const nameParam = searchParams.get("name");
    
    if (saved) {
      const parsed = JSON.parse(saved);
      if (nameParam) {
        parsed.yatraName = nameParam;
      }
      return parsed;
    }
    
    return {
      yatraName: nameParam || "",
      startingCity: "",
      travelDates: "",
      numberOfPeople: "2",
      budget: "comfort"
    };
  });

  const [transportMode, setTransportMode] = useState<"train" | "flight" | "bus" | "">("");
  const [totalBudget, setTotalBudget] = useState(15000);
  const [selectedYatra, setSelectedYatra] = useState<any>(null);

  // Helper to get distance-adjusted costs
  const getAdjustedCosts = (yatra: any, mode: string) => {
    if (!yatra || !yatra.transportCosts || !yatra.transportCosts[mode]) {
      // Improved Fallback with variety
      const fallbacks: any = {
        train: { minCost: 1200, maxCost: 2200, duration: "14 hrs" },
        flight: { minCost: 4500, maxCost: 7500, duration: "2 hrs" },
        bus: { minCost: 800, maxCost: 1400, duration: "16 hrs" }
      };
      return fallbacks[mode];
    }

    const base = yatra.transportCosts[mode];
    const city = formData.startingCity.toLowerCase();
    const loc = yatra.location.toLowerCase();
    
    let multiplier = 1.0;

    // Simulate distance from major hubs
    if (city.includes("mumbai") || city.includes("bengaluru") || city.includes("chennai") || city.includes("pune")) {
      if (loc.includes("uttarakhand") || loc.includes("kashmir") || loc.includes("himachal")) multiplier = 1.8;
      if (loc.includes("uttar pradesh")) multiplier = 1.5;
    } else if (city.includes("delhi") || city.includes("gurgaon") || city.includes("noida")) {
      if (loc.includes("uttarakhand")) multiplier = 0.7; // Very close
      if (loc.includes("jammu")) multiplier = 0.9;
      if (loc.includes("andhra") || loc.includes("karnataka")) multiplier = 2.0;
    } else if (city.includes("kolkata") || city.includes("patna")) {
      if (loc.includes("uttar pradesh")) multiplier = 0.8;
      if (loc.includes("maharashtra") || loc.includes("karnataka")) multiplier = 1.6;
    }

    return {
      minCost: Math.round(base.minCost * multiplier),
      maxCost: Math.round(base.maxCost * multiplier),
      duration: multiplier > 1.5 ? "~" + (parseInt(base.duration) + 8) + " hrs" : base.duration
    };
  };

  // Fetch selected Yatra details when yatraName changes
  useEffect(() => {
    if (formData.yatraName && yatras.length > 0) {
      const yatra = yatras.find(y => y.name === formData.yatraName);
      setSelectedYatra(yatra || null);
      
      // Default total budget calculation if yatra and transport selected
      if (yatra && transportMode) {
        const costs = getAdjustedCosts(yatra, transportMode);
        const baseBudget = (costs.minCost * parseInt(formData.numberOfPeople)) + 5000;
        setTotalBudget(baseBudget);
      }
    }
  }, [formData.yatraName, yatras, transportMode, formData.numberOfPeople, formData.startingCity]);

  // Force scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Sync yatraName and clear itinerary if nameParam changes to something else
  useEffect(() => {
    const nameParam = searchParams.get("name");
    if (nameParam) {
      if (nameParam !== formData.yatraName) {
        setFormData(prev => ({ ...prev, yatraName: nameParam }));
      }
      // If the URL has a name and it doesn't match the currently showing itinerary, clear the itinerary
      if (itinerary && itinerary.yatraName !== nameParam) {
        setItinerary(null);
      }
    }
  }, [searchParams, formData.yatraName, itinerary]);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("yatra_plan_formData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (itinerary) {
      localStorage.setItem("yatra_itinerary", JSON.stringify(itinerary));
    } else {
      localStorage.removeItem("yatra_itinerary");
    }
  }, [itinerary]);

  // State for tracking completed activities
  const [completedActivities, setCompletedActivities] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("yatra_completed_activities");
    return saved ? JSON.parse(saved) : {};
  });

  // Persist completed activities
  useEffect(() => {
    localStorage.setItem("yatra_completed_activities", JSON.stringify(completedActivities));
  }, [completedActivities]);

  const toggleActivity = (dayIndex: number, activityIndex: number) => {
    const key = `${itinerary?.yatraName || "default"}-day${dayIndex}-act${activityIndex}`;
    setCompletedActivities(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    
    if (!completedActivities[key]) {
      toast.success("Progress marked on your sacred path!", {
        icon: <Sparkles className="size-5 text-[#FFD700]" />,
        style: {
          background: "#1A1A1A",
          color: "#FFD700",
          border: "1px solid #FF6B00"
        }
      });
    }
  };

  useEffect(() => {
    // Apply Poppins and global styles for the Yatra theme
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Cinzel:wght@400;700;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    document.body.style.fontFamily = "'Poppins', sans-serif";
    
    const fetchYatras = async () => {
      try {
        setLoadingYatras(true);
        const res = await api.get("/yatra");
        if (res.data && res.data.length > 0) {
          setYatras(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingYatras(false);
      }
    };
    fetchYatras();

    return () => {
      document.body.style.fontFamily = "";
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.yatraName || !formData.startingCity || !formData.travelDates) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!transportMode) {
      toast.error("Please select a mode of transport");
      return;
    }

    setGenerating(true);
    setItinerary(null);
    try {
      const res = await api.post("/yatra/generate-itinerary", {
        ...formData,
        transportMode,
        totalBudget
      });
      setItinerary(res.data);
      toast.success("Divine itinerary manifested!");
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.error || "Failed to manifest itinerary.";
      toast.error(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppShell>
      <div className="font-['Poppins'] min-h-screen bg-[#FFFDF7] dark:bg-[#0F0F0F] selection:bg-[#FF6B00] selection:text-white transition-colors duration-500 pb-24 overflow-hidden relative">
        
        {/* Sacred Background Mandala Pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="mandala" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="1" />
                <path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M78 22 L22 78" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mandala)" />
          </svg>
        </div>

        {/* Divine Header with North Indian Temple Aesthetic */}
        <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070"
              alt="Kashi Vishwanath Temple Aesthetic"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#FFFDF7] dark:to-[#0F0F0F]" />
          </div>

          {/* Floating Diya-like Particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 100 }}
                animate={{ 
                  opacity: [0, 0.7, 0], 
                  y: -200,
                  x: Math.sin(i) * 150
                }}
                transition={{ 
                  duration: 10 + Math.random() * 8, 
                  repeat: Infinity,
                  delay: Math.random() * 5,
                  ease: "linear"
                }}
                className="absolute bottom-0 w-2.5 h-2.5 bg-[#FFD700] rounded-full blur-[3px] shadow-[0_0_15px_#FF6B00]"
                style={{ left: `${Math.random() * 100}%` }}
              />
            ))}
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <Link to="/yatra" className="inline-flex items-center gap-3 text-[#FFD700] hover:text-[#FF6B00] mb-8 transition-all font-bold text-sm uppercase tracking-[0.4em] bg-black/30 backdrop-blur-md px-6 py-2 rounded-full border border-[#FFD700]/30">
                <Bell className="size-4 animate-ring" /> Back to Temple Hub
              </Link>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter leading-tight font-['Cinzel']">
                Divine <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FF6B00] to-[#FFD700] drop-shadow-[0_5px_15px_rgba(255,107,0,0.5)]">Sankalpa</span>
              </h1>
              <p className="text-white/90 text-xl md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed italic drop-shadow-md">
                "Initiate your sacred pilgrimage to the North. Let the divine light guide your path."
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 -mt-32 relative z-20">
          <div className="flex flex-col gap-12 items-start">
            
            {/* Spiritual Configurator Form - Collapsible when itinerary exists */}
            <AnimatePresence>
              {(!itinerary || generating) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full max-w-4xl mx-auto bg-white dark:bg-[#1A1A1A] p-10 md:p-14 rounded-[3rem] shadow-[0_30px_100px_rgba(255,107,0,0.15)] border-t-8 border-[#FF6B00] relative overflow-hidden mb-12"
                >
                  {/* Corner Mandala Decor */}
                  <div className="absolute -top-10 -right-10 size-40 text-[#FF6B00]/10 pointer-events-none">
                    <Landmark className="size-full" />
                  </div>

                  <div className="flex items-center gap-5 mb-12">
                    <div className="size-16 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00] shadow-inner">
                       <Flame className="size-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-[#1A1A1A] dark:text-white tracking-tight font-['Cinzel']">Viniyoga</h3>
                      <p className="text-xs font-bold text-[#FF6B00] uppercase tracking-[0.3em]">The Intent of Journey</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-xs font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                          <div className="size-1.5 bg-[#FF6B00] rounded-full" /> Sacred Destination
                        </label>
                        <div className="relative group">
                          <Landmark className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                          <select 
                            value={formData.yatraName}
                            onChange={(e) => setFormData({...formData, yatraName: e.target.value})}
                            className="w-full bg-[#FAFAFA] dark:bg-white/5 border-2 border-gray-50 dark:border-white/10 rounded-3xl py-5 pl-16 pr-6 focus:outline-none focus:border-[#FF6B00] text-[#1A1A1A] dark:text-white font-bold appearance-none cursor-pointer transition-all shadow-sm"
                            required
                          >
                            <option value="">Select Sacred Path</option>
                            {yatras.map(y => (
                              <option key={y._id} value={y.name} className="text-black">{y.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                          <div className="size-1.5 bg-[#FF6B00] rounded-full" /> Starting Point
                        </label>
                        <div className="relative group">
                          <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                          <input 
                            type="text" 
                            placeholder="e.g. New Delhi"
                            value={formData.startingCity}
                            onChange={(e) => setFormData({...formData, startingCity: e.target.value})}
                            className="w-full bg-[#FAFAFA] dark:bg-white/5 border-2 border-gray-50 dark:border-white/10 rounded-3xl py-5 pl-16 pr-6 focus:outline-none focus:border-[#FF6B00] text-[#1A1A1A] dark:text-white font-bold transition-all shadow-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-4">
                        <label className="text-xs font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                          <div className="size-1.5 bg-[#FF6B00] rounded-full" /> Auspicious Dates
                        </label>
                        <div className="relative group">
                          <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                          <input 
                            type="date" 
                            value={formData.travelDates}
                            onChange={(e) => setFormData({...formData, travelDates: e.target.value})}
                            className="w-full bg-[#FAFAFA] dark:bg-white/5 border-2 border-gray-50 dark:border-white/10 rounded-3xl py-5 pl-16 pr-6 focus:outline-none focus:border-[#FF6B00] text-[#1A1A1A] dark:text-white font-bold transition-all shadow-sm [color-scheme:dark]"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                          <div className="size-1.5 bg-[#FF6B00] rounded-full" /> pilgrims
                        </label>
                        <div className="relative group">
                          <Users className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                          <input 
                            type="number" 
                            min="1"
                            value={formData.numberOfPeople}
                            onChange={(e) => setFormData({...formData, numberOfPeople: e.target.value})}
                            className="w-full bg-[#FAFAFA] dark:bg-white/5 border-2 border-gray-50 dark:border-white/10 rounded-3xl py-5 pl-16 pr-6 focus:outline-none focus:border-[#FF6B00] text-[#1A1A1A] dark:text-white font-bold transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                          <div className="size-1.5 bg-[#FF6B00] rounded-full" /> Accommodation
                        </label>
                        <div className="relative group">
                          <Wallet className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                          <select 
                            value={formData.budget}
                            onChange={(e) => setFormData({...formData, budget: e.target.value})}
                            className="w-full bg-[#FAFAFA] dark:bg-white/5 border-2 border-gray-50 dark:border-white/10 rounded-3xl py-5 pl-16 pr-6 focus:outline-none focus:border-[#FF6B00] text-[#1A1A1A] dark:text-white font-bold appearance-none cursor-pointer transition-all shadow-sm"
                          >
                            <option value="budget" className="text-black">Standard (Dharamshala)</option>
                            <option value="comfort" className="text-black">Premium (Hotels)</option>
                            <option value="luxury" className="text-black">Elite (Divine Suites)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* Transport Selector */}
                      <div className="md:col-span-3 space-y-6">
                        <label className="text-xs font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                          <div className="size-1.5 bg-[#FF6B00] rounded-full" /> Mode of Transport
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {[
                            { id: "train", name: "Train", tag: "Most Popular", comfort: "Moderate" },
                            { id: "flight", name: "Flight", tag: "Fastest", comfort: "Premium" },
                            { id: "bus", name: "Bus", tag: "Budget Friendly", comfort: "Basic" },
                          ].map((t) => {
                            const isSelected = transportMode === t.id;
                            const costs = getAdjustedCosts(selectedYatra, t.id);
                            
                            return (
                              <motion.div
                                key={t.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setTransportMode(t.id as any)}
                                className={`cursor-pointer rounded-3xl p-8 border-2 transition-all relative overflow-hidden flex flex-col items-center text-center gap-4 ${
                                  isSelected 
                                    ? "bg-[#1A1A1A] border-[#FF6B00] shadow-[0_0_30px_rgba(255,107,0,0.3)] ring-4 ring-[#FF6B00]/20" 
                                    : "bg-[#1A1A1A] border-white/5 opacity-60 hover:opacity-100"
                                }`}
                              >
                                {isSelected && (
                                  <motion.div 
                                    layoutId="active-transport"
                                    className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/10 to-transparent pointer-events-none" 
                                  />
                                )}
                                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#FF6B00] text-white text-[8px] font-black uppercase tracking-widest">
                                  {t.tag}
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-xl font-black text-white">{t.name}</h4>
                                  <p className="text-[#F5A623] font-bold text-sm">₹{costs.minCost.toLocaleString()} - ₹{costs.maxCost.toLocaleString()} <span className="text-[10px] opacity-70">/ person</span></p>
                                </div>
                                <div className="flex flex-col gap-2 w-full mt-2">
                                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                                    <span>Duration</span>
                                    <span className="text-white">{costs.duration}</span>
                                  </div>
                                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-white/40">
                                    <span>Comfort</span>
                                    <span className="text-[#FF6B00]">{t.comfort}</span>
                                  </div>
                                </div>
                                <button className={`mt-4 w-full py-3 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all ${
                                  isSelected ? "bg-[#FF6B00] text-white" : "bg-white/10 text-white"
                                }`}>
                                  {isSelected ? "Selected" : "Select"}
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Budget Estimator */}
                      {transportMode && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="md:col-span-3 space-y-6 mt-6"
                        >
                          <label className="text-xs font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.3em] ml-2 flex items-center gap-2">
                            <div className="size-1.5 bg-[#FF6B00] rounded-full" /> Budget Summary
                          </label>
                          <div className="bg-[#1A1A1A] rounded-[2.5rem] p-8 md:p-12 border-2 border-white/5 shadow-2xl">
                            <div className="grid md:grid-cols-2 gap-12 items-center">
                              <div className="space-y-6">
                                <div className="flex justify-between items-center text-white/60 font-bold text-sm">
                                  <span className="flex items-center gap-3"><Plane className="size-4" /> Transport Cost</span>
                                  <span className="text-white">₹{(getAdjustedCosts(selectedYatra, transportMode).minCost * parseInt(formData.numberOfPeople)).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-white/60 font-bold text-sm">
                                  <span className="flex items-center gap-3"><Home className="size-4" /> Estimated Stay</span>
                                  <span className="text-white">₹{formData.budget === 'luxury' ? 8000 : formData.budget === 'comfort' ? 4000 : 1500}</span>
                                </div>
                                <div className="flex justify-between items-center text-white/60 font-bold text-sm">
                                  <span className="flex items-center gap-3"><Utensils className="size-4" /> Food & Prasad</span>
                                  <span className="text-white">₹{1000 * parseInt(formData.numberOfPeople)}</span>
                                </div>
                                <div className="flex justify-between items-center text-white/60 font-bold text-sm">
                                  <span className="flex items-center gap-3"><Stars className="size-4" /> Darshan & Activities</span>
                                  <span className="text-white">₹{500 * parseInt(formData.numberOfPeople)}</span>
                                </div>
                                <div className="flex justify-between items-center text-white/60 font-bold text-sm">
                                  <span className="flex items-center gap-3"><Info className="size-4" /> Miscellaneous</span>
                                  <span className="text-white">₹500</span>
                                </div>
                                <div className="h-px bg-white/10 my-6" />
                                <div className="flex justify-between items-center">
                                  <span className="text-xl font-black text-white font-['Cinzel']">Total Budget</span>
                                  <span className="text-3xl font-black text-[#FF6B00]">₹{totalBudget.toLocaleString()}</span>
                                </div>
                              </div>

                              <div className="space-y-8 bg-white/5 p-8 rounded-3xl border border-white/5">
                                <div className="space-y-4">
                                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-white/60">
                                    <span>Adjust Your Budget</span>
                                    <span className="text-[#FFD700]">₹{totalBudget.toLocaleString()}</span>
                                  </div>
                                  <input 
                                    type="range"
                                    min="5000"
                                    max="100000"
                                    step="1000"
                                    value={totalBudget}
                                    onChange={(e) => setTotalBudget(parseInt(e.target.value))}
                                    className="w-full accent-[#FF6B00]"
                                  />
                                </div>

                                {totalBudget < (getAdjustedCosts(selectedYatra, transportMode).minCost * parseInt(formData.numberOfPeople) + 3000) ? (
                                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3">
                                    <Info className="size-4 shrink-0" /> Recommended minimum is ₹{(getAdjustedCosts(selectedYatra, transportMode).minCost * parseInt(formData.numberOfPeople) + 3000).toLocaleString()}
                                  </div>
                                ) : (
                                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-3">
                                    <CheckCircle2 className="size-4 shrink-0" /> Your budget looks good!
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    <button 
                      type="submit"
                      disabled={generating}
                      className="w-full py-6 bg-gradient-to-r from-[#FF6B00] to-[#E32636] text-white rounded-[2rem] font-black text-xl transition-all shadow-[0_20px_50px_rgba(255,107,0,0.4)] flex items-center justify-center gap-4 mt-8 disabled:opacity-70 active:scale-95 border-b-4 border-black/20"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="size-7 animate-spin" />
                          Manifesting Journey...
                        </>
                      ) : (
                        <>
                          Invoke Divine Itinerary <Bell className="size-6" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results Canvas */}
            <div className="w-full">
              <AnimatePresence mode="wait">
                {generating ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="h-full flex flex-col items-center justify-center text-center p-12 gap-10"
                  >
                    <div className="relative">
                       <div className="size-48 border-[12px] border-secondary border-t-[#FF6B00] rounded-full animate-spin shadow-[0_0_30px_rgba(255,107,0,0.2)]" />
                       <div className="absolute inset-0 flex items-center justify-center">
                          <motion.div 
                            animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-[#FF6B00] drop-shadow-[0_0_20px_rgba(255,107,0,0.6)]"
                          >
                            <Flame className="size-20 fill-[#FFD700]" />
                          </motion.div>
                       </div>
                    </div>
                    <div className="space-y-6 text-[#1A1A1A] dark:text-white">
                      <h3 className="text-3xl font-black tracking-tight font-['Cinzel']">Chanting Rituals...</h3>
                      <p className="text-lg font-medium opacity-80 max-w-sm mx-auto leading-relaxed italic">
                        "Your path is being purified by divine intelligence."
                      </p>
                    </div>
                  </motion.div>
                ) : itinerary ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                  >
                    {/* Header Controls */}
                    <div className="flex justify-end mb-8">
                       <button 
                         onClick={() => setItinerary(null)}
                         className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FF6B00] font-black text-sm uppercase tracking-widest hover:bg-[#FF6B00] hover:text-white transition-all shadow-lg"
                       >
                          <Compass className="size-4" /> Modify Sankalpa
                       </button>
                    </div>

                    {/* Results Overview */}
                    <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] p-12 md:p-20 rounded-[4rem] shadow-2xl relative overflow-hidden group border-2 border-[#FFD700]/20">
                      <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                         <Landmark className="size-64 text-[#FFD700]" />
                      </div>
                      <div className="relative z-10">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#FF6B00]/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-[#FF6B00]/40 text-[#FFD700]">
                          Divine Path Manifested
                        </div>
                        <h2 className="text-4xl font-black mb-6 tracking-tighter text-white font-['Cinzel']">{itinerary.yatraName}</h2>
                        <p className="text-xl font-medium leading-relaxed italic border-l-4 border-[#FF6B00] pl-10 text-gray-300">
                          "{itinerary.summary}"
                        </p>
                      </div>
                    </div>

                    {/* Timeline Results */}
                    <div className="space-y-16">
                      {itinerary.itinerary.map((day: any, i: number) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.15 }}
                          className="bg-white dark:bg-[#121212] rounded-[4rem] shadow-[0_40px_120px_rgba(0,0,0,0.1)] overflow-hidden border border-[#FF6B00]/10 hover:border-[#FF6B00]/30 transition-all duration-700 group relative"
                        >
                          {/* Corner Decorative Element */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/5 rounded-bl-[4rem] pointer-events-none" />

                          {/* Day Header - Highly Visible */}
                          <div className="relative bg-[#1A1A1A] px-12 py-10 text-white border-b border-[#FF6B00]/20">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                              <div>
                                <div className="flex items-center gap-4 mb-4">
                                  <span className="text-[#FF6B00] font-black uppercase tracking-[0.5em] text-xs font-['Cinzel']">Sacred Day</span>
                                  <div className="h-px w-12 bg-[#FF6B00]/50" />
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#FF6B00] font-['Cinzel'] leading-none">
                                    0{day.day}
                                  </div>
                                  <h3 className="text-2xl md:text-3xl font-black tracking-tighter leading-tight max-w-xl">
                                    {day.title}
                                  </h3>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                <div className="px-5 py-2.5 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/30 text-[#FFD700] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                  <Clock className="size-4" /> Full Day Plan
                                </div>
                                <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/70 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                  <MapPin className="size-4" /> {itinerary.yatraName}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-8 md:p-14 lg:p-20">
                            <div className="flex flex-col gap-20">
                              
                              {/* Top Section: The Spiritual Path (Full Width) */}
                              <div className="w-full">
                                <h4 className="text-sm font-black uppercase tracking-[0.5em] text-[#FF6B00] mb-12 flex items-center gap-4">
                                  <Flame className="size-6" /> The Sacred Timeline
                                </h4>
                                
                                <div className="space-y-14 relative pl-4 md:pl-8">
                                  {/* Refined Timeline Line */}
                                  <div className="absolute left-[27px] md:left-[43px] top-4 bottom-4 w-[4px] bg-gradient-to-b from-[#FF6B00] via-[#FF6B00]/10 to-transparent rounded-full" />
                                  
                                  {day.activities.map((act: string, j: number) => {
                                    const isTravel = act.toLowerCase().match(/flight|train|drive|arrival|departure|travel|bus/);
                                    const isTemple = act.toLowerCase().match(/temple|darshan|aarti|visit|ritual|prayer|meditation/);
                                    const isStay = act.toLowerCase().match(/check-in|hotel|rest|stay|nivas/);
                                    const activityKey = `${itinerary?.yatraName || "default"}-day${i}-act${j}`;
                                    const isCompleted = completedActivities[activityKey];
                                    
                                    return (
                                      <motion.div 
                                        key={j} 
                                        onClick={() => toggleActivity(i, j)}
                                        whileHover={{ x: 10 }}
                                        whileActive={{ scale: 0.98 }}
                                        className={`flex gap-4 sm:gap-10 md:gap-14 relative group/item cursor-pointer select-none transition-all duration-500 ${isCompleted ? "opacity-40 grayscale-[0.5]" : ""}`}
                                      >
                                        <div className={`size-14 md:size-16 rounded-[1.5rem] flex items-center justify-center shrink-0 z-10 shadow-xl border-2 transition-all group-hover/item:scale-110 relative ${
                                          isTravel ? "bg-blue-600 border-blue-400 text-white" :
                                          isTemple ? "bg-[#FF6B00] border-[#FFD700] text-white" :
                                          isStay ? "bg-emerald-600 border-emerald-400 text-white" :
                                          "bg-white dark:bg-[#2A2A2A] border-[#FF6B00] text-[#FF6B00]"
                                        }`}>
                                          <AnimatePresence mode="wait">
                                            {isCompleted ? (
                                              <motion.div
                                                key="check"
                                                initial={{ scale: 0, rotate: -45 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 45 }}
                                                className="absolute inset-0 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center text-white z-20"
                                              >
                                                <CheckCircle2 className="size-8" />
                                              </motion.div>
                                            ) : (
                                              <motion.div
                                                key="icon"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                              >
                                                {isTravel ? <Plane className="size-7 md:size-8" /> :
                                                 isTemple ? <Landmark className="size-7 md:size-8" /> :
                                                 isStay ? <Home className="size-7 md:size-8" /> :
                                                 <Sparkles className="size-6 md:size-7" />}
                                              </motion.div>
                                            )}
                                          </AnimatePresence>
                                        </div>
                                        <div className="pt-3">
                                          <p className={`text-lg md:text-xl text-[#1A1A1A] dark:text-white font-black leading-tight tracking-tight transition-all duration-500 ${isCompleted ? "line-through decoration-[#FF6B00] decoration-4" : ""}`}>
                                            {act}
                                          </p>
                                        </div>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                              </div>
                              
                              {/* Bottom Section: Divine Insight & Logistics - Full Width Stack */}
                              <div className="flex flex-col gap-14 pt-12 border-t border-gray-100 dark:border-white/5">
                                
                                {/* Divine Insight - Sacred Scroll Style - Full Width */}
                                <div className="w-full bg-[#FFD700]/5 dark:bg-[#FFD700]/5 p-12 md:p-16 rounded-[4rem] border-2 border-dashed border-[#FFD700]/30 relative group/insight overflow-hidden">
                                   <Stars className="absolute top-12 right-12 size-12 text-[#FFD700] opacity-20 animate-pulse" />
                                   <div className="flex items-center gap-4 mb-10">
                                      <div className="h-px w-12 bg-[#FFD700]" />
                                      <span className="text-xs font-black text-[#FFD700] uppercase tracking-[0.4em]">Divine Wisdom</span>
                                   </div>
                                   <p className="text-xl md:text-3xl font-bold italic leading-relaxed text-[#1A1A1A] dark:text-white font-['Cinzel']">
                                     "{day.spiritualSignificance}"
                                   </p>
                                   <div className="mt-12 text-xs font-black text-[#FFD700]/60 uppercase tracking-[0.3em] text-right">— Ancient Lore —</div>
                                   <Bell className="absolute -bottom-10 -left-10 size-48 text-[#FFD700]/5 -rotate-12 group-hover/insight:rotate-0 transition-transform duration-1000" />
                                </div>

                                {/* Logistic Summaries - Large Horizontal Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                  <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-8 p-6 md:p-10 rounded-[2rem] sm:rounded-[3rem] bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/10 shadow-2xl group/log hover:border-[#FF6B00]/30 transition-all w-full">
                                     <div className="size-14 sm:size-20 rounded-[1.25rem] sm:rounded-[2rem] bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00] group-hover/log:rotate-12 transition-transform shadow-inner shrink-0">
                                        <Home className="size-7 sm:size-10" />
                                     </div>
                                     <div className="min-w-0 flex-1">
                                        <div className="text-[10px] sm:text-[11px] font-black uppercase text-[#FF6B00] tracking-[0.3em] mb-1 sm:mb-2">Sacred Nivas (Stay)</div>
                                        <div className="text-lg sm:text-xl font-black dark:text-white truncate" title={day.accommodation}>{day.accommodation}</div>
                                     </div>
                                  </div>

                                  <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-8 p-6 md:p-10 rounded-[2rem] sm:rounded-[3rem] bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-white/10 shadow-2xl group/log hover:border-[#FF6B00]/30 transition-all w-full">
                                     <div className="size-14 sm:size-20 rounded-[1.25rem] sm:rounded-[2rem] bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00] group-hover/log:rotate-12 transition-transform shadow-inner shrink-0">
                                        <Utensils className="size-7 sm:size-10" />
                                     </div>
                                     <div className="min-w-0 flex-1">
                                        <div className="text-[10px] sm:text-[11px] font-black uppercase text-[#FF6B00] tracking-[0.3em] mb-1 sm:mb-2">Divine Bhojan (Food)</div>
                                        <div className="text-lg sm:text-xl font-black dark:text-white truncate" title={day.food}>{day.food}</div>
                                     </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Bottom Border Accent */}
                          <div className="h-2 w-full bg-gradient-to-r from-[#FF6B00] to-[#FFD700]" />
                        </motion.div>
                      ))}
                    </div>

                    {/* Packing List & Preparation - Addressing User Request */}
                    {itinerary.packingList && (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-[#1A1A1A] rounded-[4rem] p-12 md:p-16 shadow-2xl border-2 border-[#FF6B00]/20 overflow-hidden relative"
                      >
                         <div className="absolute top-0 right-0 p-12 opacity-5">
                            <Package className="size-48 text-[#FF6B00]" />
                         </div>
                         
                         <div className="relative z-10">
                            <div className="flex items-center gap-5 mb-10">
                              <div className="size-14 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
                                 <ShoppingBag className="size-8" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-black font-['Cinzel'] text-[#1A1A1A] dark:text-white tracking-tight">Sacred Checklist</h3>
                                <p className="text-xs font-bold text-[#FF6B00] uppercase tracking-[0.3em]">Essential Items for {itinerary.yatraName}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                               {itinerary.packingList.map((item: any, idx: number) => (
                                 <div key={idx} className="flex flex-col gap-4 p-6 rounded-3xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-[#FF6B00]/30 transition-all group">
                                    <div className="flex gap-4">
                                       <div className="size-10 rounded-xl bg-white dark:bg-[#2A2A2A] shadow-sm flex items-center justify-center text-[#FF6B00] shrink-0 group-hover:scale-110 transition-transform">
                                          <CheckCircle2 className="size-5" />
                                       </div>
                                       <div>
                                          <div className="font-black text-lg text-[#1A1A1A] dark:text-white leading-tight mb-1">{item.item}</div>
                                          <div className="text-sm font-medium text-[#1A1A1A]/50 dark:text-white/40 leading-relaxed italic">"{item.reason}"</div>
                                       </div>
                                    </div>
                                    <div className="mt-auto pt-4 flex justify-end">
                                       <Link 
                                         to={`/yatra/shop?q=${encodeURIComponent(item.item)}`}
                                         className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#FF6B00] hover:text-[#FFD700] transition-colors bg-[#FF6B00]/5 px-3 py-1.5 rounded-lg border border-[#FF6B00]/10"
                                       >
                                          <ShoppingCart className="size-3" /> Shop Item
                                       </Link>
                                    </div>
                                 </div>
                               ))}
                            </div>

                            <div className="mt-16 p-10 rounded-[3rem] bg-gradient-to-r from-[#FF6B00] to-[#E32636] flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_20px_50px_rgba(255,107,0,0.3)] border-t-4 border-white/20">
                               <div className="text-center md:text-left">
                                  <h4 className="text-2xl font-black text-white mb-2 font-['Cinzel']">Missing Essentials?</h4>
                                  <p className="text-white/80 font-medium max-w-lg">Order your custom Divine Kit {selectedYatra ? `for ${selectedYatra.name}` : ""} including puja items, sacred cloths, and travel necessities.</p>
                               </div>
                               <Link 
                                 to={selectedYatra ? `/yatra/${selectedYatra._id}/kit` : "/yatra"}
                                 className="px-10 py-5 bg-white text-[#FF6B00] rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-xl flex items-center gap-3 active:scale-95 group/btn"
                               >
                                  {selectedYatra ? "Order Divine Kit" : "Browse Divine Kits"} <ShoppingBag className="size-5 group-hover/btn:scale-110 transition-transform" />
                               </Link>
                            </div>
                         </div>
                      </motion.div>
                    )}

                    <div className="flex justify-center pt-10">
                       <button className="px-16 py-8 bg-gradient-to-r from-[#1A1A1A] to-[#0A0A0A] text-white rounded-[2.5rem] font-black text-xl shadow-2xl hover:shadow-[#FF6B00]/40 transition-all duration-500 flex items-center gap-6 active:scale-95 border-2 border-[#FFD700]/30 font-['Cinzel'] group">
                         Download Divine Plan <ArrowRight className="size-8 group-hover:translate-x-2 transition-transform" />
                       </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-48 text-center px-12 bg-white dark:bg-[#1A1A1A] rounded-[4rem] border-4 border-dashed border-[#FF6B00]/20 transition-all hover:border-[#FF6B00]/40 group">
                    <motion.div 
                      animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      className="size-40 rounded-full bg-[#FF6B00]/5 flex items-center justify-center mb-12 shadow-inner relative"
                    >
                       <Landmark className="size-20 text-[#FF6B00] opacity-30" />
                       <div className="absolute inset-0 border-2 border-[#FF6B00]/20 rounded-full animate-ping" />
                    </motion.div>
                    <h3 className="text-3xl font-black text-[#1A1A1A] dark:text-white mb-8 tracking-tight font-['Cinzel']">Initiate Your Sankalpa</h3>
                    <p className="text-[#1A1A1A]/70 dark:text-white/70 text-lg font-medium max-w-md mx-auto leading-relaxed italic">
                      "Fill the sacred form to manifest your personalized spiritual itinerary through divine AI."
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        
        {/* Bottom Decorative Element */}
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FF6B00] to-transparent opacity-50" />
      </div>
    </AppShell>
  );
}
