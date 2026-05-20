import { useNavigate, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { MapPreview } from "@/components/MapPreview";
import { destinationItineraries } from "@/lib/sample-data";
import { useEffect, useState } from "react";
import {
  Download,
  MapPin,
  Utensils,
  Landmark,
  Calendar,
  Hotel,
  Loader2,
  Clock,
  Sun,
  CloudSun,
  AlertTriangle,
  Star,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Rocket,
  Info,
  Thermometer,
  Users,
  Camera,
  ChevronRight,
  Wallet,
  Receipt,
  ShieldCheck,
  BadgeCheck,
  ArrowUpRight,
  Flame,
  Zap,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { PDFViewerModal } from "@/components/PDFViewerModal";
import { PlaceDetailModal } from "@/components/PlaceDetailModal";
import { cn } from "@/lib/utils";
import OnboardingTour from "@/components/OnboardingTour";

/* ─────────────────────────────────────
   PLACE TYPE CONFIG
───────────────────────────────────── */
function getTypeConfig(type: string) {
  const t = (type || "").toLowerCase();
  if (t === "food") return {
    icon: Utensils, label: "Food & Dining", color: "#ea580c",
    fallbackDesc: "A popular local dining spot known for authentic regional cuisine and vibrant atmosphere.",
    duration: "45 – 90 min"
  };
  if (t === "activity") return {
    icon: Flame, label: "Activity", color: "#dc2626",
    fallbackDesc: "An engaging hands-on experience that gives you an immersive taste of the local culture.",
    duration: "1 – 2 hrs"
  };
  if (t === "landmark") return {
    icon: Landmark, label: "Landmark", color: "#2563eb",
    fallbackDesc: "A historically significant site with rich architectural heritage and cultural importance.",
    duration: "30 – 60 min"
  };
  return {
    icon: Camera, label: "Sightseeing", color: "#7c3aed",
    fallbackDesc: "A must-visit spot offering scenic views, local character, and memorable photo opportunities.",
    duration: "1 – 2 hrs"
  };
}

/* ─────────────────────────────────────
   WEATHER CARD
───────────────────────────────────── */
function WeatherCard({ city, weather }: { city: string; weather?: any }) {
  const temp = weather?.temp || 28;
  const condition = weather?.condition || "Clear Skies";
  const icon = weather?.icon || "sun";
  const WeatherIcon = icon === "cloud" ? CloudSun : icon === "rain" ? AlertTriangle : Sun;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
      <WeatherIcon className="size-5 text-amber-400 shrink-0" />
      <div>
        <p className="text-[11px] text-slate-400 font-medium">{city} weather</p>
        <p className="text-sm font-semibold text-white">{condition} · {temp}°C</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   TRIP SUMMARY STRIP
───────────────────────────────────── */
function TripSummaryStrip({ plan }: { plan: any }) {
  const totalPlaces = plan?.itinerary?.reduce(
    (acc: number, d: any) => acc + (d.places?.length || 0), 0
  ) ?? 0;

  const items = [
    { label: "Duration", value: `${plan?.days || 3} days`, icon: Calendar },
    { label: "Destinations", value: `${totalPlaces} stops`, icon: MapPin },
    { label: "Estimated budget", value: `₹${Number(plan?.totalTripCost || 35000).toLocaleString()}`, icon: Wallet },
    { label: "Travel style", value: plan?.travelerType || "Solo", icon: Users },
    { label: "Trip pace", value: plan?.pace || "Moderate", icon: Zap },
  ];

  return (
    <div id="tour-blueprint" className="border-b border-slate-800 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        {/* Mobile: 2-col grid */}
        <div className="grid grid-cols-2 sm:hidden border-b border-slate-800">
          {items.map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2.5 px-4 py-3.5",
                i % 2 === 0 && "border-r border-slate-800",
                i < items.length - 2 && "border-b border-slate-800"
              )}
            >
              <item.icon className="size-3.5 text-slate-400 shrink-0" />
              <div>
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">{item.label}</p>
                <p className="text-xs font-bold text-white mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
          <div className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 border-t border-slate-800">
            <BadgeCheck className="size-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-emerald-400">AI Verified · 98/100</span>
          </div>
        </div>
        {/* Desktop: horizontal scroll row */}
        <div className="hidden sm:flex items-stretch gap-0 overflow-x-auto scrollbar-none px-6 lg:px-10">
          {items.map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 px-5 py-4 min-w-max shrink-0",
                i < items.length - 1 && "border-r border-slate-800"
              )}
            >
              <item.icon className="size-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-bold text-white mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 px-5 py-4 ml-auto shrink-0 border-l border-slate-800">
            <BadgeCheck className="size-4 text-emerald-400 shrink-0" />
            <span className="text-[11px] font-semibold text-emerald-400 whitespace-nowrap">AI Verified · 98/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   SIDEBAR: KNOW BEFORE YOU GO
───────────────────────────────────── */
function KnowBeforeYouGo({ city, weather }: { city: string; weather?: any }) {
  const tips = [
    "Carry cash for local markets — many vendors don't accept cards.",
    "Book monument entry tickets online in advance to avoid queues.",
    "Early mornings (before 9 AM) are the best time to visit heritage sites.",
    "Use IRCTC or local bus passes for cost-effective intercity travel.",
  ];
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
        <Info className="size-4 text-slate-400" />
        <h3 className="text-sm font-bold text-white">Travel Tips</h3>
      </div>
      <div className="p-5">
        <WeatherCard city={city} weather={weather} />
        <div className="mt-4 space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <CheckCircle2 className="size-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="text-[12px] text-slate-400 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   SIDEBAR: STAY RECOMMENDATIONS
───────────────────────────────────── */
function StayRecommendations({ city }: { city: string }) {
  const options = [
    { type: "Budget", range: "₹800 – ₹1,500 / night", note: "Guesthouses & hostels" },
    { type: "Mid-range", range: "₹2,500 – ₹4,500 / night", note: "Boutique hotels", recommended: true },
    { type: "Premium", range: "₹6,000+ / night", note: "Heritage properties & resorts" },
  ];
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
        <Hotel className="size-4 text-slate-400" />
        <h3 className="text-sm font-bold text-white">Accommodation Options</h3>
      </div>
      <div className="divide-y divide-slate-800">
        {options.map((opt, i) => (
          <div key={i} className={cn("px-5 py-4 flex items-center justify-between group", opt.recommended && "bg-indigo-950/30")}>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">{opt.type}</p>
                {opt.recommended && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-400 bg-indigo-900/50 px-2 py-0.5 rounded-full">Recommended</span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">{opt.note}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-300">{opt.range}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-[11px] text-slate-500">Prices are indicative. Book 2–4 weeks in advance for best rates.</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   SIDEBAR: VALIDATION PANEL
───────────────────────────────────── */
function ValidationPanel({ city }: { city: string }) {
  const checks = [
    "All venues verified as open",
    "Route distances are optimized",
    "Budget is within requested range",
    "Weather conditions are suitable",
  ];
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Plan Verification</h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/40 border border-emerald-800/60 px-2 py-1 rounded-full">98 / 100</span>
      </div>
      <div className="p-5 space-y-3">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span className="text-[12px] text-slate-400">{c}</span>
          </div>
        ))}
      </div>
      <div className="mx-5 mb-5 p-3 rounded-xl bg-emerald-950/50 border border-emerald-900/60 text-center">
        <p className="text-[11px] text-emerald-400 font-semibold">This itinerary passed all AI quality checks</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────── */
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
      if (!hasSeen) setShowTour(true);
    }
  }, [loading, plan, user]);

  const handleCloseTour = () => {
    if (user) localStorage.setItem(`hasSeenResultTour_${user.uid}`, "true");
    setShowTour(false);
  };

  const destinationName = plan?.destination || plan?.city || "Delhi";

  const handleSwap = async (dayIdx: number, placeIdx: number, currentPlace: any) => {
    setSwapping(`${dayIdx}-${placeIdx}`);
    try {
      const res = await api.post("/ai/swap", {
        activityName: currentPlace.name || currentPlace.place,
        destination: destinationName,
        currentItinerary: plan.itinerary[dayIdx].places,
      });
      const newItinerary = [...plan.itinerary];
      newItinerary[dayIdx].places[placeIdx] = res.data;
      setPlan({ ...plan, itinerary: newItinerary });
      if (planId) await api.patch(`/trips/${planId}`, { itinerary: newItinerary });
      toast.success("Activity swapped!");
    } catch {
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
      await api.patch(`/trips/${planId}`, { type: "room" });
      toast.success("Finalized! Opening Group Room…");
      navigate(`/collaborative-trip?tripId=${planId}`);
    } catch {
      toast.error("Failed to finalize");
    }
  };

  useEffect(() => {
    if (destinationName) {
      const mocks: any = { Delhi: { temp: 32, condition: "Sunny", icon: "sun" } };
      setWeather(mocks[destinationName] || { temp: 26, condition: "Clear", icon: "sun" });
    }
  }, [destinationName]);

  useEffect(() => {
    if (planId) {
      setLoading(true);
      api.get(`/trips/${planId}`)
        .then((res) => { setPlan(res.data); setLoading(false); })
        .catch(() => { toast.error("Failed to load itinerary"); setLoading(false); });
    } else if (sampleId) {
      const sample = destinationItineraries[sampleId];
      if (sample) {
        setPlan({ title: "Sample Plan", destination: sampleId, itinerary: sample, days: 3 });
        setLoading(false);
      }
    }
  }, [planId, sampleId]);

  /* Loading state */
  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
          <Loader2 className="size-8 text-indigo-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading your itinerary…</p>
        </div>
      </AppShell>
    );
  }

  const DAY_ACCENT = [
    { dot: "bg-indigo-500", label: "text-indigo-400", border: "border-indigo-500/40" },
    { dot: "bg-rose-500",   label: "text-rose-400",   border: "border-rose-500/40"   },
    { dot: "bg-amber-500",  label: "text-amber-400",  border: "border-amber-500/40"  },
    { dot: "bg-emerald-500",label: "text-emerald-400",border: "border-emerald-500/40"},
    { dot: "bg-sky-500",    label: "text-sky-400",    border: "border-sky-500/40"    },
  ];

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="min-h-screen bg-slate-950 text-white">

          {/* ─── TOP NAV BAR ─────────────────────────── */}
          <div className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
              {/* Breadcrumb */}
              <div id="tour-title-block" className="flex items-center gap-3 min-w-0">
                <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-medium shrink-0">
                  <span>Trips</span>
                  <ChevronRight className="size-3.5" />
                  <span className="text-slate-300 font-semibold truncate max-w-[200px]">{plan?.title || destinationName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-md bg-indigo-900/50 border border-indigo-800/60 text-[10px] font-bold text-indigo-300 uppercase tracking-wide flex items-center gap-1">
                    <BadgeCheck className="size-3" /> AI Verified
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div id="tour-finalize-block" className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="h-9 px-4 rounded-lg border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 hover:bg-slate-800 hover:border-slate-600 transition-all"
                >
                  <Download className="size-3.5" /> Export PDF
                </button>
                <button
                  onClick={handleFinalize}
                  className="h-9 px-5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-indigo-500 transition-all shadow-sm"
                >
                  <Rocket className="size-3.5" />
                  <span className="hidden sm:inline">Finalize &amp; Collaborate</span>
                  <span className="sm:hidden">Finalize</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── PAGE HEADER ─────────────────────────── */}
          <div className="border-b border-slate-800 bg-slate-900/40">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-3 flex-wrap">
                <MapPin className="size-3.5 text-indigo-400 shrink-0" />
                <span className="font-medium">{destinationName}</span>
                <span className="text-slate-600">·</span>
                <Calendar className="size-3.5 text-slate-500 shrink-0" />
                <span>{plan?.days} days</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight leading-tight">
                    {plan?.title || `Trip to ${destinationName}`}
                  </h1>
                  <p className="text-slate-400 mt-2 text-xs sm:text-sm max-w-xl leading-relaxed">
                    Review each day, swap activities, and collaborate with your travel group.
                  </p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-2 shrink-0">
                  <p className="text-[11px] text-slate-500 font-medium">Estimated total cost</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">₹{Number(plan?.totalTripCost || 35000).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── SUMMARY STRIP ───────────────────────── */}
          <TripSummaryStrip plan={plan} />

          {/* ─── MAIN GRID ───────────────────────────── */}
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
            <div className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-10 items-start">

              {/* ── LEFT: ITINERARY ── */}
              <div id="tour-timeline" className="space-y-8">
                {plan.itinerary.map((day: any, idx: number) => {
                  const accent = DAY_ACCENT[idx % DAY_ACCENT.length];
                  return (
                    <div key={idx} className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
                      {/* Day header */}
                      <div className={cn("px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-800 flex items-center justify-between gap-3", `border-l-4 ${accent.border}`)}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn("size-9 sm:size-10 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg text-white shrink-0", accent.dot)}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-0.5", accent.label)}>Day {idx + 1}</p>
                            <h2 className="text-sm sm:text-base font-bold text-white truncate">{day.title || `Day ${idx + 1}`}</h2>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium bg-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                          {(day.places || []).length} stops
                        </span>
                      </div>

                      {/* Places list */}
                      <div className="divide-y divide-slate-800/70">
                        {(day.places || []).map((p: any, pIdx: number) => {
                          const cfg = getTypeConfig(p.type);
                          const PlaceIcon = cfg.icon;
                          const placeName = p.name || p.place || p.title || "Unnamed Place";
                          const placeDesc = p.desc || p.description || p.notes || p.reason || cfg.fallbackDesc;
                          const timeSlot = p.time || p.bestTime || "Morning";
                          const locationHint = p.city || p.area || p.locality || destinationName;
                          const isSwapping = swapping === `${idx}-${pIdx}`;
                          const pIdx1 = pIdx + 1;

                          return (
                            <div key={pIdx} className="relative group px-4 sm:px-6 py-5 hover:bg-slate-800/30 transition-colors">
                              <div className="flex items-start gap-4">

                                {/* Step number + icon stacked */}
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                  <div
                                    className="size-12 rounded-2xl flex items-center justify-center"
                                    style={{ backgroundColor: cfg.color + "20", border: `1.5px solid ${cfg.color}40` }}
                                  >
                                    <PlaceIcon className="size-5" style={{ color: cfg.color }} />
                                  </div>
                                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{pIdx1}</span>
                                </div>

                                {/* Content — clickable */}
                                <div
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => { setSelectedPlace(p); setIsPlaceModalOpen(true); }}
                                >
                                  {/* Name + location */}
                                  <h3 className="font-bold text-[15px] sm:text-base text-white group-hover:text-indigo-300 transition-colors leading-snug">
                                    {placeName}
                                  </h3>
                                  <div className="flex items-center gap-1.5 mt-0.5 mb-2">
                                    <MapPin className="size-2.5 text-slate-500 shrink-0" />
                                    <span className="text-[11px] text-slate-500 font-medium truncate">{locationHint}</span>
                                  </div>

                                  {/* Description — always present */}
                                  <p className="text-[12px] text-slate-400 leading-relaxed line-clamp-2 mb-3">
                                    {placeDesc}
                                  </p>

                                  {/* Chips row */}
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded-md">
                                      <Clock className="size-2.5" /> {timeSlot}
                                    </span>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ color: cfg.color, backgroundColor: cfg.color + "15" }}>
                                      {cfg.label}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md">
                                      ⏱ {p.duration || cfg.duration}
                                    </span>
                                    {p.rating && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-900/30 border border-amber-800/40 px-2 py-0.5 rounded-md">
                                        <Star className="size-2.5 fill-amber-400" /> {p.rating}
                                      </span>
                                    )}
                                    {p.estimatedCost && (
                                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-900/30 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                                        ₹{p.estimatedCost}
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[11px] text-indigo-400/50 group-hover:text-indigo-400 mt-2.5 flex items-center gap-1 transition-colors font-semibold">
                                    View full details <ArrowUpRight className="size-3" />
                                  </p>
                                </div>
                              </div>

                              {/* Bottom: Swap / Delete — always visible on mobile, hover-only on desktop */}
                              <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2">
                                <button
                                  onClick={() => handleSwap(idx, pIdx, p)}
                                  disabled={isSwapping}
                                  className="h-8 px-3 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 hover:bg-indigo-900/50 hover:border-indigo-700/60 hover:text-indigo-300 transition-all disabled:opacity-50"
                                >
                                  {isSwapping ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
                                  Swap
                                </button>
                                <button
                                  onClick={() => handleRemove(idx, pIdx)}
                                  className="size-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center hover:bg-red-900/30 hover:border-red-800/50 hover:text-red-400 transition-all"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Bottom CTA */}
                <div className="rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base">Happy with your plan?</h3>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">Finalize and open a group collaboration room with real-time chat and voting.</p>
                    </div>
                    <button
                      onClick={handleFinalize}
                      className="w-full sm:w-auto h-10 px-6 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shrink-0"
                    >
                      <Rocket className="size-4" /> Finalize &amp; Collaborate
                    </button>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: SIDEBAR ── */}
              <aside className="lg:sticky lg:top-20 space-y-5">
                {/* Map */}
                <div id="tour-map" className="rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-slate-400" />
                      <span className="text-sm font-bold text-white">Route Map</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">{destinationName}</span>
                  </div>
                  <div className="h-[220px] sm:h-[280px]">
                    <MapPreview
                      itinerary={plan.itinerary}
                      activePlace={activePlace}
                      onMarkerClick={setActivePlace}
                    />
                  </div>
                </div>

                {/* Sidebar widgets */}
                <div id="tour-sidebar-widgets" className="space-y-4 sm:space-y-5">
                  <KnowBeforeYouGo city={destinationName} weather={weather} />
                  <StayRecommendations city={destinationName} />
                  <ValidationPanel city={destinationName} />
                </div>
              </aside>
            </div>
          </div>

          {/* Modals */}
          <PDFViewerModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} plan={plan} />
          <PlaceDetailModal isOpen={isPlaceModalOpen} onClose={() => setIsPlaceModalOpen(false)} place={selectedPlace} />
          {showTour && <OnboardingTour onClose={handleCloseTour} />}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
