import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MarketingNav } from "@/components/MarketingNav";
import { HeroCarousel } from "@/components/HeroCarousel";
import { TrustSection } from "@/components/TrustSection";
import { ReviewSection } from "@/components/ReviewSection";
import { Footer } from "@/components/Footer";
import { FadeUp, StaggerGroup, StaggerItem, HoverLift, dur, ease } from "@/components/motion/primitives";
import {
  Sparkles, Users, Wallet, Star, ArrowRight, Plane, X, MapPin, Clock, Calendar, CheckCircle2, Bookmark, Loader2,
  Mountain, Palmtree, Landmark, Building, Wind, Building2, Castle, Sun, Music, Trees, Coffee, Waves, CloudSun,
  ShieldCheck, Eye, Plus, Check
} from "lucide-react";
import React, { useEffect, useState, useCallback } from "react";
import heroImg from "@/assets/hero-jaipur.jpg";
import goa from "@/assets/dest-goa.jpg";
import jaipur from "@/assets/dest-jaipur.jpg";
import rishikesh from "@/assets/dest-rishikesh.jpg";
import kerala from "@/assets/dest-kerala.jpg";
import hampi from "@/assets/dest-hampi.jpg";
import coorg from "@/assets/dest-coorg.jpg";
import himalayas from "@/assets/dest-himalayas.jpg";
import ladakh from "@/assets/dest-ladakh.jpg";
import munnar from "@/assets/dest-munnar.jpg";
import varanasi from "@/assets/dest-varanasi.jpg";
import { getNextThreeMonths, cn } from "@/lib/utils";
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

const fallbackVibeSuggestions = [
  {
    name: "Jaipur",
    region: "Rajasthan",
    vibe: "Walking through royal sandstone palaces, bustling bazaars, and listening to old stories of kings.",
    icon: "castle",
    adventure: 30,
    modern: 20,
    social: 75
  },
  {
    name: "Goa",
    region: "West Coast",
    vibe: "Sunbathing on warm sandy beaches, sipping coconut water, and dancing under the stars.",
    icon: "waves",
    adventure: 60,
    modern: 70,
    social: 90
  },
  {
    name: "Rishikesh",
    region: "Uttarakhand",
    vibe: "Waking up to Ganga Aarti bells, meditating by the river banks, and white-water rafting in rapids.",
    icon: "sun",
    adventure: 75,
    modern: 15,
    social: 30
  },
  {
    name: "Kerala Backwaters",
    region: "Kerala",
    vibe: "Floating gently on a wooden houseboat through lush palm-fringed canals and tranquil lagoons.",
    icon: "trees",
    adventure: 20,
    modern: 30,
    social: 25
  },
  {
    name: "Ladakh",
    region: "Leh Ladakh",
    vibe: "Riding across vast high-altitude cold deserts, seeing azure lakes, and visiting ancient cliffside monasteries.",
    icon: "mountains",
    adventure: 95,
    modern: 10,
    social: 15
  },
  {
    name: "Coorg",
    region: "Karnataka",
    vibe: "Trekking through misty coffee hills, listening to bird calls, and breathing fresh mountain air.",
    icon: "coffee",
    adventure: 50,
    modern: 25,
    social: 35
  },
  {
    name: "Munnar",
    region: "Kerala",
    vibe: "Walking through endless rolling tea estates, watching valley mists, and relaxing in cool hill breezes.",
    icon: "trees",
    adventure: 40,
    modern: 20,
    social: 20
  },
  {
    name: "Varanasi",
    region: "Uttar Pradesh",
    vibe: "Navigating ancient ghats, seeing deep spiritual rituals, and smelling sandalwood incense by the holy river.",
    icon: "sun",
    adventure: 25,
    modern: 5,
    social: 60
  },
  {
    name: "Hampi",
    region: "Karnataka",
    vibe: "Climbing boulder-strewn hills, exploring magnificent stone ruins, and watching sunsets over rivers.",
    icon: "landmark",
    adventure: 65,
    modern: 10,
    social: 20
  }
];

const getFallbackSuggestions = (currentVibe: { adventure: number, modern: number, social: number }) => {
  return [...fallbackVibeSuggestions]
    .map(dest => {
      const diff = Math.abs(currentVibe.adventure - dest.adventure) +
                   Math.abs(currentVibe.modern - dest.modern) +
                   Math.abs(currentVibe.social - dest.social);
      const score = Math.max(70, Math.floor(100 - (diff / 3)));
      return { ...dest, score };
    })
    .sort((a, b) => b.score - a.score);
};

