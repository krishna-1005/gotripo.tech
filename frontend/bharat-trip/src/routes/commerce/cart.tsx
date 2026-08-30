import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { 
  Trash2, Plus, Minus, ArrowRight, ShoppingBag, 
  ChevronLeft, CreditCard, ShieldCheck, Truck, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  const deliveryCharges = 50;
  const gst = Math.round((cart?.totalAmount || 0) * 0.05);
  const finalTotal = (cart?.totalAmount || 0) + deliveryCharges + gst;

  if (loading) {
    return (
      <AppShell>
        <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F]">
          <div className="size-16 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0F0F0F] text-white font-['Poppins'] pb-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-12">
            <button 
              onClick={() => navigate(-1)}
              className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
            >
              <ChevronLeft className="size-6" />
            </button>
            <div>
              <h1 className="text-3xl font-black font-['Cinzel'] tracking-tight">Your <span className="text-[#FF6B00]">Trip Cart</span></h1>
              <p className="text-white/40 text-sm italic">Essentials curated for your next adventure</p>
            </div>
          </div>

          {!cart || cart.items.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1A1A1A] rounded-[3rem] p-20 text-center border border-white/5"
            >
              <div className="size-40 bg-[#FF6B00]/5 rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-dashed border-[#FF6B00]/20">
                <ShoppingBag className="size-20 text-[#FF6B00]/30" />
              </div>
              <h3 className="text-2xl font-black mb-4">Your cart is empty</h3>
              <p className="text-white/40 mb-10 max-w-md mx-auto">
                Prepare for your journey by adding essential travel kits, gear, and accessories.
              </p>
              <Link 
                to="/yatra/shop"
                className="inline-flex items-center gap-3 px-10 py-4 bg-[#FF6B00] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#E32636] transition-all shadow-[0_10px_30px_rgba(255,107,0,0.3)]"
              >
                Explore Shop <ArrowRight className="size-5" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-6">
                <AnimatePresence mode="popLayout">
                  {cart.items.map((item) => (
                    <motion.div
                      layout
                      key={item.itemId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-[#1A1A1A] rounded-[2rem] p-6 border border-white/5 flex flex-col md:flex-row items-center gap-8 group"
                    >
                      <div className="size-28 rounded-2xl bg-white/5 overflow-hidden shrink-0 border border-white/10 group-hover:border-[#FF6B00]/30 transition-all">
                        <img 
                          src={item.imageUrl || "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=200"} 
                          className="w-full h-full object-cover" 
                          alt={item.name}
                        />
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-xl font-black mb-1">{item.name}</h4>
                        <div className="text-[#FFD700] font-bold">₹{item.price}</div>
                      </div>

                      <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-2 border border-white/10">
                        <button 
                          onClick={() => updateQuantity(item.itemId, item.quantity - 1)}
                          className="size-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="w-8 text-center font-black">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.itemId, item.quantity + 1)}
                          className="size-10 rounded-xl hover:bg-white/10 flex items-center justify-center transition-all"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>

                      <div className="text-xl font-black text-white min-w-[80px] text-right">
                        ₹{item.price * item.quantity}
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.itemId)}
                        className="size-12 rounded-2xl text-white/20 hover:text-red-500 hover:bg-red-500/10 flex items-center justify-center transition-all shrink-0"
                      >
                        <Trash2 className="size-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                <div className="pt-6">
                  <Link to="/dashboard" className="text-[#FF6B00] font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                    <ChevronLeft className="size-4" /> Continue Planning
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-32 space-y-8">
                  <div className="bg-[#1A1A1A] rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <CreditCard className="size-32" />
                    </div>

                    <h3 className="text-xl font-black mb-8 font-['Cinzel'] flex items-center gap-3">
                      Order Summary <Sparkles className="size-5 text-[#FFD700]" />
                    </h3>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-white/40 font-bold text-sm">
                        <span>Subtotal</span>
                        <span className="text-white">₹{cart.totalAmount}</span>
                      </div>
                      <div className="flex justify-between text-white/40 font-bold text-sm">
                        <span className="flex items-center gap-2">Delivery Charges <Truck className="size-3" /></span>
                        <span className="text-white">₹{deliveryCharges}</span>
                      </div>
                      <div className="flex justify-between text-white/40 font-bold text-sm">
                        <span>GST (5%)</span>
                        <span className="text-white">₹{gst}</span>
                      </div>
                    </div>

                    <div className="h-px bg-white/5 mb-8" />

                    <div className="flex justify-between items-center mb-10">
                      <span className="text-lg font-black font-['Cinzel']">Total Amount</span>
                      <span className="text-3xl font-black text-[#FF6B00]">₹{finalTotal}</span>
                    </div>

                    <Link 
                      to="/checkout"
                      className="w-full py-5 bg-[#FF6B00] text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(255,107,0,0.3)] hover:bg-[#E32636] transition-all"
                    >
                      Proceed to Order <ArrowRight className="size-5" />
                    </Link>
                  </div>

                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                      <ShieldCheck className="size-5 text-emerald-500" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">Secure Payment</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                      <Truck className="size-5 text-blue-500" />
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-tight">Priority Delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
