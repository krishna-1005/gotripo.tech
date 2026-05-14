import React, { useEffect, useState } from 'react';
import { fetchPublicItineraries, remixItinerary } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AppShell } from '@/components/AppShell';
import { MapPin, Calendar, User, Zap, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicGallery() {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [remixingId, setRemixingId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPublicItineraries();
        setItineraries(data);
      } catch (error) {
        toast.error("Failed to load community plans");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRemix = async (id: string) => {
    if (!user) {
      toast.info("Please login to remix this plan");
      navigate('/auth?redirect=/community');
      return;
    }

    setRemixingId(id);
    try {
      const result = await remixItinerary(id);
      toast.success("Plan remixed successfully!");
      navigate(`/results?planId=${result.tripId}`);
    } catch (error) {
      toast.error("Remix failed. Please try again.");
    } finally {
      setRemixingId(null);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-background p-6 md:p-10 max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight mb-4">
            Community <span className="text-primary">Remix</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Explore public itineraries created by the GoTripo community. Find a plan you love? 
            Remix it to make it your own.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-64 rounded-3xl bg-secondary dark:bg-white/5" />
            ))}
          </div>
        ) : itineraries.length === 0 ? (
          <div className="text-center py-20">
            <div className="size-20 bg-secondary rounded-full grid place-items-center mx-auto mb-6">
              <Sparkles className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold">No public plans yet</h3>
            <p className="text-muted-foreground">Be the first to share your journey!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {itineraries.map((it) => (
              <div key={it._id} className="group relative bg-card dark:bg-[#0B1221] border border-border rounded-3xl overflow-hidden shadow-soft hover:shadow-pop transition-all duration-500">
                <div className="h-40 bg-secondary/50 relative overflow-hidden">
                   {it.tripId?.image ? (
                     <img src={it.tripId.image} alt={it.tripId.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   ) : (
                     <div className="w-full h-full grid place-items-center bg-primary/5">
                        <MapPin className="size-12 text-primary/20" />
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                   <div className="absolute bottom-4 left-4 text-white">
                      <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Destination</div>
                      <div className="font-display font-bold text-lg">{it.tripId?.destination || "Unknown"}</div>
                   </div>
                </div>

                <div className="p-6">
                  <h3 className="font-display font-bold text-xl mb-4 line-clamp-1">{it.tripId?.title || "Untitled Plan"}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="size-4 text-primary" />
                      <span>{it.tripId?.days || it.days.length} Days</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Zap className="size-4 text-accent" />
                      <span>{it.tripId?.travelerType || "Solo"}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border dark:border-white/5">
                    <button
                      onClick={() => navigate(`/results?planId=${it.tripId?._id}`)}
                      className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline"
                    >
                      View Full Plan <ArrowRight className="size-3" />
                    </button>
                    <button
                      disabled={remixingId === it._id}
                      onClick={() => handleRemix(it._id)}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-cta hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {remixingId === it._id ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
                      Remix
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
