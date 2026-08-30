import React, { useState } from "react";
import { 
  Navigation, 
  CheckCircle2, 
  Circle, 
  MapPin, 
  Clock, 
  Star, 
  MessageSquare, 
  Send, 
  ChevronLeft, 
  ChevronRight,
  Compass,
  Sparkles,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";

interface GuideMePanelProps {
  tripId: string;
  itinerary: any[];
  user: any;
  socket: any;
  onActivityUpdate?: () => void;
}

export const GuideMePanel: React.FC<GuideMePanelProps> = ({
  tripId,
  itinerary = [],
  user,
  socket,
  onActivityUpdate
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [selectedActIdx, setSelectedActIdx] = useState<number>(0);
  const [newNoteText, setNewNoteText] = useState("");
  const [noteRating, setNoteRating] = useState(5);
  const [submittingNote, setSubmittingNote] = useState(false);

  const currentDay = itinerary[selectedDayIdx];
  const activities = currentDay?.activities || currentDay?.places || [];
  const currentActivity = activities[selectedActIdx];

  // Calculate total visited count across itinerary
  let totalSpots = 0;
  let visitedSpots = 0;

  itinerary.forEach((day) => {
    const acts = day.activities || day.places || [];
    acts.forEach((act: any) => {
      totalSpots++;
      if (act.isVisited) visitedSpots++;
    });
  });

  const progressPercent = totalSpots > 0 ? Math.round((visitedSpots / totalSpots) * 100) : 0;

  const handleToggleVisited = async (act: any, actIdx: number) => {
    if (!act || !act._id) return;
    const nextVisited = !act.isVisited;

    try {
      // Optimistic update
      act.isVisited = nextVisited;
      
      const res = await api.patch(
        `/trips/${tripId}/itinerary/day/${selectedDayIdx}/activity/${act._id}/visited`,
        { isVisited: nextVisited }
      );

      if (socket) {
        socket.emit("activity:visitedToggle", {
          tripId,
          dayIndex: selectedDayIdx,
          activityId: act._id,
          isVisited: nextVisited,
          visitedBy: res.data.visitedBy
        });
      }

      toast.success(nextVisited ? "Spot checked off as visited! 🎉" : "Marked as unvisited");
      if (onActivityUpdate) onActivityUpdate();
    } catch (err) {
      toast.error("Failed to update visited status");
    }
  };

  const handleAddGuideNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !currentActivity?._id) return;

    setSubmittingNote(true);
    try {
      const res = await api.post(
        `/trips/${tripId}/itinerary/day/${selectedDayIdx}/activity/${currentActivity._id}/guide-notes`,
        { text: newNoteText, rating: noteRating }
      );

      if (socket) {
        socket.emit("guideme:note", {
          tripId,
          dayIndex: selectedDayIdx,
          activityId: currentActivity._id,
          note: res.data
        });
      }

      if (!currentActivity.guideNotes) currentActivity.guideNotes = [];
      currentActivity.guideNotes.push(res.data);

      setNewNoteText("");
      toast.success("Note added!");
      if (onActivityUpdate) onActivityUpdate();
    } catch (err) {
      toast.error("Failed to add note");
    } finally {
      setSubmittingNote(false);
    }
  };

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="p-8 text-center text-[#8b949e]">
        <Compass className="size-10 mx-auto mb-3 opacity-30 animate-spin" />
        <p className="text-sm font-medium">No itinerary steps available for Guide Me mode.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#e6edf3]">
      {/* GUIDE ME HEADER & PROGRESS BAR */}
      <div className="p-5 border-b border-[#30363d] bg-[#161b22] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#1d9e75]/20 border border-[#1d9e75]/40 grid place-items-center text-[#1d9e75]">
              <Compass className="size-5" />
            </div>
            <div>
              <h2 className="font-bold text-base flex items-center gap-2">
                Guide Me Assistant
                <span className="text-[10px] font-black uppercase bg-[#1d9e75]/20 text-[#1d9e75] px-2 py-0.5 rounded-full">Live</span>
              </h2>
              <p className="text-xs text-[#8b949e]">Step-by-step navigation & crew reviews</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-black text-[#1d9e75]">{progressPercent}%</div>
            <div className="text-[10px] text-[#8b949e] font-bold">{visitedSpots} of {totalSpots} Visited</div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-[#0d1117] h-2.5 rounded-full overflow-hidden border border-[#30363d]">
          <div 
            className="bg-[#1d9e75] h-full transition-all duration-700 ease-out relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/40 animate-pulse" />
          </div>
        </div>

        {/* DAY SELECTOR TABS */}
        <div className="flex items-center justify-between pt-1">
          <button
            disabled={selectedDayIdx === 0}
            onClick={() => {
              setSelectedDayIdx(prev => prev - 1);
              setSelectedActIdx(0);
            }}
            className="p-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] disabled:opacity-30 hover:border-[#1d9e75] text-[#8b949e] hover:text-white transition-all"
          >
            <ChevronLeft className="size-4" />
          </button>
          
          <div className="text-xs font-bold flex items-center gap-2">
            <span>Day {selectedDayIdx + 1}:</span>
            <span className="text-[#1d9e75] max-w-[180px] truncate">{currentDay?.label || currentDay?.title || `Day ${selectedDayIdx + 1}`}</span>
          </div>

          <button
            disabled={selectedDayIdx === itinerary.length - 1}
            onClick={() => {
              setSelectedDayIdx(prev => prev + 1);
              setSelectedActIdx(0);
            }}
            className="p-1.5 rounded-lg bg-[#0d1117] border border-[#30363d] disabled:opacity-30 hover:border-[#1d9e75] text-[#8b949e] hover:text-white transition-all"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* MAIN STEP GUIDANCE CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* ACTIVITY STEP SELECTOR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {activities.map((act: any, idx: number) => {
            const isSelected = idx === selectedActIdx;
            const isDone = act.isVisited;
            return (
              <button
                key={idx}
                onClick={() => setSelectedActIdx(idx)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 border",
                  isSelected
                    ? "bg-[#1d9e75] text-white border-[#1d9e75] shadow-lg shadow-[#1d9e75]/20"
                    : isDone
                    ? "bg-[#1d9e75]/10 text-[#1d9e75] border-[#1d9e75]/30"
                    : "bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-white"
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="size-3.5 text-[#1d9e75] fill-[#1d9e75]/20" />
                ) : (
                  <Circle className="size-3.5 opacity-40" />
                )}
                <span>Step {idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* ACTIVE STEP CARD */}
        {currentActivity ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-[#1d9e75] tracking-wider mb-1">
                  <Navigation className="size-3" /> Step {selectedActIdx + 1} of {activities.length}
                </div>
                <h3 className="text-lg font-bold text-white">{currentActivity.title || currentActivity.activity || currentActivity.name}</h3>
                {currentActivity.location && (
                  <div className="flex items-center gap-1.5 text-xs text-[#8b949e] mt-1">
                    <MapPin className="size-3 text-[#1d9e75]" /> {currentActivity.location}
                  </div>
                )}
              </div>

              {/* VISITED CHECKMARK BUTTON */}
              <button
                onClick={() => handleToggleVisited(currentActivity, selectedActIdx)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border shadow-sm",
                  currentActivity.isVisited
                    ? "bg-[#1d9e75] text-white border-[#1d9e75] shadow-[#1d9e75]/30"
                    : "bg-[#0d1117] text-[#8b949e] border-[#30363d] hover:border-[#1d9e75] hover:text-white"
                )}
              >
                <CheckCircle2 className={cn("size-4", currentActivity.isVisited ? "text-white" : "text-[#8b949e]")} />
                {currentActivity.isVisited ? "Visited" : "Mark Visited"}
              </button>
            </div>

            {/* VISITED BY AVATAR BADGE */}
            {currentActivity.isVisited && currentActivity.visitedBy && (
              <div className="p-3 rounded-xl bg-[#1d9e75]/10 border border-[#1d9e75]/30 flex items-center gap-3 text-xs">
                <Award className="size-4 text-[#1d9e75] shrink-0" />
                <div>
                  <span className="text-[#8b949e]">Checked off by </span>
                  <span className="font-bold text-white">{currentActivity.visitedBy.name}</span>
                  <span className="text-[10px] text-[#8b949e] ml-2">
                    {new Date(currentActivity.visitedBy.visitedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )}

            {/* STEP METRICS & TIPS */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]">
                <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Clock className="size-3 text-[#ef9f27]" /> Best Time / Time
                </div>
                <div className="text-xs font-bold text-white">{currentActivity.time || currentActivity.bestTime || "Flexible"}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d]">
                <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Sparkles className="size-3 text-[#1d9e75]" /> Category
                </div>
                <div className="text-xs font-bold text-white capitalize">{currentActivity.type || currentActivity.category || "Activity"}</div>
              </div>
            </div>

            {/* NOTES / DESCRIPTION */}
            {(currentActivity.notes || currentActivity.desc || currentActivity.timeReason) && (
              <div className="p-4 rounded-xl bg-[#0d1117] border border-[#30363d]">
                <div className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider mb-1.5">Guide Notes</div>
                <p className="text-xs text-[#e6edf3] leading-relaxed">
                  {currentActivity.notes || currentActivity.desc || currentActivity.timeReason}
                </p>
              </div>
            )}

            {/* REVIEWS & CREW NOTES SECTION */}
            <div className="border-t border-[#30363d] pt-5 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="size-4 text-[#1d9e75]" /> Crew Spot Reviews
              </h4>

              {/* LIST OF CREW NOTES */}
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {(currentActivity.guideNotes || []).length === 0 ? (
                  <p className="text-xs text-[#8b949e] italic">No reviews yet for this spot. Share your feedback below!</p>
                ) : (
                  (currentActivity.guideNotes || []).map((n: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-[#0d1117] border border-[#30363d] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#1d9e75]">{n.authorName}</span>
                        <div className="flex items-center gap-1 text-[#ef9f27]">
                          <Star className="size-3 fill-[#ef9f27]" />
                          <span className="text-[10px] font-bold">{n.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-xs text-[#e6edf3]">{n.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* ADD REVIEW FORM */}
              <form onSubmit={handleAddGuideNote} className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#0d1117] border border-[#30363d] px-2 py-1 rounded-lg">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNoteRating(star)}
                        className="p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star 
                          className={cn(
                            "size-3.5",
                            star <= noteRating ? "text-[#ef9f27] fill-[#ef9f27]" : "text-[#8b949e]"
                          )} 
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#8b949e] font-bold">{noteRating} Stars</span>
                </div>

                <div className="relative">
                  <input
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Write a tip or review for this spot..."
                    className="w-full h-11 pl-4 pr-11 rounded-xl bg-[#0d1117] border border-[#30363d] text-xs text-white placeholder:text-[#8b949e] focus:border-[#1d9e75] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newNoteText.trim() || submittingNote}
                    className="absolute right-1.5 top-1.5 size-8 rounded-lg bg-[#1d9e75] text-white grid place-items-center disabled:opacity-40 hover:bg-[#1d9e75]/90 transition-all"
                  >
                    <Send className="size-3.5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-[#8b949e] bg-[#161b22] border border-[#30363d] rounded-2xl">
            Select an itinerary step above to view guidance.
          </div>
        )}
      </div>
    </div>
  );
};
