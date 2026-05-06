import { motion } from "framer-motion";

const stats = [
  { label: "Sacred Sites", value: "50+", icon: "🛕" },
  { label: "Yatras Planned", value: "10,000+", icon: "✈️" },
  { label: "Traveler Rating", value: "4.9/5", icon: "⭐" },
  { label: "Trusted Pilgrims", value: "5000+", icon: "🙏" },
];

export function StatsBar() {
  return (
    <section className="bg-[#0F0F0F] py-16 md:py-24 border-y border-white/5 relative overflow-hidden">
      {/* Subtle Texture/Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-[#FF6B00]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-[#F5A623]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-0">
          {stats.map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center md:border-r last:border-0 border-white/10 px-6 group"
            >
              <span className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500">{stat.icon}</span>
              <div className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter">
                {stat.value}
              </div>
              <div className="text-[#F5A623] text-xs font-bold uppercase tracking-[0.3em] opacity-80">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
