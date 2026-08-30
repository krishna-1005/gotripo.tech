import { motion } from "framer-motion";
import { Landmark, Calendar, Sparkles } from "lucide-react";

const steps = [
  {
    title: "Choose Your Yatra",
    desc: "Browse our curated list of sacred destinations across Bharat and select your calling.",
    icon: <Landmark className="size-10" />,
  },
  {
    title: "Enter Your Details",
    desc: "Tell us your starting city, travel dates, and companion preferences for the journey.",
    icon: <Calendar className="size-10" />,
  },
  {
    title: "Get AI Itinerary",
    desc: "Receive a personalized, day-by-day divine plan powered by advanced Gemini AI.",
    icon: <Sparkles className="size-10" />,
  },
];

export function HowItWorks() {
  return (
    <section className="py-32 bg-slate-50 dark:bg-[#0B0B0B] relative overflow-hidden transition-colors duration-500">
      
      {/* Background Motifs */}
      <div className="absolute top-0 right-0 p-20 opacity-[0.01] pointer-events-none">
         <Landmark className="size-96 text-[#FF6B00]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <div className="text-[#FFD700] font-black uppercase tracking-[0.3em] text-xs mb-4">The Process</div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white tracking-tight mb-6 font-['Cinzel'] leading-tight">
            Plan Your Yatra in <br className="hidden md:block" /> 3 Simple Steps
          </h2>
          <p className="text-base text-muted-foreground font-medium max-w-xl mx-auto italic">Seamless spiritual planning designed for the modern devotee.</p>
        </div>

        <div className="relative flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
          
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-[90px] left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#FF6B00]/30 to-transparent z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              className="relative z-10 flex-1 flex flex-col items-center text-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 hover:border-amber-500/30 transition-all duration-500 group shadow-soft dark:shadow-lg dark:shadow-black/20"
            >
              {/* Card subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem]" />

              <div className="size-24 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[#FFD700] rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:bg-[#FF6B00] group-hover:text-white group-hover:-translate-y-2 group-hover:rotate-6 transition-all duration-500 relative shrink-0">
                {step.icon}
                <div className="absolute -top-3 -right-3 size-8 bg-[#FF6B00] text-white text-xs font-black rounded-lg flex items-center justify-center shadow-lg border border-white/20">
                  0{i + 1}
                </div>
              </div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-3 tracking-tight font-['Cinzel']">{step.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
