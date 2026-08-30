import { useState, useEffect } from "react";
import api from "@/lib/api";
import { auth } from "@/firebase";
import { 
  Check, 
  Plus, 
  Users, 
  Calendar, 
  MapPin, 
  Loader2, 
  Trophy,
  ArrowRight
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"; // Verified import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PollOption {
  name: string;
  votes: number;
  city?: string;
  tags?: string[];
  vibe?: string;
}

interface Voter {
  userId: string;
  name: string;
  votedAt: string;
}

interface Poll {
  pollId: string;
  tripName: string;
  totalMembers: number;
  options: PollOption[];
  isClosed: boolean;
  winner?: string;
  voters: Voter[];
}

export function Polls({ tripId }: { tripId?: string }) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const fetchPolls = async () => {
    try {
      // Fetch polls filtered by tripId
      const res = await api.get("/polls/list", { 
        params: { tripId } 
      }).catch(() => ({ data: [] })); 
      setPolls(res.data);
    } catch (err) {
      console.error("Failed to fetch polls", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [tripId]);

  if (loading && polls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 md:p-12 space-y-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-display text-sm md:text-base">Syncing with your crew...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display font-bold text-xl md:text-2xl">Active Polls</h2>
        <CreatePollDialog onCreated={fetchPolls} />
      </div>

      {polls.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border p-6 md:p-12 text-center space-y-6 bg-secondary/10">
          <div className="size-16 md:size-20 rounded-full bg-secondary grid place-items-center mx-auto shadow-inner">
            <Users className="size-8 md:size-10 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-display font-bold text-xl md:text-2xl tracking-tight">Your crew hasn't started any polls yet</h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Start a poll to decide your next destination or share this page with friends to get them involved!</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <CreatePollDialog tripId={tripId} onCreated={fetchPolls} trigger={<Button className="w-full sm:w-auto rounded-xl bg-warm-gradient text-white shadow-cta h-11 px-8">Start First Poll</Button>} />
            <Button 
              variant="outline" 
              className="w-full sm:w-auto rounded-xl h-11 px-8"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Collaboration link copied! Send it to your crew.");
              }}
            >
              Invite Crew
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {polls.map((poll) => (
            <PollCard key={poll.pollId} poll={poll} onVote={fetchPolls} />
          ))}
        </div>
      )}
    </div>
  );
}

