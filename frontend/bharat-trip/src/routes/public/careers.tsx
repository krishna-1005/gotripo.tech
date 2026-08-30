import { AppShell } from "@/components/AppShell";
import { MarketingNav } from "@/components/MarketingNav";
import { useAuth } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Briefcase, MapPin, Clock, ArrowRight, ChevronDown, CheckCircle2, Send, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import api from "@/lib/api";

const jobs = [
  {
    id: "fs-eng",
    title: "Senior Full Stack Engineer",
    dept: "Engineering",
    location: "Remote / Bengaluru",
    time: "Full-time",
    description: "We're looking for a Senior Full Stack Engineer to lead the development of our core travel planning engine and collaborative features.",
    requirements: [
      "5+ years of experience with React, Node.js, and TypeScript.",
      "Experience building complex, real-time collaborative applications.",
      "Strong understanding of PostgreSQL and database optimization.",
      "Previous experience with AI/LLM integration is a major plus.",
      "Passion for building clean, maintainable, and well-tested code."
    ],
    responsibilities: [
      "Lead architectural decisions for the GoTripo web platform.",
      "Mentor junior engineers and conduct thorough code reviews.",
      "Optimize our AI planning engine for speed and accuracy.",
      "Collaborate with the design team to implement pixel-perfect interfaces."
    ]
  },
  {
    id: "ai-des",
    title: "AI Product Designer",
    dept: "Design",
    location: "Remote",
    time: "Full-time",
    description: "Join us as an AI Product Designer to define how humans interact with intelligent travel planning agents.",
    requirements: [
      "4+ years of UX/UI design experience in product-led companies.",
      "Portfolio demonstrating experience with complex data-driven interfaces.",
      "Proficiency in Figma and prototyping tools.",
      "Understanding of AI/ML concepts and how they impact user experience.",
      "Strong visual design skills and attention to detail."
    ],
    responsibilities: [
      "Design intuitive interfaces for our AI-powered travel planner.",
      "Create high-fidelity prototypes to test new interaction patterns.",
      "Conduct user research and iterate based on feedback.",
      "Maintain and evolve our design system."
    ]
  },
  {
    id: "cont-strat",
    title: "Travel Content Strategist",
    dept: "Marketing",
    location: "Remote / Mumbai",
    time: "Contract",
    description: "Help us tell the story of GoTripo and create engaging content that inspires explorers around the world.",
    requirements: [
      "3+ years of experience in content marketing or travel journalism.",
      "Exceptional storytelling and copywriting skills.",
      "Experience managing social media communities and campaigns.",
      "Strong understanding of SEO and content distribution strategies.",
      "A deep passion for travel and discovery."
    ],
    responsibilities: [
      "Develop and execute our multi-channel content strategy.",
      "Write engaging blog posts, newsletters, and social media content.",
      "Collaborate with influencers and travel partners.",
      "Analyze content performance and optimize for growth."
    ]
  },
  {
    id: "cust-success",
    title: "Customer Success Lead",
    dept: "Support",
    location: "Bengaluru",
    time: "Full-time",
    description: "As our first Customer Success Lead, you'll be the voice of our users and help us build a world-class support experience.",
    requirements: [
      "4+ years of experience in customer success or support leadership.",
      "Excellent communication and problem-solving skills.",
      "Experience with support tools like Zendesk or Intercom.",
      "Ability to thrive in a fast-paced startup environment.",
      "Strong empathy for users and a proactive attitude."
    ],
    responsibilities: [
      "Build and manage our customer support operations.",
      "Analyze user feedback to drive product improvements.",
      "Develop help documentation and self-service resources.",
      "Ensure every GoTripo user has a delightful experience."
    ]
  },
];

