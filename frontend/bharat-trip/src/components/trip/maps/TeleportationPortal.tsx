import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const portalImages: Record<string, string> = {
  "mountain": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=2000",
  "beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=2000",
  "temple": "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=2000",
  "forest": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=2000",
  "city": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=2000",
  "desert": "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&q=80&w=2000",
  "snow": "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?auto=format&fit=crop&q=80&w=2000",
};

export function TeleportationPortal({ activeHint }: { activeHint: string | null }) {
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  useEffect(() => {
    if (!activeHint) {
      setCurrentImage(null);
      return;
    }

    // Simple keyword matching for image hint
    const hint = activeHint.toLowerCase();
    let selected = portalImages.mountain; // default

    if (hint.includes("beach") || hint.includes("ocean") || hint.includes("sea")) selected = portalImages.beach;
    else if (hint.includes("temple") || hint.includes("spirit") || hint.includes("ancient")) selected = portalImages.temple;
    else if (hint.includes("forest") || hint.includes("green") || hint.includes("trees")) selected = portalImages.forest;
    else if (hint.includes("city") || hint.includes("urban") || hint.includes("modern")) selected = portalImages.city;
    else if (hint.includes("desert") || hint.includes("sand") || hint.includes("hot")) selected = portalImages.desert;
    else if (hint.includes("snow") || hint.includes("cold") || hint.includes("ice") || hint.includes("pine")) selected = portalImages.snow;
    else if (hint.includes("mountain") || hint.includes("hill") || hint.includes("trek")) selected = portalImages.mountain;

    setCurrentImage(selected);
  }, [activeHint]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      <AnimatePresence>
        {currentImage && (
          <motion.div
            key={currentImage}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <img 
              src={currentImage} 
              alt="Portal" 
              className="w-full h-full object-cover"
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Default soft background if no portal is active */}
      <div className="absolute inset-0 bg-background transition-opacity duration-1000" style={{ opacity: currentImage ? 0 : 1 }} />
    </div>
  );
}
