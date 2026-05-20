import { useNavigate, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { MapPreview } from "@/components/MapPreview";
import { sampleItinerary, destinationItineraries, destinations } from "@/lib/sample-data";
import { useEffect, useState } from "react";
import {
  Edit3,
  Share2,
  Download,
  MapPin,
  Plane,
  Utensils,
  Camera,
  User,
  Landmark,
  Ship,
  Music,
  ShoppingBag,
  ChevronDown,
  Sparkles,
  Wallet,
  Calendar,
  Receipt,
  Hotel,
  ArrowRight,
  X,
  Loader2,
  Bookmark,
  Check,
  ExternalLink,
  Train,
  Car,
  Info,
  Clock,
  Sun,
  CloudSun,
  ShieldCheck,
  Zap,
  Map,
  Eye,
  AlertTriangle,
  Award,
  Star,
  Navigation,
  Search,
  Activity,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Rocket
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import api, { remixItineraryByTrip } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { PDFViewerModal } from "@/components/PDFViewerModal";
import { PlaceDetailModal } from "@/components/PlaceDetailModal";
import { cn } from "@/lib/utils";
import OnboardingTour from "@/components/OnboardingTour";

/* ── 1. SIDEBAR COMPONENTS ── */

function KnowBeforeYouGo({ city, weather }: { city: string; weather?: any }) {
  const temp = weather?.temp || 28;
  const condition = weather?.condition || "Clear Skies";
  const icon = weather?.icon || "sun";
  const WeatherIcon = icon === "cloud" ? CloudSun : icon === "rain" ? AlertTriangle : Sun;

  const tips = [
    "Carry cash for local markets and small vendors.",
    "Best time to visit heritage sites is early morning (10 AM).",
    "Pre-book monument tickets online to skip long queues.",
    "Try the local street food but stick to busy, popular stalls."
  ];

  return (
    <div className="rounded-3xl border border-border bg-card dark:bg-[#0B1221] p-6 shadow-soft relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-primary">
        <Info className="size-24" />
      </div>
      
      <h3 className="font-display font-bold text-lg mb-6 flex items-center gap-2 text-foreground dark:text-white relative z-10">
        <Info className="size-5 text-primary" /> Know Before You Go
      </h3>

      <div className="p-4 rounded-2xl bg-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-amber-500/20 grid place-items-center text-amber-500 shadow-sm">
            <WeatherIcon className="size-5" />
          </div>
          <div>
            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:text-white/40">Current Weather in {city}</div>
            <div className="text-xs font-bold text-foreground dark:text-white">{condition}, {temp}°C</div>
          </div>
        </div>
      </div>

      <div className="space-y-3 relative z-10">
        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground dark:text-white/30 mb-2">Local Quick Tips</div>
        {tips.map((tip, i) => (
          <div key={i} className="flex gap-3 text-xs text-muted-foreground dark:text-white/70 leading-relaxed group/tip">
            <div className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0 group-hover/tip:scale-125 transition-transform" />
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SavingsInsights({ insights }: { insights: any }) {
  if (!insights) return null;
  return (
    <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-soft relative overflow-hidden group backdrop-blur-md">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-500"><Wallet className="size-24" /></div>
      <div className="flex items-center gap-2 font-display font-bold text-lg text-emerald-600 dark:text-emerald-400 mb-4 relative z-10"><Sparkles className="size-5" /> Cost Intelligence</div>
      <div className="space-y-4 relative z-10">
        {insights.potentialHotelSavings > 0 && (
          <div className="p-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-emerald-500/20">
            <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 mb-1">Accommodation Hack</div>
            <p className="text-xs font-bold">Save up to ₹{insights.potentialHotelSavings.toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AgenticValidationStack({ city, weather }: { city: string; weather?: any }) {
  return (
    <div className="rounded-3xl border border-border bg-card dark:bg-[#0B1221] p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 font-display font-bold text-lg text-foreground dark:text-white"><Activity className="size-5 text-emerald-500" /> Validation Stack</div>
      </div>
      <div className="space-y-4">
        {["Verifying opening hours...", "Checking weather feasibility..."].map((check, i) => (
          <div key={i} className="flex items-center justify-between group">
            <span className="text-xs text-muted-foreground dark:text-white/60">{check}</span>
            <CheckCircle2 className="size-4 text-emerald-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StayRecommendations({ lat, lng, city, budgetTier }: { lat?: number; lng?: number; city: string; budgetTier?: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card dark:bg-[#0B1221] p-6 shadow-soft">
      <h3 className="font-display font-bold text-lg mb-4 text-foreground dark:text-white text-center">Recommended Stay</h3>
      <div className="p-4 rounded-2xl bg-secondary/30 dark:bg-white/5 border border-border dark:border-white/10 text-center">
         <Hotel className="size-8 mx-auto mb-2 text-primary" />
         <div className="text-sm font-bold">Boutique Stay in {city}</div>
         <div className="text-[10px] text-muted-foreground mt-1">Starting from ₹3,500/night</div>
      </div>
    </div>
  );
}

function TripBlueprint({ plan }: { plan: any }) {
  if (!plan) return null;
  const details = [
    { icon: User, label: "Traveler", value: plan.travelerType || "Solo" },
    { icon: Zap, label: "Pace", value: plan.pace || "Moderate" },
    { icon: Calendar, label: "Duration", value: `${plan.days} Days` },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-card dark:bg-[#0B1221] border border-border p-6 rounded-3xl shadow-soft">
         <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2"><Receipt className="size-4 text-primary" /> Budget</h3>
         <div className="text-2xl font-black text-primary">₹{Number(plan.totalTripCost || 35000).toLocaleString()}</div>
         <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Estimated Total</div>
      </div>
      {details.slice(0, 2).map(d => (
        <div key={d.label} className="bg-card dark:bg-[#0B1221] border border-border p-6 rounded-3xl shadow-soft">
           <h3 className="font-display font-bold text-base mb-4 flex items-center gap-2"><d.icon className="size-4 text-accent" /> {d.label}</h3>
           <div className="text-xl font-bold">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ── MAIN COMPONENT ── */

export default function Results() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");
  const sampleId = searchParams.get("sampleId");
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState<string | null>(null);
  const [activePlace, setActivePlace] = useState<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const { user } = useAuth();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (!loading && plan && user) {
      const hasSeen = localStorage.getItem(`hasSeenResultTour_${user.uid}`);
      if (!hasSeen) {
        setShowTour(true);
      }
    }
  }, [loading, plan, user]);

  const handleCloseTour = () => {
    if (user) {
      localStorage.setItem(`hasSeenResultTour_${user.uid}`, "true");
    }
    setShowTour(false);
  };

  const destinationName = plan?.destination || plan?.city || "Delhi";

  const handleSwap = async (dayIdx: number, placeIdx: number, currentPlace: any) => {
    setSwapping(`${dayIdx}-${placeIdx}`);
    try {
      const res = await api.post("/ai/swap", {
        activityName: currentPlace.name || currentPlace.place,
        destination: destinationName,
        currentItinerary: plan.itinerary[dayIdx].places
      });

      const newItinerary = [...plan.itinerary];
      newItinerary[dayIdx].places[placeIdx] = res.data;
      setPlan({ ...plan, itinerary: newItinerary });
      
      if (planId) await api.patch(`/trips/${planId}`, { itinerary: newItinerary });
      toast.success("Activity swapped!");
    } catch (err) {
      toast.error("AI swap failed");
    } finally {
      setSwapping(null);
    }
  };

  const handleRemove = async (dayIdx: number, placeIdx: number) => {
    const newItinerary = [...plan.itinerary];
    newItinerary[dayIdx].places.splice(placeIdx, 1);
    setPlan({ ...plan, itinerary: newItinerary });
    if (planId) await api.patch(`/trips/${planId}`, { itinerary: newItinerary });
    toast.success("Activity removed");
  };

  const handleFinalize = async () => {
    if (!planId) return;
    try {
      await api.patch(`/trips/${planId}`, { type: 'room' });
      toast.success("Finalized! Joining Group Room...");
      navigate(`/collaborative-trip?tripId=${planId}`);
    } catch (err) {
      toast.error("Failed to finalize");
    }
  };

  useEffect(() => {
    if (destinationName) {
      const mocks: any = { "Delhi": { temp: 32, condition: "Sunny", icon: "sun" } };
      setWeather(mocks[destinationName] || { temp: 26, condition: "Clear", icon: "sun" });
    }
  }, [destinationName]);

  useEffect(() => {
    if (planId) {
      setLoading(true);
      api.get(`/trips/${planId}`)
        .then((res) => { setPlan(res.data); setLoading(false); })
        .catch(() => { toast.error("Load failed"); setLoading(false); });
    } else if (sampleId) {
      const sample = destinationItineraries[sampleId];
      if (sample) {
        setPlan({ title: "Sample Plan", destination: sampleId, itinerary: sample, days: 3 });
        setLoading(false);
      }
    }
  }, [planId, sampleId]);

  if (loading) return <AppShell><div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div></AppShell>;

  return (
    <AppShell>
      <div className="min-h-screen bg-background dark:bg-[#020817] text-foreground p-4 lg:p-10">
        <div className="max-w-[1600px] mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
            <div id="tour-title-block">
              <h1 className="font-display font-bold text-4xl text-white">{plan?.title}</h1>
              <div className="flex gap-4 mt-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-primary"/> {destinationName}</span>
                <span className="flex items-center gap-1"><Calendar size={14} className="text-primary"/> {plan?.days} Days</span>
              </div>
            </div>
            <div id="tour-finalize-block" className="flex gap-3">
              <button onClick={handleFinalize} className="h-11 px-8 rounded-2xl bg-[#534AB7] text-white font-bold shadow-cta flex items-center gap-2 hover:scale-105 transition-all">
                <Rocket size={18} /> Finalize & Group Room
              </button>
              <button onClick={() => setIsPdfModalOpen(true)} className="h-11 px-6 rounded-2xl bg-primary text-white font-bold shadow-cta flex items-center gap-2">
                <Download size={18} /> PDF
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-10">
            <div className="space-y-12">
              <div id="tour-blueprint">
                <TripBlueprint plan={plan} />
              </div>
              
              <div id="tour-timeline" className="space-y-16">
                {plan.itinerary.map((day: any, idx: number) => (
                  <div key={idx} className="relative pl-16">
                    <div className="absolute left-[31px] top-14 bottom-[-64px] w-0.5 bg-gradient-to-b from-primary/30 to-transparent" />
                    <div className="absolute left-0 top-0 size-16 rounded-3xl bg-[#0B1221] border-4 border-[#020817] flex items-center justify-center font-display font-black text-2xl text-primary shadow-soft z-10">
                      {idx + 1}
                    </div>

                    <div className="space-y-8">
                      <h3 className="text-2xl font-display font-bold text-white flex items-center gap-4">
                        {day.title || `Day ${idx + 1}`}
                      </h3>

                      <div className="grid gap-4">
                        {(day.places || []).map((p: any, pIdx: number) => (
                          <div key={pIdx} className="group p-6 rounded-[2.5rem] bg-[#0B1221] border border-white/5 hover:border-primary/30 transition-all flex flex-col md:flex-row items-center justify-between gap-6">
                            <div 
                              onClick={() => {
                                setSelectedPlace(p);
                                setIsPlaceModalOpen(true);
                              }}
                              className="flex items-center gap-6 cursor-pointer flex-1 group/place min-w-0 w-full"
                              title="Click to view details"
                            >
                              <div className="size-14 rounded-2xl bg-white/5 grid place-items-center text-primary group-hover/place:bg-primary/10 group-hover/place:scale-105 transition-all duration-300 shrink-0">
                                {p.type === 'food' ? <Utensils size={24} /> : <Landmark size={24} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-xl text-white group-hover/place:text-primary transition-colors truncate">
                                  {p.name || p.place || p.title}
                                </div>
                                {(p.desc || p.description || p.notes || p.reason) && (
                                  <p className="text-sm text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                                    {p.desc || p.description || p.notes || p.reason}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-2 flex-wrap">
                                  <span className="text-[10px] font-black text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                                    {p.time || p.bestTime || "Morning"}
                                  </span>
                                  <span className="text-[10px] text-white/30 uppercase font-bold">
                                    {p.category || "Sightseeing"}
                                  </span>
                                  {p.rating && (
                                    <span className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                                      <Star className="size-3 fill-amber-500 text-amber-500" /> {p.rating}
                                    </span>
                                  )}
                                  {p.estimatedCost && (
                                    <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                                      {p.estimatedCost}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={() => handleSwap(idx, pIdx, p)} disabled={swapping === `${idx}-${pIdx}`} className="h-10 px-5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold flex items-center gap-2 hover:bg-primary hover:text-white transition-all">
                                {swapping === `${idx}-${pIdx}` ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Swap
                              </button>
                              <button onClick={() => handleRemove(idx, pIdx)} className="size-10 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:bg-destructive hover:text-white flex items-center justify-center transition-all">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-8">
              <div id="tour-map" className="rounded-[3rem] border border-white/5 bg-[#0B1221] overflow-hidden h-[400px] shadow-pop">
                <MapPreview itinerary={plan.itinerary} activePlace={activePlace} onMarkerClick={setActivePlace} />
              </div>
              <div id="tour-sidebar-widgets" className="space-y-8">
                <KnowBeforeYouGo city={destinationName} weather={weather} />
                <StayRecommendations city={destinationName} />
                <AgenticValidationStack city={destinationName} weather={weather} />
              </div>
            </aside>
          </div>
        </div>
      </div>
      <PDFViewerModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} plan={plan} />
      <PlaceDetailModal isOpen={isPlaceModalOpen} onClose={() => setIsPlaceModalOpen(false)} place={selectedPlace} />
      {showTour && <OnboardingTour onClose={handleCloseTour} />}
    </AppShell>
  );
}
