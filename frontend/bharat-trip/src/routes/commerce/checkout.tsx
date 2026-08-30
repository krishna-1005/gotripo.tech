import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { 
  ArrowRight, ChevronLeft, MapPin, CreditCard, 
  CheckCircle2, Loader2, Sparkles, Package, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<any>(null);
  
  const [address, setAddress] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: ""
  });

  const deliveryCharges = 50;
  const gst = Math.round((cart?.totalAmount || 0) * 0.05);
  const finalTotal = (cart?.totalAmount || 0) + deliveryCharges + gst;

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      const res = await api.post("/orders", {
        deliveryAddress: address
      });
      
      setOrderConfirmed(res.data);
      clearCart();
      toast.success("Order placed successfully!");
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FF6B00", "#FFD700", "#FFFFFF"]
      });
    } catch (err) {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (orderConfirmed) {
    return (
      <AppShell>
        <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full bg-[#1A1A1A] rounded-[3rem] p-12 text-center border-2 border-[#FF6B00]/20 shadow-[0_30px_100px_rgba(255,107,0,0.15)]"
          >
            <div className="size-32 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
              <CheckCircle2 className="size-16 text-[#FF6B00]" />
            </div>
            <h1 className="text-3xl font-black mb-4 font-['Cinzel'] tracking-tight">Order <span className="text-[#FF6B00]">Manifested!</span></h1>
            <p className="text-white/60 mb-10 text-lg italic">"Your sacred items are being prepared for their journey."</p>
            
            <div className="bg-white/5 rounded-3xl p-8 mb-10 border border-white/10 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-white/40 font-bold uppercase tracking-widest">Order ID</span>
                <span className="text-[#FFD700] font-black">{orderConfirmed.orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40 font-bold uppercase tracking-widest">Delivery</span>
                <span className="text-white font-black">{new Date(orderConfirmed.estimatedDelivery).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Link 
                to="/orders"
                className="w-full py-5 bg-[#FF6B00] text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:bg-[#E32636] transition-all"
              >
                Track My Order
              </Link>
              <Link 
                to="/dashboard"
                className="text-white/40 hover:text-[#FF6B00] font-bold text-sm uppercase tracking-widest transition-all"
              >
                Back to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0F0F0F] text-white font-['Poppins'] pb-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-16">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div className={`size-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                  step === s ? "bg-[#FF6B00] text-white shadow-[0_0_20px_rgba(255,107,0,0.5)]" : 
                  step > s ? "bg-emerald-500 text-white" : "bg-white/5 text-white/40"
                }`}>
                  {step > s ? <CheckCircle2 className="size-5" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-1 rounded-full ${step > s ? "bg-emerald-500" : "bg-white/5"}`} />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#1A1A1A] rounded-[3rem] p-10 md:p-14 border border-white/5 shadow-2xl"
                >
                  <h3 className="text-2xl font-black mb-10 font-['Cinzel'] flex items-center gap-4">
                    <MapPin className="size-7 text-[#FF6B00]" /> Delivery Address
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Full Name</label>
                      <input 
                        type="text"
                        value={address.name}
                        onChange={(e) => setAddress({...address, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-[#FF6B00] transition-all font-bold"
                        placeholder="Krishna Kulkarni"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Phone Number</label>
                      <input 
                        type="text"
                        value={address.phone}
                        onChange={(e) => setAddress({...address, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-[#FF6B00] transition-all font-bold"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Complete Address</label>
                      <textarea 
                        value={address.address}
                        onChange={(e) => setAddress({...address, address: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-[#FF6B00] transition-all font-bold h-32"
                        placeholder="House No, Street, Area..."
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">City</label>
                      <input 
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-[#FF6B00] transition-all font-bold"
                        placeholder="Bengaluru"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-2">Pincode</label>
                      <input 
                        type="text"
                        value={address.pincode}
                        onChange={(e) => setAddress({...address, pincode: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 focus:outline-none focus:border-[#FF6B00] transition-all font-bold"
                        placeholder="560001"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={!address.name || !address.address}
                    onClick={() => setStep(2)}
                    className="w-full mt-12 py-5 bg-[#FF6B00] text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-[#E32636] transition-all disabled:opacity-50"
                  >
                    Continue to Summary <ArrowRight className="size-5" />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#1A1A1A] rounded-[3rem] p-10 md:p-14 border border-white/5 shadow-2xl"
                >
                  <h3 className="text-2xl font-black mb-10 font-['Cinzel'] flex items-center gap-4">
                    <Package className="size-7 text-[#FF6B00]" /> Order Summary
                  </h3>

                  <div className="space-y-4 mb-10">
                    {cart?.items.map((item) => (
                      <div key={item.itemId} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="size-12 rounded-xl bg-white/5 overflow-hidden border border-white/10">
                            <img src={item.imageUrl} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">{item.name}</div>
                            <div className="text-white/40 text-[10px] uppercase font-black">Qty: {item.quantity}</div>
                          </div>
                        </div>
                        <div className="font-black text-sm">₹{item.price * item.quantity}</div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4 border-t border-white/5 pt-8 mb-10">
                    <div className="flex justify-between text-white/40 font-bold text-sm">
                      <span>Subtotal</span>
                      <span className="text-white">₹{cart?.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-white/40 font-bold text-sm">
                      <span>Delivery & GST</span>
                      <span className="text-white">₹{deliveryCharges + gst}</span>
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <span className="text-xl font-black font-['Cinzel']">Total Amount</span>
                      <span className="text-3xl font-black text-[#FF6B00]">₹{finalTotal}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setStep(1)}
                      className="px-8 py-5 bg-white/5 text-white rounded-2xl font-black text-sm uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setStep(3)}
                      className="flex-1 py-5 bg-[#FF6B00] text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-[#E32636] transition-all"
                    >
                      Proceed to Payment <ArrowRight className="size-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-[#1A1A1A] rounded-[3rem] p-10 md:p-14 border border-white/5 shadow-2xl text-center"
                >
                  <div className="size-24 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mx-auto mb-10">
                    <CreditCard className="size-12 text-[#FF6B00]" />
                  </div>
                  <h3 className="text-3xl font-black mb-4 font-['Cinzel']">Secure Payment</h3>
                  <p className="text-white/40 mb-12 italic">Complete your transaction of ₹{finalTotal}</p>

                  <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 mb-12 max-w-sm mx-auto">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <ShieldCheck className="size-6" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-black uppercase tracking-widest text-white/60">GTP Secure Pay</div>
                        <div className="text-[10px] text-white/30">End-to-end encrypted</div>
                      </div>
                    </div>
                    <div className="text-4xl font-black text-white font-['Cinzel'] mb-2">₹{finalTotal}</div>
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Transaction ID: DIVINE-{Math.random().toString(36).substring(7).toUpperCase()}</div>
                  </div>

                  <div className="flex gap-4 max-w-sm mx-auto">
                    <button 
                      onClick={() => setStep(2)}
                      className="px-8 py-5 bg-white/5 text-white rounded-2xl font-black text-sm uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      disabled={loading}
                      onClick={handlePlaceOrder}
                      className="flex-1 py-5 bg-[#FF6B00] text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-[#E32636] transition-all disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="size-5 animate-spin" /> : "Pay & Order"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
