import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Compass, Sparkles, Map, User, Search, Bell, Plus,
  LayoutGrid, Users, Bookmark, Settings, ChevronLeft, Menu, LogOut,
  ShieldCheck, Globe, MapPin
} from "lucide-react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";
import { NotificationBell } from "./NotificationBell";
import { Logo } from "./Logo";
import { AnnouncementBanner } from "./AnnouncementBanner";

const ADMIN_EMAILS = ["gotripo@gmail.com", "krishkulkarni1005@gmail.com"];

const nav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/passport", label: "Passport", icon: ShieldCheck },
  { to: "/explore-india", label: "Explore India", icon: Compass },
  { to: "/trip-type", label: "AI Plan", icon: Sparkles },
  { to: "/yatra", label: "Yatra", icon: MapPin },
  { to: "/trips", label: "My Trips", icon: Map },
  { to: "/collaborate", label: "Group", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

const mobileNav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/explore-india", label: "India", icon: Compass },
  { to: "/yatra", label: "Yatra", icon: MapPin },
  { to: "/trips", label: "Trips", icon: Bookmark },
  { to: "/profile", label: "Profile", icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/explore-india?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    // Show text (expand) only for explore pages, collapse by default for others
    if (loc.pathname.startsWith("/explore")) {
      setCollapsed(false);
    } else {
      setCollapsed(true);
    }
  }, [loc.pathname]);

  const userInitials = (user?.displayName as string | undefined)
    ?.split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
    || user?.email?.charAt(0).toUpperCase()
    || "?";

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/auth");
  };

  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase() || "");

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar (desktop) */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border bg-surface transition-all duration-300 ${
          collapsed ? "w-[76px]" : "w-[260px]"
        }`}
      >
        <div className={`h-16 flex items-center justify-between ${collapsed ? "px-3" : "px-5"} border-b border-border`}>
          <Link to="/" className="flex items-center gap-2">
            <Logo iconOnly={collapsed} className={collapsed ? "scale-75" : "scale-90"} />
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-muted-foreground hover:text-foreground transition"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {nav.map((n) => {
            const active = loc.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-pop"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <n.icon className="size-[18px] shrink-0" />
                {!collapsed && <span>{n.label}</span>}
              </Link>
            );
          })}

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-border">
              <Link
                to="/admin"
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all text-primary hover:bg-primary/10`}
              >
                <ShieldCheck className="size-[18px] shrink-0" />
                {!collapsed && <span>Admin Panel</span>}
              </Link>
            </div>
          )}

          {!collapsed && (
            <div className="mt-8 space-y-6 px-1">
              {/* Travel Tip */}
              <div className="rounded-2xl bg-secondary/30 p-4 border border-border/50">
                <div className="flex items-center gap-2 text-accent">
                  <Bookmark className="size-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Travel Tip</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                  Book flights on Tuesdays for the best deals on domestic travel.
                </p>
              </div>

              {/* Featured destination */}
              <div>
                <div className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center justify-between">
                  <span>Featured</span>
                  <Sparkles className="size-3 text-accent" />
                </div>
                <Link to="/trip-details?id=kerala" className="group block rounded-2xl overflow-hidden bg-secondary/20 border border-border/50 hover:border-accent/30 transition-all">
                  <div className="h-20 bg-[url('https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=80')] bg-cover bg-center group-hover:scale-110 transition-transform duration-500" />
                  <div className="p-2.5">
                    <div className="text-xs font-bold">Kerala Backwaters</div>
                    <div className="text-[10px] text-muted-foreground">South India · 6 days</div>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </nav>

        {!collapsed && (
          <div className="m-3 rounded-2xl bg-hero-gradient text-white p-4 shadow-pop">
            <div className="text-xs uppercase tracking-widest opacity-70">Pro</div>
            <div className="font-display font-bold mt-1">Unlock AI co-pilot</div>
            <p className="text-xs text-white/70 mt-1">Multi-city, real-time sync, offline maps.</p>
            <Link to="/pricing">
              <button className="mt-3 w-full rounded-lg bg-warm-gradient text-white text-xs font-semibold py-2 shadow-cta">
                Upgrade
              </button>
            </Link>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <AnnouncementBanner />
        {/* Topbar */}
        <header className="h-16 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border flex items-center gap-3 px-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <Logo iconOnly className="scale-75" />
            <span className="font-display font-bold">GoTripo</span>
          </Link>

          <div className="hidden md:flex items-center gap-2 max-w-md w-full ml-2">
            <div className="relative w-full">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search destinations, trips, ideas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary border border-transparent focus:border-ring focus:bg-surface outline-none text-sm transition"
              />
            </div>
          </div>

          <div className="flex-1" />

          <Link
            to="/trip-type"
            className="hidden sm:inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-warm-gradient text-white text-sm font-semibold shadow-cta hover:opacity-95 transition"
          >
            <Plus className="size-4" />
            New Trip
          </Link>
          <ThemeToggle />
          <NotificationBell />
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="size-10 rounded-xl bg-primary-soft text-primary grid place-items-center font-semibold text-sm hover:opacity-90 transition"
              aria-label="Account menu"
            >
              {userInitials}
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-12 z-40 w-56 rounded-xl bg-surface border border-border shadow-pop p-1.5">
                  <div className="px-3 py-2 border-b border-border">
                    <div className="text-sm font-semibold truncate">
                      {(user?.displayName as string | undefined) || user?.email?.split("@")[0]}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary transition"
                  >
                    <User className="size-4" /> Profile
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary transition"
                  >
                    <Settings className="size-4" /> Settings
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition"
                  >
                    <LogOut className="size-4" /> Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-0">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border">
        <ul className="grid grid-cols-5 h-16">
          {mobileNav.map((n) => {
            const active = loc.pathname.startsWith(n.to);
            return (
              <li key={n.to}>
                <Link
                  to={n.to}
                  className={`h-full flex flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <n.icon className="size-5" />
                  {n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <aside className="absolute top-0 left-0 h-full w-72 bg-surface p-5 shadow-pop">
            <Link to="/" className="flex items-center gap-2 mb-6" onClick={() => setMobileOpen(false)}>
              <Logo className="scale-90 origin-left" />
            </Link>
            <nav className="space-y-1">
              {nav.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
                >
                  <n.icon className="size-[18px]" />
                  {n.label}
                </Link>
              ))}

              {isAdmin && (
                <div className="pt-4 mt-4 border-t border-border">
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10"
                  >
                    <ShieldCheck className="size-[18px]" />
                    Admin Panel
                  </Link>
                </div>
              )}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}

export { LayoutGrid, Settings };
