import { AppShell } from "@/components/AppShell";
import { MarketingNav } from "@/components/MarketingNav";
import { useAuth } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Globe } from "@/components/Globe";
import { Compass, Users, Heart, Sparkles, Globe as GlobeIcon, MapPin, Star, Check, Zap, Mountain, Rocket } from "lucide-react";

export default function About() {
  const { user } = useAuth();

  const milestones = [
    {
      year: "2024",
      title: "The Himalayan Spark",
      desc: "It began as a simple Python script to optimize a multi-city trek through the Himalayas. No spreadsheets, just logic.",
      icon: Mountain,
      color: "bg-orange-500"
    },
    {
      year: "Late 2024",
      title: "The Viral Beta",
      desc: "Word spread. 5,000+ early adopters joined our private beta, planning trips from Tokyo to Goa.",
      icon: Zap,
      color: "bg-blue-500"
    },
    {
      year: "2025",
      title: "AI Core Deployment",
      desc: "We deployed our surgical AI engine, processing 1.2M+ data points to craft near-perfect itineraries in seconds.",
      icon: Sparkles,
      color: "bg-purple-500"
    },
    {
      year: "Today",
      title: "13,000+ Journeys",
      desc: "Now a global platform powering thousands of unique explorations every day. The journey has just begun.",
      icon: Rocket,
      color: "bg-emerald-500"
    }
  ];

  const content = (
    <div className="min-h-screen bg-background pt-20">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
        >
          <Compass className="size-4" />
          <span>Our Story</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight"
        >
          We're on a mission to make <br />
          <span className="bg-warm-gradient bg-clip-text text-transparent">travel effortless</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed"
        >
          GoTripo was born out of a simple frustration: planning a trip should be as exciting as the trip itself, not a chore of spreadsheets and endless tabs.
        </motion.p>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem icon={<GlobeIcon />} value="13,000+" label="Journeys Crafted" color="text-orange-500" bgColor="bg-orange-500/10" />
            <StatItem icon={<Users />} value="70+" label="Active Explorers" color="text-blue-500" bgColor="bg-blue-500/10" />
            <StatItem icon={<MapPin />} value="100+" label="Destinations" color="text-emerald-500" bgColor="bg-emerald-500/10" />
            <StatItem icon={<Star />} value="4.9/5" label="User Rating" color="text-yellow-500" bgColor="bg-yellow-500/10" />
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="bg-secondary py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            <PhilosophyCard 
              icon={<Heart />} 
              title="Traveller First" 
              desc="Everything we build starts with the traveller's experience. If it doesn't make your trip better, we don't build it." 
            />
            <PhilosophyCard 
              icon={<Sparkles />} 
              title="AI for Good" 
              desc="We use artificial intelligence to handle the heavy lifting of logistics, so you can focus on the magic of exploration." 
            />
            <PhilosophyCard 
              icon={<Users />} 
              title="Collaborative by Design" 
              desc="Travel is better together. Our platform is built from the ground up to make group planning seamless and fun." 
            />
          </div>
        </div>
      </section>

      {/* Global Mission - NEW */}
      <section className="py-32 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-mesh opacity-20" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-bold uppercase tracking-widest mb-6">
                <GlobeIcon className="size-4" /> Global Presence
              </div>
              <h2 className="text-4xl md:text-6xl font-display font-bold mb-8 leading-tight">
                Bridging horizons, <br />
                <span className="text-accent">one prompt at a time.</span>
              </h2>
              <p className="text-slate-400 text-xl leading-relaxed mb-10">
                GoTripo isn't just an app; it's a global network of explorers. 
                We're mapping every corner of the world to bring you closer to 
                the experiences that matter, with zero friction and total transparency.
              </p>
              <div className="grid grid-cols-2 gap-8">
                 <div>
                    <div className="text-3xl font-bold text-white mb-2">12+</div>
                    <div className="text-sm text-slate-500 uppercase tracking-widest font-bold">Countries Supported</div>
                 </div>
                 <div>
                    <div className="text-3xl font-bold text-white mb-2">24/7</div>
                    <div className="text-sm text-slate-500 uppercase tracking-widest font-bold">AI Support</div>
                 </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex justify-center"
            >
              <Globe />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Journey - REDESIGNED */}
      <section className="max-w-7xl mx-auto px-6 py-32 overflow-hidden">
        <div className="flex flex-col md:flex-row gap-16 items-start">
          <div className="md:w-1/3 md:sticky md:top-32">
            <h2 className="text-4xl font-display font-bold mb-6 tracking-tight">The Chronicle</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              From a single weekend hack in Patna to a global planning engine, 
              here's how we evolved to solve the world's messiest problem.
            </p>
            <div className="mt-10 p-6 rounded-3xl bg-primary/5 border border-primary/10">
              <div className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Our Reach</div>
              <div className="text-2xl font-bold font-display">12 Countries & Counting</div>
              <div className="mt-4 flex -space-x-2">
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className="size-8 rounded-full border-2 border-background bg-secondary overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="" />
                   </div>
                 ))}
                 <div className="size-8 rounded-full border-2 border-background bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">+70</div>
              </div>
            </div>
          </div>
          
          <div className="md:w-2/3 relative pl-8 border-l border-border/50">
            {milestones.map((m, i) => (
              <motion.div 
                key={m.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1 }}
                className="mb-20 relative last:mb-0"
              >
                {/* Timeline Dot */}
                <div className={`absolute -left-[45px] top-0 size-8 rounded-full ${m.color} border-4 border-background flex items-center justify-center text-white shadow-lg`}>
                   <m.icon className="size-3.5" />
                </div>
                
                <div className="bg-card border border-border rounded-[32px] p-8 shadow-soft hover:shadow-pop transition-all group">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">{m.year}</div>
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">{m.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Section */}
      <section className="bg-foreground text-background py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h2 className="text-3xl md:text-5xl font-display font-bold mb-12">Built with surgical precision.</h2>
           <div className="grid md:grid-cols-4 gap-8">
              <TechBadge label="1.2M Data Points" />
              <TechBadge label="Real-time Weather" />
              <TechBadge label="Smart Routing" />
              <TechBadge label="Group Consensus" />
           </div>
        </div>
      </section>
      
      {!user && <Footer />}
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

function StatItem({ icon, value, label, color, bgColor }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="text-center"
    >
      <div className="flex justify-center mb-3">
        <div className={`size-10 rounded-xl ${bgColor} ${color} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-display font-bold">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
}

function PhilosophyCard({ icon, title, desc }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-4 p-8 rounded-3xl bg-background border border-border hover:border-primary/50 transition-all shadow-sm"
    >
      <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-muted-foreground">{desc}</p>
    </motion.div>
  );
}

function TechBadge({ label }: { label: string }) {
  return (
    <div className="px-6 py-4 rounded-2xl border border-white/20 flex items-center justify-center gap-2 hover:bg-white hover:text-foreground transition-all">
       <Check className="size-4" />
       <span className="font-bold text-sm uppercase tracking-widest">{label}</span>
    </div>
  );
}
