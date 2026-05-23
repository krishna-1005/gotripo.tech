import { YatraLayout } from "@/components/YatraLayout";
import { Sparkles, Calendar, Wallet, MapPin, Plane, Train, Car, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function YatraPlanner() {
  const navigate = useNavigate();
  
  // Initialize state from localStorage if available
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem("yatra_planner_step");
    return saved ? parseInt(saved) : 1;
  });
  
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem("yatra_planner_formData");
    return saved ? JSON.parse(saved) : {
      destination: "",
      date: "",
      budget: "Medium",
      mode: "Train"
    };
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem("yatra_planner_step", step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem("yatra_planner_formData", JSON.stringify(formData));
  }, [formData]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const resetPlanner = () => {
    setStep(1);
    const initialData = {
      destination: "",
      date: "",
      budget: "Medium",
      mode: "Train"
    };
    setFormData(initialData);
    localStorage.removeItem("yatra_planner_step");
    localStorage.removeItem("yatra_planner_formData");
  };

  const handleViewPlan = () => {
    const destinationMap: Record<string, string> = {
      "Chardham": "char-dham",
      "Varanasi": "kashi-vishwanath",
      "VaishnoDevi": "vaishno-devi",
      "Puri": "char-dham" // Fallback until Puri data is added
    };
    
    const id = destinationMap[formData.destination] || "char-dham";
    navigate(`/yatra/${id}`);
  };

  return (
    <YatraLayout>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-[#E67E22] text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="size-3" />
            <span>AI Sacred Planner</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">Design your pilgrimage.</h1>
          <p className="text-muted-foreground text-base">Tell us your preferences, and let the spiritual journey unfold.</p>
        </div>

        <div className="bg-card rounded-[40px] p-8 md:p-12 shadow-pop border border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-muted">
            <motion.div 
              className="h-full bg-[#E67E22]" 
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <h3 className="text-xl font-display font-bold text-foreground mb-8">Where does the soul lead?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <OptionCard 
                    selected={formData.destination === "Chardham"} 
                    onClick={() => setFormData({...formData, destination: "Chardham"})}
                    title="Char Dham" 
                    desc="The four abodes of the Himalayas"
                  />
                  <OptionCard 
                    selected={formData.destination === "Varanasi"} 
                    onClick={() => setFormData({...formData, destination: "Varanasi"})}
                    title="Kashi Vishwanath" 
                    desc="The eternal city of Lord Shiva"
                  />
                  <OptionCard 
                    selected={formData.destination === "VaishnoDevi"} 
                    onClick={() => setFormData({...formData, destination: "VaishnoDevi"})}
                    title="Vaishno Devi" 
                    desc="The sacred call of the Mother"
                  />
                  <OptionCard 
                    selected={formData.destination === "Puri"} 
                    onClick={() => setFormData({...formData, destination: "Puri"})}
                    title="Jagannath Puri" 
                    desc="The magnificent Ratha Yatra"
                  />
                </div>
                <button 
                  onClick={nextStep}
                  disabled={!formData.destination}
                  className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Continue <ArrowRight className="size-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <h3 className="text-xl font-display font-bold text-foreground mb-8">When and how much?</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Planned Month</label>
                    <input 
                      type="month" 
                      className="w-full p-4 rounded-2xl border border-border bg-background text-foreground focus:ring-2 focus:ring-[#E67E22] outline-none font-medium"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Budget Range</label>
                    <div className="grid grid-cols-3 gap-3">
                      {["Economy", "Medium", "Premium"].map(b => (
                        <button
                          key={b}
                          onClick={() => setFormData({...formData, budget: b})}
                          className={`py-3 rounded-xl border font-bold text-sm transition-all ${
                            formData.budget === b 
                              ? "bg-orange-500/10 border-[#E67E22] text-[#E67E22]" 
                              : "border-border text-muted-foreground hover:border-[#E67E22]/50"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 py-4 rounded-2xl border border-border font-bold text-muted-foreground hover:bg-muted transition-colors">Back</button>
                  <button onClick={nextStep} className="flex-[2] py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-lg">Next <ArrowRight className="size-5" /></button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <h3 className="text-xl font-display font-bold text-foreground mb-8">Mode of Travel</h3>
                <div className="grid grid-cols-3 gap-4">
                  <ModeOption selected={formData.mode === "Air"} onClick={() => setFormData({...formData, mode: "Air"})} icon={<Plane />} label="Air" />
                  <ModeOption selected={formData.mode === "Train"} onClick={() => setFormData({...formData, mode: "Train"})} icon={<Train />} label="Train" />
                  <ModeOption selected={formData.mode === "Road"} onClick={() => setFormData({...formData, mode: "Road"})} icon={<Car />} label="Road" />
                </div>
                <button 
                  onClick={nextStep}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#E67E22] to-[#F4B740] text-white font-bold text-lg shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all"
                >
                  Generate My Sacred Itinerary
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="size-20 rounded-full bg-emerald-500/10 text-[#059669] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="size-10" />
                </div>
                <h3 className="text-3xl font-display font-bold text-foreground mb-4">Your Path is Ready.</h3>
                <p className="text-muted-foreground mb-10 max-w-sm mx-auto">
                  We've curated a {formData.budget.toLowerCase()} journey to {formData.destination} for you. 
                  Your spiritual transformation begins now.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={handleViewPlan}
                    className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 shadow-lg hover:opacity-90 transition-opacity"
                  >
                    View Custom Plan <ArrowRight className="size-5" />
                  </button>
                  <button 
                    onClick={resetPlanner}
                    className="w-full py-4 rounded-2xl border border-border text-muted-foreground font-bold hover:bg-muted transition-colors"
                  >
                    Start Over
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </YatraLayout>
  );
}

function OptionCard({ selected, onClick, title, desc }: { selected: boolean, onClick: () => void, title: string, desc: string }) {
  return (
    <button 
      onClick={onClick}
      className={`p-6 rounded-3xl border-2 text-left transition-all ${
        selected 
          ? "border-[#E67E22] bg-orange-500/5 shadow-md" 
          : "border-border hover:border-[#F4B740]/50 bg-card"
      }`}
    >
      <h4 className={`font-display font-bold mb-1 ${selected ? "text-[#E67E22]" : "text-foreground"}`}>{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </button>
  );
}

function ModeOption({ selected, onClick, icon, label }: { selected: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${
        selected 
          ? "border-[#E67E22] bg-orange-500/5 text-[#E67E22]" 
          : "border-border text-muted-foreground hover:border-[#F4B740]/50 bg-card"
      }`}
    >
      <div className={`size-10 rounded-xl flex items-center justify-center ${selected ? "bg-[#E67E22] text-white" : "bg-muted"}`}>
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
