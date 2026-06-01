const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = require("./app");
const http = require("http");
const { Server } = require("socket.io");
const collabHandlers = require("./socket/collabHandlers");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

// Initialize socket handlers
collabHandlers(io);

// Explicitly check for email credentials on startup
const { sendWelcomeEmail } = require("./services/emailService");
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log(`📧 Email configuration detected for: ${process.env.EMAIL_USER}`);
} else {
  console.error("❌ EMAIL_USER or EMAIL_PASS missing in .env file. Emails will NOT be sent.");
}

// Explicitly check for AI API keys on startup
if (process.env.GROQ_API_KEY) {
  console.log("🤖 Groq AI configuration detected.");
} else if (process.env.OPENAI_API_KEY) {
  console.log("🤖 OpenAI configuration detected.");
} else {
  console.warn("⚠️ No AI API keys detected (GROQ_API_KEY or OPENAI_API_KEY). AI features will use fallbacks.");
}

// Explicitly check for MongoDB URI
if (process.env.MONGO_URI) {
  console.log("💾 MongoDB URI detected.");
} else {
  console.error("❌ MONGO_URI missing in .env file. Database connection will fail.");
}

// Bind to 0.0.0.0 to ensure the service is reachable on Render/Cloud environments
server.listen(PORT, "0.0.0.0", () => {
  // Nodemon watch trigger
  console.log(`🚀 GoTripo backend running on port ${PORT}`);
});