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
    yatra: "Kashi (Varanasi) Darshan",
    startingCity: "",
    date: ""
  });

  // Apply Poppins and global styles for the Yatra theme
  useEffect(() => {
    window.scrollTo(0, 0);
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
      <div className="font-['Poppins'] bg-[#0B0B0B] text-white selection:bg-[#FF6B00] selection:text-white transition-colors duration-500 relative min-h-screen overflow-hidden">
        
        {/* Golden Glow Backdrop Blobs */}
        <div className="absolute top-[10%] left-[-10%] size-[500px] rounded-full bg-[#FF6B00]/10 blur-[150px] pointer-events-none" />
        <div className="absolute top-[40%] right-[-10%] size-[600px] rounded-full bg-[#F5A623]/5 blur-[180px] pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-5%] size-[500px] rounded-full bg-[#FF6B00]/5 blur-[150px] pointer-events-none" />

        <Hero searchState={searchState} setSearchState={setSearchState} />
        
        <StatsBar />
        
        <PopularYatras />
        
        <HowItWorks />
        
        <FeaturedSpotlight />
        
        <Testimonials />
        
        <FooterCTA />

        {/* Floating Mobile Sticky Button */}
        <div className="md:hidden fixed bottom-8 left-8 right-8 z-50">
          <button 
            onClick={() => navigate('/yatra/plan')}
            className="w-full py-5 bg-gradient-to-r from-[#FF6B00] to-[#E32636] text-white rounded-[2rem] font-black shadow-[0_20px_40px_rgba(255,107,0,0.5)] flex items-center justify-center gap-3 animate-pulse border-2 border-white/20 active:scale-95 cursor-pointer uppercase tracking-widest text-xs"
          >
             Plan Yatra Now
          </button>
        </div>
      </div>
    </AppShell>
  );
}
