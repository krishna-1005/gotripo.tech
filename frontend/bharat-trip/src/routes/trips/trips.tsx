import { Link, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { useEffect, useState } from "react";
import { Bookmark, Plus, MapPin, Calendar, Loader2, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const tabs = ["Upcoming", "Drafts", "Saved", "Past"];

export default function Trips() {
  return (
    <ProtectedRoute>
      <TripsContent />
    </ProtectedRoute>
  );
}

function TripsContent() {
  const [trips, setTrips] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTrips = async () => {
    const CACHE_KEY = "gotripo-cached-trips";
    try {
      const res = await api.get("/trips");
      const data = res.data.trips || res.data || [];
      setTrips(data);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Failed to fetch trips", err);
      toast.error("Offline: Showing cached trips");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const deleteTrip = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this trip?")) return;

    try {
      await api.delete(`/trips/${id}`);
      toast.success("Trip deleted");
      fetchTrips();
    } catch (err) {
      toast.error("Failed to delete trip");
    }
  };

  const filteredTrips = trips.filter(t => {
    if (activeTab === "Upcoming") return t.status === "upcoming" || t.status === "ongoing" || !t.status;
    if (activeTab === "Past") return t.status === "completed";
    if (activeTab === "Saved" || activeTab === "Drafts") return true; 
    return true;
  });

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">My trips</h1>
            <p className="text-muted-foreground mt-1">Your planned escapes and saved favourites.</p>
          </div>
          <Link to="/trip-type" className="h-11 px-5 rounded-xl bg-warm-gradient text-white text-sm font-semibold shadow-cta inline-flex items-center gap-2">
            <Plus className="size-4" /> New trip
          </Link>
        </div>

        <div className="mt-6 flex gap-2 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 h-11 text-sm font-semibold border-b-2 -mb-px transition ${
                activeTab === t ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-8 grid lg:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-3xl overflow-hidden bg-card border border-border shadow-soft flex flex-col sm:flex-row h-[200px]">
                <Skeleton className="sm:w-56 h-full shrink-0 rounded-none" />
                <div className="p-5 flex-1 space-y-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="pt-4 space-y-2">
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid lg:grid-cols-2 gap-5">
            {filteredTrips.length > 0 ? filteredTrips.map((d) => (
              <div key={d._id} className="group relative">
                <Link to={`/results?planId=${d._id}`} className="block rounded-3xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all flex flex-col sm:flex-row h-full">
                  <div className="sm:w-56 aspect-[4/3] sm:aspect-auto relative overflow-hidden shrink-0 bg-secondary grid place-items-center">
                    <MapPin className="size-8 text-muted-foreground/30" />
                    {d.type === 'room' && (
                      <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-widest rounded-md">
                        Collab Room
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 pr-12">
                    <div className="text-[11px] font-semibold text-accent uppercase tracking-widest">{d.type === 'room' ? "Collaboration" : (d.style || "Trip")}</div>
                    <div className="font-display font-bold text-xl mt-1">{d.title || d.destination}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="size-3" /> {d.destination}</div>
                    <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Calendar className="size-3" /> {d.days} days</span>
                      <span>·</span>
                      <span>₹{d.totalTripCost?.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full bg-warm-gradient" style={{ width: "100%" }} />
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1.5">
                      {d.type === 'room' ? "Active Discussion" : "AI Plan generated"}
                    </div>
                  </div>
                </Link>
                
                <button 
                  onClick={(e) => deleteTrip(e, d._id)}
                  className="absolute right-5 top-5 p-2.5 rounded-xl bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-white transition-all shadow-sm z-10"
                  title="Delete Trip"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )) : (
              <Link to="/trip-type" className="rounded-3xl border-2 border-dashed border-border p-10 grid place-items-center text-muted-foreground hover:text-primary hover:border-primary transition w-full lg:col-span-2">
                <div className="text-center">
                  <Bookmark className="size-6 mx-auto" />
                  <div className="mt-2 font-semibold">No trips yet</div>
                  <div className="text-xs mt-1">Tap to start planning your first adventure</div>
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
