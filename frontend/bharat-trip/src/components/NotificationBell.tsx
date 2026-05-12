import { useEffect, useState } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, Megaphone, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "./AuthProvider";
import { Link } from "react-router-dom";

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="size-9 sm:size-10 grid place-items-center rounded-xl border border-border hover:bg-secondary transition relative"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-1.5 sm:top-2 sm:right-2 sm:size-2 bg-primary rounded-full ring-2 ring-background animate-pulse" />
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-40 w-80 rounded-2xl bg-surface border border-border shadow-pop overflow-hidden flex flex-col max-h-[400px]">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/20">
              <span className="font-bold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {notifications.length > 0 ? (
                <div className="divide-y divide-border">
                  {notifications.map((n) => (
                    <div 
                      key={n._id} 
                      className={`p-4 flex gap-3 hover:bg-secondary/30 transition cursor-pointer ${!n.isRead ? "bg-primary/5" : ""}`}
                      onClick={() => markAsRead(n._id)}
                    >
                      <div className="pt-1">
                        <NotificationIcon type={n.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                           <span className={`text-xs font-bold truncate ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                             {n.title}
                           </span>
                           {!n.isRead && <div className="size-1.5 bg-primary rounded-full shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        {n.link && (
                          <Link 
                            to={n.link} 
                            onClick={() => setOpen(false)}
                            className="text-[10px] font-bold text-primary inline-flex items-center gap-1 mt-2 hover:underline"
                          >
                            View details
                          </Link>
                        )}
                        <div className="text-[9px] text-muted-foreground mt-2 font-medium">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                   <Bell className="size-8 text-muted-foreground opacity-20" />
                   <p className="text-xs text-muted-foreground italic">No notifications yet.</p>
                </div>
              )}
            </div>

            {notifications.length > 5 && (
              <div className="p-3 border-t border-border text-center bg-secondary/10">
                 <button className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-foreground transition">
                    View all notifications
                 </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "success": return <CheckCircle2 className="size-4 text-emerald-500" />;
    case "warning": return <AlertTriangle className="size-4 text-orange-500" />;
    case "promo": return <Megaphone className="size-4 text-purple-500" />;
    case "trip": return <Megaphone className="size-4 text-blue-500" />;
    default: return <Info className="size-4 text-blue-500" />;
  }
}
