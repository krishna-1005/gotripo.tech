import { useState, useEffect } from "react";
import api from "@/lib/api";
import { auth } from "@/firebase";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Loader2,
  ListTodo,
  Tag,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSocket } from "@/context/SocketContext";

interface ChecklistItem {
  _id: string;
  text: string;
  isCompleted: boolean;
  category?: string;
  assignedTo?: {
    userId: string;
    userName: string;
  };
}

const CATEGORIES = ["General", "Documents", "Electronics", "First Aid", "Snacks"];

export function Checklist({ tripId }: { tripId: string }) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("General");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const user = auth.currentUser;
  const socket = useSocket();

  const fetchChecklist = async () => {
    try {
      const res = await api.get(`/trips/${tripId}`);
      setItems(res.data.checklist || []);
    } catch (err) {
      console.error("Failed to fetch checklist", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklist();

    if (socket) {
      socket.on("checklist:updated", (updatedChecklist: ChecklistItem[]) => {
        setItems(updatedChecklist);
      });
      return () => {
        socket.off("checklist:updated");
      };
    }
  }, [tripId, socket]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim() || adding) return;

    setAdding(true);
    try {
      const res = await api.post(`/trips/${tripId}/checklist`, { 
        text: newItemText,
        category: selectedCategory 
      });
      setItems(res.data);
      setNewItemText("");
      toast.success("Item added to crew checklist");
    } catch (err) {
      toast.error("Failed to add item");
    } finally {
      setAdding(false);
    }
  };

  const toggleItem = async (itemId: string) => {
    try {
      const res = await api.patch(`/trips/${tripId}/checklist/${itemId}`);
      setItems(res.data);
    } catch (err) {
      toast.error("Failed to update item");
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      const res = await api.delete(`/trips/${tripId}/checklist/${itemId}`);
      setItems(res.data);
      toast.success("Item removed");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 md:p-8 space-y-3">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground font-display uppercase tracking-widest">Loading checklist...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-card border border-border p-4 md:p-6 shadow-soft space-y-6">
      <div className="flex items-center gap-3">
        <div className="size-9 md:size-10 rounded-xl bg-[#1d9e75]/10 text-[#1d9e75] grid place-items-center shrink-0">
          <ListTodo className="size-5" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg md:text-xl">Crew Duty Checklist</h2>
          <p className="text-[10px] md:text-xs text-muted-foreground">Coordinate who's bringing what with live progress</p>
        </div>
      </div>

      {/* ADD ITEM FORM & CATEGORY TAGS */}
      <form onSubmit={addItem} className="space-y-3">
        <div className="flex gap-2">
          <Input 
            placeholder="Add something to the crew list..."
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            className="rounded-xl bg-secondary/50 border-transparent focus:bg-background text-sm"
          />
          <Button 
            disabled={adding || !newItemText.trim()}
            className="rounded-xl bg-[#1d9e75] text-white shadow-cta aspect-square p-0 shrink-0 w-11 hover:bg-[#1d9e75]/90"
          >
            {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-5" />}
          </Button>
        </div>

        {/* CATEGORY TAG SELECTOR */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Tag className="size-3" /> Tag:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border shrink-0",
                selectedCategory === cat
                  ? "bg-[#1d9e75] text-white border-[#1d9e75]"
                  : "bg-secondary/40 text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </form>

      {/* CHECKLIST ITEMS */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8 px-4 border-2 border-dashed border-border rounded-2xl bg-secondary/5">
            <p className="text-sm text-muted-foreground">Your checklist is empty.</p>
            <p className="text-xs text-muted-foreground/60 mt-1 italic">"Sunscreen, power banks, snacks, first aid..."</p>
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item._id}
              className={cn(
                "group flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 gap-3",
                item.isCompleted ? "bg-[#1d9e75]/5 border-[#1d9e75]/20" : "bg-card border-border hover:border-[#1d9e75]/40"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <button 
                  onClick={() => toggleItem(item._id)}
                  className={cn(
                    "transition-transform active:scale-90 shrink-0",
                    item.isCompleted ? "text-[#1d9e75]" : "text-muted-foreground hover:text-[#1d9e75]"
                  )}
                >
                  {item.isCompleted ? <CheckCircle2 className="size-5 md:size-6 text-[#1d9e75]" /> : <Circle className="size-5 md:size-6" />}
                </button>
                <div className="flex flex-col overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs md:text-sm font-medium transition-all truncate",
                      item.isCompleted && "line-through text-muted-foreground"
                    )}>
                      {item.text}
                    </span>
                    {item.category && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground font-bold uppercase tracking-wider shrink-0">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {item.assignedTo && (
                    <span className="text-[9px] md:text-[10px] font-bold text-[#1d9e75] uppercase tracking-wider flex items-center gap-1 mt-0.5">
                      <UserCheck className="size-3" /> Packed by {item.assignedTo.userName}
                    </span>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => deleteItem(item._id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive transition-all shrink-0"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* PROGRESS BAR */}
      {items.length > 0 && (
        <div className="mt-6 pt-4 border-t border-dashed border-border flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            {items.filter(i => i.isCompleted).length} / {items.length} COMPLETED ({Math.round((items.filter(i => i.isCompleted).length / items.length) * 100)}%)
          </span>
          <div className="h-2 flex-1 mx-4 bg-secondary rounded-full overflow-hidden border border-border">
            <div 
              className="h-full bg-[#1d9e75] transition-all duration-1000"
              style={{ width: `${(items.filter(i => i.isCompleted).length / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
