import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  Users, 
  Send, 
  Plus, 
  Loader2, 
  Calendar, 
  MapPin, 
  MessageSquare, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  ChevronRight,
  Clock,
  Trash2,
  Trophy,
  User as UserIcon
} from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { auth } from "@/firebase";
import api from "@/lib/api";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import ProactiveAlerts from "@/components/collabRoom/ProactiveAlerts";

/* ── CONSTANTS & TYPES ── */

const COLORS = [
  "bg-[#534AB7]", // Primary Purple
  "bg-[#1D9E75]", // Success Teal
  "bg-[#993C1D]", // Warning Coral
  "bg-blue-500",
  "bg-purple-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500"
];

interface Suggestion {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  addedBy: {
    userId: string;
    userName: string;
    initials: string;
    color: string;
  };
  upvotes: string[];
  downvotes: string[];
  createdAt: string;
}

interface Message {
  userId: string;
  userName: string;
  initials: string;
  text: string;
  color: string;
  timestamp: string;
}

interface Member {
  userId: string;
  userName: string;
  initials: string;
  color: string;
  isOnline?: boolean;
}

/* ── MAIN COMPONENT ── */

export default function CollaborativeTrip() {
  return (
    <ProtectedRoute>
      <CollaborativeContent />
    </ProtectedRoute>
  );
}

