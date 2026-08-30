import { useNavigate, useSearchParams } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState, ReactNode } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Wallet, 
  Sparkles, 
  Mountain, 
  Tent, 
  Heart, 
  Loader2, 
  Flame,
  User,
  Users
} from "lucide-react";
import api, { generatePlan } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { trackEvent } from "@/lib/analytics";

function ProactiveCostIntel({ startDate, days }: { startDate: string, days: number }) {
  const [suggestion, setSuggestion] = useState<any>(null);

  useEffect(() => {
    // Basic mid-week logic for proactive UI
    const date = new Date(startDate);
    const day = date.getDay();
    
    // If starting on a weekend (Fri, Sat, Sun), suggest a mid-week start
    if (day === 0 || day === 5 || day === 6) {
      const midWeek = new Date(date);
      midWeek.setDate(date.getDate() + (3 - day + 7) % 7); // Move to next Wednesday
      setSuggestion({
        date: midWeek.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        savings: "15-20%",
        reason: "Mid-week flights and hotels are significantly cheaper."
      });
    } else {
      setSuggestion(null);
    }
  }, [startDate, days]);

  if (!suggestion) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3"
    >
      <div className="size-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0">
        <Sparkles className="size-4" />
      </div>
      <div>
        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Savings Alert</div>
        <p className="text-[11px] leading-relaxed">
          Starting your trip on <span className="font-bold underline">{suggestion.date}</span> could save you up to <span className="font-bold">{suggestion.savings}</span>. {suggestion.reason}
        </p>
      </div>
    </motion.div>
  );
}

const styles = [
  { id: "solo", label: "Solo", icon: User },
  { id: "family", label: "Family", icon: Users },
  { id: "backpacking", label: "Backpacking", icon: Tent },
  { id: "luxury", label: "Luxury", icon: Sparkles },
];

export default function PlannerSingle() {
  return (
    <PlannerSingleContent />
  );
}

