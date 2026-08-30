import { useState, useEffect } from "react";
import { Check, Sparkles, Zap, Shield, Crown, Users, MapPin, CreditCard, HelpCircle, Heart, ArrowRight, Clock, ChevronDown, ChevronUp, Globe, Map, Download, Star, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { MarketingNav } from "@/components/MarketingNav";
import { useAuth } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";

interface PricingTier {
  name: string;
  slogan: string;
  monthlyPrice: string;
  annualPrice: string;
  period: string;
  annualBilled: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
  elite?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Free Explorer",
    slogan: "For weekenders and quick getaways.",
    monthlyPrice: "₹0",
    annualPrice: "₹0",
    period: "",
    annualBilled: "Always free",
    features: [
      "3 AI plan generations per month",
      "Single-destination trip planner",
      "Standard PDF & print exports",
      "Standard AI Copilot chat",
      "Basic traveler passport (3 badges)",
      "Community reviews & gallery access",
    ],
    buttonText: "Start Free",
  },
  {
    name: "Pro Adventurer",
    slogan: "For active travelers & group trip planners.",
    monthlyPrice: "₹249",
    annualPrice: "₹199",
    period: "/month",
    annualBilled: "billed ₹2,388/year",
    features: [
      "Unlimited AI plan generations",
      "Single & Multi-destination planner",
      "Collab Rooms (up to 5 co-planners)",
      "High-speed AI routing engine",
      "Expense splitter & group budgets",
      "Digital passport with unlimited stamps",
      "Offline maps & checklist persistence",
    ],
    buttonText: "Upgrade to Pro",
    popular: true,
  },
  {
    name: "Elite Nomad",
    slogan: "VIP travel power, custom styles, and human expert assist.",
    monthlyPrice: "₹599",
    annualPrice: "₹479",
    period: "/month",
    annualBilled: "billed ₹5,748/year",
    features: [
      "Everything in Pro plan",
      "Unlimited Collab Room members",
      "VIP Custom travel style AI models",
      "Early access to Living Heatmap & Globe",
      "15% flat discount at Yatra Kit Store",
      "Custom branded agency PDF exports",
      "24/7 Priority support (Human Planner assist)",
    ],
    buttonText: "Go Elite",
    elite: true,
  },
];

const faqs = [
  {
    question: "Can I cancel or change my plan anytime?",
    answer: "Yes, you can upgrade, downgrade, or cancel your subscription at any time directly from your account settings. If you cancel, your premium features will remain active until the end of your current billing period.",
  },
  {
    question: "How does real-time collaboration work in Collab Rooms?",
    answer: "Pro and Elite users can invite friends or family members to join their trip planning room. Everyone in the room can collaboratively add spots, check off items on the visited checklist, and log expenses in real-time. Friends can join and collaborate for free without needing a Pro subscription themselves.",
  },
  {
    question: "Do you offer a refund policy?",
    answer: "We stand behind our service! We offer a full 7-day money-back guarantee for both Pro Adventurer and Elite Nomad subscriptions if you are not satisfied with your experience.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We support a wide range of secure payment options including UPI, major credit/debit cards (Visa, Mastercard, RuPay), Netbanking, and popular digital wallets.",
  },
  {
    question: "Is there a student or non-profit discount available?",
    answer: "Yes! We offer a 50% discount on our Pro Adventurer plan for students, educators, and registered non-profit organizations. Please reach out to our support team with valid credentials to apply.",
  },
];

const planKeys: Record<string, string> = {
  "Free Explorer": "free",
  "Pro Adventurer": "pro",
  "Elite Nomad": "elite"
};

