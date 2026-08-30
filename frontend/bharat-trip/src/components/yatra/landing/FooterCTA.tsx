import { motion } from "framer-motion";
import { ArrowRight, Stars } from "lucide-react";

export function FooterCTA() {
  return (
    <section className="py-32 bg-slate-100 dark:bg-[#0F0F0F] border-t border-slate-200 dark:border-white/5 relative overflow-hidden transition-colors duration-500">
      {/* Editorial Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-[#FF6B00]/5 via-transparent to-[#F5A623]/5 blur-[150px] rounded-full" />
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-full text-[#F5A623] text-xs font-black uppercase tracking-[0.4em] mb-12">
            <Stars className="size-4" /> Final Step
          </div>
          <h2 className="text-6xl md:text-8xl font-extrabold text-slate-850 dark:text-white mb-10 tracking-tighter leading-[0.9]">
            Start Your <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#F5A623]">Sacred Journey</span> <br /> Today
          </h2>
          <p className="text-2xl text-slate-600 dark:text-gray-400 mb-16 max-w-2xl mx-auto font-medium leading-relaxed">
            Join thousands of pilgrims who have found peace, growth, and divine connection through our AI-powered yatras.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <button 
              onClick={() => document.getElementById('ai-planner')?.scrollIntoView({ behavior: 'smooth' })}
              className="group px-12 py-6 bg-[#FF6B00] hover:bg-[#E66000] text-white rounded-[2rem] font-black text-xl transition-all shadow-[0_20px_40px_rgba(255,107,0,0.3)] flex items-center justify-center gap-4 active:scale-95 cursor-pointer"
            >
              Plan My Yatra Now <ArrowRight className="size-7 group-hover:translate-x-2 transition-transform" />
            </button>
            <button className="px-12 py-6 border-2 border-slate-300 dark:border-white/20 hover:border-slate-800 dark:hover:border-white text-slate-800 dark:text-white rounded-[2rem] font-black text-xl transition-all flex items-center justify-center gap-4 hover:bg-slate-200/50 dark:hover:bg-white/5 active:scale-95 cursor-pointer">
              Speak with a Guide
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
