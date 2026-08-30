import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative size-10 flex items-center justify-center rounded-xl border border-border bg-surface hover:bg-secondary transition-colors duration-300 ${className}`}
    >
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Sun
          className={`size-4 transition-all duration-300 ${
            isDark ? "opacity-0 scale-50 rotate-90" : "opacity-100 scale-100 rotate-0"
          }`}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Moon
          className={`size-4 transition-all duration-300 ${
            isDark ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90"
          }`}
        />
      </div>
    </button>
  );
}
