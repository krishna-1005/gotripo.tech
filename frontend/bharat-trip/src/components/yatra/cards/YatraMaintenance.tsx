import { motion } from "framer-motion";
import { Sparkles, Hammer } from "lucide-react";
import { AppShell } from "@/components/common/layout/AppShell";

export function YatraMaintenance() {
  return (
    <AppShell>
      <div className="min-h-[80vh] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full space-y-8">
          {/* Simple Icon */}
          <div className="relative mx-auto size-24">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative size-24 rounded-3xl bg-secondary border border-border flex items-center justify-center">
              <Hammer className="size-10 text-primary" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="size-3" />
              <span>Coming Soon</span>
            </div>
            
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Yatra is under <br /> 
              <span className="text-primary">construction.</span>
            </h1>
            
            <p className="text-muted-foreground leading-relaxed">
              We're currently preparing sacred expeditions and spiritual journeys. 
              This section will be available very soon.
            </p>
          </div>

          <div className="pt-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg hover:opacity-90 transition-all"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