function PollCard({ poll, onVote }: { poll: Poll; onVote: () => void }) {
  const [voting, setVoting] = useState(false);
  const user = auth.currentUser;
  const hasVoted = poll.voters.some(v => v.userId === user?.uid);
  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
  
  const handleVote = async (optionName: string) => {
    if (!user) {
      toast.error("Please sign in to vote");
      return;
    }
    if (hasVoted || poll.isClosed) return;

    setVoting(true);
    try {
      await api.post("/polls/vote", {
        pollId: poll.pollId,
        optionName,
        userId: user.uid,
        userName: user.displayName || "Traveller"
      });
      toast.success(`Vote for ${optionName} recorded!`);
      onVote();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to vote");
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className={cn(
      "rounded-3xl bg-card border border-border p-4 md:p-6 shadow-soft transition-all duration-500",
      poll.isClosed ? "ring-2 ring-accent/20 bg-accent/5" : "hover:border-primary/30"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "size-10 md:size-12 rounded-2xl grid place-items-center shadow-cta shrink-0",
            poll.isClosed ? "bg-accent text-white" : "bg-warm-gradient text-white"
          )}>
            {poll.isClosed ? <Trophy className="size-5 md:size-6" /> : <MapPin className="size-5 md:size-6" />}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg md:text-xl line-clamp-1">{poll.tripName}</h3>
            <div className="flex items-center gap-3 text-[10px] md:text-xs text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1"><Users className="size-3" /> {totalVotes}/{poll.totalMembers} VOTES</span>
              {poll.isClosed && <span className="text-accent flex items-center gap-1"><Check className="size-3" /> FINALIZED</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {poll.options.map((opt) => {
          const percentage = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
          const isWinner = poll.isClosed && opt.name === poll.winner;
          const myVote = poll.voters.find(v => v.userId === user?.uid)?.name === opt.name; // This logic might need refinement based on exact voter tracking

          return (
            <button
              key={opt.name}
              disabled={hasVoted || poll.isClosed || voting}
              onClick={() => handleVote(opt.name)}
              className={cn(
                "w-full text-left relative overflow-hidden rounded-2xl border transition-all duration-300 group",
                isWinner ? "border-accent bg-accent/10" : "border-border hover:border-primary/50 bg-secondary/30",
                (hasVoted || poll.isClosed) && "cursor-default"
              )}
            >
              {/* Progress Bar Background */}
              <div 
                className={cn(
                  "absolute inset-y-0 left-0 transition-all duration-1000 ease-out",
                  isWinner ? "bg-accent/20" : "bg-primary/10"
                )}
                style={{ width: `${percentage}%` }}
              />

              <div className="relative p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "size-5 rounded-full border-2 flex items-center justify-center transition-colors",
                    isWinner ? "border-accent bg-accent text-white" : "border-muted-foreground group-hover:border-primary"
                  )}>
                    {(isWinner || myVote) && <Check className="size-3" strokeWidth={4} />}
                  </div>
                  <span className="font-bold font-display">{opt.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold">{Math.round(percentage)}%</span>
                  <span className="text-[10px] text-muted-foreground font-semibold px-2 py-0.5 rounded-full bg-background/50 border border-border">
                    {opt.votes} {opt.votes === 1 ? 'VOTE' : 'VOTES'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-dashed border-border flex items-center justify-between">
        <div className="flex -space-x-2">
          {poll.voters.slice(0, 5).map((v, i) => (
            <div 
              key={i} 
              title={v.name}
              className="size-8 rounded-full bg-warm-gradient border-2 border-card flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
            >
              {v.name[0]}
            </div>
          ))}
          {poll.voters.length > 5 && (
            <div className="size-8 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-[10px] font-bold text-muted-foreground">
              +{poll.voters.length - 5}
            </div>
          )}
        </div>
        {!poll.isClosed && !hasVoted && (
          <p className="text-[11px] font-bold text-primary animate-pulse flex items-center gap-1">
            Waiting for your vote <ArrowRight className="size-3" />
          </p>
        )}
      </div>
    </div>
  );
}

function CreatePollDialog({ tripId, onCreated, trigger }: { tripId?: string; onCreated: () => void; trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tripName, setTripName] = useState("");
  const [totalMembers, setTotalMembers] = useState("5");
  const [options, setOptions] = useState(["", ""]);

  const handleCreate = async () => {
    if (!tripName || options.some(o => !o)) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await api.post("/polls/create", {
        tripName,
        totalMembers: parseInt(totalMembers),
        options,
        tripId,
        userId: auth.currentUser?.uid
      });
      toast.success("Poll created successfully!");
      setOpen(false);
      onCreated();
      // Reset form
      setTripName("");
      setOptions(["", ""]);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  const addOption = () => setOptions([...options, ""]);
  const updateOption = (i: number, val: string) => {
    const newOpts = [...options];
    newOpts[i] = val;
    setOptions(newOpts);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="rounded-xl bg-warm-gradient text-white shadow-cta hover:opacity-90">
            <Plus className="size-4 mr-2" /> New Poll
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-3xl max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Start a Crew Poll</DialogTitle>
          <DialogDescription>
            Decide your next adventure with your crew. Everyone's vote counts!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tripName">What are we deciding?</Label>
            <Input 
              id="tripName" 
              placeholder="e.g. Summer Destination 2024" 
              value={tripName}
              onChange={e => setTripName(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="members">Group Size</Label>
            <Input 
              id="members" 
              type="number" 
              value={totalMembers}
              onChange={e => setTotalMembers(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-3">
            <Label>Options</Label>
            {options.map((opt, i) => (
              <Input 
                key={i}
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={e => updateOption(i, e.target.value)}
                className="rounded-xl"
              />
            ))}
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={addOption}
              className="text-primary hover:text-primary hover:bg-primary-soft rounded-lg"
            >
              <Plus className="size-4 mr-1" /> Add more
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button 
            disabled={loading} 
            onClick={handleCreate}
            className="w-full rounded-xl bg-warm-gradient text-white shadow-cta h-12 text-lg font-bold"
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : "Launch Poll"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
