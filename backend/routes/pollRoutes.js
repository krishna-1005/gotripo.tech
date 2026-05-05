const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Poll = require("../models/Poll");
const User = require("../models/User");
const { v4: uuidv4 } = require("uuid");
const { protect } = require("../middleware/protect");

// Create a new poll (Authenticated only)
router.post("/create", protect, async (req, res) => {
  console.log("DEBUG: Entered /api/polls/create");
  console.time(`Poll Creation: ${req.body.tripName}`);
  try {
    const { tripName, options, groupSize, totalMembers, tripId } = req.body;
    console.log("DEBUG: Request body:", { tripName, groupSize, totalMembers, tripId });

    if (!tripName || !options || options.length < 2) {
      return res.status(400).json({ error: "Trip name and at least 2 options are required." });
    }

    const pollId = uuidv4().substring(0, 8);
    console.log("DEBUG: Creating poll with ID:", pollId);

    const newPoll = new Poll({
      pollId,
      tripId: tripId || undefined,
      tripName,
      question: tripName,
      groupSize: groupSize === "" ? undefined : groupSize,
      totalMembers: parseInt(totalMembers) || 1,
      options: options.map(opt => {
        const optName = typeof opt === 'string' ? opt : opt.name;
        return { 
          name: optName,
          text: optName,
          city: typeof opt === 'string' ? opt : opt.city,
          tags: opt.tags || [],
          vibe: opt.vibe || "",
          votes: 0 
        };
      }),
      createdBy: req.user._id
    });

    console.log("DEBUG: Attempting to save poll...");
    const savedPoll = await newPoll.save();
    console.log("DEBUG: Poll saved successfully:", savedPoll.pollId);
    res.status(201).json({ pollId: savedPoll.pollId });
  } catch (error) {
    console.error("POLL CREATION ERROR DETECTED:", error);
    res.status(500).json({ error: error.message || "Server error creating poll." });
  } finally {
    console.timeEnd(`Poll Creation: ${req.body.tripName}`);
  }
});

// Get all polls or filter by tripId (Public)
router.get("/list", async (req, res) => {
  try {
    const query = {};
    if (req.query.tripId) {
      query.tripId = req.query.tripId;
    } else {
      // If no tripId, only return "global" polls or polls with no tripId
      // For room isolation, we might want to return nothing if tripId is null/undefined
      query.tripId = { $exists: false }; 
    }
    const polls = await Poll.find(query).sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error fetching polls." });
  }
});

// Get poll details (Public)
router.get("/:pollId", async (req, res) => {
  try {
    const poll = await Poll.findOne({ pollId: req.params.pollId });
    if (!poll) return res.status(404).json({ error: "Poll not found." });
    res.json(poll);
  } catch (error) {
    res.status(500).json({ error: error.message || "Server error fetching poll." });
  }
});

// Submit a vote (Public/Semi-protected internal check)
router.post("/vote", async (req, res) => {
  try {
    const { pollId, optionName, userId, userName } = req.body;
    const poll = await Poll.findOne({ pollId });
    if (!poll) return res.status(404).json({ error: "Poll not found." });

    if (poll.isClosed) {
      return res.status(400).json({ error: "This poll is already closed." });
    }

    const option = poll.options.find(opt => opt.name === optionName);
    if (!option) return res.status(400).json({ error: "Option not found." });

    // Track voter participation
    const alreadyVoted = poll.voters.some(v => v.userId === userId && userId !== undefined);
    if (alreadyVoted && userId) {
      return res.status(400).json({ error: "You have already voted in this poll." });
    }

    option.votes += 1;
    
    // Add to voters list
    poll.voters.push({
      userId: userId || `anon-${Date.now()}`,
      name: userName || "Someone",
      votedAt: new Date()
    });

    // CAPTURE USER PREFERENCES
    if (userId) {
      let user = null;
      if (mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId);
      }
      if (!user) {
        user = await User.findOne({ firebaseUid: userId });
      }

      if (user) {
        // Store past vote
        user.preferences.pastVotes.push({
          pollId: poll.pollId,
          city: option.city || option.name,
          votedAt: new Date()
        });

        // Store tags associated with the city
        if (option.tags && option.tags.length > 0) {
          option.tags.forEach(tag => {
            if (!user.preferences.travelStyleTags.includes(tag)) {
              user.preferences.travelStyleTags.push(tag);
            }
            
            // Also optionally update general interests if tag matches a category
            const category = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
            if (!user.preferences.interests.includes(category)) {
              user.preferences.interests.push(category);
            }
          });
        }
        await user.save();
      }
    }

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    const maxVotes = Math.max(...poll.options.map(o => o.votes));
    const topOptions = poll.options.filter(o => o.votes === maxVotes);

    let shouldClose = false;
    let winner = null;

    // RULE 1: Finalize if a majority is reached (e.g., 2/3, 3/5, 6/10)
    // A majority means it's mathematically impossible for any other option to win.
    const majorityThreshold = Math.floor(poll.totalMembers / 2) + 1;

    // RULE 2: Finalize if everyone has voted
    const everyoneVoted = totalVotes >= poll.totalMembers;

    if (maxVotes >= majorityThreshold && topOptions.length === 1) {
        shouldClose = true;
        winner = topOptions[0].name;
    } else if (everyoneVoted) {
        shouldClose = true;
        // In case of a tie after everyone voted, we pick the first top option
        winner = topOptions[0].name;
    }

    if (shouldClose) {
      poll.isClosed = true;
      poll.winner = winner;
    }

    await poll.save();

    res.json({ message: "Vote recorded successfully", poll });
  } catch (error) {
    console.error("Voting Error:", error);
    res.status(500).json({ error: error.message || "Server error recording vote." });
  }
});

// Manual override to finalize poll (Authenticated only)
router.post("/finalize-now", protect, async (req, res) => {
  try {
    const { pollId } = req.body;
    const poll = await Poll.findOne({ pollId });
    if (!poll) return res.status(404).json({ error: "Poll not found." });

    if (poll.isClosed) {
      return res.status(400).json({ error: "Poll is already finalized." });
    }

    // Only creator or admin can finalize manually
    const isAdmin = req.user.role === "admin";
    const isCreator = poll.createdBy === (req.user.firebaseUid || req.user._id.toString());
    
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ error: "Not authorized to finalize this poll." });
    }

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    
    // Require at least 2 votes to finalize manually (unless totalMembers is 1)
    if (totalVotes < 2 && poll.totalMembers > 1) {
      return res.status(400).json({ error: "At least 2 votes are required to finalize manually for group trips." });
    } else if (totalVotes < 1) {
      return res.status(400).json({ error: "At least 1 vote is required to finalize." });
    }

    const maxVotes = Math.max(...poll.options.map(o => o.votes));
    const topOptions = poll.options.filter(o => o.votes === maxVotes);

    // Pick the highest voted option. In case of tie, pick the first one.
    poll.isClosed = true;
    poll.winner = topOptions[0].name;

    await poll.save();
    res.json({ message: "Poll finalized manually", poll });
  } catch (error) {
    console.error("Finalize Error:", error);
    res.status(500).json({ error: error.message || "Server error finalizing poll." });
  }
});

module.exports = router;
