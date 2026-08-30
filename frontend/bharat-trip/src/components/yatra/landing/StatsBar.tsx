import { Landmark, Plane, Star, Users } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Sacred Sites", value: "50+", icon: Landmark },
  { label: "Yatras Planned", value: "10,000+", icon: Plane },
  { label: "Traveler Rating", value: "4.9/5", icon: Star },
  { label: "Trusted Pilgrims", value: "5000+", icon: Users },
];

export function StatsBar() {
  return (
    <section className="bg-slate-100 dark:bg-[#0F0F0F] py-16 md:py-24 border-y border-slate-200 dark:border-white/5 relative overflow-hidden transition-colors duration-500">
      {/* Subtle Texture/Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-[#FF6B00]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-[#F5A623]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative p-8 rounded-[2rem] bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-amber-500/30 transition-all duration-500 flex flex-col items-center text-center group overflow-hidden shadow-soft dark:shadow-lg dark:shadow-black/20"
            >
              {/* Inner subtle glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <span className="mb-6 size-16 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[#FFD700] group-hover:bg-[#FF6B00] group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-inner shrink-0">
                <stat.icon className="size-7" />
              </span>
              <div className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight font-['Cinzel']">
                {stat.value}
              </div>
              <div className="text-[#FFD700] text-[10px] font-black uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
