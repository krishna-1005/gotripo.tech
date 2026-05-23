import { AppShell } from "@/components/AppShell";
import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Star, Award, Search, Compass, Sparkles, Mountain, Palmtree, Castle, Heart, Trees } from "lucide-react";
import { useState, useEffect } from "react";

interface Stamp {
  id: string;
  name: string;
  requiredStates: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const ALL_STAMPS: Stamp[] = [
  { id: "1", name: "Himalayan Explorer", requiredStates: ["Uttarakhand", "Himachal Pradesh", "Sikkim"], icon: Mountain },
  { id: "2", name: "Coastal Wanderer", requiredStates: ["Goa", "Kerala", "Maharashtra", "Tamil Nadu"], icon: Palmtree },
  { id: "3", name: "Royal Voyager", requiredStates: ["Rajasthan", "Gujarat"], icon: Castle },
  { id: "4", name: "Spiritual Soul", requiredStates: ["Uttar Pradesh", "Bihar", "Odisha"], icon: Compass },
  { id: "5", name: "Seven Sisters", requiredStates: ["Assam", "Meghalaya", "Arunachal Pradesh"], icon: Trees },
  { id: "6", name: "Heart of India", requiredStates: ["Madhya Pradesh", "Chhattisgarh"], icon: Heart },
];

const ALL_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export default function PassportPage() {
  const [visitedStates, setVisitedStates] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("visited_states");
    if (saved) {
      setVisitedStates(JSON.parse(saved));
    }
  }, []);

  const toggleState = (state: string) => {
    const newStates = visitedStates.includes(state)
      ? visitedStates.filter(s => s !== state)
      : [...visitedStates, state];
    
    setVisitedStates(newStates);
    localStorage.setItem("visited_states", JSON.stringify(newStates));
  };

  const progress = Math.round((visitedStates.length / ALL_STATES.length) * 100);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 text-accent mb-3">
              <ShieldCheck className="size-8" />
              <h1 className="font-display text-4xl font-bold text-foreground">Bharat Passport</h1>
            </div>
            <p className="text-muted-foreground text-lg">Your official record of Indian exploration and heritage.</p>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border shadow-pop min-w-[280px]">
            <div className="flex justify-between items-end mb-4">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Exploration Progress</div>
              <div className="text-3xl font-display font-bold text-accent">{progress}%</div>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="mt-3 text-[10px] text-muted-foreground text-center font-medium">
              {visitedStates.length} of {ALL_STATES.length} states discovered
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Passport Stamps */}
          <div className="lg:col-span-8 space-y-12">
            <section>
              <div className="flex items-center gap-3 mb-8">
                <Award className="size-6 text-accent" />
                <h2 className="font-display text-2xl font-bold">Sacred Badges</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {ALL_STAMPS.map((stamp, idx) => {
                  const isUnlocked = stamp.requiredStates.some(s => visitedStates.includes(s));
                  return (
                    <motion.div
                      key={stamp.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`aspect-square rounded-full border-4 flex flex-col items-center justify-center text-center p-4 relative group transition-all cursor-default ${
                        isUnlocked 
                          ? "border-accent bg-accent/5 shadow-lg shadow-accent/10" 
                          : "border-dashed border-muted opacity-40"
                      }`}
                    >
                      <div className={`mb-2 transition-all transform group-hover:scale-110 duration-300 ${isUnlocked ? "text-accent" : "text-muted-foreground"}`}>
                        <stamp.icon className="size-10" />
                      </div>
                      <div className={`text-[10px] font-bold uppercase tracking-tighter leading-tight px-2 ${isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                        {stamp.name}
                      </div>
                      {isUnlocked ? (
                        <div className="text-[8px] text-accent mt-1 font-bold">UNLOCKED</div>
                      ) : (
                        <div className="text-[7px] text-muted-foreground mt-1 leading-tight">Visit {stamp.requiredStates[0]} to unlock</div>
                      )}
                      
                      {/* Official Seal Effect */}
                      <div className={`absolute inset-0 rounded-full border ${isUnlocked ? "border-accent/20" : "border-transparent"}`} />
                    </motion.div>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-8">
                <MapPin className="size-6 text-accent" />
                <h2 className="font-display text-2xl font-bold">State Discovery Log</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {ALL_STATES.map(state => {
                  const visited = visitedStates.includes(state);
                  return (
                    <button
                      key={state}
                      onClick={() => toggleState(state)}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        visited 
                          ? "bg-accent/10 border-accent text-accent shadow-sm" 
                          : "bg-card border-border text-muted-foreground hover:border-accent/30"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest">State</span>
                        {visited && <ShieldCheck className="size-3" />}
                      </div>
                      <div className="text-sm font-bold truncate">{state}</div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right: Sidebar / Stats */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gradient-to-br from-primary to-[#0f172a] rounded-[40px] p-8 text-white shadow-pop relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="size-32" />
              </div>
              
              <h3 className="font-display text-2xl font-bold mb-6 relative z-10">Pro Traveller Status</h3>
              
              <div className="space-y-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Star className="size-6 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-xs text-white/60 font-bold uppercase tracking-widest">Current Rank</div>
                    <div className="font-bold">National Explorer</div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-sm text-white/70 leading-relaxed mb-6">
                    Unlock the "Bharat Ratna" badge by discovering all 28 states of India.
                  </p>
                  <button className="w-full py-4 rounded-2xl bg-accent text-white font-bold hover:scale-[1.02] transition-all shadow-lg shadow-accent/20">
                    Share Passport
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-[32px] p-8 border border-border">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Discovery Milestones</h4>
              <div className="space-y-4">
                <Milestone checked={visitedStates.length >= 5} label="Five State Wonder" />
                <Milestone checked={visitedStates.length >= 10} label="Desi Globetrotter" />
                <Milestone checked={visitedStates.length >= 15} label="Cultural Connoisseur" />
                <Milestone checked={visitedStates.length >= 20} label="India Master" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Milestone({ checked, label }: { checked: boolean, label: string }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${checked ? "bg-accent/5" : "opacity-50"}`}>
      <div className={`size-6 rounded-full flex items-center justify-center border ${checked ? "bg-accent border-accent text-white" : "border-border text-muted-foreground"}`}>
        {checked && <ShieldCheck className="size-3.5" />}
      </div>
      <span className={`text-sm font-bold ${checked ? "text-foreground" : "text-muted-foreground line-through"}`}>
        {label}
      </span>
    </div>
  );
}
