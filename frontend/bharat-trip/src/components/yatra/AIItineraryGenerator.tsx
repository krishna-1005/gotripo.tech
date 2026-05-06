import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MapPin, Calendar, Users, Wallet, Loader2, CheckCircle2, Stars, ArrowRight, Landmark } from "lucide-react";

interface AIItineraryGeneratorProps {
  searchState: {
    yatra: string;
    startingCity: string;
    date: string;
  };
  setSearchState: (state: any) => void;
}

export function AIItineraryGenerator({ searchState, setSearchState }: AIItineraryGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<any | null>(() => {
    const saved = localStorage.getItem("ai_yatra_itinerary");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (itinerary) {
      localStorage.setItem("ai_yatra_itinerary", JSON.stringify(itinerary));
    } else {
      localStorage.removeItem("ai_yatra_itinerary");
    }
  }, [itinerary]);

  const handleGenerate = () => {
    setLoading(true);
    // Simulate AI generation with actual input values
    setTimeout(() => {
      setItinerary({
        yatra: `${searchState.yatra} Spiritual Immersion`,
        days: [
          {
            day: 1,
            title: `Arrival at ${searchState.yatra} & Evening Rituals`,
            activities: [
              `Arrival from ${searchState.startingCity || "your city"}`,
              "Check-in to your spiritual retreat",
              "Visit main temple for evening prayers",
              "Authentic Satvik Dinner Experience"
            ]
          },
          // ... (rest of days)
          {
            day: 2,
            title: "The Sacred Darshan",
            activities: [
              "Early morning private ritual at the temple",
              "VIP Darshan experience",
              "Visit surrounding sacred spots",
              "Spiritual discourse with local elders"
            ]
          },
          {
            day: 3,
            title: "Spiritual Departure",
            activities: [
              "Morning meditation session",
              "Final temple visit for blessings",
              "Departure transfer with divine memories"
            ]
          }
        ]
      });
      setLoading(false);
    }, 4000);
  };

  return (
    <section id="ai-planner" className="py-20 bg-gradient-to-br from-[#FF6B00] via-[#F5A623] to-[#FF6B00] relative overflow-hidden">
      {/* ... */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-black/5 blur-[150px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center text-white mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-xs font-black uppercase tracking-[0.4em] mb-10 shadow-2xl"
          >
            <Sparkles className="size-5 text-[#F5A623]" /> Powered by Gemini AI
          </motion.div>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter leading-tight">
            Manifest Your <br /> Perfect Yatra
          </h2>
          <p className="text-xl text-white/90 font-medium max-w-2xl mx-auto">Get a personalized, day-by-day divine itinerary in seconds.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* Professional Form Card */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="bg-white dark:bg-[#1A1A1A] p-10 md:p-14 rounded-[3.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-white/20"
          >
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.2em] ml-2">Select Yatra</label>
                  <div className="relative group">
                    <Landmark className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                    <select 
                      value={searchState.yatra}
                      onChange={(e) => setSearchState({ ...searchState, yatra: e.target.value })}
                      className="w-full bg-[#FAFAFA] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl py-5 pl-16 pr-6 focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/10 text-[#1A1A1A] dark:text-white font-bold appearance-none cursor-pointer transition-all"
                    >
                      <option className="dark:text-black">Kashi Vishwanath</option>
                      <option className="dark:text-black">Char Dham</option>
                      <option className="dark:text-black">Vaishno Devi</option>
                      <option className="dark:text-black">Jagannath Puri</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.2em] ml-2">Starting City</label>
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                    <input 
                      type="text" 
                      placeholder="e.g. Mumbai" 
                      value={searchState.startingCity}
                      onChange={(e) => setSearchState({ ...searchState, startingCity: e.target.value })}
                      className="w-full bg-[#FAFAFA] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl py-5 pl-16 pr-6 focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/10 text-[#1A1A1A] dark:text-white font-bold transition-all" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.2em] ml-2">Travel Dates</label>
                  <div className="relative group">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                    <input 
                      type="text" 
                      placeholder="Select range" 
                      value={searchState.date}
                      onChange={(e) => setSearchState({ ...searchState, date: e.target.value })}
                      className="w-full bg-[#FAFAFA] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl py-5 pl-16 pr-6 focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/10 text-[#1A1A1A] dark:text-white font-bold transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.2em] ml-2">People</label>
                  <div className="relative group">
                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                    <input type="number" placeholder="2" className="w-full bg-[#FAFAFA] dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl py-5 pl-16 pr-6 focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/10 text-[#1A1A1A] dark:text-white font-bold transition-all" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-[#1A1A1A] dark:text-white uppercase tracking-[0.2em] ml-2">Budget Preference</label>
                <div className="flex gap-4">
                  {['Budget', 'Comfort', 'Elite'].map((b) => (
                    <button key={b} className={`flex-1 py-5 rounded-2xl font-black text-sm border-2 transition-all active:scale-95 ${b === 'Comfort' ? 'bg-[#1A1A1A] dark:bg-white border-[#1A1A1A] dark:border-white text-[#F5A623] dark:text-[#FF6B00] shadow-xl' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:border-[#FF6B00]/30'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-[#FF6B00] hover:bg-[#E66000] text-white rounded-[2rem] font-black text-lg transition-all shadow-[0_20px_40px_rgba(255,107,0,0.3)] flex items-center justify-center gap-4 mt-8 disabled:opacity-70 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-7 animate-spin" /> Manifesting Journey...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-7 text-[#F5A623]" /> Generate AI Itinerary
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Result Canvas */}
          <div className="relative min-h-[600px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center text-center text-white"
                >
                  <div className="relative mb-12">
                    <div className="size-40 border-8 border-white/20 border-t-[#F5A623] rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.span 
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl"
                      >
                        🪔
                      </motion.span>
                    </div>
                  </div>
                  <h3 className="text-3xl font-black mb-4 tracking-tight leading-tight">Consulting with AI...</h3>
                  <p className="text-lg opacity-80 font-medium">Manifesting your divine experience through Gemini AI</p>
                </motion.div>
              ) : itinerary ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-full space-y-8"
                >
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-10 text-white shadow-2xl mb-12">
                     <div className="text-[#F5A623] font-black uppercase tracking-[0.3em] text-[10px] mb-4">Itinerary Manifested</div>
                     <h3 className="text-2xl font-black mb-2">{itinerary.yatra}</h3>
                     <div className="w-16 h-1.5 bg-[#F5A623] rounded-full" />
                  </div>

                  {itinerary.days.map((day: any, i: number) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-8 text-white hover:bg-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-6 mb-6">
                        <div className="size-14 bg-gradient-to-br from-[#FF6B00] to-[#F5A623] rounded-2xl flex items-center justify-center font-black text-xl shadow-xl transform group-hover:rotate-6 transition-transform">
                          {day.day}
                        </div>
                        <h4 className="text-xl font-black tracking-tight leading-tight">{day.title}</h4>
                      </div>
                      <div className="space-y-4 pl-20">
                        {day.activities.map((act: string, j: number) => (
                          <div key={j} className="flex items-start gap-3 text-white/90 font-medium">
                            <CheckCircle2 className="size-5 text-[#F5A623] mt-1 shrink-0" />
                            <span className="text-base leading-relaxed">{act}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}

                  <button className="w-full py-4 border-2 border-white/40 hover:border-white text-white rounded-2xl font-black text-base transition-all flex items-center justify-center gap-3 mt-10 backdrop-blur-md active:scale-95">
                    Download Full Plan <ArrowRight className="size-5" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-white/60"
                >
                  <div className="size-32 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-md border border-white/10">
                    <Sparkles className="size-14 opacity-30 text-[#F5A623]" />
                  </div>
                  <p className="text-xl font-bold tracking-tight">Your personalized itinerary will manifest here</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
