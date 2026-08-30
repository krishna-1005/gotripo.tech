import { useState, useEffect, useRef } from "react";
import { searchPlaces } from "@/lib/api";
import { MapPin, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectSuggestion?: (suggestion: any) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function LocationAutocomplete({ value, onChange, onSelectSuggestion, placeholder, className, icon }: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.length < 3 || !isOpen) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchPlaces(query);
        setSuggestions(results);
      } catch (err) {
        console.error("Autocomplete error:", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, isOpen]);

  const handleSelect = (suggestion: any) => {
    const cityName = suggestion.name;
    setQuery(cityName);
    onChange(cityName);
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`${className} ${icon ? "pl-11" : ""}`}
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (suggestions.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[100] w-full mt-2 rounded-2xl bg-card border border-border shadow-pop overflow-hidden"
          >
            {loading && suggestions.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="size-3 animate-spin" /> Searching locations...
              </div>
            ) : (
              <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className="w-full p-4 text-left hover:bg-secondary transition flex items-start gap-3 border-b border-border last:border-0"
                  >
                    <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="size-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{s.fullName}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
