import React, { useState, useEffect, useCallback } from "react";
import { ChevronRight, ChevronLeft, X } from "lucide-react";

interface Step {
  target: string;
  title: string;
  content: string;
}

const TOUR_STEPS: Step[] = [
  {
    target: "#tour-title-block",
    title: "✨ Welcome to your Yatra!",
    content: "This is your customized itinerary! Here you'll find the title, destination, and day count of your generated trip plan."
  },
  {
    target: "#tour-blueprint",
    title: "📊 Trip Blueprint",
    content: "Review a summary of your trip parameters, budget tier, and estimated transportation cost at a glance."
  },
  {
    target: "#tour-timeline",
    title: "📍 Day-by-Day Timeline",
    content: "Explore the details of each stop. Hover over any activity to Swap or Delete it. Click the card to open complete directions, instructions, and reviews!"
  },
  {
    target: "#tour-map",
    title: "🗺️ Route Map Preview",
    content: "Track your route visually! Zoom, pan, or click on markers to interact with specific pins on your travel path."
  },
  {
    target: "#tour-sidebar-widgets",
    title: "💡 Travel Recommendations",
    content: "Check out packing guidelines, live weather tips, and handpicked accommodation options matching your budget."
  },
  {
    target: "#tour-finalize-block",
    title: "🚀 Finalize & Collaborate",
    content: "Ready to travel? Finalize your trip to open a collaborative Room where you can invite friends, live chat, and poll in real time!"
  }
];

interface OnboardingTourProps {
  onClose: () => void;
}

export default function OnboardingTour({ onClose }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const updateHighlight = useCallback(() => {
    const step = TOUR_STEPS[currentStep];
    const element = document.querySelector(step.target);
    
    if (element) {
      // Smooth scroll to the element
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Delay slightly to allow scroll animation to settle for accurate coordinates
      setTimeout(() => {
        const bounds = element.getBoundingClientRect();
        setRect(bounds);
      }, 300);
    } else {
      setRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    updateHighlight();
    
    window.addEventListener("resize", updateHighlight);
    window.addEventListener("scroll", updateHighlight);
    
    return () => {
      window.removeEventListener("resize", updateHighlight);
      window.removeEventListener("scroll", updateHighlight);
    };
  }, [currentStep, updateHighlight]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const activeStep = TOUR_STEPS[currentStep];

  // Tooltip dynamic positioning relative to the spotlight
  let tooltipStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    width: "340px",
  };

  if (rect) {
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    if (spaceBelow > 260) {
      // Position below
      tooltipStyle.top = rect.bottom + 16;
      tooltipStyle.left = Math.max(16, Math.min(window.innerWidth - 356, rect.left + rect.width / 2 - 170));
    } else if (spaceAbove > 260) {
      // Position above
      tooltipStyle.bottom = (window.innerHeight - rect.top) + 16;
      tooltipStyle.left = Math.max(16, Math.min(window.innerWidth - 356, rect.left + rect.width / 2 - 170));
    } else {
      // Fallback center of screen
      tooltipStyle.top = "50%";
      tooltipStyle.left = "50%";
      tooltipStyle.transform = "translate(-50%, -50%)";
    }
  } else {
    // Default center screen
    tooltipStyle.top = "50%";
    tooltipStyle.left = "50%";
    tooltipStyle.transform = "translate(-50%, -50%)";
  }

  return (
    <>
      {/* Background click blocker */}
      <div className="fixed inset-0 z-[9996] bg-black/60 backdrop-blur-[1px]" />

      {/* Spotlight cutout overlay */}
      {rect && (
        <div
          style={{
            position: "fixed",
            left: rect.left - 12,
            top: rect.top - 12,
            width: rect.width + 24,
            height: rect.height + 24,
            borderRadius: "24px",
            boxShadow: "0 0 0 9999px rgba(2, 8, 23, 0.75), 0 0 20px 5px rgba(83, 74, 183, 0.4)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 9997,
            pointerEvents: "none"
          }}
        />
      )}

      {/* Onboarding Tooltip Card */}
      <div
        style={tooltipStyle}
        className="z-[9998] bg-[#0E1629]/95 border border-primary/20 backdrop-blur-md rounded-[2rem] p-6 shadow-[0_10px_50px_rgba(83,74,183,0.3)] transition-all duration-300 pointer-events-auto"
      >
        <div className="flex justify-between items-start gap-4 mb-3">
          <h4 className="font-display font-bold text-base text-white">{activeStep.title}</h4>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
            <X size={16} />
          </button>
        </div>
        
        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          {activeStep.content}
        </p>

        <div className="flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex gap-1.5">
            {TOUR_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`size-1.5 rounded-full transition-all ${i === currentStep ? "w-4 bg-primary" : "bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="h-8 px-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-[10px] font-bold flex items-center gap-1 transition-all"
              >
                <ChevronLeft size={12} /> Prev
              </button>
            )}
            <button
              onClick={handleNext}
              className="h-8 px-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 hover:scale-105 transition-all shadow-cta"
            >
              {currentStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"} <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
