import React, { useState, useEffect } from "react";
import { format, differenceInDays } from "date-fns";
import { 
  Check, 
  X, 
  HelpCircle, 
  Lock, 
  Calendar as CalendarIcon, 
  Plus, 
  Users,
  Trophy,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { fetchAvailability, addAvailabilityOptions, voteAvailability, lockAvailabilityDates } from "@/lib/api";
import { useSocket } from "@/context/SocketContext";

interface Vote {
  userId: string | null;
  name: string;
  available: 'yes' | 'maybe' | 'no';
}

interface DateOption {
  id: string;
  startDate: string;
  endDate: string;
  duration: number;
  votes: Vote[];
}

interface AvailabilityPoll {
  status: 'open' | 'closed';
  dateOptions: DateOption[];
  finalDates?: {
    startDate: string;
    endDate: string;
  };
}

interface AvailabilityMatcherProps {
  tripId: string;
  isOrganizer: boolean;
  currentUser: {
    uid: string;
    displayName: string;
    photoURL?: string;
  } | null;
  members: any[];
}

const AvailabilityMatcher: React.FC<AvailabilityMatcherProps> = ({ 
  tripId, 
  isOrganizer, 
  currentUser,
  members 
}) => {
  const [poll, setPoll] = useState<AvailabilityPoll | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddingOptions, setIsAddingOptions] = useState(false);
  const [newOptions, setNewOptions] = useState([{ startDate: "", endDate: "" }]);
  const socket = useSocket();

  const colors = {
    yes: "#1D9E75",
    maybe: "#BA7517",
    no: "#993C1D"
  };

  useEffect(() => {
    loadPoll();
  }, [tripId]);

  useEffect(() => {
    if (!socket) return;

    socket.on("availability:updated", (updatedPoll: AvailabilityPoll) => {
      setPoll(updatedPoll);
    });

    socket.on("availability:voted", ({ dateOptionId, vote }: any) => {
      // Local update for immediate feedback if needed, 
      // but updatedPoll event usually follows
    });

    socket.on("availability:allVoted", ({ message }: any) => {
      toast.info(message, {
        description: "Review the options and lock the best dates.",
        duration: 5000,
      });
    });

    socket.on("availability:locked", ({ startDate, endDate }: any) => {
      toast.success("Dates have been locked!");
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [colors.yes, colors.maybe, '#ffffff']
      });
      loadPoll();
    });

    return () => {
      socket.off("availability:updated");
      socket.off("availability:voted");
      socket.off("availability:locked");
    };
  }, [socket]);

  const loadPoll = async () => {
    try {
      const data = await fetchAvailability(tripId);
      setPoll(data);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (dateOptionId: string, available: 'yes' | 'maybe' | 'no') => {
    if (!currentUser && !localStorage.getItem(`gotripo_guest_name_${tripId}`)) {
      const guestName = prompt("Please enter your name to vote:");
      if (!guestName) return;
      localStorage.setItem(`gotripo_guest_name_${tripId}`, guestName);
    }

    const guestName = localStorage.getItem(`gotripo_guest_name_${tripId}`);

    try {
      await voteAvailability(tripId, {
        dateOptionId,
        available,
        userId: currentUser?.uid,
        name: currentUser?.displayName || guestName || "Guest"
      });
      toast.success("Vote recorded!");
    } catch (error) {
      toast.error("Failed to vote");
    }
  };

  const handleAddOptions = async () => {
    try {
      const optionsWithDuration = newOptions.map(opt => ({
        ...opt,
        duration: differenceInDays(new Date(opt.endDate), new Date(opt.startDate)) + 1
      }));
      await addAvailabilityOptions(tripId, optionsWithDuration);
      setIsAddingOptions(false);
      toast.success("Options added!");
    } catch (error) {
      toast.error("Failed to add options");
    }
  };

  const handleLockDates = async (option: DateOption) => {
    try {
      await lockAvailabilityDates(tripId, {
        startDate: new Date(option.startDate),
        endDate: new Date(option.endDate)
      });
    } catch (error) {
      toast.error("Failed to lock dates");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );

  const getBestMatch = () => {
    if (!poll?.dateOptions.length) return null;
    return [...poll.dateOptions].sort((a, b) => {
      const aYes = a.votes.filter(v => v.available === 'yes').length;
      const bYes = b.votes.filter(v => v.available === 'yes').length;
      return bYes - aYes;
    })[0];
  };

  const bestMatch = getBestMatch();

  const hasVoted = (option: DateOption) => {
    const guestName = localStorage.getItem(`gotripo_guest_name_${tripId}`);
    return option.votes.find(v => (currentUser && v.userId === currentUser.uid) || (guestName && v.name === guestName));
  };

  const getMemberStatus = () => {
    return members.map(member => {
      const voted = poll?.dateOptions.some(opt => opt.votes.some(v => v.userId === member.userId));
      return { ...member, voted };
    });
  };

  const memberStatus = getMemberStatus();

  return (
    <div className="space-y-6 text-white bg-[#0e0e10] p-6 rounded-xl border border-white/10 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            When can everyone go?
          </h2>
          <p className="text-white/40 text-sm">Vote on the dates that work best for you.</p>
        </div>
        
        <div className="flex -space-x-2">
          {memberStatus.map((m, i) => (
            <div key={i} className="relative">
              <Avatar className="w-8 h-8 border-2 border-[#0e0e10]">
                <AvatarImage src={m.photoURL} />
                <AvatarFallback className="bg-white/10 text-[10px]">{m.userName?.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              {m.voted && (
                <div className="absolute -bottom-1 -right-1 bg-[#1D9E75] rounded-full p-0.5 border border-[#0e0e10]">
                  <Check className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {poll?.status === 'closed' ? (
        <Card className="bg-[#1D9E75]/10 border-[#1D9E75]/30 p-6 text-center">
          <Badge variant="outline" className="mb-2 bg-[#1D9E75]/20 text-[#1D9E75] border-[#1D9E75]/30">
            Dates Locked
          </Badge>
          <h3 className="text-2xl font-bold text-white mb-1">
            {poll.finalDates && format(new Date(poll.finalDates.startDate), "MMM d")} – {poll.finalDates && format(new Date(poll.finalDates.endDate), "MMM d, yyyy")}
          </h3>
          <p className="text-white/60">The trip dates have been finalized! Pack your bags.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {poll?.dateOptions.map((option) => {
            const yesCount = option.votes.filter(v => v.available === 'yes').length;
            const maybeCount = option.votes.filter(v => v.available === 'maybe').length;
            const noCount = option.votes.filter(v => v.available === 'no').length;
            const totalVotes = yesCount + maybeCount + noCount;
            const userVote = hasVoted(option);

            return (
              <Card 
                key={option.id} 
                className={cn(
                  "bg-white/5 border-white/10 p-4 transition-all hover:bg-white/[0.07]",
                  bestMatch?.id === option.id && totalVotes > 0 && "border-[#1D9E75]/50 ring-1 ring-[#1D9E75]/20 shadow-[0_0_20px_rgba(29,158,117,0.1)]"
                )}
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-lg">
                      <CalendarIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white">
                          {format(new Date(option.startDate), "MMM d")} – {format(new Date(option.endDate), "MMM d")}
                        </h3>
                        {bestMatch?.id === option.id && totalVotes > 0 && (
                          <Badge className="bg-[#1D9E75] hover:bg-[#1D9E75] text-white text-[10px] px-1.5 py-0">
                            <Trophy className="w-3 h-3 mr-1" /> Best Match
                          </Badge>
                        )}
                      </div>
                      <p className="text-white/40 text-sm">{option.duration} days</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm"
                      variant="outline"
                      className={cn(
                        "h-9 border-white/10 bg-white/5 hover:bg-[#1D9E75] hover:text-white transition-colors",
                        userVote?.available === 'yes' && "bg-[#1D9E75] border-[#1D9E75] text-white"
                      )}
                      onClick={() => handleVote(option.id, 'yes')}
                    >
                      <Check className="w-4 h-4 mr-1.5" /> Yes
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className={cn(
                        "h-9 border-white/10 bg-white/5 hover:bg-[#BA7517] hover:text-white transition-colors",
                        userVote?.available === 'maybe' && "bg-[#BA7517] border-[#BA7517] text-white"
                      )}
                      onClick={() => handleVote(option.id, 'maybe')}
                    >
                      <HelpCircle className="w-4 h-4 mr-1.5" /> Maybe
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      className={cn(
                        "h-9 border-white/10 bg-white/5 hover:bg-[#993C1D] hover:text-white transition-colors",
                        userVote?.available === 'no' && "bg-[#993C1D] border-[#993C1D] text-white"
                      )}
                      onClick={() => handleVote(option.id, 'no')}
                    >
                      <X className="w-4 h-4 mr-1.5" /> No
                    </Button>
                  </div>
                </div>

                {/* Vote Summary Bar */}
                {totalVotes > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-[#1D9E75]" 
                        style={{ width: `${(yesCount / totalVotes) * 100}%` }} 
                      />
                      <div 
                        className="h-full bg-[#BA7517]" 
                        style={{ width: `${(maybeCount / totalVotes) * 100}%` }} 
                      />
                      <div 
                        className="h-full bg-[#993C1D]" 
                        style={{ width: `${(noCount / totalVotes) * 100}%` }} 
                      />
                    </div>

                    <div className="flex flex-wrap gap-6">
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Available</span>
                        <div className="flex -space-x-1.5">
                          {option.votes.filter(v => v.available === 'yes').map((v, i) => (
                            <Avatar key={i} className="w-6 h-6 border border-[#0e0e10] ring-1 ring-[#1D9E75]/30">
                              <AvatarFallback className="bg-[#1D9E75]/20 text-[#1D9E75] text-[8px] font-bold">
                                {v.name?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {yesCount === 0 && <span className="text-white/20 text-xs">—</span>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Maybe</span>
                        <div className="flex -space-x-1.5">
                          {option.votes.filter(v => v.available === 'maybe').map((v, i) => (
                            <Avatar key={i} className="w-6 h-6 border border-[#0e0e10] ring-1 ring-[#BA7517]/30">
                              <AvatarFallback className="bg-[#BA7517]/20 text-[#BA7517] text-[8px] font-bold">
                                {v.name?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {maybeCount === 0 && <span className="text-white/20 text-xs">—</span>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider text-white/30 font-medium">Unavailable</span>
                        <div className="flex -space-x-1.5">
                          {option.votes.filter(v => v.available === 'no').map((v, i) => (
                            <Avatar key={i} className="w-6 h-6 border border-[#0e0e10] ring-1 ring-[#993C1D]/30">
                              <AvatarFallback className="bg-[#993C1D]/20 text-[#993C1D] text-[8px] font-bold">
                                {v.name?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {noCount === 0 && <span className="text-white/20 text-xs">—</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isOrganizer && (
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-white/40 hover:text-white hover:bg-white/5"
                      onClick={() => handleLockDates(option)}
                    >
                      <Lock className="w-3.5 h-3.5 mr-2" /> Lock These Dates
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}

          {!poll?.dateOptions.length && !isAddingOptions && (
            <div className="text-center py-12 border-2 border-dashed border-white/10 rounded-xl">
              <CalendarIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white/60">No date options yet</h3>
              {isOrganizer && (
                <Button 
                  onClick={() => setIsAddingOptions(true)} 
                  className="mt-4 bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Date Options
                </Button>
              )}
            </div>
          )}

          {isOrganizer && poll?.dateOptions.length > 0 && (
             <Button 
                variant="outline"
                onClick={() => setIsAddingOptions(true)} 
                className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Suggest More Dates
              </Button>
          )}
        </div>
      )}

      {/* Add Options Dialog */}
      <Dialog open={isAddingOptions} onOpenChange={setIsAddingOptions}>
        <DialogContent className="bg-[#0e0e10] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Suggest Date Options</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {newOptions.map((opt, i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-white/40">Start Date</label>
                  <Input 
                    type="date" 
                    className="bg-white/5 border-white/10 text-white" 
                    value={opt.startDate}
                    onChange={(e) => {
                      const updated = [...newOptions];
                      updated[i].startDate = e.target.value;
                      setNewOptions(updated);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-white/40">End Date</label>
                  <Input 
                    type="date" 
                    className="bg-white/5 border-white/10 text-white" 
                    value={opt.endDate}
                    onChange={(e) => {
                      const updated = [...newOptions];
                      updated[i].endDate = e.target.value;
                      setNewOptions(updated);
                    }}
                  />
                </div>
              </div>
            ))}
            <Button 
              variant="ghost" 
              className="w-full text-white/40 hover:text-white"
              onClick={() => setNewOptions([...newOptions, { startDate: "", endDate: "" }])}
            >
              <Plus className="w-4 h-4 mr-2" /> Add another range
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingOptions(false)} className="border-white/10 bg-transparent text-white">
              Cancel
            </Button>
            <Button onClick={handleAddOptions} className="bg-primary hover:bg-primary/90 text-white">
              Save Options
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvailabilityMatcher;
