import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Receipt, HandCoins, Trash2 } from 'lucide-react';
import { fetchBudget, deleteExpense } from '@/lib/api';
import AddBudgetExpenseModal from '@/components/collabRoom/modals/AddBudgetExpenseModal';
import SettlementDashboard from '@/components/collabRoom/SettlementDashboard';
import { useAuth } from '@/components/AuthProvider';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';

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

const CATEGORY_EMOJI: Record<string, string> = {
  food: '🍛',
  transport: '🚌',
  stay: '🏨',
  activity: '🎯',
  other: '💰'
};

const ExpensePanel = ({ trip, isPreview = false }: { trip: any, isPreview?: boolean }) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'settlements'>('expenses');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [netBalances, setNetBalances] = useState<Record<string, any>>({});
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const { user, mongoUser } = useAuth();
  const socket = useSocket();

  const fetchData = async () => {
    try {
      const data = await fetchBudget(trip._id);
      setExpenses(data.expenses || []);
      setTotalSpent(data.totalSpent || 0);
      setSettlements(data.settlements || []);
      setNetBalances(data.netBalances || {});
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mongoUser) fetchData();

    if (socket) {
      const refresh = () => fetchData();
      socket.on('expense:added', refresh);
      socket.on('expense:deleted', refresh);
      socket.on('budget:updated', (data: any) => {
        setExpenses(data.expenses || []);
        setTotalSpent(data.totalSpent || 0);
        setSettlements(data.settlements || []);
        setNetBalances(data.netBalances || {});
      });
      return () => {
        socket.off('expense:added', refresh);
        socket.off('expense:deleted', refresh);
        socket.off('budget:updated');
      };
    }
  }, [trip._id, mongoUser, socket]);

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await deleteExpense(trip._id, id);
      toast.success('Expense deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
      <Loader2 className="animate-spin" size={32} color={COLORS.purple} />
    </div>
  );

  const currentUserId = mongoUser?._id;

  const userOwed = expenses.reduce((sum, e) => {
    const userSplit = e.splitBetween.find((s: any) => String(s.userId) === String(currentUserId));
    return sum + (userSplit ? userSplit.share : 0);
  }, 0);

  const userPaid = expenses
    .filter(e => String(e.paidBy.userId) === String(currentUserId))
    .reduce((sum, e) => sum + e.amount, 0);

  const userBalance = netBalances[currentUserId || '']?.balance || 0;

  return (
    <div className="rounded-3xl bg-card border border-border p-4 md:p-6 lg:p-8 shadow-soft relative overflow-hidden mb-8">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Group Expenses</h2>
        </div>
        {!isPreview && (
            <button 
                onClick={() => setShowAddModal(true)}
                style={{
                    backgroundColor: COLORS.purple,
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(83, 74, 183, 0.2)'
                }}
            >
                <Plus size={18} /> Add expense
            </button>
        )}
      </div>

      {!isPreview && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '12px', border: `1px solid ${COLORS.border}` }}>
          <button 
            onClick={() => setActiveTab('expenses')}
            style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              padding: '10px', 
              borderRadius: '8px', 
              border: 'none',
              backgroundColor: activeTab === 'expenses' ? COLORS.cardBg : 'transparent',
              color: activeTab === 'expenses' ? 'white' : COLORS.textMuted,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            <Receipt size={18} /> Expenses
          </button>
          <button 
            onClick={() => setActiveTab('settlements')}
            style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              padding: '10px', 
              borderRadius: '8px', 
              border: 'none',
              backgroundColor: activeTab === 'settlements' ? COLORS.cardBg : 'transparent',
              color: activeTab === 'settlements' ? 'white' : COLORS.textMuted,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            <HandCoins size={18} /> Settlements
          </button>
        </div>
      )}

      {activeTab === 'expenses' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <StatCard label="Total spent" value={`₹${totalSpent.toLocaleString()}`} />
            <StatCard label="Your share" value={`₹${userOwed.toLocaleString()}`} color={COLORS.amber} />
            <StatCard label="Net Balance" value={`${userBalance >= 0 ? '+' : '-'}₹${Math.abs(userBalance).toLocaleString()}`} color={userBalance >= 0 ? COLORS.accent : COLORS.red} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {expenses.length === 0 ? (
              <div style={{ 
                backgroundColor: COLORS.cardBg, 
                padding: '48px 24px', 
                textAlign: 'center', 
                color: COLORS.textMuted,
                borderRadius: '16px',
                border: `1px dashed ${COLORS.border}`
              }}>
                <Receipt size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                <p>No expenses yet. Add one to get started!</p>
              </div>
            ) : (
              expenses.slice(0, isPreview ? 3 : undefined).map((expense, idx) => (
                <div key={idx} style={{
                  backgroundColor: COLORS.cardBg,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  borderRadius: '16px',
                  border: `1px solid ${COLORS.border}`,
                  transition: 'transform 0.2s',
                  cursor: 'default'
                }}>
                  <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      backgroundColor: 'rgba(255,255,255,0.05)', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '24px',
                      border: `1px solid ${COLORS.border}`
                  }}>
                      {CATEGORY_EMOJI[expense.category] || '💰'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>{expense.title}</h4>
                    <p style={{ color: COLORS.textMuted, fontSize: '13px' }}>
                      Paid by <span style={{ color: COLORS.textPrimary }}>{expense.paidBy.name}</span> • {expense.splitBetween.length} people
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>₹{expense.amount.toLocaleString()}</div>
                      {expense.splitBetween.some((s: any) => String(s.userId) === String(currentUserId)) && (
                        <div style={{ 
                            backgroundColor: String(expense.paidBy.userId) === String(currentUserId) ? 'rgba(29, 158, 117, 0.1)' : 'rgba(239, 159, 39, 0.1)', 
                            color: String(expense.paidBy.userId) === String(currentUserId) ? COLORS.accent : COLORS.amber, 
                            fontSize: '11px', 
                            padding: '2px 8px', 
                            borderRadius: '4px', 
                            fontWeight: 'bold',
                            marginTop: '4px'
                        }}>
                            {String(expense.paidBy.userId) === String(currentUserId) ? 'you lent' : 'you owe'} ₹{(expense.splitBetween.find((s: any) => String(s.userId) === String(currentUserId))?.share || 0).toLocaleString()}
                        </div>
                      )}
                    </div>
                    {!isPreview && (
                      <button 
                        onClick={() => handleDeleteExpense(expense.id)}
                        style={{ background: 'none', border: 'none', color: COLORS.red, cursor: 'pointer', padding: '8px', borderRadius: '8px', opacity: 0.6 }}
                        onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                        onMouseOut={(e) => e.currentTarget.style.opacity = '0.6'}
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <SettlementDashboard 
          settlements={settlements} 
          netBalances={netBalances} 
          currentUser={mongoUser} 
        />
      )}

      {showAddModal && (
        <AddBudgetExpenseModal 
          tripId={trip._id} 
          members={trip.members}
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => {
            setShowAddModal(false);
            fetchData();
          }} 
        />
      )}
    </div>
  );
};

const StatCard = ({ label, value, color = COLORS.textPrimary }: any) => (
  <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid ${COLORS.border}`, borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
    <div style={{ fontSize: '20px', fontWeight: 'bold', color, marginBottom: '6px' }}>{value}</div>
    <div style={{ color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>{label}</div>
  </div>
);

export default ExpensePanel;
