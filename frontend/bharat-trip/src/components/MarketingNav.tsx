import { Link } from "react-router-dom";
import { Sparkles, Menu, X, ArrowRight } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthProvider";
import { Logo } from "./Logo";

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const { user, loading } = useAuth();

  return (
    <header className="fixed top-4 inset-x-4 lg:inset-x-8 z-50">
      <div className="max-w-7xl mx-auto bg-white/70 dark:bg-black/20 backdrop-blur-xl border border-border dark:border-white/10 rounded-2xl px-5 py-3 flex items-center justify-between text-foreground dark:text-white shadow-2xl transition-colors duration-500">

        <Link to="/" className="flex items-center gap-2 group">
          <Logo className="scale-90 origin-left" />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground dark:text-white/80">
          <a href="#features" className="hover:text-foreground dark:hover:text-white transition">Features</a>
          <a href="#destinations" className="hover:text-foreground dark:hover:text-white transition">Destinations</a>
          <a href="#voices" className="hover:text-foreground dark:hover:text-white transition">Stories</a>
          <Link to="/pricing" className="hover:text-foreground dark:hover:text-white transition">Pricing</Link>
          <Link to="/explore-india" className="hover:text-foreground dark:hover:text-white transition">Explore</Link>
          <Link to="/yatra" className="hover:text-foreground dark:hover:text-white transition">Yatra</Link>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle className="!bg-secondary/50 dark:!bg-white/10 !border-border dark:!border-white/20 text-foreground dark:text-white hover:!bg-secondary dark:hover:!bg-white/20" />

          {!loading &&
            (user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="size-10 rounded-xl bg-secondary dark:bg-white/10 border border-border dark:border-white/10 flex items-center justify-center font-bold text-sm hover:bg-secondary/80 dark:hover:bg-white/20 transition shadow-sm"
                  title="My Profile"
                >
                  {(user.displayName as string | undefined)?.charAt(0) || user.email?.charAt(0).toUpperCase() || "P"}
                </Link>
                <Link
                  to="/dashboard"
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-primary text-primary-foreground dark:bg-white/10 dark:border-white/10 hover:opacity-90 transition flex items-center gap-2 shadow-sm"
                >
                  Dashboard <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <>
                <Link to="/auth" className="text-sm px-4 py-2 hover:text-accent transition">
                  Log in
                </Link>

                <Link
                  to="/auth?mode=signup"
                  className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-warm-gradient text-white shadow-cta hover:opacity-95 transition"
                >
                  <Sparkles className="size-4 inline mr-1" /> Get started
                </Link>
              </>
            ))}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle className="!bg-secondary/50 dark:!bg-white/10 !border-border dark:!border-white/20 text-foreground dark:text-white hover:!bg-secondary dark:hover:!bg-white/20 scale-90" />
          <button
            onClick={() => setOpen(!open)}
            className="text-foreground dark:text-white"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-background/95 dark:bg-black/90 backdrop-blur-2xl border border-border dark:border-white/10 rounded-2xl p-5 text-foreground dark:text-white space-y-1 shadow-2xl animate-in fade-in zoom-in duration-200">
          <a href="#features" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-secondary dark:hover:bg-white/10 transition">Features</a>
          <a href="#destinations" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-secondary dark:hover:bg-white/10 transition">Destinations</a>
          <a href="#voices" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-secondary dark:hover:bg-white/10 transition">Stories</a>
          <Link to="/pricing" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-secondary dark:hover:bg-white/10 transition">Pricing</Link>
          <Link to="/explore-india" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-secondary dark:hover:bg-white/10 transition">Explore</Link>
          <Link to="/yatra" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-secondary dark:hover:bg-white/10 transition">Yatra</Link>
          {!user ? (
            <div className="pt-2 space-y-2">
              <Link to="/auth" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-secondary dark:hover:bg-white/10 transition">Log in</Link>
              <Link to="/auth?mode=signup" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl bg-warm-gradient text-white font-bold text-center">Get started</Link>
            </div>
          ) : (
            <div className="pt-2 space-y-2">
              <Link to="/profile" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl hover:bg-secondary dark:hover:bg-white/10 transition font-semibold border-b border-border dark:border-white/5">My Profile</Link>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl bg-primary text-primary-foreground dark:bg-white/10 dark:hover:bg-white/20 transition font-bold text-center">Dashboard</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
