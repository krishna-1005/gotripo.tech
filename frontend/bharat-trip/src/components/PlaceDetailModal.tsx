import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  MapPin, 
  Clock, 
  Star, 
  Info, 
  Navigation, 
  X, 
  ExternalLink,
  Utensils,
  Camera,
  ShoppingBag,
  Mountain,
  Landmark,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlaceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: any;
}

const CategoryIcon = ({ category, className }: { category: string, className?: string }) => {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("food") || cat.includes("restaurant") || cat.includes("cafe")) return <Utensils className={className} />;
  if (cat.includes("photo") || cat.includes("sight")) return <Camera className={className} />;
  if (cat.includes("shop") || cat.includes("market")) return <ShoppingBag className={className} />;
  if (cat.includes("nature") || cat.includes("park") || cat.includes("peak")) return <Mountain className={className} />;
  if (cat.includes("culture") || cat.includes("temple") || cat.includes("historic")) return <Landmark className={className} />;
  return <Info className={className} />;
};

export const PlaceDetailModal = ({ isOpen, onClose, place }: PlaceDetailModalProps) => {
  if (!place) return null;

  const handleGetDirections = () => {
    if (place.lat && place.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name || place.place)}`, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-card border-border rounded-3xl shadow-pop">
        {/* Hidden a11y labels required by Radix UI — invisible to sighted users */}
        <DialogTitle className="sr-only">{place?.name || place?.place || "Place Details"}</DialogTitle>
        <DialogDescription className="sr-only">Details about {place?.name || place?.place || "this place"}</DialogDescription>

        {/* Header/Hero section */}
        <div className="relative h-48 bg-primary/10 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-warm-gradient opacity-10" />
          <div className="relative z-10 flex flex-col items-center gap-3">
             <div className="size-16 rounded-2xl bg-background border border-border shadow-soft grid place-items-center text-primary">
                <CategoryIcon category={place.category} className="size-8" />
             </div>
             <div className="text-center">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">{place.category || "Must Visit"}</div>
                <h2 className="font-display font-bold text-2xl text-foreground">{place.name || place.place || place.title}</h2>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 size-8 rounded-full bg-background/50 backdrop-blur-md border border-border grid place-items-center hover:bg-background transition"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-3 gap-3">
             <div className="p-3 rounded-2xl bg-secondary/50 border border-border text-center">
                <div className="text-[8px] font-black uppercase text-muted-foreground mb-1">Rating</div>
                <div className="flex items-center justify-center gap-1 font-bold text-sm">
                   <Star className="size-3 text-amber-500 fill-current" /> {place.rating || "4.5"}
                </div>
             </div>
             <div className="p-3 rounded-2xl bg-secondary/50 border border-border text-center">
                <div className="text-[8px] font-black uppercase text-muted-foreground mb-1">Best Time</div>
                <div className="flex items-center justify-center gap-1 font-bold text-sm">
                   <Clock className="size-3 text-primary" /> {place.time || place.bestTime || "Morning"}
                </div>
             </div>
             <div className="p-3 rounded-2xl bg-secondary/50 border border-border text-center">
                <div className="text-[8px] font-black uppercase text-muted-foreground mb-1">Cost</div>
                <div className="flex items-center justify-center gap-1 font-bold text-sm">
                   ₹{place.estimatedCost || "Free"}
                </div>
             </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
             <h3 className="font-display font-bold text-sm flex items-center gap-2">
                <Zap className="size-4 text-accent" /> Why visit?
             </h3>
             <p className="text-xs text-muted-foreground leading-relaxed">
                {place.description || place.desc || place.notes || place.reason || `This iconic spot in ${place.city || 'the city'} is highly recommended for its unique vibe and cultural significance. It's a perfect place to experience the local lifestyle and capture amazing memories.`}
             </p>
          </div>

          {/* User Reviews (Mock) */}
          <div className="space-y-3">
             <h3 className="font-display font-bold text-sm">What travelers say</h3>
             <div className="space-y-2">
                {[
                  { name: "Rahul S.", text: "Absolutely loved the atmosphere here! A must-visit." },
                  { name: "Priya K.", text: "Great for photography. Go early to avoid crowds." }
                ].map((r, i) => (
                  <div key={i} className="p-3 rounded-xl bg-secondary/30 border border-border/50">
                     <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold">{r.name}</span>
                        <div className="flex gap-0.5"><Star className="size-2 text-amber-500 fill-current" /><Star className="size-2 text-amber-500 fill-current" /><Star className="size-2 text-amber-500 fill-current" /></div>
                     </div>
                     <p className="text-[10px] text-muted-foreground italic">"{r.text}"</p>
                  </div>
                ))}
             </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-border flex gap-3">
             <Button 
               variant="outline" 
               className="flex-1 rounded-xl h-12 font-bold text-xs gap-2"
               onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(place.name || place.place)}`, '_blank')}
             >
                <ExternalLink className="size-4" /> Learn More
             </Button>
             <Button 
               className="flex-1 rounded-xl h-12 font-bold text-xs gap-2 bg-primary hover:opacity-90 shadow-cta"
               onClick={handleGetDirections}
             >
                <Navigation className="size-4" /> Get Directions
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
