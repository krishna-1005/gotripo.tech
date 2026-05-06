const SystemConfig = require("../models/SystemConfig");
const { admin } = require("../firebaseAdmin");

const ADMIN_EMAILS = ["gotripo@gmail.com", "krishkulkarni1005@gmail.com"];

const maintenanceMode = async (req, res, next) => {
  try {
    // 1. Skip check for admin routes (to allow disabling maintenance mode)
    // 2. Skip check for public config (to allow the frontend to know about maintenance)
    // 3. Skip check for health check and ping routes
    const skippedPaths = [
      "/api/admin",
      "/api/auth",
      "/api/public/config",
      "/api/admin/config/public",
      "/ping",
      "/"
    ];

    const isSkippedPath = skippedPaths.some(path => req.path.startsWith(path));

    if (isSkippedPath) {
      return next();
    }

    // 4. Check if the request is from an admin (Admin bypass)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        if (decoded.email && ADMIN_EMAILS.includes(decoded.email.toLowerCase())) {
          return next(); // Admin detected, skip maintenance check
        }
      } catch (authErr) {
        // Token might be invalid or expired, proceed to normal maintenance check
      }
    }

    // Check database for maintenance_mode flag
    const config = await SystemConfig.findOne({ key: "maintenance_mode" });
    
    // Check if maintenance mode is active (handles both boolean and string "true")
    const isMaintenanceActive = config && (config.value === true || config.value === "true");
    
    if (isMaintenanceActive) {
      // Return 503 Service Unavailable
      return res.status(503).json({
        maintenance: true,
        message: "Site is currently under maintenance. Please try again later."
      });
    }

    next();
  } catch (err) {
    console.error("Maintenance middleware error:", err);
    next(); // Continue if there's an error checking maintenance (fail-open)
  }
};

module.exports = maintenanceMode;
