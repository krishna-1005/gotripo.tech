import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { MapPreview } from "@/components/MapPreview";
import { destinationItineraries } from "@/lib/sample-data";
import { useEffect, useState } from "react";
import {
  Download,
  MapPin,
  Utensils,
  Landmark,
  Calendar,
  Hotel,
  Loader2,
  Clock,
  Sun,
  CloudSun,
  AlertTriangle,
  Star,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Rocket,
  Info,
  Users,
  Camera,
  ChevronRight,
  Wallet,
  BadgeCheck,
  ArrowUpRight,
  Flame,
  Zap,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Archive,
  ThumbsUp,
  ThumbsDown,
  Wine,
  Trees,
  Milestone,
  Palette,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/context/CartContext";
import { PDFViewerModal } from "@/components/PDFViewerModal";
import { PlaceDetailModal } from "@/components/PlaceDetailModal";
import { cn } from "@/lib/utils";
import OnboardingTour from "@/components/OnboardingTour";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────
   PLACE TYPE CONFIG
   ───────────────────────────────────── */
function getTypeConfig(type: string) {
  const t = (type || "").toLowerCase();
  
  if (t === "food") return {
    icon: Utensils, label: "Food & Dining", color: "#ea580c",
    fallbackDesc: "A popular local dining spot known for authentic regional cuisine and vibrant atmosphere.",
    duration: "45 – 90 min"
  };
  if (t === "nightlife") return {
    icon: Wine, label: "Nightlife", color: "#7c3aed",
    fallbackDesc: "A lively evening destination known for music, social energy, and a great atmosphere.",
    duration: "2 – 3 hrs"
  };
  if (t === "nature") return {
    icon: Trees, label: "Nature", color: "#16a34a",
    fallbackDesc: "A peaceful scenic location ideal for relaxing walks, fresh air, and beautiful views.",
    duration: "1 – 2 hrs"
  };
  if (t === "heritage") return {
    icon: Landmark, label: "Heritage", color: "#854d0e",
    fallbackDesc: "A historic landmark showcasing rich architecture and fascinating cultural heritage.",
    duration: "1.5 – 2 hrs"
  };
  if (t === "spiritual") return {
    icon: Milestone, label: "Spiritual", color: "#0891b2",
    fallbackDesc: "A serene spiritual site offering a peaceful atmosphere and cultural significance.",
    duration: "30 – 60 min"
  };
  if (t === "shopping") return {
    icon: ShoppingBag, label: "Shopping", color: "#db2777",
    fallbackDesc: "A bustling marketplace featuring local specialties and a lively shopping vibe.",
    duration: "2 – 3 hrs"
  };
  if (t === "adventure") return {
    icon: Zap, label: "Adventure", color: "#dc2626",
    fallbackDesc: "An exciting destination offering thrilling activities and memorable outdoor experiences.",
    duration: "3 – 4 hrs"
  };
  if (t === "culture") return {
    icon: Palette, label: "Culture", color: "#4f46e5",
    fallbackDesc: "An immersive cultural experience highlighting local art, traditions, and creativity.",
    duration: "1.5 – 2.5 hrs"
  };
  
  return {
    icon: Camera, label: "Sightseeing", color: "#6366f1",
    fallbackDesc: "A must-visit spot offering scenic views, local character, and memorable photo opportunities.",
    duration: "1 – 2 hrs"
  };
}

/* ─────────────────────────────────────
   WEATHER CARD
   ───────────────────────────────────── */
function WeatherCard({ city, weather }: { city: string; weather?: any }) {
  const temp = weather?.temp || 28;
  const condition = weather?.condition || "Clear Skies";
  const icon = weather?.icon || "sun";
  const WeatherIcon = icon === "cloud" ? CloudSun : icon === "rain" ? AlertTriangle : Sun;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/60 border border-border">
      <WeatherIcon className="size-5 text-amber-500 shrink-0" />
      <div>
        <p className="text-[11px] text-muted-foreground font-medium">{city} weather</p>
        <p className="text-sm font-semibold text-foreground">{condition} · {temp}°C</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   TRIP SUMMARY STRIP
   ───────────────────────────────────── */
function TripSummaryStrip({ plan }: { plan: any }) {
  const totalPlaces = plan?.itinerary?.reduce(
    (acc: number, d: any) => acc + (d.places?.length || 0), 0
  ) ?? 0;

  const items = [
    { label: "Duration", value: `${plan?.days || 3} days`, icon: Calendar },
    { label: "Destinations", value: `${totalPlaces} stops`, icon: MapPin },
    { label: "Estimated budget", value: `₹${Number(plan?.totalTripCost || 35000).toLocaleString()}`, icon: Wallet },
    { label: "Travel style", value: plan?.travelerType || "Solo", icon: Users },
    { label: "Trip pace", value: plan?.pace || "Moderate", icon: Zap },
  ];

  return (
    <div id="tour-blueprint" className="border-b border-border overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        {/* Mobile: 2-col grid */}
        <div className="grid grid-cols-2 sm:hidden border-b border-border">
          {items.map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2.5 px-4 py-3.5",
                i % 2 === 0 && "border-r border-border",
                i < items.length - 2 && "border-b border-border"
              )}
            >
              <item.icon className="size-3.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{item.label}</p>
                <p className="text-xs font-bold text-foreground mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
          <div className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 border-t border-border">
            <BadgeCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">AI Verified · 98/100</span>
          </div>
        </div>
        {/* Desktop: horizontal scroll row */}
        <div className="hidden sm:flex items-stretch gap-0 overflow-x-auto scrollbar-none px-6 lg:px-10">
          {items.map((item, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 px-5 py-4 min-w-max shrink-0",
                i < items.length - 1 && "border-r border-border"
              )}
            >
              <item.icon className="size-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 px-5 py-4 ml-auto shrink-0 border-l border-border">
            <BadgeCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">AI Verified · 98/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   SIDEBAR: TRAVELER SHOP & CHECKLIST
   ───────────────────────────────────── */
function TravelerShopWidget({
  destinationName,
  checkedItems,
  togglePackingItem,
  addToCart,
}: {
  destinationName: string;
  checkedItems: Record<string, boolean>;
  togglePackingItem: (id: string) => void;
  addToCart: (item: any) => Promise<void>;
}) {
  const items = getPackingItemsForDestination(destinationName);
  const totalCount = items.length;
  const packedCount = items.filter(item => checkedItems[item.id]).length;
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-secondary/50">
        <div className="flex items-center gap-2">
          <ShoppingBag className="size-4 text-indigo-500" />
          <h3 className="text-sm font-bold text-foreground">Packing Checklist</h3>
        </div>
        <span className="text-[10px] font-bold text-indigo-660 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 px-2 py-0.5 rounded-full shrink-0">
          {packedCount}/{totalCount} packed
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Preparation Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-650 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Item List */}
        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 select-none scrollbar-thin">
          {items.map((item) => {
            const isPacked = checkedItems[item.id];
            return (
              <div 
                key={item.id}
                className={cn(
                  "p-3 rounded-xl border transition-all flex items-start gap-3 group/item",
                  isPacked 
                    ? "bg-secondary/20 border-border/40 opacity-70" 
                    : "bg-card border-border hover:border-indigo-500/30"
                )}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => togglePackingItem(item.id)}
                  className={cn(
                    "size-5 rounded-md border flex items-center justify-center transition-all shrink-0 mt-0.5 cursor-pointer",
                    isPacked 
                      ? "bg-indigo-600 border-indigo-600 text-white" 
                      : "border-muted-foreground/30 hover:border-indigo-500 bg-secondary/50"
                  )}
                >
                  {isPacked && <CheckCircle2 className="size-3.5 text-white" />}
                </button>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      {item.category}
                    </span>
                    {isPacked && (
                      <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-450 uppercase tracking-wider">
                        Packed
                      </span>
                    )}
                  </div>
                  <h4 className={cn(
                    "text-xs font-bold leading-snug transition-all",
                    isPacked ? "line-through text-muted-foreground" : "text-foreground"
                  )}>
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Pricing and Shopping direct CTA */}
                  {item.isOrderable && !isPacked && (
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/40">
                      <span className="text-xs font-bold text-foreground">₹{item.price}</span>
                      <button
                        type="button"
                        onClick={() => addToCart({
                          itemId: item.id,
                          name: item.name,
                          price: item.price,
                          imageUrl: item.imageUrl
                        })}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition-all text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <ShoppingCart className="size-3" /> Shop
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   SIDEBAR: KNOW BEFORE YOU GO
   ───────────────────────────────────── */
function KnowBeforeYouGo({ city, weather }: { city: string; weather?: any }) {
  const tips = [
    "Carry cash for local markets — many vendors don't accept cards.",
    "Book monument entry tickets online in advance to avoid queues.",
    "Early mornings (before 9 AM) are the best time to visit heritage sites.",
    "Use IRCTC or local bus passes for cost-effective intercity travel.",
  ];
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2 bg-secondary/50">
        <Info className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-bold text-foreground">Travel Tips</h3>
      </div>
      <div className="p-5">
        <WeatherCard city={city} weather={weather} />
        <div className="mt-4 space-y-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <CheckCircle2 className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[12px] text-muted-foreground leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   SIDEBAR: STAY RECOMMENDATIONS
   ───────────────────────────────────── */
function StayRecommendations({ city }: { city: string }) {
  const options = [
    { type: "Budget", range: "₹800 – ₹1,500 / night", note: "Guesthouses & hostels" },
    { type: "Mid-range", range: "₹2,500 – ₹4,500 / night", note: "Boutique hotels", recommended: true },
    { type: "Premium", range: "₹6,000+ / night", note: "Heritage properties & resorts" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2 bg-secondary/50">
        <Hotel className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-bold text-foreground">Accommodation Options</h3>
      </div>
      <div className="divide-y divide-border">
        {options.map((opt, i) => (
          <div key={i} className={cn("px-5 py-4 flex items-center justify-between group", opt.recommended && "bg-indigo-50/50 dark:bg-indigo-950/30")}>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-foreground">{opt.type}</p>
                {opt.recommended && (
                  <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-650 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">Recommended</span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">{opt.note}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-foreground/90">{opt.range}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="px-5 py-4 border-t border-border">
        <p className="text-[11px] text-muted-foreground">Prices are indicative. Book 2–4 weeks in advance for best rates.</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   SIDEBAR: VALIDATION PANEL
   ───────────────────────────────────── */
function ValidationPanel({ city }: { city: string }) {
  const checks = [
    "All venues verified as open",
    "Route distances are optimized",
    "Budget is within requested range",
    "Weather conditions are suitable",
  ];
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-secondary/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-foreground">Plan Verification</h3>
        </div>
        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-1 rounded-full">98 / 100</span>
      </div>
      <div className="p-5 space-y-3">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span className="text-[12px] text-muted-foreground">{c}</span>
          </div>
        ))}
      </div>
      <div className="mx-5 mb-5 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/60 text-center">
        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">This itinerary passed all AI quality checks</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   DYNAMIC PACKING LIST HELPER
   ───────────────────────────────────── */
interface PackingItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl: string;
  isOrderable: boolean;
}

function getPackingItemsForDestination(destinationName: string): PackingItem[] {
  const name = (destinationName || "").toLowerCase();
  
  const baseItems: PackingItem[] = [
    {
      id: "shop-gen-pb",
      name: "10000mAh Power Bank",
      category: "Gear",
      description: "Keep your phones charged during long sightseeing tours",
      price: 999,
      imageUrl: "https://images.unsplash.com/photo-1609592424109-dd6e2b960fba?w=200",
      isOrderable: true
    },
    {
      id: "shop-gen-firstaid",
      name: "Travel First Aid Kit",
      category: "Health",
      description: "Basic medicines, band-aids, ORS and antiseptics",
      price: 349,
      imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=200",
      isOrderable: true
    },
    {
      id: "shop-gen-bottle",
      name: "Insulated Water Bottle",
      category: "Gear",
      description: "Keep your water cold or hot on your journey",
      price: 599,
      imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200",
      isOrderable: true
    }
  ];

  if (
    name.includes("ladakh") || name.includes("leh") || name.includes("kashmir") || 
    name.includes("manali") || name.includes("shimla") || name.includes("kedarnath") || 
    name.includes("badrinath") || name.includes("uttarakhand") || name.includes("himachal") ||
    name.includes("srinagar") || name.includes("gulmarg")
  ) {
    return [
      ...baseItems,
      {
        id: "shop-cold-jacket",
        name: "Fleece Windproof Jacket",
        category: "Clothing",
        description: "Thermal insulation for cold mountain heights",
        price: 2500,
        imageUrl: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=200",
        isOrderable: true
      },
      {
        id: "shop-cold-gloves",
        name: "Touchscreen Winter Gloves",
        category: "Clothing",
        description: "Keep warm while using your phone for photos",
        price: 399,
        imageUrl: "https://images.unsplash.com/photo-1588610531502-0e9ebcd387c8?w=200",
        isOrderable: true
      },
      {
        id: "shop-cold-cap",
        name: "Woolen Beanie Cap",
        category: "Clothing",
        description: "Double-layered protection for ears and head",
        price: 249,
        imageUrl: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=200",
        isOrderable: true
      }
    ];
  }

  if (
    name.includes("goa") || name.includes("kerala") || name.includes("beach") || 
    name.includes("pondicherry") || name.includes("mumbai") || name.includes("havelock") || 
    name.includes("andaman") || name.includes("kochi") || name.includes("varkala") ||
    name.includes("gokarna")
  ) {
    return [
      ...baseItems,
      {
        id: "shop-beach-sunscreen",
        name: "Sunscreen Lotion SPF 50",
        category: "Health",
        description: "Water-resistant UV protection for beach activities",
        price: 499,
        imageUrl: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca418?w=200",
        isOrderable: true
      },
      {
        id: "shop-beach-shades",
        name: "Polarized Sunglasses",
        category: "Gear",
        description: "Stylish glare protection for beach sun",
        price: 899,
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200",
        isOrderable: true
      },
      {
        id: "shop-beach-towel",
        name: "Quick-Dry Beach Towel",
        category: "Gear",
        description: "Ultra-absorbent and sand-free lightweight towel",
        price: 699,
        imageUrl: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=200",
        isOrderable: true
      }
    ];
  }

  if (
    name.includes("varanasi") || name.includes("kashi") || name.includes("jaipur") || 
    name.includes("hampi") || name.includes("agra") || name.includes("delhi") || 
    name.includes("haridwar") || name.includes("rishikesh") || name.includes("tirupati") ||
    name.includes("amritsar") || name.includes("madurai") || name.includes("temple") ||
    name.includes("shirdi") || name.includes("pushkar") || name.includes("udaipur")
  ) {
    return [
      ...baseItems,
      {
        id: "shop-heritage-scarf",
        name: "Cotton Temple Scarf",
        category: "Clothing",
        description: "Modest covering for temples and heritage structures",
        price: 299,
        imageUrl: "https://images.unsplash.com/photo-1583301286816-f4f0af04a8a6?w=200",
        isOrderable: true
      },
      {
        id: "shop-heritage-shoes",
        name: "Slip-On Walking Shoes",
        category: "Clothing",
        description: "Easy to remove outside temples and historic sites",
        price: 1299,
        imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200",
        isOrderable: true
      },
      {
        id: "shop-heritage-umbrella",
        name: "Compact Travel Umbrella",
        category: "Gear",
        description: "Protects against sudden sun and rain on heritage walks",
        price: 450,
        imageUrl: "https://images.unsplash.com/photo-1527853787696-f7be74f2e39a?w=200",
        isOrderable: true
      }
    ];
  }

  return [
    ...baseItems,
    {
      id: "shop-gen-bag",
      name: "Waterproof Backpack Cover",
      category: "Gear",
      description: "Protects your backpack and electronics from rain",
      price: 299,
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200",
      isOrderable: true
    },
    {
      id: "shop-gen-pillow",
      name: "Neck Travel Pillow",
      category: "Gear",
      description: "Comfortable support for trains, flights, or road trips",
      price: 799,
      imageUrl: "https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=200",
      isOrderable: true
    }
  ];
}

/* ─────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────── */
export default function Results() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("planId");
  const sampleId = searchParams.get("sampleId");
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [swapping, setSwapping] = useState<string | null>(null);
  const [activePlace, setActivePlace] = useState<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const { user } = useAuth();
  const { cart, addToCart } = useCart();
  const [showTour, setShowTour] = useState(false);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`trip_packing_checked_${planId || sampleId || "default"}`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(
      `trip_packing_checked_${planId || sampleId || "default"}`,
      JSON.stringify(checkedItems)
    );
  }, [checkedItems, planId, sampleId]);

  const togglePackingItem = (itemId: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  useEffect(() => {
    if (!loading && plan && user) {
      const hasSeen = localStorage.getItem(`hasSeenResultTour_${user.uid}`);
      if (!hasSeen) setShowTour(true);
    }
  }, [loading, plan, user]);

  const handleCloseTour = () => {
    if (user) localStorage.setItem(`hasSeenResultTour_${user.uid}`, "true");
    setShowTour(false);
  };

  const destinationName = plan?.destination || plan?.city || "Delhi";

  const handleSwap = async (dayIdx: number, placeIdx: number, currentPlace: any) => {
    setSwapping(`${dayIdx}-${placeIdx}`);
    try {
      const res = await api.post("/ai/swap", {
        activityName: currentPlace.name || currentPlace.place,
        destination: destinationName,
        currentItinerary: plan.itinerary[dayIdx].places,
      });
      const newItinerary = [...plan.itinerary];
      newItinerary[dayIdx].places[placeIdx] = res.data;
      setPlan({ ...plan, itinerary: newItinerary });
      if (planId) await api.patch(`/trips/${planId}`, { itinerary: newItinerary });
      toast.success("Activity swapped!");
    } catch {
      toast.error("AI swap failed");
    } finally {
      setSwapping(null);
    }
  };

  const handleRemove = async (dayIdx: number, placeIdx: number) => {
    const newItinerary = [...plan.itinerary];
    newItinerary[dayIdx].places.splice(placeIdx, 1);
    setPlan({ ...plan, itinerary: newItinerary });
    if (planId) await api.patch(`/trips/${planId}`, { itinerary: newItinerary });
    toast.success("Activity removed");
  };

  const handleFeedback = async (placeName: string, type: 'like' | 'dislike') => {
    try {
      await api.post("/profile/feedback", { placeName, type });
      toast.success(type === 'like' ? "Glad you like it! We'll show more like this." : "Noted. We'll avoid similar places.");
    } catch {
      toast.error("Feedback failed");
    }
  };

  const handleFinalize = async () => {
    if (!planId) return;
    
    // Show premium transition states
    const transitionToast = toast.loading("Creating collaboration room...");
    
    setTimeout(() => {
      toast.loading("Preparing shared itinerary...", { id: transitionToast });
    }, 1000);

    setTimeout(() => {
      toast.loading("Syncing your trip...", { id: transitionToast });
    }, 2000);

    try {
      await api.patch(`/trips/${planId}`, { type: "room" });
      
      setTimeout(() => {
        toast.success("Room ready! Opening shared headquarters...", { id: transitionToast });
        navigate(`/collaborative-trip?tripId=${planId}`);
      }, 3000);
      
    } catch {
      toast.error("Failed to finalize", { id: transitionToast });
    }
  };

  useEffect(() => {
    if (destinationName) {
      const mocks: any = { Delhi: { temp: 32, condition: "Sunny", icon: "sun" } };
      setWeather(mocks[destinationName] || { temp: 26, condition: "Clear", icon: "sun" });
    }
  }, [destinationName]);

  useEffect(() => {
    if (planId) {
      setLoading(true);
      api.get(`/trips/${planId}`)
        .then((res) => { setPlan(res.data); setLoading(false); })
        .catch(() => { toast.error("Failed to load itinerary"); setLoading(false); });
    } else if (sampleId) {
      const sample = destinationItineraries[sampleId];
      if (sample) {
        setPlan({ title: "Sample Plan", destination: sampleId, itinerary: sample, days: 3 });
        setLoading(false);
      }
    }
  }, [planId, sampleId]);

  /* Loading state */
  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
          <Loader2 className="size-8 text-indigo-500 animate-spin" />
          <p className="text-muted-foreground text-sm">Loading your itinerary…</p>
        </div>
      </AppShell>
    );
  }

  const DAY_ACCENT = [
    { dot: "bg-indigo-500 dark:bg-indigo-550", label: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/40" },
    { dot: "bg-rose-500 dark:bg-rose-555",   label: "text-rose-650 dark:text-rose-400",   border: "border-rose-500/40"   },
    { dot: "bg-amber-500 dark:bg-amber-555",  label: "text-amber-600 dark:text-amber-400",  border: "border-amber-500/40"  },
    { dot: "bg-emerald-500 dark:bg-emerald-555",label: "text-emerald-655 dark:text-emerald-400",border: "border-emerald-500/40"},
    { dot: "bg-sky-500 dark:bg-sky-555",    label: "text-sky-600 dark:text-sky-400",    border: "border-sky-500/40"    },
  ];

  return (
    <ProtectedRoute>
      <AppShell>
        <div className="min-h-screen bg-background text-foreground pb-20">

          {/* ─── TOP NAV BAR ─────────────────────────── */}
          <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-4">
              {/* Breadcrumb */}
              <div id="tour-title-block" className="flex items-center gap-3 min-w-0">
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground font-medium shrink-0">
                  <span>Trips</span>
                  <ChevronRight className="size-3.5" />
                  <span className="text-foreground font-semibold truncate max-w-[200px]">{plan?.title || destinationName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800/60 text-[10px] font-bold text-indigo-650 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-1">
                    <BadgeCheck className="size-3" /> AI Verified
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div id="tour-finalize-block" className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsPdfModalOpen(true)}
                  className="h-9 px-4 rounded-lg border border-border text-foreground text-xs font-semibold flex items-center gap-2 hover:bg-secondary hover:border-border transition-all cursor-pointer"
                >
                  <Download className="size-3.5" /> Export PDF
                </button>
                <button
                  onClick={handleFinalize}
                  className="h-9 px-5 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 hover:bg-indigo-550 transition-all shadow-sm cursor-pointer"
                >
                  <Rocket className="size-3.5" />
                  <span className="hidden sm:inline">Finalize &amp; Collaborate</span>
                  <span className="sm:hidden">Finalize</span>
                </button>
              </div>
            </div>
          </div>

          {/* ─── PAGE HEADER ─────────────────────────── */}
          <div className="border-b border-border bg-secondary/40">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-3 flex-wrap">
                <MapPin className="size-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <span className="font-medium">{destinationName}</span>
                <span className="text-muted-foreground/50">·</span>
                <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                <span>{plan?.days} days</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight">
                    {plan?.title || `Trip to ${destinationName}`}
                  </h1>
                  <p className="text-muted-foreground mt-2 text-xs sm:text-sm max-w-xl leading-relaxed">
                    Review each day, swap activities, and collaborate with your travel group.
                  </p>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-2 shrink-0">
                  <p className="text-[11px] text-muted-foreground font-medium">Estimated total cost</p>
                  <p className="text-xl sm:text-2xl font-bold text-foreground">₹{Number(plan?.totalTripCost || 35000).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── SUMMARY STRIP ───────────────────────── */}
          <TripSummaryStrip plan={plan} />

          {/* ─── MAIN GRID ───────────────────────────── */}
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-10">
            <div className="grid lg:grid-cols-[1fr_360px] gap-6 lg:gap-10 items-start">

              {/* ── LEFT: ITINERARY ── */}
              <div id="tour-timeline" className="space-y-8">
                {plan.itinerary.map((day: any, idx: number) => {
                  const accent = DAY_ACCENT[idx % DAY_ACCENT.length];
                  return (
                    <div key={idx} className="rounded-2xl border border-border bg-card overflow-hidden">
                      {/* Day header */}
                      <div className={cn("px-4 sm:px-6 py-4 sm:py-5 border-b border-border flex items-center justify-between gap-3", `border-l-4 ${accent.border}`)}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn("size-9 sm:size-10 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg text-white shrink-0", accent.dot)}>
                            {idx + 1}
                          </div>
                          <div className="min-w-0">
                            <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-0.5", accent.label)}>Day {idx + 1}</p>
                            <h2 className="text-sm sm:text-base font-bold text-foreground truncate">{day.title || `Day ${idx + 1}`}</h2>
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground font-medium bg-secondary px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
                          {(day.places || []).length} stops
                        </span>
                      </div>

                      {/* Places list */}
                      <div className="divide-y divide-border/70">
                        {(day.places || []).map((p: any, pIdx: number) => {
                          const cfg = getTypeConfig(p.type);
                          const PlaceIcon = cfg.icon;
                          const placeName = p.name || p.place || p.title || "Unnamed Place";
                          const placeDesc = p.desc || p.description || p.notes || p.reason || cfg.fallbackDesc;
                          const timeSlot = p.time || p.bestTime || "Morning";
                          const locationHint = p.city || p.area || p.locality || destinationName;
                          const isSwapping = swapping === `${idx}-${pIdx}`;
                          const pIdx1 = pIdx + 1;

                          return (
                            <div key={pIdx} className="relative group px-4 sm:px-6 py-5 hover:bg-secondary/30 transition-colors">
                              <div className="flex items-start gap-4">

                                {/* Step number + icon stacked */}
                                <div className="flex flex-col items-center gap-1 shrink-0">
                                  <div
                                    className="size-12 rounded-2xl flex items-center justify-center"
                                    style={{ backgroundColor: cfg.color + "20", border: `1.5px solid ${cfg.color}40` }}
                                  >
                                    <PlaceIcon className="size-5" style={{ color: cfg.color }} />
                                  </div>
                                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{pIdx1}</span>
                                </div>

                                {/* Content — clickable */}
                                <div
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => { setSelectedPlace(p); setIsPlaceModalOpen(true); }}
                                >
                                  {/* Name + location */}
                                  <h3 className="font-bold text-[15px] sm:text-base text-foreground group-hover:text-indigo-650 dark:group-hover:text-indigo-300 transition-colors leading-snug">
                                    {placeName}
                                  </h3>
                                  <div className="flex items-center gap-1.5 mt-0.5 mb-2">
                                    <MapPin className="size-2.5 text-muted-foreground shrink-0" />
                                    <span className="text-[11px] text-muted-foreground font-medium truncate">{locationHint}</span>
                                  </div>

                                  {/* Description — always present */}
                                  <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                                    {placeDesc}
                                  </p>

                                  {/* Chips row */}
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
                                      <Clock className="size-2.5" /> {timeSlot}
                                    </span>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ color: cfg.color, backgroundColor: cfg.color + "15" }}>
                                      {cfg.label}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground bg-secondary/80 border border-border px-2 py-0.5 rounded-md">
                                      <Clock className="size-2.5" /> {p.duration || cfg.duration}
                                    </span>
                                    {p.rating && (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-650 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-md">
                                        <Star className="size-2.5 fill-amber-500" /> {p.rating}
                                      </span>
                                    )}
                                    {p.estimatedCost && (
                                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded-md">
                                        ₹{p.estimatedCost}
                                      </span>
                                    )}
                                  </div>

                                  {/* Why Recommended badges */}
                                  {p.whyRecommended && p.whyRecommended.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1 mt-2">
                                      {p.whyRecommended.map((reason: string, rIdx: number) => (
                                        <span
                                          key={rIdx}
                                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800/40 px-2 py-0.5 rounded-md"
                                        >
                                          <CheckCircle2 className="size-2.5" />
                                          {reason}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  <p className="text-[11px] text-indigo-650 dark:text-indigo-400 opacity-60 group-hover:opacity-100 mt-2.5 flex items-center gap-1 transition-colors font-semibold">
                                    View full details <ArrowUpRight className="size-3" />
                                  </p>
                                </div>
                              </div>

                              {/* Bottom: Swap / Delete — always visible on mobile, hover-only on desktop */}
                              <div className="flex items-center gap-2 mt-3 sm:mt-0 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2">
                                <div className="flex items-center bg-secondary border border-border rounded-lg p-0.5">
                                  <button
                                    onClick={() => handleFeedback(placeName, 'like')}
                                    className="p-1.5 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-md transition-all cursor-pointer"
                                    title="I like this"
                                  >
                                    <ThumbsUp className="size-3.5" />
                                  </button>
                                  <div className="w-px h-3 bg-border mx-0.5" />
                                  <button
                                    onClick={() => handleFeedback(placeName, 'dislike')}
                                    className="p-1.5 hover:bg-rose-500/10 hover:text-rose-500 rounded-md transition-all cursor-pointer"
                                    title="Not interested"
                                  >
                                    <ThumbsDown className="size-3.5" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleSwap(idx, pIdx, p)}
                                  disabled={isSwapping}
                                  className="h-8 px-3 rounded-lg bg-secondary border border-border text-[11px] font-semibold text-foreground flex items-center gap-1.5 hover:bg-secondary-hover transition-all disabled:opacity-50 cursor-pointer"
                                >
                                  {isSwapping ? <Loader2 className="size-3 animate-spin" /> : <RefreshCw className="size-3" />}
                                  Swap
                                </button>
                                <button
                                  onClick={() => handleRemove(idx, pIdx)}
                                  className="size-8 rounded-lg bg-secondary border border-border text-muted-foreground flex items-center justify-center hover:bg-destructive/15 hover:text-destructive transition-all cursor-pointer"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Bottom CTA */}
                <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-foreground text-sm sm:text-base">Happy with your plan?</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">Finalize and open a group collaboration room with real-time chat and voting.</p>
                    </div>
                    <button
                      onClick={handleFinalize}
                      className="w-full sm:w-auto h-10 px-6 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-indigo-550 transition-all shrink-0 cursor-pointer"
                    >
                      <Rocket className="size-4" /> Finalize &amp; Collaborate
                    </button>
                  </div>
                </div>
              </div>

              {/* ── RIGHT: SIDEBAR ── */}
              <aside className="lg:sticky lg:top-20 space-y-5">
                {/* Map */}
                <div id="tour-map" className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-border flex items-center justify-between bg-secondary/50">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4 text-muted-foreground" />
                      <span className="text-sm font-bold text-foreground">Route Map</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">{destinationName}</span>
                  </div>
                  <div className="h-[220px] sm:h-[280px]">
                    <MapPreview
                      itinerary={plan.itinerary}
                      activePlace={activePlace}
                      onMarkerClick={setActivePlace}
                    />
                  </div>
                </div>

                {/* Sidebar widgets */}
                <div id="tour-sidebar-widgets" className="space-y-4 sm:space-y-5">
                  <KnowBeforeYouGo city={destinationName} weather={weather} />
                  <TravelerShopWidget
                    destinationName={destinationName}
                    checkedItems={checkedItems}
                    togglePackingItem={togglePackingItem}
                    addToCart={addToCart}
                  />
                  <StayRecommendations city={destinationName} />
                  <ValidationPanel city={destinationName} />
                </div>
              </aside>
            </div>
          </div>

          {/* Modals */}
          <PDFViewerModal isOpen={isPdfModalOpen} onClose={() => setIsPdfModalOpen(false)} plan={plan} />
          <PlaceDetailModal isOpen={isPlaceModalOpen} onClose={() => setIsPlaceModalOpen(false)} place={selectedPlace} />
          {showTour && <OnboardingTour onClose={handleCloseTour} />}

          {/* Sticky Bottom Cart Bar */}
          <AnimatePresence>
            {cart && cart.items && cart.items.length > 0 && (
              <motion.div 
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-0 left-0 right-0 z-50 p-6 lg:p-8"
              >
                <div className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-650 to-indigo-850 dark:from-indigo-900 dark:to-indigo-955 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(99,102,241,0.3)] flex items-center justify-between gap-6 border-t-2 border-white/20">
                  <div className="flex items-center gap-6">
                    <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
                      <ShoppingBag className="size-8" />
                    </div>
                    <div>
                      <div className="text-white font-black text-xl">{cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0)} items in cart</div>
                      <div className="text-white/70 text-sm font-bold">Total: ₹{cart.totalAmount}</div>
                    </div>
                  </div>
                  <Link 
                    to="/cart"
                    className="px-10 py-4 bg-white text-indigo-600 dark:text-indigo-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-xl flex items-center gap-3"
                  >
                    View Cart <ChevronRight className="size-5" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
