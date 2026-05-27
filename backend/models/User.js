const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

console.log("User model loaded v2");

const userSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: false,
    select: false
  },

  /* IMPORTANT FIX */
  firebaseUid: {
    type: String,
    required: false,
    default: null
  },

  photo: {
    type: String,
    default: ""
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },

  userType: {
    type: String,
    enum: ["guest", "user"],
    default: "user"
  },

  subscriptionTier: {
    type: String,
    enum: ["free", "pro", "elite"],
    default: "free"
  },

  /* NOTIFICATION SETTINGS */
  preferences: {
    emailAlerts: { type: Boolean, default: true },
    tripReminders: { type: Boolean, default: true },
    promoOffers: { type: Boolean, default: false },
    
    /* PERSONALIZATION */
    interests: { type: [String], default: [] },
    avoidedCategories: { type: [String], default: [] },
    preferredBudget: { type: String, default: "medium" }, // low, medium, high
    dietary: { type: String, enum: ["veg", "non-veg", "any"], default: "any" },
    likedPlaces: { type: [String], default: [] },
    dislikedPlaces: { type: [String], default: [] },
    
    /* SCORING WEIGHTS */
    categoryWeights: {
      type: Map,
      of: Number,
      default: {}
    },

    /* SMART PREFERENCES */
    travelStyleTags: { type: [String], default: [] },
    pastVotes: [{
      pollId: String,
      city: String,
      votedAt: { type: Date, default: Date.now }
    }]
  },

  savedPlaces: {
    type: [Object],
    default: []
  },

  /* ACHIEVEMENTS */
  badges: [{
    name: { type: String, required: true },
    icon: { type: String, default: "🏅" },
    description: { type: String },
    earnedAt: { type: Date, default: Date.now }
  }]

},
{ timestamps: true }
);

/* Hash password */
userSchema.pre("save", async function(){

  if(!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

});

/* Compare password */
userSchema.methods.comparePassword = async function(password){
  if (!this.password) return false; // Account might be Google/Firebase only
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);