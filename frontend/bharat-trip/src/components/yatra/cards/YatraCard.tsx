import { Link } from "react-router-dom";
import { YatraData } from "@/lib/yatra-data";
import { MapPin, Clock, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface YatraCardProps {
  yatra: YatraData;
}

export function YatraCard({ yatra }: YatraCardProps) {
  return (
    <Link to={`/yatra/${yatra.id}`} className="group block">
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-card rounded-[32px] overflow-hidden shadow-soft hover:shadow-pop transition-all duration-300 border border-border"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img 
            src={yatra.img} 
            alt={yatra.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 rounded-xl bg-background/90 backdrop-blur-md text-foreground text-[10px] font-bold uppercase tracking-widest border border-white/20">
              {yatra.tag}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#F4B740]">
              <Star className="size-3 fill-current" />
              <span>Sacred Journey</span>
            </div>
            <h3 className="font-display text-2xl font-bold mt-1">{yatra.title}</h3>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <MapPin className="size-3.5 text-[#E67E22]" />
              {yatra.region}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock className="size-3.5 text-[#E67E22]" />
              {yatra.duration}
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Starting from</span>
              <div className="text-lg font-display font-bold text-foreground">{yatra.budget}</div>
            </div>
            <div className="size-10 rounded-full bg-[#FFF3E0] dark:bg-orange-500/10 text-[#E67E22] flex items-center justify-center group-hover:bg-[#E67E22] group-hover:text-white transition-colors">
              <ArrowRight className="size-5" />
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
