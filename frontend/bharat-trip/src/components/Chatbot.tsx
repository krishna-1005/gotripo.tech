import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Loader2, 
  User, 
  Bot,
  Map,
  ChevronRight,
  Maximize2,
  Minimize2
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import api from "@/lib/api";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "plan";
  planData?: any;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const greeting: Message = {
    role: "assistant",
    content: `Namaste${user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}! I'm your GoTripo AI Co-pilot. Ready to explore the vibrant colors of India? Tell me where you want to go or what kind of vibe you're looking for!`
  };

  useEffect(() => {
    if (location.pathname === "/results") {
      setIsMinimized(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([greeting]);
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await api.post("/chat", {
        message: input,
        history: messages.map(m => ({ role: m.role, content: m.content }))
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.reply,
        type: response.data.type,
        planData: response.data.planData
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error("Failed to connect to co-pilot");
      console.error(error);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Toggle chatbot"
        className="fixed bottom-8 right-8 z-[100] size-16 rounded-full bg-[#10b981] text-white shadow-[0_15px_30px_-10px_rgba(16,185,129,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
      >
        <div className="absolute top-1 right-1 size-4 bg-[#10b981] rounded-full border-[3px] border-white animate-pulse" />
        <MessageSquare className="size-7 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div className={`fixed z-[100] w-[380px] max-w-[calc(100vw-32px)] bg-card border border-border rounded-[2rem] shadow-pop overflow-hidden transition-all flex flex-col 
      bottom-6 md:right-6 right-1/2 translate-x-1/2 md:translate-x-0
      ${isMinimized ? 'h-20' : 'h-[600px] max-h-[calc(100vh-120px)]'}`}>
      {/* Header */}
      <div className="p-5 flex items-center justify-between border-b border-border bg-secondary/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-warm-gradient grid place-items-center shadow-soft">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-foreground leading-none">AI Co-pilot</div>
            <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
               <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> ONLINE
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsMinimized(!isMinimized)} className="size-8 rounded-lg hover:bg-secondary grid place-items-center text-muted-foreground hover:text-foreground transition">
            {isMinimized ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
          </button>
          <button onClick={() => setIsOpen(false)} className="size-8 rounded-lg hover:bg-secondary grid place-items-center text-muted-foreground hover:text-foreground transition">
            <X className="size-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-background/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start animate-in slide-in-from-bottom-2 duration-300"}`}>
                <div className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`size-8 rounded-xl shrink-0 grid place-items-center ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary border border-border text-primary"}`}>
                    {m.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                  </div>
                  <div className="space-y-3">
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${m.role === "user" ? "bg-primary text-primary-foreground font-medium rounded-tr-none" : "bg-secondary border border-border text-foreground rounded-tl-none"}`}>
                      {m.content}
                    </div>

                    {m.type === "plan" && m.planData && (
                      <div className="bg-emerald-500 rounded-3xl p-5 text-white shadow-soft animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="size-8 rounded-xl bg-white/20 grid place-items-center">
                              <Map className="size-4" />
                           </div>
                           <div className="text-[10px] font-black uppercase tracking-widest">Plan Generated</div>
                        </div>
                        <p className="text-sm font-medium mb-4">I've created a custom itinerary for **{m.planData.city}**.</p>
                        <button 
                          onClick={() => {
                            if (!user) {
                              toast.info("Please sign in to view your full itinerary");
                              navigate(`/auth?redirect=/results?planId=${m.planData.id}`);
                            } else {
                              navigate(`/results?planId=${m.planData.id}`);
                            }
                          }}
                          className="w-full h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all shadow-cta"
                        >
                          Open Itinerary <ChevronRight className="size-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-secondary border border-border p-3 rounded-2xl flex gap-1">
                   <div className="size-1.5 rounded-full bg-primary/40 animate-bounce" />
                   <div className="size-1.5 rounded-full bg-primary/40 animate-bounce delay-75" />
                   <div className="size-1.5 rounded-full bg-primary/40 animate-bounce delay-150" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <div className="p-5 border-t border-border bg-secondary/20">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                className="w-full h-12 pl-5 pr-14 rounded-2xl bg-background border border-border text-foreground text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-1.5 size-9 rounded-xl bg-primary text-primary-foreground grid place-items-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-cta"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground/60 text-center mt-3 uppercase tracking-widest font-bold">
              Powered by GoTripo Intelligence
            </p>
          </div>
        </>
      )}
    </div>
  );
}
