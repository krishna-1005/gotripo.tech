import React from 'react';
import { ArrowRight, Wallet, UserCircle, TrendingUp, TrendingDown } from 'lucide-react';

const COLORS = {
  cardBg: '#161b22',
  border: '#30363d',
  accent: '#1d9e75',
  amber: '#ef9f27',
  red: '#f85149',
  textPrimary: '#e6edf3',
  textMuted: '#8b949e',
  purple: '#534AB7',
};

interface SettlementDashboardProps {
  settlements: any[];
  netBalances: Record<string, { balance: number, name: string }>;
  currentUser: any;
}

const SettlementDashboard: React.FC<SettlementDashboardProps> = ({ settlements, netBalances, currentUser }) => {
  const members = Object.keys(netBalances).map(id => ({
    id,
    ...netBalances[id]
  })).sort((a, b) => b.balance - a.balance);

  const currentUserId = currentUser?._id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Net Balances Overview */}
      <section>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Wallet size={20} color={COLORS.purple} /> Net Balances
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
          {members.map((member) => (
            <div 
              key={member.id} 
              style={{ 
                backgroundColor: COLORS.cardBg, 
                border: `1px solid ${String(member.id) === String(currentUserId) ? COLORS.purple : COLORS.border}`, 
                borderRadius: '12px', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCircle size={24} color={COLORS.textMuted} />
                <span style={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {member.name} {String(member.id) === String(currentUserId) && '(You)'}
                </span>
              </div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 'bold', 
                color: member.balance > 0.01 ? COLORS.accent : member.balance < -0.01 ? COLORS.red : COLORS.textMuted,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {member.balance > 0.01 ? <TrendingUp size={16} /> : member.balance < -0.01 ? <TrendingDown size={16} /> : null}
                ₹{Math.abs(member.balance).toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', color: COLORS.textMuted }}>
                {member.balance > 0.01 ? 'Owed' : member.balance < -0.01 ? 'Owes' : 'Settled'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested Settlements */}
      <section>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ArrowRight size={20} color={COLORS.purple} /> How to Settle
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {settlements.length === 0 ? (
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.02)', 
              border: `1px dashed ${COLORS.border}`, 
              borderRadius: '12px', 
              padding: '32px', 
              textAlign: 'center',
              color: COLORS.textMuted
            }}>
              Everyone is even! No settlements needed.
            </div>
          ) : (
            settlements.map((s, idx) => (
              <div 
                key={idx} 
                style={{ 
                  backgroundColor: COLORS.cardBg, 
                  border: `1px solid ${COLORS.border}`, 
                  borderRadius: '12px', 
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{s.from}</div>
                    <div style={{ fontSize: '10px', color: COLORS.red, textTransform: 'uppercase' }}>Pays</div>
                  </div>
                  <ArrowRight size={20} color={COLORS.purple} style={{ margin: '0 8px' }} />
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{s.to}</div>
                    <div style={{ fontSize: '10px', color: COLORS.accent, textTransform: 'uppercase' }}>Receives</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.textPrimary }}>₹{s.amount.toLocaleString()}</div>
                  { (String(s.fromId) === String(currentUserId) || String(s.toId) === String(currentUserId)) && (
                    <div style={{ 
                      fontSize: '11px', 
                      fontWeight: 'bold', 
                      color: String(s.fromId) === String(currentUserId) ? COLORS.red : COLORS.accent,
                      backgroundColor: String(s.fromId) === String(currentUserId) ? 'rgba(248, 81, 73, 0.1)' : 'rgba(29, 158, 117, 0.1)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      marginTop: '4px'
                    }}>
                      {String(s.fromId) === String(currentUserId) ? 'You pay' : 'You receive'}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default SettlementDashboard;
