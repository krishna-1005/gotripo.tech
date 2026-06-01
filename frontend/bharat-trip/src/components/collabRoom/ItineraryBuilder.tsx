import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { 
  Loader2, Plus, Sparkles, Calendar as CalendarIcon, Clock, 
  Trash2, GripVertical, Utensils, MapPin, 
  Navigation, Bed, Flag, Coffee, ChevronDown, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const THEME_COLORS: Record<string, string> = {
  arrival: '#534AB7',
  explore: '#1D9E75',
  beach: '#BA7517',
  adventure: '#993C1D',
  departure: '#888',
  free: '#3a3a3e',
};

const TYPE_ICONS: Record<string, any> = {
  food: <Utensils size={14} />,
  transport: <Navigation size={14} />,
  stay: <Bed size={14} />,
  activity: <Sparkles size={14} />,
  landmark: <MapPin size={14} />,
};

const ItineraryBuilder = ({ trip }: { trip: any }) => {
  const [itinerary, setItinerary] = useState<any[]>(trip.itinerary || []);
  const [loading, setLoading] = useState(!trip.itinerary);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(trip.startDate ? new Date(trip.startDate) : undefined);
  const { user } = useAuth();
  const socket = useSocket();

  const fetchItinerary = useCallback(async () => {
    try {
      const res = await api.get(`/trips/${trip._id}/itinerary`);
      setItinerary(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [trip._id]);

  useEffect(() => {
    if (trip.itinerary) {
      setItinerary(trip.itinerary);
      setLoading(false);
    } else {
      if (user) fetchItinerary();
    }
    if (trip.startDate) {
      setStartDate(new Date(trip.startDate));
    }
  }, [trip.itinerary, trip.startDate, user, fetchItinerary]);

  useEffect(() => {
    if (socket) {
      socket.on('itinerary:updated', (updatedItinerary: any) => {
        setItinerary(updatedItinerary);
      });
      socket.on('trip:updated', (updatedTrip: any) => {
        if (updatedTrip.itinerary) setItinerary(updatedTrip.itinerary);
        if (updatedTrip.startDate) setStartDate(new Date(updatedTrip.startDate));
      });
      socket.on('itinerary:activityAdded', ({ dayIndex, activity }: any) => {
        setItinerary(prev => prev.map((day, i) => 
          i === dayIndex 
            ? { ...day, activities: [...(day.activities || []), activity] }
            : day
        ));
      });
      socket.on('itinerary:activityDeleted', ({ dayIndex, activityId }: any) => {
        setItinerary(prev => prev.map((day, i) => 
          i === dayIndex 
            ? { ...day, activities: (day.activities || []).filter((a: any) => (a._id || a.id) !== activityId) }
            : day
        ));
      });
      socket.on('itinerary:aiRegenerated', (newItinerary: any) => {
        setItinerary(newItinerary);
        toast.success('AI Itinerary generated!');
      });

      return () => {
        socket.off('itinerary:updated');
        socket.off('trip:updated');
        socket.off('itinerary:activityAdded');
        socket.off('itinerary:activityDeleted');
        socket.off('itinerary:aiRegenerated');
      };
    }
  }, [trip._id, user, socket, fetchItinerary]);

  const handleUpdateStartDate = async (date: Date | undefined) => {
    if (!date) return;
    try {
      setStartDate(date);
      await api.patch(`/trips/${trip._id}`, { startDate: date.toISOString() });
      toast.success('Trip dates updated!');
    } catch (err) {
      toast.error('Failed to update trip dates');
    }
  };

  const handleAddDay = async () => {
    try {
      const res = await api.post(`/trips/${trip._id}/itinerary/day`);
      // Update local state immediately for the current user
      setItinerary(prev => [...prev, res.data]);
      toast.success('Day added');
    } catch (err) {
      toast.error('Failed to add day');
    }
  };

  const handleAiGenerate = async () => {
    setAiGenerating(true);
    try {
      const lockedSuggestions = trip.destinations?.filter((d: any) => d.status === 'locked') || [];
      await api.post(`/ai/itinerary`, {
        tripId: trip._id,
        destination: trip.destination,
        dates: `${trip.startDate || ''} to ${trip.endDate || ''}`,
        groupSize: (trip.members?.length || 1),
        lockedSuggestions
      });
    } catch (err) {
      toast.error('AI Generation failed');
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) return (
    <div className="rounded-3xl bg-card border border-border p-6 md:p-8 shadow-soft flex items-center justify-center min-h-[200px]">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="rounded-3xl bg-card border border-border p-4 md:p-6 lg:p-8 shadow-soft space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="size-9 md:size-10 rounded-xl bg-purple-500/10 text-purple-500 grid place-items-center shrink-0">
            <CalendarIcon className="size-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg md:text-xl">Trip Itinerary</h2>
            <div className="flex items-center gap-2">
              <p className="text-[10px] md:text-xs text-muted-foreground">{itinerary.length} days planned</p>
              <span className="text-muted-foreground text-[10px]">•</span>
              
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-[10px] md:text-xs font-bold text-purple-500 hover:text-purple-400 flex items-center gap-1 transition-colors">
                    {startDate ? format(startDate, "PPP") : "Set Start Date"}
                    <ChevronDown size={12} />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleUpdateStartDate}
                    initialFocus
                    className="rounded-xl border border-border"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
          <button 
            onClick={handleAiGenerate}
            disabled={aiGenerating}
            className="flex-1 sm:flex-none h-9 md:h-10 px-3 md:px-4 rounded-xl bg-purple-500 text-white text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 shadow-cta hover:opacity-90 transition-all disabled:opacity-50"
          >
            {aiGenerating ? <Loader2 className="animate-spin size-3.5 md:size-4" /> : <Sparkles className="size-3.5 md:size-4" />}
            AI Generate
          </button>
          <button 
            onClick={handleAddDay}
            className="flex-1 sm:flex-none h-9 md:h-10 px-3 md:px-4 rounded-xl bg-secondary/50 border border-border text-[10px] md:text-xs font-bold flex items-center justify-center gap-2 hover:bg-secondary transition-all"
          >
            <Plus className="size-3.5 md:size-4" /> Add Day
          </button>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="flex flex-col gap-6 md:gap-8 relative">
        {/* Connecting line */}
        {itinerary.length > 0 && (
          <div className="absolute left-[17px] md:left-[21px] top-4 bottom-4 w-0.5 bg-border z-0" />
        )}

        {itinerary.length === 0 && !aiGenerating && (
          <div className="text-center p-12 text-muted-foreground border-2 border-dashed border-border rounded-3xl bg-secondary/5">
            <CalendarIcon className="size-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-sm">No days planned yet.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Start by adding a day or let AI help!</p>
          </div>
        )}

        {aiGenerating && (
          <div className="flex flex-col gap-4">
             {[1,2].map(i => (
               <div key={i} className="animate-pulse flex flex-col gap-3">
                 <div className="h-8 w-48 bg-secondary rounded-xl ml-12" />
                 <div className="h-24 bg-secondary/50 rounded-2xl ml-12" />
               </div>
             ))}
          </div>
        )}

        {itinerary.map((day, idx) => (
          <DaySection 
            key={idx} 
            day={day} 
            dayIndex={idx} 
            tripId={trip._id} 
            onRemoveDay={async () => {
              try {
                const res = await api.delete(`/trips/${trip._id}/itinerary/day/${idx}`);
                setItinerary(res.data);
                toast.success('Day removed');
              } catch (err) {
                toast.error('Failed to remove day');
              }
            }}
            onActivityDeleted={(activityId) => {
              setItinerary(prev => prev.map((d, i) => 
                i === idx 
                  ? { ...d, activities: (d.activities || []).filter((a: any) => (a._id || a.id) !== activityId) }
                  : d
              ));
            }}
          />
        ))}
      </div>
    </div>
  );
};

const DaySection = ({ day, dayIndex, tripId, onActivityDeleted, onRemoveDay }: { day: any, dayIndex: number, tripId: string, onActivityDeleted: (id: string) => void, onRemoveDay: () => void }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleAddActivity = async () => {
    try {
      await api.post(`/trips/${tripId}/itinerary/day/${dayIndex}/activity`, {
        time: "10:00 AM",
        title: "New Activity",
        location: "",
        type: "activity",
        notes: ""
      });
    } catch (err) {
      toast.error('Failed to add activity');
    }
  };

  return (
    <div className="flex flex-col gap-4 relative z-10">
      {/* DAY HEADER */}
      <div className="flex items-center gap-4 group/day">
        <div 
          className="w-11 h-11 rounded-2xl flex items-center justify-center border-4 border-card relative z-20 shadow-sm"
          style={{ backgroundColor: THEME_COLORS[day.theme] || '#1d9e75' }}
        >
          <span className="text-white font-black text-sm">{day.day}</span>
        </div>
        <div className="flex flex-1 items-center justify-between">
           <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold uppercase tracking-tight">{day.label}</h3>
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <div className="size-1.5 rounded-full" style={{ backgroundColor: THEME_COLORS[day.theme] || '#1d9e75' }} />
                {day.date ? new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date TBD'}
              </span>
           </div>
           <div className="flex items-center gap-2">
             <button 
               onClick={(e) => {
                 e.stopPropagation();
                 if (window.confirm(`Are you sure you want to remove ${day.label}?`)) onRemoveDay();
               }}
               className="size-8 flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-all opacity-0 group-hover/day:opacity-100"
               title="Remove Day"
             >
               <Trash2 size={16} />
             </button>
             <button 
               onClick={() => setIsCollapsed(!isCollapsed)}
               className="size-8 flex items-center justify-center hover:bg-secondary rounded-lg transition-colors text-muted-foreground"
             >
               {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
             </button>
           </div>
        </div>
      </div>

      {/* ACTIVITIES */}
      {!isCollapsed && (
        <div className="flex flex-col gap-3 ml-12">
          {[...(day.activities || [])].sort((a: any, b: any) => (a.order || 0) - (b.order || 0)).map((activity: any, aIdx: number) => (
            <ActivityItem 
              key={activity._id || activity.id || aIdx} 
              activity={activity} 
              dayIndex={dayIndex} 
              tripId={tripId} 
              onDelete={onActivityDeleted}
            />
          ))}
          
          <button 
            onClick={handleAddActivity}
            className="flex items-center gap-2 w-full py-4 px-4 border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 rounded-2xl text-xs font-bold text-muted-foreground transition-all group"
          >
            <Plus size={16} className="group-hover:scale-110 transition-transform" />
            Add activity to Day {day.day}
          </button>
        </div>
      )}
    </div>
  );
};

const ActivityItem = ({ activity, dayIndex, tripId, onDelete }: { activity: any, dayIndex: number, tripId: string, onDelete: (id: string) => void }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(activity.title);
  const [time, setTime] = useState(activity.time);

  const activityId = activity._id || activity.id;

  const handleUpdate = async () => {
    try {
      await api.put(`/trips/${tripId}/itinerary/day/${dayIndex}/activity/${activityId}`, {
        title, time
      });
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/trips/${tripId}/itinerary/day/${dayIndex}/activity/${activityId}`);
      onDelete(activityId);
      toast.success('Activity deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div 
      className={`group flex items-center gap-4 p-4 bg-secondary/20 border border-border rounded-2xl hover:bg-secondary/40 hover:border-border transition-all relative ${activity.isAiGenerated ? 'border-l-4 border-l-purple-500' : ''}`}
    >
      <div className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
        <GripVertical size={16} />
      </div>

      <div className="flex items-center gap-3 min-w-[90px]">
        {isEditing ? (
          <input 
            value={time} 
            onChange={e => setTime(e.target.value)}
            onBlur={handleUpdate}
            className="bg-background border border-border rounded px-1 text-[10px] w-20 font-bold outline-none"
            autoFocus
          />
        ) : (
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md" onClick={() => setIsEditing(true)}>
            <Clock size={12} />
            {activity.time || activity.bestTime || "Morning"}
          </div>
        )}
      </div>

      <div 
        className="size-8 rounded-lg text-white flex items-center justify-center shrink-0 shadow-sm"
        style={{ backgroundColor: THEME_COLORS[activity.type] || '#30363d' }}
      >
        {TYPE_ICONS[activity.type] || <Sparkles size={14} />}
      </div>

      <div className="flex-1">
        {isEditing ? (
          <input 
            value={title} 
            onChange={e => setTitle(e.target.value)}
            onBlur={handleUpdate}
            className="bg-background border border-border rounded px-2 py-1 text-sm w-full font-bold outline-none"
          />
        ) : (
          <div className="flex flex-col" onClick={() => setIsEditing(true)}>
             <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm tracking-tight">{activity.title}</h4>
                {activity.isAiGenerated && (
                  <span className="text-[9px] px-1.5 py-0.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded font-black tracking-tighter uppercase">AI</span>
                )}
             </div>
             {activity.location && (
               <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                 <MapPin size={10} />
                 {activity.location}
               </div>
             )}
             {(activity.desc || activity.description || activity.notes || activity.reason) && (
               <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xl line-clamp-1">
                 {activity.desc || activity.description || activity.notes || activity.reason}
               </p>
             )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {activity.addedBy && (
          <div 
            className="size-6 rounded-lg bg-warm-gradient text-white flex items-center justify-center text-[10px] font-black shadow-sm"
            title={`Added by ${activity.addedBy.name}`}
          >
            {(activity.addedBy.name || "?")[0].toUpperCase()}
          </div>
        )}
        <button 
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-red-500 transition-all"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default ItineraryBuilder;
