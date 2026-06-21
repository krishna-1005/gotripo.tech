import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MarketingNav } from "@/components/MarketingNav";
import { Footer } from "@/components/Footer";
import { 
  Star, Send, CheckCircle2, ArrowRight, Loader2, User as UserIcon,
  Sparkles, Users, Map, Wallet, MessageSquare, Landmark, BookOpen
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import api from "@/lib/api";
import { toast } from "sonner";
import confetti from "canvas-confetti";

const STYLE_INJECTION = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');
  
  .font-display {
    font-family: 'Playfair Display', Georgia, serif;
  }
  
  .font-sans-modern {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }

  /* Liquid background blob animations */
  @keyframes liquid-float-1 {
    0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
    33% { transform: translate(45px, -65px) scale(1.15) rotate(120deg); }
    66% { transform: translate(-35px, 35px) scale(0.9) rotate(240deg); }
  }

  @keyframes liquid-float-2 {
    0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
    50% { transform: translate(-55px, 55px) scale(1.2) rotate(180deg); }
  }

  @keyframes liquid-float-3 {
    0%, 100% { transform: translate(0, 0) scale(1.1) rotate(0deg); }
    40% { transform: translate(65px, 25px) scale(0.95) rotate(-90deg); }
    80% { transform: translate(-25px, -45px) scale(1.05) rotate(90deg); }
  }

  @keyframes card-hover-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .animate-liquid-1 {
    animation: liquid-float-1 25s ease-in-out infinite;
  }

  .animate-liquid-2 {
    animation: liquid-float-2 20s ease-in-out infinite;
  }

  .animate-liquid-3 {
    animation: liquid-float-3 22s ease-in-out infinite;
  }

  .animate-float-card {
    animation: card-hover-float 6s ease-in-out infinite;
  }

  /* Force light theme Liquid Glass overrides (ignores global dark class variables) */
  .liquid-glass-wrapper {
    background-color: #f8fafc !important;
    color: #1e293b !important;
  }

  .liquid-glass-panel {
    background: rgba(255, 255, 255, 0.42) !important;
    backdrop-filter: blur(24px) saturate(160%) !important;
    -webkit-backdrop-filter: blur(24px) saturate(160%) !important;
    border: 1.5px solid #94a3b8 !important;
    box-shadow: 
      0 12px 40px 0 rgba(31, 38, 135, 0.04) !important,
      inset 0 1px 1px 0 rgba(255, 255, 255, 0.95) !important;
    color: #1e293b !important;
  }

  .glass-track {
    background: rgba(15, 23, 42, 0.05) !important;
    backdrop-filter: blur(8px) !important;
    border: 1.5px solid #cbd5e1 !important;
  }

  .glass-pill {
    background: rgba(255, 255, 255, 0.85) !important;
    border: 1.5px solid #94a3b8 !important;
    box-shadow: 
      0 4px 12px 0 rgba(15, 23, 42, 0.04) !important,
      inset 0 1px 0 0 rgba(255, 255, 255, 1) !important;
  }

  .glass-feature-btn {
    background: rgba(255, 255, 255, 0.25) !important;
    backdrop-filter: blur(4px) !important;
    border: 1.5px solid #cbd5e1 !important;
    color: #475569 !important;
    transition: all 0.2s ease !important;
  }

  .glass-feature-btn:hover {
    background: rgba(255, 255, 255, 0.45) !important;
    border-color: #94a3b8 !important;
  }

  .glass-feature-selected {
    background: rgba(16, 185, 129, 0.12) !important;
    border: 2px solid #10b981 !important;
    color: #047857 !important;
    box-shadow: inset 0 2px 4px 0 rgba(16, 185, 129, 0.05) !important;
  }

  .glass-input {
    background: rgba(255, 255, 255, 0.25) !important;
    backdrop-filter: blur(4px) !important;
    border: 1.5px solid #cbd5e1 !important;
    color: #1e293b !important;
    outline: none !important;
    transition: all 0.2s ease !important;
  }

  .glass-input:focus {
    background: rgba(255, 255, 255, 0.65) !important;
    border-color: #10b981 !important;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15) !important;
  }

  .glass-input::placeholder {
    color: #94a3b8 !important;
  }
`;

const usefulOptions = [
  { value: "very_useful", label: "Very Useful", short: "🤩" },
  { value: "useful", label: "Useful", short: "😊" },
  { value: "neutral", label: "Neutral", short: "😐" },
  { value: "not_useful", label: "Not Useful", short: "😕" },
  { value: "not_at_all", label: "Not At All", short: "😞" },
];

const yesNoOptions = [
  { value: "definitely", label: "Definitely", short: "💯" },
  { value: "probably", label: "Probably", short: "👍" },
  { value: "not_sure", label: "Not Sure", short: "🤔" },
  { value: "probably_not", label: "Probably Not", short: "👎" },
  { value: "no", label: "No", short: "❌" },
];

const featureOptions = [
  { name: "AI Trip Planner", icon: Sparkles, color: "text-purple-600 bg-purple-500/10 border-purple-500/20" },
  { name: "Group Collaboration", icon: Users, color: "text-blue-600 bg-blue-500/10 border-blue-500/20" },
  { name: "Destination Explorer", icon: Map, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" },
  { name: "Budget Tracking", icon: Wallet, color: "text-amber-600 bg-amber-500/10 border-amber-500/20" },
  { name: "AI Co-pilot Chat", icon: MessageSquare, color: "text-pink-600 bg-pink-500/10 border-pink-500/20" },
  { name: "Yatra Module", icon: Landmark, color: "text-orange-600 bg-orange-500/10 border-orange-500/20" },
  { name: "Digital Passport", icon: BookOpen, color: "text-red-600 bg-red-500/10 border-red-500/20" },
];

// Glassmorphic sliding segmented control
function SegmentedControl({
  options,
  value,
  onChange,
  layoutId,
}: {
  options: { value: string; label: string; short: string }[];
  value: string;
  onChange: (val: string) => void;
  layoutId: string;
}) {
  return (
    <div className="relative flex glass-track p-1 rounded-2xl w-full overflow-hidden select-none">
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              relative z-10 flex-1 py-2.5 text-center text-xs font-semibold transition-colors duration-150 cursor-pointer focus:outline-none border-none bg-transparent
              ${isSelected ? "text-slate-900 font-bold" : "text-slate-500 hover:text-slate-800"}
            `}
          >
            {isSelected && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 glass-pill"
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              />
            )}
            <span className="relative z-20 flex items-center justify-center gap-1.5">
              <span className="text-[14px] leading-none">{opt.short}</span>
              <span className="hidden sm:inline">{opt.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    isUseful: "",
    willUseAgain: "",
    willRecommend: "",
    overallRating: 0,
    improvements: "",
    favoriteFeature: "",
  });

  // Sync user values if loaded asynchronously
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.displayName || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  const getInitials = (nameStr: string) => {
    if (!nameStr) return "U";
    return nameStr.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.isUseful || !form.willUseAgain || !form.willRecommend || form.overallRating === 0) {
      toast.error("Please answer all required fields marked with *");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/feedback", {
        name: form.name || user?.displayName || "Anonymous",
        email: form.email || user?.email || "",
        isUseful: form.isUseful,
        willUseAgain: form.willUseAgain,
        willRecommend: form.willRecommend,
        overallRating: form.overallRating,
        improvements: form.improvements,
        favoriteFeature: form.favoriteFeature,
      });

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setIsSubmitted(true);
      toast.success("Feedback logged successfully! 🎉");
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen font-sans-modern relative overflow-hidden flex flex-col justify-between liquid-glass-wrapper">
      <style>{STYLE_INJECTION}</style>
      <MarketingNav />

      {/* Floating background liquid color blobs (Bright Light-themed) */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Blob 1: Emerald Green */}
        <div className="absolute top-[10%] left-[10%] size-[500px] rounded-full bg-emerald-400/20 blur-[100px] animate-liquid-1" />
        {/* Blob 2: Sky Blue */}
        <div className="absolute bottom-[20%] right-[10%] size-[550px] rounded-full bg-sky-400/20 blur-[120px] animate-liquid-2" />
        {/* Blob 3: Lavender */}
        <div className="absolute top-[40%] right-[20%] size-[400px] rounded-full bg-violet-400/20 blur-[100px] animate-liquid-3" />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10 w-full">
        
        {/* Header Block */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-800 font-display">
            Share Your <span className="italic font-serif text-accent">Feedback</span>
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-3 max-w-md mx-auto">
            Your review directly shapes GoTripo's roadmap. Help us build India's ultimate travel dashboard.
          </p>
        </div>

        {isSubmitted ? (
          /* Success Screen */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center py-16 liquid-glass-panel rounded-3xl p-8 sm:p-12"
          >
            <div className="size-16 rounded-full bg-emerald-500/10 mx-auto grid place-items-center mb-6 border border-emerald-500/20">
              <CheckCircle2 className="size-8 text-emerald-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-3 font-display">
              Review Saved & Logged
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto mb-8 font-sans-modern">
              Thank you for sharing your journey. We read every response to build a better experience for everyone.
            </p>
            
            <a
              href="/"
              className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-accent hover:bg-accent/90 font-semibold text-sm text-white transition-all shadow-sm"
            >
              Return Home <ArrowRight className="size-4 ml-2" />
            </a>
          </motion.div>
        ) : (
          /* Split Workspace Layout */
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            
            {/* LEFT COLUMN: Testimonial Card Preview (Desktop Sticky, Floating Card) */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-6">
              <div className="liquid-glass-panel animate-float-card rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
                  <UserIcon className="size-36 text-accent" />
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                  <span className="text-[10px] font-black uppercase text-accent tracking-widest">Review Card Preview</span>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                </div>

                {/* Profile Header */}
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-gradient-to-tr from-accent to-emerald-400 text-white font-bold text-sm flex items-center justify-center shadow-inner">
                    {getInitials(form.name || user?.displayName || "Anonymous")}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 leading-none">
                      {form.name || user?.displayName || "Anonymous"}
                    </h4>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {form.email || user?.email || "your.email@example.com"}
                    </span>
                  </div>
                </div>

                {/* Stars Rating */}
                <div className="flex items-center gap-1 mt-4">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`size-4 ${
                        idx < form.overallRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Dynamic Quote Block */}
                <div className="mt-5 relative min-h-[100px]">
                  <span className="absolute -top-3 -left-2 text-6xl font-display text-slate-200 pointer-events-none leading-none select-none">“</span>
                  <blockquote className="text-sm font-medium italic text-slate-600 leading-relaxed font-display pl-4 pt-1">
                    {form.improvements || "Your suggestions, ideas, and feedback comments will display here in real-time as you write..."}
                  </blockquote>
                </div>

                {/* Badges preview */}
                <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-200">
                  {form.isUseful && (
                    <span className="text-[10px] font-semibold bg-emerald-500/5 text-emerald-600 border border-emerald-500/10 px-2.5 py-1 rounded-full">
                      🎒 {usefulOptions.find(o => o.value === form.isUseful)?.label}
                    </span>
                  )}
                  {form.willUseAgain && (
                    <span className="text-[10px] font-semibold bg-purple-500/5 text-purple-600 border border-purple-500/10 px-2.5 py-1 rounded-full">
                      ✈️ {yesNoOptions.find(o => o.value === form.willUseAgain)?.label}
                    </span>
                  )}
                  {form.willRecommend && (
                    <span className="text-[10px] font-semibold bg-sky-500/5 text-sky-600 border border-sky-500/10 px-2.5 py-1 rounded-full">
                      🤝 Recommend: {yesNoOptions.find(o => o.value === form.willRecommend)?.label}
                    </span>
                  )}
                  {form.favoriteFeature && (
                    <span className="text-[10px] font-semibold bg-amber-500/5 text-amber-600 border border-amber-500/10 px-2.5 py-1 rounded-full">
                      ⭐ {form.favoriteFeature}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: The Form Content */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="space-y-10 liquid-glass-panel p-8 rounded-3xl">
                
                {/* Overall Rating Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-800">
                    Rate your overall experience <span className="text-accent">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isLit = star <= form.overallRating;
                      return (
                        <motion.button
                          key={star}
                          type="button"
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setForm({ ...form, overallRating: star })}
                          className="transition-colors focus:outline-none cursor-pointer p-0.5 border-none bg-transparent"
                        >
                          <Star
                            className={`size-8 transition-colors ${
                              isLit
                                ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                : "text-slate-200 hover:text-amber-300"
                            }`}
                          />
                        </motion.button>
                      );
                    })}
                    {form.overallRating > 0 && (
                      <motion.span
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs font-semibold text-amber-500 ml-3 font-sans-modern"
                      >
                        {form.overallRating === 5 ? "Outstanding!" :
                         form.overallRating === 4 ? "Great!" :
                         form.overallRating === 3 ? "Good" :
                         form.overallRating === 2 ? "Fair" : "Poor"}
                      </motion.span>
                    )}
                  </div>
                </div>

                <hr className="border-slate-200" />

                {/* Usefulness Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-800">
                    How useful do you find GoTripo? <span className="text-accent">*</span>
                  </label>
                  <SegmentedControl
                    options={usefulOptions}
                    value={form.isUseful}
                    onChange={(val) => setForm({ ...form, isUseful: val })}
                    layoutId="useful-active"
                  />
                </div>

                <hr className="border-slate-200" />

                {/* Future Use Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-800">
                    Will you use GoTripo for future trips? <span className="text-accent">*</span>
                  </label>
                  <SegmentedControl
                    options={yesNoOptions}
                    value={form.willUseAgain}
                    onChange={(val) => setForm({ ...form, willUseAgain: val })}
                    layoutId="willuse-active"
                  />
                </div>

                <hr className="border-slate-200" />

                {/* Recommend Section */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-800">
                    Would you recommend GoTripo to friends? <span className="text-accent">*</span>
                  </label>
                  <SegmentedControl
                    options={yesNoOptions}
                    value={form.willRecommend}
                    onChange={(val) => setForm({ ...form, willRecommend: val })}
                    layoutId="recommend-active"
                  />
                </div>

                <hr className="border-slate-200" />

                {/* Favorite Feature Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-800">
                    Which feature did you love the most?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {featureOptions.map((feat) => {
                      const isSelected = form.favoriteFeature === feat.name;
                      const IconComponent = feat.icon;
                      return (
                        <button
                          key={feat.name}
                          type="button"
                          onClick={() => setForm({ ...form, favoriteFeature: isSelected ? "" : feat.name })}
                          className={`
                            p-3.5 rounded-2xl flex items-center gap-3 cursor-pointer text-left
                            ${isSelected
                              ? "glass-feature-selected"
                              : "glass-feature-btn"
                            }
                          `}
                        >
                          <div className={`p-2 rounded-xl border border-slate-200/50 ${feat.color}`}>
                            <IconComponent className="size-4.5" />
                          </div>
                          <span className="text-xs font-semibold">{feat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <hr className="border-slate-200" />

                {/* Suggestions and Contact */}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-800">
                      How can we improve GoTripo?
                    </label>
                    <textarea
                      value={form.improvements}
                      onChange={(e) => setForm({ ...form, improvements: e.target.value })}
                      placeholder="Share your detailed feedback, ideas, or bugs..."
                      rows={4}
                      className="w-full rounded-2xl px-4 py-3 text-sm glass-input"
                    />
                  </div>

                  {!user && (
                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-500">Name (Optional)</label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Alex Carter"
                          className="w-full rounded-2xl px-4 py-2.5 text-sm glass-input"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-slate-500">Email (Optional)</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          placeholder="alex@example.com"
                          className="w-full rounded-2xl px-4 py-2.5 text-sm glass-input"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Action button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl bg-accent hover:bg-accent/90 text-white font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-white/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        Submit Review <Send className="size-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-3">
                    Your response helps us continuously improve GoTripo. Thank you.
                  </p>
                </div>

              </form>
            </div>

          </div>
        )}

      </div>
      <Footer />
    </div>
  );
}
