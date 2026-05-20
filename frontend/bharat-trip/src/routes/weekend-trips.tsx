import { AppShell } from "@/components/AppShell";
import { motion } from "framer-motion";
import { Calendar, MapPin, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function WeekendTrips() {
  return (
    <AppShell>
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="size-20 rounded-3xl bg-accent/10 flex items-center justify-center text-accent mb-8"
        >
          <Calendar className="size-10" />
        </motion.div>
        
        <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4">
          Weekend Getaways
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mb-12">
          We're currently hand-curating the best 2-3 day escapes for you. 
          Check back soon for AI-powered weekend magic.
        </p>

        <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl">
          {[
            { name: "Nandi Hills", type: "Nature", dist: "60km" },
            { name: "Pondicherry", type: "Coastal", dist: "310km" },
            { name: "Coorg", type: "Hills", dist: "250km" }
          ].map((item, i) => (
            <div key={i} className="p-6 rounded-[32px] border border-border bg-card text-left group hover:border-accent/30 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-xl bg-secondary flex items-center justify-center">
                  <MapPin className="size-5 text-muted-foreground" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-accent">{item.type}</span>
              </div>
              <h3 className="text-xl font-bold mb-1">{item.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{item.dist} from your city</p>
              <div className="flex items-center gap-2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Notify me <ArrowRight className="size-3" />
              </div>
            </div>
          ))}
        </div>

        <Link to="/trip-type" className="mt-16 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          <Sparkles className="size-4 text-accent" /> Use the main AI Planner instead
        </Link>
      </div>
    </AppShell>
  );
}
