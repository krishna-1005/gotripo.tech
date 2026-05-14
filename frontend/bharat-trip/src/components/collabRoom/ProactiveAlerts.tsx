import React, { useState, useEffect } from 'react';
import { CloudRain, AlertCircle, Map, X, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { fetchTripAlerts, default as api } from '@/lib/api';
import axios from 'axios';
import { toast } from 'sonner';

const COLORS = {
  bg: '#161b22',
  border: '#30363d',
  accent: '#1d9e75',
  amber: '#ef9f27',
  red: '#f85149',
  purple: '#534AB7',
  text: '#e6edf3',
  textMuted: '#8b949e',
};

const ProactiveAlerts = ({ tripId, destination }: { tripId: string, destination: string }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [findingAlternatives, setFindingAlternatives] = useState(false);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [showAltPanel, setShowAltPanel] = useState(false);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchTripAlerts(tripId);
        setAlerts(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load alerts", err);
        setLoading(false);
      }
    };

    if (tripId) loadAlerts();
  }, [tripId]);

  const findIndoorAlternatives = async (alert: any) => {
    setFindingAlternatives(true);
    setShowAltPanel(true);
    try {
      // Use authenticated api instead of plain axios
      const res = await api.post('/nearby', {
        city: destination,
        indoorOnly: true,
        radius: 15
      });
      
      const results = res.data.slice(0, 3);

      setAlternatives(results);
      setFindingAlternatives(false);
    } catch (err) {
      toast.error("Failed to find alternatives");
      setFindingAlternatives(false);
    }
  };

  const handleSwap = async (alert: any, indoorSpot: any) => {
    try {
      if (alert.dayIndex !== undefined && alert.activityId) {
        toast.loading(`Swapping ${alert.affectedLocation}...`, { id: "swap" });
        
        // Update the activity title to the new indoor spot
        await api.put(`/trips/${tripId}/itinerary/day/${alert.dayIndex}/activity/${alert.activityId}`, {
          title: indoorSpot.name,
          location: indoorSpot.address || indoorSpot.name
        });
        
        toast.success(`Plan updated: ${indoorSpot.name}`, { id: "swap" });
        
        // Remove the alert from state since it's now solved
        setAlerts(prev => prev.filter(a => a.id !== alert.id));
        setShowAltPanel(false);
      } else {
        console.error("Missing alert details for swap:", alert);
        toast.error("Could not identify the activity to swap", { id: "swap" });
      }
    } catch (err: any) {
      console.error("Swap Error:", err);
      const msg = err.response?.data?.error || err.message || "Failed to swap activity";
      toast.error(msg, { id: "swap" });
    }
  };

  if (loading || alerts.length === 0) return null;

  return (
    <div className="w-full mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {alerts.map((alert) => (
        <div key={alert.id} className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                <CloudRain className="size-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold text-amber-500 flex items-center gap-2">
                  <AlertCircle size={18} /> {alert.title}
                </h3>
                <p className="text-sm text-amber-200/70 mt-1 max-w-xl leading-relaxed">
                  {alert.message} {alert.suggestedAction}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => findIndoorAlternatives(alert)}
                disabled={findingAlternatives}
                className="flex-1 md:flex-none h-11 px-6 rounded-xl bg-amber-500 text-[#0d1117] font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
              >
                {findingAlternatives ? <Loader2 className="size-4 animate-spin" /> : <Sparkles size={16} />}
                Find Indoor Spots
              </button>
              <button 
                onClick={() => setAlerts(prev => prev.filter(a => a.id !== alert.id))}
                className="size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all shrink-0"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {showAltPanel && (
            <div className="mt-8 pt-6 border-t border-amber-500/20 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                  <Map size={14} /> Indoor Suggestions for {destination}
                </h4>
                <button onClick={() => setShowAltPanel(false)} className="text-[10px] font-bold text-amber-500/50 hover:text-amber-500 uppercase tracking-widest">Close</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {findingAlternatives ? (
                  [1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />)
                ) : alternatives.length === 0 ? (
                  <div className="col-span-3 py-6 text-center text-sm text-amber-500/40 italic">No indoor spots found nearby.</div>
                ) : (
                  alternatives.map((alt, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleSwap(alert, alt)}
                      className="group p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <div className="text-xs font-bold text-white mb-1 group-hover:text-amber-500 transition-colors truncate">{alt.name}</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-widest font-black">{alt.category}</div>
                      <div className="mt-3 flex items-center justify-between">
                         <span className="text-[10px] font-bold text-amber-500/70 group-hover:text-amber-500 transition-colors">Swap Plan</span>
                         <ArrowRight size={12} className="text-white/20 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProactiveAlerts;
