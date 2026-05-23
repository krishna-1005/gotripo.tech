import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  IndianRupee, 
  TrendingUp, 
  CreditCard, 
  Trash2, 
  Utensils, 
  Car, 
  Home, 
  Ticket, 
  MoreHorizontal,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { fetchBudget, deleteExpense } from '@/lib/api';
import { useAuth } from '@/components/AuthProvider';
import { useSocket } from '@/context/SocketContext';
import { cn } from '@/lib/utils';
import AddBudgetExpenseModal from './modals/AddBudgetExpenseModal';

const COLORS = {
  bg: '#0e0e10',
  card: '#141416',
  border: '#2a2a2e',
  green: '#1D9E75',
  coral: '#993C1D',
  purple: '#534AB7',
  text: '#e6edf3',
  textMuted: '#8b949e'
};

const CATEGORY_MAP: Record<string, { icon: any, color: string }> = {
  food: { icon: Utensils, color: '#ef9f27' },
  transport: { icon: Car, color: '#3b82f6' },
  stay: { icon: Home, color: '#8b5cf6' },
  activity: { icon: Ticket, color: '#14b8a6' },
  other: { icon: MoreHorizontal, color: '#6b7280' }
};

const BudgetTracker = ({ tripId, members }: { tripId: string, members: any[] }) => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();
  const socket = useSocket();

  const userId = user?.uid;

  const loadData = async () => {
    try {
      const data = await fetchBudget(tripId);
      setExpenses(data.expenses);
      setTotalSpent(data.totalSpent);
      setSettlements(data.settlements);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (socket) {
      socket.on('expense:added', () => loadData());
      socket.on('expense:deleted', () => loadData());
      socket.on('budget:updated', (data: any) => {
        setExpenses(data.expenses);
        setTotalSpent(data.totalSpent);
        setSettlements(data.settlements);
      });

      return () => {
        socket.off('expense:added');
        socket.off('expense:deleted');
        socket.off('budget:updated');
      };
    }
  }, [tripId, socket]);

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(tripId, id);
      toast.success('Expense deleted');
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  // Calculate user's specific stats
  const userPaid = expenses
    .filter(e => e.paidBy.userId === userId)
    .reduce((sum, e) => sum + e.amount, 0);
  
  const userOwed = expenses.reduce((sum, e) => {
    const userSplit = e.splitBetween.find((s: any) => s.userId === userId);
    return sum + (userSplit ? userSplit.share : 0);
  }, 0);

  const userBalance = userPaid - userOwed;

  if (loading) return <div className="p-8 text-center text-gray-500">Loading budget...</div>;

  return (
    <div className="rounded-3xl bg-card border border-border p-4 md:p-6 shadow-soft relative overflow-hidden mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="size-9 md:size-10 rounded-xl bg-primary-soft text-primary grid place-items-center shrink-0">
          <IndianRupee className="size-5" />
        </div>
        <div>
          <h2 className="font-display font-bold text-lg md:text-xl">Group Budget</h2>
          <p className="text-[10px] md:text-xs text-muted-foreground">Track expenses and settle balances</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard 
          icon={<IndianRupee size={16} />} 
          label="Total cost" 
          value={`₹${totalSpent.toLocaleString()}`} 
        />
        <MetricCard 
          icon={<TrendingUp size={16} />} 
          label="Your share" 
          value={`₹${userOwed.toLocaleString()}`} 
          color="text-purple-500"
        />
        <MetricCard 
          icon={<CreditCard size={16} />} 
          label="Balance" 
          value={`${userBalance >= 0 ? '+' : ''}₹${Math.abs(userBalance).toLocaleString()}`} 
          color={userBalance >= 0 ? "text-success" : "text-destructive"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Expense List */}
        <div>
          <h3 className="text-base font-bold mb-4 flex items-center gap-2">
            Expenses <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full">{expenses.length}</span>
          </h3>
          <div className="flex flex-col gap-3">
            {expenses.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                No expenses yet.
              </div>
            ) : (
              expenses.map((expense) => (
                <ExpenseItem 
                  key={expense.id} 
                  expense={expense} 
                  onDelete={() => handleDelete(expense.id)}
                  currentUserId={userId}
                />
              ))
            )}
          </div>
        </div>

        {/* Settle Up Panel */}
        <div>
          <h3 className="text-base font-bold mb-4">Settle Up</h3>
          <div className="flex flex-col gap-3">
            {settlements.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground bg-secondary/5 rounded-xl border border-border">
                All settled!
              </div>
            ) : (
              settlements.map((s, idx) => (
                <SettlementCard key={idx} settlement={s} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        className="absolute top-4 md:top-6 right-4 md:right-6 size-10 rounded-xl bg-primary text-white shadow-cta grid place-items-center hover:scale-105 active:scale-95 transition-all"
        title="Add Expense"
      >
        <Plus size={20} />
      </button>

      {showModal && (
        <AddBudgetExpenseModal 
          tripId={tripId} 
          members={members} 
          onClose={() => setShowModal(false)} 
          onSuccess={() => {
            setShowModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
};

const MetricCard = ({ icon, label, value, color = "text-foreground" }: any) => (
  <div className="bg-secondary/10 border border-border rounded-2xl p-4 flex flex-col gap-1">
    <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
      {icon} {label}
    </div>
    <div className={cn("text-xl font-bold", color)}>{value}</div>
  </div>
);

const ExpenseItem = ({ expense, onDelete, currentUserId }: any) => {
  const CategoryIcon = CATEGORY_MAP[expense.category]?.icon || MoreHorizontal;
  const categoryColor = CATEGORY_MAP[expense.category]?.color || "#888";

  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <div 
        className="size-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
      >
        <CategoryIcon size={20} />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <h4 className="font-bold text-sm truncate">{expense.title}</h4>
        <div className="flex items-center gap-2 mt-1">
          <div className="size-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {expense.paidBy.name[0]}
          </div>
          <span className="text-[10px] text-muted-foreground truncate">
            Paid by {expense.paidBy.name} • {expense.splitBetween.length} people
          </span>
        </div>
      </div>

      <div className="text-right flex items-center gap-4 shrink-0">
        <div>
          <div className="font-bold text-sm md:text-base">₹{expense.amount.toLocaleString()}</div>
          <div className="text-[10px] text-muted-foreground">{new Date(expense.createdAt).toLocaleDateString()}</div>
        </div>
        {expense.paidBy.userId === currentUserId && (
          <button 
            onClick={onDelete}
            className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

const SettlementCard = ({ settlement }: any) => (
  <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
    <div className="text-xs">
      <span className="font-bold">{settlement.from}</span>
      <span className="text-muted-foreground mx-2">owes</span>
      <span className="font-bold">{settlement.to}</span>
    </div>
    <div className="flex items-center justify-between">
      <div className="text-destructive font-bold text-sm md:text-base">₹{settlement.amount.toLocaleString()}</div>
      <button className="bg-success/10 text-success px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-success hover:text-white transition-all">
        <CheckCircle2 size={14} /> Paid
      </button>
    </div>
  </div>
);

export default BudgetTracker;
