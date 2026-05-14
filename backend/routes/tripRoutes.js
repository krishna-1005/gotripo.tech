const express = require("express");
const Trip = require("../models/Trip");
const { protect } = require("../middleware/protect");
const supplierOrchestrator = require("../services/supplierOrchestrator");

const { suggestDestinations } = require("../services/aiDestinations");

const router = express.Router();

/* BUDGET: FETCH ALL */
router.get("/:tripId/budget", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const expenses = trip.expenses || [];
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const settlements = calculateSettlements(expenses);

    res.json({ expenses, totalSpent, settlements });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* BUDGET: ADD EXPENSE */
router.post("/:tripId/budget/expense", protect, async (req, res) => {
  try {
    const { title, amount, currency, paidBy, splitBetween, category } = req.body;
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const newExpense = {
      id: Math.random().toString(36).substr(2, 9),
      title, amount, currency: currency || "INR",
      paidBy, splitBetween, category, createdAt: new Date()
    };

    trip.expenses.push(newExpense);
    await trip.save();

    const io = req.app.get("io");
    if (io) {
      io.to(req.params.tripId).emit("expense:added", newExpense);
      io.to(req.params.tripId).emit("budget:updated", {
        expenses: trip.expenses,
        totalSpent: trip.expenses.reduce((sum, exp) => sum + exp.amount, 0),
        settlements: calculateSettlements(trip.expenses)
      });
    }

    res.status(201).json(newExpense);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* BUDGET: DELETE EXPENSE */
router.delete("/:tripId/budget/expense/:id", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const expenseIndex = trip.expenses.findIndex(exp => exp.id === req.params.id);
    if (expenseIndex === -1) return res.status(404).json({ error: "Expense not found" });

    trip.expenses.splice(expenseIndex, 1);
    await trip.save();

    const io = req.app.get("io");
    if (io) {
      io.to(req.params.tripId).emit("expense:deleted", req.params.id);
      io.to(req.params.tripId).emit("budget:updated", {
        expenses: trip.expenses,
        totalSpent: trip.expenses.reduce((sum, exp) => sum + exp.amount, 0),
        settlements: calculateSettlements(trip.expenses)
      });
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* BUDGET: SETTLE */
router.get("/:tripId/budget/settle", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(calculateSettlements(trip.expenses));
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

function calculateSettlements(expenses) {
  const netBalances = {};
  expenses.forEach(exp => {
    const payerId = exp.paidBy.userId;
    netBalances[payerId] = netBalances[payerId] || { balance: 0, name: exp.paidBy.name };
    netBalances[payerId].balance += exp.amount;
    exp.splitBetween.forEach(split => {
      netBalances[split.userId] = netBalances[split.userId] || { balance: 0, name: split.name };
      netBalances[split.userId].balance -= split.share;
    });
  });

  const creditors = [], debtors = [];
  Object.keys(netBalances).forEach(userId => {
    const { balance, name } = netBalances[userId];
    if (balance > 0.01) creditors.push({ name, balance });
    else if (balance < -0.01) debtors.push({ name, balance: Math.abs(balance) });
  });

  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => b.balance - a.balance);

  const transactions = [];
  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const amount = Math.min(creditors[i].balance, debtors[j].balance);
    transactions.push({ from: debtors[j].name, to: creditors[i].name, amount: parseFloat(amount.toFixed(2)) });
    creditors[i].balance -= amount; debtors[j].balance -= amount;
    if (creditors[i].balance < 0.01) i++;
    if (debtors[j].balance < 0.01) j++;
  }
  return transactions;
}

/* DESTINATION BOARD: FETCH ALL */
router.get("/:tripId/destinations", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip.destinations || []);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* DESTINATION BOARD: ADD SUGGESTION */
router.post("/:tripId/destinations", protect, async (req, res) => {
  try {
    const { name, country, description, imageUrl, tags, aiScore } = req.body;
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const newDestination = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      country,
      description,
      imageUrl: imageUrl || `https://source.unsplash.com/featured/?${encodeURIComponent(name)}`,
      suggestedBy: {
        userId: req.user._id.toString(),
        name: req.user.name || "Traveller"
      },
      tags: tags || [],
      aiScore: aiScore || 0,
      status: 'suggested',
      upvotes: [],
      downvotes: [],
      createdAt: new Date()
    };

    trip.destinations.push(newDestination);
    await trip.save();

    const io = req.app.get("io");
    if (io) io.to(req.params.tripId).emit("destination:added", trip.destinations);

    res.status(201).json(newDestination);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* DESTINATION BOARD: VOTE */
router.post("/:tripId/destinations/:id/vote", protect, async (req, res) => {
  try {
    const { voteType } = req.body;
    const userId = req.user._id.toString();
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const dest = trip.destinations.find(d => d.id === req.params.id);
    if (!dest) return res.status(404).json({ error: "Destination not found" });

    if (voteType === 'up') {
      const upIdx = dest.upvotes.indexOf(userId);
      if (upIdx > -1) dest.upvotes.splice(upIdx, 1);
      else {
        dest.upvotes.push(userId);
        const downIdx = dest.downvotes.indexOf(userId);
        if (downIdx > -1) dest.downvotes.splice(downIdx, 1);
      }
    } else if (voteType === 'down') {
      const downIdx = dest.downvotes.indexOf(userId);
      if (downIdx > -1) dest.downvotes.splice(downIdx, 1);
      else {
        dest.downvotes.push(userId);
        const upIdx = dest.upvotes.indexOf(userId);
        if (upIdx > -1) dest.upvotes.splice(upIdx, 1);
      }
    }

    // Update status logic
    const scores = trip.destinations.map(d => d.upvotes.length - d.downvotes.length);
    const maxVotes = Math.max(...scores);
    trip.destinations.forEach(d => {
      if (d.status !== 'locked') {
        const score = d.upvotes.length - d.downvotes.length;
        d.status = (score === maxVotes && score > 0) ? 'leading' : 'suggested';
      }
    });

    await trip.save();
    const io = req.app.get("io");
    if (io) io.to(req.params.tripId).emit("destination:voted", trip.destinations);

    res.json(dest);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* DESTINATION BOARD: LOCK */
router.put("/:tripId/destinations/:id/lock", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only trip creator can lock destination" });
    }

    const dest = trip.destinations.find(d => d.id === req.params.id);
    if (!dest) return res.status(404).json({ error: "Destination not found" });

    trip.destinations.forEach(d => {
      d.status = d.id === req.params.id ? 'locked' : 'suggested';
    });
    trip.destination = dest.name;
    
    await trip.save();
    const io = req.app.get("io");
    if (io) io.to(req.params.tripId).emit("destination:locked", trip.destinations);

    res.json(dest);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* DESTINATION BOARD: DELETE */
router.delete("/:tripId/destinations/:id", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const destIdx = trip.destinations.findIndex(d => d.id === req.params.id);
    if (destIdx === -1) return res.status(404).json({ error: "Destination not found" });

    const dest = trip.destinations[destIdx];
    const isOwner = trip.userId.toString() === req.user._id.toString();
    const isSuggester = dest.suggestedBy.userId === req.user._id.toString();

    if (!isOwner && !isSuggester) {
      return res.status(403).json({ error: "Unauthorized: only the owner or suggester can remove this" });
    }

    trip.destinations.splice(destIdx, 1);
    await trip.save();
    const io = req.app.get("io");
    if (io) io.to(req.params.tripId).emit("destination:deleted", trip.destinations);

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* DESTINATION BOARD: AI SUGGEST */
router.post("/:tripId/destinations/ai-suggest", protect, async (req, res) => {
  try {
    const { groupSize, budget, travelStyle, vibeTags } = req.body;
    const suggestions = await suggestDestinations({ groupSize, budget, travelStyle, vibeTags });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* SAVE TRIP */
router.post("/", protect, async (req, res) => {
  try {

    const { title, destination, days, itinerary, isPublic, image, ...rest } = req.body;

    const trip = await Trip.create({
      userId: req.user._id,
      createdBy: req.user._id, 
      isGuest: false,
      title,
      destination,
      days,
      itinerary,
      isPublic: isPublic || false,
      image: image || "",
      members: [{
        userId: req.user._id,
        role: "organizer",
        rsvp: "confirmed"
      }],
      ...rest
    });

    console.log(`[TRIP CREATED] User: ${req.user.email}, isGuest: ${trip.isGuest}`);
    res.status(201).json(trip);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while saving trip" });
  }
});

/* LIKE TRIP */
router.post("/:id/like", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const index = trip.likes.indexOf(req.user._id);
    if (index === -1) {
      trip.likes.push(req.user._id);
    } else {
      trip.likes.splice(index, 1);
    }

    await trip.save();
    res.json({ likes: trip.likes.length, isLiked: trip.likes.includes(req.user._id) });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* GET USER TRIPS (OWNED & JOINED) */
router.get("/", protect, async (req, res) => {
  try {
    const { type } = req.query;
    
    // Base query: trips where user is owner OR a member
    let query = {
      $or: [
        { userId: req.user._id },
        { "members.userId": req.user._id }
      ]
    };

    // Strict type filtering
    if (type) {
      query = {
        $and: [
          query,
          { type: type }
        ]
      };
    }

    const trips = await Trip.find(query).sort({ createdAt: -1 });

    res.json(trips);
  } catch (error) {
    console.error("Fetch Trips Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET TRIP BY ID (PUBLIC) */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid plan ID format" });
    }

    const trip = await Trip.findById(id).populate("members.userId", "name photo");
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* JOIN TRIP */
router.post("/:id/join", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const userId = req.user._id;
    const userName = req.user.name || "Traveller";

    // Check if user is already a member
    const isMember = trip.members.some(m => m.userId && m.userId.toString() === userId.toString());
    if (!isMember) {
      trip.members.push({ userId }); // Push only what's in the schema
      await trip.save();
    }
    res.json(trip);
  } catch (error) {
    console.error("Join Trip Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* CHECKLIST: ADD ITEM */
router.post("/:id/checklist", protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Item text is required" });

    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // Authorization check
    const isOwner = trip.userId && trip.userId.toString() === req.user._id.toString();
    const isMember = trip.members.some(m => m.userId === (req.user.firebaseUid || req.user._id.toString()));
    if (!isOwner && !isMember) return res.status(403).json({ error: "Not authorized" });

    trip.checklist.push({ text });
    await trip.save();
    res.status(201).json(trip.checklist);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* CHECKLIST: TOGGLE ITEM */
router.patch("/:id/checklist/:itemId", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const isOwner = trip.userId && trip.userId.toString() === req.user._id.toString();
    const isMember = trip.members.some(m => m.userId === (req.user.firebaseUid || req.user._id.toString()));
    if (!isOwner && !isMember) return res.status(403).json({ error: "Not authorized" });

    const item = trip.checklist.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    item.isCompleted = !item.isCompleted;
    
    // Assign to the user who toggled it if it's being completed
    if (item.isCompleted) {
      item.assignedTo = {
        userId: req.user.firebaseUid || req.user._id.toString(),
        userName: req.user.name || "Traveller"
      };
    } else {
      item.assignedTo = undefined;
    }

    await trip.save();
    res.json(trip.checklist);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* CHECKLIST: DELETE ITEM */
router.delete("/:id/checklist/:itemId", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const isOwner = trip.userId && trip.userId.toString() === req.user._id.toString();
    const isMember = trip.members.some(m => m.userId === (req.user.firebaseUid || req.user._id.toString()));
    if (!isOwner && !isMember) return res.status(403).json({ error: "Not authorized" });

    trip.checklist = trip.checklist.filter(item => item._id.toString() !== req.params.itemId);
    await trip.save();
    res.json(trip.checklist);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* UPDATE TRIP */
router.patch("/:id", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // Authorization: Only owner or organizer can update
    const isOwner = trip.userId.toString() === req.user._id.toString();
    const isOrganizer = trip.members.some(m => m.userId && m.userId.toString() === req.user._id.toString() && m.role === 'organizer');

    if (!isOwner && !isOrganizer) {
      return res.status(403).json({ error: "Not authorized to update this trip" });
    }

    const { startDate, title, destination } = req.body;
    
    if (startDate) {
      trip.startDate = new Date(startDate);
      // 1. Update Trip.itinerary dates
      if (trip.itinerary && trip.itinerary.length > 0) {
        trip.itinerary.forEach((day, idx) => {
          const newDate = new Date(trip.startDate);
          newDate.setDate(newDate.getDate() + idx);
          day.date = newDate.toISOString();
        });
        trip.markModified('itinerary');
      }

      // 2. ALSO update separate Itinerary collection dates if it exists
      try {
        const Itinerary = require("../models/Itinerary");
        const standaloneItinerary = await Itinerary.findOne({ tripId: trip._id });
        if (standaloneItinerary && standaloneItinerary.days) {
          standaloneItinerary.days.forEach((day, idx) => {
            const newDate = new Date(trip.startDate);
            newDate.setDate(newDate.getDate() + idx);
            day.date = newDate;
          });
          await standaloneItinerary.save();
          console.log(`[SYNC] Updated dates for standalone Itinerary ${standaloneItinerary._id}`);
        }
      } catch (err) {
        console.warn("[SYNC ERROR] Could not sync standalone itinerary:", err.message);
      }
    }
    
    if (title) trip.title = title;
    if (destination) trip.destination = destination;

    await trip.save();
    
    const io = req.app.get("io");
    if (io) io.to(req.params.id).emit("trip:updated", trip);

    res.json(trip);
  } catch (error) {
    console.error("Update Trip Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* DELETE TRIP */
router.delete("/:id", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // Authorization: Only owner can delete
    if (trip.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to delete this trip" });
    }

    await trip.deleteOne();
    res.json({ message: "Trip deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* EXECUTE REBOOKING REVISION */
router.post("/:id/execute-revision", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    // Authorization check: Only trip owner or a member can execute revision
    const isOwner = trip.userId && trip.userId.toString() === req.user._id.toString();
    const isMember = trip.members.some(m => m.userId === (req.user.firebaseUid || req.user._id.toString()));
    
    if (!isOwner && !isMember) {
      return res.status(403).json({ error: "Not authorized to execute revision for this trip" });
    }

    // If revision already cleared, assume success (idempotency)
    if (!trip.pendingRevision) {
      console.log(`ℹ️ Trip ${trip._id} already has no pending revision. Likely already executed.`);
      return res.json({ success: true, message: "Revision already applied or cleared." });
    }

    console.log(`⚡ Executing rebooking for Trip ${trip._id}`);
    
    // 1. Commit the revision and update costs
    const revision = trip.pendingRevision;
    if (revision && revision.itinerary && revision.itinerary.length > 0) {
      console.log(`📝 Applying salvaged itinerary with ${revision.itinerary.length} days.`);
      
      // Map and ensure we preserve the new AI-calculated times
      const newItinerary = revision.itinerary.map(day => ({
        day: day.day,
        estimatedHours: day.estimatedHours,
        estimatedCost: day.estimatedCost,
        places: day.places.map(p => {
          const po = p.toObject ? p.toObject() : p;
          return {
            ...po,
            bestTime: p.bestTime,
            timeReason: p.timeReason
          };
        })
      }));
      
      // Use trip.set to ensure Mongoose tracks the entire itinerary update
      trip.set('itinerary', newItinerary);
      
      // Recalculate total cost from the new itinerary
      let newTotalCost = 0;
      newItinerary.forEach(day => {
        if (day.places) {
          day.places.forEach(p => {
            newTotalCost += Number(p.estimatedCost || 0);
          });
        }
      });
      trip.totalTripCost = newTotalCost;
    } else {
       console.error(`❌ Rebooking failed: Salvaged itinerary is empty for Trip ${trip._id}`);
       // Safety: clear the corrupted revision without applying
       trip.pendingRevision = undefined;
       await trip.save();
       return res.status(400).json({ error: "Salvaged itinerary was empty. Alert cleared but not applied." });
    }
    
    // 2. Clear revision data ON THE OBJECT so .save() removes it from DB
    trip.set('pendingRevision', undefined);

    // 3. Fire the Orchestrator
    await supplierOrchestrator.executeNotifications(trip);

    await trip.save();
    console.log(`✅ Trip ${trip._id} successfully updated and revision cleared.`);

    res.json({ success: true, message: "Rebooking blueprint executed successfully" });

  } catch (error) {
    console.error("Rebooking Execution Error:", error);
    res.status(500).json({ error: "Server error executing rebooking" });
  }
});

/* UPDATE MEMBER RSVP */
router.patch("/:tripId/members/:userId/rsvp", protect, async (req, res) => {
  try {
    const { tripId, userId } = req.params;
    const { rsvp } = req.body;

    if (!["confirmed", "awaiting"].includes(rsvp)) {
      return res.status(400).json({ error: "Invalid RSVP status" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const member = trip.members.find(m => m.userId.toString() === userId);
    if (!member) return res.status(404).json({ error: "Member not found" });

    // Only the user themselves can update their RSVP
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized to update RSVP for another user" });
    }

    member.rsvp = rsvp;
    await trip.save();
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* UPDATE MEMBER ROLE */
router.patch("/:tripId/members/:userId/role", protect, async (req, res) => {
  try {
    const { tripId, userId } = req.params;
    const { role } = req.body;

    if (!["organizer", "member"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // Only organizers can update roles
    const currentUserMember = trip.members.find(m => m.userId.toString() === req.user._id.toString());
    const isOwner = trip.createdBy && trip.createdBy.toString() === req.user._id.toString();
    
    if (!isOwner && (!currentUserMember || currentUserMember.role !== "organizer")) {
      return res.status(403).json({ error: "Only organizers can update member roles" });
    }

    const member = trip.members.find(m => m.userId.toString() === userId);
    if (!member) return res.status(404).json({ error: "Member not found" });

    member.role = role;
    await trip.save();
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* COLLABORATIVE: ADD SUGGESTION */
router.post("/:tripId/suggestions", protect, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { title, description, tags, initials, color } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const suggestion = {
      title,
      description,
      tags,
      addedBy: {
        userId: req.user._id.toString(),
        userName: req.user.name || "Traveller",
        initials: initials || (req.user.name ? req.user.name[0] : "T"),
        color: color || "bg-primary"
      },
      upvotes: [],
      downvotes: []
    };

    trip.suggestions.push(suggestion);
    await trip.save();
    res.status(201).json(trip.suggestions[trip.suggestions.length - 1]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* COLLABORATIVE: VOTE ON SUGGESTION */
router.post("/:tripId/suggestions/:suggestionId/vote", protect, async (req, res) => {
  try {
    const { tripId, suggestionId } = req.params;
    const { voteType } = req.body; // 'up' or 'down'
    const userId = req.user._id.toString();

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const suggestion = trip.suggestions.id(suggestionId);
    if (!suggestion) return res.status(404).json({ error: "Suggestion not found" });

    // Toggle logic
    if (voteType === 'up') {
      const upIndex = suggestion.upvotes.indexOf(userId);
      if (upIndex > -1) {
        suggestion.upvotes.splice(upIndex, 1);
      } else {
        suggestion.upvotes.push(userId);
        // Remove from downvotes if exists
        const downIndex = suggestion.downvotes.indexOf(userId);
        if (downIndex > -1) suggestion.downvotes.splice(downIndex, 1);
      }
    } else if (voteType === 'down') {
      const downIndex = suggestion.downvotes.indexOf(userId);
      if (downIndex > -1) {
        suggestion.downvotes.splice(downIndex, 1);
      } else {
        suggestion.downvotes.push(userId);
        // Remove from upvotes if exists
        const upIndex = suggestion.upvotes.indexOf(userId);
        if (upIndex > -1) suggestion.upvotes.splice(upIndex, 1);
      }
    }

    await trip.save();
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* COLLABORATIVE: DELETE SUGGESTION */
router.delete("/:tripId/suggestions/:suggestionId", protect, async (req, res) => {
  try {
    const { tripId, suggestionId } = req.params;
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    trip.suggestions = trip.suggestions.filter(s => s._id.toString() !== suggestionId);
    await trip.save();
    res.json({ message: "Suggestion deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* COLLABORATIVE: PERSIST MESSAGE */
router.post("/:tripId/messages", protect, async (req, res) => {
  try {
    const { tripId } = req.params;
    const { text, initials, color } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const message = {
      userId: req.user._id.toString(),
      userName: req.user.name || "Traveller",
      initials: initials || (req.user.name ? req.user.name[0] : "T"),
      text,
      color: color || "bg-primary",
      timestamp: new Date()
    };

    trip.messages.push(message);
    await trip.save();
    res.status(201).json(trip.messages[trip.messages.length - 1]);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* SHARED ITINERARY: FETCH FULL */
router.get("/:tripId/itinerary", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip.itinerary || []);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* SHARED ITINERARY: ADD DAY */
router.post("/:tripId/itinerary/day", protect, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const newDayNum = (trip.itinerary?.length || 0) + 1;
    const newDay = {
      day: newDayNum,
      date: new Date().toISOString(),
      label: `Day ${newDayNum}`,
      theme: 'explore',
      activities: []
    };

    trip.itinerary.push(newDay);
    await trip.save();

    const io = req.app.get("io");
    if (io) io.to(req.params.tripId).emit("itinerary:updated", trip.itinerary);

    res.status(201).json(newDay);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* SHARED ITINERARY: DELETE DAY */
router.delete("/:tripId/itinerary/day/:dayIndex", protect, async (req, res) => {
  try {
    const { tripId } = req.params;
    const dayIndex = parseInt(req.params.dayIndex);

    console.log(`[DELETE DAY] Trip: ${tripId}, Index: ${dayIndex}`);

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (isNaN(dayIndex) || !trip.itinerary || !trip.itinerary[dayIndex]) {
      console.error(`[DELETE DAY ERROR] Invalid day index: ${dayIndex}`);
      return res.status(400).json({ error: "Invalid day index" });
    }

    trip.itinerary.splice(dayIndex, 1);
    
    // Re-index days
    trip.itinerary.forEach((day, i) => {
      day.day = i + 1;
      day.label = `Day ${i + 1}`;
    });

    trip.markModified('itinerary');
    await trip.save();

    console.log(`[DELETE DAY SUCCESS] Remaining days: ${trip.itinerary.length}`);

    const io = req.app.get("io");
    if (io) io.to(tripId).emit("itinerary:updated", trip.itinerary);

    res.json(trip.itinerary);
  } catch (error) {
    console.error(`[DELETE DAY CRASH] ${error.message}`, error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

/* SHARED ITINERARY: ADD ACTIVITY */
router.post("/:tripId/itinerary/day/:dayIndex/activity", protect, async (req, res) => {
  try {
    const { tripId, dayIndex } = req.params;
    const { time, title, location, type, notes } = req.body;
    
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (!trip.itinerary[dayIndex]) return res.status(404).json({ error: "Day not found" });

    const newActivity = {
      time, title, location, type, notes,
      addedBy: {
        userId: req.user._id.toString(),
        name: req.user.name || "Traveller"
      },
      order: trip.itinerary[dayIndex].activities.length
    };

    trip.itinerary[dayIndex].activities.push(newActivity);
    await trip.save();
    
    // Get the last added activity to return its _id
    const savedActivity = trip.itinerary[dayIndex].activities[trip.itinerary[dayIndex].activities.length - 1];

    const io = req.app.get("io");
    if (io) {
      io.to(tripId).emit("itinerary:activityAdded", { dayIndex, activity: savedActivity });
      io.to(tripId).emit("itinerary:updated", trip.itinerary);
    }

    res.status(201).json(savedActivity);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* SHARED ITINERARY: EDIT ACTIVITY */
router.put("/:tripId/itinerary/day/:dayIndex/activity/:activityId", protect, async (req, res) => {
  try {
    const { tripId, dayIndex, activityId } = req.params;
    const updates = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const day = trip.itinerary[dayIndex];
    if (!day) return res.status(404).json({ error: "Day not found" });

    const activity = day.activities.id(activityId);
    if (!activity) return res.status(404).json({ error: "Activity not found" });

    Object.assign(activity, updates);
    await trip.save();

    const io = req.app.get("io");
    if (io) io.to(tripId).emit("itinerary:updated", trip.itinerary);

    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* SHARED ITINERARY: DELETE ACTIVITY */
router.delete("/:tripId/itinerary/day/:dayIndex/activity/:activityId", protect, async (req, res) => {
  try {
    const { tripId, dayIndex, activityId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const day = trip.itinerary[dayIndex];
    if (!day) return res.status(404).json({ error: "Day not found" });

    day.activities.pull(activityId);
    await trip.save();

    const io = req.app.get("io");
    if (io) {
      io.to(tripId).emit("itinerary:activityDeleted", { dayIndex, activityId });
      io.to(tripId).emit("itinerary:updated", trip.itinerary);
    }

    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

/* SHARED ITINERARY: REORDER ACTIVITIES */
router.put("/:tripId/itinerary/day/:dayIndex/reorder", protect, async (req, res) => {
  try {
    const { tripId, dayIndex } = req.params;
    const { activities } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    if (!trip.itinerary[dayIndex]) return res.status(404).json({ error: "Day not found" });

    trip.itinerary[dayIndex].activities = activities;
    await trip.save();

    const io = req.app.get("io");
    if (io) {
      io.to(tripId).emit("itinerary:activityMoved", { dayIndex, activities });
      io.to(tripId).emit("itinerary:updated", trip.itinerary);
    }

    res.json(trip.itinerary[dayIndex].activities);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;