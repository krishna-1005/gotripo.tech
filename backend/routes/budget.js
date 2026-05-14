const express = require("express");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/protect");
const router = express.Router({ mergeParams: true });

// GET /api/trips/:tripId/budget — fetch all expenses + settlement summary
router.get("/", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const expenses = trip.expenses || [];
    const members = trip.members || [];
    
    // Calculate simple summary
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    // Settlement summary
    const { transactions, netBalances } = calculateSettlements(expenses, members);

    res.json({
      expenses,
      totalSpent,
      settlements: transactions,
      netBalances
    });
  } catch (error) {
    console.error("Fetch Budget Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/trips/:tripId/budget/expense — add new expense
router.post("/expense", protect, async (req, res) => {
  try {
    const { title, amount, currency, paidBy, splitBetween, category } = req.body;
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const newExpense = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      amount,
      currency: currency || "INR",
      paidBy,
      splitBetween,
      category,
      createdAt: new Date()
    };

    trip.expenses.push(newExpense);
    await trip.save();

    const { transactions, netBalances } = calculateSettlements(trip.expenses, trip.members);

    // Socket emission
    const io = req.app.get("io");
    if (io) {
      io.to(req.params.tripId).emit("expense:added", newExpense);
      io.to(req.params.tripId).emit("budget:updated", {
        expenses: trip.expenses,
        totalSpent: trip.expenses.reduce((sum, exp) => sum + exp.amount, 0),
        settlements: transactions,
        netBalances
      });
    }

    res.status(201).json(newExpense);
  } catch (error) {
    console.error("Add Expense Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/trips/:tripId/budget/expense/:id — remove expense
router.delete("/expense/:id", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const expenseIndex = trip.expenses.findIndex(exp => exp.id === req.params.id);
    if (expenseIndex === -1) return res.status(404).json({ error: "Expense not found" });

    const deletedExpenseId = req.params.id;
    trip.expenses.splice(expenseIndex, 1);
    await trip.save();

    const { transactions, netBalances } = calculateSettlements(trip.expenses, trip.members);

    // Socket emission
    const io = req.app.get("io");
    if (io) {
      io.to(req.params.tripId).emit("expense:deleted", deletedExpenseId);
      io.to(req.params.tripId).emit("budget:updated", {
        expenses: trip.expenses,
        totalSpent: trip.expenses.reduce((sum, exp) => sum + exp.amount, 0),
        settlements: transactions,
        netBalances
      });
    }

    res.json({ message: "Expense deleted" });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/trips/:tripId/budget/settle — calculate who owes whom
router.get("/settle", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const { transactions, netBalances } = calculateSettlements(trip.expenses, trip.members);
    res.json({ transactions, netBalances });
  } catch (error) {
    console.error("Settle Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Enhanced Settlement Algorithm
function calculateSettlements(expenses, members) {
  const netBalances = {};

  // Initialize with all trip members
  members.forEach(m => {
    const userId = (m.userId._id || m.userId).toString();
    const name = m.userId.name || m.userName || m.name || "Unknown";
    netBalances[userId] = { balance: 0, name };
  });

  expenses.forEach(exp => {
    const payerId = exp.paidBy.userId.toString();
    const payerName = exp.paidBy.name;

    // Add what they paid
    if (!netBalances[payerId]) netBalances[payerId] = { balance: 0, name: payerName };
    netBalances[payerId].balance += exp.amount;

    // Subtract what they owe (their share)
    exp.splitBetween.forEach(split => {
      const splitId = split.userId.toString();
      if (!netBalances[splitId]) netBalances[splitId] = { balance: 0, name: split.name };
      netBalances[splitId].balance -= split.share;
    });
  });

  const creditors = [];
  const debtors = [];

  Object.keys(netBalances).forEach(userId => {
    const { balance, name } = netBalances[userId];
    if (balance > 0.01) {
      creditors.push({ userId, name, balance });
    } else if (balance < -0.01) {
      debtors.push({ userId, name, balance: Math.abs(balance) });
    }
  });

  // Sort to optimize greedy approach
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => b.balance - a.balance);

  const transactions = [];
  const tempCreditors = creditors.map(c => ({ ...c }));
  const tempDebtors = debtors.map(d => ({ ...d }));

  let i = 0, j = 0;
  while (i < tempCreditors.length && j < tempDebtors.length) {
    const amount = Math.min(tempCreditors[i].balance, tempDebtors[j].balance);
    
    transactions.push({
      fromId: tempDebtors[j].userId,
      from: tempDebtors[j].name,
      toId: tempCreditors[i].userId,
      to: tempCreditors[i].name,
      amount: parseFloat(amount.toFixed(2))
    });

    tempCreditors[i].balance -= amount;
    tempDebtors[j].balance -= amount;

    if (tempCreditors[i].balance < 0.01) i++;
    if (tempDebtors[j].balance < 0.01) j++;
  }

  return { transactions, netBalances };
}

module.exports = router;
