import { motion } from "framer-motion";
import { Star, Quote, Stars } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Kumar",
    city: "Mumbai",
    initials: "RK",
    text: "The AI-planned itinerary for my Char Dham Yatra was flawless. Every detail was taken care of, making it a truly peaceful pilgrimage. Truly world-class experience.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    city: "Delhi",
    initials: "PS",
    text: "I was skeptical about AI planning a spiritual trip, but GoTripo proved me wrong. The Kashi Yatra was the most organized and spiritually fulfilling trip of my life.",
    rating: 5,
  },
  {
    name: "Anand Verma",
    city: "Bangalore",
    initials: "AV",
    text: "Seamless experience from start to finish. The 'Guide Me' mode and personalized spiritual notes were particularly helpful during the temple visits.",
    rating: 4.8,
  },
];

export function Testimonials() {
  return (
    <section className="py-32 bg-[#FFFDF7] dark:bg-[#0A0A0A] relative transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <div className="text-[#FF6B00] font-black uppercase tracking-[0.3em] text-xs mb-4">Testimonials</div>
          <h2 className="text-5xl md:text-6xl font-black text-[#1A1A1A] dark:text-white tracking-tighter mb-6">What Our Pilgrims Say</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">Stories of divine experiences and seamless journeys</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-white dark:bg-[#161616] p-12 rounded-[3rem] shadow-[0_15px_50px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/5 relative group hover:shadow-[0_30px_70px_rgba(255,107,0,0.1)] transition-all duration-500"
            >
              <Quote className="absolute top-10 right-12 size-16 text-[#FF6B00]/5 group-hover:text-[#FF6B00]/10 transition-colors" />
              
              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, j) => (
                  <Star
                    key={j}
                    className={`size-5 ${j < Math.floor(t.rating) ? 'fill-[#F5A623] text-[#F5A623]' : 'text-gray-200 dark:text-gray-700'}`}
                  />
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-10 italic font-medium">"{t.text}"</p>

              <div className="flex items-center gap-5">
                <div className="size-16 bg-gradient-to-br from-[#1A1A1A] to-[#333333] dark:from-[#FF6B00] dark:to-[#F5A623] text-[#F5A623] dark:text-white font-black text-xl rounded-2xl flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
                  {t.initials}
                </div>
                <div>
                  <h4 className="text-xl font-black text-[#1A1A1A] dark:text-white">{t.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">{t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
