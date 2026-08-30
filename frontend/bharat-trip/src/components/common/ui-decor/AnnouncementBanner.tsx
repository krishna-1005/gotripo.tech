import { useEffect, useState } from "react";
import { Info, AlertTriangle, CheckCircle2, Megaphone, X, ExternalLink } from "lucide-react";
import api from "@/lib/api";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [closed, setClosed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const path = location.pathname === "/" ? "home" : location.pathname.substring(1);
        const res = await api.get(`/public/announcements?page=${path}`);
        setAnnouncements(res.data);
      } catch (err) {
        console.error("Announcement fetch error:", err);
      }
    };

    fetchAnnouncements();
  }, [location.pathname]);

  if (closed || announcements.length === 0) return null;

  const current = announcements[currentIndex];

  const colors = {
    info: "bg-blue-600 text-white",
    success: "bg-emerald-600 text-white",
    warning: "bg-orange-600 text-white",
    promotion: "bg-purple-600 text-white",
  };

  const Icons = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    promotion: Megaphone,
  };

  const Icon = Icons[current.type as keyof typeof Icons] || Info;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className={`${colors[current.type as keyof typeof colors] || colors.info} relative z-50`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Icon className="size-4 shrink-0" />
            <span>{current.title}:</span>
          </div>
          <p className="text-sm opacity-90 hidden md:block line-clamp-1">{current.content}</p>
          
          {current.link && (
            <Link 
              to={current.link} 
              className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all border border-white/20 ml-2"
            >
              Check it out <ExternalLink className="size-3" />
            </Link>
          )}

          <button 
            onClick={() => setClosed(true)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition"
          >
            <X className="size-4" />
          </button>
        </div>
        
        {announcements.length > 1 && (
           <div className="absolute bottom-0 left-0 h-0.5 bg-white/30 transition-all duration-[5000ms]" 
                style={{ width: `${((currentIndex + 1) / announcements.length) * 100}%` }} 
           />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
