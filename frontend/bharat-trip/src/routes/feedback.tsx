import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MarketingNav } from "@/components/MarketingNav";
import { Footer } from "@/components/Footer";
import { 
  Star, Send, CheckCircle2, Sparkles, Heart, 
  ThumbsUp, ArrowRight, MessageSquare, Loader2 
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import api from "@/lib/api";
import { toast } from "sonner";

const usefulOptions = [
  { value: "very_useful", label: "Very Useful", emoji: "🤩" },
  { value: "useful", label: "Useful", emoji: "😊" },
  { value: "neutral", label: "Neutral", emoji: "😐" },
  { value: "not_useful", label: "Not Useful", emoji: "😕" },
  { value: "not_at_all", label: "Not At All", emoji: "😞" },
];

const yesNoOptions = [
  { value: "definitely", label: "Definitely!", emoji: "💯" },
  { value: "probably", label: "Probably", emoji: "👍" },
  { value: "not_sure", label: "Not Sure", emoji: "🤔" },
  { value: "probably_not", label: "Probably Not", emoji: "👎" },
  { value: "no", label: "No", emoji: "❌" },
];

const featureOptions = [
  "AI Trip Planner",
  "Group Collaboration",
  "Destination Explorer",
  "Budget Tracking",
  "AI Co-pilot Chat",
  "Yatra Module",
  "Digital Passport",
];

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="group transition-all duration-200"
        >
          <Star
            className={`size-10 sm:size-12 transition-all duration-200 ${
              star <= (hover || value)
                ? "fill-amber-400 text-amber-400 scale-110"
                : "text-slate-300 dark:text-slate-600 hover:text-amber-300"
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-3 text-sm font-bold text-amber-500"
        >
          {value === 5 ? "Outstanding!" : value === 4 ? "Great!" : value === 3 ? "Good" : value === 2 ? "Fair" : "Poor"}
        </motion.span>
      )}
    </div>
  );
}

function OptionSelector({ 
  options, 
  value, 
  onChange 
}: { 
  options: { value: string; label: string; emoji: string }[]; 
  value: string; 
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`
            px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm font-bold transition-all duration-300 border-2
            ${value === opt.value
              ? "bg-accent text-white border-accent shadow-[0_8px_20px_-5px_rgba(16,185,129,0.4)] scale-105"
              : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-accent/50 hover:scale-[1.02]"
            }
          `}
        >
          <span className="mr-2">{opt.emoji}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default function FeedbackPage() {
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(0);

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

  const questions = [
    {
      title: "How useful do you find GoTripo?",
      subtitle: "Your honest opinion helps us grow",
      icon: ThumbsUp,
      content: (
        <OptionSelector
          options={usefulOptions}
          value={form.isUseful}
          onChange={(v) => setForm({ ...form, isUseful: v })}
        />
      ),
      isValid: () => form.isUseful !== "",
    },
    {
      title: "Will you use GoTripo for future trips?",
      subtitle: "We'd love to be your travel companion",
      icon: Sparkles,
      content: (
        <OptionSelector
          options={yesNoOptions}
          value={form.willUseAgain}
          onChange={(v) => setForm({ ...form, willUseAgain: v })}
        />
      ),
      isValid: () => form.willUseAgain !== "",
    },
    {
      title: "Would you recommend GoTripo to friends?",
      subtitle: "Word of mouth is our best fuel",
      icon: Heart,
      content: (
        <OptionSelector
          options={yesNoOptions}
          value={form.willRecommend}
          onChange={(v) => setForm({ ...form, willRecommend: v })}
        />
      ),
      isValid: () => form.willRecommend !== "",
    },
    {
      title: "Rate your overall experience",
      subtitle: "From 1 star (poor) to 5 stars (outstanding)",
      icon: Star,
      content: (
        <StarRating
          value={form.overallRating}
          onChange={(v) => setForm({ ...form, overallRating: v })}
        />
      ),
      isValid: () => form.overallRating > 0,
    },
    {
      title: "Which feature did you love the most?",
      subtitle: "This helps us focus on what matters",
      icon: Sparkles,
      content: (
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {featureOptions.map((feat) => (
            <button
              key={feat}
              type="button"
              onClick={() => setForm({ ...form, favoriteFeature: feat })}
              className={`
                px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm font-bold transition-all duration-300 border-2
                ${form.favoriteFeature === feat
                  ? "bg-accent text-white border-accent shadow-[0_8px_20px_-5px_rgba(16,185,129,0.4)] scale-105"
                  : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-accent/50 hover:scale-[1.02]"
                }
              `}
            >
              {feat}
            </button>
          ))}
        </div>
      ),
      isValid: () => true, // optional
    },
    {
      title: "How can we improve?",
      subtitle: "Your suggestions shape our roadmap",
      icon: MessageSquare,
      content: (
        <div className="space-y-5">
          <textarea
            value={form.improvements}
            onChange={(e) => setForm({ ...form, improvements: e.target.value })}
            placeholder="Tell us what we can do better — features you'd like, bugs you faced, or anything on your mind..."
            rows={5}
            className="w-full rounded-2xl bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 p-5 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none resize-none transition-all leading-relaxed"
          />
          {!user && (
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name (optional)"
                className="w-full rounded-2xl bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 px-5 py-3 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-accent outline-none transition-all"
              />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Your email (optional)"
                className="w-full rounded-2xl bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 px-5 py-3 text-sm text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-accent outline-none transition-all"
              />
            </div>
          )}
        </div>
      ),
      isValid: () => true, // optional
    },
  ];

  const currentQuestion = questions[step];
  const isLastStep = step === questions.length - 1;
  const progress = ((step + 1) / questions.length) * 100;

  const handleSubmit = async () => {
    if (!form.isUseful || !form.willUseAgain || !form.willRecommend || form.overallRating === 0) {
      toast.error("Please answer all required questions");
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
      setIsSubmitted(true);
      toast.success("Feedback submitted successfully! 🎉");
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (!currentQuestion.isValid()) {
      toast.error("Please select an option to continue");
      return;
    }
    if (isLastStep) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      {/* Hero Section */}
      <section className="relative pt-32 pb-10 sm:pt-40 sm:pb-16 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 size-[500px] rounded-full bg-accent/5 blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 size-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-accent/5 border border-accent/10 mb-8"
          >
            <span className="size-2 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">We Value Your Voice</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-bold text-4xl sm:text-5xl md:text-7xl tracking-tighter mb-6"
          >
            Share Your{" "}
            <span className="italic font-serif text-accent">Feedback</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto"
          >
            Help us build the travel platform India deserves. Your feedback directly shapes our next features and improvements.
          </motion.p>
        </div>
      </section>

      {/* Feedback Form */}
      <section className="pb-32">
        <div className="max-w-2xl mx-auto px-6 lg:px-10">
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              /* SUCCESS STATE */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                  className="size-28 rounded-full bg-accent/10 mx-auto grid place-items-center mb-8"
                >
                  <CheckCircle2 className="size-14 text-accent" />
                </motion.div>
                <h2 className="font-display font-bold text-3xl sm:text-4xl tracking-tight mb-4">
                  Thank You! 🙏
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto mb-10">
                  Your feedback is incredibly valuable to us. We read every single response and use it to make GoTripo better for everyone.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 h-14 px-10 rounded-2xl bg-accent text-white font-bold text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)]"
                >
                  Back to Home <ArrowRight className="size-4" />
                </a>
              </motion.div>
            ) : (
              /* FORM STEPPER */
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Progress Bar */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                      Question {step + 1} of {questions.length}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-accent"
                    />
                  </div>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="p-6 sm:p-10 rounded-[32px] bg-card border border-border shadow-pop"
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <div className="size-14 rounded-2xl bg-accent/10 grid place-items-center shrink-0">
                        <currentQuestion.icon className="size-7 text-accent" />
                      </div>
                      <div>
                        <h2 className="font-display font-bold text-xl sm:text-2xl tracking-tight">
                          {currentQuestion.title}
                        </h2>
                        <p className="text-muted-foreground text-sm mt-1">
                          {currentQuestion.subtitle}
                        </p>
                      </div>
                    </div>

                    {currentQuestion.content}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 gap-4">
                  <button
                    onClick={() => setStep(Math.max(0, step - 1))}
                    disabled={step === 0}
                    className="h-12 px-6 rounded-2xl border-2 border-border text-sm font-bold text-muted-foreground hover:text-foreground hover:border-foreground/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Back
                  </button>

                  <button
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="h-12 px-8 rounded-2xl bg-accent text-white font-bold text-sm uppercase tracking-widest hover:scale-105 active:scale-95 disabled:opacity-50 transition-all shadow-[0_8px_20px_-5px_rgba(16,185,129,0.3)] flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Submitting...
                      </>
                    ) : isLastStep ? (
                      <>
                        Submit Feedback <Send className="size-4" />
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Step dots */}
                <div className="flex items-center justify-center gap-2 mt-8">
                  {questions.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        // Only allow going to completed steps
                        if (i <= step) setStep(i);
                      }}
                      className={`size-2.5 rounded-full transition-all duration-300 ${
                        i === step
                          ? "bg-accent w-8 rounded-full"
                          : i < step
                          ? "bg-accent/40 hover:bg-accent/60"
                          : "bg-slate-200 dark:bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}
