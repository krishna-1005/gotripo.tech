import { useState, useEffect } from "react";
import api from "@/lib/api";
import { auth } from "@/firebase";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Loader2,
  ListTodo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  _id: string;
  text: string;
  isCompleted: boolean;
  assignedTo?: {
    userId: string;
    userName: string;
  };
}

export function Checklist({ tripId }: { tripId: string }) {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const user = auth.currentUser;

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
  }, [tripId]);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim() || adding) return;

    setAdding(true);
    try {
      const res = await api.post(`/trips/${tripId}/checklist`, { text: newItemText });
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
    <div className="rounded-3xl bg-card border border-border p-4 md:p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-9 md:size-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
          <ListTodo className="size-5" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg md:text-xl">Crew Checklist</h2>
          <p className="text-[10px] md:text-xs text-muted-foreground">Coordinate who's bringing what</p>
        </div>
      </div>

      <form onSubmit={addItem} className="flex gap-2 mb-6">
        <Input 
          placeholder="Add something to the list..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          className="rounded-xl bg-secondary/50 border-transparent focus:bg-background text-sm"
        />
        <Button 
          disabled={adding || !newItemText.trim()}
          className="rounded-xl bg-warm-gradient text-white shadow-cta aspect-square p-0 shrink-0 w-11"
        >
          {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-5" />}
        </Button>
      </form>

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-8 px-4 border-2 border-dashed border-border rounded-2xl bg-secondary/5">
            <p className="text-sm text-muted-foreground">Your checklist is empty.</p>
            <p className="text-xs text-muted-foreground/60 mt-1 italic">"Sunscreen, power banks, snacks..."</p>
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item._id}
              className={cn(
                "group flex items-center justify-between p-3 rounded-2xl border transition-all duration-300",
                item.isCompleted ? "bg-secondary/20 border-transparent" : "bg-card border-border hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <button 
                  onClick={() => toggleItem(item._id)}
                  className={cn(
                    "transition-transform active:scale-90 shrink-0",
                    item.isCompleted ? "text-success" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {item.isCompleted ? <CheckCircle2 className="size-5 md:size-6" /> : <Circle className="size-5 md:size-6" />}
                </button>
                <div className="flex flex-col overflow-hidden">
                  <span className={cn(
                    "text-xs md:text-sm font-medium transition-all truncate",
                    item.isCompleted && "line-through text-muted-foreground"
                  )}>
                    {item.text}
                  </span>
                  {item.assignedTo && (
                    <span className="text-[9px] md:text-[10px] font-bold text-accent uppercase tracking-wider">
                      Done by {item.assignedTo.userName}
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

      {items.length > 0 && (
        <div className="mt-6 pt-4 border-t border-dashed border-border flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            {items.filter(i => i.isCompleted).length} / {items.length} COMPLETED
          </span>
          <div className="h-1.5 flex-1 mx-4 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-success transition-all duration-1000"
              style={{ width: `${(items.filter(i => i.isCompleted).length / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
