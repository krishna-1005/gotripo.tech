import { AppShell } from "@/components/AppShell";
import { Hero } from "@/components/yatra/Hero";
import { StatsBar } from "@/components/yatra/StatsBar";
import { PopularYatras } from "@/components/yatra/PopularYatras";
import { HowItWorks } from "@/components/yatra/HowItWorks";
import { FeaturedSpotlight } from "@/components/yatra/FeaturedSpotlight";
import { Testimonials } from "@/components/yatra/Testimonials";
import { FooterCTA } from "@/components/yatra/FooterCTA";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function YatraListPage() {
  const navigate = useNavigate();
  const [searchState, setSearchState] = useState({
    yatra: "Kashi Vishwanath",
    startingCity: "",
    date: ""
  });

  // Apply Poppins and global styles for the Yatra theme
  useEffect(() => {
    // Inject Poppins if not already there
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // Set body font and smooth scroll
    document.body.style.fontFamily = "'Poppins', sans-serif";
    document.documentElement.style.scrollBehavior = "smooth";
    
    return () => {
      document.body.style.fontFamily = "";
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <AppShell>
      <div className="font-['Poppins'] selection:bg-[#FF6B00] selection:text-white">
        <Hero searchState={searchState} setSearchState={setSearchState} />
        
        {/* Subtle Saffron Gradient Divider */}
        <div className="h-2 w-full bg-gradient-to-r from-transparent via-[#FF6B00]/40 to-transparent" />
        
        <StatsBar />
        
        <div className="h-px w-full bg-[#FF6B00]/10" />
        
        <PopularYatras />
        
        <div className="h-px w-full bg-[#FF6B00]/10" />
        
        <HowItWorks />
        
        <div className="h-px w-full bg-[#FF6B00]/10" />
        
        <FeaturedSpotlight />
        
        <div className="h-px w-full bg-[#FF6B00]/10" />
        
        <Testimonials />
        
        <div className="h-px w-full bg-[#FF6B00]/10" />
        
        {/* Planner section removed as requested - now on a separate page */}
        
        <FooterCTA />

        {/* Floating Mobile Sticky Button */}
        <div className="md:hidden fixed bottom-8 left-8 right-8 z-50">
          <button 
            onClick={() => navigate('/yatra/plan')}
            className="w-full py-5 bg-[#FF6B00] text-white rounded-[2rem] font-black shadow-[0_20px_40px_rgba(255,107,0,0.4)] flex items-center justify-center gap-3 animate-pulse border-2 border-white/20 active:scale-95 cursor-pointer"
          >
             PLAN YATRA NOW
          </button>
        </div>
      </div>
    </AppShell>
  );
}
