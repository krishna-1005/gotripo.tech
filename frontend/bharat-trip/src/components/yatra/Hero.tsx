import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Sparkles, ArrowRight, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  searchState: {
    yatra: string;
    startingCity: string;
    date: string;
  };
  setSearchState: (state: any) => void;
}

export function Hero({ searchState, setSearchState }: HeroProps) {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGenerateClick = () => {
    const params = new URLSearchParams();
    if (searchState.yatra) params.set("name", searchState.yatra);
    // Add other params if needed by the planner page
    navigate(`/yatra/plan?${params.toString()}`);
  };

  return (
    <section className="relative h-[95vh] min-h-[700px] w-full overflow-hidden flex items-center justify-center text-white">
      {/* ... (background and particles unchanged) */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070"
          alt="Ganga Aarti"
          className="w-full h-full object-cover scale-105 animate-kenburns"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-[#0F0F0F]" />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{ 
              opacity: [0, 0.6, 0], 
              y: -150,
              x: Math.sin(i) * 100
            }}
            transition={{ 
              duration: 8 + Math.random() * 7, 
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
            className="absolute bottom-0 w-2 h-2 bg-[#F5A623] rounded-full blur-[2px] shadow-[0_0_10px_#FF6B00]"
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#FF6B00]/20 border border-[#FF6B00]/30 text-[#F5A623] text-xs font-bold uppercase tracking-[0.3em] mb-8 backdrop-blur-md">
            The Ultimate Spiritual Experience
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-8 leading-[0.9]">
            Begin Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] via-[#F5A623] to-[#FF6B00]">Sacred Journey</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Plan your Yatra with AI — Haridwar, Kashi, Char Dham & more. Curated itineraries for the modern pilgrim.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <button 
              onClick={handleGenerateClick}
              className="px-12 py-4 bg-[#FF6B00] hover:bg-[#E66000] text-white rounded-full font-black text-base transition-all shadow-[0_0_30px_rgba(255,107,0,0.4)] flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
            >
              Plan My Yatra <ArrowRight className="size-6" />
            </button>
            <button 
              onClick={() => scrollToSection('popular-yatras')}
              className="px-12 py-4 border-2 border-white/40 hover:border-white text-white rounded-full font-black text-base backdrop-blur-md transition-all flex items-center justify-center gap-3 hover:bg-white/5 active:scale-95 cursor-pointer"
            >
              Explore Yatras
            </button>
          </div>
        </motion.div>

        {/* Floating Glass Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl flex flex-col md:flex-row items-center gap-5">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="relative group">
                <Landmark className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#F5A623] group-hover:scale-110 transition-transform" />
                <select 
                  value={searchState.yatra}
                  onChange={(e) => setSearchState({ ...searchState, yatra: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-[2rem] py-4 pl-14 pr-6 text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B00] appearance-none cursor-pointer transition-all"
                >
                  <option className="text-black">Char Dham</option>
                  <option className="text-black">Kashi Vishwanath</option>
                  <option className="text-black">Vaishno Devi Darshan</option>
                  <option className="text-black">Jagannath Puri</option>
                </select>
              </div>
              <div className="relative group">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#F5A623] group-hover:scale-110 transition-transform" />
                <input
                  type="text"
                  placeholder="Starting City"
                  value={searchState.startingCity}
                  onChange={(e) => setSearchState({ ...searchState, startingCity: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-[2rem] py-4 pl-14 pr-6 text-white placeholder:text-gray-400 font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B00] transition-all"
                />
              </div>
              <div className="relative group">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#F5A623] group-hover:scale-110 transition-transform" />
                <input
                  type="date"
                  value={searchState.date}
                  onChange={(e) => setSearchState({ ...searchState, date: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-[2rem] py-4 pl-14 pr-6 text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#FF6B00] [color-scheme:dark] transition-all cursor-pointer"
                />
              </div>
            </div>
            <button 
              onClick={handleGenerateClick}
              className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-[#FF6B00] to-[#F5A623] hover:brightness-110 text-white rounded-[2rem] font-black text-lg transition-all shadow-xl flex items-center justify-center gap-3 whitespace-nowrap active:scale-95 cursor-pointer"
            >
              <Sparkles className="size-6" /> Generate Plan
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