function JobCard({ job }: { job: typeof jobs[0] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", resume: "", note: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/public/careers/apply", {
        ...formData,
        jobId: job.id,
        jobTitle: job.title
      });
      toast.success("Application submitted successfully! Our team will get back to you soon.");
      setIsApplying(false);
      setFormData({ name: "", email: "", resume: "", note: "" });
    } catch (err) {
      toast.error("Failed to submit application. Please try again.");
    }
  };

  return (
    <div 
      className={`group rounded-[32px] border transition-all duration-300 overflow-hidden ${
        isOpen ? "bg-card border-primary/30 shadow-xl" : "bg-card/50 border-border hover:border-primary/50"
      }`}
    >
      <div 
        className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1">
          <div className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">{job.dept}</div>
          <h3 className="text-xl md:text-2xl font-display font-bold group-hover:text-primary transition-colors">{job.title}</h3>
          <div className="flex flex-wrap gap-5 mt-4 text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary/60" /> {job.location}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-primary/60" /> {job.time}
            </div>
          </div>
        </div>
        <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${
          isOpen ? "bg-primary text-primary-foreground rotate-180" : "bg-secondary text-foreground group-hover:bg-primary/10 group-hover:text-primary"
        }`}>
          <ChevronDown className="size-6" />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 md:px-8 pb-8 pt-2 border-t border-border/50">
              <div className="grid lg:grid-cols-2 gap-12 mt-8">
                <div className="space-y-8">
                  <section>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">About the Role</h4>
                    <p className="text-muted-foreground leading-relaxed">{job.description}</p>
                  </section>
                  
                  <section>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">Requirements</h4>
                    <ul className="space-y-3">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">Responsibilities</h4>
                    <ul className="space-y-3">
                      {job.responsibilities.map((res, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <div className="size-1.5 rounded-full bg-primary shrink-0 mt-2" />
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>

                <div className="bg-secondary/30 rounded-[32px] p-8 border border-border">
                  {!isApplying ? (
                    <div className="h-full flex flex-col justify-center items-center text-center">
                      <div className="size-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                        <Briefcase className="size-8" />
                      </div>
                      <h4 className="text-2xl font-display font-bold mb-4">Ready to apply?</h4>
                      <p className="text-muted-foreground mb-8">
                        Join our mission to redefine travel. We'd love to hear from you.
                      </p>
                      <button 
                        onClick={() => setIsApplying(true)}
                        className="w-full h-14 rounded-2xl bg-warm-gradient text-white font-bold shadow-cta hover:opacity-95 transition"
                      >
                        Apply for this position
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xl font-bold">Application Form</h4>
                        <button 
                          type="button" 
                          onClick={() => setIsApplying(false)}
                          className="text-xs font-bold text-muted-foreground hover:text-foreground underline"
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                        <input 
                          required
                          type="text" 
                          placeholder="Enter your name"
                          className="w-full h-12 rounded-xl bg-background border border-border px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                        <input 
                          required
                          type="email" 
                          placeholder="your@email.com"
                          className="w-full h-12 rounded-xl bg-background border border-border px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Portfolio / Resume Link</label>
                        <input 
                          required
                          type="url" 
                          placeholder="https://linkedin.com/in/..."
                          className="w-full h-12 rounded-xl bg-background border border-border px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                          value={formData.resume}
                          onChange={e => setFormData({...formData, resume: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Why GoTripo? (Optional)</label>
                        <textarea 
                          placeholder="Tell us why you're excited about this role..."
                          className="w-full h-32 rounded-xl bg-background border border-border p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition resize-none"
                          value={formData.note}
                          onChange={e => setFormData({...formData, note: e.target.value})}
                        />
                      </div>
                      <button 
                        type="submit"
                        className="w-full h-14 mt-4 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:opacity-90 transition"
                      >
                        <Send className="size-4" /> Submit Application
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Careers() {
  const { user } = useAuth();
  const [showOpenApp, setShowOpenApp] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", resume: "", note: "" });

  const handleOpenAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/public/careers/apply", {
        ...formData,
        jobId: "open",
        jobTitle: "Open Application"
      });
      toast.success("Open application submitted! We'll keep you in mind for future roles.");
      setShowOpenApp(false);
      setFormData({ name: "", email: "", resume: "", note: "" });
    } catch (err) {
      toast.error("Failed to submit application. Please try again.");
    }
  };

  const content = (
    <div className="min-h-screen bg-background pt-20">
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-3xl mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Briefcase className="size-4" />
            <span>Careers</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 tracking-tight">
            Build the future of <span className="bg-warm-gradient bg-clip-text text-transparent">exploration</span>
          </h1>
          <p className="text-muted-foreground text-xl leading-relaxed">
            We're a remote-first team of travellers, builders, and dreamers. Join us in our quest to make the world more accessible through intelligent design and AI.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-bold">Open Positions</h2>
            <div className="text-sm font-medium text-muted-foreground">{jobs.length} total roles</div>
          </div>
          <div className="grid gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>

        <div className="mt-32 rounded-[48px] bg-surface border border-border p-8 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-warm-gradient" />
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {!showOpenApp ? (
                <motion.div
                  key="cta"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h2 className="text-4xl font-display font-bold mb-6">Don't see a fit?</h2>
                  <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                    We're always looking for talented people who are passionate about travel and technology. If you think you'd be a great addition to GoTripo, send us an open application.
                  </p>
                  <button 
                    onClick={() => setShowOpenApp(true)}
                    className="inline-flex h-16 items-center px-10 rounded-2xl bg-warm-gradient text-white font-bold shadow-cta hover:scale-105 active:scale-95 transition-all"
                  >
                    Send Open Application
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="max-w-xl mx-auto text-left bg-card p-8 md:p-10 rounded-[32px] border border-border shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-display font-bold">Open Application</h3>
                    <button 
                      onClick={() => setShowOpenApp(false)}
                      className="size-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition"
                    >
                      <X className="size-5" />
                    </button>
                  </div>
                  <form onSubmit={handleOpenAppSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Enter your name"
                        className="w-full h-12 rounded-xl bg-background border border-border px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                      <input 
                        required
                        type="email" 
                        placeholder="your@email.com"
                        className="w-full h-12 rounded-xl bg-background border border-border px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Portfolio / Resume Link</label>
                      <input 
                        required
                        type="url" 
                        placeholder="https://..."
                        className="w-full h-12 rounded-xl bg-background border border-border px-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
                        value={formData.resume}
                        onChange={e => setFormData({...formData, resume: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">What would you like to build at GoTripo?</label>
                      <textarea 
                        required
                        placeholder="Tell us about your skills and interests..."
                        className="w-full h-32 rounded-xl bg-background border border-border p-4 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition resize-none"
                        value={formData.note}
                        onChange={e => setFormData({...formData, note: e.target.value})}
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full h-14 mt-4 rounded-2xl bg-warm-gradient text-white font-bold flex items-center justify-center gap-2 hover:opacity-95 shadow-cta transition"
                    >
                      <Send className="size-4" /> Submit Open Application
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
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
