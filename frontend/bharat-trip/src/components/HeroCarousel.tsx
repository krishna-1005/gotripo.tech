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
    <section className="relative h-screen w-full overflow-hidden text-white bg-black group">
      {/* Images — overlapping crossfade */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <motion.img
              src={active.img}
              alt={active.heading}
              className="w-full h-full object-cover"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: INTERVAL / 1000 + 2, ease: "linear" }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Gradients */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 top-0 h-40 z-20 bg-top-dark pointer-events-none" />
      <div className="absolute inset-0 z-20 bg-black/10 pointer-events-none" />
      <div className="relative z-30 max-w-7xl mx-auto px-6 lg:px-10 h-full flex flex-col justify-end pb-24 md:pb-32">
        <div className="max-w-4xl">
          <motion.div
            key={`meta-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 backdrop-blur-md bg-white/10 border border-white/20 rounded-full px-4 py-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-6"
          >
            <MapPin className="size-3.5 text-accent" /> {active.region}
          </motion.div>

          <motion.h1
            key={`head-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-5xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight"
          >
            {active.heading}
          </motion.h1>

          <motion.p
            key={`desc-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base md:text-xl text-white/80 max-w-2xl font-medium leading-relaxed"
          >
            {active.subheading}
          </motion.p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/explore"
              className="group/btn inline-flex items-center gap-2 h-14 px-8 rounded-2xl backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold transition-all"
            >
              Explore Now <ArrowRight className="size-5 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/trip-type"
              className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl bg-warm-gradient font-bold shadow-cta"
            >
              Plan My Trip
            </Link>
            <button
              onClick={() => {
                // Find the chatbot toggle button and click it
                const btn = document.querySelector('button[aria-label="Toggle chatbot"]') as HTMLButtonElement;
                if (btn) btn.click();
              }}
              className="inline-flex items-center gap-2 h-14 px-8 rounded-2xl backdrop-blur-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 font-bold transition-all text-emerald-400"
            >
              Ask AI Co-pilot <Sparkles className="size-5" />
            </button>
          </div>
        </div>

        {/* Progress Timer Indicators */}
        <div className="mt-16 flex items-center gap-3 w-full max-w-2xl">
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
                    className="absolute inset-0 bg-accent origin-left"
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
                  <div className="absolute inset-0 bg-white/60" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav */}
      <div className="hidden md:flex absolute bottom-32 right-10 z-40 gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={prev}
          className="size-14 rounded-2xl backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all"
        >
          <ChevronLeft className="size-6" />
        </button>
        <button
          onClick={next}
          className="size-14 rounded-2xl backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all"
        >
          <ChevronRight className="size-6" />
        </button>
      </div>
    </section>
  );
}
