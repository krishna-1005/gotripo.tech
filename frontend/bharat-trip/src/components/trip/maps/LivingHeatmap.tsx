import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Sparkles, TrendingUp } from "lucide-react";

interface Hotspot {
  id: string;
  name: string;
  x: string;
  y: string;
  vibe: string;
  score: number;
  color: string;
}

const hotspots: Hotspot[] = [
  { id: "1", name: "Manali", x: "32%", y: "15%", vibe: "Adventure", score: 88, color: "rgba(239, 68, 68, 0.6)" },
  { id: "2", name: "Goa", x: "28%", y: "65%", vibe: "Social", score: 94, color: "rgba(168, 85, 247, 0.6)" },
  { id: "3", name: "Kerala", x: "35%", y: "88%", vibe: "Peace", score: 92, color: "rgba(34, 197, 94, 0.6)" },
  { id: "4", name: "Varanasi", x: "55%", y: "40%", vibe: "Spiritual", score: 90, color: "rgba(249, 115, 22, 0.6)" },
  { id: "5", name: "Leh", x: "38%", y: "5%", vibe: "Adventure", score: 96, color: "rgba(239, 68, 68, 0.6)" },
];

export function LivingHeatmap() {
  const [hovered, setHovered] = useState<Hotspot | null>(null);

  return (
    <section className="relative max-w-7xl mx-auto px-6 lg:px-10 py-24 overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-4">
            <TrendingUp className="size-3" /> Live Travel Pulse
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl tracking-tight mb-6">
            The Living <span className="text-accent">Heatmap</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 text-balance leading-relaxed">
            Real-time trending vibes across India. Our AI monitors social signals and traveler interest to show you where the energy is highest right now.
          </p>

          <div className="space-y-4">
            {hotspots.map((h) => (
              <div 
                key={h.id}
                onMouseEnter={() => setHovered(h)}
                onMouseLeave={() => setHovered(null)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  hovered?.id === h.id 
                    ? "bg-accent/5 border-accent/30 translate-x-2" 
                    : "bg-secondary/50 border-border/50 hover:bg-secondary"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-background border border-border flex items-center justify-center font-bold text-sm">
                      {h.name[0]}
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{h.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{h.vibe}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-accent">{h.score}%</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-bold">Vibe Score</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative aspect-square lg:aspect-auto lg:h-[600px] bg-card/50 rounded-[40px] border border-border overflow-hidden flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-mesh opacity-10" />
          
          {/* Stylized India SVG placeholder - Simplified path */}
          <svg viewBox="0 0 400 500" className="w-full h-full text-muted-foreground/20 fill-current drop-shadow-2xl">
            <path d="M120,50 L180,20 L240,40 L260,80 L250,150 L280,200 L320,220 L310,280 L250,320 L230,400 L200,480 L170,450 L140,480 L120,420 L130,350 L80,300 L50,250 L60,180 L80,100 Z" />
          </svg>

          {/* Hotspots */}
          {hotspots.map((h) => (
            <div 
              key={h.id}
              className="absolute group"
              style={{ left: h.x, top: h.y }}
              onMouseEnter={() => setHovered(h)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="relative flex items-center justify-center">
                <motion.div 
                  className="absolute size-12 rounded-full"
                  style={{ backgroundColor: h.color }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div 
                  className="size-4 rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-150 z-10"
                  style={{ backgroundColor: h.color.replace("0.6", "1") }}
                />
              </div>

              <AnimatePresence>
                {hovered?.id === h.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, x: "-50%" }}
                    animate={{ opacity: 1, y: 0, x: "-50%" }}
                    exit={{ opacity: 0, y: 10, x: "-50%" }}
                    className="absolute bottom-full mb-4 left-1/2 bg-popover text-popover-foreground px-4 py-2 rounded-xl shadow-xl border border-border whitespace-nowrap z-50 pointer-events-none"
                  >
                    <div className="font-bold text-sm">{h.name}</div>
                    <div className="text-[10px] text-accent font-bold uppercase tracking-widest">{h.score}% {h.vibe}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Background Decorative Sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            <Sparkles className="absolute top-1/4 right-1/4 size-32 text-accent/5" />
            <MapPin className="absolute bottom-1/4 left-1/4 size-32 text-primary/5" />
          </div>
        </div>
      </div>
    </section>
  );
}
