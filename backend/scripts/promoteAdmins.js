const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const User = require("../models/User");
const { admin, initialized } = require("../firebaseAdmin");

async function promoteToAdmin(emails) {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    for (const email of emails) {
      let user = await User.findOne({ email });
      const defaultPassword = "AdminPassword123";
      
      if (!user) {
        console.log(`User with email ${email} not found. Creating new admin account...`);
        user = new User({
          name: email.split('@')[0],
          email: email,
          password: defaultPassword,
          role: "admin",
          userType: "user"
        });
        await user.save();
        console.log(`Created new admin in MongoDB: ${email}`);
      } else {
        console.log(`User found in MongoDB: ${email}. Current role: ${user.role}`);
        if (user.role !== "admin") {
          user.role = "admin";
          await user.save();
          console.log(`Updated user ${email} to admin in MongoDB.`);
        } else {
          console.log(`User ${email} is already an admin in MongoDB.`);
        }
      }

      // Sync with Firebase
      if (initialized) {
        try {
          const fbUser = await admin.auth().getUserByEmail(email);
          await admin.auth().updateUser(fbUser.uid, {
            password: defaultPassword,
            displayName: user.name
          });
          console.log(`✅ Firebase credentials synced for ${email}`);
        } catch (fbErr) {
          if (fbErr.code === 'auth/user-not-found') {
            await admin.auth().createUser({
              email: email,
              password: defaultPassword,
              displayName: user.name
            });
            console.log(`✅ Created new Firebase user for ${email}`);
          } else {
            console.error(`Firebase sync error for ${email}:`, fbErr.message);
          }
        }
      } else {
        console.warn("⚠️ Firebase Admin not initialized. Skipping Firebase sync.");
      }
    }

    await mongoose.disconnect();
    console.log("Done.");
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

// Get emails from command line arguments or use defaults if provided by user later
const emailsToPromote = process.argv.slice(2);

if (emailsToPromote.length === 0) {
  console.log("Please provide email addresses as arguments.");
  console.log("Usage: node promoteAdmins.js email1@example.com email2@example.com");
  process.exit(1);
}

promoteToAdmin(emailsToPromote);
