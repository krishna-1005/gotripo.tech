import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Stars } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function FeaturedSpotlight() {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-[#FFFDF7] dark:bg-[#0B0B0B] text-slate-800 dark:text-white overflow-hidden relative transition-colors duration-500">
      {/* Glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF6B00]/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F5A623]/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* Left Side: Cinematic Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex-1 relative group w-full"
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(255,107,0,0.1)] border border-slate-200 dark:border-white/5">
              <img
                src="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=1200"
                alt="Varanasi Ganga Aarti"
                className="w-full h-[500px] object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-[#0B0B0B] via-transparent to-transparent opacity-60" />
              
              <div className="absolute top-10 left-10 p-5 backdrop-blur-md bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl">
                 <Stars className="size-6 text-[#FFD700] mb-2" />
                 <div className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FF6B00]">Pure Bliss</div>
              </div>
            </div>
            
            {/* Floating Card */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -right-6 hidden md:block p-8 bg-gradient-to-br from-[#FF6B00] to-[#E32636] rounded-[2rem] shadow-2xl max-w-[280px] border border-white/10"
            >
               <div className="text-white font-black text-4xl mb-2 font-['Cinzel']">4.9/5</div>
               <div className="text-white/80 text-[10px] font-black uppercase tracking-wider">Average Pilgrim Rating for Kashi Yatra</div>
            </motion.div>
          </motion.div>

          {/* Right Side: Editorial Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex-1 w-full"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#FF6B00]/20 border border-[#FF6B00]/30 rounded-full text-[#FFD700] text-[10px] font-black uppercase tracking-[0.4em] mb-8">
              <Stars className="size-4" /> Yatra of the Month
            </div>
            <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tight font-['Cinzel'] leading-tight text-slate-800 dark:text-white">
              Kashi <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FF6B00] to-[#FFD700]">Spiritual</span> <br /> Immersion
            </h2>
            <p className="text-base text-muted-foreground mb-10 leading-relaxed font-medium italic">
              Discover the soul of Bharat in the world's oldest living city. An AI-optimized pilgrimage that weaves together sacred rituals, ancient history, and divine comfort.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {[
                "VIP Vishwanath Darshan",
                "Private Aarti Boat",
                "Sacred Lane Walks",
                "Satvik Culinary Trail"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-[#FF6B00] transition-all duration-300">
                    <CheckCircle2 className="size-5 text-[#FF6B00] dark:text-[#FFD700] group-hover:text-white" />
                  </div>
                  <span className="text-base text-slate-700 dark:text-gray-200 font-bold group-hover:text-[#FF6B00] dark:group-hover:text-[#FFD700] transition-colors">{item}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => navigate('/yatra/plan?name=Kashi (Varanasi) Darshan')}
              className="group px-12 py-5 bg-gradient-to-r from-[#FF6B00] to-[#E32636] hover:brightness-110 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(255,107,0,0.4)] flex items-center justify-center gap-4 active:scale-95 cursor-pointer border-b-4 border-black/20"
            >
              Plan Kashi Yatra <ArrowRight className="size-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
