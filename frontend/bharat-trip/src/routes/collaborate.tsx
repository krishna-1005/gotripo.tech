import { useSearchParams, useNavigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import { Polls } from "@/components/Polls";
import { Checklist } from "@/components/Checklist";
import ExpensePanel from "@/components/collabRoom/ExpensePanel";
import ProactiveAlerts from "@/components/collabRoom/ProactiveAlerts";
import DestinationBoard from "@/components/collabRoom/DestinationBoard";
import ItineraryBuilder from "@/components/collabRoom/ItineraryBuilder";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/components/AuthProvider";
import { 
  Send, 
  Plus, 
  Loader2, 
  Users, 
  MessageSquare, 
  ChevronRight, 
  Globe, 
  MapPin,
  Trash2,
  Calendar,
  Building,
  LayoutDashboard,
  Menu,
  X,
  ArrowLeft
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { auth } from "@/firebase";
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

const COLORS = [
  "bg-warm-gradient",
  "bg-primary",
  "bg-success",
  "bg-accent",
  "bg-foreground",
  "bg-blue-500",
  "bg-purple-500",
  "bg-amber-500"
];

interface Message {
  userName: string;
  text: string;
  createdAt: string;
  userId: string;
}

interface TripRoom {
  _id: string;
  title: string;
  destination: string;
  image?: string;
  members: any[];
  userId: string; // Owner ID
  type?: string;
}

export default function Collaborate() {
  return (
    <ProtectedRoute>
      <Collab />
    </ProtectedRoute>
  );
}

function Collab() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tripId = searchParams.get("tripId");
  const socket = useSocket();
  
  const { mongoUser } = useAuth();
  
  const [rooms, setRooms] = useState<TripRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [currentTrip, setCurrentTrip] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomData, setNewRoomData] = useState({ title: "", destination: "", days: "3" });
  const [creating, setCreating] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeTab, setActiveTab] = useState<'board' | 'chat'>('board');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const user = auth.currentUser;

  const fetchRooms = async () => {
    try {
      const res = await api.get("/trips", { params: { type: "room" } });
      const onlyRooms = res.data.filter((r: any) => r.type === "room");
      setRooms(onlyRooms);
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const createRoom = async () => {
    if (!newRoomData.title || !newRoomData.destination) {
      toast.error("Please fill in the room title and destination");
      return;
    }

    setCreating(true);
    try {
      const res = await api.post("/trips", {
        ...newRoomData,
        days: parseInt(newRoomData.days),
        type: "room",
        itinerary: [] 
      });
      toast.success("Collaboration Room created!");
      setShowCreateModal(false);
      setNewRoomData({ title: "", destination: "", days: "3" });
      fetchRooms();
      navigate(`/collaborate?tripId=${res.data._id}`);
    } catch (err) {
      toast.error("Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const deleteRoom = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this room? This will delete the trip and all its chats/polls.")) return;
    
    try {
      await api.delete(`/trips/${id}`);
      toast.success("Room deleted");
      if (tripId === id) navigate("/collaborate");
      fetchRooms();
    } catch (err) {
      toast.error("Failed to delete room. Only the owner can delete it.");
    }
  };

  const fetchTrip = async () => {
    if (!tripId) return;
    try {
      const res = await api.get(`/trips/${tripId}`);
      setCurrentTrip(res.data);
    } catch (err) {
      console.error("Failed to fetch trip", err);
    }
  };

  const fetchMessages = async () => {
    if (!tripId) return;
    try {
      const res = await api.get(`/group-chat/${tripId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const joinTrip = async () => {
    if (!user || !tripId) return;
    try {
      await api.post(`/trips/${tripId}/join`);
      fetchTrip();
    } catch (err) {
      console.error("Failed to join trip", err);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (tripId) {
      fetchTrip();
      fetchMessages();
      joinTrip();

      if (socket && user) {
        socket.connect();
        socket.emit('join:room', { tripId, userId: user.uid });

        socket.on('message:receive', (msg: Message) => {
          setMessages(prev => [...prev, msg]);
        });

        socket.on('itinerary:aiRegenerated', (newItinerary: any) => {
          setCurrentTrip((prev: any) => prev ? ({ ...prev, itinerary: newItinerary }) : null);
        });

        socket.on('itinerary:updated', (newItinerary: any) => {
          setCurrentTrip((prev: any) => prev ? ({ ...prev, itinerary: newItinerary }) : null);
        });

        return () => {
          socket.emit('leave:room', { tripId, userId: user.uid });
          socket.off('message:receive');
          socket.off('itinerary:aiRegenerated');
          socket.off('itinerary:updated');
        };
      }
    } else {
      setCurrentTrip(null);
      setMessages([]);
    }
  }, [tripId, socket, user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user || sending || !tripId) return;

    setSending(true);
    try {
      // Use socket for real-time messaging
      if (socket) {
        socket.emit('message:send', {
          tripId,
          senderId: user.uid,
          text: newMessage,
          userName: user.displayName || "Traveller",
          initials: (user.displayName || "T")[0].toUpperCase(),
          color: "bg-primary"
        });
      }

      // Also persist to DB via API
      await api.post("/group-chat/send", {
        tripId,
        text: newMessage
      });
      
      setNewMessage("");
    } catch (err: any) {
      toast.error("Failed to send message. Please try again.");
      console.error("Send error:", err.response?.data || err);
    } finally {
      setSending(false);
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden relative">
        {/* Rooms Sidebar - Responsive WhatsApp style */}
        <div className={cn(
          "w-full lg:w-80 border-r border-border bg-card flex flex-col shrink-0 transition-transform duration-300 lg:translate-x-0",
          tripId ? "hidden lg:flex" : "flex w-full"
        )}>
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Users className="size-5 text-primary" /> Collab Rooms
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="p-2 hover:bg-secondary rounded-lg transition-colors text-primary"
                title="Create New Room"
              >
                <Plus className="size-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {loadingRooms ? (
              [1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-2xl bg-secondary/50 animate-pulse" />
              ))
            ) : rooms.length === 0 ? (
              <div className="text-center py-10 px-4">
                <LayoutDashboard className="size-10 text-muted-foreground mx-auto mb-3 opacity-20" />
                <p className="text-sm text-muted-foreground font-medium">No rooms yet</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="text-xs text-primary font-bold mt-2 hover:underline"
                >
                  Create your first room
                </button>
              </div>
            ) : (
              rooms.map((room) => (
                <div key={room._id} className="group relative">
                  <button
                    onClick={() => navigate(`/collaborate?tripId=${room._id}`)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-2xl transition-all",
                      tripId === room._id 
                        ? "bg-primary text-white shadow-cta" 
                        : "hover:bg-secondary border border-transparent"
                    )}
                  >
                    <div className={cn(
                      "size-10 rounded-xl grid place-items-center font-bold text-xs shrink-0 shadow-sm",
                      tripId === room._id ? "bg-white/20" : "bg-warm-gradient text-white"
                    )}>
                      {room.title?.[0] || "?"}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="font-bold text-sm truncate">{room.title}</div>
                      <div className={cn(
                        "text-[10px] uppercase tracking-wider font-semibold truncate opacity-70",
                        tripId === room._id ? "text-white" : "text-muted-foreground"
                      )}>
                        {room.destination}
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "size-4 opacity-0 group-hover:opacity-100 transition-all",
                      tripId === room._id && "opacity-100"
                    )} />
                  </button>
                  
                  <button 
                    onClick={(e) => deleteRoom(e, room._id)}
                    className="absolute right-8 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 hover:bg-destructive hover:text-white transition-all z-10"
                    title="Delete Room"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-border bg-secondary/10">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border shadow-sm">
              <div className="size-8 rounded-full bg-success/20 grid place-items-center">
                <Globe className="size-4 text-success" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Status</div>
                <div className="text-xs font-bold">{rooms.length} Active Crews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Room Content */}
        <div className={cn(
          "flex-1 bg-secondary/10 overflow-hidden flex flex-col",
          !tripId && "hidden lg:flex"
        )}>
          {!tripId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 text-center space-y-6">
              <div className="size-20 lg:size-24 rounded-3xl bg-card border border-border shadow-soft grid place-items-center">
                <MessageSquare className="size-8 lg:size-10 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-2xl lg:text-3xl tracking-tight">Ready to Collaborate?</h1>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto text-sm lg:text-base">
                  Rooms are intentional spaces for your crew. Create a room to start discussing itineraries, voting on destinations, and managing your crew's checklist.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-xs sm:max-w-none">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="h-12 px-8 rounded-xl bg-warm-gradient text-white font-bold shadow-cta hover:opacity-90 transition-opacity"
                >
                  Create New Room
                </button>
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="h-12 px-8 rounded-xl bg-card border border-border font-bold hover:bg-secondary transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Room Header */}
              <div className="h-20 border-b border-border bg-card px-4 lg:px-10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 lg:gap-4 overflow-hidden">
                  <button 
                    onClick={() => navigate("/collaborate")}
                    className="lg:hidden p-2 rounded-lg hover:bg-secondary shrink-0 text-primary"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <div className="size-9 lg:size-10 rounded-xl bg-warm-gradient text-white grid place-items-center font-bold shrink-0">
                    {currentTrip?.title?.[0] || "?"}
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="font-display font-bold text-base lg:text-xl truncate">
                      {currentTrip?.title || "Loading..."}
                    </h1>
                    <div className="flex items-center gap-2 text-[10px] lg:text-xs text-muted-foreground font-medium truncate">
                      <MapPin className="size-3" /> {currentTrip?.destination} · {currentTrip?.members?.length || 1} members
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:gap-3">
                   <div className="flex -space-x-2 hidden md:flex">
                    {currentTrip?.members?.slice(0, 3).map((member: any, i: number) => {
                      const mName = member.userId?.name || member.userName || "Traveller";
                      const mId = member.userId?._id || member.userId;
                      return (
                        <div 
                          key={mId} 
                          className={`size-8 rounded-full ${COLORS[i % COLORS.length]} text-white grid place-items-center font-bold text-[10px] border-2 border-background`} 
                          title={mName}
                        >
                          {mName[0].toUpperCase()}
                        </div>
                      );
                    })}
                    {currentTrip?.members?.length > 3 && (
                      <div className="size-8 rounded-full bg-secondary border-2 border-background grid place-items-center font-bold text-[10px] text-muted-foreground">
                        +{currentTrip.members.length - 3}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={async () => {
                      const shareData = {
                        title: `Join my trip to ${currentTrip?.destination}! | GoTripo`,
                        text: `Hey! Join my collaboration room for our trip to ${currentTrip?.destination} on GoTripo! 🇮🇳✈️`,
                        url: window.location.href,
                      };

                      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                        try {
                          await navigator.share(shareData);
                        } catch (err) {
                          if ((err as Error).name !== 'AbortError') {
                            console.error('Share failed:', err);
                          }
                        }
                      } else {
                        try {
                          await navigator.clipboard.writeText(window.location.href);
                          toast.success("Room link copied! Invite your crew. 📋");
                        } catch (err) {
                          toast.error("Failed to copy link");
                        }
                      }
                    }}
                    className="h-9 lg:h-10 px-3 lg:px-4 rounded-xl bg-primary-soft text-primary font-bold text-[10px] lg:text-xs flex items-center gap-2 hover:bg-primary hover:text-white transition-all shrink-0"
                  >
                    <Plus className="size-3 lg:size-4" /> <span className="hidden sm:inline">Invite</span>
                  </button>
                </div>
              </div>

              {/* Mobile Tab Toggle */}
              <div className="lg:hidden flex border-b border-border bg-card p-1">
                <button 
                  onClick={() => setActiveTab('board')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                    activeTab === 'board' ? "bg-primary text-white shadow-sm" : "text-muted-foreground"
                  )}
                >
                  <LayoutDashboard className="size-3.5" /> Board & Plan
                </button>
                <button 
                  onClick={() => setActiveTab('chat')}
                  className={cn(
                    "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2",
                    activeTab === 'chat' ? "bg-primary text-white shadow-sm" : "text-muted-foreground"
                  )}
                >
                  <MessageSquare className="size-3.5" /> Crew Chat
                </button>
              </div>

              {/* Room Body */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full max-w-7xl mx-auto grid lg:grid-cols-[1fr_380px] gap-8 p-4 lg:p-8 overflow-y-auto lg:overflow-hidden">
                  {/* Left Column: Discussion Features */}
                  <div className={cn(
                    "space-y-8 pb-32 lg:overflow-y-auto pr-0 lg:pr-2",
                    activeTab === 'board' ? "block" : "hidden lg:block"
                  )}>
                  {currentTrip && <ProactiveAlerts tripId={tripId} destination={currentTrip.destination} />}
                  {currentTrip && (
                    <DestinationBoard 
                      tripId={tripId} 
                      isOwner={currentTrip.userId === mongoUser?._id} 
                    />
                  )}
                  {currentTrip && <ItineraryBuilder trip={currentTrip} />}
                  <Checklist tripId={tripId} />
                  <Polls tripId={tripId} />
                  {currentTrip && <ExpensePanel trip={currentTrip} />}
                  </div>
                  {/* Right Column: Chat */}
                  <div className={cn(
                    "rounded-3xl bg-card border border-border shadow-soft flex flex-col h-[500px] lg:h-full sticky top-6 lg:relative lg:top-0 transition-all",
                    activeTab === 'chat' ? "flex h-[calc(100vh-210px)]" : "hidden lg:flex"
                  )}>
                    <div className="p-4 lg:p-5 border-b border-border bg-secondary/20 shrink-0">
                      <div className="font-display font-bold text-base lg:text-lg">Crew chat</div>
                      <div className="text-[10px] lg:text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="size-2 rounded-full bg-success animate-pulse"></span>
                        {messages.length > 0 ? `${new Set(messages.map(m => m.userId)).size} active members` : "Online now"}
                      </div>
                    </div>
                    
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-5 space-y-4 scroll-smooth">
                      {messages.length === 0 && (
                        <div className="text-center py-10 opacity-50 space-y-2">
                          <p className="text-sm">No messages yet.</p>
                          <p className="text-xs italic">"Drop a message to start the brainstorm!"</p>
                        </div>
                      )}
                      {messages.map((m, i) => {
                        const isMe = m.userId === user?.uid;
                        return (
                          <div key={i} className={`flex gap-2 lg:gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div className={`size-7 lg:size-8 rounded-full ${isMe ? 'bg-warm-gradient' : 'bg-primary-soft text-primary'} grid place-items-center text-[10px] lg:text-xs font-bold shrink-0`}>
                              {m.userName?.[0] || "?"}
                            </div>
                            <div className={`flex-1 ${isMe ? 'text-right' : ''}`}>
                              <div className="text-[10px] lg:text-xs text-muted-foreground">
                                <b className="text-foreground">{isMe ? 'You' : m.userName}</b> · {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className={`mt-1 rounded-2xl px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm w-fit shadow-sm inline-block ${
                                isMe 
                                  ? 'bg-primary text-white rounded-tr-sm' 
                                  : 'bg-secondary text-foreground rounded-tl-sm'
                              }`}>
                                {m.text}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <form onSubmit={handleSend} className="p-3 lg:p-4 border-t border-border flex items-center gap-2 shrink-0">
                      <input 
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Message the crew…" 
                        className="flex-1 h-10 lg:h-12 px-4 rounded-xl bg-secondary border border-transparent focus:bg-surface focus:border-ring outline-none text-xs lg:text-sm transition-all" 
                      />
                      <button 
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="size-10 lg:size-12 rounded-xl bg-warm-gradient text-white grid place-items-center shadow-cta hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                      >
                        {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE ROOM MODAL */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[500px] rounded-[32px] p-8">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-3xl tracking-tight">Create Collab Room</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Start an intentional space for your crew to discuss and decide.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Room Title</label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="e.g. Summer Goa Crew"
                  className="pl-11 h-14 rounded-2xl bg-secondary/50 border-transparent focus:bg-background"
                  value={newRoomData.title}
                  onChange={(e) => setNewRoomData({...newRoomData, title: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Destination</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="e.g. Goa, India"
                  className="pl-11 h-14 rounded-2xl bg-secondary/50 border-transparent focus:bg-background"
                  value={newRoomData.destination}
                  onChange={(e) => setNewRoomData({...newRoomData, destination: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Estimated Days</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  type="number"
                  placeholder="3"
                  className="pl-11 h-14 rounded-2xl bg-secondary/50 border-transparent focus:bg-background"
                  value={newRoomData.days}
                  onChange={(e) => setNewRoomData({...newRoomData, days: e.target.value})}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-0">
            <Button 
              variant="ghost" 
              onClick={() => setShowCreateModal(false)}
              className="h-14 px-8 rounded-2xl font-bold"
            >
              Cancel
            </Button>
            <Button 
              onClick={createRoom}
              disabled={creating}
              className="h-14 px-10 rounded-2xl bg-warm-gradient text-white font-bold shadow-cta"
            >
              {creating ? <Loader2 className="size-5 animate-spin mr-2" /> : <Plus className="size-5 mr-2" />}
              Create Room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