function CollaborativeContent() {
  const [searchParams] = useSearchParams();
  const tripId = searchParams.get("tripId");
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Suggestions");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState({ title: "", description: "", tags: "" });

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // My persistent color and initials
  const myColor = COLORS[Math.abs(user?.uid?.charCodeAt(0) || 0) % COLORS.length];
  const myInitials = user?.displayName ? user.displayName[0] : "U";

  /* ── DATA FETCHING ── */

  const fetchTrip = async () => {
    if (!tripId) return;
    try {
      const res = await api.get(`/trips/${tripId}`);
      setTrip(res.data);
      setSuggestions(res.data.suggestions || []);
      setMessages(res.data.messages || []);
      
      // Transform trip members to UI members
      const tripMembers = (res.data.members || []).map((m: any, i: number) => ({
        userId: m.userId,
        userName: m.userName,
        initials: m.userName[0],
        color: COLORS[i % COLORS.length]
      }));
      setMembers(tripMembers);
    } catch (err) {
      toast.error("Failed to load trip");
      navigate("/collaborate");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  /* ── SOCKET EVENTS ── */

  useEffect(() => {
    if (!tripId || !user || !socket) return;

    // Join Room
    socket.emit("join:room", { tripId, userId: user.uid });

    // Listen for events
    socket.on("message:receive", (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on("suggestion:receive", (suggestion: Suggestion) => {
      setSuggestions(prev => [...prev, suggestion]);
    });

    socket.on("suggestion:updated", ({ suggestionId, suggestion }) => {
      setSuggestions(prev => prev.map(s => s._id === suggestionId ? suggestion : s));
    });

    socket.on("itinerary:receive", (itinerary: any) => {
      setTrip((prev: any) => ({ ...prev, itinerary }));
    });

    socket.on("trip:updated", (updatedTrip: any) => {
      setTrip(updatedTrip);
    });

    socket.on("member:typing", ({ userName, isTyping }) => {
      setIsTyping(isTyping ? userName : null);
    });

    socket.on("user:online", ({ userId }) => {
      setMembers(prev => prev.map(m => m.userId === userId ? { ...m, isOnline: true } : m));
    });

    socket.on("user:online", ({ userId }) => {
      setMembers(prev => prev.map(m => m.userId === userId ? { ...m, isOnline: true } : m));
    });

    socket.on("user:offline", ({ userId }) => {
      setMembers(prev => prev.map(m => m.userId === userId ? { ...m, isOnline: false } : m));
    });

    return () => {
      socket.emit("leave:room", { tripId, userId: user.uid });
      socket.off("message:receive");
      socket.off("suggestion:receive");
      socket.off("suggestion:updated");
      socket.off("itinerary:receive");
      socket.off("member:typing");
      socket.off("user:online");
      socket.off("user:offline");
    };
  }, [tripId, user, socket]);

  /* ── ACTIONS ── */

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !tripId || !socket) return;

    const msgData = {
      tripId,
      senderId: user?.uid,
      text: newMessage,
      userName: user?.displayName || "Traveller",
      initials: myInitials,
      color: myColor
    };

    // Emit and Persist
    socket.emit("message:send", msgData);
    await api.post(`/trips/${tripId}/messages`, {
      text: newMessage,
      initials: myInitials,
      color: myColor
    });

    setNewMessage("");
  };

  const handleTyping = () => {
    if (!tripId || !user || !socket) return;
    socket.emit("member:typing", { tripId, userName: user.displayName || "Someone", isTyping: true });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("member:typing", { tripId, userName: user.displayName || "Someone", isTyping: false });
    }, 2000);
  };

  const addSuggestion = async () => {
    if (!newSuggestion.title || !tripId || !socket) return;
    try {
      const res = await api.post(`/trips/${tripId}/suggestions`, {
        ...newSuggestion,
        tags: newSuggestion.tags.split(",").map(t => t.trim()),
        initials: myInitials,
        color: myColor
      });
      socket.emit("suggestion:added", { tripId, suggestion: res.data });
      setShowAddModal(false);
      setNewSuggestion({ title: "", description: "", tags: "" });
      toast.success("Suggestion added!");
    } catch (err) {
      toast.error("Failed to add suggestion");
    }
  };

  const vote = async (suggestionId: string, voteType: 'up' | 'down') => {
    if (!socket) return;
    try {
      const res = await api.post(`/trips/${tripId}/suggestions/${suggestionId}/vote`, { voteType });
      socket.emit("suggestion:voted", { tripId, suggestionId, suggestion: res.data });
    } catch (err) {
      toast.error("Failed to vote");
    }
  };

  const regenerateItinerary = async () => {
    if (!socket) return;
    toast.loading("AI is crafting your perfect route...", { id: "itinerary" });
    try {
      // Here we would call an AI service, but for now we'll simulate it
      // In a real app, POST /api/ai/itinerary with current suggestions
      const res = await api.put(`/trips/${tripId}/itinerary`, {
        itinerary: [
          { day: "1", label: "Arrival & Chill", items: [{ time: "10:00 AM", activity: "Check-in at Hotel" }, { time: "01:00 PM", activity: "Local Lunch" }] },
          { day: "2", label: "Heritage Tour", items: [{ time: "09:00 AM", activity: "Main Landmark Visit" }, { time: "04:00 PM", activity: "Old City Walk" }] }
        ]
      });
      socket.emit("itinerary:updated", { tripId, itinerary: res.data });
      toast.success("Itinerary updated with latest suggestions!", { id: "itinerary" });
    } catch (err) {
      toast.error("AI failed to regenerate", { id: "itinerary" });
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) return <AppShell><div className="min-h-screen bg-[#0e0e10] flex items-center justify-center"><Loader2 className="size-10 animate-spin text-primary" /></div></AppShell>;

  const topPick = suggestions.reduce((prev, current) => (prev.upvotes.length > current.upvotes.length) ? prev : current, suggestions[0]);

  return (
    <AppShell>
      <div className="min-h-screen bg-[#0e0e10] text-[#f0f0f0] font-inter flex flex-col">
        
        {/* TOPBAR */}
        <div className="h-20 border-b border-[#2a2a2e] bg-[#141416] px-8 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-[#534AB7] grid place-items-center shadow-cta">
              <Calendar className="size-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl leading-tight">{trip?.title}</h1>
              <div className="flex items-center gap-2 text-[10px] text-[#888888] font-bold uppercase tracking-widest mt-0.5">
                <MapPin className="size-3" /> {trip?.destination} · Planning Phase
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {members.map((m, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "size-9 rounded-full border-2 border-[#141416] grid place-items-center text-xs font-black text-white relative",
                    m.color
                  )}
                  title={m.userName}
                >
                  {m.initials}
                  {m.isOnline && <div className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-[#1D9E75] border-2 border-[#141416]" />}
                </div>
              ))}
            </div>
            <button className="h-10 px-5 rounded-xl bg-[#534AB7] text-white text-xs font-bold shadow-cta hover:opacity-90 transition-opacity flex items-center gap-2">
              <Plus className="size-4" /> Invite
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT PANEL: SUGGESTIONS & ITINERARY */}
          <div className="flex-1 overflow-y-auto p-10">
            <div className="max-w-4xl mx-auto">
              
              {/* PROACTIVE ALERTS */}
              {tripId && trip?.destination && (
                <ProactiveAlerts 
                  key={`${trip.destination}-${trip.startDate || ''}`} 
                  tripId={tripId} 
                  destination={trip.destination} 
                />
              )}

              {/* TABS */}
              <div className="flex gap-2 p-1.5 bg-[#141416] border border-[#2a2a2e] rounded-2xl w-fit mb-10">
                {["Suggestions", "Itinerary", "Polls"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-6 h-10 rounded-xl text-xs font-bold transition-all",
                      activeTab === tab ? "bg-[#534AB7] text-white shadow-cta" : "text-[#888888] hover:text-[#f0f0f0]"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === "Suggestions" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="font-display font-bold text-3xl">Idea Pool</h2>
                      <p className="text-[#888888] mt-1 text-sm">Drop your bucket-list spots here. Top picks get auto-added to the route.</p>
                    </div>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="h-12 px-6 rounded-2xl bg-white/[0.05] border border-[#2a2a2e] text-xs font-bold hover:bg-white/[0.1] transition-all flex items-center gap-2"
                    >
                      <Plus className="size-4" /> Add Suggestion
                    </button>
                  </div>

                  <div className="grid gap-4">
                    {suggestions.length === 0 ? (
                      <div className="py-20 text-center border-2 border-dashed border-[#2a2a2e] rounded-3xl">
                        <Sparkles className="size-10 text-[#888888] mx-auto mb-4 opacity-20" />
                        <p className="text-[#888888] text-sm font-medium">No ideas yet. Be the first to suggest something!</p>
                      </div>
                    ) : (
                      suggestions.map((s) => {
                        const isTop = s._id === topPick?._id && s.upvotes.length > 0;
                        const upRatio = s.upvotes.length + s.downvotes.length > 0 
                          ? (s.upvotes.length / (s.upvotes.length + s.downvotes.length)) * 100 
                          : 50;
                        
                        return (
                          <div key={s._id} className="p-6 rounded-3xl bg-[#141416] border border-[#2a2a2e] group hover:border-[#534AB7]/50 transition-all">
                            <div className="flex items-start justify-between gap-6">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {isTop && (
                                    <div className="px-2.5 py-1 rounded-lg bg-[#1D9E75]/20 text-[#1D9E75] text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                      <Trophy className="size-3" /> Top Pick
                                    </div>
                                  )}
                                  <div className="flex gap-1.5">
                                    {s.tags.map(tag => (
                                      <span key={tag} className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[#888888] text-[9px] font-bold uppercase tracking-widest">{tag}</span>
                                    ))}
                                  </div>
                                </div>
                                <h3 className="text-xl font-display font-bold">{s.title}</h3>
                                <p className="text-sm text-[#888888] mt-2 leading-relaxed">{s.description}</p>
                                
                                <div className="mt-6 flex items-center gap-3">
                                  <div className={cn("size-6 rounded-lg grid place-items-center text-[8px] font-black text-white", s.addedBy.color)}>
                                    {s.addedBy.initials}
                                  </div>
                                  <div className="text-[10px] text-[#888888] font-bold">Suggested by <span className="text-[#f0f0f0]">{s.addedBy.userId === user?.uid ? "You" : s.addedBy.userName}</span></div>
                                </div>
                              </div>

                              <div className="flex flex-col items-center gap-2">
                                <button 
                                  onClick={() => vote(s._id, 'up')}
                                  className={cn(
                                    "size-10 rounded-xl grid place-items-center transition-all",
                                    s.upvotes.includes(user?.uid || "") ? "bg-[#1D9E75] text-white shadow-cta" : "bg-white/[0.05] text-[#888888] hover:bg-white/[0.1]"
                                  )}
                                >
                                  <ArrowUp className="size-5" />
                                </button>
                                <div className="text-xs font-black">{s.upvotes.length - s.downvotes.length}</div>
                                <button 
                                  onClick={() => vote(s._id, 'down')}
                                  className={cn(
                                    "size-10 rounded-xl grid place-items-center transition-all",
                                    s.downvotes.includes(user?.uid || "") ? "bg-[#993C1D] text-white shadow-cta" : "bg-white/[0.05] text-[#888888] hover:bg-white/[0.1]"
                                  )}
                                >
                                  <ArrowDown className="size-5" />
                                </button>
                              </div>
                            </div>

                            <div className="mt-6 h-1 rounded-full bg-[#2a2a2e] overflow-hidden">
                              <div className="h-full bg-[#1D9E75] transition-all duration-1000" style={{ width: `${upRatio}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Itinerary" && (
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display font-bold text-3xl">Live Timeline</h2>
                      <p className="text-[#888888] mt-1 text-sm">Our group route, optimized in real-time by GoTripo AI.</p>
                    </div>
                    <button 
                      onClick={regenerateItinerary}
                      className="h-12 px-6 rounded-2xl bg-[#534AB7] text-white text-xs font-bold shadow-cta hover:opacity-90 transition-all flex items-center gap-2"
                    >
                      <Sparkles className="size-4" /> AI Regenerate
                    </button>
                  </div>

                  <div className="relative pl-10 border-l-2 border-[#2a2a2e] space-y-12 py-4 ml-4">
                    {(trip?.itinerary || []).map((day: any, i: number) => {
                      const colors = ["border-[#534AB7] bg-[#534AB7]", "border-[#1D9E75] bg-[#1D9E75]", "border-amber-500 bg-amber-500"];
                      const color = colors[i % colors.length];
                      return (
                        <div key={i} className="relative">
                          <div className={cn("absolute -left-[51px] top-0 size-10 rounded-2xl border-4 border-[#0e0e10] grid place-items-center font-display font-bold text-sm text-white", color)}>
                            {i + 1}
                          </div>
                          <div>
                            <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
                              {day.label}
                              <span className="text-[10px] text-[#888888] font-black uppercase tracking-[0.2em]">Day {i + 1}</span>
                            </h3>
                            <div className="space-y-4">
                              {day.items.map((item: any, j: number) => (
                                <div key={j} className="p-5 rounded-2xl bg-[#141416] border border-[#2a2a2e] flex items-center justify-between">
                                  <div className="flex items-center gap-5">
                                    <div className="text-[10px] font-black text-[#534AB7] uppercase tracking-widest bg-[#534AB7]/10 px-2 py-1 rounded-md">{item.time}</div>
                                    <div className="font-bold text-sm">{item.activity}</div>
                                  </div>
                                  <ChevronRight className="size-4 text-[#2a2a2e]" />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR: GROUP CHAT */}
          <div className="w-[380px] border-l border-[#2a2a2e] bg-[#141416] flex flex-col shrink-0">
            <div className="p-6 border-b border-[#2a2a2e] flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg">Crew Chat</h3>
                <div className="text-[10px] text-[#1D9E75] font-black uppercase tracking-widest flex items-center gap-2 mt-0.5">
                  <div className="size-1.5 rounded-full bg-[#1D9E75] animate-pulse" /> Live Now
                </div>
              </div>
              <Users className="size-5 text-[#888888]" />
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
              {messages.map((m, i) => {
                const isMe = m.userId === user?.uid;
                return (
                  <div key={i} className={cn("flex gap-3", isMe ? "flex-row-reverse" : "")}>
                    <div className={cn("size-8 rounded-full grid place-items-center text-[10px] font-black text-white shrink-0 mt-1", m.color)}>
                      {m.initials}
                    </div>
                    <div className={cn("max-w-[80%]", isMe ? "text-right" : "")}>
                      <div className="text-[10px] text-[#888888] mb-1 font-bold">
                        {isMe ? "You" : m.userName} · {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className={cn(
                        "p-4 rounded-2xl text-sm leading-relaxed inline-block shadow-sm",
                        isMe ? "bg-[#534AB7] text-white rounded-tr-sm" : "bg-[#2a2a2e] text-[#f0f0f0] rounded-tl-sm"
                      )}>
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex gap-3 animate-in fade-in duration-300">
                  <div className="size-8 rounded-full bg-white/[0.05] grid place-items-center text-[10px] text-[#888888] shrink-0 font-bold">...</div>
                  <div className="bg-[#2a2a2e]/50 text-[#888888] text-[10px] font-bold px-3 py-1.5 rounded-full italic">
                    {isTyping} is typing...
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="p-6 border-t border-[#2a2a2e]">
              <div className="relative">
                <input 
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  className="w-full h-14 pl-5 pr-14 rounded-2xl bg-[#0e0e10] border border-[#2a2a2e] focus:border-[#534AB7] outline-none text-sm transition-all placeholder:text-[#888888]"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="absolute right-2 top-2 size-10 rounded-xl bg-[#534AB7] text-white grid place-items-center shadow-cta disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="size-4" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      {/* ADD SUGGESTION MODAL */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[500px] bg-[#141416] border-[#2a2a2e] rounded-[32px] p-8 text-[#f0f0f0]">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-3xl tracking-tight">New Idea</DialogTitle>
            <DialogDescription className="text-[#888888]">Suggest a place, activity, or food spot for the crew.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] ml-1">Spot Title</label>
              <Input 
                placeholder="e.g. Gateway of India"
                className="h-14 rounded-2xl bg-[#0e0e10] border-[#2a2a2e] focus:border-[#534AB7] text-[#f0f0f0]"
                value={newSuggestion.title}
                onChange={(e) => setNewSuggestion({...newSuggestion, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] ml-1">Description</label>
              <Input 
                placeholder="Why should we go here?"
                className="h-14 rounded-2xl bg-[#0e0e10] border-[#2a2a2e] focus:border-[#534AB7] text-[#f0f0f0]"
                value={newSuggestion.description}
                onChange={(e) => setNewSuggestion({...newSuggestion, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#888888] ml-1">Tags (comma separated)</label>
              <Input 
                placeholder="culture, morning, photo"
                className="h-14 rounded-2xl bg-[#0e0e10] border-[#2a2a2e] focus:border-[#534AB7] text-[#f0f0f0]"
                value={newSuggestion.tags}
                onChange={(e) => setNewSuggestion({...newSuggestion, tags: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="ghost" onClick={() => setShowAddModal(false)} className="h-14 rounded-2xl font-bold text-[#888888] hover:bg-white/[0.05]">Cancel</Button>
            <Button onClick={addSuggestion} className="h-14 rounded-2xl bg-[#534AB7] text-white font-bold shadow-cta">Add to Pool</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
