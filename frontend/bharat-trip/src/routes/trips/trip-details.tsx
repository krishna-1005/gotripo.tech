import { Link, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { destinations, destinationItineraries } from "@/lib/sample-data";
import { 
  Edit3, Share2, Copy, MapPin, Calendar, Wallet, Hotel, Plane, 
  Utensils, Camera, Landmark, Ship, Music, ShoppingBag, Sun, 
  Sparkles, Coffee, Compass, Heart, ExternalLink, Star, Clock
} from "lucide-react";
import { useMemo, useState } from "react";
import { MapPreview } from "@/components/MapPreview";
import { getNextThreeMonths } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  plane: Plane,
  utensils: Utensils,
  camera: Camera,
  landmark: Landmark,
  ship: Ship,
  music: Music,
  "shopping-bag": ShoppingBag,
  sun: Sun,
};

const DAY_ACCENT = [
  { dot: "bg-indigo-500 dark:bg-indigo-550", label: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/40" },
  { dot: "bg-rose-500 dark:bg-rose-555",   label: "text-rose-650 dark:text-rose-400",   border: "border-rose-500/40"   },
  { dot: "bg-amber-500 dark:bg-amber-555",  label: "text-amber-600 dark:text-amber-400",  border: "border-amber-500/40"  },
  { dot: "bg-emerald-500 dark:bg-emerald-555",label: "text-emerald-650 dark:text-emerald-400",border: "border-emerald-500/40"},
  { dot: "bg-sky-500 dark:bg-sky-555",    label: "text-sky-600 dark:text-sky-400",    border: "border-sky-500/40"    },
];

function getTypeConfig(icon: string) {
  const i = (icon || "").toLowerCase();
  if (i === "utensils" || i === "food") return { color: "#ea580c", label: "Food & Dining", duration: "1 hr" };
  if (i === "plane" || i === "flight") return { color: "#0ea5e9", label: "Transit", duration: "1-2 hrs" };
  if (i === "ship" || i === "boat") return { color: "#06b6d4", label: "Boat Ride", duration: "1.5 hrs" };
  if (i === "music" || i === "entertainment") return { color: "#ec4899", label: "Activity", duration: "2 hrs" };
  if (i === "shopping-bag" || i === "shopping") return { color: "#a855f7", label: "Shopping", duration: "1-2 hrs" };
  if (i === "camera" || i === "sightseeing") return { color: "#7c3aed", label: "Sightseeing", duration: "1 hr" };
  if (i === "landmark" || i === "temple") return { color: "#2563eb", label: "Landmark", duration: "1-2 hrs" };
  return { color: "#10b981", label: "Explore", duration: "1 hr" };
}

export default function TripDetails() {
  return (
    <ProtectedRoute>
      <TripDetailsContent />
    </ProtectedRoute>
  );
}

function TripDetailsContent() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [activePlace, setActivePlace] = useState<any>(null);

  const d = useMemo(() => {
    return destinations.find((dest) => dest.id === id) || destinations[0];
  }, [id]);

  const itinerary = useMemo(() => {
    return destinationItineraries[d.id] || destinationItineraries.jaipur;
  }, [d.id]);

  const handleShare = async () => {
    const shareData = {
      title: `${d.name} Escape | GoTripo`,
      text: `Planning a trip to ${d.name}! Check this out on GoTripo.`,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-background text-foreground pb-20">
        {/* Premium Header */}
        <div className="h-[400px] md:h-[500px] relative overflow-hidden group">
          <img 
            src={d.img} 
            alt={d.name} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-4 lg:px-10 h-full flex flex-col justify-end pb-12">
            <div className="flex items-center gap-2 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <span className="px-3 py-1 rounded-full bg-accent/20 backdrop-blur-md border border-accent/30 text-accent text-[10px] font-bold uppercase tracking-widest">
                {d.tag}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest">
                {d.region}
              </span>
            </div>
            
            <h1 className="font-sans font-extrabold text-4xl md:text-6xl text-white tracking-tight max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
              {d.id === 'jaipur' ? 'Royal Rajasthan' : `${d.name} Escape`}
            </h1>
            
            <div className="mt-6 flex flex-wrap gap-6 text-white/90 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <MapPin className="size-4 text-accent" />
                </div>
                <span className="text-sm font-medium">{d.name}, {d.isInternational ? d.region : "India"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Calendar className="size-4 text-accent" />
                </div>
                <span className="text-sm font-medium">Available {getNextThreeMonths()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                  <Wallet className="size-4 text-accent" />
                </div>
                <span className="text-sm font-medium">{d.price} / person</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 lg:px-10 -mt-10 relative z-10">
          {/* Action Bar */}
          <div className="rounded-2xl bg-card/80 backdrop-blur-2xl border border-border shadow-pop p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Link to={`/results?sampleId=${d.id}`} className="h-12 px-6 rounded-2xl bg-warm-gradient text-white text-sm font-bold inline-flex items-center gap-2 shadow-cta hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Edit3 className="size-4" /> Edit Itinerary
              </Link>
              <button onClick={handleShare} className="h-12 px-6 rounded-2xl bg-secondary hover:bg-secondary/80 text-sm font-bold inline-flex items-center gap-2 transition-all cursor-pointer text-foreground">
                <Share2 className="size-4" /> Share
              </button>
              <button className="h-12 px-6 rounded-2xl bg-secondary hover:bg-secondary/80 text-sm font-bold inline-flex items-center gap-2 transition-all cursor-pointer text-foreground">
                <Copy className="size-4" /> Duplicate
              </button>
            </div>
            <div className="hidden md:flex items-center gap-4 px-4 text-sm font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5"><Heart className="size-4 text-destructive" /> 1.2k likes</span>
              <span className="flex items-center gap-1.5"><Compass className="size-4 text-emerald-500" /> 450+ booked</span>
            </div>
          </div>

          <div className="mt-12 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Overview Section */}
              <section className="space-y-6">
                <div>
                  <h2 className="font-sans font-bold text-2xl md:text-3xl tracking-tight text-foreground">Experience Overview</h2>
                  <p className="text-muted-foreground mt-3 text-base md:text-lg leading-relaxed max-w-3xl">
                    A {d.days} {d.tag.toLowerCase()} immersion through {d.name}'s most iconic spots. 
                    Curated for travelers who value authenticity, slow-paced exploration, and premium local experiences.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={Calendar} label="Duration" value={d.days} color="bg-blue-500/10 text-blue-500 dark:text-blue-400" />
                  <StatCard icon={Hotel} label="Stays" value="Luxury Haveli" color="bg-purple-500/10 text-purple-500 dark:text-purple-400" />
                  <StatCard icon={Plane} label="Transfers" value="Included" color="bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" />
                  <StatCard icon={Sparkles} label="Style" value="Curated AI" color="bg-amber-500/10 text-amber-500 dark:text-amber-400" />
                </div>
              </section>

              {/* Highlights Section */}
              <section className="rounded-2xl bg-card border border-border p-8">
                <h3 className="font-sans font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                  <Coffee className="size-5 text-accent" /> Quick Highlights
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    "Private guided tours of major landmarks",
                    "Authentic local cuisine tasting experiences",
                    "Premium stays in heritage properties",
                    "All intra-city transfers pre-arranged"
                  ].map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="size-6 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <Sparkles className="size-3 text-accent" />
                      </div>
                      <span className="text-sm font-medium text-foreground/90">{h}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Itinerary Section */}
              <section className="space-y-6">
                <h2 className="font-sans font-bold text-2xl md:text-3xl tracking-tight text-foreground">Day by Day Itinerary</h2>
                <div className="space-y-6">
                  {itinerary.map((day, idx) => {
                    const accent = DAY_ACCENT[idx % DAY_ACCENT.length];
                    return (
                      <div key={day.day} className="group rounded-2xl border border-border bg-card overflow-hidden">
                        {/* Day header */}
                        <div className={cn("px-4 sm:px-6 py-4 sm:py-5 border-b border-border flex items-center justify-between gap-3", `border-l-4 ${accent.border}`)}>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={cn("size-9 sm:size-10 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg text-white shrink-0", accent.dot)}>
                              {idx + 1}
                            </div>
                            <div className="min-w-0">
                              <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-0.5", accent.label)}>Day {idx + 1}</p>
                              <h2 className="text-sm sm:text-base font-bold text-foreground truncate">{day.title || `Day ${idx + 1}`}</h2>
                            </div>
                          </div>
                          <span className="text-[11px] text-muted-foreground font-medium bg-secondary px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                            {(day.items || []).length} stops
                          </span>
                        </div>

                        {/* Places list */}
                        <div className="divide-y divide-border/70">
                          {day.items.map((it, i) => {
                            const cfg = getTypeConfig(it.icon);
                            const Icon = iconMap[it.icon] || MapPin;
                            const isCurrentlyActive = activePlace && (it.place === (activePlace.name || activePlace.place));
                            const pIdx1 = i + 1;
                            
                            return (
                              <div key={i} className="relative group px-4 sm:px-6 py-5 hover:bg-secondary/30 transition-colors">
                                <div className="flex items-start gap-4">
                                  {/* Step number + icon stacked */}
                                  <div className="flex flex-col items-center gap-1 shrink-0">
                                    <div
                                      className="size-12 rounded-2xl flex items-center justify-center"
                                      style={{ backgroundColor: cfg.color + "20", border: `1.5px solid ${cfg.color}40` }}
                                    >
                                      <Icon className="size-5" style={{ color: cfg.color }} />
                                    </div>
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{pIdx1}</span>
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-[15px] sm:text-base text-foreground hover:text-indigo-650 dark:hover:text-indigo-300 transition-colors leading-snug">
                                      {it.place}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-0.5 mb-2">
                                      <MapPin className="size-2.5 text-muted-foreground shrink-0" />
                                      <span className="text-[11px] text-muted-foreground font-medium truncate">{d.name}</span>
                                    </div>

                                    <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                                      {it.desc}
                                    </p>

                                    {/* Chips row */}
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
                                        <Clock className="size-2.5" /> {it.time}
                                      </span>
                                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ color: cfg.color, backgroundColor: cfg.color + "15" }}>
                                        {cfg.label}
                                      </span>
                                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground bg-secondary/80 border border-border px-2 py-0.5 rounded-md">
                                        <Clock className="size-2.5" /> {cfg.duration}
                                      </span>
                                      <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${it.lat},${it.lng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackEvent("click_view_maps", "outbound_redirect", it.place)}
                                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md hover:bg-secondary-hover hover:text-foreground transition-colors"
                                      >
                                        <ExternalLink className="size-2.5" /> Maps
                                      </a>
                                    </div>
                                  </div>

                                  {/* Right side buttons */}
                                  <div className="flex items-center gap-2 shrink-0">
                                    <button 
                                      onClick={() => setActivePlace(it)}
                                      className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                        isCurrentlyActive 
                                          ? "bg-accent text-white" 
                                          : "bg-secondary text-muted-foreground hover:bg-secondary-hover hover:text-foreground border border-border"
                                      }`}
                                    >
                                      {isCurrentlyActive ? "Focused" : "Focus Map"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Sidebar Content */}
            <aside className="space-y-6">
              <div className="space-y-6">
                {/* Real Map Card */}
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-pop h-[450px] relative group">
                  <MapPreview 
                    itinerary={itinerary} 
                    activePlace={activePlace} 
                    onMarkerClick={(p) => setActivePlace(p)} 
                  />
                  <div className="absolute top-4 right-4 z-10">
                    <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest">
                      Interactive Map
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] z-10">
                    <div className="bg-background/90 backdrop-blur-xl rounded-2xl p-3 shadow-pop border border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                          <Compass className="size-4" />
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          {itinerary.reduce((acc, day) => acc + day.items.length, 0)} Curated Stops
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Budget Control Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-pop">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-sans font-bold text-lg text-foreground flex items-center gap-2">
                      <Wallet className="size-5 text-accent" /> Budget Control
                    </h3>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-0.5 rounded">AI Estimate</div>
                  </div>

                  <div className="space-y-5">
                    {[
                      { l: "Stays", p: 45, c: "bg-indigo-500", i: Hotel },
                      { l: "Food", p: 25, c: "bg-orange-500", i: Utensils },
                      { l: "Transport", p: 15, c: "bg-sky-500", i: Plane },
                      { l: "Activities", p: 15, c: "bg-rose-500", i: Camera },
                    ].map((r) => {
                      const totalNum = parseInt(d.price.replace(/[^\d]/g, ""));
                      const amount = Math.round((totalNum * r.p) / 100);
                      return (
                        <div key={r.l} className="group">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`size-8 rounded-lg ${r.c} bg-opacity-10 flex items-center justify-center`}>
                                <r.i className={`size-4 ${r.c.replace('bg-', 'text-')}`} />
                              </div>
                              <span className="font-medium text-muted-foreground">{r.l}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-foreground">₹{amount.toLocaleString("en-IN")}</div>
                              <div className="text-[10px] text-muted-foreground font-bold">{r.p}%</div>
                            </div>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full ${r.c} transition-all duration-1000 group-hover:brightness-110`}
                              style={{ width: `${r.p}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Estimate</div>
                    <div className="text-2xl font-sans font-bold text-foreground mt-1">
                      {d.price} <span className="text-sm font-normal text-muted-foreground">/ person</span>
                    </div>
                  </div>
                </div>

                {/* Stay Suggestions */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <h3 className="font-sans font-bold text-lg text-foreground mb-4 flex items-center justify-between">
                    Recommended Stays
                    <Link to="/explore-india" className="text-[10px] text-accent font-bold uppercase hover:underline">View All</Link>
                  </h3>
                  <div className="space-y-3">
                    {["The Heritage Palace", "The Luxury Boutique", "Royal Haveli"].map((h, i) => (
                      <div key={h} className="group flex items-center gap-4 rounded-2xl bg-secondary/30 p-3 hover:bg-secondary/60 transition-all cursor-pointer border border-transparent hover:border-border">
                        <div className="size-16 rounded-xl bg-gradient-to-br from-secondary to-border shrink-0 shadow-soft group-hover:scale-105 transition-transform overflow-hidden relative border border-border">
                           <div className="absolute inset-0 bg-black/20" />
                           <Hotel className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground size-6" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-foreground">{h}</div>
                          <div className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">{d.tag} Property</div>
                          <div className="text-sm font-bold text-accent mt-1">₹{6+i},200<span className="text-[10px] font-normal text-muted-foreground ml-1">/night</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => trackEvent("click_compare_hotels", "outbound_redirect", d.name)}
                    className="w-full mt-6 py-3 rounded-xl bg-secondary font-semibold text-sm text-muted-foreground hover:bg-secondary-hover hover:text-foreground transition-colors border border-border cursor-pointer"
                  >
                    Compare All Hotels
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string, color: string }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-5 shadow-soft hover:-translate-y-1 transition-transform">
      <div className={`size-10 rounded-xl ${color} flex items-center justify-center mb-4`}>
        <Icon className="size-5" />
      </div>
      <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{label}</div>
      <div className="text-base font-sans font-bold text-foreground mt-0.5">{value}</div>
    </div>
  );
}