export default function Pricing() {
  const { user, mongoUser } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentTier, setCurrentTier] = useState<string>("free");
  const [updatingTier, setUpdatingTier] = useState<string | null>(null);

  useEffect(() => {
    if (mongoUser?.subscriptionTier) {
      setCurrentTier(mongoUser.subscriptionTier);
    }
  }, [mongoUser]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSelectPlan = async (tierName: string) => {
    if (!user) {
      toast.info("Please log in to upgrade or change plans.");
      navigate("/auth?redirect=/pricing");
      return;
    }

    const targetTier = planKeys[tierName];
    if (currentTier === targetTier) return;

    setUpdatingTier(targetTier);
    try {
      await api.put("/profile", { subscriptionTier: targetTier });
      setCurrentTier(targetTier);
      toast.success(`Successfully switched to ${tierName}!`);
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to update subscription plan.");
    } finally {
      setUpdatingTier(null);
    }
  };

  const content = (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      
      {/* Decorative Blur Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/5 dark:bg-emerald-500/[0.03] blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[30%] right-1/4 w-[600px] h-[600px] rounded-full bg-accent/5 dark:bg-accent/[0.02] blur-[150px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="size-4 animate-pulse" />
            <span>Find your perfect plan</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-6 leading-tight">
            Flexible Plans for Every <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">Adventure</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Whether you are coordinating a quick weekend getaway or embarking on a global voyage, GoTripo gives you the tools, AI smarts, and collaboration features to plan effortlessly.
          </p>
        </div>

        {/* Monthly / Annual Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-sm font-semibold transition-colors duration-300 ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly Billing
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
            className="w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-800 relative transition-colors focus:outline-none border border-slate-300/30"
            aria-label="Toggle billing cycle"
          >
            <div className={`absolute top-0.5 size-6.5 rounded-full bg-accent transition-transform duration-300 flex items-center justify-center text-white ${billingCycle === "annual" ? "translate-x-8.5" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-sm font-semibold transition-colors duration-300 flex items-center gap-2 ${billingCycle === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
            Annual Billing
            <span className="text-[10px] font-black uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/25">
              Save 20%
            </span>
          </span>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 items-stretch mb-28">
          {tiers.map((tier) => {
            const isPro = tier.popular;
            const isElite = tier.elite;
            const price = billingCycle === "monthly" ? tier.monthlyPrice : tier.annualPrice;
            const targetTier = planKeys[tier.name];
            const isActive = currentTier === targetTier;
            const isUpdating = updatingTier === targetTier;

            let buttonText = tier.buttonText;
            if (isActive) {
              buttonText = "Current Plan";
            } else if (currentTier === "free") {
              buttonText = `Upgrade to ${tier.name.split(' ')[0]}`;
            } else if (currentTier === "pro") {
              if (targetTier === "elite") {
                buttonText = "Upgrade to Elite";
              } else {
                buttonText = "Downgrade to Free";
              }
            } else if (currentTier === "elite") {
              buttonText = `Downgrade to ${tier.name.split(' ')[0]}`;
            }

            return (
              <div
                key={tier.name}
                className={`relative rounded-3xl p-8 transition-all duration-500 flex flex-col justify-between border ${
                  isPro
                    ? "bg-slate-50 dark:bg-slate-900/60 border-accent shadow-[0_20px_50px_rgba(16,185,129,0.15)] md:-translate-y-4 scale-105 z-10"
                    : isElite
                    ? "bg-card border-border/80 hover:border-accent/40 shadow-soft hover:shadow-card"
                    : "bg-card border-border/80 hover:border-slate-400/30 shadow-soft hover:shadow-card"
                }`}
              >
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-500 dark:to-teal-400 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg tracking-widest">
                    Most Popular
                  </div>
                )}
                {isElite && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg tracking-widest">
                    Elite VIP
                  </div>
                )}

                <div>
                  {/* Tier Name & Slogan */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold tracking-tight">{tier.name}</h3>
                      {isPro && <Zap className="size-5 text-accent animate-bounce" />}
                      {isElite && <Crown className="size-5 text-amber-500 animate-pulse" />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed min-h-[32px]">{tier.slogan}</p>
                  </div>

                  {/* Pricing Amount */}
                  <div className="mb-8 border-b border-border/40 pb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl sm:text-5xl font-display font-black tracking-tight">{price}</span>
                      {tier.period && <span className="text-muted-foreground font-semibold text-sm">{tier.period}</span>}
                    </div>
                    <div className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                      {billingCycle === "annual" ? tier.annualBilled : "billed monthly"}
                    </div>
                  </div>

                  {/* Features Checklist */}
                  <div className="space-y-4 mb-8">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3 text-sm text-left">
                        <div className={`mt-0.5 size-5 rounded-full flex items-center justify-center shrink-0 ${isPro ? "bg-accent/20" : "bg-primary-soft"}`}>
                          <Check className={`size-3.5 ${isPro ? "text-accent" : "text-primary"}`} />
                        </div>
                        <span className="text-muted-foreground font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call To Action Button */}
                <button
                  onClick={() => handleSelectPlan(tier.name)}
                  disabled={isActive || updatingTier !== null}
                  className={`w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 ${
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800/40 text-muted-foreground border border-border/60 cursor-not-allowed"
                      : isPro
                      ? "bg-accent hover:bg-emerald-600 text-white shadow-cta hover:shadow-emerald-500/30 cursor-pointer"
                      : isElite
                      ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg hover:shadow-amber-500/20 cursor-pointer"
                      : "bg-secondary text-foreground hover:bg-secondary/80 border border-border/50 cursor-pointer"
                  }`}
                >
                  {isUpdating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    buttonText
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Accordion */}
        <div className="mb-28 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">Detailed Feature Comparison</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Compare features side-by-side to understand which plan suits your travel methodology best.
            </p>
          </div>
          
          <div className="overflow-x-auto rounded-3xl border border-border/80 bg-card shadow-soft">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="p-6 text-sm font-bold tracking-wider text-muted-foreground uppercase">Core Offerings</th>
                  <th className="p-6 text-sm font-bold tracking-wider text-muted-foreground uppercase text-center w-40">Free Explorer</th>
                  <th className="p-6 text-sm font-bold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase text-center w-40">Pro Adventurer</th>
                  <th className="p-6 text-sm font-bold tracking-wider text-amber-500 uppercase text-center w-40">Elite Nomad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm font-medium">
                {/* Section Header */}
                <tr className="bg-muted/10">
                  <td colSpan={4} className="p-4 px-6 text-xs font-black uppercase text-accent tracking-widest">
                    Planning & AI Engine
                  </td>
                </tr>
                <tr>
                  <td className="p-6 text-muted-foreground">Monthly AI Plan Generations</td>
                  <td className="p-6 text-center">3 Generations</td>
                  <td className="p-6 text-center text-emerald-600 dark:text-emerald-400 font-bold">Unlimited</td>
                  <td className="p-6 text-center text-amber-500 font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-6 text-muted-foreground">Single-Destination Planner</td>
                  <td className="p-6 text-center"><Check className="size-4 text-emerald-500 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="size-4 text-emerald-500 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="size-4 text-emerald-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-6 text-muted-foreground">Multi-Destination Planners</td>
                  <td className="p-6 text-center">—</td>
                  <td className="p-6 text-center"><Check className="size-4 text-emerald-500 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="size-4 text-emerald-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-6 text-muted-foreground">AI Travel Copilot & Portal</td>
                  <td className="p-6 text-center">Standard Support</td>
                  <td className="p-6 text-center">High-Speed Priority</td>
                  <td className="p-6 text-center text-amber-500 font-bold">VIP Custom Models</td>
                </tr>
                
                {/* Section Header */}
                <tr className="bg-muted/10">
                  <td colSpan={4} className="p-4 px-6 text-xs font-black uppercase text-accent tracking-widest">
                    Collaboration & Sharing
                  </td>
                </tr>
                <tr>
                  <td className="p-6 text-muted-foreground">Collab Room Members</td>
                  <td className="p-6 text-center">View Only</td>
                  <td className="p-6 text-center">Up to 5 Planners</td>
                  <td className="p-6 text-center text-emerald-600 dark:text-emerald-400 font-bold">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-6 text-muted-foreground">Shared Travel Expense Splitter</td>
                  <td className="p-6 text-center">—</td>
                  <td className="p-6 text-center"><Check className="size-4 text-emerald-500 mx-auto" /></td>
                  <td className="p-6 text-center"><Check className="size-4 text-emerald-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-6 text-muted-foreground">Offline Maps & PDF Layouts</td>
                  <td className="p-6 text-center">Standard Layout</td>
                  <td className="p-6 text-center">Interactive Checklist</td>
                  <td className="p-6 text-center text-amber-500 font-bold">Custom Brandable</td>
                </tr>

                {/* Section Header */}
                <tr className="bg-muted/10">
                  <td colSpan={4} className="p-4 px-6 text-xs font-black uppercase text-accent tracking-widest">
                    Passport & Stamps
                  </td>
                </tr>
                <tr>
                  <td className="p-6 text-muted-foreground">Digital Passport Visas/Badges</td>
                  <td className="p-6 text-center">Up to 3 Badges</td>
                  <td className="p-6 text-center font-bold">Unlimited</td>
                  <td className="p-6 text-center text-amber-500 font-bold">Premium Gold Elite</td>
                </tr>
                <tr>
                  <td className="p-6 text-muted-foreground">Yatra Store flat discount</td>
                  <td className="p-6 text-center">—</td>
                  <td className="p-6 text-center">—</td>
                  <td className="p-6 text-center text-emerald-600 dark:text-emerald-400 font-bold">15% Discount</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials Block */}
        <div className="mb-28 max-w-4xl mx-auto bg-slate-50 dark:bg-slate-900/40 rounded-3xl p-8 md:p-12 border border-border/60 flex flex-col md:flex-row items-center gap-8 shadow-soft">
          <div className="size-20 rounded-full overflow-hidden shrink-0 bg-slate-200 border border-border">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" alt="Sarah J." className="w-full h-full object-cover" />
          </div>
          <div className="text-left space-y-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="italic text-base md:text-lg text-muted-foreground leading-relaxed">
              "GoTripo changed how my group plans trips. The Pro Adventurer plan allowed 4 of us to collaborate simultaneously in a Collab Room, optimize our route across Kerala, and split expenses seamlessly. It saved us hours of back-and-forth messaging!"
            </p>
            <div>
              <div className="font-bold text-sm text-foreground">Sarah Jenkins</div>
              <div className="text-xs text-muted-foreground">Digital Nomad & Lifestyle Vlogger</div>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-muted-foreground text-xs font-bold uppercase tracking-wider mb-4">
              <HelpCircle className="size-3.5 text-accent" />
              <span>Common Inquiries</span>
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-sm">
              Everything you need to know about GoTripo billing, capabilities, and accounts.
            </p>
          </div>

          <div className="space-y-4 text-left">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="bg-card border border-border/80 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full p-6 flex items-center justify-between text-left font-bold text-sm sm:text-base outline-none cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="size-4 shrink-0 text-accent transition-transform duration-300" />
                    ) : (
                      <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-300" />
                    )}
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isOpen ? "max-h-[200px] border-t border-border/40" : "max-h-0"
                    }`}
                  >
                    <p className="p-6 text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );

  if (user) {
    return <AppShell>{content}</AppShell>;
  }

  return (
    <>
      <MarketingNav />
      {content}
    </>
  );
}

