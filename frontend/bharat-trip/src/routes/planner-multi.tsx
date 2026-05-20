import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { X, ArrowRight, Plane, Train, Car, Sparkles, Clock, MoveHorizontal, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { calculateDistance } from "@/lib/utils";

export default function PlannerMulti() {
  return (
    <PlannerMultiContent />
  );
}

function PlannerMultiContent() {
  const { user, loading: authLoading } = useAuth();
  const [stops, setStops] = useState<any[]>([
    { name: "Bengaluru", lat: 12.9716, lng: 77.5946 },
    { name: "Mysuru", lat: 12.2958, lng: 76.6394 },
    { name: "Coorg", lat: 12.3375, lng: 75.8069 }
  ]);
  const [newStop, setNewStop] = useState("");
  const [pendingStop, setPendingStop] = useState<any>(null);
  const [mode, setMode] = useState("car");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Sightseeing", "Nature"]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const allInterests = ["Sightseeing", "Nature", "Heritage", "Adventure", "Spiritual", "Shopping", "Nightlife", "Food trail"];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  // Auto-trigger generation if we just logged in and have pending data
  useEffect(() => {
    if (authLoading || !user) return;
    
    const pending = sessionStorage.getItem("pending_plan_multi");
    if (pending) {
      sessionStorage.removeItem("pending_plan_multi");
      const data = JSON.parse(pending);
      // Data format for cities in session storage might be names or objects
      setStops(data.cities.map((c: any) => typeof c === 'string' ? { name: c } : c));
      setMode(data.mode);
      setSelectedInterests(data.interests || ["Sightseeing", "Nature"]);
      
      const runGeneration = async () => {
        setLoading(true);
        try {
          const res = await api.post("/plan/generate", data);
          const plan = res.data.plan;
          const planId = plan._id || plan.id;
          navigate(`/results?planId=${planId}`);
        } catch (err: any) {
          toast.error(err.message || "Failed to generate multi-city plan");
        } finally {
          setLoading(false);
        }
      };
      runGeneration();
    }
  }, [user, authLoading, navigate]);

  const handleAddStop = () => {
    if (pendingStop) {
      setStops([...stops, pendingStop]);
      setPendingStop(null);
      setNewStop("");
    } else if (newStop.trim()) {
      setStops([...stops, { name: newStop.trim() }]);
      setNewStop("");
    }
  };

  const handleGenerate = async () => {
    if (stops.length < 2) {
      toast.error("Please add at least 2 destinations for a multi-city trip");
      return;
    }

    if (selectedInterests.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }

    const cityNames = stops.map(s => typeof s === 'string' ? s : s.name);

    const planData = {
      cities: cityNames,
      city: cityNames[0], // fallback for old code
      days: stops.length * 2, // Estimate 2 days per city
      budget: 50000,
      interests: selectedInterests,
      travelerType: "friends",
      pace: "balanced",
      isMultiCity: true,
      mode: mode
    };

    if (!user) {
      // Save data and redirect to auth
      sessionStorage.setItem("pending_plan_multi", JSON.stringify(planData));
      toast.info("Please sign in to save and view your journey");
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/plan/generate", planData);
      
      const plan = res.data.plan;
      const planId = plan._id || plan.id;
      navigate(`/results?planId=${planId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate multi-city plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto">
        <div className="text-sm font-semibold text-accent uppercase tracking-widest">Step 2 · Multi-city</div>
        <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl tracking-tight">Chart your journey.</h1>

        {/* Stops input */}
        <div className="mt-8 rounded-3xl bg-card border border-border p-6 shadow-soft space-y-7">
          <div>
            <div className="text-sm font-medium mb-3">Destinations</div>
            <div className="flex flex-wrap gap-2 mb-4">
              {stops.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-2 pl-3 pr-2 py-2 rounded-full bg-primary-soft text-primary text-sm font-semibold">
                  <span className="size-5 rounded-full bg-primary text-primary-foreground grid place-items-center text-[11px]">{i + 1}</span>
                  {typeof s === 'string' ? s : s.name}
                  <button onClick={() => setStops(stops.filter((_, idx) => idx !== i))} className="hover:bg-primary/10 rounded-full p-0.5"><X className="size-3.5" /></button>
                </span>
              ))}
            </div>
            
            <div className="flex gap-2 max-w-md">
              <LocationAutocomplete 
                value={newStop}
                onChange={setNewStop}
                onSelectSuggestion={(s) => setPendingStop(s)}
                placeholder="Add another city..."
                className="flex-1 h-11 px-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm transition-all"
              />
              <button 
                onClick={handleAddStop}
                className="h-11 px-4 rounded-xl bg-secondary text-sm font-semibold hover:bg-border transition"
              >
                Add
              </button>
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

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="text-sm font-medium mr-1">Travel mode:</div>
            {[
              { id: "car", label: "Car", icon: Car },
              { id: "train", label: "Train", icon: Train },
              { id: "flight", label: "Flight", icon: Plane },
            ].map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    active ? "bg-primary text-primary-foreground shadow-pop" : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <m.icon className="size-4" /> {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Route visualization */}
        <div className="mt-6 rounded-3xl bg-card border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div className="font-display font-bold text-lg">Route Preview</div>
            <button className="text-sm font-semibold text-accent inline-flex items-center gap-1.5">
              <Sparkles className="size-4" /> Optimise route
            </button>
          </div>

          <div className="overflow-x-auto -mx-2 px-2">
            <div className="flex items-center gap-2 min-w-max pb-4">
              {stops.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="rounded-2xl border border-border bg-surface p-4 w-44 shadow-soft">
                    <div className="text-xs text-muted-foreground">Stop {i + 1}</div>
                    <div className="font-display font-bold mt-1">{typeof s === 'string' ? s : s.name}</div>
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3" /> 2 nights
                    </div>
                  </div>
                  {i < stops.length - 1 && (
                    <div className="flex flex-col items-center text-muted-foreground">
                      <div className="text-[11px] font-semibold">
                        {stops[i].lat && stops[i+1].lat 
                          ? `${calculateDistance(stops[i].lat, stops[i].lng, stops[i+1].lat, stops[i+1].lng)} km`
                          : `${120 + i * 40} km`
                        }
                      </div>
                      <MoveHorizontal className="size-5 text-accent" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-3 gap-3">
            <Stat label="Total cities" value={stops.length.toString()} />
            <Stat label="Estimated duration" value={`${stops.length * 2} days`} />
            <Stat label="Estimated cost" value={`₹${(stops.length * 12000).toLocaleString("en-IN")}`} accent />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="h-12 px-6 rounded-xl bg-warm-gradient text-white font-semibold shadow-cta inline-flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            {loading ? "Generating journey..." : "Generate journey"}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-secondary p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display font-bold text-xl ${accent ? "text-accent" : ""}`}>{value}</div>
    </div>
  );
}
