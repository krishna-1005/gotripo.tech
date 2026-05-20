import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, Sparkles } from "lucide-react";
import api from "@/lib/api";
import ladakh from "@/assets/dest-ladakh.jpg";
import varanasi from "@/assets/dest-varanasi.jpg";
import kerala from "@/assets/dest-kerala.jpg";
import hampi from "@/assets/dest-hampi.jpg";
import munnar from "@/assets/dest-munnar.jpg";
import jaipur from "@/assets/dest-jaipur.jpg";

type Slide = {
  img: string;
  region: string;
  heading: string;
  subheading: string;
};

const defaultSlides: Slide[] = [
  { img: ladakh, region: "Ladakh, North India", heading: "Leh Ladakh", subheading: "Where the Himalayas hold the silence of the world." },
  { img: varanasi, region: "Uttar Pradesh", heading: "Varanasi Ghats", subheading: "A thousand lamps drifting on the oldest living river." },
  { img: kerala, region: "Kerala", heading: "Kerala Backwaters", subheading: "Slow houseboats, coconut palms, and emerald lagoons." },
  { img: hampi, region: "Karnataka", heading: "Hampi Ruins", subheading: "Boulders and temples carved by an empire of poets." },
  { img: munnar, region: "Kerala Hills", heading: "Munnar Tea Gardens", subheading: "Misty mornings rolling over endless emerald terraces." },
  { img: jaipur, region: "Rajasthan", heading: "Jaipur Pink City", subheading: "Rose-stone palaces and bazaars that hum at golden hour." },
];

const INTERVAL = 5000;

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(defaultSlides);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get("/admin/config/public");
        const customImages = res.data.homepage_images;
        
        if (Array.isArray(customImages) && customImages.length > 0) {
          const mergedSlides = customImages.map((img, i) => ({
            img,
            region: defaultSlides[i % defaultSlides.length].region,
            heading: defaultSlides[i % defaultSlides.length].heading,
            subheading: defaultSlides[i % defaultSlides.length].subheading
          }));
          setSlides(mergedSlides);
        }
      } catch (err) {
        console.error("Failed to fetch carousel config:", err);
      }
    };
    fetchConfig();
  }, []);

  // High-reliability auto-play interval
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, [slides.length]);

  const next = () => setIndex((prev) => (prev + 1) % slides.length);
  const prev = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const active = slides[index];

  return (
    <section className="relative h-screen w-full overflow-hidden text-white bg-[#020617] group">
      {/* Images — overlapping crossfade */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.img
              src={active.img}
              alt={active.heading}
              className="w-full h-full object-cover brightness-[0.8] contrast-[1.1]"
              initial={{ scale: 1.1 }}
              animate={{ scale: 1.0 }}
              transition={{ duration: INTERVAL / 1000 + 1, ease: "linear" }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gradients — Refined for depth without muddiness */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-64 z-20 bg-gradient-to-b from-black/60 via-transparent to-transparent pointer-events-none" />
      
      <div className="relative z-30 max-w-7xl mx-auto px-6 lg:px-10 h-full flex flex-col justify-end pb-32 md:pb-48">
        <div className="max-w-5xl">
          <motion.div
            key={`meta-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2.5 backdrop-blur-md bg-white/15 border border-white/20 rounded-full px-5 py-2 text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase mb-6 md:mb-10 text-white"
          >
            <MapPin className="size-3.5 text-[#10b981]" /> {active.region}
          </motion.div>

          <motion.h1
            key={`head-${index}`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
            className="font-display font-medium text-4xl sm:text-5xl md:text-8xl lg:text-[8rem] leading-[1.1] md:leading-[0.9] tracking-tighter text-white mb-6"
          >
            {active.heading}
          </motion.h1>

          <motion.p
            key={`desc-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8 }}
            className="mt-4 text-base md:text-xl text-white/90 max-w-2xl font-medium leading-relaxed"
          >
            {active.subheading}
          </motion.p>

          <div className="mt-10 md:mt-14 flex flex-col sm:flex-row flex-wrap gap-4 md:gap-5">
            <Link
              to="/explore-india"
              className="group/btn inline-flex items-center justify-center gap-3 h-12 md:h-14 px-8 md:px-10 rounded-full backdrop-blur-xl bg-black/40 hover:bg-black/60 border border-white/10 font-bold text-white transition-all shadow-xl text-sm md:text-base"
            >
              Explore Now <ArrowRight className="size-4 md:size-5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/trip-type"
              className="inline-flex items-center justify-center gap-3 h-12 md:h-14 px-8 md:px-10 rounded-full bg-[#10b981] text-white font-bold text-sm md:text-lg shadow-[0_10px_20px_-5px_rgba(16,185,129,0.3)] hover:bg-[#0da673] transition-all"
            >
              Plan My Trip
            </Link>
            <button
              onClick={() => {
                const btn = document.querySelector('button[aria-label="Toggle chatbot"]') as HTMLButtonElement;
                if (btn) btn.click();
              }}
              className="inline-flex items-center justify-center gap-3 h-12 md:h-14 px-8 md:px-10 rounded-full backdrop-blur-xl bg-[#059669]/40 hover:bg-[#059669]/60 border border-white/10 font-bold transition-all text-white shadow-xl text-sm md:text-base"
            >
              Ask AI Co-pilot <Sparkles className="size-4 md:size-5" />
            </button>
          </div>
        </div>

        {/* Progress Timer Indicators - Repositioned for justify-end layout */}
        <div className="absolute bottom-12 md:bottom-20 left-6 lg:left-10 right-6 lg:right-auto flex items-center gap-3 md:gap-4 w-[calc(100%-48px)] md:w-full max-w-2xl">
          {slides.map((_, i) => {
            const isActive = i === index;
            return (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className="relative flex-1 h-1 md:h-1.5 rounded-full bg-white/20 overflow-hidden transition-all hover:bg-white/30"
                aria-label={`Go to slide ${i + 1}`}
              >
                {/* Active Progress Fill */}
                {isActive && (
                  <motion.div
                    key={`fill-${index}`}
                    className="absolute inset-0 bg-[#10b981] origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ 
                      duration: INTERVAL / 1000, 
                      ease: "linear" 
                    }}
                  />
                )}
                {/* Completed Bars */}
                {i < index && (
                  <div className="absolute inset-0 bg-white/40" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav */}
      <div className="hidden md:flex absolute bottom-24 right-12 z-40 gap-4">
        <button
          onClick={prev}
          className="size-14 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all text-white shadow-xl"
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          onClick={next}
          className="size-14 rounded-full backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all text-white shadow-xl"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>
    </section>
  );
}
