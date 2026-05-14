import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/components/AuthProvider';
import ItineraryBuilder from '@/components/collabRoom/ItineraryBuilder';
import BudgetTracker from '@/components/collabRoom/BudgetTracker';
import PollsPanel from '@/components/collabRoom/PollsPanel';
import ExpensePanel from '@/components/collabRoom/ExpensePanel';
import AvailabilityMatcher from '@/components/collabRoom/AvailabilityMatcher';
import CollabSidebar from '@/components/collabRoom/CollabSidebar';
import { Checklist } from '@/components/Checklist';
import { Loader2, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';

const COLORS = {
  pageBg: '#0d1117',
  cardBg: '#161b22',
  border: '#30363d',
  accent: '#1d9e75',
  amber: '#ef9f27',
  textPrimary: '#e6edf3',
  textMuted: '#8b949e',
};

const CollabRoom = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('itinerary');
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set<string>());
  const [polls, setPolls] = useState<any[]>([]);

  const userId = user?.uid;

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const token = await user?.getIdToken();
        const res = await axios.get(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTrip(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load trip details');
        setLoading(false);
      }
    };

    const fetchPolls = async () => {
        try {
          const token = await user?.getIdToken();
          const res = await axios.get(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/trips/${tripId}/polls-v2`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setPolls(res.data);
        } catch (err) {
          console.error(err);
        }
    };

    if (user) {
      fetchTrip();
      fetchPolls();
    }

    if (socket && user) {
      socket.connect();
      socket.emit('join:room', { tripId, userId });

      socket.on('user:online', ({ userId: onlineId }) => {
        setOnlineUsers(prev => new Set(prev).add(onlineId));
      });

      socket.on('user:offline', ({ userId: offlineId }) => {
        setOnlineUsers(prev => {
          const next = new Set(prev);
          next.delete(offlineId);
          return next;
        });
      });

      socket.on('poll:updated', (updatedPoll: any) => {
        setPolls(prev => prev.map(p => p._id === updatedPoll._id ? updatedPoll : p));
      });

      return () => {
        socket.emit('leave:room', { tripId, userId });
        socket.off('user:online');
        socket.off('user:offline');
        socket.off('poll:updated');
        socket.disconnect();
      };
    }
  }, [tripId, socket, user, userId]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: COLORS.pageBg, color: COLORS.textPrimary }}>
      <Loader2 className="animate-spin" size={48} />
    </div>
  );

  if (error) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: COLORS.pageBg, color: COLORS.textPrimary }}>
      <p>{error}</p>
    </div>
  );

    const getAvatarColor = (id: any) => {
    const colors = ['#8b5cf6', '#1d9e75', '#ef9f27', '#3b82f6', '#ec4899'];
    const stringId = typeof id === 'object' ? id._id : id;
    const index = stringId ? parseInt(stringId.substring(0, 8), 16) % colors.length : 0;
    return colors[index];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: COLORS.pageBg, color: COLORS.textPrimary }}>
      
      {/* HEADER MATCHING SCREENSHOT */}
      <header style={{ 
        height: '80px', 
        borderBottom: `1px solid ${COLORS.border}`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: '0 32px',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '50%', 
            backgroundColor: COLORS.accent, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white'
          }}>
            {trip.title[0]}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold' }}>{trip.title}</h1>
              <span style={{ color: COLORS.textMuted }}>• {trip.destination}</span>
              <span style={{ 
                backgroundColor: 'rgba(29, 158, 117, 0.1)', 
                color: COLORS.accent, 
                fontSize: '11px', 
                padding: '2px 8px', 
                borderRadius: '12px',
                fontWeight: '600'
              }}>
                {trip.members.length} members
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {trip.members.slice(0, 4).map((m: any, i: number) => {
              const mName = m.userId?.name || m.userName || 'Traveller';
              const mId = m.userId?._id || m.userId;
              return (
                <div 
                  key={i}
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: getAvatarColor(mId),
                    border: `2px solid ${COLORS.pageBg}`,
                    marginLeft: i === 0 ? 0 : '-10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                  title={mName}
                >
                  {mName[0].toUpperCase()}
                </div>
              );
            })}
            {trip.members.length > 4 && (
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: '#30363d', 
                border: `2px solid ${COLORS.pageBg}`,
                marginLeft: '-10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                color: COLORS.textMuted
              }}>
                +{trip.members.length - 4}
              </div>
            )}
          </div>
          <button 
            onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Room link copied!');
            }}
            style={{ 
              backgroundColor: '#161b22', 
              color: 'white', 
              border: `1px solid ${COLORS.border}`, 
              padding: '8px 16px', 
              borderRadius: '8px', 
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Invite
          </button>
        </div>
      </header>

      {/* SUB-HEADER TABS */}
      <div style={{ padding: '0 32px', borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.pageBg, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {['itinerary', 'availability', 'expenses', 'polls', 'checklist', 'chat'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab ? `2px solid ${COLORS.accent}` : '2px solid transparent',
                color: activeTab === tab ? COLORS.accent : COLORS.textMuted,
                padding: '16px 0',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* MAIN CONTENT AREA - INTEGRATED DASHBOARD */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {activeTab === 'itinerary' ? (
            <>
              <ItineraryBuilder key={`itinerary-${trip._id}`} trip={trip} />
              <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: '32px' }}>
                <ExpensePanel key={`expense-preview-${trip._id}`} trip={trip} isPreview={true} />
              </div>
            </>
          ) : activeTab === 'availability' ? (
            <AvailabilityMatcher 
              tripId={trip._id} 
              isOrganizer={trip.createdBy === userId || trip.members?.some((m: any) => (m.userId?._id || m.userId) === userId && m.role === 'organizer')}
              currentUser={user ? { uid: user.uid, displayName: user.displayName || 'Traveller', photoURL: user.photoURL || undefined } : null}
              members={trip.members}
            />
          ) : activeTab === 'expenses' ? (
            <ExpensePanel key={`budget-${trip._id}`} trip={trip} />
          ) : activeTab === 'polls' ? (            <PollsPanel key={`polls-${trip._id}`} trip={trip} />
          ) : activeTab === 'checklist' ? (
            <Checklist tripId={trip._id} />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: COLORS.textMuted }}>
              Feature {activeTab} coming soon...
            </div>
          )}
        </div>

        {/* SIDEBAR MATCHING SCREENSHOT */}
        <CollabSidebar 
            trip={trip} 
            onlineUsers={onlineUsers} 
            polls={polls}
            setActiveTab={setActiveTab} 
        />
      </div>
    </div>
  );
};


const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      color: active ? COLORS.accent : COLORS.textMuted,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      transition: 'color 0.2s',
      fontSize: '12px'
    }}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default CollabRoom;
