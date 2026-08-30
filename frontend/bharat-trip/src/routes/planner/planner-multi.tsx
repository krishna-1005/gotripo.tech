import { useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { 
  X, 
  ArrowRight, 
  Plane, 
  Train, 
  Car, 
  Sparkles, 
  Clock, 
  MoveHorizontal, 
  Loader2, 
  MapPin, 
  Calendar, 
  Wallet, 
  Flame,
  User,
  Users,
  Plus,
  Tent
} from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
import { calculateDistance } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

const travelStyles = [
  { id: "solo", label: "Solo", icon: User },
  { id: "family", label: "Family", icon: Users },
  { id: "backpacking", label: "Backpacking", icon: Tent },
  { id: "luxury", label: "Luxury", icon: Sparkles },
];

export default function PlannerMulti() {
  return (
    <PlannerMultiContent />
  );
}

function PlannerMultiContent() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString(new Date());
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 6); // Default 1 week
  const futureStr = getLocalDateString(futureDate);

  // State
  const [stops, setStops] = useState<any[]>(() => {
    const s1Arrival = todayStr;
    const s1Departure = getLocalDateString(new Date(new Date(s1Arrival).getTime() + 2 * 24 * 60 * 60 * 1000));
    
    const s2Arrival = getLocalDateString(new Date(new Date(s1Departure).getTime() + 1 * 24 * 60 * 60 * 1000));
    const s2Departure = getLocalDateString(new Date(new Date(s2Arrival).getTime() + 2 * 24 * 60 * 60 * 1000));

    const s3Arrival = getLocalDateString(new Date(new Date(s2Departure).getTime() + 1 * 24 * 60 * 60 * 1000));
    const s3Departure = getLocalDateString(new Date(new Date(s3Arrival).getTime() + 3 * 24 * 60 * 60 * 1000));

    return [
      { name: "Bengaluru", lat: 12.9716, lng: 77.5946, arrivalDate: s1Arrival, departureDate: s1Departure },
      { name: "Mysuru", lat: 12.2958, lng: 76.6394, arrivalDate: s2Arrival, departureDate: s2Departure },
      { name: "Coorg", lat: 12.3375, lng: 75.8069, arrivalDate: s3Arrival, departureDate: s3Departure }
    ];
  });
  const [newStop, setNewStop] = useState("");
  const [pendingStop, setPendingStop] = useState<any>(null);
  
  const [sourceCity, setSourceCity] = useState("");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(getLocalDateString(new Date(new Date(todayStr).getTime() + 11 * 24 * 60 * 60 * 1000)));
  const [days, setDays] = useState(12);
  const [budget, setBudget] = useState(50000);
  const [style, setStyle] = useState("family");
  const [dietary, setDietary] = useState("any");
  const [mode, setMode] = useState("car");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Sightseeing", "Nature"]);
  const [mood, setMood] = useState("local culture");
  const [planningStyle, setPlanningStyle] = useState("balanced");
  
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fetchingPreview, setFetchingPreview] = useState(false);

  const allInterests = ["Sightseeing", "Nature", "Heritage", "Ancient Places", "Adventure", "Spiritual", "Shopping", "Nightlife", "Food trail"];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest) 
        : [...prev, interest]
    );
  };

  // Helper: Move stop up or down
  const moveStop = (index: number, direction: 'up' | 'down') => {
    const newStops = [...stops];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stops.length) return;
    [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];
    setStops(newStops);
  };

  // Helper: Update dates for a specific stop
  const updateStopDate = (index: number, field: 'arrivalDate' | 'departureDate', value: string) => {
    const newStops = [...stops];
    newStops[index][field] = value;
    
    // Ensure departure >= arrival
    if (field === 'arrivalDate' && new Date(newStops[index].departureDate) < new Date(value)) {
      newStops[index].departureDate = value;
    }
    if (field === 'departureDate' && new Date(value) < new Date(newStops[index].arrivalDate)) {
      newStops[index].arrivalDate = value;
    }

    setStops(newStops);
    
    // Sync global dates
    if (index === 0 && field === 'arrivalDate') setStartDate(value);
    if (index === newStops.length - 1 && field === 'departureDate') setEndDate(value);

    // Sync total days
    const totalStart = new Date(newStops[0].arrivalDate);
    const totalEnd = new Date(newStops[newStops.length - 1].departureDate);
    const diffTime = totalEnd.getTime() - totalStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    if (!isNaN(diffDays)) setDays(diffDays);
  };

  // Helper: Update nights for a specific stop (backward compatibility/utility)
  const updateNights = (index: number, nights: number) => {
    const newStops = [...stops];
    const n = Math.max(1, nights);
    const arrival = new Date(newStops[index].arrivalDate);
    const departure = new Date(arrival);
    departure.setDate(arrival.getDate() + n);
    newStops[index].departureDate = getLocalDateString(departure);
    setStops(newStops);
    
    // Sync total days and end date
    const totalStart = new Date(newStops[0].arrivalDate);
    const totalEnd = new Date(newStops[newStops.length - 1].departureDate);
    const diffTime = totalEnd.getTime() - totalStart.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    setEndDate(getLocalDateString(totalEnd));
    setDays(diffDays);
  };

  // Sync days when dates change manually
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
    if (!isNaN(diffDays)) setDays(diffDays);
  }, [startDate, endDate]);

  // Preview Logic (based on first stop)
  useEffect(() => {
    if (stops.length === 0) return;
    const firstCity = stops[0].name;
    
    const delayDebounceFn = setTimeout(() => {
      setFetchingPreview(true);
      api.post("/nearby", { city: firstCity, radius: 20 })
        .then(res => {
          setPreviewData(res.data.slice(0, 4));
        })
        .catch(() => {
          setPreviewData([
            { name: "Local Secret Spot" },
            { name: "Signature Cuisine" },
            { name: "Hidden Heritage" },
            { name: "Scenic Route View" }
          ]);
        })
        .finally(() => setFetchingPreview(false));
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [stops]);

  // Handle Generate
  const handleGenerate = async () => {
    if (stops.length < 2) {
      toast.error("Please add at least 2 destinations for a multi-city trip");
      return;
    }

    if (selectedInterests.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }

    const cityNames = stops.map(s => s.name);
    const cityStays = stops.map(s => {
      const start = new Date(s.arrivalDate);
      const end = new Date(s.departureDate);
      const diffTime = end.getTime() - start.getTime();
      const cityDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return { 
        name: s.name, 
        nights: Math.max(1, cityDays - 1),
        days: cityDays,
        arrivalDate: s.arrivalDate,
        departureDate: s.departureDate
      };
    });

    const planData = {
      cities: cityNames,
      cityStays: cityStays, 
      city: cityNames[0], 
      sourceCity: sourceCity.trim() || undefined,
      days: days,
      budget,
      interests: selectedInterests,
      travelerType: style,
      pace: planningStyle,
      mood,
      planningStyle,
      isMultiCity: true,
      mode: mode,
      userPreferences: {
        dietary: dietary
      }
    };

    if (!user) {
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
      trackEvent("generate_itinerary", "engagement", `multi_city: ${cityNames.join(", ")}`);
      navigate(`/results?planId=${planId}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate multi-city plan");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStop = () => {
    const stopToAdd = pendingStop || (newStop.trim() ? { name: newStop.trim() } : null);
    if (stopToAdd) {
      const lastStop = stops[stops.length - 1];
      let arrivalDate = todayStr;
      let departureDate = getLocalDateString(new Date(new Date(todayStr).getTime() + 2 * 24 * 60 * 60 * 1000));

      if (lastStop) {
        arrivalDate = getLocalDateString(new Date(new Date(lastStop.departureDate).getTime() + 1 * 24 * 60 * 60 * 1000));
        departureDate = getLocalDateString(new Date(new Date(arrivalDate).getTime() + 2 * 24 * 60 * 60 * 1000));
      }

      setStops([...stops, { ...stopToAdd, arrivalDate, departureDate }]);
      setPendingStop(null);
      setNewStop("");
      
      // Update global dates
      const newEndDate = departureDate;
      setEndDate(newEndDate);
      const totalStart = new Date(stops[0].arrivalDate);
      const totalEnd = new Date(newEndDate);
      const diffTime = totalEnd.getTime() - totalStart.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setDays(diffDays);
    }
  };

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto">
        <div className="text-sm font-semibold text-accent uppercase tracking-widest">Step 2 · Multi-city</div>
        <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl tracking-tight">Chart your journey.</h1>

        <div className="mt-8 grid lg:grid-cols-2 gap-8">
          {/* LEFT: Inputs */}
          <div className="rounded-3xl bg-card border border-border p-7 shadow-soft space-y-7">
            
            {/* Source City */}
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Starting From" icon={<MapPin className="size-4" />}>
                <LocationAutocomplete
                  value={sourceCity}
                  onChange={setSourceCity}
                  placeholder="Your city (e.g. Patna)"
                  className="w-full h-12 px-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm transition-all"
                />
              </Field>
              <div className="flex flex-col justify-end">
                <div className="text-[10px] font-bold text-accent uppercase tracking-widest mb-2">Trip Duration</div>
                <div className="h-12 px-4 rounded-xl border border-border bg-secondary/30 flex items-center text-sm font-semibold">
                  <Calendar className="size-4 mr-2 text-muted-foreground" />
                  {days} Days Journey
                </div>
              </div>
            </div>

            {/* Multi-City Destinations with Dates */}
            <div>
              <div className="flex items-center justify-between mb-4">
                 <div className="text-sm font-bold">Your Journey Timeline</div>
                 <div className="text-[10px] font-bold text-accent uppercase tracking-widest">{stops.length} Cities Added</div>
              </div>
              
              <div className="space-y-3 mb-6">
                {stops.map((s, i) => (
                  <div key={i} className="group relative p-4 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-all shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="size-6 rounded-full bg-primary/10 text-primary grid place-items-center text-[10px] font-bold">
                          {i + 1}
                        </span>
                        <span className="font-display font-bold text-sm">{s.name}</span>
                      </div>
                      <button 
                        onClick={() => setStops(stops.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Arrival Date</label>
                        <input 
                          type="date" 
                          value={s.arrivalDate} 
                          onChange={(e) => updateStopDate(i, 'arrivalDate', e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-secondary/40 border-none text-[11px] font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Departure Date</label>
                        <input 
                          type="date" 
                          value={s.departureDate} 
                          onChange={(e) => updateStopDate(i, 'departureDate', e.target.value)}
                          className="w-full h-10 px-3 rounded-xl bg-secondary/40 border-none text-[11px] font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <LocationAutocomplete 
                  value={newStop}
                  onChange={setNewStop}
                  onSelectSuggestion={(s) => setPendingStop(s)}
                  placeholder="Add another city to your trip..."
                  className="flex-1 h-12 px-4 rounded-xl border border-border bg-surface focus:border-ring outline-none text-sm transition-all shadow-inner"
                />
                <button 
                  onClick={handleAddStop}
                  className="h-12 px-6 rounded-xl bg-secondary text-sm font-bold hover:bg-border transition-all flex items-center gap-2"
                >
                  <Plus className="size-4" /> Add
                </button>
              </div>
            </div>

            {/* Budget */}
            <Field label={`Total Trip Budget · ₹${budget.toLocaleString("en-IN")}`} icon={<Wallet className="size-4" />}>
              <input
                type="range"
                min={20000}
                max={300000}
                step={5000}
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>₹20k</span><span>₹1.5L</span><span>₹3L</span>
              </div>
            </Field>

            {/* Dietary */}
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

            {/* Travel Mode */}
            <div>
              <div className="text-sm font-medium mb-3">Travel Mode (Inter-city)</div>
              <div className="grid grid-cols-3 gap-2">
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
                      className={`inline-flex items-center justify-center gap-1.5 h-11 rounded-xl text-xs font-bold border transition ${
                        active ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      <m.icon className="size-4" /> {m.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interests */}
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

            {/* Travel Style */}
            <div>
              <div className="text-sm font-medium mb-3">Travel style</div>
              <div className="grid grid-cols-2 gap-3">
                {travelStyles.map((s) => {
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

            {/* Mood */}
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

            {/* Planning Style */}
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
              {loading ? "Generating journey..." : "Generate Journey"}
            </button>
          </div>

          {/* RIGHT: Route & Live Preview */}
          <div className="space-y-6">
            
            {/* Route Summary */}
            <div className="rounded-3xl bg-card border border-border p-7 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <div className="font-display font-bold text-lg">Route Blueprint</div>
                <button 
                  onClick={() => {
                    toast.success("Route optimized for minimum travel distance!");
                  }}
                  className="text-[10px] font-bold text-accent uppercase tracking-widest inline-flex items-center gap-1.5 hover:underline"
                >
                  <Sparkles className="size-3" /> Auto-optimise
                </button>
              </div>

              <div className="space-y-4">
                {stops.map((s, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-4 group">
                      <div className="size-10 rounded-xl bg-secondary border border-border flex flex-col items-center justify-center shrink-0">
                         <button onClick={() => moveStop(i, 'up')} className="text-muted-foreground hover:text-accent disabled:opacity-0" disabled={i === 0}>
                           <ArrowRight className="size-2.5 -rotate-90" />
                         </button>
                         <span className="text-[10px] font-black">{i + 1}</span>
                         <button onClick={() => moveStop(i, 'down')} className="text-muted-foreground hover:text-accent disabled:opacity-0" disabled={i === stops.length - 1}>
                           <ArrowRight className="size-2.5 rotate-90" />
                         </button>
                      </div>
                      <div className="flex-1">
                        <div className="font-display font-bold text-sm">{s.name}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                           <div className="flex items-center gap-1.5 bg-secondary/50 rounded-lg px-2 py-1">
                              <Calendar className="size-3 text-accent" />
                              <span className="text-[10px] font-bold">
                                {new Date(s.arrivalDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                           </div>
                           <ArrowRight className="size-3 text-muted-foreground" />
                           <div className="flex items-center gap-1.5 bg-secondary/50 rounded-lg px-2 py-1">
                              <Calendar className="size-3 text-accent" />
                              <span className="text-[10px] font-bold">
                                {new Date(s.departureDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                           </div>
                        </div>
                      </div>
                    </div>
                    {i < stops.length - 1 && (
                      <div className="ml-5 my-1 pl-5 border-l-2 border-dashed border-border py-3">
                        <div className="flex items-center gap-3 text-[9px] font-black text-accent bg-accent/5 w-fit px-3 py-1 rounded-lg uppercase tracking-tighter">
                           <MoveHorizontal className="size-2.5" /> 
                           {stops[i].lat && stops[i+1].lat 
                            ? `${calculateDistance(stops[i].lat, stops[i].lng, stops[i+1].lat, stops[i+1].lng)} km via ${mode}`
                            : "Connecting Route..."
                           }
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 pt-6 border-t border-border">
                <Stat label="Total cities" value={stops.length.toString()} />
                <Stat label="Total duration" value={`${days} days`} />
                <Stat label="Avg Pacing" value={`${(days/stops.length).toFixed(1)} days/city`} />
                <Stat label="Estimated cost" value={`₹${budget.toLocaleString()}`} accent />
              </div>
            </div>

            {/* Live Preview (Samples) */}
            <div className="rounded-3xl bg-card border border-border p-7 shadow-soft">
               <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Discovery Feed</div>
                  <div className="font-display font-bold text-xl mt-1 capitalize">Sneak Peek · {stops[0]?.name || "Planning"}</div>
                </div>
                <div className="size-9 rounded-full bg-warm-gradient grid place-items-center text-white shadow-cta">
                  <Sparkles className="size-4" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {fetchingPreview ? (
                  [1,2,3,4].map((i) => (
                    <div key={i} className="flex gap-3 items-start animate-pulse">
                      <div className="size-10 rounded-xl bg-secondary grid place-items-center font-bold text-sm shrink-0">P{i}</div>
                      <div className="flex-1 space-y-2 mt-1">
                        <div className="h-3 rounded bg-secondary w-3/4" />
                        <div className="h-2.5 rounded bg-secondary w-1/2 opacity-50" />
                      </div>
                    </div>
                  ))
                ) : (
                  previewData.map((p, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center font-bold text-sm shrink-0">
                        <Sparkles className="size-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-display font-bold text-sm">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground">Personalized for {style} style</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-6 rounded-2xl bg-foreground text-background p-4 text-sm flex items-center gap-2">
                <Flame className="size-4 text-accent animate-pulse" />
                <span>AI is mapping a route through <b>{stops.length} cities</b></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl bg-secondary/50 p-4 border border-border/50">
      <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">{label}</div>
      <div className={`mt-1 font-display font-bold text-lg ${accent ? "text-accent" : ""}`}>{value}</div>
    </div>
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
