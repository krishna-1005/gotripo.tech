const path = require("path");
const fs = require("fs");
const dns = require("dns");

// Set DNS servers to Google's to help resolve MongoDB SRV records if local DNS fails
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath, override: true });
}
const express  = require("express");
const cors     = require("cors");
const helmet   = require("helmet");
const mongoose = require("mongoose");

const tripRoutes    = require("./routes/tripRoutes");
const itineraryRoutes = require("./routes/itinerary");
const expenseRoutes = require("./routes/expenses");
const pollRoutesv2 = require("./routes/polls");
const messageRoutes = require("./routes/messages");
const planRoutes    = require("./routes/planRoutes");
const chatRoutes    = require("./routes/chatRoutes");
const authRoutes    = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const nearbyPlaces = require("./routes/nearbyPlaces");
const placeRoutes = require("./routes/placeRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const projectReviewRoutes = require("./routes/projectReviewRoutes");
const pollRoutes = require("./routes/pollRoutes");
const publicRoutes = require("./routes/publicRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const groupChatRoutes = require("./routes/groupChatRoutes");
const budgetRoutes = require("./routes/budget");
const destinationRoutes = require("./routes/destinations");
const aiRoutes = require("./routes/aiRoutes");
const yatraRoutes = require("./routes/yatraRoutes");
const yatraKitRoutes = require("./routes/yatraKit");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const availabilityRoutes = require("./routes/availabilityRoutes");

const app = express();
const maintenanceMode = require("./middleware/maintenance");
const { globalLimiter } = require("./middleware/rateLimiter");

/* ── 1. GLOBAL MIDDLEWARE ── */

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "https://www.clarity.ms", "https://c.bing.com", "https://www.googletagmanager.com"],
      "connect-src": ["'self'", "https://*.clarity.ms", "https://c.bing.com", "https://www.google-analytics.com", "https://www.googletagmanager.com"],
      "img-src": ["'self'", "data:", "https://www.clarity.ms", "https://c.bing.com", "https://www.google-analytics.com"],
    },
  },
}));

// CORS - Must be before routes to handle preflight
app.use(
  cors({
    origin: true, 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

// Body Parser
app.use(express.json({ limit: "100kb" }));

// Diagnostic Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  res.setHeader("X-GoTripo-Server", "active-v2");
  next();
});

// Input Sanitization
app.use((req, res, next) => {
  if (req.body) {
    const sanitize = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === "string") {
          if (key.toLowerCase().includes("password")) continue;
          obj[key] = obj[key].trim();
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }
  next();
});

// Operational Middleware
app.use(maintenanceMode);
app.use(globalLimiter);

/* ── 2. SPECIAL ROUTES ── */

// health check
app.get("/", (req, res) => {
  res.json({ status: "GoTripo API running 🚀" });
});

app.get("/api/ping", (req, res) => {
  res.status(200).json({ message: "GoTripo API alive 🚀" });
});

// Direct Public Itineraries Route
app.get("/api/public/itineraries", async (req, res) => {
  try {
    const Itinerary = require("./models/Itinerary");
    const itineraries = await Itinerary.find({ isPublic: true })
      .populate("tripId")
      .populate("days.events.ownerId", "name photo")
      .sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/ping", (req, res) => {
  res.status(200).send("GoTripo server alive 🚀");
});

/* ── 3. API ROUTES ── */

app.use("/api/plan", planRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/nearby", nearbyPlaces);
app.use("/api/places", placeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

app.use("/api/ai", aiRoutes);
app.use("/api/yatra", yatraRoutes);
app.use("/api/yatra-kit", yatraKitRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// Specific trip sub-routes first (handled via tripRoutes)
app.use("/api/trips", tripRoutes);
app.use("/api/trips", availabilityRoutes);

app.use("/api/itineraries", itineraryRoutes);

app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", projectReviewRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/group-chat", groupChatRoutes);

/* ── 4. ERROR HANDLING ── */

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} ${req.method} ${req.url}:`, err);
  
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(status).json({
    error: status === 500 ? "Internal Server Error" : "Error",
    message: status === 500 ? "An unexpected error occurred on the server." : message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

// 404 Handler
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: "Not Found", 
    message: `Route [${req.method} ${req.url}] not found.`,
    server: "GoTripo-Backend"
  });
});

/* ── DB CONNECTION ── */
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("MongoDB error:", err));

module.exports = app;
