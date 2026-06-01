import React, { useState } from 'react';
import { X, Sparkles, Loader2, Check } from 'lucide-react';
import { fetchAISuggestions, addDestination } from '@/lib/api';
import { toast } from 'sonner';

const COLORS = {
  bg: '#0e0e10',
  card: '#141416',
  border: '#2a2a2e',
  purple: '#534AB7'
};

const AISuggestModal = ({ tripId, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [travelStyle, setTravelStyle] = useState('Relaxed');
  const [budget, setBudget] = useState('medium');
  const [vibeTags, setVibeTags] = useState<string[]>(['Culture']);

  const handleAskAI = async () => {
    setLoading(true);
    try {
      const data = await fetchAISuggestions(tripId, {
        groupSize: 4, // Default or fetch from trip
        budget,
        travelStyle,
        vibeTags
      });
      setSuggestions(data);
    } catch (error) {
      toast.error('AI failed to suggest destinations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuggestion = async (dest: any) => {
    try {
      await addDestination(tripId, dest);
      toast.success(`${dest.name} added to the board!`);
    } catch (error) {
      toast.error('Failed to add destination');
    }
  };

  const tagOptions = ['Beach', 'Adventure', 'Culture', 'Nightlife', 'Relax', 'Food', 'History'];

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
             <div className="size-10 rounded-xl bg-purple-500/20 grid place-items-center">
                <Sparkles className="size-5 text-purple-400" />
             </div>
             <div>
                <h3 className="text-2xl font-display font-bold">Ask AI for Ideas</h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Get 3 tailor-made suggestions</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-xl transition-colors">
            <X className="size-6 text-muted-foreground" />
          </button>
        </div>

        {suggestions.length === 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Travel Style</label>
                <select 
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl bg-secondary/50 border-transparent focus:bg-background focus:border-purple-500/50 outline-none text-sm font-bold transition-all"
                >
                  <option>Relaxed</option>
                  <option>Adventure</option>
                  <option>Cultural</option>
                  <option>Party</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Budget</label>
                <select 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full h-14 px-5 rounded-2xl bg-secondary/50 border-transparent focus:bg-background focus:border-purple-500/50 outline-none text-sm font-bold transition-all"
                >
                  <option value="low">Budget-friendly</option>
                  <option value="medium">Standard</option>
                  <option value="high">Luxury</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Vibe Tags</label>
               <div className="flex flex-wrap gap-2">
                  {tagOptions.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setVibeTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        vibeTags.includes(tag) ? 'bg-purple-500 border-purple-500 text-white shadow-lg' : 'bg-secondary/50 border-transparent text-muted-foreground'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
               </div>
            </div>

            <button 
              onClick={handleAskAI}
              disabled={loading}
              className="w-full h-16 rounded-2xl bg-purple-600 text-white font-black uppercase tracking-widest text-sm shadow-cta flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={20} /> Generate Suggestions</>}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              {suggestions.map((dest, i) => (
                <div key={i} className="rounded-3xl bg-secondary/30 border border-border p-5 flex flex-col items-center text-center group">
                  <div className="size-16 rounded-2xl bg-warm-gradient mb-4 grid place-items-center text-white text-2xl font-bold">
                    {dest.name[0]}
                  </div>
                  <h4 className="font-display font-bold text-lg leading-tight mb-1">{dest.name}</h4>
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-3">{dest.country}</p>
                  <p className="text-[11px] text-muted-foreground line-clamp-3 mb-5 leading-relaxed">{dest.description}</p>
                  <button 
                    onClick={() => handleAddSuggestion(dest)}
                    className="w-full py-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all mt-auto"
                  >
                    Add to Board
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setSuggestions([])}
              className="w-full py-4 text-xs font-bold text-muted-foreground hover:text-white transition-colors uppercase tracking-widest"
            >
              Start Over
            </button>
            <button 
              onClick={onSuccess}
              className="w-full h-14 rounded-2xl bg-secondary border border-border text-white font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all"
            >
               Close and View Board
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISuggestModal;
