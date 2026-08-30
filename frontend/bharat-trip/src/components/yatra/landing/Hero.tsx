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
    <section className="relative h-[95vh] min-h-[700px] w-full overflow-hidden flex items-center justify-center text-white bg-[#0B0B0B]">
      
      {/* Background Image with Dark Overlays */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070"
          alt="Ganga Aarti"
          className="w-full h-full object-cover scale-105 animate-kenburns opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-[#FFFDF7] dark:to-[#0B0B0B] transition-colors duration-500" />
      </div>

      {/* Rotating Mandala Background Motif */}
      <div className="absolute right-[-10%] top-[-10%] opacity-5 w-[800px] h-[800px] pointer-events-none select-none z-0">
        <motion.svg
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          viewBox="0 0 100 100"
          className="w-full h-full text-[#FFD700]"
        >
          <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" />
          <path d="M50 5 L50 95 M5 50 L95 50 M18 18 L82 82 M82 18 L18 82" stroke="currentColor" strokeWidth="0.25" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.3" />
          <polygon points="50,15 62,38 85,50 62,62 50,85 38,62 15,50 38,38" fill="none" stroke="currentColor" strokeWidth="0.3" />
        </motion.svg>
      </div>

      {/* Floating Diya particles */}
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
          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight font-['Cinzel'] tracking-tight">
            Begin Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FF6B00] to-[#FFD700] drop-shadow-[0_4px_20px_rgba(255,107,0,0.4)]">
              Sacred Journey
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto font-medium leading-relaxed italic">
            Plan your Yatra with AI — Haridwar, Kashi, Char Dham & more. Curated itineraries for the modern pilgrim.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <button 
              onClick={handleGenerateClick}
              className="px-12 py-5 bg-gradient-to-r from-[#FF6B00] to-[#E32636] hover:brightness-110 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(255,107,0,0.4)] flex items-center justify-center gap-3 active:scale-95 cursor-pointer border-b-4 border-black/20 animate-pulse"
            >
              Plan My Yatra <ArrowRight className="size-5" />
            </button>
            <button 
              onClick={() => scrollToSection('popular-yatras')}
              className="px-12 py-5 border-2 border-white/20 hover:border-white text-white rounded-2xl font-black text-sm uppercase tracking-widest backdrop-blur-md transition-all flex items-center justify-center gap-3 hover:bg-white/5 active:scale-95 cursor-pointer"
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
          <div className="bg-white/80 dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 p-6 md:p-8 rounded-[3rem] md:rounded-[4rem] shadow-[0_30px_100px_rgba(255,107,0,0.15)] flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative group">
                <Landmark className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                <select 
                  value={searchState.yatra}
                  onChange={(e) => setSearchState({ ...searchState, yatra: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4.5 pl-14 pr-6 text-slate-800 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00] appearance-none cursor-pointer transition-all shadow-inner text-sm"
                >
                  <option className="text-black">Kashi (Varanasi) Darshan</option>
                  <option className="text-black">Char Dham Yatra</option>
                  <option className="text-black">Vaishno Devi Katra</option>
                  <option className="text-black">Haridwar & Rishikesh</option>
                  <option className="text-black">Tirupati Balaji</option>
                  <option className="text-black">Shirdi Sai Baba</option>
                </select>
              </div>
              <div className="relative group">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                <input
                  type="text"
                  placeholder="Starting City"
                  value={searchState.startingCity}
                  onChange={(e) => setSearchState({ ...searchState, startingCity: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4.5 pl-14 pr-6 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-gray-400 font-bold focus:outline-none focus:border-[#FF6B00] transition-all text-sm"
                />
              </div>
              <div className="relative group">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-[#FF6B00] group-hover:scale-110 transition-transform" />
                <input
                  type="date"
                  value={searchState.date}
                  onChange={(e) => setSearchState({ ...searchState, date: e.target.value })}
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-4.5 pl-14 pr-6 text-slate-800 dark:text-white font-bold focus:outline-none focus:border-[#FF6B00] [color-scheme:light] dark:[color-scheme:dark] transition-all cursor-pointer text-sm"
                />
              </div>
            </div>
            <button 
              onClick={handleGenerateClick}
              className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-[#FF6B00] to-[#E32636] hover:brightness-110 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(255,107,0,0.3)] flex items-center justify-center gap-3 whitespace-nowrap active:scale-95 cursor-pointer border-b-4 border-black/20"
            >
              <Sparkles className="size-5" /> Generate Plan
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
