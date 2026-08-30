import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Send, Loader2, ArrowRight, MapPin, Info, 
  Mountain, Palmtree, Landmark, Building, Wind, Building2, Castle, Sun, Music, Trees, Coffee, Waves, CloudSun 
} from "lucide-react";
import { fetchDreamWeaverSuggestions } from "@/lib/api";
import { useNavigate } from "react-router-dom";

const VibeIcon = ({ name, className }: { name: string, className?: string }) => {
  const icons: Record<string, any> = {
    mountain: Mountain,
    palmtree: Palmtree,
    landmark: Landmark,
    building: Building,
    wind: Wind,
    city: Building2,
    castle: Castle,
    sun: Sun,
    music: Music,
    trees: Trees,
    coffee: Coffee,
    waves: Waves,
    "cloud-sun": CloudSun
  };
  const Icon = icons[name] || Sparkles;
  return <Icon className={className} />;
};

export function DreamWeaver({ onHoverDestination }: { onHoverDestination: (imageHint: string | null) => void }) {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const data = await fetchDreamWeaverSuggestions(prompt);
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-accent to-primary rounded-[32px] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        <div className="relative bg-card rounded-[30px] border border-border/50 shadow-2xl p-2">
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="I want to wake up to the smell of pine trees and have tea while looking at snow-capped mountains..."
            className="w-full bg-transparent border-none focus:ring-0 text-xl md:text-2xl p-6 md:p-8 min-h-[120px] resize-none placeholder:text-muted-foreground/50"
          />
          <div className="flex items-center justify-between px-6 pb-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Info className="size-3" /> Press Enter to weave
            </div>
            <button
              onClick={() => handleSubmit()}
              disabled={isLoading || !prompt.trim()}
              className="size-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? <Loader2 className="size-6 animate-spin" /> : <Send className="size-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="mt-16 grid md:grid-cols-3 gap-6"
          >
            {suggestions.map((s, idx) => (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onMouseEnter={() => onHoverDestination(s.imageHint)}
                onMouseLeave={() => onHoverDestination(null)}
                onClick={() => navigate(`/planner-single?dest=${encodeURIComponent(s.name)}`)}
                className="group relative bg-card/80 backdrop-blur-md rounded-[32px] p-6 border border-border hover:border-accent/50 transition-all cursor-pointer shadow-sm hover:shadow-pop hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Sparkles className="size-24 text-accent" />
                </div>
                
                <div className="size-14 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                  <VibeIcon name={s.icon} className="size-7 text-accent" />
                </div>
                
                <h3 className="font-display font-bold text-2xl mb-2">{s.name}</h3>
                <div className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 flex items-center gap-1.5">
                  <MapPin className="size-3" /> {s.region}
                </div>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {s.reason}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                   <span className="text-xs font-bold uppercase tracking-widest text-primary">Plan Now</span>
                   <ArrowRight className="size-4 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
