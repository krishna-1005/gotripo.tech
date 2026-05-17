import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSocket } from '@/context/SocketContext';
import { useAuth } from '@/components/AuthProvider';
import { Send, Loader2, MessageSquare } from 'lucide-react';

const COLORS = {
  cardBg: '#161b22',
  border: '#30363d',
  accent: '#1d9e75',
  amber: '#ef9f27',
  textPrimary: '#e6edf3',
  textMuted: '#8b949e',
};

const CollabSidebar = ({ trip, onlineUsers, polls, setActiveTab }: any) => {
  const [members, setMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(true);
  const socket = useSocket();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = await user?.getIdToken();
        const res = await axios.get(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/trips/${trip._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMembers(res.data.members || []);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchMessages = async () => {
      try {
        const token = await user?.getIdToken();
        const res = await axios.get(`${(import.meta as any).env.VITE_API_URL || 'http://localhost:5000'}/api/trips/${trip._id}/messages-v2`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
        setLoadingChat(false);
      } catch (err) {
        setLoadingChat(false);
      }
    };

    if (user) {
      fetchMembers();
      fetchMessages();
    }

    if (socket) {
      socket.on('message:receive', (msg: any) => {
        setMessages(prev => [...prev, msg]);
      });
      return () => socket.off('message:receive');
    }
  }, [trip._id, socket, user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatInput.trim() || !socket || !user) return;

    const msgData = {
      tripId: trip._id,
      senderId: user.uid,
      text: chatInput
    };

    socket.emit('message:send', msgData);
    setChatInput('');
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  };

  const getAvatarColor = (userId: string) => {
    if (!userId) return '#1d9e75';
    const colors = ['#8b5cf6', '#1d9e75', '#ef9f27', '#3b82f6', '#ec4899'];
    const index = parseInt(userId.substring(0, 8), 16) % colors.length;
    return colors[index];
  };

  const activePoll = polls?.find((p: any) => p.status === 'open');

  return (
    <div style={{ width: '280px', borderLeft: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', backgroundColor: COLORS.cardBg, height: '100%', overflow: 'hidden' }}>
      
      {/* Scrollable top sections */}
      <div style={{ overflowY: 'auto', flexShrink: 0, maxHeight: '60%' }}>
        {/* Section 1: CREW */}
        <div style={{ padding: '24px', borderBottom: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '0.1em' }}>CREW</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {members.map((member, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    backgroundColor: getAvatarColor(member.userId), 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}>
                    {getInitials(member.userName || 'User')}
                  </div>
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '2px', 
                    right: '2px', 
                    width: '10px', 
                    height: '10px', 
                    borderRadius: '50%', 
                    backgroundColor: onlineUsers.has(member.userId) ? COLORS.accent : 'transparent',
                    border: onlineUsers.has(member.userId) ? `2px solid ${COLORS.cardBg}` : 'none'
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.textPrimary }}>
                      {member.userId === user?.uid ? 'You' : (member.userName || 'Traveller')}
                  </div>
                  <div style={{ fontSize: '12px', color: COLORS.textMuted }}>Trip {member.role}</div>
                </div>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: member.rsvp === 'confirmed' ? COLORS.accent : COLORS.amber 
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: ACTIVE POLL */}
        <div style={{ padding: '24px', borderBottom: `1px solid ${COLORS.border}` }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: COLORS.textMuted, textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.1em' }}>ACTIVE POLL</h3>
          {activePoll ? (
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>{activePoll.question}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activePoll.options.map((opt: any, i: number) => {
                  const total = activePoll.options.reduce((sum: number, o: any) => sum + o.votes.length, 0);
                  const percent = total > 0 ? Math.round((opt.votes.length / total) * 100) : 0;
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                        <span>{opt.text}</span>
                        <span style={{ color: COLORS.textMuted }}>{opt.votes.length} votes</span>
                      </div>
                      <div style={{ height: '24px', backgroundColor: '#0d1117', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', backgroundColor: COLORS.accent, opacity: 0.3, transition: 'width 0.5s ease' }} />
                        <div style={{ position: 'absolute', top: 0, left: '8px', height: '100%', display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 'bold' }}>{percent}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: '13px', color: COLORS.textMuted, fontStyle: 'italic' }}>No active polls</div>
          )}
        </div>
      </div>

      {/* Section 3: CREW CHAT - Now properly fills remaining space and scrolls */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ padding: '24px 24px 12px 24px', borderBottom: `1px solid ${COLORS.border}`, backgroundColor: COLORS.cardBg }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>CREW CHAT</h3>
            <span style={{ fontSize: '11px', color: COLORS.accent, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: COLORS.accent }} />
                {onlineUsers.size} active
            </span>
          </div>
        </div>
        
        <div style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '16px 20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            backgroundColor: 'rgba(13, 17, 23, 0.3)' 
        }}>
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.uid;
            return (
                <div key={idx} style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    gap: '4px' 
                }}>
                    {!isMe && (
                        <div style={{ fontSize: '11px', color: COLORS.textMuted, marginLeft: '4px' }}>
                            {msg.senderName} • 2m ago
                        </div>
                    )}
                    <div style={{ 
                        backgroundColor: isMe ? COLORS.accent : '#0d1117', 
                        color: 'white', 
                        padding: '10px 14px', 
                        borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px', 
                        fontSize: '13px',
                        lineHeight: '1.4',
                        maxWidth: '85%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        border: isMe ? 'none' : `1px solid ${COLORS.border}`
                    }}>
                        {msg.text}
                    </div>
                </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <div style={{ padding: '16px', borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ display: 'flex', gap: '8px', backgroundColor: '#0d1117', borderRadius: '12px', padding: '4px 12px', alignItems: 'center', border: `1px solid ${COLORS.border}` }}>
            <input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Message the crew..."
              style={{ flex: 1, background: 'none', border: 'none', color: 'white', fontSize: '13px', padding: '12px 0', outline: 'none' }}
            />
            <button 
              onClick={handleSendMessage}
              style={{ 
                  backgroundColor: COLORS.accent, 
                  border: 'none', 
                  color: 'white', 
                  cursor: 'pointer', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.1s',
                  boxShadow: '0 2px 8px rgba(29, 158, 117, 0.3)'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollabSidebar;
