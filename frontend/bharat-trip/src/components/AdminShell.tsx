import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Map,
  Briefcase,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Bell,
  Database,
  Code2,
  Server,
  Megaphone,
  TestTube,
  Library,
  Cpu,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";
import { NotificationBell } from "./NotificationBell";

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/trips", label: "Trips", icon: Map },
  { to: "/admin/applications", label: "Job Applications", icon: Briefcase },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/admin/polls", label: "Polls", icon: BarChart3 },
  { to: "/admin/notifications", label: "Announcements", icon: Bell },
  { to: "/admin/chatbot", label: "Chatbot AI", icon: MessageSquare },
  { to: "/admin/config", label: "System Config", icon: Settings },
];

const aiNav = [
  { to: "/admin/ai/frontend-agent", label: "Frontend Agent", icon: Code2 },
  { to: "/admin/ai/backend-agent", label: "Backend Agent", icon: Server },
  { to: "/admin/ai/marketing-agent", label: "Marketing Agent", icon: Megaphone },
  { to: "/admin/ai/testing-agent", label: "Testing Agent", icon: TestTube },
  { to: "/admin/ai/prompt-library", label: "Prompt Library", icon: Library },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Admin signed out");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-background admin-theme">
      {/* Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ${
          collapsed ? "w-[76px]" : "w-[260px]"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary grid place-items-center text-primary-foreground font-bold shadow-lg">A</div>
            {!collapsed && <span className="font-display font-bold text-lg tracking-tight">GoTripo <span className="text-xs text-primary">Admin</span></span>}
          </Link>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-muted-foreground hover:text-foreground transition"
          >
            <ChevronLeft className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="space-y-1">
            {adminNav.map((n) => {
              const active = loc.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <n.icon className="size-[18px] shrink-0" />
                  {!collapsed && <span>{n.label}</span>}
                </Link>
              );
            })}
          </div>

          <div className="pt-4 pb-2">
            {!collapsed ? (
              <div className="px-3 mb-2 flex items-center gap-2">
                <Sparkles className="size-3 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI Workspace</span>
              </div>
            ) : (
              <div className="border-t border-border mx-4 my-2" />
            )}
            <div className="space-y-1">
              {aiNav.map((n) => {
                const active = loc.pathname === n.to;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    <n.icon className="size-[18px] shrink-0" />
                    {!collapsed && <span>{n.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-border">
           <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="size-[18px] shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border flex items-center gap-3 px-4 lg:px-8">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </button>
          
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Database className="size-4" />
            <span>Admin Control Panel</span>
          </div>

          <div className="flex-1" />

          <ThemeToggle />
          <NotificationBell />
          <div className="size-10 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold text-sm shadow-sm">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <aside className="absolute top-0 left-0 h-full w-72 bg-card p-5 shadow-2xl flex flex-col">
            <div className="flex items-center gap-2 mb-8">
               <div className="size-9 rounded-xl bg-primary grid place-items-center text-primary-foreground font-bold">A</div>
               <span className="font-display font-bold text-lg">GoTripo Admin</span>
            </div>
            <nav className="space-y-1 flex-1 overflow-y-auto">
              {adminNav.map((n) => (
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
              
              <div className="pt-6 px-3 mb-2 flex items-center gap-2">
                <Sparkles className="size-3 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">AI Workspace</span>
              </div>
              {aiNav.map((n) => (
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
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 mt-6"
              >
                <LogOut className="size-[18px]" />
                Sign Out
              </button>
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}
