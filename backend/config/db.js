const mongoose = require("mongoose");

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "Missing MONGO_URI environment variable. Add it to backend/.env before starting the server."
      );
    }

    connectionPromise = mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: "majority",
      family: 4,
    });

    await connectionPromise;
    
    console.log("✓ MongoDB Connected Successfully");
    
    // Handle connection events
    mongoose.connection.on("disconnected", () => {
      console.warn("⚠ MongoDB disconnected. Attempting to reconnect...");
    });
    
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
    });
    
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("Make sure:");
    console.error("  1. MongoDB Atlas cluster is running");
    console.error("  2. IP address is whitelisted in MongoDB Atlas");
    console.error("  3. MONGO_URI credentials are correct");
    connectionPromise = null;

    if (process.env.VERCEL === "1") {
      throw err;
    }

    process.exit(1);
  }
};

module.exports = connectDB;