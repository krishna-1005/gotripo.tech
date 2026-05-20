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
    <header className="fixed top-6 left-0 right-0 z-50 px-4 md:px-6 lg:px-12">
      <div className="max-w-7xl mx-auto bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full px-5 md:px-8 py-3 flex items-center justify-between text-white shadow-2xl transition-all duration-500">

        <Link to="/" className="flex items-center gap-2 group">
          <Logo className="scale-100 origin-left" variant="light" />
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-[13px] font-bold tracking-wide text-white/90">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#destinations" className="hover:text-white transition-colors">Destinations</a>
          <a href="#voices" className="hover:text-white transition-colors">Stories</a>
          <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link to="/explore-india" className="hover:text-white transition-colors">Explore</Link>
          <Link to="/community" className="text-[#10b981] hover:text-[#10b981]/80 transition-colors">Community</Link>
          <Link to="/yatra" className="hover:text-white transition-colors">Yatra</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle className="size-10 !rounded-full !bg-white/10 !border-white/10 text-white hover:!bg-white/20 transition-all" />

          {!loading &&
            (user ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/profile"
                  className="size-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-sm text-white hover:bg-white/20 transition-all shadow-sm"
                  title="My Profile"
                >
                  {(user.displayName as string | undefined)?.charAt(0) || user.email?.charAt(0).toUpperCase() || "K"}
                </Link>
                <Link
                  to="/dashboard"
                  className="text-sm font-bold px-7 py-2.5 rounded-full bg-white/15 border border-white/10 text-white hover:bg-white/25 transition-all flex items-center gap-2 shadow-sm"
                >
                  Dashboard <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <>
                <Link to="/auth" className="text-sm px-4 py-2 hover:text-[#10b981] transition font-semibold">
                  Log in
                </Link>

                <Link
                  to="/auth?mode=signup"
                  className="text-sm font-bold px-7 py-3 rounded-xl bg-[#10b981] text-white shadow-lg hover:bg-[#0da673] hover:shadow-[#10b981]/20 transition-all"
                >
                  <Sparkles className="size-4 inline mr-1.5" /> Get started
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
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block py-3 px-4 rounded-xl bg-primary text-primary-foreground dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition font-bold text-center">Dashboard</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
