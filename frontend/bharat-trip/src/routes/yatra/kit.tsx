import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import { 
  Package, ShoppingCart, CheckCircle2, ChevronRight, 
  Info, Loader2, Sparkles, Filter, Archive, ArrowRight,
  ShieldCheck, AlertCircle, ShoppingBag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

export default function YatraKitPage() {
  const { id } = useParams(); // yatraId
  const [kit, setKit] = useState<any>(null);
  const [yatra, setYatra] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const { addToCart, cart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [kitRes, yatraRes] = await Promise.all([
          api.get(`/yatra-kit/${id}`),
          api.get(`/yatra/${id}`)
        ]);
        setKit(kitRes.data);
        setYatra(yatraRes.data);

        // Load checked items from local storage
        const saved = localStorage.getItem(`yatra_kit_checked_${id}`);
        if (saved) setCheckedItems(JSON.parse(saved));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load yatra kit");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleItem = (itemId: string) => {
    const newChecked = { ...checkedItems, [itemId]: !checkedItems[itemId] };
    setCheckedItems(newChecked);
    localStorage.setItem(`yatra_kit_checked_${id}`, JSON.stringify(newChecked));
  };

  const categories = ["All", "Puja Items", "Clothing", "Medicines", "Documents"];
  
  const filteredItems = kit?.items?.filter((item: any) => 
    activeCategory === "All" || item.category === activeCategory
  );

  const totalItems = kit?.items?.length || 0;
  const readyItems = Object.values(checkedItems).filter(Boolean).length;
  const progress = totalItems > 0 ? (readyItems / totalItems) * 100 : 0;

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
          <Loader2 className="size-12 text-[#FF6B00] animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0F0F0F] text-white font-['Poppins'] pb-32">
        {/* Header Section */}
        <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={yatra?.imageUrl || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070"} 
              className="w-full h-full object-cover opacity-30" 
              alt="Yatra Background"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0F0F0F]" />
          </div>
          
          <div className="relative z-10 text-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-6xl font-black mb-4 font-['Cinzel'] tracking-tight">
                Your Yatra <span className="text-[#FF6B00]">Kit</span>
              </h1>
              <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto italic">
                Check what you have for {yatra?.name}, order what you don't.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
          {/* Progress Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1A1A1A] rounded-3xl p-8 border border-white/5 shadow-2xl mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
                  <CheckCircle2 className="size-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Preparation Progress</h3>
                  <p className="text-white/40 text-sm">You have {readyItems}/{totalItems} items ready</p>
                </div>
              </div>
              <div className="text-3xl font-black text-[#FF6B00] font-['Cinzel']">{Math.round(progress)}%</div>
            </div>
            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FFD700]"
              />
            </div>
          </motion.div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-8 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all border ${
                  activeCategory === cat 
                    ? "bg-[#FF6B00] border-[#FF6B00] text-white shadow-[0_10px_20px_rgba(255,107,0,0.3)]" 
                    : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredItems?.map((item: any) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`bg-[#1A1A1A] rounded-3xl border-2 transition-all p-6 relative overflow-hidden group ${
                    checkedItems[item.id] ? "border-[#FF6B00]/50" : "border-white/5"
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <button 
                      onClick={() => toggleItem(item.id)}
                      className={`size-8 rounded-xl border-2 flex items-center justify-center transition-all shrink-0 ${
                        checkedItems[item.id] ? "bg-[#FF6B00] border-[#FF6B00]" : "border-white/10"
                      }`}
                    >
                      {checkedItems[item.id] && <CheckCircle2 className="size-5 text-white" />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {item.isEssential ? (
                          <span className="px-2 py-0.5 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] text-[8px] font-black uppercase tracking-widest border border-[#FF6B00]/20 flex items-center gap-1">
                            <ShieldCheck className="size-3" /> Essential
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest border border-blue-500/20 flex items-center gap-1">
                            <Sparkles className="size-3" /> Recommended
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-lg bg-white/5 text-white/40 text-[8px] font-black uppercase tracking-widest border border-white/10">
                          {item.category}
                        </span>
                      </div>
                      
                      <h4 className={`text-lg font-black mb-1 transition-all ${checkedItems[item.id] ? "line-through text-white/30" : "text-white"}`}>
                        {item.name}
                      </h4>
                      <p className="text-white/40 text-xs mb-4 line-clamp-2">{item.description}</p>
                      
                      {item.isOrderable ? (
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                          <div className="text-xl font-black text-[#FFD700]">₹{item.price}</div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart({ itemId: item.id, name: item.name, price: item.price, imageUrl: item.imageUrl, yatraId: id });
                            }}
                            className="p-3 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-[#FF6B00] hover:border-[#FF6B00] transition-all group/btn"
                          >
                            <ShoppingCart className="size-5 group-hover/btn:scale-110 transition-transform" />
                          </button>
                        </div>
                      ) : (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                          <Archive className="size-3" /> Carry from home
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item Image Overlay */}
                  <div className="absolute -bottom-6 -right-6 size-24 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Package className="size-full" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <AnimatePresence>
          {cart && cart.items.length > 0 && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-6 lg:p-8"
            >
              <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#FF6B00] to-[#E32636] rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(255,107,0,0.4)] flex items-center justify-between gap-6 border-t-2 border-white/20">
                <div className="flex items-center gap-6">
                  <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center text-white backdrop-blur-md">
                    <ShoppingBag className="size-8" />
                  </div>
                  <div>
                    <div className="text-white font-black text-xl">{cart.items.length} items in cart</div>
                    <div className="text-white/70 text-sm font-bold">Total: ₹{cart.totalAmount}</div>
                  </div>
                </div>
                <Link 
                  to="/cart"
                  className="px-10 py-4 bg-white text-[#FF6B00] rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-xl flex items-center gap-3"
                >
                  View Cart <ArrowRight className="size-5" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
