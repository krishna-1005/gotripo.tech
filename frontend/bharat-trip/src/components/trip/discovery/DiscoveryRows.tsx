import { motion } from "framer-motion";
import { ArrowRight, MapPin, Sparkles, TrendingUp, Compass, Calendar, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Destination {
  name: string;
  img: string;
  vibe: string;
  budget: string;
  season: string;
  desc: string;
  tag?: string;
}

const trending: Destination[] = [
  {
    name: "Ladakh",
    img: "/src/assets/dest-ladakh.jpg",
    vibe: "Adventure & Solitude",
    budget: "₹25k - ₹40k",
    season: "Jun - Sep",
    desc: "The land of high passes, crystal lakes, and ancient monasteries.",
    tag: "Trending"
  },
  {
    name: "Munnar",
    img: "/src/assets/dest-munnar.jpg",
    vibe: "Serenity & Tea Gardens",
    budget: "₹12k - ₹20k",
    season: "Sep - Mar",
    desc: "Rolling emerald hills wrapped in a gentle morning mist.",
    tag: "Romantic"
  },
  {
    name: "Varanasi",
    img: "/src/assets/dest-varanasi.jpg",
    vibe: "Spiritual & Ancient",
    budget: "₹8k - ₹15k",
    season: "Oct - Mar",
    desc: "The spiritual heart of India, where life and death meet on the Ganges.",
    tag: "Must Visit"
  },
  {
    name: "Coorg",
    img: "/src/assets/dest-coorg.jpg",
    vibe: "Coffee & Rain",
    budget: "₹10k - ₹18k",
    season: "Oct - Apr",
    desc: "The Scotland of India, known for its coffee and lush landscapes.",
    tag: "Weekend"
  }
];

const hiddenGems: Destination[] = [
  {
    name: "Hampi",
    img: "/src/assets/dest-hampi.jpg",
    vibe: "History & Boulders",
    budget: "₹12k - ₹20k",
    season: "Nov - Feb",
    desc: "An open-air museum of ancient ruins set against a surreal landscape."
  },
  {
    name: "Rishikesh",
    img: "/src/assets/dest-rishikesh.jpg",
    vibe: "Yoga & Adventure",
    budget: "₹8k - ₹15k",
    season: "Sep - Jun",
    desc: "The yoga capital of the world, where the Ganges meets the mountains."
  },
  {
    name: "Jaipur",
    img: "/src/assets/dest-jaipur.jpg",
    vibe: "Royal & Colorful",
    budget: "₹15k - ₹30k",
    season: "Oct - Mar",
    desc: "Pink palaces, majestic forts, and the timeless charm of Rajasthan."
  }
];

export function DiscoveryRows() {
  return (
    <div className="space-y-24 py-24 bg-white dark:bg-background">
      <DiscoverySection 
        title="Trending This Month" 
        subtitle="The most sought-after experiences right now"
        icon={<TrendingUp className="size-5 text-[#10b981]" />}
        items={trending}
      />
      
      <DiscoverySection 
        title="Hidden Gems" 
        subtitle="Unplug and discover India's best kept secrets"
        icon={<Compass className="size-5 text-[#10b981]" />}
        items={hiddenGems}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="relative rounded-[40px] overflow-hidden bg-slate-950 dark:bg-card p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 via-transparent to-transparent opacity-50" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h3 className="font-display font-medium text-4xl md:text-5xl text-white mb-6">
              Can't decide where to go?
            </h3>
            <p className="text-white/60 text-lg mb-10 leading-relaxed">
              Our AI understands your vibe. Tell us what you're feeling and we'll handle the rest.
            </p>
            <Link 
              to="/trip-type" 
              className="inline-flex items-center gap-3 h-14 px-10 rounded-xl bg-white text-black font-bold hover:bg-[#10b981] hover:text-white transition-all shadow-xl"
            >
              Surprise Me <Sparkles className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscoverySection({ title, subtitle, icon, items }: { title: string, subtitle: string, icon: React.ReactNode, items: Destination[] }) {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-10">
      <div className="flex items-end justify-between mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {icon}
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#10b981]">{title}</span>
          </div>
          <h2 className="font-display font-medium text-4xl tracking-tight text-slate-900 dark:text-white">
            {subtitle}
          </h2>
        </div>
        <button className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-900/50 dark:text-white/40 hover:text-[#10b981] transition-colors">
          View All <ArrowRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item, i) => (
          <DiscoveryCard key={item.name} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

function DiscoveryCard({ item, index }: { item: Destination, index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className="group relative flex flex-col bg-slate-50 dark:bg-white/[0.02] rounded-[32px] overflow-hidden border border-slate-200/50 dark:border-white/5 hover:border-[#10b981]/30 transition-all hover:shadow-2xl hover:shadow-[#10b981]/5"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={item.img} 
          alt={item.name} 
          className="size-full object-cover cinematic-image transition-transform duration-1000 group-hover:scale-110" 
        />
        {item.tag && (
          <div className="absolute top-5 left-5 px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
            {item.tag}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="p-7 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#10b981]">
            <MapPin className="size-3.5" />
            <span className="text-[10px] font-black uppercase tracking-widest">{item.vibe}</span>
          </div>
          <h3 className="font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-white group-hover:text-[#10b981] transition-colors">
            {item.name}
          </h3>
        </div>

        <p className="text-slate-500 dark:text-white/50 text-sm leading-relaxed line-clamp-2">
          {item.desc}
        </p>

        <div className="pt-4 border-t border-slate-200 dark:border-white/5 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-white/30">
              <Wallet className="size-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">Budget</span>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white/80">{item.budget}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-white/30">
              <Calendar className="size-3" />
              <span className="text-[9px] font-black uppercase tracking-widest">Season</span>
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white/80">{item.season}</div>
          </div>
        </div>
      </div>
      
      <Link 
        to={`/planner-single?dest=${encodeURIComponent(item.name)}`}
        className="absolute inset-0 z-20"
        aria-label={`Plan trip to ${item.name}`}
      />
    </motion.div>
  );
}
