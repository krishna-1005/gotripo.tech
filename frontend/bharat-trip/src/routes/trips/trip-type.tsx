import { Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { MapPin, Route as RouteIcon, ArrowRight, Sparkles, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function TripType() {
  return (
    <TripTypeContent />
  );
}

function TripTypeContent() {
  const [enableMulti, setEnableMulti] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get("/admin/config/public");
        setEnableMulti(res.data.enable_multicity === "true");
      } catch (err) {
        setEnableMulti(true); // Fallback to enabled
      }
    };
    fetchConfig();
  }, []);

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-12 max-w-6xl mx-auto">
        <div className="text-sm font-semibold text-accent uppercase tracking-widest">Step 1 of 3</div>
        <h1 className="mt-2 font-display font-bold text-4xl md:text-5xl tracking-tight">What kind of trip?</h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-xl">Two choices. Both planned by AI in seconds. Pick the shape of your adventure.</p>

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Link
            to="/planner-single"
            className="group relative rounded-3xl overflow-hidden border border-border bg-card p-8 shadow-soft hover:shadow-pop hover:-translate-y-1 transition-all"
          >
            <div className="absolute inset-0 bg-mesh opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="size-14 rounded-2xl bg-primary-soft text-primary grid place-items-center">
                <MapPin className="size-6" />
              </div>
              <h2 className="mt-6 font-display font-bold text-2xl">Single Destination</h2>
              <p className="mt-2 text-muted-foreground">Deep-dive into one place. Perfect for weekend escapes, slow travel and city breaks.</p>

              <div className="mt-8 flex items-center gap-2 flex-wrap">
                <Pill>Goa</Pill>
                <Pill>Udaipur</Pill>
                <Pill>Pondicherry</Pill>
              </div>

              <div className="mt-8 inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                Plan a single-stop trip <ArrowRight className="size-4" />
              </div>
            </div>
          </Link>

          {enableMulti !== false ? (
            <Link
              to="/planner-multi"
              className="group relative rounded-3xl overflow-hidden border border-border bg-warm-gradient text-white p-8 shadow-cta hover:-translate-y-1 transition-all"
            >
              <div className="absolute inset-0 bg-mesh opacity-30" />
              <div className="relative">
                <div className="size-14 rounded-2xl bg-white/15 grid place-items-center backdrop-blur">
                  <RouteIcon className="size-6" />
                </div>
                <div className="mt-6 inline-flex items-center gap-1.5 bg-white/15 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest">
                  <Sparkles className="size-3" /> Pro flow
                </div>
                <h2 className="mt-3 font-display font-bold text-2xl">Multi-City Journey</h2>
                <p className="mt-2 text-white/80">Hop between cities with smart routing, optimised travel modes and stay durations.</p>

                <div className="mt-8 flex items-center gap-2 flex-wrap">
                  <PillSolid>Bengaluru</PillSolid>
                  <ArrowRight className="size-3.5 opacity-60" />
                  <PillSolid>Mysuru</PillSolid>
                  <ArrowRight className="size-3.5 opacity-60" />
                  <PillSolid>Coorg</PillSolid>
                </div>

                <div className="mt-8 inline-flex items-center gap-2 font-semibold group-hover:gap-3 transition-all">
                  Plan a multi-stop journey <ArrowRight className="size-4" />
                </div>
              </div>
            </Link>
          ) : (
            <div
              className="group relative rounded-3xl overflow-hidden border border-border bg-secondary/50 p-8 grayscale opacity-60 cursor-not-allowed"
            >
              <div className="relative">
                <div className="size-14 rounded-2xl bg-muted text-muted-foreground grid place-items-center">
                  <Lock className="size-6" />
                </div>
                <div className="mt-6 inline-flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Temporarily Disabled
                </div>
                <h2 className="mt-3 font-display font-bold text-2xl text-muted-foreground">Multi-City Journey</h2>
                <p className="mt-2 text-muted-foreground">This feature is currently undergoing maintenance by the administrator.</p>
                
                <div className="mt-8 inline-flex items-center gap-2 font-semibold text-muted-foreground">
                  Feature locked <Lock className="size-4" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="px-3 py-1 rounded-full bg-secondary text-xs font-semibold">{children}</span>;
}
function PillSolid({ children }: { children: React.ReactNode }) {
  return <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur">{children}</span>;
}
