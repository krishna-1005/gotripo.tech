import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { MapPin, Clock, Calendar, CheckCircle2, ArrowRight, Loader2, Share2, Heart, Info, Map } from "lucide-react";
import { motion } from "framer-motion";

export default function YatraDetailPage() {
  const { id } = useParams();
  const [yatra, setYatra] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchYatra = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/yatra/${id}`);
        setYatra(res.data);
      } catch (err) {
        console.error("Failed to fetch yatra details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchYatra();
  }, [id]);

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="size-12 text-accent animate-spin" />
      </div>
    </AppShell>
  );

  if (!yatra) return (
    <AppShell>
      <div className="text-center py-24 bg-background min-h-screen flex flex-col items-center justify-center">
        <div className="size-20 rounded-2xl bg-secondary flex items-center justify-center mb-6">
          <Info className="size-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-display font-bold mb-2">Yatra not found</h1>
        <p className="text-muted-foreground mb-8">The journey you're looking for doesn't exist or has been moved.</p>
        <Link to="/yatra" className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 transition-all">
          Back to Explorations
        </Link>
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <div className="bg-background min-h-screen pb-24 transition-colors">
        {/* Banner - Cinematic & High-End */}
        <div className="h-[65vh] relative overflow-hidden">
          <img src={yatra.imageUrl} alt={yatra.name} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent" />
          
          <div className="absolute inset-0 flex items-end pb-20 px-6 lg:px-10">
            <div className="max-w-7xl mx-auto w-full">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-accent text-white text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-md shadow-lg">
                    {yatra.category}
                  </span>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                    <MapPin className="size-3" /> {yatra.location}
                  </div>
                </div>
                <h1 className="text-5xl md:text-8xl font-display font-bold text-white tracking-tight leading-[1.1] mb-8">
                  {yatra.name}
                </h1>
                
                <div className="flex items-center gap-4">
                   <button className="h-12 px-6 rounded-xl bg-white text-primary font-bold text-sm flex items-center gap-2 hover:bg-slate-100 transition-all">
                     <Share2 className="size-4" /> Share
                   </button>
                   <button className="size-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-all">
                     <Heart className="size-5" />
                   </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 mt-16 grid lg:grid-cols-12 gap-16">
          {/* Main Content - Sophisticated Typography */}
          <div className="lg:col-span-8">
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                 <div className="h-8 w-1 bg-accent rounded-full" />
                 <h2 className="text-3xl font-display font-bold">The Divine Narrative</h2>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                {yatra.description}
              </p>
            </section>

            <section className="mb-16">
               <div className="flex items-center gap-3 mb-8">
                 <div className="h-8 w-1 bg-accent rounded-full" />
                 <h2 className="text-3xl font-display font-bold">Spiritual Benchmarks</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                {yatra.highlights.map((h: string, i: number) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-4 p-6 rounded-2xl bg-surface border border-border group hover:border-accent/30 transition-all"
                  >
                    <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="size-5 text-accent" />
                    </div>
                    <span className="font-bold text-foreground leading-tight">{h}</span>
                  </motion.div>
                ))}
              </div>
            </section>

            <section>
               <div className="flex items-center gap-3 mb-8">
                 <div className="h-8 w-1 bg-accent rounded-full" />
                 <h2 className="text-3xl font-display font-bold">Journey Map</h2>
              </div>
              <div className="aspect-video rounded-3xl bg-secondary overflow-hidden border border-border group relative">
                 <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-black/0 transition-all cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                       <Map className="size-12 text-muted-foreground opacity-40 group-hover:scale-110 transition-transform" />
                       <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Preview Route</span>
                    </div>
                 </div>
                 {/* Placeholder for actual map integration */}
                 <div className="size-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
              </div>
            </section>
          </div>

          {/* Sidebar - Sleek & Action-Oriented */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="p-8 rounded-3xl bg-surface border border-border shadow-card overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                
                <h3 className="text-xl font-display font-bold mb-8 flex items-center gap-2">
                   <Stars className="size-5 text-accent" /> Essential Metrics
                </h3>

                <div className="space-y-8 mb-10 relative z-10">
                  <div className="flex items-center gap-5">
                    <div className="size-12 rounded-xl bg-secondary flex items-center justify-center text-primary">
                      <Clock className="size-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Estimated Time</div>
                      <div className="font-bold text-lg">{yatra.duration}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="size-12 rounded-xl bg-secondary flex items-center justify-center text-primary">
                      <Calendar className="size-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Peak Season</div>
                      <div className="font-bold text-lg">{yatra.bestTimeToVisit}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="size-12 rounded-xl bg-secondary flex items-center justify-center text-primary">
                      <MapPin className="size-6" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Geographic Region</div>
                      <div className="font-bold text-lg">{yatra.location}</div>
                    </div>
                  </div>
                </div>

                <Link 
                  to={`/yatra/plan?name=${encodeURIComponent(yatra.name)}`}
                  className="w-full h-16 rounded-xl bg-primary text-white font-bold text-lg flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-lg active:scale-[0.98]"
                >
                  Configure My Journey <ArrowRight className="size-5 text-accent" />
                </Link>
                
                <p className="text-[10px] text-center text-muted-foreground mt-6 font-bold uppercase tracking-widest opacity-60">
                   AI-Powered Itinerary Manifestation
                </p>
              </div>

              <div className="mt-8 p-6 rounded-2xl bg-accent/5 border border-accent/10 flex items-center gap-4">
                 <div className="size-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <Info className="size-5 text-accent" />
                 </div>
                 <p className="text-xs text-accent-foreground font-medium leading-relaxed">
                   Need a customized group experience? <button className="font-bold underline">Consult our guides</button>.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stars({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" fill="none" 
      stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M11.083 5.104c.35-.8 1.485-.8 1.834 0l1.752 4.022a1 1 0 0 0 .84.597l4.463.342c.9.069 1.255 1.2.556 1.771l-3.33 2.723a1 1 0 0 0-.317 1.03l1.112 4.472c.22.88-.745 1.58-1.497 1.075l-3.871-2.61a1 1 0 0 0-1.11 0l-3.87 2.61c-.752.505-1.717-.195-1.497-1.075l1.112-4.472a1 1 0 0 0-.317-1.03L3.5 11.836c-.7-.571-.344-1.702.557-1.771l4.462-.342a1 1 0 0 0 .84-.597l1.753-4.022Z" />
      <path d="M22 2s-1 2-1 2" />
      <path d="M11 2s0 2 0 2" />
      <path d="M4 2s1 2 1 2" />
      <path d="M2 11s2 0 2 0" />
    </svg>
  );
}
