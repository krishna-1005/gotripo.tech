import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useInView, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Headset, 
  Zap, 
  Heart, 
  Star, 
  CheckCircle2, 
  Award, 
  Users, 
  Globe, 
  Activity,
  ChevronRight,
  X,
  Lock,
  Eye,
  Server,
  Fingerprint
} from "lucide-react";
import { FadeUp, StaggerGroup, StaggerItem, dur, ease } from "./motion/primitives";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Verified Itineraries",
    desc: "Every AI-generated plan is cross-referenced with real traveler data and local insights to ensure accuracy.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    detail: "99.9% Accuracy Rate"
  },
  {
    icon: Headset,
    title: "24/7 Human Backup",
    desc: "AI plans the trip, humans handle the hiccups. Our support team is always a tap away for any assistance.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    detail: "Average response < 2m"
  },
  {
    icon: Zap,
    title: "Real-Time Optimization",
    desc: "Weather changed? A place closed? Your itinerary adapts in real-time, just like a local guide.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    detail: "Live traffic integration"
  },
  {
    icon: Heart,
    title: "Community Driven",
    desc: "Join 50,000+ explorers sharing real-time tips and hidden gems from across the Indian subcontinent.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    detail: "500k+ trip logs"
  }
];

const stats = [
  { label: "Happy Travelers", value: 80, suffix: "+", icon: Users },
  { label: "Cities Covered", value: 100, suffix: "+", icon: CheckCircle2 },
  { label: "Average Rating", value: 4.9, suffix: "/5", icon: Star, decimals: 1 },
  { label: "Plans Generated", value: 13000, suffix: "+", icon: Zap }
];

const hardTruths = [
  {
    icon: Lock,
    title: "AES-256 Encryption",
    desc: "Every byte of your travel data is encrypted at rest and in transit using military-grade standards."
  },
  {
    icon: Eye,
    title: "Zero Data Selling",
    desc: "We never have and never will sell your personal data. Your travel habits stay between you and our AI."
  },
  {
    icon: Server,
    title: "Localized Servers",
    desc: "Data is stored in high-security regional clusters to ensure low latency and strict local compliance."
  },
  {
    icon: Fingerprint,
    title: "Anonymous Processing",
    desc: "AI training uses strictly anonymized logs. Your identity is never linked to the global learning model."
  }
];

function AnimatedNumber({ value, suffix, decimals = 0 }: { value: number; suffix: string; decimals?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  
  const displayValue = useTransform(springValue, (latest) => 
    latest.toLocaleString(undefined, { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    })
  );

  const [current, setCurrent] = useState("0");

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    return displayValue.on("change", (v) => setCurrent(v));
  }, [displayValue]);

  return (
    <span ref={ref} className="tabular-nums">
      {current}{suffix}
    </span>
  );
}

