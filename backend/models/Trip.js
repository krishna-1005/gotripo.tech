const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema({
  name: String,
  lat: Number,
  lng: Number,
  estimatedCost: Number,
  estimatedHours: Number,
  category: String,
  type: String,
  rating: Number,
  reviews: String,
  tag: String,
  bestTime: String,
  timeReason: String,
  city: String,
  area: String,
  locality: String,
  whyRecommended: [String],
  userReviews: [{
    author: String,
    rating: Number,
    comment: String
  }]
});

const daySchema = new mongoose.Schema({
  day: mongoose.Schema.Types.Mixed,
  date: String,
  label: String,
  title: String,
  city: String,
  theme: {
    type: String,
    default: 'explore'
  },
  activities: [{
    id: String,
    time: String,
    title: String,
    location: String,
    notes: String,
    addedBy: {
      userId: String,
      name: String
    },
    type: {
      type: String,
      default: 'activity'
    },
    order: Number
  }],
  estimatedHours: Number,
  estimatedCost: Number,
  places: [placeSchema]
});

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: "Custom Trip"
  },
  destination: {
    type: String,
    required: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  budget: {
    type: Number,
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["organizer", "member"], default: "member" },
    rsvp: { type: String, enum: ["confirmed", "awaiting"], default: "awaiting" },
    joinedAt: { type: Date, default: Date.now }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  days: {
    type: Number
  },
  itinerary: [daySchema],
  totalTripCost: {
    type: Number,
    default: 0
  },
  totalBudget: Number,
  budgetTier: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  remainingBudget: Number,
  perDayBudget: Number,
  summary: String,
  travelerType: String,
  pace: String,
  recommendedStay: {
    name: String,
    avgCost: Number,
    rating: Number,
    tags: [String],
    lat: Number,
    lng: Number,
    stayType: String
  },
  recommendedTransport: {
    mode: String,
    reason: String,
    icon: String,
    distance: Number,
    from: String,
    to: String
  },
  status: {
    type: String,
    enum: ["upcoming", "ongoing", "completed"],
    default: "upcoming"
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  views: {
    type: Number,
    default: 0
  },
  savesCount: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    default: ""
  },
  type: {
    type: String,
    enum: ["plan", "room"],
    default: "plan"
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredReason: {
    type: String,
    default: ""
  },
  checklist: [{
    text: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    assignedTo: {
      userId: String,
      userName: String
    },
    createdAt: { type: Date, default: Date.now }
  }],
  suggestions: [{
    title: { type: String, required: true },
    description: String,
    tags: [String],
    addedBy: {
      userId: String,
      userName: String,
      initials: String,
      color: String
    },
    upvotes: [String], // Array of userIds
    downvotes: [String], // Array of userIds
    createdAt: { type: Date, default: Date.now }
  }],
  messages: [{
    userId: String,
    userName: String,
    initials: String,
    text: { type: String, required: true },
    color: String,
    timestamp: { type: Date, default: Date.now }
  }],
  disruptionAlerts: [{
    type: { type: String },
    message: String,
    severity: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    timestamp: { type: Date, default: Date.now }
  }],
  pendingRevision: {
    itinerary: [daySchema],
    impactSummary: String,
    recalculationReason: String,
    createdAt: Date
  },
  queuedSupplierNotifications: [{
    supplierName: String,
    supplierType: { type: String, enum: ["hotel", "restaurant", "transport"] },
    actionType: String,
    status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    messageDraft: String,
    sentAt: Date
  }],
  expenses: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paidBy: {
      userId: { type: String, required: true },
      name: { type: String, required: true }
    },
    splitBetween: [{
      userId: { type: String, required: true },
      name: { type: String, required: true },
      share: { type: Number, required: true }
    }],
    category: {
      type: String,
      enum: ["food", "transport", "stay", "activity", "other"],
      required: true
    },
    createdAt: { type: Date, default: Date.now }
  }],
  destinations: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    country: { type: String, required: true },
    description: String,
    imageUrl: String,
    suggestedBy: {
      userId: { type: String, required: true },
      name: { type: String, required: true }
    },
    upvotes: [String], // userIds
    downvotes: [String], // userIds
    tags: [String],
    aiScore: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['suggested', 'leading', 'locked'],
      default: 'suggested'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  availabilityPoll: {
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: 'open'
    },
    dateOptions: [{
      id: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      duration: Number,
      votes: [{
        userId: String, // Can be null for guest votes
        name: String,
        available: {
          type: String,
          enum: ['yes', 'maybe', 'no'],
          default: 'maybe'
        }
      }]
    }],
    finalDates: {
      startDate: Date,
      endDate: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    createdAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);