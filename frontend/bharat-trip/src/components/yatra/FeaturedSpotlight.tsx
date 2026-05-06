import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Stars } from "lucide-react";

export function FeaturedSpotlight() {
  return (
    <section className="py-32 bg-[#0F0F0F] text-white overflow-hidden relative">
      {/* Glow effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF6B00]/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F5A623]/5 blur-[150px] rounded-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* Left Side: Cinematic Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="flex-1 relative group"
          >
            <div className="relative rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(255,107,0,0.1)] border border-white/5">
              <img
                src="https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&q=80&w=1200"
                alt="Varanasi Ganga Aarti"
                className="w-full h-[600px] object-cover transition-transform duration-[2s] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent opacity-60" />
              
              <div className="absolute top-10 left-10 p-6 backdrop-blur-md bg-white/5 border border-white/10 rounded-3xl">
                 <Stars className="size-8 text-[#F5A623] mb-2" />
                 <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF6B00]">Pure Bliss</div>
              </div>
            </div>
            
            {/* Floating Card */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -right-10 hidden md:block p-8 bg-gradient-to-br from-[#FF6B00] to-[#F5A623] rounded-[2rem] shadow-2xl max-w-[280px]"
            >
               <div className="text-white font-black text-4xl mb-2">4.9/5</div>
               <div className="text-white/80 text-xs font-bold uppercase tracking-widest">Average Pilgrim Rating for Kashi Yatra</div>
            </motion.div>
          </motion.div>

          {/* Right Side: Editorial Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex-1"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2 bg-[#FF6B00]/20 border border-[#FF6B00]/30 rounded-full text-[#F5A623] text-xs font-black uppercase tracking-[0.4em] mb-10">
              <Stars className="size-4" /> Yatra of the Month
            </div>
            <h2 className="text-6xl md:text-8xl font-extrabold mb-10 tracking-tighter leading-[0.9]">
              Kashi <br /> <span className="text-[#F5A623]">Spiritual</span> <br /> Immersion
            </h2>
            <p className="text-xl text-gray-400 mb-12 leading-relaxed font-medium">
              Discover the soul of Bharat in the world's oldest living city. An AI-optimized pilgrimage that weaves together sacred rituals, ancient history, and divine comfort.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {[
                "VIP Vishwanath Darshan",
                "Private Aarti Boat",
                "Sacred Lane Walks",
                "Satvik Culinary Trail"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="size-10 rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center group-hover:bg-[#FF6B00] transition-all duration-300">
                    <CheckCircle2 className="size-5 text-[#FF6B00] group-hover:text-white" />
                  </div>
                  <span className="text-lg text-gray-200 font-bold group-hover:text-[#F5A623] transition-colors">{item}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => document.getElementById('ai-planner')?.scrollIntoView({ behavior: 'smooth' })}
              className="group px-12 py-6 bg-[#FF6B00] hover:bg-[#E66000] text-white rounded-[2rem] font-black text-xl transition-all shadow-[0_20px_40px_rgba(255,107,0,0.3)] flex items-center justify-center gap-4 active:scale-95 cursor-pointer"
            >
              Plan Kashi Yatra <ArrowRight className="size-7 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
