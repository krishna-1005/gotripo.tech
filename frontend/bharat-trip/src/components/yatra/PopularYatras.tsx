import { motion } from "framer-motion";
import { MapPin, Clock, Star, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const yatras = [
  // ... (yatras array unchanged)
  {
    id: 1,
    name: "Char Dham Yatra",
    location: "Uttarakhand",
    duration: "12 Days",
    difficulty: "Challenging",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80&w=1000",
    color: "📍 Uttarakhand"
  },
  {
    id: 2,
    name: "Kashi Vishwanath",
    location: "Uttar Pradesh",
    duration: "3 Days",
    difficulty: "Easy",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=1000",
    color: "📍 Uttar Pradesh"
  },
  {
    id: 3,
    name: "Vaishno Devi",
    location: "Jammu & Kashmir",
    duration: "4 Days",
    difficulty: "Moderate",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1590483736622-39da8af75620?auto=format&fit=crop&q=80&w=1000",
    color: "📍 Jammu & Kashmir"
  },
];

export function PopularYatras() {
  const navigate = useNavigate();
  
  const handlePlanClick = (name?: string) => {
    const params = new URLSearchParams();
    if (name) params.set("name", name);
    navigate(`/yatra/plan?${params.toString()}`);
  };

  return (
    <section id="popular-yatras" className="py-20 bg-[#FFFDF7] dark:bg-[#0A0A0A] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="text-[#FF6B00] font-black uppercase tracking-[0.3em] text-xs mb-4">Top Rated Destinations</div>
            <h2 className="text-4xl md:text-5xl font-black text-[#1A1A1A] dark:text-white tracking-tighter">Popular Yatras</h2>
            <div className="w-24 h-2 bg-gradient-to-r from-[#FF6B00] to-[#F5A623] rounded-full mt-6" />
          </div>
          <button 
            onClick={() => handlePlanClick()}
            className="group px-8 py-4 bg-white dark:bg-white/5 border-2 border-[#1A1A1A] dark:border-white/20 text-[#1A1A1A] dark:text-white rounded-full font-black flex items-center gap-3 hover:bg-[#1A1A1A] dark:hover:bg-white hover:text-white dark:hover:text-black transition-all duration-300 active:scale-95 cursor-pointer"
          >
            View All Journeys <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {yatras.map((yatra, i) => (
            <YatraCard key={yatra.id} yatra={yatra} index={i} onPlan={() => handlePlanClick(yatra.name)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function YatraCard({ yatra, index, onPlan }: { yatra: any; index: number; onPlan: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group relative bg-white dark:bg-[#161616] rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.04)] dark:shadow-none border border-transparent dark:border-white/5 hover:shadow-[0_20px_60px_rgba(255,107,0,0.15)] transition-all duration-500"
    >
      <div className="relative h-[400px] overflow-hidden">
        <img
          src={yatra.image}
          alt={yatra.name}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        <div className="absolute top-6 left-6">
          <div className="bg-[#FF6B00] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
            {yatra.duration}
          </div>
        </div>

        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5A623] uppercase tracking-widest mb-3">
            <MapPin className="size-4" /> {yatra.location}
          </div>
          <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-[#F5A623] transition-colors">{yatra.name}</h3>
          
          <div className="flex items-center gap-4 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
             <div className="flex items-center gap-1 text-[#F5A623]">
                <Star className="size-4 fill-[#F5A623]" />
                <span className="text-sm font-black">{yatra.rating}</span>
             </div>
             <div className={`text-[10px] font-black px-3 py-1 rounded-md uppercase tracking-widest ${
                yatra.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                yatra.difficulty === 'Moderate' ? 'bg-blue-500/20 text-blue-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {yatra.difficulty}
             </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <button 
          onClick={onPlan}
          className="w-full py-4 bg-[#1A1A1A] hover:bg-[#FF6B00] text-white rounded-2xl font-black text-base transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
        >
          Plan This Yatra <ArrowRight className="size-6" />
        </button>
      </div>
    </motion.div>
  );
}
