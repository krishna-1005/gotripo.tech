import { Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { destinations } from "@/lib/sample-data";
import {
  Sparkles,
  Compass,
  Users,
  ArrowRight,
  MapPin,
  Calendar,
  TrendingUp,
  Plus,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

const suggested = destinations.slice(2, 6);
const trending = destinations.slice(1, 5);

function DashboardContent() {
  const { user } = useAuth();
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/trips")
      .then((res) => {
        const trips = res.data.trips || res.data || [];
        setRecentTrips(trips.slice(0, 4));
      })
      .catch((err) => {
        console.error("Failed to fetch recent trips", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AppShell>
        <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto space-y-12">
          {/* Greeting Skeleton */}
          <Skeleton className="h-64 rounded-3xl w-full" />
          
          {/* Recent Trips Skeleton */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="flex gap-5 overflow-hidden">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="shrink-0 w-[280px] rounded-3xl border border-border bg-card overflow-hidden h-[300px]">
                  <Skeleton className="h-[180px] w-full rounded-none" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <div className="pt-4 flex justify-between">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="size-8 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Other Sections Skeleton */}
          <div className="space-y-8">
            <Skeleton className="h-8 w-48" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto space-y-12">
        {/* Greeting */}
        <section className="rounded-3xl bg-hero-gradient text-white p-8 md:p-10 relative overflow-hidden shadow-pop">
          <div className="absolute inset-0 bg-mesh opacity-50" />
          <div className="relative">
            <div className="text-sm text-white/70">
              Good morning, {user?.displayName || "Explorer"}
            </div>
            <h1 className="mt-2 font-display font-bold text-3xl md:text-4xl tracking-tight">
              Where to next?
            </h1>
            <p className="mt-2 text-white/80 max-w-lg">
              Your AI co-pilot is warmed up. Pick a quick action below or describe a vibe.
            </p>

            <div className="mt-6 grid sm:grid-cols-3 gap-3 max-w-2xl">
              <Link
                to="/trip-type"
                className="rounded-2xl glass p-4 text-left hover:bg-white/15 transition group"
              >
                <Sparkles className="size-5 text-accent" />
                <div className="mt-3 font-semibold">Plan new trip</div>
                <div className="text-xs text-white/70">AI builds a draft in 30s</div>
              </Link>
              <Link
                to="/explore"
                className="rounded-2xl glass p-4 text-left hover:bg-white/15 transition"
              >
                <Compass className="size-5 text-accent" />
                <div className="mt-3 font-semibold">Explore</div>
                <div className="text-xs text-white/70">Curated destinations</div>
              </Link>
              <Link
                to="/collaborate"
                className="rounded-2xl glass p-4 text-left hover:bg-white/15 transition"
              >
                <Users className="size-5 text-accent" />
                <div className="mt-3 font-semibold">Group poll</div>
                <div className="text-xs text-white/70">Decide with friends</div>
              </Link>
            </div>
          </div>
        </section>

        {/* Recent trips */}
        <Section
          title="Recent trips"
          subtitle="Pick up where you left off"
          cta="My trips"
          to="/trips"
        >
          {loading ? (
            <div className="flex gap-5 py-4 overflow-x-hidden">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="shrink-0 w-[280px] h-[300px] rounded-3xl bg-secondary animate-pulse"
                />
              ))}
            </div>
          ) : recentTrips.length > 0 ? (
            <HorizontalCards items={recentTrips} />
          ) : (
            <div className="rounded-3xl border-2 border-dashed border-border p-10 grid place-items-center text-muted-foreground">
              <div className="text-center">
                <Calendar className="size-6 mx-auto opacity-50" />
                <div className="mt-2 font-semibold">No recent trips</div>
                <Link to="/trip-type" className="text-accent text-sm hover:underline mt-1 block">
                  Start planning now
                </Link>
              </div>
            </div>
          )}
        </Section>

        {/* Suggested */}
        <Section
          title="AI picks for you"
          subtitle="Tuned to your love for slow, scenic getaways"
          icon={<Sparkles className="size-4" />}
          cta="See more"
          to="/explore"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {suggested.map((d) => (
              <DestinationCard key={d.id} d={d} />
            ))}
          </div>
        </Section>

        {/* Trending */}
        <Section
          title="Trending this week"
          subtitle="What other explorers are booking right now"
          icon={<TrendingUp className="size-4" />}
          cta="View board"
          to="/explore"
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trending.map((d, i) => (
              <Link
                key={d.id}
                to={`/trip-details?id=${d.id}`}
                className="rounded-3xl border border-border bg-card p-5 shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all block"
              >
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-xl bg-accent-soft text-accent grid place-items-center font-bold">
                    #{i + 1}
                  </div>
                  <span className="text-xs font-semibold text-success">+{18 + i * 7}%</span>
                </div>
                <div className="mt-4 font-display font-bold text-lg">{d.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3" /> {d.region}
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-warm-gradient" style={{ width: `${60 + i * 8}%` }} />
                </div>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  subtitle,
  cta,
  to,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  cta?: string;
  to?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div className="font-display font-bold text-2xl tracking-tight flex items-center gap-2">
            {icon && <span className="text-accent">{icon}</span>}
            {title}
          </div>
          {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
        </div>
        {cta && to && (
          <Link
            to={to}
            className="text-sm font-semibold text-primary hover:gap-2 inline-flex items-center gap-1 transition-all"
          >
            {cta} <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function HorizontalCards({ items }: { items: any[] }) {
  return (
    <div className="flex gap-5 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 snap-x">
      {items.map((d) => (
        <Link
          key={d._id}
          to={`/results?planId=${d._id}`}
          className="snap-start shrink-0 w-[280px] rounded-3xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all flex flex-col"
        >
          <div className="aspect-[4/3] relative overflow-hidden bg-secondary grid place-items-center">
            {d.image ? (
              <img
                src={d.image}
                alt={d.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <MapPin className="size-10 text-muted-foreground/20" />
            )}
            <div className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-white/90 text-slate-900 px-2 py-0.5 rounded-md shadow-sm">
              {d.travelerType || "Trip"}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <div className="font-display font-bold text-lg line-clamp-1">
                {d.title || d.destination}
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Calendar className="size-3" /> {d.days} days · {d.status || "Planned"}
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-bold text-primary">
                ₹{(d.totalTripCost || d.totalBudget || 0).toLocaleString("en-IN")}
              </span>
              <div className="size-8 rounded-full bg-secondary grid place-items-center">
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </Link>
      ))}
      <Link
        to="/trip-type"
        className="snap-start shrink-0 w-[200px] rounded-3xl border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:text-primary hover:border-primary transition"
      >
        <div className="text-center">
          <Plus className="size-6 mx-auto" />
          <div className="text-sm font-semibold mt-1">New trip</div>
        </div>
      </Link>
    </div>
  );
}

function DestinationCard({ d }: { d: (typeof destinations)[number] }) {
  return (
    <Link
      to={`/trip-details?id=${d.id}`}
      className="group rounded-3xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all"
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <img
          src={d.img}
          alt={d.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 text-[11px] font-semibold uppercase tracking-widest bg-white/95 text-slate-900 px-2.5 py-1 rounded-full">
          {d.tag}
        </div>
      </div>
      <div className="p-4">
        <div className="font-display font-bold">{d.name}</div>
        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
          <MapPin className="size-3" /> {d.region}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-primary">{d.price}</span>
          <span className="text-xs text-muted-foreground">{d.days}</span>
        </div>
      </div>
    </Link>
  );
}
