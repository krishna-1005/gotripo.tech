import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, CheckCircle, Clock } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/components/auth/AuthProvider';
import CreatePollModal from '@/components/collabRoom/modals/CreatePollModal';

const COLORS = {
  cardBg: '#161b22',
  border: '#30363d',
  accent: '#1d9e75',
  amber: '#ef9f27',
  red: '#f85149',
  textPrimary: '#e6edf3',
  textMuted: '#8b949e',
};

const PollsPanel = ({ trip }: { trip: any }) => {
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const socket = useSocket();
  const { user } = useAuth();

  const fetchPolls = async () => {
    try {
      const token = await user?.getIdToken();
      const res = await axios.get(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/trips/${trip._id}/polls-v2`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPolls(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPolls();

    if (socket) {
      socket.on('poll:updated', (updatedPoll: any) => {
        setPolls(prev => prev.map(p => p._id === updatedPoll._id ? updatedPoll : p));
      });

      return () => socket.off('poll:updated');
    }
  }, [trip._id, socket, user]);

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      const token = await user?.getIdToken();
      const res = await axios.post(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/trips/${trip._id}/polls-v2/${pollId}/vote`, 
        { optionIndex },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state and emit socket event
      setPolls(prev => prev.map(p => p._id === pollId ? res.data : p));
      if (socket) socket.emit('poll:vote', { tripId: trip._id, poll: res.data });
    } catch (err) {
      console.error(err);
    }
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      const token = await user?.getIdToken();
      const res = await axios.post(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/trips/${trip._id}/polls-v2/${pollId}/close`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPolls(prev => prev.map(p => p._id === pollId ? res.data : p));
      if (socket) socket.emit('poll:vote', { tripId: trip._id, poll: res.data });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader2 className="animate-spin" size={32} />;

  const openPolls = polls.filter(p => p.status === 'open');
  const closedPolls = polls.filter(p => p.status === 'closed');

  const isOrganizer = trip.members.find((m: any) => m.userId === user?.uid)?.role === 'organizer' || trip.createdBy === user?.uid;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Polls</h2>
        <button 
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: COLORS.accent,
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}
        >
          <Plus size={18} /> Create Poll
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {[...openPolls, ...closedPolls].map((poll, idx) => (
          <PollCard 
            key={idx} 
            poll={poll} 
            onVote={handleVote} 
            onClose={handleClosePoll}
            currentUser={user}
            isOrganizer={isOrganizer}
          />
        ))}

        {polls.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textMuted }}>
            No polls created yet.
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePollModal 
          trip={trip} 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={() => {
            setShowCreateModal(false);
            fetchPolls();
          }} 
        />
      )}
    </div>
  );
};

const PollCard = ({ poll, onVote, onClose, currentUser, isOrganizer }: any) => {
  const totalVotes = poll.options.reduce((sum: number, opt: any) => sum + opt.votes.length, 0);
  const userHasVoted = poll.options.some((opt: any) => opt.votes.includes(currentUser?.uid));

  return (
    <div style={{
      backgroundColor: COLORS.cardBg,
      border: `1px solid ${COLORS.border}`,
      borderRadius: '12px',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '18px', fontWeight: '600' }}>{poll.question}</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ 
            fontSize: '12px', 
            color: poll.status === 'open' ? COLORS.accent : COLORS.textMuted,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {poll.status === 'open' ? <Clock size={14} /> : <CheckCircle size={14} />}
            {poll.status.toUpperCase()}
          </span>
          {isOrganizer && poll.status === 'open' && (
            <button 
              onClick={() => onClose(poll._id)}
              style={{ background: 'none', border: `1px solid ${COLORS.border}`, color: COLORS.textMuted, fontSize: '11px', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Close Poll
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {poll.options.map((option: any, idx: number) => {
          const percentage = totalVotes > 0 ? (option.votes.length / totalVotes) * 100 : 0;
          const isUserVote = option.votes.includes(currentUser?.uid);

          return (
            <div key={idx} style={{ position: 'relative' }}>
              <button
                disabled={poll.status === 'closed' || isUserVote}
                onClick={() => onVote(poll._id, idx)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  backgroundColor: 'transparent',
                  border: `1px solid ${isUserVote ? COLORS.accent : COLORS.border}`,
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: COLORS.textPrimary,
                  cursor: poll.status === 'closed' ? 'default' : 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  zIndex: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ zIndex: 2 }}>{option.text}</span>
                <span style={{ zIndex: 2, fontSize: '13px', color: COLORS.textMuted }}>
                  {option.votes.length} votes ({Math.round(percentage)}%)
                </span>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${percentage}%`,
                  backgroundColor: `${isUserVote ? COLORS.accent : '#30363d'}33`,
                  zIndex: -1,
                  transition: 'width 0.3s ease'
                }} />
              </button>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: '12px', fontSize: '12px', color: COLORS.textMuted }}>
        Created by {poll.createdBy.name} • {totalVotes} total votes
      </div>
    </div>
  );
};

export default PollsPanel;
