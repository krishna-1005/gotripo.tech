import React from 'react';
import { ArrowRight, Wallet, UserCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="flex flex-col gap-6">
      {/* Net Balances Overview */}
      <section>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Wallet size={20} className="text-purple-500" /> Net Balances
        </h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
          {members.map((member) => (
            <div 
              key={member.id} 
              className={cn(
                "bg-secondary/30 border rounded-xl p-4 flex flex-col gap-2",
                String(member.id) === String(currentUserId) ? "border-purple-500" : "border-border"
              )}
            >
              <div className="flex items-center gap-2">
                <UserCircle size={24} className="text-muted-foreground" />
                <span className="font-semibold text-sm truncate">
                  {member.name} {String(member.id) === String(currentUserId) && '(You)'}
                </span>
              </div>
              <div className={cn(
                "text-lg font-bold flex items-center gap-1",
                member.balance > 0.01 ? "text-emerald-500" : member.balance < -0.01 ? "text-red-500" : "text-muted-foreground"
              )}>
                {member.balance > 0.01 ? <TrendingUp size={16} /> : member.balance < -0.01 ? <TrendingDown size={16} /> : null}
                ₹{Math.abs(member.balance).toLocaleString()}
              </div>
              <div className="text-[11px] uppercase font-bold text-muted-foreground">
                {member.balance > 0.01 ? 'Owed' : member.balance < -0.01 ? 'Owes' : 'Settled'}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Suggested Settlements */}
      <section>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ArrowRight size={20} className="text-purple-500" /> How to Settle
        </h3>
        <div className="flex flex-col gap-3">
          {settlements.length === 0 ? (
            <div className="bg-secondary/10 border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground">
              Everyone is even! No settlements needed.
            </div>
          ) : (
            settlements.map((s, idx) => (
              <div 
                key={idx} 
                className="bg-secondary/30 border border-border rounded-xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-center">
                    <div className="font-bold text-sm">{s.from}</div>
                    <div className="text-[10px] text-red-500 uppercase">Pays</div>
                  </div>
                  <ArrowRight size={20} className="text-purple-500 mx-2" />
                  <div className="text-center">
                    <div className="font-bold text-sm">{s.to}</div>
                    <div className="text-[10px] text-emerald-500 uppercase">Receives</div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold">₹{s.amount.toLocaleString()}</div>
                  { (String(s.fromId) === String(currentUserId) || String(s.toId) === String(currentUserId)) && (
                    <div className={cn(
                      "text-[11px] font-bold px-2 py-0.5 rounded mt-1 inline-block",
                      String(s.fromId) === String(currentUserId) 
                        ? "text-red-500 bg-red-500/10" 
                        : "text-emerald-500 bg-emerald-500/10"
                    )}>
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
