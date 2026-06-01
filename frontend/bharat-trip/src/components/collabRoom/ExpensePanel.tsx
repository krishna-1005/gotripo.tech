import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Receipt, HandCoins, Trash2, Utensils, Car, Home, Ticket, HelpCircle } from 'lucide-react';
import { fetchBudget, deleteExpense } from '@/lib/api';
import AddBudgetExpenseModal from '@/components/collabRoom/modals/AddBudgetExpenseModal';
import SettlementDashboard from '@/components/collabRoom/SettlementDashboard';
import { useAuth } from '@/components/AuthProvider';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORY_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  food: Utensils,
  transport: Car,
  stay: Home,
  activity: Ticket,
  other: HelpCircle
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
    <div className="flex justify-center items-center h-[200px]">
      <Loader2 className="animate-spin text-purple-500" size={32} />
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
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-display">Group Expenses</h2>
        </div>
        {!isPreview && (
            <button 
                onClick={() => setShowAddModal(true)}
                className="bg-purple-600 text-white border-none px-5 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 font-semibold text-sm shadow-lg shadow-purple-500/20 hover:bg-purple-500 transition-colors"
            >
                <Plus size={18} /> Add expense
            </button>
        )}
      </div>

      {!isPreview && (
        <div className="flex gap-2 mb-6 bg-secondary/30 p-1 rounded-xl border border-border">
          <button 
            onClick={() => setActiveTab('expenses')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-none cursor-pointer font-semibold text-sm transition-all",
              activeTab === 'expenses' ? "bg-card text-foreground shadow-sm" : "bg-transparent text-muted-foreground"
            )}
          >
            <Receipt size={18} /> Expenses
          </button>
          <button 
            onClick={() => setActiveTab('settlements')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-none cursor-pointer font-semibold text-sm transition-all",
              activeTab === 'settlements' ? "bg-card text-foreground shadow-sm" : "bg-transparent text-muted-foreground"
            )}
          >
            <HandCoins size={18} /> Settlements
          </button>
        </div>
      )}

      {activeTab === 'expenses' ? (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard label="Total spent" value={`₹${totalSpent.toLocaleString()}`} />
            <StatCard label="Your share" value={`₹${userOwed.toLocaleString()}`} color="text-amber-500" />
            <StatCard label="Net Balance" value={`${userBalance >= 0 ? '+' : '-'}₹${Math.abs(userBalance).toLocaleString()}`} color={userBalance >= 0 ? "text-emerald-500" : "text-red-500"} />
          </div>

          <div className="flex flex-col gap-3">
            {expenses.length === 0 ? (
              <div className="bg-secondary/30 p-12 text-center text-muted-foreground rounded-2xl border border-dashed border-border">
                <Receipt size={48} className="mb-4 opacity-20 mx-auto" />
                <p>No expenses yet. Add one to get started!</p>
              </div>
            ) : (
              expenses.slice(0, isPreview ? 3 : undefined).map((expense, idx) => (
                <div key={idx} className="bg-secondary/30 p-4 px-5 flex items-center gap-4 rounded-2xl border border-border transition-transform cursor-default hover:bg-secondary/50">
                  <div className="w-12 h-12 bg-secondary/50 rounded-xl flex items-center justify-center text-2xl border border-border">
                      {React.createElement(CATEGORY_ICON[expense.category] || HelpCircle, { className: "size-5 text-muted-foreground" })}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-bold mb-1">{expense.title}</h4>
                    <p className="text-muted-foreground text-[13px]">
                      Paid by <span className="text-foreground">{expense.paidBy.name}</span> • {expense.splitBetween.length} people
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <div className="text-lg font-bold">₹{expense.amount.toLocaleString()}</div>
                      {expense.splitBetween.some((s: any) => String(s.userId) === String(currentUserId)) && (
                        <div className={cn(
                          "text-[11px] px-2 py-0.5 rounded font-bold mt-1 inline-block",
                          String(expense.paidBy.userId) === String(currentUserId)
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-amber-500/10 text-amber-500"
                        )}>
                            {String(expense.paidBy.userId) === String(currentUserId) ? 'you lent' : 'you owe'} ₹{(expense.splitBetween.find((s: any) => String(s.userId) === String(currentUserId))?.share || 0).toLocaleString()}
                        </div>
                      )}
                    </div>
                    {!isPreview && (
                      <button 
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="bg-transparent border-none text-red-500 cursor-pointer p-2 rounded-lg opacity-60 hover:opacity-100 transition-opacity"
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

const StatCard = ({ label, value, color = "text-foreground" }: { label: string, value: string, color?: string }) => (
  <div className="bg-secondary/30 border border-border rounded-2xl p-5 text-center">
    <div className={cn("text-xl font-bold mb-1.5", color)}>{value}</div>
    <div className="text-muted-foreground text-[11px] uppercase font-bold tracking-wider">{label}</div>
  </div>
);

export default ExpensePanel;
