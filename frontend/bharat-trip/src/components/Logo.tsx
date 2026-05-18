import React from 'react';
import { cn } from "@/lib/utils";
import logoImg from "@/assets/logo.png";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: 'light' | 'dark' | 'color';
}

export function Logo({ className, iconOnly = false, variant = 'color' }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative size-10 shrink-0 bg-white rounded-lg overflow-hidden flex items-center justify-center p-0.5 shadow-sm border border-slate-200/50">
        <img 
          src={logoImg} 
          alt="GoTripo Logo" 
          className="w-full h-full object-contain mix-blend-multiply"
        />
      </div>
      
      {!iconOnly && (
        <span className={cn(
          "font-sans font-bold text-2xl tracking-tight flex items-baseline",
          variant === 'light' ? "text-white" : "text-slate-900 dark:text-white"
        )}>
          <span className="font-extrabold text-[#003B95] dark:text-blue-400">Go</span>
          <span className="font-medium text-slate-600 dark:text-slate-300">Tripo</span>
        </span>
      )}
    </div>
  );
}
