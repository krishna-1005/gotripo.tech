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
    <section className="py-32 bg-[#FFFDF7] dark:bg-[#0A0A0A] relative overflow-hidden transition-colors duration-500">
      {/* Background Motifs */}
      <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
         <Landmark className="size-96 text-[#FF6B00]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <div className="text-[#FF6B00] font-black uppercase tracking-[0.3em] text-xs mb-4">The Process</div>
          <h2 className="text-5xl md:text-6xl font-black text-[#1A1A1A] dark:text-white tracking-tighter mb-6">
            Plan Your Yatra in <br className="hidden md:block" /> 3 Simple Steps
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium max-w-2xl mx-auto">Seamless spiritual planning designed for the modern devotee.</p>
        </div>

        <div className="relative flex flex-col md:flex-row justify-between gap-16 md:gap-8">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-[60px] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#FF6B00]/20 to-transparent z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              className="relative z-10 flex-1 flex flex-col items-center text-center group"
            >
              <div className="size-28 bg-white dark:bg-[#1A1A1A] border-4 border-[#FF6B00] text-[#FF6B00] rounded-full flex items-center justify-center mb-10 shadow-[0_20px_50px_rgba(255,107,0,0.15)] group-hover:bg-[#FF6B00] group-hover:text-white transition-all duration-500 transform group-hover:-translate-y-2">
                {step.icon}
                <div className="absolute -top-3 -right-3 size-10 bg-[#1A1A1A] dark:bg-white text-[#F5A623] dark:text-[#FF6B00] text-lg font-black rounded-full flex items-center justify-center shadow-lg">
                  {i + 1}
                </div>
              </div>
              <h3 className="text-2xl font-black text-[#1A1A1A] dark:text-white mb-4 tracking-tight">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