function PlannerSingleContent() {
  const { user, loading: authLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialDest = searchParams.get("dest") || "Delhi";
  const initialDays = parseInt(searchParams.get("days") || "5");

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(new Date());
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + initialDays - 1);
  const futureStr = getLocalDateString(futureDate);

  const [destination, setDestination] = useState(initialDest);
  const [sourceCity, setSourceCity] = useState("");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(futureStr);
  const [days, setDays] = useState(initialDays);
  const [budget, setBudget] = useState(35000);
  const [style, setStyle] = useState("luxury");
  const [dietary, setDietary] = useState("any");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Photography", "Food trail"]);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState("local culture");
  const [planningStyle, setPlanningStyle] = useState("balanced"); // Final Change 4
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fetchingPreview, setFetchingPreview] = useState(false);

  const allInterests = ["Photography", "Food trail", "Nature", "Heritage", "Ancient Places", "Adventure", "Spiritual", "Shopping", "Nightlife"];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  // Update days when dates change
  useEffect(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      setEndDate(startDate);
      setDays(1);
      return;
    }

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (!isNaN(diffDays)) {
      setDays(diffDays);
    }
  }, [startDate, endDate]);

  // Auto-trigger generation if we just logged in and have pending data
  useEffect(() => {
    if (authLoading || !user) return;
    
    const pending = sessionStorage.getItem("pending_plan_single");
    if (pending) {
      sessionStorage.removeItem("pending_plan_single");
      const data = JSON.parse(pending);
      // Restore state if needed, but the data is already in the function call below
      setDestination(data.city);
      setDays(data.days);
      setBudget(data.budget);
      setStyle(data.travelerType);
      setSelectedInterests(data.interests || ["Photography", "Food trail"]);
      
      // We can't call handleGenerate directly because it needs the latest state
      // but we can pass the data to a helper or just run it with the parsed data
      const runGeneration = async () => {
        setLoading(true);
        try {
          const plan = await generatePlan(data);
          const planId = plan._id || plan.id;
          trackEvent("generate_itinerary", "engagement", `single_city: ${data.city}`);
          navigate(`/results?planId=${planId}`);
        } catch (err: any) {
          toast.error(err.message || "Failed to generate plan");
        } finally {
          setLoading(false);
        }
      };
      runGeneration();
    }
  }, [user, authLoading, navigate]);

  // Fetch quick preview data when destination changes
  useEffect(() => {
    if (!destination.trim()) return;
    
    const delayDebounceFn = setTimeout(() => {
      setFetchingPreview(true);
      api.post("/nearby", { city: destination, radius: 20 })
        .then(res => {
          setPreviewData(res.data.slice(0, 4));
        })
        .catch(() => {
          // Fallback if API fails
          setPreviewData([
            { name: "Major Landmark" },
            { name: "Popular Cafe" },
            { name: "Historical Site" },
            { name: "Shopping Street" }
          ]);
        })
        .finally(() => {
          setFetchingPreview(false);
        });
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [destination]);

  const handleGenerate = async () => {
    if (!destination.trim()) {
      toast.error("Please enter a destination");
      return;
    }

    if (selectedInterests.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }

    const planData = {
      city: destination,
      sourceCity: sourceCity.trim() || undefined,
      days: days,
      budget,
      interests: selectedInterests,
      travelerType: style,
      pace: "balanced",
      mood,
      planningStyle,
      userPreferences: {
        dietary: dietary
      }
    };

    if (!user) {
      // Save data and redirect to auth
      sessionStorage.setItem("pending_plan_single", JSON.stringify(planData));
      toast.info("Please sign in to save and view your plan");
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setLoading(true);
    try {
      const plan = await generatePlan(planData);
      const planId = plan._id || plan.id;
      trackEvent("generate_itinerary", "engagement", `single_city: ${destination}`);
      navigate(`/results?planId=${planId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto">
        <div className="text-sm font-semibold text-accent uppercase tracking-widest">Step 2 · Single destination</div>
        <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl tracking-tight">Tell us the vibe.</h1>

        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          {/* LEFT: Inputs */}
          <div className="rounded-3xl bg-card border border-border p-7 shadow-soft space-y-7">
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Current Location" icon={<MapPin className="size-4" />}>
                <LocationAutocomplete
                  value={sourceCity}
                  onChange={setSourceCity}
                  placeholder="Your city (e.g. Patna)"
                  className="w-full h-12 px-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm transition-all"
                />
              </Field>
              <Field label="Destination" icon={<MapPin className="size-4" />}>
                <LocationAutocomplete
                  value={destination}
                  onChange={setDestination}
                  placeholder="Where to? (e.g. Banaras)"
                  className="w-full h-12 px-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm transition-all"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="From" icon={<Calendar className="size-4" />}>
                <input
                  type="date"
                  value={startDate}
                  min={todayStr}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm"
                />
              </Field>
              <Field label="To" icon={<Calendar className="size-4" />}>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm"
                />
              </Field>
            </div>

            <Field label={`Budget · ₹${budget.toLocaleString("en-IN")}`} icon={<Wallet className="size-4" />}>
              <input
                type="range"
                min={10000}
                max={150000}
                step={1000}
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>₹10k</span><span>₹80k</span><span>₹1.5L</span>
              </div>
            </Field>

            <ProactiveCostIntel startDate={startDate} days={days} />

            <div>
              <div className="text-sm font-medium mb-3">Dietary preference</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "any", label: "Any" },
                  { id: "veg", label: "Veg Only (Save ~20%)" },
                  { id: "non-veg", label: "Non-Veg" }
                ].map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDietary(d.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                      dietary === d.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-3">Your Interests</div>
              <div className="flex flex-wrap gap-2">
                {allInterests.map((i) => {
                  const active = selectedInterests.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleInterest(i)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                        active
                          ? "bg-primary text-primary-foreground shadow-pop"
                          : "bg-secondary text-muted-foreground hover:bg-border"
                      }`}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-3">Travel style</div>
              <div className="grid grid-cols-2 gap-3">
                {styles.map((s) => {
                  const active = style === s.id;
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-primary bg-primary-soft shadow-pop"
                          : "border-border bg-surface hover:border-foreground/20"
                      }`}
                    >
                      <Icon className={`size-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="mt-2 font-semibold text-sm">{s.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-3">Trip Mood</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "relaxed", label: "😌 Relaxed" },
                  { id: "adventure-heavy", label: "🏔️ Adventure" },
                  { id: "party-focused", label: "🎉 Party" },
                  { id: "slow luxury", label: "✨ Slow Luxury" },
                  { id: "hidden gems", label: "💎 Hidden Gems" },
                  { id: "local culture", label: "🏛️ Local Culture" },
                ].map((m) => {
                  const active = mood === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setMood(m.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition ${
                        active
                          ? "bg-accent text-white shadow-pop"
                          : "bg-secondary text-muted-foreground hover:bg-border"
                      }`}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium mb-3">Planning Style</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "relaxed", label: "🧘 Relaxed" },
                  { id: "balanced", label: "⚖️ Balanced" },
                  { id: "packed", label: "🎒 Packed" },
                ].map((s) => {
                  const active = planningStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setPlanningStyle(s.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        active
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-warm-gradient text-white font-semibold shadow-cta inline-flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {loading ? "Generating..." : "Generate Trip Plan"}
            </button>
          </div>

          {/* RIGHT: Live preview */}
          <div className="rounded-3xl bg-card border border-border p-7 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Live preview</div>
                <div className="font-display font-bold text-xl mt-1 capitalize">{destination || "Planning"} · {days} days</div>
              </div>
              <div className="size-9 rounded-full bg-warm-gradient grid place-items-center text-white shadow-cta">
                <Sparkles className="size-4" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {fetchingPreview ? (
                 [1,2,3,4].map((i) => (
                  <div key={i} className="flex gap-3 items-start animate-pulse">
                    <div className="size-10 rounded-xl bg-secondary grid place-items-center font-bold text-sm shrink-0">D{i}</div>
                    <div className="flex-1 space-y-2 mt-1">
                      <div className="h-3 rounded bg-secondary w-3/4" />
                      <div className="h-2.5 rounded bg-secondary w-1/2 opacity-50" />
                    </div>
                  </div>
                ))
              ) : (
                previewData.map((p, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center font-bold text-sm shrink-0">D{i+1}</div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-sm">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">AI suggested for {style}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 rounded-2xl bg-foreground text-background p-4 text-sm flex items-center gap-2">
              <Flame className="size-4 text-accent animate-pulse" />
              <span>GoTripo is sketching ideas for <b>{destination}</b></span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, icon, children }: { label: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-medium mb-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
      </div>
      {children}
    </div>
  );
}
