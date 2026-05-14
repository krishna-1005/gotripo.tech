import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MarketingNav } from "@/components/MarketingNav";
import { HeroCarousel } from "@/components/HeroCarousel";
import { VideoSection } from "@/components/VideoSection";
import { ReviewSection } from "@/components/ReviewSection";
import { Footer } from "@/components/Footer";
import { FadeUp, StaggerGroup, StaggerItem, HoverLift, dur, ease } from "@/components/motion/primitives";
import {
  Sparkles, Users, Wallet, Star, ArrowRight, Plane, X, MapPin, Clock, Calendar, CheckCircle2, Bookmark, Loader2,
  Mountain, Palmtree, Landmark, Building, Wind, Building2, Castle, Sun, Music, Trees, Coffee, Waves, CloudSun
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import heroImg from "@/assets/hero-jaipur.jpg";
import goa from "@/assets/dest-goa.jpg";
import jaipur from "@/assets/dest-jaipur.jpg";
import rishikesh from "@/assets/dest-rishikesh.jpg";
import kerala from "@/assets/dest-kerala.jpg";
import { getNextThreeMonths } from "@/lib/utils";
import { toast } from "sonner";
import { fetchVibeSuggestions } from "@/lib/api";

const VibeIcon = ({ name, className }: { name: string, className?: string }) => {
  const icons: Record<string, any> = {
    mountain: Mountain,
    mountains: Mountain,
    palmtree: Palmtree,
    beach: Palmtree,
    landmark: Landmark,
    building: Building,
    wind: Wind,
    city: Building2,
    urban: Building2,
    castle: Castle,
    fort: Castle,
    sun: Sun,
    music: Music,
    party: Music,
    trees: Trees,
    forest: Trees,
    coffee: Coffee,
    waves: Waves,
    "cloud-sun": CloudSun,
    compass: Sparkles,
    map: MapPin
  };
  const Icon = icons[name?.toLowerCase()] || Sparkles;
  return <Icon className={className} />;
};

const destinations = [
  { 
    name: "Jaipur", 
    img: jaipur, 
    tag: "Heritage", 
    days: 4,
    info: "Explore the pink city's majestic forts and vibrant palaces.",
    details: "Jaipur, the 'Pink City', is a treasure trove of heritage. Visit the iconic Hawa Mahal, the sprawling Amer Fort, and the opulent City Palace. Experience authentic Rajasthani culture through its bustling bazaars, traditional crafts, and royal cuisine that tells stories of a bygone era.",
    gradient: "bg-gradient-to-br from-orange-500 to-rose-600"
  },
  { 
    name: "Goa", 
    img: goa, 
    tag: "Beaches", 
    days: 4,
    info: "Relax on sun-kissed beaches and enjoy vibrant nightlife.",
    details: "Goa offers a perfect blend of relaxation and adventure. Beyond its world-famous beaches like Baga and Palolem, explore Portuguese-style churches in Old Goa, spice plantations, and hidden waterfalls. The unique 'Susegad' lifestyle ensures you leave completely refreshed and energized.",
    gradient: "bg-gradient-to-br from-blue-500 to-emerald-600"
  },
  { 
    name: "Rishikesh", 
    img: rishikesh, 
    tag: "Spiritual", 
    days: 4,
    info: "Find peace by the Ganges and experience the yoga capital.",
    details: "Nestled in the Himalayan foothills, Rishikesh is the spiritual heart of India. From the evening Ganga Aarti at Triveni Ghat to adrenaline-pumping white water rafting, it offers a dual experience of tranquility and thrill. It's the ultimate destination for yoga practitioners and nature seekers alike.",
    gradient: "bg-gradient-to-br from-indigo-500 to-purple-600"
  },
  { 
    name: "Kerala Backwaters", 
    img: kerala, 
    tag: "Nature", 
    days: 4,
    info: "Cruise through serene emerald waters on houseboats.",
    details: "Kerala's backwaters in Alleppey and Kumarakom offer an ethereal escape. Stay in traditional houseboats as you glide past coconut groves, paddy fields, and local villages. It's an intimate way to experience 'God's Own Country', accompanied by authentic Ayurvedic treatments and Malabari seafood.",
    gradient: "bg-gradient-to-br from-teal-500 to-cyan-700"
  },
];

const voices = [
  { name: "Ananya R.", role: "Solo traveller, Bengaluru", quote: "I planned a 7-day Himachal trip in 4 minutes. The AI even nailed the rest day after the trek." },
  { name: "Kabir & Maya", role: "Honeymoon, Kerala", quote: "Stunning suggestions, perfect pacing. It felt like a friend who actually lives in Munnar wrote it." },
  { name: "The Mehta family", role: "Group of 6, Rajasthan", quote: "Group polling saved our marriage. Probably." },
];

const personas = [
  { 
    name: "The Lone Wolf", 
    icon: "wind", 
    desc: "Seeking untamed paths and raw solitude.",
    condition: (v: any) => v.adventure > 70 && v.social < 30 
  },
  { 
    name: "The Adrenaline Junkie", 
    icon: "zap", 
    desc: "Life is a party, and the world is your playground.",
    condition: (v: any) => v.adventure > 70 && v.social > 70 
  },
  { 
    name: "The Zen Seeker", 
    icon: "sun", 
    desc: "Peace is not a destination, it's a way of travel.",
    condition: (v: any) => v.adventure < 30 && v.social < 30 
  },
  { 
    name: "The Social Butterfly", 
    icon: "music", 
    desc: "Here for the people, the stories, and the vibes.",
    condition: (v: any) => v.adventure < 40 && v.social > 70 
  },
  { 
    name: "The Urbanite", 
    icon: "building", 
    desc: "Skyscrapers, craft coffee, and neon lights.",
    condition: (v: any) => v.modern > 70 && v.adventure < 40 
  },
  { 
    name: "The Heritage Hunter", 
    icon: "castle", 
    desc: "Lost in the whispers of ancient ruins.",
    condition: (v: any) => v.modern < 30 && v.adventure < 50 
  },
  { 
    name: "The Balanced Explorer", 
    icon: "compass", 
    desc: "Appreciating every flavor the world offers.",
    condition: () => true 
  }
];

const getPersona = (vibe: any) => {
  return personas.find(p => p.condition(vibe)) || personas[personas.length - 1];
};

const getMatchScore = (user: any, dest: any) => {
  if (dest.adventure === undefined) return Math.floor(Math.random() * 10) + 89;
  const diff = (Math.abs(user.adventure - dest.adventure) + 
                Math.abs(user.modern - dest.modern) + 
                Math.abs(user.social - dest.social)) / 3;
  return Math.max(70, Math.floor(100 - diff));
};

const getVibeGradient = (v: any) => {
  const colors = [];
  if (v.adventure > 50) colors.push("rgba(249, 115, 22, 0.12)");
  else colors.push("rgba(14, 165, 233, 0.12)");
  
  if (v.modern > 50) colors.push("rgba(168, 85, 247, 0.12)");
  else colors.push("rgba(161, 98, 7, 0.12)");
  
  if (v.social > 50) colors.push("rgba(236, 72, 153, 0.12)");
  else colors.push("rgba(71, 85, 105, 0.12)");
  
  return `radial-gradient(circle at center, ${colors.join(", ")})`;
};

function MoodSearch() {
  const [vibe, setVibe] = useState({
    adventure: 50,
    modern: 50,
    social: 50,
  });
  const [recommended, setRecommended] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const persona = getPersona(vibe);

  const updateSuggestions = useCallback(async (currentVibe: any) => {
    setIsLoading(true);
    try {
      const suggestions = await fetchVibeSuggestions(currentVibe);
      if (suggestions && suggestions.length > 0) {
        setRecommended(suggestions);
        setActiveIndex(0); // Reset to first item when vibe changes
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateSuggestions(vibe);
    }, 800);
    return () => clearTimeout(timer);
  }, [vibe, updateSuggestions]);

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-10 py-24 border-t border-border">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="text-sm font-semibold text-accent uppercase tracking-widest">Vibe-Based Discovery</div>
            <div className="h-px flex-1 bg-border" />
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={persona.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-8 inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-accent/5 border border-accent/20"
            >
              <VibeIcon name={persona.icon} className="size-6 text-accent" />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-accent">Your Persona</div>
                <div className="text-sm font-bold">{persona.name}</div>
              </div>
            </motion.div>
          </AnimatePresence>

          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-6">
            How do you want to feel?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 text-balance">
            {persona.desc} Let our AI suggest the perfect destination for your soul.
          </p>

          <div className="space-y-10">
            <MoodSlider 
              label={["Peace", "Adventure"]} 
              value={vibe.adventure} 
              onChange={(v) => setVibe({...vibe, adventure: v})} 
            />
            <MoodSlider 
              label={["Ancient", "Modern"]} 
              value={vibe.modern} 
              onChange={(v) => setVibe({...vibe, modern: v})} 
            />
            <MoodSlider 
              label={["Solitude", "Social"]} 
              value={vibe.social} 
              onChange={(v) => setVibe({...vibe, social: v})} 
            />
          </div>
        </div>

        <motion.div 
          animate={{ background: getVibeGradient(vibe) }}
          className="bg-card rounded-[40px] p-8 md:p-12 border border-border shadow-pop relative overflow-hidden min-h-[550px] flex flex-col transition-colors duration-1000 select-none"
        >
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Sparkles className="size-32 text-accent" />
          </div>
          
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">AI Personalized Suggestions</h3>
            {recommended.length > 0 && (
              <div className="text-[11px] font-bold text-accent px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 shadow-sm">
                {recommended.length} Matches Found
              </div>
            )}
          </div>
          
          <div className="space-y-6 flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-card/50 backdrop-blur-[2px] flex items-center justify-center">
                <Loader2 className="size-8 text-accent animate-spin" />
              </div>
            )}
            
            <AnimatePresence mode="wait">
              {recommended.length > 0 ? (
                <motion.div
                  key={recommended[0]?.name || "loading"}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col space-y-4 md:space-y-6"
                >
                  {recommended.map((item, index) => {
                    const score = getMatchScore(vibe, item);
                    const isActive = activeIndex === index;
                    return (
                      <div
                        key={item.name}
                        onClick={() => setActiveIndex(index)}
                        className={`flex items-start gap-4 md:gap-6 p-4 md:p-6 rounded-[28px] md:rounded-[32px] bg-card/40 backdrop-blur-sm border transition-all cursor-pointer relative overflow-hidden group w-full ${
                          isActive ? "border-accent ring-1 ring-accent/20 bg-accent/5 shadow-xl" : "border-border/50 hover:bg-accent/5 hover:border-accent/20 shadow-sm"
                        }`}
                      >
                        <div className="size-12 md:size-20 rounded-xl md:rounded-3xl bg-card border border-border flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-md mt-1 z-10">
                          <VibeIcon name={item.icon} className={`size-6 md:size-10 ${isActive ? 'text-accent' : 'text-muted-foreground'}`} />
                        </div>
                        <div className="flex-1 min-w-0 z-10">
                          <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
                            <div className={`font-display font-bold text-lg md:text-2xl transition-colors leading-tight ${isActive ? 'text-accent' : 'text-foreground group-hover:text-accent'}`}>
                              {item.name}
                            </div>
                            <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] md:text-[11px] font-bold ${
                              isActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-sm" : "bg-muted border-border/50 text-muted-foreground"
                            }`}>
                              {score}% MATCH
                            </div>
                          </div>
                          <div className="text-[9px] md:text-[11px] text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5 mt-1">
                             <MapPin className="size-3 md:size-3.5 opacity-60" /> {item.region}
                          </div>
                          <div className="mt-3">
                            <div className="text-xs md:text-sm font-medium text-accent/80 leading-relaxed bg-accent/5 border border-accent/10 rounded-xl md:rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-sm italic">
                              {item.vibe}
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 ml-1 mt-1 z-10 hidden sm:block">
                          <div className={`size-10 rounded-full bg-accent/10 text-accent flex items-center justify-center transition-all shadow-md ${isActive ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-1'}`}>
                            <ArrowRight className="size-5" />
                          </div>
                        </div>
                        
                        {/* Progress bar match indicator */}
                        <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/20 w-full">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${score}%` }}
                             className={`h-full ${isActive ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} 
                           />
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground italic">
                  Move the sliders to see magic...
                </div>
              )}
            </AnimatePresence>
          </div>
          
          {recommended.length > 0 && (
            <button 
              onClick={() => navigate(`/planner-single?dest=${encodeURIComponent(recommended[activeIndex].name)}`)}
              className="w-full mt-10 py-4 rounded-2xl bg-primary text-primary-foreground font-bold hover:scale-[1.02] transition-all shadow-lg active:scale-[0.98] z-10"
            >
              Plan a {recommended[activeIndex].name} Trip
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function MoodSlider({ label, value, onChange }: { label: [string, string], value: number, onChange: (v: number) => void }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
        <span className={value < 40 ? "text-accent" : "text-muted-foreground"}>{label[0]}</span>
        <span className={value > 60 ? "text-accent" : "text-muted-foreground"}>{label[1]}</span>
      </div>
      <div className="relative h-2 w-full bg-muted rounded-full group">
        <input 
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <motion.div 
          className="absolute top-0 left-0 h-full bg-accent rounded-full"
          animate={{ width: `${value}%` }}
        />
        <motion.div 
          className="absolute top-1/2 -translate-y-1/2 size-6 bg-white border-4 border-accent rounded-full shadow-lg z-20 group-hover:scale-110 transition-transform"
          animate={{ left: `calc(${value}% - 12px)` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
    </div>
  );
}

const features = [
  { icon: Sparkles, title: "AI Itinerary", desc: "A senior travel planner in your pocket. Day-by-day plans tuned to your style in seconds." },
  { icon: Users, title: "Group Polls", desc: "Decide destinations, dates and stays together. No more 47-message threads." },
  { icon: Wallet, title: "Budget Control", desc: "See exactly where every rupee goes — flights, stays, food, and experiences." },
];

function DestinationCard({ d, onShowDetails, isVisited }: { d: any, onShowDetails: (d: any) => void, isVisited: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative aspect-[3/4] cursor-pointer group"
      onClick={() => setIsFlipped(!isFlipped)}
      style={{ perspective: "1000px" }}
    >
      <motion.div
        animate={{ 
          rotateY: isFlipped ? 180 : 0,
          scale: isFlipped ? 1.05 : 1
        }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20 
        }}
        style={{ 
          width: "100%", 
          height: "100%", 
          transformStyle: "preserve-3d",
          position: "relative"
        }}
      >
        {/* FRONT */}
        <div 
          className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-card"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src={d.img}
            alt={d.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Enhanced gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
          
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] bg-black/40 backdrop-blur-md text-white border border-white/20 px-3 py-1.5 rounded-lg shadow-sm">
              {d.tag}
            </span>
            {isVisited && (
              <div className="size-7 rounded-lg bg-emerald-500 text-white grid place-items-center shadow-sm">
                <CheckCircle2 className="size-4" />
              </div>
            )}
          </div>
          
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <div className="font-display font-bold text-2xl drop-shadow-md">{d.name}</div>
            <div className="text-sm text-white/90 mt-1 font-medium drop-shadow-sm">From ₹14,200 · {d.days} days</div>
          </div>
        </div>

        {/* BACK */}
        <div 
          className={`absolute inset-0 w-full h-full rounded-3xl overflow-hidden ${d.gradient} p-8 flex flex-col items-center justify-center text-center shadow-cta border-4 border-white/20`}
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "rotateY(180deg)" 
          }}
        >
          <div className="size-14 rounded-2xl bg-white/20 grid place-items-center mb-4 backdrop-blur-sm">
             <Plane className="size-7 text-white" />
          </div>
          <h3 className="font-display font-bold text-2xl text-white mb-3">{d.name}</h3>
          <p className="text-white/90 text-sm leading-relaxed font-medium">
            {d.info}
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onShowDetails(d);
            }}
            className="mt-8 px-5 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
             Explore Details
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Landing() {
  const [selectedDest, setSelectedDest] = useState<any>(null);
  const [visited, setVisited] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("visited_destinations");
    if (saved) setVisited(JSON.parse(saved));
  }, []);

  const toggleVisited = (name: string) => {
    const next = visited.includes(name) 
      ? visited.filter(n => n !== name) 
      : [...visited, name];
    setVisited(next);
    localStorage.setItem("visited_destinations", JSON.stringify(next));
    toast.success(visited.includes(name) ? "Removed from visited destinations" : `Marked ${name} as visited!`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      {/* HERO CAROUSEL */}
      <HeroCarousel />

      {/* FEATURES */}
      <section id="features" className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <div className="max-w-2xl">
          <div className="text-sm font-semibold text-accent uppercase tracking-widest">Why GoTripo</div>
          <h2 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight text-balance">
            The travel agent that fits in your pocket.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Three quiet superpowers that make every trip feel handcrafted.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="group rounded-3xl border border-border bg-card p-7 shadow-soft hover:shadow-pop hover:-translate-y-1 transition-all">
              <div className="size-12 rounded-2xl bg-primary-soft text-primary grid place-items-center group-hover:bg-warm-gradient group-hover:text-white transition">
                <f.icon className="size-5" />
              </div>
              <h3 className="mt-5 font-display font-bold text-xl">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VIDEO SECTION */}
      <VideoSection />

      {/* VIBE SEARCH */}
      <MoodSearch />

      {/* DESTINATIONS */}
      <section id="destinations" className="bg-secondary py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeUp className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-accent uppercase tracking-widest">Popular in India</div>
              <h2 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight">
                Destinations travellers love
              </h2>
            </div>
            <Link to="/explore" className="text-sm font-semibold text-primary inline-flex items-center gap-1 hover:gap-2 transition-all">
              Explore all <ArrowRight className="size-4" />
            </Link>
          </FadeUp>

          <StaggerGroup gap={0.07} className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {destinations.map((d) => (
              <StaggerItem key={d.name}>
                <DestinationCard 
                  d={d} 
                  onShowDetails={setSelectedDest} 
                  isVisited={visited.includes(d.name)}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedDest && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDest(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-card rounded-[40px] shadow-2xl border border-border overflow-y-auto max-h-[90vh] lg:overflow-hidden"
            >
              <button 
                onClick={() => setSelectedDest(null)}
                className="absolute top-6 right-6 z-20 size-12 rounded-full bg-black/40 hover:bg-black/60 text-white grid place-items-center transition-colors backdrop-blur-md border border-white/20"
              >
                <X className="size-6" />
              </button>

              <div className="grid lg:grid-cols-12 min-h-[500px]">
                {/* Image Section */}
                <div className="lg:col-span-5 relative h-72 lg:h-auto group">
                  <img src={selectedDest.img} alt="" className="size-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className={`absolute inset-0 ${selectedDest.gradient} opacity-20`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                  
                  <div className="absolute bottom-6 left-6 flex flex-wrap gap-2">
                     <span className="px-4 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest border border-white/20">
                        {selectedDest.tag}
                     </span>
                     {visited.includes(selectedDest.name) && (
                       <span className="px-4 py-1.5 rounded-xl bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                          <CheckCircle2 className="size-3" /> Visited
                       </span>
                     )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="lg:col-span-7 p-8 md:p-14 flex flex-col justify-between bg-card relative">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="text-[10px] font-bold text-accent uppercase tracking-[0.2em]">Destinations India</div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleVisited(selectedDest.name)}
                          className={`p-2 rounded-xl transition-all border ${
                            visited.includes(selectedDest.name) 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                              : "bg-secondary hover:bg-border border-transparent text-muted-foreground"
                          }`}
                          title={visited.includes(selectedDest.name) ? "Unmark as visited" : "Mark as visited"}
                        >
                          <CheckCircle2 className="size-5" />
                        </button>
                        <button className="p-2 rounded-xl bg-secondary hover:bg-border text-muted-foreground transition-all">
                          <Bookmark className="size-5" />
                        </button>
                      </div>
                    </div>
                    
                    <h2 className="font-display font-bold text-5xl md:text-6xl tracking-tighter mb-8 bg-warm-gradient bg-clip-text text-transparent">
                      {selectedDest.name}
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                      <StatItem icon={<MapPin />} label="Region" value="North India" />
                      <StatItem icon={<Clock />} label="Duration" value={`${selectedDest.days} Days`} />
                      <StatItem icon={<Calendar />} label="Best Time" value={getNextThreeMonths()} />
                    </div>

                    <div className="relative p-7 rounded-3xl bg-secondary/50 border border-border/50 mb-10">
                      <Sparkles className="absolute -top-3 -right-3 size-8 text-accent opacity-20" />
                      <p className="text-foreground/80 text-lg leading-relaxed italic font-medium">
                        "{selectedDest.details}"
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                    <Link 
                      to={`/planner-single?dest=${encodeURIComponent(selectedDest.name)}&days=${selectedDest.days}`}
                      className="flex-[2] h-16 rounded-2xl bg-warm-gradient text-white font-display font-bold text-lg flex items-center justify-center gap-3 shadow-cta hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Plan this trip <ArrowRight className="size-5" />
                    </Link>
                    <button className="flex-1 h-16 rounded-2xl bg-secondary text-foreground font-bold hover:bg-border transition-all flex items-center justify-center gap-2">
                       Learn More
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TESTIMONIALS */}
      <section id="voices" className="max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <FadeUp className="max-w-2xl">
          <div className="text-sm font-semibold text-accent uppercase tracking-widest">Voices of explorers</div>
          <h2 className="mt-3 font-display font-bold text-4xl md:text-5xl tracking-tight">Stories from the road</h2>
        </FadeUp>
        <StaggerGroup gap={0.09} className="mt-12 grid md:grid-cols-3 gap-5">
          {voices.map((v) => (
            <StaggerItem key={v.name}>
              <HoverLift className="rounded-3xl border border-border bg-card p-7 shadow-soft hover:shadow-card transition-shadow">
                <div className="flex text-accent">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="size-4 fill-current" />)}
                </div>
                <p className="mt-4 text-foreground text-lg leading-relaxed">"{v.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="size-10 rounded-full bg-primary-soft text-primary grid place-items-center font-bold text-sm">{v.name[0]}</div>
                  <div>
                    <div className="font-semibold text-sm">{v.name}</div>
                    <div className="text-xs text-muted-foreground">{v.role}</div>
                  </div>
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-10 pb-24">
        <FadeUp className="max-w-7xl mx-auto rounded-3xl bg-hero-gradient text-white p-10 md:p-16 relative overflow-hidden shadow-pop">
          <div className="absolute inset-0 bg-mesh opacity-50" />
          <div className="relative max-w-2xl">
            <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight text-balance">Your next trip is one prompt away.</h2>
            <p className="mt-4 text-white/80 text-lg">Start free. Plan in minutes. Travel like you finally have time.</p>
            <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: dur.xs, ease }} className="inline-block mt-8">
              <Link to="/trip-type" className="inline-flex items-center gap-2 h-12 px-7 rounded-xl bg-warm-gradient font-semibold shadow-cta">
                <Plane className="size-4" /> Plan my trip
              </Link>
            </motion.div>
          </div>
        </FadeUp>
      </section>

      <ReviewSection />
      <Footer />
    </div>
  );
}

function StatItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-primary">
        <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center">
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: "size-4" }) : icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="font-semibold text-sm pl-10">{value}</div>
    </div>
  );
}

export default Landing;