function SpotlightCard({ point }: { point: typeof trustPoints[0] }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="group relative h-full p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-accent/30 transition-colors duration-500 overflow-hidden"
    >
      {/* Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(16, 185, 129, 0.06), transparent 40%)`
          ),
        }}
      />

      <div className={`relative z-10 size-14 rounded-2xl ${point.bg} ${point.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
        <point.icon className="size-7" />
      </div>
      
      <div className="relative z-10">
        <h3 className="font-display font-bold text-xl text-white mb-3">{point.title}</h3>
        <p className="text-slate-400 leading-relaxed text-sm md:text-base mb-6">
          {point.desc}
        </p>
        
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-accent opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500">
          <Activity className="size-3" /> {point.detail}
        </div>
      </div>
    </div>
  );
}

export function TrustSection() {
  const [trustScore, setTrustScore] = useState(99.8);
  const [showTruths, setShowTruths] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTrustScore(prev => {
        const delta = (Math.random() - 0.5) * 0.02;
        return parseFloat(Math.max(99.7, Math.min(99.9, prev + delta)).toFixed(2));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="trust-section" className="relative w-full py-32 bg-slate-950 overflow-hidden">
      {/* Truths Modal */}
      <AnimatePresence>
        {showTruths && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTruths(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] p-8 md:p-12 overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-6">
                <button 
                  onClick={() => setShowTruths(false)}
                  className="size-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="size-5 text-white" />
                </button>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest mb-6">
                <ShieldCheck className="size-3" /> The Hard Truths
              </div>
              
              <h3 className="font-display font-bold text-3xl md:text-4xl text-white mb-8">
                How we protect <span className="text-accent">your journey</span>
              </h3>

              <div className="grid sm:grid-cols-2 gap-8">
                {hardTruths.map((truth, i) => (
                  <div key={i} className="space-y-3">
                    <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-accent">
                      <truth.icon className="size-5" />
                    </div>
                    <div className="font-bold text-white">{truth.title}</div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {truth.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-xs text-slate-500 max-w-[280px]">
                  All security measures are independently audited quarterly. Last audit: April 2026.
                </div>
                <button 
                  onClick={() => setShowTruths(false)}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white text-slate-950 font-bold text-sm"
                >
                  I Trust GoTripo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Trust Meter Floating Widget */}
      <div className="absolute top-10 right-10 z-50 hidden xl:block">
        <FadeUp delay={1}>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-4 group hover:border-accent/50 transition-colors">
            <div className="relative size-10 flex items-center justify-center">
              <svg className="size-full -rotate-90">
                <circle 
                  cx="20" cy="20" r="18" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  className="text-white/5" 
                />
                <motion.circle 
                  cx="20" cy="20" r="18" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3" 
                  strokeDasharray={100}
                  animate={{ strokeDashoffset: 100 - trustScore }}
                  className="text-accent" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="size-4 text-accent" />
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Trust Index</div>
              <div className="text-sm font-display font-bold text-white tabular-nums">{trustScore}%</div>
            </div>
          </div>
        </FadeUp>
      </div>

      {/* Animated Background Elements */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/20 blur-[120px] -z-10 rounded-full translate-x-1/3 -translate-y-1/3" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/20 blur-[120px] -z-10 rounded-full -translate-x-1/3 translate-y-1/3" 
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%" }}
            animate={{ 
              y: ["-20px", "20px", "-20px"],
              x: ["-10px", "10px", "-10px"]
            }}
            transition={{ 
              duration: 5 + Math.random() * 5, 
              repeat: Infinity, 
              delay: Math.random() * 5 
            }}
            className="absolute"
          >
            {i % 2 === 0 ? <ShieldCheck className="text-accent size-4" /> : <Star className="text-white size-3" />}
          </motion.div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-20 relative">
          <FadeUp>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-accent text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Reliability & Trust Protocol v2.4
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="font-display font-bold text-4xl md:text-7xl text-white tracking-tight mb-6">
              Travel with <span className="text-accent relative inline-block">
                Absolute Confidence
                <motion.span 
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 0.5, ease }}
                  className="absolute bottom-1 left-0 h-1 bg-accent/30 rounded-full -z-10"
                />
              </span>
            </h2>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl leading-relaxed">
              We combine <span className="text-white font-medium">advanced AI</span> with <span className="text-white font-medium">deep local expertise</span> to ensure your Indian adventure is 
              seamless, safe, and unforgettable.
            </p>
          </FadeUp>
        </div>

        <StaggerGroup className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {trustPoints.map((point, i) => (
            <StaggerItem key={i}>
              <SpotlightCard point={point} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        <FadeUp delay={0.5}>
          <div className="relative rounded-[40px] bg-white/5 border border-white/10 p-10 md:p-16 overflow-hidden">
            {/* Dark Section Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-accent/5 blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 text-center">
              {stats.map((stat, i) => (
                <div key={i} className="group space-y-3">
                  <div className="flex justify-center">
                    <stat.icon className="size-6 text-accent/80 group-hover:scale-125 group-hover:text-accent transition-all duration-300" />
                  </div>
                  <div className="text-3xl md:text-5xl font-display font-bold text-white tracking-tighter">
                    <AnimatedNumber value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                  </div>
                  <div className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400 transition-colors">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.6} className="mt-20">
          <div className="flex flex-col items-center">
            <motion.button 
              onClick={() => setShowTruths(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-16 flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-slate-950 font-bold text-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
            >
              Learn About Our Security <ChevronRight className="size-4" />
            </motion.button>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
