import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Sparkles, MonitorPlay, ChevronRight } from "lucide-react";
import { FadeUp } from "./motion/primitives";

export function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log("Autoplay was prevented, waiting for user interaction", err);
      });
    }
  }, []);

  return (
    <section id="workflow-video" className="relative w-full py-24 bg-slate-950 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] bg-accent/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <FadeUp>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-accent text-xs font-bold uppercase tracking-widest mb-6">
              <MonitorPlay className="size-4" /> Platform Walkthrough
            </div>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="font-display font-bold text-4xl md:text-6xl text-white tracking-tight mb-6">
              See the <span className="text-accent">GoTripo Workflow</span> in Action
            </h2>
          </FadeUp>
          <FadeUp delay={0.2}>
            <p className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl">
              Watch how we transform a single idea into a complete, bookable adventure 
              using our surgical AI planning engine.
            </p>
          </FadeUp>
        </div>

        {/* Video Player Container */}
        <FadeUp delay={0.3} className="relative max-w-5xl mx-auto">
          <div className="relative aspect-video rounded-[32px] md:rounded-[48px] overflow-hidden border border-white/10 shadow-2xl bg-black group">
            {/* The Video */}
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            >
              <source 
                src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27df348cf0f048d087799ef08c2a8685e130a0d&profile_id=139&oauth2_token_id=57447761" 
                type="video/mp4" 
              />
              Your browser does not support the video tag.
            </video>

            {/* Cinematic Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            
            {/* Play Button Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                className="size-20 md:size-28 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center shadow-2xl cursor-pointer group-hover:bg-accent transition-colors"
              >
                <Play className="size-8 md:size-12 text-white fill-current ml-1" />
              </motion.div>
            </div>

            {/* Bottom Bar Info */}
            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between text-white hidden md:flex">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                   <Sparkles className="size-6 text-accent" />
                </div>
                <div>
                   <div className="text-sm font-bold uppercase tracking-widest text-accent">Feature Spotlight</div>
                   <div className="text-lg font-display font-bold">AI Itinerary Generation</div>
                </div>
              </div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10">
                0:45 / 2:30
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-6 -right-6 size-24 bg-accent/20 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-6 -left-6 size-24 bg-primary/20 rounded-full blur-2xl animate-pulse delay-700" />
        </FadeUp>

        <FadeUp delay={0.4} className="mt-16 flex flex-col items-center">
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-3 text-slate-400">
               <div className="size-2 bg-accent rounded-full animate-ping" />
               <span className="text-sm font-medium">Auto-planning demonstration</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
               <div className="size-2 bg-blue-500 rounded-full animate-ping delay-300" />
               <span className="text-sm font-medium">Real-time collaboration preview</span>
            </div>
          </div>
          
          <button className="mt-10 group flex items-center gap-3 text-white font-bold hover:text-accent transition-colors">
            Learn more about our technology <ChevronRight className="size-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </FadeUp>
      </div>
    </section>
  );
}