function MoodSearch() {
  const [vibe, setVibe] = useState({
    adventure: 50,
    modern: 50,
    social: 50,
  });
  const [recommended, setRecommended] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const persona = getPersona(vibe);
  
  // Map destination names to imported images
  const imageMap: Record<string, string> = {
    "Jaipur": jaipur,
    "Goa": goa,
    "Rishikesh": rishikesh,
    "Kerala": kerala,
    "Hampi": hampi,
    "Coorg": coorg,
    "Munnar": munnar,
    "Varanasi": varanasi,
    "Ladakh": ladakh,
    "Himalayas": himalayas,
    "Dharamshala": rishikesh,
    "Gokarna": goa
  };

  const getDestinationImage = (name: string) => {
    // 1. Check direct map
    if (imageMap[name]) return imageMap[name];
    
    // 2. Check case-insensitive match
    const key = Object.keys(imageMap).find(k => k.toLowerCase() === name.toLowerCase());
    if (key) return imageMap[key];
    
    // 3. Dynamic Unsplash fallback as a last resort
    return `https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80&w=800&q=80&sig=${encodeURIComponent(name)}`;
  };

  const updateSuggestions = useCallback(async (currentVibe: any) => {
    setIsLoading(true);
    try {
      const suggestions = await fetchVibeSuggestions(currentVibe);
      if (suggestions && suggestions.length > 0) {
        setRecommended(suggestions);
      } else {
        setRecommended(getFallbackSuggestions(currentVibe));
      }
    } catch (err) {
      console.warn("Vibe API failed, using client-side fallback suggestions:", err);
      setRecommended(getFallbackSuggestions(currentVibe));
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
    <section className="relative py-40 overflow-hidden bg-white dark:bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* LEFT: ELEGANT CONTROLS */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="space-y-2 mb-12">
               <div className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Personalized Discovery</div>
               <h2 className="font-display font-medium text-4xl sm:text-5xl md:text-7xl tracking-tighter text-foreground leading-[0.85]">
                 Tune your <br />
                 <span className="italic font-serif text-slate-500 dark:text-slate-400">journey.</span>
               </h2>
            </div>
 
            <p className="text-muted-foreground text-lg mb-16 leading-relaxed max-w-sm">
              Travel is an extension of your mood. Slide to find the destination that resonates with your current state of mind.
            </p>
 
            <div className="space-y-16">
              <MoodSlider 
                label={["Peace", "Adventure"]} 
                value={vibe.adventure} 
                onChange={(v) => setVibe({...vibe, adventure: v})} 
              />
              <MoodSlider 
                label={["Heritage", "Modern"]} 
                value={vibe.modern} 
                onChange={(v) => setVibe({...vibe, modern: v})} 
              />
              <MoodSlider 
                label={["Quiet", "Vibrant"]} 
                value={vibe.social} 
                onChange={(v) => setVibe({...vibe, social: v})} 
              />
            </div>
 
            <motion.div 
              key={persona.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-20 p-8 rounded-[32px] bg-secondary/30 border border-border/50 flex items-center gap-6"
            >
               <div className="size-14 rounded-2xl bg-white dark:bg-black shadow-lg flex items-center justify-center">
                  <VibeIcon name={persona.icon} className="size-7 text-accent" />
               </div>
               <div>
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Current Soul Match</div>
                  <div className="text-xl font-display font-bold">{persona.name}</div>
               </div>
            </motion.div>
          </div>

          {/* RIGHT: THE GALLERY STAGE */}
          <div className="lg:col-span-7 space-y-12">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="aspect-[4/5] w-full flex flex-col items-center justify-center gap-6"
                >
                   <div className="size-20 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Synthesizing Matches</span>
                </motion.div>
              ) : (
                <div className="grid gap-12">
                  {recommended.slice(0, 3).map((item, idx) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative"
                    >
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                         {/* Image Frame */}
                         <div className="relative aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl bg-secondary">
                            <img 
                              src={getDestinationImage(item.name)} 
                              alt={item.name} 
                              className="size-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="absolute top-6 left-6 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
                               {getMatchScore(vibe, item)}% Match
                            </div>
                         </div>
                         
                         {/* Content */}
                         <div className="py-4">
                            <div className="inline-flex items-center gap-2 mb-4">
                               <MapPin className="size-3 text-accent" />
                               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{item.region}</span>
                            </div>
                            <h3 className="font-display font-medium text-3xl sm:text-4xl md:text-5xl mb-6 tracking-tighter leading-none group-hover:text-accent transition-colors">
                               {item.name}
                            </h3>
                            <p className="text-muted-foreground text-lg leading-relaxed mb-10 italic font-serif">
                               "{item.vibe}"
                            </p>
                            <div className="flex items-center gap-6">
                               <button 
                                 onClick={() => navigate(`/planner-single?dest=${encodeURIComponent(item.name)}`)}
                                 className="h-14 px-8 rounded-2xl bg-foreground text-background font-bold text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                               >
                                 Start Planning <ArrowRight className="size-4" />
                               </button>
                               <div className="size-12 rounded-2xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-accent transition-all cursor-pointer">
                                  <VibeIcon name={item.icon} className="size-5" />
                               </div>
                            </div>
                         </div>
                      </div>
                      
                      {/* Divider for non-last items */}
                      {idx < 2 && (
                        <div className="absolute -bottom-6 left-0 w-full h-px bg-border/40" />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
            
            {!isLoading && recommended.length > 0 && (
              <div className="pt-10 flex justify-center lg:justify-start">
                 <button className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 dark:text-slate-400 hover:text-accent transition-colors">
                   View more suggestions
                 </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

function MoodSlider({ label, value, onChange }: { label: [string, string], value: number, onChange: (v: number) => void }) {
  return (
    <div className="group relative pt-4">
      <div className="flex justify-between items-center mb-6 px-1">
        <span className={cn(
          "text-[10px] font-black uppercase tracking-[0.3em] transition-all",
          value < 40 ? "text-accent scale-110" : "text-slate-700 dark:text-slate-300"
        )}>{label[0]}</span>
        <span className={cn(
          "text-[10px] font-black uppercase tracking-[0.3em] transition-all",
          value > 60 ? "text-accent scale-110" : "text-slate-700 dark:text-slate-300"
        )}>{label[1]}</span>
      </div>
      
      <div className="relative h-1 w-full bg-secondary rounded-full">
        {/* Track Progress */}
        <motion.div 
          animate={{ width: `${value}%` }}
          className="absolute inset-y-0 left-0 bg-accent/30 rounded-full" 
        />
        
        {/* Input */}
        <input 
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="absolute -inset-y-4 inset-x-0 w-full opacity-0 cursor-pointer z-20"
        />
        
        {/* Elegant Thumb */}
        <motion.div 
          animate={{ left: `calc(${value}% - 12px)` }}
          transition={{ type: "spring", stiffness: 400, damping: 40 }}
          className="absolute top-1/2 -translate-y-1/2 size-6 rounded-full bg-white dark:bg-black shadow-[0_4px_20px_rgba(0,0,0,0.2)] border-[1px] border-border z-10 flex items-center justify-center pointer-events-none group-hover:scale-125 transition-transform"
        >
           <div className="size-1.5 rounded-full bg-accent" />
        </motion.div>
      </div>
    </div>
  );
}

const features = [
  { id: "itinerary" as const, icon: Sparkles, title: "Smart Route Planner", desc: "Day-by-day plans built with real travel times, golden-hour spots, and insider tips." },
  { id: "polls" as const, icon: Users, title: "Group Decision Polling", desc: "Vote on stays and activities together. Every friend gets a voice without endless chat debates." },
  { id: "budget" as const, icon: Wallet, title: "Live Expense Splitter", desc: "Track shared costs as you spend. See exact balances and who owes who in real-time." },
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

const renderMockup = (tab: "itinerary" | "polls" | "budget") => {
  switch (tab) {
    case "itinerary":
      return (
        <div className="space-y-6 text-left">
          {/* Real Destination Header */}
          <div className="relative h-32 rounded-2xl overflow-hidden shadow-lg border border-border/40">
            <img src={jaipur} alt="Jaipur" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Personalized Route</span>
                <h4 className="font-display font-bold text-lg leading-tight">Jaipur Heritage & Forts</h4>
              </div>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md text-white rounded-full border border-white/20 shadow-sm">
                3 Days · 4 Travelers
              </span>
            </div>
          </div>

          {/* Timeline Items */}
          <div className="relative border-l-2 border-accent/30 pl-5 space-y-5 ml-1">
            <div className="relative">
              <span className="absolute -left-[27px] top-1 size-3 rounded-full bg-accent ring-4 ring-background shadow-sm" />
              <div className="text-[10px] font-bold text-accent uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="size-3" /> 10:00 AM · Day 1
              </div>
              <h5 className="font-bold text-sm text-foreground">Amer Fort & Sheesh Mahal</h5>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Explore royal sandstone courtyards & intricate mirror halls.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                💡 Tip: Book online to bypass long entry queues.
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-[27px] top-1 size-3 rounded-full bg-slate-300 dark:bg-slate-700 ring-4 ring-background" />
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock className="size-3" /> 04:30 PM · Day 1
              </div>
              <h5 className="font-bold text-sm text-foreground">Nahargarh Sunset Point</h5>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Panoramic sunset view across the entire Pink City skyline.
              </p>
            </div>
          </div>
        </div>
      );
    case "polls":
      return (
        <div className="space-y-5 text-left">
          {/* Header Banner */}
          <div className="relative h-32 rounded-2xl overflow-hidden shadow-lg border border-border/40">
            <img src={goa} alt="Goa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Group Decision</span>
                <h4 className="font-display font-bold text-lg leading-tight">Goa Beachside Stay Poll</h4>
              </div>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/80 backdrop-blur-md text-white rounded-full shadow-sm">
                5 Votes Cast
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Option 1 */}
            <div className="p-4 rounded-2xl border-2 border-accent/40 bg-accent/[0.04] relative">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-foreground">Arambol Beach Villa</h5>
                    <span className="text-[9px] font-bold bg-accent text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="size-2.5" /> Leading
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Private pool, sea view · ₹2,400 / night per person</p>
                </div>
                <span className="text-xs font-black text-accent">3 votes</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full w-[60%]" />
              </div>
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex -space-x-2">
                  <img src="https://i.pravatar.cc/100?img=11" className="size-5 rounded-full ring-2 ring-background" />
                  <img src="https://i.pravatar.cc/100?img=12" className="size-5 rounded-full ring-2 ring-background" />
                  <img src="https://i.pravatar.cc/100?img=13" className="size-5 rounded-full ring-2 ring-background" />
                </div>
                <span className="text-[10px] text-muted-foreground">Karan, Kabir & Maya picked this</span>
              </div>
            </div>

            {/* Option 2 */}
            <div className="p-4 rounded-2xl border border-border bg-card/60">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h5 className="font-bold text-sm text-foreground">Anjuna Heritage Hostel</h5>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Social vibe, beachfront bar · ₹900 / night</p>
                </div>
                <span className="text-xs font-bold text-muted-foreground">2 votes</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-muted-foreground/40 rounded-full w-[40%]" />
              </div>
            </div>
          </div>
        </div>
      );
    case "budget":
      return (
        <div className="space-y-5 text-left">
          {/* Top Budget Summary Bar */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-accent/10 border border-accent/20">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Goa Trip Budget</span>
                <h4 className="text-2xl font-display font-bold text-foreground mt-0.5">₹18,400 <span className="text-xs text-muted-foreground font-normal">/ ₹25,000</span></h4>
              </div>
              <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                ₹6,600 Left
              </span>
            </div>
            <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full w-[73%]" />
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Live Shared Expenses</div>
            
            <div className="flex items-center justify-between p-3.5 bg-card/80 rounded-xl border border-border text-xs">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/100?img=11" className="size-8 rounded-full border border-border" />
                <div>
                  <div className="font-bold text-foreground">Karan paid for Dinner</div>
                  <div className="text-[10px] text-muted-foreground">Split equally between 4 people</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground">₹3,600</div>
                <div className="text-[9px] text-accent font-semibold">You owe ₹900</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-card/80 rounded-xl border border-border text-xs">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/100?img=12" className="size-8 rounded-full border border-border" />
                <div>
                  <div className="font-bold text-foreground">Kabir booked Flights</div>
                  <div className="text-[10px] text-muted-foreground">Added to shared ledger</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-foreground">₹14,800</div>
                <div className="text-[9px] text-accent font-semibold">You owe ₹3,700</div>
              </div>
            </div>
          </div>
        </div>
      );
  }
};

function Landing() {
  const [selectedDest, setSelectedDest] = useState<any>(null);
  const [visited, setVisited] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"itinerary" | "polls" | "budget">("itinerary");

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

      {/* SECURITY BANNER */}
      <div className="w-full bg-slate-50 dark:bg-white/[0.02] border-y border-border dark:border-white/5 py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <ShieldCheck className="size-5 text-accent" />
            <span className="text-xs font-bold uppercase tracking-widest">Safe Data Secured</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Eye className="size-5 text-accent" />
            <span className="text-xs font-bold uppercase tracking-widest">Zero Data Selling</span>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-28 max-w-7xl mx-auto px-6 lg:px-10 py-24 sm:py-32 relative overflow-hidden">
        {/* Floating animated blobs for Liquid Glassmorphism */}
        <div className="absolute top-1/4 left-0 w-80 h-80 bg-accent/15 blur-[120px] rounded-full -z-10 pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-primary/10 blur-[120px] rounded-full -z-10 pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

        <div className="grid lg:grid-cols-12 gap-16 items-center">
          {/* Left Column: Heading and Tab selectors */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <div className="inline-flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <span className="size-2 rounded-full bg-accent animate-pulse" />
                <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Built for Real Trips</span>
              </div>
              <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-6xl tracking-tighter text-balance mb-6">
                Your trip, planned <br />
                <span className="italic text-slate-500 dark:text-slate-400 font-serif">in minutes.</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed text-balance">
                No 47-message WhatsApp threads, no messy spreadsheets. Just effortless itineraries, group voting, and real-time budget splitting.
              </p>
            </div>

            {/* Tab Selectors */}
            <div className="space-y-4">
              {features.map((f) => {
                const active = activeTab === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => setActiveTab(f.id)}
                    className={cn(
                      "w-full text-left p-6 rounded-[24px] border transition-all duration-300 relative overflow-hidden flex items-start gap-5 cursor-pointer outline-none group",
                      active
                        ? "border-accent/40 bg-accent/[0.06] dark:bg-white/[0.08] backdrop-blur-md shadow-[0_8px_32px_rgba(5,150,105,0.08)]"
                        : "border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.02] backdrop-blur-md hover:border-accent/30 hover:bg-white/80 dark:hover:bg-white/[0.04]"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeFeatureIndicator"
                        className="absolute inset-0 bg-accent/10 border border-accent/30 rounded-[24px] -z-10"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    
                    <div className={cn(
                      "shrink-0 size-12 rounded-xl flex items-center justify-center transition-all duration-300",
                      active
                        ? "bg-accent text-white shadow-md shadow-accent/20"
                        : "bg-secondary text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent"
                    )}>
                      <f.icon className="size-5.5" />
                    </div>

                    <div className="flex-1">
                      <h3 className={cn(
                        "font-display font-bold text-lg mb-1.5 transition-colors",
                        active ? "text-accent" : "text-foreground"
                      )}>
                        {f.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>


          </div>
 
          {/* Right Column: Polished Real App Showcase Card */}
          <div className="lg:col-span-7">
            <div className="relative w-full rounded-[32px] border border-border bg-card/90 shadow-2xl overflow-hidden backdrop-blur-2xl p-6 sm:p-8">
              {/* Clean top app indicator */}
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Interactive Feature Preview</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                  <Sparkles className="size-3.5" /> Live Sync
                </div>
              </div>

              {/* Showcase Content */}
              <div className="min-h-[380px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {renderMockup(activeTab)}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* TRUST SECTION */}
      <TrustSection />

      {/* VIBE SEARCH */}
      <MoodSearch />

      {/* DESTINATIONS */}
      <section id="destinations" className="scroll-mt-28 bg-secondary py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <FadeUp className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-accent uppercase tracking-widest">Popular in India</div>
              <h2 className="mt-3 font-display font-bold text-2xl sm:text-3xl md:text-5xl tracking-tight">
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
                    
                    <h2 className="font-display font-bold text-3xl sm:text-4xl md:text-6xl tracking-tighter mb-8 bg-warm-gradient bg-clip-text text-transparent">
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
                    <Link 
                      to="/explore"
                      className="flex-1 h-16 rounded-2xl bg-secondary text-foreground font-bold hover:bg-border transition-all flex items-center justify-center gap-2"
                    >
                       Learn More
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TESTIMONIALS */}
      <section id="voices" className="scroll-mt-28 max-w-7xl mx-auto px-6 lg:px-10 py-24">
        <FadeUp className="max-w-2xl">
          <div className="text-sm font-semibold text-accent uppercase tracking-widest">Voices of explorers</div>
          <h2 className="mt-3 font-display font-bold text-2xl sm:text-3xl md:text-5xl tracking-tight">Stories from the road</h2>
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
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "size-4" }) : icon}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="font-semibold text-sm pl-10">{value}</div>
    </div>
  );
}

export default Landing;
