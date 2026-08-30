import React from "react";
import { motion } from "framer-motion";

export function Globe() {
  return (
    <div className="relative size-[300px] md:size-[500px] mx-auto group">
      {/* Outer Glow */}
      <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-[80px]" />
      
      {/* The Globe Sphere Container */}
      <div className="absolute inset-0 rounded-full border border-white/20 shadow-2xl bg-slate-950 overflow-hidden">
        
        {/* Rotating High-Contrast Map Layer */}
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-[200%] flex opacity-60 z-10"
        >
          <HighFidelityWorldMap color="#4ade80" />
          <HighFidelityWorldMap color="#4ade80" />
        </motion.div>

        {/* Secondary Layer for Depth (Clouds/Atmosphere) */}
        <motion.div 
          animate={{ x: ["-10%", "-60%"] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-[200%] flex opacity-20 z-20 mix-blend-overlay"
        >
          <HighFidelityWorldMap color="#ffffff" />
          <HighFidelityWorldMap color="#ffffff" />
        </motion.div>

        {/* Spherical Depth Gradients */}
        {/* 1. Sunlight Highlight */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4)_0%,transparent_50%)] z-30 pointer-events-none" />
        
        {/* 2. Edge Shadowing (Creates the sphere look) */}
        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_100px_rgba(0,0,0,0.9),inset_0_0_40px_rgba(0,0,0,0.7)] z-40 pointer-events-none" />
        
        {/* 3. Blue Rim Light */}
        <div className="absolute inset-0 rounded-full border-[8px] border-blue-500/10 blur-[2px] z-50 pointer-events-none" />

        {/* Geographic Activity Hubs */}
        <div className="absolute inset-0 z-50 pointer-events-none">
           <ActivityPoint x="58%" y="42%" label="India" />
           <ActivityPoint x="48%" y="32%" label="Europe" />
           <ActivityPoint x="25%" y="40%" label="Americas" />
           <ActivityPoint x="82%" y="65%" label="Australia" />
        </div>
      </div>

      {/* Center Mission Badge */}
      <div className="absolute inset-0 flex items-center justify-center z-50">
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="px-6 py-3 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col items-center"
         >
            <div className="font-display font-black text-2xl italic bg-gradient-to-r from-orange-400 to-rose-500 bg-clip-text text-transparent">GOTRIPO</div>
            <div className="text-[8px] font-bold uppercase tracking-[0.3em] text-accent mt-1">Global Planning Engine</div>
         </motion.div>
      </div>

      {/* Orbiting Satellite */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-[-50px] z-50 pointer-events-none"
      >
        <div className="absolute top-1/2 left-0 size-3 rounded-full bg-accent shadow-[0_0_20px_#4ade80]">
           <div className="absolute inset-0 rounded-full bg-accent/40 animate-ping" />
        </div>
      </motion.div>
    </div>
  );
}

function ActivityPoint({ x, y, label }: { x: string; y: string; label: string }) {
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      <div className="relative flex flex-col items-center">
        <motion.div 
          animate={{ scale: [1, 2.5, 1], opacity: [0.8, 0, 0.8] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute size-6 rounded-full bg-white/40 -translate-y-2"
        />
        <div className="size-2.5 rounded-full bg-white shadow-[0_0_10px_white] relative z-10" />
        <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{label}</span>
      </div>
    </div>
  );
}

function HighFidelityWorldMap({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 1000 500" className="w-full h-full preserve-3d" style={{ fill: color }}>
      {/* Detailed Continents */}
      {/* North America */}
      <path d="M120,100 L180,60 L240,80 L280,120 L300,180 L280,240 L220,260 L160,240 L120,180 Z" />
      <path d="M150,50 L200,30 L230,50 L210,80 Z" /> {/* Greenland */}
      {/* South America */}
      <path d="M260,250 L320,260 L340,320 L320,420 L280,480 L240,400 L230,320 Z" />
      {/* Europe */}
      <path d="M480,80 L540,60 L580,100 L570,160 L520,180 L470,140 Z" />
      {/* Africa */}
      <path d="M460,180 L540,170 L600,220 L620,300 L580,400 L520,440 L460,350 L440,260 Z" />
      {/* Asia */}
      <path d="M550,80 L700,40 L850,70 L920,150 L900,250 L800,320 L650,300 L580,220 L550,150 Z" />
      <path d="M620,310 L680,330 L700,380 L650,420 L600,380 Z" /> {/* SE Asia / India focus */}
      {/* Australia */}
      <path d="M800,350 L900,330 L940,380 L900,450 L820,440 L780,400 Z" />
      {/* Small details */}
      <circle cx="920" cy="220" r="10" /> {/* Japan */}
      <circle cx="850" cy="480" r="6" /> {/* NZ */}
      <circle cx="700" cy="450" r="12" /> {/* Indonesia */}
    </svg>
  );
}
