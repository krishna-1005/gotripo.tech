import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { 
  Search, ShoppingCart, Package, ArrowRight, Loader2, 
  ShoppingBag, ChevronRight, Sparkles, Star, CheckCircle2, 
  Archive, ShieldCheck, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function TripShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { cart, addToCart } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);

  // Sync state if query parameter changes
  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await api.get("/yatra-kit/items/orderable");
        
        const generalShopItems = [
          { id: "shop-gen-pb", name: "10000mAh Power Bank", description: "Keep your phones charged during long sightseeing tours", category: "Gear", price: 999, imageUrl: "https://images.unsplash.com/photo-1609592424109-dd6e2b960fba?w=200", isOrderable: true },
          { id: "shop-gen-firstaid", name: "Travel First Aid Kit", description: "Basic medicines, band-aids, ORS and antiseptics", category: "Medicines", price: 349, imageUrl: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=200", isOrderable: true },
          { id: "shop-gen-bottle", name: "Insulated Water Bottle", description: "Keep your water cold or hot on your journey", category: "Gear", price: 599, imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=200", isOrderable: true },
          { id: "shop-beach-sunscreen", name: "Sunscreen Lotion SPF 50", description: "Water-resistant UV protection for beach activities", category: "Medicines", price: 499, imageUrl: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca418?w=200", isOrderable: true },
          { id: "shop-beach-shades", name: "Polarized Sunglasses", description: "Stylish glare protection for beach sun", category: "Gear", price: 899, imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=200", isOrderable: true },
          { id: "shop-beach-towel", name: "Quick-Dry Beach Towel", description: "Ultra-absorbent and sand-free lightweight towel", category: "Gear", price: 699, imageUrl: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=200", isOrderable: true },
          { id: "shop-heritage-scarf", name: "Cotton Temple Scarf", description: "Modest covering for temples and heritage structures", category: "Clothing", price: 299, imageUrl: "https://images.unsplash.com/photo-1583301286816-f4f0af04a8a6?w=200", isOrderable: true },
          { id: "shop-heritage-shoes", name: "Slip-On Walking Shoes", description: "Easy to remove outside temples and historic sites", category: "Clothing", price: 1299, imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200", isOrderable: true },
          { id: "shop-heritage-umbrella", name: "Compact Travel Umbrella", description: "Protects against sudden sun and rain on walks", category: "Gear", price: 450, imageUrl: "https://images.unsplash.com/photo-1527853787696-f7be74f2e39a?w=200", isOrderable: true },
          { id: "shop-gen-bag", name: "Waterproof Backpack Cover", description: "Protects your backpack and electronics from rain", category: "Gear", price: 299, imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200", isOrderable: true },
          { id: "shop-gen-pillow", name: "Neck Travel Pillow", description: "Comfortable support for trains, flights, or road trips", category: "Gear", price: 799, imageUrl: "https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=200", isOrderable: true }
        ];

        const dbItems = res.data || [];
        const merged = [...dbItems, ...generalShopItems];
        
        // Deduplicate items by name
        const unique = Array.from(new Set(merged.map(x => x.name)))
          .map(name => merged.find(x => x.name === name));

        setItems(unique);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load shop catalog");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleAddToCart = async (item: any) => {
    setAddingId(item.id);
    try {
      await addToCart({
        itemId: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl
      });
    } finally {
      setAddingId(null);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchParams(value ? { q: value } : {});
  };

  const categories = ["All", "Clothing", "Puja Items", "Medicines", "Gear"];

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || 
      item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FFFDF7] dark:bg-[#0F0F0F] text-foreground font-['Poppins'] pb-36">
        
        {/* Cover Shop Header */}
        <div className="relative h-[30vh] min-h-[260px] flex items-center justify-center overflow-hidden bg-gradient-to-r from-amber-600/20 to-orange-600/20 dark:from-[#1A1A1A] dark:to-[#0F0F0F] border-b border-border">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <pattern id="shop-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </svg>
            <rect width="100%" height="100%" fill="url(#shop-pattern)" />
          </div>

          <div className="relative z-10 text-center px-6">
            <h1 className="text-4xl md:text-5xl font-black mb-3 font-['Cinzel'] tracking-tight">
              Traveler <span className="text-amber-500">Catalog</span>
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Gear up for your upcoming adventure. Order premium quality essentials and holy temple kits.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12">
          
          {/* Search & Categories Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-transform group-focus-within:scale-110" />
              <input 
                type="text"
                placeholder="Search travel gear, clothing, first-aid..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-secondary/50 border border-border rounded-2xl py-4.5 pl-12 pr-6 text-sm focus:outline-none focus:border-amber-500 focus:bg-card transition-all"
              />
            </div>

            {/* Categories */}
            <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all border cursor-pointer",
                    selectedCategory === cat 
                      ? "bg-amber-500 border-amber-500 text-white shadow-lg" 
                      : "bg-secondary/40 border-border text-muted-foreground hover:border-border-hover hover:text-foreground"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="size-10 text-amber-500 animate-spin" />
              <p className="text-muted-foreground text-sm">Loading product catalog...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="size-20 bg-secondary rounded-full flex items-center justify-center mb-6">
                <Package className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-black mb-2">No items found</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                We couldn't find matches for "{searchQuery}". Try refining your search query.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item) => (
                <div 
                  key={item.id}
                  className="bg-card border border-border hover:border-amber-500/30 rounded-3xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col group"
                >
                  {/* Image container */}
                  <div className="aspect-[4/3] w-full bg-secondary relative overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200";
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[9px] font-black text-white uppercase tracking-widest">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-base text-foreground leading-snug group-hover:text-amber-500 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Price and Cart Action */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
                      <div className="text-lg font-black text-foreground">₹{item.price}</div>
                      <button 
                        onClick={() => handleAddToCart(item)}
                        disabled={addingId === item.id}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-all font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        {addingId === item.id ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <ShoppingCart className="size-3.5" />
                        )}
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Bottom Cart Bar */}
        <AnimatePresence>
          {cart && cart.items && cart.items.length > 0 && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-6 lg:p-8"
            >
              <div className="max-w-4xl mx-auto bg-gradient-to-r from-amber-500 to-orange-500 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(245,158,11,0.3)] flex items-center justify-between gap-6 border-t-2 border-white/20">
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
                  className="px-10 py-4 bg-white text-amber-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-xl flex items-center gap-3"
                >
                  View Cart <ChevronRight className="size-5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
