import React, { useState, useEffect } from 'react';
import { X, Loader2, Check } from 'lucide-react';
import { addExpense } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AddBudgetExpenseModal = ({ tripId, members, onClose, onSuccess }: any) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [category, setCategory] = useState('food');
  const [paidBy, setPaidBy] = useState(members[0] || {});
  const [splitBetween, setSplitBetween] = useState(members.map(m => ({ ...m, share: 0 })));
  const [isEqualSplit, setIsEqualSplit] = useState(true);

  // Update equal split shares when amount or split members change
  useEffect(() => {
    if (isEqualSplit) {
      const selectedMembers = splitBetween.filter(m => m.selected);
      const totalAmount = parseFloat(amount) || 0;
      const share = totalAmount / (selectedMembers.length || 1);
      setSplitBetween(prev => prev.map(m => ({
        ...m,
        share: m.selected ? parseFloat(share.toFixed(2)) : 0
      })));
    }
  }, [amount, isEqualSplit, splitBetween.filter(m => m.selected).length]);

  const handleToggleMember = (userId: string) => {
    setSplitBetween(prev => prev.map(m => {
      const mId = m.userId?._id || m.userId;
      return mId === userId ? { ...m, selected: !m.selected } : m;
    }));
  };

  const handleCustomShareChange = (userId: string, value: string) => {
    const share = parseFloat(value) || 0;
    setSplitBetween(prev => prev.map(m => {
      const mId = m.userId?._id || m.userId;
      return mId === userId ? { ...m, share } : m;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) {
      toast.error('Please fill in title and amount');
      return;
    }

    const selectedMembers = splitBetween.filter(m => m.selected);
    if (selectedMembers.length === 0) {
      toast.error('Please select at least one person to split with');
      return;
    }

    // Validate custom split sum
    if (!isEqualSplit) {
      const totalShare = splitBetween.reduce((sum, m) => sum + m.share, 0);
      if (Math.abs(totalShare - parseFloat(amount)) > 0.1) {
        toast.error(`Total shares (₹${totalShare}) must equal total amount (₹${amount})`);
        return;
      }
    }

    setLoading(true);
    try {
      const pId = paidBy.userId?._id || paidBy.userId;
      const pName = paidBy.userId?.name || paidBy.userName || paidBy.name || 'Unknown';

      const expenseData = {
        title,
        amount: parseFloat(amount),
        currency,
        category,
        paidBy: {
          userId: pId,
          name: pName
        },
        splitBetween: selectedMembers.map(m => ({
          userId: m.userId?._id || m.userId,
          name: m.userId?.name || m.userName || m.name || 'Unknown',
          share: m.share
        }))
      };

      await addExpense(tripId, expenseData);
      toast.success('Expense added successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to add expense');
      setLoading(false);
    }
  };

  // Ensure members have 'selected' property initially
  useEffect(() => {
    if (members && members.length > 0) {
      setSplitBetween(members.map(m => ({ ...m, selected: true, share: 0 })));
      setPaidBy(members[0]);
    }
  }, [members]);

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-card border border-border rounded-[20px] w-[480px] max-h-[90vh] overflow-y-auto p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold font-display">Add Expense</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer p-2 rounded-lg hover:bg-secondary transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Title</label>
            <input 
              autoFocus
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did you pay for?"
              className="w-full bg-secondary/50 border border-border text-foreground p-3 px-4 rounded-xl text-base outline-none focus:border-ring transition-colors"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-[2]">
              <label className="block text-[13px] font-semibold text-muted-foreground mb-2 uppercase">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <input 
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-secondary/50 border border-border text-foreground p-3 pl-8 pr-4 rounded-xl text-base outline-none focus:border-ring transition-colors"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-[13px] font-semibold text-muted-foreground mb-2 uppercase">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-secondary/50 border border-border text-foreground p-3 rounded-xl text-[15px] outline-none focus:border-ring transition-colors"
              >
                <option value="food">Food</option>
                <option value="transport">Transport</option>
                <option value="stay">Stay</option>
                <option value="activity">Activity</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-muted-foreground mb-2 uppercase">Paid By</label>
            <select 
              value={paidBy.userId?._id || paidBy.userId}
              onChange={(e) => setPaidBy(members.find(m => (m.userId?._id || m.userId) === e.target.value) || {})}
              className="w-full bg-secondary/50 border border-border text-foreground p-3 rounded-xl text-[15px] outline-none focus:border-ring transition-colors"
            >
              {members.map(m => {
                const mId = m.userId?._id || m.userId;
                const mName = m.userId?.name || m.userName || m.name || 'Unknown';
                return (
                  <option key={mId} value={mId}>{mName}</option>
                );
              })}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[13px] font-semibold text-muted-foreground uppercase">Split Between</label>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsEqualSplit(true)}
                  className={cn(
                    "text-[11px] px-2 py-1 rounded cursor-pointer border transition-colors",
                    isEqualSplit 
                      ? "bg-purple-600 text-white border-purple-600" 
                      : "bg-transparent text-muted-foreground border-border hover:border-purple-500/50"
                  )}
                >
                  Equal
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsEqualSplit(false)}
                  className={cn(
                    "text-[11px] px-2 py-1 rounded cursor-pointer border transition-colors",
                    !isEqualSplit 
                      ? "bg-purple-600 text-white border-purple-600" 
                      : "bg-transparent text-muted-foreground border-border hover:border-purple-500/50"
                  )}
                >
                  Custom
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {splitBetween.map(m => {
                const mId = m.userId?._id || m.userId;
                const mName = m.userId?.name || m.userName || m.name || 'Unknown';
                return (
                  <div key={mId} className="flex items-center gap-3 bg-secondary/50 p-2 px-3 rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => handleToggleMember(mId)}
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center cursor-pointer border transition-colors",
                        m.selected 
                          ? "bg-purple-600 border-purple-600 text-white" 
                          : "bg-transparent border-border"
                      )}
                    >
                      {m.selected && <Check size={14} />}
                    </button>
                    <span className="flex-1 text-sm">{mName}</span>
                    {m.selected && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">₹</span>
                        <input 
                          type="number"
                          disabled={isEqualSplit}
                          value={m.share}
                          onChange={(e) => handleCustomShareChange(mId, e.target.value)}
                          className={cn(
                            "w-20 text-foreground p-1 px-2 rounded-md text-sm text-right outline-none transition-colors",
                            isEqualSplit 
                              ? "bg-transparent border-transparent" 
                              : "bg-background border border-border"
                          )}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-purple-600 text-white border-none p-4 rounded-xl mt-3 font-bold text-base cursor-pointer flex justify-center items-center transition-transform shadow-lg shadow-purple-500/30 hover:bg-purple-500 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Save Expense'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBudgetExpenseModal;
