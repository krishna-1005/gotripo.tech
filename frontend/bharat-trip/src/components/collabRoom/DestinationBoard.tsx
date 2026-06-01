import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  Lock, 
  Trophy,
  Trash2,
  Globe,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Eye,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  fetchDestinations, 
  voteDestination, 
  lockDestination, 
  deleteDestination 
} from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useSocket } from '@/context/SocketContext';
import AISuggestModal from './modals/AISuggestModal';
import AddDestinationModal from './modals/AddDestinationModal';

const COLORS = {
  teal: '#1D9E75',
  coral: '#993C1D',
  purple: '#534AB7',
  leadingBg: '#04342C',
  leadingText: '#5DCAA5'
};

const DestinationBoard = ({ tripId, isOwner }: { tripId: string, isOwner: boolean }) => {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewingDest, setViewingDest] = useState<any | null>(null);
  const { mongoUser } = useAuth();
  const socket = useSocket();

  const loadData = async () => {
    try {
      const data = await fetchDestinations(tripId);
      setDestinations(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (socket) {
      const handleSync = (data: any) => {
        if (Array.isArray(data)) {
          setDestinations(data);
        } else {
          loadData();
        }
      };

      socket.on('destination:added', handleSync);
      socket.on('destination:voted', handleSync);
      socket.on('destination:locked', handleSync);
      socket.on('destination:deleted', handleSync);

      return () => {
        socket.off('destination:added');
        socket.off('destination:voted');
        socket.off('destination:locked');
        socket.off('destination:deleted');
      };
    }
  }, [tripId, socket]);

  const handleVote = async (destId: string, type: 'up' | 'down') => {
    if (!mongoUser?._id) {
      toast.error('You must be logged in to vote');
      return;
    }

    // Optimistic Update
    const oldDestinations = [...destinations];
    const userId = mongoUser._id;
    
    setDestinations(prev => prev.map(d => {
      if (d.id === destId) {
        let upvotes = [...d.upvotes];
        let downvotes = [...d.downvotes];

        if (type === 'up') {
          if (upvotes.includes(userId)) upvotes = upvotes.filter(id => id !== userId);
          else {
            upvotes.push(userId);
            downvotes = downvotes.filter(id => id !== userId);
          }
        } else {
          if (downvotes.includes(userId)) downvotes = downvotes.filter(id => id !== userId);
          else {
            downvotes.push(userId);
            upvotes = upvotes.filter(id => id !== userId);
          }
        }
        return { ...d, upvotes, downvotes };
      }
      return d;
    }));

    try {
      await voteDestination(tripId, destId, type);
    } catch (error) {
      setDestinations(oldDestinations);
      toast.error('Failed to vote');
    }
  };

  const handleLock = async (destId: string) => {
    // Optimistic Update
    const oldDestinations = [...destinations];
    setDestinations(prev => prev.map(d => ({
      ...d,
      status: d.id === destId ? 'locked' : 'suggested'
    })));

    try {
      await lockDestination(tripId, destId);
      toast.success('Destination locked!');
    } catch (error) {
      setDestinations(oldDestinations);
      toast.error('Failed to lock destination');
    }
  };

  const handleDelete = async (destId: string) => {
    if (!window.confirm('Are you sure you want to remove this suggestion?')) return;
    
    // Optimistic Update
    const oldDestinations = [...destinations];
    setDestinations(prev => prev.filter(d => d.id !== destId));

    try {
      await deleteDestination(tripId, destId);
      toast.success('Suggestion removed');
    } catch (error) {
      setDestinations(oldDestinations);
      toast.error('Failed to remove suggestion');
    }
  };

  const lockedDest = destinations.find(d => d.status === 'locked');

  if (loading) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="animate-spin mx-auto mb-4" /> Loading board...</div>;

  return (
    <div className="rounded-3xl bg-card border border-border p-4 md:p-6 lg:p-8 shadow-soft relative overflow-hidden mb-8">
      {/* Locked Banner */}
      <AnimatePresence>
        {lockedDest && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-6 lg:mb-8 overflow-hidden"
          >
            <div style={{ border: `2px solid ${COLORS.teal}`, backgroundColor: `${COLORS.teal}10` }} className="rounded-2xl p-4 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="size-12 lg:size-16 rounded-xl bg-warm-gradient grid place-items-center text-white shrink-0">
                  <Globe className="size-6 lg:size-8" />
                </div>
                <div>
                  <h2 className="text-lg lg:text-2xl font-display font-bold leading-tight">Your group is going to {lockedDest.name}!</h2>
                  <p className="text-xs lg:text-sm text-muted-foreground">The vote is final. Time to start packing!</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-teal-500 font-bold uppercase tracking-widest text-[10px] lg:text-xs">
                 <CheckCircle2 size={14} /> Locked by Organizer
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div className="flex items-center gap-3">
          <div className="size-9 lg:size-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
            <MapPin className="size-4 lg:size-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg lg:text-xl">Destination Board</h2>
            <p className="text-[10px] lg:text-xs text-muted-foreground">{destinations.length} destinations suggested</p>
          </div>
        </div>

        <div className="flex gap-2 lg:gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowAIModal(true)}
            className="flex-1 sm:flex-none h-9 lg:h-10 px-3 lg:px-4 rounded-xl bg-secondary/50 border border-border text-[10px] lg:text-xs font-bold flex items-center justify-center gap-2 hover:bg-secondary transition-all"
          >
            <Sparkles className="size-3.5 lg:size-4 text-purple-400" /> Ask AI
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 sm:flex-none h-9 lg:h-10 px-3 lg:px-4 rounded-xl bg-warm-gradient text-white text-[10px] lg:text-xs font-bold flex items-center justify-center gap-2 shadow-cta hover:scale-105 transition-all"
          >
            <Plus className="size-3.5 lg:size-4" /> Add yours
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {destinations.length === 0 ? (
          <div className="md:col-span-2 py-12 text-center border-2 border-dashed border-border rounded-3xl bg-secondary/5">
             <Globe className="size-12 text-muted-foreground mx-auto mb-4 opacity-20" />
             <p className="text-muted-foreground">No destinations suggested yet.</p>
             <p className="text-xs text-muted-foreground/60 mt-1 italic">Be the first to suggest a place!</p>
          </div>
        ) : (
          destinations.map((dest) => (
            <DestinationCard 
              key={dest.id} 
              dest={dest} 
              onVote={handleVote} 
              onLock={handleLock}
              onDelete={handleDelete}
              onView={() => setViewingDest(dest)}
              isOwner={isOwner}
              userId={mongoUser?._id}
              isLockedAny={!!lockedDest}
            />
          ))
        )}
      </div>

      {showAIModal && (
        <AISuggestModal 
          tripId={tripId} 
          onClose={() => setShowAIModal(false)} 
          onSuccess={() => { loadData(); setShowAIModal(false); }}
        />
      )}

      {showAddModal && (
        <AddDestinationModal 
          tripId={tripId} 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => { loadData(); setShowAddModal(false); }}
        />
      )}

      {viewingDest && (
        <div className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[2.5rem] w-full max-w-xl p-8 shadow-2xl relative">
            <button 
              onClick={() => setViewingDest(null)}
              className="absolute top-6 right-6 p-2 hover:bg-secondary rounded-xl transition-colors"
            >
              <Plus className="size-6 text-muted-foreground rotate-45" />
            </button>

            <div className="h-48 w-full rounded-2xl overflow-hidden mb-6">
              <img src={viewingDest.imageUrl} alt={viewingDest.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} className="text-primary" />
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">{viewingDest.country}</span>
            </div>
            <h3 className="text-3xl font-display font-bold mb-4">{viewingDest.name}</h3>
            
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {viewingDest.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {viewingDest.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 rounded-lg bg-secondary text-xs font-bold text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-warm-gradient grid place-items-center font-bold text-white">
                  {viewingDest.suggestedBy.name[0]}
                </div>
                <div>
                  <div className="text-xs font-bold">Suggested by</div>
                  <div className="text-sm text-muted-foreground">{viewingDest.suggestedBy.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold">AI Score</div>
                <div className="text-xl font-display font-bold text-purple-400">{viewingDest.aiScore}% Match</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DestinationCard = ({ dest, onVote, onLock, onDelete, onView, isOwner, userId, isLockedAny }: any) => {
  const upvoted = userId && dest.upvotes.includes(String(userId));
  const downvoted = userId && dest.downvotes.includes(String(userId));
  const totalVotes = dest.upvotes.length + dest.downvotes.length;
  const upRatio = totalVotes === 0 ? 50 : (dest.upvotes.length / totalVotes) * 100;

  const canDelete = isOwner || (userId && String(dest.suggestedBy.userId) === String(userId));

  return (
    <motion.div 
      layout
      className="group rounded-2xl bg-card border border-border overflow-hidden relative"
      style={{ border: dest.status === 'locked' ? `2px solid ${COLORS.teal}` : undefined }}
    >
      {/* Header Image */}
      <div className="h-40 relative overflow-hidden cursor-pointer" onClick={onView}>
        <img 
          src={dest.imageUrl} 
          alt={dest.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {dest.status === 'locked' && (
            <div style={{ backgroundColor: COLORS.teal }} className="px-3 py-1 rounded-lg text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
              <Lock size={12} /> Locked
            </div>
          )}
          {dest.status === 'leading' && !isLockedAny && (
            <div style={{ backgroundColor: COLORS.leadingBg, color: COLORS.leadingText }} className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg border border-teal-500/20">
              <Trophy size={12} /> Leading
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onView(); }}
            className="size-8 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-primary transition-all"
          >
            <Eye size={14} />
          </button>
          {dest.aiScore > 0 && (
            <div className="bg-purple-500/20 backdrop-blur-md border border-purple-500/30 px-2 py-1 rounded-lg flex items-center gap-1.5">
              <Sparkles size={10} className="text-purple-400" />
              <span className="text-[10px] font-bold text-purple-300">AI {dest.aiScore}%</span>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin size={12} className="text-white/60" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{dest.country}</span>
          </div>
          <h3 className="text-xl font-display font-bold text-white">{dest.name}</h3>
        </div>
      </div>

      <div className="p-4 md:p-5">
        <p className="text-[11px] md:text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
          {dest.description || "No description provided for this destination."}
        </p>

        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
          {dest.tags.map((tag: string, i: number) => (
            <span key={i} className="px-2 py-0.5 rounded-md bg-secondary text-[9px] md:text-[10px] font-bold text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Vote Bar */}
        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <button 
            disabled={dest.status === 'locked'}
            onClick={() => onVote(dest.id, 'up')}
            title="Vote Up"
            className={`size-9 md:size-10 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
              upvoted ? 'bg-teal-500/10 border-teal-500 text-teal-500 shadow-teal-500/20 shadow-lg' : 'border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            <ThumbsUp size={16} md:size={18} />
          </button>
          
          <div className="flex-1 h-1.5 md:h-2 bg-secondary rounded-full overflow-hidden relative">
            <div 
              className="absolute left-0 top-0 h-full bg-teal-500 transition-all duration-500" 
              style={{ width: `${upRatio}%` }}
            />
          </div>

          <button 
            disabled={dest.status === 'locked'}
            onClick={() => onVote(dest.id, 'down')}
            title="Vote Down"
            className={`size-9 md:size-10 rounded-xl border flex items-center justify-center transition-all shrink-0 ${
              downvoted ? 'bg-coral-500/10 border-[#993C1D] text-[#993C1D] shadow-coral-500/20 shadow-lg' : 'border-border text-muted-foreground hover:bg-secondary'
            }`}
          >
            <ThumbsDown size={16} md:size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="size-5 md:size-6 rounded-full bg-warm-gradient grid place-items-center text-[9px] md:text-[10px] font-bold text-white uppercase shrink-0">
              {dest.suggestedBy.name[0]}
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-muted-foreground truncate">by {dest.suggestedBy.name}</span>
          </div>

          <div className="flex gap-1.5 md:gap-2 shrink-0">
            {isOwner && dest.status !== 'locked' && (
              <button 
                onClick={() => onLock(dest.id)}
                className="h-7 md:h-8 px-2 md:px-3 rounded-lg border border-teal-500/30 text-teal-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-teal-500 hover:text-white transition-all whitespace-nowrap"
              >
                Lock
              </button>
            )}
            {canDelete && dest.status !== 'locked' && (
              <button 
                onClick={() => onDelete(dest.id)}
                title="Remove Suggestion"
                className="size-7 md:size-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={12} md:size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DestinationBoard;
