import { useEffect, useState, useRef } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, Megaphone, Loader2, MessageSquare, Send, X } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "./AuthProvider";
import { Link } from "react-router-dom";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";

export function NotificationBell() {
  const { user } = useAuth();
  const socket = useSocket();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

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
    // Poll for new notifications every 2 minutes as backup
    const interval = setInterval(fetchNotifications, 120000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!socket || !user) return;

    const handleNotification = (data: any) => {
      fetchNotifications();
      
      // Browser Notification
      if (Notification.permission === "granted") {
        const n = new Notification(`GoTripo: ${data.senderName}`, {
          body: data.text,
          icon: "/favicon.svg"
        });
        n.onclick = () => {
          window.focus();
          window.location.href = `/collaborate/${data.tripId}`;
        };
      }
    };

    socket.on(`user:notification:${user.uid}`, handleNotification);
    
    // Request permission on mount
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      socket.off(`user:notification:${user.uid}`, handleNotification);
    };
  }, [socket, user]);

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

  const handleReply = async (n: any) => {
    if (!replyText.trim()) return;
    
    try {
      // 1. Send via socket if possible, but here we probably want a dedicated API endpoint 
      // or we just emit to the room since the user is technically replying from elsewhere
      socket.emit("message:send", {
        tripId: n.meta.tripId,
        senderId: user?.uid,
        userName: user?.displayName || "Teammate",
        text: replyText,
        initials: user?.displayName?.[0] || "?",
        color: "bg-primary"
      });

      // 2. Mark notification as read
      await markAsRead(n._id);
      
      setReplyingTo(null);
      setReplyText("");
      toast.success("Reply sent to room!");
    } catch (err) {
      toast.error("Failed to send reply");
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
          <div className="absolute right-0 top-12 z-40 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-pop overflow-hidden flex flex-col max-h-[500px]">
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
                      className={`p-4 flex flex-col gap-3 hover:bg-secondary/30 transition cursor-pointer ${!n.isRead ? "bg-primary/5" : ""}`}
                      onClick={() => !n.isRead && n.type !== 'chat' && markAsRead(n._id)}
                    >
                      <div className="flex gap-3">
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
                          
                          {/* Chat Actions */}
                          {n.type === 'chat' && !n.isRead && (
                            <div className="flex items-center gap-2 mt-3">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReplyingTo(replyingTo === n._id ? null : n._id);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider hover:bg-primary/20 transition"
                              >
                                {replyingTo === n._id ? 'Cancel' : 'Reply'}
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(n._id);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-[10px] font-bold uppercase tracking-wider hover:bg-border transition"
                              >
                                Mark as read
                              </button>
                            </div>
                          )}

                          {replyingTo === n._id && (
                            <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                               <input 
                                 autoFocus
                                 className="flex-1 bg-secondary border border-border rounded-lg px-2 py-1.5 text-xs outline-none focus:border-primary transition"
                                 placeholder="Type your reply..."
                                 value={replyText}
                                 onChange={e => setReplyText(e.target.value)}
                                 onKeyDown={e => e.key === 'Enter' && handleReply(n)}
                               />
                               <button 
                                 onClick={() => handleReply(n)}
                                 className="size-8 rounded-lg bg-primary text-white grid place-items-center hover:scale-105 active:scale-95 transition shadow-sm"
                               >
                                 <Send size={14} />
                               </button>
                            </div>
                          )}

                          {n.link && n.type !== 'chat' && (
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
    case "chat": return <MessageSquare className="size-4 text-primary" />;
    default: return <Info className="size-4 text-blue-500" />;
  }
}
