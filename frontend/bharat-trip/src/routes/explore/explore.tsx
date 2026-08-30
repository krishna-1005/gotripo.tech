import { Link, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { destinations } from "@/lib/sample-data";
import { Search, SlidersHorizontal, MapPin, Star, ImageOff, X, Sparkles, Award } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import api from "@/lib/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const cats = ["All", "Beaches", "Spiritual", "Mountains", "Heritage", "Nature", "Hills"];

function DestinationImage({ src, alt }: { src?: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || errored) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground">
        <ImageOff className="size-8" aria-hidden />
        <span className="sr-only">Image unavailable</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-secondary" aria-hidden />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

export default function Explore({ isInternational = false }: { isInternational?: boolean }) {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState(initialQuery);
  const [featuredTrips, setFeaturedTrips] = useState<any[]>([]);
  
  // Filter States
  const [priceRange, setPriceRange] = useState([200000]); // Max price
  const [durationRange, setDurationRange] = useState([15]); // Max days

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get("/public/featured-trips");
        setFeaturedTrips(res.data.trips);
      } catch (err) {
        console.error("Featured trips fetch error:", err);
      }
    };
    fetchFeatured();
  }, []);

  // Filter destinations once on mount, filtered by isInternational
  const filteredByRegion = useMemo(() => {
    return destinations.filter(d => d.isInternational === isInternational);
  }, [isInternational]);

  const shuffledDestinations = useMemo(() => {
    return [...filteredByRegion].sort(() => Math.random() - 0.5);
  }, [filteredByRegion]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return shuffledDestinations.filter((d) => {
      // Category Match
      const matchCat = cat === "All" || d.tag === cat;
      
      // Search Query Match
      const matchQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.region.toLowerCase().includes(q) ||
        d.tag.toLowerCase().includes(q);
        
      // Price Match (Parsing "₹18,500" -> 18500)
      const numericPrice = parseInt(d.price.replace(/[^\d]/g, "")) || 0;
      const matchPrice = numericPrice <= priceRange[0];
      
      // Duration Match (Parsing "4 days" -> 4)
      const numericDays = parseInt(d.days.replace(/[^\d]/g, "")) || 0;
      const matchDuration = numericDays <= durationRange[0];
      
      return matchCat && matchQuery && matchPrice && matchDuration;
    });
  }, [cat, query, shuffledDestinations, priceRange, durationRange]);

  const resetFilters = () => {
    setPriceRange([200000]);
    setDurationRange([15]);
    setCat("All");
    setQuery("");
  };

  const hasActiveFilters = cat !== "All" || priceRange[0] < 200000 || durationRange[0] < 15;

  return (
    <AppShell>
      <div className="px-4 lg:px-10 py-8 max-w-7xl mx-auto">
        


        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
          {isInternational ? "Explore the World" : "Explore India"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isInternational 
            ? "Iconic global tourist spots, curated for you." 
            : "Hand-picked places across India, sorted by what you might love."}
        </p>

        <div className="mt-6 flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations, vibes, e.g. ‘monsoon in Meghalaya’"
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-secondary border border-transparent focus:bg-surface focus:border-ring outline-none text-sm"
            />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <button className={`h-12 px-4 rounded-xl border inline-flex items-center gap-2 text-sm font-semibold transition-all ${
                hasActiveFilters ? "bg-primary text-primary-foreground border-primary" : "bg-surface border-border"
              }`}>
                <SlidersHorizontal className="size-4" /> 
                Filters
                {hasActiveFilters && <span className="size-2 rounded-full bg-accent animate-pulse" />}
              </button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="text-2xl font-display">Filters</SheetTitle>
                <SheetDescription>
                  Refine your search to find the perfect trip.
                </SheetDescription>
              </SheetHeader>
              
              <div className="py-8 space-y-10">
                {/* Budget Filter */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-bold uppercase tracking-wider opacity-60">Max Budget</label>
                    <span className="text-xl font-display font-bold text-primary">₹{priceRange[0].toLocaleString()}</span>
                  </div>
                  <Slider 
                    value={priceRange} 
                    onValueChange={setPriceRange} 
                    max={200000} 
                    step={5000}
                    className="py-4"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    <span>₹5,000</span>
                    <span>₹2,0,000+</span>
                  </div>
                </div>

                {/* Duration Filter */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-bold uppercase tracking-wider opacity-60">Max Duration</label>
                    <span className="text-xl font-display font-bold text-primary">{durationRange[0]} Days</span>
                  </div>
                  <Slider 
                    value={durationRange} 
                    onValueChange={setDurationRange} 
                    max={15} 
                    step={1}
                    className="py-4"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    <span>1 Day</span>
                    <span>15+ Days</span>
                  </div>
                </div>

                {/* Categories in Sheet for mobile */}
                <div className="space-y-4">
                  <label className="text-sm font-bold uppercase tracking-wider opacity-60">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {cats.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCat(c)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          c === cat 
                            ? "bg-primary text-primary-foreground border-primary shadow-md" 
                            : "bg-secondary/50 text-muted-foreground border-transparent hover:border-border"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <SheetFooter className="absolute bottom-0 left-0 w-full p-6 border-t border-border bg-card">
                <div className="flex gap-3 w-full">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl"
                    onClick={resetFilters}
                  >
                    Reset All
                  </Button>
                  <SheetClose asChild>
                    <Button className="flex-1 h-12 rounded-xl bg-warm-gradient border-none text-white font-bold">
                      Show {filtered.length} Results
                    </Button>
                  </SheetClose>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
          {cats.map((c) => {
            const active = c === cat;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`shrink-0 px-5 h-10 rounded-full text-sm font-bold border transition-all duration-200 ${
                  active 
                    ? "bg-primary text-primary-foreground border-primary shadow-md scale-105" 
                    : "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary hover:bg-primary/5"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-16 text-center text-muted-foreground bg-secondary/20 rounded-[40px] py-20 border border-dashed border-border">
            <div className="size-20 rounded-3xl bg-background border border-border mx-auto flex items-center justify-center mb-6">
              <Search className="size-10 opacity-20" />
            </div>
            <p className="text-xl font-display font-bold text-foreground">No destinations match your criteria</p>
            <p className="text-sm mt-1 mb-8">Try adjusting your budget or duration filters.</p>
            <Button variant="outline" onClick={resetFilters} className="rounded-xl">
              <X className="size-4 mr-2" /> Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((d) => (
              <Link
                to={`/trip-details?id=${d.id}`}
                key={d.id}
                className="group rounded-3xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-pop hover:-translate-y-0.5 transition-all"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-secondary">
                  <DestinationImage src={d.img} alt={d.name} />
                  {/* Protective gradient for badges */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-60" />
                  
                  <div className="absolute top-3 left-3 z-10">
                    <span className="text-[10px] font-bold uppercase tracking-[0.12em] bg-black/40 backdrop-blur-md text-white border border-white/20 px-2.5 py-1 rounded-lg shadow-sm">
                      {d.tag}
                    </span>
                  </div>
                  
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/40 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded-lg border border-white/20 z-10 shadow-sm">
                    <Star className="size-3 fill-current text-accent" /> {d.rating?.toFixed(1) ?? "4.8"}
                  </div>
                </div>
                <div className="p-5">
                  <div className="font-display font-bold text-lg">{d.name ?? "Untitled"}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3" /> {d.region ?? "India"}
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    A {(d.tag ?? "curated").toLowerCase()} escape with curated stays, food and quiet corners loved by locals.
                  </p>
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-muted-foreground">From</div>
                      <div className="font-display font-bold text-primary">{d.price ?? "—"}</div>
                    </div>
                    <span className="text-xs font-semibold text-accent">{d.days ?? ""}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
